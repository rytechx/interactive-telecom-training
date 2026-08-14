import { Html } from '@react-three/drei'
import NetworkLinkIndicator from './NetworkLinkIndicator.jsx'
import {
  NETWORK_DEVICE_IDS,
  NETWORK_PORT_TYPES,
} from './networkDeviceConfigs.js'

const contactPositions = [-0.038, -0.027, -0.016, -0.005, 0.005, 0.016, 0.027, 0.038]

export default function NetworkPort({
  port,
  isInteractive = false,
  isHovered = false,
  isSelected = false,
  isTarget = false,
  alwaysShowLabels = false,
  linkActive = false,
  powerOnStartedAt = null,
  linkDelay = 0,
  onPointerEnter,
  onPointerLeave,
  onSelect,
}) {
  const isPowerPort = port.type === NETWORK_PORT_TYPES.POWER
  const isPduOutlet = port.deviceId === NETWORK_DEVICE_IDS.PDU
  const [portWidth, portHeight] =
    port.visibleDimensions ?? (isPowerPort ? [0.095, 0.075] : [0.13, 0.082])
  const hitboxDimensions =
    port.hitboxDimensions ??
    (isPowerPort
      ? [portWidth * 2.2, portHeight * 2.25, 0.16]
      : isTarget
        ? [portWidth + 0.06, portHeight + 0.1, 0.12]
        : [portWidth + 0.045, portHeight + 0.09, 0.1])
  const highlightColor = isSelected
    ? '#6dcdf2'
    : isHovered
      ? '#89dcf7'
      : isTarget
        ? '#6dc7df'
      : isPowerPort
        ? port.socketRingColor ?? '#4b575d'
        : '#0a1013'
  const isEmphasized = isHovered || isSelected || isTarget
  const tooltipPosition = port.tooltipPosition ?? [0, 0.18, 0.12]
  const hitboxOffsetZ =
    port.hitboxOffsetZ ?? (isTarget ? 0.16 : 0.075)
  const physicalLabelPosition =
    port.physicalLabelPosition ?? [0, -0.105, 0.1]

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
    <group position={port.position} rotation={port.rotation ?? [0, 0, 0]}>
      <mesh>
        <boxGeometry args={[portWidth + 0.025, portHeight + 0.025, 0.024]} />
        <meshStandardMaterial
          color={
            isSelected
              ? '#5b91a7'
              : isHovered
                ? '#527c8f'
                : isTarget
                  ? '#416f80'
                  : port.faceplateColor ?? '#263138'
          }
          emissive={isEmphasized ? '#2b718d' : '#000000'}
          emissiveIntensity={isSelected ? 0.48 : isTarget ? 0.36 : isHovered ? 0.28 : 0}
          metalness={isPduOutlet ? 0.35 : 0.12}
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
            <meshStandardMaterial color="#151c20" roughness={0.9} />
          </mesh>
          {[-0.014, 0.014].map((positionX) => (
            <mesh key={positionX} position={[positionX, 0.012, 0.044]}>
              <sphereGeometry args={[0.0045, 8, 8]} />
              <meshStandardMaterial
                color="#b9a775"
                metalness={0.72}
                roughness={0.38}
              />
            </mesh>
          ))}
        </>
      ) : (
        <>
          <mesh position={[0, 0, 0.016]}>
            <boxGeometry args={[portWidth, portHeight, 0.018]} />
            <meshStandardMaterial color={highlightColor} roughness={0.82} />
          </mesh>
          <mesh position={[0, portHeight * 0.31, 0.029]}>
            <boxGeometry args={[portWidth * 0.42, 0.014, 0.009]} />
            <meshStandardMaterial color="#151d21" roughness={0.88} />
          </mesh>
          <mesh position={[0, -portHeight * 0.34, 0.029]}>
            <boxGeometry args={[portWidth * 0.84, 0.012, 0.009]} />
            <meshStandardMaterial
              color="#4d5a60"
              metalness={0.28}
              roughness={0.58}
            />
          </mesh>
        </>
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

      {isInteractive && (
        <mesh
          position={[0, 0, hitboxOffsetZ]}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          onClick={handleClick}
        >
          <boxGeometry args={hitboxDimensions} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {(isHovered || isSelected || (alwaysShowLabels && isInteractive)) && (
        <Html position={tooltipPosition} center zIndexRange={[4, 0]}>
          <div
            className={`network-object-tooltip${
              isSelected ? ' is-selected' : isTarget ? ' is-target' : ''
            }${alwaysShowLabels && !isHovered && !isSelected ? ' is-persistent' : ''}`}
            role="tooltip"
          >
            <strong>{port.name}</strong>
            {isTarget && <span>Valid Destination</span>}
          </div>
        </Html>
      )}

      {port.physicalLabel && (
        <Html position={physicalLabelPosition} center zIndexRange={[2, 0]}>
          <span
            className={`network-port-marking${
              isPduOutlet ? ' is-pdu-number' : ''
            }${isPowerPort ? '' : ' is-data-label'}`}
          >
            {port.physicalLabel}
          </span>
        </Html>
      )}
    </group>
  )
}
