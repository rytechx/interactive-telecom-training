import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Matrix4, Quaternion, Vector3 } from 'three'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../../store/useToolStore.js'
import useTrainingStore from '../../store/useTrainingStore.js'
import useSettingsStore from '../../store/useSettingsStore.js'
import { RJ45_WORKSTATION } from '../../workstations/workstationConfigs.js'
import { RJ45_PROCEDURE_STEPS } from './rj45Procedure.js'

const lookAtMatrix = new Matrix4()
const cameraRollAxis = new Vector3(0, 0, 1)
const cameraRollQuaternion = new Quaternion()

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

function getProcedureView(currentStep, trainingStarted, assessmentVisible) {
  if (!trainingStarted) {
    return null
  }

  if (assessmentVisible) {
    return 'assessment'
  }

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

  if (
    [
      RJ45_PROCEDURE_STEPS.ALIGN_CONNECTOR,
      RJ45_PROCEDURE_STEPS.INSERT_CONDUCTORS,
      RJ45_PROCEDURE_STEPS.INSERTING_CONDUCTORS,
      RJ45_PROCEDURE_STEPS.VERIFY_INSERTION,
      RJ45_PROCEDURE_STEPS.CONDUCTORS_INSERTED,
      RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_4,
    ].includes(currentStep)
  ) {
    return 'connector-insertion'
  }

  if (
    [
      RJ45_PROCEDURE_STEPS.POSITION_CONNECTOR_IN_CRIMPER,
      RJ45_PROCEDURE_STEPS.READY_TO_CRIMP,
      RJ45_PROCEDURE_STEPS.CRIMPING,
      RJ45_PROCEDURE_STEPS.CRIMP_COMPLETE,
      RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_5,
    ].includes(currentStep)
  ) {
    return 'crimping'
  }

  if (
    [
      RJ45_PROCEDURE_STEPS.CONNECT_CABLE_TO_TESTER,
      RJ45_PROCEDURE_STEPS.READY_TO_TEST,
      RJ45_PROCEDURE_STEPS.TESTING_CABLE,
      RJ45_PROCEDURE_STEPS.TEST_RESULT,
      RJ45_PROCEDURE_STEPS.RJ45_MODULE_COMPLETE,
    ].includes(currentStep)
  ) {
    return 'cable-testing'
  }

  return 'technician'
}

const procedureCameraConfigs = Object.freeze({
  technician: Object.freeze({
    cameraPosition: RJ45_WORKSTATION.technicianCameraPosition,
    cameraTarget: RJ45_WORKSTATION.technicianCameraTarget,
    lightPosition: RJ45_WORKSTATION.technicianLightPosition,
    cameraRoll: RJ45_WORKSTATION.technicianCameraRoll,
    transitionDuration: RJ45_WORKSTATION.technicianTransitionDuration,
  }),
  arrangement: Object.freeze({
    cameraPosition: RJ45_WORKSTATION.arrangementCameraPosition,
    cameraTarget: RJ45_WORKSTATION.arrangementCameraTarget,
    lightPosition: RJ45_WORKSTATION.arrangementLightPosition,
    cameraRoll: RJ45_WORKSTATION.technicianCameraRoll,
    transitionDuration: RJ45_WORKSTATION.arrangementTransitionDuration,
  }),
  trimming: Object.freeze({
    cameraPosition: RJ45_WORKSTATION.trimmingCameraPosition,
    cameraTarget: RJ45_WORKSTATION.trimmingCameraTarget,
    lightPosition: RJ45_WORKSTATION.trimmingLightPosition,
    cameraRoll: RJ45_WORKSTATION.technicianCameraRoll,
    transitionDuration: RJ45_WORKSTATION.trimmingTransitionDuration,
  }),
  'connector-insertion': Object.freeze({
    cameraPosition: RJ45_WORKSTATION.connectorInsertionCameraPosition,
    cameraTarget: RJ45_WORKSTATION.connectorInsertionCameraTarget,
    lightPosition: RJ45_WORKSTATION.connectorInsertionLightPosition,
    cameraRoll: RJ45_WORKSTATION.technicianCameraRoll,
    transitionDuration: RJ45_WORKSTATION.connectorInsertionTransitionDuration,
  }),
  crimping: Object.freeze({
    cameraPosition: RJ45_WORKSTATION.crimpingCameraPosition,
    cameraTarget: RJ45_WORKSTATION.crimpingCameraTarget,
    lightPosition: RJ45_WORKSTATION.crimpingLightPosition,
    cameraRoll: 0,
    transitionDuration: RJ45_WORKSTATION.crimpingTransitionDuration,
  }),
  'cable-testing': Object.freeze({
    cameraPosition: RJ45_WORKSTATION.cableTestingCameraPosition,
    cameraTarget: RJ45_WORKSTATION.cableTestingCameraTarget,
    lightPosition: RJ45_WORKSTATION.cableTestingLightPosition,
    cameraRoll: 0,
    transitionDuration: RJ45_WORKSTATION.cableTestingTransitionDuration,
  }),
  assessment: Object.freeze({
    cameraPosition: RJ45_WORKSTATION.assessmentCameraPosition,
    cameraTarget: RJ45_WORKSTATION.assessmentCameraTarget,
    lightPosition: RJ45_WORKSTATION.assessmentLightPosition,
    cameraRoll: 0,
    transitionDuration: RJ45_WORKSTATION.assessmentTransitionDuration,
  }),
})

export default function RJ45ArrangementFocusController() {
  const camera = useThree((state) => state.camera)
  const reducedMotion = useSettingsStore((state) => state.reducedMotion)
  const workLight = useRef(null)
  const workLightTarget = useRef(null)
  const transition = useRef(null)
  const activeProcedureView = useRef(null)
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const toolViewState = useToolStore((state) => state.toolViewState)
  const trainingStarted = useTrainingStore((state) => state.trainingStarted)
  const currentStep = useTrainingStore((state) => state.currentStep)
  const assessmentVisible = useTrainingStore(
    (state) => state.assessmentVisible,
  )
  const procedureView = getProcedureView(
    currentStep,
    trainingStarted,
    assessmentVisible,
  )
  const procedureCameraConfig = procedureCameraConfigs[procedureView] ?? null
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
          duration: reducedMotion
            ? Math.min(RJ45_WORKSTATION.trimmingTransitionDuration, 0.2)
            : RJ45_WORKSTATION.trimmingTransitionDuration,
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

    if (!procedureCameraConfig) {
      return
    }

    const cameraPosition = new Vector3().fromArray(
      procedureCameraConfig.cameraPosition,
    )
    const cameraTarget = new Vector3().fromArray(
      procedureCameraConfig.cameraTarget,
    )

    transition.current = {
      elapsed: 0,
      duration: reducedMotion
        ? Math.min(procedureCameraConfig.transitionDuration, 0.2)
        : procedureCameraConfig.transitionDuration,
      startPosition: camera.position.clone(),
      endPosition: cameraPosition,
      startQuaternion: camera.quaternion.clone(),
      endQuaternion: getFocusQuaternion(
        cameraPosition,
        cameraTarget,
        camera.up,
        procedureCameraConfig.cameraRoll,
      ),
    }
    activeProcedureView.current = procedureView
  }, [
    camera,
    canUseProcedureView,
    procedureCameraConfig,
    procedureView,
    reducedMotion,
    workstationPhase,
  ])

  useFrame((_, delta) => {
    if (workLight.current) {
      let targetIntensity = 0

      if (
        workstationPhase === WORKSTATION_PHASES.FOCUSED &&
        procedureView
      ) {
        if (procedureView === 'arrangement') {
          targetIntensity = 1.7
        } else if (procedureView === 'connector-insertion') {
          targetIntensity = 1.35
        } else if (procedureView === 'cable-testing') {
          targetIntensity = 1.5
        } else if (procedureView === 'crimping') {
          targetIntensity = 1.35
        } else {
          targetIntensity = 1.55
        }
      }

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
          procedureCameraConfig?.lightPosition ??
          RJ45_WORKSTATION.technicianLightPosition
        }
        color="#f4f2eb"
        intensity={0}
        distance={3.6}
        angle={0.56}
        penumbra={0.82}
        decay={2}
      />
      <object3D
        ref={workLightTarget}
        position={
          procedureCameraConfig?.cameraTarget ??
          RJ45_WORKSTATION.technicianCameraTarget
        }
      />
    </>
  )
}
