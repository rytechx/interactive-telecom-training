import useFiberTrainingStore from '../../store/useFiberTrainingStore.js'
import useToolStore from '../../store/useToolStore.js'
import {
  FIBER_MODULE_ID,
  FIBER_PROCEDURE_STEPS,
  FIBER_TOTAL_STEPS,
  getFiberProcedureStep,
  isFiberContinuationStep,
  isFiberRestartableStep,
  isFiberSplicingStep,
} from './fiberProcedure.js'
import { getFiberToolConfig } from './fiberToolConfigs.js'

export default function FiberProcedurePanel({
  onContinue,
  onRestartStep,
  onRestartModule,
  onReturnTool,
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
      fusionComplete)
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
    procedureFeedback?.startsWith('Estimated splice loss:')
  const hasError =
    procedureFeedback?.startsWith('Use the ') ||
    procedureFeedback?.startsWith('Position the ') ||
    procedureFeedback?.startsWith('Complete ') ||
    procedureFeedback?.startsWith('Load and ')
  const canContinue = isFiberContinuationStep(currentStep)
  const isSplicingStep = isFiberSplicingStep(currentStep)

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
          <strong>SPLICE RESULT: {spliceResult}</strong>
          <span>Estimated Loss: {(spliceLossDb ?? 0.03).toFixed(2)} dB</span>
          <span>Alignment: PASS · Fusion: COMPLETE</span>
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
