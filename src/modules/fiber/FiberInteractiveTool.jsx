import { Html } from '@react-three/drei'
import { useEffect } from 'react'
import { MeshBasicMaterial, RingGeometry } from 'three'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import useFiberTrainingStore from '../../store/useFiberTrainingStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../../store/useToolStore.js'
import { FIBER_WORKSTATION } from '../../workstations/workstationConfigs.js'
import { getFiberProcedureStep } from './fiberProcedure.js'

const highlightGeometry = new RingGeometry(0.13, 0.16, 28)
const expectedMaterial = new MeshBasicMaterial({
  color: '#78d6f0',
  transparent: true,
  opacity: 0.72,
  depthWrite: false,
  toneMapped: false,
})
const hoverMaterial = new MeshBasicMaterial({
  color: '#d9f5ff',
  transparent: true,
  opacity: 0.82,
  depthWrite: false,
  toneMapped: false,
})

function getHighlightScale(toolId) {
  if (toolId === 'fusion-splicer') {
    return [2.7, 2.05, 1]
  }

  if (toolId === 'fiber-cleaver') {
    return [1.8, 1.45, 1]
  }

  if (toolId === 'fiber-cleaning-pad') {
    return [1.65, 1.3, 1]
  }

  return [1.25, 1.65, 1]
}

function getToolHitboxSize(toolId) {
  if (toolId === 'fusion-splicer') {
    return [0.9, 0.48, 0.64]
  }

  if (toolId === 'fiber-cleaver') {
    return [0.58, 0.34, 0.48]
  }

  if (toolId === 'fiber-cleaning-pad') {
    return [0.48, 0.2, 0.38]
  }

  if (toolId === 'fiber-protection-sleeve') {
    return [0.65, 0.2, 0.26]
  }

  return [0.5, 0.34, 0.86]
}

export default function FiberInteractiveTool({ tool, children }) {
  const activeWorkstationId = useInteractionStore(
    (state) => state.activeInteractable?.id ?? null,
  )
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const isTrainingMode = useInteractionStore(
    (state) => state.isTrainingMode,
  )
  const currentStep = useFiberTrainingStore((state) => state.currentStep)
  const isProcedureAnimating = useFiberTrainingStore(
    (state) => state.isProcedureAnimating,
  )
  const hoveredToolId = useToolStore((state) => state.hoveredToolId)
  const activeToolId = useToolStore((state) => state.activeToolId)
  const toolViewState = useToolStore((state) => state.toolViewState)
  const setHoveredTool = useToolStore((state) => state.setHoveredTool)
  const clearHoveredTool = useToolStore((state) => state.clearHoveredTool)
  const requestToolInspection = useToolStore(
    (state) => state.requestToolInspection,
  )
  const procedureStep = getFiberProcedureStep(currentStep)
  const expectedToolId =
    procedureStep.acceptedAction === 'select-tool'
      ? procedureStep.acceptedToolId
      : null
  const canInteract =
    activeWorkstationId === FIBER_WORKSTATION.id &&
    workstationPhase === WORKSTATION_PHASES.FOCUSED &&
    isTrainingMode &&
    Boolean(expectedToolId) &&
    toolViewState === TOOL_VIEW_STATES.IDLE &&
    !activeToolId &&
    !isProcedureAnimating
  const isHovered = canInteract && hoveredToolId === tool.id
  const isExpected = canInteract && expectedToolId === tool.id
  const isActive = activeToolId === tool.id

  useEffect(() => {
    if (!canInteract) {
      clearHoveredTool(tool.id)
    }
  }, [canInteract, clearHoveredTool, tool.id])

  useEffect(
    () => () => {
      clearHoveredTool(tool.id)
    },
    [clearHoveredTool, tool.id],
  )

  const handlePointerEnter = (event) => {
    if (!canInteract) {
      return
    }

    event.stopPropagation()
    setHoveredTool(tool.id)
  }

  const handlePointerLeave = (event) => {
    event.stopPropagation()
    clearHoveredTool(tool.id)
  }

  const handleClick = (event) => {
    if (!canInteract) {
      return
    }

    event.stopPropagation()
    clearHoveredTool(tool.id)
    requestToolInspection(tool.id)
  }

  return (
    <group
      visible={!isActive}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      <mesh
        position={[
          tool.restPosition[0],
          tool.restPosition[1] + 0.08,
          tool.restPosition[2],
        ]}
      >
        <boxGeometry args={getToolHitboxSize(tool.id)} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {(isExpected || isHovered) && (
        <mesh
          geometry={highlightGeometry}
          material={isHovered ? hoverMaterial : expectedMaterial}
          position={[tool.restPosition[0], 0.927, tool.restPosition[2]]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={getHighlightScale(tool.id)}
          renderOrder={3}
        />
      )}
      {children}
      {isHovered && (
        <Html
          position={[
            tool.restPosition[0],
            tool.restPosition[1] + 0.34,
            tool.restPosition[2],
          ]}
          center
        >
          <div className="tool-tooltip" role="tooltip">
            {tool.name}
          </div>
        </Html>
      )}
    </group>
  )
}
