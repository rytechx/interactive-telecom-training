import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Vector3 } from 'three'
import NetworkLinkIndicator from './NetworkLinkIndicator.jsx'
import NetworkPort from './NetworkPort.jsx'

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress)
}

export default function NetworkDevice({
  config,
  installed = false,
  installing = false,
  selected = false,
  canSelect = false,
  canConfigure = false,
  configurationLabel = null,
  powered = false,
  networkPowered = false,
  powerOnStartedAt = null,
  linkPowerOnStartedAt = powerOnStartedAt,
  linkPowerOnStartedAtByPortId = {},
  linkDelayByPortId = {},
  activeLinkPortIds = [],
  interactivePortIds = [],
  hoveredObjectId = null,
  selectedPortId = null,
  targetPortId = null,
  showLabel = false,
  onHover,
  onHoverEnd,
  onSelectDevice,
  onConfigure,
  onSelectPort,
  onInstallationComplete,
}) {
  const groupRef = useRef(null)
  const animationElapsed = useRef(0)
  const installationCompleted = useRef(false)
  const preparationPosition = useMemo(
    () => new Vector3().fromArray(config.preparationPosition),
    [config.preparationPosition],
  )
  const mountedPosition = useMemo(
    () => new Vector3().fromArray(config.mountedPosition),
    [config.mountedPosition],
  )
  const alignedPosition = useMemo(
    () =>
      new Vector3(
        config.mountedPosition[0],
        config.mountedPosition[1],
        0.72,
      ),
    [config.mountedPosition],
  )
  const bodyDimensions = config.dimensions
  const isHovered = hoveredObjectId === config.id
  const isRackDevice = config.type === 'rack-device'
  const frontZ = bodyDimensions[2] / 2 + 0.012
  const canInteract = canSelect || canConfigure
  const interactionOffset = installed ? 0.32 : 0.1
  const interactionDepth = installed ? 0.26 : 0.16

  useEffect(() => {
    if (!groupRef.current || installing) {
      return
    }

    groupRef.current.position.copy(
      installed ? mountedPosition : preparationPosition,
    )
    animationElapsed.current = 0
    installationCompleted.current = false
  }, [installed, installing, mountedPosition, preparationPosition])

  useFrame((_, delta) => {
    if (!installing || !groupRef.current || installationCompleted.current) {
      return
    }

    animationElapsed.current += delta
    const progress = Math.min(animationElapsed.current / 1.05, 1)

    if (progress <= 0.58) {
      groupRef.current.position.lerpVectors(
        preparationPosition,
        alignedPosition,
        smoothStep(progress / 0.58),
      )
    } else {
      groupRef.current.position.lerpVectors(
        alignedPosition,
        mountedPosition,
        smoothStep((progress - 0.58) / 0.42),
      )
    }

    if (progress < 1) {
      return
    }

    installationCompleted.current = true
    onInstallationComplete?.(config.id)
  })

  const handlePointerEnter = (event) => {
    if (!canInteract) {
      return
    }

    event.stopPropagation()
    onHover?.(
      config.id,
      canConfigure ? configurationLabel ?? `Configure ${config.shortName}` : config.shortName,
    )
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
    if (canConfigure) {
      onConfigure?.(config.id)
      return
    }

    onSelectDevice?.(config.id)
  }

  return (
    <group ref={groupRef} position={config.preparationPosition}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={bodyDimensions} />
        <meshStandardMaterial
          color={config.color}
          emissive={selected || isHovered ? '#236783' : '#000000'}
          emissiveIntensity={selected ? 0.36 : isHovered ? 0.2 : 0}
          metalness={isRackDevice ? 0.58 : 0.35}
          roughness={0.48}
        />
      </mesh>

      <mesh position={[0, 0, frontZ]}>
        <boxGeometry
          args={[
            bodyDimensions[0] - 0.06,
            bodyDimensions[1] - 0.045,
            0.025,
          ]}
        />
        <meshStandardMaterial
          color={config.frontColor ?? '#20292e'}
          metalness={0.42}
          roughness={0.6}
        />
      </mesh>

      {config.id !== 'patch-panel' && (
        <NetworkLinkIndicator
          position={[-bodyDimensions[0] / 2 + 0.09, bodyDimensions[1] / 4, frontZ + 0.025]}
          active={powered}
          powerOnStartedAt={powerOnStartedAt}
          delay={config.id === 'router' ? 1 : 0}
          color="#60d884"
        />
      )}

      {config.ports.map((port) => (
        <NetworkPort
          key={port.id}
          port={port}
          isInteractive={interactivePortIds.includes(port.id)}
          isHovered={hoveredObjectId === port.id}
          isSelected={selectedPortId === port.id}
          isTarget={targetPortId === port.id}
          linkActive={
            networkPowered && activeLinkPortIds.includes(port.id)
          }
          powerOnStartedAt={
            linkPowerOnStartedAtByPortId[port.id] ?? linkPowerOnStartedAt
          }
          linkDelay={linkDelayByPortId[port.id] ?? 1.5}
          onPointerEnter={(hoveredPort) =>
            onHover?.(hoveredPort.id, hoveredPort.name)
          }
          onPointerLeave={(hoveredPort) => onHoverEnd?.(hoveredPort.id)}
          onSelect={onSelectPort}
        />
      ))}

      {showLabel && (
        <Html
          position={[0, bodyDimensions[1] / 2 + 0.055, frontZ]}
          center
          zIndexRange={[3, 0]}
        >
          <span className="network-device-face-label">{config.shortName}</span>
        </Html>
      )}

      <mesh
        position={[0, 0, frontZ + interactionOffset]}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        <boxGeometry
          args={[bodyDimensions[0], bodyDimensions[1] + 0.08, interactionDepth]}
        />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {isHovered && canInteract && (
        <Html
          position={[0, bodyDimensions[1] / 2 + 0.22, 0.1]}
          center
          zIndexRange={[3, 0]}
        >
          <div className="network-object-tooltip" role="tooltip">
            {canConfigure
              ? configurationLabel ?? `Configure ${config.shortName}`
              : config.shortName}
          </div>
        </Html>
      )}
    </group>
  )
}
