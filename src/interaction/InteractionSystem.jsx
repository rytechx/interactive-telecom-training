import { useEffect } from 'react'
import RJ45ProcedurePanel from '../modules/rj45/RJ45ProcedurePanel.jsx'
import { RJ45_PROCEDURE_STEPS } from '../modules/rj45/rj45Procedure.js'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../store/useInteractionStore.js'
import useTrainingStore from '../store/useTrainingStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../store/useToolStore.js'
import { getToolConfig } from '../tools/toolConfigs.js'
import { getWorkstationConfig } from '../workstations/workstationConfigs.js'

function releasePointerLock() {
  if (document.pointerLockElement) {
    document.exitPointerLock()
  }
}

function isConnectorInsertionStep(currentStep) {
  return [
    RJ45_PROCEDURE_STEPS.ALIGN_CONNECTOR,
    RJ45_PROCEDURE_STEPS.INSERT_CONDUCTORS,
    RJ45_PROCEDURE_STEPS.INSERTING_CONDUCTORS,
    RJ45_PROCEDURE_STEPS.VERIFY_INSERTION,
  ].includes(currentStep)
}

export default function InteractionSystem() {
  const nearbyInteractable = useInteractionStore(
    (state) => state.nearbyInteractable,
  )
  const isPointerLocked = useInteractionStore(
    (state) => state.isPointerLocked,
  )
  const isTrainingMode = useInteractionStore(
    (state) => state.isTrainingMode,
  )
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const activeInteractable = useInteractionStore(
    (state) => state.activeInteractable,
  )
  const requestWorkstationExit = useInteractionStore(
    (state) => state.requestWorkstationExit,
  )
  const trainingStarted = useTrainingStore((state) => state.trainingStarted)
  const beginRJ45Training = useTrainingStore(
    (state) => state.beginRJ45Training,
  )
  const restartRJ45Training = useTrainingStore(
    (state) => state.restartRJ45Training,
  )
  const continueRJ45Procedure = useTrainingStore(
    (state) => state.continueRJ45Procedure,
  )
  const restartWireTrimming = useTrainingStore(
    (state) => state.restartWireTrimming,
  )
  const startConnectorAlignment = useTrainingStore(
    (state) => state.startConnectorAlignment,
  )
  const startConductorInsertion = useTrainingStore(
    (state) => state.startConductorInsertion,
  )
  const retryConductorInsertion = useTrainingStore(
    (state) => state.retryConductorInsertion,
  )
  const restartConnectorInsertion = useTrainingStore(
    (state) => state.restartConnectorInsertion,
  )
  const resetTraining = useTrainingStore((state) => state.resetTraining)
  const handleToolActivated = useTrainingStore(
    (state) => state.handleToolActivated,
  )
  const selectedToolId = useToolStore((state) => state.selectedToolId)
  const activeToolId = useToolStore((state) => state.activeToolId)
  const toolViewState = useToolStore((state) => state.toolViewState)
  const activateSelectedTool = useToolStore(
    (state) => state.activateSelectedTool,
  )
  const requestToolViewExit = useToolStore(
    (state) => state.requestToolViewExit,
  )
  const returnActiveTool = useToolStore((state) => state.returnActiveTool)
  const resetToolState = useToolStore((state) => state.resetToolState)
  const activeWorkstation = getWorkstationConfig(activeInteractable?.id)
  const selectedTool = getToolConfig(selectedToolId)
  const activeTool = getToolConfig(activeToolId)
  const canInteract =
    Boolean(nearbyInteractable) &&
    isPointerLocked &&
    workstationPhase === WORKSTATION_PHASES.EXPLORATION

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.repeat) {
        return
      }

      const interactionState = useInteractionStore.getState()
      const toolState = useToolStore.getState()
      const trainingState = useTrainingStore.getState()

      if (
        event.code === 'KeyE' &&
        interactionState.nearbyInteractable &&
        interactionState.isPointerLocked &&
        interactionState.workstationPhase === WORKSTATION_PHASES.EXPLORATION
      ) {
        event.preventDefault()
        releasePointerLock()
        interactionState.requestWorkstationFocus(
          interactionState.nearbyInteractable,
        )
        return
      }

      if (
        event.code === 'Escape' &&
        toolState.activeToolId
      ) {
        event.preventDefault()
        event.stopPropagation()
        if (
          trainingState.currentStep ===
            RJ45_PROCEDURE_STEPS.POSITION_FOR_TRIM ||
          trainingState.currentStep === RJ45_PROCEDURE_STEPS.TRIM_WIRES ||
          trainingState.currentStep === RJ45_PROCEDURE_STEPS.TRIMMING
        ) {
          trainingState.restartWireTrimming()
        } else if (isConnectorInsertionStep(trainingState.currentStep)) {
          trainingState.restartConnectorInsertion()
        }
        toolState.returnActiveTool()
        return
      }

      if (
        event.code === 'Escape' &&
        (toolState.toolViewState === TOOL_VIEW_STATES.ENTERING ||
          toolState.toolViewState === TOOL_VIEW_STATES.INSPECTING)
      ) {
        event.preventDefault()
        event.stopPropagation()
        toolState.requestToolViewExit()
        return
      }

      if (
        event.code === 'Escape' &&
        toolState.toolViewState === TOOL_VIEW_STATES.EXITING
      ) {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      if (
        event.code === 'Escape' &&
        (interactionState.workstationPhase === WORKSTATION_PHASES.ENTERING ||
          interactionState.workstationPhase === WORKSTATION_PHASES.FOCUSED)
      ) {
        event.preventDefault()
        event.stopPropagation()
        toolState.resetToolState()
        trainingState.resetTraining()
        interactionState.requestWorkstationExit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleWorkstationExit = () => {
    resetToolState()
    resetTraining()
    requestWorkstationExit()
  }

  const handleBeginTraining = () => {
    resetToolState()
    beginRJ45Training()
  }

  const handleRestartModule = () => {
    resetToolState()
    restartRJ45Training()
  }

  const handleContinueProcedure = () => {
    resetToolState()
    continueRJ45Procedure()
  }

  const handleRestartStep = () => {
    const currentStep = useTrainingStore.getState().currentStep

    resetToolState()

    if (
      currentStep === RJ45_PROCEDURE_STEPS.SELECT_RJ45_CONNECTOR ||
      isConnectorInsertionStep(currentStep) ||
      currentStep === RJ45_PROCEDURE_STEPS.CONDUCTORS_INSERTED ||
      currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_4
    ) {
      restartConnectorInsertion()
      return
    }

    restartWireTrimming()
  }

  const handleReturnActiveTool = () => {
    const trainingState = useTrainingStore.getState()

    if (
      trainingState.currentStep ===
        RJ45_PROCEDURE_STEPS.POSITION_FOR_TRIM ||
      trainingState.currentStep === RJ45_PROCEDURE_STEPS.TRIM_WIRES ||
      trainingState.currentStep === RJ45_PROCEDURE_STEPS.TRIMMING
    ) {
      trainingState.restartWireTrimming()
    } else if (isConnectorInsertionStep(trainingState.currentStep)) {
      trainingState.restartConnectorInsertion()
    }

    returnActiveTool()
  }

  const handleActivateSelectedTool = () => {
    const toolId = useToolStore.getState().selectedToolId

    activateSelectedTool()
    handleToolActivated(toolId)
  }

  return (
    <>
      {canInteract && (
        <div className="interaction-prompt" role="status">
          Press <kbd>E</kbd> to interact
        </div>
      )}

      {workstationPhase === WORKSTATION_PHASES.ENTERING && (
        <div className="workstation-status" role="status">
          Preparing workstation...
        </div>
      )}

      {workstationPhase === WORKSTATION_PHASES.EXITING && (
        <div className="workstation-status" role="status">
          Returning to laboratory...
        </div>
      )}

      {toolViewState === TOOL_VIEW_STATES.ENTERING && selectedTool && (
        <div className="workstation-status" role="status">
          Inspecting {selectedTool.name}...
        </div>
      )}

      {toolViewState === TOOL_VIEW_STATES.EXITING && (
        <div className="workstation-status" role="status">
          Returning to workstation...
        </div>
      )}

      {workstationPhase === WORKSTATION_PHASES.FOCUSED && isTrainingMode && (
        <div className="training-overlay">
          {trainingStarted ? (
            <RJ45ProcedurePanel
              onContinue={handleContinueProcedure}
              onAlignConnector={startConnectorAlignment}
              onInsertConductors={startConductorInsertion}
              onRetryInsertion={retryConductorInsertion}
              onRestartStep={handleRestartStep}
              onRestartModule={handleRestartModule}
              onExit={handleWorkstationExit}
            />
          ) : (
            <section
              className="training-panel"
              role="dialog"
              aria-modal="false"
              aria-labelledby="training-title"
            >
              <h1 id="training-title">
                {activeWorkstation?.displayName ?? activeInteractable?.label}
              </h1>

              <div className="training-actions">
                <button type="button" onClick={handleBeginTraining}>
                  Begin Training
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={handleWorkstationExit}
                >
                  Exit
                </button>
              </div>
            </section>
          )}
        </div>
      )}

      {toolViewState === TOOL_VIEW_STATES.INSPECTING && selectedTool && (
        <aside className="tool-inspection-panel" aria-labelledby="tool-title">
          <span className="tool-panel-eyebrow">Tool Inspection</span>
          <h2 id="tool-title">{selectedTool.name}</h2>
          <p>{selectedTool.purpose}</p>
          <div className="tool-panel-actions">
            <button type="button" onClick={handleActivateSelectedTool}>
              Select Tool
            </button>
            <button
              type="button"
              className="secondary"
              onClick={requestToolViewExit}
            >
              Back
            </button>
          </div>
        </aside>
      )}

      {activeTool && (
        <div className="active-tool-hud" role="status">
          <span>Active Tool: {activeTool.name}</span>
          <button
            type="button"
            onClick={handleReturnActiveTool}
            disabled={toolViewState !== TOOL_VIEW_STATES.IDLE}
          >
            Return Tool
          </button>
        </div>
      )}
    </>
  )
}
