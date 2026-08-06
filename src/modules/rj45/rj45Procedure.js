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
  SEPARATE_PAIRS: 'separate-pairs',
  PAIRS_SEPARATED: 'pairs-separated',
  ARRANGE_T568B: 'arrange-t568b',
  VALIDATE_T568B: 'validate-t568b',
  WIRES_ARRANGED: 'wires-arranged',
  COMPLETE_FOR_TASK_2: 'complete-for-task-2',
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
    acceptedAction: 'continue',
  }),
  [RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_1]: Object.freeze({
    id: RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_1,
    stepNumber: 3,
    title: 'Jacket Removed',
    instruction: 'Jacket removed successfully.',
    nextInstruction: 'Next procedure: Arrange the wire pairs.',
    acceptedAction: 'continue',
  }),
  [RJ45_PROCEDURE_STEPS.SEPARATE_PAIRS]: Object.freeze({
    id: RJ45_PROCEDURE_STEPS.SEPARATE_PAIRS,
    stepNumber: 4,
    title: 'Separate the Wire Pairs',
    instruction: 'Step 4: Separate the wire pairs.',
    acceptedAction: 'separate-pairs',
  }),
  [RJ45_PROCEDURE_STEPS.PAIRS_SEPARATED]: Object.freeze({
    id: RJ45_PROCEDURE_STEPS.PAIRS_SEPARATED,
    stepNumber: 4,
    title: 'Wire Pairs Separated',
    instruction: 'The exposed wire pairs are ready for arrangement.',
    acceptedAction: null,
  }),
  [RJ45_PROCEDURE_STEPS.ARRANGE_T568B]: Object.freeze({
    id: RJ45_PROCEDURE_STEPS.ARRANGE_T568B,
    stepNumber: 5,
    title: 'Arrange the Conductors',
    instruction: 'Step 5: Arrange the wires using the T568B standard.',
    acceptedAction: 'arrange-wires',
  }),
  [RJ45_PROCEDURE_STEPS.VALIDATE_T568B]: Object.freeze({
    id: RJ45_PROCEDURE_STEPS.VALIDATE_T568B,
    stepNumber: 5,
    title: 'Validate the Arrangement',
    instruction: 'Step 5: Validate the completed T568B wire order.',
    acceptedAction: 'validate-wires',
  }),
  [RJ45_PROCEDURE_STEPS.WIRES_ARRANGED]: Object.freeze({
    id: RJ45_PROCEDURE_STEPS.WIRES_ARRANGED,
    stepNumber: 5,
    title: 'Wires Arranged',
    instruction: 'Correct T568B arrangement.',
    acceptedAction: null,
  }),
  [RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_2]: Object.freeze({
    id: RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_2,
    stepNumber: 5,
    title: 'T568B Arrangement Complete',
    instruction: 'All eight conductors are in the correct order.',
    nextInstruction: 'Next procedure: Trim the wire ends evenly.',
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
