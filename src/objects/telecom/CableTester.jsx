export default function CableTester({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  color = '#d69a35',
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.32, 0.14, 0.5]} />
        <meshStandardMaterial color={color} roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.145, -0.04]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.025, 0.22]} />
        <meshStandardMaterial color="#28363d" metalness={0.15} roughness={0.35} />
      </mesh>
      <mesh position={[-0.07, 0.165, 0.15]}>
        <cylinderGeometry args={[0.018, 0.018, 0.018, 8]} />
        <meshStandardMaterial color="#58a66b" emissive="#58a66b" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.01, 0.165, 0.15]}>
        <cylinderGeometry args={[0.018, 0.018, 0.018, 8]} />
        <meshStandardMaterial color="#d09542" emissive="#d09542" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}
