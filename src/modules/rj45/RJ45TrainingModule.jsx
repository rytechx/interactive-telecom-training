import { useEffect } from 'react'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import useTrainingStore from '../../store/useTrainingStore.js'
import RJ45Cable from './RJ45Cable.jsx'

export default function RJ45TrainingModule({
  hoveredObjectId,
  onHoveredObjectChange,
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
      onHoveredObjectChange?.(null)
    }
  }, [
    hasTemporarySession,
    onHoveredObjectChange,
    resetTraining,
    workstationPhase,
  ])

  return (
    <RJ45Cable
      hoveredObjectId={hoveredObjectId}
      onHoveredObjectChange={onHoveredObjectChange}
    />
  )
}
