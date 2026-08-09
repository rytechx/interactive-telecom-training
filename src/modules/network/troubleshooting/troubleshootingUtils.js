import {
  canPing,
  getActiveNetworkLinkPortIds,
  getRouterInterfaceStatus,
  getSwitchManagementStatus,
  isRouterConfigurationCorrect,
  isSwitchConfigurationCorrect,
  isWorkstationConfigurationCorrect,
} from '../networkConnectivity.js'
import {
  NETWORK_CABLE_CONFIGS,
  NETWORK_CABLE_IDS,
} from '../networkCableConfigs.js'
import { NETWORK_DEVICE_IDS } from '../networkDeviceConfigs.js'
import {
  NETWORK_MODULE_ID,
  NETWORK_PROCEDURE_STEPS,
} from '../networkProcedure.js'
import { NETWORK_TOPOLOGY } from '../networkTopology.js'
import { CLI_MODES } from '../terminalCommands.js'
import {
  getTroubleshootingScenario,
  NETWORK_TROUBLESHOOTING_MODES,
} from './troubleshootingScenarios.js'

function createTroubleshootingMetrics(scenario = null, started = false) {
  const scenarioStartTime = started ? Date.now() : null

  return {
    scenarioId: scenario?.id ?? null,
    scenarioTitle: scenario?.selectionLabel ?? null,
    scenarioStartTime,
    scenarioEndTime: null,
    elapsedTime: 0,
    diagnosisAttempts: 0,
    incorrectDiagnosisAttempts: 0,
    repairAttempts: 0,
    failedRepairAttempts: 0,
    diagnosticCommandsUsed: [],
    uniqueDiagnosticCommandsUsed: [],
    pingAttempts: 0,
    hintsUsed: 0,
    physicalInspections: [],
    timeline: [],
    scenarioCompleted: false,
    rootCauseIdentified: false,
    repairVerified: false,
    lastDiagnosisSignature: null,
    lastDiagnosisRecordedAt: 0,
    lastRepairAttemptAt: 0,
    lastCommandSignature: null,
    lastCommandRecordedAt: 0,
  }
}

function createInitialTroubleshootingState() {
  return {
    troubleshootingMode: NETWORK_TROUBLESHOOTING_MODES.INACTIVE,
    selectedTroubleshootingScenarioId: null,
    troubleshootingDiagnosisId: '',
    troubleshootingDiagnosisConfirmed: false,
    troubleshootingFeedback: null,
    troubleshootingHintLevel: 0,
    troubleshootingMethodologyVisible: false,
    troubleshootingVerificationResults: null,
    troubleshootingMetrics: createTroubleshootingMetrics(),
    scenarioResults: {},
    weakTroubleshootingScenarioIds: [],
    switchStartupReadyAt: 0,
    switchPowerOnStartedAt: null,
    pcLinkReadyAt: 0,
    pcLinkOnStartedAt: null,
  }
}

function createKnownGoodConnections() {
  return NETWORK_CABLE_CONFIGS.map((cable) => ({
    id: cable.id,
    sourcePortId: cable.sourcePortId,
    destinationPortId: cable.destinationPortId,
    cableType: cable.type,
    connected: true,
    sourceConnected: true,
    destinationConnected: true,
  }))
}

function createKnownGoodPortOccupancy() {
  return Object.fromEntries(
    NETWORK_CABLE_CONFIGS.flatMap((cable) => [
      [cable.sourcePortId, cable.id],
      [cable.destinationPortId, cable.id],
    ]),
  )
}

function createKnownGoodNetworkBaseline() {
  return {
    activeModuleId: NETWORK_MODULE_ID,
    networkTrainingStarted: true,
    networkCurrentStep: NETWORK_PROCEDURE_STEPS.LOGICAL_CONFIGURATION_COMPLETE,
    procedureFeedback: 'Known-good network baseline restored.',
    isProcedureAnimating: false,
    activeInstallationDeviceId: null,
    activeConnectionId: null,
    patchPanelInstalled: true,
    switchInstalled: true,
    routerInstalled: true,
    routerPowerConnected: true,
    switchPowerConnected: true,
    patchSwitchConnected: true,
    switchRouterConnected: true,
    pcSwitchConnected: true,
    networkPowered: true,
    powerOnStartedAt: null,
    switchStartupReadyAt: 0,
    switchPowerOnStartedAt: null,
    pcLinkReadyAt: 0,
    pcLinkOnStartedAt: null,
    selectedNetworkDeviceId: null,
    selectedCableId: null,
    selectedSourcePortId: null,
    selectedNetworkPortId: null,
    hoveredNetworkObjectId: null,
    hoveredNetworkLabel: null,
    networkConnections: createKnownGoodConnections(),
    portOccupancy: createKnownGoodPortOccupancy(),
    verifiedLinkPortIds: [
      'switch-port-1',
      'switch-port-2',
      'switch-port-8',
      'router-lan-1',
    ],
    physicalLinksVerified: true,
    networkOverlay: null,
    settingsFeedback: null,
    settingsFeedbackType: null,
    workstationIp: NETWORK_TOPOLOGY.workstation.ip,
    workstationMask: NETWORK_TOPOLOGY.subnetMask,
    workstationGateway: NETWORK_TOPOLOGY.workstation.gateway,
    workstationIpConfigured: true,
    routerLanIp: NETWORK_TOPOLOGY.router.lanIp,
    routerLanMask: NETWORK_TOPOLOGY.subnetMask,
    routerLanAdminUp: true,
    routerLanConfigured: true,
    routerCliMode: CLI_MODES.USER_EXEC,
    routerTerminalHistory: [],
    switchManagementIp: NETWORK_TOPOLOGY.switch.managementIp,
    switchManagementMask: NETWORK_TOPOLOGY.subnetMask,
    switchDefaultGateway: NETWORK_TOPOLOGY.switch.defaultGateway,
    switchVlan1AdminUp: true,
    switchManagementConfigured: true,
    switchCliMode: CLI_MODES.USER_EXEC,
    switchTerminalHistory: [],
    workstationTerminalHistory: [],
    terminalSequence: 0,
    pcConfigVerified: true,
    routerPingPassed: true,
    switchPingPassed: true,
  }
}

function disconnectBaselineCable(baseline, cableId) {
  const cable = NETWORK_CABLE_CONFIGS.find((item) => item.id === cableId)

  if (!cable) {
    return baseline
  }

  const portOccupancy = { ...baseline.portOccupancy }
  const sourceRemainsConnected = cableId === NETWORK_CABLE_IDS.PC_TO_SWITCH

  if (!sourceRemainsConnected) {
    delete portOccupancy[cable.sourcePortId]
  }
  delete portOccupancy[cable.destinationPortId]

  const update = {
    ...baseline,
    networkConnections: baseline.networkConnections.map((connection) =>
      connection.id === cableId
        ? {
            ...connection,
            connected: false,
            sourceConnected: sourceRemainsConnected,
            destinationConnected: false,
          }
        : connection,
    ),
    portOccupancy,
  }

  if (cableId === NETWORK_CABLE_IDS.PC_TO_SWITCH) {
    update.pcSwitchConnected = false
  } else if (cableId === NETWORK_CABLE_IDS.SWITCH_POWER) {
    update.switchPowerConnected = false
  }

  return update
}

function createTroubleshootingScenarioState(scenarioId) {
  const scenario = getTroubleshootingScenario(scenarioId)

  if (!scenario) {
    return null
  }

  const baseline = createKnownGoodNetworkBaseline()
  const faultedBaseline =
    scenario.fault.type === 'disconnect-cable'
      ? disconnectBaselineCable(baseline, scenario.fault.cableId)
      : { ...baseline, ...scenario.fault.updates }

  return {
    ...faultedBaseline,
    troubleshootingMode: NETWORK_TROUBLESHOOTING_MODES.ACTIVE,
    selectedTroubleshootingScenarioId: scenario.id,
    troubleshootingDiagnosisId: '',
    troubleshootingDiagnosisConfirmed: false,
    troubleshootingFeedback: 'Incident loaded. Begin with observation and diagnostics.',
    troubleshootingHintLevel: 0,
    troubleshootingMethodologyVisible: false,
    troubleshootingVerificationResults: null,
    troubleshootingMetrics: createTroubleshootingMetrics(scenario, true),
  }
}

function getTroubleshootingVerification(state) {
  const scenario = getTroubleshootingScenario(
    state.selectedTroubleshootingScenarioId,
  )
  const routerStatus = getRouterInterfaceStatus(state)
  const switchStatus = getSwitchManagementStatus(state)
  const routerPing = canPing(
    NETWORK_DEVICE_IDS.WORKSTATION_PC,
    NETWORK_TOPOLOGY.router.lanIp,
    state,
  )
  const switchPing = canPing(
    NETWORK_DEVICE_IDS.WORKSTATION_PC,
    NETWORK_TOPOLOGY.switch.managementIp,
    state,
  )
  const remotePing = canPing(
    NETWORK_DEVICE_IDS.WORKSTATION_PC,
    NETWORK_TOPOLOGY.remoteHost.ip,
    state,
  )
  const physicalLinksActive = Boolean(
    state.patchSwitchConnected &&
      state.switchRouterConnected &&
      state.pcSwitchConnected,
  )
  const activeLinkPortIds = getActiveNetworkLinkPortIds(state)
  const pcSwitchLinkActive = Boolean(
    activeLinkPortIds.includes('pc-eth0') &&
      activeLinkPortIds.includes('switch-port-2') &&
      (!state.pcLinkReadyAt || Date.now() >= state.pcLinkReadyAt),
  )
  const requiredPowerOn = Boolean(
    state.networkPowered &&
      state.routerPowerConnected &&
      state.switchPowerConnected &&
      (!state.switchStartupReadyAt || Date.now() >= state.switchStartupReadyAt),
  )
  const commonChecksPass = Boolean(
    isWorkstationConfigurationCorrect(state) &&
      isRouterConfigurationCorrect(state) &&
      isSwitchConfigurationCorrect(state) &&
      routerStatus.status === 'up' &&
      routerStatus.protocol === 'up' &&
      switchStatus.status === 'up' &&
      switchStatus.protocol === 'up' &&
      physicalLinksActive &&
      pcSwitchLinkActive &&
      requiredPowerOn &&
      routerPing &&
      switchPing,
  )
  const passed = Boolean(
    scenario &&
      commonChecksPass &&
      (scenario.id !== 'wrong-default-gateway' || remotePing),
  )

  return {
    passed,
    routerPing,
    switchPing,
    remotePing,
    physicalLinksActive,
    pcSwitchLinkActive,
    requiredPowerOn,
  }
}

export {
  createInitialTroubleshootingState,
  createKnownGoodNetworkBaseline,
  createTroubleshootingMetrics,
  createTroubleshootingScenarioState,
  getTroubleshootingVerification,
}
