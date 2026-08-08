import useFiberTrainingStore from '../../store/useFiberTrainingStore.js'
import useToolStore from '../../store/useToolStore.js'
import {
  FIBER_MODULE_ID,
  FIBER_PROCEDURE_STEPS,
  FIBER_TOTAL_STEPS,
  getFiberProcedureStep,
  isFiberContinuationStep,
  isFiberRestartableStep,
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
    (currentStep === FIBER_PROCEDURE_STEPS.TASK_2_COMPLETE && fiberCleaved)
  const hasError =
    procedureFeedback?.startsWith('Use the ') ||
    procedureFeedback?.startsWith('Position the ')
  const canContinue = isFiberContinuationStep(currentStep)

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

      {procedureFeedback &&
        procedureFeedback !== procedureStep.instruction && (
          <p
            className={`procedure-feedback${
              isComplete ? ' is-success' : hasError ? ' is-error' : ''
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
