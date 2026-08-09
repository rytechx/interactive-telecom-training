import { useNavigate } from 'react-router-dom'
import { TRAINING_MODULE_STATUS } from '../app/trainingModules.js'
import PageHeader from '../components/layout/PageHeader.jsx'
import useTrainingOverview from '../hooks/useTrainingOverview.js'
import TelecomIcon from '../ui/TelecomIcon.jsx'

function formatDuration(elapsedTimeMs) {
  if (!Number.isFinite(elapsedTimeMs)) {
    return null
  }

  const minutes = Math.floor(elapsedTimeMs / 60000)
  const seconds = Math.floor((elapsedTimeMs % 60000) / 1000)

  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

export default function ResultsPage() {
  const navigate = useNavigate()
  const overview = useTrainingOverview()

  return (
    <div className="application-page results-page">
      <PageHeader
        eyebrow="Current Session"
        title="Training Results"
        description="Review assessment summaries captured from completed practical modules in this browser session."
      />

      {!overview.recentResults.length ? (
        <section className="results-empty-state">
          <div><TelecomIcon name="results" size={34} /></div>
          <h2>No training results yet</h2>
          <p>
            Complete a training module to view verified scores and performance
            feedback here.
          </p>
          <button type="button" onClick={() => navigate('/training')}>
            View Training Modules
          </button>
        </section>
      ) : (
        <section className="results-grid" aria-label="Module assessment results">
          {overview.modules.map((module) => {
            const completed =
              module.status === TRAINING_MODULE_STATUS.COMPLETED

            return (
              <article key={module.id} className={`result-card module-${module.id}`}>
                <header>
                  <div className="training-module-icon">
                    <TelecomIcon name={module.icon} size={25} />
                  </div>
                  <span className={`module-status is-${module.status}`}>
                    {completed ? 'PASS · Completed' : 'Not Attempted'}
                  </span>
                </header>
                <span className="module-category">{module.category}</span>
                <h2>{module.title}</h2>
                {completed ? (
                  <>
                    <dl>
                      <div>
                        <dt>Latest Score</dt>
                        <dd>{module.result.latestScore}%</dd>
                      </div>
                      <div>
                        <dt>Best Score</dt>
                        <dd>{module.result.bestScore}%</dd>
                      </div>
                      <div>
                        <dt>Performance</dt>
                        <dd>{module.result.performanceRating}</dd>
                      </div>
                    </dl>
                    <details>
                      <summary>View Details</summary>
                      <div className="result-details">
                        {Number.isFinite(module.result.details?.procedureAccuracy) && (
                          <span>
                            Procedure Accuracy
                            <strong>{module.result.details.procedureAccuracy}%</strong>
                          </span>
                        )}
                        {Number.isFinite(module.result.details?.mistakes) && (
                          <span>
                            Recorded Mistakes
                            <strong>{module.result.details.mistakes}</strong>
                          </span>
                        )}
                        {formatDuration(module.result.details?.elapsedTimeMs) && (
                          <span>
                            Completion Time
                            <strong>{formatDuration(module.result.details.elapsedTimeMs)}</strong>
                          </span>
                        )}
                        {Number.isFinite(module.result.details?.spliceLossDb) && (
                          <span>
                            Splice Loss
                            <strong>{module.result.details.spliceLossDb.toFixed(2)} dB</strong>
                          </span>
                        )}
                        {Number.isFinite(module.result.details?.scenariosCompleted) && (
                          <span>
                            Scenarios Completed
                            <strong>{module.result.details.scenariosCompleted} / 6</strong>
                          </span>
                        )}
                      </div>
                    </details>
                  </>
                ) : (
                  <div className="result-card-empty">
                    No verified assessment is available for this session.
                  </div>
                )}
              </article>
            )
          })}
        </section>
      )}
    </div>
  )
}
