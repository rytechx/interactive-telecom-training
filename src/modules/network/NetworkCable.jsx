import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { CatmullRomCurve3, Vector3 } from 'three'
import { NETWORK_PORT_TYPES } from './networkDeviceConfigs.js'

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress)
}

function CablePlug({
  groupRef,
  cableType,
  color,
  endRole,
  highlighted,
  muted,
  highlightColor,
}) {
  const isPower = cableType === NETWORK_PORT_TYPES.POWER
  const plugColor = highlighted ? highlightColor : isPower ? '#20262a' : color

  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry
          args={
            isPower
              ? endRole === 'pdu'
                ? [0.16, 0.1, 0.18]
                : [0.14, 0.09, 0.16]
              : [0.11, 0.075, 0.14]
          }
        />
        <meshStandardMaterial
          color={plugColor}
          emissive={highlightColor}
          emissiveIntensity={highlighted ? 0.22 : 0}
          transparent
          opacity={muted ? 0.42 : 1}
          roughness={0.55}
        />
      </mesh>
      {isPower && (
        <mesh position={[0, 0, 0.105]}>
          <cylinderGeometry args={[0.052, 0.06, 0.055, 12]} />
          <meshStandardMaterial
            color={plugColor}
            emissive={highlightColor}
            emissiveIntensity={highlighted ? 0.18 : 0}
            transparent
            opacity={muted ? 0.42 : 1}
            roughness={0.58}
          />
        </mesh>
      )}
      {isPower && endRole === 'pdu' &&
        [-0.034, 0.034].map((positionX) => (
          <mesh key={positionX} position={[positionX, 0, 0.155]}>
            <boxGeometry args={[0.018, 0.052, 0.075]} />
            <meshStandardMaterial
              color="#c6ccd0"
              metalness={0.72}
              roughness={0.34}
            />
          </mesh>
        ))}
      {!isPower && (
        <mesh position={[0, 0.028, 0.072]}>
          <boxGeometry args={[0.075, 0.012, 0.026]} />
          <meshStandardMaterial color="#c7b067" metalness={0.52} roughness={0.4} />
        </mesh>
      )}
    </group>
  )
}

export default function NetworkCable({
  config,
  connected = false,
  connecting = false,
  selected = false,
  canSelect = false,
  canReject = false,
  muted = false,
  hoveredObjectId = null,
  onHover,
  onHoverEnd,
  onSelect,
  onConnectionComplete,
}) {
  const cableMaterialRef = useRef(null)
  const sourcePlugRef = useRef(null)
  const destinationPlugRef = useRef(null)
  const animationElapsed = useRef(0)
  const animationCompleted = useRef(false)
  const isHovered = hoveredObjectId === config.id
  const canInteract = canSelect || canReject
  const highlighted = selected || isHovered
  const activePath = connected || connecting ? config.connectedPath : config.parkedPath
  const curve = useMemo(
    () =>
      new CatmullRomCurve3(
        activePath.map((point) => new Vector3().fromArray(point)),
      ),
    [activePath],
  )
  const parkedSource = useMemo(
    () => new Vector3().fromArray(config.parkedPath[0]),
    [config.parkedPath],
  )
  const parkedDestination = useMemo(
    () => new Vector3().fromArray(config.parkedPath.at(-1)),
    [config.parkedPath],
  )
  const connectedSource = useMemo(
    () => new Vector3().fromArray(config.connectedPath[0]),
    [config.connectedPath],
  )
  const connectedDestination = useMemo(
    () => new Vector3().fromArray(config.connectedPath.at(-1)),
    [config.connectedPath],
  )
  const tooltipPosition = config.parkedPath[Math.floor(config.parkedPath.length / 2)]

  useEffect(() => {
    animationElapsed.current = 0
    animationCompleted.current = false

    if (!connecting) {
      sourcePlugRef.current?.position.copy(
        connected ? connectedSource : parkedSource,
      )
      destinationPlugRef.current?.position.copy(
        connected ? connectedDestination : parkedDestination,
      )
    }
  }, [connected, connectedDestination, connectedSource, connecting, parkedDestination, parkedSource])

  useFrame((_, delta) => {
    const material = cableMaterialRef.current

    if (material) {
      material.emissiveIntensity = highlighted ? 0.3 : 0.02
      material.opacity = connecting
        ? Math.min(0.25 + animationElapsed.current / 1.1, 1)
        : highlighted
          ? 1
          : muted
          ? 0.36
          : 1
    }

    if (
      !connecting ||
      !sourcePlugRef.current ||
      !destinationPlugRef.current ||
      animationCompleted.current
    ) {
      return
    }

    animationElapsed.current += delta
    const progress = Math.min(animationElapsed.current / 1.15, 1)
    const sourceProgress = smoothStep(Math.min(progress / 0.48, 1))
    const destinationProgress = smoothStep(
      Math.min(Math.max((progress - 0.42) / 0.58, 0), 1),
    )

    sourcePlugRef.current.position.lerpVectors(
      parkedSource,
      connectedSource,
      sourceProgress,
    )
    destinationPlugRef.current.position.lerpVectors(
      parkedDestination,
      connectedDestination,
      destinationProgress,
    )

    if (progress < 1) {
      return
    }

    animationCompleted.current = true
    onConnectionComplete?.(config.id)
  })

  const handlePointerEnter = (event) => {
    if (!canInteract) {
      return
    }

    event.stopPropagation()
    onHover?.(config.id, config.name)
  }

  const handlePointerLeave = (event) => {
    event.stopPropagation()
    onHoverEnd?.(config.id)
  }

  const handleClick = (event) => {
    if (!canInteract) {
      return
    }

    event.stopPropagation()
    onSelect?.(config.id)
  }

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 28, config.thickness, 7, false]} />
        <meshStandardMaterial
          ref={cableMaterialRef}
          color={config.color}
          emissive={config.color}
          emissiveIntensity={0.02}
          transparent
          opacity={1}
          roughness={0.65}
        />
      </mesh>

      <CablePlug
        groupRef={sourcePlugRef}
        cableType={config.type}
        color={config.color}
        endRole="device"
        highlighted={highlighted}
        muted={muted && !highlighted}
        highlightColor={config.highlightColor ?? config.color}
      />
      <CablePlug
        groupRef={destinationPlugRef}
        cableType={config.type}
        color={config.color}
        endRole="pdu"
        highlighted={highlighted}
        muted={muted && !highlighted}
        highlightColor={config.highlightColor ?? config.color}
      />

      {!connected && !connecting && (
        <mesh
          position={tooltipPosition}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onClick={handleClick}
        >
          <boxGeometry args={config.hitboxDimensions ?? [0.72, 0.24, 0.32]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {isHovered && canInteract && (
        <Html
          position={[tooltipPosition[0], tooltipPosition[1] + 0.2, tooltipPosition[2]]}
          center
        >
          <div className="network-object-tooltip" role="tooltip">
            {config.name}
          </div>
        </Html>
      )}
    </group>
  )
}
