const NETWORK_MODULE_ID = 'network-device-installation'
const NETWORK_TOTAL_STEPS = 13

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
  CONFIGURE_PC_IPV4: 'configure-workstation-ipv4',
  PC_IPV4_CONFIGURED: 'workstation-ipv4-configured',
  OPEN_ROUTER_CLI: 'open-router-cli',
  CONFIGURE_ROUTER: 'configure-router-lan',
  ROUTER_CONFIGURED: 'router-lan-configured',
  OPEN_SWITCH_CLI: 'open-switch-cli',
  CONFIGURE_SWITCH: 'configure-switch-management',
  SWITCH_CONFIGURED: 'switch-management-configured',
  VERIFY_PC_CONFIG: 'verify-workstation-configuration',
  PC_CONFIG_VERIFIED: 'workstation-configuration-verified',
  PING_ROUTER: 'ping-router',
  ROUTER_PING_PASS: 'router-ping-pass',
  PING_SWITCH: 'ping-switch',
  SWITCH_PING_PASS: 'switch-ping-pass',
  LOGICAL_CONFIGURATION_COMPLETE: 'logical-configuration-complete',
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
  [NETWORK_PROCEDURE_STEPS.CONFIGURE_PC_IPV4]: Object.freeze({
    stepNumber: 10,
    title: 'Configure Workstation IPv4 Settings',
    instruction:
      'Open the workstation monitor and configure its IPv4 address, subnet mask, and default gateway.',
    acceptedAction: 'configure-workstation',
  }),
  [NETWORK_PROCEDURE_STEPS.PC_IPV4_CONFIGURED]: Object.freeze({
    stepNumber: 10,
    title: 'Workstation IPv4 Configured',
    instruction: 'IPv4 configuration applied successfully.',
  }),
  [NETWORK_PROCEDURE_STEPS.OPEN_ROUTER_CLI]: Object.freeze({
    stepNumber: 11,
    title: 'Configure Router LAN Interface',
    instruction: 'Open the router console to configure its G0/0 LAN interface.',
    acceptedAction: 'open-router-cli',
  }),
  [NETWORK_PROCEDURE_STEPS.CONFIGURE_ROUTER]: Object.freeze({
    stepNumber: 11,
    title: 'Configure Router LAN Interface',
    instruction:
      'Configure G0/0 with the router LAN address and enable the interface.',
    acceptedAction: 'configure-router',
  }),
  [NETWORK_PROCEDURE_STEPS.ROUTER_CONFIGURED]: Object.freeze({
    stepNumber: 11,
    title: 'Router LAN Configured',
    instruction: 'Router LAN configuration complete.',
  }),
  [NETWORK_PROCEDURE_STEPS.OPEN_SWITCH_CLI]: Object.freeze({
    stepNumber: 12,
    title: 'Configure Switch Management',
    instruction: 'Open the managed switch console to configure VLAN 1.',
    acceptedAction: 'open-switch-cli',
  }),
  [NETWORK_PROCEDURE_STEPS.CONFIGURE_SWITCH]: Object.freeze({
    stepNumber: 12,
    title: 'Configure Switch Management',
    instruction:
      'Configure VLAN 1 with a management address and set the router as its default gateway.',
    acceptedAction: 'configure-switch',
  }),
  [NETWORK_PROCEDURE_STEPS.SWITCH_CONFIGURED]: Object.freeze({
    stepNumber: 12,
    title: 'Switch Management Configured',
    instruction: 'Managed switch configuration complete.',
  }),
  [NETWORK_PROCEDURE_STEPS.VERIFY_PC_CONFIG]: Object.freeze({
    stepNumber: 13,
    title: 'Verify Workstation Configuration',
    instruction: 'Open the workstation terminal and inspect its IPv4 settings.',
    acceptedAction: 'verify-workstation',
  }),
  [NETWORK_PROCEDURE_STEPS.PC_CONFIG_VERIFIED]: Object.freeze({
    stepNumber: 13,
    title: 'Workstation Configuration Verified',
    instruction: 'The workstation reports the configured training IPv4 values.',
  }),
  [NETWORK_PROCEDURE_STEPS.PING_ROUTER]: Object.freeze({
    stepNumber: 13,
    title: 'Test Router Connectivity',
    instruction: 'Use the workstation terminal to test connectivity to the router LAN interface.',
    acceptedAction: 'ping-router',
  }),
  [NETWORK_PROCEDURE_STEPS.ROUTER_PING_PASS]: Object.freeze({
    stepNumber: 13,
    title: 'Router Connectivity Pass',
    instruction: 'PC to Router connectivity has been verified.',
  }),
  [NETWORK_PROCEDURE_STEPS.PING_SWITCH]: Object.freeze({
    stepNumber: 13,
    title: 'Test Switch Connectivity',
    instruction: 'Use the workstation terminal to test the switch management interface.',
    acceptedAction: 'ping-switch',
  }),
  [NETWORK_PROCEDURE_STEPS.SWITCH_PING_PASS]: Object.freeze({
    stepNumber: 13,
    title: 'Switch Connectivity Pass',
    instruction: 'PC to Switch connectivity has been verified.',
  }),
  [NETWORK_PROCEDURE_STEPS.LOGICAL_CONFIGURATION_COMPLETE]: Object.freeze({
    stepNumber: 13,
    title: 'Logical Network Configuration Pass',
    instruction:
      'Network devices are physically and logically configured correctly.',
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
  NETWORK_PROCEDURE_STEPS.PHYSICAL_INSTALLATION_COMPLETE,
  NETWORK_PROCEDURE_STEPS.PC_IPV4_CONFIGURED,
  NETWORK_PROCEDURE_STEPS.ROUTER_CONFIGURED,
  NETWORK_PROCEDURE_STEPS.SWITCH_CONFIGURED,
  NETWORK_PROCEDURE_STEPS.PC_CONFIG_VERIFIED,
  NETWORK_PROCEDURE_STEPS.ROUTER_PING_PASS,
  NETWORK_PROCEDURE_STEPS.SWITCH_PING_PASS,
])

const logicalNetworkSteps = Object.freeze([
  NETWORK_PROCEDURE_STEPS.CONFIGURE_PC_IPV4,
  NETWORK_PROCEDURE_STEPS.PC_IPV4_CONFIGURED,
  NETWORK_PROCEDURE_STEPS.OPEN_ROUTER_CLI,
  NETWORK_PROCEDURE_STEPS.CONFIGURE_ROUTER,
  NETWORK_PROCEDURE_STEPS.ROUTER_CONFIGURED,
  NETWORK_PROCEDURE_STEPS.OPEN_SWITCH_CLI,
  NETWORK_PROCEDURE_STEPS.CONFIGURE_SWITCH,
  NETWORK_PROCEDURE_STEPS.SWITCH_CONFIGURED,
  NETWORK_PROCEDURE_STEPS.VERIFY_PC_CONFIG,
  NETWORK_PROCEDURE_STEPS.PC_CONFIG_VERIFIED,
  NETWORK_PROCEDURE_STEPS.PING_ROUTER,
  NETWORK_PROCEDURE_STEPS.ROUTER_PING_PASS,
  NETWORK_PROCEDURE_STEPS.PING_SWITCH,
  NETWORK_PROCEDURE_STEPS.SWITCH_PING_PASS,
  NETWORK_PROCEDURE_STEPS.LOGICAL_CONFIGURATION_COMPLETE,
])

const cablingInteractionSteps = Object.freeze([
  NETWORK_PROCEDURE_STEPS.INSTALL_PATCH_PANEL,
  NETWORK_PROCEDURE_STEPS.INSTALL_SWITCH,
  NETWORK_PROCEDURE_STEPS.INSTALL_ROUTER,
  NETWORK_PROCEDURE_STEPS.CONNECT_POWER,
  NETWORK_PROCEDURE_STEPS.CONNECT_PATCH_TO_SWITCH,
  NETWORK_PROCEDURE_STEPS.CONNECT_SWITCH_TO_ROUTER,
  NETWORK_PROCEDURE_STEPS.CONNECT_PC_TO_SWITCH,
  NETWORK_PROCEDURE_STEPS.VERIFY_LINKS,
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

function isLogicalNetworkStep(stepId) {
  return logicalNetworkSteps.includes(stepId)
}

function isNetworkCablingStep(stepId) {
  return cablingInteractionSteps.includes(stepId)
}

export {
  getNetworkProcedureStep,
  isNetworkCablingStep,
  isNetworkContinuationStep,
  isLogicalNetworkStep,
  isNetworkRestartableStep,
  NETWORK_MODULE_ID,
  NETWORK_PROCEDURE_STEPS,
  NETWORK_TOTAL_STEPS,
}
