import { PointerLockControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { CapsuleCollider, RigidBody } from '@react-three/rapier'
import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import useKeyboardControls from './useKeyboardControls.js'

const WALK_SPEED = 3.5
const RUN_SPEED = 6
const CAPSULE_HALF_HEIGHT = 0.5
const CAPSULE_RADIUS = 0.35
const EYE_OFFSET = 0.8
const MOVEMENT_RESPONSE = 14

const cameraForward = new Vector3()
const cameraRight = new Vector3()
const targetVelocity = new Vector3()
const horizontalVelocity = new Vector3()

export default function FirstPersonPlayer({
  spawnPosition = [0, 0.85, 4],
  onLockChange,
  enabled = true,
  playerBodyRef,
}) {
  const internalRigidBody = useRef(null)
  const rigidBody = playerBodyRef ?? internalRigidBody
  const pointerLockControls = useRef(null)
  const keyboard = useKeyboardControls()
  const camera = useThree((state) => state.camera)
  const supportsPointerLock =
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof HTMLCanvasElement !== 'undefined' &&
    window.self === window.top &&
    'pointerLockElement' in document &&
    'requestPointerLock' in HTMLCanvasElement.prototype

  useEffect(() => {
    camera.position.set(
      spawnPosition[0],
      spawnPosition[1] + EYE_OFFSET,
      spawnPosition[2],
    )
  }, [camera, spawnPosition])

  useFrame((_, delta) => {
    const body = rigidBody.current

    if (!body) {
      return
    }

    const position = body.translation()
    const currentVelocity = body.linvel()
    const isPointerLocked =
      enabled && (pointerLockControls.current?.isLocked ?? false)
    const { forward, backward, left, right, run } = keyboard.current
    const forwardInput = isPointerLocked ? Number(forward) - Number(backward) : 0
    const rightInput = isPointerLocked ? Number(right) - Number(left) : 0

    if (!enabled) {
      body.setLinvel({ x: 0, y: 0, z: 0 }, true)
      return
    }

    camera.position.set(position.x, position.y + EYE_OFFSET, position.z)

    camera.getWorldDirection(cameraForward)
    cameraForward.y = 0

    if (cameraForward.lengthSq() < 0.0001) {
      cameraForward.set(0, 0, -1)
    } else {
      cameraForward.normalize()
    }

    cameraRight.crossVectors(cameraForward, camera.up).normalize()
    targetVelocity.set(0, 0, 0)
    targetVelocity.addScaledVector(cameraForward, forwardInput)
    targetVelocity.addScaledVector(cameraRight, rightInput)

    if (targetVelocity.lengthSq() > 0) {
      const movementSpeed = run ? RUN_SPEED : WALK_SPEED
      targetVelocity.normalize().multiplyScalar(movementSpeed)
    }

    const movementBlend = 1 - Math.exp(-MOVEMENT_RESPONSE * delta)
    horizontalVelocity
      .set(currentVelocity.x, 0, currentVelocity.z)
      .lerp(targetVelocity, movementBlend)

    body.setLinvel(
      {
        x: horizontalVelocity.x,
        y: currentVelocity.y,
        z: horizontalVelocity.z,
      },
      true,
    )
  })

  return (
    <>
      <RigidBody
        ref={rigidBody}
        position={spawnPosition}
        colliders={false}
        canSleep={false}
        lockRotations
        linearDamping={4}
        angularDamping={10}
        ccd
      >
        <CapsuleCollider
          args={[CAPSULE_HALF_HEIGHT, CAPSULE_RADIUS]}
          friction={0.8}
          restitution={0}
        />
      </RigidBody>

      {supportsPointerLock && enabled && (
        <PointerLockControls
          ref={pointerLockControls}
          selector=".telecom-lab canvas"
          onLock={() => onLockChange?.(true)}
          onUnlock={() => onLockChange?.(false)}
          makeDefault
        />
      )}
    </>
  )
}

export { RUN_SPEED, WALK_SPEED }
