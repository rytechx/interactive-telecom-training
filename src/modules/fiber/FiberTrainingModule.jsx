import { useEffect } from 'react'
import useFiberTrainingStore from '../../store/useFiberTrainingStore.js'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import { FIBER_WORKSTATION } from '../../workstations/workstationConfigs.js'
import FiberCable from './FiberCable.jsx'
import FiberInteractiveTool from './FiberInteractiveTool.jsx'
import FiberSplicingStation from './FiberSplicingStation.jsx'
import FiberToolFocusController from './FiberToolFocusController.jsx'
import { FiberToolModel } from './FiberTools.jsx'
import { isFiberSplicingStep } from './fiberProcedure.js'
import { FIBER_TOOL_CONFIGS } from './fiberToolConfigs.js'

export default function FiberTrainingModule({
  hoveredObjectId,
  onHoveredObjectChange,
}) {
  const activeWorkstationId = useInteractionStore(
    (state) => state.activeInteractable?.id ?? null,
  )
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const hasTemporarySession = useFiberTrainingStore(
    (state) => state.activeModuleId !== null || state.trainingStarted,
  )
  const resetFiberTraining = useFiberTrainingStore(
    (state) => state.resetFiberTraining,
  )
  const currentStep = useFiberTrainingStore((state) => state.currentStep)
  const isSplicingStep = isFiberSplicingStep(currentStep)
  const isFiberFocused =
    activeWorkstationId === FIBER_WORKSTATION.id &&
    workstationPhase === WORKSTATION_PHASES.FOCUSED

  useEffect(() => {
    if (!isFiberFocused && hasTemporarySession) {
      resetFiberTraining()
      onHoveredObjectChange?.(null)
    }
  }, [
    hasTemporarySession,
    isFiberFocused,
    onHoveredObjectChange,
    resetFiberTraining,
  ])

  return (
    <>
      <group position={FIBER_WORKSTATION.interactionPosition}>
        <mesh position={[0, 0.914, 0]} receiveShadow>
          <boxGeometry args={[2.7, 0.018, 1.14]} />
          <meshStandardMaterial color="#1c2429" roughness={0.88} />
        </mesh>

        {!isSplicingStep && (
          <FiberCable
            hoveredObjectId={hoveredObjectId}
            onHoveredObjectChange={onHoveredObjectChange}
          />
        )}

        {isSplicingStep && (
          <FiberSplicingStation
            hoveredObjectId={hoveredObjectId}
            onHoveredObjectChange={onHoveredObjectChange}
          />
        )}

        {!isSplicingStep &&
          FIBER_TOOL_CONFIGS.map((tool) => (
            <FiberInteractiveTool key={tool.id} tool={tool}>
              <FiberToolModel
                toolId={tool.id}
                position={tool.restPosition}
                rotation={tool.restRotation}
                scale={tool.scale}
              />
            </FiberInteractiveTool>
          ))}

        <pointLight
          position={[0.25, 2.35, 0.35]}
          color="#e6f5ff"
          intensity={isFiberFocused ? 7 : 0}
          distance={4.4}
          decay={2}
          castShadow={false}
        />
      </group>
      <FiberToolFocusController />
    </>
  )
}
