import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { after, test } from 'node:test'

const runIntegration = process.env.RUN_DB_INTEGRATION === '1'
const testPassword = randomBytes(24).toString('base64url')

if (!runIntegration) {
  test('class management integration requires RUN_DB_INTEGRATION=1', {
    skip: true,
  }, () => {})
} else {
  const { databasePool } = await import('../src/config/database.js')
  const { createStaffAccount } = await import('../src/services/adminService.js')
  const { registerStudent } = await import('../src/services/authService.js')
  const {
    createClass,
    getClassStudents,
    joinClass,
    updateClass,
  } = await import('../src/services/classService.js')
  const {
    getInstructorModuleAnalytics,
    getInstructorOverview,
    getInstructorResults,
    getInstructorStudentDetail,
    getInstructorStudents,
    getInstructorTroubleshootingAnalytics,
  } = await import('../src/services/instructorService.js')
  const {
    completeAttempt,
    saveNetworkScenario,
    startAttempt,
  } = await import('../src/services/trainingService.js')
  const createdClassIds = []
  const createdUserIds = []

  after(async () => {
    if (createdClassIds.length) {
      const placeholders = createdClassIds.map(() => '?').join(', ')
      await databasePool.execute(
        `DELETE FROM classes WHERE id IN (${placeholders})`,
        createdClassIds,
      )
    }
    if (createdUserIds.length) {
      const placeholders = createdUserIds.map(() => '?').join(', ')
      await databasePool.execute(
        `DELETE FROM users WHERE id IN (${placeholders})`,
        createdUserIds,
      )
    }
    await databasePool.end()
  })

  const listFilters = {
    search: '',
    status: null,
    moduleKey: null,
    page: 1,
    limit: 20,
  }

  test('classes isolate instructor students and enrollment remains idempotent', async () => {
    const marker = `CLS-${Date.now()}-${randomBytes(2).toString('hex')}`
    const instructorA = await createStaffAccount({
      firstName: 'Instructor',
      lastName: `${marker}-A`,
      email: `${marker}-instructor-a@test.local`.toLowerCase(),
      password: testPassword,
      role: 'instructor',
    })
    const instructorB = await createStaffAccount({
      firstName: 'Instructor',
      lastName: `${marker}-B`,
      email: `${marker}-instructor-b@test.local`.toLowerCase(),
      password: testPassword,
      role: 'instructor',
    })
    const admin = await createStaffAccount({
      firstName: 'Admin',
      lastName: marker,
      email: `${marker}-admin@test.local`.toLowerCase(),
      password: testPassword,
      role: 'admin',
    })
    createdUserIds.push(instructorA.id, instructorB.id, admin.id)

    const classA = await createClass(instructorA, { name: 'BSIT 4A - Networking' })
    const classA2 = await createClass(instructorA, { name: 'BSIT 4A - Fiber' })
    const classB = await createClass(instructorB, { name: 'BSIT 4B - Networking' })
    createdClassIds.push(classA.id, classA2.id, classB.id)

    const studentA = await registerStudent({
      studentNumber: `${marker}-SA`,
      firstName: 'Student',
      lastName: `${marker}-A`,
      email: `${marker}-student-a@test.local`.toLowerCase(),
      password: testPassword,
      classCode: classA.classCode,
    })
    const studentB = await registerStudent({
      studentNumber: `${marker}-SB`,
      firstName: 'Student',
      lastName: `${marker}-B`,
      email: `${marker}-student-b@test.local`.toLowerCase(),
      password: testPassword,
      classCode: classB.classCode,
    })
    createdUserIds.push(studentA.id, studentB.id)

    const rj45AttemptA = await startAttempt(studentA.id, 'rj45')
    const rj45AttemptB = await startAttempt(studentB.id, 'rj45')
    await completeAttempt(studentA.id, rj45AttemptA.attemptId, {
      moduleKey: 'rj45',
      score: 91,
      procedureAccuracy: 91,
      durationSeconds: 180,
      metrics: { cableTest: 'PASS' },
    })
    await completeAttempt(studentB.id, rj45AttemptB.attemptId, {
      moduleKey: 'rj45',
      score: 62,
      procedureAccuracy: 62,
      durationSeconds: 210,
      metrics: { cableTest: 'PASS' },
    })

    const networkAttemptA = await startAttempt(studentA.id, 'network')
    const networkAttemptB = await startAttempt(studentB.id, 'network')
    for (const [student, attempt, score] of [
      [studentA, networkAttemptA, 88],
      [studentB, networkAttemptB, 55],
    ]) {
      await completeAttempt(student.id, attempt.attemptId, {
        moduleKey: 'network',
        score,
        procedureAccuracy: score,
        durationSeconds: 240,
        metrics: { pcToRouter: 'PASS', pcToSwitch: 'PASS' },
      })
      await saveNetworkScenario(student.id, attempt.attemptId, {
        scenarioKey: 'router-interface-down',
        scenarioTitle: 'Router Interface Down',
        score,
        durationSeconds: 90,
        diagnosisAttempts: 1,
        incorrectDiagnosisAttempts: 0,
        repairAttempts: 1,
        failedRepairAttempts: 0,
        hintsUsed: 0,
        diagnosticCommands: [],
        metrics: {},
      })
    }

    const studentsA = await getInstructorStudents(listFilters, instructorA)
    const studentsB = await getInstructorStudents(listFilters, instructorB)
    assert.deepEqual(studentsA.students.map((student) => student.id), [studentA.id])
    assert.deepEqual(studentsB.students.map((student) => student.id), [studentB.id])

    const overviewA = await getInstructorOverview(instructorA)
    const moduleAnalyticsA = await getInstructorModuleAnalytics(instructorA)
    const resultsA = await getInstructorResults({
      ...listFilters,
      scoreBand: null,
      performanceRating: null,
      fromDate: null,
      toDate: null,
    }, instructorA)
    const troubleshootingA = await getInstructorTroubleshootingAnalytics(instructorA)
    assert.equal(overviewA.metrics.totalStudents, 1)
    assert.equal(overviewA.recentActivity.every((attempt) => attempt.studentId === studentA.id), true)
    assert.equal(
      moduleAnalyticsA.modules.find((module) => module.moduleKey === 'rj45').totalAttempts,
      1,
    )
    assert.equal(resultsA.attempts.every((attempt) => attempt.studentId === studentA.id), true)
    assert.equal(
      troubleshootingA.scenarios.find((scenario) => scenario.scenarioKey === 'router-interface-down').studentsAttempted,
      1,
    )

    await assert.rejects(
      getInstructorStudentDetail(studentB.id, instructorA),
      (error) => error.status === 404 && error.code === 'STUDENT_NOT_FOUND',
    )

    assert.equal((await joinClass(studentA, classA.classCode)).status, 'already_enrolled')
    assert.equal((await joinClass(studentA, classA2.classCode)).status, 'joined')
    assert.equal((await joinClass(studentA, classA2.classCode)).status, 'already_enrolled')
    assert.equal((await getInstructorStudents(listFilters, instructorA)).students.length, 1)
    assert.equal((await getClassStudents(instructorA, classA.id, listFilters)).students.length, 1)

    const adminStudents = await getInstructorStudents(listFilters, admin)
    assert.ok(adminStudents.students.some((student) => student.id === studentA.id))
    assert.ok(adminStudents.students.some((student) => student.id === studentB.id))

    await updateClass(instructorB, classB.id, { isActive: false })
    await assert.rejects(
      joinClass(studentA, classB.classCode),
      (error) => error.code === 'CLASS_INACTIVE',
    )

    const rollbackEmail = `${marker}-rollback@test.local`.toLowerCase()
    await assert.rejects(
      registerStudent({
        studentNumber: `${marker}-ROLLBACK`,
        firstName: 'Rollback',
        lastName: marker,
        email: rollbackEmail,
        password: testPassword,
        classCode: 'TS-AAAAAA',
      }),
      (error) => error.code === 'CLASS_NOT_FOUND',
    )
    const [rollbackRows] = await databasePool.execute(
      'SELECT id FROM users WHERE email = ?',
      [rollbackEmail],
    )
    assert.equal(rollbackRows.length, 0)
  })
}
