function Indicator({ position, color }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.04, 0.04, 0.018]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.75} />
    </mesh>
  )
}

const portPositions = [-0.56, -0.4, -0.24, -0.08, 0.08, 0.24, 0.4, 0.56]

export default function SwitchUnit({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  width = 1.65,
  height = 0.18,
  depth = 0.44,
}) {
  const frontZ = depth / 2 + 0.012

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#1d2327" metalness={0.58} roughness={0.48} />
      </mesh>
      {portPositions.map((portX) => (
        <mesh key={portX} position={[portX, 0, frontZ]}>
          <boxGeometry args={[0.11, 0.065, 0.025]} />
          <meshStandardMaterial color="#080a0b" roughness={0.7} />
        </mesh>
      ))}
      <Indicator position={[0.67, 0.025, frontZ + 0.02]} color="#58a66b" />
      <Indicator position={[0.73, -0.025, frontZ + 0.02]} color="#d09542" />
    </group>
  )
}
