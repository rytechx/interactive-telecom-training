import { useEffect } from 'react'
import FiberProcedurePanel from '../modules/fiber/FiberProcedurePanel.jsx'
import {
  FIBER_PROCEDURE_STEPS,
} from '../modules/fiber/fiberProcedure.js'
import { getFiberToolConfig } from '../modules/fiber/fiberToolConfigs.js'
import useFiberTrainingStore from '../store/useFiberTrainingStore.js'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../store/useInteractionStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../store/useToolStore.js'
import { FIBER_WORKSTATION } from '../workstations/workstationConfigs.js'

const strippingSteps = [
  FIBER_PROCEDURE_STEPS.STRIP_OUTER_JACKET,
  FIBER_PROCEDURE_STEPS.STRIPPING_OUTER_JACKET,
  FIBER_PROCEDURE_STEPS.OUTER_JACKET_REMOVED,
  FIBER_PROCEDURE_STEPS.TASK_1_COMPLETE,
]

export default function FiberInteractionSystem() {
  const activeWorkstationId = useInteractionStore(
    (state) => state.activeInteractable?.id ?? null,
  )
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const isTrainingMode = useInteractionStore(
    (state) => state.isTrainingMode,
  )
  const requestWorkstationExit = useInteractionStore(
    (state) => state.requestWorkstationExit,
  )
  const trainingStarted = useFiberTrainingStore(
    (state) => state.trainingStarted,
  )
  const beginFiberTraining = useFiberTrainingStore(
    (state) => state.beginFiberTraining,
  )
  const restartFiberStep = useFiberTrainingStore(
    (state) => state.restartFiberStep,
  )
  const restartFiberTraining = useFiberTrainingStore(
    (state) => state.restartFiberTraining,
  )
  const resetFiberTraining = useFiberTrainingStore(
    (state) => state.resetFiberTraining,
  )
  const selectedToolId = useToolStore((state) => state.selectedToolId)
  const toolViewState = useToolStore((state) => state.toolViewState)
  const activateSelectedTool = useToolStore(
    (state) => state.activateSelectedTool,
  )
  const requestToolViewExit = useToolStore(
    (state) => state.requestToolViewExit,
  )
  const returnActiveTool = useToolStore((state) => state.returnActiveTool)
  const resetToolState = useToolStore((state) => state.resetToolState)
  const selectedTool = getFiberToolConfig(selectedToolId)
  const isFiberWorkstation =
    activeWorkstationId === FIBER_WORKSTATION.id

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code !== 'Escape' || event.repeat) {
        return
      }

      const interactionState = useInteractionStore.getState()

      if (
        interactionState.activeInteractable?.id !== FIBER_WORKSTATION.id ||
        interactionState.workstationPhase === WORKSTATION_PHASES.EXPLORATION
      ) {
        return
      }

      const toolState = useToolStore.getState()
      const fiberState = useFiberTrainingStore.getState()

      event.preventDefault()
      event.stopPropagation()

      if (toolState.activeToolId) {
        if (strippingSteps.includes(fiberState.currentStep)) {
          fiberState.restartFiberStep()
        }
        toolState.returnActiveTool()
        return
      }

      if (
        toolState.toolViewState === TOOL_VIEW_STATES.ENTERING ||
        toolState.toolViewState === TOOL_VIEW_STATES.INSPECTING
      ) {
        toolState.requestToolViewExit()
        return
      }

      if (toolState.toolViewState === TOOL_VIEW_STATES.EXITING) {
        return
      }

      toolState.resetToolState()
      fiberState.resetFiberTraining()
      interactionState.requestWorkstationExit()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleExit = () => {
    resetToolState()
    resetFiberTraining()
    requestWorkstationExit()
  }

  const handleBeginTraining = () => {
    resetToolState()
    beginFiberTraining()
  }

  const handleRestartStep = () => {
    resetToolState()
    restartFiberStep()
  }

  const handleRestartModule = () => {
    resetToolState()
    restartFiberTraining()
  }

  const handleReturnTool = () => {
    const fiberState = useFiberTrainingStore.getState()

    if (strippingSteps.includes(fiberState.currentStep)) {
      fiberState.restartFiberStep()
    }

    returnActiveTool()
  }

  const handleActivateTool = () => {
    const toolId = useToolStore.getState().selectedToolId

    activateSelectedTool()
    useFiberTrainingStore.getState().handleFiberToolActivated(toolId)
  }

  if (!isFiberWorkstation) {
    return null
  }

  return (
    <>
      {toolViewState === TOOL_VIEW_STATES.ENTERING && selectedTool && (
        <div className="workstation-status" role="status">
          Inspecting {selectedTool.name}...
        </div>
      )}

      {toolViewState === TOOL_VIEW_STATES.EXITING && (
        <div className="workstation-status" role="status">
          Returning to fiber workstation...
        </div>
      )}

      {workstationPhase === WORKSTATION_PHASES.FOCUSED && isTrainingMode && (
        <div className="training-overlay fiber-training-overlay">
          {trainingStarted &&
          toolViewState !== TOOL_VIEW_STATES.INSPECTING ? (
            <FiberProcedurePanel
              onRestartStep={handleRestartStep}
              onRestartModule={handleRestartModule}
              onReturnTool={handleReturnTool}
              onExit={handleExit}
            />
          ) : !trainingStarted ? (
            <section
              className="training-panel"
              role="dialog"
              aria-modal="false"
              aria-labelledby="fiber-training-title"
            >
              <h1 id="fiber-training-title">
                {FIBER_WORKSTATION.displayName}
              </h1>
              <p className="training-step">
                Prepare the fiber cable for fusion splicing using the correct
                technician tools.
              </p>
              <div className="training-actions">
                <button type="button" onClick={handleBeginTraining}>
                  Begin Training
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={handleExit}
                >
                  Exit
                </button>
              </div>
            </section>
          ) : null}
        </div>
      )}

      {toolViewState === TOOL_VIEW_STATES.INSPECTING && selectedTool && (
        <aside
          className="tool-inspection-panel fiber-tool-inspection"
          aria-labelledby="fiber-tool-title"
        >
          <span className="tool-panel-eyebrow">Fiber Tool Inspection</span>
          <h2 id="fiber-tool-title">{selectedTool.name}</h2>
          <p>{selectedTool.purpose}</p>
          <div className="tool-panel-actions">
            <button type="button" onClick={handleActivateTool}>
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
    </>
  )
}
