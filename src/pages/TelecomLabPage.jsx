import { lazy, Suspense, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LabErrorBoundary from '../components/layout/LabErrorBoundary.jsx'
import useAppSessionStore from '../store/useAppSessionStore.js'
import useFiberTrainingStore from '../store/useFiberTrainingStore.js'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../store/useInteractionStore.js'
import useNetworkTrainingStore from '../store/useNetworkTrainingStore.js'
import useToolStore from '../store/useToolStore.js'
import useTrainingStore from '../store/useTrainingStore.js'
import TelecomIcon from '../ui/TelecomIcon.jsx'
import { getTrainingModule } from '../app/trainingModules.js'

const TelecomLabScene = lazy(
  () => import('../scenes/TelecomLab/TelecomLabScene.jsx'),
)

function resetLabSession() {
  useTrainingStore.getState().resetTraining()
  useFiberTrainingStore.getState().resetFiberTraining()
  useNetworkTrainingStore.getState().resetNetworkTraining()
  useToolStore.getState().resetToolState()
  useInteractionStore.getState().resetInteraction()
}

function LabLoadingState() {
  return (
    <div className="lab-loading-state" role="status">
      <span className="lab-loading-brand">TeleSim 3D</span>
      <div className="lab-loading-indicator"><i /><i /><i /></div>
      <strong>Preparing Virtual Telecom Laboratory...</strong>
      <small>Loading interactive equipment and physics simulation</small>
    </div>
  )
}

export default function TelecomLabPage() {
  const navigate = useNavigate()
  const [helpVisible, setHelpVisible] = useState(false)
  const [leaveConfirmationVisible, setLeaveConfirmationVisible] =
    useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const selectedTrainingModule = useAppSessionStore(
    (state) => state.selectedTrainingModule,
  )
  const clearTrainingObjective = useAppSessionStore(
    (state) => state.clearTrainingObjective,
  )
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const activeWorkstationId = useInteractionStore(
    (state) => state.activeInteractable?.id ?? null,
  )
  const selectedModule = getTrainingModule(selectedTrainingModule)
  const workstationActive =
    workstationPhase !== WORKSTATION_PHASES.EXPLORATION

  useEffect(() => {
    if (
      selectedModule &&
      activeWorkstationId === selectedModule.workstationId &&
      workstationActive
    ) {
      clearTrainingObjective()
    }
  }, [
    activeWorkstationId,
    clearTrainingObjective,
    selectedModule,
    workstationActive,
  ])

  useEffect(
    () => () => {
      resetLabSession()
    },
    [],
  )

  const returnToDashboard = () => {
    if (workstationActive) {
      setLeaveConfirmationVisible(true)
      return
    }

    clearTrainingObjective()
    navigate('/')
  }

  const confirmReturnToDashboard = () => {
    resetLabSession()
    clearTrainingObjective()
    navigate('/')
  }

  const errorFallback = (
    <div className="lab-error-state" role="alert">
      <TelecomIcon name="lab" size={34} />
      <h1>The virtual laboratory could not be loaded.</h1>
      <p>Retry the simulation or return to the dashboard.</p>
      <div>
        <button type="button" onClick={() => setRetryKey((value) => value + 1)}>
          Retry
        </button>
        <button type="button" className="secondary" onClick={confirmReturnToDashboard}>
          Return to Dashboard
        </button>
      </div>
    </div>
  )

  return (
    <div className="telecom-lab-page">
      <LabErrorBoundary resetKey={retryKey} fallback={errorFallback}>
        <Suspense fallback={<LabLoadingState />}>
          <TelecomLabScene key={retryKey} />
        </Suspense>
      </LabErrorBoundary>

      <nav className="lab-page-controls" aria-label="Laboratory navigation">
        <button type="button" onClick={returnToDashboard}>
          <span aria-hidden="true">←</span>
          Back to Dashboard
        </button>
        <button
          type="button"
          className={helpVisible ? 'is-active' : ''}
          onClick={() => setHelpVisible((visible) => !visible)}
          aria-expanded={helpVisible}
        >
          <TelecomIcon name="help" size={17} />
          Help
        </button>
      </nav>

      {selectedModule && (
        <aside className="lab-objective-panel" aria-live="polite">
          <span>Training Objective</span>
          <strong>{selectedModule.title}</strong>
          <p>{selectedModule.objective}</p>
        </aside>
      )}

      {helpVisible && (
        <aside className="lab-help-panel">
          <strong>Laboratory Controls</strong>
          <span>Click the 3D view to enable mouse look.</span>
          <span>Use WASD to move and Shift to run.</span>
          <span>Press E near a workstation to interact.</span>
          <span>Press Escape to release controls or exit a focused view.</span>
        </aside>
      )}

      {leaveConfirmationVisible && (
        <div className="lab-leave-confirmation" role="dialog" aria-modal="true" aria-labelledby="leave-lab-title">
          <div>
            <span>Training in Progress</span>
            <h2 id="leave-lab-title">Return to the dashboard?</h2>
            <p>The current workstation procedure will be reset.</p>
            <footer>
              <button type="button" onClick={() => setLeaveConfirmationVisible(false)}>
                Stay in Laboratory
              </button>
              <button type="button" className="secondary" onClick={confirmReturnToDashboard}>
                Return to Dashboard
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
