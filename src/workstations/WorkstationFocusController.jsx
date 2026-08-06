import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Matrix4, Quaternion, Vector3 } from 'three'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../store/useInteractionStore.js'
import { getWorkstationConfig } from './workstationConfigs.js'

const lookAtMatrix = new Matrix4()

function getFocusQuaternion(cameraPosition, cameraTarget, cameraUp) {
  lookAtMatrix.lookAt(cameraPosition, cameraTarget, cameraUp)
  return new Quaternion().setFromRotationMatrix(lookAtMatrix)
}

function stopPlayerBody(body) {
  body.setLinvel({ x: 0, y: 0, z: 0 }, true)
  body.setAngvel({ x: 0, y: 0, z: 0 }, true)
}

function freezePlayerBody(body, position) {
  stopPlayerBody(body)
  body.setTranslation(position, true)
  body.setEnabledTranslations(false, false, false, true)
}

function restorePlayerBody(body, position) {
  body.setEnabledTranslations(true, true, true, true)
  body.setTranslation(position, true)
  stopPlayerBody(body)
}

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress)
}

export default function WorkstationFocusController({ playerBodyRef }) {
  const camera = useThree((state) => state.camera)
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const activeWorkstationId = useInteractionStore(
    (state) => state.activeInteractable?.id ?? null,
  )
  const completeWorkstationFocus = useInteractionStore(
    (state) => state.completeWorkstationFocus,
  )
  const completeWorkstationExit = useInteractionStore(
    (state) => state.completeWorkstationExit,
  )
  const savedExplorationState = useRef(null)
  const transition = useRef(null)

  useEffect(() => {
    if (workstationPhase === WORKSTATION_PHASES.ENTERING) {
      const playerBody = playerBodyRef.current
      const workstation = getWorkstationConfig(activeWorkstationId)

      if (!playerBody || !workstation) {
        completeWorkstationExit()
        return
      }

      const playerTranslation = playerBody.translation()
      const playerPosition = {
        x: playerTranslation.x,
        y: playerTranslation.y,
        z: playerTranslation.z,
      }
      const focusCameraPosition = new Vector3().fromArray(
        workstation.focusCameraPosition,
      )
      const focusCameraTarget = new Vector3().fromArray(
        workstation.focusCameraTarget,
      )

      savedExplorationState.current = {
        workstationId: workstation.id,
        playerPosition,
        cameraPosition: camera.position.clone(),
        cameraQuaternion: camera.quaternion.clone(),
      }

      freezePlayerBody(playerBody, playerPosition)

      transition.current = {
        phase: WORKSTATION_PHASES.ENTERING,
        elapsed: 0,
        duration: workstation.transitionDuration,
        startPosition: camera.position.clone(),
        endPosition: focusCameraPosition,
        startQuaternion: camera.quaternion.clone(),
        endQuaternion: getFocusQuaternion(
          focusCameraPosition,
          focusCameraTarget,
          camera.up,
        ),
      }
      return
    }

    if (workstationPhase === WORKSTATION_PHASES.EXITING) {
      const savedState = savedExplorationState.current

      if (!savedState) {
        completeWorkstationExit()
        return
      }

      const workstation = getWorkstationConfig(savedState.workstationId)

      transition.current = {
        phase: WORKSTATION_PHASES.EXITING,
        elapsed: 0,
        duration: workstation?.transitionDuration ?? 1,
        startPosition: camera.position.clone(),
        endPosition: savedState.cameraPosition,
        startQuaternion: camera.quaternion.clone(),
        endQuaternion: savedState.cameraQuaternion,
      }
    }
  }, [
    activeWorkstationId,
    camera,
    completeWorkstationExit,
    playerBodyRef,
    workstationPhase,
  ])

  useEffect(
    () => () => {
      const playerBody = playerBodyRef.current
      const savedState = savedExplorationState.current

      if (playerBody && savedState) {
        restorePlayerBody(playerBody, savedState.playerPosition)
      }
    },
    [playerBodyRef],
  )

  useFrame((_, delta) => {
    const activeTransition = transition.current

    if (!activeTransition) {
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

    if (activeTransition.phase === WORKSTATION_PHASES.ENTERING) {
      completeWorkstationFocus()
      return
    }

    const savedState = savedExplorationState.current
    const playerBody = playerBodyRef.current

    if (savedState && playerBody) {
      restorePlayerBody(playerBody, savedState.playerPosition)
    }

    savedExplorationState.current = null
    completeWorkstationExit()
  })

  return null
}
