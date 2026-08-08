import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Matrix4, Quaternion, Vector3 } from 'three'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import useNetworkTrainingStore from '../../store/useNetworkTrainingStore.js'
import { NETWORK_WORKSTATION } from '../../workstations/workstationConfigs.js'
import { NETWORK_PROCEDURE_STEPS } from './networkProcedure.js'

const lookAtMatrix = new Matrix4()

const portCloseupSteps = Object.freeze([
  NETWORK_PROCEDURE_STEPS.CONNECT_PATCH_TO_SWITCH,
  NETWORK_PROCEDURE_STEPS.PATCH_SWITCH_CONNECTED,
  NETWORK_PROCEDURE_STEPS.CONNECT_SWITCH_TO_ROUTER,
  NETWORK_PROCEDURE_STEPS.SWITCH_ROUTER_CONNECTED,
  NETWORK_PROCEDURE_STEPS.POWER_ON_NETWORK,
  NETWORK_PROCEDURE_STEPS.POWERING_ON_NETWORK,
])

const powerConnectionSteps = Object.freeze([
  NETWORK_PROCEDURE_STEPS.CONNECT_POWER,
  NETWORK_PROCEDURE_STEPS.POWER_CONNECTED,
])

const workstationSteps = Object.freeze([
  NETWORK_PROCEDURE_STEPS.CONNECT_PC_TO_SWITCH,
  NETWORK_PROCEDURE_STEPS.PC_SWITCH_CONNECTED,
])

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress)
}

function getFocusQuaternion(position, target, cameraUp) {
  lookAtMatrix.lookAt(position, target, cameraUp)
  return new Quaternion().setFromRotationMatrix(lookAtMatrix)
}

function getNetworkCameraView(currentStep) {
  if (powerConnectionSteps.includes(currentStep)) {
    return {
      id: 'power-installation',
      position: NETWORK_WORKSTATION.powerCameraPosition,
      target: NETWORK_WORKSTATION.powerCameraTarget,
      fov: NETWORK_WORKSTATION.powerFov,
    }
  }

  if (
    currentStep === NETWORK_PROCEDURE_STEPS.VERIFY_LINKS ||
    currentStep === NETWORK_PROCEDURE_STEPS.PHYSICAL_INSTALLATION_COMPLETE
  ) {
    return {
      id: 'verification',
      position: NETWORK_WORKSTATION.verificationCameraPosition,
      target: NETWORK_WORKSTATION.verificationCameraTarget,
      fov: NETWORK_WORKSTATION.closeupFov,
    }
  }

  if (workstationSteps.includes(currentStep)) {
    return {
      id: 'workstation-link',
      position: NETWORK_WORKSTATION.workstationCameraPosition,
      target: NETWORK_WORKSTATION.workstationCameraTarget,
      fov: NETWORK_WORKSTATION.technicianFov,
    }
  }

  if (portCloseupSteps.includes(currentStep)) {
    return {
      id: 'rack-ports',
      position: NETWORK_WORKSTATION.portCameraPosition,
      target: NETWORK_WORKSTATION.portCameraTarget,
      fov: NETWORK_WORKSTATION.closeupFov,
    }
  }

  return {
    id: 'rack-overview',
    position: NETWORK_WORKSTATION.technicianCameraPosition,
    target: NETWORK_WORKSTATION.technicianCameraTarget,
    fov: NETWORK_WORKSTATION.technicianFov,
  }
}

export default function NetworkRackCameraController() {
  const camera = useThree((state) => state.camera)
  const cameraRef = useRef(camera)
  const transition = useRef(null)
  const settledView = useRef(null)
  const currentViewId = useRef(null)
  const wasNetworkFocused = useRef(false)
  const activeWorkstationId = useInteractionStore(
    (state) => state.activeInteractable?.id ?? null,
  )
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const networkTrainingStarted = useNetworkTrainingStore(
    (state) => state.networkTrainingStarted,
  )
  const networkCurrentStep = useNetworkTrainingStore(
    (state) => state.networkCurrentStep,
  )
  const isNetworkFocused =
    activeWorkstationId === NETWORK_WORKSTATION.id &&
    workstationPhase === WORKSTATION_PHASES.FOCUSED

  useEffect(() => {
    const activeCamera = cameraRef.current

    if (!isNetworkFocused) {
      transition.current = null
      settledView.current = null
      currentViewId.current = null

      if (wasNetworkFocused.current) {
        activeCamera.fov = 60
        activeCamera.updateProjectionMatrix()
      }

      wasNetworkFocused.current = false
      return
    }

    wasNetworkFocused.current = true

    if (!networkTrainingStarted) {
      return
    }

    const destination = getNetworkCameraView(networkCurrentStep)

    if (currentViewId.current === destination.id) {
      return
    }

    const destinationPosition = new Vector3().fromArray(destination.position)
    const destinationTarget = new Vector3().fromArray(destination.target)
    const destinationQuaternion = getFocusQuaternion(
      destinationPosition,
      destinationTarget,
      activeCamera.up,
    )

    settledView.current = {
      position: destinationPosition,
      quaternion: destinationQuaternion,
      fov: destination.fov,
    }

    transition.current = {
      destinationViewId: destination.id,
      elapsed: 0,
      duration: NETWORK_WORKSTATION.procedureTransitionDuration,
      startPosition: activeCamera.position.clone(),
      endPosition: destinationPosition,
      startQuaternion: activeCamera.quaternion.clone(),
      endQuaternion: destinationQuaternion,
      startFov: activeCamera.fov,
      endFov: destination.fov,
    }
  }, [isNetworkFocused, networkCurrentStep, networkTrainingStarted])

  useFrame((_, delta) => {
    const activeCamera = cameraRef.current
    const activeTransition = transition.current

    if (!isNetworkFocused) {
      return
    }

    if (!activeTransition) {
      const activeView = settledView.current

      if (activeView) {
        activeCamera.position.copy(activeView.position)
        activeCamera.quaternion.copy(activeView.quaternion)
        activeCamera.fov = activeView.fov
        activeCamera.updateProjectionMatrix()
        activeCamera.updateMatrixWorld()
      }

      return
    }

    activeTransition.elapsed += delta
    const progress = Math.min(
      activeTransition.elapsed / Math.max(activeTransition.duration, 0.01),
      1,
    )
    const easedProgress = smoothStep(progress)

    activeCamera.position.lerpVectors(
      activeTransition.startPosition,
      activeTransition.endPosition,
      easedProgress,
    )
    activeCamera.quaternion.slerpQuaternions(
      activeTransition.startQuaternion,
      activeTransition.endQuaternion,
      easedProgress,
    )
    activeCamera.fov =
      activeTransition.startFov +
      (activeTransition.endFov - activeTransition.startFov) * easedProgress
    activeCamera.updateProjectionMatrix()
    activeCamera.updateMatrixWorld()

    if (progress < 1) {
      return
    }

    currentViewId.current = activeTransition.destinationViewId
    transition.current = null
  })

  return null
}
