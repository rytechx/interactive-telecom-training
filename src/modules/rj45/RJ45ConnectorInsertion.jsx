import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Euler, Quaternion, Vector3 } from 'three'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../../store/useToolStore.js'
import useTrainingStore from '../../store/useTrainingStore.js'
import { TOOL_IDS } from '../../tools/toolConfigs.js'
import {
  CONNECTOR_ALIGNMENT_DURATION,
  CONNECTOR_INSERTION_DURATION,
  RJ45_PROCEDURE_STEPS,
} from './rj45Procedure.js'
import RJ45ConnectorModel, {
  CONNECTOR_ALIGNED_POSITION,
  CONNECTOR_ALIGNED_ROTATION,
  CONNECTOR_INITIAL_POSITION,
  CONNECTOR_INITIAL_ROTATION,
  CONNECTOR_JACKET_INITIAL_Z,
  CONNECTOR_JACKET_LENGTH,
  JACKET_INSERTION_DISTANCE,
} from './RJ45ConnectorModel.jsx'
import { CONNECTOR_WIRE_CENTER_X } from './wireDefinitions.js'

const CONNECTOR_ENTRY_HOVER_ID = 'rj45-connector-entry'
const alignedQuaternion = new Quaternion().setFromEuler(
  new Euler(...CONNECTOR_ALIGNED_ROTATION),
)
const alignedPosition = new Vector3().fromArray(CONNECTOR_ALIGNED_POSITION)

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress)
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum)
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

export default function RJ45ConnectorInsertion({
  insertionProgressRef,
  hoveredObjectId,
  onHoveredObjectChange,
}) {
  const connectorGroup = useRef(null)
  const connectorJacket = useRef(null)
  const alignmentProgress = useRef(0)
  const alignmentStartPosition = useRef(new Vector3())
  const alignmentStartQuaternion = useRef(new Quaternion())
  const alignmentCompletionRequested = useRef(false)
  const insertionCompletionRequested = useRef(false)
  const verificationRequested = useRef(false)
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
  const connectorAligned = useTrainingStore((state) => state.connectorAligned)
  const isConnectorAligning = useTrainingStore(
    (state) => state.isConnectorAligning,
  )
  const isConnectorInserting = useTrainingStore(
    (state) => state.isConnectorInserting,
  )
  const conductorsInserted = useTrainingStore(
    (state) => state.conductorsInserted,
  )
  const completeConnectorAlignment = useTrainingStore(
    (state) => state.completeConnectorAlignment,
  )
  const startConductorInsertion = useTrainingStore(
    (state) => state.startConductorInsertion,
  )
  const completeConductorInsertion = useTrainingStore(
    (state) => state.completeConductorInsertion,
  )
  const verifyConductorInsertion = useTrainingStore(
    (state) => state.verifyConductorInsertion,
  )
  const isHovered = hoveredObjectId === CONNECTOR_ENTRY_HOVER_ID
  const showConnector =
    isConnectorWorkspaceStep(currentStep) &&
    (activeToolId === TOOL_IDS.RJ45_CONNECTOR || conductorsInserted)
  const canInsert =
    workstationPhase === WORKSTATION_PHASES.FOCUSED &&
    isTrainingMode &&
    toolViewState === TOOL_VIEW_STATES.IDLE &&
    activeToolId === TOOL_IDS.RJ45_CONNECTOR &&
    connectorAligned &&
    currentStep === RJ45_PROCEDURE_STEPS.INSERT_CONDUCTORS &&
    !isProcedureAnimating

  useEffect(() => {
    if (!isConnectorAligning || !connectorGroup.current) {
      return
    }

    alignmentProgress.current = 0
    alignmentCompletionRequested.current = false
    alignmentStartPosition.current.copy(connectorGroup.current.position)
    alignmentStartQuaternion.current.copy(connectorGroup.current.quaternion)
  }, [isConnectorAligning])

  useEffect(() => {
    if (
      currentStep === RJ45_PROCEDURE_STEPS.INSERTING_CONDUCTORS &&
      isConnectorInserting
    ) {
      insertionProgressRef.current = 0
      insertionCompletionRequested.current = false
      verificationRequested.current = false
      return
    }

    if (
      currentStep === RJ45_PROCEDURE_STEPS.VERIFY_INSERTION ||
      conductorsInserted
    ) {
      insertionProgressRef.current = 1
      return
    }

    insertionProgressRef.current = 0
    insertionCompletionRequested.current = false
    verificationRequested.current = false
  }, [
    conductorsInserted,
    currentStep,
    insertionProgressRef,
    isConnectorInserting,
  ])

  useEffect(() => {
    if (
      currentStep !== RJ45_PROCEDURE_STEPS.VERIFY_INSERTION ||
      verificationRequested.current
    ) {
      return
    }

    verificationRequested.current = true
    verifyConductorInsertion()
  }, [currentStep, verifyConductorInsertion])

  useEffect(() => {
    if ((!canInsert || !showConnector) && isHovered) {
      onHoveredObjectChange?.(null)
    }
  }, [canInsert, isHovered, onHoveredObjectChange, showConnector])

  useFrame((_, delta) => {
    if (connectorGroup.current) {
      if (isConnectorAligning) {
        alignmentProgress.current = Math.min(
          alignmentProgress.current + delta / CONNECTOR_ALIGNMENT_DURATION,
          1,
        )
        const progress = smoothStep(alignmentProgress.current)

        connectorGroup.current.position.lerpVectors(
          alignmentStartPosition.current,
          alignedPosition,
          progress,
        )
        connectorGroup.current.quaternion.slerpQuaternions(
          alignmentStartQuaternion.current,
          alignedQuaternion,
          progress,
        )

        if (
          alignmentProgress.current >= 1 &&
          !alignmentCompletionRequested.current
        ) {
          alignmentCompletionRequested.current = true
          completeConnectorAlignment()
        }
      } else if (connectorAligned || conductorsInserted) {
        connectorGroup.current.position.fromArray(CONNECTOR_ALIGNED_POSITION)
        connectorGroup.current.quaternion.copy(alignedQuaternion)
      } else {
        connectorGroup.current.position.fromArray(CONNECTOR_INITIAL_POSITION)
        connectorGroup.current.rotation.set(...CONNECTOR_INITIAL_ROTATION)
      }
    }

    if (connectorJacket.current) {
      const jacketProgress = smoothStep(
        clamp((insertionProgressRef.current - 0.18) / 0.68, 0, 1),
      )

      connectorJacket.current.position.z =
        CONNECTOR_JACKET_INITIAL_Z +
        JACKET_INSERTION_DISTANCE * jacketProgress
    }

    if (
      currentStep !== RJ45_PROCEDURE_STEPS.INSERTING_CONDUCTORS ||
      !isConnectorInserting ||
      insertionCompletionRequested.current
    ) {
      return
    }

    insertionProgressRef.current = Math.min(
      insertionProgressRef.current + delta / CONNECTOR_INSERTION_DURATION,
      1,
    )

    if (insertionProgressRef.current >= 1) {
      insertionCompletionRequested.current = true
      completeConductorInsertion()
    }
  })

  if (!showConnector) {
    return null
  }

  const handleEntryPointerEnter = (event) => {
    if (!canInsert) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(CONNECTOR_ENTRY_HOVER_ID)
  }

  const handleEntryPointerLeave = (event) => {
    event.stopPropagation()
    onHoveredObjectChange?.(null)
  }

  const handleEntryClick = (event) => {
    if (
      activeToolId !== TOOL_IDS.RJ45_CONNECTOR ||
      (currentStep !== RJ45_PROCEDURE_STEPS.ALIGN_CONNECTOR && !canInsert)
    ) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(null)
    startConductorInsertion()
  }

  return (
    <>
      <group
        ref={connectorJacket}
        position={[
          CONNECTOR_WIRE_CENTER_X,
          0.05,
          CONNECTOR_JACKET_INITIAL_Z,
        ]}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry
            args={[0.055, 0.055, CONNECTOR_JACKET_LENGTH, 12]}
          />
          <meshStandardMaterial
            color="#1f5f8a"
            metalness={0.02}
            roughness={0.66}
          />
        </mesh>
        <mesh
          position={[0, 0, -CONNECTOR_JACKET_LENGTH / 2]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.057, 0.057, 0.018, 12]} />
          <meshStandardMaterial
            color="#143e5c"
            metalness={0.02}
            roughness={0.62}
          />
        </mesh>
      </group>
      <group
        ref={connectorGroup}
        position={CONNECTOR_INITIAL_POSITION}
        rotation={CONNECTOR_INITIAL_ROTATION}
      >
        <RJ45ConnectorModel
          isEntryHighlighted={isHovered}
          onEntryPointerEnter={handleEntryPointerEnter}
          onEntryPointerLeave={handleEntryPointerLeave}
          onEntryClick={handleEntryClick}
        />
      </group>
    </>
  )
}
