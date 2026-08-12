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
          color={canConfigure ? '#163d4c' : '#111a20'}
          emissive={canConfigure ? '#1c708d' : '#071015'}
          emissiveIntensity={canConfigure ? 0.24 : 0.07}
          roughness={0.72}
        />
      </mesh>
      <mesh position={[0, 0.31, -0.052]}>
        <boxGeometry args={[0.62, 0.035, 0.018]} />
        <meshStandardMaterial color="#222c31" roughness={0.76} />
      </mesh>
      <mesh position={[-0.2, 0.08, 0.074]}>
        <boxGeometry args={[0.34, 0.035, 0.012]} />
        <meshBasicMaterial color="#65b9cf" toneMapped={false} />
      </mesh>
      <mesh position={[-0.29, 0, 0.074]}>
        <boxGeometry args={[0.18, 0.025, 0.012]} />
        <meshBasicMaterial color="#7b8f97" toneMapped={false} />
      </mesh>
      <mesh position={[-0.14, -0.08, 0.074]}>
        <boxGeometry args={[0.48, 0.022, 0.012]} />
        <meshBasicMaterial color="#416570" toneMapped={false} />
      </mesh>
      <mesh position={[0.43, -0.22, 0.076]}>
        <circleGeometry args={[0.018, 12]} />
        <meshBasicMaterial
          color={canConfigure ? '#5fdb9b' : '#526067'}
          toneMapped={false}
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
      <mesh position={[0, -0.58, 0.46]} rotation={[-0.06, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.78, 0.045, 0.28]} />
        <meshStandardMaterial color="#252f34" roughness={0.76} />
      </mesh>
      {[-0.2, -0.12, -0.04].flatMap((positionZ, rowIndex) =>
        [-0.29, -0.195, -0.1, -0.005, 0.09, 0.185, 0.28].map(
          (positionX) => (
            <mesh
              key={`${rowIndex}-${positionX}`}
              position={[positionX, -0.548, 0.46 + positionZ]}
            >
              <boxGeometry args={[0.072, 0.012, 0.04]} />
              <meshStandardMaterial color="#4b585e" roughness={0.72} />
            </mesh>
          ),
        ),
      )}
      <mesh position={[0.56, -0.565, 0.45]} castShadow receiveShadow>
        <sphereGeometry args={[0.078, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2d383d" roughness={0.78} />
      </mesh>
      <mesh position={[0.56, -0.49, 0.435]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.022, 10]} />
        <meshStandardMaterial color="#718087" metalness={0.42} roughness={0.5} />
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
