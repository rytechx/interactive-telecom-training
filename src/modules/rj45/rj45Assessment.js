const RJ45_ASSESSMENT_MAX_SCORE = 100
const RJ45_EFFICIENCY_FULL_SCORE_MS = 20 * 60 * 1000
const RJ45_EFFICIENCY_GOOD_SCORE_MS = 30 * 60 * 1000
const RJ45_EFFICIENCY_EXTENDED_SCORE_MS = 45 * 60 * 1000
const MISTAKE_GUARD_WINDOW_MS = 650

const ASSESSMENT_STAGE_IDS = Object.freeze({
  CABLE_SELECTED: 'cable-selected',
  JACKET_STRIPPED: 'jacket-stripped',
  PAIRS_SEPARATED: 'pairs-separated',
  T568B_ARRANGED: 't568b-arranged',
  CONDUCTORS_TRIMMED: 'conductors-trimmed',
  CONNECTOR_INSERTED: 'connector-inserted',
  CONNECTOR_CRIMPED: 'connector-crimped',
  CABLE_TESTED: 'cable-tested',
})

const ASSESSMENT_STAGES = Object.freeze([
  Object.freeze({
    id: ASSESSMENT_STAGE_IDS.CABLE_SELECTED,
    label: 'Cable selected',
  }),
  Object.freeze({
    id: ASSESSMENT_STAGE_IDS.JACKET_STRIPPED,
    label: 'Jacket stripped',
  }),
  Object.freeze({
    id: ASSESSMENT_STAGE_IDS.PAIRS_SEPARATED,
    label: 'Wire pairs separated',
  }),
  Object.freeze({
    id: ASSESSMENT_STAGE_IDS.T568B_ARRANGED,
    label: 'T568B arrangement completed',
  }),
  Object.freeze({
    id: ASSESSMENT_STAGE_IDS.CONDUCTORS_TRIMMED,
    label: 'Conductors trimmed',
  }),
  Object.freeze({
    id: ASSESSMENT_STAGE_IDS.CONNECTOR_INSERTED,
    label: 'RJ45 connector inserted',
  }),
  Object.freeze({
    id: ASSESSMENT_STAGE_IDS.CONNECTOR_CRIMPED,
    label: 'Connector crimped',
  }),
  Object.freeze({
    id: ASSESSMENT_STAGE_IDS.CABLE_TESTED,
    label: 'Cable tested',
  }),
])

const ASSESSMENT_MISTAKE_TYPES = Object.freeze({
  WRONG_TOOL: 'wrong-tool',
  INCORRECT_T568B: 'incorrect-t568b',
  PREREQUISITE: 'prerequisite',
  PROCEDURE: 'procedure',
})

const SCORE_WEIGHTS = Object.freeze({
  PROCEDURE_COMPLETION: 50,
  T568B_ARRANGEMENT: 20,
  CORRECT_TOOL_USAGE: 15,
  MISTAKE_CONTROL: 10,
  COMPLETION_EFFICIENCY: 5,
})

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum)
}

function createInitialAssessmentState(assessmentStartTime = null) {
  return {
    assessmentStartTime,
    assessmentEndTime: null,
    elapsedTimeMs: 0,
    mistakeCount: 0,
    wrongToolCount: 0,
    incorrectT568BAttempts: 0,
    t568bValidationAttempts: 0,
    otherMistakeCount: 0,
    procedureRetryCount: 0,
    restartStepCount: 0,
    hintCount: 0,
    completedProcedureSteps: [],
    finalScore: null,
    performanceRating: null,
    procedureAccuracy: 100,
    scoreBreakdown: null,
    assessmentFeedback: [],
    assessmentVisible: false,
    lastMistakeSignature: null,
    lastMistakeRecordedAt: 0,
  }
}

function getPerformanceRating(score) {
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

  return 'Repeat Training'
}

function getEfficiencyPoints(elapsedTimeMs) {
  if (elapsedTimeMs <= RJ45_EFFICIENCY_FULL_SCORE_MS) {
    return 5
  }

  if (elapsedTimeMs <= RJ45_EFFICIENCY_GOOD_SCORE_MS) {
    return 4
  }

  if (elapsedTimeMs <= RJ45_EFFICIENCY_EXTENDED_SCORE_MS) {
    return 3
  }

  return 2
}

function calculateProcedureAccuracy({
  wrongToolCount,
  incorrectT568BAttempts,
  otherMistakeCount,
  restartStepCount,
}) {
  const accuracyDeductions =
    wrongToolCount * 4 +
    incorrectT568BAttempts * 6 +
    otherMistakeCount * 4 +
    restartStepCount * 2

  return clamp(100 - accuracyDeductions, 0, 100)
}

function getAssessmentFeedback({
  finalScore,
  mistakeCount,
  wrongToolCount,
  incorrectT568BAttempts,
}) {
  const feedback = []

  if (finalScore >= 90) {
    feedback.push(
      'Excellent work. The cable was terminated correctly using the T568B standard with strong procedural accuracy.',
    )
  } else if (finalScore >= 70) {
    feedback.push(
      'Good work. The cable passed testing; review the noted areas to make the procedure more consistent.',
    )
  } else {
    feedback.push(
      'Repeat the module to strengthen procedure sequencing and tool familiarity.',
    )
  }

  if (incorrectT568BAttempts > 0) {
    feedback.push(
      'Review the T568B conductor sequence to improve wire-order accuracy.',
    )
  }

  if (wrongToolCount >= 2) {
    feedback.push(
      'Review the purpose of each RJ45 termination tool before your next attempt.',
    )
  }

  if (mistakeCount >= 5 && finalScore >= 70) {
    feedback.push(
      'Repeat the module to reinforce procedure sequencing and reduce avoidable errors.',
    )
  }

  return feedback
}

function calculateAssessmentResult({
  assessmentStartTime,
  assessmentEndTime,
  completedProcedureSteps,
  mistakeCount,
  wrongToolCount,
  incorrectT568BAttempts,
  otherMistakeCount,
  restartStepCount,
}) {
  const elapsedTimeMs = Math.max(
    0,
    assessmentEndTime - assessmentStartTime,
  )
  const completedStageCount = ASSESSMENT_STAGES.filter((stage) =>
    completedProcedureSteps.includes(stage.id),
  ).length
  const procedureCompletion = Math.round(
    (completedStageCount / ASSESSMENT_STAGES.length) *
      SCORE_WEIGHTS.PROCEDURE_COMPLETION,
  )
  const t568bArrangement = Math.max(
    0,
    SCORE_WEIGHTS.T568B_ARRANGEMENT - incorrectT568BAttempts * 5,
  )
  const correctToolUsage = Math.max(
    0,
    SCORE_WEIGHTS.CORRECT_TOOL_USAGE - wrongToolCount * 2,
  )
  const mistakeControl = Math.max(
    0,
    SCORE_WEIGHTS.MISTAKE_CONTROL -
      otherMistakeCount * 2 -
      restartStepCount,
  )
  const completionEfficiency = getEfficiencyPoints(elapsedTimeMs)
  const scoreBreakdown = {
    procedureCompletion,
    t568bArrangement,
    correctToolUsage,
    mistakeControl,
    completionEfficiency,
  }
  const finalScore = clamp(
    Object.values(scoreBreakdown).reduce(
      (total, categoryScore) => total + categoryScore,
      0,
    ),
    0,
    RJ45_ASSESSMENT_MAX_SCORE,
  )
  const performanceRating = getPerformanceRating(finalScore)
  const procedureAccuracy = calculateProcedureAccuracy({
    wrongToolCount,
    incorrectT568BAttempts,
    otherMistakeCount,
    restartStepCount,
  })
  const assessmentFeedback = getAssessmentFeedback({
    finalScore,
    mistakeCount,
    wrongToolCount,
    incorrectT568BAttempts,
  })

  return {
    elapsedTimeMs,
    finalScore,
    performanceRating,
    procedureAccuracy,
    scoreBreakdown,
    assessmentFeedback,
  }
}

function formatAssessmentTime(elapsedTimeMs) {
  const totalSeconds = Math.max(0, Math.floor(elapsedTimeMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export {
  ASSESSMENT_MISTAKE_TYPES,
  ASSESSMENT_STAGE_IDS,
  ASSESSMENT_STAGES,
  calculateAssessmentResult,
  createInitialAssessmentState,
  formatAssessmentTime,
  getPerformanceRating,
  MISTAKE_GUARD_WINDOW_MS,
  RJ45_ASSESSMENT_MAX_SCORE,
  SCORE_WEIGHTS,
}
