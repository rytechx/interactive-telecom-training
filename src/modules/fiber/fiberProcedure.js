import { FIBER_TOOL_IDS } from './fiberToolConfigs.js'

const FIBER_MODULE_ID = 'fiber-optic-fusion-splicing'
const FIBER_CABLE_ID = 'fiber-optic-cable'
const FIBER_JACKET_STRIPPING_DURATION = 1.35
const FIBER_TOTAL_STEPS = 3

const FIBER_PROCEDURE_STEPS = Object.freeze({
  NOT_STARTED: 'fiber-not-started',
  SELECT_FIBER_CABLE: 'select-fiber-cable',
  SELECT_JACKET_STRIPPER: 'select-fiber-jacket-stripper',
  STRIP_OUTER_JACKET: 'strip-fiber-outer-jacket',
  STRIPPING_OUTER_JACKET: 'stripping-fiber-outer-jacket',
  OUTER_JACKET_REMOVED: 'fiber-outer-jacket-removed',
  TASK_1_COMPLETE: 'fiber-task-1-complete',
  STRIP_COATING: 'strip-fiber-coating',
  CLEAN_FIBER: 'clean-fiber',
  CLEAVE_FIBER: 'cleave-fiber',
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
    title: 'Cable Preparation Complete',
    instruction: 'Outer jacket removed successfully.',
    nextInstruction: 'Next procedure: Remove the fiber coating/buffer layer.',
    acceptedAction: null,
  }),
})

function getFiberProcedureStep(stepId) {
  return (
    fiberProcedure[stepId] ??
    fiberProcedure[FIBER_PROCEDURE_STEPS.NOT_STARTED]
  )
}

export {
  FIBER_CABLE_ID,
  FIBER_JACKET_STRIPPING_DURATION,
  FIBER_MODULE_ID,
  FIBER_PROCEDURE_STEPS,
  FIBER_TOTAL_STEPS,
  fiberProcedure,
  getFiberProcedureStep,
}
