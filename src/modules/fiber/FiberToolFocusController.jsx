import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Matrix4, Quaternion, Vector3 } from 'three'
import useFiberTrainingStore from '../../store/useFiberTrainingStore.js'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../../store/useToolStore.js'
import { FIBER_WORKSTATION } from '../../workstations/workstationConfigs.js'
import { FIBER_PROCEDURE_STEPS } from './fiberProcedure.js'
import { FiberToolModel } from './FiberTools.jsx'
import { FIBER_TOOL_IDS, getFiberToolConfig } from './fiberToolConfigs.js'

const TOOL_INSPECTION_DURATION = 0.7
const lookAtMatrix = new Matrix4()

const cleavingViewSteps = [
  FIBER_PROCEDURE_STEPS.POSITION_FIBER_IN_CLEAVER,
  FIBER_PROCEDURE_STEPS.POSITIONING_FIBER_IN_CLEAVER,
  FIBER_PROCEDURE_STEPS.FIBER_POSITIONED_FOR_CLEAVE,
  FIBER_PROCEDURE_STEPS.CLEAVE_FIBER,
  FIBER_PROCEDURE_STEPS.CLEAVING_FIBER,
  FIBER_PROCEDURE_STEPS.FIBER_CLEAVED,
  FIBER_PROCEDURE_STEPS.TASK_2_COMPLETE,
]

function getFocusQuaternion(cameraPosition, cameraTarget, cameraUp) {
  lookAtMatrix.lookAt(cameraPosition, cameraTarget, cameraUp)
  return new Quaternion().setFromRotationMatrix(lookAtMatrix)
}

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress)
}

function getProcedureView(currentStep) {
  return cleavingViewSteps.includes(currentStep) ? 'cleaving' : 'technician'
}

function getProcedureCamera(view) {
  if (view === 'cleaving') {
    return {
      position: FIBER_WORKSTATION.cleavingCameraPosition,
      target: FIBER_WORKSTATION.cleavingCameraTarget,
      duration: FIBER_WORKSTATION.cleavingTransitionDuration,
    }
  }

  return {
    position: FIBER_WORKSTATION.technicianCameraPosition,
    target: FIBER_WORKSTATION.technicianCameraTarget,
    duration: FIBER_WORKSTATION.technicianTransitionDuration,
  }
}

export default function FiberToolFocusController() {
  const camera = useThree((state) => state.camera)
  const transition = useRef(null)
  const currentView = useRef(null)
  const activeWorkstationId = useInteractionStore(
    (state) => state.activeInteractable?.id ?? null,
  )
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const trainingStarted = useFiberTrainingStore(
    (state) => state.trainingStarted,
  )
  const currentStep = useFiberTrainingStore((state) => state.currentStep)
  const isProcedureAnimating = useFiberTrainingStore(
    (state) => state.isProcedureAnimating,
  )
  const selectedToolId = useToolStore((state) => state.selectedToolId)
  const activeToolId = useToolStore((state) => state.activeToolId)
  const toolViewState = useToolStore((state) => state.toolViewState)
  const completeToolInspection = useToolStore(
    (state) => state.completeToolInspection,
  )
  const completeToolViewExit = useToolStore(
    (state) => state.completeToolViewExit,
  )
  const selectedTool = getFiberToolConfig(selectedToolId)
  const activeTool = getFiberToolConfig(activeToolId)
  const procedureView = getProcedureView(currentStep)
  const isFiberFocused =
    activeWorkstationId === FIBER_WORKSTATION.id &&
    workstationPhase === WORKSTATION_PHASES.FOCUSED
  const usesDedicatedCleaver =
    activeToolId === FIBER_TOOL_IDS.CLEAVER &&
    cleavingViewSteps.includes(currentStep)

  useEffect(() => {
    if (!isFiberFocused) {
      transition.current = null
      currentView.current = null
      return
    }

    let destinationPosition = null
    let destinationTarget = null
    let destinationView = null
    let phase = null
    let duration = TOOL_INSPECTION_DURATION

    if (toolViewState === TOOL_VIEW_STATES.ENTERING && selectedTool) {
      destinationPosition = new Vector3().fromArray(
        selectedTool.inspectionCameraPosition,
      )
      destinationTarget = new Vector3().fromArray(
        selectedTool.inspectionCameraTarget,
      )
      destinationView = 'inspection'
      phase = TOOL_VIEW_STATES.ENTERING
    } else if (toolViewState === TOOL_VIEW_STATES.EXITING) {
      const procedureCamera = getProcedureCamera(procedureView)
      destinationPosition = new Vector3().fromArray(procedureCamera.position)
      destinationTarget = new Vector3().fromArray(procedureCamera.target)
      destinationView = procedureView
      phase = TOOL_VIEW_STATES.EXITING
      duration = procedureCamera.duration
    } else if (
      trainingStarted &&
      toolViewState === TOOL_VIEW_STATES.IDLE &&
      currentView.current !== procedureView
    ) {
      const procedureCamera = getProcedureCamera(procedureView)
      destinationPosition = new Vector3().fromArray(procedureCamera.position)
      destinationTarget = new Vector3().fromArray(procedureCamera.target)
      destinationView = procedureView
      phase = procedureView
      duration = procedureCamera.duration
    }

    if (!destinationPosition || !destinationTarget || !phase) {
      return
    }

    transition.current = {
      phase,
      destinationView,
      elapsed: 0,
      duration,
      startPosition: camera.position.clone(),
      endPosition: destinationPosition,
      startQuaternion: camera.quaternion.clone(),
      endQuaternion: getFocusQuaternion(
        destinationPosition,
        destinationTarget,
        camera.up,
      ),
    }
  }, [
    camera,
    currentStep,
    isFiberFocused,
    procedureView,
    selectedTool,
    toolViewState,
    trainingStarted,
  ])

  useFrame((_, delta) => {
    const activeTransition = transition.current

    if (!activeTransition || !isFiberFocused) {
      return
    }

    activeTransition.elapsed += delta
    const progress = Math.min(
      activeTransition.elapsed / Math.max(activeTransition.duration, 0.01),
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

    if (progress < 1) {
      return
    }

    transition.current = null
    currentView.current = activeTransition.destinationView

    if (activeTransition.phase === TOOL_VIEW_STATES.ENTERING) {
      completeToolInspection()
    } else if (activeTransition.phase === TOOL_VIEW_STATES.EXITING) {
      completeToolViewExit()
    }
  })

  return isFiberFocused &&
    trainingStarted &&
    activeTool &&
    !isProcedureAnimating &&
    !usesDedicatedCleaver ? (
    <group position={FIBER_WORKSTATION.interactionPosition}>
      <FiberToolModel
        toolId={activeTool.id}
        position={activeTool.restPosition}
        rotation={activeTool.restRotation}
        scale={activeTool.scale}
      />
    </group>
  ) : null
}
