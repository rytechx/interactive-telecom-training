import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import useFiberTrainingStore from '../../store/useFiberTrainingStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../../store/useToolStore.js'
import {
  FiberCleaningWipe,
  FiberCleaver,
  FiberJacketStripper,
  PrecisionFiberStripper,
} from './FiberTools.jsx'
import {
  FIBER_CABLE_ID,
  FIBER_CLEANING_DURATION,
  FIBER_CLEAVING_DURATION,
  FIBER_COATING_STRIPPING_DURATION,
  FIBER_JACKET_STRIPPING_DURATION,
  FIBER_POSITIONING_DURATION,
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
const INNER_FIBER_TIP_Z = -0.266
const STRIPPED_COATING_TOP_Z = 0.015
const CLEAVED_FIBER_TIP_Z = -0.145
const BARE_FIBER_CLEANING_CENTER_Z =
  (INNER_FIBER_TIP_Z + STRIPPED_COATING_TOP_Z) / 2
const BARE_FIBER_CLEANING_HITBOX_SIZE = [
  GLASS_RADIUS * 10,
  0.12,
  Math.abs(STRIPPED_COATING_TOP_Z - INNER_FIBER_TIP_Z) + 0.06,
]
const CLEAVER_CABLE_POSITION = [-0.9, 0, -0.1]
const jacketStripper = getFiberToolConfig(FIBER_TOOL_IDS.JACKET_STRIPPER)
const precisionStripper = getFiberToolConfig(FIBER_TOOL_IDS.PRECISION_STRIPPER)
const cleaningWipe = getFiberToolConfig(FIBER_TOOL_IDS.CLEANING_PAD)
const fiberCleaver = getFiberToolConfig(FIBER_TOOL_IDS.CLEAVER)

const ANIMATION_TYPES = Object.freeze({
  JACKET: 'jacket-stripping',
  COATING: 'coating-stripping',
  CLEANING: 'fiber-cleaning',
  POSITIONING: 'fiber-positioning',
  CLEAVING: 'fiber-cleaving',
})

const cleaverWorkflowSteps = [
  FIBER_PROCEDURE_STEPS.POSITION_FIBER_IN_CLEAVER,
  FIBER_PROCEDURE_STEPS.POSITIONING_FIBER_IN_CLEAVER,
  FIBER_PROCEDURE_STEPS.FIBER_POSITIONED_FOR_CLEAVE,
  FIBER_PROCEDURE_STEPS.CLEAVE_FIBER,
  FIBER_PROCEDURE_STEPS.CLEAVING_FIBER,
  FIBER_PROCEDURE_STEPS.FIBER_CLEAVED,
  FIBER_PROCEDURE_STEPS.TASK_2_COMPLETE,
]

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

function interpolatePosition(group, start, end, progress) {
  group.position.set(
    start[0] + (end[0] - start[0]) * progress,
    start[1] + (end[1] - start[1]) * progress,
    start[2] + (end[2] - start[2]) * progress,
  )
}

function interpolateRotation(group, start, end, progress) {
  group.rotation.set(
    start[0] + (end[0] - start[0]) * progress,
    start[1] + (end[1] - start[1]) * progress,
    start[2] + (end[2] - start[2]) * progress,
  )
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
  visible = true,
}) {
  return (
    <mesh
      ref={layerRef}
      position={[0, CABLE_Y, (startZ + endZ) / 2]}
      rotation={[Math.PI / 2, 0, 0]}
      scale={[radius, Math.abs(endZ - startZ), radius]}
      visible={visible}
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

function getAnimationType(currentStep, isProcedureAnimating) {
  if (!isProcedureAnimating) {
    return null
  }

  if (currentStep === FIBER_PROCEDURE_STEPS.STRIPPING_OUTER_JACKET) {
    return ANIMATION_TYPES.JACKET
  }

  if (currentStep === FIBER_PROCEDURE_STEPS.STRIPPING_FIBER_COATING) {
    return ANIMATION_TYPES.COATING
  }

  if (currentStep === FIBER_PROCEDURE_STEPS.CLEANING_FIBER) {
    return ANIMATION_TYPES.CLEANING
  }

  if (currentStep === FIBER_PROCEDURE_STEPS.POSITIONING_FIBER_IN_CLEAVER) {
    return ANIMATION_TYPES.POSITIONING
  }

  if (currentStep === FIBER_PROCEDURE_STEPS.CLEAVING_FIBER) {
    return ANIMATION_TYPES.CLEAVING
  }

  return null
}

export default function FiberCable({
  hoveredObjectId,
  onHoveredObjectChange,
}) {
  const cableAssemblyRef = useRef(null)
  const jacketRef = useRef(null)
  const jacketOffcutRef = useRef(null)
  const bufferRef = useRef(null)
  const coatingRef = useRef(null)
  const coatingOffcutRef = useRef(null)
  const glassRef = useRef(null)
  const wasteFiberRef = useRef(null)
  const jacketToolRef = useRef(null)
  const jacketLeftHandleRef = useRef(null)
  const jacketRightHandleRef = useRef(null)
  const jacketLeftJawRef = useRef(null)
  const jacketRightJawRef = useRef(null)
  const precisionToolRef = useRef(null)
  const precisionLeftHandleRef = useRef(null)
  const precisionRightHandleRef = useRef(null)
  const precisionLeftJawRef = useRef(null)
  const precisionRightJawRef = useRef(null)
  const cleaningWipeRef = useRef(null)
  const cleaverLidRef = useRef(null)
  const cleaverClampRef = useRef(null)
  const cleaverBladeRef = useRef(null)
  const animationProgress = useRef(0)
  const activeAnimation = useRef(null)
  const currentStep = useFiberTrainingStore((state) => state.currentStep)
  const outerJacketRemoved = useFiberTrainingStore(
    (state) => state.outerJacketRemoved,
  )
  const coatingRemoved = useFiberTrainingStore(
    (state) => state.coatingRemoved,
  )
  const bareFiberExposed = useFiberTrainingStore(
    (state) => state.bareFiberExposed,
  )
  const fiberCleaned = useFiberTrainingStore((state) => state.fiberCleaned)
  const fiberPositionedInCleaver = useFiberTrainingStore(
    (state) => state.fiberPositionedInCleaver,
  )
  const fiberCleaved = useFiberTrainingStore((state) => state.fiberCleaved)
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
  const startFiberCoatingStripping = useFiberTrainingStore(
    (state) => state.startFiberCoatingStripping,
  )
  const completeFiberCoatingStripping = useFiberTrainingStore(
    (state) => state.completeFiberCoatingStripping,
  )
  const startFiberCleaning = useFiberTrainingStore(
    (state) => state.startFiberCleaning,
  )
  const completeFiberCleaning = useFiberTrainingStore(
    (state) => state.completeFiberCleaning,
  )
  const startFiberPositioning = useFiberTrainingStore(
    (state) => state.startFiberPositioning,
  )
  const completeFiberPositioning = useFiberTrainingStore(
    (state) => state.completeFiberPositioning,
  )
  const startFiberCleaving = useFiberTrainingStore(
    (state) => state.startFiberCleaving,
  )
  const completeFiberCleaving = useFiberTrainingStore(
    (state) => state.completeFiberCleaving,
  )
  const activeToolId = useToolStore((state) => state.activeToolId)
  const toolViewState = useToolStore((state) => state.toolViewState)
  const canUseWorkpiece =
    !isProcedureAnimating && toolViewState === TOOL_VIEW_STATES.IDLE
  const canSelectCable =
    currentStep === FIBER_PROCEDURE_STEPS.SELECT_FIBER_CABLE &&
    canUseWorkpiece
  const canStripJacket =
    currentStep === FIBER_PROCEDURE_STEPS.STRIP_OUTER_JACKET &&
    activeToolId === FIBER_TOOL_IDS.JACKET_STRIPPER &&
    canUseWorkpiece
  const canStripCoating =
    currentStep === FIBER_PROCEDURE_STEPS.STRIP_FIBER_COATING &&
    activeToolId === FIBER_TOOL_IDS.PRECISION_STRIPPER &&
    canUseWorkpiece
  const canCleanFiber =
    currentStep === FIBER_PROCEDURE_STEPS.CLEAN_BARE_FIBER &&
    activeToolId === FIBER_TOOL_IDS.CLEANING_PAD &&
    canUseWorkpiece
  const canPositionFiber =
    currentStep === FIBER_PROCEDURE_STEPS.POSITION_FIBER_IN_CLEAVER &&
    activeToolId === FIBER_TOOL_IDS.CLEAVER &&
    canUseWorkpiece
  const canCleaveFiber =
    currentStep === FIBER_PROCEDURE_STEPS.FIBER_POSITIONED_FOR_CLEAVE &&
    activeToolId === FIBER_TOOL_IDS.CLEAVER &&
    canUseWorkpiece
  const canInteract =
    canSelectCable ||
    canStripJacket ||
    canStripCoating ||
    canCleanFiber ||
    canPositionFiber ||
    canCleaveFiber
  const isHovered = canInteract && hoveredObjectId === FIBER_CABLE_ID
  const showDedicatedCleaver =
    activeToolId === FIBER_TOOL_IDS.CLEAVER &&
    cleaverWorkflowSteps.includes(currentStep)

  useEffect(() => {
    const nextAnimation = getAnimationType(
      currentStep,
      isProcedureAnimating,
    )

    if (nextAnimation && activeAnimation.current !== nextAnimation) {
      animationProgress.current = 0
    }

    activeAnimation.current = nextAnimation

    updateCableSegment(
      jacketRef.current,
      outerJacketRemoved ? STRIPPED_JACKET_TOP_Z : INITIAL_JACKET_TOP_Z,
      CABLE_BOTTOM_Z,
      JACKET_RADIUS,
    )
    updateCableSegment(
      bufferRef.current,
      coatingRemoved ? STRIPPED_COATING_TOP_Z : BUFFER_TOP_Z,
      INNER_CABLE_BOTTOM_Z,
      BUFFER_RADIUS,
    )
    updateCableSegment(
      coatingRef.current,
      coatingRemoved ? STRIPPED_COATING_TOP_Z : BUFFER_TOP_Z,
      INNER_CABLE_BOTTOM_Z,
      COATING_RADIUS,
    )
    updateCableSegment(
      glassRef.current,
      fiberCleaved ? CLEAVED_FIBER_TIP_Z : INNER_FIBER_TIP_Z,
      INNER_CABLE_BOTTOM_Z,
      GLASS_RADIUS,
    )

    if (cableAssemblyRef.current) {
      if (fiberPositionedInCleaver) {
        cableAssemblyRef.current.position.set(...CLEAVER_CABLE_POSITION)
      } else if (nextAnimation !== ANIMATION_TYPES.POSITIONING) {
        cableAssemblyRef.current.position.set(0, 0, 0)
      }
    }

    if (jacketOffcutRef.current) {
      jacketOffcutRef.current.visible = false
    }

    if (coatingOffcutRef.current) {
      coatingOffcutRef.current.visible = false
    }

    if (wasteFiberRef.current) {
      wasteFiberRef.current.visible = fiberCleaved
      updateCableSegment(
        wasteFiberRef.current,
        INNER_FIBER_TIP_Z,
        CLEAVED_FIBER_TIP_Z,
        GLASS_RADIUS * 1.08,
      )
      wasteFiberRef.current.position.x = fiberCleaved ? 0.075 : 0
      wasteFiberRef.current.position.y = fiberCleaved ? CABLE_Y - 0.055 : CABLE_Y
    }

    if (jacketToolRef.current) {
      jacketToolRef.current.visible = nextAnimation === ANIMATION_TYPES.JACKET
      jacketToolRef.current.position.set(...jacketStripper.restPosition)
      jacketToolRef.current.rotation.set(...jacketStripper.restRotation)
    }

    if (precisionToolRef.current) {
      precisionToolRef.current.visible = nextAnimation === ANIMATION_TYPES.COATING
      precisionToolRef.current.position.set(...precisionStripper.restPosition)
      precisionToolRef.current.rotation.set(...precisionStripper.restRotation)
    }

    if (cleaningWipeRef.current) {
      cleaningWipeRef.current.visible = nextAnimation === ANIMATION_TYPES.CLEANING
      cleaningWipeRef.current.position.set(...cleaningWipe.restPosition)
      cleaningWipeRef.current.rotation.set(...cleaningWipe.restRotation)
    }

    if (cleaverLidRef.current) {
      cleaverLidRef.current.rotation.x = fiberCleaved ? -0.16 : -0.28
    }

    if (cleaverClampRef.current) {
      cleaverClampRef.current.position.y = 0.17
    }

    if (cleaverBladeRef.current) {
      cleaverBladeRef.current.position.x = fiberCleaved ? 0.13 : -0.14
    }
  }, [
    coatingRemoved,
    currentStep,
    fiberCleaved,
    fiberPositionedInCleaver,
    isProcedureAnimating,
    outerJacketRemoved,
  ])

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
    const animationType = activeAnimation.current

    if (!animationType) {
      return
    }

    const duration =
      animationType === ANIMATION_TYPES.JACKET
        ? FIBER_JACKET_STRIPPING_DURATION
        : animationType === ANIMATION_TYPES.COATING
          ? FIBER_COATING_STRIPPING_DURATION
          : animationType === ANIMATION_TYPES.CLEANING
            ? FIBER_CLEANING_DURATION
            : animationType === ANIMATION_TYPES.POSITIONING
              ? FIBER_POSITIONING_DURATION
              : FIBER_CLEAVING_DURATION

    animationProgress.current = Math.min(
      animationProgress.current + delta / duration,
      1,
    )
    const progress = animationProgress.current

    if (animationType === ANIMATION_TYPES.JACKET && jacketToolRef.current) {
      const approachProgress = smoothStep(progress / 0.28)
      const closeProgress = smoothStep((progress - 0.16) / 0.2)
      const pullProgress = smoothStep((progress - 0.36) / 0.32)
      const releaseProgress = smoothStep((progress - 0.68) / 0.14)
      const returnProgress = smoothStep((progress - 0.76) / 0.24)
      const jawClosure = closeProgress * (1 - releaseProgress)
      const workPosition = [0, 1.018, STRIPPED_JACKET_TOP_Z]
      const pullPosition = [0, 1.018, INITIAL_JACKET_TOP_Z - 0.2]

      if (returnProgress > 0) {
        interpolatePosition(
          jacketToolRef.current,
          pullPosition,
          jacketStripper.restPosition,
          returnProgress,
        )
        interpolateRotation(
          jacketToolRef.current,
          [0, 0, 0],
          jacketStripper.restRotation,
          returnProgress,
        )
      } else if (pullProgress > 0) {
        interpolatePosition(
          jacketToolRef.current,
          workPosition,
          pullPosition,
          pullProgress,
        )
        jacketToolRef.current.rotation.set(0, 0, 0)
      } else {
        interpolatePosition(
          jacketToolRef.current,
          jacketStripper.restPosition,
          workPosition,
          approachProgress,
        )
        interpolateRotation(
          jacketToolRef.current,
          jacketStripper.restRotation,
          [0, 0, 0],
          approachProgress,
        )
      }

      if (jacketLeftHandleRef.current) {
        jacketLeftHandleRef.current.position.x = -0.075 + jawClosure * 0.025
        jacketLeftHandleRef.current.rotation.y = 0.16 - jawClosure * 0.12
      }
      if (jacketRightHandleRef.current) {
        jacketRightHandleRef.current.position.x = 0.075 - jawClosure * 0.025
        jacketRightHandleRef.current.rotation.y = -0.16 + jawClosure * 0.12
      }
      if (jacketLeftJawRef.current) {
        jacketLeftJawRef.current.position.x = -0.064 + jawClosure * 0.035
      }
      if (jacketRightJawRef.current) {
        jacketRightJawRef.current.position.x = 0.064 - jawClosure * 0.035
      }

      updateCableSegment(
        jacketRef.current,
        INITIAL_JACKET_TOP_Z +
          (STRIPPED_JACKET_TOP_Z - INITIAL_JACKET_TOP_Z) * pullProgress,
        CABLE_BOTTOM_Z,
        JACKET_RADIUS,
      )

      if (jacketOffcutRef.current) {
        jacketOffcutRef.current.visible = pullProgress > 0 && returnProgress < 1
        updateCableSegment(
          jacketOffcutRef.current,
          INITIAL_JACKET_TOP_Z - pullProgress * 0.2,
          STRIPPED_JACKET_TOP_Z - pullProgress * 0.2,
          JACKET_RADIUS * 1.035,
        )
      }

      if (progress >= 1) {
        activeAnimation.current = null
        jacketToolRef.current.visible = false
        completeOuterJacketStripping()
      }

      return
    }

    if (animationType === ANIMATION_TYPES.COATING && precisionToolRef.current) {
      const approachProgress = smoothStep(progress / 0.28)
      const closeProgress = smoothStep((progress - 0.17) / 0.18)
      const pullProgress = smoothStep((progress - 0.36) / 0.32)
      const releaseProgress = smoothStep((progress - 0.68) / 0.14)
      const returnProgress = smoothStep((progress - 0.77) / 0.23)
      const jawClosure = closeProgress * (1 - releaseProgress)
      const workPosition = [0, 1.014, STRIPPED_COATING_TOP_Z]
      const pullPosition = [0, 1.014, BUFFER_TOP_Z - 0.18]

      if (returnProgress > 0) {
        interpolatePosition(
          precisionToolRef.current,
          pullPosition,
          precisionStripper.restPosition,
          returnProgress,
        )
        interpolateRotation(
          precisionToolRef.current,
          [0, 0, 0],
          precisionStripper.restRotation,
          returnProgress,
        )
      } else if (pullProgress > 0) {
        interpolatePosition(
          precisionToolRef.current,
          workPosition,
          pullPosition,
          pullProgress,
        )
        precisionToolRef.current.rotation.set(0, 0, 0)
      } else {
        interpolatePosition(
          precisionToolRef.current,
          precisionStripper.restPosition,
          workPosition,
          approachProgress,
        )
        interpolateRotation(
          precisionToolRef.current,
          precisionStripper.restRotation,
          [0, 0, 0],
          approachProgress,
        )
      }

      if (precisionLeftHandleRef.current) {
        precisionLeftHandleRef.current.position.x = -0.052 + jawClosure * 0.018
        precisionLeftHandleRef.current.rotation.y = 0.11 - jawClosure * 0.08
      }
      if (precisionRightHandleRef.current) {
        precisionRightHandleRef.current.position.x = 0.052 - jawClosure * 0.018
        precisionRightHandleRef.current.rotation.y = -0.11 + jawClosure * 0.08
      }
      if (precisionLeftJawRef.current) {
        precisionLeftJawRef.current.position.x = -0.04 + jawClosure * 0.026
      }
      if (precisionRightJawRef.current) {
        precisionRightJawRef.current.position.x = 0.04 - jawClosure * 0.026
      }

      const strippedLayerTop =
        BUFFER_TOP_Z +
        (STRIPPED_COATING_TOP_Z - BUFFER_TOP_Z) * pullProgress
      updateCableSegment(
        bufferRef.current,
        strippedLayerTop,
        INNER_CABLE_BOTTOM_Z,
        BUFFER_RADIUS,
      )
      updateCableSegment(
        coatingRef.current,
        strippedLayerTop,
        INNER_CABLE_BOTTOM_Z,
        COATING_RADIUS,
      )

      if (coatingOffcutRef.current) {
        coatingOffcutRef.current.visible = pullProgress > 0 && returnProgress < 1
        updateCableSegment(
          coatingOffcutRef.current,
          BUFFER_TOP_Z - pullProgress * 0.18,
          STRIPPED_COATING_TOP_Z - pullProgress * 0.18,
          BUFFER_RADIUS * 1.025,
        )
      }

      if (progress >= 1) {
        activeAnimation.current = null
        precisionToolRef.current.visible = false
        completeFiberCoatingStripping()
      }

      return
    }

    if (animationType === ANIMATION_TYPES.CLEANING && cleaningWipeRef.current) {
      const approachProgress = smoothStep(progress / 0.3)
      const passProgress = smoothStep((progress - 0.28) / 0.34)
      const returnProgress = smoothStep((progress - 0.68) / 0.32)
      const contactStart = [0, 1.012, STRIPPED_COATING_TOP_Z - 0.01]
      const contactEnd = [0, 1.012, INNER_FIBER_TIP_Z + 0.02]

      if (returnProgress > 0) {
        interpolatePosition(
          cleaningWipeRef.current,
          contactEnd,
          cleaningWipe.restPosition,
          returnProgress,
        )
        interpolateRotation(
          cleaningWipeRef.current,
          [0, 0, 0],
          cleaningWipe.restRotation,
          returnProgress,
        )
      } else if (passProgress > 0) {
        interpolatePosition(
          cleaningWipeRef.current,
          contactStart,
          contactEnd,
          passProgress,
        )
        cleaningWipeRef.current.rotation.set(0, 0, 0)
      } else {
        interpolatePosition(
          cleaningWipeRef.current,
          cleaningWipe.restPosition,
          contactStart,
          approachProgress,
        )
        interpolateRotation(
          cleaningWipeRef.current,
          cleaningWipe.restRotation,
          [0, 0, 0],
          approachProgress,
        )
      }

      if (progress >= 1) {
        activeAnimation.current = null
        cleaningWipeRef.current.visible = false
        completeFiberCleaning()
      }

      return
    }

    if (
      animationType === ANIMATION_TYPES.POSITIONING &&
      cableAssemblyRef.current
    ) {
      const movementProgress = smoothStep(progress)
      interpolatePosition(
        cableAssemblyRef.current,
        [0, 0, 0],
        CLEAVER_CABLE_POSITION,
        movementProgress,
      )
      cableAssemblyRef.current.position.y = Math.sin(Math.PI * progress) * 0.025

      if (progress >= 1) {
        activeAnimation.current = null
        cableAssemblyRef.current.position.set(...CLEAVER_CABLE_POSITION)
        completeFiberPositioning()
      }

      return
    }

    if (animationType === ANIMATION_TYPES.CLEAVING) {
      const clampProgress = smoothStep(progress / 0.22)
      const lidProgress = smoothStep((progress - 0.08) / 0.28)
      const bladeProgress = smoothStep((progress - 0.36) / 0.28)
      const cutProgress = smoothStep((progress - 0.52) / 0.18)
      const openProgress = smoothStep((progress - 0.74) / 0.26)

      if (cleaverClampRef.current) {
        cleaverClampRef.current.position.y =
          0.17 - clampProgress * 0.022 + openProgress * 0.012
      }
      if (cleaverLidRef.current) {
        cleaverLidRef.current.rotation.x =
          -0.28 + lidProgress * 0.28 - openProgress * 0.16
      }
      if (cleaverBladeRef.current) {
        cleaverBladeRef.current.position.x = -0.14 + bladeProgress * 0.27
      }

      updateCableSegment(
        glassRef.current,
        INNER_FIBER_TIP_Z +
          (CLEAVED_FIBER_TIP_Z - INNER_FIBER_TIP_Z) * cutProgress,
        INNER_CABLE_BOTTOM_Z,
        GLASS_RADIUS,
      )

      if (wasteFiberRef.current) {
        wasteFiberRef.current.visible = cutProgress > 0.15
        updateCableSegment(
          wasteFiberRef.current,
          INNER_FIBER_TIP_Z,
          CLEAVED_FIBER_TIP_Z,
          GLASS_RADIUS * 1.08,
        )
        wasteFiberRef.current.position.x = cutProgress * 0.075
        wasteFiberRef.current.position.y = CABLE_Y - cutProgress * 0.055
      }

      if (progress >= 1) {
        activeAnimation.current = null
        completeFiberCleaving()
      }
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

  const handleCableClick = (event) => {
    if (!canSelectCable && !canStripJacket && !canStripCoating && !canCleanFiber) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(null)

    if (canSelectCable) {
      selectFiberCable(FIBER_CABLE_ID)
    } else if (canStripJacket) {
      startOuterJacketStripping(activeToolId)
    } else if (canStripCoating) {
      startFiberCoatingStripping(activeToolId)
    } else if (canCleanFiber) {
      startFiberCleaning(activeToolId)
    }
  }

  const handleCleaverClick = (event) => {
    if (!canPositionFiber && !canCleaveFiber) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(null)

    if (canPositionFiber) {
      startFiberPositioning(activeToolId)
    } else {
      startFiberCleaving(activeToolId)
    }
  }

  const tooltipText = canSelectCable
    ? 'Fiber Optic Cable'
    : canStripJacket
      ? 'Strip Outer Jacket'
      : canStripCoating
        ? 'Strip Fiber Coating'
        : canCleanFiber
          ? 'Clean Bare Fiber'
          : canPositionFiber
            ? 'Position Fiber'
            : 'Cleave Fiber'

  const tooltipPosition = canPositionFiber || canCleaveFiber
    ? [fiberCleaver.restPosition[0], 1.34, fiberCleaver.restPosition[2]]
    : canCleanFiber
      ? [0, CABLE_Y + 0.22, BARE_FIBER_CLEANING_CENTER_Z]
      : [0, CABLE_Y + 0.22, 0.05]

  return (
    <group>
      <group ref={cableAssemblyRef}>
        <FiberLayer
          layerRef={glassRef}
          radius={GLASS_RADIUS}
          startZ={fiberCleaved ? CLEAVED_FIBER_TIP_Z : INNER_FIBER_TIP_Z}
          endZ={INNER_CABLE_BOTTOM_Z}
          color={fiberCleaned ? '#edf8f7' : '#d6e4e5'}
          roughness={fiberCleaned ? 0.18 : 0.34}
          transparent
          opacity={0.94}
        />
        <FiberLayer
          layerRef={coatingRef}
          radius={COATING_RADIUS}
          startZ={coatingRemoved ? STRIPPED_COATING_TOP_Z : BUFFER_TOP_Z}
          endZ={INNER_CABLE_BOTTOM_Z}
          color="#478bc8"
          roughness={0.42}
        />
        <FiberLayer
          layerRef={bufferRef}
          radius={BUFFER_RADIUS}
          startZ={coatingRemoved ? STRIPPED_COATING_TOP_Z : BUFFER_TOP_Z}
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
          layerRef={wasteFiberRef}
          radius={GLASS_RADIUS * 1.08}
          startZ={INNER_FIBER_TIP_Z}
          endZ={CLEAVED_FIBER_TIP_Z}
          color="#dfeeed"
          roughness={0.24}
          transparent
          opacity={0.9}
          visible={fiberCleaved}
        />

        {bareFiberExposed && !fiberCleaned && (
          <group>
            {[-0.22, -0.13, -0.045].map((zPosition, index) => (
              <mesh
                key={zPosition}
                position={[
                  index % 2 === 0 ? 0.009 : -0.008,
                  CABLE_Y + 0.006,
                  zPosition,
                ]}
              >
                <sphereGeometry args={[0.008, 8, 8]} />
                <meshStandardMaterial
                  color="#b8c0b9"
                  transparent
                  opacity={0.42}
                  roughness={0.85}
                />
              </mesh>
            ))}
          </group>
        )}

        <mesh
          position={[0, CABLE_Y, 0.1]}
          visible={canSelectCable || canStripJacket || canStripCoating}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onClick={handleCableClick}
        >
          <boxGeometry args={[0.24, 0.16, 1.08]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {canCleanFiber && (
          <mesh
            position={[0, CABLE_Y, BARE_FIBER_CLEANING_CENTER_Z]}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onClick={handleCableClick}
          >
            <boxGeometry args={BARE_FIBER_CLEANING_HITBOX_SIZE} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        )}

        {canCleanFiber && isHovered && (
          <mesh
            position={[0, CABLE_Y + 0.009, BARE_FIBER_CLEANING_CENTER_Z]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[
              GLASS_RADIUS * 1.8,
              Math.abs(STRIPPED_COATING_TOP_Z - INNER_FIBER_TIP_Z),
              GLASS_RADIUS * 1.8,
            ]}
          >
            <cylinderGeometry args={[1, 1, 1, 12]} />
            <meshBasicMaterial
              color="#b8f7ff"
              transparent
              opacity={0.58}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        )}

        {canStripJacket && (
          <mesh position={[0, CABLE_Y, STRIPPED_JACKET_TOP_Z]}>
            <torusGeometry args={[0.075, 0.007, 8, 24]} />
            <meshBasicMaterial color="#86e0ee" toneMapped={false} />
          </mesh>
        )}
        {(canStripCoating || canCleanFiber) && (
          <mesh position={[0, CABLE_Y, STRIPPED_COATING_TOP_Z]}>
            <torusGeometry args={[0.052, 0.006, 8, 24]} />
            <meshBasicMaterial color="#86e0ee" toneMapped={false} />
          </mesh>
        )}
      </group>

      <FiberLayer
        layerRef={jacketOffcutRef}
        radius={JACKET_RADIUS * 1.035}
        startZ={INITIAL_JACKET_TOP_Z}
        endZ={STRIPPED_JACKET_TOP_Z}
        color="#d7a531"
        roughness={0.76}
        visible={false}
      />
      <FiberLayer
        layerRef={coatingOffcutRef}
        radius={BUFFER_RADIUS * 1.025}
        startZ={BUFFER_TOP_Z}
        endZ={STRIPPED_COATING_TOP_Z}
        color="#e8e5da"
        roughness={0.66}
        visible={false}
      />

      <group ref={jacketToolRef} visible={false}>
        <FiberJacketStripper
          scale={jacketStripper.scale}
          leftHandleRef={jacketLeftHandleRef}
          rightHandleRef={jacketRightHandleRef}
          leftJawRef={jacketLeftJawRef}
          rightJawRef={jacketRightJawRef}
        />
      </group>
      <group ref={precisionToolRef} visible={false}>
        <PrecisionFiberStripper
          scale={precisionStripper.scale}
          leftHandleRef={precisionLeftHandleRef}
          rightHandleRef={precisionRightHandleRef}
          leftJawRef={precisionLeftJawRef}
          rightJawRef={precisionRightJawRef}
        />
      </group>
      <group ref={cleaningWipeRef} visible={false}>
        <FiberCleaningWipe scale={cleaningWipe.scale} />
      </group>

      {showDedicatedCleaver && (
        <FiberCleaver
          position={fiberCleaver.restPosition}
          rotation={fiberCleaver.restRotation}
          scale={fiberCleaver.scale}
          lidRef={cleaverLidRef}
          clampRef={cleaverClampRef}
          bladeRef={cleaverBladeRef}
        />
      )}

      {(canPositionFiber || canCleaveFiber) && (
        <group>
          <mesh
            position={[
              fiberCleaver.restPosition[0],
              1.1,
              fiberCleaver.restPosition[2],
            ]}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onClick={handleCleaverClick}
          >
            <boxGeometry args={[0.62, 0.32, 0.52]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          <mesh
            position={[
              fiberCleaver.restPosition[0],
              1.112,
              fiberCleaver.restPosition[2],
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[canPositionFiber ? 0.08 : 0.2, 0.34]} />
            <meshBasicMaterial
              color="#7fd9e8"
              transparent
              opacity={0.46}
              toneMapped={false}
            />
          </mesh>
        </group>
      )}

      {isHovered && (
        <Html position={tooltipPosition} center>
          <div className="tool-tooltip" role="tooltip">
            {tooltipText}
          </div>
        </Html>
      )}
    </group>
  )
}
