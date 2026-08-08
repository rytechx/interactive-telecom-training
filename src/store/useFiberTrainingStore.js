import { create } from 'zustand'
import {
  calculateFiberAssessmentResult,
  createInitialFiberAssessmentState,
  FIBER_ASSESSMENT_MISTAKE_TYPES,
  FIBER_ASSESSMENT_STAGE_IDS,
  FIBER_ASSESSMENT_STAGES,
  FIBER_MISTAKE_GUARD_WINDOW_MS,
} from '../modules/fiber/fiberAssessment.js'
import {
  FIBER_CABLE_ID,
  FIBER_MODULE_ID,
  FIBER_PROCEDURE_STEPS,
  FIBER_SPLICE_LOSS_DB,
} from '../modules/fiber/fiberProcedure.js'
import { FIBER_TOOL_IDS } from '../modules/fiber/fiberToolConfigs.js'

const taskOneSteps = [
  FIBER_PROCEDURE_STEPS.STRIP_OUTER_JACKET,
  FIBER_PROCEDURE_STEPS.STRIPPING_OUTER_JACKET,
  FIBER_PROCEDURE_STEPS.OUTER_JACKET_REMOVED,
  FIBER_PROCEDURE_STEPS.TASK_1_COMPLETE,
]

const coatingSteps = [
  FIBER_PROCEDURE_STEPS.STRIP_FIBER_COATING,
  FIBER_PROCEDURE_STEPS.STRIPPING_FIBER_COATING,
  FIBER_PROCEDURE_STEPS.COATING_REMOVED,
]

const cleaningSteps = [
  FIBER_PROCEDURE_STEPS.CLEAN_BARE_FIBER,
  FIBER_PROCEDURE_STEPS.CLEANING_FIBER,
  FIBER_PROCEDURE_STEPS.FIBER_CLEANED,
]

const cleavingSteps = [
  FIBER_PROCEDURE_STEPS.POSITION_FIBER_IN_CLEAVER,
  FIBER_PROCEDURE_STEPS.POSITIONING_FIBER_IN_CLEAVER,
  FIBER_PROCEDURE_STEPS.FIBER_POSITIONED_FOR_CLEAVE,
  FIBER_PROCEDURE_STEPS.CLEAVE_FIBER,
  FIBER_PROCEDURE_STEPS.CLEAVING_FIBER,
  FIBER_PROCEDURE_STEPS.FIBER_CLEAVED,
  FIBER_PROCEDURE_STEPS.TASK_2_COMPLETE,
]

const fiberALoadingSteps = [
  FIBER_PROCEDURE_STEPS.LOAD_FIBER_A,
  FIBER_PROCEDURE_STEPS.LOADING_FIBER_A,
  FIBER_PROCEDURE_STEPS.FIBER_A_LOADED,
]

const fiberBLoadingSteps = [
  FIBER_PROCEDURE_STEPS.LOAD_FIBER_B,
  FIBER_PROCEDURE_STEPS.LOADING_FIBER_B,
  FIBER_PROCEDURE_STEPS.FIBER_B_LOADED,
]

const clampingSteps = [
  FIBER_PROCEDURE_STEPS.CLOSE_CLAMPS,
  FIBER_PROCEDURE_STEPS.CLOSING_CLAMPS,
  FIBER_PROCEDURE_STEPS.FIBERS_SECURED,
]

const lidClosingSteps = [
  FIBER_PROCEDURE_STEPS.CLOSE_SPLICER_LID,
  FIBER_PROCEDURE_STEPS.CLOSING_SPLICER_LID,
  FIBER_PROCEDURE_STEPS.LID_CLOSED,
]

const alignmentSteps = [
  FIBER_PROCEDURE_STEPS.AUTO_ALIGNMENT,
  FIBER_PROCEDURE_STEPS.ALIGNING,
  FIBER_PROCEDURE_STEPS.ALIGNMENT_COMPLETE,
  FIBER_PROCEDURE_STEPS.READY_TO_FUSE,
]

const fusionSteps = [
  FIBER_PROCEDURE_STEPS.FUSING,
  FIBER_PROCEDURE_STEPS.FUSION_COMPLETE,
  FIBER_PROCEDURE_STEPS.SPLICE_RESULT,
]

const lidOpeningSteps = [
  FIBER_PROCEDURE_STEPS.OPEN_SPLICER_LID,
  FIBER_PROCEDURE_STEPS.OPENING_SPLICER_LID,
]

const clampReleaseSteps = [
  FIBER_PROCEDURE_STEPS.RELEASE_CLAMPS,
  FIBER_PROCEDURE_STEPS.RELEASING_CLAMPS,
]

const fusedFiberRemovalSteps = [
  FIBER_PROCEDURE_STEPS.REMOVE_FUSED_FIBER,
  FIBER_PROCEDURE_STEPS.REMOVING_FUSED_FIBER,
  FIBER_PROCEDURE_STEPS.TASK_3_COMPLETE,
]

const sleevePositioningSteps = [
  FIBER_PROCEDURE_STEPS.SELECT_PROTECTION_SLEEVE,
  FIBER_PROCEDURE_STEPS.POSITION_PROTECTION_SLEEVE,
  FIBER_PROCEDURE_STEPS.POSITIONING_PROTECTION_SLEEVE,
  FIBER_PROCEDURE_STEPS.PROTECTION_SLEEVE_POSITIONED,
]

const heaterPositioningSteps = [
  FIBER_PROCEDURE_STEPS.PLACE_IN_HEATER,
  FIBER_PROCEDURE_STEPS.POSITIONING_IN_HEATER,
  FIBER_PROCEDURE_STEPS.SPLICE_IN_HEATER,
]

const heaterClosingSteps = [
  FIBER_PROCEDURE_STEPS.CLOSE_HEATER,
  FIBER_PROCEDURE_STEPS.HEATER_CLOSED,
]

const heatingSteps = [
  FIBER_PROCEDURE_STEPS.READY_TO_HEAT,
  FIBER_PROCEDURE_STEPS.HEATING_PROTECTION_SLEEVE,
  FIBER_PROCEDURE_STEPS.COOLING_PROTECTION_SLEEVE,
  FIBER_PROCEDURE_STEPS.HEATING_COMPLETE,
]

const heaterOpeningSteps = [
  FIBER_PROCEDURE_STEPS.OPEN_HEATER,
  FIBER_PROCEDURE_STEPS.HEATER_OPEN,
]

const protectedSpliceRemovalSteps = [
  FIBER_PROCEDURE_STEPS.REMOVE_FROM_HEATER,
  FIBER_PROCEDURE_STEPS.REMOVING_FROM_HEATER,
  FIBER_PROCEDURE_STEPS.PROTECTED_SPLICE_REMOVED,
]

const finalInspectionSteps = [
  FIBER_PROCEDURE_STEPS.FINAL_INSPECTION,
  FIBER_PROCEDURE_STEPS.FIBER_MODULE_COMPLETE,
]

const protectionSteps = [
  ...sleevePositioningSteps,
  ...heaterPositioningSteps,
  ...heaterClosingSteps,
  ...heatingSteps,
  ...heaterOpeningSteps,
  ...protectedSpliceRemovalSteps,
  ...finalInspectionSteps,
]

const splicingSteps = [
  ...fiberALoadingSteps,
  ...fiberBLoadingSteps,
  ...clampingSteps,
  ...lidClosingSteps,
  ...alignmentSteps,
  ...fusionSteps,
  ...lidOpeningSteps,
  ...clampReleaseSteps,
  ...fusedFiberRemovalSteps,
  ...protectionSteps,
]

const toolSelectionRules = Object.freeze({
  [FIBER_PROCEDURE_STEPS.SELECT_JACKET_STRIPPER]: Object.freeze({
    toolId: FIBER_TOOL_IDS.JACKET_STRIPPER,
    nextStep: FIBER_PROCEDURE_STEPS.STRIP_OUTER_JACKET,
    feedback: 'Use the fiber jacket stripper to remove the outer cable jacket.',
  }),
  [FIBER_PROCEDURE_STEPS.SELECT_PRECISION_STRIPPER]: Object.freeze({
    toolId: FIBER_TOOL_IDS.PRECISION_STRIPPER,
    nextStep: FIBER_PROCEDURE_STEPS.STRIP_FIBER_COATING,
    feedback: 'Use the precision fiber stripper to remove the fiber coating.',
  }),
  [FIBER_PROCEDURE_STEPS.SELECT_CLEANING_TOOL]: Object.freeze({
    toolId: FIBER_TOOL_IDS.CLEANING_PAD,
    nextStep: FIBER_PROCEDURE_STEPS.CLEAN_BARE_FIBER,
    feedback: 'Use the lint-free fiber cleaning wipe to clean the bare fiber.',
    successFeedback: 'Cleaning wipe selected.',
  }),
  [FIBER_PROCEDURE_STEPS.SELECT_FIBER_CLEAVER]: Object.freeze({
    toolId: FIBER_TOOL_IDS.CLEAVER,
    nextStep: FIBER_PROCEDURE_STEPS.POSITION_FIBER_IN_CLEAVER,
    feedback: 'Use the fiber cleaver to create a clean, square fiber end.',
  }),
})

function createInitialSplicerState() {
  return {
    fiberBPrepared: false,
    fiberALoaded: false,
    fiberBLoaded: false,
    fiberClampsClosed: false,
    splicerLidClosed: false,
    alignmentStarted: false,
    alignmentComplete: false,
    fusionComplete: false,
    spliceLossDb: null,
    spliceResult: null,
    fusedFiberRemoved: false,
    protectionSleeveSelected: false,
    protectionSleevePositioned: false,
    spliceInHeater: false,
    heaterClosed: false,
    heaterActive: false,
    heatingComplete: false,
    coolingComplete: false,
    protectedSpliceRemoved: false,
    finalInspectionPassed: false,
    fiberModuleCompleted: false,
  }
}

function createInitialFiberState() {
  return {
    activeModuleId: null,
    currentStep: FIBER_PROCEDURE_STEPS.NOT_STARTED,
    trainingStarted: false,
    selectedWorkpieceId: null,
    procedureFeedback: null,
    isProcedureAnimating: false,
    completedSteps: [],
    outerJacketRemoved: false,
    coatingRemoved: false,
    bareFiberExposed: false,
    fiberCleaned: false,
    fiberPositionedInCleaver: false,
    fiberCleaved: false,
    fiberPreparationComplete: false,
    ...createInitialSplicerState(),
    ...createInitialFiberAssessmentState(),
  }
}

function createStartedFiberState() {
  return {
    ...createInitialFiberState(),
    ...createInitialFiberAssessmentState(Date.now()),
    activeModuleId: FIBER_MODULE_ID,
    currentStep: FIBER_PROCEDURE_STEPS.SELECT_FIBER_CABLE,
    trainingStarted: true,
  }
}

function addCompletedSteps(completedSteps, ...stepIds) {
  return [...new Set([...completedSteps, ...stepIds])]
}

function removeCompletedSteps(completedSteps, stepIds) {
  return completedSteps.filter((stepId) => !stepIds.includes(stepId))
}

function addCompletedProcedureStages(completedProcedureStages, ...stageIds) {
  return [...new Set([...completedProcedureStages, ...stageIds])]
}

function createFiberMistakeUpdate(
  state,
  mistakeType,
  signature = mistakeType,
  recordedAt = Date.now(),
) {
  if (
    !state.assessmentStartTime ||
    (state.assessmentEndTime &&
      mistakeType !== FIBER_ASSESSMENT_MISTAKE_TYPES.RESTART_STEP) ||
    state.assessmentVisible ||
    (state.lastMistakeSignature === signature &&
      recordedAt - state.lastMistakeRecordedAt <
        FIBER_MISTAKE_GUARD_WINDOW_MS)
  ) {
    return {}
  }

  const update = {
    mistakeCount: state.mistakeCount + 1,
    lastMistakeSignature: signature,
    lastMistakeRecordedAt: recordedAt,
  }

  if (mistakeType === FIBER_ASSESSMENT_MISTAKE_TYPES.WRONG_TOOL) {
    update.wrongToolCount = state.wrongToolCount + 1
  } else if (mistakeType === FIBER_ASSESSMENT_MISTAKE_TYPES.SEQUENCE) {
    update.sequenceErrorCount = state.sequenceErrorCount + 1
  } else if (mistakeType === FIBER_ASSESSMENT_MISTAKE_TYPES.PREPARATION) {
    update.preparationErrorCount = state.preparationErrorCount + 1
  } else if (
    mistakeType === FIBER_ASSESSMENT_MISTAKE_TYPES.INCORRECT_ACTION
  ) {
    update.incorrectActionCount = state.incorrectActionCount + 1
  } else if (mistakeType === FIBER_ASSESSMENT_MISTAKE_TYPES.RESTART_STEP) {
    update.restartStepCount = state.restartStepCount + 1
  }

  const normalizedSignature = String(signature).toLowerCase()

  if (normalizedSignature.includes('clean')) {
    update.cleaningMistakeCount = state.cleaningMistakeCount + 1
  }

  if (
    normalizedSignature.includes('cleav') ||
    normalizedSignature.includes('load-fiber')
  ) {
    update.cleavingMistakeCount = state.cleavingMistakeCount + 1
  }

  return update
}

function createFiberErrorUpdate(
  state,
  mistakeType,
  signature,
  procedureFeedback,
) {
  return {
    ...createFiberMistakeUpdate(state, mistakeType, signature),
    procedureFeedback,
  }
}

function createFiberAssessmentCompletionUpdate(
  state,
  completedProcedureStages,
  assessmentEndTime = Date.now(),
) {
  return {
    assessmentEndTime,
    ...calculateFiberAssessmentResult({
      ...state,
      finalInspectionPassed: true,
      completedProcedureStages,
      assessmentEndTime,
    }),
  }
}

function createReopenedFiberAssessmentState(state) {
  return {
    assessmentEndTime: null,
    elapsedTimeMs: 0,
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
    completedProcedureStages: state.completedProcedureStages.filter(
      (stageId) =>
        stageId !== FIBER_ASSESSMENT_STAGE_IDS.FINAL_INSPECTION_PASSED,
    ),
  }
}

function createCompletedFusionState(state) {
  return {
    ...createInitialSplicerState(),
    fiberBPrepared: true,
    fiberALoaded: true,
    fiberBLoaded: true,
    alignmentStarted: true,
    alignmentComplete: true,
    fusionComplete: true,
    spliceLossDb: state.spliceLossDb ?? FIBER_SPLICE_LOSS_DB,
    spliceResult: state.spliceResult ?? 'PASS',
    fusedFiberRemoved: true,
  }
}

const useFiberTrainingStore = create((set) => ({
  ...createInitialFiberState(),

  startFiberAssessment: () =>
    set((state) =>
      state.trainingStarted && !state.assessmentStartTime
        ? createInitialFiberAssessmentState(Date.now())
        : {},
    ),
  recordFiberMistake: (mistakeType, signature) => {
    set((state) => createFiberMistakeUpdate(state, mistakeType, signature))
  },
  recordFiberWrongTool: (toolId) => {
    set((state) =>
      createFiberMistakeUpdate(
        state,
        FIBER_ASSESSMENT_MISTAKE_TYPES.WRONG_TOOL,
        `wrong-tool:${state.currentStep}:${toolId}`,
      ),
    )
  },
  recordFiberSequenceError: (signature = 'manual-sequence-error') => {
    set((state) =>
      createFiberMistakeUpdate(
        state,
        FIBER_ASSESSMENT_MISTAKE_TYPES.SEQUENCE,
        signature,
      ),
    )
  },
  recordFiberPreparationError: (signature = 'manual-preparation-error') => {
    set((state) =>
      createFiberMistakeUpdate(
        state,
        FIBER_ASSESSMENT_MISTAKE_TYPES.PREPARATION,
        signature,
      ),
    )
  },
  recordFiberIncorrectAction: (signature = 'manual-incorrect-action') => {
    set((state) =>
      createFiberMistakeUpdate(
        state,
        FIBER_ASSESSMENT_MISTAKE_TYPES.INCORRECT_ACTION,
        signature,
      ),
    )
  },
  recordFiberRestartStep: () => {
    set((state) =>
      createFiberMistakeUpdate(
        state,
        FIBER_ASSESSMENT_MISTAKE_TYPES.RESTART_STEP,
        `restart-step:${state.currentStep}`,
      ),
    )
  },
  completeFiberStage: (stageId) => {
    set((state) =>
      FIBER_ASSESSMENT_STAGES.some((stage) => stage.id === stageId)
        ? {
            completedProcedureStages: addCompletedProcedureStages(
              state.completedProcedureStages,
              stageId,
            ),
          }
        : {},
    )
  },
  completeFiberAssessment: () => {
    set((state) => {
      if (
        !state.assessmentStartTime ||
        state.assessmentEndTime ||
        !state.finalInspectionPassed
      ) {
        return {}
      }

      return createFiberAssessmentCompletionUpdate(
        state,
        state.completedProcedureStages,
      )
    })
  },
  resetFiberAssessment: () => set(createInitialFiberAssessmentState()),
  openFiberAssessment: () => {
    set((state) =>
      state.finalInspectionPassed && Number.isFinite(state.finalScore)
        ? { assessmentVisible: true }
        : {},
    )
  },
  beginFiberTraining: () => set(createStartedFiberState()),
  selectFiberCable: (workpieceId) => {
    set((state) => {
      if (
        state.activeModuleId === FIBER_MODULE_ID &&
        state.trainingStarted &&
        state.currentStep === FIBER_PROCEDURE_STEPS.SELECT_FIBER_CABLE &&
        workpieceId !== FIBER_CABLE_ID &&
        !state.isProcedureAnimating
      ) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.INCORRECT_ACTION,
          `select-fiber-cable:${workpieceId}`,
          'Select the fiber optic cable to begin preparation.',
        )
      }

      if (
        state.activeModuleId !== FIBER_MODULE_ID ||
        !state.trainingStarted ||
        state.currentStep !== FIBER_PROCEDURE_STEPS.SELECT_FIBER_CABLE ||
        workpieceId !== FIBER_CABLE_ID ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      return {
        selectedWorkpieceId: workpieceId,
        currentStep: FIBER_PROCEDURE_STEPS.SELECT_JACKET_STRIPPER,
        procedureFeedback: null,
        completedSteps: addCompletedSteps(
          state.completedSteps,
          FIBER_PROCEDURE_STEPS.SELECT_FIBER_CABLE,
        ),
        completedProcedureStages: addCompletedProcedureStages(
          state.completedProcedureStages,
          FIBER_ASSESSMENT_STAGE_IDS.CABLE_SELECTED,
        ),
      }
    })
  },
  handleFiberToolActivated: (toolId) => {
    set((state) => {
      if (
        state.activeModuleId !== FIBER_MODULE_ID ||
        !state.trainingStarted ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      const rule = toolSelectionRules[state.currentStep]

      if (!rule) {
        return {}
      }

      if (toolId !== rule.toolId) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.WRONG_TOOL,
          `wrong-tool:${state.currentStep}:${toolId}`,
          rule.feedback,
        )
      }

      return {
        currentStep: rule.nextStep,
        procedureFeedback: rule.successFeedback ?? null,
        completedSteps: addCompletedSteps(
          state.completedSteps,
          state.currentStep,
        ),
      }
    })
  },
  continueFiberProcedure: () => {
    set((state) => {
      if (state.isProcedureAnimating) {
        return {}
      }

      if (state.currentStep === FIBER_PROCEDURE_STEPS.TASK_1_COMPLETE) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.SELECT_PRECISION_STRIPPER,
          procedureFeedback: null,
        }
      }

      if (state.currentStep === FIBER_PROCEDURE_STEPS.COATING_REMOVED) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.SELECT_CLEANING_TOOL,
          procedureFeedback: null,
        }
      }

      if (state.currentStep === FIBER_PROCEDURE_STEPS.FIBER_CLEANED) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.SELECT_FIBER_CLEAVER,
          procedureFeedback: null,
        }
      }

      if (state.currentStep === FIBER_PROCEDURE_STEPS.TASK_2_COMPLETE) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.LOAD_FIBER_A,
          procedureFeedback: null,
          fiberBPrepared: true,
        }
      }

      if (state.currentStep === FIBER_PROCEDURE_STEPS.TASK_3_COMPLETE) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.SELECT_PROTECTION_SLEEVE,
          procedureFeedback: null,
        }
      }

      return {}
    })
  },
  startOuterJacketStripping: (toolId) => {
    set((state) => {
      if (
        state.currentStep === FIBER_PROCEDURE_STEPS.STRIP_OUTER_JACKET &&
        !state.isProcedureAnimating &&
        toolId !== FIBER_TOOL_IDS.JACKET_STRIPPER
      ) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.WRONG_TOOL,
          `wrong-tool:strip-outer-jacket:${toolId}`,
          'Use the fiber jacket stripper to remove the outer cable jacket.',
        )
      }

      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.STRIP_OUTER_JACKET ||
        state.selectedWorkpieceId !== FIBER_CABLE_ID ||
        toolId !== FIBER_TOOL_IDS.JACKET_STRIPPER ||
        state.isProcedureAnimating ||
        state.outerJacketRemoved
      ) {
        return {}
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.STRIPPING_OUTER_JACKET,
        procedureFeedback: null,
        isProcedureAnimating: true,
      }
    })
  },
  completeOuterJacketStripping: () => {
    set((state) =>
      state.currentStep === FIBER_PROCEDURE_STEPS.STRIPPING_OUTER_JACKET &&
      state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.TASK_1_COMPLETE,
            procedureFeedback: 'Outer jacket removed successfully.',
            isProcedureAnimating: false,
            outerJacketRemoved: true,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.STRIP_OUTER_JACKET,
              FIBER_PROCEDURE_STEPS.STRIPPING_OUTER_JACKET,
              FIBER_PROCEDURE_STEPS.OUTER_JACKET_REMOVED,
              FIBER_PROCEDURE_STEPS.TASK_1_COMPLETE,
            ),
            completedProcedureStages: addCompletedProcedureStages(
              state.completedProcedureStages,
              FIBER_ASSESSMENT_STAGE_IDS.OUTER_JACKET_REMOVED,
            ),
          }
        : {},
    )
  },
  startFiberCoatingStripping: (toolId) => {
    set((state) => {
      if (
        state.currentStep === FIBER_PROCEDURE_STEPS.STRIP_FIBER_COATING &&
        !state.outerJacketRemoved &&
        !state.isProcedureAnimating
      ) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.SEQUENCE,
          'sequence:strip-coating-before-jacket',
          'Remove the outer jacket before stripping the fiber coating.',
        )
      }

      if (
        state.currentStep === FIBER_PROCEDURE_STEPS.STRIP_FIBER_COATING &&
        !state.isProcedureAnimating &&
        toolId !== FIBER_TOOL_IDS.PRECISION_STRIPPER
      ) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.WRONG_TOOL,
          `wrong-tool:strip-fiber-coating:${toolId}`,
          'Use the precision fiber stripper to remove the fiber coating.',
        )
      }

      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.STRIP_FIBER_COATING ||
        !state.outerJacketRemoved ||
        toolId !== FIBER_TOOL_IDS.PRECISION_STRIPPER ||
        state.isProcedureAnimating ||
        state.coatingRemoved
      ) {
        return {}
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.STRIPPING_FIBER_COATING,
        procedureFeedback: null,
        isProcedureAnimating: true,
      }
    })
  },
  completeFiberCoatingStripping: () => {
    set((state) =>
      state.currentStep === FIBER_PROCEDURE_STEPS.STRIPPING_FIBER_COATING &&
      state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.COATING_REMOVED,
            procedureFeedback: 'Fiber coating removed successfully.',
            isProcedureAnimating: false,
            coatingRemoved: true,
            bareFiberExposed: true,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.STRIP_FIBER_COATING,
              FIBER_PROCEDURE_STEPS.STRIPPING_FIBER_COATING,
              FIBER_PROCEDURE_STEPS.COATING_REMOVED,
            ),
            completedProcedureStages: addCompletedProcedureStages(
              state.completedProcedureStages,
              FIBER_ASSESSMENT_STAGE_IDS.COATING_REMOVED,
            ),
          }
        : {},
    )
  },
  startFiberCleaning: (toolId) => {
    set((state) => {
      if (
        state.currentStep === FIBER_PROCEDURE_STEPS.CLEAN_BARE_FIBER &&
        (!state.coatingRemoved || !state.bareFiberExposed) &&
        !state.isProcedureAnimating
      ) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.SEQUENCE,
          'sequence:clean-before-coating-removal',
          'Expose the bare fiber before cleaning it.',
        )
      }

      if (
        state.currentStep === FIBER_PROCEDURE_STEPS.CLEAN_BARE_FIBER &&
        !state.isProcedureAnimating &&
        toolId !== FIBER_TOOL_IDS.CLEANING_PAD
      ) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.WRONG_TOOL,
          `wrong-tool:clean-fiber:${toolId}`,
          'Use the lint-free fiber cleaning wipe to clean the bare fiber.',
        )
      }

      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.CLEAN_BARE_FIBER ||
        !state.coatingRemoved ||
        !state.bareFiberExposed ||
        toolId !== FIBER_TOOL_IDS.CLEANING_PAD ||
        state.isProcedureAnimating ||
        state.fiberCleaned
      ) {
        return {}
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.CLEANING_FIBER,
        procedureFeedback: null,
        isProcedureAnimating: true,
      }
    })
  },
  completeFiberCleaning: () => {
    set((state) =>
      state.currentStep === FIBER_PROCEDURE_STEPS.CLEANING_FIBER &&
      state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.FIBER_CLEANED,
            procedureFeedback: 'Bare fiber cleaned successfully.',
            isProcedureAnimating: false,
            fiberCleaned: true,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.CLEAN_BARE_FIBER,
              FIBER_PROCEDURE_STEPS.CLEANING_FIBER,
              FIBER_PROCEDURE_STEPS.FIBER_CLEANED,
            ),
            completedProcedureStages: addCompletedProcedureStages(
              state.completedProcedureStages,
              FIBER_ASSESSMENT_STAGE_IDS.FIBER_CLEANED,
            ),
          }
        : {},
    )
  },
  startFiberPositioning: (toolId) => {
    set((state) => {
      if (
        state.currentStep ===
          FIBER_PROCEDURE_STEPS.POSITION_FIBER_IN_CLEAVER &&
        !state.fiberCleaned &&
        !state.isProcedureAnimating
      ) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.SEQUENCE,
          'sequence:position-unclean-fiber-in-cleaver',
          'Clean the bare fiber before positioning it in the cleaver.',
        )
      }

      if (
        state.currentStep ===
          FIBER_PROCEDURE_STEPS.POSITION_FIBER_IN_CLEAVER &&
        !state.isProcedureAnimating &&
        toolId !== FIBER_TOOL_IDS.CLEAVER
      ) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.WRONG_TOOL,
          `wrong-tool:position-fiber-in-cleaver:${toolId}`,
          'Use the fiber cleaver for precise fiber positioning.',
        )
      }

      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.POSITION_FIBER_IN_CLEAVER ||
        !state.fiberCleaned ||
        toolId !== FIBER_TOOL_IDS.CLEAVER ||
        state.isProcedureAnimating ||
        state.fiberPositionedInCleaver
      ) {
        return {}
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.POSITIONING_FIBER_IN_CLEAVER,
        procedureFeedback: null,
        isProcedureAnimating: true,
      }
    })
  },
  completeFiberPositioning: () => {
    set((state) =>
      state.currentStep === FIBER_PROCEDURE_STEPS.POSITIONING_FIBER_IN_CLEAVER &&
      state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.FIBER_POSITIONED_FOR_CLEAVE,
            procedureFeedback: 'Fiber positioned at the correct cleave length.',
            isProcedureAnimating: false,
            fiberPositionedInCleaver: true,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.POSITION_FIBER_IN_CLEAVER,
              FIBER_PROCEDURE_STEPS.POSITIONING_FIBER_IN_CLEAVER,
              FIBER_PROCEDURE_STEPS.FIBER_POSITIONED_FOR_CLEAVE,
            ),
          }
        : {},
    )
  },
  startFiberCleaving: (toolId) => {
    set((state) => {
      if (
        state.currentStep ===
          FIBER_PROCEDURE_STEPS.FIBER_POSITIONED_FOR_CLEAVE &&
        (!state.fiberCleaned || !state.fiberPositionedInCleaver) &&
        !state.isProcedureAnimating
      ) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.PREPARATION,
          'preparation:cleave-fiber-not-ready',
          'Clean and position the fiber in the cleaver first.',
        )
      }

      if (
        state.currentStep ===
          FIBER_PROCEDURE_STEPS.FIBER_POSITIONED_FOR_CLEAVE &&
        !state.isProcedureAnimating &&
        toolId !== FIBER_TOOL_IDS.CLEAVER
      ) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.WRONG_TOOL,
          `wrong-tool:cleave-fiber:${toolId}`,
          'Use the fiber cleaver to make a square end face.',
        )
      }

      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.FIBER_POSITIONED_FOR_CLEAVE ||
        !state.fiberCleaned ||
        !state.fiberPositionedInCleaver ||
        toolId !== FIBER_TOOL_IDS.CLEAVER ||
        state.isProcedureAnimating ||
        state.fiberCleaved
      ) {
        return {
          procedureFeedback: !state.fiberPositionedInCleaver
            ? 'Position the fiber in the cleaver first.'
            : state.procedureFeedback,
        }
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.CLEAVING_FIBER,
        procedureFeedback: null,
        isProcedureAnimating: true,
      }
    })
  },
  completeFiberCleaving: () => {
    set((state) =>
      state.currentStep === FIBER_PROCEDURE_STEPS.CLEAVING_FIBER &&
      state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.TASK_2_COMPLETE,
            procedureFeedback: 'Fiber cleaved successfully.',
            isProcedureAnimating: false,
            fiberCleaved: true,
            fiberPreparationComplete: true,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.CLEAVE_FIBER,
              FIBER_PROCEDURE_STEPS.CLEAVING_FIBER,
              FIBER_PROCEDURE_STEPS.FIBER_CLEAVED,
              FIBER_PROCEDURE_STEPS.TASK_2_COMPLETE,
            ),
            completedProcedureStages: addCompletedProcedureStages(
              state.completedProcedureStages,
              FIBER_ASSESSMENT_STAGE_IDS.FIBER_CLEAVED,
            ),
          }
        : {},
    )
  },
  startFiberALoading: () => {
    set((state) => {
      if (
        state.currentStep === FIBER_PROCEDURE_STEPS.LOAD_FIBER_A &&
        (!state.fiberPreparationComplete || !state.fiberBPrepared) &&
        !state.isProcedureAnimating
      ) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.PREPARATION,
          'preparation:load-fiber-a-before-preparation',
          'Prepare both fibers before loading Fiber A into the splicer.',
        )
      }

      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.LOAD_FIBER_A ||
        !state.fiberPreparationComplete ||
        !state.fiberBPrepared ||
        state.fiberALoaded ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.LOADING_FIBER_A,
        procedureFeedback: null,
        isProcedureAnimating: true,
      }
    })
  },
  completeFiberALoading: () => {
    set((state) =>
      state.currentStep === FIBER_PROCEDURE_STEPS.LOADING_FIBER_A &&
      state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.LOAD_FIBER_B,
            procedureFeedback: 'Fiber A loaded.',
            isProcedureAnimating: false,
            fiberALoaded: true,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.LOAD_FIBER_A,
              FIBER_PROCEDURE_STEPS.LOADING_FIBER_A,
              FIBER_PROCEDURE_STEPS.FIBER_A_LOADED,
            ),
            completedProcedureStages: addCompletedProcedureStages(
              state.completedProcedureStages,
              FIBER_ASSESSMENT_STAGE_IDS.FIBER_A_LOADED,
            ),
          }
        : {},
    )
  },
  startFiberBLoading: () => {
    set((state) => {
      if (
        state.currentStep === FIBER_PROCEDURE_STEPS.LOAD_FIBER_B &&
        (!state.fiberALoaded || !state.fiberBPrepared) &&
        !state.isProcedureAnimating
      ) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.PREPARATION,
          'preparation:load-fiber-b-before-fiber-a',
          'Load the prepared Fiber A before loading Fiber B.',
        )
      }

      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.LOAD_FIBER_B ||
        !state.fiberALoaded ||
        !state.fiberBPrepared ||
        state.fiberBLoaded ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.LOADING_FIBER_B,
        procedureFeedback: null,
        isProcedureAnimating: true,
      }
    })
  },
  completeFiberBLoading: () => {
    set((state) =>
      state.currentStep === FIBER_PROCEDURE_STEPS.LOADING_FIBER_B &&
      state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.CLOSE_CLAMPS,
            procedureFeedback: 'Fiber B loaded.',
            isProcedureAnimating: false,
            fiberBLoaded: true,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.LOAD_FIBER_B,
              FIBER_PROCEDURE_STEPS.LOADING_FIBER_B,
              FIBER_PROCEDURE_STEPS.FIBER_B_LOADED,
            ),
            completedProcedureStages: addCompletedProcedureStages(
              state.completedProcedureStages,
              FIBER_ASSESSMENT_STAGE_IDS.FIBER_B_LOADED,
            ),
          }
        : {},
    )
  },
  startSplicerClamping: () => {
    set((state) => {
      if (
        state.currentStep === FIBER_PROCEDURE_STEPS.CLOSE_CLAMPS &&
        (!state.fiberALoaded || !state.fiberBLoaded) &&
        !state.isProcedureAnimating
      ) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.PREPARATION,
          'preparation:clamp-before-loading-both-fibers',
          'Load both fibers before closing the splicer clamps.',
        )
      }

      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.CLOSE_CLAMPS ||
        !state.fiberALoaded ||
        !state.fiberBLoaded ||
        state.fiberClampsClosed ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.CLOSING_CLAMPS,
        procedureFeedback: null,
        isProcedureAnimating: true,
      }
    })
  },
  completeSplicerClamping: () => {
    set((state) =>
      state.currentStep === FIBER_PROCEDURE_STEPS.CLOSING_CLAMPS &&
      state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.CLOSE_SPLICER_LID,
            procedureFeedback: 'Fibers secured.',
            isProcedureAnimating: false,
            fiberClampsClosed: true,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.CLOSE_CLAMPS,
              FIBER_PROCEDURE_STEPS.CLOSING_CLAMPS,
              FIBER_PROCEDURE_STEPS.FIBERS_SECURED,
            ),
            completedProcedureStages: addCompletedProcedureStages(
              state.completedProcedureStages,
              FIBER_ASSESSMENT_STAGE_IDS.FIBERS_SECURED,
            ),
          }
        : {},
    )
  },
  startSplicerLidClosing: () => {
    set((state) => {
      if (
        state.currentStep === FIBER_PROCEDURE_STEPS.CLOSE_SPLICER_LID &&
        !state.fiberClampsClosed &&
        !state.isProcedureAnimating
      ) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.SEQUENCE,
          'sequence:close-lid-before-clamps',
          'Close the fiber clamps before closing the splicer lid.',
        )
      }

      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.CLOSE_SPLICER_LID ||
        !state.fiberClampsClosed ||
        state.splicerLidClosed ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.CLOSING_SPLICER_LID,
        procedureFeedback: null,
        isProcedureAnimating: true,
      }
    })
  },
  completeSplicerLidClosing: () => {
    set((state) =>
      state.currentStep === FIBER_PROCEDURE_STEPS.CLOSING_SPLICER_LID &&
      state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.AUTO_ALIGNMENT,
            procedureFeedback: 'Splicer lid closed.',
            isProcedureAnimating: false,
            splicerLidClosed: true,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.CLOSE_SPLICER_LID,
              FIBER_PROCEDURE_STEPS.CLOSING_SPLICER_LID,
              FIBER_PROCEDURE_STEPS.LID_CLOSED,
            ),
            completedProcedureStages: addCompletedProcedureStages(
              state.completedProcedureStages,
              FIBER_ASSESSMENT_STAGE_IDS.SPLICER_LID_CLOSED,
            ),
          }
        : {},
    )
  },
  startFiberAlignment: () => {
    set((state) => {
      const prerequisitesMet =
        state.fiberALoaded &&
        state.fiberBLoaded &&
        state.fiberClampsClosed &&
        state.splicerLidClosed &&
        state.fiberCleaned &&
        state.fiberCleaved &&
        state.fiberBPrepared

      if (state.currentStep !== FIBER_PROCEDURE_STEPS.AUTO_ALIGNMENT) {
        return {}
      }

      if (!prerequisitesMet) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.SEQUENCE,
          'sequence:alignment-before-fibers-secured',
          'Load and secure both prepared fibers before alignment.',
        )
      }

      if (state.alignmentStarted || state.isProcedureAnimating) {
        return {}
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.ALIGNING,
        procedureFeedback: 'Analyzing fiber cores...',
        isProcedureAnimating: true,
        alignmentStarted: true,
      }
    })
  },
  completeFiberAlignment: () => {
    set((state) =>
      state.currentStep === FIBER_PROCEDURE_STEPS.ALIGNING &&
      state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.READY_TO_FUSE,
            procedureFeedback: 'Alignment complete. Ready for fusion.',
            isProcedureAnimating: false,
            alignmentComplete: true,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.AUTO_ALIGNMENT,
              FIBER_PROCEDURE_STEPS.ALIGNING,
              FIBER_PROCEDURE_STEPS.ALIGNMENT_COMPLETE,
            ),
            completedProcedureStages: addCompletedProcedureStages(
              state.completedProcedureStages,
              FIBER_ASSESSMENT_STAGE_IDS.ALIGNMENT_COMPLETE,
            ),
          }
        : {},
    )
  },
  startFiberFusion: () => {
    set((state) => {
      const prerequisitesMet =
        state.fiberALoaded &&
        state.fiberBLoaded &&
        state.fiberClampsClosed &&
        state.splicerLidClosed &&
        state.fiberCleaned &&
        state.fiberCleaved &&
        state.fiberBPrepared &&
        state.alignmentComplete

      if (state.currentStep !== FIBER_PROCEDURE_STEPS.READY_TO_FUSE) {
        return {}
      }

      if (!prerequisitesMet) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.SEQUENCE,
          'sequence:fusion-before-alignment',
          'Complete fiber alignment before starting fusion.',
        )
      }

      if (state.fusionComplete || state.isProcedureAnimating) {
        return {}
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.FUSING,
        procedureFeedback: null,
        isProcedureAnimating: true,
      }
    })
  },
  completeFiberFusion: () => {
    set((state) =>
      state.currentStep === FIBER_PROCEDURE_STEPS.FUSING &&
      state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.OPEN_SPLICER_LID,
            procedureFeedback: 'Splice result: PASS. Estimated loss: 0.03 dB.',
            isProcedureAnimating: false,
            fusionComplete: true,
            spliceLossDb: FIBER_SPLICE_LOSS_DB,
            spliceResult: 'PASS',
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.READY_TO_FUSE,
              FIBER_PROCEDURE_STEPS.FUSING,
              FIBER_PROCEDURE_STEPS.FUSION_COMPLETE,
              FIBER_PROCEDURE_STEPS.SPLICE_RESULT,
            ),
            completedProcedureStages: addCompletedProcedureStages(
              state.completedProcedureStages,
              FIBER_ASSESSMENT_STAGE_IDS.FUSION_COMPLETE,
              FIBER_ASSESSMENT_STAGE_IDS.SPLICE_LOSS_PASSED,
            ),
          }
        : {},
    )
  },
  startSplicerLidOpening: () => {
    set((state) => {
      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.OPEN_SPLICER_LID ||
        !state.fusionComplete ||
        !state.splicerLidClosed ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.OPENING_SPLICER_LID,
        procedureFeedback: null,
        isProcedureAnimating: true,
      }
    })
  },
  completeSplicerLidOpening: () => {
    set((state) =>
      state.currentStep === FIBER_PROCEDURE_STEPS.OPENING_SPLICER_LID &&
      state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.RELEASE_CLAMPS,
            procedureFeedback: 'Splicer lid opened.',
            isProcedureAnimating: false,
            splicerLidClosed: false,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.OPEN_SPLICER_LID,
              FIBER_PROCEDURE_STEPS.OPENING_SPLICER_LID,
            ),
          }
        : {},
    )
  },
  startClampRelease: () => {
    set((state) => {
      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.RELEASE_CLAMPS ||
        state.splicerLidClosed ||
        !state.fiberClampsClosed ||
        !state.fusionComplete ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.RELEASING_CLAMPS,
        procedureFeedback: null,
        isProcedureAnimating: true,
      }
    })
  },
  completeClampRelease: () => {
    set((state) =>
      state.currentStep === FIBER_PROCEDURE_STEPS.RELEASING_CLAMPS &&
      state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.REMOVE_FUSED_FIBER,
            procedureFeedback: 'Clamps released.',
            isProcedureAnimating: false,
            fiberClampsClosed: false,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.RELEASE_CLAMPS,
              FIBER_PROCEDURE_STEPS.RELEASING_CLAMPS,
            ),
          }
        : {},
    )
  },
  startFusedFiberRemoval: () => {
    set((state) => {
      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.REMOVE_FUSED_FIBER ||
        state.splicerLidClosed ||
        state.fiberClampsClosed ||
        !state.fusionComplete ||
        state.fusedFiberRemoved ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.REMOVING_FUSED_FIBER,
        procedureFeedback: null,
        isProcedureAnimating: true,
      }
    })
  },
  completeFusedFiberRemoval: () => {
    set((state) =>
      state.currentStep === FIBER_PROCEDURE_STEPS.REMOVING_FUSED_FIBER &&
      state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.TASK_3_COMPLETE,
            procedureFeedback: 'Estimated splice loss: 0.03 dB.',
            isProcedureAnimating: false,
            fusedFiberRemoved: true,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.REMOVE_FUSED_FIBER,
              FIBER_PROCEDURE_STEPS.REMOVING_FUSED_FIBER,
              FIBER_PROCEDURE_STEPS.TASK_3_COMPLETE,
            ),
          }
        : {},
    )
  },
  selectProtectionSleeve: (objectId) => {
    set((state) => {
      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.SELECT_PROTECTION_SLEEVE ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      if (objectId !== FIBER_TOOL_IDS.PROTECTION_SLEEVE) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.WRONG_TOOL,
          `wrong-tool:${state.currentStep}:${objectId}`,
          'Use the splice protection sleeve to protect the fused fiber joint.',
        )
      }

      if (!state.fusionComplete || !state.fusedFiberRemoved) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.SEQUENCE,
          'sequence:sleeve-before-fused-fiber-removal',
          'Complete and remove the fused fiber first.',
        )
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.POSITION_PROTECTION_SLEEVE,
        procedureFeedback: 'Splice protection sleeve selected.',
        protectionSleeveSelected: true,
        completedSteps: addCompletedSteps(
          state.completedSteps,
          FIBER_PROCEDURE_STEPS.SELECT_PROTECTION_SLEEVE,
        ),
      }
    })
  },
  startProtectionSleevePositioning: () => {
    set((state) => {
      if (
        state.currentStep ===
          FIBER_PROCEDURE_STEPS.POSITION_PROTECTION_SLEEVE &&
        (!state.protectionSleeveSelected || !state.fusionComplete) &&
        !state.isProcedureAnimating
      ) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.SEQUENCE,
          'sequence:position-protection-sleeve-before-selection',
          'Select the protection sleeve after completing the fusion splice.',
        )
      }

      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.POSITION_PROTECTION_SLEEVE ||
        !state.protectionSleeveSelected ||
        !state.fusionComplete ||
        state.protectionSleevePositioned ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.POSITIONING_PROTECTION_SLEEVE,
        procedureFeedback: null,
        isProcedureAnimating: true,
      }
    })
  },
  completeProtectionSleevePositioning: () => {
    set((state) =>
      state.currentStep ===
        FIBER_PROCEDURE_STEPS.POSITIONING_PROTECTION_SLEEVE &&
      state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.PLACE_IN_HEATER,
            procedureFeedback: 'Protection sleeve centered over splice.',
            isProcedureAnimating: false,
            protectionSleevePositioned: true,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.POSITION_PROTECTION_SLEEVE,
              FIBER_PROCEDURE_STEPS.POSITIONING_PROTECTION_SLEEVE,
              FIBER_PROCEDURE_STEPS.PROTECTION_SLEEVE_POSITIONED,
            ),
            completedProcedureStages: addCompletedProcedureStages(
              state.completedProcedureStages,
              FIBER_ASSESSMENT_STAGE_IDS.PROTECTION_SLEEVE_INSTALLED,
            ),
          }
        : {},
    )
  },
  startHeaterPositioning: () => {
    set((state) => {
      if (
        state.currentStep === FIBER_PROCEDURE_STEPS.PLACE_IN_HEATER &&
        !state.protectionSleevePositioned &&
        !state.isProcedureAnimating
      ) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.SEQUENCE,
          'sequence:heater-before-sleeve-positioned',
          'Center the protection sleeve over the splice before heating.',
        )
      }

      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.PLACE_IN_HEATER ||
        !state.protectionSleevePositioned ||
        state.spliceInHeater ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.POSITIONING_IN_HEATER,
        procedureFeedback: null,
        isProcedureAnimating: true,
      }
    })
  },
  completeHeaterPositioning: () => {
    set((state) =>
      state.currentStep === FIBER_PROCEDURE_STEPS.POSITIONING_IN_HEATER &&
      state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.CLOSE_HEATER,
            procedureFeedback: 'Protected splice positioned in heater.',
            isProcedureAnimating: false,
            spliceInHeater: true,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.PLACE_IN_HEATER,
              FIBER_PROCEDURE_STEPS.POSITIONING_IN_HEATER,
              FIBER_PROCEDURE_STEPS.SPLICE_IN_HEATER,
            ),
          }
        : {},
    )
  },
  startHeaterClosing: () => {
    set((state) => {
      if (
        state.currentStep === FIBER_PROCEDURE_STEPS.CLOSE_HEATER &&
        !state.spliceInHeater &&
        !state.isProcedureAnimating
      ) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.SEQUENCE,
          'sequence:close-heater-before-loading-splice',
          'Place the protected splice in the heater before closing it.',
        )
      }

      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.CLOSE_HEATER ||
        !state.spliceInHeater ||
        state.heaterClosed ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.HEATER_CLOSED,
        procedureFeedback: null,
        isProcedureAnimating: true,
      }
    })
  },
  completeHeaterClosing: () => {
    set((state) =>
      state.currentStep === FIBER_PROCEDURE_STEPS.HEATER_CLOSED &&
      state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.READY_TO_HEAT,
            procedureFeedback: 'Heater cover closed. Ready to heat.',
            isProcedureAnimating: false,
            heaterClosed: true,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.CLOSE_HEATER,
              FIBER_PROCEDURE_STEPS.HEATER_CLOSED,
            ),
          }
        : {},
    )
  },
  startProtectionSleeveHeating: () => {
    set((state) => {
      if (
        state.currentStep === FIBER_PROCEDURE_STEPS.READY_TO_HEAT &&
        (!state.spliceInHeater || !state.heaterClosed) &&
        !state.isProcedureAnimating
      ) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.SEQUENCE,
          'sequence:heat-before-heater-ready',
          'Load the splice and close the heater before starting the cycle.',
        )
      }

      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.READY_TO_HEAT ||
        !state.spliceInHeater ||
        !state.heaterClosed ||
        state.heatingComplete ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.HEATING_PROTECTION_SLEEVE,
        procedureFeedback: 'Heater status: HEATING',
        isProcedureAnimating: true,
        heaterActive: true,
      }
    })
  },
  completeProtectionSleeveHeating: () => {
    set((state) =>
      state.currentStep ===
        FIBER_PROCEDURE_STEPS.HEATING_PROTECTION_SLEEVE &&
      state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.COOLING_PROTECTION_SLEEVE,
            procedureFeedback: 'Heater status: COOLING',
            heaterActive: false,
            heatingComplete: true,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.READY_TO_HEAT,
              FIBER_PROCEDURE_STEPS.HEATING_PROTECTION_SLEEVE,
            ),
          }
        : {},
    )
  },
  completeProtectionSleeveCooling: () => {
    set((state) =>
      state.currentStep ===
        FIBER_PROCEDURE_STEPS.COOLING_PROTECTION_SLEEVE &&
      state.isProcedureAnimating &&
      state.heatingComplete
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.OPEN_HEATER,
            procedureFeedback: 'Heater status: COMPLETE',
            isProcedureAnimating: false,
            coolingComplete: true,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.COOLING_PROTECTION_SLEEVE,
              FIBER_PROCEDURE_STEPS.HEATING_COMPLETE,
            ),
            completedProcedureStages: addCompletedProcedureStages(
              state.completedProcedureStages,
              FIBER_ASSESSMENT_STAGE_IDS.SLEEVE_HEAT_SHRUNK,
            ),
          }
        : {},
    )
  },
  startHeaterOpening: () => {
    set((state) => {
      if (
        state.currentStep === FIBER_PROCEDURE_STEPS.OPEN_HEATER &&
        (!state.heatingComplete || !state.coolingComplete) &&
        !state.isProcedureAnimating
      ) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.SEQUENCE,
          'sequence:open-heater-before-cooling',
          'Wait for the heating and cooling cycle to finish.',
        )
      }

      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.OPEN_HEATER ||
        !state.heaterClosed ||
        !state.heatingComplete ||
        !state.coolingComplete ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.HEATER_OPEN,
        procedureFeedback: null,
        isProcedureAnimating: true,
      }
    })
  },
  completeHeaterOpening: () => {
    set((state) =>
      state.currentStep === FIBER_PROCEDURE_STEPS.HEATER_OPEN &&
      state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.REMOVE_FROM_HEATER,
            procedureFeedback: 'Heater cover opened.',
            isProcedureAnimating: false,
            heaterClosed: false,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.OPEN_HEATER,
              FIBER_PROCEDURE_STEPS.HEATER_OPEN,
            ),
          }
        : {},
    )
  },
  startProtectedSpliceRemoval: () => {
    set((state) => {
      if (
        state.currentStep === FIBER_PROCEDURE_STEPS.REMOVE_FROM_HEATER &&
        (state.heaterClosed || !state.coolingComplete) &&
        !state.isProcedureAnimating
      ) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.SEQUENCE,
          'sequence:remove-splice-before-heater-open',
          'Open the heater after cooling before removing the protected splice.',
        )
      }

      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.REMOVE_FROM_HEATER ||
        state.heaterClosed ||
        !state.spliceInHeater ||
        !state.coolingComplete ||
        state.protectedSpliceRemoved ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.REMOVING_FROM_HEATER,
        procedureFeedback: null,
        isProcedureAnimating: true,
      }
    })
  },
  completeProtectedSpliceRemoval: () => {
    set((state) =>
      state.currentStep === FIBER_PROCEDURE_STEPS.REMOVING_FROM_HEATER &&
      state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.FINAL_INSPECTION,
            procedureFeedback: 'Protected splice ready for final inspection.',
            isProcedureAnimating: false,
            spliceInHeater: false,
            protectedSpliceRemoved: true,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.REMOVE_FROM_HEATER,
              FIBER_PROCEDURE_STEPS.REMOVING_FROM_HEATER,
              FIBER_PROCEDURE_STEPS.PROTECTED_SPLICE_REMOVED,
            ),
          }
        : {},
    )
  },
  inspectProtectedSplice: () => {
    set((state) => {
      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.FINAL_INSPECTION ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      const inspectionPassed =
        state.fusionComplete &&
        state.spliceResult === 'PASS' &&
        state.spliceLossDb === FIBER_SPLICE_LOSS_DB &&
        state.protectionSleevePositioned &&
        state.heatingComplete &&
        state.coolingComplete &&
        state.protectedSpliceRemoved

      if (!inspectionPassed) {
        return createFiberErrorUpdate(
          state,
          FIBER_ASSESSMENT_MISTAKE_TYPES.SEQUENCE,
          'sequence:final-inspection-before-protection-complete',
          'Complete sleeve installation, heating, and removal before inspection.',
        )
      }

      const completedProcedureStages = addCompletedProcedureStages(
        state.completedProcedureStages,
        FIBER_ASSESSMENT_STAGE_IDS.FINAL_INSPECTION_PASSED,
      )
      const assessmentUpdate =
        state.assessmentStartTime && !state.assessmentEndTime
          ? createFiberAssessmentCompletionUpdate(
              state,
              completedProcedureStages,
            )
          : {}

      return {
        procedureFeedback: 'Final protected splice inspection: PASS.',
        finalInspectionPassed: true,
        completedSteps: addCompletedSteps(
          state.completedSteps,
          FIBER_PROCEDURE_STEPS.FINAL_INSPECTION,
        ),
        completedProcedureStages,
        ...assessmentUpdate,
      }
    })
  },
  completeFiberModule: () => {
    set((state) =>
      state.currentStep === FIBER_PROCEDURE_STEPS.FINAL_INSPECTION &&
      state.finalInspectionPassed &&
      !state.isProcedureAnimating
        ? {
            currentStep: FIBER_PROCEDURE_STEPS.FIBER_MODULE_COMPLETE,
            procedureFeedback: 'Fiber optic fusion splice completed successfully.',
            fiberModuleCompleted: true,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              FIBER_PROCEDURE_STEPS.FIBER_MODULE_COMPLETE,
            ),
          }
        : {},
    )
  },
  restartFiberStep: () => {
    set((state) => {
      if (taskOneSteps.includes(state.currentStep)) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.SELECT_JACKET_STRIPPER,
          procedureFeedback: null,
          isProcedureAnimating: false,
          outerJacketRemoved: false,
          coatingRemoved: false,
          bareFiberExposed: false,
          fiberCleaned: false,
          fiberPositionedInCleaver: false,
          fiberCleaved: false,
          fiberPreparationComplete: false,
          ...createInitialSplicerState(),
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            [
              ...taskOneSteps,
              ...coatingSteps,
              ...cleaningSteps,
              ...cleavingSteps,
              ...splicingSteps,
            ],
          ),
        }
      }

      if (coatingSteps.includes(state.currentStep)) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.SELECT_PRECISION_STRIPPER,
          procedureFeedback: null,
          isProcedureAnimating: false,
          coatingRemoved: false,
          bareFiberExposed: false,
          fiberCleaned: false,
          fiberPositionedInCleaver: false,
          fiberCleaved: false,
          fiberPreparationComplete: false,
          ...createInitialSplicerState(),
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            [
              ...coatingSteps,
              ...cleaningSteps,
              ...cleavingSteps,
              ...splicingSteps,
            ],
          ),
        }
      }

      if (cleaningSteps.includes(state.currentStep)) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.SELECT_CLEANING_TOOL,
          procedureFeedback: null,
          isProcedureAnimating: false,
          fiberCleaned: false,
          fiberPositionedInCleaver: false,
          fiberCleaved: false,
          fiberPreparationComplete: false,
          ...createInitialSplicerState(),
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            [...cleaningSteps, ...cleavingSteps, ...splicingSteps],
          ),
        }
      }

      if (cleavingSteps.includes(state.currentStep)) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.SELECT_FIBER_CLEAVER,
          procedureFeedback: null,
          isProcedureAnimating: false,
          fiberPositionedInCleaver: false,
          fiberCleaved: false,
          fiberPreparationComplete: false,
          ...createInitialSplicerState(),
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            [...cleavingSteps, ...splicingSteps],
          ),
        }
      }

      if (fiberALoadingSteps.includes(state.currentStep)) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.LOAD_FIBER_A,
          procedureFeedback: null,
          isProcedureAnimating: false,
          ...createInitialSplicerState(),
          fiberBPrepared: true,
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            splicingSteps,
          ),
        }
      }

      if (fiberBLoadingSteps.includes(state.currentStep)) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.LOAD_FIBER_B,
          procedureFeedback: null,
          isProcedureAnimating: false,
          ...createInitialSplicerState(),
          fiberBPrepared: true,
          fiberALoaded: true,
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            splicingSteps.filter(
              (stepId) => !fiberALoadingSteps.includes(stepId),
            ),
          ),
        }
      }

      if (clampingSteps.includes(state.currentStep)) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.CLOSE_CLAMPS,
          procedureFeedback: null,
          isProcedureAnimating: false,
          ...createInitialSplicerState(),
          fiberBPrepared: true,
          fiberALoaded: true,
          fiberBLoaded: true,
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            [
              ...clampingSteps,
              ...lidClosingSteps,
              ...alignmentSteps,
              ...fusionSteps,
              ...lidOpeningSteps,
              ...clampReleaseSteps,
              ...fusedFiberRemovalSteps,
            ],
          ),
        }
      }

      if (lidClosingSteps.includes(state.currentStep)) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.CLOSE_SPLICER_LID,
          procedureFeedback: null,
          isProcedureAnimating: false,
          ...createInitialSplicerState(),
          fiberBPrepared: true,
          fiberALoaded: true,
          fiberBLoaded: true,
          fiberClampsClosed: true,
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            [
              ...lidClosingSteps,
              ...alignmentSteps,
              ...fusionSteps,
              ...lidOpeningSteps,
              ...clampReleaseSteps,
              ...fusedFiberRemovalSteps,
            ],
          ),
        }
      }

      if (alignmentSteps.includes(state.currentStep)) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.AUTO_ALIGNMENT,
          procedureFeedback: null,
          isProcedureAnimating: false,
          ...createInitialSplicerState(),
          fiberBPrepared: true,
          fiberALoaded: true,
          fiberBLoaded: true,
          fiberClampsClosed: true,
          splicerLidClosed: true,
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            [
              ...alignmentSteps,
              ...fusionSteps,
              ...lidOpeningSteps,
              ...clampReleaseSteps,
              ...fusedFiberRemovalSteps,
            ],
          ),
        }
      }

      if (fusionSteps.includes(state.currentStep)) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.READY_TO_FUSE,
          procedureFeedback: null,
          isProcedureAnimating: false,
          ...createInitialSplicerState(),
          fiberBPrepared: true,
          fiberALoaded: true,
          fiberBLoaded: true,
          fiberClampsClosed: true,
          splicerLidClosed: true,
          alignmentStarted: true,
          alignmentComplete: true,
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            [
              ...fusionSteps,
              ...lidOpeningSteps,
              ...clampReleaseSteps,
              ...fusedFiberRemovalSteps,
            ],
          ),
        }
      }

      if (lidOpeningSteps.includes(state.currentStep)) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.OPEN_SPLICER_LID,
          procedureFeedback: null,
          isProcedureAnimating: false,
          ...createInitialSplicerState(),
          fiberBPrepared: true,
          fiberALoaded: true,
          fiberBLoaded: true,
          fiberClampsClosed: true,
          splicerLidClosed: true,
          alignmentStarted: true,
          alignmentComplete: true,
          fusionComplete: true,
          spliceLossDb: state.spliceLossDb,
          spliceResult: state.spliceResult,
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            [
              ...lidOpeningSteps,
              ...clampReleaseSteps,
              ...fusedFiberRemovalSteps,
            ],
          ),
        }
      }

      if (clampReleaseSteps.includes(state.currentStep)) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.RELEASE_CLAMPS,
          procedureFeedback: null,
          isProcedureAnimating: false,
          ...createInitialSplicerState(),
          fiberBPrepared: true,
          fiberALoaded: true,
          fiberBLoaded: true,
          fiberClampsClosed: true,
          alignmentStarted: true,
          alignmentComplete: true,
          fusionComplete: true,
          spliceLossDb: state.spliceLossDb,
          spliceResult: state.spliceResult,
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            [...clampReleaseSteps, ...fusedFiberRemovalSteps],
          ),
        }
      }

      if (fusedFiberRemovalSteps.includes(state.currentStep)) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.REMOVE_FUSED_FIBER,
          procedureFeedback: null,
          isProcedureAnimating: false,
          ...createInitialSplicerState(),
          fiberBPrepared: true,
          fiberALoaded: true,
          fiberBLoaded: true,
          alignmentStarted: true,
          alignmentComplete: true,
          fusionComplete: true,
          spliceLossDb: state.spliceLossDb,
          spliceResult: state.spliceResult,
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            fusedFiberRemovalSteps,
          ),
        }
      }

      if (sleevePositioningSteps.includes(state.currentStep)) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.SELECT_PROTECTION_SLEEVE,
          procedureFeedback: null,
          isProcedureAnimating: false,
          ...createCompletedFusionState(state),
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            protectionSteps,
          ),
        }
      }

      if (heaterPositioningSteps.includes(state.currentStep)) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.PLACE_IN_HEATER,
          procedureFeedback: null,
          isProcedureAnimating: false,
          ...createCompletedFusionState(state),
          protectionSleeveSelected: true,
          protectionSleevePositioned: true,
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            [
              ...heaterPositioningSteps,
              ...heaterClosingSteps,
              ...heatingSteps,
              ...heaterOpeningSteps,
              ...protectedSpliceRemovalSteps,
              ...finalInspectionSteps,
            ],
          ),
        }
      }

      if (heaterClosingSteps.includes(state.currentStep)) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.CLOSE_HEATER,
          procedureFeedback: null,
          isProcedureAnimating: false,
          ...createCompletedFusionState(state),
          protectionSleeveSelected: true,
          protectionSleevePositioned: true,
          spliceInHeater: true,
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            [
              ...heaterClosingSteps,
              ...heatingSteps,
              ...heaterOpeningSteps,
              ...protectedSpliceRemovalSteps,
              ...finalInspectionSteps,
            ],
          ),
        }
      }

      if (heatingSteps.includes(state.currentStep)) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.READY_TO_HEAT,
          procedureFeedback: null,
          isProcedureAnimating: false,
          ...createCompletedFusionState(state),
          protectionSleeveSelected: true,
          protectionSleevePositioned: true,
          spliceInHeater: true,
          heaterClosed: true,
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            [
              ...heatingSteps,
              ...heaterOpeningSteps,
              ...protectedSpliceRemovalSteps,
              ...finalInspectionSteps,
            ],
          ),
        }
      }

      if (heaterOpeningSteps.includes(state.currentStep)) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.OPEN_HEATER,
          procedureFeedback: 'Heater status: COMPLETE',
          isProcedureAnimating: false,
          ...createCompletedFusionState(state),
          protectionSleeveSelected: true,
          protectionSleevePositioned: true,
          spliceInHeater: true,
          heaterClosed: true,
          heatingComplete: true,
          coolingComplete: true,
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            [
              ...heaterOpeningSteps,
              ...protectedSpliceRemovalSteps,
              ...finalInspectionSteps,
            ],
          ),
        }
      }

      if (protectedSpliceRemovalSteps.includes(state.currentStep)) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.REMOVE_FROM_HEATER,
          procedureFeedback: null,
          isProcedureAnimating: false,
          ...createCompletedFusionState(state),
          protectionSleeveSelected: true,
          protectionSleevePositioned: true,
          spliceInHeater: true,
          heatingComplete: true,
          coolingComplete: true,
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            [...protectedSpliceRemovalSteps, ...finalInspectionSteps],
          ),
        }
      }

      if (finalInspectionSteps.includes(state.currentStep)) {
        return {
          currentStep: FIBER_PROCEDURE_STEPS.FINAL_INSPECTION,
          procedureFeedback: null,
          isProcedureAnimating: false,
          ...createCompletedFusionState(state),
          protectionSleeveSelected: true,
          protectionSleevePositioned: true,
          heatingComplete: true,
          coolingComplete: true,
          protectedSpliceRemoved: true,
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            finalInspectionSteps,
          ),
          ...createReopenedFiberAssessmentState(state),
        }
      }

      return {}
    })
  },
  restartFiberTraining: () => {
    set((state) =>
      state.activeModuleId === FIBER_MODULE_ID && state.trainingStarted
        ? createStartedFiberState()
        : {},
    )
  },
  resetFiberTraining: () => set(createInitialFiberState()),
}))

export default useFiberTrainingStore
