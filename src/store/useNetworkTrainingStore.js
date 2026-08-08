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
  }))
}

function createInitialNetworkState() {
  return {
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
    networkConnections: createInitialConnections(),
    portOccupancy: {},
    verifiedLinkPortIds: [],
    physicalLinksVerified: false,
  }
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
    connection.id === cableId ? { ...connection, connected } : connection,
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

const useNetworkTrainingStore = create((set) => ({
  ...createInitialNetworkState(),

  beginNetworkTraining: () => set(createStartedNetworkState()),
  inspectNetworkRack: () => {
    set((state) =>
      state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.INSPECT_RACK &&
      !state.isProcedureAnimating
        ? {
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

      return nextStep
        ? {
            networkCurrentStep: nextStep,
            procedureFeedback: null,
            selectedNetworkDeviceId: null,
            selectedCableId: null,
            selectedSourcePortId: null,
            selectedNetworkPortId: null,
          }
        : {}
    })
  },
  selectNetworkCable: (cableId) => {
    set((state) => {
      const allowedCableIds =
        connectionStepCableRules[state.networkCurrentStep] ?? []
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
        selectedCableId: cableId,
        selectedSourcePortId: null,
        selectedNetworkPortId: null,
        procedureFeedback: `${cable.name} selected. Choose ${getNetworkPortConfig(cable.sourcePortId)?.name}.`,
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
        selectedNetworkPortId: portId,
        activeConnectionId: cable.id,
        isProcedureAnimating: true,
        procedureFeedback: `Connecting ${cable.name}...`,
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

      return {
        ...getConnectionCompletionUpdate(state, cableId),
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
