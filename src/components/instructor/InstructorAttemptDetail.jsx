import {
  formatDate,
  formatDuration,
  formatScore,
  formatStatus,
} from '../../utils/instructorFormatters.js'

const metricLabels = Object.freeze({
  mistakes: 'Recorded Mistakes',
  wrongToolSelections: 'Wrong Tool Selections',
  incorrectT568BAttempts: 'T568B Validation Attempts',
  restartStepCount: 'Restarted Steps',
  cableTest: 'Cable Test',
  t568bVerified: 'T568B Verified',
  preparationErrors: 'Preparation Errors',
  sequenceErrors: 'Sequence Errors',
  spliceLossDb: 'Splice Loss',
  alignment: 'Alignment',
  fusion: 'Fusion',
  protection: 'Protection',
  finalInspection: 'Final Inspection',
  physicalInstallation: 'Physical Installation',
  routerConfiguration: 'Router Configuration',
  switchConfiguration: 'Switch Configuration',
  pcToRouter: 'PC to Router',
  pcToSwitch: 'PC to Switch',
  troubleshootingCompleted: 'Scenarios Completed',
  averageScore: 'Scenario Average',
})

function formatMetric(key, value) {
  if (value === null || value === undefined || value === '') {
    return 'Not available'
  }
  if (key === 'spliceLossDb' && Number.isFinite(value)) {
    return `${value.toFixed(2)} dB`
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return `${value.length} recorded`
  if (value && typeof value === 'object') return 'Recorded'
  return String(value)
}

export default function InstructorAttemptDetail({
  attempt,
  isLoading,
  error,
  onClose,
  onRetry,
}) {
  const visibleMetrics = Object.entries(attempt?.metrics ?? {}).filter(
    ([key]) => metricLabels[key],
  )

  return (
    <div className="instructor-detail-backdrop" role="presentation">
      <aside
        className="instructor-attempt-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="instructor-attempt-detail-title"
      >
        <header>
          <div>
            <span>Historical Training Record</span>
            <h2 id="instructor-attempt-detail-title">
              {attempt?.moduleName ?? 'Attempt Details'}
            </h2>
          </div>
          <button type="button" onClick={onClose}>Close</button>
        </header>

        {isLoading ? (
          <div className="instructor-detail-loading" aria-busy="true">
            Loading attempt details...
          </div>
        ) : error ? (
          <div className="instructor-detail-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={onRetry}>Retry</button>
          </div>
        ) : attempt ? (
          <>
            <dl className="instructor-detail-summary">
              <div><dt>Student</dt><dd>{attempt.studentName}</dd></div>
              <div><dt>Attempt</dt><dd>#{attempt.attemptNumber}</dd></div>
              <div><dt>Status</dt><dd>{formatStatus(attempt.status)}</dd></div>
              <div><dt>Score</dt><dd>{formatScore(attempt.score, '%')}</dd></div>
              <div><dt>Performance</dt><dd>{attempt.performanceRating ?? 'Not available'}</dd></div>
              <div><dt>Accuracy</dt><dd>{formatScore(attempt.procedureAccuracy, '%')}</dd></div>
              <div><dt>Duration</dt><dd>{formatDuration(attempt.durationSeconds)}</dd></div>
              <div><dt>Completed</dt><dd>{formatDate(attempt.completedAt, { includeTime: true })}</dd></div>
            </dl>

            {visibleMetrics.length > 0 && (
              <section className="instructor-detail-section">
                <h3>Recorded Assessment Metrics</h3>
                <dl className="instructor-metric-list">
                  {visibleMetrics.map(([key, value]) => (
                    <div key={key}>
                      <dt>{metricLabels[key]}</dt>
                      <dd>{formatMetric(key, value)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {attempt.scenarios?.length > 0 && (
              <section className="instructor-detail-section">
                <h3>Network Troubleshooting Scenarios</h3>
                <div className="instructor-scenario-detail-list">
                  {attempt.scenarios.map((scenario) => (
                    <article key={scenario.scenarioKey}>
                      <div>
                        <strong>{scenario.scenarioTitle}</strong>
                        <span>{scenario.performanceRating ?? 'Not available'}</span>
                      </div>
                      <dl>
                        <div><dt>Score</dt><dd>{formatScore(scenario.score, '%')}</dd></div>
                        <div><dt>Diagnosis Attempts</dt><dd>{scenario.diagnosisAttempts}</dd></div>
                        <div><dt>Hints Used</dt><dd>{scenario.hintsUsed}</dd></div>
                        <div><dt>Repair Attempts</dt><dd>{scenario.repairAttempts}</dd></div>
                      </dl>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : null}
      </aside>
    </div>
  )
}
