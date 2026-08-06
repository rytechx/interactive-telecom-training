export default function StorageCabinet({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  width = 2,
  height = 2.4,
  depth = 0.7,
  color = '#737c82',
}) {
  const doorWidth = width / 2 - 0.06
  const frontZ = depth / 2 + 0.025

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} metalness={0.22} roughness={0.65} />
      </mesh>
      <mesh position={[-width / 4, height / 2, frontZ]} castShadow receiveShadow>
        <boxGeometry args={[doorWidth, height - 0.1, 0.05]} />
        <meshStandardMaterial color="#848d92" metalness={0.18} roughness={0.65} />
      </mesh>
      <mesh position={[width / 4, height / 2, frontZ]} castShadow receiveShadow>
        <boxGeometry args={[doorWidth, height - 0.1, 0.05]} />
        <meshStandardMaterial color="#848d92" metalness={0.18} roughness={0.65} />
      </mesh>
      <mesh position={[-0.1, height / 2, frontZ + 0.04]} castShadow>
        <boxGeometry args={[0.04, 0.3, 0.04]} />
        <meshStandardMaterial color="#252b2f" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.1, height / 2, frontZ + 0.04]} castShadow>
        <boxGeometry args={[0.04, 0.3, 0.04]} />
        <meshStandardMaterial color="#252b2f" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}
