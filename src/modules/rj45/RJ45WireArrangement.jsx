import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../../store/useToolStore.js'
import useTrainingStore from '../../store/useTrainingStore.js'
import { RJ45_PROCEDURE_STEPS } from './rj45Procedure.js'
import {
  getWireDefinition,
  getWireSlotPosition,
  GUIDE_CENTER_X,
  GUIDE_SLOT_SPACING,
  WIRE_LENGTH,
  wireDefinitions,
} from './wireDefinitions.js'

const PAIR_SEPARATION_DURATION = 1
const BUNDLE_HOVER_ID = 'rj45-wire-bundle'
const WIRE_HOVER_PREFIX = 'rj45-wire:'
const SLOT_HOVER_PREFIX = 'rj45-slot:'

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress)
}

function getPlacedSlot(wirePlacements, wireId) {
  const slotIndex = wirePlacements.indexOf(wireId)
  return slotIndex === -1 ? null : slotIndex + 1
}

function isArrangementStep(currentStep) {
  return (
    currentStep === RJ45_PROCEDURE_STEPS.ARRANGE_T568B ||
    currentStep === RJ45_PROCEDURE_STEPS.VALIDATE_T568B
  )
}

function isGuideVisible(currentStep, pairsSeparated) {
  return (
    pairsSeparated &&
    (isArrangementStep(currentStep) ||
      currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_2)
  )
}

export default function RJ45WireArrangement({
  jacketProgressRef,
  hoveredObjectId,
  onHoveredObjectChange,
}) {
  const wireGroups = useRef({})
  const separationProgress = useRef(0)
  const separationCompletionRequested = useRef(false)
  const targetPosition = useRef(new Vector3())
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const isTrainingMode = useInteractionStore(
    (state) => state.isTrainingMode,
  )
  const toolViewState = useToolStore((state) => state.toolViewState)
  const activeToolId = useToolStore((state) => state.activeToolId)
  const currentStep = useTrainingStore((state) => state.currentStep)
  const completedSteps = useTrainingStore((state) => state.completedSteps)
  const pairsSeparated = useTrainingStore((state) => state.pairsSeparated)
  const selectedWireId = useTrainingStore((state) => state.selectedWireId)
  const wirePlacements = useTrainingStore((state) => state.wirePlacements)
  const wireValidationResults = useTrainingStore(
    (state) => state.wireValidationResults,
  )
  const isProcedureAnimating = useTrainingStore(
    (state) => state.isProcedureAnimating,
  )
  const startPairSeparation = useTrainingStore(
    (state) => state.startPairSeparation,
  )
  const completePairSeparation = useTrainingStore(
    (state) => state.completePairSeparation,
  )
  const selectWire = useTrainingStore((state) => state.selectWire)
  const placeSelectedWire = useTrainingStore(
    (state) => state.placeSelectedWire,
  )
  const removeWireFromSlot = useTrainingStore(
    (state) => state.removeWireFromSlot,
  )
  const hasStrippedJacket = completedSteps.includes(
    RJ45_PROCEDURE_STEPS.STRIP_JACKET,
  )
  const isSeparating =
    currentStep === RJ45_PROCEDURE_STEPS.SEPARATE_PAIRS &&
    isProcedureAnimating
  const isWorkstationReady =
    workstationPhase === WORKSTATION_PHASES.FOCUSED &&
    isTrainingMode &&
    toolViewState === TOOL_VIEW_STATES.IDLE &&
    !activeToolId
  const canSeparate =
    isWorkstationReady &&
    currentStep === RJ45_PROCEDURE_STEPS.SEPARATE_PAIRS &&
    !pairsSeparated &&
    !isProcedureAnimating
  const canArrange =
    isWorkstationReady &&
    pairsSeparated &&
    isArrangementStep(currentStep) &&
    !isProcedureAnimating
  const hasIncorrectValidation = wireValidationResults.includes('incorrect')
  const showGuide = isGuideVisible(currentStep, pairsSeparated)

  useEffect(() => {
    if (isSeparating) {
      separationProgress.current = 0
      separationCompletionRequested.current = false
    }
  }, [isSeparating])

  useEffect(() => {
    if (
      hoveredObjectId &&
      (hoveredObjectId === BUNDLE_HOVER_ID ||
        hoveredObjectId.startsWith(WIRE_HOVER_PREFIX) ||
        hoveredObjectId.startsWith(SLOT_HOVER_PREFIX)) &&
      !canSeparate &&
      !canArrange
    ) {
      onHoveredObjectChange?.(null)
    }
  }, [
    canArrange,
    canSeparate,
    hoveredObjectId,
    onHoveredObjectChange,
  ])

  useFrame((_, delta) => {
    if (isSeparating && !separationCompletionRequested.current) {
      separationProgress.current = Math.min(
        separationProgress.current + delta / PAIR_SEPARATION_DURATION,
        1,
      )
    }

    const jacketProgress = hasStrippedJacket
      ? 1
      : currentStep === RJ45_PROCEDURE_STEPS.STRIP_JACKET
        ? jacketProgressRef.current
        : 0

    wireDefinitions.forEach((wire) => {
      const wireGroup = wireGroups.current[wire.id]

      if (!wireGroup) {
        return
      }

      wireGroup.visible = jacketProgress > 0.02
      wireGroup.scale.x = Math.max(jacketProgress, 0.001)

      if (!hasStrippedJacket) {
        wireGroup.position.set(
          wire.initialPosition[0] -
            (WIRE_LENGTH * (1 - jacketProgress)) / 2,
          wire.initialPosition[1],
          wire.initialPosition[2],
        )
        return
      }

      wireGroup.scale.x = 1

      if (isSeparating) {
        const progress = smoothStep(separationProgress.current)
        wireGroup.position.set(
          wire.initialPosition[0] +
            (wire.separatedPosition[0] - wire.initialPosition[0]) * progress,
          wire.initialPosition[1] +
            (wire.separatedPosition[1] - wire.initialPosition[1]) * progress,
          wire.initialPosition[2] +
            (wire.separatedPosition[2] - wire.initialPosition[2]) * progress,
        )
        return
      }

      if (!pairsSeparated) {
        wireGroup.position.set(...wire.initialPosition)
        return
      }

      const placedSlot = getPlacedSlot(wirePlacements, wire.id)
      const nextPosition = placedSlot
        ? getWireSlotPosition(placedSlot)
        : wire.separatedPosition
      const damping = 1 - Math.exp(-11 * delta)

      targetPosition.current.fromArray(nextPosition)
      wireGroup.position.lerp(targetPosition.current, damping)
    })

    if (!isSeparating || separationCompletionRequested.current) {
      return
    }

    if (separationProgress.current >= 1) {
      separationCompletionRequested.current = true
      completePairSeparation()
    }
  })

  const handleWirePointerEnter = (event, wireId) => {
    const placedSlot = getPlacedSlot(wirePlacements, wireId)
    const canUseWire = !placedSlot || hasIncorrectValidation

    if (!canSeparate && (!canArrange || !canUseWire)) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(
      canSeparate ? BUNDLE_HOVER_ID : `${WIRE_HOVER_PREFIX}${wireId}`,
    )
  }

  const handleWirePointerLeave = (event) => {
    event.stopPropagation()
    onHoveredObjectChange?.(null)
  }

  const handleWireClick = (event, wireId) => {
    if (canSeparate) {
      event.stopPropagation()
      onHoveredObjectChange?.(null)
      startPairSeparation()
      return
    }

    if (!canArrange) {
      return
    }

    const placedSlot = getPlacedSlot(wirePlacements, wireId)

    if (!placedSlot) {
      event.stopPropagation()
      onHoveredObjectChange?.(null)
      selectWire(wireId)
      return
    }

    if (hasIncorrectValidation) {
      event.stopPropagation()
      onHoveredObjectChange?.(null)
      removeWireFromSlot(placedSlot)
    }
  }

  const handleSlotPointerEnter = (event, slotNumber) => {
    const slotIndex = slotNumber - 1
    const canPlaceWire = selectedWireId && !wirePlacements[slotIndex]
    const canRemoveWire =
      hasIncorrectValidation && Boolean(wirePlacements[slotIndex])

    if (!canArrange || (!canPlaceWire && !canRemoveWire)) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(`${SLOT_HOVER_PREFIX}${slotNumber}`)
  }

  const handleSlotPointerLeave = (event) => {
    event.stopPropagation()
    onHoveredObjectChange?.(null)
  }

  const handleSlotClick = (event, slotNumber) => {
    if (!canArrange) {
      return
    }

    const slotIndex = slotNumber - 1
    const placedWireId = wirePlacements[slotIndex]

    if (placedWireId && hasIncorrectValidation) {
      event.stopPropagation()
      onHoveredObjectChange?.(null)
      removeWireFromSlot(slotNumber)
      return
    }

    if (selectedWireId && !placedWireId) {
      event.stopPropagation()
      onHoveredObjectChange?.(null)
      placeSelectedWire(slotNumber)
    }
  }

  const hoveredWireId = hoveredObjectId?.startsWith(WIRE_HOVER_PREFIX)
    ? hoveredObjectId.slice(WIRE_HOVER_PREFIX.length)
    : null
  const hoveredWire = getWireDefinition(hoveredWireId)
  const hoveredWireSlot = hoveredWire
    ? getPlacedSlot(wirePlacements, hoveredWire.id)
    : null
  const hoveredWirePosition = hoveredWire
    ? hoveredWireSlot
      ? getWireSlotPosition(hoveredWireSlot)
      : hoveredWire.separatedPosition
    : null

  return (
    <group>
      {wireDefinitions.map((wire) => {
        const placedSlot = getPlacedSlot(wirePlacements, wire.id)
        const validationResult = placedSlot
          ? wireValidationResults[placedSlot - 1]
          : null
        const isSelected = selectedWireId === wire.id
        const isHovered =
          hoveredObjectId === `${WIRE_HOVER_PREFIX}${wire.id}` ||
          hoveredObjectId === BUNDLE_HOVER_ID
        const emissive =
          validationResult === 'incorrect'
            ? '#a43f3f'
            : validationResult === 'correct'
              ? '#2f8f57'
              : isSelected
                ? '#5daeff'
                : isHovered
                  ? '#4a8fc7'
                  : '#000000'

        return (
          <group
            key={wire.id}
            ref={(group) => {
              wireGroups.current[wire.id] = group
            }}
            position={wire.initialPosition}
            onPointerEnter={(event) => handleWirePointerEnter(event, wire.id)}
            onPointerLeave={handleWirePointerLeave}
            onClick={(event) => handleWireClick(event, wire.id)}
          >
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.012, 0.012, WIRE_LENGTH, 8]} />
              <meshStandardMaterial
                color={wire.primaryColor}
                emissive={emissive}
                emissiveIntensity={emissive === '#000000' ? 0 : 0.55}
                roughness={0.65}
              />
            </mesh>

            {wire.stripeColor && (
              <mesh
                position={[0, 0.013, 0]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.004, 0.004, WIRE_LENGTH, 6]} />
                <meshStandardMaterial
                  color={wire.stripeColor}
                  emissive={emissive}
                  emissiveIntensity={emissive === '#000000' ? 0 : 0.4}
                  roughness={0.65}
                />
              </mesh>
            )}

            <mesh>
              <boxGeometry args={[WIRE_LENGTH, 0.07, 0.055]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          </group>
        )
      })}

      {showGuide && (
        <group>
          <mesh
            position={[GUIDE_CENTER_X, -0.015, 0]}
            receiveShadow
          >
            <boxGeometry
              args={[0.5, 0.025, GUIDE_SLOT_SPACING * 8 + 0.06]}
            />
            <meshStandardMaterial color="#2d353b" roughness={0.7} />
          </mesh>

          {wireDefinitions.map((wire, index) => {
            const slotNumber = index + 1
            const slotPosition = getWireSlotPosition(slotNumber)
            const placedWireId = wirePlacements[index]
            const validationResult = wireValidationResults[index]
            const canPlaceWire = selectedWireId && !placedWireId
            const isHovered =
              hoveredObjectId === `${SLOT_HOVER_PREFIX}${slotNumber}`
            const slotColor =
              validationResult === 'correct'
                ? '#2f8f57'
                : validationResult === 'incorrect'
                  ? '#a84949'
                  : isHovered || canPlaceWire
                    ? '#4c8062'
                    : placedWireId
                      ? '#486475'
                      : '#3a454d'
            const statusMark =
              validationResult === 'correct'
                ? '✓'
                : validationResult === 'incorrect'
                  ? '!'
                  : ''

            return (
              <group key={wire.id}>
                <mesh
                  position={slotPosition}
                  onPointerEnter={(event) =>
                    handleSlotPointerEnter(event, slotNumber)
                  }
                  onPointerLeave={handleSlotPointerLeave}
                  onClick={(event) => handleSlotClick(event, slotNumber)}
                >
                  <boxGeometry args={[0.46, 0.035, 0.06]} />
                  <meshStandardMaterial
                    color={slotColor}
                    emissive={isHovered ? '#3f9662' : '#000000'}
                    emissiveIntensity={isHovered ? 0.35 : 0}
                    roughness={0.62}
                  />
                </mesh>
                <Html
                  position={[
                    slotPosition[0] - 0.3,
                    slotPosition[1] + 0.035,
                    slotPosition[2],
                  ]}
                  center
                >
                  <span
                    className={`wire-slot-number${
                      validationResult ? ` is-${validationResult}` : ''
                    }`}
                  >
                    {slotNumber} {statusMark}
                  </span>
                </Html>
              </group>
            )
          })}
        </group>
      )}

      {hoveredObjectId === BUNDLE_HOVER_ID && canSeparate && (
        <Html position={[0.57, 0.18, 0]} center>
          <div className="tool-tooltip" role="tooltip">
            Separate Wire Pairs
          </div>
        </Html>
      )}

      {hoveredWire && hoveredWirePosition && canArrange && (
        <Html
          position={[
            hoveredWirePosition[0],
            hoveredWirePosition[1] + 0.14,
            hoveredWirePosition[2],
          ]}
          center
        >
          <div className="tool-tooltip" role="tooltip">
            {hoveredWire.displayName}
          </div>
        </Html>
      )}
    </group>
  )
}

export { PAIR_SEPARATION_DURATION }
