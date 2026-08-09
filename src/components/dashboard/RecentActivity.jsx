export default function RecentActivity({ recentResults, onViewModules }) {
  return (
    <section className="dashboard-panel recent-activity-panel">
      <div className="section-heading">
        <div>
          <span>Session Record</span>
          <h2>Recent Training Activity</h2>
        </div>
      </div>
      {recentResults.length ? (
        <div className="recent-activity-table" role="table" aria-label="Recent training results">
          <div role="row" className="recent-activity-header">
            <span role="columnheader">Module</span>
            <span role="columnheader">Result</span>
            <span role="columnheader">Score</span>
          </div>
          {recentResults.map((result) => (
            <div role="row" key={result.moduleId}>
              <strong role="cell">{result.module.shortTitle}</strong>
              <span role="cell">{result.performanceRating}</span>
              <b role="cell">{result.latestScore}%</b>
            </div>
          ))}
        </div>
      ) : (
        <div className="dashboard-empty-state compact">
          <strong>No training activity yet</strong>
          <p>Complete a module to add verified results to this session.</p>
          <button type="button" onClick={onViewModules}>View Training Modules</button>
        </div>
      )}
    </section>
  )
}
