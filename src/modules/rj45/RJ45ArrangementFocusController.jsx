import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Matrix4, Quaternion, Vector3 } from 'three'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../../store/useToolStore.js'
import useTrainingStore from '../../store/useTrainingStore.js'
import { RJ45_WORKSTATION } from '../../workstations/workstationConfigs.js'
import { RJ45_PROCEDURE_STEPS } from './rj45Procedure.js'

const lookAtMatrix = new Matrix4()

function getFocusQuaternion(cameraPosition, cameraTarget, cameraUp) {
  lookAtMatrix.lookAt(cameraPosition, cameraTarget, cameraUp)
  return new Quaternion().setFromRotationMatrix(lookAtMatrix)
}

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress)
}

function getProcedureView(currentStep) {
  if (
    currentStep === RJ45_PROCEDURE_STEPS.ARRANGE_T568B ||
    currentStep === RJ45_PROCEDURE_STEPS.VALIDATE_T568B
  ) {
    return 'arrangement'
  }

  if (
    [
      RJ45_PROCEDURE_STEPS.POSITION_FOR_TRIM,
      RJ45_PROCEDURE_STEPS.TRIM_WIRES,
      RJ45_PROCEDURE_STEPS.TRIMMING,
      RJ45_PROCEDURE_STEPS.WIRES_TRIMMED,
      RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_3,
    ].includes(currentStep)
  ) {
    return 'trimming'
  }

  return null
}

export default function RJ45ArrangementFocusController() {
  const camera = useThree((state) => state.camera)
  const workLight = useRef(null)
  const workLightTarget = useRef(null)
  const transition = useRef(null)
  const activeProcedureView = useRef(null)
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const toolViewState = useToolStore((state) => state.toolViewState)
  const currentStep = useTrainingStore((state) => state.currentStep)
  const procedureView = getProcedureView(currentStep)
  const canUseProcedureView =
    workstationPhase === WORKSTATION_PHASES.FOCUSED &&
    procedureView !== null &&
    toolViewState === TOOL_VIEW_STATES.IDLE

  useEffect(() => {
    if (workLight.current && workLightTarget.current) {
      workLight.current.target = workLightTarget.current
    }
  }, [])

  useEffect(() => {
    if (workstationPhase !== WORKSTATION_PHASES.FOCUSED) {
      transition.current = null
      activeProcedureView.current = null
      return
    }

    if (!procedureView) {
      if (activeProcedureView.current) {
        const cameraPosition = new Vector3().fromArray(
          RJ45_WORKSTATION.focusCameraPosition,
        )
        const cameraTarget = new Vector3().fromArray(
          RJ45_WORKSTATION.focusCameraTarget,
        )

        transition.current = {
          elapsed: 0,
          duration: RJ45_WORKSTATION.trimmingTransitionDuration,
          startPosition: camera.position.clone(),
          endPosition: cameraPosition,
          startQuaternion: camera.quaternion.clone(),
          endQuaternion: getFocusQuaternion(
            cameraPosition,
            cameraTarget,
            camera.up,
          ),
        }
      }

      activeProcedureView.current = null
      return
    }

    if (!canUseProcedureView) {
      transition.current = null
      activeProcedureView.current = null
      return
    }

    if (activeProcedureView.current === procedureView) {
      return
    }

    const isTrimmingView = procedureView === 'trimming'
    const cameraPosition = new Vector3().fromArray(
      isTrimmingView
        ? RJ45_WORKSTATION.trimmingCameraPosition
        : RJ45_WORKSTATION.arrangementCameraPosition,
    )
    const cameraTarget = new Vector3().fromArray(
      isTrimmingView
        ? RJ45_WORKSTATION.trimmingCameraTarget
        : RJ45_WORKSTATION.arrangementCameraTarget,
    )

    transition.current = {
      elapsed: 0,
      duration: isTrimmingView
        ? RJ45_WORKSTATION.trimmingTransitionDuration
        : RJ45_WORKSTATION.arrangementTransitionDuration,
      startPosition: camera.position.clone(),
      endPosition: cameraPosition,
      startQuaternion: camera.quaternion.clone(),
      endQuaternion: getFocusQuaternion(
        cameraPosition,
        cameraTarget,
        camera.up,
      ),
    }
    activeProcedureView.current = procedureView
  }, [
    camera,
    canUseProcedureView,
    procedureView,
    workstationPhase,
  ])

  useFrame((_, delta) => {
    if (workLight.current) {
      const targetIntensity =
        workstationPhase === WORKSTATION_PHASES.FOCUSED && procedureView
          ? 2.4
          : 0
      const lightDamping = 1 - Math.exp(-6 * delta)
      workLight.current.intensity +=
        (targetIntensity - workLight.current.intensity) * lightDamping
    }

    const activeTransition = transition.current

    if (!activeTransition) {
      return
    }

    activeTransition.elapsed += delta
    const progress = Math.min(
      activeTransition.elapsed / activeTransition.duration,
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
    }
  })

  return (
    <>
      <spotLight
        ref={workLight}
        position={
          procedureView === 'trimming'
            ? RJ45_WORKSTATION.trimmingLightPosition
            : RJ45_WORKSTATION.arrangementLightPosition
        }
        color="#e5f2ff"
        intensity={0}
        distance={4}
        angle={0.58}
        penumbra={0.72}
        decay={2}
      />
      <object3D
        ref={workLightTarget}
        position={
          procedureView === 'trimming'
            ? RJ45_WORKSTATION.trimmingCameraTarget
            : RJ45_WORKSTATION.arrangementCameraTarget
        }
      />
    </>
  )
}
