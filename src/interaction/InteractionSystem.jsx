import { useEffect } from 'react'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../store/useInteractionStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../store/useToolStore.js'
import { getToolConfig } from '../tools/toolConfigs.js'
import { getWorkstationConfig } from '../workstations/workstationConfigs.js'

function releasePointerLock() {
  if (document.pointerLockElement) {
    document.exitPointerLock()
  }
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
  const trainingStarted = useInteractionStore(
    (state) => state.trainingStarted,
  )
  const beginTraining = useInteractionStore((state) => state.beginTraining)
  const requestWorkstationExit = useInteractionStore(
    (state) => state.requestWorkstationExit,
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
    requestWorkstationExit()
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
          <section
            className="training-panel"
            role="dialog"
            aria-modal="false"
            aria-labelledby="training-title"
          >
            <h1 id="training-title">
              {activeWorkstation?.displayName ?? activeInteractable?.label}
            </h1>

            {trainingStarted && (
              <p className="training-step">
                Step 1: Inspect the tools on the workbench.
              </p>
            )}

            <div className="training-actions">
              <button
                type="button"
                onClick={beginTraining}
                disabled={trainingStarted}
              >
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
        </div>
      )}

      {toolViewState === TOOL_VIEW_STATES.INSPECTING && selectedTool && (
        <aside className="tool-inspection-panel" aria-labelledby="tool-title">
          <span className="tool-panel-eyebrow">Tool Inspection</span>
          <h2 id="tool-title">{selectedTool.name}</h2>
          <p>{selectedTool.purpose}</p>
          <div className="tool-panel-actions">
            <button type="button" onClick={activateSelectedTool}>
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
            onClick={returnActiveTool}
            disabled={toolViewState !== TOOL_VIEW_STATES.IDLE}
          >
            Return Tool
          </button>
        </div>
      )}
    </>
  )
}
