import { create } from 'zustand'
import {
  ETHERNET_CABLE_ID,
  getRJ45ProcedureStep,
  RJ45_MODULE_ID,
  RJ45_PROCEDURE_STEPS,
} from '../modules/rj45/rj45Procedure.js'
import {
  T568B_SEQUENCE,
  WIRE_COUNT,
  WIRE_IDS,
} from '../modules/rj45/wireDefinitions.js'

const emptyWirePlacements = () => Array(WIRE_COUNT).fill(null)
const emptyValidationResults = () => Array(WIRE_COUNT).fill(null)

function createInitialTrainingState() {
  return {
    activeModuleId: null,
    currentStep: RJ45_PROCEDURE_STEPS.NOT_STARTED,
    trainingStarted: false,
    selectedWorkpieceId: null,
    procedureFeedback: null,
    isProcedureAnimating: false,
    completedSteps: [],
    pairsSeparated: false,
    selectedWireId: null,
    wirePlacements: emptyWirePlacements(),
    placementHistory: [],
    wireValidationResults: emptyValidationResults(),
    placedWireCount: 0,
    wiresTrimmed: false,
    isTrimming: false,
  }
}

function createStartedTrainingState() {
  return {
    ...createInitialTrainingState(),
    activeModuleId: RJ45_MODULE_ID,
    currentStep: RJ45_PROCEDURE_STEPS.SELECT_CABLE,
    trainingStarted: true,
  }
}

function addCompletedSteps(completedSteps, ...stepIds) {
  return [...new Set([...completedSteps, ...stepIds])]
}

function isValidWireId(wireId) {
  return WIRE_IDS.includes(wireId)
}

function isValidSlotNumber(slotNumber) {
  return Number.isInteger(slotNumber) && slotNumber >= 1 && slotNumber <= WIRE_COUNT
}

function isArrangementStep(currentStep) {
  return (
    currentStep === RJ45_PROCEDURE_STEPS.ARRANGE_T568B ||
    currentStep === RJ45_PROCEDURE_STEPS.VALIDATE_T568B
  )
}

const useTrainingStore = create((set) => ({
  ...createInitialTrainingState(),

  beginRJ45Training: () => set(createStartedTrainingState()),
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
        !state.trainingStarted
      ) {
        return {}
      }

      const procedureStep = getRJ45ProcedureStep(state.currentStep)

      if (state.currentStep === RJ45_PROCEDURE_STEPS.SELECT_CUTTING_TOOL) {
        if (procedureStep.acceptedToolId !== toolId) {
          return {
            procedureFeedback:
              'Use the crimping tool\u2019s cutting blade for this step.',
          }
        }

        return {
          currentStep: RJ45_PROCEDURE_STEPS.POSITION_FOR_TRIM,
          procedureFeedback: null,
          completedSteps: addCompletedSteps(
            state.completedSteps,
            RJ45_PROCEDURE_STEPS.SELECT_CUTTING_TOOL,
          ),
        }
      }

      if (state.currentStep !== RJ45_PROCEDURE_STEPS.SELECT_WIRE_STRIPPER) {
        return {}
      }

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
            currentStep: RJ45_PROCEDURE_STEPS.JACKET_STRIPPED,
            procedureFeedback: null,
            isProcedureAnimating: false,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              RJ45_PROCEDURE_STEPS.STRIP_JACKET,
              RJ45_PROCEDURE_STEPS.JACKET_STRIPPED,
              RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_1,
            ),
          }
        : {},
    )
  },
  continueRJ45Procedure: () => {
    set((state) => {
      if (state.isProcedureAnimating) {
        return {}
      }

      if (
        state.currentStep === RJ45_PROCEDURE_STEPS.JACKET_STRIPPED ||
        state.currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_1
      ) {
        return {
          currentStep: RJ45_PROCEDURE_STEPS.SEPARATE_PAIRS,
          procedureFeedback: null,
        }
      }

      if (
        state.currentStep === RJ45_PROCEDURE_STEPS.WIRES_ARRANGED ||
        state.currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_2
      ) {
        return {
          currentStep: RJ45_PROCEDURE_STEPS.SELECT_CUTTING_TOOL,
          procedureFeedback: null,
        }
      }

      return {}
    })
  },
  startPairSeparation: () => {
    set((state) =>
      state.currentStep === RJ45_PROCEDURE_STEPS.SEPARATE_PAIRS &&
      !state.pairsSeparated &&
      !state.isProcedureAnimating
        ? {
            isProcedureAnimating: true,
            procedureFeedback: null,
          }
        : {},
    )
  },
  completePairSeparation: () => {
    set((state) =>
      state.currentStep === RJ45_PROCEDURE_STEPS.SEPARATE_PAIRS &&
      state.isProcedureAnimating
        ? {
            currentStep: RJ45_PROCEDURE_STEPS.ARRANGE_T568B,
            pairsSeparated: true,
            isProcedureAnimating: false,
            procedureFeedback: null,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              RJ45_PROCEDURE_STEPS.SEPARATE_PAIRS,
              RJ45_PROCEDURE_STEPS.PAIRS_SEPARATED,
            ),
          }
        : {},
    )
  },
  selectWire: (wireId) => {
    set((state) => {
      if (
        !isArrangementStep(state.currentStep) ||
        !state.pairsSeparated ||
        state.isProcedureAnimating ||
        !isValidWireId(wireId) ||
        state.wirePlacements.includes(wireId)
      ) {
        return {}
      }

      return {
        selectedWireId: state.selectedWireId === wireId ? null : wireId,
        procedureFeedback: null,
      }
    })
  },
  placeSelectedWire: (slotNumber) => {
    set((state) => {
      const slotIndex = slotNumber - 1
      const wireId = state.selectedWireId

      if (
        !isArrangementStep(state.currentStep) ||
        state.isProcedureAnimating ||
        !isValidSlotNumber(slotNumber) ||
        !isValidWireId(wireId) ||
        state.wirePlacements[slotIndex] ||
        state.wirePlacements.includes(wireId)
      ) {
        return {}
      }

      const wirePlacements = [...state.wirePlacements]
      const wireValidationResults = [...state.wireValidationResults]
      wirePlacements[slotIndex] = wireId
      wireValidationResults[slotIndex] = null
      const placedWireCount = wirePlacements.filter(Boolean).length

      return {
        currentStep:
          placedWireCount === WIRE_COUNT
            ? RJ45_PROCEDURE_STEPS.VALIDATE_T568B
            : RJ45_PROCEDURE_STEPS.ARRANGE_T568B,
        selectedWireId: null,
        wirePlacements,
        placementHistory: [
          ...state.placementHistory,
          { wireId, slotNumber },
        ],
        wireValidationResults,
        placedWireCount,
        procedureFeedback: null,
      }
    })
  },
  removeWireFromSlot: (slotNumber) => {
    set((state) => {
      const slotIndex = slotNumber - 1
      const hasIncorrectValidation = state.wireValidationResults.includes(
        'incorrect',
      )

      if (
        !isArrangementStep(state.currentStep) ||
        !isValidSlotNumber(slotNumber) ||
        !state.wirePlacements[slotIndex] ||
        !hasIncorrectValidation ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      const wirePlacements = [...state.wirePlacements]
      const wireValidationResults = [...state.wireValidationResults]
      const removedWireId = wirePlacements[slotIndex]
      wirePlacements[slotIndex] = null
      wireValidationResults[slotIndex] = null

      return {
        currentStep: RJ45_PROCEDURE_STEPS.ARRANGE_T568B,
        selectedWireId: null,
        wirePlacements,
        placementHistory: state.placementHistory.filter(
          (placement) =>
            placement.wireId !== removedWireId ||
            placement.slotNumber !== slotNumber,
        ),
        wireValidationResults,
        placedWireCount: wirePlacements.filter(Boolean).length,
        procedureFeedback: null,
      }
    })
  },
  undoLastPlacement: () => {
    set((state) => {
      if (
        !isArrangementStep(state.currentStep) ||
        state.isProcedureAnimating ||
        state.placementHistory.length === 0
      ) {
        return {}
      }

      const placementHistory = [...state.placementHistory]
      const lastPlacement = placementHistory.pop()
      const slotIndex = lastPlacement.slotNumber - 1
      const wirePlacements = [...state.wirePlacements]
      const wireValidationResults = [...state.wireValidationResults]

      if (wirePlacements[slotIndex] !== lastPlacement.wireId) {
        return { placementHistory }
      }

      wirePlacements[slotIndex] = null
      wireValidationResults[slotIndex] = null

      return {
        currentStep: RJ45_PROCEDURE_STEPS.ARRANGE_T568B,
        selectedWireId: null,
        wirePlacements,
        placementHistory,
        wireValidationResults,
        placedWireCount: wirePlacements.filter(Boolean).length,
        procedureFeedback: null,
      }
    })
  },
  resetWireArrangement: () => {
    set((state) =>
      isArrangementStep(state.currentStep) && state.pairsSeparated
        ? {
            currentStep: RJ45_PROCEDURE_STEPS.ARRANGE_T568B,
            selectedWireId: null,
            wirePlacements: emptyWirePlacements(),
            placementHistory: [],
            wireValidationResults: emptyValidationResults(),
            placedWireCount: 0,
            procedureFeedback: null,
            isProcedureAnimating: false,
          }
        : {},
    )
  },
  validateWireArrangement: () => {
    set((state) => {
      if (
        !isArrangementStep(state.currentStep) ||
        state.isProcedureAnimating ||
        state.placedWireCount !== WIRE_COUNT ||
        state.wirePlacements.some((wireId) => !isValidWireId(wireId)) ||
        new Set(state.wirePlacements).size !== WIRE_COUNT
      ) {
        return {}
      }

      const wireValidationResults = state.wirePlacements.map(
        (wireId, index) =>
          wireId === T568B_SEQUENCE[index] ? 'correct' : 'incorrect',
      )
      const isCorrect = wireValidationResults.every(
        (result) => result === 'correct',
      )

      if (!isCorrect) {
        return {
          currentStep: RJ45_PROCEDURE_STEPS.VALIDATE_T568B,
          selectedWireId: null,
          wireValidationResults,
          procedureFeedback:
            'The wire order is incorrect. Review the T568B guide.',
        }
      }

      return {
        currentStep: RJ45_PROCEDURE_STEPS.WIRES_ARRANGED,
        selectedWireId: null,
        wireValidationResults,
        procedureFeedback: null,
        completedSteps: addCompletedSteps(
          state.completedSteps,
          RJ45_PROCEDURE_STEPS.ARRANGE_T568B,
          RJ45_PROCEDURE_STEPS.VALIDATE_T568B,
          RJ45_PROCEDURE_STEPS.WIRES_ARRANGED,
          RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_2,
        ),
      }
    })
  },
  startWireTrimming: () => {
    set((state) =>
      state.activeModuleId === RJ45_MODULE_ID &&
      state.trainingStarted &&
      state.currentStep === RJ45_PROCEDURE_STEPS.POSITION_FOR_TRIM &&
      !state.wiresTrimmed &&
      !state.isProcedureAnimating
        ? {
            currentStep: RJ45_PROCEDURE_STEPS.TRIMMING,
            procedureFeedback: null,
            isProcedureAnimating: true,
            isTrimming: true,
          }
        : {},
    )
  },
  completeWireTrimming: () => {
    set((state) =>
      state.currentStep === RJ45_PROCEDURE_STEPS.TRIMMING &&
      state.isProcedureAnimating &&
      state.isTrimming
        ? {
            currentStep: RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_3,
            procedureFeedback:
              'The conductor ends are aligned and ready for connector insertion.',
            isProcedureAnimating: false,
            isTrimming: false,
            wiresTrimmed: true,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              RJ45_PROCEDURE_STEPS.POSITION_FOR_TRIM,
              RJ45_PROCEDURE_STEPS.TRIM_WIRES,
              RJ45_PROCEDURE_STEPS.TRIMMING,
              RJ45_PROCEDURE_STEPS.WIRES_TRIMMED,
              RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_3,
            ),
          }
        : {},
    )
  },
  restartWireTrimming: () => {
    set((state) => {
      const trimmingSteps = [
        RJ45_PROCEDURE_STEPS.SELECT_CUTTING_TOOL,
        RJ45_PROCEDURE_STEPS.POSITION_FOR_TRIM,
        RJ45_PROCEDURE_STEPS.TRIM_WIRES,
        RJ45_PROCEDURE_STEPS.TRIMMING,
        RJ45_PROCEDURE_STEPS.WIRES_TRIMMED,
        RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_3,
      ]

      if (!trimmingSteps.includes(state.currentStep)) {
        return {}
      }

      return {
        currentStep: RJ45_PROCEDURE_STEPS.SELECT_CUTTING_TOOL,
        procedureFeedback: null,
        isProcedureAnimating: false,
        isTrimming: false,
        wiresTrimmed: false,
        completedSteps: state.completedSteps.filter(
          (stepId) => !trimmingSteps.includes(stepId),
        ),
      }
    })
  },
  restartRJ45Training: () => {
    set((state) =>
      state.activeModuleId === RJ45_MODULE_ID && state.trainingStarted
        ? createStartedTrainingState()
        : {},
    )
  },
  resetTraining: () => set(createInitialTrainingState()),
}))

export default useTrainingStore
