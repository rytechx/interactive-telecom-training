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
  JACKET_STRIPPING_DURATION,
  JACKET_STRIPPING_WORK_END,
  RJ45_PROCEDURE_STEPS,
  TRIMMING_DURATION,
} from '../modules/rj45/rj45Procedure.js'
import { RJ45_WORKSTATION } from '../workstations/workstationConfigs.js'
import { getToolConfig, TOOL_IDS } from './toolConfigs.js'

const TOOL_INSPECTION_DURATION = 0.7
const lookAtMatrix = new Matrix4()
const cameraRollAxis = new Vector3(0, 0, 1)
const cameraRollQuaternion = new Quaternion()
const activeToolPosition = new Vector3()
const activeToolRotation = new Euler()
const activeToolQuaternion = new Quaternion()
const trimmingToolPosition = new Vector3()
const trimmingToolRotation = new Euler()
const trimmingToolQuaternion = new Quaternion()
const trimmingToolStandbyPosition = new Vector3()
const trimmingToolStandbyRotation = new Euler()
const trimmingToolStandbyQuaternion = new Quaternion()
const strippingToolPosition = new Vector3()
const strippingToolRotation = new Euler()
const strippingToolQuaternion = new Quaternion()
const strippingToolWorkingPosition = new Vector3()
const strippingToolReturnStartPosition = new Vector3()
const strippingToolRestPosition = new Vector3()
const strippingToolRestRotation = new Euler()
const strippingToolRestQuaternion = new Quaternion()
const workstationOrigin = new Vector3().fromArray(
  RJ45_WORKSTATION.interactionPosition,
)

function getFocusQuaternion(
  cameraPosition,
  cameraTarget,
  cameraUp,
  cameraRoll = 0,
) {
  lookAtMatrix.lookAt(cameraPosition, cameraTarget, cameraUp)
  const focusQuaternion = new Quaternion().setFromRotationMatrix(lookAtMatrix)

  if (cameraRoll === 0) {
    return focusQuaternion
  }

  cameraRollQuaternion.setFromAxisAngle(cameraRollAxis, cameraRoll)
  return focusQuaternion.multiply(cameraRollQuaternion)
}

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress)
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum)
}

function isConnectorWorkspaceStep(currentStep) {
  return [
    RJ45_PROCEDURE_STEPS.ALIGN_CONNECTOR,
    RJ45_PROCEDURE_STEPS.INSERT_CONDUCTORS,
    RJ45_PROCEDURE_STEPS.INSERTING_CONDUCTORS,
    RJ45_PROCEDURE_STEPS.VERIFY_INSERTION,
    RJ45_PROCEDURE_STEPS.CONDUCTORS_INSERTED,
    RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_4,
    RJ45_PROCEDURE_STEPS.SELECT_CRIMPING_TOOL,
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

function isCableTestingWorkspaceStep(currentStep) {
  return [
    RJ45_PROCEDURE_STEPS.CONNECT_CABLE_TO_TESTER,
    RJ45_PROCEDURE_STEPS.READY_TO_TEST,
    RJ45_PROCEDURE_STEPS.TESTING_CABLE,
    RJ45_PROCEDURE_STEPS.TEST_RESULT,
    RJ45_PROCEDURE_STEPS.RJ45_MODULE_COMPLETE,
  ].includes(currentStep)
}

function ToolModel({ toolId, wireStripperHandleRefs }) {
  if (toolId === TOOL_IDS.CRIMPING_TOOL) {
    return <CrimpingTool />
  }

  if (toolId === TOOL_IDS.WIRE_STRIPPER) {
    return (
      <WireStripper
        leftHandleRef={wireStripperHandleRefs.left}
        rightHandleRef={wireStripperHandleRefs.right}
      />
    )
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
  const wireStripperLeftHandle = useRef(null)
  const wireStripperRightHandle = useRef(null)
  const stripAnimationProgress = useRef(0)
  const stripStartPosition = useRef(new Vector3())
  const stripStartQuaternion = useRef(new Quaternion())
  const trimAnimationProgress = useRef(0)
  const trimStartPosition = useRef(new Vector3())
  const trimStartQuaternion = useRef(new Quaternion())
  const transition = useRef(null)
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const selectedToolId = useToolStore((state) => state.selectedToolId)
  const activeToolId = useToolStore((state) => state.activeToolId)
  const toolViewState = useToolStore((state) => state.toolViewState)
  const currentStep = useTrainingStore((state) => state.currentStep)
  const isProcedureAnimating = useTrainingStore(
    (state) => state.isProcedureAnimating,
  )
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
  const isPreparingToTrim =
    activeToolId === TOOL_IDS.CRIMPING_TOOL &&
    (currentStep === RJ45_PROCEDURE_STEPS.POSITION_FOR_TRIM ||
      currentStep === RJ45_PROCEDURE_STEPS.TRIM_WIRES)
  const isTrimmedToolAtGuide =
    activeToolId === TOOL_IDS.CRIMPING_TOOL &&
    (currentStep === RJ45_PROCEDURE_STEPS.WIRES_TRIMMED ||
      currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_3)
  const isStripping =
    activeToolId === TOOL_IDS.WIRE_STRIPPER &&
    currentStep === RJ45_PROCEDURE_STEPS.STRIP_JACKET &&
    isProcedureAnimating
  const isStrippedToolAtRest =
    activeToolId === TOOL_IDS.WIRE_STRIPPER &&
    (currentStep === RJ45_PROCEDURE_STEPS.JACKET_STRIPPED ||
      currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_1)
  const usesDedicatedConnectorModel =
    activeToolId === TOOL_IDS.RJ45_CONNECTOR &&
    isConnectorWorkspaceStep(currentStep)
  const usesDedicatedCrimpingTool =
    activeToolId === TOOL_IDS.CRIMPING_TOOL &&
    isCrimpingWorkspaceStep(currentStep)
  const usesDedicatedCableTester =
    activeToolId === TOOL_IDS.CABLE_TESTER &&
    isCableTestingWorkspaceStep(currentStep)

  useEffect(() => {
    if (!isStripping || !activeToolGroup.current) {
      return
    }

    stripAnimationProgress.current = 0
    stripStartPosition.current.copy(activeToolGroup.current.position)
    stripStartQuaternion.current.copy(activeToolGroup.current.quaternion)
  }, [isStripping])

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
          selectedTool.inspectionCameraRoll,
        ),
      }
      return
    }

    if (toolViewState === TOOL_VIEW_STATES.EXITING) {
      const workstationCameraPosition = new Vector3().fromArray(
        RJ45_WORKSTATION.technicianCameraPosition,
      )
      const workstationCameraTarget = new Vector3().fromArray(
        RJ45_WORKSTATION.technicianCameraTarget,
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
          RJ45_WORKSTATION.technicianCameraRoll,
        ),
      }
    }
  }, [
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

    if (isStripping || isStrippedToolAtRest) {
      strippingToolPosition.fromArray(RJ45_WORKSTATION.strippingToolPosition)
      strippingToolRotation.set(...RJ45_WORKSTATION.strippingToolRotation)
      strippingToolQuaternion.setFromEuler(strippingToolRotation)
      strippingToolReturnStartPosition.copy(strippingToolPosition)
      strippingToolReturnStartPosition.z -= 0.44
      strippingToolRestPosition
        .fromArray(activeTool.restPosition)
        .add(workstationOrigin)
      strippingToolRestRotation.set(...activeTool.restRotation)
      strippingToolRestQuaternion.setFromEuler(strippingToolRestRotation)
      const workScale =
        activeTool.scale / activeTool.activeScale

      let handleClosure = 0

      if (isStripping) {
        stripAnimationProgress.current = Math.min(
          stripAnimationProgress.current + delta / JACKET_STRIPPING_DURATION,
          1,
        )
        const progress = stripAnimationProgress.current
        const approachProgress = smoothStep(Math.min(progress / 0.26, 1))
        const closeProgress = smoothStep(
          clamp((progress - 0.14) / 0.18, 0, 1),
        )
        const releaseProgress = smoothStep(
          clamp((progress - 0.58) / 0.14, 0, 1),
        )
        const pullProgress = smoothStep(
          clamp((progress - 0.34) / 0.28, 0, 1),
        )
        const returnProgress = smoothStep(
          clamp(
            (progress - JACKET_STRIPPING_WORK_END) /
              (1 - JACKET_STRIPPING_WORK_END),
            0,
            1,
          ),
        )

        handleClosure = closeProgress * (1 - releaseProgress)
        strippingToolWorkingPosition.copy(strippingToolPosition)
        strippingToolWorkingPosition.z -= pullProgress * 0.44

        if (returnProgress > 0) {
          activeToolGroup.current.position.lerpVectors(
            strippingToolReturnStartPosition,
            strippingToolRestPosition,
            returnProgress,
          )
          activeToolGroup.current.quaternion.slerpQuaternions(
            strippingToolQuaternion,
            strippingToolRestQuaternion,
            returnProgress,
          )
        } else {
          activeToolGroup.current.position.lerpVectors(
            stripStartPosition.current,
            strippingToolWorkingPosition,
            approachProgress,
          )
          activeToolGroup.current.quaternion.slerpQuaternions(
            stripStartQuaternion.current,
            strippingToolQuaternion,
            approachProgress,
          )
        }

        if (toolMotionGroup.current) {
          const toolScale = 1 + (workScale - 1) * approachProgress
          toolMotionGroup.current.scale.setScalar(toolScale)
        }
      } else {
        activeToolGroup.current.position.copy(strippingToolRestPosition)
        activeToolGroup.current.quaternion.copy(strippingToolRestQuaternion)

        if (toolMotionGroup.current) {
          toolMotionGroup.current.scale.setScalar(workScale)
        }
      }

      if (wireStripperLeftHandle.current) {
        wireStripperLeftHandle.current.position.x =
          -0.055 + handleClosure * 0.022
        wireStripperLeftHandle.current.rotation.y =
          0.14 - handleClosure * 0.11
      }

      if (wireStripperRightHandle.current) {
        wireStripperRightHandle.current.position.x =
          0.055 - handleClosure * 0.022
        wireStripperRightHandle.current.rotation.y =
          -0.14 + handleClosure * 0.11
      }

      return
    }

    if (wireStripperLeftHandle.current) {
      wireStripperLeftHandle.current.position.x = -0.055
      wireStripperLeftHandle.current.rotation.y = 0.14
    }

    if (wireStripperRightHandle.current) {
      wireStripperRightHandle.current.position.x = 0.055
      wireStripperRightHandle.current.rotation.y = -0.14
    }

    if (isPreparingToTrim) {
      trimmingToolStandbyPosition.fromArray(
        RJ45_WORKSTATION.trimmingToolStandbyPosition,
      )
      trimmingToolStandbyRotation.set(
        ...RJ45_WORKSTATION.trimmingToolStandbyRotation,
      )
      trimmingToolStandbyQuaternion.setFromEuler(trimmingToolStandbyRotation)

      activeToolGroup.current.position.copy(trimmingToolStandbyPosition)
      activeToolGroup.current.quaternion.copy(trimmingToolStandbyQuaternion)

      if (toolMotionGroup.current) {
        const workScale = activeTool.scale / activeTool.activeScale
        toolMotionGroup.current.scale.setScalar(workScale)
        toolMotionGroup.current.position.y = 0
      }

      return
    }

    if (isTrimming || isTrimmedToolAtGuide) {
      trimmingToolPosition.fromArray(RJ45_WORKSTATION.trimmingToolPosition)
      trimmingToolRotation.set(...RJ45_WORKSTATION.trimmingToolRotation)
      trimmingToolQuaternion.setFromEuler(trimmingToolRotation)
      const workScale = activeTool.scale / activeTool.activeScale

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
          toolMotionGroup.current.scale.set(
            workScale * (1 - jawClosure * 0.14),
            workScale,
            workScale,
          )
          toolMotionGroup.current.position.y = -jawClosure * 0.018
        }

        return
      }

      activeToolGroup.current.position.copy(trimmingToolPosition)
      activeToolGroup.current.quaternion.copy(trimmingToolQuaternion)

      if (toolMotionGroup.current) {
        toolMotionGroup.current.scale.setScalar(workScale)
        toolMotionGroup.current.position.y = 0
      }

      return
    }

    if (toolMotionGroup.current) {
      toolMotionGroup.current.scale.set(1, 1, 1)
      toolMotionGroup.current.position.y = 0
    }

    activeToolPosition
      .fromArray(activeTool.activePosition)
      .applyQuaternion(camera.quaternion)
      .add(camera.position)
    activeToolRotation.set(...activeTool.activeRotation)
    activeToolQuaternion.setFromEuler(activeToolRotation)

    activeToolGroup.current.position.copy(activeToolPosition)
    activeToolGroup.current.quaternion
      .copy(camera.quaternion)
      .multiply(activeToolQuaternion)
  })

  return activeTool &&
    !usesDedicatedConnectorModel &&
    !usesDedicatedCrimpingTool &&
    !usesDedicatedCableTester ? (
    <group ref={activeToolGroup} scale={activeTool.activeScale ?? 1}>
      <group ref={toolMotionGroup}>
        <ToolModel
          toolId={activeTool.id}
          wireStripperHandleRefs={{
            left: wireStripperLeftHandle,
            right: wireStripperRightHandle,
          }}
        />
      </group>
    </group>
  ) : null
}

export { TOOL_INSPECTION_DURATION }
