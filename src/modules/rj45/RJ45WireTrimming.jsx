import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../../store/useToolStore.js'
import useTrainingStore from '../../store/useTrainingStore.js'
import { TOOL_IDS } from '../../tools/toolConfigs.js'
import {
  RJ45_PROCEDURE_STEPS,
  TRIMMING_DURATION,
} from './rj45Procedure.js'
import TrimGuide from './TrimGuide.jsx'

const TRIM_HOVER_ID = 'rj45-trim-area'

function isTrimmingWorkspaceStep(currentStep) {
  return [
    RJ45_PROCEDURE_STEPS.POSITION_FOR_TRIM,
    RJ45_PROCEDURE_STEPS.TRIM_WIRES,
    RJ45_PROCEDURE_STEPS.TRIMMING,
    RJ45_PROCEDURE_STEPS.WIRES_TRIMMED,
    RJ45_PROCEDURE_STEPS.COMPLETE_FOR_TASK_3,
  ].includes(currentStep)
}

export default function RJ45WireTrimming({
  trimProgressRef,
  hoveredObjectId,
  onHoveredObjectChange,
}) {
  const completionRequested = useRef(false)
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const isTrainingMode = useInteractionStore(
    (state) => state.isTrainingMode,
  )
  const toolViewState = useToolStore((state) => state.toolViewState)
  const activeToolId = useToolStore((state) => state.activeToolId)
  const currentStep = useTrainingStore((state) => state.currentStep)
  const isProcedureAnimating = useTrainingStore(
    (state) => state.isProcedureAnimating,
  )
  const wiresTrimmed = useTrainingStore((state) => state.wiresTrimmed)
  const startWireTrimming = useTrainingStore(
    (state) => state.startWireTrimming,
  )
  const completeWireTrimming = useTrainingStore(
    (state) => state.completeWireTrimming,
  )
  const isHovered = hoveredObjectId === TRIM_HOVER_ID
  const showTrimGuide = isTrimmingWorkspaceStep(currentStep)
  const canTrim =
    workstationPhase === WORKSTATION_PHASES.FOCUSED &&
    isTrainingMode &&
    toolViewState === TOOL_VIEW_STATES.IDLE &&
    activeToolId === TOOL_IDS.CRIMPING_TOOL &&
    currentStep === RJ45_PROCEDURE_STEPS.POSITION_FOR_TRIM &&
    !isProcedureAnimating &&
    !wiresTrimmed

  useEffect(() => {
    if (
      currentStep === RJ45_PROCEDURE_STEPS.TRIMMING &&
      isProcedureAnimating
    ) {
      trimProgressRef.current = 0
      completionRequested.current = false
      return
    }

    if (wiresTrimmed) {
      trimProgressRef.current = 1
      return
    }

    if (!isTrimmingWorkspaceStep(currentStep)) {
      trimProgressRef.current = 0
      completionRequested.current = false
    }
  }, [currentStep, isProcedureAnimating, trimProgressRef, wiresTrimmed])

  useEffect(() => {
    if ((!canTrim || !showTrimGuide) && isHovered) {
      onHoveredObjectChange?.(null)
    }
  }, [canTrim, isHovered, onHoveredObjectChange, showTrimGuide])

  useFrame((_, delta) => {
    if (
      currentStep !== RJ45_PROCEDURE_STEPS.TRIMMING ||
      !isProcedureAnimating ||
      completionRequested.current
    ) {
      return
    }

    trimProgressRef.current = Math.min(
      trimProgressRef.current + delta / TRIMMING_DURATION,
      1,
    )

    if (trimProgressRef.current >= 1) {
      completionRequested.current = true
      completeWireTrimming()
    }
  })

  if (!showTrimGuide) {
    return null
  }

  const handlePointerEnter = (event) => {
    if (!canTrim) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(TRIM_HOVER_ID)
  }

  const handlePointerLeave = (event) => {
    event.stopPropagation()
    onHoveredObjectChange?.(null)
  }

  const handleClick = (event) => {
    if (!canTrim) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(null)
    startWireTrimming()
  }

  return (
    <TrimGuide
      canInteract={canTrim}
      isHovered={isHovered}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    />
  )
}
