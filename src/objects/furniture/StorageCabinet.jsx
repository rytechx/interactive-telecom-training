import {
  brushedMetalMaterial,
  powderCoatedMetalMaterial,
  rubberMaterial,
  safetyWhiteMaterial,
} from '../../scenes/TelecomLab/labMaterials.js'

export default function StorageCabinet({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  width = 2,
  height = 2.4,
  depth = 0.7,
}) {
  const doorWidth = width / 2 - 0.06
  const frontZ = depth / 2 + 0.025

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh
        material={powderCoatedMetalMaterial}
        position={[0, height / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, height, depth]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * width / 4, height / 2, frontZ]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[doorWidth, height - 0.1, 0.05]} />
          <meshStandardMaterial
            color="#59656b"
            metalness={0.32}
            roughness={0.62}
          />
        </mesh>
      ))}
      {[-0.1, 0.1].map((xPosition) => (
        <mesh
          key={xPosition}
          material={brushedMetalMaterial}
          position={[xPosition, height / 2, frontZ + 0.04]}
          castShadow
        >
          <boxGeometry args={[0.04, 0.3, 0.04]} />
        </mesh>
      ))}
      {[-0.55, 0.55].map((xPosition) => (
        <group key={xPosition} position={[xPosition, height - 0.3, frontZ + 0.045]}>
          {[-0.1, -0.05, 0, 0.05, 0.1].map((yPosition) => (
            <mesh
              key={yPosition}
              material={rubberMaterial}
              position={[0, yPosition, 0]}
            >
              <boxGeometry args={[0.42, 0.018, 0.015]} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh
        material={safetyWhiteMaterial}
        position={[0, height - 0.68, frontZ + 0.045]}
      >
        <boxGeometry args={[0.52, 0.18, 0.015]} />
      </mesh>
      {[-width * 0.36, width * 0.36].map((xPosition) => (
        <mesh
          key={xPosition}
          material={rubberMaterial}
          position={[xPosition, 0.035, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.22, 0.07, 0.55]} />
        </mesh>
      ))}
    </group>
  )
}
