import { useEffect } from 'react'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import useTrainingStore from '../../store/useTrainingStore.js'
import RJ45Cable from './RJ45Cable.jsx'

export default function RJ45TrainingModule({
  isCableHovered,
  onCableHoverChange,
}) {
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const hasTemporarySession = useTrainingStore(
    (state) => state.activeModuleId !== null || state.trainingStarted,
  )
  const resetTraining = useTrainingStore((state) => state.resetTraining)

  useEffect(() => {
    if (
      workstationPhase !== WORKSTATION_PHASES.FOCUSED &&
      hasTemporarySession
    ) {
      resetTraining()
      onCableHoverChange?.(false)
    }
  }, [
    hasTemporarySession,
    onCableHoverChange,
    resetTraining,
    workstationPhase,
  ])

  return (
    <RJ45Cable
      isHovered={isCableHovered}
      onHoverChange={onCableHoverChange}
    />
  )
}
