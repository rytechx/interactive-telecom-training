import { NETWORK_TOPOLOGY } from '../networkTopology.js'
import { NETWORK_TROUBLESHOOTING_SCENARIOS } from './troubleshootingScenarios.js'

const NETWORK_SCENARIO_SCORE_WEIGHTS = Object.freeze({
  DIAGNOSIS_ACCURACY: 30,
  REPAIR_ACCURACY: 30,
  VERIFICATION: 15,
  DIAGNOSTIC_METHODOLOGY: 15,
  EFFICIENCY: 10,
})

const EFFICIENCY_THRESHOLDS_MS = Object.freeze({
  FULL: 3 * 60 * 1000,
  GOOD: 5 * 60 * 1000,
  EXTENDED: 8 * 60 * 1000,
})

const DUPLICATE_COMMAND_WINDOW_MS = 300

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum)
}

function normalizeCommand(command) {
  return command.trim().replace(/\s+/g, ' ').toLowerCase()
}

function getUsefulDiagnosticCommand(terminalType, command) {
  const normalizedCommand = normalizeCommand(command)

  if (
    terminalType === 'workstation' &&
    (normalizedCommand === 'ipconfig' || normalizedCommand === 'ipconfig /all')
  ) {
    return {
      key: 'workstation:ipconfig',
      label: 'Checked workstation IPv4 configuration',
    }
  }

  if (terminalType === 'workstation') {
    const pingMatch = normalizedCommand.match(/^ping (\S+)$/)

    if (pingMatch) {
      return {
        key: `workstation:ping:${pingMatch[1]}`,
        label: `Tested connectivity to ${pingMatch[1]}`,
      }
    }
  }

  if (
    ['router', 'switch'].includes(terminalType) &&
    normalizedCommand === 'show ip interface brief'
  ) {
    return {
      key: `${terminalType}:show-ip-interface-brief`,
      label: `Inspected ${terminalType} interface status`,
    }
  }

  if (
    ['router', 'switch'].includes(terminalType) &&
    normalizedCommand === 'show running-config'
  ) {
    return {
      key: `${terminalType}:show-running-config`,
      label: `Inspected ${terminalType} running configuration`,
    }
  }

  return null
}

function addTimelineEvent(metrics, event) {
  if (
    event.uniqueKey &&
    metrics.timeline.some((item) => item.uniqueKey === event.uniqueKey)
  ) {
    return metrics
  }

  return {
    ...metrics,
    timeline: [
      ...metrics.timeline,
      {
        id: `${event.type}:${event.timestamp}:${metrics.timeline.length}`,
        type: event.type,
        label: event.label,
        timestamp: event.timestamp,
        uniqueKey: event.uniqueKey ?? null,
      },
    ],
  }
}

function recordDiagnosticCommand(
  metrics,
  { terminalType, command, timestamp, successful },
) {
  const normalizedCommand = normalizeCommand(command)
  const commandSignature = `${terminalType}:${normalizedCommand}`

  if (
    metrics.lastCommandSignature === commandSignature &&
    timestamp - metrics.lastCommandRecordedAt < DUPLICATE_COMMAND_WINDOW_MS
  ) {
    return metrics
  }

  const usefulCommand = successful
    ? getUsefulDiagnosticCommand(terminalType, command)
    : null
  const isNewUsefulCommand = Boolean(
    usefulCommand &&
      !metrics.uniqueDiagnosticCommandsUsed.some(
        (item) => item.key === usefulCommand.key,
      ),
  )
  let updatedMetrics = {
    ...metrics,
    diagnosticCommandsUsed: [
      ...metrics.diagnosticCommandsUsed,
      { terminalType, command, timestamp, successful },
    ],
    uniqueDiagnosticCommandsUsed: isNewUsefulCommand
      ? [
          ...metrics.uniqueDiagnosticCommandsUsed,
          { ...usefulCommand, terminalType, command, timestamp },
        ]
      : metrics.uniqueDiagnosticCommandsUsed,
    pingAttempts:
      metrics.pingAttempts + (/^ping\s+/i.test(normalizedCommand) ? 1 : 0),
    lastCommandSignature: commandSignature,
    lastCommandRecordedAt: timestamp,
  }

  if (isNewUsefulCommand) {
    updatedMetrics = addTimelineEvent(updatedMetrics, {
      type: 'diagnostic',
      label: usefulCommand.label,
      timestamp,
      uniqueKey: `diagnostic:${usefulCommand.key}`,
    })
  }

  return updatedMetrics
}

function recordPhysicalInspection(metrics, { id, label, timestamp }) {
  if (metrics.physicalInspections.some((inspection) => inspection.id === id)) {
    return metrics
  }

  const updatedMetrics = {
    ...metrics,
    physicalInspections: [
      ...metrics.physicalInspections,
      { id, label, timestamp },
    ],
  }

  return addTimelineEvent(updatedMetrics, {
    type: 'inspection',
    label,
    timestamp,
    uniqueKey: `inspection:${id}`,
  })
}

function getAccuracyPoints(errorCount, maximum) {
  if (errorCount <= 0) {
    return maximum
  }

  if (errorCount === 1) {
    return 24
  }

  if (errorCount === 2) {
    return 18
  }

  return 10
}

function getVerificationPoints(scenarioId, verification) {
  if (verification.passed) {
    return NETWORK_SCENARIO_SCORE_WEIGHTS.VERIFICATION
  }

  const checksByScenario = {
    'wrong-default-gateway': [
      verification.routerPing,
      verification.switchPing,
      verification.remotePing,
    ],
    'pc-switch-disconnected': [
      verification.pcSwitchLinkActive,
      verification.routerPing,
      verification.switchPing,
    ],
    'switch-power-failure': [
      verification.requiredPowerOn,
      verification.physicalLinksActive,
      verification.routerPing,
      verification.switchPing,
    ],
  }
  const checks = checksByScenario[scenarioId] ?? [
    verification.routerPing,
    verification.switchPing,
  ]
  const passedChecks = checks.filter(Boolean).length

  return Math.round(
    (passedChecks / checks.length) *
      NETWORK_SCENARIO_SCORE_WEIGHTS.VERIFICATION,
  )
}

function getDiagnosticMethodologyPoints(scenarioId, metrics) {
  const usefulKeys = new Set(
    metrics.uniqueDiagnosticCommandsUsed.map((command) => command.key),
  )
  const hasPing = [...usefulKeys].some((key) =>
    key.startsWith('workstation:ping:'),
  )
  const hasPhysicalInspection = metrics.physicalInspections.length > 0

  if (scenarioId === 'wrong-workstation-ip') {
    return usefulKeys.has('workstation:ipconfig') ? 15 : hasPing ? 7 : 0
  }

  if (scenarioId === 'router-interface-down') {
    return usefulKeys.has('router:show-ip-interface-brief') ||
      usefulKeys.has('router:show-running-config')
      ? 15
      : usefulKeys.has(
            `workstation:ping:${NETWORK_TOPOLOGY.router.lanIp.toLowerCase()}`,
          )
        ? 7
        : 0
  }

  if (scenarioId === 'wrong-switch-ip') {
    return usefulKeys.has('switch:show-ip-interface-brief') ||
      usefulKeys.has('switch:show-running-config')
      ? 15
      : usefulKeys.has(
            `workstation:ping:${NETWORK_TOPOLOGY.switch.managementIp.toLowerCase()}`,
          )
        ? 7
        : 0
  }

  if (scenarioId === 'wrong-default-gateway') {
    const hasIpConfig = usefulKeys.has('workstation:ipconfig')
    const hasLocalPing = [
      NETWORK_TOPOLOGY.router.lanIp,
      NETWORK_TOPOLOGY.switch.managementIp,
    ].some((address) =>
      usefulKeys.has(`workstation:ping:${address.toLowerCase()}`),
    )
    const hasRemotePing = usefulKeys.has(
      `workstation:ping:${NETWORK_TOPOLOGY.remoteHost.ip.toLowerCase()}`,
    )
    const evidenceCount = [hasIpConfig, hasLocalPing, hasRemotePing].filter(
      Boolean,
    ).length

    return evidenceCount === 3 ? 15 : evidenceCount === 2 ? 10 : evidenceCount === 1 ? 6 : 0
  }

  if (
    scenarioId === 'pc-switch-disconnected' ||
    scenarioId === 'switch-power-failure'
  ) {
    return hasPhysicalInspection ? 15 : hasPing ? 7 : 0
  }

  return 0
}

function getEfficiencyPoints(elapsedTime) {
  if (elapsedTime <= EFFICIENCY_THRESHOLDS_MS.FULL) {
    return 10
  }

  if (elapsedTime <= EFFICIENCY_THRESHOLDS_MS.GOOD) {
    return 8
  }

  if (elapsedTime <= EFFICIENCY_THRESHOLDS_MS.EXTENDED) {
    return 6
  }

  return 4
}

function getHintDeduction(hintsUsed) {
  if (hintsUsed <= 0) {
    return 0
  }

  if (hintsUsed === 1) {
    return 1
  }

  if (hintsUsed === 2) {
    return 3
  }

  return 6
}

function getNetworkPerformanceRating(score) {
  if (score >= 95) {
    return 'Outstanding'
  }

  if (score >= 90) {
    return 'Excellent'
  }

  if (score >= 80) {
    return 'Very Good'
  }

  if (score >= 70) {
    return 'Good'
  }

  if (score >= 60) {
    return 'Needs Practice'
  }

  return 'Repeat Scenario'
}

function getScenarioFeedback(scenario, metrics, finalScore, methodologyScore) {
  const feedback = []

  if (finalScore >= 90) {
    feedback.push(
      'Excellent troubleshooting. You identified the fault efficiently, applied the correct repair, and verified network restoration.',
    )
  } else if (finalScore >= 70) {
    feedback.push(
      'Good troubleshooting. Review the score breakdown and retry to improve consistency.',
    )
  } else {
    feedback.push(
      'Repeat this scenario to strengthen evidence-based diagnosis, repair, and verification.',
    )
  }

  if (metrics.incorrectDiagnosisAttempts >= 2) {
    feedback.push(
      'Review how diagnostic evidence maps to likely physical-layer and network-layer faults.',
    )
  }

  if (metrics.hintsUsed >= 2) {
    feedback.push(
      'Review the troubleshooting methodology and retry with fewer hints.',
    )
  }

  if (methodologyScore === 0) {
    feedback.push(
      'Use the available diagnostic tools or physical inspection views before submitting a diagnosis.',
    )
  }

  if (['pc-switch-disconnected', 'switch-power-failure'].includes(scenario.id)) {
    feedback.push(
      'Inspect power and link indicators before changing IPv4 configuration in physical-layer incidents.',
    )
  }

  return feedback
}

function getRecommendedNextAction(score) {
  if (score >= 90) {
    return 'Proceed to the next scenario.'
  }

  if (score >= 70) {
    return 'Proceed or retry this scenario for a higher score.'
  }

  return 'Retry this scenario before continuing.'
}

function calculateNetworkScenarioAssessment({ scenario, metrics, verification }) {
  const diagnosisAccuracy = metrics.rootCauseIdentified
    ? getAccuracyPoints(
        metrics.incorrectDiagnosisAttempts,
        NETWORK_SCENARIO_SCORE_WEIGHTS.DIAGNOSIS_ACCURACY,
      )
    : 0
  const repairAccuracy = metrics.repairVerified
    ? getAccuracyPoints(
        metrics.failedRepairAttempts,
        NETWORK_SCENARIO_SCORE_WEIGHTS.REPAIR_ACCURACY,
      )
    : 0
  const verificationScore = getVerificationPoints(scenario.id, verification)
  const diagnosticMethodology = getDiagnosticMethodologyPoints(
    scenario.id,
    metrics,
  )
  const efficiency = getEfficiencyPoints(metrics.elapsedTime)
  const hintDeduction = getHintDeduction(metrics.hintsUsed)
  const scoreBreakdown = {
    diagnosisAccuracy,
    repairAccuracy,
    verification: verificationScore,
    diagnosticMethodology,
    efficiency,
  }
  const baseScore = Object.values(scoreBreakdown).reduce(
    (total, score) => total + score,
    0,
  )
  const finalScore = clamp(baseScore - hintDeduction, 0, 100)

  return {
    scenarioId: scenario.id,
    scenarioNumber: scenario.number,
    scenarioTitle: scenario.selectionLabel,
    completedAt: metrics.scenarioEndTime,
    metrics,
    verification,
    scoreBreakdown,
    baseScore,
    hintDeduction,
    finalScore,
    performanceRating: getNetworkPerformanceRating(finalScore),
    feedback: getScenarioFeedback(
      scenario,
      metrics,
      finalScore,
      diagnosticMethodology,
    ),
    rootCause: scenario.rootCause,
    rootCauseExplanation: scenario.rootCauseExplanation,
    repair: scenario.repair,
    recommendedNextAction: getRecommendedNextAction(finalScore),
  }
}

function getStoredScenarioResult(record) {
  return record?.bestResult ?? record?.latestResult ?? null
}

function getWeakScenarioIds(scenarioResults) {
  return NETWORK_TROUBLESHOOTING_SCENARIOS.filter((scenario) => {
    const result = getStoredScenarioResult(scenarioResults[scenario.id])

    return result && result.finalScore < 80
  }).map((scenario) => scenario.id)
}

function hasCompletedAllScenarios(scenarioResults) {
  return NETWORK_TROUBLESHOOTING_SCENARIOS.every((scenario) =>
    Boolean(getStoredScenarioResult(scenarioResults[scenario.id])),
  )
}

function getAverageScenarioScore(scenarioIds, scenarioResults) {
  const scores = scenarioIds
    .map((scenarioId) =>
      getStoredScenarioResult(scenarioResults[scenarioId])?.finalScore,
    )
    .filter(Number.isFinite)

  if (!scores.length) {
    return 0
  }

  return scores.reduce((total, score) => total + score, 0) / scores.length
}

function calculateFinalNetworkAssessment(scenarioResults) {
  if (!hasCompletedAllScenarios(scenarioResults)) {
    return null
  }

  const scenarioScores = NETWORK_TROUBLESHOOTING_SCENARIOS.map((scenario) => {
    const result = getStoredScenarioResult(scenarioResults[scenario.id])

    return {
      scenarioId: scenario.id,
      scenarioNumber: scenario.number,
      scenarioTitle: scenario.selectionLabel,
      score: result.finalScore,
      performanceRating: result.performanceRating,
    }
  })
  const averageScore =
    scenarioScores.reduce((total, scenario) => total + scenario.score, 0) /
    scenarioScores.length
  const finalScore = Math.round(averageScore)
  const competencies = [
    {
      label: 'Physical Layer Inspection',
      score: getAverageScenarioScore(
        ['pc-switch-disconnected', 'switch-power-failure'],
        scenarioResults,
      ),
    },
    {
      label: 'IPv4 Configuration',
      score: getAverageScenarioScore(
        ['wrong-workstation-ip', 'wrong-switch-ip', 'wrong-default-gateway'],
        scenarioResults,
      ),
    },
    {
      label: 'Router Interface Diagnosis',
      score: getAverageScenarioScore(['router-interface-down'], scenarioResults),
    },
    {
      label: 'Switch Management Diagnosis',
      score: getAverageScenarioScore(['wrong-switch-ip'], scenarioResults),
    },
    {
      label: 'Gateway Troubleshooting',
      score: getAverageScenarioScore(['wrong-default-gateway'], scenarioResults),
    },
    {
      label: 'Cable Fault Isolation',
      score: getAverageScenarioScore(['pc-switch-disconnected'], scenarioResults),
    },
    {
      label: 'Power Fault Isolation',
      score: getAverageScenarioScore(['switch-power-failure'], scenarioResults),
    },
    {
      label: 'Connectivity Verification',
      score:
        (NETWORK_TROUBLESHOOTING_SCENARIOS.reduce((total, scenario) => {
          const result = getStoredScenarioResult(scenarioResults[scenario.id])

          return total + result.scoreBreakdown.verification
        }, 0) /
          (NETWORK_TROUBLESHOOTING_SCENARIOS.length *
            NETWORK_SCENARIO_SCORE_WEIGHTS.VERIFICATION)) *
        100,
    },
  ].map((competency) => ({
    ...competency,
    status: competency.score >= 80 ? 'PASS' : 'DEVELOPING',
  }))

  return {
    averageScore: Math.round(averageScore * 10) / 10,
    finalScore,
    performanceRating: getNetworkPerformanceRating(finalScore),
    scenarioScores,
    competencies,
    weakScenarioIds: getWeakScenarioIds(scenarioResults),
  }
}

function formatNetworkAssessmentTime(elapsedTime) {
  const totalSeconds = Math.max(0, Math.floor(elapsedTime / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export {
  addTimelineEvent,
  calculateFinalNetworkAssessment,
  calculateNetworkScenarioAssessment,
  formatNetworkAssessmentTime,
  getNetworkPerformanceRating,
  getStoredScenarioResult,
  getWeakScenarioIds,
  hasCompletedAllScenarios,
  NETWORK_SCENARIO_SCORE_WEIGHTS,
  recordDiagnosticCommand,
  recordPhysicalInspection,
}
