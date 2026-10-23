import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { after, test } from 'node:test'

const runIntegration = process.env.RUN_DB_INTEGRATION === '1'

if (!runIntegration) {
  test('password reset integration requires RUN_DB_INTEGRATION=1', {
    skip: true,
  }, () => {})
} else {
  const { databasePool } = await import('../src/config/database.js')
  const { createStaffAccount } = await import('../src/services/adminService.js')
  const {
    authenticateStaff,
    authenticateStudent,
    registerStudent,
  } = await import('../src/services/authService.js')
  const passwordResetRepository = (
    await import('../src/services/passwordResetRepository.js')
  ).default
  const {
    createPasswordResetService,
    FORGOT_PASSWORD_PUBLIC_MESSAGE,
    hashResetOtp,
  } = await import('../src/services/passwordResetService.js')
  const createdUserIds = []

  after(async () => {
    if (createdUserIds.length) {
      const placeholders = createdUserIds.map(() => '?').join(', ')
      await databasePool.execute(
        `DELETE FROM users WHERE id IN (${placeholders})`,
        createdUserIds,
      )
    }
    await databasePool.end()
  })

  test('student and staff OTP resets are secure, single-use, and role-aware', async () => {
    const marker = `OTP-${Date.now()}-${randomBytes(2).toString('hex')}`
    const oldPassword = randomBytes(18).toString('base64url')
    const studentPassword = randomBytes(18).toString('base64url')
    const instructorPassword = randomBytes(18).toString('base64url')
    const adminPassword = randomBytes(18).toString('base64url')
    const student = await registerStudent({
      studentNumber: `${marker}-STUDENT`,
      firstName: 'Otp',
      lastName: 'Student',
      email: `${marker}-student@test.local`.toLowerCase(),
      password: oldPassword,
      classCode: '',
    })
    const instructor = await createStaffAccount({
      firstName: 'Otp',
      lastName: 'Instructor',
      email: `${marker}-instructor@test.local`.toLowerCase(),
      password: oldPassword,
      role: 'instructor',
    })
    const admin = await createStaffAccount({
      firstName: 'Otp',
      lastName: 'Admin',
      email: `${marker}-admin@test.local`.toLowerCase(),
      password: oldPassword,
      role: 'admin',
    })
    const inactive = await createStaffAccount({
      firstName: 'Otp',
      lastName: 'Inactive',
      email: `${marker}-inactive@test.local`.toLowerCase(),
      password: oldPassword,
      role: 'instructor',
    })
    createdUserIds.push(student.id, instructor.id, admin.id, inactive.id)
    await databasePool.execute(
      'UPDATE users SET is_active = 0 WHERE id = ?',
      [inactive.id],
    )

    const otpHashSecret = randomBytes(48).toString('hex')
    const sentMail = []
    const otpQueue = [
      '101010',
      '202020',
      '303030',
      '404040',
      '505050',
      '606060',
    ]
    const authorizationQueue = [
      's'.repeat(43),
      'i'.repeat(43),
      'a'.repeat(43),
      'b'.repeat(43),
      'c'.repeat(43),
      'd'.repeat(43),
      'e'.repeat(43),
    ]
    let currentTime = new Date('2026-10-23T08:00:00.000Z')
    const service = createPasswordResetService({
      configuration: {
        enabled: true,
        otpTtlMinutes: 10,
        maxAttempts: 3,
        cooldownSeconds: 60,
      },
      otpHashSecret,
      repository: passwordResetRepository,
      sendOtpEmail: async (message) => sentMail.push(message),
      otpFactory: () => otpQueue.shift(),
      resetAuthorizationFactory: () => authorizationQueue.shift(),
      clock: () => new Date(currentTime),
    })

    const unknownResult = await service.requestPasswordReset(
      `${marker}-unknown@test.local`.toLowerCase(),
    )
    const inactiveResult = await service.requestPasswordReset(inactive.email)
    assert.equal(unknownResult.message, FORGOT_PASSWORD_PUBLIC_MESSAGE)
    assert.equal(inactiveResult.message, FORGOT_PASSWORD_PUBLIC_MESSAGE)
    assert.equal(sentMail.length, 0)

    await service.requestPasswordReset(student.email)
    const firstStudentOtp = sentMail.at(-1).otp
    const [firstStudentRequests] = await databasePool.execute(
      `SELECT otp_hash, attempts_remaining, used_at
       FROM password_reset_otps
       WHERE user_id = ?
       ORDER BY id`,
      [student.id],
    )
    assert.equal(firstStudentRequests.length, 1)
    assert.equal(firstStudentRequests[0].attempts_remaining, 3)
    assert.equal(
      firstStudentRequests[0].otp_hash,
      hashResetOtp(student.email, firstStudentOtp, otpHashSecret),
    )
    assert.notEqual(firstStudentRequests[0].otp_hash, firstStudentOtp)

    for (const expectedRemaining of [2, 1, 0]) {
      await assert.rejects(
        service.verifyResetOtp({ email: student.email, otp: '999999' }),
        (error) => error.data?.attemptsRemaining === expectedRemaining,
      )
    }
    await assert.rejects(
      service.verifyResetOtp({ email: student.email, otp: firstStudentOtp }),
      (error) => error.code === 'INVALID_RESET_OTP',
    )

    currentTime = new Date(currentTime.getTime() + 61_000)
    await service.requestPasswordReset(student.email)
    const secondStudentOtp = sentMail.at(-1).otp
    const [studentRequests] = await databasePool.execute(
      `SELECT attempts_remaining, used_at
       FROM password_reset_otps
       WHERE user_id = ?
       ORDER BY id`,
      [student.id],
    )
    assert.ok(studentRequests[0].used_at)
    assert.equal(studentRequests[1].attempts_remaining, 3)
    assert.equal(studentRequests[1].used_at, null)

    const studentVerification = await service.verifyResetOtp({
      email: student.email,
      otp: secondStudentOtp,
    })
    const studentReset = await service.resetPassword({
      resetAuthorization: studentVerification.resetAuthorization,
      password: studentPassword,
    })
    assert.equal(studentReset.loginPortal, 'student')
    await assert.rejects(
      authenticateStudent({ identifier: student.email, password: oldPassword }),
      (error) => error.code === 'INVALID_CREDENTIALS',
    )
    assert.equal(
      (await authenticateStudent({
        identifier: student.email,
        password: studentPassword,
      })).id,
      student.id,
    )
    await assert.rejects(
      service.resetPassword({
        resetAuthorization: studentVerification.resetAuthorization,
        password: randomBytes(18).toString('base64url'),
      }),
      (error) => error.code === 'INVALID_RESET_AUTHORIZATION',
    )

    for (const [account, password] of [
      [instructor, instructorPassword],
      [admin, adminPassword],
    ]) {
      currentTime = new Date(currentTime.getTime() + 61_000)
      await service.requestPasswordReset(account.email)
      const otp = sentMail.at(-1).otp
      const verification = await service.verifyResetOtp({
        email: account.email,
        otp,
      })
      const result = await service.resetPassword({
        resetAuthorization: verification.resetAuthorization,
        password,
      })

      assert.equal(result.loginPortal, 'staff')
      await assert.rejects(
        authenticateStaff({ identifier: account.email, password: oldPassword }),
        (error) => error.code === 'INVALID_CREDENTIALS',
      )
      assert.equal(
        (await authenticateStaff({
          identifier: account.email,
          password,
        })).id,
        account.id,
      )
    }
  })
}
