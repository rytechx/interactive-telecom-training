function Indicator({ position, color }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.045, 0.045, 0.018]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
    </mesh>
  )
}

export default function RouterUnit({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  width = 1.65,
  height = 0.2,
  depth = 0.48,
}) {
  const frontZ = depth / 2 + 0.012

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#22282d" metalness={0.55} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, frontZ]} receiveShadow>
        <boxGeometry args={[width - 0.08, height * 0.58, 0.025]} />
        <meshStandardMaterial color="#111518" metalness={0.35} roughness={0.58} />
      </mesh>
      <Indicator position={[width * 0.3, 0, frontZ + 0.02]} color="#58a66b" />
      <Indicator position={[width * 0.37, 0, frontZ + 0.02]} color="#d09542" />
    </group>
  )
}
