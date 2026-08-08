import { create } from 'zustand'
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
    feedback: 'Use a lint-free cleaning wipe to remove residue from the bare fiber.',
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
    wrongToolCount: 0,
  }
}

function createStartedFiberState() {
  return {
    ...createInitialFiberState(),
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

const useFiberTrainingStore = create((set) => ({
  ...createInitialFiberState(),

  beginFiberTraining: () => set(createStartedFiberState()),
  selectFiberCable: (workpieceId) => {
    set((state) => {
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
        return {
          procedureFeedback: rule.feedback,
          wrongToolCount: state.wrongToolCount + 1,
        }
      }

      return {
        currentStep: rule.nextStep,
        procedureFeedback: null,
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

      return {}
    })
  },
  startOuterJacketStripping: (toolId) => {
    set((state) => {
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
          }
        : {},
    )
  },
  startFiberCoatingStripping: (toolId) => {
    set((state) => {
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
          }
        : {},
    )
  },
  startFiberCleaning: (toolId) => {
    set((state) => {
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
          }
        : {},
    )
  },
  startFiberPositioning: (toolId) => {
    set((state) => {
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
          }
        : {},
    )
  },
  startFiberALoading: () => {
    set((state) => {
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
          }
        : {},
    )
  },
  startFiberBLoading: () => {
    set((state) => {
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
          }
        : {},
    )
  },
  startSplicerClamping: () => {
    set((state) => {
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
          }
        : {},
    )
  },
  startSplicerLidClosing: () => {
    set((state) => {
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

      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.AUTO_ALIGNMENT ||
        !prerequisitesMet ||
        state.alignmentStarted ||
        state.isProcedureAnimating
      ) {
        return {
          procedureFeedback: prerequisitesMet
            ? state.procedureFeedback
            : 'Load and secure both prepared fibers before alignment.',
        }
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

      if (
        state.currentStep !== FIBER_PROCEDURE_STEPS.READY_TO_FUSE ||
        !prerequisitesMet ||
        state.fusionComplete ||
        state.isProcedureAnimating
      ) {
        return {
          procedureFeedback: !state.alignmentComplete
            ? 'Complete fiber alignment before starting fusion.'
            : state.procedureFeedback,
        }
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
