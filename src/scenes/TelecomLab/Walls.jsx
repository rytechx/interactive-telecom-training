function Wall({ position, size, color }) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  )
}

export default function Walls({
  width = 20,
  depth = 20,
  height = 4,
  thickness = 0.2,
  color = '#f1f0eb',
}) {
  const halfHeight = height / 2
  const wallX = width / 2 - thickness / 2
  const wallZ = depth / 2 - thickness / 2

  return (
    <group>
      <Wall
        position={[0, halfHeight, -wallZ]}
        size={[width, height, thickness]}
        color={color}
      />
      <Wall
        position={[0, halfHeight, wallZ]}
        size={[width, height, thickness]}
        color={color}
      />
      <Wall
        position={[-wallX, halfHeight, 0]}
        size={[thickness, height, depth]}
        color={color}
      />
      <Wall
        position={[wallX, halfHeight, 0]}
        size={[thickness, height, depth]}
        color={color}
      />
    </group>
  )
}
