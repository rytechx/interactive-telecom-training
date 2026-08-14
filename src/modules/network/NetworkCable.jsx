import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  BoxGeometry,
  CatmullRomCurve3,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Quaternion,
  TubeGeometry,
  Vector3,
} from 'three'
import { NETWORK_PORT_TYPES } from './networkDeviceConfigs.js'

const CABLE_ANIMATION_POINT_COUNT = 19
const CABLE_GEOMETRY_UPDATE_RATE = 20
const unitBoxGeometry = new BoxGeometry(1, 1, 1)
const invisibleHitboxMaterial = new MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  depthWrite: false,
})
const connectorContactMaterial = new MeshStandardMaterial({
  color: '#c7b067',
  metalness: 0.52,
  roughness: 0.4,
})
const powerProngMaterial = new MeshStandardMaterial({
  color: '#c6ccd0',
  metalness: 0.72,
  roughness: 0.34,
})

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
      geometry={unitBoxGeometry}
      material={invisibleHitboxMaterial}
      scale={[transform.length + width, width, width]}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
    />
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
  const plugScale = isPower
    ? endRole === 'pdu'
      ? [0.16, 0.1, 0.18]
      : [0.14, 0.09, 0.16]
    : [0.11, 0.075, 0.14]

  return (
    <group ref={groupRef}>
      <mesh geometry={unitBoxGeometry} scale={plugScale}>
        <meshStandardMaterial
          color={plugColor}
          emissive={highlightColor}
          emissiveIntensity={highlighted ? 0.22 : 0}
          transparent
          opacity={muted ? 0.42 : isPower ? 1 : 0.76}
          metalness={isPower ? 0.08 : 0.02}
          roughness={isPower ? 0.55 : 0.28}
          depthWrite={isPower}
        />
      </mesh>
      <mesh
        position={[0, 0, isPower ? -0.125 : -0.105]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry
          args={[
            isPower ? 0.055 : 0.04,
            isPower ? 0.068 : 0.052,
            isPower ? 0.16 : 0.13,
            12,
          ]}
        />
        <meshStandardMaterial color={plugColor} roughness={0.72} />
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
          <mesh
            key={positionX}
            geometry={unitBoxGeometry}
            material={powerProngMaterial}
            position={[positionX, 0, 0.155]}
            scale={[0.018, 0.052, 0.075]}
          />
        ))}
      {!isPower && (
        <>
          {[-0.142, -0.17, -0.198].map((positionZ) => (
            <mesh
              key={positionZ}
              position={[0, 0, positionZ]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.047, 0.047, 0.012, 12]} />
              <meshStandardMaterial
                color={plugColor}
                transparent
                opacity={muted ? 0.42 : 0.9}
                roughness={0.62}
              />
            </mesh>
          ))}
          {[-0.035, -0.025, -0.015, -0.005, 0.005, 0.015, 0.025, 0.035].map(
            (positionX) => (
              <mesh
                key={positionX}
                geometry={unitBoxGeometry}
                material={connectorContactMaterial}
                position={[positionX, 0.028, 0.072]}
                scale={[0.007, 0.012, 0.026]}
              />
            ),
          )}
          <mesh
            geometry={unitBoxGeometry}
            position={[0, 0.055, 0.01]}
            rotation={[-0.16, 0, 0]}
            scale={[0.058, 0.012, 0.12]}
          >
            <meshStandardMaterial
              color={plugColor}
              transparent
              opacity={muted ? 0.42 : 0.72}
              roughness={0.42}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
    </group>
  )
}

export default function NetworkCable({
  config,
  connected = false,
  sourceConnected = connected,
  destinationConnected = connected,
  connecting = false,
  selected = false,
  canSelect = false,
  canReject = false,
  alwaysShowLabels = false,
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
  const lastGeometryProgress = useRef(-1)
  const animationCompleted = useRef(false)
  const animatedPoints = useMemo(
    () => Array.from(
      { length: CABLE_ANIMATION_POINT_COUNT },
      () => new Vector3(),
    ),
    [],
  )
  const animatedCurve = useMemo(
    () => new CatmullRomCurve3(animatedPoints, false, 'centripetal'),
    [animatedPoints],
  )
  const curvePointScratch = useMemo(() => new Vector3(), [])
  const isHovered = hoveredObjectId === config.id
  const canInteract = canSelect || canReject
  const highlighted = selected || isHovered
  const partiallyConnected = sourceConnected && !destinationConnected
  const parkedCurve = useMemo(
    () => createCableCurve(config.parkedPath),
    [config.parkedPath],
  )
  const connectedCurve = useMemo(
    () => createCableCurve(config.connectedPath),
    [config.connectedPath],
  )
  const partialPath = useMemo(() => {
    const connectedPath = config.connectedPath
    const destination = connectedPath.at(-1)
    const freeConnectorPosition = [
      destination[0] - 0.06,
      destination[1] - 0.24,
      destination[2] + 0.38,
    ]

    return [...connectedPath.slice(0, -1), freeConnectorPosition]
  }, [config.connectedPath])
  const partialCurve = useMemo(
    () => createCableCurve(partialPath),
    [partialPath],
  )
  const restingCurve = connected
    ? connectedCurve
    : partiallyConnected
      ? partialCurve
      : parkedCurve
  const restingGeometry = useMemo(
    () =>
      new TubeGeometry(
        restingCurve,
        28,
        config.thickness,
        7,
        false,
      ),
    [config.thickness, restingCurve],
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
  const partialDestination = useMemo(
    () => new Vector3().fromArray(partialPath.at(-1)),
    [partialPath],
  )
  const interactiveCurve = partiallyConnected ? partialCurve : parkedCurve
  const cableHitboxSegments = useMemo(() => {
    const hitboxPoints = interactiveCurve.getSpacedPoints(
      config.hitboxSegmentCount ?? 5,
    )

    return hitboxPoints.slice(1).map((point, index) => ({
      end: point,
      id: `${config.id}-hitbox-${index}`,
      start: hitboxPoints[index],
    }))
  }, [config.hitboxSegmentCount, config.id, interactiveCurve])
  const tooltipPosition = useMemo(
    () => interactiveCurve.getPoint(0.58).toArray(),
    [interactiveCurve],
  )

  useEffect(() => {
    animationElapsed.current = 0
    lastGeometryProgress.current = -1
    animationCompleted.current = false

    if (animatedGeometryRef.current) {
      animatedGeometryRef.current.dispose()
      animatedGeometryRef.current = null
    }

    if (cableMeshRef.current) {
      cableMeshRef.current.geometry = restingGeometry
    }

    if (connecting) {
      sourcePlugRef.current?.position.copy(
        partiallyConnected ? connectedSource : parkedSource,
      )
      destinationPlugRef.current?.position.copy(
        partiallyConnected ? partialDestination : parkedDestination,
      )
      return
    }

    if (destinationPlugRef.current) {
      destinationPlugRef.current.visible = true
    }

    sourcePlugRef.current?.position.copy(
      sourceConnected ? connectedSource : parkedSource,
    )
    destinationPlugRef.current?.position.copy(
      destinationConnected
        ? connectedDestination
        : partiallyConnected
          ? partialDestination
          : parkedDestination,
    )
  }, [
    connected,
    connectedDestination,
    connectedSource,
    connecting,
    destinationConnected,
    partialDestination,
    partiallyConnected,
    parkedDestination,
    parkedSource,
    restingGeometry,
    sourceConnected,
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
      animationElapsed.current /
        (partiallyConnected
          ? config.repairConnectionDuration ?? 0.85
          : config.connectionDuration ?? 1.05),
      1,
    )

    if (partiallyConnected) {
      const insertionProgress = smoothStep(progress)
      sourcePlugRef.current.position.copy(connectedSource)
      destinationPlugRef.current.position.lerpVectors(
        partialDestination,
        connectedDestination,
        insertionProgress,
      )

      if (
        progress < 1 &&
        progress - lastGeometryProgress.current < 1 / CABLE_GEOMETRY_UPDATE_RATE
      ) {
        return
      }

      lastGeometryProgress.current = progress
      animatedPoints.forEach((point, index) => {
        const curveProgress = index / (CABLE_ANIMATION_POINT_COUNT - 1)

        partialCurve.getPoint(curveProgress, point)
        connectedCurve.getPoint(curveProgress, curvePointScratch)
        point.lerp(curvePointScratch, insertionProgress)
      })
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

      if (progress === 1) {
        animationCompleted.current = true
        onConnectionComplete?.(config.id)
      }

      return
    }
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
    destinationPlugRef.current.visible = true
    destinationPlugRef.current.position.copy(
      connectedCurve.getPoint(routeProgress),
    )

    if (
      progress < 1 &&
      progress - lastGeometryProgress.current < 1 / CABLE_GEOMETRY_UPDATE_RATE
    ) {
      return
    }

    lastGeometryProgress.current = progress

    animatedPoints.forEach((point, index) => {
      connectedCurve.getPoint(
        (index / (CABLE_ANIMATION_POINT_COUNT - 1)) * visibleRouteProgress,
        point,
      )
    })
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

      {(isHovered || (alwaysShowLabels && canInteract)) && (
        <Html
          position={[tooltipPosition[0], tooltipPosition[1] + 0.2, tooltipPosition[2]]}
          center
          zIndexRange={[3, 0]}
        >
          <div
            className={`network-object-tooltip${alwaysShowLabels && !isHovered ? ' is-persistent' : ''}`}
            role="tooltip"
          >
            {config.name}
          </div>
        </Html>
      )}
    </group>
  )
}
