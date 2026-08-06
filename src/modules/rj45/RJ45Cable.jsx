import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useCallback, useEffect, useRef } from 'react'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../../store/useToolStore.js'
import useTrainingStore from '../../store/useTrainingStore.js'
import { TOOL_IDS } from '../../tools/toolConfigs.js'
import RJ45WireArrangement from './RJ45WireArrangement.jsx'
import {
  ETHERNET_CABLE_ID,
  RJ45_PROCEDURE_STEPS,
} from './rj45Procedure.js'

const CABLE_LENGTH = 1.55
const EXPOSED_LENGTH = 0.42
const STRIPPING_DURATION = 0.9

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress)
}

export default function RJ45Cable({
  position = [-5.15, 0.95, -2.95],
  hoveredObjectId,
  onHoveredObjectChange,
}) {
  const jacket = useRef(null)
  const animationProgress = useRef(0)
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

  const applyStrippingProgress = useCallback((rawProgress) => {
    const progress = smoothStep(rawProgress)
    const currentJacketLength = CABLE_LENGTH - EXPOSED_LENGTH * progress

    if (jacket.current) {
      jacket.current.scale.y = currentJacketLength / CABLE_LENGTH
      jacket.current.position.x = -(EXPOSED_LENGTH * progress) / 2
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
    if (
      currentStep !== RJ45_PROCEDURE_STEPS.STRIP_JACKET ||
      !isProcedureAnimating ||
      completionRequested.current
    ) {
      return
    }

    animationProgress.current = Math.min(
      animationProgress.current + delta / STRIPPING_DURATION,
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
        ref={jacket}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        receiveShadow
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        <cylinderGeometry args={[0.055, 0.055, CABLE_LENGTH, 12]} />
        <meshStandardMaterial
          color="#304e68"
          emissive={jacketEmissive}
          emissiveIntensity={canStripCable ? 0.5 : isSelected ? 0.35 : 0.25}
          roughness={0.72}
        />
      </mesh>

      <RJ45WireArrangement
        jacketProgressRef={animationProgress}
        hoveredObjectId={hoveredObjectId}
        onHoveredObjectChange={onHoveredObjectChange}
      />

      {isHovered && canInteract && (
        <Html position={[0, 0.22, 0]} center>
          <div className="tool-tooltip" role="tooltip">
            Ethernet Cable
          </div>
        </Html>
      )}
    </group>
  )
}

export { STRIPPING_DURATION }
