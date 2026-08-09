import { NETWORK_TROUBLESHOOTING_SCENARIOS } from './troubleshootingScenarios.js'
import {
  getStoredScenarioResult,
  hasCompletedAllScenarios,
} from './networkAssessment.js'

export default function ScenarioSelection({
  scenarioResults,
  weakScenarioIds,
  onSelectScenario,
  onSelectRandom,
  onViewFinalAssessment,
  onExit,
}) {
  const completedCount = NETWORK_TROUBLESHOOTING_SCENARIOS.filter((scenario) =>
    Boolean(getStoredScenarioResult(scenarioResults[scenario.id])),
  ).length
  const finalAssessmentAvailable = hasCompletedAllScenarios(scenarioResults)

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

      <p className="network-scenario-progress">
        Session Progress <strong>{completedCount} / 6 completed</strong>
      </p>

      <div className="network-scenario-list">
        {NETWORK_TROUBLESHOOTING_SCENARIOS.map((scenario) => {
          const record = scenarioResults[scenario.id]
          const result = getStoredScenarioResult(record)
          const isWeak = weakScenarioIds.includes(scenario.id)

          return (
            <button
              key={scenario.id}
              type="button"
              className={isWeak ? 'is-weak' : ''}
              onClick={() => onSelectScenario(scenario.id)}
            >
              <span>Scenario {scenario.number}</span>
              <strong>{scenario.selectionLabel}</strong>
              <small className={result ? 'is-complete' : ''}>
                {result
                  ? `✓ Completed — Best ${record.bestScore}`
                  : 'Not Attempted'}
                {record?.attempts > 1
                  ? ` · Latest ${record.latestScore}`
                  : ''}
                {isWeak ? ' · Retry Recommended' : ''}
              </small>
            </button>
          )
        })}
      </div>

      <div className="training-actions procedure-primary-actions">
        <button type="button" onClick={onSelectRandom}>
          Random Scenario
        </button>
        <button
          type="button"
          onClick={onViewFinalAssessment}
          disabled={!finalAssessmentAvailable}
        >
          {finalAssessmentAvailable
            ? 'View Final Network Assessment'
            : `Final Assessment (${completedCount}/6)`}
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
