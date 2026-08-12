const CABLE_LENGTH = 1.2
const WIRE_LENGTH = 0.62
const WIRE_RADIUS = 0.0125
const CABLE_EXIT_Z = WIRE_LENGTH - CABLE_LENGTH / 2
const GUIDE_FIRST_SLOT_X = -0.315
const GUIDE_SLOT_SPACING = 0.09
const GUIDE_CENTER_X = GUIDE_FIRST_SLOT_X + (GUIDE_SLOT_SPACING * 7) / 2
const GUIDE_CENTER_Z = -0.55
const GUIDE_WIDTH = GUIDE_SLOT_SPACING * 7 + 0.06
const GUIDE_DEPTH = 0.1
const PRE_TRIM_TIP_Z = -0.56
const TRIMMED_TIP_Z = -0.505
const CONNECTOR_CHANNEL_SPACING = 0.021
const CONNECTOR_WIRE_CENTER_X = GUIDE_CENTER_X
const ROOT_X_SPACING = 0.014
const FAN_SHOULDER_X_SPACING = 0.032
const FAN_MID_X_SPACING = 0.062
const FAN_END_X_SPACING = 0.0875

const bundledOffsets = Array.from({ length: 8 }, (_, index) => [
  (index - 3.5) * ROOT_X_SPACING,
  0.012,
])

const wireColors = [
  ['#f7f4ec', '#ff932e'],
  ['#f18422', null],
  ['#f7f4ec', '#49b96d'],
  ['#3f83de', null],
  ['#f7f4ec', '#4a91e8'],
  ['#3ca661', null],
  ['#f7f4ec', '#a66c48'],
  ['#925b3e', null],
]

const wireNames = [
  ['white-orange', 'whiteOrange', 'White / Orange'],
  ['orange', 'orange', 'Orange'],
  ['white-green', 'whiteGreen', 'White / Green'],
  ['blue', 'blue', 'Blue'],
  ['white-blue', 'whiteBlue', 'White / Blue'],
  ['green', 'green', 'Green'],
  ['white-brown', 'whiteBrown', 'White / Brown'],
  ['brown', 'brown', 'Brown'],
]

function freezePoints(points) {
  return Object.freeze(points.map((point) => Object.freeze(point)))
}

const wireDefinitions = Object.freeze(
  wireNames.map(([id, name, displayName], index) => {
    const correctSlot = index + 1
    const [bundleX, bundleY] = bundledOffsets[index]
    const fanShoulderX = (index - 3.5) * FAN_SHOULDER_X_SPACING
    const fanMidX = (index - 3.5) * FAN_MID_X_SPACING
    const fanEndX = (index - 3.5) * FAN_END_X_SPACING
    const slotX = GUIDE_FIRST_SLOT_X + index * GUIDE_SLOT_SPACING
    const initialPoints = freezePoints(
      Array.from({ length: 4 }, (_, pointIndex) => [
        bundleX,
        bundleY,
        CABLE_EXIT_Z - (WIRE_LENGTH * pointIndex) / 3,
      ]),
    )
    const separatedPoints = freezePoints([
      [bundleX, bundleY, CABLE_EXIT_Z],
      [fanShoulderX, 0.022, -0.12],
      [fanMidX, 0.028, -0.32],
      [fanEndX, 0.028, -0.49],
    ])
    const slotPoints = freezePoints([
      [bundleX, bundleY, CABLE_EXIT_Z],
      [(index - 3.5) * 0.022, 0.022, -0.14],
      [slotX, 0.027, -0.35],
      [slotX, 0.028, PRE_TRIM_TIP_Z],
    ])
    const connectorChannelX =
      CONNECTOR_WIRE_CENTER_X + (index - 3.5) * CONNECTOR_CHANNEL_SPACING
    const connectorBundleX =
      CONNECTOR_WIRE_CENTER_X + (index - 3.5) * 0.006
    const connectorFanX =
      CONNECTOR_WIRE_CENTER_X + (index - 3.5) * 0.02
    const connectorPoints = freezePoints([
      [connectorBundleX, 0.05, CABLE_EXIT_Z],
      [connectorFanX, 0.05, -0.2],
      [connectorChannelX, 0.05, -0.38],
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
  CABLE_EXIT_Z,
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
