import { useState } from 'react'
import useTrainingStore from '../../store/useTrainingStore.js'
import useToolStore from '../../store/useToolStore.js'
import { getToolConfig } from '../../tools/toolConfigs.js'
import T568BGuide from './T568BGuide.jsx'
import {
  getRJ45ProcedureStep,
  RJ45_MODULE_ID,
  RJ45_PROCEDURE_STEPS,
} from './rj45Procedure.js'
import { getWireDefinition, WIRE_COUNT } from './wireDefinitions.js'

function isArrangementStep(currentStep) {
  return (
    currentStep === RJ45_PROCEDURE_STEPS.ARRANGE_T568B ||
    currentStep === RJ45_PROCEDURE_STEPS.VALIDATE_T568B
  )
}

function isTrimmingStep(currentStep) {
  return [
    RJ45_PROCEDURE_STEPS.SELECT_CUTTING_TOOL,
    RJ45_PROCEDURE_STEPS.POSITION_FOR_TRIM,
    RJ45_PROCEDURE_STEPS.TRIM_WIRES,
    RJ45_PROCEDURE_STEPS.TRIMMING,
    RJ45_PROCEDURE_STEPS.WIRES_TRIMMED,
    RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_3,
  ].includes(currentStep)
}

function isConnectorInsertionStep(currentStep) {
  return [
    RJ45_PROCEDURE_STEPS.SELECT_RJ45_CONNECTOR,
    RJ45_PROCEDURE_STEPS.ALIGN_CONNECTOR,
    RJ45_PROCEDURE_STEPS.INSERT_CONDUCTORS,
    RJ45_PROCEDURE_STEPS.INSERTING_CONDUCTORS,
    RJ45_PROCEDURE_STEPS.VERIFY_INSERTION,
    RJ45_PROCEDURE_STEPS.CONDUCTORS_INSERTED,
    RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_4,
  ].includes(currentStep)
}

export default function RJ45ProcedurePanel({
  onContinue,
  onAlignConnector,
  onInsertConductors,
  onRetryInsertion,
  onRestartStep,
  onRestartModule,
  onExit,
}) {
  const [isGuideVisible, setIsGuideVisible] = useState(true)
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
  const connectorAligned = useTrainingStore((state) => state.connectorAligned)
  const conductorsInserted = useTrainingStore(
    (state) => state.conductorsInserted,
  )
  const insertionValidationResults = useTrainingStore(
    (state) => state.insertionValidationResults,
  )
  const selectedToolId = useToolStore((state) => state.selectedToolId)
  const activeToolId = useToolStore((state) => state.activeToolId)
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
  const selectedTool = getToolConfig(activeToolId ?? selectedToolId)
  const isArrangementActive = isArrangementStep(currentStep)
  const isTrimmingActive = isTrimmingStep(currentStep)
  const isConnectorInsertionActive = isConnectorInsertionStep(currentStep)
  const showConnectorOrientation =
    currentStep === RJ45_PROCEDURE_STEPS.ALIGN_CONNECTOR ||
    currentStep === RJ45_PROCEDURE_STEPS.INSERT_CONDUCTORS
  const canContinue =
    currentStep === RJ45_PROCEDURE_STEPS.JACKET_STRIPPED ||
    currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_1 ||
    currentStep === RJ45_PROCEDURE_STEPS.WIRES_ARRANGED ||
    currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_2 ||
    currentStep === RJ45_PROCEDURE_STEPS.WIRES_TRIMMED ||
    currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_3
  const isComplete = [
    RJ45_PROCEDURE_STEPS.WIRES_ARRANGED,
    RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_2,
    RJ45_PROCEDURE_STEPS.WIRES_TRIMMED,
    RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_3,
    RJ45_PROCEDURE_STEPS.CONDUCTORS_INSERTED,
    RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_4,
  ].includes(currentStep)
  const hasIncorrectValidation = wireValidationResults.includes('incorrect')
  const hasProcedureError =
    procedureFeedback?.startsWith('Use the ') ||
    procedureFeedback?.startsWith('Select the ') ||
    procedureFeedback?.startsWith('Align the ') ||
    procedureFeedback?.startsWith('One or more ')
  const showInsertionResults = insertionValidationResults.some(Boolean)
  const displayedProcedureFeedback = conductorsInserted
    ? 'All conductors are fully inserted and the cable jacket is seated correctly.'
    : procedureFeedback
  const canAlignConnector =
    currentStep === RJ45_PROCEDURE_STEPS.ALIGN_CONNECTOR &&
    !connectorAligned
  const canInsertConductors =
    currentStep === RJ45_PROCEDURE_STEPS.ALIGN_CONNECTOR ||
    currentStep === RJ45_PROCEDURE_STEPS.INSERT_CONDUCTORS
  const canRetryInsertion =
    currentStep === RJ45_PROCEDURE_STEPS.VERIFY_INSERTION &&
    insertionValidationResults.includes('incorrect')
  const feedbackClassName = `procedure-feedback${
    isComplete
      ? ' is-success'
      : hasIncorrectValidation || hasProcedureError
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
      }${isTrimmingActive ? ' is-trimming' : ''}${
        isConnectorInsertionActive ? ' is-inserting' : ''
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
      {!conductorsInserted && (
        <p className="procedure-instruction">{procedureStep.instruction}</p>
      )}

      {isArrangementActive && (
        <>
          <p className="procedure-progress" role="status">
            Wires placed: {placedWireCount} / {WIRE_COUNT}
          </p>
          <p className="selected-wire-label">
            Selected wire:{' '}
            <strong>{selectedWire?.displayName ?? 'None'}</strong>
          </p>
          <button
            className="guide-toggle-button"
            type="button"
            aria-expanded={isGuideVisible}
            onClick={() => setIsGuideVisible((isVisible) => !isVisible)}
          >
            {isGuideVisible ? 'Hide Guide' : 'Show Guide'}
          </button>
          {isGuideVisible && (
            <T568BGuide
              wirePlacements={wirePlacements}
              wireValidationResults={wireValidationResults}
            />
          )}
        </>
      )}

      {(isTrimmingActive || isConnectorInsertionActive) &&
        (conductorsInserted ? (
          <p className="selected-tool-label" role="status">
            Workpiece: <strong>RJ45 Connector</strong>
          </p>
        ) : (
          <p className="selected-tool-label" role="status">
            Selected tool: <strong>{selectedTool?.name ?? 'None'}</strong>
          </p>
        ))}

      {showConnectorOrientation && (
        <div className="connector-orientation-instruction" role="note">
          <strong>Contacts up, locking tab down.</strong>
          <span>Pin 1 &rarr; Pin 8</span>
        </div>
      )}

      {displayedProcedureFeedback && (
        <p className={feedbackClassName} role="status">
          {displayedProcedureFeedback}
        </p>
      )}

      {procedureStep.nextInstruction && (
        <p className="procedure-next">{procedureStep.nextInstruction}</p>
      )}

      {showInsertionResults && (
        <div
          className="connector-verification"
          aria-label="Connector pin verification"
        >
          <strong>Insertion verification</strong>
          <ol className="connector-pin-results">
            {insertionValidationResults.map((result, index) => (
              <li
                key={index}
                className={result ? `is-${result}` : undefined}
                aria-label={`Pin ${index + 1}: ${result ?? 'pending'}`}
              >
                <span>{index + 1}</span>
                <b>{result === 'correct' ? '\u2713' : '!'}</b>
              </li>
            ))}
          </ol>
        </div>
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

      {(canAlignConnector || canInsertConductors || canRetryInsertion) && (
        <div className="training-actions procedure-primary-actions">
          {canAlignConnector && (
            <button
              type="button"
              onClick={onAlignConnector}
              disabled={isProcedureAnimating}
            >
              Align Connector
            </button>
          )}
          {canInsertConductors && (
            <button
              type="button"
              onClick={onInsertConductors}
              disabled={isProcedureAnimating}
            >
              Insert Conductors
            </button>
          )}
          {canRetryInsertion && (
            <button type="button" onClick={onRetryInsertion}>
              Retry Insertion
            </button>
          )}
        </div>
      )}

      <div className="training-actions procedure-secondary-actions">
        {(isTrimmingActive || isConnectorInsertionActive) && (
          <button
            type="button"
            className="secondary"
            onClick={onRestartStep}
          >
            Restart Step
          </button>
        )}
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
