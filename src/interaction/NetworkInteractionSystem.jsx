import { useEffect } from 'react'
import NetworkProcedurePanel from '../modules/network/NetworkProcedurePanel.jsx'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../store/useInteractionStore.js'
import useNetworkTrainingStore from '../store/useNetworkTrainingStore.js'
import { NETWORK_WORKSTATION } from '../workstations/workstationConfigs.js'

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
  const beginNetworkTraining = useNetworkTrainingStore(
    (state) => state.beginNetworkTraining,
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

  if (!isNetworkWorkstation) {
    return null
  }

  return workstationPhase === WORKSTATION_PHASES.FOCUSED && isTrainingMode ? (
    <div className="training-overlay network-training-overlay">
      {networkTrainingStarted ? (
        <NetworkProcedurePanel
          onContinue={continueNetworkProcedure}
          onPowerOn={startNetworkPowerOn}
          onRestartStep={restartNetworkStep}
          onRestartModule={restartNetworkTraining}
          onExit={handleExit}
        />
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
            verify physical network links.
          </p>
          <div className="training-actions">
            <button type="button" onClick={beginNetworkTraining}>
              Begin Training
            </button>
            <button type="button" className="secondary" onClick={handleExit}>
              Exit
            </button>
          </div>
        </section>
      )}
    </div>
  ) : null
}
