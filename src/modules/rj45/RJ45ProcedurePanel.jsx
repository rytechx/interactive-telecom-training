import useTrainingStore from '../../store/useTrainingStore.js'
import T568BGuide from './T568BGuide.jsx'
import { getRJ45ProcedureStep, RJ45_MODULE_ID, RJ45_PROCEDURE_STEPS } from './rj45Procedure.js'
import { getWireDefinition, WIRE_COUNT } from './wireDefinitions.js'

function isArrangementStep(currentStep) {
  return (
    currentStep === RJ45_PROCEDURE_STEPS.ARRANGE_T568B ||
    currentStep === RJ45_PROCEDURE_STEPS.VALIDATE_T568B
  )
}

export default function RJ45ProcedurePanel({
  onContinue,
  onRestartModule,
  onExit,
}) {
  const activeModuleId = useTrainingStore((state) => state.activeModuleId)
  const currentStep = useTrainingStore((state) => state.currentStep)
  const procedureFeedback = useTrainingStore(
    (state) => state.procedureFeedback,
  )
  const selectedWireId = useTrainingStore((state) => state.selectedWireId)
  const wirePlacements = useTrainingStore((state) => state.wirePlacements)
  const placementHistory = useTrainingStore((state) => state.placementHistory)
  const wireValidationResults = useTrainingStore(
    (state) => state.wireValidationResults,
  )
  const placedWireCount = useTrainingStore((state) => state.placedWireCount)
  const isProcedureAnimating = useTrainingStore(
    (state) => state.isProcedureAnimating,
  )
  const undoLastPlacement = useTrainingStore(
    (state) => state.undoLastPlacement,
  )
  const resetWireArrangement = useTrainingStore(
    (state) => state.resetWireArrangement,
  )
  const validateWireArrangement = useTrainingStore(
    (state) => state.validateWireArrangement,
  )
  const procedureStep = getRJ45ProcedureStep(currentStep)
  const selectedWire = getWireDefinition(selectedWireId)
  const isArrangementActive = isArrangementStep(currentStep)
  const canContinue =
    currentStep === RJ45_PROCEDURE_STEPS.JACKET_STRIPPED ||
    currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_1
  const isComplete =
    currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_2
  const hasIncorrectValidation = wireValidationResults.includes('incorrect')
  const feedbackClassName = `procedure-feedback${
    isComplete
      ? ' is-success'
      : hasIncorrectValidation
        ? ' is-error'
        : ''
  }`

  if (activeModuleId !== RJ45_MODULE_ID) {
    return null
  }

  return (
    <section
      className={`training-panel procedure-panel${
        isArrangementActive ? ' is-arranging' : ''
      }`}
      role="dialog"
      aria-modal="false"
      aria-labelledby="procedure-title"
    >
      <span className="procedure-step-number">
        Step {procedureStep.stepNumber}
      </span>
      <h1 id="procedure-title">RJ45 Cable Termination</h1>
      <h2>{procedureStep.title}</h2>
      <p className="procedure-instruction">{procedureStep.instruction}</p>

      {isArrangementActive && (
        <>
          <p className="procedure-progress" role="status">
            Wires placed: {placedWireCount} / {WIRE_COUNT}
          </p>
          <p className="selected-wire-label">
            Selected wire:{' '}
            <strong>{selectedWire?.displayName ?? 'None'}</strong>
          </p>
          <T568BGuide
            wirePlacements={wirePlacements}
            wireValidationResults={wireValidationResults}
          />
        </>
      )}

      {procedureFeedback && (
        <p className={feedbackClassName} role="status">
          {procedureFeedback}
        </p>
      )}

      {procedureStep.nextInstruction && (
        <p className="procedure-next">{procedureStep.nextInstruction}</p>
      )}

      {(canContinue || isArrangementActive) && (
        <div className="training-actions procedure-primary-actions">
          {canContinue && (
            <button
              type="button"
              onClick={onContinue}
              disabled={isProcedureAnimating}
            >
              Continue
            </button>
          )}

          {isArrangementActive && (
            <>
              <button
                type="button"
                className="secondary"
                onClick={undoLastPlacement}
                disabled={placementHistory.length === 0 || isProcedureAnimating}
              >
                Undo Last Placement
              </button>
              <button
                type="button"
                className="secondary"
                onClick={resetWireArrangement}
                disabled={
                  (placedWireCount === 0 && !selectedWireId) ||
                  isProcedureAnimating
                }
              >
                Reset Arrangement
              </button>
              <button
                type="button"
                onClick={validateWireArrangement}
                disabled={
                  placedWireCount !== WIRE_COUNT || isProcedureAnimating
                }
              >
                Validate T568B
              </button>
            </>
          )}
        </div>
      )}

      <div className="training-actions procedure-secondary-actions">
        <button
          type="button"
          className="secondary"
          onClick={onRestartModule}
        >
          Restart Module
        </button>
        <button type="button" className="secondary" onClick={onExit}>
          Exit
        </button>
      </div>
    </section>
  )
}
