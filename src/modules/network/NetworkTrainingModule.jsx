import { useEffect } from 'react'
import Interactable from '../../interaction/Interactable.jsx'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import useNetworkTrainingStore from '../../store/useNetworkTrainingStore.js'
import { NETWORK_WORKSTATION } from '../../workstations/workstationConfigs.js'
import NetworkRackCameraController from './NetworkRackCameraController.jsx'
import NetworkRackWorkstation from './NetworkRackWorkstation.jsx'

export default function NetworkTrainingModule({
  hoveredObjectId,
  onHoveredObjectChange,
}) {
  const activeWorkstationId = useInteractionStore(
    (state) => state.activeInteractable?.id ?? null,
  )
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const hasTemporarySession = useNetworkTrainingStore(
    (state) => state.activeModuleId !== null || state.networkTrainingStarted,
  )
  const resetNetworkTraining = useNetworkTrainingStore(
    (state) => state.resetNetworkTraining,
  )
  const isNetworkFocused =
    activeWorkstationId === NETWORK_WORKSTATION.id &&
    workstationPhase === WORKSTATION_PHASES.FOCUSED

  useEffect(() => {
    if (!isNetworkFocused && hasTemporarySession) {
      resetNetworkTraining()
      onHoveredObjectChange?.(null)
    }
  }, [
    hasTemporarySession,
    isNetworkFocused,
    onHoveredObjectChange,
    resetNetworkTraining,
  ])

  return (
    <>
      <Interactable
        id={NETWORK_WORKSTATION.id}
        label={NETWORK_WORKSTATION.displayName}
        position={NETWORK_WORKSTATION.interactionPosition}
        interactionDistance={2.4}
      >
        <NetworkRackWorkstation
          position={NETWORK_WORKSTATION.interactionPosition}
          hoveredObjectId={hoveredObjectId}
          onHoveredObjectChange={onHoveredObjectChange}
        />
      </Interactable>
      <NetworkRackCameraController />
    </>
  )
}
