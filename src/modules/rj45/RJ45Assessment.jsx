import PersistenceStatus from '../../components/training/PersistenceStatus.jsx'
import useTrainingStore from '../../store/useTrainingStore.js'
import {
  ASSESSMENT_STAGES,
  formatAssessmentTime,
  SCORE_WEIGHTS,
} from './rj45Assessment.js'

const scoreCategories = Object.freeze([
  Object.freeze({
    key: 'procedureCompletion',
    label: 'Procedure Completion',
    maximum: SCORE_WEIGHTS.PROCEDURE_COMPLETION,
  }),
  Object.freeze({
    key: 't568bArrangement',
    label: 'T568B Arrangement',
    maximum: SCORE_WEIGHTS.T568B_ARRANGEMENT,
  }),
  Object.freeze({
    key: 'correctToolUsage',
    label: 'Correct Tool Usage',
    maximum: SCORE_WEIGHTS.CORRECT_TOOL_USAGE,
  }),
  Object.freeze({
    key: 'mistakeControl',
    label: 'Mistake Control',
    maximum: SCORE_WEIGHTS.MISTAKE_CONTROL,
  }),
  Object.freeze({
    key: 'completionEfficiency',
    label: 'Completion Efficiency',
    maximum: SCORE_WEIGHTS.COMPLETION_EFFICIENCY,
  }),
])

export default function RJ45Assessment({ onRetry, onReturnToLaboratory }) {
  const finalScore = useTrainingStore((state) => state.finalScore)
  const performanceRating = useTrainingStore(
    (state) => state.performanceRating,
  )
  const procedureAccuracy = useTrainingStore(
    (state) => state.procedureAccuracy,
  )
  const mistakeCount = useTrainingStore((state) => state.mistakeCount)
  const wrongToolCount = useTrainingStore((state) => state.wrongToolCount)
  const t568bValidationAttempts = useTrainingStore(
    (state) => state.t568bValidationAttempts,
  )
  const procedureRetryCount = useTrainingStore(
    (state) => state.procedureRetryCount,
  )
  const restartStepCount = useTrainingStore(
    (state) => state.restartStepCount,
  )
  const hintCount = useTrainingStore((state) => state.hintCount)
  const elapsedTimeMs = useTrainingStore((state) => state.elapsedTimeMs)
  const finalTestResult = useTrainingStore((state) => state.finalTestResult)
  const completedProcedureSteps = useTrainingStore(
    (state) => state.completedProcedureSteps,
  )
  const scoreBreakdown = useTrainingStore((state) => state.scoreBreakdown)
  const assessmentFeedback = useTrainingStore(
    (state) => state.assessmentFeedback,
  )

  return (
    <section
      className="rj45-assessment-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assessment-title"
    >
      <header className="assessment-header">
        <div>
          <span className="assessment-eyebrow">RJ45 Cable Termination</span>
          <h1 id="assessment-title">Training Complete</h1>
        </div>
        <div className="assessment-score-summary" aria-label="Final score">
          <span>Final Score</span>
          <strong>{finalScore ?? 0} / 100</strong>
          <small>
            <span>Performance</span>
            {performanceRating ?? 'Pending'}
          </small>
        </div>
      </header>

      <div className="assessment-content-grid">
        <div className="assessment-column">
          <section className="assessment-section">
            <h2>Performance Summary</h2>
            <dl className="assessment-metrics">
              <div>
                <dt>Procedure Accuracy</dt>
                <dd>{procedureAccuracy}%</dd>
              </div>
              <div>
                <dt>Mistakes</dt>
                <dd>{mistakeCount}</dd>
              </div>
              <div>
                <dt>Wrong Tools</dt>
                <dd>{wrongToolCount}</dd>
              </div>
              <div>
                <dt>T568B Attempts</dt>
                <dd>{t568bValidationAttempts}</dd>
              </div>
              <div>
                <dt>Procedure Retries</dt>
                <dd>{procedureRetryCount}</dd>
              </div>
              <div>
                <dt>Restart Steps</dt>
                <dd>{restartStepCount}</dd>
              </div>
              <div>
                <dt>Completion Time</dt>
                <dd>{formatAssessmentTime(elapsedTimeMs)}</dd>
              </div>
              <div>
                <dt>Cable Test</dt>
                <dd>{finalTestResult ?? 'Pending'}</dd>
              </div>
              <div>
                <dt>Standard</dt>
                <dd>T568B</dd>
              </div>
              {hintCount > 0 && (
                <div>
                  <dt>Hints Used</dt>
                  <dd>{hintCount}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="assessment-section">
            <h2>Score Breakdown</h2>
            <ul className="assessment-score-breakdown">
              {scoreCategories.map((category) => (
                <li key={category.key}>
                  <span>{category.label}</span>
                  <strong>
                    {scoreBreakdown?.[category.key] ?? 0} / {category.maximum}
                  </strong>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="assessment-column">
          <section className="assessment-section">
            <h2>Procedure Checklist</h2>
            <ul className="assessment-checklist">
              {ASSESSMENT_STAGES.map((stage) => {
                const isCompleted = completedProcedureSteps.includes(stage.id)

                return (
                  <li
                    key={stage.id}
                    className={isCompleted ? 'is-complete' : 'is-incomplete'}
                  >
                    <span aria-hidden="true">{isCompleted ? '✓' : '—'}</span>
                    <span>{stage.label}</span>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="assessment-section assessment-feedback">
            <h2>Educational Feedback</h2>
            {assessmentFeedback.map((feedback) => (
              <p key={feedback}>{feedback}</p>
            ))}
          </section>
        </div>
      </div>

      <footer className="assessment-actions">
        <button type="button" onClick={onRetry}>
          Retry Module
        </button>
        <button
          type="button"
          className="secondary"
          onClick={onReturnToLaboratory}
        >
          Return to Laboratory
        </button>
      </footer>
      <PersistenceStatus moduleKey="rj45" />
    </section>
  )
}
