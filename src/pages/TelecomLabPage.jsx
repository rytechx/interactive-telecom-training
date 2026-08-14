import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LabErrorBoundary from '../components/layout/LabErrorBoundary.jsx'
import LabModuleControls from '../components/layout/LabModuleControls.jsx'
import useAppSessionStore from '../store/useAppSessionStore.js'
import useFiberTrainingStore from '../store/useFiberTrainingStore.js'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../store/useInteractionStore.js'
import useNetworkTrainingStore from '../store/useNetworkTrainingStore.js'
import useSettingsStore from '../store/useSettingsStore.js'
import useToolStore from '../store/useToolStore.js'
import useTrainingStore from '../store/useTrainingStore.js'
import TelecomIcon from '../ui/TelecomIcon.jsx'
import { getTrainingModule } from '../app/trainingModules.js'
import { isWebGLAvailable } from '../utils/webglSupport.js'

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
  const labPageRef = useRef(null)
  const [helpVisible, setHelpVisible] = useState(false)
  const [fullscreenVisible, setFullscreenVisible] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [leaveConfirmationVisible, setLeaveConfirmationVisible] =
    useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [webGLAvailable] = useState(isWebGLAvailable)
  const selectedTrainingModule = useAppSessionStore(
    (state) => state.selectedTrainingModule,
  )
  const clearTrainingObjective = useAppSessionStore(
    (state) => state.clearTrainingObjective,
  )
  const showControlGuide = useSettingsStore((state) => state.showControlGuide)
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

  useEffect(() => {
    const labElement = labPageRef.current

    return () => {
      if (document.pointerLockElement) {
        document.exitPointerLock()
      }

      if (document.fullscreenElement === labElement) {
        void document.exitFullscreen().catch(() => {})
      }

      resetLabSession()
    }
  }, [])

  useEffect(() => {
    if (!helpVisible && !leaveConfirmationVisible) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key !== 'Escape') return

      if (leaveConfirmationVisible) {
        setLeaveConfirmationVisible(false)
      } else {
        setHelpVisible(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [helpVisible, leaveConfirmationVisible])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === labPageRef.current)
    }

    setFullscreenVisible(
      Boolean(document.fullscreenEnabled && labPageRef.current?.requestFullscreen),
    )
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await labPageRef.current?.requestFullscreen()
      }
    } catch {
      setFullscreenVisible(false)
    }
  }

  const releaseBrowserControls = async () => {
    if (document.pointerLockElement) {
      document.exitPointerLock()
    }

    if (document.fullscreenElement === labPageRef.current) {
      try {
        await document.exitFullscreen()
      } catch {
        setIsFullscreen(false)
      }
    }
  }

  const returnToDashboard = async () => {
    if (workstationActive) {
      setLeaveConfirmationVisible(true)
      return
    }

    await releaseBrowserControls()
    clearTrainingObjective()
    navigate('/')
  }

  const confirmReturnToDashboard = async () => {
    await releaseBrowserControls()
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
        <button
          type="button"
          className="secondary"
          onClick={() => void confirmReturnToDashboard()}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  )
  const webGLFallback = (
    <div className="lab-error-state" role="alert">
      <TelecomIcon name="lab" size={34} />
      <h1>3D graphics are unavailable in this browser or device.</h1>
      <p>Use a current Chromium browser with hardware acceleration enabled.</p>
      <div>
        <button
          type="button"
          onClick={() => void confirmReturnToDashboard()}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  )

  return (
    <div
      ref={labPageRef}
      className={`telecom-lab-page${
        workstationActive ? ' is-workstation-active' : ''
      }`}
    >
      {webGLAvailable ? (
        <LabErrorBoundary resetKey={retryKey} fallback={errorFallback}>
          <Suspense fallback={<LabLoadingState />}>
            <TelecomLabScene key={retryKey} />
          </Suspense>
        </LabErrorBoundary>
      ) : webGLFallback}

      <LabModuleControls
        fullscreenVisible={fullscreenVisible}
        helpVisible={helpVisible}
        isFullscreen={isFullscreen}
        showHelp={showControlGuide}
        onBack={returnToDashboard}
        onToggleFullscreen={toggleFullscreen}
        onToggleHelp={() => setHelpVisible((visible) => !visible)}
      />

      {selectedModule && (
        <aside className="lab-objective-panel" aria-live="polite">
          <span>Training Objective</span>
          <strong>{selectedModule.title}</strong>
          <p>{selectedModule.objective}</p>
        </aside>
      )}

      {showControlGuide && helpVisible && (
        <aside id="lab-help-panel" className="lab-help-panel" aria-label="Laboratory help">
          <strong>Laboratory Controls</strong>
          <span>Click the 3D view to enable mouse look.</span>
          <span>Use WASD to move and Shift to run.</span>
          <span>Press E near a workstation to interact.</span>
          <span>Press Escape to release controls or exit a focused view.</span>
        </aside>
      )}

      <aside className="lab-display-advisory" role="status">
        <strong>Desktop or laptop display recommended</strong>
        <span>TeleSim 3D training is optimized for a larger display and keyboard.</span>
      </aside>

      {leaveConfirmationVisible && (
        <div className="lab-leave-confirmation" role="dialog" aria-modal="true" aria-labelledby="leave-lab-title">
          <div>
            <span>Training in Progress</span>
            <h2 id="leave-lab-title">Return to the dashboard?</h2>
            <p>The current workstation procedure will be reset.</p>
            <footer>
              <button
                type="button"
                autoFocus
                onClick={() => setLeaveConfirmationVisible(false)}
              >
                Stay in Laboratory
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => void confirmReturnToDashboard()}
              >
                Return to Dashboard
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
