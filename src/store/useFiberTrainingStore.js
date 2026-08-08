import { create } from 'zustand'
import {
  FIBER_CABLE_ID,
  FIBER_MODULE_ID,
  FIBER_PROCEDURE_STEPS,
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
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            [...taskOneSteps, ...coatingSteps, ...cleaningSteps, ...cleavingSteps],
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
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            [...coatingSteps, ...cleaningSteps, ...cleavingSteps],
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
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            [...cleaningSteps, ...cleavingSteps],
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
          completedSteps: removeCompletedSteps(
            state.completedSteps,
            cleavingSteps,
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
