function formatActivityDate(value) {
  if (!value) return 'Date unavailable'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Date unavailable'

  const formattedDate = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
  const formattedTime = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)

  return [formattedDate, formattedTime].join(' \u2022 ')
}

export default function RecentActivity({
  recentResults,
  onStartTraining,
  onViewResults,
  isLoading,
}) {
  const latestResults = recentResults.slice(0, 5)

  return (
    <section className="dashboard-panel recent-activity-panel">
      <div className="section-heading">
        <div>
          <span>Database Record</span>
          <h2>Recent Training Activity</h2>
        </div>
        {latestResults.length > 0 && (
          <button type="button" onClick={onViewResults}>
            View All Results
          </button>
        )}
      </div>
      {isLoading ? (
        <div className="recent-activity-loading" aria-busy="true">
          Loading recent activity...
        </div>
      ) : latestResults.length ? (
        <ol
          className="recent-activity-list"
          aria-label="Recent completed training attempts"
        >
          {latestResults.map((result) => (
            <li key={result.attemptId}>
              <div>
                <strong>{result.module?.title ?? result.moduleName}</strong>
                <time dateTime={result.completedAt ?? undefined}>
                  {formatActivityDate(result.completedAt)}
                </time>
              </div>
              <span>{result.performanceRating}</span>
              <b>{result.latestScore}%</b>
            </li>
          ))}
        </ol>
      ) : (
        <div className="dashboard-empty-state compact">
          <strong>No training activity yet</strong>
          <p>Completed training attempts will appear here.</p>
          <button type="button" onClick={onStartTraining}>
            Start Training
          </button>
        </div>
      )}
    </section>
  )
}
