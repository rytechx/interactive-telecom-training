import { getWireDefinition, wireDefinitions } from './wireDefinitions.js'

function getSwatchBackground(wire) {
  return wire.stripeColor
    ? `linear-gradient(90deg, ${wire.primaryColor} 0 58%, ${wire.stripeColor} 58% 100%)`
    : wire.primaryColor
}

export default function T568BGuide({
  wirePlacements,
  wireValidationResults,
}) {
  return (
    <div className="t568b-guide" aria-label="T568B wire order reference">
      <strong>T568B Reference</strong>
      <ol>
        {wireDefinitions.map((expectedWire, index) => {
          const placedWire = getWireDefinition(wirePlacements[index])
          const validationResult = wireValidationResults[index]
          const statusText =
            validationResult === 'correct'
              ? 'Correct'
              : validationResult === 'incorrect'
                ? 'Incorrect'
                : null

          return (
            <li
              key={expectedWire.id}
              className={
                validationResult ? `is-${validationResult}` : undefined
              }
            >
              <span className="guide-slot-number">{index + 1}</span>
              <span
                className="guide-wire-swatch"
                style={{ background: getSwatchBackground(expectedWire) }}
                aria-hidden="true"
              />
              <span className="guide-wire-name">
                {expectedWire.displayName}
                {validationResult && placedWire && (
                  <small>
                    {statusText}: {placedWire.displayName}
                  </small>
                )}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
