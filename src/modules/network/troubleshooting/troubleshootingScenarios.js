import { NETWORK_CABLE_IDS } from '../networkCableConfigs.js'
import { NETWORK_TOPOLOGY } from '../networkTopology.js'

const NETWORK_TROUBLESHOOTING_MODES = Object.freeze({
  INACTIVE: 'inactive',
  SELECTION: 'selection',
  ACTIVE: 'active',
  COMPLETE: 'complete',
})

const NETWORK_TROUBLESHOOTING_DIAGNOSES = Object.freeze([
  Object.freeze({
    id: 'workstation-ipv4',
    label: 'Incorrect Workstation IPv4 Configuration',
  }),
  Object.freeze({
    id: 'router-interface-disabled',
    label: 'Router Interface Disabled',
  }),
  Object.freeze({
    id: 'switch-management',
    label: 'Incorrect Switch Management Configuration',
  }),
  Object.freeze({
    id: 'default-gateway',
    label: 'Default Gateway Misconfiguration',
  }),
  Object.freeze({
    id: 'ethernet-disconnected',
    label: 'Ethernet Cable Disconnected',
  }),
  Object.freeze({
    id: 'device-power',
    label: 'Device Power Failure',
  }),
])

const NETWORK_TROUBLESHOOTING_SCENARIOS = Object.freeze([
  Object.freeze({
    id: 'wrong-workstation-ip',
    number: 1,
    selectionLabel: 'Wrong PC IPv4 Address',
    diagnosisId: 'workstation-ipv4',
    symptom:
      'The workstation cannot communicate with the router or managed switch. Investigate the network and restore connectivity.',
    learningObjective: 'Use workstation addressing and subnet checks to isolate a Layer 3 fault.',
    relevantLayer: 'Network Layer',
    fault: Object.freeze({
      type: 'state-update',
      updates: Object.freeze({ workstationIp: '192.168.20.10' }),
    }),
    hints: Object.freeze([
      'Compare the workstation network layer with the devices it is trying to reach.',
      'Use ipconfig and verify that the workstation belongs to the expected LAN subnet.',
      'Compare the workstation IPv4 address with the 192.168.10.0/24 training network.',
    ]),
    rootCause: 'The workstation used 192.168.20.10, placing it outside the training LAN subnet.',
    repair: `The workstation IPv4 address was restored to ${NETWORK_TOPOLOGY.workstation.ip}.`,
  }),
  Object.freeze({
    id: 'router-interface-down',
    number: 2,
    selectionLabel: 'Router Interface Down',
    diagnosisId: 'router-interface-disabled',
    symptom:
      'The workstation cannot reach the LAN router even though the rack appears powered and cabled.',
    learningObjective: 'Inspect router interface state and restore an administratively disabled interface.',
    relevantLayer: 'Physical / Network Interface Configuration',
    fault: Object.freeze({
      type: 'state-update',
      updates: Object.freeze({ routerLanAdminUp: false }),
    }),
    hints: Object.freeze([
      'Check the operational state of the interface that serves the LAN.',
      'Use the router CLI to inspect interface status before changing addressing.',
      'Inspect GigabitEthernet0/0 for an administratively disabled state.',
    ]),
    rootCause: 'Router GigabitEthernet0/0 was administratively disabled.',
    repair: 'The router LAN interface was enabled with the no shutdown command.',
  }),
  Object.freeze({
    id: 'wrong-switch-ip',
    number: 3,
    selectionLabel: 'Switch Management Address Error',
    diagnosisId: 'switch-management',
    symptom:
      'The workstation can reach the router, but the managed switch does not respond at its expected management address.',
    learningObjective: 'Differentiate management-plane addressing from healthy physical forwarding.',
    relevantLayer: 'Network Layer',
    fault: Object.freeze({
      type: 'state-update',
      updates: Object.freeze({ switchManagementIp: '192.168.20.2' }),
    }),
    hints: Object.freeze([
      'A healthy router response suggests that the main physical path is still available.',
      'Inspect the management interface configuration on the switch.',
      'Compare the Vlan1 address with the expected 192.168.10.0/24 management subnet.',
    ]),
    rootCause: 'Switch Vlan1 used 192.168.20.2 instead of the expected management address.',
    repair: `Switch Vlan1 was restored to ${NETWORK_TOPOLOGY.switch.managementIp}.`,
  }),
  Object.freeze({
    id: 'wrong-default-gateway',
    number: 4,
    selectionLabel: 'Default Gateway Error',
    diagnosisId: 'default-gateway',
    symptom: `Local network devices respond, but the workstation cannot reach the ${NETWORK_TOPOLOGY.remoteHost.name} at ${NETWORK_TOPOLOGY.remoteHost.ip}.`,
    learningObjective: 'Recognize that same-subnet traffic does not require a default gateway.',
    relevantLayer: 'Network Layer',
    fault: Object.freeze({
      type: 'state-update',
      updates: Object.freeze({ workstationGateway: '192.168.10.254' }),
    }),
    hints: Object.freeze([
      'Compare what succeeds locally with what fails outside the local subnet.',
      'Use ipconfig and inspect the path a remote destination requires.',
      'Verify that the workstation default gateway matches the router LAN address.',
    ]),
    rootCause: 'The workstation default gateway was set to 192.168.10.254.',
    repair: `The default gateway was restored to ${NETWORK_TOPOLOGY.workstation.gateway}.`,
  }),
  Object.freeze({
    id: 'pc-switch-disconnected',
    number: 5,
    selectionLabel: 'Physical Cable Fault',
    diagnosisId: 'ethernet-disconnected',
    symptom:
      'The workstation has valid IPv4 settings but cannot reach any network device. Inspect the physical installation.',
    learningObjective: 'Use cable state and link indicators before changing configuration.',
    relevantLayer: 'Physical Layer',
    fault: Object.freeze({
      type: 'disconnect-cable',
      cableId: NETWORK_CABLE_IDS.PC_TO_SWITCH,
    }),
    repairCableId: NETWORK_CABLE_IDS.PC_TO_SWITCH,
    hints: Object.freeze([
      'Check the physical layer before changing configuration.',
      'Inspect link indicators on the workstation and managed switch.',
      'Inspect the connection between the workstation and Switch Port 2.',
    ]),
    rootCause: 'The Ethernet cable between the workstation and Switch Port 2 was disconnected.',
    repair: 'The workstation Ethernet cable was reconnected to Switch Port 2.',
  }),
  Object.freeze({
    id: 'switch-power-failure',
    number: 6,
    selectionLabel: 'Device Power Fault',
    diagnosisId: 'device-power',
    symptom:
      'Multiple links are unavailable and the managed switch cannot be accessed. Inspect rack power and device indicators.',
    learningObjective: 'Recognize how one powered-off infrastructure device affects multiple links.',
    relevantLayer: 'Physical Layer',
    fault: Object.freeze({
      type: 'disconnect-cable',
      cableId: NETWORK_CABLE_IDS.SWITCH_POWER,
    }),
    repairCableId: NETWORK_CABLE_IDS.SWITCH_POWER,
    hints: Object.freeze([
      'Check device power before changing logical configuration.',
      'Compare the router and switch power indicators and port LEDs.',
      'Inspect the managed switch power connection to the rack PDU.',
    ]),
    rootCause: 'The managed switch lost power because its rack PDU connection was disconnected.',
    repair: 'The managed switch power cable was restored and the device completed startup.',
  }),
])

function getTroubleshootingScenario(scenarioId) {
  return (
    NETWORK_TROUBLESHOOTING_SCENARIOS.find(
      (scenario) => scenario.id === scenarioId,
    ) ?? null
  )
}

function getNextTroubleshootingScenarioId(scenarioId) {
  const currentIndex = NETWORK_TROUBLESHOOTING_SCENARIOS.findIndex(
    (scenario) => scenario.id === scenarioId,
  )
  const nextIndex =
    currentIndex < 0
      ? 0
      : (currentIndex + 1) % NETWORK_TROUBLESHOOTING_SCENARIOS.length

  return NETWORK_TROUBLESHOOTING_SCENARIOS[nextIndex].id
}

export {
  getNextTroubleshootingScenarioId,
  getTroubleshootingScenario,
  NETWORK_TROUBLESHOOTING_DIAGNOSES,
  NETWORK_TROUBLESHOOTING_MODES,
  NETWORK_TROUBLESHOOTING_SCENARIOS,
}
