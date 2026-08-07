import { T568B_SEQUENCE, WIRE_COUNT } from './wireDefinitions.js'

const TEST_PIN_COUNT = WIRE_COUNT
const TEST_PIN_STATUSES = Object.freeze({
  PENDING: 'pending',
  TESTING: 'testing',
  PASS: 'pass',
  FAIL: 'fail',
})
const CONTINUITY_LABEL = Array.from(
  { length: TEST_PIN_COUNT },
  (_, index) => `${index + 1}-${index + 1}`,
).join(', ')

function createPendingCableTestResults() {
  return Array(TEST_PIN_COUNT).fill(TEST_PIN_STATUSES.PENDING)
}

function getCableTestOutcome({
  wirePlacements,
  insertionValidationResults,
  crimpVerification,
}) {
  const pinResults = T568B_SEQUENCE.map((wireId, index) => {
    const wireMatches = wirePlacements[index] === wireId
    const insertionPassed = insertionValidationResults[index] === 'correct'

    return wireMatches && insertionPassed
      ? TEST_PIN_STATUSES.PASS
      : TEST_PIN_STATUSES.FAIL
  })
  const crimpPassed =
    crimpVerification.connectorInserted &&
    crimpVerification.connectorPositioned &&
    crimpVerification.contactsSeated === TEST_PIN_COUNT &&
    crimpVerification.strainReliefSecured &&
    crimpVerification.t568bVerified
  const passed =
    crimpPassed &&
    pinResults.every((result) => result === TEST_PIN_STATUSES.PASS)

  return {
    passed,
    finalResult: passed ? 'PASS' : 'FAIL',
    pinResults,
  }
}

export {
  CONTINUITY_LABEL,
  createPendingCableTestResults,
  getCableTestOutcome,
  TEST_PIN_COUNT,
  TEST_PIN_STATUSES,
}
