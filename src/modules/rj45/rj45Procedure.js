import { TOOL_IDS } from '../../tools/toolConfigs.js'

const RJ45_MODULE_ID = 'rj45-cable-termination'
const ETHERNET_CABLE_ID = 'ethernet-cable'

const RJ45_PROCEDURE_STEPS = Object.freeze({
  NOT_STARTED: 'not-started',
  SELECT_CABLE: 'select-cable',
  SELECT_WIRE_STRIPPER: 'select-wire-stripper',
  STRIP_JACKET: 'strip-jacket',
  JACKET_STRIPPED: 'jacket-stripped',
  COMPLETE_FOR_TASK_1: 'complete-for-task-1',
})

const rj45Procedure = Object.freeze({
  [RJ45_PROCEDURE_STEPS.NOT_STARTED]: Object.freeze({
    id: RJ45_PROCEDURE_STEPS.NOT_STARTED,
    stepNumber: 0,
    title: 'Ready to Begin',
    instruction: 'Select Begin Training to start the RJ45 procedure.',
    acceptedAction: 'begin-training',
  }),
  [RJ45_PROCEDURE_STEPS.SELECT_CABLE]: Object.freeze({
    id: RJ45_PROCEDURE_STEPS.SELECT_CABLE,
    stepNumber: 1,
    title: 'Select the Cable',
    instruction: 'Step 1: Select the Ethernet cable.',
    acceptedAction: 'select-workpiece',
    acceptedWorkpieceId: ETHERNET_CABLE_ID,
  }),
  [RJ45_PROCEDURE_STEPS.SELECT_WIRE_STRIPPER]: Object.freeze({
    id: RJ45_PROCEDURE_STEPS.SELECT_WIRE_STRIPPER,
    stepNumber: 2,
    title: 'Choose the Correct Tool',
    instruction: 'Step 2: Select the wire stripper.',
    acceptedAction: 'select-tool',
    acceptedToolId: TOOL_IDS.WIRE_STRIPPER,
  }),
  [RJ45_PROCEDURE_STEPS.STRIP_JACKET]: Object.freeze({
    id: RJ45_PROCEDURE_STEPS.STRIP_JACKET,
    stepNumber: 3,
    title: 'Remove the Outer Jacket',
    instruction: 'Step 3: Use the wire stripper on the Ethernet cable.',
    acceptedAction: 'strip-jacket',
    acceptedToolId: TOOL_IDS.WIRE_STRIPPER,
    acceptedWorkpieceId: ETHERNET_CABLE_ID,
  }),
  [RJ45_PROCEDURE_STEPS.JACKET_STRIPPED]: Object.freeze({
    id: RJ45_PROCEDURE_STEPS.JACKET_STRIPPED,
    stepNumber: 3,
    title: 'Jacket Removed',
    instruction: 'Jacket removed successfully.',
    acceptedAction: null,
  }),
  [RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_1]: Object.freeze({
    id: RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_1,
    stepNumber: 3,
    title: 'Jacket Removed',
    instruction: 'Jacket removed successfully.',
    nextInstruction: 'Next procedure: Arrange the wire pairs.',
    acceptedAction: null,
  }),
})

function getRJ45ProcedureStep(stepId) {
  return rj45Procedure[stepId] ?? rj45Procedure[RJ45_PROCEDURE_STEPS.NOT_STARTED]
}

export {
  ETHERNET_CABLE_ID,
  getRJ45ProcedureStep,
  RJ45_MODULE_ID,
  RJ45_PROCEDURE_STEPS,
  rj45Procedure,
}
