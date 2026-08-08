import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import {
  CylinderGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
  QuadraticBezierCurve3,
  TubeGeometry,
  Vector3,
} from 'three'
import useFiberTrainingStore from '../../store/useFiberTrainingStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../../store/useToolStore.js'
import { FiberProtectionSleeve, FusionSplicer } from './FiberTools.jsx'
import {
  FIBER_ALIGNMENT_DURATION,
  FIBER_CLAMP_DURATION,
  FIBER_COOLING_DURATION,
  FIBER_FUSION_DURATION,
  FIBER_HEATER_COVER_DURATION,
  FIBER_HEATER_POSITIONING_DURATION,
  FIBER_HEATING_DURATION,
  FIBER_LID_DURATION,
  FIBER_LOADING_DURATION,
  FIBER_PROTECTED_SPLICE_REMOVAL_DURATION,
  FIBER_PROCEDURE_STEPS,
  FIBER_REMOVAL_DURATION,
  FIBER_SLEEVE_POSITIONING_DURATION,
  isFiberProtectionStep,
} from './fiberProcedure.js'
import {
  FIBER_TOOL_IDS,
  getFiberToolConfig,
} from './fiberToolConfigs.js'

const FIBER_A_ID = 'prepared-fiber-a'
const FIBER_B_ID = 'prepared-fiber-b'
const SPLICER_ACTION_ID = 'fusion-splicer-action'
const SLEEVE_ACTION_ID = 'splice-protection-sleeve-action'
const PROTECTED_SPLICE_ACTION_ID = 'protected-splice-action'
const HEATER_ACTION_ID = 'fusion-splicer-heater-action'
const FIBER_AXIS_Y = 1.278
const FIBER_AXIS_Z = -0.463
const fusionSplicer = getFiberToolConfig(FIBER_TOOL_IDS.FUSION_SPLICER)

const A_REST_POSITION = [-0.24, 0.998, 0.24]
const B_REST_POSITION = [0.24, 0.998, 0.24]
const A_LOADED_POSITION = [0, FIBER_AXIS_Y + 0.008, FIBER_AXIS_Z + 0.012]
const B_LOADED_POSITION = [0, FIBER_AXIS_Y - 0.008, FIBER_AXIS_Z - 0.012]
const A_ALIGNED_POSITION = [0.05, FIBER_AXIS_Y, FIBER_AXIS_Z]
const B_ALIGNED_POSITION = [-0.05, FIBER_AXIS_Y, FIBER_AXIS_Z]
const A_FUSED_POSITION = [0.075, FIBER_AXIS_Y, FIBER_AXIS_Z]
const B_FUSED_POSITION = [-0.075, FIBER_AXIS_Y, FIBER_AXIS_Z]
const REMOVED_PAIR_POSITION = [0, 0.18, 0.42]
const HEATER_PAIR_POSITION = [0, -0.09, -0.315]
const INSPECTION_PAIR_POSITION = [0, 0.18, 0.5]
const SLEEVE_PARKED_POSITION = [-0.82, 0, 0]
const SLEEVE_CENTERED_POSITION = [-0.075, 0, 0]
const SLEEVE_OUTER_RADIUS = 0.068
const SLEEVE_INNER_RADIUS = 0.055
const SHRUNK_SLEEVE_OUTER_RADIUS = 0.04
const SHRUNK_SLEEVE_INNER_RADIUS = 0.023
const CLAMP_OPEN_Y = 0.46
const CLAMP_CLOSED_Y = 0.37
const LID_OPEN_ROTATION = -1.02
const LID_CLOSED_ROTATION = -0.08
const HEATER_COVER_OPEN_ROTATION = -1.02
const HEATER_COVER_CLOSED_ROTATION = -0.08

const fiberGeometry = new CylinderGeometry(1, 1, 1, 14)
const jacketMaterial = new MeshStandardMaterial({
  color: '#ddb13d',
  roughness: 0.72,
})
const bufferMaterial = new MeshStandardMaterial({
  color: '#eeece3',
  roughness: 0.58,
})
const coatingMaterial = new MeshStandardMaterial({
  color: '#4d8fc4',
  roughness: 0.4,
})
const glassMaterial = new MeshStandardMaterial({
  color: '#e9f6f4',
  transparent: true,
  opacity: 0.94,
  roughness: 0.16,
})
const arcMaterial = new MeshBasicMaterial({
  color: '#9eeeff',
  transparent: true,
  opacity: 0,
  toneMapped: false,
})
const arcGeometry = new TubeGeometry(
  new QuadraticBezierCurve3(
    new Vector3(-0.11, 0, 0),
    new Vector3(0, 0.045, 0),
    new Vector3(0.11, 0, 0),
  ),
  12,
  0.005,
  6,
  false,
)

const ANIMATION_TYPES = Object.freeze({
  LOAD_A: 'load-fiber-a',
  LOAD_B: 'load-fiber-b',
  CLAMP: 'close-clamps',
  CLOSE_LID: 'close-lid',
  ALIGN: 'align-fibers',
  FUSE: 'fuse-fibers',
  OPEN_LID: 'open-lid',
  RELEASE: 'release-clamps',
  REMOVE: 'remove-fused-fiber',
  POSITION_SLEEVE: 'position-protection-sleeve',
  PLACE_IN_HEATER: 'place-in-heater',
  CLOSE_HEATER: 'close-heater',
  HEAT_SLEEVE: 'heat-protection-sleeve',
  COOL_SLEEVE: 'cool-protection-sleeve',
  OPEN_HEATER: 'open-heater',
  REMOVE_FROM_HEATER: 'remove-from-heater',
})

function clamp(value, minimum = 0, maximum = 1) {
  return Math.min(Math.max(value, minimum), maximum)
}

function smoothStep(progress) {
  const clampedProgress = clamp(progress)
  return clampedProgress * clampedProgress * (3 - 2 * clampedProgress)
}

function interpolatePosition(group, start, end, progress) {
  if (!group) {
    return
  }

  group.position.set(
    start[0] + (end[0] - start[0]) * progress,
    start[1] + (end[1] - start[1]) * progress,
    start[2] + (end[2] - start[2]) * progress,
  )
}

function FiberSegment({ startX, endX, radius, material }) {
  return (
    <mesh
      geometry={fiberGeometry}
      material={material}
      position={[(startX + endX) / 2, 0, 0]}
      rotation={[0, 0, Math.PI / 2]}
      scale={[radius, Math.abs(endX - startX), radius]}
      castShadow
      receiveShadow
    />
  )
}

function PreparedFiberEnd({
  fiberRef,
  side,
  label,
  loaded,
  fused,
  showLabel = true,
  children,
}) {
  return (
    <group ref={fiberRef}>
      <FiberSegment
        startX={side * 1.18}
        endX={side * 0.56}
        radius={0.052}
        material={jacketMaterial}
      />
      <FiberSegment
        startX={side * 0.59}
        endX={side * 0.35}
        radius={0.031}
        material={bufferMaterial}
      />
      <FiberSegment
        startX={side * 0.37}
        endX={side * 0.22}
        radius={0.019}
        material={coatingMaterial}
      />
      <FiberSegment
        startX={side * 0.24}
        endX={side * 0.075}
        radius={0.0075}
        material={glassMaterial}
      />
      {children}
      {showLabel && (
        <Html position={[side * 0.78, 0.18, 0.1]} center>
          <div className="fiber-end-label">
            <strong>{label}</strong>
            <span>{fused ? 'Fused' : loaded ? 'Loaded' : 'Prepared'}</span>
          </div>
        </Html>
      )}
    </group>
  )
}

function getAnimationType(currentStep, isProcedureAnimating) {
  if (!isProcedureAnimating) {
    return null
  }

  const animationSteps = {
    [FIBER_PROCEDURE_STEPS.LOADING_FIBER_A]: ANIMATION_TYPES.LOAD_A,
    [FIBER_PROCEDURE_STEPS.LOADING_FIBER_B]: ANIMATION_TYPES.LOAD_B,
    [FIBER_PROCEDURE_STEPS.CLOSING_CLAMPS]: ANIMATION_TYPES.CLAMP,
    [FIBER_PROCEDURE_STEPS.CLOSING_SPLICER_LID]: ANIMATION_TYPES.CLOSE_LID,
    [FIBER_PROCEDURE_STEPS.ALIGNING]: ANIMATION_TYPES.ALIGN,
    [FIBER_PROCEDURE_STEPS.FUSING]: ANIMATION_TYPES.FUSE,
    [FIBER_PROCEDURE_STEPS.OPENING_SPLICER_LID]: ANIMATION_TYPES.OPEN_LID,
    [FIBER_PROCEDURE_STEPS.RELEASING_CLAMPS]: ANIMATION_TYPES.RELEASE,
    [FIBER_PROCEDURE_STEPS.REMOVING_FUSED_FIBER]: ANIMATION_TYPES.REMOVE,
    [FIBER_PROCEDURE_STEPS.POSITIONING_PROTECTION_SLEEVE]:
      ANIMATION_TYPES.POSITION_SLEEVE,
    [FIBER_PROCEDURE_STEPS.POSITIONING_IN_HEATER]:
      ANIMATION_TYPES.PLACE_IN_HEATER,
    [FIBER_PROCEDURE_STEPS.HEATER_CLOSED]: ANIMATION_TYPES.CLOSE_HEATER,
    [FIBER_PROCEDURE_STEPS.HEATING_PROTECTION_SLEEVE]:
      ANIMATION_TYPES.HEAT_SLEEVE,
    [FIBER_PROCEDURE_STEPS.COOLING_PROTECTION_SLEEVE]:
      ANIMATION_TYPES.COOL_SLEEVE,
    [FIBER_PROCEDURE_STEPS.HEATER_OPEN]: ANIMATION_TYPES.OPEN_HEATER,
    [FIBER_PROCEDURE_STEPS.REMOVING_FROM_HEATER]:
      ANIMATION_TYPES.REMOVE_FROM_HEATER,
  }

  return animationSteps[currentStep] ?? null
}

function getAnimationDuration(animationType) {
  const durations = {
    [ANIMATION_TYPES.LOAD_A]: FIBER_LOADING_DURATION,
    [ANIMATION_TYPES.LOAD_B]: FIBER_LOADING_DURATION,
    [ANIMATION_TYPES.CLAMP]: FIBER_CLAMP_DURATION,
    [ANIMATION_TYPES.RELEASE]: FIBER_CLAMP_DURATION,
    [ANIMATION_TYPES.CLOSE_LID]: FIBER_LID_DURATION,
    [ANIMATION_TYPES.OPEN_LID]: FIBER_LID_DURATION,
    [ANIMATION_TYPES.ALIGN]: FIBER_ALIGNMENT_DURATION,
    [ANIMATION_TYPES.FUSE]: FIBER_FUSION_DURATION,
    [ANIMATION_TYPES.REMOVE]: FIBER_REMOVAL_DURATION,
    [ANIMATION_TYPES.POSITION_SLEEVE]: FIBER_SLEEVE_POSITIONING_DURATION,
    [ANIMATION_TYPES.PLACE_IN_HEATER]: FIBER_HEATER_POSITIONING_DURATION,
    [ANIMATION_TYPES.CLOSE_HEATER]: FIBER_HEATER_COVER_DURATION,
    [ANIMATION_TYPES.OPEN_HEATER]: FIBER_HEATER_COVER_DURATION,
    [ANIMATION_TYPES.HEAT_SLEEVE]: FIBER_HEATING_DURATION,
    [ANIMATION_TYPES.COOL_SLEEVE]: FIBER_COOLING_DURATION,
    [ANIMATION_TYPES.REMOVE_FROM_HEATER]:
      FIBER_PROTECTED_SPLICE_REMOVAL_DURATION,
  }

  return durations[animationType] ?? 1
}

function getActionConfig(currentStep) {
  const configs = {
    [FIBER_PROCEDURE_STEPS.LOAD_FIBER_A]: {
      id: FIBER_A_ID,
      label: 'Place Fiber A',
      position: [-0.72, 1.02, 0.22],
      size: [1.15, 0.22, 0.34],
    },
    [FIBER_PROCEDURE_STEPS.LOAD_FIBER_B]: {
      id: FIBER_B_ID,
      label: 'Place Fiber B',
      position: [0.72, 1.02, 0.22],
      size: [1.15, 0.22, 0.34],
    },
    [FIBER_PROCEDURE_STEPS.CLOSE_CLAMPS]: {
      id: SPLICER_ACTION_ID,
      label: 'Secure Fibers',
      position: [0, 1.31, FIBER_AXIS_Z],
      size: [1.15, 0.28, 0.38],
    },
    [FIBER_PROCEDURE_STEPS.CLOSE_SPLICER_LID]: {
      id: SPLICER_ACTION_ID,
      label: 'Close Splicer Lid',
      position: [0, 1.42, -0.38],
      size: [1.2, 0.38, 0.64],
    },
    [FIBER_PROCEDURE_STEPS.AUTO_ALIGNMENT]: {
      id: SPLICER_ACTION_ID,
      label: 'Start Alignment',
      position: [0.5, 1.25, -0.04],
      size: [0.25, 0.2, 0.25],
    },
    [FIBER_PROCEDURE_STEPS.READY_TO_FUSE]: {
      id: SPLICER_ACTION_ID,
      label: 'Start Fusion',
      position: [0.5, 1.25, -0.04],
      size: [0.25, 0.2, 0.25],
    },
    [FIBER_PROCEDURE_STEPS.OPEN_SPLICER_LID]: {
      id: SPLICER_ACTION_ID,
      label: 'Open Splicer Lid',
      position: [0, 1.37, -0.38],
      size: [1.2, 0.34, 0.64],
    },
    [FIBER_PROCEDURE_STEPS.RELEASE_CLAMPS]: {
      id: SPLICER_ACTION_ID,
      label: 'Release Clamps',
      position: [0, 1.31, FIBER_AXIS_Z],
      size: [1.15, 0.28, 0.38],
    },
    [FIBER_PROCEDURE_STEPS.REMOVE_FUSED_FIBER]: {
      id: SPLICER_ACTION_ID,
      label: 'Remove Fused Fiber',
      position: [0, 1.3, FIBER_AXIS_Z],
      size: [2.45, 0.24, 0.28],
    },
    [FIBER_PROCEDURE_STEPS.SELECT_PROTECTION_SLEEVE]: {
      id: SLEEVE_ACTION_ID,
      label: 'Splice Protection Sleeve',
      position: [-0.745, 1.458, -0.043],
      size: [0.5, 0.18, 0.18],
      showGuide: false,
    },
    [FIBER_PROCEDURE_STEPS.POSITION_PROTECTION_SLEEVE]: {
      id: SLEEVE_ACTION_ID,
      label: 'Position Protection Sleeve',
      position: [-0.745, 1.458, -0.043],
      size: [0.5, 0.18, 0.18],
      showGuide: false,
    },
    [FIBER_PROCEDURE_STEPS.PLACE_IN_HEATER]: {
      id: PROTECTED_SPLICE_ACTION_ID,
      label: 'Place in Heater',
      position: [0, 1.458, -0.043],
      size: [2.35, 0.22, 0.25],
    },
    [FIBER_PROCEDURE_STEPS.CLOSE_HEATER]: {
      id: HEATER_ACTION_ID,
      label: 'Close Heater Cover',
      position: [0, 1.25, -0.78],
      size: [1.05, 0.34, 0.42],
    },
    [FIBER_PROCEDURE_STEPS.READY_TO_HEAT]: {
      id: HEATER_ACTION_ID,
      label: 'Start Heater',
      position: [0.49, 1.238, -0.775],
      size: [0.22, 0.16, 0.2],
    },
    [FIBER_PROCEDURE_STEPS.OPEN_HEATER]: {
      id: HEATER_ACTION_ID,
      label: 'Open Heater Cover',
      position: [0, 1.25, -0.78],
      size: [1.05, 0.34, 0.42],
    },
    [FIBER_PROCEDURE_STEPS.REMOVE_FROM_HEATER]: {
      id: PROTECTED_SPLICE_ACTION_ID,
      label: 'Remove Protected Splice',
      position: [0, 1.19, -0.778],
      size: [2.35, 0.2, 0.24],
    },
    [FIBER_PROCEDURE_STEPS.FINAL_INSPECTION]: {
      id: PROTECTED_SPLICE_ACTION_ID,
      label: 'Inspect Protected Splice',
      position: [0, 1.458, 0.037],
      size: [2.35, 0.2, 0.24],
    },
  }

  return configs[currentStep] ?? null
}

function SplicerDisplay({
  currentStep,
  fiberALoaded,
  fiberBLoaded,
  alignmentComplete,
  fusionComplete,
  spliceLossDb,
  spliceResult,
  heaterClosed,
  heaterActive,
  heatingComplete,
  coolingComplete,
  finalInspectionPassed,
}) {
  let title = 'READY'
  let status = `${fiberALoaded ? 'A LOADED' : 'A READY'}  →  ←  ${
    fiberBLoaded ? 'B LOADED' : 'B READY'
  }`
  let detail = 'FIBER ALIGNMENT'

  if (currentStep === FIBER_PROCEDURE_STEPS.HEATING_PROTECTION_SLEEVE) {
    title = 'HEATER'
    status = heaterActive ? 'HEATING' : 'READY'
    detail = 'SHRINK CYCLE ACTIVE'
  } else if (
    currentStep === FIBER_PROCEDURE_STEPS.COOLING_PROTECTION_SLEEVE
  ) {
    title = 'HEATER'
    status = 'COOLING'
    detail = 'SETTING PROTECTION SLEEVE'
  } else if (
    isFiberProtectionStep(currentStep) &&
    heatingComplete &&
    coolingComplete
  ) {
    title = finalInspectionPassed ? 'INSPECTION PASS' : 'HEATER COMPLETE'
    status = finalInspectionPassed ? 'PROTECTED SPLICE: PASS' : 'COMPLETE'
    detail = `LOSS: ${(spliceLossDb ?? 0.03).toFixed(2)} dB`
  } else if (
    currentStep === FIBER_PROCEDURE_STEPS.READY_TO_HEAT ||
    (isFiberProtectionStep(currentStep) && heaterClosed)
  ) {
    title = 'HEATER'
    status = 'READY'
    detail = 'PROTECTED SPLICE POSITIONED'
  } else if (isFiberProtectionStep(currentStep)) {
    title = 'SPLICE PROTECTION'
    status = 'SLEEVE INSTALLATION'
    detail = 'FUSION JOINT PASS'
  } else if (currentStep === FIBER_PROCEDURE_STEPS.ALIGNING) {
    title = 'ALIGNING'
    status = 'ANALYZING FIBER CORES...'
    detail = 'A  →     ←  B'
  } else if (
    alignmentComplete &&
    !fusionComplete &&
    currentStep !== FIBER_PROCEDURE_STEPS.FUSING
  ) {
    title = 'ALIGNMENT PASS'
    status = 'READY FOR FUSION'
    detail = 'CORE CENTERLINES ALIGNED'
  } else if (currentStep === FIBER_PROCEDURE_STEPS.FUSING) {
    title = 'FUSING'
    status = 'CONTROLLED ARC ACTIVE'
    detail = 'HOLDING FIBERS STEADY'
  } else if (fusionComplete) {
    title = 'SPLICE COMPLETE'
    status = `LOSS: ${(spliceLossDb ?? 0.03).toFixed(2)} dB`
    detail = spliceResult ?? 'PASS'
  }

  const displayPosition = isFiberProtectionStep(currentStep)
    ? [0.64, 1.52, -0.35]
    : [0, 1.61, -0.44]

  return (
    <Html position={displayPosition} center>
      <div className="fiber-splicer-display" aria-label="Fusion splicer display">
        <span>{title}</span>
        <strong>{status}</strong>
        <small>{detail}</small>
      </div>
    </Html>
  )
}

export default function FiberSplicingStation({
  hoveredObjectId,
  onHoveredObjectChange,
}) {
  const fiberPairRef = useRef(null)
  const fiberARef = useRef(null)
  const fiberBRef = useRef(null)
  const leftClampRef = useRef(null)
  const rightClampRef = useRef(null)
  const lidRef = useRef(null)
  const heaterCoverRef = useRef(null)
  const heaterIndicatorRef = useRef(null)
  const protectionSleeveRef = useRef(null)
  const sleeveOuterTubeRef = useRef(null)
  const sleeveInnerTubeRef = useRef(null)
  const sleeveReinforcementRef = useRef(null)
  const fusedJointRef = useRef(null)
  const arcRef = useRef(null)
  const arcLightRef = useRef(null)
  const activeAnimation = useRef(null)
  const animationProgress = useRef(0)
  const currentStep = useFiberTrainingStore((state) => state.currentStep)
  const isProcedureAnimating = useFiberTrainingStore(
    (state) => state.isProcedureAnimating,
  )
  const fiberALoaded = useFiberTrainingStore((state) => state.fiberALoaded)
  const fiberBLoaded = useFiberTrainingStore((state) => state.fiberBLoaded)
  const fiberClampsClosed = useFiberTrainingStore(
    (state) => state.fiberClampsClosed,
  )
  const splicerLidClosed = useFiberTrainingStore(
    (state) => state.splicerLidClosed,
  )
  const alignmentComplete = useFiberTrainingStore(
    (state) => state.alignmentComplete,
  )
  const fusionComplete = useFiberTrainingStore(
    (state) => state.fusionComplete,
  )
  const spliceLossDb = useFiberTrainingStore((state) => state.spliceLossDb)
  const spliceResult = useFiberTrainingStore((state) => state.spliceResult)
  const fusedFiberRemoved = useFiberTrainingStore(
    (state) => state.fusedFiberRemoved,
  )
  const protectionSleeveSelected = useFiberTrainingStore(
    (state) => state.protectionSleeveSelected,
  )
  const protectionSleevePositioned = useFiberTrainingStore(
    (state) => state.protectionSleevePositioned,
  )
  const spliceInHeater = useFiberTrainingStore(
    (state) => state.spliceInHeater,
  )
  const heaterClosed = useFiberTrainingStore((state) => state.heaterClosed)
  const heaterActive = useFiberTrainingStore((state) => state.heaterActive)
  const heatingComplete = useFiberTrainingStore(
    (state) => state.heatingComplete,
  )
  const coolingComplete = useFiberTrainingStore(
    (state) => state.coolingComplete,
  )
  const protectedSpliceRemoved = useFiberTrainingStore(
    (state) => state.protectedSpliceRemoved,
  )
  const finalInspectionPassed = useFiberTrainingStore(
    (state) => state.finalInspectionPassed,
  )
  const startFiberALoading = useFiberTrainingStore(
    (state) => state.startFiberALoading,
  )
  const completeFiberALoading = useFiberTrainingStore(
    (state) => state.completeFiberALoading,
  )
  const startFiberBLoading = useFiberTrainingStore(
    (state) => state.startFiberBLoading,
  )
  const completeFiberBLoading = useFiberTrainingStore(
    (state) => state.completeFiberBLoading,
  )
  const startSplicerClamping = useFiberTrainingStore(
    (state) => state.startSplicerClamping,
  )
  const completeSplicerClamping = useFiberTrainingStore(
    (state) => state.completeSplicerClamping,
  )
  const startSplicerLidClosing = useFiberTrainingStore(
    (state) => state.startSplicerLidClosing,
  )
  const completeSplicerLidClosing = useFiberTrainingStore(
    (state) => state.completeSplicerLidClosing,
  )
  const startFiberAlignment = useFiberTrainingStore(
    (state) => state.startFiberAlignment,
  )
  const completeFiberAlignment = useFiberTrainingStore(
    (state) => state.completeFiberAlignment,
  )
  const startFiberFusion = useFiberTrainingStore(
    (state) => state.startFiberFusion,
  )
  const completeFiberFusion = useFiberTrainingStore(
    (state) => state.completeFiberFusion,
  )
  const startSplicerLidOpening = useFiberTrainingStore(
    (state) => state.startSplicerLidOpening,
  )
  const completeSplicerLidOpening = useFiberTrainingStore(
    (state) => state.completeSplicerLidOpening,
  )
  const startClampRelease = useFiberTrainingStore(
    (state) => state.startClampRelease,
  )
  const completeClampRelease = useFiberTrainingStore(
    (state) => state.completeClampRelease,
  )
  const startFusedFiberRemoval = useFiberTrainingStore(
    (state) => state.startFusedFiberRemoval,
  )
  const completeFusedFiberRemoval = useFiberTrainingStore(
    (state) => state.completeFusedFiberRemoval,
  )
  const selectProtectionSleeve = useFiberTrainingStore(
    (state) => state.selectProtectionSleeve,
  )
  const startProtectionSleevePositioning = useFiberTrainingStore(
    (state) => state.startProtectionSleevePositioning,
  )
  const completeProtectionSleevePositioning = useFiberTrainingStore(
    (state) => state.completeProtectionSleevePositioning,
  )
  const startHeaterPositioning = useFiberTrainingStore(
    (state) => state.startHeaterPositioning,
  )
  const completeHeaterPositioning = useFiberTrainingStore(
    (state) => state.completeHeaterPositioning,
  )
  const startHeaterClosing = useFiberTrainingStore(
    (state) => state.startHeaterClosing,
  )
  const completeHeaterClosing = useFiberTrainingStore(
    (state) => state.completeHeaterClosing,
  )
  const startProtectionSleeveHeating = useFiberTrainingStore(
    (state) => state.startProtectionSleeveHeating,
  )
  const completeProtectionSleeveHeating = useFiberTrainingStore(
    (state) => state.completeProtectionSleeveHeating,
  )
  const completeProtectionSleeveCooling = useFiberTrainingStore(
    (state) => state.completeProtectionSleeveCooling,
  )
  const startHeaterOpening = useFiberTrainingStore(
    (state) => state.startHeaterOpening,
  )
  const completeHeaterOpening = useFiberTrainingStore(
    (state) => state.completeHeaterOpening,
  )
  const startProtectedSpliceRemoval = useFiberTrainingStore(
    (state) => state.startProtectedSpliceRemoval,
  )
  const completeProtectedSpliceRemoval = useFiberTrainingStore(
    (state) => state.completeProtectedSpliceRemoval,
  )
  const inspectProtectedSplice = useFiberTrainingStore(
    (state) => state.inspectProtectedSplice,
  )
  const toolViewState = useToolStore((state) => state.toolViewState)
  const actionConfig = getActionConfig(currentStep)
  const canInteract =
    Boolean(actionConfig) &&
    !isProcedureAnimating &&
    toolViewState === TOOL_VIEW_STATES.IDLE
  const isHovered =
    canInteract && hoveredObjectId === actionConfig?.id
  const isProtectionWorkflow = isFiberProtectionStep(currentStep)
  const isSleeveHighlighted =
    actionConfig?.id === SLEEVE_ACTION_ID &&
    (isHovered ||
      currentStep === FIBER_PROCEDURE_STEPS.SELECT_PROTECTION_SLEEVE ||
      (protectionSleeveSelected && !protectionSleevePositioned))
  const isFiberAssemblyAction =
    actionConfig?.id === SLEEVE_ACTION_ID ||
    actionConfig?.id === PROTECTED_SPLICE_ACTION_ID

  useEffect(() => {
    const nextAnimation = getAnimationType(
      currentStep,
      isProcedureAnimating,
    )

    if (nextAnimation && nextAnimation !== activeAnimation.current) {
      animationProgress.current = 0
    }

    activeAnimation.current = nextAnimation

    interpolatePosition(
      fiberARef.current,
      A_REST_POSITION,
      fusionComplete
        ? A_FUSED_POSITION
        : alignmentComplete
          ? A_ALIGNED_POSITION
          : A_LOADED_POSITION,
      fiberALoaded ? 1 : 0,
    )
    interpolatePosition(
      fiberBRef.current,
      B_REST_POSITION,
      fusionComplete
        ? B_FUSED_POSITION
        : alignmentComplete
          ? B_ALIGNED_POSITION
          : B_LOADED_POSITION,
      fiberBLoaded ? 1 : 0,
    )

    if (fiberPairRef.current) {
      const pairPosition = protectedSpliceRemoved
        ? INSPECTION_PAIR_POSITION
        : spliceInHeater
          ? HEATER_PAIR_POSITION
          : fusedFiberRemoved
            ? REMOVED_PAIR_POSITION
            : [0, 0, 0]

      fiberPairRef.current.position.set(
        ...pairPosition,
      )
    }
    if (protectionSleeveRef.current) {
      protectionSleeveRef.current.position.set(
        ...(protectionSleevePositioned
          ? SLEEVE_CENTERED_POSITION
          : SLEEVE_PARKED_POSITION),
      )
    }
    if (leftClampRef.current) {
      leftClampRef.current.position.y = fiberClampsClosed
        ? CLAMP_CLOSED_Y
        : CLAMP_OPEN_Y
    }
    if (rightClampRef.current) {
      rightClampRef.current.position.y = fiberClampsClosed
        ? CLAMP_CLOSED_Y
        : CLAMP_OPEN_Y
    }
    if (lidRef.current) {
      lidRef.current.visible = !isProtectionWorkflow
      lidRef.current.rotation.x = splicerLidClosed
        ? LID_CLOSED_ROTATION
        : LID_OPEN_ROTATION
    }
    if (heaterCoverRef.current) {
      heaterCoverRef.current.rotation.x = heaterClosed
        ? HEATER_COVER_CLOSED_ROTATION
        : HEATER_COVER_OPEN_ROTATION
    }
    if (sleeveOuterTubeRef.current) {
      const outerRadius = heatingComplete
        ? SHRUNK_SLEEVE_OUTER_RADIUS
        : SLEEVE_OUTER_RADIUS
      sleeveOuterTubeRef.current.scale.set(outerRadius, 0.38, outerRadius)
    }
    if (sleeveInnerTubeRef.current) {
      const innerRadius = heatingComplete
        ? SHRUNK_SLEEVE_INNER_RADIUS
        : SLEEVE_INNER_RADIUS
      sleeveInnerTubeRef.current.scale.set(innerRadius, 0.34, innerRadius)
    }
    if (heaterIndicatorRef.current) {
      const indicatorMaterial = heaterIndicatorRef.current.material

      if (heaterActive) {
        indicatorMaterial.color.set('#f0a34a')
        indicatorMaterial.emissive.set('#d97924')
        indicatorMaterial.emissiveIntensity = 1
      } else if (heatingComplete && !coolingComplete) {
        indicatorMaterial.color.set('#78b9d2')
        indicatorMaterial.emissive.set('#347f9e')
        indicatorMaterial.emissiveIntensity = 0.72
      } else if (heatingComplete && coolingComplete) {
        indicatorMaterial.color.set('#63c98d')
        indicatorMaterial.emissive.set('#2f9b60')
        indicatorMaterial.emissiveIntensity = 0.78
      } else {
        indicatorMaterial.color.set('#68806f')
        indicatorMaterial.emissive.set('#2b563d')
        indicatorMaterial.emissiveIntensity = 0.24
      }
    }
    if (fusedJointRef.current) {
      fusedJointRef.current.visible = fusionComplete
      fusedJointRef.current.scale.y = 0.04
    }
    if (arcRef.current) {
      arcRef.current.visible = false
      arcMaterial.opacity = 0
    }
    if (arcLightRef.current) {
      arcLightRef.current.intensity = 0
    }
  }, [
    alignmentComplete,
    currentStep,
    fiberALoaded,
    fiberBLoaded,
    fiberClampsClosed,
    fusedFiberRemoved,
    fusionComplete,
    heaterActive,
    heaterClosed,
    heatingComplete,
    isProtectionWorkflow,
    isProcedureAnimating,
    coolingComplete,
    protectedSpliceRemoved,
    protectionSleevePositioned,
    spliceInHeater,
    splicerLidClosed,
  ])

  useEffect(() => {
    if (!canInteract) {
      onHoveredObjectChange?.(null)
    }
  }, [canInteract, onHoveredObjectChange])

  useEffect(
    () => () => {
      onHoveredObjectChange?.(null)
      arcMaterial.opacity = 0
    },
    [onHoveredObjectChange],
  )

  useFrame((_, delta) => {
    const animationType = activeAnimation.current

    if (!animationType) {
      return
    }

    const duration = getAnimationDuration(animationType)

    animationProgress.current = Math.min(
      animationProgress.current + delta / duration,
      1,
    )
    const progress = animationProgress.current
    const easedProgress = smoothStep(progress)

    if (animationType === ANIMATION_TYPES.LOAD_A) {
      interpolatePosition(
        fiberARef.current,
        A_REST_POSITION,
        A_LOADED_POSITION,
        easedProgress,
      )

      if (progress >= 1) {
        activeAnimation.current = null
        completeFiberALoading()
      }
      return
    }

    if (animationType === ANIMATION_TYPES.LOAD_B) {
      interpolatePosition(
        fiberBRef.current,
        B_REST_POSITION,
        B_LOADED_POSITION,
        easedProgress,
      )

      if (progress >= 1) {
        activeAnimation.current = null
        completeFiberBLoading()
      }
      return
    }

    if (
      animationType === ANIMATION_TYPES.CLAMP ||
      animationType === ANIMATION_TYPES.RELEASE
    ) {
      const startY =
        animationType === ANIMATION_TYPES.CLAMP
          ? CLAMP_OPEN_Y
          : CLAMP_CLOSED_Y
      const endY =
        animationType === ANIMATION_TYPES.CLAMP
          ? CLAMP_CLOSED_Y
          : CLAMP_OPEN_Y
      const clampY = startY + (endY - startY) * easedProgress

      if (leftClampRef.current) {
        leftClampRef.current.position.y = clampY
      }
      if (rightClampRef.current) {
        rightClampRef.current.position.y = clampY
      }

      if (progress >= 1) {
        activeAnimation.current = null
        if (animationType === ANIMATION_TYPES.CLAMP) {
          completeSplicerClamping()
        } else {
          completeClampRelease()
        }
      }
      return
    }

    if (
      animationType === ANIMATION_TYPES.CLOSE_LID ||
      animationType === ANIMATION_TYPES.OPEN_LID
    ) {
      const startRotation =
        animationType === ANIMATION_TYPES.CLOSE_LID
          ? LID_OPEN_ROTATION
          : LID_CLOSED_ROTATION
      const endRotation =
        animationType === ANIMATION_TYPES.CLOSE_LID
          ? LID_CLOSED_ROTATION
          : LID_OPEN_ROTATION

      if (lidRef.current) {
        lidRef.current.rotation.x =
          startRotation + (endRotation - startRotation) * easedProgress
      }

      if (progress >= 1) {
        activeAnimation.current = null
        if (animationType === ANIMATION_TYPES.CLOSE_LID) {
          completeSplicerLidClosing()
        } else {
          completeSplicerLidOpening()
        }
      }
      return
    }

    if (animationType === ANIMATION_TYPES.ALIGN) {
      const movementProgress = smoothStep((progress - 0.18) / 0.72)
      interpolatePosition(
        fiberARef.current,
        A_LOADED_POSITION,
        A_ALIGNED_POSITION,
        movementProgress,
      )
      interpolatePosition(
        fiberBRef.current,
        B_LOADED_POSITION,
        B_ALIGNED_POSITION,
        movementProgress,
      )

      if (progress >= 1) {
        activeAnimation.current = null
        completeFiberAlignment()
      }
      return
    }

    if (animationType === ANIMATION_TYPES.FUSE) {
      const joinProgress = smoothStep((progress - 0.3) / 0.42)
      const arcIn = smoothStep((progress - 0.12) / 0.16)
      const arcOut = smoothStep((progress - 0.74) / 0.18)
      const arcStrength = arcIn * (1 - arcOut)

      interpolatePosition(
        fiberARef.current,
        A_ALIGNED_POSITION,
        A_FUSED_POSITION,
        joinProgress,
      )
      interpolatePosition(
        fiberBRef.current,
        B_ALIGNED_POSITION,
        B_FUSED_POSITION,
        joinProgress,
      )

      if (arcRef.current) {
        arcRef.current.visible = arcStrength > 0.01
        arcMaterial.opacity = arcStrength * 0.9
      }
      if (arcLightRef.current) {
        arcLightRef.current.intensity = arcStrength * 1.8
      }
      if (fusedJointRef.current) {
        fusedJointRef.current.visible = progress > 0.58
        fusedJointRef.current.scale.y = 0.04 * smoothStep((progress - 0.58) / 0.2)
      }

      if (progress >= 1) {
        activeAnimation.current = null
        arcMaterial.opacity = 0
        if (arcRef.current) {
          arcRef.current.visible = false
        }
        if (arcLightRef.current) {
          arcLightRef.current.intensity = 0
        }
        completeFiberFusion()
      }
      return
    }

    if (animationType === ANIMATION_TYPES.POSITION_SLEEVE) {
      interpolatePosition(
        protectionSleeveRef.current,
        SLEEVE_PARKED_POSITION,
        SLEEVE_CENTERED_POSITION,
        easedProgress,
      )

      if (progress >= 1) {
        activeAnimation.current = null
        completeProtectionSleevePositioning()
      }
      return
    }

    if (animationType === ANIMATION_TYPES.PLACE_IN_HEATER) {
      interpolatePosition(
        fiberPairRef.current,
        REMOVED_PAIR_POSITION,
        HEATER_PAIR_POSITION,
        easedProgress,
      )
      if (fiberPairRef.current) {
        fiberPairRef.current.position.y += Math.sin(Math.PI * progress) * 0.055
      }

      if (progress >= 1) {
        activeAnimation.current = null
        completeHeaterPositioning()
      }
      return
    }

    if (
      animationType === ANIMATION_TYPES.CLOSE_HEATER ||
      animationType === ANIMATION_TYPES.OPEN_HEATER
    ) {
      const startRotation =
        animationType === ANIMATION_TYPES.CLOSE_HEATER
          ? HEATER_COVER_OPEN_ROTATION
          : HEATER_COVER_CLOSED_ROTATION
      const endRotation =
        animationType === ANIMATION_TYPES.CLOSE_HEATER
          ? HEATER_COVER_CLOSED_ROTATION
          : HEATER_COVER_OPEN_ROTATION

      if (heaterCoverRef.current) {
        heaterCoverRef.current.rotation.x =
          startRotation + (endRotation - startRotation) * easedProgress
      }

      if (progress >= 1) {
        activeAnimation.current = null
        if (animationType === ANIMATION_TYPES.CLOSE_HEATER) {
          completeHeaterClosing()
        } else {
          completeHeaterOpening()
        }
      }
      return
    }

    if (animationType === ANIMATION_TYPES.HEAT_SLEEVE) {
      const outerRadius =
        SLEEVE_OUTER_RADIUS +
        (SHRUNK_SLEEVE_OUTER_RADIUS - SLEEVE_OUTER_RADIUS) * easedProgress
      const innerRadius =
        SLEEVE_INNER_RADIUS +
        (SHRUNK_SLEEVE_INNER_RADIUS - SLEEVE_INNER_RADIUS) * easedProgress

      if (sleeveOuterTubeRef.current) {
        sleeveOuterTubeRef.current.scale.set(outerRadius, 0.38, outerRadius)
      }
      if (sleeveInnerTubeRef.current) {
        sleeveInnerTubeRef.current.scale.set(innerRadius, 0.34, innerRadius)
      }
      if (heaterIndicatorRef.current) {
        heaterIndicatorRef.current.material.emissiveIntensity =
          0.82 + Math.sin(progress * Math.PI * 8) * 0.16
      }

      if (progress >= 1) {
        activeAnimation.current = null
        completeProtectionSleeveHeating()
      }
      return
    }

    if (animationType === ANIMATION_TYPES.COOL_SLEEVE) {
      if (heaterIndicatorRef.current) {
        heaterIndicatorRef.current.material.emissiveIntensity =
          0.56 + (1 - easedProgress) * 0.18
      }

      if (progress >= 1) {
        activeAnimation.current = null
        completeProtectionSleeveCooling()
      }
      return
    }

    if (animationType === ANIMATION_TYPES.REMOVE) {
      interpolatePosition(
        fiberPairRef.current,
        [0, 0, 0],
        REMOVED_PAIR_POSITION,
        easedProgress,
      )

      if (progress >= 1) {
        activeAnimation.current = null
        completeFusedFiberRemoval()
      }
      return
    }

    if (animationType === ANIMATION_TYPES.REMOVE_FROM_HEATER) {
      interpolatePosition(
        fiberPairRef.current,
        HEATER_PAIR_POSITION,
        INSPECTION_PAIR_POSITION,
        easedProgress,
      )
      if (fiberPairRef.current) {
        fiberPairRef.current.position.y += Math.sin(Math.PI * progress) * 0.07
      }

      if (progress >= 1) {
        activeAnimation.current = null
        completeProtectedSpliceRemoval()
      }
    }
  })

  const handlePointerEnter = (event) => {
    if (!canInteract) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(actionConfig.id)
  }

  const handlePointerLeave = (event) => {
    event.stopPropagation()
    onHoveredObjectChange?.(null)
  }

  const handleAction = (event) => {
    if (!canInteract) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(null)

    const actions = {
      [FIBER_PROCEDURE_STEPS.LOAD_FIBER_A]: startFiberALoading,
      [FIBER_PROCEDURE_STEPS.LOAD_FIBER_B]: startFiberBLoading,
      [FIBER_PROCEDURE_STEPS.CLOSE_CLAMPS]: startSplicerClamping,
      [FIBER_PROCEDURE_STEPS.CLOSE_SPLICER_LID]: startSplicerLidClosing,
      [FIBER_PROCEDURE_STEPS.AUTO_ALIGNMENT]: startFiberAlignment,
      [FIBER_PROCEDURE_STEPS.READY_TO_FUSE]: startFiberFusion,
      [FIBER_PROCEDURE_STEPS.OPEN_SPLICER_LID]: startSplicerLidOpening,
      [FIBER_PROCEDURE_STEPS.RELEASE_CLAMPS]: startClampRelease,
      [FIBER_PROCEDURE_STEPS.REMOVE_FUSED_FIBER]: startFusedFiberRemoval,
      [FIBER_PROCEDURE_STEPS.SELECT_PROTECTION_SLEEVE]: () =>
        selectProtectionSleeve(FIBER_TOOL_IDS.PROTECTION_SLEEVE),
      [FIBER_PROCEDURE_STEPS.POSITION_PROTECTION_SLEEVE]:
        startProtectionSleevePositioning,
      [FIBER_PROCEDURE_STEPS.PLACE_IN_HEATER]: startHeaterPositioning,
      [FIBER_PROCEDURE_STEPS.CLOSE_HEATER]: startHeaterClosing,
      [FIBER_PROCEDURE_STEPS.READY_TO_HEAT]:
        startProtectionSleeveHeating,
      [FIBER_PROCEDURE_STEPS.OPEN_HEATER]: startHeaterOpening,
      [FIBER_PROCEDURE_STEPS.REMOVE_FROM_HEATER]:
        startProtectedSpliceRemoval,
      [FIBER_PROCEDURE_STEPS.FINAL_INSPECTION]: inspectProtectedSplice,
    }

    actions[currentStep]?.()
  }

  const handleWrongObjectClick = (event) => {
    if (
      currentStep !== FIBER_PROCEDURE_STEPS.SELECT_PROTECTION_SLEEVE ||
      !canInteract
    ) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(null)
    selectProtectionSleeve('incorrect-fiber-object')
  }

  return (
    <group>
      <group onClick={handleWrongObjectClick}>
        <FusionSplicer
          position={fusionSplicer.restPosition}
          rotation={fusionSplicer.restRotation}
          scale={fusionSplicer.scale}
          lidRef={lidRef}
          leftClampRef={leftClampRef}
          rightClampRef={rightClampRef}
          heaterCoverRef={heaterCoverRef}
          heaterIndicatorRef={heaterIndicatorRef}
        />
      </group>

      <group
        ref={fiberPairRef}
        onPointerEnter={isFiberAssemblyAction ? handlePointerEnter : undefined}
        onPointerLeave={isFiberAssemblyAction ? handlePointerLeave : undefined}
        onClick={isFiberAssemblyAction ? handleAction : undefined}
      >
        <PreparedFiberEnd
          fiberRef={fiberARef}
          side={-1}
          label="Fiber A"
          loaded={fiberALoaded}
          fused={fusionComplete}
          showLabel={!isProtectionWorkflow}
        >
          <group
            ref={protectionSleeveRef}
            position={SLEEVE_PARKED_POSITION}
          >
            <FiberProtectionSleeve
              outerTubeRef={sleeveOuterTubeRef}
              innerTubeRef={sleeveInnerTubeRef}
              reinforcementRodRef={sleeveReinforcementRef}
              highlighted={isSleeveHighlighted}
              onPointerEnter={
                isFiberAssemblyAction ? handlePointerEnter : undefined
              }
              onPointerLeave={
                isFiberAssemblyAction ? handlePointerLeave : undefined
              }
              onClick={isFiberAssemblyAction ? handleAction : undefined}
            />
          </group>
        </PreparedFiberEnd>
        <PreparedFiberEnd
          fiberRef={fiberBRef}
          side={1}
          label="Fiber B"
          loaded={fiberBLoaded}
          fused={fusionComplete}
          showLabel={!isProtectionWorkflow}
        />
        <mesh
          ref={fusedJointRef}
          geometry={fiberGeometry}
          material={glassMaterial}
          position={[0, FIBER_AXIS_Y, FIBER_AXIS_Z]}
          rotation={[0, 0, Math.PI / 2]}
          scale={[0.0075, 0.04, 0.0075]}
          visible={fusionComplete}
        />
      </group>

      <mesh
        ref={arcRef}
        geometry={arcGeometry}
        material={arcMaterial}
        position={[0, FIBER_AXIS_Y + 0.025, FIBER_AXIS_Z]}
        visible={false}
        renderOrder={4}
      />
      <pointLight
        ref={arcLightRef}
        position={[0, FIBER_AXIS_Y + 0.08, FIBER_AXIS_Z]}
        color="#9eeeff"
        intensity={0}
        distance={0.9}
        decay={2}
      />

      <SplicerDisplay
        currentStep={currentStep}
        fiberALoaded={fiberALoaded}
        fiberBLoaded={fiberBLoaded}
        alignmentComplete={alignmentComplete}
        fusionComplete={fusionComplete}
        spliceLossDb={spliceLossDb}
        spliceResult={spliceResult}
        heaterClosed={heaterClosed}
        heaterActive={heaterActive}
        heatingComplete={heatingComplete}
        coolingComplete={coolingComplete}
        finalInspectionPassed={finalInspectionPassed}
      />

      {actionConfig && (
        <group>
          <mesh
            position={actionConfig.position}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onClick={handleAction}
          >
            <boxGeometry args={actionConfig.size} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          {actionConfig.showGuide !== false && (
            <mesh position={actionConfig.position}>
              <boxGeometry args={actionConfig.size} />
              <meshBasicMaterial
                color="#6ed7e8"
                transparent
                opacity={isHovered ? 0.18 : 0.08}
                wireframe
                toneMapped={false}
              />
            </mesh>
          )}
        </group>
      )}

      {isHovered && actionConfig && (
        <Html
          position={[
            actionConfig.position[0],
            actionConfig.position[1] + 0.28,
            actionConfig.position[2],
          ]}
          center
        >
          <div className="tool-tooltip" role="tooltip">
            {actionConfig.label}
          </div>
        </Html>
      )}
    </group>
  )
}
