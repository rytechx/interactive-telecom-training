import useFiberTrainingStore from '../../store/useFiberTrainingStore.js'
import useToolStore from '../../store/useToolStore.js'
import {
  FIBER_MODULE_ID,
  FIBER_PROCEDURE_STEPS,
  FIBER_TOTAL_STEPS,
  getFiberProcedureStep,
  isFiberContinuationStep,
  isFiberProtectionStep,
  isFiberRestartableStep,
  isFiberSplicingStep,
} from './fiberProcedure.js'
import { getFiberToolConfig } from './fiberToolConfigs.js'

export default function FiberProcedurePanel({
  onContinue,
  onRestartStep,
  onRestartModule,
  onReturnTool,
  onCompleteTraining,
  onExit,
}) {
  const activeModuleId = useFiberTrainingStore(
    (state) => state.activeModuleId,
  )
  const currentStep = useFiberTrainingStore((state) => state.currentStep)
  const procedureFeedback = useFiberTrainingStore(
    (state) => state.procedureFeedback,
  )
  const isProcedureAnimating = useFiberTrainingStore(
    (state) => state.isProcedureAnimating,
  )
  const outerJacketRemoved = useFiberTrainingStore(
    (state) => state.outerJacketRemoved,
  )
  const coatingRemoved = useFiberTrainingStore((state) => state.coatingRemoved)
  const fiberCleaned = useFiberTrainingStore((state) => state.fiberCleaned)
  const fiberCleaved = useFiberTrainingStore((state) => state.fiberCleaved)
  const fiberALoaded = useFiberTrainingStore((state) => state.fiberALoaded)
  const fiberBLoaded = useFiberTrainingStore((state) => state.fiberBLoaded)
  const fusionComplete = useFiberTrainingStore(
    (state) => state.fusionComplete,
  )
  const spliceLossDb = useFiberTrainingStore((state) => state.spliceLossDb)
  const spliceResult = useFiberTrainingStore((state) => state.spliceResult)
  const protectionSleeveSelected = useFiberTrainingStore(
    (state) => state.protectionSleeveSelected,
  )
  const protectionSleevePositioned = useFiberTrainingStore(
    (state) => state.protectionSleevePositioned,
  )
  const heaterClosed = useFiberTrainingStore((state) => state.heaterClosed)
  const heaterActive = useFiberTrainingStore((state) => state.heaterActive)
  const heatingComplete = useFiberTrainingStore(
    (state) => state.heatingComplete,
  )
  const coolingComplete = useFiberTrainingStore(
    (state) => state.coolingComplete,
  )
  const protectedSpliceRemoved = useFiberTrainingStore(
    (state) => state.protectedSpliceRemoved,
  )
  const finalInspectionPassed = useFiberTrainingStore(
    (state) => state.finalInspectionPassed,
  )
  const fiberModuleCompleted = useFiberTrainingStore(
    (state) => state.fiberModuleCompleted,
  )
  const selectedToolId = useToolStore((state) => state.selectedToolId)
  const activeToolId = useToolStore((state) => state.activeToolId)
  const activeTool = getFiberToolConfig(activeToolId ?? selectedToolId)
  const procedureStep = getFiberProcedureStep(currentStep)
  const isComplete =
    (currentStep === FIBER_PROCEDURE_STEPS.TASK_1_COMPLETE &&
      outerJacketRemoved) ||
    (currentStep === FIBER_PROCEDURE_STEPS.COATING_REMOVED &&
      coatingRemoved) ||
    (currentStep === FIBER_PROCEDURE_STEPS.FIBER_CLEANED && fiberCleaned) ||
    (currentStep === FIBER_PROCEDURE_STEPS.TASK_2_COMPLETE && fiberCleaved) ||
    (currentStep === FIBER_PROCEDURE_STEPS.TASK_3_COMPLETE &&
      fusionComplete) ||
    finalInspectionPassed ||
    fiberModuleCompleted
  const hasSuccessFeedback =
    isComplete ||
    procedureFeedback?.includes('successfully') ||
    procedureFeedback?.includes('loaded.') ||
    procedureFeedback?.includes('secured.') ||
    procedureFeedback?.includes('closed.') ||
    procedureFeedback?.includes('complete.') ||
    procedureFeedback?.includes('result: PASS') ||
    procedureFeedback?.includes('opened.') ||
    procedureFeedback?.includes('released.') ||
    procedureFeedback?.includes('positioned in heater') ||
    procedureFeedback?.includes('centered over splice') ||
    procedureFeedback?.includes('Heater status: COMPLETE') ||
    procedureFeedback?.includes('inspection: PASS') ||
    procedureFeedback?.startsWith('Estimated splice loss:')
  const hasError =
    procedureFeedback?.startsWith('Use the ') ||
    procedureFeedback?.startsWith('Position the ') ||
    procedureFeedback?.startsWith('Complete ') ||
    procedureFeedback?.startsWith('Load and ') ||
    procedureFeedback?.startsWith('Use the splice')
  const canContinue = isFiberContinuationStep(currentStep)
  const isSplicingStep = isFiberSplicingStep(currentStep)
  const isProtectionStep = isFiberProtectionStep(currentStep)
  const heaterStatus = heaterActive
    ? 'HEATING'
    : heatingComplete && !coolingComplete
      ? 'COOLING'
      : heatingComplete && coolingComplete
        ? 'COMPLETE'
        : heaterClosed
          ? 'READY'
          : 'IDLE'

  if (activeModuleId !== FIBER_MODULE_ID) {
    return null
  }

  return (
    <section
      className="training-panel procedure-panel fiber-procedure-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="fiber-procedure-title"
    >
      <span className="procedure-step-number">
        Step {procedureStep.stepNumber} of {FIBER_TOTAL_STEPS}
      </span>
      <h1 id="fiber-procedure-title">Fiber Optic Fusion Splicing</h1>
      <h2>{procedureStep.title}</h2>
      <p className="procedure-instruction">{procedureStep.instruction}</p>

      {activeTool && (
        <p className="selected-tool-label" role="status">
          Active Tool: <strong>{activeTool.name}</strong>
        </p>
      )}

      {isSplicingStep && (
        <div className="fiber-pair-status" aria-label="Prepared fiber status">
          <span>
            <strong>Fiber A</strong>
            {fusionComplete ? 'Fused' : fiberALoaded ? 'Loaded' : 'Prepared'}
          </span>
          <span>
            <strong>Fiber B</strong>
            {fusionComplete ? 'Fused' : fiberBLoaded ? 'Loaded' : 'Prepared'}
          </span>
        </div>
      )}

      {procedureFeedback &&
        procedureFeedback !== procedureStep.instruction && (
          <p
            className={`procedure-feedback${
              hasSuccessFeedback
                ? ' is-success'
                : hasError
                  ? ' is-error'
                  : ''
            }`}
            role="status"
          >
            {procedureFeedback}
          </p>
        )}

      {procedureStep.nextInstruction && (
        <p className="procedure-next">{procedureStep.nextInstruction}</p>
      )}

      {currentStep === FIBER_PROCEDURE_STEPS.TASK_2_COMPLETE && (
        <p className="fiber-cleave-quality" role="status">
          Clean square cleave achieved.
        </p>
      )}

      {currentStep === FIBER_PROCEDURE_STEPS.TASK_3_COMPLETE && (
        <div className="fiber-splice-result" role="status">
          <span>Fusion splice completed successfully.</span>
          <strong>SPLICE RESULT: {spliceResult}</strong>
          <span>Estimated Loss: {(spliceLossDb ?? 0.03).toFixed(2)} dB</span>
          <span>Alignment: PASS · Fusion: COMPLETE</span>
        </div>
      )}

      {isProtectionStep && (
        <div
          className="fiber-protection-status"
          aria-label="Splice protection status"
        >
          <span>
            <strong>Protection Sleeve</strong>
            {protectionSleevePositioned
              ? 'CENTERED'
              : protectionSleeveSelected
                ? 'SELECTED'
                : 'PARKED'}
          </span>
          <span>
            <strong>Heater</strong>
            {heaterStatus}
          </span>
          <span>
            <strong>Protected Splice</strong>
            {protectedSpliceRemoved ? 'INSPECTION AREA' : 'IN PROCESS'}
          </span>
        </div>
      )}

      {finalInspectionPassed && (
        <div className="fiber-final-inspection" role="status">
          <strong>FINAL SPLICE INSPECTION</strong>
          <span>Fusion Joint: PASS</span>
          <span>Estimated Loss: {(spliceLossDb ?? 0.03).toFixed(2)} dB</span>
          <span>Protection Sleeve: INSTALLED</span>
          <span>Sleeve Alignment: PASS</span>
          <span>Heat Shrink: COMPLETE</span>
          <b>Result: PASS</b>
        </div>
      )}

      {fiberModuleCompleted && (
        <div className="fiber-module-complete" role="status">
          <strong>Fiber optic fusion splice completed successfully.</strong>
          <span>
            The fiber was prepared, cleaned, cleaved, aligned, fused,
            protected, and inspected correctly.
          </span>
          <b>Estimated splice loss: {(spliceLossDb ?? 0.03).toFixed(2)} dB</b>
        </div>
      )}

      {canContinue && (
        <div className="training-actions procedure-primary-actions">
          <button
            type="button"
            onClick={onContinue}
            disabled={isProcedureAnimating}
          >
            Continue
          </button>
        </div>
      )}

      {currentStep === FIBER_PROCEDURE_STEPS.FINAL_INSPECTION &&
        finalInspectionPassed && (
          <div className="training-actions procedure-primary-actions">
            <button
              type="button"
              onClick={onCompleteTraining}
              disabled={isProcedureAnimating}
            >
              Complete Training
            </button>
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
        {isFiberRestartableStep(currentStep) && (
          <button
            type="button"
            className="secondary"
            onClick={onRestartStep}
            disabled={isProcedureAnimating}
          >
            Restart Step
          </button>
        )}
        <button
          type="button"
          className="secondary"
          onClick={onRestartModule}
          disabled={isProcedureAnimating}
        >
          Restart Module
        </button>
        <button
          type="button"
          className="secondary"
          onClick={onExit}
          disabled={isProcedureAnimating}
        >
          Exit
        </button>
      </div>
    </section>
  )
}
