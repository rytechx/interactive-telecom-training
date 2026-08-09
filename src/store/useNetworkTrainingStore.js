import { create } from 'zustand'
import {
  getNetworkCableConfig,
  NETWORK_CABLE_CONFIGS,
  NETWORK_CABLE_IDS,
} from '../modules/network/networkCableConfigs.js'
import {
  getNetworkDeviceConfig,
  getNetworkPortConfig,
  NETWORK_DEVICE_IDS,
  NETWORK_REQUIRED_VERIFICATION_PORT_IDS,
} from '../modules/network/networkDeviceConfigs.js'
import {
  NETWORK_MODULE_ID,
  NETWORK_PROCEDURE_STEPS,
} from '../modules/network/networkProcedure.js'
import {
  isWorkstationConfigurationCorrect,
  isRouterPowered,
  isSwitchPowered,
} from '../modules/network/networkConnectivity.js'
import {
  CLI_MODES,
  executeTerminalCommand,
  getTerminalPrompt,
  NETWORK_TERMINAL_TYPES,
} from '../modules/network/terminalCommands.js'
import { validateIPv4Values } from '../modules/network/ipv4Utils.js'
import {
  getNextTroubleshootingScenarioId,
  getTroubleshootingScenario,
  NETWORK_TROUBLESHOOTING_MODES,
  NETWORK_TROUBLESHOOTING_SCENARIOS,
} from '../modules/network/troubleshooting/troubleshootingScenarios.js'
import {
  createInitialTroubleshootingState,
  createKnownGoodNetworkBaseline,
  createTroubleshootingScenarioState,
  getTroubleshootingVerification,
} from '../modules/network/troubleshooting/troubleshootingUtils.js'

const NETWORK_OVERLAYS = Object.freeze({
  PC_SETTINGS: 'pc-settings',
  ROUTER_TERMINAL: 'router-terminal',
  SWITCH_TERMINAL: 'switch-terminal',
  WORKSTATION_TERMINAL: 'workstation-terminal',
})

const clearedNetworkHoverState = Object.freeze({
  hoveredNetworkObjectId: null,
  hoveredNetworkLabel: null,
})

const deviceSelectionRules = Object.freeze({
  [NETWORK_PROCEDURE_STEPS.SELECT_PATCH_PANEL]: Object.freeze({
    deviceId: NETWORK_DEVICE_IDS.PATCH_PANEL,
    nextStep: NETWORK_PROCEDURE_STEPS.INSTALL_PATCH_PANEL,
  }),
  [NETWORK_PROCEDURE_STEPS.SELECT_SWITCH]: Object.freeze({
    deviceId: NETWORK_DEVICE_IDS.MANAGED_SWITCH,
    nextStep: NETWORK_PROCEDURE_STEPS.INSTALL_SWITCH,
  }),
  [NETWORK_PROCEDURE_STEPS.SELECT_ROUTER]: Object.freeze({
    deviceId: NETWORK_DEVICE_IDS.ROUTER,
    nextStep: NETWORK_PROCEDURE_STEPS.INSTALL_ROUTER,
  }),
})

const installationRules = Object.freeze({
  [NETWORK_PROCEDURE_STEPS.INSTALL_PATCH_PANEL]: Object.freeze({
    deviceId: NETWORK_DEVICE_IDS.PATCH_PANEL,
    installedField: 'patchPanelInstalled',
    completedStep: NETWORK_PROCEDURE_STEPS.PATCH_PANEL_INSTALLED,
  }),
  [NETWORK_PROCEDURE_STEPS.INSTALL_SWITCH]: Object.freeze({
    deviceId: NETWORK_DEVICE_IDS.MANAGED_SWITCH,
    installedField: 'switchInstalled',
    completedStep: NETWORK_PROCEDURE_STEPS.SWITCH_INSTALLED,
  }),
  [NETWORK_PROCEDURE_STEPS.INSTALL_ROUTER]: Object.freeze({
    deviceId: NETWORK_DEVICE_IDS.ROUTER,
    installedField: 'routerInstalled',
    completedStep: NETWORK_PROCEDURE_STEPS.ROUTER_INSTALLED,
  }),
})

const continuationRules = Object.freeze({
  [NETWORK_PROCEDURE_STEPS.PATCH_PANEL_INSTALLED]:
    NETWORK_PROCEDURE_STEPS.SELECT_SWITCH,
  [NETWORK_PROCEDURE_STEPS.SWITCH_INSTALLED]:
    NETWORK_PROCEDURE_STEPS.SELECT_ROUTER,
  [NETWORK_PROCEDURE_STEPS.ROUTER_INSTALLED]:
    NETWORK_PROCEDURE_STEPS.CONNECT_POWER,
  [NETWORK_PROCEDURE_STEPS.POWER_CONNECTED]:
    NETWORK_PROCEDURE_STEPS.CONNECT_PATCH_TO_SWITCH,
  [NETWORK_PROCEDURE_STEPS.PATCH_SWITCH_CONNECTED]:
    NETWORK_PROCEDURE_STEPS.CONNECT_SWITCH_TO_ROUTER,
  [NETWORK_PROCEDURE_STEPS.SWITCH_ROUTER_CONNECTED]:
    NETWORK_PROCEDURE_STEPS.CONNECT_PC_TO_SWITCH,
  [NETWORK_PROCEDURE_STEPS.PC_SWITCH_CONNECTED]:
    NETWORK_PROCEDURE_STEPS.POWER_ON_NETWORK,
  [NETWORK_PROCEDURE_STEPS.PHYSICAL_INSTALLATION_COMPLETE]:
    NETWORK_PROCEDURE_STEPS.CONFIGURE_PC_IPV4,
  [NETWORK_PROCEDURE_STEPS.PC_IPV4_CONFIGURED]:
    NETWORK_PROCEDURE_STEPS.OPEN_ROUTER_CLI,
  [NETWORK_PROCEDURE_STEPS.ROUTER_CONFIGURED]:
    NETWORK_PROCEDURE_STEPS.OPEN_SWITCH_CLI,
  [NETWORK_PROCEDURE_STEPS.SWITCH_CONFIGURED]:
    NETWORK_PROCEDURE_STEPS.VERIFY_PC_CONFIG,
  [NETWORK_PROCEDURE_STEPS.PC_CONFIG_VERIFIED]:
    NETWORK_PROCEDURE_STEPS.PING_ROUTER,
  [NETWORK_PROCEDURE_STEPS.ROUTER_PING_PASS]:
    NETWORK_PROCEDURE_STEPS.PING_SWITCH,
  [NETWORK_PROCEDURE_STEPS.SWITCH_PING_PASS]:
    NETWORK_PROCEDURE_STEPS.LOGICAL_CONFIGURATION_COMPLETE,
})

const connectionStepCableRules = Object.freeze({
  [NETWORK_PROCEDURE_STEPS.CONNECT_PATCH_TO_SWITCH]: Object.freeze([
    NETWORK_CABLE_IDS.PATCH_TO_SWITCH,
  ]),
  [NETWORK_PROCEDURE_STEPS.CONNECT_SWITCH_TO_ROUTER]: Object.freeze([
    NETWORK_CABLE_IDS.SWITCH_TO_ROUTER,
  ]),
  [NETWORK_PROCEDURE_STEPS.CONNECT_PC_TO_SWITCH]: Object.freeze([
    NETWORK_CABLE_IDS.PC_TO_SWITCH,
  ]),
  [NETWORK_PROCEDURE_STEPS.CONNECT_POWER]: Object.freeze([
    NETWORK_CABLE_IDS.ROUTER_POWER,
    NETWORK_CABLE_IDS.SWITCH_POWER,
  ]),
})

function createInitialConnections() {
  return NETWORK_CABLE_CONFIGS.map((cable) => ({
    id: cable.id,
    sourcePortId: cable.sourcePortId,
    destinationPortId: cable.destinationPortId,
    cableType: cable.type,
    connected: false,
    sourceConnected: false,
    destinationConnected: false,
  }))
}

function createInitialNetworkState() {
  return {
    ...createInitialTroubleshootingState(),
    activeModuleId: null,
    networkTrainingStarted: false,
    networkCurrentStep: NETWORK_PROCEDURE_STEPS.NOT_STARTED,
    procedureFeedback: null,
    isProcedureAnimating: false,
    activeInstallationDeviceId: null,
    activeConnectionId: null,
    patchPanelInstalled: false,
    switchInstalled: false,
    routerInstalled: false,
    routerPowerConnected: false,
    switchPowerConnected: false,
    patchSwitchConnected: false,
    switchRouterConnected: false,
    pcSwitchConnected: false,
    networkPowered: false,
    powerOnStartedAt: null,
    selectedNetworkDeviceId: null,
    selectedCableId: null,
    selectedSourcePortId: null,
    selectedNetworkPortId: null,
    hoveredNetworkObjectId: null,
    hoveredNetworkLabel: null,
    inspectionViewRequest: { id: 0, view: 'reset' },
    networkConnections: createInitialConnections(),
    portOccupancy: {},
    verifiedLinkPortIds: [],
    physicalLinksVerified: false,
    networkOverlay: null,
    settingsFeedback: null,
    settingsFeedbackType: null,
    workstationIp: '',
    workstationMask: '',
    workstationGateway: '',
    workstationIpConfigured: false,
    routerLanIp: '',
    routerLanMask: '',
    routerLanAdminUp: false,
    routerLanConfigured: false,
    routerCliMode: CLI_MODES.USER_EXEC,
    routerTerminalHistory: [],
    switchManagementIp: '',
    switchManagementMask: '',
    switchDefaultGateway: '',
    switchVlan1AdminUp: false,
    switchManagementConfigured: false,
    switchCliMode: CLI_MODES.USER_EXEC,
    switchTerminalHistory: [],
    workstationTerminalHistory: [],
    terminalSequence: 0,
    pcConfigVerified: false,
    routerPingPassed: false,
    switchPingPassed: false,
  }
}

function isTroubleshootingActive(state) {
  return state.troubleshootingMode === NETWORK_TROUBLESHOOTING_MODES.ACTIVE
}

function getTroubleshootingConnectionUpdate(cableId) {
  if (cableId === NETWORK_CABLE_IDS.SWITCH_POWER) {
    const powerOnStartedAt = Date.now()

    return {
      switchPowerConnected: true,
      switchPowerOnStartedAt: powerOnStartedAt,
      switchStartupReadyAt: powerOnStartedAt + 1800,
      troubleshootingFeedback:
        'Switch power restored. Allow the device and links to initialize before verification.',
    }
  }

  if (cableId === NETWORK_CABLE_IDS.PC_TO_SWITCH) {
    const pcLinkOnStartedAt = Date.now()

    return {
      pcSwitchConnected: true,
      pcLinkOnStartedAt,
      pcLinkReadyAt: pcLinkOnStartedAt + 700,
      troubleshootingFeedback:
        'Switch Port 2 connection restored. Allow the link to negotiate, then retest connectivity.',
    }
  }

  return {}
}

function createStartedNetworkState() {
  return {
    ...createInitialNetworkState(),
    activeModuleId: NETWORK_MODULE_ID,
    networkTrainingStarted: true,
    networkCurrentStep: NETWORK_PROCEDURE_STEPS.INSPECT_RACK,
  }
}

function updateConnectionList(connections, cableId, connected) {
  return connections.map((connection) =>
    connection.id === cableId
      ? {
          ...connection,
          connected,
          sourceConnected: connected,
          destinationConnected: connected,
        }
      : connection,
  )
}

function removeCableOccupancy(portOccupancy, cableId) {
  return Object.fromEntries(
    Object.entries(portOccupancy).filter(
      ([, occupiedCableId]) => occupiedCableId !== cableId,
    ),
  )
}

function getConnectionCompletionUpdate(state, cableId) {
  if (cableId === NETWORK_CABLE_IDS.ROUTER_POWER) {
    const switchPowerConnected = state.switchPowerConnected

    return {
      routerPowerConnected: true,
      networkCurrentStep: switchPowerConnected
        ? NETWORK_PROCEDURE_STEPS.POWER_CONNECTED
        : NETWORK_PROCEDURE_STEPS.CONNECT_POWER,
      procedureFeedback: switchPowerConnected
        ? 'Router and managed switch power are connected.'
        : 'Router power connected. Connect the managed switch power cable.',
    }
  }

  if (cableId === NETWORK_CABLE_IDS.SWITCH_POWER) {
    const routerPowerConnected = state.routerPowerConnected

    return {
      switchPowerConnected: true,
      networkCurrentStep: routerPowerConnected
        ? NETWORK_PROCEDURE_STEPS.POWER_CONNECTED
        : NETWORK_PROCEDURE_STEPS.CONNECT_POWER,
      procedureFeedback: routerPowerConnected
        ? 'Router and managed switch power are connected.'
        : 'Managed switch power connected. Connect the router power cable.',
    }
  }

  if (cableId === NETWORK_CABLE_IDS.PATCH_TO_SWITCH) {
    return {
      patchSwitchConnected: true,
      networkCurrentStep: NETWORK_PROCEDURE_STEPS.PATCH_SWITCH_CONNECTED,
      procedureFeedback: 'Patch Panel connected to Switch Port 1.',
    }
  }

  if (cableId === NETWORK_CABLE_IDS.SWITCH_TO_ROUTER) {
    return {
      switchRouterConnected: true,
      networkCurrentStep: NETWORK_PROCEDURE_STEPS.SWITCH_ROUTER_CONNECTED,
      procedureFeedback: 'Switch uplink connected to Router LAN 1.',
    }
  }

  return {
    pcSwitchConnected: true,
    networkCurrentStep: NETWORK_PROCEDURE_STEPS.PC_SWITCH_CONNECTED,
    procedureFeedback: 'Workstation Ethernet connected to Switch Port 2.',
  }
}

function disconnectCable(state, cableId) {
  const cable = getNetworkCableConfig(cableId)

  if (!cable) {
    return {}
  }

  const update = {
    networkConnections: updateConnectionList(
      state.networkConnections,
      cableId,
      false,
    ),
    portOccupancy: removeCableOccupancy(state.portOccupancy, cableId),
    selectedCableId: null,
    selectedSourcePortId: null,
    selectedNetworkPortId: null,
    activeConnectionId: null,
    isProcedureAnimating: false,
    procedureFeedback: null,
  }

  if (cableId === NETWORK_CABLE_IDS.ROUTER_POWER) {
    update.routerPowerConnected = false
  } else if (cableId === NETWORK_CABLE_IDS.SWITCH_POWER) {
    update.switchPowerConnected = false
  } else if (cableId === NETWORK_CABLE_IDS.PATCH_TO_SWITCH) {
    update.patchSwitchConnected = false
  } else if (cableId === NETWORK_CABLE_IDS.SWITCH_TO_ROUTER) {
    update.switchRouterConnected = false
  } else if (cableId === NETWORK_CABLE_IDS.PC_TO_SWITCH) {
    update.pcSwitchConnected = false
  }

  return update
}

const terminalHistoryFields = Object.freeze({
  [NETWORK_TERMINAL_TYPES.ROUTER]: 'routerTerminalHistory',
  [NETWORK_TERMINAL_TYPES.SWITCH]: 'switchTerminalHistory',
  [NETWORK_TERMINAL_TYPES.WORKSTATION]: 'workstationTerminalHistory',
})

function getWorkstationResetState() {
  return {
    workstationIp: '',
    workstationMask: '',
    workstationGateway: '',
    workstationIpConfigured: false,
    settingsFeedback: null,
    settingsFeedbackType: null,
    pcConfigVerified: false,
    routerPingPassed: false,
    switchPingPassed: false,
    workstationTerminalHistory: [],
  }
}

function getRouterResetState() {
  return {
    routerLanIp: '',
    routerLanMask: '',
    routerLanAdminUp: false,
    routerLanConfigured: false,
    routerCliMode: CLI_MODES.USER_EXEC,
    routerTerminalHistory: [],
    pcConfigVerified: false,
    routerPingPassed: false,
    switchPingPassed: false,
  }
}

function getSwitchResetState() {
  return {
    switchManagementIp: '',
    switchManagementMask: '',
    switchDefaultGateway: '',
    switchVlan1AdminUp: false,
    switchManagementConfigured: false,
    switchCliMode: CLI_MODES.USER_EXEC,
    switchTerminalHistory: [],
    pcConfigVerified: false,
    switchPingPassed: false,
  }
}

const useNetworkTrainingStore = create((set) => ({
  ...createInitialNetworkState(),

  beginNetworkTraining: () => set(createStartedNetworkState()),
  openTroubleshootingSelection: () => {
    set((state) =>
      state.networkCurrentStep ===
        NETWORK_PROCEDURE_STEPS.LOGICAL_CONFIGURATION_COMPLETE
        ? {
            ...createKnownGoodNetworkBaseline(),
            ...createInitialTroubleshootingState(),
            troubleshootingMode: NETWORK_TROUBLESHOOTING_MODES.SELECTION,
          }
        : {},
    )
  },
  startTroubleshootingScenario: (scenarioId) => {
    set(() => createTroubleshootingScenarioState(scenarioId) ?? {})
  },
  startRandomTroubleshootingScenario: () => {
    const randomIndex = Math.floor(
      Math.random() * NETWORK_TROUBLESHOOTING_SCENARIOS.length,
    )
    const scenarioId = NETWORK_TROUBLESHOOTING_SCENARIOS[randomIndex].id

    set(() => createTroubleshootingScenarioState(scenarioId) ?? {})
  },
  setTroubleshootingDiagnosis: (diagnosisId) => {
    set((state) =>
      isTroubleshootingActive(state) &&
      !state.troubleshootingDiagnosisConfirmed
        ? { troubleshootingDiagnosisId: diagnosisId }
        : {},
    )
  },
  submitTroubleshootingDiagnosis: () => {
    set((state) => {
      if (!isTroubleshootingActive(state)) {
        return {}
      }

      const scenario = getTroubleshootingScenario(
        state.selectedTroubleshootingScenarioId,
      )

      if (!state.troubleshootingDiagnosisId) {
        return {
          troubleshootingFeedback: 'Select a likely diagnosis before submitting.',
        }
      }

      if (state.troubleshootingDiagnosisId !== scenario?.diagnosisId) {
        return {
          troubleshootingFeedback:
            'Diagnosis incorrect. Continue troubleshooting.',
          troubleshootingMetrics: {
            ...state.troubleshootingMetrics,
            incorrectDiagnosisAttempts:
              state.troubleshootingMetrics.incorrectDiagnosisAttempts + 1,
          },
        }
      }

      return {
        troubleshootingDiagnosisConfirmed: true,
        troubleshootingFeedback:
          'Diagnosis confirmed. Apply the appropriate repair.',
      }
    })
  },
  requestTroubleshootingHint: () => {
    set((state) => {
      if (!isTroubleshootingActive(state)) {
        return {}
      }

      const scenario = getTroubleshootingScenario(
        state.selectedTroubleshootingScenarioId,
      )
      const nextHintLevel = Math.min(
        state.troubleshootingHintLevel + 1,
        scenario?.hints.length ?? 0,
      )

      if (nextHintLevel === state.troubleshootingHintLevel) {
        return {}
      }

      return {
        troubleshootingHintLevel: nextHintLevel,
        troubleshootingMetrics: {
          ...state.troubleshootingMetrics,
          hintsUsed: nextHintLevel,
        },
      }
    })
  },
  toggleTroubleshootingMethodology: () => {
    set((state) => ({
      troubleshootingMethodologyVisible:
        !state.troubleshootingMethodologyVisible,
    }))
  },
  verifyTroubleshootingRepair: () => {
    set((state) => {
      if (!isTroubleshootingActive(state)) {
        return {}
      }

      const repairAttempts = state.troubleshootingMetrics.repairAttempts + 1

      if (!state.troubleshootingDiagnosisConfirmed) {
        return {
          troubleshootingFeedback:
            'Submit the diagnosis before verifying the repair.',
          troubleshootingMetrics: {
            ...state.troubleshootingMetrics,
            repairAttempts,
          },
        }
      }

      const verification = getTroubleshootingVerification(state)

      if (!verification.passed) {
        return {
          troubleshootingFeedback:
            'Repair verification failed. The network issue is still present.',
          troubleshootingVerificationResults: null,
          troubleshootingMetrics: {
            ...state.troubleshootingMetrics,
            repairAttempts,
          },
        }
      }

      return {
        troubleshootingMode: NETWORK_TROUBLESHOOTING_MODES.COMPLETE,
        troubleshootingFeedback: 'NETWORK RESTORED',
        troubleshootingVerificationResults: verification,
        troubleshootingMetrics: {
          ...state.troubleshootingMetrics,
          scenarioEndTime: Date.now(),
          repairAttempts,
          scenarioCompleted: true,
        },
      }
    })
  },
  restartTroubleshootingScenario: () => {
    set((state) =>
      createTroubleshootingScenarioState(
        state.selectedTroubleshootingScenarioId,
      ) ?? {},
    )
  },
  startNextTroubleshootingScenario: () => {
    set((state) => {
      const nextScenarioId = getNextTroubleshootingScenarioId(
        state.selectedTroubleshootingScenarioId,
      )

      return createTroubleshootingScenarioState(nextScenarioId) ?? {}
    })
  },
  returnToTroubleshootingSelection: () => {
    set({
      ...createKnownGoodNetworkBaseline(),
      ...createInitialTroubleshootingState(),
      troubleshootingMode: NETWORK_TROUBLESHOOTING_MODES.SELECTION,
    })
  },
  exitTroubleshooting: () => {
    set({
      ...createKnownGoodNetworkBaseline(),
      ...createInitialTroubleshootingState(),
    })
  },
  openTroubleshootingTool: (overlay) => {
    set((state) => {
      if (
        !isTroubleshootingActive(state) ||
        !Object.values(NETWORK_OVERLAYS).includes(overlay)
      ) {
        return {}
      }

      return {
        networkOverlay: overlay,
        settingsFeedback: null,
        settingsFeedbackType: null,
      }
    })
  },
  inspectNetworkRack: () => {
    set((state) =>
      state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.INSPECT_RACK &&
      !state.isProcedureAnimating
          ? {
            ...clearedNetworkHoverState,
            networkCurrentStep: NETWORK_PROCEDURE_STEPS.SELECT_PATCH_PANEL,
            procedureFeedback:
              'Rack inspected. RU 4, RU 5, and RU 6 are available.',
          }
        : {},
    )
  },
  selectNetworkDevice: (deviceId) => {
    set((state) => {
      const rule = deviceSelectionRules[state.networkCurrentStep]

      if (!rule || state.isProcedureAnimating) {
        return {}
      }

      const device = getNetworkDeviceConfig(deviceId)

      if (deviceId !== rule.deviceId) {
        return {
          procedureFeedback: `${device?.shortName ?? 'That device'} is not required for this rack position.`,
        }
      }

      return {
        ...clearedNetworkHoverState,
        selectedNetworkDeviceId: deviceId,
        selectedNetworkPortId: null,
        networkCurrentStep: rule.nextStep,
        procedureFeedback: `${device.shortName} selected. Choose its highlighted rack position.`,
      }
    })
  },
  selectNetworkRackSlot: (slotId) => {
    set((state) => {
      const rule = installationRules[state.networkCurrentStep]

      if (!rule || state.isProcedureAnimating) {
        return {}
      }

      const device = getNetworkDeviceConfig(rule.deviceId)

      if (
        state.selectedNetworkDeviceId !== rule.deviceId ||
        slotId !== device.targetSlotId
      ) {
        return { procedureFeedback: 'Incorrect rack position.' }
      }

      return {
        ...clearedNetworkHoverState,
        activeInstallationDeviceId: rule.deviceId,
        isProcedureAnimating: true,
        procedureFeedback: `Installing ${device.shortName} at RU ${device.rackUnit}...`,
      }
    })
  },
  completeNetworkDeviceInstallation: (deviceId) => {
    set((state) => {
      const rule = installationRules[state.networkCurrentStep]

      if (
        !rule ||
        rule.deviceId !== deviceId ||
        state.activeInstallationDeviceId !== deviceId ||
        !state.isProcedureAnimating
      ) {
        return {}
      }

      const device = getNetworkDeviceConfig(deviceId)

      return {
        ...clearedNetworkHoverState,
        [rule.installedField]: true,
        activeInstallationDeviceId: null,
        selectedNetworkDeviceId: null,
        networkCurrentStep: rule.completedStep,
        isProcedureAnimating: false,
        procedureFeedback: `${device.shortName} installed at RU ${device.rackUnit}.`,
      }
    })
  },
  continueNetworkProcedure: () => {
    set((state) => {
      const nextStep = continuationRules[state.networkCurrentStep]
      const keepWorkstationTerminal = [
        NETWORK_PROCEDURE_STEPS.PING_ROUTER,
        NETWORK_PROCEDURE_STEPS.PING_SWITCH,
      ].includes(nextStep)

      return nextStep
          ? {
            ...clearedNetworkHoverState,
            networkCurrentStep: nextStep,
            networkOverlay: keepWorkstationTerminal
              ? state.networkOverlay
              : null,
            procedureFeedback: null,
            selectedNetworkDeviceId: null,
            selectedCableId: null,
            selectedSourcePortId: null,
            selectedNetworkPortId: null,
          }
        : {}
    })
  },
  openWorkstationConfiguration: () => {
    set((state) => {
      if (isTroubleshootingActive(state)) {
        return {
          networkOverlay: NETWORK_OVERLAYS.WORKSTATION_TERMINAL,
          procedureFeedback: 'Workstation command prompt opened.',
        }
      }

      if (state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.CONFIGURE_PC_IPV4) {
        return {
          networkOverlay: NETWORK_OVERLAYS.PC_SETTINGS,
          settingsFeedback: null,
          settingsFeedbackType: null,
          procedureFeedback: 'Workstation Ethernet IPv4 settings opened.',
        }
      }

      if (
        [
          NETWORK_PROCEDURE_STEPS.VERIFY_PC_CONFIG,
          NETWORK_PROCEDURE_STEPS.PC_CONFIG_VERIFIED,
          NETWORK_PROCEDURE_STEPS.PING_ROUTER,
          NETWORK_PROCEDURE_STEPS.ROUTER_PING_PASS,
          NETWORK_PROCEDURE_STEPS.PING_SWITCH,
          NETWORK_PROCEDURE_STEPS.SWITCH_PING_PASS,
        ].includes(state.networkCurrentStep)
      ) {
        return {
          networkOverlay: NETWORK_OVERLAYS.WORKSTATION_TERMINAL,
          procedureFeedback: 'Workstation command prompt opened.',
        }
      }

      return {}
    })
  },
  openNetworkDeviceTerminal: (deviceId) => {
    set((state) => {
      if (isTroubleshootingActive(state)) {
        if (
          deviceId === NETWORK_DEVICE_IDS.ROUTER ||
          deviceId === NETWORK_DEVICE_IDS.MANAGED_SWITCH
        ) {
          return {
            networkOverlay:
              deviceId === NETWORK_DEVICE_IDS.ROUTER
                ? NETWORK_OVERLAYS.ROUTER_TERMINAL
                : NETWORK_OVERLAYS.SWITCH_TERMINAL,
            procedureFeedback:
              deviceId === NETWORK_DEVICE_IDS.ROUTER
                ? isRouterPowered(state)
                  ? 'Router console opened.'
                  : 'Device unavailable / powered off.'
                : isSwitchPowered(state)
                  ? 'Managed switch console opened.'
                  : 'Device unavailable / powered off.',
          }
        }

        return {}
      }

      if (
        deviceId === NETWORK_DEVICE_IDS.ROUTER &&
        [
          NETWORK_PROCEDURE_STEPS.OPEN_ROUTER_CLI,
          NETWORK_PROCEDURE_STEPS.CONFIGURE_ROUTER,
        ].includes(state.networkCurrentStep)
      ) {
        return {
          networkOverlay: NETWORK_OVERLAYS.ROUTER_TERMINAL,
          networkCurrentStep: NETWORK_PROCEDURE_STEPS.CONFIGURE_ROUTER,
          procedureFeedback: 'Router console opened.',
        }
      }

      if (
        deviceId === NETWORK_DEVICE_IDS.MANAGED_SWITCH &&
        [
          NETWORK_PROCEDURE_STEPS.OPEN_SWITCH_CLI,
          NETWORK_PROCEDURE_STEPS.CONFIGURE_SWITCH,
        ].includes(state.networkCurrentStep)
      ) {
        return {
          networkOverlay: NETWORK_OVERLAYS.SWITCH_TERMINAL,
          networkCurrentStep: NETWORK_PROCEDURE_STEPS.CONFIGURE_SWITCH,
          procedureFeedback: 'Managed switch console opened.',
        }
      }

      return {}
    })
  },
  closeNetworkOverlay: () => {
    set({ networkOverlay: null, settingsFeedback: null, settingsFeedbackType: null })
  },
  applyWorkstationIPv4: ({ ipAddress, subnetMask, defaultGateway }) => {
    set((state) => {
      const troubleshootingActive = isTroubleshootingActive(state)

      if (
        !troubleshootingActive &&
        state.networkCurrentStep !== NETWORK_PROCEDURE_STEPS.CONFIGURE_PC_IPV4
      ) {
        return {}
      }

      const syntaxValidation = validateIPv4Values({
        ipAddress,
        subnetMask,
        defaultGateway,
      })

      if (!syntaxValidation.valid) {
        return {
          settingsFeedback: syntaxValidation.message,
          settingsFeedbackType: 'error',
          procedureFeedback: syntaxValidation.message,
        }
      }

      const candidateState = {
        ...state,
        workstationIp: ipAddress.trim(),
        workstationMask: subnetMask.trim(),
        workstationGateway: defaultGateway.trim(),
      }

      if (troubleshootingActive) {
        return {
          workstationIp: candidateState.workstationIp,
          workstationMask: candidateState.workstationMask,
          workstationGateway: candidateState.workstationGateway,
          workstationIpConfigured: true,
          networkOverlay: null,
          settingsFeedback: null,
          settingsFeedbackType: null,
          troubleshootingVerificationResults: null,
          troubleshootingFeedback:
            'Workstation IPv4 settings applied. Retest connectivity before verification.',
        }
      }

      const workstationIpConfigured = isWorkstationConfigurationCorrect(
        candidateState,
      )

      if (!workstationIpConfigured) {
        return {
          workstationIp: candidateState.workstationIp,
          workstationMask: candidateState.workstationMask,
          workstationGateway: candidateState.workstationGateway,
          workstationIpConfigured: false,
          settingsFeedback: 'Valid address but incorrect configuration.',
          settingsFeedbackType: 'error',
          procedureFeedback: 'Valid address but incorrect configuration.',
        }
      }

      return {
        workstationIp: candidateState.workstationIp,
        workstationMask: candidateState.workstationMask,
        workstationGateway: candidateState.workstationGateway,
        workstationIpConfigured: true,
        networkCurrentStep: NETWORK_PROCEDURE_STEPS.PC_IPV4_CONFIGURED,
        networkOverlay: null,
        settingsFeedback: null,
        settingsFeedbackType: null,
        procedureFeedback: 'IPv4 configuration applied successfully.',
      }
    })
  },
  executeNetworkCommand: (terminalType, command) => {
    set((state) => {
      const normalizedCommand = command.trim()
      const historyField = terminalHistoryFields[terminalType]

      if (!normalizedCommand || !historyField || state.isProcedureAnimating) {
        return {}
      }

      const prompt = getTerminalPrompt(terminalType, state)
      const result = executeTerminalCommand(terminalType, normalizedCommand, state)
      const terminalSequence = state.terminalSequence + 1
      const historyEntry = {
        id: terminalSequence,
        prompt,
        command: normalizedCommand,
        output: result.output,
      }
      const nextHistory = result.clearHistory
        ? []
        : [...state[historyField], historyEntry]
      const troubleshootingMetrics = isTroubleshootingActive(state)
        ? {
            ...state.troubleshootingMetrics,
            diagnosticCommandsUsed: [
              ...state.troubleshootingMetrics.diagnosticCommandsUsed,
              {
                terminalType,
                command: normalizedCommand,
                timestamp: Date.now(),
              },
            ],
            pingAttempts:
              state.troubleshootingMetrics.pingAttempts +
              (/^ping\s+/i.test(normalizedCommand) ? 1 : 0),
          }
        : state.troubleshootingMetrics

      return {
        ...result.updates,
        [historyField]: nextHistory,
        terminalSequence,
        troubleshootingMetrics,
        ...(isTroubleshootingActive(state)
          ? { troubleshootingVerificationResults: null }
          : {}),
        ...(result.feedback ? { procedureFeedback: result.feedback } : {}),
      }
    })
  },
  selectNetworkCable: (cableId) => {
    set((state) => {
      const troubleshootingScenario = isTroubleshootingActive(state)
        ? getTroubleshootingScenario(state.selectedTroubleshootingScenarioId)
        : null
      const allowedCableIds = troubleshootingScenario?.repairCableId
        ? [troubleshootingScenario.repairCableId]
        : connectionStepCableRules[state.networkCurrentStep] ?? []
      const cable = getNetworkCableConfig(cableId)
      const connection = state.networkConnections.find(
        (item) => item.id === cableId,
      )

      if (!cable || !allowedCableIds.length || state.isProcedureAnimating) {
        return {}
      }

      if (!allowedCableIds.includes(cableId) || connection?.connected) {
        return {
          procedureFeedback:
            state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.CONNECT_POWER &&
            cable.type !== 'power'
              ? 'Select a power cable for the router or managed switch.'
              : `${cable.name} is not required for this connection.`,
        }
      }

      return {
        ...clearedNetworkHoverState,
        selectedCableId: cableId,
        selectedSourcePortId:
          troubleshootingScenario && connection?.sourceConnected
            ? cable.sourcePortId
            : null,
        selectedNetworkPortId: null,
        procedureFeedback: `${cable.name} selected. Choose ${getNetworkPortConfig(cable.sourcePortId)?.name}.`,
        ...(troubleshootingScenario
          ? {
              troubleshootingFeedback: connection?.sourceConnected
                ? `${cable.name} selected. Reconnect the free connector to ${getNetworkPortConfig(cable.destinationPortId)?.name}.`
                : `${cable.name} selected. Choose ${getNetworkPortConfig(cable.sourcePortId)?.name}.`,
            }
          : {}),
      }
    })
  },
  selectNetworkPort: (portId) => {
    set((state) => {
      if (!state.selectedCableId || state.isProcedureAnimating) {
        return {}
      }

      const cable = getNetworkCableConfig(state.selectedCableId)
      const port = getNetworkPortConfig(portId)

      if (!cable || !port) {
        return {}
      }

      if (port.type !== cable.type) {
        return {
          procedureFeedback:
            cable.type === 'power'
              ? 'A power cable cannot be connected to an Ethernet port.'
              : 'An Ethernet cable cannot be connected to a power port.',
        }
      }

      if (state.portOccupancy[portId]) {
        return { procedureFeedback: `${port.name} is already occupied.` }
      }

      if (!state.selectedSourcePortId) {
        if (portId !== cable.sourcePortId) {
          return {
            procedureFeedback: `Start at ${getNetworkPortConfig(cable.sourcePortId)?.name}.`,
          }
        }

        return {
          ...clearedNetworkHoverState,
          selectedSourcePortId: portId,
          selectedNetworkPortId: portId,
          procedureFeedback: `${port.name} selected. Now choose ${getNetworkPortConfig(cable.destinationPortId)?.name}.`,
        }
      }

      if (portId === state.selectedSourcePortId) {
        return { procedureFeedback: 'A cable cannot connect a port to itself.' }
      }

      if (portId !== cable.destinationPortId) {
        return {
          procedureFeedback: `Incorrect destination. Choose ${getNetworkPortConfig(cable.destinationPortId)?.name}.`,
        }
      }

      return {
        ...clearedNetworkHoverState,
        selectedNetworkPortId: portId,
        activeConnectionId: cable.id,
        isProcedureAnimating: true,
        procedureFeedback: `Connecting ${cable.name}...`,
        ...(isTroubleshootingActive(state)
          ? { troubleshootingFeedback: `Connecting ${cable.name}...` }
          : {}),
      }
    })
  },
  completeNetworkConnection: (cableId) => {
    set((state) => {
      if (
        state.activeConnectionId !== cableId ||
        !state.isProcedureAnimating
      ) {
        return {}
      }

      const cable = getNetworkCableConfig(cableId)

      if (!cable) {
        return {}
      }

      const troubleshootingUpdate = isTroubleshootingActive(state)
        ? getTroubleshootingConnectionUpdate(cableId)
        : getConnectionCompletionUpdate(state, cableId)

      return {
        ...troubleshootingUpdate,
        networkConnections: updateConnectionList(
          state.networkConnections,
          cableId,
          true,
        ),
        portOccupancy: {
          ...state.portOccupancy,
          [cable.sourcePortId]: cableId,
          [cable.destinationPortId]: cableId,
        },
        selectedCableId: null,
        selectedSourcePortId: null,
        selectedNetworkPortId: null,
        activeConnectionId: null,
        isProcedureAnimating: false,
        ...(isTroubleshootingActive(state)
          ? { troubleshootingVerificationResults: null }
          : {}),
      }
    })
  },
  startNetworkPowerOn: () => {
    set((state) => {
      const readyToPowerOn =
        state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.POWER_ON_NETWORK &&
        state.patchPanelInstalled &&
        state.switchInstalled &&
        state.routerInstalled &&
        state.routerPowerConnected &&
        state.switchPowerConnected &&
        state.patchSwitchConnected &&
        state.switchRouterConnected &&
        state.pcSwitchConnected

      return readyToPowerOn
        ? {
            networkCurrentStep: NETWORK_PROCEDURE_STEPS.POWERING_ON_NETWORK,
            isProcedureAnimating: true,
            powerOnStartedAt: Date.now(),
            procedureFeedback: 'Starting switch, router, and physical links...',
          }
        : {
            procedureFeedback:
              'Install, power, and cable all required devices before startup.',
          }
    })
  },
  completeNetworkPowerOn: () => {
    set((state) =>
      state.networkCurrentStep ===
        NETWORK_PROCEDURE_STEPS.POWERING_ON_NETWORK &&
      state.isProcedureAnimating
        ? {
            networkCurrentStep: NETWORK_PROCEDURE_STEPS.VERIFY_LINKS,
            networkPowered: true,
            isProcedureAnimating: false,
            procedureFeedback:
              'Network powered. Inspect the active physical link indicators.',
          }
        : {},
    )
  },
  verifyNetworkLinkPort: (portId) => {
    set((state) => {
      if (
        state.networkCurrentStep !== NETWORK_PROCEDURE_STEPS.VERIFY_LINKS ||
        !state.networkPowered ||
        state.isProcedureAnimating
      ) {
        return {}
      }

      const port = getNetworkPortConfig(portId)

      if (!NETWORK_REQUIRED_VERIFICATION_PORT_IDS.includes(portId)) {
        return {
          procedureFeedback: `${port?.name ?? 'That port'} is not part of the required link check.`,
        }
      }

      if (!state.portOccupancy[portId]) {
        return { procedureFeedback: `${port.name} has no active connection.` }
      }

      const verifiedLinkPortIds = [
        ...new Set([...state.verifiedLinkPortIds, portId]),
      ]
      const verificationComplete = NETWORK_REQUIRED_VERIFICATION_PORT_IDS.every(
        (requiredPortId) => verifiedLinkPortIds.includes(requiredPortId),
      )

      return {
        selectedNetworkPortId: portId,
        verifiedLinkPortIds,
        physicalLinksVerified: verificationComplete,
        networkCurrentStep: verificationComplete
          ? NETWORK_PROCEDURE_STEPS.PHYSICAL_INSTALLATION_COMPLETE
          : state.networkCurrentStep,
        procedureFeedback: verificationComplete
          ? 'PHYSICAL INSTALLATION PASS'
          : `${port.name}: LINK ACTIVE`,
      }
    })
  },
  setHoveredNetworkObject: (objectId, label) => {
    set({ hoveredNetworkObjectId: objectId, hoveredNetworkLabel: label })
  },
  clearHoveredNetworkObject: (objectId) => {
    set((state) =>
      state.hoveredNetworkObjectId === objectId
        ? { hoveredNetworkObjectId: null, hoveredNetworkLabel: null }
        : {},
    )
  },
  requestNetworkInspectionView: (view) => {
    set((state) => ({
      inspectionViewRequest: {
        id: state.inspectionViewRequest.id + 1,
        view,
      },
    }))
  },
  restartNetworkStep: () => {
    set((state) => {
      const installationRule = installationRules[state.networkCurrentStep]

      if (installationRule) {
        return {
          networkCurrentStep:
            installationRule.deviceId === NETWORK_DEVICE_IDS.PATCH_PANEL
              ? NETWORK_PROCEDURE_STEPS.SELECT_PATCH_PANEL
              : installationRule.deviceId === NETWORK_DEVICE_IDS.MANAGED_SWITCH
                ? NETWORK_PROCEDURE_STEPS.SELECT_SWITCH
                : NETWORK_PROCEDURE_STEPS.SELECT_ROUTER,
          selectedNetworkDeviceId: null,
          activeInstallationDeviceId: null,
          isProcedureAnimating: false,
          procedureFeedback: null,
        }
      }

      if (
        state.networkCurrentStep ===
        NETWORK_PROCEDURE_STEPS.PATCH_PANEL_INSTALLED
      ) {
        return {
          patchPanelInstalled: false,
          networkCurrentStep: NETWORK_PROCEDURE_STEPS.SELECT_PATCH_PANEL,
          procedureFeedback: null,
        }
      }

      if (state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.SWITCH_INSTALLED) {
        return {
          switchInstalled: false,
          networkCurrentStep: NETWORK_PROCEDURE_STEPS.SELECT_SWITCH,
          procedureFeedback: null,
        }
      }

      if (state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.ROUTER_INSTALLED) {
        return {
          routerInstalled: false,
          networkCurrentStep: NETWORK_PROCEDURE_STEPS.SELECT_ROUTER,
          procedureFeedback: null,
        }
      }

      if (
        state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.CONFIGURE_PC_IPV4 ||
        state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.PC_IPV4_CONFIGURED
      ) {
        return {
          ...getWorkstationResetState(),
          networkCurrentStep: NETWORK_PROCEDURE_STEPS.CONFIGURE_PC_IPV4,
          networkOverlay: null,
          procedureFeedback: null,
        }
      }

      if (
        [
          NETWORK_PROCEDURE_STEPS.OPEN_ROUTER_CLI,
          NETWORK_PROCEDURE_STEPS.CONFIGURE_ROUTER,
          NETWORK_PROCEDURE_STEPS.ROUTER_CONFIGURED,
        ].includes(state.networkCurrentStep)
      ) {
        return {
          ...getRouterResetState(),
          networkCurrentStep: NETWORK_PROCEDURE_STEPS.OPEN_ROUTER_CLI,
          networkOverlay: null,
          procedureFeedback: null,
        }
      }

      if (
        [
          NETWORK_PROCEDURE_STEPS.OPEN_SWITCH_CLI,
          NETWORK_PROCEDURE_STEPS.CONFIGURE_SWITCH,
          NETWORK_PROCEDURE_STEPS.SWITCH_CONFIGURED,
        ].includes(state.networkCurrentStep)
      ) {
        return {
          ...getSwitchResetState(),
          networkCurrentStep: NETWORK_PROCEDURE_STEPS.OPEN_SWITCH_CLI,
          networkOverlay: null,
          procedureFeedback: null,
        }
      }

      if (
        state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.VERIFY_PC_CONFIG ||
        state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.PC_CONFIG_VERIFIED
      ) {
        return {
          pcConfigVerified: false,
          routerPingPassed: false,
          switchPingPassed: false,
          workstationTerminalHistory: [],
          networkCurrentStep: NETWORK_PROCEDURE_STEPS.VERIFY_PC_CONFIG,
          networkOverlay: NETWORK_OVERLAYS.WORKSTATION_TERMINAL,
          procedureFeedback: null,
        }
      }

      if (
        state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.PING_ROUTER ||
        state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.ROUTER_PING_PASS
      ) {
        return {
          routerPingPassed: false,
          switchPingPassed: false,
          workstationTerminalHistory: [],
          networkCurrentStep: NETWORK_PROCEDURE_STEPS.PING_ROUTER,
          networkOverlay: NETWORK_OVERLAYS.WORKSTATION_TERMINAL,
          procedureFeedback: null,
        }
      }

      if (
        state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.PING_SWITCH ||
        state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.SWITCH_PING_PASS ||
        state.networkCurrentStep ===
          NETWORK_PROCEDURE_STEPS.LOGICAL_CONFIGURATION_COMPLETE
      ) {
        return {
          switchPingPassed: false,
          workstationTerminalHistory: [],
          networkCurrentStep: NETWORK_PROCEDURE_STEPS.PING_SWITCH,
          networkOverlay: NETWORK_OVERLAYS.WORKSTATION_TERMINAL,
          procedureFeedback: null,
        }
      }

      if (
        state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.CONNECT_POWER ||
        state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.POWER_CONNECTED
      ) {
        const withoutRouterPower = {
          ...state,
          ...disconnectCable(state, NETWORK_CABLE_IDS.ROUTER_POWER),
        }

        return {
          ...disconnectCable(
            withoutRouterPower,
            NETWORK_CABLE_IDS.SWITCH_POWER,
          ),
          routerPowerConnected: false,
          switchPowerConnected: false,
          networkCurrentStep: NETWORK_PROCEDURE_STEPS.CONNECT_POWER,
        }
      }

      const connectionRestartRules = {
        [NETWORK_PROCEDURE_STEPS.CONNECT_PATCH_TO_SWITCH]:
          NETWORK_CABLE_IDS.PATCH_TO_SWITCH,
        [NETWORK_PROCEDURE_STEPS.PATCH_SWITCH_CONNECTED]:
          NETWORK_CABLE_IDS.PATCH_TO_SWITCH,
        [NETWORK_PROCEDURE_STEPS.CONNECT_SWITCH_TO_ROUTER]:
          NETWORK_CABLE_IDS.SWITCH_TO_ROUTER,
        [NETWORK_PROCEDURE_STEPS.SWITCH_ROUTER_CONNECTED]:
          NETWORK_CABLE_IDS.SWITCH_TO_ROUTER,
        [NETWORK_PROCEDURE_STEPS.CONNECT_PC_TO_SWITCH]:
          NETWORK_CABLE_IDS.PC_TO_SWITCH,
        [NETWORK_PROCEDURE_STEPS.PC_SWITCH_CONNECTED]:
          NETWORK_CABLE_IDS.PC_TO_SWITCH,
      }
      const cableId = connectionRestartRules[state.networkCurrentStep]

      if (cableId) {
        const stepByCableId = {
          [NETWORK_CABLE_IDS.PATCH_TO_SWITCH]:
            NETWORK_PROCEDURE_STEPS.CONNECT_PATCH_TO_SWITCH,
          [NETWORK_CABLE_IDS.SWITCH_TO_ROUTER]:
            NETWORK_PROCEDURE_STEPS.CONNECT_SWITCH_TO_ROUTER,
          [NETWORK_CABLE_IDS.PC_TO_SWITCH]:
            NETWORK_PROCEDURE_STEPS.CONNECT_PC_TO_SWITCH,
        }

        return {
          ...disconnectCable(state, cableId),
          networkCurrentStep: stepByCableId[cableId],
        }
      }

      if (
        state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.POWER_ON_NETWORK ||
        state.networkCurrentStep ===
          NETWORK_PROCEDURE_STEPS.POWERING_ON_NETWORK
      ) {
        return {
          networkCurrentStep: NETWORK_PROCEDURE_STEPS.POWER_ON_NETWORK,
          networkPowered: false,
          powerOnStartedAt: null,
          isProcedureAnimating: false,
          verifiedLinkPortIds: [],
          physicalLinksVerified: false,
          procedureFeedback: null,
        }
      }

      if (
        state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.VERIFY_LINKS ||
        state.networkCurrentStep ===
          NETWORK_PROCEDURE_STEPS.PHYSICAL_INSTALLATION_COMPLETE
      ) {
        return {
          networkCurrentStep: NETWORK_PROCEDURE_STEPS.VERIFY_LINKS,
          verifiedLinkPortIds: [],
          selectedNetworkPortId: null,
          physicalLinksVerified: false,
          procedureFeedback: null,
        }
      }

      return {
        selectedNetworkDeviceId: null,
        selectedCableId: null,
        selectedSourcePortId: null,
        selectedNetworkPortId: null,
        activeConnectionId: null,
        isProcedureAnimating: false,
        procedureFeedback: null,
      }
    })
  },
  restartNetworkTraining: () => {
    set((state) =>
      state.activeModuleId === NETWORK_MODULE_ID && state.networkTrainingStarted
        ? createStartedNetworkState()
        : {},
    )
  },
  resetNetworkTraining: () => set(createInitialNetworkState()),
}))

export default useNetworkTrainingStore
export { NETWORK_OVERLAYS }
