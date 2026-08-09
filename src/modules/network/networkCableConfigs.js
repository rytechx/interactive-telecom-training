import { Euler, Vector3 } from 'three'
import {
  getNetworkPortRackPosition,
  NETWORK_PORT_TYPES,
} from './networkDeviceConfigs.js'
import { NETWORK_WORKSTATION_LAYOUT } from './networkWorkstationLayout.js'

const NETWORK_CABLE_IDS = Object.freeze({
  ROUTER_POWER: 'router-power-cable',
  SWITCH_POWER: 'switch-power-cable',
  PATCH_TO_SWITCH: 'patch-to-switch',
  SWITCH_TO_ROUTER: 'switch-to-router',
  PC_TO_SWITCH: 'pc-to-switch',
})

const POWER_CABLE_HOME_SHAPE = Object.freeze([
  Object.freeze([-0.38, 0, -0.1]),
  Object.freeze([-0.2, 0.028, 0.06]),
  Object.freeze([0, 0.04, 0.14]),
  Object.freeze([0.2, 0.028, 0.06]),
  Object.freeze([0.38, 0, -0.1]),
])

const ROUTER_POWER_HOME = Object.freeze({
  position: NETWORK_WORKSTATION_LAYOUT.routerPowerHomePosition,
  rotation: Object.freeze([0, 0, 0]),
  scale: 1,
})

const SWITCH_POWER_HOME = Object.freeze({
  position: NETWORK_WORKSTATION_LAYOUT.switchPowerHomePosition,
  rotation: Object.freeze([0, 0, 0]),
  scale: 1,
})

const PREPARATION_CABLE_CENTERS = Object.freeze({
  patch: NETWORK_WORKSTATION_LAYOUT.patchCableHomePosition,
  uplink: NETWORK_WORKSTATION_LAYOUT.uplinkCableHomePosition,
  workstation: NETWORK_WORKSTATION_LAYOUT.workstationCableHomePosition,
})

function createHomePath(homePosition, homeRotation, homeScale) {
  const rotation = new Euler(...homeRotation)
  const origin = new Vector3(...homePosition)

  return Object.freeze(
    POWER_CABLE_HOME_SHAPE.map((point) =>
      Object.freeze(
        new Vector3(...point)
          .multiplyScalar(homeScale)
          .applyEuler(rotation)
          .add(origin)
          .toArray(),
      ),
    ),
  )
}

function createConnectionPath(sourcePortId, destinationPortId, routePoints) {
  return Object.freeze([
    Object.freeze(getNetworkPortRackPosition(sourcePortId)),
    ...routePoints.map((point) => Object.freeze(point)),
    Object.freeze(getNetworkPortRackPosition(destinationPortId)),
  ])
}

function createParkedEthernetPath(centerPosition) {
  const [centerX, centerY, centerZ] = centerPosition

  return Object.freeze([
    Object.freeze([centerX - 0.2, centerY, centerZ - 0.08]),
    Object.freeze([centerX, centerY + 0.07, centerZ + 0.08]),
    Object.freeze([centerX + 0.2, centerY, centerZ - 0.08]),
  ])
}

const NETWORK_CABLE_CONFIGS = Object.freeze([
  Object.freeze({
    id: NETWORK_CABLE_IDS.ROUTER_POWER,
    name: 'Router Power Cable',
    type: NETWORK_PORT_TYPES.POWER,
    color: '#434d53',
    plugColor: '#657178',
    highlightColor: '#8fc1d2',
    sourcePortId: 'router-power-port',
    destinationPortId: 'pdu-outlet-1',
    homePosition: ROUTER_POWER_HOME.position,
    homeRotation: ROUTER_POWER_HOME.rotation,
    homeScale: ROUTER_POWER_HOME.scale,
    parkedPath: createHomePath(
      ROUTER_POWER_HOME.position,
      ROUTER_POWER_HOME.rotation,
      ROUTER_POWER_HOME.scale,
    ),
    connectedPath: createConnectionPath(
      'router-power-port',
      'pdu-outlet-1',
      [
        [0.98, 1.9, 0.48],
        [1.2, 1.72, 0.5],
        [1.46, 1.45, 0.48],
        [1.44, 1.2, 0.46],
      ],
    ),
    thickness: 0.027,
    interactionWidth: 0.11,
  }),
  Object.freeze({
    id: NETWORK_CABLE_IDS.SWITCH_POWER,
    name: 'Switch Power Cable',
    type: NETWORK_PORT_TYPES.POWER,
    color: '#4b555b',
    plugColor: '#6b767c',
    highlightColor: '#9ac7d6',
    sourcePortId: 'switch-power-port',
    destinationPortId: 'pdu-outlet-2',
    homePosition: SWITCH_POWER_HOME.position,
    homeRotation: SWITCH_POWER_HOME.rotation,
    homeScale: SWITCH_POWER_HOME.scale,
    parkedPath: createHomePath(
      SWITCH_POWER_HOME.position,
      SWITCH_POWER_HOME.rotation,
      SWITCH_POWER_HOME.scale,
    ),
    connectedPath: createConnectionPath(
      'switch-power-port',
      'pdu-outlet-2',
      [
        [0.98, 1.56, 0.47],
        [1.2, 1.38, 0.5],
        [1.46, 1.04, 0.48],
        [1.44, 0.76, 0.46],
      ],
    ),
    thickness: 0.027,
    interactionWidth: 0.11,
  }),
  Object.freeze({
    id: NETWORK_CABLE_IDS.PATCH_TO_SWITCH,
    name: 'Blue Patch Cable',
    type: NETWORK_PORT_TYPES.ETHERNET,
    color: '#3389bd',
    sourcePortId: 'patch-panel-port-1',
    destinationPortId: 'switch-port-1',
    parkedPath: createParkedEthernetPath(PREPARATION_CABLE_CENTERS.patch),
    connectedPath: createConnectionPath(
      'patch-panel-port-1',
      'switch-port-1',
      [
        [-0.82, 1.15, 0.59],
        [-0.82, 1.49, 0.59],
      ],
    ),
    thickness: 0.016,
    connectionDuration: 1,
    interactionWidth: 0.075,
  }),
  Object.freeze({
    id: NETWORK_CABLE_IDS.SWITCH_TO_ROUTER,
    name: 'Yellow Uplink Cable',
    type: NETWORK_PORT_TYPES.ETHERNET,
    color: '#d8ad42',
    sourcePortId: 'switch-port-8',
    destinationPortId: 'router-lan-1',
    parkedPath: createParkedEthernetPath(PREPARATION_CABLE_CENTERS.uplink),
    connectedPath: createConnectionPath(
      'switch-port-8',
      'router-lan-1',
      [
        [0.82, 1.49, 0.54],
        [0.86, 1.62, 0.54],
        [0.86, 1.86, 0.54],
        [0.7, 1.94, 0.54],
        [-0.25, 1.94, 0.54],
      ],
    ),
    thickness: 0.016,
    connectionDuration: 1.05,
    interactionWidth: 0.075,
  }),
  Object.freeze({
    id: NETWORK_CABLE_IDS.PC_TO_SWITCH,
    name: 'Gray Workstation Cable',
    type: NETWORK_PORT_TYPES.ETHERNET,
    color: '#9aa5ab',
    sourcePortId: 'pc-eth0',
    destinationPortId: 'switch-port-2',
    parkedPath: createParkedEthernetPath(
      PREPARATION_CABLE_CENTERS.workstation,
    ),
    connectedPath: createConnectionPath(
      'pc-eth0',
      'switch-port-2',
      [
        [
          NETWORK_WORKSTATION_LAYOUT.workstationPcPosition[0],
          0.22,
          NETWORK_WORKSTATION_LAYOUT.workstationPcPosition[2] + 0.42,
        ],
        [
          NETWORK_WORKSTATION_LAYOUT.workstationPcPosition[0] + 0.3,
          0.11,
          NETWORK_WORKSTATION_LAYOUT.workstationPcPosition[2] + 0.54,
        ],
        [
          NETWORK_WORKSTATION_LAYOUT.workstationDeskPosition[0] + 0.15,
          0.09,
          NETWORK_WORKSTATION_LAYOUT.workstationDeskPosition[2] + 0.72,
        ],
        [-7.55, 0.09, 1.9],
        [-6.15, 0.09, 2.08],
        [-4.65, 0.09, 2.08],
        [-3.45, 0.09, 2],
        [-2.05, 0.09, 1.86],
        [-1.12, 0.12, 1.55],
        [-1.02, 0.72, 0.92],
        [-0.92, 1.25, 0.62],
        [-0.56, 1.43, 0.56],
      ],
    ),
    thickness: 0.016,
    connectionDuration: 1.1,
    interactionWidth: 0.075,
  }),
])

const networkCableConfigsById = Object.freeze(
  Object.fromEntries(NETWORK_CABLE_CONFIGS.map((cable) => [cable.id, cable])),
)

function getNetworkCableConfig(cableId) {
  return networkCableConfigsById[cableId] ?? null
}

export {
  getNetworkCableConfig,
  NETWORK_CABLE_CONFIGS,
  NETWORK_CABLE_IDS,
}
