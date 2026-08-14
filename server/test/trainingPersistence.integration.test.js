import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { after, test } from 'node:test'

const runIntegration = process.env.RUN_DB_INTEGRATION === '1'
const testPassword = randomBytes(24).toString('base64url')

if (!runIntegration) {
  test('training persistence integration requires RUN_DB_INTEGRATION=1', {
    skip: true,
  }, () => {})
} else {
  const { databasePool } = await import('../src/config/database.js')
  const { registerStudent } = await import('../src/services/authService.js')
  const {
    completeAttempt,
    getAttemptDetail,
    getAttempts,
    getTrainingProgress,
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

  async function createTestStudent(label) {
    const unique = `${Date.now()}-${randomBytes(3).toString('hex')}`
    const user = await registerStudent({
      studentNumber: `TEST-${label}-${unique}`,
      firstName: 'Persistence',
      lastName: 'Tester',
      email: `persistence-${label}-${unique}@test.local`,
      password: testPassword,
    })
    createdUserIds.push(user.id)
    return user
  }

  test('attempts persist independently with best/latest progress and ownership', async () => {
    const studentA = await createTestStudent('a')
    const studentB = await createTestStudent('b')
    const firstAttempt = await startAttempt(studentA.id, 'rj45')
    const firstCompletion = await completeAttempt(
      studentA.id,
      firstAttempt.attemptId,
      {
        moduleKey: 'rj45',
        score: 95,
        procedureAccuracy: 96,
        durationSeconds: 180,
        metrics: { cableTest: 'PASS', terminationStandard: 'T568B' },
      },
    )
    const duplicateCompletion = await completeAttempt(
      studentA.id,
      firstAttempt.attemptId,
      {
        moduleKey: 'rj45',
        score: 95,
        procedureAccuracy: 96,
        durationSeconds: 180,
        metrics: { cableTest: 'PASS', terminationStandard: 'T568B' },
      },
    )
    const secondAttempt = await startAttempt(studentA.id, 'rj45')
    await completeAttempt(studentA.id, secondAttempt.attemptId, {
      moduleKey: 'rj45',
      score: 80,
      procedureAccuracy: 82,
      durationSeconds: 220,
      metrics: { cableTest: 'PASS', terminationStandard: 'T568B' },
    })

    assert.equal(firstCompletion.performanceRating, 'Outstanding')
    assert.equal(duplicateCompletion.alreadyCompleted, true)
    assert.equal(secondAttempt.attemptNumber, 2)

    const progress = await getTrainingProgress(studentA.id)
    assert.equal(progress.modules.rj45.attemptCount, 2)
    assert.equal(progress.modules.rj45.latestScore, 80)
    assert.equal(progress.modules.rj45.bestScore, 95)
    assert.equal(progress.averageScore, 95)

    const attempts = await getAttempts(studentA.id, {
      moduleKey: 'rj45',
      status: 'completed',
      limit: 10,
    })
    assert.equal(attempts.length, 2)
    assert.equal(attempts[0].attemptNumber, 2)

    await assert.rejects(
      getAttemptDetail(studentB.id, firstAttempt.attemptId),
      (error) => error.code === 'ATTEMPT_NOT_FOUND',
    )
  })

  test('network scenarios remain unique under their owning attempt', async () => {
    const student = await createTestStudent('network')
    const attempt = await startAttempt(student.id, 'network')
    const scenarioPayload = {
      scenarioKey: 'router-interface-down',
      scenarioTitle: 'Router Interface Down',
      score: 90,
      durationSeconds: 75,
      diagnosisAttempts: 1,
      incorrectDiagnosisAttempts: 0,
      repairAttempts: 1,
      failedRepairAttempts: 0,
      hintsUsed: 0,
      diagnosticCommands: [{ command: 'show ip interface brief' }],
      metrics: { rootCauseIdentified: true, repairVerified: true },
    }
    await saveNetworkScenario(student.id, attempt.attemptId, scenarioPayload)
    const duplicate = await saveNetworkScenario(
      student.id,
      attempt.attemptId,
      scenarioPayload,
    )

    assert.equal(duplicate.alreadySaved, true)
    const detail = await getAttemptDetail(student.id, attempt.attemptId)
    assert.equal(detail.scenarios.length, 1)
    assert.equal(detail.scenarios[0].scenarioKey, 'router-interface-down')
  })
}
