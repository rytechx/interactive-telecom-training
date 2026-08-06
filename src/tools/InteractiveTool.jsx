import { Html } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import { Color } from 'three'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../store/useInteractionStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../store/useToolStore.js'

const highlightColor = new Color('#79bfff')

export default function InteractiveTool({ tool, children }) {
  const group = useRef(null)
  const highlightedMaterials = useRef([])
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const isTrainingMode = useInteractionStore(
    (state) => state.isTrainingMode,
  )
  const hoveredToolId = useToolStore((state) => state.hoveredToolId)
  const activeToolId = useToolStore((state) => state.activeToolId)
  const toolViewState = useToolStore((state) => state.toolViewState)
  const setHoveredTool = useToolStore((state) => state.setHoveredTool)
  const clearHoveredTool = useToolStore((state) => state.clearHoveredTool)
  const requestToolInspection = useToolStore(
    (state) => state.requestToolInspection,
  )
  const canInteract =
    workstationPhase === WORKSTATION_PHASES.FOCUSED &&
    isTrainingMode &&
    toolViewState === TOOL_VIEW_STATES.IDLE &&
    !activeToolId
  const isHovered = canInteract && hoveredToolId === tool.id
  const isActive = activeToolId === tool.id

  useEffect(() => {
    highlightedMaterials.current.forEach(
      ({ material, emissive, emissiveIntensity }) => {
        material.emissive.copy(emissive)
        material.emissiveIntensity = emissiveIntensity
      },
    )
    highlightedMaterials.current = []

    if (!isHovered || !group.current) {
      return undefined
    }

    group.current.traverse((object) => {
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material]

      materials.filter(Boolean).forEach((material) => {
        if (!material.emissive) {
          return
        }

        highlightedMaterials.current.push({
          material,
          emissive: material.emissive.clone(),
          emissiveIntensity: material.emissiveIntensity,
        })
        material.emissive.lerp(highlightColor, 0.28)
        material.emissiveIntensity = Math.max(material.emissiveIntensity, 0.4)
      })
    })

    return () => {
      highlightedMaterials.current.forEach(
        ({ material, emissive, emissiveIntensity }) => {
          material.emissive.copy(emissive)
          material.emissiveIntensity = emissiveIntensity
        },
      )
      highlightedMaterials.current = []
    }
  }, [isHovered])

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
      ref={group}
      visible={!isActive}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      {children}
      {isHovered && (
        <Html
          position={[
            tool.workbenchPosition[0],
            tool.workbenchPosition[1] + 0.35,
            tool.workbenchPosition[2],
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
