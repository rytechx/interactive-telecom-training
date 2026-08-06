import useTrainingStore from '../../store/useTrainingStore.js'
import { getRJ45ProcedureStep, RJ45_MODULE_ID } from './rj45Procedure.js'

export default function RJ45ProcedurePanel({ onRestart, onExit }) {
  const activeModuleId = useTrainingStore((state) => state.activeModuleId)
  const currentStep = useTrainingStore((state) => state.currentStep)
  const procedureFeedback = useTrainingStore(
    (state) => state.procedureFeedback,
  )
  const procedureStep = getRJ45ProcedureStep(currentStep)

  if (activeModuleId !== RJ45_MODULE_ID) {
    return null
  }

  return (
    <section
      className="training-panel procedure-panel"
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

      {procedureFeedback && (
        <p className="procedure-feedback" role="status">
          {procedureFeedback}
        </p>
      )}

      {procedureStep.nextInstruction && (
        <p className="procedure-next">{procedureStep.nextInstruction}</p>
      )}

      <div className="training-actions">
        <button type="button" onClick={onRestart}>
          Restart Step
        </button>
        <button type="button" className="secondary" onClick={onExit}>
          Exit
        </button>
      </div>
    </section>
  )
}
