import { useEffect } from 'react'
import NetworkInspectionToolbar from '../modules/network/NetworkInspectionToolbar.jsx'
import NetworkTerminal from '../modules/network/NetworkTerminal.jsx'
import NetworkProcedurePanel from '../modules/network/NetworkProcedurePanel.jsx'
import WorkstationIPv4Settings from '../modules/network/WorkstationIPv4Settings.jsx'
import NetworkTroubleshooting from '../modules/network/troubleshooting/NetworkTroubleshooting.jsx'
import { NETWORK_TROUBLESHOOTING_MODES } from '../modules/network/troubleshooting/troubleshootingScenarios.js'
import { isNetworkCablingStep } from '../modules/network/networkProcedure.js'
import { NETWORK_TERMINAL_TYPES } from '../modules/network/terminalCommands.js'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../store/useInteractionStore.js'
import useNetworkTrainingStore, {
  NETWORK_OVERLAYS,
} from '../store/useNetworkTrainingStore.js'
import useTrainingPersistenceStore from '../store/useTrainingPersistenceStore.js'
import { NETWORK_WORKSTATION } from '../workstations/workstationConfigs.js'

function releasePointerLock() {
  if (document.pointerLockElement) {
    document.exitPointerLock()
  }
}

export default function NetworkInteractionSystem() {
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
  const networkTrainingStarted = useNetworkTrainingStore(
    (state) => state.networkTrainingStarted,
  )
  const networkOverlay = useNetworkTrainingStore(
    (state) => state.networkOverlay,
  )
  const networkCurrentStep = useNetworkTrainingStore(
    (state) => state.networkCurrentStep,
  )
  const troubleshootingMode = useNetworkTrainingStore(
    (state) => state.troubleshootingMode,
  )
  const isProcedureAnimating = useNetworkTrainingStore(
    (state) => state.isProcedureAnimating,
  )
  const beginNetworkTraining = useNetworkTrainingStore(
    (state) => state.beginNetworkTraining,
  )
  const startAttempt = useTrainingPersistenceStore(
    (state) => state.startAttempt,
  )
  const attemptStartStatus = useTrainingPersistenceStore(
    (state) => state.startStatus.network,
  )
  const attemptStartError = useTrainingPersistenceStore(
    (state) => state.startErrors.network,
  )
  const continueNetworkProcedure = useNetworkTrainingStore(
    (state) => state.continueNetworkProcedure,
  )
  const startNetworkPowerOn = useNetworkTrainingStore(
    (state) => state.startNetworkPowerOn,
  )
  const restartNetworkStep = useNetworkTrainingStore(
    (state) => state.restartNetworkStep,
  )
  const restartNetworkTraining = useNetworkTrainingStore(
    (state) => state.restartNetworkTraining,
  )
  const resetNetworkTraining = useNetworkTrainingStore(
    (state) => state.resetNetworkTraining,
  )
  const closeNetworkOverlay = useNetworkTrainingStore(
    (state) => state.closeNetworkOverlay,
  )
  const openTroubleshootingSelection = useNetworkTrainingStore(
    (state) => state.openTroubleshootingSelection,
  )
  const exitTroubleshooting = useNetworkTrainingStore(
    (state) => state.exitTroubleshooting,
  )
  const requestNetworkInspectionView = useNetworkTrainingStore(
    (state) => state.requestNetworkInspectionView,
  )
  const isNetworkWorkstation =
    activeWorkstationId === NETWORK_WORKSTATION.id

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code !== 'Escape' || event.repeat) {
        return
      }

      const interactionState = useInteractionStore.getState()

      if (
        interactionState.activeInteractable?.id !== NETWORK_WORKSTATION.id ||
        interactionState.workstationPhase === WORKSTATION_PHASES.EXPLORATION
      ) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      const networkState = useNetworkTrainingStore.getState()

      if (networkState.isProcedureAnimating) {
        return
      }

      if (networkState.networkOverlay) {
        networkState.closeNetworkOverlay()
        return
      }

      if (
        networkState.troubleshootingMode !==
        NETWORK_TROUBLESHOOTING_MODES.INACTIVE
      ) {
        networkState.exitTroubleshooting()
        return
      }

      networkState.resetNetworkTraining()
      interactionState.requestWorkstationExit()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleExit = () => {
    resetNetworkTraining()
    requestWorkstationExit()
  }

  const handleBeginTraining = async () => {
    const attempt = await startAttempt('network')

    if (attempt) {
      beginNetworkTraining()
    }
  }

  const handleStartTroubleshooting = () => {
    releasePointerLock()
    openTroubleshootingSelection()
  }

  const handleReturnToLaboratory = () => {
    exitTroubleshooting()
    requestWorkstationExit()
  }

  const handleRestartStep = () => {
    restartNetworkStep()
    requestNetworkInspectionView('reset')
  }

  const handleRestartModule = async () => {
    const attempt = await startAttempt('network')

    if (attempt) {
      restartNetworkTraining()
      requestNetworkInspectionView('reset')
    }
  }

  if (!isNetworkWorkstation) {
    return null
  }

  const troubleshootingOpen =
    troubleshootingMode !== NETWORK_TROUBLESHOOTING_MODES.INACTIVE
  const assessmentOpen = [
    NETWORK_TROUBLESHOOTING_MODES.SCENARIO_ASSESSMENT,
    NETWORK_TROUBLESHOOTING_MODES.FINAL_ASSESSMENT,
  ].includes(troubleshootingMode)

  return workstationPhase === WORKSTATION_PHASES.FOCUSED && isTrainingMode ? (
    <div
      className={`training-overlay network-training-overlay${
        isNetworkCablingStep(networkCurrentStep) ? ' is-cabling-step' : ''
      }${assessmentOpen ? ' is-assessment' : ''}`}
    >
      {networkTrainingStarted ? (
        <>
          {troubleshootingOpen ? (
            <NetworkTroubleshooting
              onRestartNetworkModule={handleRestartModule}
              onReturnToLaboratory={handleReturnToLaboratory}
            />
          ) : (
            <NetworkProcedurePanel
              onContinue={continueNetworkProcedure}
              onPowerOn={startNetworkPowerOn}
              onRestartStep={handleRestartStep}
              onRestartModule={handleRestartModule}
              onStartTroubleshooting={handleStartTroubleshooting}
              onExit={handleExit}
            />
          )}
          {!networkOverlay && !assessmentOpen && (
            <NetworkInspectionToolbar
              disabled={isProcedureAnimating}
              onSelectView={requestNetworkInspectionView}
            />
          )}
          {networkOverlay === NETWORK_OVERLAYS.PC_SETTINGS && (
            <WorkstationIPv4Settings />
          )}
          {networkOverlay === NETWORK_OVERLAYS.ROUTER_TERMINAL && (
            <NetworkTerminal
              terminalType={NETWORK_TERMINAL_TYPES.ROUTER}
              title="Router Console"
              onClose={closeNetworkOverlay}
            />
          )}
          {networkOverlay === NETWORK_OVERLAYS.SWITCH_TERMINAL && (
            <NetworkTerminal
              terminalType={NETWORK_TERMINAL_TYPES.SWITCH}
              title="Managed Switch Console"
              onClose={closeNetworkOverlay}
            />
          )}
          {networkOverlay === NETWORK_OVERLAYS.WORKSTATION_TERMINAL && (
            <NetworkTerminal
              terminalType={NETWORK_TERMINAL_TYPES.WORKSTATION}
              title="Workstation Command Prompt"
              onClose={closeNetworkOverlay}
            />
          )}
        </>
      ) : (
        <section
          className="training-panel network-training-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="network-training-title"
        >
          <h1 id="network-training-title">
            Network Device Installation &amp; Troubleshooting
          </h1>
          <p className="training-step">
            Install rack equipment, connect power and Ethernet cabling, then
            configure and verify the logical IPv4 network.
          </p>
          <div className="training-actions">
            <button
              type="button"
              onClick={handleBeginTraining}
              disabled={attemptStartStatus === 'saving'}
            >
              {attemptStartStatus === 'saving'
                ? 'Starting...'
                : 'Begin Training'}
            </button>
            <button type="button" className="secondary" onClick={handleExit}>
              Exit
            </button>
          </div>
          {attemptStartError && (
            <p className="training-persistence-error" role="alert">
              {attemptStartError}
            </p>
          )}
        </section>
      )}
    </div>
  ) : null
}
