import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import {
  CylinderGeometry,
  Euler,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from 'three'
import CableTester, {
  CABLE_TESTER_BUTTON_POSITION,
} from '../../objects/telecom/CableTester.jsx'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import useToolStore, { TOOL_VIEW_STATES } from '../../store/useToolStore.js'
import useTrainingStore from '../../store/useTrainingStore.js'
import { TOOL_IDS } from '../../tools/toolConfigs.js'
import {
  CABLE_TEST_DURATION,
  RJ45_PROCEDURE_STEPS,
  TESTER_CONNECTION_DURATION,
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
import { TEST_PIN_COUNT } from './testSequenceConfig.js'

const TESTER_PORT_HOVER_ID = 'rj45-tester-port'
const TESTER_BUTTON_HOVER_ID = 'rj45-tester-button'
const TESTER_POSITION = Object.freeze([0.72, -0.055, -0.04])
const TESTER_ROTATION = Object.freeze([0, Math.PI, 0])
const CABLE_DISCONNECTED_POSITION = Object.freeze([0.08, 0.13, 0.08])
const CABLE_CONNECTED_POSITION = Object.freeze([0.72, 0.055, 0.57])
const CABLE_DISCONNECTED_ROTATION = Object.freeze([0.04, -0.13, 0.04])
const CABLE_CONNECTED_ROTATION = Object.freeze([0, 0, 0])
const CABLE_PATH_POINTS = Object.freeze([
  Object.freeze([0, -0.02, 0.17]),
  Object.freeze([0, -0.02, 0.48]),
  Object.freeze([-0.28, -0.03, 0.7]),
  Object.freeze([-0.72, -0.045, 0.82]),
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
const disconnectedPosition = new Vector3().fromArray(
  CABLE_DISCONNECTED_POSITION,
)
const connectedPosition = new Vector3().fromArray(CABLE_CONNECTED_POSITION)
const disconnectedQuaternion = new Quaternion().setFromEuler(
  new Euler(...CABLE_DISCONNECTED_ROTATION),
)
const connectedQuaternion = new Quaternion().setFromEuler(
  new Euler(...CABLE_CONNECTED_ROTATION),
)

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress)
}

function getButtonPress(progress) {
  if (progress <= 0.07) {
    return smoothStep(progress / 0.07)
  }

  if (progress <= 0.16) {
    return 1 - smoothStep((progress - 0.07) / 0.09)
  }

  return 0
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

export default function RJ45CableTesting({
  hoveredObjectId,
  onHoveredObjectChange,
}) {
  const cableAssembly = useRef(null)
  const testerButton = useRef(null)
  const contactBladeRefs = useRef([])
  const strainRelief = useRef(null)
  const connectionProgress = useRef(0)
  const testingProgress = useRef(0)
  const lastReportedPinCount = useRef(-1)
  const connectionCompletionRequested = useRef(false)
  const testCompletionRequested = useRef(false)
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
  const cableConnectedToTester = useTrainingStore(
    (state) => state.cableConnectedToTester,
  )
  const isCableConnecting = useTrainingStore(
    (state) => state.isCableConnecting,
  )
  const isCableTesting = useTrainingStore((state) => state.isCableTesting)
  const cableTestResults = useTrainingStore(
    (state) => state.cableTestResults,
  )
  const finalTestResult = useTrainingStore(
    (state) => state.finalTestResult,
  )
  const startCableTesterConnection = useTrainingStore(
    (state) => state.startCableTesterConnection,
  )
  const completeCableTesterConnection = useTrainingStore(
    (state) => state.completeCableTesterConnection,
  )
  const startCableTest = useTrainingStore((state) => state.startCableTest)
  const updateCableTestProgress = useTrainingStore(
    (state) => state.updateCableTestProgress,
  )
  const completeCableTest = useTrainingStore(
    (state) => state.completeCableTest,
  )
  const completeRJ45Module = useTrainingStore(
    (state) => state.completeRJ45Module,
  )
  const isPortHovered = hoveredObjectId === TESTER_PORT_HOVER_ID
  const isButtonHovered = hoveredObjectId === TESTER_BUTTON_HOVER_ID
  const showTestingWorkspace = isCableTestingWorkspaceStep(currentStep)
  const showDedicatedTester =
    showTestingWorkspace &&
    currentStep !== RJ45_PROCEDURE_STEPS.SELECT_CABLE_TESTER
  const workstationReady =
    workstationPhase === WORKSTATION_PHASES.FOCUSED &&
    isTrainingMode &&
    toolViewState === TOOL_VIEW_STATES.IDLE &&
    activeToolId === TOOL_IDS.CABLE_TESTER
  const canConnect =
    workstationReady &&
    currentStep === RJ45_PROCEDURE_STEPS.CONNECT_CABLE_TO_TESTER &&
    !cableConnectedToTester &&
    !isProcedureAnimating
  const canTest =
    workstationReady &&
    currentStep === RJ45_PROCEDURE_STEPS.READY_TO_TEST &&
    cableConnectedToTester &&
    !isProcedureAnimating

  useEffect(() => {
    contactBladeRefs.current.forEach((contactBlade) => {
      if (contactBlade) {
        contactBlade.position.y = -CONTACT_PRESS_DISTANCE
      }
    })

    if (strainRelief.current) {
      strainRelief.current.position.y = -STRAIN_RELIEF_PRESS_DISTANCE
    }
  }, [showTestingWorkspace])

  useEffect(() => {
    if (isCableConnecting) {
      connectionProgress.current = 0
      connectionCompletionRequested.current = false
    }
  }, [isCableConnecting])

  useEffect(() => {
    if (isCableTesting) {
      testingProgress.current = 0
      lastReportedPinCount.current = -1
      testCompletionRequested.current = false
    }
  }, [isCableTesting])

  useEffect(() => {
    if (currentStep !== RJ45_PROCEDURE_STEPS.TEST_RESULT) {
      return undefined
    }

    const completionTimer = window.setTimeout(completeRJ45Module, 650)

    return () => window.clearTimeout(completionTimer)
  }, [completeRJ45Module, currentStep])

  useEffect(() => {
    if (
      ((!canConnect || !showDedicatedTester) && isPortHovered) ||
      ((!canTest || !showDedicatedTester) && isButtonHovered)
    ) {
      onHoveredObjectChange?.(null)
    }
  }, [
    canConnect,
    canTest,
    isButtonHovered,
    isPortHovered,
    onHoveredObjectChange,
    showDedicatedTester,
  ])

  useFrame((_, delta) => {
    if (cableAssembly.current) {
      if (isCableConnecting) {
        connectionProgress.current = Math.min(
          connectionProgress.current + delta / TESTER_CONNECTION_DURATION,
          1,
        )
        const progress = smoothStep(connectionProgress.current)

        cableAssembly.current.position.lerpVectors(
          disconnectedPosition,
          connectedPosition,
          progress,
        )
        cableAssembly.current.quaternion.slerpQuaternions(
          disconnectedQuaternion,
          connectedQuaternion,
          progress,
        )

        if (
          connectionProgress.current >= 1 &&
          !connectionCompletionRequested.current
        ) {
          connectionCompletionRequested.current = true
          completeCableTesterConnection()
        }
      } else if (cableConnectedToTester) {
        cableAssembly.current.position.copy(connectedPosition)
        cableAssembly.current.quaternion.copy(connectedQuaternion)
      } else {
        cableAssembly.current.position.copy(disconnectedPosition)
        cableAssembly.current.quaternion.copy(disconnectedQuaternion)
      }
    }

    if (!isCableTesting || testCompletionRequested.current) {
      if (testerButton.current) {
        testerButton.current.position.y = CABLE_TESTER_BUTTON_POSITION[1]
      }

      return
    }

    testingProgress.current = Math.min(
      testingProgress.current + delta / CABLE_TEST_DURATION,
      1,
    )
    const buttonPress = getButtonPress(testingProgress.current)
    const completedPinCount = Math.min(
      Math.floor(testingProgress.current * TEST_PIN_COUNT),
      TEST_PIN_COUNT,
    )

    if (testerButton.current) {
      testerButton.current.position.y =
        CABLE_TESTER_BUTTON_POSITION[1] - buttonPress * 0.018
    }

    if (completedPinCount !== lastReportedPinCount.current) {
      lastReportedPinCount.current = completedPinCount
      updateCableTestProgress(testingProgress.current)
    }

    if (testingProgress.current >= 1) {
      testCompletionRequested.current = true
      completeCableTest()
    }
  })

  if (!showTestingWorkspace) {
    return null
  }

  const handlePortPointerEnter = (event) => {
    if (!canConnect) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(TESTER_PORT_HOVER_ID)
  }

  const handlePortPointerLeave = (event) => {
    event.stopPropagation()
    onHoveredObjectChange?.(null)
  }

  const handlePortClick = (event) => {
    if (!canConnect) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(null)
    startCableTesterConnection(activeToolId)
  }

  const handleButtonPointerEnter = (event) => {
    if (!canTest) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(TESTER_BUTTON_HOVER_ID)
  }

  const handleButtonPointerLeave = (event) => {
    event.stopPropagation()
    onHoveredObjectChange?.(null)
  }

  const handleButtonClick = (event) => {
    if (!canTest) {
      return
    }

    event.stopPropagation()
    onHoveredObjectChange?.(null)
    startCableTest(activeToolId)
  }

  return (
    <group>
      {showDedicatedTester && (
        <CableTester
          position={TESTER_POSITION}
          rotation={TESTER_ROTATION}
          pinResults={cableTestResults}
          finalTestResult={finalTestResult}
          buttonRef={testerButton}
          isPortHighlighted={isPortHovered}
          isButtonHighlighted={isButtonHovered}
          onPortPointerEnter={handlePortPointerEnter}
          onPortPointerLeave={handlePortPointerLeave}
          onPortClick={handlePortClick}
          onButtonPointerEnter={handleButtonPointerEnter}
          onButtonPointerLeave={handleButtonPointerLeave}
          onButtonClick={handleButtonClick}
        />
      )}

      <group
        ref={cableAssembly}
        position={CABLE_DISCONNECTED_POSITION}
        rotation={CABLE_DISCONNECTED_ROTATION}
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

      {isPortHovered && canConnect && (
        <Html position={[0.72, 0.34, 0.34]} center>
          <div className="tool-tooltip" role="tooltip">
            Connect Cable
          </div>
        </Html>
      )}
      {isButtonHovered && canTest && (
        <Html position={[0.58, 0.38, -0.27]} center>
          <div className="tool-tooltip" role="tooltip">
            Test Cable
          </div>
        </Html>
      )}
    </group>
  )
}

export {
  CABLE_CONNECTED_POSITION,
  CABLE_DISCONNECTED_POSITION,
  TESTER_POSITION,
  TESTER_ROTATION,
}
