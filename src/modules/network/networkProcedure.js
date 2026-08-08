const NETWORK_MODULE_ID = 'network-device-installation'
const NETWORK_TOTAL_STEPS = 10

const NETWORK_PROCEDURE_STEPS = Object.freeze({
  NOT_STARTED: 'network-not-started',
  INSPECT_RACK: 'inspect-network-rack',
  SELECT_PATCH_PANEL: 'select-patch-panel',
  INSTALL_PATCH_PANEL: 'install-patch-panel',
  PATCH_PANEL_INSTALLED: 'patch-panel-installed',
  SELECT_SWITCH: 'select-managed-switch',
  INSTALL_SWITCH: 'install-managed-switch',
  SWITCH_INSTALLED: 'managed-switch-installed',
  SELECT_ROUTER: 'select-router',
  INSTALL_ROUTER: 'install-router',
  ROUTER_INSTALLED: 'router-installed',
  CONNECT_POWER: 'connect-network-power',
  POWER_CONNECTED: 'network-power-connected',
  CONNECT_PATCH_TO_SWITCH: 'connect-patch-panel-to-switch',
  PATCH_SWITCH_CONNECTED: 'patch-panel-switch-connected',
  CONNECT_SWITCH_TO_ROUTER: 'connect-switch-to-router',
  SWITCH_ROUTER_CONNECTED: 'switch-router-connected',
  CONNECT_PC_TO_SWITCH: 'connect-pc-to-switch',
  PC_SWITCH_CONNECTED: 'pc-switch-connected',
  POWER_ON_NETWORK: 'power-on-network',
  POWERING_ON_NETWORK: 'network-powering-on',
  VERIFY_LINKS: 'verify-physical-links',
  PHYSICAL_INSTALLATION_COMPLETE: 'physical-installation-complete',
})

const procedure = Object.freeze({
  [NETWORK_PROCEDURE_STEPS.NOT_STARTED]: Object.freeze({
    stepNumber: 0,
    title: 'Ready to Begin',
    instruction: 'Begin training to inspect and assemble the network rack.',
  }),
  [NETWORK_PROCEDURE_STEPS.INSPECT_RACK]: Object.freeze({
    stepNumber: 1,
    title: 'Inspect Network Rack',
    instruction: 'Inspect the empty rack rails and available mounting spaces.',
    acceptedAction: 'inspect-rack',
  }),
  [NETWORK_PROCEDURE_STEPS.SELECT_PATCH_PANEL]: Object.freeze({
    stepNumber: 2,
    title: 'Install Patch Panel',
    instruction: 'Select the 8-port patch panel on the preparation surface.',
    acceptedAction: 'select-device',
  }),
  [NETWORK_PROCEDURE_STEPS.INSTALL_PATCH_PANEL]: Object.freeze({
    stepNumber: 2,
    title: 'Install Patch Panel',
    instruction: 'Select the highlighted RU 4 mounting position.',
    acceptedAction: 'install-device',
  }),
  [NETWORK_PROCEDURE_STEPS.PATCH_PANEL_INSTALLED]: Object.freeze({
    stepNumber: 2,
    title: 'Patch Panel Installed',
    instruction: 'The patch panel is aligned and secured at RU 4.',
  }),
  [NETWORK_PROCEDURE_STEPS.SELECT_SWITCH]: Object.freeze({
    stepNumber: 3,
    title: 'Install Managed Switch',
    instruction: 'Select the managed switch on the preparation surface.',
    acceptedAction: 'select-device',
  }),
  [NETWORK_PROCEDURE_STEPS.INSTALL_SWITCH]: Object.freeze({
    stepNumber: 3,
    title: 'Install Managed Switch',
    instruction: 'Select the highlighted RU 5 mounting position.',
    acceptedAction: 'install-device',
  }),
  [NETWORK_PROCEDURE_STEPS.SWITCH_INSTALLED]: Object.freeze({
    stepNumber: 3,
    title: 'Managed Switch Installed',
    instruction: 'The switch is aligned and secured at RU 5.',
  }),
  [NETWORK_PROCEDURE_STEPS.SELECT_ROUTER]: Object.freeze({
    stepNumber: 4,
    title: 'Install Router',
    instruction: 'Select the router on the preparation surface.',
    acceptedAction: 'select-device',
  }),
  [NETWORK_PROCEDURE_STEPS.INSTALL_ROUTER]: Object.freeze({
    stepNumber: 4,
    title: 'Install Router',
    instruction: 'Select the highlighted RU 6 mounting position.',
    acceptedAction: 'install-device',
  }),
  [NETWORK_PROCEDURE_STEPS.ROUTER_INSTALLED]: Object.freeze({
    stepNumber: 4,
    title: 'Router Installed',
    instruction: 'The router is aligned and secured at RU 6.',
  }),
  [NETWORK_PROCEDURE_STEPS.CONNECT_POWER]: Object.freeze({
    stepNumber: 5,
    title: 'Connect Device Power',
    instruction:
      'Select the Router or Switch Power Cable, then choose its POWER port and matching PDU outlet.',
    acceptedAction: 'connect-power',
  }),
  [NETWORK_PROCEDURE_STEPS.POWER_CONNECTED]: Object.freeze({
    stepNumber: 5,
    title: 'Power Cables Connected',
    instruction: 'Router and switch power leads are connected to the rack PDU.',
  }),
  [NETWORK_PROCEDURE_STEPS.CONNECT_PATCH_TO_SWITCH]: Object.freeze({
    stepNumber: 6,
    title: 'Patch Panel to Switch',
    instruction:
      'Select the blue cable, then connect Patch Panel Port 1 to Switch Port 1.',
    acceptedAction: 'connect-ethernet',
  }),
  [NETWORK_PROCEDURE_STEPS.PATCH_SWITCH_CONNECTED]: Object.freeze({
    stepNumber: 6,
    title: 'Patch Link Connected',
    instruction: 'Patch Panel Port 1 is connected to Switch Port 1.',
  }),
  [NETWORK_PROCEDURE_STEPS.CONNECT_SWITCH_TO_ROUTER]: Object.freeze({
    stepNumber: 7,
    title: 'Switch to Router Uplink',
    instruction:
      'Select the yellow cable, then connect Switch Port 8 to Router LAN 1.',
    acceptedAction: 'connect-ethernet',
  }),
  [NETWORK_PROCEDURE_STEPS.SWITCH_ROUTER_CONNECTED]: Object.freeze({
    stepNumber: 7,
    title: 'Network Uplink Connected',
    instruction: 'Switch Port 8 is connected to Router LAN 1.',
  }),
  [NETWORK_PROCEDURE_STEPS.CONNECT_PC_TO_SWITCH]: Object.freeze({
    stepNumber: 8,
    title: 'Workstation Network Link',
    instruction:
      'Select the gray cable, then connect PC Ethernet to Switch Port 2.',
    acceptedAction: 'connect-ethernet',
  }),
  [NETWORK_PROCEDURE_STEPS.PC_SWITCH_CONNECTED]: Object.freeze({
    stepNumber: 8,
    title: 'Workstation Connected',
    instruction: 'The workstation Ethernet port is connected to Switch Port 2.',
  }),
  [NETWORK_PROCEDURE_STEPS.POWER_ON_NETWORK]: Object.freeze({
    stepNumber: 9,
    title: 'Power On Network',
    instruction: 'Power on the installed devices and allow links to negotiate.',
    acceptedAction: 'power-on',
  }),
  [NETWORK_PROCEDURE_STEPS.POWERING_ON_NETWORK]: Object.freeze({
    stepNumber: 9,
    title: 'Starting Network Devices',
    instruction: 'Power and link indicators are starting in sequence.',
  }),
  [NETWORK_PROCEDURE_STEPS.VERIFY_LINKS]: Object.freeze({
    stepNumber: 10,
    title: 'Verify Physical Links',
    instruction:
      'Inspect Switch Ports 1, 2, and 8, then inspect Router LAN 1.',
    acceptedAction: 'verify-links',
  }),
  [NETWORK_PROCEDURE_STEPS.PHYSICAL_INSTALLATION_COMPLETE]: Object.freeze({
    stepNumber: 10,
    title: 'Physical Installation Pass',
    instruction: 'Physical network installation completed successfully.',
  }),
})

const continuationSteps = Object.freeze([
  NETWORK_PROCEDURE_STEPS.PATCH_PANEL_INSTALLED,
  NETWORK_PROCEDURE_STEPS.SWITCH_INSTALLED,
  NETWORK_PROCEDURE_STEPS.ROUTER_INSTALLED,
  NETWORK_PROCEDURE_STEPS.POWER_CONNECTED,
  NETWORK_PROCEDURE_STEPS.PATCH_SWITCH_CONNECTED,
  NETWORK_PROCEDURE_STEPS.SWITCH_ROUTER_CONNECTED,
  NETWORK_PROCEDURE_STEPS.PC_SWITCH_CONNECTED,
])

const restartableSteps = Object.freeze(
  Object.values(NETWORK_PROCEDURE_STEPS).filter(
    (step) =>
      step !== NETWORK_PROCEDURE_STEPS.NOT_STARTED &&
      step !== NETWORK_PROCEDURE_STEPS.INSPECT_RACK,
  ),
)

function getNetworkProcedureStep(stepId) {
  return procedure[stepId] ?? procedure[NETWORK_PROCEDURE_STEPS.NOT_STARTED]
}

function isNetworkContinuationStep(stepId) {
  return continuationSteps.includes(stepId)
}

function isNetworkRestartableStep(stepId) {
  return restartableSteps.includes(stepId)
}

export {
  getNetworkProcedureStep,
  isNetworkContinuationStep,
  isNetworkRestartableStep,
  NETWORK_MODULE_ID,
  NETWORK_PROCEDURE_STEPS,
  NETWORK_TOTAL_STEPS,
}
