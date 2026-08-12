import {
  brushedMetalMaterial,
  darkPlasticMaterial,
  powderCoatedMetalMaterial,
} from './labMaterials.js'

export default function Door({
  roomDepth = 20,
  wallThickness = 0.2,
  width = 1.6,
  height = 2.4,
  thickness = 0.08,
}) {
  const frameThickness = 0.12
  const doorZ = -(
    roomDepth / 2 -
    wallThickness -
    thickness / 2 -
    0.01
  )

  return (
    <group>
      <mesh material={powderCoatedMetalMaterial} position={[0, height / 2, doorZ]} castShadow receiveShadow>
        <boxGeometry args={[width, height, thickness]} />
      </mesh>

      <mesh
        material={darkPlasticMaterial}
        position={[-(width / 2 + frameThickness / 2), height / 2, doorZ]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[frameThickness, height, thickness * 1.4]} />
      </mesh>
      <mesh
        material={darkPlasticMaterial}
        position={[width / 2 + frameThickness / 2, height / 2, doorZ]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[frameThickness, height, thickness * 1.4]} />
      </mesh>
      <mesh
        material={darkPlasticMaterial}
        position={[0, height + frameThickness / 2, doorZ]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[width + frameThickness * 2, frameThickness, thickness * 1.4]}
        />
      </mesh>

      <mesh
        material={brushedMetalMaterial}
        position={[width * 0.32, height * 0.5, doorZ + thickness]}
        castShadow
      >
        <sphereGeometry args={[0.06, 12, 12]} />
      </mesh>
      <mesh
        material={brushedMetalMaterial}
        position={[width * 0.25, height * 0.5, doorZ + thickness * 1.1]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.022, 0.022, 0.2, 12]} />
      </mesh>
      <mesh
        material={darkPlasticMaterial}
        position={[-width * 0.25, height * 0.72, doorZ + thickness * 0.62]}
        castShadow
      >
        <boxGeometry args={[0.46, 0.24, 0.035]} />
      </mesh>
      <mesh
        position={[-width * 0.25, height * 0.72, doorZ + thickness * 1.08]}
      >
        <boxGeometry args={[0.38, 0.16, 0.012]} />
        <meshPhysicalMaterial
          color="#8fb2bd"
          transparent
          opacity={0.45}
          roughness={0.18}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
