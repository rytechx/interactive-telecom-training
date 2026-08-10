export default function OverallProgressCard({
  completedCount,
  overallProgress,
  averageScore,
  isLoading,
  error,
  onRetry,
}) {
  if (isLoading && overallProgress === null) {
    return (
      <section className="overall-progress-card is-loading" aria-busy="true">
        <div className="progress-skeleton wide" />
        <div className="progress-skeleton" />
        <div className="progress-skeleton metrics" />
      </section>
    )
  }

  if (error && overallProgress === null) {
    return (
      <section className="overall-progress-card progress-load-error" role="alert">
        <strong>Unable to load training progress.</strong>
        <button type="button" onClick={onRetry}>Retry</button>
      </section>
    )
  }

  return (
    <section className="overall-progress-card" aria-labelledby="overall-progress-title">
      <div className="section-heading compact">
        <div>
          <span>Database Record</span>
          <h2 id="overall-progress-title">Overall Training Progress</h2>
        </div>
        <strong>{overallProgress}%</strong>
      </div>
      <div
        className="overall-progress-track"
        role="progressbar"
        aria-label="Overall module completion"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={overallProgress}
      >
        <span style={{ width: `${overallProgress}%` }} />
      </div>
      <dl className="overall-progress-metrics">
        <div>
          <dt>Modules Completed</dt>
          <dd>{completedCount} / 3</dd>
        </div>
        <div>
          <dt>Overall Progress</dt>
          <dd>{overallProgress}%</dd>
        </div>
        <div>
          <dt>Average Best Score</dt>
          <dd>{averageScore === null ? '—' : `${averageScore}%`}</dd>
        </div>
      </dl>
    </section>
  )
}
