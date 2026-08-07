import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Matrix4, Quaternion, Vector3 } from 'three'
import useFiberTrainingStore from '../../store/useFiberTrainingStore.js'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../../store/useToolStore.js'
import { FIBER_WORKSTATION } from '../../workstations/workstationConfigs.js'
import { FiberToolModel } from './FiberTools.jsx'
import { getFiberToolConfig } from './fiberToolConfigs.js'

const TOOL_INSPECTION_DURATION = 0.7
const lookAtMatrix = new Matrix4()

function getFocusQuaternion(cameraPosition, cameraTarget, cameraUp) {
  lookAtMatrix.lookAt(cameraPosition, cameraTarget, cameraUp)
  return new Quaternion().setFromRotationMatrix(lookAtMatrix)
}

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress)
}

export default function FiberToolFocusController() {
  const camera = useThree((state) => state.camera)
  const transition = useRef(null)
  const previousTrainingStarted = useRef(false)
  const activeWorkstationId = useInteractionStore(
    (state) => state.activeInteractable?.id ?? null,
  )
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const trainingStarted = useFiberTrainingStore(
    (state) => state.trainingStarted,
  )
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
  const isFiberFocused =
    activeWorkstationId === FIBER_WORKSTATION.id &&
    workstationPhase === WORKSTATION_PHASES.FOCUSED

  useEffect(() => {
    if (!isFiberFocused) {
      transition.current = null
      previousTrainingStarted.current = false
      return
    }

    let destinationPosition = null
    let destinationTarget = null
    let phase = null
    let duration = TOOL_INSPECTION_DURATION

    if (toolViewState === TOOL_VIEW_STATES.ENTERING && selectedTool) {
      destinationPosition = new Vector3().fromArray(
        selectedTool.inspectionCameraPosition,
      )
      destinationTarget = new Vector3().fromArray(
        selectedTool.inspectionCameraTarget,
      )
      phase = TOOL_VIEW_STATES.ENTERING
    } else if (toolViewState === TOOL_VIEW_STATES.EXITING) {
      destinationPosition = new Vector3().fromArray(
        FIBER_WORKSTATION.technicianCameraPosition,
      )
      destinationTarget = new Vector3().fromArray(
        FIBER_WORKSTATION.technicianCameraTarget,
      )
      phase = TOOL_VIEW_STATES.EXITING
    } else if (trainingStarted && !previousTrainingStarted.current) {
      destinationPosition = new Vector3().fromArray(
        FIBER_WORKSTATION.technicianCameraPosition,
      )
      destinationTarget = new Vector3().fromArray(
        FIBER_WORKSTATION.technicianCameraTarget,
      )
      phase = 'technician-view'
      duration = FIBER_WORKSTATION.technicianTransitionDuration
    }

    previousTrainingStarted.current = trainingStarted

    if (!destinationPosition || !destinationTarget || !phase) {
      return
    }

    transition.current = {
      phase,
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
    isFiberFocused,
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

    if (activeTransition.phase === TOOL_VIEW_STATES.ENTERING) {
      completeToolInspection()
    } else if (activeTransition.phase === TOOL_VIEW_STATES.EXITING) {
      completeToolViewExit()
    }
  })

  return isFiberFocused &&
    trainingStarted &&
    activeTool &&
    !isProcedureAnimating ? (
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
