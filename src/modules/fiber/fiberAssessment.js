const FIBER_ASSESSMENT_MAX_SCORE = 100
const FIBER_EFFICIENCY_FULL_SCORE_MS = 25 * 60 * 1000
const FIBER_EFFICIENCY_GOOD_SCORE_MS = 35 * 60 * 1000
const FIBER_EFFICIENCY_EXTENDED_SCORE_MS = 50 * 60 * 1000
const FIBER_MISTAKE_GUARD_WINDOW_MS = 650

const FIBER_ASSESSMENT_STAGE_IDS = Object.freeze({
  CABLE_SELECTED: 'fiber-cable-selected',
  OUTER_JACKET_REMOVED: 'fiber-outer-jacket-removed',
  COATING_REMOVED: 'fiber-coating-removed',
  FIBER_CLEANED: 'fiber-cleaned',
  FIBER_CLEAVED: 'fiber-cleaved',
  FIBER_A_LOADED: 'fiber-a-loaded',
  FIBER_B_LOADED: 'fiber-b-loaded',
  FIBERS_SECURED: 'fiber-pair-secured',
  SPLICER_LID_CLOSED: 'fiber-splicer-lid-closed',
  ALIGNMENT_COMPLETE: 'fiber-alignment-complete',
  FUSION_COMPLETE: 'fiber-fusion-complete',
  SPLICE_LOSS_PASSED: 'fiber-splice-loss-passed',
  PROTECTION_SLEEVE_INSTALLED: 'fiber-protection-sleeve-installed',
  SLEEVE_HEAT_SHRUNK: 'fiber-sleeve-heat-shrunk',
  FINAL_INSPECTION_PASSED: 'fiber-final-inspection-passed',
})

const FIBER_ASSESSMENT_STAGES = Object.freeze([
  Object.freeze({
    id: FIBER_ASSESSMENT_STAGE_IDS.CABLE_SELECTED,
    label: 'Fiber cable selected',
  }),
  Object.freeze({
    id: FIBER_ASSESSMENT_STAGE_IDS.OUTER_JACKET_REMOVED,
    label: 'Outer jacket removed',
  }),
  Object.freeze({
    id: FIBER_ASSESSMENT_STAGE_IDS.COATING_REMOVED,
    label: 'Fiber coating removed',
  }),
  Object.freeze({
    id: FIBER_ASSESSMENT_STAGE_IDS.FIBER_CLEANED,
    label: 'Bare fiber cleaned',
  }),
  Object.freeze({
    id: FIBER_ASSESSMENT_STAGE_IDS.FIBER_CLEAVED,
    label: 'Fiber cleaved',
  }),
  Object.freeze({
    id: FIBER_ASSESSMENT_STAGE_IDS.FIBER_A_LOADED,
    label: 'Fiber A loaded',
  }),
  Object.freeze({
    id: FIBER_ASSESSMENT_STAGE_IDS.FIBER_B_LOADED,
    label: 'Fiber B loaded',
  }),
  Object.freeze({
    id: FIBER_ASSESSMENT_STAGE_IDS.FIBERS_SECURED,
    label: 'Fibers secured',
  }),
  Object.freeze({
    id: FIBER_ASSESSMENT_STAGE_IDS.SPLICER_LID_CLOSED,
    label: 'Splicer lid closed',
  }),
  Object.freeze({
    id: FIBER_ASSESSMENT_STAGE_IDS.ALIGNMENT_COMPLETE,
    label: 'Fiber alignment completed',
  }),
  Object.freeze({
    id: FIBER_ASSESSMENT_STAGE_IDS.FUSION_COMPLETE,
    label: 'Arc fusion completed',
  }),
  Object.freeze({
    id: FIBER_ASSESSMENT_STAGE_IDS.SPLICE_LOSS_PASSED,
    label: 'Splice loss passed',
  }),
  Object.freeze({
    id: FIBER_ASSESSMENT_STAGE_IDS.PROTECTION_SLEEVE_INSTALLED,
    label: 'Protection sleeve installed',
  }),
  Object.freeze({
    id: FIBER_ASSESSMENT_STAGE_IDS.SLEEVE_HEAT_SHRUNK,
    label: 'Sleeve heat-shrunk',
  }),
  Object.freeze({
    id: FIBER_ASSESSMENT_STAGE_IDS.FINAL_INSPECTION_PASSED,
    label: 'Final inspection passed',
  }),
])

const FIBER_ASSESSMENT_MISTAKE_TYPES = Object.freeze({
  WRONG_TOOL: 'fiber-wrong-tool',
  SEQUENCE: 'fiber-sequence-error',
  PREPARATION: 'fiber-preparation-error',
  INCORRECT_ACTION: 'fiber-incorrect-action',
  RESTART_STEP: 'fiber-restart-step',
})

const FIBER_SCORE_WEIGHTS = Object.freeze({
  FIBER_PREPARATION: 30,
  CLEAVING_LOADING: 15,
  SPLICER_SETUP_ALIGNMENT: 20,
  FUSION_QUALITY: 20,
  SPLICE_PROTECTION: 10,
  PROCEDURE_EFFICIENCY: 5,
})

const FIBER_MISTAKE_DEDUCTIONS = Object.freeze({
  WRONG_TOOL: 2,
  SEQUENCE: 3,
  PREPARATION: 2,
  INCORRECT_ACTION: 2,
  RESTART_STEP: 1,
})

const FIBER_ACCURACY_DEDUCTIONS = Object.freeze({
  WRONG_TOOL: 2,
  SEQUENCE: 4,
  PREPARATION: 2,
  INCORRECT_ACTION: 2,
  RESTART_STEP: 1,
})

const FIBER_REVIEW_STEPS = Object.freeze([
  'Select the fiber cable.',
  'Strip the outer jacket.',
  'Strip the fiber coating.',
  'Clean the bare fiber.',
  'Cleave the fiber.',
  'Load both prepared fibers.',
  'Secure the fibers with the clamps.',
  'Close the fusion splicer lid.',
  'Auto-align the fiber cores.',
  'Perform the arc fusion.',
  'Verify the splice result and estimated loss.',
  'Position the protection sleeve.',
  'Heat-shrink and cool the sleeve.',
  'Inspect the completed protected splice.',
])

const preparationStageIds = Object.freeze([
  FIBER_ASSESSMENT_STAGE_IDS.OUTER_JACKET_REMOVED,
  FIBER_ASSESSMENT_STAGE_IDS.COATING_REMOVED,
  FIBER_ASSESSMENT_STAGE_IDS.FIBER_CLEANED,
  FIBER_ASSESSMENT_STAGE_IDS.FIBER_CLEAVED,
])

const cleavingLoadingStageIds = Object.freeze([
  FIBER_ASSESSMENT_STAGE_IDS.FIBER_CLEAVED,
  FIBER_ASSESSMENT_STAGE_IDS.FIBER_A_LOADED,
  FIBER_ASSESSMENT_STAGE_IDS.FIBER_B_LOADED,
  FIBER_ASSESSMENT_STAGE_IDS.FIBERS_SECURED,
])

const alignmentStageIds = Object.freeze([
  FIBER_ASSESSMENT_STAGE_IDS.FIBER_A_LOADED,
  FIBER_ASSESSMENT_STAGE_IDS.FIBER_B_LOADED,
  FIBER_ASSESSMENT_STAGE_IDS.FIBERS_SECURED,
  FIBER_ASSESSMENT_STAGE_IDS.SPLICER_LID_CLOSED,
  FIBER_ASSESSMENT_STAGE_IDS.ALIGNMENT_COMPLETE,
])

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum)
}

function createInitialFiberAssessmentState(assessmentStartTime = null) {
  return {
    assessmentStartTime,
    assessmentEndTime: null,
    elapsedTimeMs: 0,
    mistakeCount: 0,
    wrongToolCount: 0,
    sequenceErrorCount: 0,
    preparationErrorCount: 0,
    incorrectActionCount: 0,
    restartStepCount: 0,
    hintCount: 0,
    cleaningMistakeCount: 0,
    cleavingMistakeCount: 0,
    completedProcedureStages: [],
    finalScore: null,
    performanceRating: null,
    procedureAccuracy: 100,
    scoreBreakdown: null,
    assessmentFeedback: [],
    assessmentVisible: false,
    assessmentAlignmentResult: 'PENDING',
    assessmentFusionResult: 'PENDING',
    assessmentProtectionResult: 'PENDING',
    assessmentHeaterResult: 'PENDING',
    assessmentFinalInspectionResult: 'PENDING',
    assessmentOverallResult: 'PENDING',
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
  if (elapsedTimeMs <= FIBER_EFFICIENCY_FULL_SCORE_MS) {
    return 5
  }

  if (elapsedTimeMs <= FIBER_EFFICIENCY_GOOD_SCORE_MS) {
    return 4
  }

  if (elapsedTimeMs <= FIBER_EFFICIENCY_EXTENDED_SCORE_MS) {
    return 3
  }

  return 2
}

function getCompletedStagePoints(completedProcedureStages, stageIds, maximum) {
  const completedCount = stageIds.filter((stageId) =>
    completedProcedureStages.includes(stageId),
  ).length

  return (completedCount / stageIds.length) * maximum
}

function getFusionQualityPoints({
  completedProcedureStages,
  spliceLossDb,
  spliceResult,
}) {
  if (
    spliceResult !== 'PASS' ||
    !completedProcedureStages.includes(
      FIBER_ASSESSMENT_STAGE_IDS.FUSION_COMPLETE,
    ) ||
    !Number.isFinite(spliceLossDb)
  ) {
    return 0
  }

  if (spliceLossDb <= 0.05) {
    return 20
  }

  if (spliceLossDb <= 0.1) {
    return 18
  }

  if (spliceLossDb <= 0.2) {
    return 14
  }

  if (spliceLossDb <= 0.3) {
    return 10
  }

  return 5
}

function getSpliceProtectionPoints({
  protectionSleevePositioned,
  heatingComplete,
  coolingComplete,
  protectedSpliceRemoved,
  finalInspectionPassed,
}) {
  const completedCriteria = [
    protectionSleevePositioned,
    heatingComplete,
    coolingComplete,
    protectedSpliceRemoved,
    finalInspectionPassed,
  ].filter(Boolean).length

  return (completedCriteria / 5) * FIBER_SCORE_WEIGHTS.SPLICE_PROTECTION
}

function getMistakeDeductions({
  wrongToolCount,
  sequenceErrorCount,
  preparationErrorCount,
  incorrectActionCount,
  restartStepCount,
}) {
  return (
    wrongToolCount * FIBER_MISTAKE_DEDUCTIONS.WRONG_TOOL +
    sequenceErrorCount * FIBER_MISTAKE_DEDUCTIONS.SEQUENCE +
    preparationErrorCount * FIBER_MISTAKE_DEDUCTIONS.PREPARATION +
    incorrectActionCount * FIBER_MISTAKE_DEDUCTIONS.INCORRECT_ACTION +
    restartStepCount * FIBER_MISTAKE_DEDUCTIONS.RESTART_STEP
  )
}

function calculateProcedureAccuracy({
  wrongToolCount,
  sequenceErrorCount,
  preparationErrorCount,
  incorrectActionCount,
  restartStepCount,
}) {
  const deductions =
    wrongToolCount * FIBER_ACCURACY_DEDUCTIONS.WRONG_TOOL +
    sequenceErrorCount * FIBER_ACCURACY_DEDUCTIONS.SEQUENCE +
    preparationErrorCount * FIBER_ACCURACY_DEDUCTIONS.PREPARATION +
    incorrectActionCount * FIBER_ACCURACY_DEDUCTIONS.INCORRECT_ACTION +
    restartStepCount * FIBER_ACCURACY_DEDUCTIONS.RESTART_STEP

  return clamp(100 - deductions, 0, 100)
}

function getAssessmentFeedback({
  finalScore,
  mistakeCount,
  wrongToolCount,
  sequenceErrorCount,
  cleaningMistakeCount,
  cleavingMistakeCount,
}) {
  const feedback = []

  if (finalScore >= 90) {
    feedback.push(
      'Excellent fiber preparation and fusion-splicing technique. The fibers were correctly stripped, cleaned, cleaved, aligned, fused, and protected.',
    )
  } else if (finalScore >= 70) {
    feedback.push(
      'Good work. Review the noted areas to make the fiber preparation and fusion-splicing procedure more consistent.',
    )
  } else {
    feedback.push(
      'Repeat the module to strengthen fiber preparation, tool selection, and fusion-splicing procedure sequencing.',
    )
  }

  if (cleaningMistakeCount > 0) {
    feedback.push(
      'Review bare-fiber cleaning technique. Contamination can increase splice loss and reduce splice reliability.',
    )
  }

  if (cleavingMistakeCount > 0 || sequenceErrorCount > 0) {
    feedback.push(
      'Review fiber cleaving and preparation order before attempting another fusion splice.',
    )
  }

  if (wrongToolCount > 0) {
    feedback.push(
      'Review the purpose of each fiber preparation tool before retrying.',
    )
  }

  if (mistakeCount >= 5) {
    feedback.push(
      'Repeat the module to reinforce tool selection and the correct fusion-splicing procedure sequence.',
    )
  }

  return feedback
}

function calculateFiberAssessmentResult({
  assessmentStartTime,
  assessmentEndTime,
  completedProcedureStages,
  mistakeCount,
  wrongToolCount,
  sequenceErrorCount,
  preparationErrorCount,
  incorrectActionCount,
  restartStepCount,
  cleaningMistakeCount,
  cleavingMistakeCount,
  alignmentComplete,
  fusionComplete,
  spliceLossDb,
  spliceResult,
  protectionSleevePositioned,
  heatingComplete,
  coolingComplete,
  protectedSpliceRemoved,
  finalInspectionPassed,
}) {
  const elapsedTimeMs = Math.max(
    0,
    assessmentEndTime - assessmentStartTime,
  )
  const fiberPreparation = getCompletedStagePoints(
    completedProcedureStages,
    preparationStageIds,
    FIBER_SCORE_WEIGHTS.FIBER_PREPARATION,
  )
  const cleavingLoading = getCompletedStagePoints(
    completedProcedureStages,
    cleavingLoadingStageIds,
    FIBER_SCORE_WEIGHTS.CLEAVING_LOADING,
  )
  const splicerSetupAlignment = alignmentComplete
    ? getCompletedStagePoints(
        completedProcedureStages,
        alignmentStageIds,
        FIBER_SCORE_WEIGHTS.SPLICER_SETUP_ALIGNMENT,
      )
    : 0
  const fusionQuality = getFusionQualityPoints({
    completedProcedureStages,
    spliceLossDb,
    spliceResult,
  })
  const spliceProtection = getSpliceProtectionPoints({
    protectionSleevePositioned,
    heatingComplete,
    coolingComplete,
    protectedSpliceRemoved,
    finalInspectionPassed,
  })
  const procedureEfficiency = getEfficiencyPoints(elapsedTimeMs)
  const mistakeDeductions = getMistakeDeductions({
    wrongToolCount,
    sequenceErrorCount,
    preparationErrorCount,
    incorrectActionCount,
    restartStepCount,
  })
  const scoreBreakdown = {
    fiberPreparation,
    cleavingLoading,
    splicerSetupAlignment,
    fusionQuality,
    spliceProtection,
    procedureEfficiency,
    mistakeDeductions,
  }
  const baseScore =
    fiberPreparation +
    cleavingLoading +
    splicerSetupAlignment +
    fusionQuality +
    spliceProtection +
    procedureEfficiency
  const finalScore = clamp(Math.round(baseScore - mistakeDeductions), 0, 100)
  const performanceRating = getPerformanceRating(finalScore)
  const procedureAccuracy = calculateProcedureAccuracy({
    wrongToolCount,
    sequenceErrorCount,
    preparationErrorCount,
    incorrectActionCount,
    restartStepCount,
  })
  const assessmentAlignmentResult = alignmentComplete ? 'PASS' : 'FAIL'
  const assessmentFusionResult =
    fusionComplete && spliceResult === 'PASS' ? 'PASS' : 'FAIL'
  const assessmentProtectionResult =
    protectionSleevePositioned && finalInspectionPassed ? 'PASS' : 'FAIL'
  const assessmentHeaterResult =
    heatingComplete && coolingComplete ? 'PASS' : 'FAIL'
  const assessmentFinalInspectionResult = finalInspectionPassed
    ? 'PASS'
    : 'FAIL'
  const assessmentOverallResult =
    assessmentAlignmentResult === 'PASS' &&
    assessmentFusionResult === 'PASS' &&
    assessmentProtectionResult === 'PASS' &&
    assessmentHeaterResult === 'PASS' &&
    assessmentFinalInspectionResult === 'PASS'
      ? 'PASS'
      : 'FAIL'
  const assessmentFeedback = getAssessmentFeedback({
    finalScore,
    mistakeCount,
    wrongToolCount,
    sequenceErrorCount,
    cleaningMistakeCount,
    cleavingMistakeCount,
  })

  return {
    elapsedTimeMs,
    finalScore,
    performanceRating,
    procedureAccuracy,
    scoreBreakdown,
    assessmentFeedback,
    assessmentAlignmentResult,
    assessmentFusionResult,
    assessmentProtectionResult,
    assessmentHeaterResult,
    assessmentFinalInspectionResult,
    assessmentOverallResult,
  }
}

function formatFiberAssessmentTime(elapsedTimeMs) {
  const totalSeconds = Math.max(0, Math.floor(elapsedTimeMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export {
  calculateFiberAssessmentResult,
  createInitialFiberAssessmentState,
  FIBER_ASSESSMENT_MAX_SCORE,
  FIBER_ASSESSMENT_MISTAKE_TYPES,
  FIBER_ASSESSMENT_STAGE_IDS,
  FIBER_ASSESSMENT_STAGES,
  FIBER_MISTAKE_DEDUCTIONS,
  FIBER_MISTAKE_GUARD_WINDOW_MS,
  FIBER_REVIEW_STEPS,
  FIBER_SCORE_WEIGHTS,
  formatFiberAssessmentTime,
  getPerformanceRating,
}
