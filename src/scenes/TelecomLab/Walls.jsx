import {
  baseboardMaterial,
  paintedWallMaterial,
} from './labMaterials.js'

function Wall({ position, size }) {
  return (
    <mesh material={paintedWallMaterial} position={position} receiveShadow>
      <boxGeometry args={size} />
    </mesh>
  )
}

export default function Walls({
  width = 20,
  depth = 20,
  height = 4,
  thickness = 0.2,
}) {
  const halfHeight = height / 2
  const wallX = width / 2 - thickness / 2
  const wallZ = depth / 2 - thickness / 2

  return (
    <group>
      <Wall
        position={[0, halfHeight, -wallZ]}
        size={[width, height, thickness]}
      />
      <Wall
        position={[0, halfHeight, wallZ]}
        size={[width, height, thickness]}
      />
      <Wall
        position={[-wallX, halfHeight, 0]}
        size={[thickness, height, depth]}
      />
      <Wall
        position={[wallX, halfHeight, 0]}
        size={[thickness, height, depth]}
      />
      <mesh
        material={baseboardMaterial}
        position={[0, 0.09, -wallZ + thickness / 2 + 0.025]}
        receiveShadow
      >
        <boxGeometry args={[width - 0.2, 0.18, 0.05]} />
      </mesh>
      <mesh
        material={baseboardMaterial}
        position={[0, 0.09, wallZ - thickness / 2 - 0.025]}
        receiveShadow
      >
        <boxGeometry args={[width - 0.2, 0.18, 0.05]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          material={baseboardMaterial}
          position={[side * (wallX - thickness / 2 - 0.025), 0.09, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.05, 0.18, depth - 0.2]} />
        </mesh>
      ))}
    </group>
  )
}
