import { Html } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import { Color, MeshStandardMaterial, RingGeometry } from 'three'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../store/useInteractionStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../store/useToolStore.js'
import useTrainingStore from '../store/useTrainingStore.js'
import {
  getRJ45ProcedureStep,
  RJ45_PROCEDURE_STEPS,
} from '../modules/rj45/rj45Procedure.js'
import { TOOL_IDS } from './toolConfigs.js'

const highlightColor = new Color('#79bfff')
const toolHighlightGeometry = new RingGeometry(0.12, 0.15, 28)
const toolHighlightMaterial = new MeshStandardMaterial({
  color: '#86cfe1',
  emissive: '#326f80',
  emissiveIntensity: 0.4,
  transparent: true,
  opacity: 0.52,
  roughness: 0.38,
  toneMapped: false,
})

function getHighlightScale(toolId) {
  if (toolId === TOOL_IDS.CRIMPING_TOOL) {
    return [1.5, 1.5, 1]
  }

  if (toolId === TOOL_IDS.CABLE_TESTER) {
    return [1.25, 1.25, 1]
  }

  if (toolId === TOOL_IDS.RJ45_CONNECTOR) {
    return [0.62, 0.62, 1]
  }

  return [1, 1, 1]
}

function isConnectorAssemblyStep(currentStep) {
  return [
    RJ45_PROCEDURE_STEPS.ALIGN_CONNECTOR,
    RJ45_PROCEDURE_STEPS.INSERT_CONDUCTORS,
    RJ45_PROCEDURE_STEPS.INSERTING_CONDUCTORS,
    RJ45_PROCEDURE_STEPS.VERIFY_INSERTION,
    RJ45_PROCEDURE_STEPS.CONDUCTORS_INSERTED,
    RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_4,
    RJ45_PROCEDURE_STEPS.SELECT_CRIMPING_TOOL,
    RJ45_PROCEDURE_STEPS.POSITION_CONNECTOR_IN_CRIMPER,
    RJ45_PROCEDURE_STEPS.READY_TO_CRIMP,
    RJ45_PROCEDURE_STEPS.CRIMPING,
    RJ45_PROCEDURE_STEPS.CRIMP_COMPLETE,
    RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_5,
    RJ45_PROCEDURE_STEPS.SELECT_CABLE_TESTER,
    RJ45_PROCEDURE_STEPS.CONNECT_CABLE_TO_TESTER,
    RJ45_PROCEDURE_STEPS.READY_TO_TEST,
    RJ45_PROCEDURE_STEPS.TESTING_CABLE,
    RJ45_PROCEDURE_STEPS.TEST_RESULT,
    RJ45_PROCEDURE_STEPS.RJ45_MODULE_COMPLETE,
  ].includes(currentStep)
}

function isCrimpingWorkspaceStep(currentStep) {
  return [
    RJ45_PROCEDURE_STEPS.POSITION_CONNECTOR_IN_CRIMPER,
    RJ45_PROCEDURE_STEPS.READY_TO_CRIMP,
    RJ45_PROCEDURE_STEPS.CRIMPING,
    RJ45_PROCEDURE_STEPS.CRIMP_COMPLETE,
    RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_5,
  ].includes(currentStep)
}

function isDedicatedCableTestingStep(currentStep) {
  return [
    RJ45_PROCEDURE_STEPS.CONNECT_CABLE_TO_TESTER,
    RJ45_PROCEDURE_STEPS.READY_TO_TEST,
    RJ45_PROCEDURE_STEPS.TESTING_CABLE,
    RJ45_PROCEDURE_STEPS.TEST_RESULT,
    RJ45_PROCEDURE_STEPS.RJ45_MODULE_COMPLETE,
  ].includes(currentStep)
}

function isArrangementWorkspaceStep(currentStep) {
  return (
    currentStep === RJ45_PROCEDURE_STEPS.ARRANGE_T568B ||
    currentStep === RJ45_PROCEDURE_STEPS.VALIDATE_T568B
  )
}

function isTrimmingWorkspaceStep(currentStep) {
  return [
    RJ45_PROCEDURE_STEPS.POSITION_FOR_TRIM,
    RJ45_PROCEDURE_STEPS.TRIM_WIRES,
    RJ45_PROCEDURE_STEPS.TRIMMING,
    RJ45_PROCEDURE_STEPS.WIRES_TRIMMED,
    RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_3,
  ].includes(currentStep)
}

export default function InteractiveTool({
  tool,
  workbenchPosition = tool.restPosition,
  children,
}) {
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
  const procedureStep = getRJ45ProcedureStep(currentStep)
  const expectedToolId =
    procedureStep.acceptedAction === 'select-tool'
      ? procedureStep.acceptedToolId
      : null
  const canInteract =
    workstationPhase === WORKSTATION_PHASES.FOCUSED &&
    isTrainingMode &&
    toolViewState === TOOL_VIEW_STATES.IDLE &&
    !isProcedureAnimating &&
    !activeToolId &&
    Boolean(expectedToolId)
  const isHovered = canInteract && hoveredToolId === tool.id
  const isExpectedTool = canInteract && expectedToolId === tool.id
  const isHighlighted = isExpectedTool || isHovered
  const isActive = activeToolId === tool.id
  const hideWorkbenchConnector =
    tool.id === TOOL_IDS.RJ45_CONNECTOR &&
    isConnectorAssemblyStep(currentStep)
  const hideWorkbenchCrimper =
    tool.id === TOOL_IDS.CRIMPING_TOOL &&
    (isCrimpingWorkspaceStep(currentStep) ||
      isDedicatedCableTestingStep(currentStep))
  const hideWorkbenchTester =
    tool.id === TOOL_IDS.CABLE_TESTER &&
    isCrimpingWorkspaceStep(currentStep)
  const hideDuringArrangement = isArrangementWorkspaceStep(currentStep)
  const hideDuringTrimming =
    isTrimmingWorkspaceStep(currentStep) &&
    tool.id !== TOOL_IDS.CRIMPING_TOOL
  useEffect(() => {
    highlightedMaterials.current.forEach(
      ({ material, emissive, emissiveIntensity }) => {
        material.emissive.copy(emissive)
        material.emissiveIntensity = emissiveIntensity
      },
    )
    highlightedMaterials.current = []

    if (!isHighlighted || !group.current) {
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
      material.emissive.lerp(highlightColor, isExpectedTool ? 0.2 : 0.08)
      material.emissiveIntensity = Math.max(
        material.emissiveIntensity,
        isExpectedTool ? 0.28 : 0.14,
      )
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
  }, [isExpectedTool, isHighlighted])

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
      visible={
        !isActive &&
        !hideWorkbenchConnector &&
        !hideWorkbenchCrimper &&
        !hideWorkbenchTester &&
        !hideDuringArrangement &&
        !hideDuringTrimming
      }
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      {isExpectedTool && (
        <mesh
          geometry={toolHighlightGeometry}
          material={toolHighlightMaterial}
          position={[
            workbenchPosition[0],
            workbenchPosition[1] + 0.006,
            workbenchPosition[2],
          ]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={getHighlightScale(tool.id)}
        />
      )}
      {children}
      {isHovered && (
        <Html
          position={[
            workbenchPosition[0],
            workbenchPosition[1] + 0.35,
            workbenchPosition[2],
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
