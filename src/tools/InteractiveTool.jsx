import { Html } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import { Color } from 'three'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../store/useInteractionStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../store/useToolStore.js'
import useTrainingStore from '../store/useTrainingStore.js'
import { RJ45_PROCEDURE_STEPS } from '../modules/rj45/rj45Procedure.js'
import { TOOL_IDS } from './toolConfigs.js'

const highlightColor = new Color('#79bfff')

function isConnectorAssemblyStep(currentStep) {
  return [
    RJ45_PROCEDURE_STEPS.ALIGN_CONNECTOR,
    RJ45_PROCEDURE_STEPS.INSERT_CONDUCTORS,
    RJ45_PROCEDURE_STEPS.INSERTING_CONDUCTORS,
    RJ45_PROCEDURE_STEPS.VERIFY_INSERTION,
    RJ45_PROCEDURE_STEPS.CONDUCTORS_INSERTED,
    RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_4,
  ].includes(currentStep)
}

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
  const isProcedureAnimating = useTrainingStore(
    (state) => state.isProcedureAnimating,
  )
  const currentStep = useTrainingStore((state) => state.currentStep)
  const setHoveredTool = useToolStore((state) => state.setHoveredTool)
  const clearHoveredTool = useToolStore((state) => state.clearHoveredTool)
  const requestToolInspection = useToolStore(
    (state) => state.requestToolInspection,
  )
  const canInteract =
    workstationPhase === WORKSTATION_PHASES.FOCUSED &&
    isTrainingMode &&
    toolViewState === TOOL_VIEW_STATES.IDLE &&
    !isProcedureAnimating &&
    !activeToolId
  const isHovered = canInteract && hoveredToolId === tool.id
  const isActive = activeToolId === tool.id
  const hideWorkbenchConnector =
    tool.id === TOOL_IDS.RJ45_CONNECTOR &&
    isConnectorAssemblyStep(currentStep)

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

    const materialsToHighlight = new Set()

    group.current.traverse((object) => {
      const objectMaterials = Array.isArray(object.material)
        ? object.material
        : [object.material]

      objectMaterials.filter(Boolean).forEach((material) => {
        if (!material.emissive) {
          return
        }

        materialsToHighlight.add(material)
      })
    })

    materialsToHighlight.forEach((material) => {
      highlightedMaterials.current.push({
        material,
        emissive: material.emissive.clone(),
        emissiveIntensity: material.emissiveIntensity,
      })
      material.emissive.lerp(highlightColor, 0.28)
      material.emissiveIntensity = Math.max(material.emissiveIntensity, 0.4)
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
      visible={!isActive && !hideWorkbenchConnector}
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
