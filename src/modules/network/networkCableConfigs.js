import { Euler, Vector3 } from 'three'
import {
  getNetworkPortRackPosition,
  NETWORK_PORT_TYPES,
} from './networkDeviceConfigs.js'

const NETWORK_CABLE_IDS = Object.freeze({
  ROUTER_POWER: 'router-power-cable',
  SWITCH_POWER: 'switch-power-cable',
  PATCH_TO_SWITCH: 'patch-to-switch',
  SWITCH_TO_ROUTER: 'switch-to-router',
  PC_TO_SWITCH: 'pc-to-switch',
})

const POWER_CABLE_HOME_SHAPE = Object.freeze([
  Object.freeze([-0.3, 0, -0.08]),
  Object.freeze([-0.17, 0.025, 0.05]),
  Object.freeze([0, 0.035, 0.12]),
  Object.freeze([0.17, 0.025, 0.05]),
  Object.freeze([0.3, 0, -0.08]),
])

const ROUTER_POWER_HOME = Object.freeze({
  position: Object.freeze([1.43, 1.09, 0.72]),
  rotation: Object.freeze([0, 0, 0]),
  scale: 1,
})

const SWITCH_POWER_HOME = Object.freeze({
  position: Object.freeze([2.21, 1.09, 0.72]),
  rotation: Object.freeze([0, 0, 0]),
  scale: 1,
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

const NETWORK_CABLE_CONFIGS = Object.freeze([
  Object.freeze({
    id: NETWORK_CABLE_IDS.ROUTER_POWER,
    name: 'Router Power Cable',
    type: NETWORK_PORT_TYPES.POWER,
    color: '#252b30',
    highlightColor: '#78a9bc',
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
        [0.94, 1.9, 0.54],
        [1.13, 1.72, 0.48],
        [1.14, 1.26, 0.42],
      ],
    ),
    thickness: 0.022,
    hitboxDimensions: Object.freeze([0.74, 0.3, 0.48]),
  }),
  Object.freeze({
    id: NETWORK_CABLE_IDS.SWITCH_POWER,
    name: 'Switch Power Cable',
    type: NETWORK_PORT_TYPES.POWER,
    color: '#30373c',
    highlightColor: '#88b5c6',
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
        [0.96, 1.56, 0.54],
        [1.15, 1.38, 0.47],
        [1.14, 0.9, 0.4],
      ],
    ),
    thickness: 0.022,
    hitboxDimensions: Object.freeze([0.74, 0.3, 0.48]),
  }),
  Object.freeze({
    id: NETWORK_CABLE_IDS.PATCH_TO_SWITCH,
    name: 'Blue Patch Cable',
    type: NETWORK_PORT_TYPES.ETHERNET,
    color: '#2f78a8',
    sourcePortId: 'patch-panel-port-1',
    destinationPortId: 'switch-port-1',
    parkedPath: Object.freeze([
      Object.freeze([1.25, 0.32, 0.92]),
      Object.freeze([1.5, 0.38, 1.02]),
      Object.freeze([1.78, 0.32, 0.92]),
    ]),
    connectedPath: createConnectionPath(
      'patch-panel-port-1',
      'switch-port-1',
      [
        [-0.76, 1.15, 0.72],
        [-0.78, 1.49, 0.72],
      ],
    ),
    thickness: 0.018,
  }),
  Object.freeze({
    id: NETWORK_CABLE_IDS.SWITCH_TO_ROUTER,
    name: 'Yellow Uplink Cable',
    type: NETWORK_PORT_TYPES.ETHERNET,
    color: '#d0a53a',
    sourcePortId: 'switch-port-8',
    destinationPortId: 'router-lan-1',
    parkedPath: Object.freeze([
      Object.freeze([1.2, 0.26, 1.12]),
      Object.freeze([1.48, 0.2, 1.2]),
      Object.freeze([1.78, 0.26, 1.12]),
    ]),
    connectedPath: createConnectionPath(
      'switch-port-8',
      'router-lan-1',
      [
        [0.78, 1.49, 0.72],
        [0.78, 1.83, 0.72],
        [-0.18, 1.83, 0.72],
      ],
    ),
    thickness: 0.018,
  }),
  Object.freeze({
    id: NETWORK_CABLE_IDS.PC_TO_SWITCH,
    name: 'Gray Workstation Cable',
    type: NETWORK_PORT_TYPES.ETHERNET,
    color: '#7d8991',
    sourcePortId: 'pc-eth0',
    destinationPortId: 'switch-port-2',
    parkedPath: Object.freeze([
      Object.freeze([1.22, 0.2, 1.34]),
      Object.freeze([1.5, 0.14, 1.42]),
      Object.freeze([1.78, 0.2, 1.34]),
    ]),
    connectedPath: createConnectionPath(
      'pc-eth0',
      'switch-port-2',
      [
        [3.18, 0.42, 0.9],
        [2.76, 0.22, 0.98],
        [1.12, 0.22, 0.92],
        [-0.72, 0.22, 0.82],
        [-0.72, 1.49, 0.72],
      ],
    ),
    thickness: 0.018,
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
