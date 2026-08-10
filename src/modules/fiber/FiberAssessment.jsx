import { useState } from 'react'
import PersistenceStatus from '../../components/training/PersistenceStatus.jsx'
import useFiberTrainingStore from '../../store/useFiberTrainingStore.js'
import {
  FIBER_ASSESSMENT_STAGES,
  FIBER_REVIEW_STEPS,
  FIBER_SCORE_WEIGHTS,
  formatFiberAssessmentTime,
} from './fiberAssessment.js'

const scoreCategories = Object.freeze([
  Object.freeze({
    key: 'fiberPreparation',
    label: 'Fiber Preparation',
    maximum: FIBER_SCORE_WEIGHTS.FIBER_PREPARATION,
  }),
  Object.freeze({
    key: 'cleavingLoading',
    label: 'Cleaving / Loading',
    maximum: FIBER_SCORE_WEIGHTS.CLEAVING_LOADING,
  }),
  Object.freeze({
    key: 'splicerSetupAlignment',
    label: 'Splicer Setup & Alignment',
    maximum: FIBER_SCORE_WEIGHTS.SPLICER_SETUP_ALIGNMENT,
  }),
  Object.freeze({
    key: 'fusionQuality',
    label: 'Fusion Quality',
    maximum: FIBER_SCORE_WEIGHTS.FUSION_QUALITY,
  }),
  Object.freeze({
    key: 'spliceProtection',
    label: 'Splice Protection',
    maximum: FIBER_SCORE_WEIGHTS.SPLICE_PROTECTION,
  }),
  Object.freeze({
    key: 'procedureEfficiency',
    label: 'Procedure Efficiency',
    maximum: FIBER_SCORE_WEIGHTS.PROCEDURE_EFFICIENCY,
  }),
])

export default function FiberAssessment({ onRetry, onReturnToLaboratory }) {
  const [isReviewingProcedure, setIsReviewingProcedure] = useState(false)
  const finalScore = useFiberTrainingStore((state) => state.finalScore)
  const performanceRating = useFiberTrainingStore(
    (state) => state.performanceRating,
  )
  const procedureAccuracy = useFiberTrainingStore(
    (state) => state.procedureAccuracy,
  )
  const elapsedTimeMs = useFiberTrainingStore((state) => state.elapsedTimeMs)
  const mistakeCount = useFiberTrainingStore((state) => state.mistakeCount)
  const wrongToolCount = useFiberTrainingStore((state) => state.wrongToolCount)
  const sequenceErrorCount = useFiberTrainingStore(
    (state) => state.sequenceErrorCount,
  )
  const preparationErrorCount = useFiberTrainingStore(
    (state) => state.preparationErrorCount,
  )
  const incorrectActionCount = useFiberTrainingStore(
    (state) => state.incorrectActionCount,
  )
  const restartStepCount = useFiberTrainingStore(
    (state) => state.restartStepCount,
  )
  const hintCount = useFiberTrainingStore((state) => state.hintCount)
  const completedProcedureStages = useFiberTrainingStore(
    (state) => state.completedProcedureStages,
  )
  const scoreBreakdown = useFiberTrainingStore((state) => state.scoreBreakdown)
  const assessmentFeedback = useFiberTrainingStore(
    (state) => state.assessmentFeedback,
  )
  const spliceLossDb = useFiberTrainingStore((state) => state.spliceLossDb)
  const assessmentAlignmentResult = useFiberTrainingStore(
    (state) => state.assessmentAlignmentResult,
  )
  const assessmentFusionResult = useFiberTrainingStore(
    (state) => state.assessmentFusionResult,
  )
  const assessmentProtectionResult = useFiberTrainingStore(
    (state) => state.assessmentProtectionResult,
  )
  const assessmentHeaterResult = useFiberTrainingStore(
    (state) => state.assessmentHeaterResult,
  )
  const assessmentFinalInspectionResult = useFiberTrainingStore(
    (state) => state.assessmentFinalInspectionResult,
  )
  const assessmentOverallResult = useFiberTrainingStore(
    (state) => state.assessmentOverallResult,
  )

  if (isReviewingProcedure) {
    return (
      <section
        className="rj45-assessment-panel fiber-assessment-panel fiber-review-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fiber-review-title"
      >
        <header className="assessment-header">
          <div>
            <span className="assessment-eyebrow">
              Fiber Optic Fusion Splicing
            </span>
            <h1 id="fiber-review-title">Procedure Review</h1>
          </div>
        </header>

        <section className="assessment-section fiber-procedure-review">
          <h2>Recommended Training Sequence</h2>
          <ol>
            {FIBER_REVIEW_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <footer className="assessment-actions">
          <button type="button" onClick={() => setIsReviewingProcedure(false)}>
            Back to Assessment
          </button>
        </footer>
      </section>
    )
  }

  return (
    <section
      className="rj45-assessment-panel fiber-assessment-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fiber-assessment-title"
    >
      <header className="assessment-header">
        <div>
          <span className="assessment-eyebrow">
            Fiber Optic Fusion Splicing
          </span>
          <h1 id="fiber-assessment-title">Training Complete</h1>
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

      <div className="assessment-content-grid fiber-assessment-grid">
        <div className="assessment-column">
          <section className="assessment-section">
            <h2>Performance Summary</h2>
            <dl className="assessment-metrics">
              <div>
                <dt>Procedure Accuracy</dt>
                <dd>{procedureAccuracy}%</dd>
              </div>
              <div>
                <dt>Completion Time</dt>
                <dd>{formatFiberAssessmentTime(elapsedTimeMs)}</dd>
              </div>
              <div>
                <dt>Total Mistakes</dt>
                <dd>{mistakeCount}</dd>
              </div>
              <div>
                <dt>Wrong Tools</dt>
                <dd>{wrongToolCount}</dd>
              </div>
              <div>
                <dt>Sequence Errors</dt>
                <dd>{sequenceErrorCount}</dd>
              </div>
              <div>
                <dt>Preparation Errors</dt>
                <dd>{preparationErrorCount}</dd>
              </div>
              <div>
                <dt>Incorrect Actions</dt>
                <dd>{incorrectActionCount}</dd>
              </div>
              <div>
                <dt>Restart Steps</dt>
                <dd>{restartStepCount}</dd>
              </div>
              <div>
                <dt>Alignment</dt>
                <dd>{assessmentAlignmentResult}</dd>
              </div>
              <div>
                <dt>Fusion</dt>
                <dd>{assessmentFusionResult}</dd>
              </div>
              <div>
                <dt>Splice Loss</dt>
                <dd>{(spliceLossDb ?? 0).toFixed(2)} dB</dd>
              </div>
              <div>
                <dt>Final Inspection</dt>
                <dd>{assessmentFinalInspectionResult}</dd>
              </div>
              <div>
                <dt>Protection Sleeve</dt>
                <dd>{assessmentProtectionResult}</dd>
              </div>
              <div>
                <dt>Heater Cycle</dt>
                <dd>{assessmentHeaterResult}</dd>
              </div>
              {hintCount > 0 && (
                <div>
                  <dt>Hints Used</dt>
                  <dd>{hintCount}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="assessment-section fiber-splice-quality">
            <h2>Splice Quality</h2>
            <dl>
              <div>
                <dt>Estimated Loss</dt>
                <dd>{(spliceLossDb ?? 0).toFixed(2)} dB</dd>
              </div>
              <div>
                <dt>Alignment</dt>
                <dd>{assessmentAlignmentResult}</dd>
              </div>
              <div>
                <dt>Fusion</dt>
                <dd>{assessmentFusionResult}</dd>
              </div>
              <div>
                <dt>Protection</dt>
                <dd>{assessmentProtectionResult}</dd>
              </div>
              <div>
                <dt>Heater</dt>
                <dd>{assessmentHeaterResult}</dd>
              </div>
              <div>
                <dt>Overall</dt>
                <dd>{assessmentOverallResult}</dd>
              </div>
            </dl>
            <p>
              Splice loss is a simulated training estimate, not an OTDR or
              power-meter measurement.
            </p>
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
              <li className="assessment-deduction-row">
                <span>Mistake Deductions</span>
                <strong>−{scoreBreakdown?.mistakeDeductions ?? 0}</strong>
              </li>
            </ul>
          </section>
        </div>

        <div className="assessment-column">
          <section className="assessment-section">
            <h2>Procedure Checklist</h2>
            <ul className="assessment-checklist">
              {FIBER_ASSESSMENT_STAGES.map((stage) => {
                const isCompleted = completedProcedureStages.includes(stage.id)

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
          onClick={() => setIsReviewingProcedure(true)}
        >
          Review Procedure
        </button>
        <button
          type="button"
          className="secondary"
          onClick={onReturnToLaboratory}
        >
          Return to Laboratory
        </button>
      </footer>
      <PersistenceStatus moduleKey="fiber" />
    </section>
  )
}
