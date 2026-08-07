import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import {
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
  SphereGeometry,
  Vector3,
} from 'three'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../../store/useToolStore.js'
import useTrainingStore from '../../store/useTrainingStore.js'
import { CONDUCTOR_INSERTION_DISTANCE } from './RJ45ConnectorModel.jsx'
import { RJ45_PROCEDURE_STEPS } from './rj45Procedure.js'
import {
  CABLE_EXIT_Z,
  getConnectorWirePoints,
  getWireDefinition,
  getWireSlotPoints,
  getWireSlotPosition,
  GUIDE_CENTER_X,
  GUIDE_CENTER_Z,
  GUIDE_DEPTH,
  GUIDE_SLOT_SPACING,
  GUIDE_WIDTH,
  TRIMMED_TIP_Z,
  WIRE_RADIUS,
  wireDefinitions,
} from './wireDefinitions.js'

const PAIR_SEPARATION_DURATION = 1.1
const BUNDLE_HOVER_ID = 'rj45-wire-bundle'
const WIRE_HOVER_PREFIX = 'rj45-wire:'
const SLOT_HOVER_PREFIX = 'rj45-slot:'
const WIRE_PLACEMENT_DAMPING = 7
const conductorGeometry = new CylinderGeometry(
  WIRE_RADIUS,
  WIRE_RADIUS,
  1,
  10,
)
const stripeGeometry = new CylinderGeometry(0.0048, 0.0048, 1, 7)
const wireHitGeometries = [
  new CylinderGeometry(0.016, 0.016, 1, 7),
  new CylinderGeometry(0.024, 0.024, 1, 7),
  new CylinderGeometry(0.035, 0.035, 1, 7),
]
const wireTipHitGeometry = new SphereGeometry(0.039, 8, 6)
const guideBoxGeometry = new BoxGeometry(1, 1, 1)
const guideFrameMaterial = new MeshStandardMaterial({
  color: '#68777e',
  metalness: 0.22,
  roughness: 0.64,
})
const segmentDirection = new Vector3()
const segmentMidpoint = new Vector3()
const upAxis = new Vector3(0, 1, 0)
const insertionPointWeights = [0.58, 0.56, 0.76, 1]

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress)
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum)
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
  return pairsSeparated && isArrangementStep(currentStep)
}

function isConnectorWorkspaceStep(currentStep) {
  return [
    RJ45_PROCEDURE_STEPS.ALIGN_CONNECTOR,
    RJ45_PROCEDURE_STEPS.INSERT_CONDUCTORS,
    RJ45_PROCEDURE_STEPS.INSERTING_CONDUCTORS,
    RJ45_PROCEDURE_STEPS.VERIFY_INSERTION,
    RJ45_PROCEDURE_STEPS.CONDUCTORS_INSERTED,
    RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_4,
    RJ45_PROCEDURE_STEPS.SELECT_CRIMPING_TOOL,
  ].includes(currentStep)
}

function setSegmentTransform(mesh, startPoint, endPoint, verticalOffset = 0) {
  if (!mesh) {
    return
  }

  segmentDirection.subVectors(endPoint, startPoint)
  const segmentLength = Math.max(segmentDirection.length(), 0.001)
  segmentMidpoint.addVectors(startPoint, endPoint).multiplyScalar(0.5)
  mesh.position.copy(segmentMidpoint)
  mesh.position.y += verticalOffset
  mesh.quaternion.setFromUnitVectors(
    upAxis,
    segmentDirection.normalize(),
  )
  mesh.scale.set(1, segmentLength, 1)
}

function createVectorPoints(points) {
  return points.map((point) => new Vector3().fromArray(point))
}

export default function RJ45WireArrangement({
  visible = true,
  jacketProgressRef,
  trimProgressRef,
  insertionProgressRef,
  hoveredObjectId,
  onHoveredObjectChange,
}) {
  const wireGroups = useRef({})
  const wireSegments = useRef({})
  const stripeSegments = useRef({})
  const hitSegments = useRef({})
  const tipHitTargets = useRef({})
  const currentWirePoints = useRef({})
  const separationProgress = useRef(0)
  const separationCompletionRequested = useRef(false)
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
  const wiresTrimmed = useTrainingStore((state) => state.wiresTrimmed)
  const isConnectorInserting = useTrainingStore(
    (state) => state.isConnectorInserting,
  )
  const conductorsInserted = useTrainingStore(
    (state) => state.conductorsInserted,
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
  const isConnectorWorkspace = isConnectorWorkspaceStep(currentStep)

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

    wireDefinitions.forEach((wire, wireIndex) => {
      const wireGroup = wireGroups.current[wire.id]

      if (!wireGroup) {
        return
      }

      wireGroup.visible = jacketProgress > 0.02

      if (!currentWirePoints.current[wire.id]) {
        currentWirePoints.current[wire.id] = createVectorPoints(
          wire.initialPoints,
        )
      }

      const currentPoints = currentWirePoints.current[wire.id]

      if (!hasStrippedJacket) {
        wire.initialPoints.forEach((point, pointIndex) => {
          currentPoints[pointIndex].set(
            point[0],
            point[1],
            CABLE_EXIT_Z + (point[2] - CABLE_EXIT_Z) * jacketProgress,
          )
        })
      } else if (isSeparating) {
        const staggerStart = wireIndex * 0.035
        const wireProgress = smoothStep(
          clamp(
            (separationProgress.current - staggerStart) /
              (1 - 0.035 * 7),
            0,
            1,
          ),
        )

        wire.initialPoints.forEach((point, pointIndex) => {
          const separatedPoint = wire.separatedPoints[pointIndex]
          currentPoints[pointIndex].set(
            point[0] + (separatedPoint[0] - point[0]) * wireProgress,
            point[1] + (separatedPoint[1] - point[1]) * wireProgress,
            point[2] + (separatedPoint[2] - point[2]) * wireProgress,
          )
        })
      } else if (!pairsSeparated) {
        wire.initialPoints.forEach((point, pointIndex) => {
          currentPoints[pointIndex].fromArray(point)
        })
      } else {
        const placedSlot = getPlacedSlot(wirePlacements, wire.id)
        const targetPoints = placedSlot
          ? isConnectorWorkspace
            ? getConnectorWirePoints(placedSlot)
            : getWireSlotPoints(placedSlot)
          : wire.separatedPoints
        const damping = 1 - Math.exp(-WIRE_PLACEMENT_DAMPING * delta)
        const trimProgress = wiresTrimmed
          ? 1
          : currentStep === RJ45_PROCEDURE_STEPS.TRIMMING
            ? smoothStep(trimProgressRef.current)
            : 0
        const keepInsertionPosition =
          currentStep === RJ45_PROCEDURE_STEPS.VERIFY_INSERTION ||
          currentStep === RJ45_PROCEDURE_STEPS.CONDUCTORS_INSERTED ||
          currentStep === RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_4
        const rawInsertionProgress =
          conductorsInserted || keepInsertionPosition
            ? 1
            : isConnectorInserting
              ? insertionProgressRef.current
              : 0
        const insertionProgress = smoothStep(
          clamp((rawInsertionProgress - 0.08) / 0.78, 0, 1),
        )

        targetPoints.forEach((point, pointIndex) => {
          segmentMidpoint.fromArray(point)

          if (placedSlot && pointIndex === targetPoints.length - 1) {
            segmentMidpoint.z +=
              (TRIMMED_TIP_Z - point[2]) * trimProgress
          }


          if (placedSlot && wiresTrimmed) {
            if (isConnectorWorkspace && pointIndex < 2) {
              const channelX = targetPoints[2][0]
              segmentMidpoint.x +=
                (channelX - point[0]) * insertionProgress
            }

            segmentMidpoint.z +=
              CONDUCTOR_INSERTION_DISTANCE *
              insertionPointWeights[pointIndex] *
              insertionProgress
          }

          currentPoints[pointIndex].lerp(segmentMidpoint, damping)
        })
      }

      for (let segmentIndex = 0; segmentIndex < 3; segmentIndex += 1) {
        const startPoint = currentPoints[segmentIndex]
        const endPoint = currentPoints[segmentIndex + 1]
        setSegmentTransform(
          wireSegments.current[wire.id]?.[segmentIndex],
          startPoint,
          endPoint,
        )
        setSegmentTransform(
          stripeSegments.current[wire.id]?.[segmentIndex],
          startPoint,
          endPoint,
          WIRE_RADIUS * 0.92,
        )
        setSegmentTransform(
          hitSegments.current[wire.id]?.[segmentIndex],
          startPoint,
          endPoint,
        )
      }

      tipHitTargets.current[wire.id]?.position.copy(currentPoints[3])
    })

    if (
      isSeparating &&
      !separationCompletionRequested.current &&
      separationProgress.current >= 1
    ) {
      separationCompletionRequested.current = true
      completePairSeparation()
    }
  })

  const setSegmentRef = (collection, wireId, segmentIndex, mesh) => {
    if (!collection.current[wireId]) {
      collection.current[wireId] = []
    }

    collection.current[wireId][segmentIndex] = mesh
  }

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
    <group visible={visible}>
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
                ? '#72ccff'
                : isHovered
                  ? '#65bff0'
                  : '#000000'
        const emissiveIntensity = isSelected
          ? 1
          : isHovered
            ? 0.72
            : emissive === '#000000'
              ? 0
              : 0.55

        return (
          <group
            key={wire.id}
            ref={(group) => {
              wireGroups.current[wire.id] = group
            }}
            onPointerEnter={(event) => handleWirePointerEnter(event, wire.id)}
            onPointerLeave={handleWirePointerLeave}
            onClick={(event) => handleWireClick(event, wire.id)}
          >
            {Array.from({ length: 3 }, (_, segmentIndex) => (
              <group key={segmentIndex}>
                <mesh
                  ref={(mesh) =>
                    setSegmentRef(
                      wireSegments,
                      wire.id,
                      segmentIndex,
                      mesh,
                    )
                  }
                  geometry={conductorGeometry}
                  castShadow
                >
                  <meshStandardMaterial
                    color={wire.primaryColor}
                    emissive={emissive}
                    emissiveIntensity={emissiveIntensity}
                    roughness={0.62}
                  />
                </mesh>

                {wire.stripeColor && (
                  <mesh
                    ref={(mesh) =>
                      setSegmentRef(
                        stripeSegments,
                        wire.id,
                        segmentIndex,
                        mesh,
                      )
                    }
                    geometry={stripeGeometry}
                  >
                    <meshStandardMaterial
                      color={wire.stripeColor}
                      emissive={emissive}
                      emissiveIntensity={Math.min(emissiveIntensity, 0.8)}
                      roughness={0.62}
                    />
                  </mesh>
                )}

                <mesh
                  ref={(mesh) =>
                    setSegmentRef(
                      hitSegments,
                      wire.id,
                      segmentIndex,
                      mesh,
                    )
                  }
                  geometry={wireHitGeometries[segmentIndex]}
                >
                  <meshBasicMaterial
                    transparent
                    opacity={0}
                    depthWrite={false}
                  />
                </mesh>
              </group>
            ))}
            <mesh
              ref={(mesh) => {
                tipHitTargets.current[wire.id] = mesh
              }}
              geometry={wireTipHitGeometry}
            >
              <meshBasicMaterial
                transparent
                opacity={0}
                depthWrite={false}
              />
            </mesh>
          </group>
        )
      })}

      {showGuide && (
        <group>
          <mesh
            geometry={guideBoxGeometry}
            material={guideFrameMaterial}
            position={[
              GUIDE_CENTER_X,
              0.009,
              GUIDE_CENTER_Z - GUIDE_DEPTH / 2,
            ]}
            scale={[GUIDE_WIDTH, 0.018, 0.018]}
            castShadow
            receiveShadow
          />

          {Array.from({ length: 9 }, (_, tineIndex) => (
            <mesh
              key={`guide-tine-${tineIndex}`}
              geometry={guideBoxGeometry}
              material={guideFrameMaterial}
              position={[
                GUIDE_CENTER_X - GUIDE_SLOT_SPACING * 4 +
                  tineIndex * GUIDE_SLOT_SPACING,
                0.014,
                GUIDE_CENTER_Z,
              ]}
              scale={[0.006, 0.028, GUIDE_DEPTH]}
              castShadow
            />
          ))}

          {wireDefinitions.map((wire, index) => {
            const slotNumber = index + 1
            const slotPosition = getWireSlotPosition(slotNumber)
            const placedWireId = wirePlacements[index]
            const validationResult = wireValidationResults[index]
            const canPlaceWire = selectedWireId && !placedWireId
            const canRemoveWire =
              hasIncorrectValidation && Boolean(placedWireId)
            const isSlotInteractive = Boolean(canPlaceWire || canRemoveWire)
            const isHovered =
              hoveredObjectId === `${SLOT_HOVER_PREFIX}${slotNumber}`
            const slotColor =
              validationResult === 'correct'
                ? '#2f8f57'
                : validationResult === 'incorrect'
                  ? '#a84949'
                  : isHovered || canPlaceWire
                    ? '#4f9fb8'
                    : placedWireId
                      ? '#486475'
                      : '#222a2f'
            return (
              <group key={wire.id}>
                <mesh
                  geometry={guideBoxGeometry}
                  position={[slotPosition[0], 0.008, slotPosition[2]]}
                  scale={[
                    GUIDE_SLOT_SPACING * 0.7,
                    0.009,
                    GUIDE_DEPTH * 0.76,
                  ]}
                >
                  <meshStandardMaterial
                    color={slotColor}
                    emissive={
                      isHovered || canPlaceWire ? '#3f9fbd' : '#000000'
                    }
                    emissiveIntensity={isHovered ? 0.42 : canPlaceWire ? 0.2 : 0}
                    roughness={0.6}
                  />
                </mesh>
                <mesh
                  geometry={guideBoxGeometry}
                  position={slotPosition}
                  visible={isSlotInteractive}
                  scale={[
                    GUIDE_SLOT_SPACING * 0.96,
                    0.17,
                    GUIDE_DEPTH + 0.12,
                  ]}
                  onPointerEnter={(event) =>
                    handleSlotPointerEnter(event, slotNumber)
                  }
                  onPointerLeave={handleSlotPointerLeave}
                  onClick={(event) => handleSlotClick(event, slotNumber)}
                >
                  <meshBasicMaterial
                    transparent
                    opacity={0}
                    depthWrite={false}
                  />
                </mesh>
                <Html
                  position={[
                    slotPosition[0],
                    0.065,
                    GUIDE_CENTER_Z - GUIDE_DEPTH / 2 - 0.026,
                  ]}
                  center
                >
                  <span
                    className={`wire-slot-number${
                      validationResult ? ` is-${validationResult}` : ''
                    }`}
                  >
                    {slotNumber}
                  </span>
                </Html>
              </group>
            )
          })}

        </group>
      )}

      {hoveredObjectId === BUNDLE_HOVER_ID && canSeparate && (
        <Html position={[0, 0.2, -0.48]} center>
          <div className="tool-tooltip" role="tooltip">
            Separate Wire Pairs
          </div>
        </Html>
      )}

      {hoveredWire && hoveredWirePosition && canArrange && (
        <Html
          position={[
            hoveredWirePosition[0],
            hoveredWirePosition[1] + 0.16,
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
