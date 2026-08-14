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
        <group>
          <mesh position={[0, 0.915, 0]} receiveShadow>
            <boxGeometry args={[2.88, 0.03, 1.18]} />
            <meshStandardMaterial color="#182126" roughness={0.94} />
          </mesh>
          <mesh position={[0, 0.934, 0]} receiveShadow>
            <boxGeometry args={[2.82, 0.008, 1.12]} />
            <meshStandardMaterial color="#263137" roughness={0.9} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh
              key={`mat-side-${side}`}
              position={[side * 1.415, 0.938, 0]}
              receiveShadow
            >
              <boxGeometry args={[0.012, 0.008, 1.1]} />
              <meshStandardMaterial color="#3c4b51" roughness={0.82} />
            </mesh>
          ))}
          {[-1, 1].map((side) => (
            <mesh
              key={`mat-edge-${side}`}
              position={[0, 0.938, side * 0.555]}
              receiveShadow
            >
              <boxGeometry args={[2.82, 0.008, 0.012]} />
              <meshStandardMaterial color="#3c4b51" roughness={0.82} />
            </mesh>
          ))}
          <mesh position={[1.31, 0.947, 0.49]}>
            <cylinderGeometry args={[0.025, 0.025, 0.012, 16]} />
            <meshStandardMaterial
              color="#7b8b90"
              metalness={0.56}
              roughness={0.36}
            />
          </mesh>
        </group>

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
          position={[0.18, 2.25, 0.28]}
          color="#edf8f6"
          intensity={isFiberFocused ? 3.2 : 0}
          distance={3.8}
          decay={2}
          castShadow={false}
        />
      </group>
      <FiberToolFocusController />
    </>
  )
}
