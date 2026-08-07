import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import {
  CylinderGeometry,
  Euler,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from 'three'
import { CrimpingTool } from '../../objects/telecom/RJ45ToolSet.jsx'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../../store/useToolStore.js'
import useTrainingStore from '../../store/useTrainingStore.js'
import { getToolConfig, TOOL_IDS } from '../../tools/toolConfigs.js'
import { RJ45_WORKSTATION } from '../../workstations/workstationConfigs.js'
import CrimpingGuide from './CrimpingGuide.jsx'
import {
  CONNECTOR_POSITIONING_DURATION,
  CRIMPING_DURATION,
  RJ45_PROCEDURE_STEPS,
} from './rj45Procedure.js'
import RJ45ConnectorModel, {
  CONTACT_PRESS_DISTANCE,
  CONNECTOR_ALIGNED_POSITION,
  CONNECTOR_FRONT_CONTACT_Z,
  STRAIN_RELIEF_PRESS_DISTANCE,
} from './RJ45ConnectorModel.jsx'
import {
  CONNECTOR_CHANNEL_SPACING,
  WIRE_RADIUS,
  wireDefinitions,
} from './wireDefinitions.js'

const POSITION_SLOT_HOVER_ID = 'rj45-crimp-position-slot'
const CRIMP_ACTION_HOVER_ID = 'rj45-crimp-action'
const crimpingToolConfig = getToolConfig(TOOL_IDS.CRIMPING_TOOL)
const CRIMPER_POSITION = Object.freeze([0.52, 0.13, -0.14])
const CRIMPER_REST_POSITION = Object.freeze(
  crimpingToolConfig.restPosition.map(
    (coordinate, index) =>
      coordinate +
      RJ45_WORKSTATION.interactionPosition[index] -
      RJ45_WORKSTATION.workspacePosition[index],
  ),
)
const CRIMPER_REST_ROTATION = crimpingToolConfig.restRotation
const CRIMPER_WORK_ROTATION = Object.freeze([0, 0, 0])
const CRIMPER_MOVE_DURATION = 0.6
const CONNECTOR_PRE_CRIMP_POSITION = Object.freeze([0.86, 0.22, -0.14])
const CONNECTOR_CRIMP_POSITION = Object.freeze([0.52, 0.13, -0.43])
const CRIMP_ACTION_POSITION = Object.freeze([0.52, 0.31, -0.14])
const CONNECTOR_PRE_CRIMP_ROTATION = Object.freeze([0.06, -0.22, 0.08])
const CONNECTOR_CRIMP_ROTATION = Object.freeze([0, 0, 0])
const CABLE_DIAMETER = 0.11
const CABLE_PATH_POINTS = Object.freeze([
  Object.freeze([0, -0.02, 0.17]),
  Object.freeze([0, -0.02, 0.54]),
  Object.freeze([-0.05, -0.025, 0.86]),
  Object.freeze([-0.16, -0.05, 1.18]),
])
const CONDUCTOR_START_Z = 0.2
const CONDUCTOR_END_Z =
  CONNECTOR_FRONT_CONTACT_Z - CONNECTOR_ALIGNED_POSITION[2]
const CONDUCTOR_LENGTH = CONDUCTOR_START_Z - CONDUCTOR_END_Z
const CONDUCTOR_CENTER_Z = (CONDUCTOR_START_Z + CONDUCTOR_END_Z) / 2
const conductorGeometry = new CylinderGeometry(
  WIRE_RADIUS,
  WIRE_RADIUS,
  1,
  10,
)
const stripeGeometry = new CylinderGeometry(0.0038, 0.0038, 1, 7)
const jacketGeometry = new CylinderGeometry(0.055, 0.055, 1, 12)
const jacketEndGeometry = new CylinderGeometry(0.057, 0.057, 0.018, 12)
const conductorMaterials = wireDefinitions.map(
  (wire) =>
    new MeshStandardMaterial({
      color: wire.primaryColor,
      roughness: 0.62,
    }),
)
const stripeMaterials = wireDefinitions.map((wire) =>
  wire.stripeColor
    ? new MeshStandardMaterial({
        color: wire.stripeColor,
        roughness: 0.62,
      })
    : null,
)
const jacketMaterial = new MeshStandardMaterial({
  color: '#1f5f8a',
  metalness: 0.02,
  roughness: 0.66,
})
const jacketEndMaterial = new MeshStandardMaterial({
  color: '#143e5c',
  metalness: 0.02,
  roughness: 0.62,
})
const cableUp = new Vector3(0, 1, 0)
const cableSegments = CABLE_PATH_POINTS.slice(0, -1).map((start, index) => {
  const startPosition = new Vector3().fromArray(start)
  const endPosition = new Vector3().fromArray(CABLE_PATH_POINTS[index + 1])
  const direction = endPosition.clone().sub(startPosition)

  return Object.freeze({
    position: Object.freeze(
      startPosition.clone().add(endPosition).multiplyScalar(0.5).toArray(),
    ),
    quaternion: new Quaternion().setFromUnitVectors(
      cableUp,
      direction.clone().normalize(),
    ),
    length: direction.length(),
  })
})
const preCrimpPosition = new Vector3().fromArray(CONNECTOR_PRE_CRIMP_POSITION)
const crimpPosition = new Vector3().fromArray(CONNECTOR_CRIMP_POSITION)
const preCrimpQuaternion = new Quaternion().setFromEuler(
  new Euler(...CONNECTOR_PRE_CRIMP_ROTATION),
)
const crimpQuaternion = new Quaternion().setFromEuler(
  new Euler(...CONNECTOR_CRIMP_ROTATION),
)
const crimperRestPosition = new Vector3().fromArray(CRIMPER_REST_POSITION)
const crimperWorkPosition = new Vector3().fromArray(CRIMPER_POSITION)
const crimperRestQuaternion = new Quaternion().setFromEuler(
  new Euler(...CRIMPER_REST_ROTATION),
)
const crimperWorkQuaternion = new Quaternion().setFromEuler(
  new Euler(...CRIMPER_WORK_ROTATION),
)

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress)
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum)
}

function isCrimpingWorkspaceStep(currentStep) {
  return [
    RJ45_PROCEDURE_STEPS.POSITION_CONNECTOR_IN_CRIMPER,
    RJ45_PROCEDURE_STEPS.READY_TO_CRIMP,
    RJ45_PROCEDURE_STEPS.CRIMPING,
    RJ45_PROCEDURE_STEPS.CRIMP_COMPLETE,
    RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_5,
  ].includes(currentStep)
}

function getHandleClosure(progress) {
  if (progress <= 0.55) {
    return smoothStep(progress / 0.55)
  }

  if (progress <= 0.75) {
    return 1
  }

  return 1 - smoothStep((progress - 0.75) / 0.25) * 0.45
}

export default function RJ45Crimping({
  hoveredObjectId,
  onHoveredObjectChange,
}) {
  const crimperGroup = useRef(null)
  const assemblyGroup = useRef(null)
  const leftHandle = useRef(null)
  const rightHandle = useRef(null)
  const upperJaw = useRef(null)
  const lowerJaw = useRef(null)
  const contactBladeRefs = useRef([])
  const strainRelief = useRef(null)
  const positioningProgress = useRef(0)
  const crimpingProgress = useRef(0)
  const crimperMoveProgress = useRef(0)
  const crimperReturnProgress = useRef(0)
  const positioningCompletionRequested = useRef(false)
  const crimpCompletionRequested = useRef(false)
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const isTrainingMode = useInteractionStore(
    (state) => state.isTrainingMode,
  )
  const activeToolId = useToolStore((state) => state.activeToolId)
  const toolViewState = useToolStore((state) => state.toolViewState)
  const currentStep = useTrainingStore((state) => state.currentStep)
  const isProcedureAnimating = useTrainingStore(
    (state) => state.isProcedureAnimating,
  )
  const isConnectorPositioning = useTrainingStore(
    (state) => state.isConnectorPositioning,
  )
  const connectorPositionedForCrimp = useTrainingStore(
    (state) => state.connectorPositionedForCrimp,
  )
  const isCrimping = useTrainingStore((state) => state.isCrimping)
  const crimpComplete = useTrainingStore((state) => state.crimpComplete)
  const startConnectorPositioning = useTrainingStore(
    (state) => state.startConnectorPositioning,
  )
  const completeConnectorPositioning = useTrainingStore(
    (state) => state.completeConnectorPositioning,
  )
  const startConnectorCrimping = useTrainingStore(
    (state) => state.startConnectorCrimping,
  )
  const completeConnectorCrimping = useTrainingStore(
    (state) => state.completeConnectorCrimping,
  )
  const isPositionHovered = hoveredObjectId === POSITION_SLOT_HOVER_ID
  const isCrimpHovered = hoveredObjectId === CRIMP_ACTION_HOVER_ID
  const isWorkstationReady =
    workstationPhase === WORKSTATION_PHASES.FOCUSED &&
    isTrainingMode &&
    toolViewState === TOOL_VIEW_STATES.IDLE &&
    activeToolId === TOOL_IDS.CRIMPING_TOOL
  const canPosition =
    isWorkstationReady &&
    currentStep === RJ45_PROCEDURE_STEPS.POSITION_CONNECTOR_IN_CRIMPER &&
    !connectorPositionedForCrimp &&
    !isProcedureAnimating
  const canCrimp =
    isWorkstationReady &&
    currentStep === RJ45_PROCEDURE_STEPS.READY_TO_CRIMP &&
    connectorPositionedForCrimp &&
    !isProcedureAnimating &&
    !crimpComplete
  const showCrimpingWorkspace = isCrimpingWorkspaceStep(currentStep)

  useEffect(() => {
    if (
      currentStep === RJ45_PROCEDURE_STEPS.POSITION_CONNECTOR_IN_CRIMPER
    ) {
      crimperMoveProgress.current = 0
      crimperReturnProgress.current = 0
    }
  }, [currentStep])

  useEffect(() => {
    if (isConnectorPositioning) {
      positioningProgress.current = 0
      positioningCompletionRequested.current = false
    }
  }, [isConnectorPositioning])

  useEffect(() => {
    if (isCrimping) {
      crimpingProgress.current = 0
      crimpCompletionRequested.current = false
    }
  }, [isCrimping])

  useEffect(() => {
    if (
      (isPositionHovered && !canPosition) ||
      (isCrimpHovered && !canCrimp) ||
      !showCrimpingWorkspace
    ) {
      onHoveredObjectChange?.(null)
    }
  }, [
    canCrimp,
    canPosition,
    isCrimpHovered,
    isPositionHovered,
    onHoveredObjectChange,
    showCrimpingWorkspace,
  ])

  useFrame((_, delta) => {
    if (crimperGroup.current) {
      if (crimpComplete) {
        crimperReturnProgress.current = Math.min(
          crimperReturnProgress.current + delta / CRIMPER_MOVE_DURATION,
          1,
        )
        const returnProgress = smoothStep(crimperReturnProgress.current)

        crimperGroup.current.position.lerpVectors(
          crimperWorkPosition,
          crimperRestPosition,
          returnProgress,
        )
        crimperGroup.current.quaternion.slerpQuaternions(
          crimperWorkQuaternion,
          crimperRestQuaternion,
          returnProgress,
        )
      } else {
        crimperMoveProgress.current = Math.min(
          crimperMoveProgress.current + delta / CRIMPER_MOVE_DURATION,
          1,
        )
        const moveProgress = smoothStep(crimperMoveProgress.current)

        crimperGroup.current.position.lerpVectors(
          crimperRestPosition,
          crimperWorkPosition,
          moveProgress,
        )
        crimperGroup.current.quaternion.slerpQuaternions(
          crimperRestQuaternion,
          crimperWorkQuaternion,
          moveProgress,
        )
      }
    }

    if (assemblyGroup.current) {
      if (isConnectorPositioning) {
        positioningProgress.current = Math.min(
          positioningProgress.current +
            delta / CONNECTOR_POSITIONING_DURATION,
          1,
        )
        const progress = smoothStep(positioningProgress.current)

        assemblyGroup.current.position.lerpVectors(
          preCrimpPosition,
          crimpPosition,
          progress,
        )
        assemblyGroup.current.quaternion.slerpQuaternions(
          preCrimpQuaternion,
          crimpQuaternion,
          progress,
        )

        if (
          positioningProgress.current >= 1 &&
          !positioningCompletionRequested.current
        ) {
          positioningCompletionRequested.current = true
          completeConnectorPositioning()
        }
      } else if (connectorPositionedForCrimp || crimpComplete) {
        assemblyGroup.current.position.copy(crimpPosition)
        assemblyGroup.current.quaternion.copy(crimpQuaternion)
      } else {
        assemblyGroup.current.position.copy(preCrimpPosition)
        assemblyGroup.current.quaternion.copy(preCrimpQuaternion)
      }
    }

    if (isCrimping && !crimpCompletionRequested.current) {
      crimpingProgress.current = Math.min(
        crimpingProgress.current + delta / CRIMPING_DURATION,
        1,
      )
    }

    const rawCrimpProgress = crimpComplete
      ? 1
      : isCrimping
        ? crimpingProgress.current
        : 0
    const handleClosure = crimpComplete
      ? 0.55
      : getHandleClosure(rawCrimpProgress)
    const pressProgress = crimpComplete
      ? 1
      : smoothStep(clamp((rawCrimpProgress - 0.22) / 0.48, 0, 1))

    if (leftHandle.current) {
      leftHandle.current.rotation.y = -0.16 + handleClosure * 0.13
    }
    if (rightHandle.current) {
      rightHandle.current.rotation.y = 0.16 - handleClosure * 0.13
    }
    if (upperJaw.current) {
      upperJaw.current.position.y = 0.115 - handleClosure * 0.024
    }
    if (lowerJaw.current) {
      lowerJaw.current.position.y = -0.1 + handleClosure * 0.012
    }

    contactBladeRefs.current.forEach((contactBlade) => {
      if (contactBlade) {
        contactBlade.position.y = -CONTACT_PRESS_DISTANCE * pressProgress
      }
    })

    if (strainRelief.current) {
      strainRelief.current.position.y =
        -STRAIN_RELIEF_PRESS_DISTANCE * pressProgress
    }

    if (
      isCrimping &&
      crimpingProgress.current >= 1 &&
      !crimpCompletionRequested.current
    ) {
      crimpCompletionRequested.current = true
      completeConnectorCrimping()
    }
  })

  if (!showCrimpingWorkspace) {
    return null
  }

  const handlePositionPointerEnter = (event) => {
    if (!canPosition) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(POSITION_SLOT_HOVER_ID)
  }

  const handlePositionPointerLeave = (event) => {
    event.stopPropagation()
    onHoveredObjectChange?.(null)
  }

  const handlePositionClick = (event) => {
    if (!canPosition) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(null)
    startConnectorPositioning(activeToolId)
  }

  const handleCrimpPointerEnter = (event) => {
    if (!canCrimp) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(CRIMP_ACTION_HOVER_ID)
  }

  const handleCrimpPointerLeave = (event) => {
    event.stopPropagation()
    onHoveredObjectChange?.(null)
  }

  const handleCrimpClick = (event) => {
    if (!canCrimp) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(null)
    startConnectorCrimping(activeToolId)
  }

  return (
    <group visible={showCrimpingWorkspace}>
      <group
        ref={crimperGroup}
        position={CRIMPER_REST_POSITION}
        rotation={CRIMPER_REST_ROTATION}
        scale={crimpingToolConfig.activeScale}
      >
        <CrimpingTool
          leftHandleRef={leftHandle}
          rightHandleRef={rightHandle}
          upperJawRef={upperJaw}
          lowerJawRef={lowerJaw}
        />
      </group>

      <group
        ref={assemblyGroup}
        position={CONNECTOR_PRE_CRIMP_POSITION}
        rotation={CONNECTOR_PRE_CRIMP_ROTATION}
      >
        {cableSegments.map((segment, index) => (
          <mesh
            key={index}
            geometry={jacketGeometry}
            material={jacketMaterial}
            position={segment.position}
            quaternion={segment.quaternion}
            scale={[1, segment.length + 0.008, 1]}
            castShadow
            receiveShadow
          />
        ))}
        <mesh
          geometry={jacketEndGeometry}
          material={jacketEndMaterial}
          position={CABLE_PATH_POINTS[0]}
          rotation={[Math.PI / 2, 0, 0]}
        />

        {wireDefinitions.map((wire, index) => {
          const channelX = (index - 3.5) * CONNECTOR_CHANNEL_SPACING

          return (
            <group key={wire.id}>
              <mesh
                geometry={conductorGeometry}
                material={conductorMaterials[index]}
                position={[channelX, -0.02, CONDUCTOR_CENTER_Z]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={[1, CONDUCTOR_LENGTH, 1]}
                castShadow
              />
              {stripeMaterials[index] && (
                <mesh
                  geometry={stripeGeometry}
                  material={stripeMaterials[index]}
                  position={[
                    channelX,
                    -0.02 + WIRE_RADIUS * 0.9,
                    CONDUCTOR_CENTER_Z,
                  ]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={[1, CONDUCTOR_LENGTH, 1]}
                />
              )}
            </group>
          )
        })}

        <RJ45ConnectorModel
          contactBladeRefs={contactBladeRefs}
          strainReliefRef={strainRelief}
        />
      </group>

      <CrimpingGuide
        connectorTargetPosition={CONNECTOR_CRIMP_POSITION}
        crimpActionPosition={CRIMP_ACTION_POSITION}
        isPositioned={connectorPositionedForCrimp}
        canPosition={canPosition}
        canCrimp={canCrimp}
        isPositionHovered={isPositionHovered}
        isCrimpHovered={isCrimpHovered}
        onPositionPointerEnter={handlePositionPointerEnter}
        onPositionPointerLeave={handlePositionPointerLeave}
        onPositionClick={handlePositionClick}
        onCrimpPointerEnter={handleCrimpPointerEnter}
        onCrimpPointerLeave={handleCrimpPointerLeave}
        onCrimpClick={handleCrimpClick}
      />
    </group>
  )
}

export {
  CABLE_DIAMETER,
  CABLE_PATH_POINTS,
  CONNECTOR_CRIMP_POSITION,
  CONNECTOR_PRE_CRIMP_POSITION,
  CRIMPER_MOVE_DURATION,
  CRIMPER_POSITION,
  CRIMPER_REST_POSITION,
}
