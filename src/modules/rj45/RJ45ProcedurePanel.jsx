import { useState } from 'react'
import useSettingsStore from '../../store/useSettingsStore.js'
import useTrainingStore from '../../store/useTrainingStore.js'
import useToolStore from '../../store/useToolStore.js'
import { getToolConfig } from '../../tools/toolConfigs.js'
import { confirmTrainingRestart } from '../../utils/trainingConfirmations.js'
import T568BGuide from './T568BGuide.jsx'
import {
  getRJ45ProcedureStep,
  RJ45_MODULE_ID,
  RJ45_PROCEDURE_STEPS,
  RJ45_TOTAL_STEPS,
} from './rj45Procedure.js'
import {
  CONTINUITY_LABEL,
  TEST_PIN_COUNT,
  TEST_PIN_STATUSES,
} from './testSequenceConfig.js'
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

function isCrimpingStep(currentStep) {
  return [
    RJ45_PROCEDURE_STEPS.SELECT_CRIMPING_TOOL,
    RJ45_PROCEDURE_STEPS.POSITION_CONNECTOR_IN_CRIMPER,
    RJ45_PROCEDURE_STEPS.READY_TO_CRIMP,
    RJ45_PROCEDURE_STEPS.CRIMPING,
    RJ45_PROCEDURE_STEPS.CRIMP_COMPLETE,
    RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_5,
  ].includes(currentStep)
}

function isCableTestingStep(currentStep) {
  return [
    RJ45_PROCEDURE_STEPS.SELECT_CABLE_TESTER,
    RJ45_PROCEDURE_STEPS.CONNECT_CABLE_TO_TESTER,
    RJ45_PROCEDURE_STEPS.READY_TO_TEST,
    RJ45_PROCEDURE_STEPS.TESTING_CABLE,
    RJ45_PROCEDURE_STEPS.TEST_RESULT,
    RJ45_PROCEDURE_STEPS.RJ45_MODULE_COMPLETE,
  ].includes(currentStep)
}

function getWireSwatchBackground(wire) {
  if (!wire) {
    return '#56636a'
  }

  return wire.stripeColor
    ? `linear-gradient(90deg, ${wire.primaryColor} 0 58%, ${wire.stripeColor} 58% 100%)`
    : wire.primaryColor
}

function getDisplayInstruction(instruction) {
  return instruction?.replace(/^Step \d+:\s*/, '') ?? ''
}

export default function RJ45ProcedurePanel({
  onContinue,
  onAlignConnector,
  onInsertConductors,
  onRetryInsertion,
  onPositionConnector,
  onCrimpConnector,
  onConnectCable,
  onTestCable,
  onRestartStep,
  onRestartModule,
  onViewAssessment,
  onReturnTool,
  onExit,
}) {
  const [isReferenceGuideVisible, setIsReferenceGuideVisible] = useState(true)
  const confirmRestart = useSettingsStore((state) => state.confirmRestart)
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
  const handleRestartStep = () => {
    if (confirmTrainingRestart('step', confirmRestart)) onRestartStep()
  }
  const handleRestartModule = () => {
    if (confirmTrainingRestart('module', confirmRestart)) onRestartModule()
  }
  const connectorAligned = useTrainingStore((state) => state.connectorAligned)
  const insertionValidationResults = useTrainingStore(
    (state) => state.insertionValidationResults,
  )
  const connectorPositionedForCrimp = useTrainingStore(
    (state) => state.connectorPositionedForCrimp,
  )
  const crimpComplete = useTrainingStore((state) => state.crimpComplete)
  const contactsSeated = useTrainingStore((state) => state.contactsSeated)
  const strainReliefSecured = useTrainingStore(
    (state) => state.strainReliefSecured,
  )
  const crimpVerification = useTrainingStore(
    (state) => state.crimpVerification,
  )
  const cableConnectedToTester = useTrainingStore(
    (state) => state.cableConnectedToTester,
  )
  const cableTestProgress = useTrainingStore(
    (state) => state.cableTestProgress,
  )
  const cableTestResults = useTrainingStore(
    (state) => state.cableTestResults,
  )
  const finalTestResult = useTrainingStore(
    (state) => state.finalTestResult,
  )
  const moduleCompleted = useTrainingStore((state) => state.moduleCompleted)
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
  const recordHint = useTrainingStore((state) => state.recordHint)
  const procedureStep = getRJ45ProcedureStep(currentStep)
  const displayInstruction = getDisplayInstruction(procedureStep.instruction)
  const selectedWire = getWireDefinition(selectedWireId)
  const selectedTool = getToolConfig(activeToolId ?? selectedToolId)
  const isArrangementActive = isArrangementStep(currentStep)
  const isTrimmingActive = isTrimmingStep(currentStep)
  const isConnectorInsertionActive = isConnectorInsertionStep(currentStep)
  const isCrimpingActive = isCrimpingStep(currentStep)
  const isCableTestingActive = isCableTestingStep(currentStep)
  const isTechnicianOverview =
    !isArrangementActive &&
    !isTrimmingActive &&
    !isConnectorInsertionActive &&
    !isCrimpingActive &&
    !isCableTestingActive
  const isInsertionCompletionStep =
    currentStep === RJ45_PROCEDURE_STEPS.CONDUCTORS_INSERTED ||
    currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_4
  const showConnectorOrientation =
    currentStep === RJ45_PROCEDURE_STEPS.ALIGN_CONNECTOR ||
    currentStep === RJ45_PROCEDURE_STEPS.INSERT_CONDUCTORS
  const isCrimpCompletionStep =
    currentStep === RJ45_PROCEDURE_STEPS.CRIMP_COMPLETE ||
    currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_5
  const isTestCompletionStep =
    currentStep === RJ45_PROCEDURE_STEPS.TEST_RESULT ||
    currentStep === RJ45_PROCEDURE_STEPS.RJ45_MODULE_COMPLETE
  const canContinue =
    currentStep === RJ45_PROCEDURE_STEPS.JACKET_STRIPPED ||
    currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_1 ||
    currentStep === RJ45_PROCEDURE_STEPS.WIRES_ARRANGED ||
    currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_2 ||
    currentStep === RJ45_PROCEDURE_STEPS.WIRES_TRIMMED ||
    currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_3 ||
    isInsertionCompletionStep ||
    isCrimpCompletionStep
  const isComplete = [
    RJ45_PROCEDURE_STEPS.WIRES_ARRANGED,
    RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_2,
    RJ45_PROCEDURE_STEPS.WIRES_TRIMMED,
    RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_3,
    RJ45_PROCEDURE_STEPS.CONDUCTORS_INSERTED,
    RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_4,
    RJ45_PROCEDURE_STEPS.CRIMP_COMPLETE,
    RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_5,
    RJ45_PROCEDURE_STEPS.TEST_RESULT,
    RJ45_PROCEDURE_STEPS.RJ45_MODULE_COMPLETE,
  ].includes(currentStep)
  const hasIncorrectValidation = wireValidationResults.includes('incorrect')
  const hasProcedureError =
    procedureFeedback?.startsWith('Use the ') ||
    procedureFeedback?.startsWith('Select the ') ||
    procedureFeedback?.startsWith('Align the ') ||
    procedureFeedback?.startsWith('Position the ') ||
    procedureFeedback?.startsWith('Verify the ') ||
    procedureFeedback?.startsWith('One or more ')
  const showInsertionResults =
    isConnectorInsertionActive && insertionValidationResults.some(Boolean)
  const displayedProcedureFeedback = isInsertionCompletionStep
    ? 'All conductors are fully inserted and the cable jacket is seated correctly.'
    : procedureFeedback
  const showProcedureFeedback =
    displayedProcedureFeedback &&
    getDisplayInstruction(displayedProcedureFeedback) !== displayInstruction
  const canAlignConnector =
    currentStep === RJ45_PROCEDURE_STEPS.ALIGN_CONNECTOR &&
    !connectorAligned
  const canInsertConductors =
    currentStep === RJ45_PROCEDURE_STEPS.ALIGN_CONNECTOR ||
    currentStep === RJ45_PROCEDURE_STEPS.INSERT_CONDUCTORS
  const canRetryInsertion =
    currentStep === RJ45_PROCEDURE_STEPS.VERIFY_INSERTION &&
    insertionValidationResults.includes('incorrect')
  const canPositionConnector =
    currentStep === RJ45_PROCEDURE_STEPS.POSITION_CONNECTOR_IN_CRIMPER &&
    !connectorPositionedForCrimp
  const canAttemptCrimp =
    (currentStep === RJ45_PROCEDURE_STEPS.POSITION_CONNECTOR_IN_CRIMPER ||
      currentStep === RJ45_PROCEDURE_STEPS.READY_TO_CRIMP) &&
    !crimpComplete
  const canConnectCable =
    currentStep === RJ45_PROCEDURE_STEPS.CONNECT_CABLE_TO_TESTER &&
    !cableConnectedToTester
  const canRunCableTest =
    currentStep === RJ45_PROCEDURE_STEPS.READY_TO_TEST &&
    cableConnectedToTester
  const testProgressPercent = Math.round(cableTestProgress * 100)
  const activeTestPin = cableTestResults.findIndex(
    (result) => result === TEST_PIN_STATUSES.TESTING,
  )
  const feedbackClassName = `procedure-feedback${
    isComplete
      ? ' is-success'
      : hasIncorrectValidation || hasProcedureError
        ? ' is-error'
        : ''
  }`
  const handleGuideToggle = () => {
    if (!isReferenceGuideVisible) {
      recordHint()
    }

    setIsReferenceGuideVisible((isVisible) => !isVisible)
  }

  if (activeModuleId !== RJ45_MODULE_ID) {
    return null
  }

  return (
    <section
      className={`training-panel procedure-panel${
        isArrangementActive ? ' is-arranging' : ''
      }${isTrimmingActive ? ' is-trimming' : ''}${
        isConnectorInsertionActive ? ' is-inserting' : ''
      }${isCrimpingActive ? ' is-crimping' : ''}${
        isCableTestingActive ? ' is-testing' : ''
      }${isTechnicianOverview ? ' is-technician-overview' : ''}`}
      role="dialog"
      aria-modal="false"
      aria-labelledby="procedure-title"
    >
      <span className="procedure-step-number">
        Step {procedureStep.stepNumber} of {RJ45_TOTAL_STEPS}
      </span>
      <h1 id="procedure-title">RJ45 Cable Termination</h1>
      <h2>{procedureStep.title}</h2>
      {!isInsertionCompletionStep &&
        !isCrimpCompletionStep &&
        !isTestCompletionStep && (
        <p className="procedure-instruction">{displayInstruction}</p>
        )}

      {isArrangementActive && (
        <>
          <div className="arrangement-status" role="status">
            <span className="arrangement-status-chip">
              <small>Placed</small>
              <strong>
                {placedWireCount} / {WIRE_COUNT}
              </strong>
            </span>
            <span className="arrangement-status-chip is-selected-wire">
              <i
                className="selected-wire-swatch"
                style={{ background: getWireSwatchBackground(selectedWire) }}
                aria-hidden="true"
              />
              <span>
                <small>Selected</small>
                <strong>{selectedWire?.displayName ?? 'None'}</strong>
              </span>
            </span>
          </div>
          <p className="arrangement-hint">
            Select a conductor, then choose its matching comb slot.
          </p>
          <button
            type="button"
            className="guide-toggle-button"
            aria-expanded={isReferenceGuideVisible}
            onClick={handleGuideToggle}
          >
            {isReferenceGuideVisible ? 'Hide Guide' : 'Show Guide'}
          </button>
          {isReferenceGuideVisible && (
            <T568BGuide
              wirePlacements={wirePlacements}
              wireValidationResults={wireValidationResults}
            />
          )}
        </>
      )}

      {(isTrimmingActive ||
        isConnectorInsertionActive ||
        isCrimpingActive ||
        isCableTestingActive ||
        (isTechnicianOverview && selectedTool)) &&
        (isCableTestingActive ? (
          <p className="selected-tool-label" role="status">
            Active Tool: <strong>{selectedTool?.name ?? 'None'}</strong>
          </p>
        ) : crimpComplete ? (
          <p className="selected-tool-label" role="status">
            Workpiece: <strong>Crimped RJ45 Connector</strong>
          </p>
        ) : isInsertionCompletionStep ? (
          <p className="selected-tool-label" role="status">
            Workpiece: <strong>RJ45 Connector</strong>
          </p>
        ) : (
          <p className="selected-tool-label" role="status">
            Active Tool: <strong>{selectedTool?.name ?? 'None'}</strong>
          </p>
        ))}

      {showConnectorOrientation && (
        <div className="connector-orientation-instruction" role="note">
          <strong>Contacts up, locking tab down.</strong>
          <span>Pin 1 &rarr; Pin 8</span>
        </div>
      )}

      {showProcedureFeedback && (
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

      {connectorPositionedForCrimp && !crimpComplete && (
        <p className="crimp-position-status" role="status">
          Connector positioned
        </p>
      )}

      {isCrimpingActive && crimpComplete && (
        <div className="crimp-verification" aria-label="Crimp verification">
          <strong>Crimp verification</strong>
          <ul>
            <li>
              <span>Contacts seated:</span>
              <b>{contactsSeated} / {WIRE_COUNT}</b>
            </li>
            <li>
              <span>Strain relief:</span>
              <b>{strainReliefSecured ? 'Secured' : 'Pending'}</b>
            </li>
            <li>
              <span>T568B arrangement:</span>
              <b>{crimpVerification.t568bVerified ? 'Verified' : 'Pending'}</b>
            </li>
          </ul>
        </div>
      )}

      {isCableTestingActive && (
        <div className="cable-test-status" aria-label="Cable test status">
          <div className="cable-test-progress-heading">
            <strong>Test progress</strong>
            <span>{testProgressPercent}%</span>
          </div>
          <div
            className="cable-test-progress-track"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={testProgressPercent}
          >
            <span style={{ width: `${testProgressPercent}%` }} />
          </div>
          {!finalTestResult && (
            <p className="cable-test-progress-text" role="status">
              {activeTestPin >= 0
                ? `Testing Pin ${activeTestPin + 1} of ${TEST_PIN_COUNT}`
                : cableConnectedToTester
                  ? 'Cable connected and ready to test.'
                  : 'Cable tester connection pending.'}
            </p>
          )}
          <ol className="cable-test-pin-results">
            {cableTestResults.map((result, index) => (
              <li
                key={index}
                className={`is-${result}`}
                aria-label={`Pin ${index + 1} ${result}`}
              >
                <span>Pin {index + 1}</span>
                <b>{result.toUpperCase()}</b>
              </li>
            ))}
          </ol>

          {finalTestResult && (
            <div
              className={`cable-test-result is-${finalTestResult.toLowerCase()}`}
              role="status"
            >
              <b>CABLE TEST</b>
              <strong>T568B VERIFIED</strong>
              <strong>TEST RESULT: {finalTestResult}</strong>
              <span>Continuity: {CONTINUITY_LABEL}</span>
            </div>
          )}
        </div>
      )}

      {moduleCompleted && finalTestResult === 'PASS' && (
        <div className="training-actions procedure-primary-actions">
          <button type="button" onClick={onViewAssessment}>
            View Assessment
          </button>
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
                Undo
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
                Reset
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

      {(canPositionConnector || canAttemptCrimp) && (
        <div className="training-actions procedure-primary-actions">
          {canPositionConnector && (
            <button
              type="button"
              onClick={onPositionConnector}
              disabled={isProcedureAnimating}
            >
              Position Connector
            </button>
          )}
          {canAttemptCrimp && (
            <button
              type="button"
              onClick={onCrimpConnector}
              disabled={isProcedureAnimating}
            >
              Crimp Connector
            </button>
          )}
        </div>
      )}

      {(canConnectCable || canRunCableTest) && (
        <div className="training-actions procedure-primary-actions">
          {canConnectCable && (
            <button
              type="button"
              onClick={onConnectCable}
              disabled={isProcedureAnimating}
            >
              Connect Cable
            </button>
          )}
          {canRunCableTest && (
            <button
              type="button"
              onClick={onTestCable}
              disabled={isProcedureAnimating}
            >
              Test Cable
            </button>
          )}
        </div>
      )}

      <div className="training-actions procedure-secondary-actions">
        {activeToolId && (
          <button
            type="button"
            className="secondary"
            onClick={onReturnTool}
            disabled={isProcedureAnimating}
          >
            Return Tool
          </button>
        )}
        {(isTrimmingActive ||
          isConnectorInsertionActive ||
          isCrimpingActive ||
          (isCableTestingActive &&
            !(moduleCompleted && finalTestResult === 'PASS'))) && (
          <button
            type="button"
            className="secondary"
            onClick={handleRestartStep}
          >
            Restart Step
          </button>
        )}
        <button
          type="button"
          className="secondary"
          onClick={handleRestartModule}
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
