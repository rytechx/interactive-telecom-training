const MODULE_KEYS = Object.freeze(['rj45', 'fiber', 'network'])

const NETWORK_SCENARIO_KEYS = Object.freeze([
  'wrong-workstation-ip',
  'router-interface-down',
  'wrong-switch-ip',
  'wrong-default-gateway',
  'pc-switch-disconnected',
  'switch-power-failure',
])

const METRIC_FIELDS = Object.freeze({
  rj45: Object.freeze([
    'mistakes',
    'wrongToolSelections',
    'incorrectT568BAttempts',
    'restartStepCount',
    'procedureRetryCount',
    'hintCount',
    'cableTest',
    'terminationStandard',
    't568bVerified',
    'completedProcedureStages',
  ]),
  fiber: Object.freeze([
    'mistakes',
    'wrongToolSelections',
    'sequenceErrors',
    'preparationErrors',
    'incorrectActions',
    'restartStepCount',
    'spliceLossDb',
    'alignment',
    'fusion',
    'protection',
    'heater',
    'finalInspection',
    'overallResult',
    'completedProcedureStages',
  ]),
  network: Object.freeze([
    'physicalInstallation',
    'routerConfiguration',
    'switchConfiguration',
    'pcToRouter',
    'pcToSwitch',
    'troubleshootingCompleted',
    'averageScore',
    'scenarioScores',
    'competencies',
  ]),
})

const SCENARIO_METRIC_FIELDS = Object.freeze([
  'rootCauseIdentified',
  'scenarioCompleted',
  'repairVerified',
  'verificationPassed',
  'scoreBreakdown',
  'hintDeduction',
  'timeline',
  'verification',
])

const MAX_METRICS_BYTES = 16 * 1024
const MAX_DURATION_SECONDS = 24 * 60 * 60

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function sanitizeJsonValue(value, depth = 0) {
  if (depth > 5) {
    return null
  }

  if (
    value === null ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  ) {
    return value
  }

  if (typeof value === 'string') {
    return value.slice(0, 300)
  }

  if (Array.isArray(value)) {
    return value.slice(0, 100).map((item) => sanitizeJsonValue(item, depth + 1))
  }

  if (!isPlainObject(value)) {
    return null
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !['__proto__', 'constructor', 'prototype'].includes(key))
      .slice(0, 50)
      .map(([key, item]) => [key.slice(0, 80), sanitizeJsonValue(item, depth + 1)]),
  )
}

function sanitizeMetrics(moduleKey, metrics) {
  if (metrics === undefined || metrics === null) {
    return {}
  }

  if (!isPlainObject(metrics)) {
    return null
  }

  const allowedFields = METRIC_FIELDS[moduleKey] ?? []
  const sanitized = Object.fromEntries(
    allowedFields
      .filter((field) => Object.hasOwn(metrics, field))
      .map((field) => [field, sanitizeJsonValue(metrics[field])]),
  )

  return Buffer.byteLength(JSON.stringify(sanitized), 'utf8') <=
    MAX_METRICS_BYTES
    ? sanitized
    : null
}

function sanitizeScenarioMetrics(metrics) {
  if (metrics === undefined || metrics === null) {
    return {}
  }

  if (!isPlainObject(metrics)) {
    return null
  }

  const sanitized = Object.fromEntries(
    SCENARIO_METRIC_FIELDS
      .filter((field) => Object.hasOwn(metrics, field))
      .map((field) => [field, sanitizeJsonValue(metrics[field])]),
  )

  return Buffer.byteLength(JSON.stringify(sanitized), 'utf8') <=
    MAX_METRICS_BYTES
    ? sanitized
    : null
}

function validateBoundedNumber(value, minimum, maximum) {
  return typeof value === 'number' && Number.isFinite(value) &&
    value >= minimum && value <= maximum
}

function validateCount(value) {
  return Number.isInteger(value) && value >= 0 && value <= 1000
}

function derivePerformanceRating(score) {
  if (score >= 95) return 'Outstanding'
  if (score >= 90) return 'Excellent'
  if (score >= 80) return 'Very Good'
  if (score >= 70) return 'Good'
  if (score >= 60) return 'Needs Practice'
  return 'Repeat Training'
}

function validateStartAttemptInput(input = {}) {
  const moduleKey = typeof input.moduleKey === 'string'
    ? input.moduleKey.trim().toLowerCase()
    : ''

  return MODULE_KEYS.includes(moduleKey)
    ? { isValid: true, values: { moduleKey }, errors: {} }
    : {
        isValid: false,
        values: {},
        errors: { moduleKey: 'Select a recognized training module.' },
      }
}

function validateCompletionInput(input = {}) {
  const startValidation = validateStartAttemptInput(input)
  const errors = { ...startValidation.errors }
  const score = input.score
  const procedureAccuracy = input.procedureAccuracy
  const durationSeconds = input.durationSeconds

  if (!validateBoundedNumber(score, 0, 100)) {
    errors.score = 'Score must be a number from 0 to 100.'
  }

  if (
    procedureAccuracy !== undefined &&
    procedureAccuracy !== null &&
    !validateBoundedNumber(procedureAccuracy, 0, 100)
  ) {
    errors.procedureAccuracy = 'Procedure accuracy must be from 0 to 100.'
  }

  if (
    !Number.isInteger(durationSeconds) ||
    durationSeconds < 0 ||
    durationSeconds > MAX_DURATION_SECONDS
  ) {
    errors.durationSeconds = 'Duration must be a nonnegative whole number.'
  }

  const metrics = startValidation.isValid
    ? sanitizeMetrics(startValidation.values.moduleKey, input.metrics)
    : null

  if (metrics === null) {
    errors.metrics = 'Training metrics are invalid or too large.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values: {
      moduleKey: startValidation.values.moduleKey,
      score,
      procedureAccuracy: procedureAccuracy ?? null,
      durationSeconds,
      metrics,
    },
  }
}

function validateScenarioInput(input = {}) {
  const errors = {}
  const scenarioKey = typeof input.scenarioKey === 'string'
    ? input.scenarioKey.trim()
    : ''
  const scenarioTitle = typeof input.scenarioTitle === 'string'
    ? input.scenarioTitle.trim().slice(0, 180)
    : ''

  if (!NETWORK_SCENARIO_KEYS.includes(scenarioKey)) {
    errors.scenarioKey = 'Select a recognized troubleshooting scenario.'
  }

  if (!scenarioTitle) {
    errors.scenarioTitle = 'Scenario title is required.'
  }

  if (!validateBoundedNumber(input.score, 0, 100)) {
    errors.score = 'Score must be a number from 0 to 100.'
  }

  if (
    !Number.isInteger(input.durationSeconds) ||
    input.durationSeconds < 0 ||
    input.durationSeconds > MAX_DURATION_SECONDS
  ) {
    errors.durationSeconds = 'Duration must be a nonnegative whole number.'
  }

  const countFields = [
    'diagnosisAttempts',
    'incorrectDiagnosisAttempts',
    'repairAttempts',
    'failedRepairAttempts',
    'hintsUsed',
  ]

  countFields.forEach((field) => {
    if (!validateCount(input[field])) {
      errors[field] = `${field} must be a nonnegative whole number.`
    }
  })

  const diagnosticCommands = sanitizeJsonValue(input.diagnosticCommands ?? [])
  const metrics = sanitizeScenarioMetrics(input.metrics)

  if (!Array.isArray(diagnosticCommands)) {
    errors.diagnosticCommands = 'Diagnostic commands must be a list.'
  }

  if (
    metrics === null ||
    Buffer.byteLength(JSON.stringify(diagnosticCommands), 'utf8') >
      MAX_METRICS_BYTES
  ) {
    errors.metrics = 'Scenario metrics are invalid or too large.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values: {
      scenarioKey,
      scenarioTitle,
      score: input.score,
      durationSeconds: input.durationSeconds,
      diagnosisAttempts: input.diagnosisAttempts,
      incorrectDiagnosisAttempts: input.incorrectDiagnosisAttempts,
      repairAttempts: input.repairAttempts,
      failedRepairAttempts: input.failedRepairAttempts,
      hintsUsed: input.hintsUsed,
      diagnosticCommands,
      metrics,
    },
  }
}

export {
  derivePerformanceRating,
  MODULE_KEYS,
  NETWORK_SCENARIO_KEYS,
  validateCompletionInput,
  validateScenarioInput,
  validateStartAttemptInput,
}
