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
    hashResetToken,
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

  test('student and staff password reset is hashed, single-use, and role-aware', async () => {
    const marker = `RESET-${Date.now()}-${randomBytes(2).toString('hex')}`
    const oldPassword = randomBytes(18).toString('base64url')
    const studentPassword = randomBytes(18).toString('base64url')
    const instructorPassword = randomBytes(18).toString('base64url')
    const adminPassword = randomBytes(18).toString('base64url')
    const student = await registerStudent({
      studentNumber: `${marker}-STUDENT`,
      firstName: 'Reset',
      lastName: 'Student',
      email: `${marker}-student@test.local`.toLowerCase(),
      password: oldPassword,
      classCode: '',
    })
    const instructor = await createStaffAccount({
      firstName: 'Reset',
      lastName: 'Instructor',
      email: `${marker}-instructor@test.local`.toLowerCase(),
      password: oldPassword,
      role: 'instructor',
    })
    const admin = await createStaffAccount({
      firstName: 'Reset',
      lastName: 'Admin',
      email: `${marker}-admin@test.local`.toLowerCase(),
      password: oldPassword,
      role: 'admin',
    })
    const inactive = await createStaffAccount({
      firstName: 'Reset',
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

    const sentMail = []
    const tokenQueue = [
      randomBytes(32).toString('base64url'),
      randomBytes(32).toString('base64url'),
      randomBytes(32).toString('base64url'),
      randomBytes(32).toString('base64url'),
    ]
    let currentTime = new Date()
    const service = createPasswordResetService({
      configuration: {
        enabled: true,
        ttlMinutes: 30,
        cooldownSeconds: 60,
      },
      clientOrigin: 'https://telesim3d.site',
      repository: passwordResetRepository,
      sendResetEmail: async (message) => sentMail.push(message),
      tokenFactory: () => tokenQueue.shift(),
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
    const firstStudentToken = new URL(sentMail.at(-1).resetUrl).searchParams.get(
      'token',
    )
    const [storedStudentTokens] = await databasePool.execute(
      `SELECT token_hash, used_at
       FROM password_reset_tokens
       WHERE user_id = ?`,
      [student.id],
    )
    assert.equal(storedStudentTokens.length, 1)
    assert.equal(
      storedStudentTokens[0].token_hash,
      hashResetToken(firstStudentToken),
    )
    assert.notEqual(storedStudentTokens[0].token_hash, firstStudentToken)

    currentTime = new Date(currentTime.getTime() + 61_000)
    await service.requestPasswordReset(student.email)
    const secondStudentToken = new URL(sentMail.at(-1).resetUrl).searchParams.get(
      'token',
    )
    await assert.rejects(
      service.resetPassword({
        token: firstStudentToken,
        password: studentPassword,
      }),
      (error) => error.code === 'INVALID_PASSWORD_RESET_TOKEN',
    )
    const studentReset = await service.resetPassword({
      token: secondStudentToken,
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
        token: secondStudentToken,
        password: randomBytes(18).toString('base64url'),
      }),
      (error) => error.code === 'INVALID_PASSWORD_RESET_TOKEN',
    )

    for (const [account, password] of [
      [instructor, instructorPassword],
      [admin, adminPassword],
    ]) {
      await service.requestPasswordReset(account.email)
      const token = new URL(sentMail.at(-1).resetUrl).searchParams.get('token')
      const result = await service.resetPassword({ token, password })

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
