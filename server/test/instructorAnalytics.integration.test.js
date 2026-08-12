import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { after, test } from 'node:test'

const runIntegration = process.env.RUN_DB_INTEGRATION === '1'

if (!runIntegration) {
  test('instructor analytics integration requires RUN_DB_INTEGRATION=1', {
    skip: true,
  }, () => {})
} else {
  const { databasePool } = await import('../src/config/database.js')
  const { registerStudent } = await import('../src/services/authService.js')
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

  async function createStudent(marker, suffix) {
    const student = await registerStudent({
      studentNumber: `${marker}-${suffix}`,
      firstName: `Analytics${suffix}`,
      lastName: marker,
      email: `${marker}-${suffix}@test.local`.toLowerCase(),
      password: 'integration-test-password',
    })
    createdUserIds.push(student.id)
    return student
  }

  async function completeModule(studentId, moduleKey, score, metrics) {
    const attempt = await startAttempt(studentId, moduleKey)
    await completeAttempt(studentId, attempt.attemptId, {
      moduleKey,
      score,
      procedureAccuracy: score,
      durationSeconds: 180,
      metrics,
    })
    return attempt
  }

  async function readModuleTotals(moduleKey) {
    const [rows] = await databasePool.execute(
      `SELECT
         COUNT(*) AS total_attempts,
         SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END)
           AS completed_attempts,
         COUNT(DISTINCT a.user_id) AS students_attempted,
         COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.user_id END)
           AS students_completed,
         ROUND(AVG(CASE WHEN a.status = 'completed' THEN a.score END), 1)
           AS average_score,
         ROUND(AVG(
           CASE WHEN a.status = 'completed' THEN a.procedure_accuracy END
         ), 1) AS average_procedure_accuracy
       FROM training_attempts a
       INNER JOIN users u ON u.id = a.user_id AND u.role = 'student'
       INNER JOIN training_modules m ON m.id = a.module_id
       WHERE m.module_key = ?`,
      [moduleKey],
    )
    const [bestRows] = await databasePool.execute(
      `SELECT ROUND(AVG(best_score), 1) AS average_best_score
       FROM (
         SELECT MAX(a.score) AS best_score
         FROM training_attempts a
         INNER JOIN users u ON u.id = a.user_id AND u.role = 'student'
         INNER JOIN training_modules m ON m.id = a.module_id
         WHERE m.module_key = ? AND a.status = 'completed'
         GROUP BY a.user_id
       ) student_best`,
      [moduleKey],
    )

    return { ...rows[0], average_best_score: bestRows[0].average_best_score }
  }

  test('two students remain independent and aggregates match stored records', async () => {
    const marker = `IAT-${Date.now()}-${randomBytes(2).toString('hex')}`
    const studentA = await createStudent(marker, 'A')
    const studentB = await createStudent(marker, 'B')
    await completeModule(studentA.id, 'rj45', 96, {
      mistakes: 1,
      wrongToolSelections: 0,
      incorrectT568BAttempts: 1,
      cableTest: 'PASS',
    })
    await completeModule(studentA.id, 'fiber', 84, {
      mistakes: 2,
      wrongToolSelections: 1,
      spliceLossDb: 0.04,
      alignment: 'PASS',
      fusion: 'PASS',
      protection: 'PASS',
      finalInspection: 'PASS',
    })
    const networkAttempt = await completeModule(studentB.id, 'network', 65, {
      physicalInstallation: 'PASS',
      routerConfiguration: 'PASS',
      switchConfiguration: 'PASS',
      pcToRouter: 'PASS',
      pcToSwitch: 'PASS',
    })
    await saveNetworkScenario(studentB.id, networkAttempt.attemptId, {
      scenarioKey: 'router-interface-down',
      scenarioTitle: 'Router Interface Down',
      score: 72,
      durationSeconds: 95,
      diagnosisAttempts: 3,
      incorrectDiagnosisAttempts: 2,
      repairAttempts: 1,
      failedRepairAttempts: 0,
      hintsUsed: 1,
      diagnosticCommands: [{ command: 'show ip interface brief' }],
      metrics: { rootCauseIdentified: true, repairVerified: true },
    })

    const studentList = await getInstructorStudents({
      search: marker,
      status: null,
      moduleKey: null,
      page: 1,
      limit: 20,
    })
    const recordA = studentList.students.find((item) => item.id === studentA.id)
    const recordB = studentList.students.find((item) => item.id === studentB.id)

    assert.equal(studentList.students.length, 2)
    assert.equal(recordA.modulesCompleted, 2)
    assert.equal(recordA.overallProgress, 67)
    assert.equal(recordA.averageBestScore, 90)
    assert.equal(recordA.status, 'in_progress')
    assert.equal(recordB.modulesCompleted, 1)
    assert.equal(recordB.overallProgress, 33)
    assert.equal(recordB.averageBestScore, 65)
    assert.equal(recordB.status, 'needs_practice')

    const detailA = await getInstructorStudentDetail(studentA.id)
    assert.equal(detailA.summary.totalAttempts, 2)
    assert.equal(detailA.summary.averageBestScore, 90)

    const overview = await getInstructorOverview()
    const [databaseCounts] = await databasePool.execute(
      `SELECT
         COUNT(*) AS total_students,
         SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) AS active_students
       FROM users
       WHERE role = 'student'`,
    )
    assert.equal(overview.metrics.totalStudents, Number(databaseCounts[0].total_students))
    assert.equal(overview.metrics.activeStudents, Number(databaseCounts[0].active_students))
    assert.ok(overview.recentActivity.some((item) => item.studentId === studentA.id))
    assert.ok(overview.recentActivity.some((item) => item.studentId === studentB.id))

    const outstandingResults = await getInstructorResults({
      search: marker,
      moduleKey: null,
      scoreBand: null,
      performanceRating: 'Outstanding',
      fromDate: null,
      toDate: null,
      page: 1,
      limit: 20,
    })
    assert.equal(outstandingResults.attempts.length, 1)
    assert.equal(outstandingResults.attempts[0].score, 96)

    const moduleAnalytics = await getInstructorModuleAnalytics()
    for (const moduleKey of ['rj45', 'fiber', 'network']) {
      const actual = moduleAnalytics.modules.find(
        (module) => module.moduleKey === moduleKey,
      )
      const expected = await readModuleTotals(moduleKey)

      assert.equal(actual.totalAttempts, Number(expected.total_attempts))
      assert.equal(actual.studentsAttempted, Number(expected.students_attempted))
      assert.equal(actual.studentsCompleted, Number(expected.students_completed))
      assert.equal(actual.averageScore, Number(expected.average_score))
      assert.equal(actual.averageBestScore, Number(expected.average_best_score))
      assert.equal(
        overview.modules.find((module) => module.moduleKey === moduleKey)
          .totalAttempts,
        Number(expected.total_attempts),
      )
      if (moduleKey !== 'network') {
        assert.equal(
          actual.diagnostics.averageProcedureAccuracy,
          Number(expected.average_procedure_accuracy),
        )
      }
      assert.equal(
        actual.scoreDistribution.reduce((total, band) => total + band.total, 0),
        Number(expected.completed_attempts),
      )
    }

    const troubleshooting = await getInstructorTroubleshootingAnalytics()
    const scenario = troubleshooting.scenarios.find(
      (item) => item.scenarioKey === 'router-interface-down',
    )
    const [scenarioRows] = await databasePool.execute(
      `SELECT
         COUNT(DISTINCT a.user_id) AS students_attempted,
         ROUND(AVG(r.score), 1) AS average_score,
         ROUND(AVG(r.diagnosis_attempts), 1) AS average_diagnosis_attempts,
         ROUND(AVG(r.repair_attempts), 1) AS average_repair_attempts,
         ROUND(AVG(r.hints_used), 1) AS average_hints_used
       FROM network_scenario_results r
       INNER JOIN training_attempts a ON a.id = r.attempt_id
       INNER JOIN users u ON u.id = a.user_id AND u.role = 'student'
       WHERE r.scenario_key = ?`,
      ['router-interface-down'],
    )
    assert.equal(scenario.studentsAttempted, Number(scenarioRows[0].students_attempted))
    assert.equal(scenario.averageScore, Number(scenarioRows[0].average_score))
    assert.equal(
      scenario.averageDiagnosisAttempts,
      Number(scenarioRows[0].average_diagnosis_attempts),
    )
    assert.equal(
      scenario.averageRepairAttempts,
      Number(scenarioRows[0].average_repair_attempts),
    )
    assert.equal(scenario.averageHintsUsed, Number(scenarioRows[0].average_hints_used))
  })
}
