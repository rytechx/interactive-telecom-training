import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useCallback, useEffect, useRef } from 'react'
import {
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from 'three'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../../store/useToolStore.js'
import useTrainingStore from '../../store/useTrainingStore.js'
import { TOOL_IDS } from '../../tools/toolConfigs.js'
import { RJ45_WORKSTATION } from '../../workstations/workstationConfigs.js'
import RJ45ConnectorInsertion from './RJ45ConnectorInsertion.jsx'
import RJ45Crimping from './RJ45Crimping.jsx'
import RJ45CableTesting from './RJ45CableTesting.jsx'
import RJ45WireArrangement from './RJ45WireArrangement.jsx'
import RJ45WireTrimming from './RJ45WireTrimming.jsx'
import {
  ETHERNET_CABLE_ID,
  JACKET_STRIPPING_DURATION,
  JACKET_STRIPPING_WORK_END,
  RJ45_PROCEDURE_STEPS,
} from './rj45Procedure.js'
import { CABLE_LENGTH, WIRE_LENGTH } from './wireDefinitions.js'

const EXPOSED_LENGTH = WIRE_LENGTH
const workspaceMatGeometry = new BoxGeometry(1.45, 0.018, 2.72)
const workspaceMatBorderGeometry = new BoxGeometry(1.49, 0.012, 2.76)
const workspaceMatMaterial = new MeshStandardMaterial({
  color: '#1d2a30',
  metalness: 0.04,
  roughness: 0.94,
})
const workspaceMatBorderMaterial = new MeshStandardMaterial({
  color: '#11191e',
  metalness: 0.08,
  roughness: 0.86,
})
const cableTailGeometry = new CylinderGeometry(0.055, 0.055, 1, 12)
const cableTailMaterial = new MeshStandardMaterial({
  color: '#1f5f8a',
  metalness: 0.01,
  roughness: 0.66,
})
const cableTailPoints = Object.freeze([
  Object.freeze([0, 0, CABLE_LENGTH / 2]),
  Object.freeze([0.06, 0, 1.16]),
  Object.freeze([0.18, 0, 1.28]),
])
const cableAxis = new Vector3(0, 1, 0)
const cableTailSegments = cableTailPoints.slice(0, -1).map((start, index) => {
  const startPoint = new Vector3().fromArray(start)
  const endPoint = new Vector3().fromArray(cableTailPoints[index + 1])
  const direction = endPoint.clone().sub(startPoint)

  return Object.freeze({
    position: Object.freeze(
      startPoint.clone().add(endPoint).multiplyScalar(0.5).toArray(),
    ),
    quaternion: new Quaternion().setFromUnitVectors(
      cableAxis,
      direction.clone().normalize(),
    ),
    length: direction.length(),
  })
})

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress)
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

function isCrimpingWorkspaceStep(currentStep) {
  return [
    RJ45_PROCEDURE_STEPS.POSITION_CONNECTOR_IN_CRIMPER,
    RJ45_PROCEDURE_STEPS.READY_TO_CRIMP,
    RJ45_PROCEDURE_STEPS.CRIMPING,
    RJ45_PROCEDURE_STEPS.CRIMP_COMPLETE,
    RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_5,
  ].includes(currentStep)
}

function isCableTestingWorkspaceStep(currentStep) {
  return [
    RJ45_PROCEDURE_STEPS.SELECT_CABLE_TESTER,
    RJ45_PROCEDURE_STEPS.CONNECT_CABLE_TO_TESTER,
    RJ45_PROCEDURE_STEPS.READY_TO_TEST,
    RJ45_PROCEDURE_STEPS.TESTING_CABLE,
    RJ45_PROCEDURE_STEPS.TEST_RESULT,
    RJ45_PROCEDURE_STEPS.RJ45_MODULE_COMPLETE,
  ].includes(currentStep)
}

export default function RJ45Cable({
  position = RJ45_WORKSTATION.workspacePosition,
  hoveredObjectId,
  onHoveredObjectChange,
}) {
  const jacket = useRef(null)
  const animationProgress = useRef(0)
  const trimProgress = useRef(0)
  const insertionProgress = useRef(0)
  const completionRequested = useRef(false)
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const isTrainingMode = useInteractionStore(
    (state) => state.isTrainingMode,
  )
  const toolViewState = useToolStore((state) => state.toolViewState)
  const activeToolId = useToolStore((state) => state.activeToolId)
  const trainingStarted = useTrainingStore((state) => state.trainingStarted)
  const currentStep = useTrainingStore((state) => state.currentStep)
  const selectedWorkpieceId = useTrainingStore(
    (state) => state.selectedWorkpieceId,
  )
  const completedSteps = useTrainingStore((state) => state.completedSteps)
  const isProcedureAnimating = useTrainingStore(
    (state) => state.isProcedureAnimating,
  )
  const selectWorkpiece = useTrainingStore((state) => state.selectWorkpiece)
  const startJacketStripping = useTrainingStore(
    (state) => state.startJacketStripping,
  )
  const completeJacketStripping = useTrainingStore(
    (state) => state.completeJacketStripping,
  )
  const isWorkstationReady =
    workstationPhase === WORKSTATION_PHASES.FOCUSED &&
    isTrainingMode &&
    trainingStarted &&
    toolViewState === TOOL_VIEW_STATES.IDLE &&
    !isProcedureAnimating
  const canSelectCable =
    isWorkstationReady &&
    currentStep === RJ45_PROCEDURE_STEPS.SELECT_CABLE &&
    !activeToolId
  const canStripCable =
    isWorkstationReady &&
    currentStep === RJ45_PROCEDURE_STEPS.STRIP_JACKET &&
    activeToolId === TOOL_IDS.WIRE_STRIPPER
  const canInteract = canSelectCable || canStripCable
  const isHovered = hoveredObjectId === ETHERNET_CABLE_ID
  const isSelected = selectedWorkpieceId === ETHERNET_CABLE_ID
  const hasStrippedJacket = completedSteps.includes(
    RJ45_PROCEDURE_STEPS.STRIP_JACKET,
  )
  const isCrimpingWorkspace = isCrimpingWorkspaceStep(currentStep)
  const isCableTestingWorkspace = isCableTestingWorkspaceStep(currentStep)

  const applyStrippingProgress = useCallback((rawProgress) => {
    const progress = smoothStep(
      Math.min(rawProgress / JACKET_STRIPPING_WORK_END, 1),
    )
    const currentJacketLength = CABLE_LENGTH - EXPOSED_LENGTH * progress

    if (jacket.current) {
      jacket.current.scale.y = currentJacketLength / CABLE_LENGTH
      jacket.current.position.z = (EXPOSED_LENGTH * progress) / 2
    }
  }, [])

  useEffect(() => {
    if (hasStrippedJacket) {
      animationProgress.current = 1
      applyStrippingProgress(1)
      return
    }

    if (
      !trainingStarted ||
      currentStep === RJ45_PROCEDURE_STEPS.SELECT_CABLE
    ) {
      animationProgress.current = 0
      completionRequested.current = false
      applyStrippingProgress(0)
    }
  }, [
    applyStrippingProgress,
    currentStep,
    hasStrippedJacket,
    trainingStarted,
  ])

  useEffect(() => {
    if (
      isProcedureAnimating &&
      currentStep === RJ45_PROCEDURE_STEPS.STRIP_JACKET
    ) {
      animationProgress.current = 0
      completionRequested.current = false
    }
  }, [currentStep, isProcedureAnimating])

  useEffect(() => {
    if (!canInteract && isHovered) {
      onHoveredObjectChange?.(null)
    }
  }, [canInteract, isHovered, onHoveredObjectChange])

  useFrame((_, delta) => {
    if (jacket.current) {
      jacket.current.visible =
        !isConnectorWorkspaceStep(currentStep) &&
        !isCrimpingWorkspace &&
        !isCableTestingWorkspace
      jacket.current.position.x = 0
    }

    if (
      currentStep !== RJ45_PROCEDURE_STEPS.STRIP_JACKET ||
      !isProcedureAnimating ||
      completionRequested.current
    ) {
      return
    }

    animationProgress.current = Math.min(
      animationProgress.current + delta / JACKET_STRIPPING_DURATION,
      1,
    )
    applyStrippingProgress(animationProgress.current)

    if (animationProgress.current >= 1) {
      completionRequested.current = true
      completeJacketStripping()
    }
  })

  const handlePointerEnter = (event) => {
    if (!canInteract) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(ETHERNET_CABLE_ID)
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
      selectWorkpiece(ETHERNET_CABLE_ID)
      return
    }

    if (canStripCable) {
      startJacketStripping()
    }
  }

  const jacketEmissive = canStripCable
    ? '#3f9662'
    : isHovered
      ? '#4a8fc7'
      : isSelected
        ? '#2d5978'
        : '#000000'

  return (
    <group position={position}>
      <mesh
        geometry={workspaceMatBorderGeometry}
        material={workspaceMatBorderMaterial}
        position={[0, -0.066, 0]}
        receiveShadow
      />
      <mesh
        geometry={workspaceMatGeometry}
        material={workspaceMatMaterial}
        position={[0, -0.056, 0]}
        receiveShadow
      />

      {cableTailSegments.map((segment, index) => (
        <mesh
          key={index}
          geometry={cableTailGeometry}
          material={cableTailMaterial}
          position={segment.position}
          quaternion={segment.quaternion}
          scale={[1, segment.length + 0.008, 1]}
          castShadow
          receiveShadow
          visible={
            !isConnectorWorkspaceStep(currentStep) &&
            !isCrimpingWorkspace &&
            !isCableTestingWorkspace
          }
        />
      ))}

      <mesh
        ref={jacket}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        <cylinderGeometry args={[0.055, 0.055, CABLE_LENGTH, 12]} />
        <meshStandardMaterial
          color="#1f5f8a"
          emissive={jacketEmissive}
          emissiveIntensity={canStripCable ? 0.5 : isSelected ? 0.35 : 0.25}
          metalness={0.02}
          roughness={0.58}
        />
      </mesh>

      <RJ45WireArrangement
        visible={!isCrimpingWorkspace && !isCableTestingWorkspace}
        jacketProgressRef={animationProgress}
        trimProgressRef={trimProgress}
        insertionProgressRef={insertionProgress}
        hoveredObjectId={hoveredObjectId}
        onHoveredObjectChange={onHoveredObjectChange}
      />

      <RJ45WireTrimming
        trimProgressRef={trimProgress}
        hoveredObjectId={hoveredObjectId}
        onHoveredObjectChange={onHoveredObjectChange}
      />

      <RJ45ConnectorInsertion
        insertionProgressRef={insertionProgress}
        hoveredObjectId={hoveredObjectId}
        onHoveredObjectChange={onHoveredObjectChange}
      />

      <RJ45Crimping
        hoveredObjectId={hoveredObjectId}
        onHoveredObjectChange={onHoveredObjectChange}
      />

      <RJ45CableTesting
        hoveredObjectId={hoveredObjectId}
        onHoveredObjectChange={onHoveredObjectChange}
      />

      {isHovered && canInteract && (
        <Html position={[0, 0.22, 0.55]} center>
          <div className="tool-tooltip" role="tooltip">
            Ethernet Cable
          </div>
        </Html>
      )}
    </group>
  )
}
