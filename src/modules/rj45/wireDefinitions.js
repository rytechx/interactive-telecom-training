const WIRE_LENGTH = 0.42
const WIRE_CENTER_X = 0.565
const GUIDE_CENTER_X = 1.08
const GUIDE_SLOT_SPACING = 0.085

const bundledOffsets = [
  [-0.018, -0.026],
  [-0.006, -0.026],
  [0.006, -0.026],
  [0.018, -0.026],
  [-0.018, 0.026],
  [-0.006, 0.026],
  [0.006, 0.026],
  [0.018, 0.026],
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

const wireDefinitions = Object.freeze(
  wireNames.map(([id, name, displayName], index) => {
    const correctSlot = index + 1
    const separatedZ = (index - 3.5) * GUIDE_SLOT_SPACING

    return Object.freeze({
      id,
      name,
      displayName,
      primaryColor: wireColors[index][0],
      stripeColor: wireColors[index][1],
      correctSlot,
      initialPosition: Object.freeze([
        WIRE_CENTER_X,
        bundledOffsets[index][0],
        bundledOffsets[index][1],
      ]),
      separatedPosition: Object.freeze([
        WIRE_CENTER_X,
        0.025,
        separatedZ,
      ]),
      slotPosition: Object.freeze([
        GUIDE_CENTER_X,
        0.025,
        separatedZ,
      ]),
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

export {
  getWireDefinition,
  getWireSlotPosition,
  GUIDE_CENTER_X,
  GUIDE_SLOT_SPACING,
  T568B_SEQUENCE,
  WIRE_COUNT,
  WIRE_IDS,
  WIRE_LENGTH,
  wireDefinitions,
}
