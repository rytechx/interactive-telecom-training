const CABLE_LENGTH = 1.55
const WIRE_LENGTH = 0.62
const WIRE_RADIUS = 0.012
const CABLE_EXIT_X = CABLE_LENGTH / 2 - WIRE_LENGTH
const GUIDE_FIRST_SLOT_X = 0.12
const GUIDE_SLOT_SPACING = 0.115
const GUIDE_CENTER_X = GUIDE_FIRST_SLOT_X + (GUIDE_SLOT_SPACING * 7) / 2
const GUIDE_CENTER_Z = 0.095
const GUIDE_WIDTH = GUIDE_SLOT_SPACING * 8 + 0.08
const GUIDE_DEPTH = 0.56
const PRE_TRIM_TIP_Z = GUIDE_CENTER_Z - 0.225
const TRIMMED_TIP_Z = GUIDE_CENTER_Z - 0.135
const CONNECTOR_CHANNEL_SPACING = 0.026
const CONNECTOR_WIRE_CENTER_X = GUIDE_CENTER_X

const bundledOffsets = [
  [-0.02, -0.028],
  [-0.007, -0.028],
  [0.007, -0.028],
  [0.02, -0.028],
  [-0.02, 0.028],
  [-0.007, 0.028],
  [0.007, 0.028],
  [0.02, 0.028],
]

const wireColors = [
  ['#f7f2e8', '#f28c28'],
  ['#f28c28', null],
  ['#f7f2e8', '#3f9b57'],
  ['#3578c6', null],
  ['#f7f2e8', '#3578c6'],
  ['#3f9b57', null],
  ['#f7f2e8', '#855438'],
  ['#855438', null],
]

const wireNames = [
  ['white-orange', 'whiteOrange', 'White-Orange'],
  ['orange', 'orange', 'Orange'],
  ['white-green', 'whiteGreen', 'White-Green'],
  ['blue', 'blue', 'Blue'],
  ['white-blue', 'whiteBlue', 'White-Blue'],
  ['green', 'green', 'Green'],
  ['white-brown', 'whiteBrown', 'White-Brown'],
  ['brown', 'brown', 'Brown'],
]

function freezePoints(points) {
  return Object.freeze(points.map((point) => Object.freeze(point)))
}

const wireDefinitions = Object.freeze(
  wireNames.map(([id, name, displayName], index) => {
    const correctSlot = index + 1
    const [bundleY, bundleZ] = bundledOffsets[index]
    const fanZ = (index - 3.5) * 0.078
    const fanEndX = 0.46 + index * 0.03
    const slotX = GUIDE_FIRST_SLOT_X + index * GUIDE_SLOT_SPACING
    const initialPoints = freezePoints(
      Array.from({ length: 4 }, (_, pointIndex) => [
        CABLE_EXIT_X + (WIRE_LENGTH * pointIndex) / 3,
        bundleY,
        bundleZ,
      ]),
    )
    const separatedPoints = freezePoints([
      [CABLE_EXIT_X, bundleY, bundleZ],
      [CABLE_EXIT_X + 0.14, 0.012, bundleZ + fanZ * 0.12],
      [CABLE_EXIT_X + 0.3, 0.026, fanZ * 0.56],
      [fanEndX, 0.04, fanZ],
    ])
    const slotPoints = freezePoints([
      [slotX, 0.05, GUIDE_CENTER_Z + 0.225],
      [slotX, 0.05, GUIDE_CENTER_Z + 0.075],
      [slotX, 0.05, GUIDE_CENTER_Z - 0.075],
      [slotX, 0.05, GUIDE_CENTER_Z - 0.225],
    ])
    const connectorChannelX =
      CONNECTOR_WIRE_CENTER_X + (index - 3.5) * CONNECTOR_CHANNEL_SPACING
    const connectorBundleX =
      CONNECTOR_WIRE_CENTER_X + (index - 3.5) * 0.006
    const connectorFanX =
      CONNECTOR_WIRE_CENTER_X + (index - 3.5) * 0.014
    const connectorPoints = freezePoints([
      [connectorBundleX, 0.05, 0.18],
      [connectorFanX, 0.05, 0.11],
      [connectorChannelX, 0.05, 0.02],
      [connectorChannelX, 0.05, TRIMMED_TIP_Z],
    ])

    return Object.freeze({
      id,
      name,
      displayName,
      primaryColor: wireColors[index][0],
      stripeColor: wireColors[index][1],
      correctSlot,
      initialPoints,
      separatedPoints,
      slotPoints,
      connectorPoints,
      initialPosition: initialPoints[2],
      separatedPosition: separatedPoints[3],
      slotPosition: Object.freeze([slotX, 0.018, GUIDE_CENTER_Z]),
    })
  }),
)

const T568B_SEQUENCE = Object.freeze(
  wireDefinitions.map((wire) => wire.id),
)
const WIRE_IDS = Object.freeze(wireDefinitions.map((wire) => wire.id))
const WIRE_COUNT = wireDefinitions.length

function getWireDefinition(wireId) {
  return wireDefinitions.find((wire) => wire.id === wireId) ?? null
}

function getWireSlotPosition(slotNumber) {
  return wireDefinitions[slotNumber - 1]?.slotPosition ?? null
}

function getWireSlotPoints(slotNumber) {
  return wireDefinitions[slotNumber - 1]?.slotPoints ?? null
}

function getConnectorWirePoints(slotNumber) {
  return wireDefinitions[slotNumber - 1]?.connectorPoints ?? null
}

export {
  CABLE_EXIT_X,
  CABLE_LENGTH,
  CONNECTOR_CHANNEL_SPACING,
  CONNECTOR_WIRE_CENTER_X,
  getConnectorWirePoints,
  getWireDefinition,
  getWireSlotPoints,
  getWireSlotPosition,
  GUIDE_CENTER_X,
  GUIDE_CENTER_Z,
  GUIDE_DEPTH,
  GUIDE_SLOT_SPACING,
  GUIDE_WIDTH,
  PRE_TRIM_TIP_Z,
  T568B_SEQUENCE,
  TRIMMED_TIP_Z,
  WIRE_COUNT,
  WIRE_IDS,
  WIRE_LENGTH,
  WIRE_RADIUS,
  wireDefinitions,
}
