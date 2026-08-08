import { Html } from '@react-three/drei'
import NetworkLinkIndicator from './NetworkLinkIndicator.jsx'
import { NETWORK_PORT_TYPES } from './networkDeviceConfigs.js'

const contactPositions = [-0.034, -0.011, 0.011, 0.034]

export default function NetworkPort({
  port,
  isInteractive = false,
  isHovered = false,
  isSelected = false,
  linkActive = false,
  powerOnStartedAt = null,
  linkDelay = 0,
  onPointerEnter,
  onPointerLeave,
  onSelect,
}) {
  const isPowerPort = port.type === NETWORK_PORT_TYPES.POWER
  const portWidth = isPowerPort ? 0.095 : 0.13
  const portHeight = isPowerPort ? 0.075 : 0.082
  const hitboxDimensions = isPowerPort
    ? [portWidth * 1.8, portHeight * 1.9, 0.14]
    : [portWidth + 0.045, portHeight + 0.09, 0.1]
  const highlightColor = isSelected
    ? '#6dcdf2'
    : isHovered
      ? '#89dcf7'
      : '#06090b'

  const handlePointerEnter = (event) => {
    if (!isInteractive) {
      return
    }

    event.stopPropagation()
    onPointerEnter?.(port)
  }

  const handlePointerLeave = (event) => {
    event.stopPropagation()
    onPointerLeave?.(port)
  }

  const handleClick = (event) => {
    if (!isInteractive) {
      return
    }

    event.stopPropagation()
    onSelect?.(port.id)
  }

  return (
    <group position={port.position}>
      <mesh>
        <boxGeometry args={[portWidth + 0.025, portHeight + 0.025, 0.024]} />
        <meshStandardMaterial
          color={isHovered || isSelected ? '#45677a' : '#151b1f'}
          emissive={isHovered || isSelected ? '#2b718d' : '#000000'}
          emissiveIntensity={isHovered || isSelected ? 0.34 : 0}
          roughness={0.62}
        />
      </mesh>

      {isPowerPort ? (
        <>
          <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.034, 0.034, 0.018, 16]} />
            <meshStandardMaterial color={highlightColor} roughness={0.78} />
          </mesh>
          <mesh position={[0, 0, 0.034]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.013, 0.013, 0.012, 12]} />
            <meshStandardMaterial color="#20272b" roughness={0.9} />
          </mesh>
        </>
      ) : (
        <mesh position={[0, 0, 0.016]}>
          <boxGeometry args={[portWidth, portHeight, 0.018]} />
          <meshStandardMaterial color={highlightColor} roughness={0.82} />
        </mesh>
      )}

      {!isPowerPort &&
        contactPositions.map((positionX) => (
          <mesh key={positionX} position={[positionX, 0.021, 0.029]}>
            <boxGeometry args={[0.009, 0.022, 0.006]} />
            <meshStandardMaterial
              color="#b9954b"
              metalness={0.72}
              roughness={0.38}
            />
          </mesh>
        ))}

      {port.hasLinkIndicator && (
        <NetworkLinkIndicator
          position={[0, portHeight / 2 + 0.035, 0.035]}
          active={linkActive}
          powerOnStartedAt={powerOnStartedAt}
          delay={linkDelay}
        />
      )}

      <mesh
        position={[0, 0, 0.055]}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        <boxGeometry args={hitboxDimensions} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {isHovered && (
        <Html position={[0, 0.18, 0.12]} center>
          <div className="network-object-tooltip" role="tooltip">
            {port.name}
          </div>
        </Html>
      )}

      {isPowerPort && port.faceLabel && (
        <Html position={[0, -0.1, 0.08]} center>
          <span className="network-power-port-label">{port.faceLabel}</span>
        </Html>
      )}
    </group>
  )
}
