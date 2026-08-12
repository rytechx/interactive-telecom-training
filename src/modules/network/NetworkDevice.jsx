import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { BoxGeometry, CylinderGeometry, MeshStandardMaterial, Vector3 } from 'three'
import NetworkLinkIndicator from './NetworkLinkIndicator.jsx'
import NetworkPort from './NetworkPort.jsx'

const detailBoxGeometry = new BoxGeometry(1, 1, 1)
const detailCylinderGeometry = new CylinderGeometry(1, 1, 1, 10)
const ventMaterial = new MeshStandardMaterial({
  color: '#11181c',
  metalness: 0.18,
  roughness: 0.76,
})
const screwMaterial = new MeshStandardMaterial({
  color: '#99a4a9',
  metalness: 0.76,
  roughness: 0.3,
})
const bezelMaterial = new MeshStandardMaterial({
  color: '#59666d',
  metalness: 0.52,
  roughness: 0.5,
})
const amberLedMaterial = new MeshStandardMaterial({
  color: '#d3a64a',
  emissive: '#9d6821',
  emissiveIntensity: 0.34,
  roughness: 0.38,
  toneMapped: false,
})

function MountingHardware({ width, height, frontZ }) {
  return (
    <>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (width / 2 + 0.055), 0, frontZ]}>
          <mesh
            geometry={detailBoxGeometry}
            material={bezelMaterial}
            scale={[0.11, height * 0.92, 0.035]}
            castShadow
          />
          {[-1, 1].map((verticalSide) => (
            <mesh
              key={verticalSide}
              geometry={detailCylinderGeometry}
              material={screwMaterial}
              position={[0, verticalSide * height * 0.28, 0.024]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[0.018, 0.012, 0.018]}
            />
          ))}
        </group>
      ))}
    </>
  )
}

function DeviceFaceDetails({ deviceId, dimensions, frontZ }) {
  const detailZ = frontZ + 0.02

  if (deviceId === 'patch-panel') {
    return (
      <>
        {[-0.74, -0.66, 0.66, 0.74].map((positionX) => (
          <mesh
            key={positionX}
            geometry={detailBoxGeometry}
            material={ventMaterial}
            position={[positionX, 0, detailZ]}
            scale={[0.04, 0.07, 0.02]}
          />
        ))}
        <mesh
          geometry={detailBoxGeometry}
          material={bezelMaterial}
          position={[0, dimensions[1] * 0.32, detailZ]}
          scale={[1.18, 0.022, 0.018]}
        />
      </>
    )
  }

  if (deviceId === 'managed-switch') {
    return (
      <>
        {[-0.77, -0.71, -0.65, -0.59].map((positionX) => (
          <mesh
            key={positionX}
            geometry={detailBoxGeometry}
            material={ventMaterial}
            position={[positionX, dimensions[1] * 0.3, detailZ]}
            scale={[0.035, 0.032, 0.02]}
          />
        ))}
        {[0.56, 0.61, 0.66].map((positionX, index) => (
          <mesh
            key={positionX}
            geometry={detailCylinderGeometry}
            material={index === 0 ? amberLedMaterial : screwMaterial}
            position={[positionX, dimensions[1] * 0.3, detailZ]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[0.014, 0.008, 0.014]}
          />
        ))}
      </>
    )
  }

  if (deviceId === 'router') {
    return (
      <>
        {[-0.73, -0.67, 0.55, 0.61, 0.67].map((positionX) => (
          <mesh
            key={positionX}
            geometry={detailBoxGeometry}
            material={ventMaterial}
            position={[positionX, -dimensions[1] * 0.28, detailZ]}
            scale={[0.038, 0.028, 0.02]}
          />
        ))}
        <mesh
          geometry={detailBoxGeometry}
          material={bezelMaterial}
          position={[0.36, dimensions[1] * 0.28, detailZ]}
          scale={[0.3, 0.035, 0.02]}
        />
        {[-0.08, 0, 0.08].map((positionX) => (
          <mesh
            key={positionX}
            geometry={detailCylinderGeometry}
            material={amberLedMaterial}
            position={[0.36 + positionX, dimensions[1] * 0.28, detailZ + 0.014]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[0.012, 0.007, 0.012]}
          />
        ))}
      </>
    )
  }

  if (deviceId === 'workstation-pc') {
    return (
      <>
        {[-0.13, -0.065, 0, 0.065, 0.13].map((positionX) => (
          <mesh
            key={positionX}
            geometry={detailBoxGeometry}
            material={ventMaterial}
            position={[positionX, dimensions[1] * 0.28, detailZ]}
            scale={[0.035, 0.12, 0.02]}
          />
        ))}
        <mesh
          geometry={detailCylinderGeometry}
          material={bezelMaterial}
          position={[0.14, -dimensions[1] * 0.32, detailZ]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.035, 0.012, 0.035]}
        />
      </>
    )
  }

  return null
}

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

      {isRackDevice && (
        <MountingHardware
          width={bodyDimensions[0]}
          height={bodyDimensions[1]}
          frontZ={frontZ}
        />
      )}
      <DeviceFaceDetails
        deviceId={config.id}
        dimensions={bodyDimensions}
        frontZ={frontZ}
      />

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
