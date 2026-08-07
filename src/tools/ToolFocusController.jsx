import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Euler, Matrix4, Quaternion, Vector3 } from 'three'
import CableTester from '../objects/telecom/CableTester.jsx'
import {
  CrimpingTool,
  RJ45Connector,
  WireStripper,
} from '../objects/telecom/RJ45ToolSet.jsx'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../store/useInteractionStore.js'
import useTrainingStore from '../store/useTrainingStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../store/useToolStore.js'
import {
  RJ45_PROCEDURE_STEPS,
  TRIMMING_DURATION,
} from '../modules/rj45/rj45Procedure.js'
import {
  getWorkstationConfig,
  RJ45_WORKSTATION,
} from '../workstations/workstationConfigs.js'
import { getToolConfig, TOOL_IDS } from './toolConfigs.js'

const TOOL_INSPECTION_DURATION = 0.7
const lookAtMatrix = new Matrix4()
const activeToolPosition = new Vector3()
const activeToolRotation = new Euler()
const activeToolQuaternion = new Quaternion()
const trimmingToolPosition = new Vector3()
const trimmingToolRotation = new Euler()
const trimmingToolQuaternion = new Quaternion()

function getFocusQuaternion(cameraPosition, cameraTarget, cameraUp) {
  lookAtMatrix.lookAt(cameraPosition, cameraTarget, cameraUp)
  return new Quaternion().setFromRotationMatrix(lookAtMatrix)
}

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress)
}

function ToolModel({ toolId }) {
  if (toolId === TOOL_IDS.CRIMPING_TOOL) {
    return <CrimpingTool />
  }

  if (toolId === TOOL_IDS.WIRE_STRIPPER) {
    return <WireStripper />
  }

  if (toolId === TOOL_IDS.RJ45_CONNECTOR) {
    return <RJ45Connector />
  }

  if (toolId === TOOL_IDS.CABLE_TESTER) {
    return <CableTester />
  }

  return null
}

export default function ToolFocusController() {
  const camera = useThree((state) => state.camera)
  const activeToolGroup = useRef(null)
  const toolMotionGroup = useRef(null)
  const trimAnimationProgress = useRef(0)
  const trimStartPosition = useRef(new Vector3())
  const trimStartQuaternion = useRef(new Quaternion())
  const transition = useRef(null)
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const activeWorkstationId = useInteractionStore(
    (state) => state.activeInteractable?.id ?? null,
  )
  const selectedToolId = useToolStore((state) => state.selectedToolId)
  const activeToolId = useToolStore((state) => state.activeToolId)
  const toolViewState = useToolStore((state) => state.toolViewState)
  const currentStep = useTrainingStore((state) => state.currentStep)
  const completeToolInspection = useToolStore(
    (state) => state.completeToolInspection,
  )
  const completeToolViewExit = useToolStore(
    (state) => state.completeToolViewExit,
  )
  const resetToolState = useToolStore((state) => state.resetToolState)
  const activeTool = getToolConfig(activeToolId)
  const isTrimming =
    activeToolId === TOOL_IDS.CRIMPING_TOOL &&
    currentStep === RJ45_PROCEDURE_STEPS.TRIMMING
  const isTrimmedToolAtGuide =
    activeToolId === TOOL_IDS.CRIMPING_TOOL &&
    (currentStep === RJ45_PROCEDURE_STEPS.WIRES_TRIMMED ||
      currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_3)

  useEffect(() => {
    if (!isTrimming || !activeToolGroup.current) {
      return
    }

    trimAnimationProgress.current = 0
    trimStartPosition.current.copy(activeToolGroup.current.position)
    trimStartQuaternion.current.copy(activeToolGroup.current.quaternion)
  }, [isTrimming])

  useEffect(() => {
    if (workstationPhase !== WORKSTATION_PHASES.FOCUSED) {
      transition.current = null
      resetToolState()
      return
    }

    if (toolViewState === TOOL_VIEW_STATES.ENTERING) {
      const selectedTool = getToolConfig(selectedToolId)

      if (!selectedTool) {
        resetToolState()
        return
      }

      const inspectionCameraPosition = new Vector3().fromArray(
        selectedTool.inspectionCameraPosition,
      )
      const inspectionCameraTarget = new Vector3().fromArray(
        selectedTool.inspectionCameraTarget,
      )

      transition.current = {
        phase: TOOL_VIEW_STATES.ENTERING,
        elapsed: 0,
        startPosition: camera.position.clone(),
        endPosition: inspectionCameraPosition,
        startQuaternion: camera.quaternion.clone(),
        endQuaternion: getFocusQuaternion(
          inspectionCameraPosition,
          inspectionCameraTarget,
          camera.up,
        ),
      }
      return
    }

    if (toolViewState === TOOL_VIEW_STATES.EXITING) {
      const workstation = getWorkstationConfig(activeWorkstationId)

      if (!workstation) {
        resetToolState()
        return
      }

      const workstationCameraPosition = new Vector3().fromArray(
        workstation.focusCameraPosition,
      )
      const workstationCameraTarget = new Vector3().fromArray(
        workstation.focusCameraTarget,
      )

      transition.current = {
        phase: TOOL_VIEW_STATES.EXITING,
        elapsed: 0,
        startPosition: camera.position.clone(),
        endPosition: workstationCameraPosition,
        startQuaternion: camera.quaternion.clone(),
        endQuaternion: getFocusQuaternion(
          workstationCameraPosition,
          workstationCameraTarget,
          camera.up,
        ),
      }
    }
  }, [
    activeWorkstationId,
    camera,
    resetToolState,
    selectedToolId,
    toolViewState,
    workstationPhase,
  ])

  useFrame((_, delta) => {
    const activeTransition = transition.current

    if (activeTransition) {
      activeTransition.elapsed += delta

      const progress = Math.min(
        activeTransition.elapsed / TOOL_INSPECTION_DURATION,
        1,
      )
      const easedProgress = smoothStep(progress)

      camera.position.lerpVectors(
        activeTransition.startPosition,
        activeTransition.endPosition,
        easedProgress,
      )
      camera.quaternion.slerpQuaternions(
        activeTransition.startQuaternion,
        activeTransition.endQuaternion,
        easedProgress,
      )
      camera.updateMatrixWorld()

      if (progress >= 1) {
        transition.current = null

        if (activeTransition.phase === TOOL_VIEW_STATES.ENTERING) {
          completeToolInspection()
        } else {
          completeToolViewExit()
        }
      }
    }

    if (!activeToolGroup.current || !activeTool) {
      return
    }

    if (isTrimming || isTrimmedToolAtGuide) {
      trimmingToolPosition.fromArray(RJ45_WORKSTATION.trimmingToolPosition)
      trimmingToolRotation.set(...RJ45_WORKSTATION.trimmingToolRotation)
      trimmingToolQuaternion.setFromEuler(trimmingToolRotation)

      if (isTrimming) {
        trimAnimationProgress.current = Math.min(
          trimAnimationProgress.current + delta / TRIMMING_DURATION,
          1,
        )
        const progress = trimAnimationProgress.current
        const approachProgress = smoothStep(Math.min(progress / 0.72, 1))
        const cuttingProgress = Math.min(
          Math.max((progress - 0.48) / 0.44, 0),
          1,
        )
        const jawClosure = Math.sin(Math.PI * cuttingProgress)

        activeToolGroup.current.position.lerpVectors(
          trimStartPosition.current,
          trimmingToolPosition,
          approachProgress,
        )
        activeToolGroup.current.quaternion.slerpQuaternions(
          trimStartQuaternion.current,
          trimmingToolQuaternion,
          approachProgress,
        )

        if (toolMotionGroup.current) {
          toolMotionGroup.current.scale.set(1 - jawClosure * 0.14, 1, 1)
          toolMotionGroup.current.position.y = -jawClosure * 0.018
        }

        return
      }

      activeToolGroup.current.position.copy(trimmingToolPosition)
      activeToolGroup.current.quaternion.copy(trimmingToolQuaternion)

      if (toolMotionGroup.current) {
        toolMotionGroup.current.scale.set(1, 1, 1)
        toolMotionGroup.current.position.y = 0
      }

      return
    }

    if (toolMotionGroup.current) {
      toolMotionGroup.current.scale.set(1, 1, 1)
      toolMotionGroup.current.position.y = 0
    }

    activeToolPosition
      .fromArray(activeTool.activeToolPosition)
      .applyQuaternion(camera.quaternion)
      .add(camera.position)
    activeToolRotation.set(...activeTool.activeToolRotation)
    activeToolQuaternion.setFromEuler(activeToolRotation)

    activeToolGroup.current.position.copy(activeToolPosition)
    activeToolGroup.current.quaternion
      .copy(camera.quaternion)
      .multiply(activeToolQuaternion)
  })

  return activeTool ? (
    <group ref={activeToolGroup} scale={activeTool.activeToolScale ?? 1}>
      <group ref={toolMotionGroup}>
        <ToolModel toolId={activeTool.id} />
      </group>
    </group>
  ) : null
}

export { TOOL_INSPECTION_DURATION }
