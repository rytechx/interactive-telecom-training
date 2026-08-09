import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { CatmullRomCurve3, Quaternion, TubeGeometry, Vector3 } from 'three'
import { NETWORK_PORT_TYPES } from './networkDeviceConfigs.js'

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress)
}

function clamp01(value) {
  return Math.min(Math.max(value, 0), 1)
}

function createCableCurve(path) {
  return new CatmullRomCurve3(
    path.map((point) => new Vector3().fromArray(point)),
    false,
    'centripetal',
  )
}

function CableHitboxSegment({ start, end, width, onPointerEnter, onPointerLeave, onClick }) {
  const transform = useMemo(() => {
    const startPosition = new Vector3().copy(start)
    const endPosition = new Vector3().copy(end)
    const direction = endPosition.clone().sub(startPosition)
    const length = direction.length()

    return {
      length,
      position: startPosition.add(endPosition).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(
        new Vector3(1, 0, 0),
        direction.normalize(),
      ),
    }
  }, [end, start])

  return (
    <mesh
      position={transform.position}
      quaternion={transform.quaternion}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
    >
      <boxGeometry args={[transform.length + width, width, width]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

function CablePlug({
  groupRef,
  cableType,
  color,
  configuredPlugColor,
  endRole,
  highlighted,
  muted,
  highlightColor,
}) {
  const isPower = cableType === NETWORK_PORT_TYPES.POWER
  const plugColor = highlighted
    ? highlightColor
    : configuredPlugColor ?? (isPower ? '#4e595f' : color)

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
  const cableMeshRef = useRef(null)
  const sourcePlugRef = useRef(null)
  const destinationPlugRef = useRef(null)
  const animatedGeometryRef = useRef(null)
  const animationElapsed = useRef(0)
  const animationCompleted = useRef(false)
  const isHovered = hoveredObjectId === config.id
  const canInteract = canSelect || canReject
  const highlighted = selected || isHovered
  const parkedCurve = useMemo(
    () => createCableCurve(config.parkedPath),
    [config.parkedPath],
  )
  const connectedCurve = useMemo(
    () => createCableCurve(config.connectedPath),
    [config.connectedPath],
  )
  const restingGeometry = useMemo(
    () =>
      new TubeGeometry(
        connected ? connectedCurve : parkedCurve,
        28,
        config.thickness,
        7,
        false,
      ),
    [connected, connectedCurve, config.thickness, parkedCurve],
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
  const cableHitboxSegments = useMemo(() => {
    const hitboxPoints = parkedCurve.getSpacedPoints(
      config.hitboxSegmentCount ?? 5,
    )

    return hitboxPoints.slice(1).map((point, index) => ({
      end: point,
      id: `${config.id}-hitbox-${index}`,
      start: hitboxPoints[index],
    }))
  }, [config.hitboxSegmentCount, config.id, parkedCurve])
  const tooltipPosition = config.parkedPath[Math.floor(config.parkedPath.length / 2)]

  useEffect(() => {
    animationElapsed.current = 0
    animationCompleted.current = false

    if (animatedGeometryRef.current) {
      animatedGeometryRef.current.dispose()
      animatedGeometryRef.current = null
    }

    if (cableMeshRef.current) {
      cableMeshRef.current.geometry = restingGeometry
    }

    if (connecting) {
      sourcePlugRef.current?.position.copy(parkedSource)
      destinationPlugRef.current?.position.copy(parkedDestination)
      return
    }

    if (destinationPlugRef.current) {
      destinationPlugRef.current.visible = true
    }

    sourcePlugRef.current?.position.copy(
      connected ? connectedSource : parkedSource,
    )
    destinationPlugRef.current?.position.copy(
      connected ? connectedDestination : parkedDestination,
    )
  }, [
    connected,
    connectedDestination,
    connectedSource,
    connecting,
    parkedDestination,
    parkedSource,
    restingGeometry,
  ])

  useEffect(
    () => () => {
      animatedGeometryRef.current?.dispose()
    },
    [],
  )

  useEffect(() => () => restingGeometry.dispose(), [restingGeometry])

  useFrame((_, delta) => {
    const material = cableMaterialRef.current

    if (material) {
      material.emissiveIntensity = highlighted ? 0.3 : 0.02
      material.opacity = connecting
        ? 1
        : highlighted
          ? 1
          : muted
          ? 0.36
          : 1
    }

    if (
      !connecting ||
      !cableMeshRef.current ||
      !sourcePlugRef.current ||
      !destinationPlugRef.current ||
      animationCompleted.current
    ) {
      return
    }

    animationElapsed.current += delta
    const progress = Math.min(
      animationElapsed.current / (config.connectionDuration ?? 1.05),
      1,
    )
    const sourceProgress = smoothStep(Math.min(progress / 0.28, 1))
    const routeProgress = smoothStep(clamp01((progress - 0.28) / 0.72))

    sourcePlugRef.current.position.lerpVectors(
      parkedSource,
      connectedSource,
      sourceProgress,
    )

    if (routeProgress === 0) {
      destinationPlugRef.current.visible = false
      cableMeshRef.current.geometry = restingGeometry
      return
    }

    const visibleRouteProgress = Math.max(routeProgress, 0.015)
    const animatedPoints = Array.from({ length: 19 }, (_, index) =>
      connectedCurve.getPoint((index / 18) * visibleRouteProgress),
    )
    const animatedCurve = new CatmullRomCurve3(
      animatedPoints,
      false,
      'centripetal',
    )
    const animatedGeometry = new TubeGeometry(
      animatedCurve,
      28,
      config.thickness,
      7,
      false,
    )

    animatedGeometryRef.current?.dispose()
    animatedGeometryRef.current = animatedGeometry
    cableMeshRef.current.geometry = animatedGeometry
    destinationPlugRef.current.visible = true
    destinationPlugRef.current.position.copy(
      connectedCurve.getPoint(routeProgress),
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
      <mesh ref={cableMeshRef} geometry={restingGeometry}>
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
        configuredPlugColor={config.plugColor}
        endRole="device"
        highlighted={highlighted}
        muted={muted && !highlighted}
        highlightColor={config.highlightColor ?? config.color}
      />
      <CablePlug
        groupRef={destinationPlugRef}
        cableType={config.type}
        color={config.color}
        configuredPlugColor={config.plugColor}
        endRole="pdu"
        highlighted={highlighted}
        muted={muted && !highlighted}
        highlightColor={config.highlightColor ?? config.color}
      />

      {canInteract && !connected && !connecting &&
        cableHitboxSegments.map((segment) => (
          <CableHitboxSegment
            key={segment.id}
            start={segment.start}
            end={segment.end}
            width={config.interactionWidth ?? config.thickness * 4}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onClick={handleClick}
          />
        ))}

      {isHovered && canInteract && (
        <Html
          position={[tooltipPosition[0], tooltipPosition[1] + 0.2, tooltipPosition[2]]}
          center
          zIndexRange={[3, 0]}
        >
          <div className="network-object-tooltip" role="tooltip">
            {config.name}
          </div>
        </Html>
      )}
    </group>
  )
}
