import {
  formatNetworkAssessmentTime,
  NETWORK_SCENARIO_SCORE_WEIGHTS,
} from './networkAssessment.js'

const scoreCategories = Object.freeze([
  Object.freeze({
    key: 'diagnosisAccuracy',
    label: 'Diagnosis Accuracy',
    maximum: NETWORK_SCENARIO_SCORE_WEIGHTS.DIAGNOSIS_ACCURACY,
  }),
  Object.freeze({
    key: 'repairAccuracy',
    label: 'Repair Accuracy',
    maximum: NETWORK_SCENARIO_SCORE_WEIGHTS.REPAIR_ACCURACY,
  }),
  Object.freeze({
    key: 'verification',
    label: 'Verification',
    maximum: NETWORK_SCENARIO_SCORE_WEIGHTS.VERIFICATION,
  }),
  Object.freeze({
    key: 'diagnosticMethodology',
    label: 'Diagnostic Methodology',
    maximum: NETWORK_SCENARIO_SCORE_WEIGHTS.DIAGNOSTIC_METHODOLOGY,
  }),
  Object.freeze({
    key: 'efficiency',
    label: 'Efficiency',
    maximum: NETWORK_SCENARIO_SCORE_WEIGHTS.EFFICIENCY,
  }),
])

export default function NetworkScenarioAssessment({
  result,
  onRetry,
  onNextScenario,
  onReturnToSelection,
}) {
  if (!result) {
    return null
  }

  const { metrics } = result

  return (
    <section
      className="rj45-assessment-panel network-assessment-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="network-scenario-assessment-title"
    >
      <header className="assessment-header">
        <div>
          <span className="assessment-eyebrow">
            Network Troubleshooting Assessment
          </span>
          <h1 id="network-scenario-assessment-title">
            Scenario {result.scenarioNumber}: {result.scenarioTitle}
          </h1>
        </div>
        <div className="assessment-score-summary" aria-label="Scenario score">
          <span>Final Score</span>
          <strong>{result.finalScore} / 100</strong>
          <small>
            <span>Performance</span>
            {result.performanceRating}
          </small>
        </div>
      </header>

      <div className="assessment-content-grid network-assessment-grid">
        <div className="assessment-column">
          <section className="assessment-section">
            <h2>Score Breakdown</h2>
            <ul className="assessment-score-breakdown">
              {scoreCategories.map((category) => (
                <li key={category.key}>
                  <span>{category.label}</span>
                  <strong>
                    {result.scoreBreakdown[category.key]} / {category.maximum}
                  </strong>
                </li>
              ))}
              <li className="assessment-deduction-row">
                <span>Hint Deduction</span>
                <strong>-{result.hintDeduction}</strong>
              </li>
            </ul>
          </section>

          <section className="assessment-section">
            <h2>Performance Metrics</h2>
            <dl className="assessment-metrics">
              <div>
                <dt>Completion Time</dt>
                <dd>{formatNetworkAssessmentTime(metrics.elapsedTime)}</dd>
              </div>
              <div>
                <dt>Diagnosis Attempts</dt>
                <dd>{metrics.diagnosisAttempts}</dd>
              </div>
              <div>
                <dt>Incorrect Diagnoses</dt>
                <dd>{metrics.incorrectDiagnosisAttempts}</dd>
              </div>
              <div>
                <dt>Repair Attempts</dt>
                <dd>{metrics.repairAttempts}</dd>
              </div>
              <div>
                <dt>Failed Repairs</dt>
                <dd>{metrics.failedRepairAttempts}</dd>
              </div>
              <div>
                <dt>Hints Used</dt>
                <dd>{metrics.hintsUsed}</dd>
              </div>
              <div>
                <dt>Commands</dt>
                <dd>{metrics.diagnosticCommandsUsed.length}</dd>
              </div>
              <div>
                <dt>Unique Useful</dt>
                <dd>{metrics.uniqueDiagnosticCommandsUsed.length}</dd>
              </div>
              <div>
                <dt>Ping Attempts</dt>
                <dd>{metrics.pingAttempts}</dd>
              </div>
              <div>
                <dt>Physical Inspections</dt>
                <dd>{metrics.physicalInspections.length}</dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="assessment-column">
          <section className="assessment-section network-diagnostic-summary">
            <h2>Diagnostic Summary</h2>
            {metrics.timeline.length ? (
              <ol>
                {metrics.timeline.map((event) => {
                  const isWarning = /incorrect|failed/i.test(event.label)

                  return (
                    <li
                      key={event.id}
                      className={isWarning ? 'is-warning' : `is-${event.type}`}
                    >
                      <span aria-hidden="true">{isWarning ? '!' : '✓'}</span>
                      <span>{event.label}</span>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <p>No diagnostic actions were logged.</p>
            )}
          </section>

          <section className="assessment-section network-root-cause-review">
            <h2>Root Cause Review</h2>
            <strong>{result.rootCause}</strong>
            <p>{result.rootCauseExplanation}</p>
            <span>Verified Repair</span>
            <p>{result.repair}</p>
          </section>

          <section className="assessment-section assessment-feedback">
            <h2>Educational Feedback</h2>
            {result.feedback.map((feedback) => (
              <p key={feedback}>{feedback}</p>
            ))}
            <strong className="network-next-recommendation">
              Recommended: {result.recommendedNextAction}
            </strong>
          </section>
        </div>
      </div>

      <footer className="assessment-actions network-assessment-actions">
        <button type="button" className="secondary" onClick={onRetry}>
          Retry Scenario
        </button>
        <button type="button" onClick={onNextScenario}>
          Next Scenario
        </button>
        <button type="button" className="secondary" onClick={onReturnToSelection}>
          Scenario Selection
        </button>
      </footer>
    </section>
  )
}
