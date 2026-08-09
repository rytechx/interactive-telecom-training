import { Html } from '@react-three/drei'
import { NETWORK_WORKSTATION_LAYOUT } from './networkWorkstationLayout.js'

const MONITOR_ID = 'workstation-monitor'

export default function NetworkWorkstationMonitor({
  position = NETWORK_WORKSTATION_LAYOUT.workstationMonitorPosition,
  canConfigure = false,
  isHovered = false,
  onHover,
  onHoverEnd,
  onConfigure,
}) {
  const handlePointerEnter = (event) => {
    if (!canConfigure) {
      return
    }

    event.stopPropagation()
    onHover?.(MONITOR_ID, 'Configure Workstation')
  }

  const handlePointerLeave = (event) => {
    event.stopPropagation()
    onHoverEnd?.(MONITOR_ID)
  }

  const handleClick = (event) => {
    if (!canConfigure) {
      return
    }

    event.stopPropagation()
    onConfigure?.()
  }

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.05, 0.62, 0.09]} />
        <meshStandardMaterial
          color="#46525a"
          emissive={isHovered ? '#2785a8' : '#000000'}
          emissiveIntensity={isHovered ? 0.32 : 0}
          metalness={0.34}
          roughness={0.5}
        />
      </mesh>
      <mesh position={[0, 0, 0.058]}>
        <boxGeometry args={[0.91, 0.49, 0.026]} />
        <meshStandardMaterial
          color={canConfigure ? '#153746' : '#111a20'}
          emissive={canConfigure ? '#1f7898' : '#071015'}
          emissiveIntensity={canConfigure ? 0.28 : 0.08}
          roughness={0.72}
        />
      </mesh>
      <mesh position={[0, -0.42, 0]} castShadow>
        <boxGeometry args={[0.1, 0.24, 0.09]} />
        <meshStandardMaterial
          color="#56636a"
          metalness={0.46}
          roughness={0.52}
        />
      </mesh>
      <mesh position={[0, -0.56, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.48, 0.06, 0.28]} />
        <meshStandardMaterial
          color="#56636a"
          metalness={0.46}
          roughness={0.52}
        />
      </mesh>

      <mesh
        position={[0, 0, 0.2]}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        <boxGeometry args={[1.16, 0.73, 0.22]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {canConfigure && (
        <Html position={[0, 0.47, 0.12]} center zIndexRange={[3, 0]}>
          <span className="network-device-face-label">Workstation Monitor</span>
        </Html>
      )}

      {isHovered && canConfigure && (
        <Html position={[0, 0.64, 0.18]} center zIndexRange={[3, 0]}>
          <div className="network-object-tooltip" role="tooltip">
            Configure Workstation
          </div>
        </Html>
      )}
    </group>
  )
}
