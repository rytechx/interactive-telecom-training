import { FIBER_TOOL_IDS } from './fiberToolConfigs.js'

const FIBER_MODULE_ID = 'fiber-optic-fusion-splicing'
const FIBER_CABLE_ID = 'fiber-optic-cable'
const FIBER_JACKET_STRIPPING_DURATION = 1.35
const FIBER_COATING_STRIPPING_DURATION = 1.45
const FIBER_CLEANING_DURATION = 1.2
const FIBER_POSITIONING_DURATION = 0.85
const FIBER_CLEAVING_DURATION = 1.35
const FIBER_TOTAL_STEPS = 8

const FIBER_PROCEDURE_STEPS = Object.freeze({
  NOT_STARTED: 'fiber-not-started',
  SELECT_FIBER_CABLE: 'select-fiber-cable',
  SELECT_JACKET_STRIPPER: 'select-fiber-jacket-stripper',
  STRIP_OUTER_JACKET: 'strip-fiber-outer-jacket',
  STRIPPING_OUTER_JACKET: 'stripping-fiber-outer-jacket',
  OUTER_JACKET_REMOVED: 'fiber-outer-jacket-removed',
  TASK_1_COMPLETE: 'fiber-task-1-complete',
  SELECT_PRECISION_STRIPPER: 'select-precision-fiber-stripper',
  STRIP_FIBER_COATING: 'strip-fiber-coating',
  STRIPPING_FIBER_COATING: 'stripping-fiber-coating',
  COATING_REMOVED: 'fiber-coating-removed',
  SELECT_CLEANING_TOOL: 'select-fiber-cleaning-tool',
  CLEAN_BARE_FIBER: 'clean-bare-fiber',
  CLEANING_FIBER: 'cleaning-fiber',
  FIBER_CLEANED: 'fiber-cleaned',
  SELECT_FIBER_CLEAVER: 'select-fiber-cleaver',
  POSITION_FIBER_IN_CLEAVER: 'position-fiber-in-cleaver',
  POSITIONING_FIBER_IN_CLEAVER: 'positioning-fiber-in-cleaver',
  FIBER_POSITIONED_FOR_CLEAVE: 'fiber-positioned-for-cleave',
  CLEAVE_FIBER: 'cleave-fiber',
  CLEAVING_FIBER: 'cleaving-fiber',
  FIBER_CLEAVED: 'fiber-cleaved',
  TASK_2_COMPLETE: 'fiber-task-2-complete',
  LOAD_SPLICER: 'load-fusion-splicer',
  ALIGN_FIBERS: 'align-fibers',
  FUSION_SPLICE: 'fusion-splice',
  PROTECTION_SLEEVE: 'apply-protection-sleeve',
  HEAT_SHRINK: 'heat-shrink-sleeve',
  TEST_SPLICE: 'test-fiber-splice',
})

const fiberProcedure = Object.freeze({
  [FIBER_PROCEDURE_STEPS.NOT_STARTED]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.NOT_STARTED,
    stepNumber: 0,
    title: 'Ready to Begin',
    instruction: 'Select Begin Training to start fiber cable preparation.',
    acceptedAction: 'begin-training',
  }),
  [FIBER_PROCEDURE_STEPS.SELECT_FIBER_CABLE]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.SELECT_FIBER_CABLE,
    stepNumber: 1,
    title: 'Select the Fiber Cable',
    instruction: 'Inspect and select the fiber optic cable.',
    acceptedAction: 'select-workpiece',
    acceptedWorkpieceId: FIBER_CABLE_ID,
  }),
  [FIBER_PROCEDURE_STEPS.SELECT_JACKET_STRIPPER]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.SELECT_JACKET_STRIPPER,
    stepNumber: 2,
    title: 'Select the Jacket Stripper',
    instruction: 'Select the fiber jacket stripper.',
    acceptedAction: 'select-tool',
    acceptedToolId: FIBER_TOOL_IDS.JACKET_STRIPPER,
  }),
  [FIBER_PROCEDURE_STEPS.STRIP_OUTER_JACKET]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.STRIP_OUTER_JACKET,
    stepNumber: 3,
    title: 'Remove the Outer Jacket',
    instruction: 'Use the fiber jacket stripper on the marked cable section.',
    acceptedAction: 'strip-outer-jacket',
    acceptedToolId: FIBER_TOOL_IDS.JACKET_STRIPPER,
    acceptedWorkpieceId: FIBER_CABLE_ID,
  }),
  [FIBER_PROCEDURE_STEPS.STRIPPING_OUTER_JACKET]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.STRIPPING_OUTER_JACKET,
    stepNumber: 3,
    title: 'Removing the Outer Jacket',
    instruction: 'Removing the jacket without damaging the inner buffer...',
    acceptedAction: null,
  }),
  [FIBER_PROCEDURE_STEPS.OUTER_JACKET_REMOVED]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.OUTER_JACKET_REMOVED,
    stepNumber: 3,
    title: 'Outer Jacket Removed',
    instruction: 'Outer jacket removed successfully.',
    acceptedAction: null,
  }),
  [FIBER_PROCEDURE_STEPS.TASK_1_COMPLETE]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.TASK_1_COMPLETE,
    stepNumber: 3,
    title: 'Outer Jacket Removed',
    instruction: 'Outer jacket removed successfully.',
    nextInstruction: 'Next procedure: Remove the fiber coating.',
    acceptedAction: 'continue',
  }),
  [FIBER_PROCEDURE_STEPS.SELECT_PRECISION_STRIPPER]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.SELECT_PRECISION_STRIPPER,
    stepNumber: 4,
    title: 'Select the Precision Stripper',
    instruction: 'Select the precision fiber stripper.',
    acceptedAction: 'select-tool',
    acceptedToolId: FIBER_TOOL_IDS.PRECISION_STRIPPER,
  }),
  [FIBER_PROCEDURE_STEPS.STRIP_FIBER_COATING]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.STRIP_FIBER_COATING,
    stepNumber: 5,
    title: 'Remove the Fiber Coating',
    instruction: 'Use the precision stripper on the exposed fiber section.',
    acceptedAction: 'strip-fiber-coating',
    acceptedToolId: FIBER_TOOL_IDS.PRECISION_STRIPPER,
    acceptedWorkpieceId: FIBER_CABLE_ID,
  }),
  [FIBER_PROCEDURE_STEPS.STRIPPING_FIBER_COATING]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.STRIPPING_FIBER_COATING,
    stepNumber: 5,
    title: 'Removing the Fiber Coating',
    instruction: 'Removing the coating without damaging the glass fiber...',
    acceptedAction: null,
  }),
  [FIBER_PROCEDURE_STEPS.COATING_REMOVED]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.COATING_REMOVED,
    stepNumber: 5,
    title: 'Fiber Coating Removed',
    instruction: 'Fiber coating removed successfully.',
    nextInstruction: 'Next procedure: Clean the bare fiber.',
    acceptedAction: 'continue',
  }),
  [FIBER_PROCEDURE_STEPS.SELECT_CLEANING_TOOL]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.SELECT_CLEANING_TOOL,
    stepNumber: 6,
    title: 'Select the Cleaning Wipe',
    instruction: 'Select the lint-free fiber cleaning wipe.',
    acceptedAction: 'select-tool',
    acceptedToolId: FIBER_TOOL_IDS.CLEANING_PAD,
  }),
  [FIBER_PROCEDURE_STEPS.CLEAN_BARE_FIBER]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.CLEAN_BARE_FIBER,
    stepNumber: 6,
    title: 'Clean the Bare Fiber',
    instruction: 'Use the lint-free wipe on the exposed bare fiber.',
    acceptedAction: 'clean-bare-fiber',
    acceptedToolId: FIBER_TOOL_IDS.CLEANING_PAD,
    acceptedWorkpieceId: FIBER_CABLE_ID,
  }),
  [FIBER_PROCEDURE_STEPS.CLEANING_FIBER]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.CLEANING_FIBER,
    stepNumber: 6,
    title: 'Cleaning the Bare Fiber',
    instruction: 'Cleaning residue from the exposed glass fiber...',
    acceptedAction: null,
  }),
  [FIBER_PROCEDURE_STEPS.FIBER_CLEANED]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.FIBER_CLEANED,
    stepNumber: 6,
    title: 'Bare Fiber Cleaned',
    instruction: 'Bare fiber cleaned successfully.',
    nextInstruction: 'Next procedure: Cleave the fiber.',
    acceptedAction: 'continue',
  }),
  [FIBER_PROCEDURE_STEPS.SELECT_FIBER_CLEAVER]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.SELECT_FIBER_CLEAVER,
    stepNumber: 7,
    title: 'Select the Fiber Cleaver',
    instruction: 'Select the fiber cleaver.',
    acceptedAction: 'select-tool',
    acceptedToolId: FIBER_TOOL_IDS.CLEAVER,
  }),
  [FIBER_PROCEDURE_STEPS.POSITION_FIBER_IN_CLEAVER]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.POSITION_FIBER_IN_CLEAVER,
    stepNumber: 7,
    title: 'Position the Fiber',
    instruction: 'Place the cleaned fiber into the cleaver guide channel.',
    acceptedAction: 'position-fiber',
    acceptedToolId: FIBER_TOOL_IDS.CLEAVER,
    acceptedWorkpieceId: FIBER_CABLE_ID,
  }),
  [FIBER_PROCEDURE_STEPS.POSITIONING_FIBER_IN_CLEAVER]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.POSITIONING_FIBER_IN_CLEAVER,
    stepNumber: 7,
    title: 'Positioning the Fiber',
    instruction: 'Aligning the bare fiber at the correct cleave length...',
    acceptedAction: null,
  }),
  [FIBER_PROCEDURE_STEPS.FIBER_POSITIONED_FOR_CLEAVE]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.FIBER_POSITIONED_FOR_CLEAVE,
    stepNumber: 8,
    title: 'Cleave the Fiber',
    instruction: 'Use the cleaver control to create a clean square fiber end.',
    acceptedAction: 'cleave-fiber',
    acceptedToolId: FIBER_TOOL_IDS.CLEAVER,
    acceptedWorkpieceId: FIBER_CABLE_ID,
  }),
  [FIBER_PROCEDURE_STEPS.CLEAVE_FIBER]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.CLEAVE_FIBER,
    stepNumber: 8,
    title: 'Cleave the Fiber',
    instruction: 'Use the cleaver control to create a clean square fiber end.',
    acceptedAction: 'cleave-fiber',
    acceptedToolId: FIBER_TOOL_IDS.CLEAVER,
  }),
  [FIBER_PROCEDURE_STEPS.CLEAVING_FIBER]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.CLEAVING_FIBER,
    stepNumber: 8,
    title: 'Cleaving the Fiber',
    instruction: 'Creating a precise, square optical fiber end...',
    acceptedAction: null,
  }),
  [FIBER_PROCEDURE_STEPS.FIBER_CLEAVED]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.FIBER_CLEAVED,
    stepNumber: 8,
    title: 'Fiber Cleaved',
    instruction: 'Fiber cleaved successfully.',
    acceptedAction: null,
  }),
  [FIBER_PROCEDURE_STEPS.TASK_2_COMPLETE]: Object.freeze({
    id: FIBER_PROCEDURE_STEPS.TASK_2_COMPLETE,
    stepNumber: 8,
    title: 'Fiber Preparation Complete',
    instruction: 'Fiber cleaved successfully.',
    nextInstruction: 'The fiber is prepared for fusion splicing. Next procedure: Load the fibers into the fusion splicer.',
    acceptedAction: null,
  }),
})

const continuationSteps = Object.freeze([
  FIBER_PROCEDURE_STEPS.TASK_1_COMPLETE,
  FIBER_PROCEDURE_STEPS.COATING_REMOVED,
  FIBER_PROCEDURE_STEPS.FIBER_CLEANED,
])

const restartableSteps = Object.freeze([
  FIBER_PROCEDURE_STEPS.STRIP_OUTER_JACKET,
  FIBER_PROCEDURE_STEPS.STRIPPING_OUTER_JACKET,
  FIBER_PROCEDURE_STEPS.OUTER_JACKET_REMOVED,
  FIBER_PROCEDURE_STEPS.TASK_1_COMPLETE,
  FIBER_PROCEDURE_STEPS.STRIP_FIBER_COATING,
  FIBER_PROCEDURE_STEPS.STRIPPING_FIBER_COATING,
  FIBER_PROCEDURE_STEPS.COATING_REMOVED,
  FIBER_PROCEDURE_STEPS.CLEAN_BARE_FIBER,
  FIBER_PROCEDURE_STEPS.CLEANING_FIBER,
  FIBER_PROCEDURE_STEPS.FIBER_CLEANED,
  FIBER_PROCEDURE_STEPS.POSITION_FIBER_IN_CLEAVER,
  FIBER_PROCEDURE_STEPS.POSITIONING_FIBER_IN_CLEAVER,
  FIBER_PROCEDURE_STEPS.FIBER_POSITIONED_FOR_CLEAVE,
  FIBER_PROCEDURE_STEPS.CLEAVE_FIBER,
  FIBER_PROCEDURE_STEPS.CLEAVING_FIBER,
  FIBER_PROCEDURE_STEPS.FIBER_CLEAVED,
  FIBER_PROCEDURE_STEPS.TASK_2_COMPLETE,
])

function getFiberProcedureStep(stepId) {
  return (
    fiberProcedure[stepId] ??
    fiberProcedure[FIBER_PROCEDURE_STEPS.NOT_STARTED]
  )
}

function isFiberContinuationStep(stepId) {
  return continuationSteps.includes(stepId)
}

function isFiberRestartableStep(stepId) {
  return restartableSteps.includes(stepId)
}

export {
  FIBER_CABLE_ID,
  FIBER_CLEANING_DURATION,
  FIBER_CLEAVING_DURATION,
  FIBER_COATING_STRIPPING_DURATION,
  FIBER_JACKET_STRIPPING_DURATION,
  FIBER_MODULE_ID,
  FIBER_POSITIONING_DURATION,
  FIBER_PROCEDURE_STEPS,
  FIBER_TOTAL_STEPS,
  fiberProcedure,
  getFiberProcedureStep,
  isFiberContinuationStep,
  isFiberRestartableStep,
}
