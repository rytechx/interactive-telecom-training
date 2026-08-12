import { NETWORK_WORKSTATION_LAYOUT } from './networkWorkstationLayout.js'

const NETWORK_DEVICE_IDS = Object.freeze({
  PATCH_PANEL: 'patch-panel',
  MANAGED_SWITCH: 'managed-switch',
  ROUTER: 'router',
  WORKSTATION_PC: 'workstation-pc',
  PDU: 'rack-pdu',
})

const NETWORK_SLOT_IDS = Object.freeze({
  PATCH_PANEL: 'rack-ru-4',
  MANAGED_SWITCH: 'rack-ru-5',
  ROUTER: 'rack-ru-6',
})

const NETWORK_PORT_TYPES = Object.freeze({
  ETHERNET: 'ethernet',
  POWER: 'power',
  CONSOLE: 'console',
})

const NETWORK_RACK_CONFIG = Object.freeze({
  width: 2.05,
  colliderWidth: 3.15,
  height: 2.85,
  depth: 0.9,
  railX: 0.91,
  frontZ: 0.43,
})

const NETWORK_PDU_CONFIG = Object.freeze({
  position: Object.freeze([1.55, 0.72, 0.22]),
  rotation: Object.freeze([0, -0.18, 0]),
  dimensions: Object.freeze([0.24, 1.12, 0.16]),
  facePosition: Object.freeze([1.55, 0.72, 0.315]),
  faceDimensions: Object.freeze([0.18, 1, 0.02]),
  accentPosition: Object.freeze([1.55, 0.72, 0.337]),
  labelPosition: Object.freeze([1.49, 1.32, 0.36]),
  mountingBracketDimensions: Object.freeze([0.46, 0.06, 0.07]),
  mountingBracketPositions: Object.freeze([
    Object.freeze([1.245, 1.08, 0.22]),
    Object.freeze([1.245, 0.4, 0.22]),
  ]),
})

const switchPortXPositions = [-0.62, -0.44, -0.26, -0.08, 0.1, 0.28, 0.46, 0.64]
const patchPortXPositions = [-0.62, -0.44, -0.26, -0.08, 0.1, 0.28, 0.46, 0.64]

const NETWORK_DEVICE_CONFIGS = Object.freeze({
  [NETWORK_DEVICE_IDS.PATCH_PANEL]: Object.freeze({
    id: NETWORK_DEVICE_IDS.PATCH_PANEL,
    name: '8-Port Patch Panel',
    shortName: 'Patch Panel',
    type: 'rack-device',
    color: '#515d63',
    frontColor: '#303a40',
    dimensions: Object.freeze([1.72, 0.22, 0.44]),
    preparationPosition:
      NETWORK_WORKSTATION_LAYOUT.patchPanelPreparationPosition,
    mountedPosition: Object.freeze([0, 1.15, 0.12]),
    targetSlotId: NETWORK_SLOT_IDS.PATCH_PANEL,
    rackUnit: 4,
    ports: Object.freeze(
      patchPortXPositions.map((positionX, index) =>
        Object.freeze({
          id: `patch-panel-port-${index + 1}`,
          deviceId: NETWORK_DEVICE_IDS.PATCH_PANEL,
          name: `Patch Panel Port ${index + 1}`,
          shortLabel: `${index + 1}`,
          physicalLabel: `${index + 1}`,
          physicalLabelPosition: Object.freeze([0, -0.075, 0.07]),
          portNumber: index + 1,
          type: NETWORK_PORT_TYPES.ETHERNET,
          position: Object.freeze([positionX, 0, 0.245]),
        }),
      ),
    ),
  }),
  [NETWORK_DEVICE_IDS.MANAGED_SWITCH]: Object.freeze({
    id: NETWORK_DEVICE_IDS.MANAGED_SWITCH,
    name: '8-Port Managed Switch',
    shortName: 'Managed Switch',
    type: 'rack-device',
    color: '#3e4d56',
    frontColor: '#27343b',
    dimensions: Object.freeze([1.72, 0.24, 0.5]),
    preparationPosition: NETWORK_WORKSTATION_LAYOUT.switchPreparationPosition,
    mountedPosition: Object.freeze([0, 1.49, 0.09]),
    targetSlotId: NETWORK_SLOT_IDS.MANAGED_SWITCH,
    rackUnit: 5,
    ports: Object.freeze([
      ...switchPortXPositions.map((positionX, index) =>
        Object.freeze({
          id: `switch-port-${index + 1}`,
          deviceId: NETWORK_DEVICE_IDS.MANAGED_SWITCH,
          name:
            index === 7
              ? 'Switch Port 8 Uplink'
              : `Switch Port ${index + 1}`,
          shortLabel: `${index + 1}`,
          physicalLabel: `${index + 1}`,
          physicalLabelPosition: Object.freeze([0, -0.078, 0.07]),
          portNumber: index + 1,
          type: NETWORK_PORT_TYPES.ETHERNET,
          position: Object.freeze([positionX, -0.01, 0.275]),
          hasLinkIndicator: true,
          ...(index === 1
            ? {
                hitboxDimensions: Object.freeze([0.3, 0.22, 0.22]),
                hitboxOffsetZ: 0.4,
                tooltipPosition: Object.freeze([0, 0.2, 0.2]),
              }
            : {}),
        }),
      ),
      Object.freeze({
        id: 'switch-power-port',
        deviceId: NETWORK_DEVICE_IDS.MANAGED_SWITCH,
        name: 'Managed Switch Power Input',
        shortLabel: 'POWER',
        physicalLabel: 'POWER',
        physicalLabelPosition: Object.freeze([0, -0.09, 0.06]),
        type: NETWORK_PORT_TYPES.POWER,
        position: Object.freeze([0.82, 0.055, 0.285]),
      }),
    ]),
  }),
  [NETWORK_DEVICE_IDS.ROUTER]: Object.freeze({
    id: NETWORK_DEVICE_IDS.ROUTER,
    name: 'Gigabit Training Router',
    shortName: 'Router',
    type: 'rack-device',
    color: '#465158',
    frontColor: '#2b353b',
    dimensions: Object.freeze([1.72, 0.24, 0.52]),
    preparationPosition: NETWORK_WORKSTATION_LAYOUT.routerPreparationPosition,
    mountedPosition: Object.freeze([0, 1.83, 0.08]),
    targetSlotId: NETWORK_SLOT_IDS.ROUTER,
    rackUnit: 6,
    ports: Object.freeze([
      Object.freeze({
        id: 'router-wan-1',
        deviceId: NETWORK_DEVICE_IDS.ROUTER,
        name: 'Router WAN Port',
        shortLabel: 'WAN',
        physicalLabel: 'WAN',
        physicalLabelPosition: Object.freeze([0, -0.078, 0.07]),
        type: NETWORK_PORT_TYPES.ETHERNET,
        position: Object.freeze([-0.48, -0.005, 0.285]),
        hasLinkIndicator: true,
      }),
      Object.freeze({
        id: 'router-lan-1',
        deviceId: NETWORK_DEVICE_IDS.ROUTER,
        name: 'Router G0/0',
        shortLabel: 'G0/0',
        physicalLabel: 'G0/0',
        physicalLabelPosition: Object.freeze([0, -0.078, 0.07]),
        type: NETWORK_PORT_TYPES.ETHERNET,
        position: Object.freeze([-0.25, -0.005, 0.285]),
        hasLinkIndicator: true,
        hitboxDimensions: Object.freeze([0.24, 0.2, 0.2]),
        hitboxOffsetZ: 0.32,
      }),
      Object.freeze({
        id: 'router-console',
        deviceId: NETWORK_DEVICE_IDS.ROUTER,
        name: 'Router Console Port',
        shortLabel: 'CON',
        physicalLabel: 'CON',
        physicalLabelPosition: Object.freeze([0, -0.078, 0.07]),
        type: NETWORK_PORT_TYPES.CONSOLE,
        position: Object.freeze([0.08, -0.005, 0.285]),
      }),
      Object.freeze({
        id: 'router-power-port',
        deviceId: NETWORK_DEVICE_IDS.ROUTER,
        name: 'Router Power Input',
        shortLabel: 'POWER',
        physicalLabel: 'POWER',
        physicalLabelPosition: Object.freeze([0, -0.09, 0.06]),
        type: NETWORK_PORT_TYPES.POWER,
        position: Object.freeze([0.82, 0.055, 0.295]),
      }),
    ]),
  }),
  [NETWORK_DEVICE_IDS.WORKSTATION_PC]: Object.freeze({
    id: NETWORK_DEVICE_IDS.WORKSTATION_PC,
    name: 'Network Workstation PC',
    shortName: 'Workstation PC',
    type: 'desktop-device',
    color: '#46525a',
    frontColor: '#252f35',
    dimensions: Object.freeze([0.42, 0.64, 0.52]),
    preparationPosition: NETWORK_WORKSTATION_LAYOUT.workstationPcPosition,
    mountedPosition: NETWORK_WORKSTATION_LAYOUT.workstationPcPosition,
    ports: Object.freeze([
      Object.freeze({
        id: 'pc-eth0',
        deviceId: NETWORK_DEVICE_IDS.WORKSTATION_PC,
        name: 'PC Ethernet Port',
        shortLabel: 'ETH',
        physicalLabel: 'ETH',
        physicalLabelPosition: Object.freeze([0, -0.095, 0.07]),
        type: NETWORK_PORT_TYPES.ETHERNET,
        position: Object.freeze([0, 0.02, 0.285]),
        hasLinkIndicator: true,
      }),
    ]),
  }),
})

const NETWORK_RACK_SLOTS = Object.freeze([
  Object.freeze({
    id: NETWORK_SLOT_IDS.PATCH_PANEL,
    rackUnit: 4,
    label: 'RU 4 · Patch Panel',
    position: Object.freeze([0, 1.15, 0.45]),
    expectedDeviceId: NETWORK_DEVICE_IDS.PATCH_PANEL,
  }),
  Object.freeze({
    id: NETWORK_SLOT_IDS.MANAGED_SWITCH,
    rackUnit: 5,
    label: 'RU 5 · Managed Switch',
    position: Object.freeze([0, 1.49, 0.45]),
    expectedDeviceId: NETWORK_DEVICE_IDS.MANAGED_SWITCH,
  }),
  Object.freeze({
    id: NETWORK_SLOT_IDS.ROUTER,
    rackUnit: 6,
    label: 'RU 6 · Router',
    position: Object.freeze([0, 1.83, 0.45]),
    expectedDeviceId: NETWORK_DEVICE_IDS.ROUTER,
  }),
])

const PDU_PORTS = Object.freeze([
  Object.freeze({
    id: 'pdu-outlet-1',
    deviceId: NETWORK_DEVICE_IDS.PDU,
    name: 'PDU Outlet 1',
    shortLabel: '1',
    physicalLabel: '1',
    physicalLabelPosition: Object.freeze([-0.075, 0, 0.064]),
    type: NETWORK_PORT_TYPES.POWER,
    position: Object.freeze([1.55, 0.91, 0.34]),
    rotation: NETWORK_PDU_CONFIG.rotation,
    visibleDimensions: Object.freeze([0.102, 0.084]),
    hitboxDimensions: Object.freeze([0.28, 0.22, 0.2]),
    tooltipPosition: Object.freeze([-0.24, 0.13, 0.14]),
    faceplateColor: '#7e8d94',
    socketRingColor: '#c0cbd0',
  }),
  Object.freeze({
    id: 'pdu-outlet-2',
    deviceId: NETWORK_DEVICE_IDS.PDU,
    name: 'PDU Outlet 2',
    shortLabel: '2',
    physicalLabel: '2',
    physicalLabelPosition: Object.freeze([-0.075, 0, 0.064]),
    type: NETWORK_PORT_TYPES.POWER,
    position: Object.freeze([1.55, 0.54, 0.34]),
    rotation: NETWORK_PDU_CONFIG.rotation,
    visibleDimensions: Object.freeze([0.102, 0.084]),
    hitboxDimensions: Object.freeze([0.28, 0.22, 0.2]),
    tooltipPosition: Object.freeze([-0.24, 0.13, 0.14]),
    faceplateColor: '#7e8d94',
    socketRingColor: '#c0cbd0',
  }),
])

const NETWORK_PORTS = Object.freeze(
  Object.fromEntries([
    ...Object.values(NETWORK_DEVICE_CONFIGS).flatMap((device) => device.ports),
    ...PDU_PORTS,
  ].map((port) => [port.id, port])),
)

const NETWORK_REQUIRED_VERIFICATION_PORT_IDS = Object.freeze([
  'switch-port-1',
  'switch-port-2',
  'switch-port-8',
  'router-lan-1',
])

function getNetworkDeviceConfig(deviceId) {
  return NETWORK_DEVICE_CONFIGS[deviceId] ?? null
}

function getNetworkPortConfig(portId) {
  return NETWORK_PORTS[portId] ?? null
}

function getNetworkPortRackPosition(portId) {
  const port = getNetworkPortConfig(portId)

  if (!port) {
    return null
  }

  if (port.deviceId === NETWORK_DEVICE_IDS.PDU) {
    return [...port.position]
  }

  const device = getNetworkDeviceConfig(port.deviceId)

  if (!device) {
    return null
  }

  return [
    device.mountedPosition[0] + port.position[0],
    device.mountedPosition[1] + port.position[1],
    device.mountedPosition[2] + port.position[2],
  ]
}

export {
  getNetworkDeviceConfig,
  getNetworkPortConfig,
  getNetworkPortRackPosition,
  NETWORK_DEVICE_CONFIGS,
  NETWORK_DEVICE_IDS,
  NETWORK_PORTS,
  NETWORK_PORT_TYPES,
  NETWORK_PDU_CONFIG,
  NETWORK_RACK_CONFIG,
  NETWORK_RACK_SLOTS,
  NETWORK_REQUIRED_VERIFICATION_PORT_IDS,
  NETWORK_SLOT_IDS,
  PDU_PORTS,
}
