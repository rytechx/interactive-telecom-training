import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Suspense, useCallback } from 'react'
import InteractionSystem from '../../interaction/InteractionSystem.jsx'
import FirstPersonPlayer from '../../player/FirstPersonPlayer.jsx'
import useInteractionStore from '../../store/useInteractionStore.js'
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
  const isPointerLocked = useInteractionStore(
    (state) => state.isPointerLocked,
  )
  const isTrainingMode = useInteractionStore(
    (state) => state.isTrainingMode,
  )
  const setPointerLocked = useInteractionStore(
    (state) => state.setPointerLocked,
  )
  const handleLockChange = useCallback((isLocked) => {
    setPointerLocked(isLocked)
  }, [setPointerLocked])

  return (
    <div className="telecom-lab">
      <Canvas camera={cameraSettings} shadows style={canvasStyle}>
        <Environment />
        <Lighting />
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]} colliders={false}>
            <LabRoom />
            <FirstPersonPlayer
              spawnPosition={playerSpawnPosition}
              onLockChange={handleLockChange}
              enabled={!isTrainingMode}
            />
          </Physics>
        </Suspense>
      </Canvas>

      <div
        className={`player-crosshair${isTrainingMode ? ' is-hidden' : ''}`}
        aria-hidden="true"
      />
      <div
        className={`player-instructions${
          isPointerLocked || isTrainingMode ? ' is-hidden' : ''
        }`}
        aria-hidden={isPointerLocked || isTrainingMode}
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
