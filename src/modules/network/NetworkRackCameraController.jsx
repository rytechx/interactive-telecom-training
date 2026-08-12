import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Matrix4, Quaternion, Vector3 } from 'three'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import useNetworkTrainingStore from '../../store/useNetworkTrainingStore.js'
import useSettingsStore from '../../store/useSettingsStore.js'
import { NETWORK_WORKSTATION } from '../../workstations/workstationConfigs.js'
import { NETWORK_CABLE_IDS } from './networkCableConfigs.js'
import { NETWORK_PROCEDURE_STEPS } from './networkProcedure.js'
import { NETWORK_TROUBLESHOOTING_MODES } from './troubleshooting/troubleshootingScenarios.js'
import { NETWORK_INSPECTION_LIMITS } from './networkWorkstationLayout.js'

const lookAtMatrix = new Matrix4()

const installationSteps = Object.freeze([
  NETWORK_PROCEDURE_STEPS.INSTALL_PATCH_PANEL,
  NETWORK_PROCEDURE_STEPS.INSTALL_SWITCH,
  NETWORK_PROCEDURE_STEPS.INSTALL_ROUTER,
])

const preparationSelectionSteps = Object.freeze([
  NETWORK_PROCEDURE_STEPS.SELECT_PATCH_PANEL,
  NETWORK_PROCEDURE_STEPS.SELECT_SWITCH,
  NETWORK_PROCEDURE_STEPS.SELECT_ROUTER,
])

const portCloseupSteps = Object.freeze([
  NETWORK_PROCEDURE_STEPS.PATCH_SWITCH_CONNECTED,
  NETWORK_PROCEDURE_STEPS.SWITCH_ROUTER_CONNECTED,
  NETWORK_PROCEDURE_STEPS.POWER_ON_NETWORK,
  NETWORK_PROCEDURE_STEPS.POWERING_ON_NETWORK,
])

const rackCableSelectionSteps = Object.freeze([
  NETWORK_PROCEDURE_STEPS.CONNECT_PATCH_TO_SWITCH,
  NETWORK_PROCEDURE_STEPS.CONNECT_SWITCH_TO_ROUTER,
])

const powerConnectionSteps = Object.freeze([
  NETWORK_PROCEDURE_STEPS.CONNECT_POWER,
  NETWORK_PROCEDURE_STEPS.POWER_CONNECTED,
])

const workstationSteps = Object.freeze([
  NETWORK_PROCEDURE_STEPS.CONNECT_PC_TO_SWITCH,
  NETWORK_PROCEDURE_STEPS.PC_SWITCH_CONNECTED,
])

const pcConfigurationSteps = Object.freeze([
  NETWORK_PROCEDURE_STEPS.CONFIGURE_PC_IPV4,
  NETWORK_PROCEDURE_STEPS.PC_IPV4_CONFIGURED,
  NETWORK_PROCEDURE_STEPS.VERIFY_PC_CONFIG,
  NETWORK_PROCEDURE_STEPS.PC_CONFIG_VERIFIED,
  NETWORK_PROCEDURE_STEPS.PING_ROUTER,
  NETWORK_PROCEDURE_STEPS.ROUTER_PING_PASS,
  NETWORK_PROCEDURE_STEPS.PING_SWITCH,
  NETWORK_PROCEDURE_STEPS.SWITCH_PING_PASS,
])

const routerConfigurationSteps = Object.freeze([
  NETWORK_PROCEDURE_STEPS.OPEN_ROUTER_CLI,
  NETWORK_PROCEDURE_STEPS.CONFIGURE_ROUTER,
  NETWORK_PROCEDURE_STEPS.ROUTER_CONFIGURED,
])

const switchConfigurationSteps = Object.freeze([
  NETWORK_PROCEDURE_STEPS.OPEN_SWITCH_CLI,
  NETWORK_PROCEDURE_STEPS.CONFIGURE_SWITCH,
  NETWORK_PROCEDURE_STEPS.SWITCH_CONFIGURED,
])

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress)
}

function getFocusQuaternion(position, target, cameraUp) {
  lookAtMatrix.lookAt(position, target, cameraUp)
  return new Quaternion().setFromRotationMatrix(lookAtMatrix)
}

function getPreparationView(currentStep) {
  return {
    id: `preparation-${currentStep}`,
    position: NETWORK_WORKSTATION.preparationCameraPosition,
    target: NETWORK_WORKSTATION.preparationCameraTarget,
    fov: NETWORK_WORKSTATION.preparationFov,
  }
}

function getNetworkCameraView(
  currentStep,
  selectedCableId,
  selectedSourcePortId,
  troubleshootingMode,
) {
  if (troubleshootingMode === NETWORK_TROUBLESHOOTING_MODES.ACTIVE) {
    if (selectedCableId === NETWORK_CABLE_IDS.SWITCH_POWER) {
      return selectedSourcePortId
        ? {
            id: `troubleshooting-pdu-${selectedCableId}`,
            position: NETWORK_WORKSTATION.pduCameraPosition,
            target: NETWORK_WORKSTATION.pduCameraTarget,
            fov: NETWORK_WORKSTATION.pduFov,
            duration: NETWORK_WORKSTATION.pduTransitionDuration,
          }
        : {
            id: `troubleshooting-power-${selectedCableId}`,
            position: NETWORK_WORKSTATION.powerCameraPosition,
            target: NETWORK_WORKSTATION.powerCameraTarget,
            fov: NETWORK_WORKSTATION.powerFov,
          }
    }

    if (selectedCableId === NETWORK_CABLE_IDS.PC_TO_SWITCH) {
      return selectedSourcePortId
        ? {
            id: 'troubleshooting-pc-switch-destination',
            position: NETWORK_WORKSTATION.pcSwitchPortCameraPosition,
            target: NETWORK_WORKSTATION.pcSwitchPortCameraTarget,
            fov: NETWORK_WORKSTATION.pcSwitchPortFov,
            duration: 0.58,
          }
        : {
            id: 'troubleshooting-workstation-link',
            position: NETWORK_WORKSTATION.workstationCameraPosition,
            target: NETWORK_WORKSTATION.workstationCameraTarget,
            fov: NETWORK_WORKSTATION.technicianFov,
          }
    }
  }

  if (pcConfigurationSteps.includes(currentStep)) {
    return {
      id: `pc-configuration-${currentStep}`,
      position: NETWORK_WORKSTATION.pcConfigurationCameraPosition,
      target: NETWORK_WORKSTATION.pcConfigurationCameraTarget,
      fov: NETWORK_WORKSTATION.configurationFov,
    }
  }

  if (routerConfigurationSteps.includes(currentStep)) {
    return {
      id: `router-configuration-${currentStep}`,
      position: NETWORK_WORKSTATION.routerConsoleCameraPosition,
      target: NETWORK_WORKSTATION.routerConsoleCameraTarget,
      fov: NETWORK_WORKSTATION.configurationFov,
    }
  }

  if (switchConfigurationSteps.includes(currentStep)) {
    return {
      id: `switch-configuration-${currentStep}`,
      position: NETWORK_WORKSTATION.switchConsoleCameraPosition,
      target: NETWORK_WORKSTATION.switchConsoleCameraTarget,
      fov: NETWORK_WORKSTATION.configurationFov,
    }
  }

  if (preparationSelectionSteps.includes(currentStep)) {
    return getPreparationView(currentStep)
  }

  if (installationSteps.includes(currentStep)) {
    return {
      id: `rack-installation-${currentStep}`,
      position: NETWORK_WORKSTATION.portCameraPosition,
      target: NETWORK_WORKSTATION.portCameraTarget,
      fov: NETWORK_WORKSTATION.closeupFov,
    }
  }

  if (
    currentStep === NETWORK_PROCEDURE_STEPS.CONNECT_POWER &&
    !selectedCableId
  ) {
    return getPreparationView(currentStep)
  }

  if (
    currentStep === NETWORK_PROCEDURE_STEPS.CONNECT_POWER &&
    selectedSourcePortId
  ) {
    return {
      id: `pdu-destination-${selectedCableId}`,
      position: NETWORK_WORKSTATION.pduCameraPosition,
      target: NETWORK_WORKSTATION.pduCameraTarget,
      fov: NETWORK_WORKSTATION.pduFov,
      duration: NETWORK_WORKSTATION.pduTransitionDuration,
    }
  }

  if (powerConnectionSteps.includes(currentStep)) {
    return {
      id: `power-installation-${currentStep}-${selectedCableId ?? 'none'}`,
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
      id: `verification-${currentStep}`,
      position: NETWORK_WORKSTATION.verificationCameraPosition,
      target: NETWORK_WORKSTATION.verificationCameraTarget,
      fov: NETWORK_WORKSTATION.closeupFov,
    }
  }

  if (
    currentStep === NETWORK_PROCEDURE_STEPS.CONNECT_PC_TO_SWITCH &&
    !selectedCableId
  ) {
    return getPreparationView(currentStep)
  }

  if (
    currentStep === NETWORK_PROCEDURE_STEPS.CONNECT_PC_TO_SWITCH &&
    selectedSourcePortId
  ) {
    return {
      id: 'pc-switch-destination',
      position: NETWORK_WORKSTATION.pcSwitchPortCameraPosition,
      target: NETWORK_WORKSTATION.pcSwitchPortCameraTarget,
      fov: NETWORK_WORKSTATION.pcSwitchPortFov,
    }
  }

  if (workstationSteps.includes(currentStep)) {
    return {
      id: `workstation-link-${currentStep}-${selectedCableId ?? 'none'}`,
      position: NETWORK_WORKSTATION.workstationCameraPosition,
      target: NETWORK_WORKSTATION.workstationCameraTarget,
      fov: NETWORK_WORKSTATION.technicianFov,
    }
  }

  if (rackCableSelectionSteps.includes(currentStep) && !selectedCableId) {
    return getPreparationView(currentStep)
  }

  if (rackCableSelectionSteps.includes(currentStep) || portCloseupSteps.includes(currentStep)) {
    return {
      id: `rack-ports-${currentStep}-${selectedCableId ?? 'none'}-${selectedSourcePortId ?? 'none'}`,
      position: NETWORK_WORKSTATION.portCameraPosition,
      target: NETWORK_WORKSTATION.portCameraTarget,
      fov: NETWORK_WORKSTATION.closeupFov,
    }
  }

  return {
    id: `rack-overview-${currentStep}`,
    position: NETWORK_WORKSTATION.technicianCameraPosition,
    target: NETWORK_WORKSTATION.technicianCameraTarget,
    fov: NETWORK_WORKSTATION.overviewFov,
  }
}

function getInspectionCameraView(viewId, requestId) {
  const target = NETWORK_WORKSTATION.rackInspectionTarget
  const views = {
    front: {
      position: [0, 2.55, 4],
      fov: 46,
    },
    left: {
      position: [-2.15, 2.2, 7.9],
      fov: 47,
    },
    right: {
      position: [2.3, 2.2, 7.9],
      fov: 47,
    },
    rear: {
      position: [0, 2.55, 9.2],
      fov: 50,
    },
  }
  const view = views[viewId]

  return view
    ? {
        id: `inspection-${viewId}-${requestId}`,
        position: view.position,
        target,
        fov: view.fov,
        duration: 0.62,
      }
    : null
}

function clampCameraToRoom(camera) {
  const { roomBounds } = NETWORK_INSPECTION_LIMITS

  camera.position.x = Math.min(
    Math.max(camera.position.x, roomBounds.minX),
    roomBounds.maxX,
  )
  camera.position.y = Math.min(
    Math.max(camera.position.y, roomBounds.minY),
    roomBounds.maxY,
  )
  camera.position.z = Math.min(
    Math.max(camera.position.z, roomBounds.minZ),
    roomBounds.maxZ,
  )
  camera.updateMatrixWorld()
}

export default function NetworkRackCameraController() {
  const camera = useThree((state) => state.camera)
  const cameraRef = useRef(camera)
  const reducedMotion = useSettingsStore((state) => state.reducedMotion)
  const controlsRef = useRef(null)
  const transition = useRef(null)
  const currentViewId = useRef(null)
  const handledInspectionRequestId = useRef(0)
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
  const selectedCableId = useNetworkTrainingStore(
    (state) => state.selectedCableId,
  )
  const selectedSourcePortId = useNetworkTrainingStore(
    (state) => state.selectedSourcePortId,
  )
  const isProcedureAnimating = useNetworkTrainingStore(
    (state) => state.isProcedureAnimating,
  )
  const networkOverlay = useNetworkTrainingStore(
    (state) => state.networkOverlay,
  )
  const troubleshootingMode = useNetworkTrainingStore(
    (state) => state.troubleshootingMode,
  )
  const inspectionViewRequest = useNetworkTrainingStore(
    (state) => state.inspectionViewRequest,
  )
  const isNetworkFocused =
    activeWorkstationId === NETWORK_WORKSTATION.id &&
    workstationPhase === WORKSTATION_PHASES.FOCUSED
  const inspectionEnabled =
    isNetworkFocused &&
    networkTrainingStarted &&
    !isProcedureAnimating &&
    !networkOverlay

  useEffect(() => {
    const activeCamera = cameraRef.current

    if (!isNetworkFocused) {
      transition.current = null
      currentViewId.current = null
      handledInspectionRequestId.current = inspectionViewRequest.id

      if (controlsRef.current) {
        controlsRef.current.enabled = false
      }

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

    const automaticView = getNetworkCameraView(
      networkCurrentStep,
      selectedCableId,
      selectedSourcePortId,
      troubleshootingMode,
    )
    const hasNewInspectionRequest =
      inspectionViewRequest.id !== handledInspectionRequestId.current
    let destination = automaticView

    if (hasNewInspectionRequest) {
      handledInspectionRequestId.current = inspectionViewRequest.id

      if (inspectionViewRequest.view === 'reset') {
        destination = {
          ...automaticView,
          id: `inspection-reset-${automaticView.id}-${inspectionViewRequest.id}`,
        }
      } else {
        destination =
          getInspectionCameraView(
            inspectionViewRequest.view,
            inspectionViewRequest.id,
          ) ?? automaticView
      }
    }

    if (!hasNewInspectionRequest && currentViewId.current === destination.id) {
      return
    }

    const destinationPosition = new Vector3().fromArray(destination.position)
    const destinationTarget = new Vector3().fromArray(destination.target)
    const destinationQuaternion = getFocusQuaternion(
      destinationPosition,
      destinationTarget,
      activeCamera.up,
    )

    if (controlsRef.current) {
      controlsRef.current.enabled = false
    }

    transition.current = {
      destinationViewId: destination.id,
      elapsed: 0,
      duration: reducedMotion
        ? Math.min(
            destination.duration ??
              NETWORK_WORKSTATION.procedureTransitionDuration,
            0.2,
          )
        : destination.duration ??
          NETWORK_WORKSTATION.procedureTransitionDuration,
      startPosition: activeCamera.position.clone(),
      endPosition: destinationPosition,
      endTarget: destinationTarget,
      startQuaternion: activeCamera.quaternion.clone(),
      endQuaternion: destinationQuaternion,
      startFov: activeCamera.fov,
      endFov: destination.fov,
    }
  }, [
    inspectionViewRequest,
    isNetworkFocused,
    networkCurrentStep,
    networkTrainingStarted,
    reducedMotion,
    selectedCableId,
    selectedSourcePortId,
    troubleshootingMode,
  ])

  useFrame((_, delta) => {
    const activeCamera = cameraRef.current

    if (!isNetworkFocused) {
      return
    }

    const activeTransition = transition.current
    const controls = controlsRef.current

    if (!activeTransition) {
      if (controls) {
        controls.enabled = inspectionEnabled
      }

      if (inspectionEnabled) {
        clampCameraToRoom(activeCamera)
      }

      return
    }

    if (controls) {
      controls.enabled = false
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

    if (controls) {
      controls.target.copy(activeTransition.endTarget)
      controls.update()
      controls.enabled = inspectionEnabled
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={inspectionEnabled}
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      minDistance={NETWORK_INSPECTION_LIMITS.minDistance}
      maxDistance={NETWORK_INSPECTION_LIMITS.maxDistance}
      minPolarAngle={NETWORK_INSPECTION_LIMITS.minPolarAngle}
      maxPolarAngle={NETWORK_INSPECTION_LIMITS.maxPolarAngle}
    />
  )
}
