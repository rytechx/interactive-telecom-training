import { NETWORK_TROUBLESHOOTING_SCENARIOS } from './troubleshootingScenarios.js'

export default function ScenarioSelection({
  onSelectScenario,
  onSelectRandom,
  onExit,
}) {
  return (
    <section
      className="training-panel procedure-panel network-troubleshooting-panel scenario-selection-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="network-scenario-selection-title"
    >
      <span className="procedure-step-number">Troubleshooting Mode</span>
      <h1 id="network-scenario-selection-title">Scenario Selection</h1>
      <p className="procedure-instruction">
        Choose a deterministic incident. Each attempt starts from the same
        known-good network with exactly one injected fault.
      </p>

      <div className="network-scenario-list">
        {NETWORK_TROUBLESHOOTING_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onSelectScenario(scenario.id)}
          >
            <span>Scenario {scenario.number}</span>
            <strong>{scenario.selectionLabel}</strong>
          </button>
        ))}
      </div>

      <div className="training-actions procedure-primary-actions">
        <button type="button" onClick={onSelectRandom}>
          Random Scenario
        </button>
      </div>
      <div className="training-actions procedure-secondary-actions">
        <button type="button" className="secondary" onClick={onExit}>
          Exit Troubleshooting
        </button>
      </div>
    </section>
  )
}
