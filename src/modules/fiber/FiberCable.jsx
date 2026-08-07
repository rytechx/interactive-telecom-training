import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import useFiberTrainingStore from '../../store/useFiberTrainingStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../../store/useToolStore.js'
import { FiberJacketStripper } from './FiberTools.jsx'
import {
  FIBER_CABLE_ID,
  FIBER_JACKET_STRIPPING_DURATION,
  FIBER_PROCEDURE_STEPS,
} from './fiberProcedure.js'
import {
  FIBER_TOOL_IDS,
  getFiberToolConfig,
} from './fiberToolConfigs.js'

const CABLE_Y = 0.972
const JACKET_RADIUS = 0.052
const BUFFER_RADIUS = 0.031
const COATING_RADIUS = 0.018
const GLASS_RADIUS = 0.0065
const CABLE_BOTTOM_Z = 0.57
const INNER_CABLE_BOTTOM_Z = 0.545
const INITIAL_JACKET_TOP_Z = -0.3
const STRIPPED_JACKET_TOP_Z = 0.1
const BUFFER_TOP_Z = -0.28
const jacketStripper = getFiberToolConfig(FIBER_TOOL_IDS.JACKET_STRIPPER)

function clamp(value, minimum = 0, maximum = 1) {
  return Math.min(Math.max(value, minimum), maximum)
}

function smoothStep(progress) {
  const clampedProgress = clamp(progress)
  return clampedProgress * clampedProgress * (3 - 2 * clampedProgress)
}

function updateCableSegment(mesh, startZ, endZ, radius) {
  if (!mesh) {
    return
  }

  mesh.position.z = (startZ + endZ) / 2
  mesh.scale.set(radius, Math.abs(endZ - startZ), radius)
}

function FiberLayer({
  layerRef,
  radius,
  startZ,
  endZ,
  color,
  metalness = 0,
  roughness = 0.58,
  transparent = false,
  opacity = 1,
}) {
  return (
    <mesh
      ref={layerRef}
      position={[0, CABLE_Y, (startZ + endZ) / 2]}
      rotation={[Math.PI / 2, 0, 0]}
      scale={[radius, Math.abs(endZ - startZ), radius]}
      castShadow
      receiveShadow
    >
      <cylinderGeometry args={[1, 1, 1, 20]} />
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        transparent={transparent}
        opacity={opacity}
      />
    </mesh>
  )
}

export default function FiberCable({
  hoveredObjectId,
  onHoveredObjectChange,
}) {
  const jacketRef = useRef(null)
  const offcutRef = useRef(null)
  const animatedToolRef = useRef(null)
  const leftHandleRef = useRef(null)
  const rightHandleRef = useRef(null)
  const leftJawRef = useRef(null)
  const rightJawRef = useRef(null)
  const animationProgress = useRef(0)
  const animationActive = useRef(false)
  const currentStep = useFiberTrainingStore((state) => state.currentStep)
  const outerJacketRemoved = useFiberTrainingStore(
    (state) => state.outerJacketRemoved,
  )
  const isProcedureAnimating = useFiberTrainingStore(
    (state) => state.isProcedureAnimating,
  )
  const selectFiberCable = useFiberTrainingStore(
    (state) => state.selectFiberCable,
  )
  const startOuterJacketStripping = useFiberTrainingStore(
    (state) => state.startOuterJacketStripping,
  )
  const completeOuterJacketStripping = useFiberTrainingStore(
    (state) => state.completeOuterJacketStripping,
  )
  const activeToolId = useToolStore((state) => state.activeToolId)
  const toolViewState = useToolStore((state) => state.toolViewState)
  const canSelectCable =
    currentStep === FIBER_PROCEDURE_STEPS.SELECT_FIBER_CABLE &&
    !isProcedureAnimating &&
    toolViewState === TOOL_VIEW_STATES.IDLE
  const canStripJacket =
    currentStep === FIBER_PROCEDURE_STEPS.STRIP_OUTER_JACKET &&
    activeToolId === FIBER_TOOL_IDS.JACKET_STRIPPER &&
    !isProcedureAnimating &&
    toolViewState === TOOL_VIEW_STATES.IDLE
  const canInteract = canSelectCable || canStripJacket
  const isHovered = canInteract && hoveredObjectId === FIBER_CABLE_ID

  useEffect(() => {
    const jacketTopZ = outerJacketRemoved
      ? STRIPPED_JACKET_TOP_Z
      : INITIAL_JACKET_TOP_Z

    animationActive.current =
      currentStep === FIBER_PROCEDURE_STEPS.STRIPPING_OUTER_JACKET &&
      isProcedureAnimating

    if (animationActive.current) {
      animationProgress.current = 0
    }

    updateCableSegment(
      jacketRef.current,
      jacketTopZ,
      CABLE_BOTTOM_Z,
      JACKET_RADIUS,
    )

    if (offcutRef.current) {
      offcutRef.current.visible = false
    }

    if (animatedToolRef.current) {
      animatedToolRef.current.visible = animationActive.current
      animatedToolRef.current.position.set(...jacketStripper.restPosition)
      animatedToolRef.current.rotation.set(...jacketStripper.restRotation)
    }
  }, [currentStep, isProcedureAnimating, outerJacketRemoved])

  useEffect(() => {
    if (!canInteract) {
      onHoveredObjectChange?.(null)
    }
  }, [canInteract, onHoveredObjectChange])

  useEffect(
    () => () => {
      onHoveredObjectChange?.(null)
    },
    [onHoveredObjectChange],
  )

  useFrame((_, delta) => {
    if (!animationActive.current || !animatedToolRef.current) {
      return
    }

    animationProgress.current = Math.min(
      animationProgress.current + delta / FIBER_JACKET_STRIPPING_DURATION,
      1,
    )

    const progress = animationProgress.current
    const approachProgress = smoothStep(progress / 0.28)
    const closeProgress = smoothStep((progress - 0.16) / 0.2)
    const pullProgress = smoothStep((progress - 0.36) / 0.32)
    const releaseProgress = smoothStep((progress - 0.68) / 0.14)
    const returnProgress = smoothStep((progress - 0.76) / 0.24)
    const jawClosure = closeProgress * (1 - releaseProgress)
    const restPosition = jacketStripper.restPosition
    const workPosition = [0, 1.018, STRIPPED_JACKET_TOP_Z]
    const pullPosition = [0, 1.018, INITIAL_JACKET_TOP_Z - 0.2]

    if (returnProgress > 0) {
      animatedToolRef.current.position.set(
        pullPosition[0] + (restPosition[0] - pullPosition[0]) * returnProgress,
        pullPosition[1] + (restPosition[1] - pullPosition[1]) * returnProgress,
        pullPosition[2] + (restPosition[2] - pullPosition[2]) * returnProgress,
      )
      animatedToolRef.current.rotation.set(
        jacketStripper.restRotation[0] * returnProgress,
        jacketStripper.restRotation[1] * returnProgress,
        jacketStripper.restRotation[2] * returnProgress,
      )
    } else if (pullProgress > 0) {
      animatedToolRef.current.position.set(
        workPosition[0],
        workPosition[1],
        workPosition[2] +
          (pullPosition[2] - workPosition[2]) * pullProgress,
      )
      animatedToolRef.current.rotation.set(0, 0, 0)
    } else {
      animatedToolRef.current.position.set(
        restPosition[0] +
          (workPosition[0] - restPosition[0]) * approachProgress,
        restPosition[1] +
          (workPosition[1] - restPosition[1]) * approachProgress,
        restPosition[2] +
          (workPosition[2] - restPosition[2]) * approachProgress,
      )
      animatedToolRef.current.rotation.set(
        jacketStripper.restRotation[0] * (1 - approachProgress),
        jacketStripper.restRotation[1] * (1 - approachProgress),
        jacketStripper.restRotation[2] * (1 - approachProgress),
      )
    }

    if (leftHandleRef.current) {
      leftHandleRef.current.position.x = -0.075 + jawClosure * 0.025
      leftHandleRef.current.rotation.y = 0.16 - jawClosure * 0.12
    }

    if (rightHandleRef.current) {
      rightHandleRef.current.position.x = 0.075 - jawClosure * 0.025
      rightHandleRef.current.rotation.y = -0.16 + jawClosure * 0.12
    }

    if (leftJawRef.current) {
      leftJawRef.current.position.x = -0.064 + jawClosure * 0.035
    }

    if (rightJawRef.current) {
      rightJawRef.current.position.x = 0.064 - jawClosure * 0.035
    }

    updateCableSegment(
      jacketRef.current,
      INITIAL_JACKET_TOP_Z +
        (STRIPPED_JACKET_TOP_Z - INITIAL_JACKET_TOP_Z) * pullProgress,
      CABLE_BOTTOM_Z,
      JACKET_RADIUS,
    )

    if (offcutRef.current) {
      offcutRef.current.visible = pullProgress > 0 && returnProgress < 1
      updateCableSegment(
        offcutRef.current,
        INITIAL_JACKET_TOP_Z - pullProgress * 0.2,
        STRIPPED_JACKET_TOP_Z - pullProgress * 0.2,
        JACKET_RADIUS * 1.035,
      )
    }

    if (progress >= 1) {
      animationActive.current = false
      animatedToolRef.current.visible = false
      completeOuterJacketStripping()
    }
  })

  const handlePointerEnter = (event) => {
    if (!canInteract) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(FIBER_CABLE_ID)
  }

  const handlePointerLeave = (event) => {
    event.stopPropagation()
    onHoveredObjectChange?.(null)
  }

  const handleClick = (event) => {
    if (!canInteract) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(null)

    if (canSelectCable) {
      selectFiberCable(FIBER_CABLE_ID)
      return
    }

    startOuterJacketStripping(activeToolId)
  }

  return (
    <group>
      <FiberLayer
        radius={GLASS_RADIUS}
        startZ={BUFFER_TOP_Z}
        endZ={INNER_CABLE_BOTTOM_Z}
        color="#d7f3f7"
        roughness={0.2}
        transparent
        opacity={0.82}
      />
      <FiberLayer
        radius={COATING_RADIUS}
        startZ={BUFFER_TOP_Z}
        endZ={INNER_CABLE_BOTTOM_Z}
        color="#478bc8"
        roughness={0.42}
      />
      <FiberLayer
        radius={BUFFER_RADIUS}
        startZ={BUFFER_TOP_Z}
        endZ={INNER_CABLE_BOTTOM_Z}
        color="#f0eee3"
        roughness={0.62}
      />
      <FiberLayer
        layerRef={jacketRef}
        radius={JACKET_RADIUS}
        startZ={
          outerJacketRemoved
            ? STRIPPED_JACKET_TOP_Z
            : INITIAL_JACKET_TOP_Z
        }
        endZ={CABLE_BOTTOM_Z}
        color="#e4b33d"
        roughness={0.74}
      />
      <FiberLayer
        layerRef={offcutRef}
        radius={JACKET_RADIUS * 1.035}
        startZ={INITIAL_JACKET_TOP_Z}
        endZ={STRIPPED_JACKET_TOP_Z}
        color="#d7a531"
        roughness={0.76}
      />

      <mesh
        position={[0, CABLE_Y, 0.12]}
        visible={canInteract}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        <boxGeometry args={[0.24, 0.16, 1.08]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {canStripJacket && (
        <mesh position={[0, CABLE_Y, STRIPPED_JACKET_TOP_Z]}>
          <torusGeometry args={[0.075, 0.007, 8, 24]} />
          <meshBasicMaterial color="#86e0ee" toneMapped={false} />
        </mesh>
      )}

      {isHovered && (
        <Html position={[0, CABLE_Y + 0.22, 0.05]} center>
          <div className="tool-tooltip" role="tooltip">
            {canSelectCable ? 'Fiber Optic Cable' : 'Strip Outer Jacket'}
          </div>
        </Html>
      )}

      <group ref={animatedToolRef} visible={false}>
        <FiberJacketStripper
          scale={jacketStripper.scale}
          leftHandleRef={leftHandleRef}
          rightHandleRef={rightHandleRef}
          leftJawRef={leftJawRef}
          rightJawRef={rightJawRef}
        />
      </group>
    </group>
  )
}
