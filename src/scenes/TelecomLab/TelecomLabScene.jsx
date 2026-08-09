import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import InteractionSystem from '../../interaction/InteractionSystem.jsx'
import FiberTrainingModule from '../../modules/fiber/FiberTrainingModule.jsx'
import NetworkTrainingModule from '../../modules/network/NetworkTrainingModule.jsx'
import RJ45ArrangementFocusController from '../../modules/rj45/RJ45ArrangementFocusController.jsx'
import RJ45TrainingModule from '../../modules/rj45/RJ45TrainingModule.jsx'
import FirstPersonPlayer from '../../player/FirstPersonPlayer.jsx'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import useToolStore from '../../store/useToolStore.js'
import useNetworkTrainingStore from '../../store/useNetworkTrainingStore.js'
import { NETWORK_TROUBLESHOOTING_MODES } from '../../modules/network/troubleshooting/troubleshootingScenarios.js'
import ToolFocusController from '../../tools/ToolFocusController.jsx'
import WorkstationFocusController from '../../workstations/WorkstationFocusController.jsx'
import Environment from './Environment.jsx'
import LabRoom from './LabRoom.jsx'
import Lighting from './Lighting.jsx'

const playerSpawnPosition = [0, 0.85, 4]

const cameraSettings = {
  position: [0, 1.65, 4],
  fov: 60,
}

const canvasStyle = {
  width: '100vw',
  height: '100vh',
}

export default function TelecomLabScene() {
  const playerBodyRef = useRef(null)
  const [hoveredTrainingObjectId, setHoveredTrainingObjectId] = useState(null)
  const isPointerLocked = useInteractionStore(
    (state) => state.isPointerLocked,
  )
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const hoveredToolId = useToolStore((state) => state.hoveredToolId)
  const networkTroubleshootingMode = useNetworkTrainingStore(
    (state) => state.troubleshootingMode,
  )
  const setPointerLocked = useInteractionStore(
    (state) => state.setPointerLocked,
  )
  const handleLockChange = useCallback((isLocked) => {
    setPointerLocked(isLocked)
  }, [setPointerLocked])
  const isExploring = workstationPhase === WORKSTATION_PHASES.EXPLORATION
  const isNetworkTroubleshooting =
    networkTroubleshootingMode !== NETWORK_TROUBLESHOOTING_MODES.INACTIVE
  const playerControlsEnabled = isExploring && !isNetworkTroubleshooting

  useEffect(() => {
    if (isNetworkTroubleshooting && document.pointerLockElement) {
      document.exitPointerLock()
    }
  }, [isNetworkTroubleshooting])

  return (
    <div
      className={`telecom-lab${
        isExploring ? '' : ' is-workstation-active'
      }${hoveredToolId || hoveredTrainingObjectId ? ' is-tool-hovered' : ''}`}
    >
      <Canvas camera={cameraSettings} shadows style={canvasStyle}>
        <Environment />
        <Lighting />
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]} colliders={false}>
            <LabRoom />
            <FirstPersonPlayer
              spawnPosition={playerSpawnPosition}
              onLockChange={handleLockChange}
              enabled={playerControlsEnabled}
              playerBodyRef={playerBodyRef}
            />
            <WorkstationFocusController playerBodyRef={playerBodyRef} />
          </Physics>
        </Suspense>
        <ToolFocusController />
        <RJ45ArrangementFocusController />
        <RJ45TrainingModule
          hoveredObjectId={hoveredTrainingObjectId}
          onHoveredObjectChange={setHoveredTrainingObjectId}
        />
        <FiberTrainingModule
          hoveredObjectId={hoveredTrainingObjectId}
          onHoveredObjectChange={setHoveredTrainingObjectId}
        />
        <NetworkTrainingModule
          hoveredObjectId={hoveredTrainingObjectId}
          onHoveredObjectChange={setHoveredTrainingObjectId}
        />
      </Canvas>

      <div
        className={`player-crosshair${playerControlsEnabled ? '' : ' is-hidden'}`}
        aria-hidden="true"
      />
      <div
        className={`player-instructions${
          isPointerLocked || !playerControlsEnabled ? ' is-hidden' : ''
        }`}
        aria-hidden={isPointerLocked || !playerControlsEnabled}
      >
        <strong>Click to start</strong>
        <span>WASD to move</span>
        <span>Mouse to look</span>
        <span>Shift to run</span>
        <span>ESC to release</span>
      </div>
      <InteractionSystem />
    </div>
  )
}
