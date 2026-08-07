import { create } from 'zustand'
import {
  FIBER_CABLE_ID,
  FIBER_MODULE_ID,
  FIBER_PROCEDURE_STEPS,
} from '../modules/fiber/fiberProcedure.js'
import { FIBER_TOOL_IDS } from '../modules/fiber/fiberToolConfigs.js'

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
        state.currentStep !== FIBER_PROCEDURE_STEPS.SELECT_JACKET_STRIPPER
      ) {
        return {}
      }

      if (toolId !== FIBER_TOOL_IDS.JACKET_STRIPPER) {
        return {
          procedureFeedback:
            'Use the fiber jacket stripper to remove the outer cable jacket.',
          wrongToolCount: state.wrongToolCount + 1,
        }
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.STRIP_OUTER_JACKET,
        procedureFeedback: null,
        completedSteps: addCompletedSteps(
          state.completedSteps,
          FIBER_PROCEDURE_STEPS.SELECT_JACKET_STRIPPER,
        ),
      }
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
      state.currentStep ===
        FIBER_PROCEDURE_STEPS.STRIPPING_OUTER_JACKET &&
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
  restartFiberStep: () => {
    set((state) => {
      const preparationSteps = [
        FIBER_PROCEDURE_STEPS.STRIP_OUTER_JACKET,
        FIBER_PROCEDURE_STEPS.STRIPPING_OUTER_JACKET,
        FIBER_PROCEDURE_STEPS.OUTER_JACKET_REMOVED,
        FIBER_PROCEDURE_STEPS.TASK_1_COMPLETE,
      ]

      if (!preparationSteps.includes(state.currentStep)) {
        return {}
      }

      return {
        currentStep: FIBER_PROCEDURE_STEPS.SELECT_JACKET_STRIPPER,
        procedureFeedback: null,
        isProcedureAnimating: false,
        outerJacketRemoved: false,
        completedSteps: state.completedSteps.filter(
          (stepId) => !preparationSteps.includes(stepId),
        ),
      }
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
