import { create } from 'zustand'
import {
  ASSESSMENT_MISTAKE_TYPES,
  ASSESSMENT_STAGE_IDS,
  ASSESSMENT_STAGES,
  calculateAssessmentResult,
  createInitialAssessmentState,
  MISTAKE_GUARD_WINDOW_MS,
} from '../modules/rj45/rj45Assessment.js'
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
import {
  createPendingCableTestResults,
  getCableTestOutcome,
  TEST_PIN_COUNT,
  TEST_PIN_STATUSES,
} from '../modules/rj45/testSequenceConfig.js'
import { TOOL_IDS } from '../tools/toolConfigs.js'

const emptyWirePlacements = () => Array(WIRE_COUNT).fill(null)
const emptyValidationResults = () => Array(WIRE_COUNT).fill(null)
const emptyInsertionValidationResults = () => Array(WIRE_COUNT).fill(null)
const emptyCrimpVerification = () => ({
  connectorInserted: false,
  connectorPositioned: false,
  contactsSeated: 0,
  strainReliefSecured: false,
  t568bVerified: false,
})

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
    connectorAligned: false,
    isConnectorAligning: false,
    isConnectorInserting: false,
    conductorsInserted: false,
    insertionValidationResults: emptyInsertionValidationResults(),
    connectorOrientationConfirmed: false,
    connectorPositionedForCrimp: false,
    isConnectorPositioning: false,
    isCrimping: false,
    crimpComplete: false,
    contactsSeated: 0,
    strainReliefSecured: false,
    crimpVerification: emptyCrimpVerification(),
    cableConnectedToTester: false,
    isCableConnecting: false,
    isCableTesting: false,
    cableTestProgress: 0,
    cableTestResults: createPendingCableTestResults(),
    finalTestResult: null,
    moduleCompleted: false,
    ...createInitialAssessmentState(),
  }
}

function createStartedTrainingState() {
  return {
    ...createInitialTrainingState(),
    ...createInitialAssessmentState(Date.now()),
    activeModuleId: RJ45_MODULE_ID,
    currentStep: RJ45_PROCEDURE_STEPS.SELECT_CABLE,
    trainingStarted: true,
  }
}

function addCompletedSteps(completedSteps, ...stepIds) {
  return [...new Set([...completedSteps, ...stepIds])]
}

function addCompletedProcedureSteps(completedProcedureSteps, ...stepIds) {
  return [...new Set([...completedProcedureSteps, ...stepIds])]
}

function removeCompletedProcedureSteps(completedProcedureSteps, ...stepIds) {
  return completedProcedureSteps.filter((stepId) => !stepIds.includes(stepId))
}

function createMistakeUpdate(
  state,
  mistakeType,
  signature = mistakeType,
  recordedAt = Date.now(),
) {
  if (
    !state.assessmentStartTime ||
    state.assessmentEndTime ||
    state.assessmentVisible ||
    (state.lastMistakeSignature === signature &&
      recordedAt - state.lastMistakeRecordedAt < MISTAKE_GUARD_WINDOW_MS)
  ) {
    return {}
  }

  const update = {
    mistakeCount: state.mistakeCount + 1,
    lastMistakeSignature: signature,
    lastMistakeRecordedAt: recordedAt,
  }

  if (mistakeType === ASSESSMENT_MISTAKE_TYPES.WRONG_TOOL) {
    update.wrongToolCount = state.wrongToolCount + 1
  } else if (mistakeType === ASSESSMENT_MISTAKE_TYPES.INCORRECT_T568B) {
    update.incorrectT568BAttempts = state.incorrectT568BAttempts + 1
  } else {
    update.otherMistakeCount = state.otherMistakeCount + 1
  }

  return update
}

function createWrongToolUpdate(state, toolId, procedureFeedback) {
  return {
    ...createMistakeUpdate(
      state,
      ASSESSMENT_MISTAKE_TYPES.WRONG_TOOL,
      `wrong-tool:${state.currentStep}:${toolId}`,
    ),
    procedureFeedback,
  }
}

function createProcedureMistakeUpdate(state, signature, procedureFeedback) {
  return {
    ...createMistakeUpdate(
      state,
      ASSESSMENT_MISTAKE_TYPES.PREREQUISITE,
      signature,
    ),
    procedureFeedback,
  }
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

  startAssessment: () =>
    set((state) =>
      state.trainingStarted && !state.assessmentStartTime
        ? createInitialAssessmentState(Date.now())
        : {},
    ),
  recordMistake: (mistakeType, signature) => {
    set((state) => createMistakeUpdate(state, mistakeType, signature))
  },
  recordWrongTool: (toolId) => {
    set((state) =>
      createMistakeUpdate(
        state,
        ASSESSMENT_MISTAKE_TYPES.WRONG_TOOL,
        `wrong-tool:${state.currentStep}:${toolId}`,
      ),
    )
  },
  recordT568BFailure: () => {
    set((state) => {
      const mistakeUpdate = createMistakeUpdate(
        state,
        ASSESSMENT_MISTAKE_TYPES.INCORRECT_T568B,
        `incorrect-t568b:${state.wirePlacements.join(':')}`,
      )

      return Object.hasOwn(mistakeUpdate, 'mistakeCount')
        ? {
            ...mistakeUpdate,
            t568bValidationAttempts: state.t568bValidationAttempts + 1,
          }
        : {}
    })
  },
  recordRestartStep: () => {
    set((state) =>
      state.assessmentStartTime && !state.assessmentEndTime
        ? {
            restartStepCount: state.restartStepCount + 1,
            procedureRetryCount: state.procedureRetryCount + 1,
          }
        : {},
    )
  },
  recordProcedureRetry: () => {
    set((state) =>
      state.assessmentStartTime && !state.assessmentEndTime
        ? { procedureRetryCount: state.procedureRetryCount + 1 }
        : {},
    )
  },
  recordHint: () => {
    set((state) =>
      state.assessmentStartTime && !state.assessmentEndTime
        ? { hintCount: state.hintCount + 1 }
        : {},
    )
  },
  completeProcedureStep: (stepId) => {
    set((state) =>
      ASSESSMENT_STAGES.some((stage) => stage.id === stepId)
        ? {
            completedProcedureSteps: addCompletedProcedureSteps(
              state.completedProcedureSteps,
              stepId,
            ),
          }
        : {},
    )
  },
  completeAssessment: () => {
    set((state) => {
      if (
        !state.assessmentStartTime ||
        state.assessmentEndTime ||
        state.finalTestResult !== 'PASS'
      ) {
        return {}
      }

      const assessmentEndTime = Date.now()

      return {
        assessmentEndTime,
        ...calculateAssessmentResult({
          ...state,
          assessmentEndTime,
        }),
      }
    })
  },
  resetAssessment: () => set(createInitialAssessmentState()),
  openAssessment: () => {
    set((state) =>
      state.moduleCompleted &&
      state.finalTestResult === 'PASS' &&
      Number.isFinite(state.finalScore)
        ? { assessmentVisible: true }
        : {},
    )
  },
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
        completedProcedureSteps: addCompletedProcedureSteps(
          state.completedProcedureSteps,
          ASSESSMENT_STAGE_IDS.CABLE_SELECTED,
        ),
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

      if (state.currentStep === RJ45_PROCEDURE_STEPS.SELECT_CABLE_TESTER) {
        if (procedureStep.acceptedToolId !== toolId) {
          return createWrongToolUpdate(
            state,
            toolId,
            'Select the cable tester for this step.',
          )
        }

        return {
          currentStep: RJ45_PROCEDURE_STEPS.CONNECT_CABLE_TO_TESTER,
          procedureFeedback: null,
          completedSteps: addCompletedSteps(
            state.completedSteps,
            RJ45_PROCEDURE_STEPS.SELECT_CABLE_TESTER,
          ),
        }
      }

      if (state.currentStep === RJ45_PROCEDURE_STEPS.SELECT_CRIMPING_TOOL) {
        if (procedureStep.acceptedToolId !== toolId) {
          return createWrongToolUpdate(
            state,
            toolId,
            'Use the crimping tool to secure the RJ45 connector.',
          )
        }

        return {
          currentStep: RJ45_PROCEDURE_STEPS.POSITION_CONNECTOR_IN_CRIMPER,
          procedureFeedback: null,
          completedSteps: addCompletedSteps(
            state.completedSteps,
            RJ45_PROCEDURE_STEPS.SELECT_CRIMPING_TOOL,
          ),
        }
      }

      if (state.currentStep === RJ45_PROCEDURE_STEPS.SELECT_RJ45_CONNECTOR) {
        if (procedureStep.acceptedToolId !== toolId) {
          return createWrongToolUpdate(
            state,
            toolId,
            'Select the RJ45 connector for this step.',
          )
        }

        return {
          currentStep: RJ45_PROCEDURE_STEPS.ALIGN_CONNECTOR,
          procedureFeedback: null,
          completedSteps: addCompletedSteps(
            state.completedSteps,
            RJ45_PROCEDURE_STEPS.SELECT_RJ45_CONNECTOR,
          ),
        }
      }

      if (state.currentStep === RJ45_PROCEDURE_STEPS.SELECT_CUTTING_TOOL) {
        if (procedureStep.acceptedToolId !== toolId) {
          return createWrongToolUpdate(
            state,
            toolId,
            'Use the crimping tool\u2019s cutting blade for this step.',
          )
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
        return createWrongToolUpdate(
          state,
          toolId,
          'Use the wire stripper for this step.',
        )
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
            completedProcedureSteps: addCompletedProcedureSteps(
              state.completedProcedureSteps,
              ASSESSMENT_STAGE_IDS.JACKET_STRIPPED,
            ),
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

      if (
        state.currentStep === RJ45_PROCEDURE_STEPS.WIRES_TRIMMED ||
        state.currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_3
      ) {
        return {
          currentStep: RJ45_PROCEDURE_STEPS.SELECT_RJ45_CONNECTOR,
          procedureFeedback: null,
        }
      }

      if (
        state.currentStep === RJ45_PROCEDURE_STEPS.CONDUCTORS_INSERTED ||
        state.currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_4
      ) {
        return {
          currentStep: RJ45_PROCEDURE_STEPS.SELECT_CRIMPING_TOOL,
          procedureFeedback: null,
        }
      }

      if (
        state.currentStep === RJ45_PROCEDURE_STEPS.CRIMP_COMPLETE ||
        state.currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_5
      ) {
        return {
          currentStep: RJ45_PROCEDURE_STEPS.SELECT_CABLE_TESTER,
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
            completedProcedureSteps: addCompletedProcedureSteps(
              state.completedProcedureSteps,
              ASSESSMENT_STAGE_IDS.PAIRS_SEPARATED,
            ),
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
        !isValidWireId(wireId)
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
      const sourceSlotIndex = state.wirePlacements.indexOf(wireId)

      if (
        !isArrangementStep(state.currentStep) ||
        state.isProcedureAnimating ||
        !isValidSlotNumber(slotNumber) ||
        !isValidWireId(wireId)
      ) {
        return {}
      }

      if (sourceSlotIndex === slotIndex) {
        return {
          selectedWireId: null,
          procedureFeedback: null,
        }
      }

      const previousWirePlacements = [...state.wirePlacements]
      const wirePlacements = [...state.wirePlacements]
      const displacedWireId = wirePlacements[slotIndex]

      if (sourceSlotIndex >= 0) {
        wirePlacements[sourceSlotIndex] = displacedWireId ?? null
      }

      wirePlacements[slotIndex] = wireId
      const placedWireCount = wirePlacements.filter(Boolean).length

      return {
        currentStep:
          placedWireCount === WIRE_COUNT
            ? RJ45_PROCEDURE_STEPS.VALIDATE_T568B
            : RJ45_PROCEDURE_STEPS.ARRANGE_T568B,
        selectedWireId:
          sourceSlotIndex === -1 && displacedWireId
            ? displacedWireId
            : null,
        wirePlacements,
        placementHistory: [
          ...state.placementHistory,
          { wireId, slotNumber, previousWirePlacements },
        ],
        wireValidationResults: emptyValidationResults(),
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

      if (lastPlacement.previousWirePlacements) {
        const wirePlacements = [...lastPlacement.previousWirePlacements]
        const placedWireCount = wirePlacements.filter(Boolean).length

        return {
          currentStep:
            placedWireCount === WIRE_COUNT
              ? RJ45_PROCEDURE_STEPS.VALIDATE_T568B
              : RJ45_PROCEDURE_STEPS.ARRANGE_T568B,
          selectedWireId: null,
          wirePlacements,
          placementHistory,
          wireValidationResults: emptyValidationResults(),
          placedWireCount,
          procedureFeedback: null,
        }
      }

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
            procedureRetryCount: state.procedureRetryCount + 1,
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
        const mistakeUpdate = createMistakeUpdate(
          state,
          ASSESSMENT_MISTAKE_TYPES.INCORRECT_T568B,
          `incorrect-t568b:${state.wirePlacements.join(':')}`,
        )

        return {
          ...mistakeUpdate,
          currentStep: RJ45_PROCEDURE_STEPS.VALIDATE_T568B,
          selectedWireId: null,
          wireValidationResults,
          t568bValidationAttempts: state.t568bValidationAttempts + 1,
          procedureFeedback:
            'Arrangement does not match T568B. Review the conductor order and try again.',
        }
      }

      return {
        currentStep: RJ45_PROCEDURE_STEPS.WIRES_ARRANGED,
        selectedWireId: null,
        wireValidationResults,
        procedureFeedback: 'T568B arrangement correct.',
        t568bValidationAttempts: state.t568bValidationAttempts + 1,
        completedProcedureSteps: addCompletedProcedureSteps(
          state.completedProcedureSteps,
          ASSESSMENT_STAGE_IDS.T568B_ARRANGED,
        ),
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
            completedProcedureSteps: addCompletedProcedureSteps(
              state.completedProcedureSteps,
              ASSESSMENT_STAGE_IDS.CONDUCTORS_TRIMMED,
            ),
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
        completedProcedureSteps: removeCompletedProcedureSteps(
          state.completedProcedureSteps,
          ASSESSMENT_STAGE_IDS.CONDUCTORS_TRIMMED,
        ),
        completedSteps: state.completedSteps.filter(
          (stepId) => !trimmingSteps.includes(stepId),
        ),
      }
    })
  },
  startConnectorAlignment: () => {
    set((state) =>
      state.activeModuleId === RJ45_MODULE_ID &&
      state.trainingStarted &&
      state.currentStep === RJ45_PROCEDURE_STEPS.ALIGN_CONNECTOR &&
      !state.connectorAligned &&
      !state.isProcedureAnimating
        ? {
            procedureFeedback: null,
            isProcedureAnimating: true,
            isConnectorAligning: true,
          }
        : {},
    )
  },
  completeConnectorAlignment: () => {
    set((state) =>
      state.currentStep === RJ45_PROCEDURE_STEPS.ALIGN_CONNECTOR &&
      state.isProcedureAnimating &&
      state.isConnectorAligning
        ? {
            currentStep: RJ45_PROCEDURE_STEPS.INSERT_CONDUCTORS,
            connectorAligned: true,
            connectorOrientationConfirmed: true,
            isProcedureAnimating: false,
            isConnectorAligning: false,
            procedureFeedback: null,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              RJ45_PROCEDURE_STEPS.ALIGN_CONNECTOR,
            ),
          }
        : {},
    )
  },
  startConductorInsertion: () => {
    set((state) => {
      if (
        state.currentStep === RJ45_PROCEDURE_STEPS.ALIGN_CONNECTOR &&
        !state.connectorAligned &&
        !state.isProcedureAnimating
      ) {
        return createProcedureMistakeUpdate(
          state,
          'connector-insertion-before-alignment',
          'Align the connector before insertion.',
        )
      }

      if (
        state.currentStep !== RJ45_PROCEDURE_STEPS.INSERT_CONDUCTORS ||
        !state.connectorAligned ||
        state.isProcedureAnimating ||
        state.conductorsInserted
      ) {
        return {}
      }

      return {
        currentStep: RJ45_PROCEDURE_STEPS.INSERTING_CONDUCTORS,
        procedureFeedback: null,
        isProcedureAnimating: true,
        isConnectorInserting: true,
        insertionValidationResults: emptyInsertionValidationResults(),
      }
    })
  },
  completeConductorInsertion: () => {
    set((state) =>
      state.currentStep === RJ45_PROCEDURE_STEPS.INSERTING_CONDUCTORS &&
      state.isProcedureAnimating &&
      state.isConnectorInserting
        ? {
            currentStep: RJ45_PROCEDURE_STEPS.VERIFY_INSERTION,
            isProcedureAnimating: false,
            isConnectorInserting: false,
            procedureFeedback: null,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              RJ45_PROCEDURE_STEPS.INSERT_CONDUCTORS,
              RJ45_PROCEDURE_STEPS.INSERTING_CONDUCTORS,
            ),
          }
        : {},
    )
  },
  verifyConductorInsertion: () => {
    set((state) => {
      if (state.currentStep !== RJ45_PROCEDURE_STEPS.VERIFY_INSERTION) {
        return {}
      }

      const insertionValidationResults = state.wirePlacements.map(
        (wireId, index) =>
          state.wiresTrimmed &&
          state.connectorAligned &&
          state.connectorOrientationConfirmed &&
          wireId === T568B_SEQUENCE[index]
            ? 'correct'
            : 'incorrect',
      )
      const failedPins = insertionValidationResults
        .map((result, index) => (result === 'incorrect' ? index + 1 : null))
        .filter(Boolean)
      const isInsertionCorrect =
        failedPins.length === 0 &&
        state.connectorOrientationConfirmed &&
        state.wirePlacements.length === WIRE_COUNT

      if (!isInsertionCorrect) {
        return {
          ...createProcedureMistakeUpdate(
            state,
            `insertion-verification:${failedPins.join('-')}`,
            `One or more conductors are not fully inserted. Check pin${
              failedPins.length === 1 ? '' : 's'
            }: ${failedPins.join(', ')}.`,
          ),
          conductorsInserted: false,
          insertionValidationResults,
        }
      }

      return {
        currentStep: RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_4,
        conductorsInserted: true,
        insertionValidationResults,
        procedureFeedback: 'All conductors are fully inserted.',
        completedProcedureSteps: addCompletedProcedureSteps(
          state.completedProcedureSteps,
          ASSESSMENT_STAGE_IDS.CONNECTOR_INSERTED,
        ),
        completedSteps: addCompletedSteps(
          state.completedSteps,
          RJ45_PROCEDURE_STEPS.VERIFY_INSERTION,
          RJ45_PROCEDURE_STEPS.CONDUCTORS_INSERTED,
          RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_4,
        ),
      }
    })
  },
  retryConductorInsertion: () => {
    set((state) =>
      state.currentStep === RJ45_PROCEDURE_STEPS.VERIFY_INSERTION &&
      state.insertionValidationResults.includes('incorrect')
        ? {
            currentStep: RJ45_PROCEDURE_STEPS.INSERT_CONDUCTORS,
            procedureFeedback: null,
            isProcedureAnimating: false,
            isConnectorInserting: false,
            conductorsInserted: false,
            insertionValidationResults: emptyInsertionValidationResults(),
            procedureRetryCount: state.procedureRetryCount + 1,
          }
        : {},
    )
  },
  restartConnectorInsertion: () => {
    set((state) => {
      const insertionSteps = [
        RJ45_PROCEDURE_STEPS.SELECT_RJ45_CONNECTOR,
        RJ45_PROCEDURE_STEPS.ALIGN_CONNECTOR,
        RJ45_PROCEDURE_STEPS.INSERT_CONDUCTORS,
        RJ45_PROCEDURE_STEPS.INSERTING_CONDUCTORS,
        RJ45_PROCEDURE_STEPS.VERIFY_INSERTION,
        RJ45_PROCEDURE_STEPS.CONDUCTORS_INSERTED,
        RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_4,
      ]

      if (!insertionSteps.includes(state.currentStep)) {
        return {}
      }

      return {
        currentStep: RJ45_PROCEDURE_STEPS.SELECT_RJ45_CONNECTOR,
        procedureFeedback: null,
        isProcedureAnimating: false,
        connectorAligned: false,
        isConnectorAligning: false,
        isConnectorInserting: false,
        conductorsInserted: false,
        insertionValidationResults: emptyInsertionValidationResults(),
        connectorOrientationConfirmed: false,
        completedProcedureSteps: removeCompletedProcedureSteps(
          state.completedProcedureSteps,
          ASSESSMENT_STAGE_IDS.CONNECTOR_INSERTED,
        ),
        completedSteps: state.completedSteps.filter(
          (stepId) => !insertionSteps.includes(stepId),
        ),
      }
    })
  },
  startConnectorPositioning: (toolId) => {
    set((state) => {
      if (toolId !== TOOL_IDS.CRIMPING_TOOL) {
        return createWrongToolUpdate(
          state,
          toolId,
          'Use the crimping tool for this step.',
        )
      }

      if (
        state.currentStep ===
          RJ45_PROCEDURE_STEPS.POSITION_CONNECTOR_IN_CRIMPER &&
        !state.conductorsInserted
      ) {
        return createProcedureMistakeUpdate(
          state,
          'position-connector-before-insertion',
          'Verify conductor insertion before positioning the connector.',
        )
      }

      if (
        state.currentStep !==
          RJ45_PROCEDURE_STEPS.POSITION_CONNECTOR_IN_CRIMPER ||
        !state.conductorsInserted ||
        state.connectorPositionedForCrimp ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      return {
        isProcedureAnimating: true,
        isConnectorPositioning: true,
        procedureFeedback: null,
      }
    })
  },
  completeConnectorPositioning: () => {
    set((state) =>
      state.currentStep ===
        RJ45_PROCEDURE_STEPS.POSITION_CONNECTOR_IN_CRIMPER &&
      state.isProcedureAnimating &&
      state.isConnectorPositioning
        ? {
            currentStep: RJ45_PROCEDURE_STEPS.READY_TO_CRIMP,
            connectorPositionedForCrimp: true,
            isConnectorPositioning: false,
            isProcedureAnimating: false,
            procedureFeedback: null,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              RJ45_PROCEDURE_STEPS.POSITION_CONNECTOR_IN_CRIMPER,
            ),
          }
        : {},
    )
  },
  startConnectorCrimping: (toolId) => {
    set((state) => {
      if (toolId !== TOOL_IDS.CRIMPING_TOOL) {
        return createWrongToolUpdate(
          state,
          toolId,
          'Use the crimping tool for this step.',
        )
      }

      if (!state.connectorPositionedForCrimp) {
        return createProcedureMistakeUpdate(
          state,
          'crimp-before-positioning',
          'Position the connector inside the crimping slot first.',
        )
      }

      if (
        state.currentStep !== RJ45_PROCEDURE_STEPS.READY_TO_CRIMP ||
        state.isProcedureAnimating ||
        state.isCrimping ||
        state.crimpComplete
      ) {
        return {}
      }

      return {
        currentStep: RJ45_PROCEDURE_STEPS.CRIMPING,
        isProcedureAnimating: true,
        isCrimping: true,
        procedureFeedback: null,
      }
    })
  },
  completeConnectorCrimping: () => {
    set((state) => {
      if (
        state.currentStep !== RJ45_PROCEDURE_STEPS.CRIMPING ||
        !state.isProcedureAnimating ||
        !state.isCrimping
      ) {
        return {}
      }

      const t568bVerified = state.wirePlacements.every(
        (wireId, index) => wireId === T568B_SEQUENCE[index],
      )
      const conductorsReachedContacts =
        state.insertionValidationResults.length === WIRE_COUNT &&
        state.insertionValidationResults.every(
          (result) => result === 'correct',
        )
      const verificationPassed =
        state.conductorsInserted &&
        state.connectorPositionedForCrimp &&
        conductorsReachedContacts &&
        t568bVerified

      if (!verificationPassed) {
        return {
          ...createProcedureMistakeUpdate(
            state,
            'crimp-before-verification',
            'Verify the connector insertion before attempting the crimp.',
          ),
          currentStep: RJ45_PROCEDURE_STEPS.READY_TO_CRIMP,
          isProcedureAnimating: false,
          isCrimping: false,
        }
      }

      return {
        currentStep: RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_5,
        isProcedureAnimating: false,
        isCrimping: false,
        crimpComplete: true,
        contactsSeated: WIRE_COUNT,
        strainReliefSecured: true,
        crimpVerification: {
          connectorInserted: true,
          connectorPositioned: true,
          contactsSeated: WIRE_COUNT,
          strainReliefSecured: true,
          t568bVerified: true,
        },
        procedureFeedback: 'Crimp completed successfully.',
        completedProcedureSteps: addCompletedProcedureSteps(
          state.completedProcedureSteps,
          ASSESSMENT_STAGE_IDS.CONNECTOR_CRIMPED,
        ),
        completedSteps: addCompletedSteps(
          state.completedSteps,
          RJ45_PROCEDURE_STEPS.READY_TO_CRIMP,
          RJ45_PROCEDURE_STEPS.CRIMPING,
          RJ45_PROCEDURE_STEPS.CRIMP_COMPLETE,
          RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_5,
        ),
      }
    })
  },
  restartConnectorCrimping: () => {
    set((state) => {
      const crimpingSteps = [
        RJ45_PROCEDURE_STEPS.SELECT_CRIMPING_TOOL,
        RJ45_PROCEDURE_STEPS.POSITION_CONNECTOR_IN_CRIMPER,
        RJ45_PROCEDURE_STEPS.READY_TO_CRIMP,
        RJ45_PROCEDURE_STEPS.CRIMPING,
        RJ45_PROCEDURE_STEPS.CRIMP_COMPLETE,
        RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_5,
      ]

      if (!crimpingSteps.includes(state.currentStep)) {
        return {}
      }

      return {
        currentStep: RJ45_PROCEDURE_STEPS.SELECT_CRIMPING_TOOL,
        procedureFeedback: null,
        isProcedureAnimating: false,
        connectorPositionedForCrimp: false,
        isConnectorPositioning: false,
        isCrimping: false,
        crimpComplete: false,
        contactsSeated: 0,
        strainReliefSecured: false,
        crimpVerification: emptyCrimpVerification(),
        completedProcedureSteps: removeCompletedProcedureSteps(
          state.completedProcedureSteps,
          ASSESSMENT_STAGE_IDS.CONNECTOR_CRIMPED,
        ),
        completedSteps: state.completedSteps.filter(
          (stepId) => !crimpingSteps.includes(stepId),
        ),
      }
    })
  },
  startCableTesterConnection: (toolId) => {
    set((state) => {
      if (toolId !== TOOL_IDS.CABLE_TESTER) {
        return createWrongToolUpdate(
          state,
          toolId,
          'Select the cable tester for this step.',
        )
      }

      if (
        state.currentStep === RJ45_PROCEDURE_STEPS.CONNECT_CABLE_TO_TESTER &&
        !state.crimpComplete
      ) {
        return createProcedureMistakeUpdate(
          state,
          'tester-connection-before-crimp',
          'Complete the connector crimp before cable testing.',
        )
      }

      if (
        state.currentStep !== RJ45_PROCEDURE_STEPS.CONNECT_CABLE_TO_TESTER ||
        !state.crimpComplete ||
        state.cableConnectedToTester ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      return {
        isProcedureAnimating: true,
        isCableConnecting: true,
        procedureFeedback: null,
      }
    })
  },
  completeCableTesterConnection: () => {
    set((state) =>
      state.currentStep === RJ45_PROCEDURE_STEPS.CONNECT_CABLE_TO_TESTER &&
      state.isProcedureAnimating &&
      state.isCableConnecting
        ? {
            currentStep: RJ45_PROCEDURE_STEPS.READY_TO_TEST,
            cableConnectedToTester: true,
            isCableConnecting: false,
            isProcedureAnimating: false,
            procedureFeedback: null,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              RJ45_PROCEDURE_STEPS.CONNECT_CABLE_TO_TESTER,
            ),
          }
        : {},
    )
  },
  startCableTest: (toolId) => {
    set((state) => {
      if (toolId !== TOOL_IDS.CABLE_TESTER) {
        return createWrongToolUpdate(
          state,
          toolId,
          'Use the cable tester for this step.',
        )
      }

      if (
        state.currentStep === RJ45_PROCEDURE_STEPS.READY_TO_TEST &&
        !state.cableConnectedToTester
      ) {
        return createProcedureMistakeUpdate(
          state,
          'test-before-connection',
          'Connect the terminated cable before running the test.',
        )
      }

      if (
        state.currentStep !== RJ45_PROCEDURE_STEPS.READY_TO_TEST ||
        !state.cableConnectedToTester ||
        state.isProcedureAnimating ||
        state.isCableTesting
      ) {
        return {}
      }

      return {
        currentStep: RJ45_PROCEDURE_STEPS.TESTING_CABLE,
        isProcedureAnimating: true,
        isCableTesting: true,
        cableTestProgress: 0,
        cableTestResults: createPendingCableTestResults(),
        finalTestResult: null,
        moduleCompleted: false,
        procedureFeedback: null,
      }
    })
  },
  updateCableTestProgress: (progress) => {
    set((state) => {
      if (
        state.currentStep !== RJ45_PROCEDURE_STEPS.TESTING_CABLE ||
        !state.isCableTesting
      ) {
        return {}
      }

      const cableTestProgress = Math.min(Math.max(progress, 0), 1)
      const completedPinCount = Math.min(
        Math.floor(cableTestProgress * TEST_PIN_COUNT),
        TEST_PIN_COUNT,
      )
      const outcome = getCableTestOutcome(state)
      const cableTestResults = outcome.pinResults.map((result, index) => {
        if (index < completedPinCount) {
          return result
        }

        if (index === completedPinCount && cableTestProgress < 1) {
          return TEST_PIN_STATUSES.TESTING
        }

        return TEST_PIN_STATUSES.PENDING
      })

      return { cableTestProgress, cableTestResults }
    })
  },
  completeCableTest: () => {
    set((state) => {
      if (
        state.currentStep !== RJ45_PROCEDURE_STEPS.TESTING_CABLE ||
        !state.isCableTesting
      ) {
        return {}
      }

      const outcome = getCableTestOutcome(state)
      const completedProcedureSteps = outcome.passed
        ? addCompletedProcedureSteps(
            state.completedProcedureSteps,
            ASSESSMENT_STAGE_IDS.CABLE_TESTED,
          )
        : state.completedProcedureSteps
      const assessmentEndTime = outcome.passed ? Date.now() : null
      const assessmentResult = outcome.passed
        ? calculateAssessmentResult({
            ...state,
            assessmentEndTime,
            completedProcedureSteps,
          })
        : {}

      return {
        currentStep: RJ45_PROCEDURE_STEPS.TEST_RESULT,
        isProcedureAnimating: false,
        isCableTesting: false,
        cableTestProgress: 1,
        cableTestResults: outcome.pinResults,
        finalTestResult: outcome.finalResult,
        procedureFeedback: null,
        completedProcedureSteps,
        ...(outcome.passed
          ? {
              assessmentEndTime,
              ...assessmentResult,
            }
          : {}),
        completedSteps: addCompletedSteps(
          state.completedSteps,
          RJ45_PROCEDURE_STEPS.READY_TO_TEST,
          RJ45_PROCEDURE_STEPS.TESTING_CABLE,
          RJ45_PROCEDURE_STEPS.TEST_RESULT,
        ),
      }
    })
  },
  completeRJ45Module: () => {
    set((state) =>
      state.currentStep === RJ45_PROCEDURE_STEPS.TEST_RESULT &&
      state.finalTestResult === 'PASS'
        ? {
            currentStep: RJ45_PROCEDURE_STEPS.RJ45_MODULE_COMPLETE,
            moduleCompleted: true,
            completedSteps: addCompletedSteps(
              state.completedSteps,
              RJ45_PROCEDURE_STEPS.RJ45_MODULE_COMPLETE,
            ),
          }
        : {},
    )
  },
  restartCableTesting: () => {
    set((state) => {
      const testingSteps = [
        RJ45_PROCEDURE_STEPS.SELECT_CABLE_TESTER,
        RJ45_PROCEDURE_STEPS.CONNECT_CABLE_TO_TESTER,
        RJ45_PROCEDURE_STEPS.READY_TO_TEST,
        RJ45_PROCEDURE_STEPS.TESTING_CABLE,
        RJ45_PROCEDURE_STEPS.TEST_RESULT,
        RJ45_PROCEDURE_STEPS.RJ45_MODULE_COMPLETE,
      ]

      if (!testingSteps.includes(state.currentStep)) {
        return {}
      }

      return {
        currentStep: RJ45_PROCEDURE_STEPS.SELECT_CABLE_TESTER,
        procedureFeedback: null,
        isProcedureAnimating: false,
        cableConnectedToTester: false,
        isCableConnecting: false,
        isCableTesting: false,
        cableTestProgress: 0,
        cableTestResults: createPendingCableTestResults(),
        finalTestResult: null,
        moduleCompleted: false,
        completedProcedureSteps: removeCompletedProcedureSteps(
          state.completedProcedureSteps,
          ASSESSMENT_STAGE_IDS.CABLE_TESTED,
        ),
        completedSteps: state.completedSteps.filter(
          (stepId) => !testingSteps.includes(stepId),
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
