import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { after, test } from 'node:test'
import bcrypt from 'bcryptjs'

const runIntegration = process.env.RUN_DB_INTEGRATION === '1'

if (!runIntegration) {
  test('admin management integration requires RUN_DB_INTEGRATION=1', {
    skip: true,
  }, () => {})
} else {
  const { databasePool } = await import('../src/config/database.js')
  const {
    authenticateStaff,
    authenticateStudent,
    registerStudent,
  } = await import('../src/services/authService.js')
  const {
    createStaffAccount,
    getAdminUsers,
    updateUserRole,
    updateUserStatus,
  } = await import('../src/services/adminService.js')
  const {
    completeAttempt,
    startAttempt,
  } = await import('../src/services/trainingService.js')
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

  test('admin updates preserve history and prevent self-lockout', async () => {
    const marker = `AM-${Date.now()}-${randomBytes(2).toString('hex')}`
    const passwordHash = await bcrypt.hash('integration-only-password', 4)
    const [adminResult] = await databasePool.execute(
      `INSERT INTO users
        (student_number, first_name, last_name, email, password_hash, role)
       VALUES (?, 'Admin', ?, ?, ?, 'admin')`,
      [
        `${marker}-A`,
        marker,
        `${marker}-admin@test.local`.toLowerCase(),
        passwordHash,
      ],
    )
    const adminId = Number(adminResult.insertId)
    createdUserIds.push(adminId)

    const student = await registerStudent({
      studentNumber: `${marker}-S`,
      firstName: 'Student',
      lastName: marker,
      email: `${marker}-student@test.local`.toLowerCase(),
      password: 'integration-test-password',
      role: 'admin',
    })
    createdUserIds.push(student.id)
    assert.equal(student.role, 'student')

    const staffPassword = 'integration-staff-password'
    const staff = await createStaffAccount({
      firstName: 'Instructor',
      lastName: marker,
      email: `${marker}-instructor@test.local`.toLowerCase(),
      password: staffPassword,
      role: 'instructor',
    })
    createdUserIds.push(staff.id)
    assert.equal(staff.studentNumber, null)
    assert.equal(staff.role, 'instructor')

    const authenticatedStaff = await authenticateStaff({
      identifier: staff.email,
      password: staffPassword,
    })
    assert.equal(authenticatedStaff.id, staff.id)
    await assert.rejects(
      authenticateStaff({
        identifier: student.email,
        password: 'integration-test-password',
      }),
      (error) => error.code === 'STAFF_ACCESS_REQUIRED',
    )
    await assert.rejects(
      authenticateStudent({
        identifier: staff.email,
        password: staffPassword,
      }),
      (error) => error.code === 'STUDENT_ACCESS_REQUIRED',
    )

    const [staffRows] = await databasePool.execute(
      'SELECT student_number, password_hash FROM users WHERE id = ?',
      [staff.id],
    )
    assert.equal(staffRows[0].student_number, null)
    assert.notEqual(staffRows[0].password_hash, staffPassword)
    assert.equal(await bcrypt.compare(staffPassword, staffRows[0].password_hash), true)

    const attempt = await startAttempt(student.id, 'rj45')
    await completeAttempt(student.id, attempt.attemptId, {
      moduleKey: 'rj45',
      score: 88,
      procedureAccuracy: 90,
      durationSeconds: 120,
      metrics: { cableTest: 'PASS', terminationStandard: 'T568B' },
    })

    const users = await getAdminUsers({
      search: marker,
      role: null,
      status: null,
      page: 1,
      limit: 20,
    })
    assert.equal(users.users.length, 3)

    const promoted = await updateUserRole(adminId, student.id, 'instructor')
    assert.equal(promoted.role, 'instructor')
    const deactivated = await updateUserStatus(adminId, student.id, false)
    assert.equal(deactivated.isActive, false)
    await updateUserStatus(adminId, staff.id, false)
    await assert.rejects(
      authenticateStaff({
        identifier: staff.email,
        password: staffPassword,
      }),
      (error) => error.code === 'ACCOUNT_INACTIVE',
    )

    const [attemptRows] = await databasePool.execute(
      'SELECT COUNT(*) AS total FROM training_attempts WHERE user_id = ?',
      [student.id],
    )
    assert.equal(Number(attemptRows[0].total), 1)

    await assert.rejects(
      updateUserRole(adminId, adminId, 'student'),
      (error) => error.code === 'SELF_ROLE_CHANGE_FORBIDDEN',
    )
    await assert.rejects(
      updateUserStatus(adminId, adminId, false),
      (error) => error.code === 'SELF_DEACTIVATION_FORBIDDEN',
    )
  })
}
