import { databasePool } from '../config/database.js'

const TOKEN_CREATION_STATUSES = Object.freeze({
  CREATED: 'created',
  COOLDOWN: 'cooldown',
  NOT_ELIGIBLE: 'not_eligible',
})

async function createPasswordResetToken({
  email,
  tokenHash,
  expiresAt,
  createdAt,
  cooldownCutoff,
}) {
  const connection = await databasePool.getConnection()

  try {
    await connection.beginTransaction()
    const [users] = await connection.execute(
      `SELECT id, email, role, is_active
       FROM users
       WHERE email = ?
       LIMIT 1
       FOR UPDATE`,
      [email],
    )
    const user = users[0]

    if (!user || !user.is_active) {
      await connection.commit()
      return { status: TOKEN_CREATION_STATUSES.NOT_ELIGIBLE }
    }

    const [recentTokens] = await connection.execute(
      `SELECT id
       FROM password_reset_tokens
       WHERE user_id = ? AND created_at > ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id, cooldownCutoff],
    )

    if (recentTokens.length) {
      await connection.commit()
      return { status: TOKEN_CREATION_STATUSES.COOLDOWN }
    }

    await connection.execute(
      `UPDATE password_reset_tokens
       SET used_at = ?
       WHERE user_id = ? AND used_at IS NULL`,
      [createdAt, user.id],
    )
    await connection.execute(
      `INSERT INTO password_reset_tokens
        (user_id, token_hash, expires_at, created_at)
       VALUES (?, ?, ?, ?)`,
      [user.id, tokenHash, expiresAt, createdAt],
    )
    await connection.commit()

    return {
      status: TOKEN_CREATION_STATUSES.CREATED,
      account: {
        email: user.email,
        role: user.role,
      },
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

async function invalidatePasswordResetToken(tokenHash, usedAt = new Date()) {
  await databasePool.execute(
    `UPDATE password_reset_tokens
     SET used_at = ?
     WHERE token_hash = ? AND used_at IS NULL`,
    [usedAt, tokenHash],
  )
}

async function resetPasswordWithToken({ tokenHash, passwordHash, now }) {
  const [tokenOwners] = await databasePool.execute(
    `SELECT user_id
     FROM password_reset_tokens
     WHERE token_hash = ?
     LIMIT 1`,
    [tokenHash],
  )
  const userId = tokenOwners[0]?.user_id

  if (!userId) {
    return null
  }

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

    const [tokens] = await connection.execute(
      `SELECT id
       FROM password_reset_tokens
       WHERE token_hash = ?
         AND user_id = ?
         AND used_at IS NULL
         AND expires_at > ?
       LIMIT 1
       FOR UPDATE`,
      [tokenHash, userId, now],
    )

    if (!tokens.length) {
      await connection.rollback()
      return null
    }

    await connection.execute(
      `UPDATE users
       SET password_hash = ?
       WHERE id = ?`,
      [passwordHash, userId],
    )
    await connection.execute(
      `UPDATE password_reset_tokens
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
  createPasswordResetToken,
  invalidatePasswordResetToken,
  resetPasswordWithToken,
})

export { TOKEN_CREATION_STATUSES }
export default passwordResetRepository
