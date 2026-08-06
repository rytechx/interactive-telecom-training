import { create } from 'zustand'
import {
  ETHERNET_CABLE_ID,
  getRJ45ProcedureStep,
  RJ45_MODULE_ID,
  RJ45_PROCEDURE_STEPS,
} from '../modules/rj45/rj45Procedure.js'

const initialTrainingState = {
  activeModuleId: null,
  currentStep: RJ45_PROCEDURE_STEPS.NOT_STARTED,
  trainingStarted: false,
  selectedWorkpieceId: null,
  procedureFeedback: null,
  isProcedureAnimating: false,
  completedSteps: [],
}

function addCompletedSteps(completedSteps, ...stepIds) {
  return [...new Set([...completedSteps, ...stepIds])]
}

const useTrainingStore = create((set) => ({
  ...initialTrainingState,

  beginRJ45Training: () => {
    set({
      activeModuleId: RJ45_MODULE_ID,
      currentStep: RJ45_PROCEDURE_STEPS.SELECT_CABLE,
      trainingStarted: true,
      selectedWorkpieceId: null,
      procedureFeedback: null,
      isProcedureAnimating: false,
      completedSteps: [],
    })
  },
  selectWorkpiece: (workpieceId) => {
    set((state) => {
      const procedureStep = getRJ45ProcedureStep(state.currentStep)

      if (
        state.activeModuleId !== RJ45_MODULE_ID ||
        !state.trainingStarted ||
        state.isProcedureAnimating ||
        procedureStep.acceptedAction !== 'select-workpiece' ||
        procedureStep.acceptedWorkpieceId !== workpieceId
      ) {
        return {}
      }

      return {
        selectedWorkpieceId: workpieceId,
        currentStep: RJ45_PROCEDURE_STEPS.SELECT_WIRE_STRIPPER,
        procedureFeedback: null,
        completedSteps: addCompletedSteps(
          state.completedSteps,
          RJ45_PROCEDURE_STEPS.SELECT_CABLE,
        ),
      }
    })
  },
  handleToolActivated: (toolId) => {
    set((state) => {
      if (
        state.activeModuleId !== RJ45_MODULE_ID ||
        !state.trainingStarted ||
        state.currentStep !== RJ45_PROCEDURE_STEPS.SELECT_WIRE_STRIPPER
      ) {
        return {}
      }

      const procedureStep = getRJ45ProcedureStep(state.currentStep)

      if (procedureStep.acceptedToolId !== toolId) {
        return { procedureFeedback: 'Use the wire stripper for this step.' }
      }

      return {
        currentStep: RJ45_PROCEDURE_STEPS.STRIP_JACKET,
        procedureFeedback: null,
        completedSteps: addCompletedSteps(
          state.completedSteps,
          RJ45_PROCEDURE_STEPS.SELECT_WIRE_STRIPPER,
        ),
      }
    })
  },
  startJacketStripping: () => {
    set((state) =>
      state.activeModuleId === RJ45_MODULE_ID &&
      state.trainingStarted &&
      state.currentStep === RJ45_PROCEDURE_STEPS.STRIP_JACKET &&
      state.selectedWorkpieceId === ETHERNET_CABLE_ID &&
      !state.isProcedureAnimating
        ? {
            isProcedureAnimating: true,
            procedureFeedback: 'Removing the outer jacket...',
          }
        : {},
    )
  },
  completeJacketStripping: () => {
    set((state) =>
      state.currentStep === RJ45_PROCEDURE_STEPS.STRIP_JACKET &&
      state.isProcedureAnimating
        ? {
            currentStep: RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_1,
            procedureFeedback: 'Jacket removed successfully.',
            isProcedureAnimating: false,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              RJ45_PROCEDURE_STEPS.STRIP_JACKET,
              RJ45_PROCEDURE_STEPS.JACKET_STRIPPED,
            ),
          }
        : {},
    )
  },
  restartRJ45Training: () => {
    set((state) =>
      state.activeModuleId === RJ45_MODULE_ID && state.trainingStarted
        ? {
            currentStep: RJ45_PROCEDURE_STEPS.SELECT_CABLE,
            selectedWorkpieceId: null,
            procedureFeedback: null,
            isProcedureAnimating: false,
            completedSteps: [],
          }
        : {},
    )
  },
  resetTraining: () => set(initialTrainingState),
}))

export default useTrainingStore
