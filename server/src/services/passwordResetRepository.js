import { timingSafeEqual } from 'node:crypto'
import { databasePool } from '../config/database.js'

const OTP_CREATION_STATUSES = Object.freeze({
  CREATED: 'created',
  COOLDOWN: 'cooldown',
  NOT_ELIGIBLE: 'not_eligible',
})

const OTP_VERIFICATION_STATUSES = Object.freeze({
  VERIFIED: 'verified',
  INCORRECT: 'incorrect',
  ATTEMPTS_EXHAUSTED: 'attempts_exhausted',
  INVALID: 'invalid',
})

function hashesMatch(storedHash, candidateHash) {
  const stored = Buffer.from(storedHash, 'hex')
  const candidate = Buffer.from(candidateHash, 'hex')

  return stored.length === candidate.length && timingSafeEqual(stored, candidate)
}

async function createPasswordResetOtp({
  email,
  otpHash,
  expiresAt,
  createdAt,
  cooldownCutoff,
  maxAttempts,
}) {
  const connection = await databasePool.getConnection()

  try {
    await connection.beginTransaction()
    const [users] = await connection.execute(
      `SELECT id, email, is_active
       FROM users
       WHERE email = ?
       LIMIT 1
       FOR UPDATE`,
      [email],
    )
    const user = users[0]

    if (!user || !user.is_active) {
      await connection.commit()
      return { status: OTP_CREATION_STATUSES.NOT_ELIGIBLE }
    }

    const [recentRequests] = await connection.execute(
      `SELECT id
       FROM password_reset_otps
       WHERE user_id = ? AND created_at > ?
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [user.id, cooldownCutoff],
    )

    if (recentRequests.length) {
      await connection.commit()
      return { status: OTP_CREATION_STATUSES.COOLDOWN }
    }

    await connection.execute(
      `UPDATE password_reset_otps
       SET used_at = ?
       WHERE user_id = ? AND used_at IS NULL`,
      [createdAt, user.id],
    )
    const [result] = await connection.execute(
      `INSERT INTO password_reset_otps
        (user_id, otp_hash, attempts_remaining, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [user.id, otpHash, maxAttempts, expiresAt, createdAt],
    )
    await connection.commit()

    return {
      status: OTP_CREATION_STATUSES.CREATED,
      requestId: result.insertId,
      account: { email: user.email },
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

async function discardPasswordResetOtp(requestId) {
  await databasePool.execute(
    'DELETE FROM password_reset_otps WHERE id = ? AND verified_at IS NULL',
    [requestId],
  )
}

async function verifyPasswordResetOtp({
  email,
  otpHash,
  resetTokenHash,
  resetTokenExpiresAt,
  now,
}) {
  const connection = await databasePool.getConnection()

  try {
    await connection.beginTransaction()
    const [users] = await connection.execute(
      `SELECT id
       FROM users
       WHERE email = ? AND is_active = TRUE
       LIMIT 1
       FOR UPDATE`,
      [email],
    )
    const user = users[0]

    if (!user) {
      await connection.commit()
      return { status: OTP_VERIFICATION_STATUSES.INVALID }
    }

    const [requests] = await connection.execute(
      `SELECT id, otp_hash, attempts_remaining, expires_at, verified_at
       FROM password_reset_otps
       WHERE user_id = ? AND used_at IS NULL
       ORDER BY created_at DESC, id DESC
       LIMIT 1
       FOR UPDATE`,
      [user.id],
    )
    const resetRequest = requests[0]

    if (!resetRequest || resetRequest.verified_at) {
      await connection.commit()
      return { status: OTP_VERIFICATION_STATUSES.INVALID }
    }

    if (new Date(resetRequest.expires_at) <= now) {
      await connection.execute(
        'UPDATE password_reset_otps SET used_at = ? WHERE id = ?',
        [now, resetRequest.id],
      )
      await connection.commit()
      return { status: OTP_VERIFICATION_STATUSES.INVALID }
    }

    if (resetRequest.attempts_remaining <= 0) {
      await connection.execute(
        'UPDATE password_reset_otps SET used_at = ? WHERE id = ?',
        [now, resetRequest.id],
      )
      await connection.commit()
      return { status: OTP_VERIFICATION_STATUSES.ATTEMPTS_EXHAUSTED }
    }

    if (!hashesMatch(resetRequest.otp_hash, otpHash)) {
      const attemptsRemaining = Math.max(
        0,
        resetRequest.attempts_remaining - 1,
      )

      await connection.execute(
        `UPDATE password_reset_otps
         SET attempts_remaining = ?, used_at = ?
         WHERE id = ?`,
        [
          attemptsRemaining,
          attemptsRemaining === 0 ? now : null,
          resetRequest.id,
        ],
      )
      await connection.commit()

      return {
        status: attemptsRemaining === 0
          ? OTP_VERIFICATION_STATUSES.ATTEMPTS_EXHAUSTED
          : OTP_VERIFICATION_STATUSES.INCORRECT,
        attemptsRemaining,
      }
    }

    await connection.execute(
      `UPDATE password_reset_otps
       SET verified_at = ?, reset_token_hash = ?, reset_token_expires_at = ?
       WHERE id = ?`,
      [now, resetTokenHash, resetTokenExpiresAt, resetRequest.id],
    )
    await connection.commit()

    return { status: OTP_VERIFICATION_STATUSES.VERIFIED }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

async function resetPasswordWithAuthorization({
  resetTokenHash,
  passwordHash,
  now,
}) {
  const [requestOwners] = await databasePool.execute(
    `SELECT user_id
     FROM password_reset_otps
     WHERE reset_token_hash = ?
     LIMIT 1`,
    [resetTokenHash],
  )
  const userId = requestOwners[0]?.user_id

  if (!userId) return null

  const connection = await databasePool.getConnection()

  try {
    await connection.beginTransaction()
    const [users] = await connection.execute(
      `SELECT id, role, is_active
       FROM users
       WHERE id = ?
       LIMIT 1
       FOR UPDATE`,
      [userId],
    )
    const user = users[0]

    if (!user || !user.is_active) {
      await connection.rollback()
      return null
    }

    const [requests] = await connection.execute(
      `SELECT id
       FROM password_reset_otps
       WHERE reset_token_hash = ?
         AND user_id = ?
         AND verified_at IS NOT NULL
         AND used_at IS NULL
         AND reset_token_expires_at > ?
       LIMIT 1
       FOR UPDATE`,
      [resetTokenHash, userId, now],
    )

    if (!requests.length) {
      await connection.rollback()
      return null
    }

    await connection.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, userId],
    )
    await connection.execute(
      `UPDATE password_reset_otps
       SET used_at = ?
       WHERE user_id = ? AND used_at IS NULL`,
      [now, userId],
    )
    await connection.commit()

    return { role: user.role }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

const passwordResetRepository = Object.freeze({
  createPasswordResetOtp,
  discardPasswordResetOtp,
  resetPasswordWithAuthorization,
  verifyPasswordResetOtp,
})

export { OTP_CREATION_STATUSES, OTP_VERIFICATION_STATUSES }
export default passwordResetRepository
