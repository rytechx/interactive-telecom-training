import assert from 'node:assert/strict'
import test from 'node:test'
import {
  derivePerformanceRating,
  validateCompletionInput,
  validateScenarioInput,
  validateStartAttemptInput,
} from '../src/utils/trainingValidation.js'

test('attempt validation accepts only stable module keys', () => {
  assert.equal(validateStartAttemptInput({ moduleKey: ' RJ45 ' }).isValid, true)
  assert.equal(validateStartAttemptInput({ moduleKey: 'unknown' }).isValid, false)
})

test('completion validation bounds assessment values and filters metrics', () => {
  const result = validateCompletionInput({
    moduleKey: 'rj45',
    score: 94,
    procedureAccuracy: 92,
    durationSeconds: 180,
    metrics: {
      mistakes: 2,
      cableTest: 'PASS',
      untrustedField: 'discarded',
    },
  })

  assert.equal(result.isValid, true)
  assert.deepEqual(result.values.metrics, {
    mistakes: 2,
    cableTest: 'PASS',
  })
  assert.equal(
    validateCompletionInput({
      moduleKey: 'fiber',
      score: 101,
      durationSeconds: -1,
    }).isValid,
    false,
  )
})

test('scenario validation recognizes current troubleshooting keys', () => {
  const result = validateScenarioInput({
    scenarioKey: 'router-interface-down',
    scenarioTitle: 'Router Interface Down',
    score: 90,
    durationSeconds: 60,
    diagnosisAttempts: 1,
    incorrectDiagnosisAttempts: 0,
    repairAttempts: 1,
    failedRepairAttempts: 0,
    hintsUsed: 0,
    diagnosticCommands: ['show ip interface brief'],
    metrics: { rootCauseIdentified: true },
  })

  assert.equal(result.isValid, true)
  assert.equal(
    validateScenarioInput({ ...result.values, scenarioKey: 'other' }).isValid,
    false,
  )
})

test('performance ratings use consistent server thresholds', () => {
  assert.equal(derivePerformanceRating(95), 'Outstanding')
  assert.equal(derivePerformanceRating(90), 'Excellent')
  assert.equal(derivePerformanceRating(80), 'Very Good')
  assert.equal(derivePerformanceRating(70), 'Good')
  assert.equal(derivePerformanceRating(60), 'Needs Practice')
  assert.equal(derivePerformanceRating(59), 'Repeat Training')
})
