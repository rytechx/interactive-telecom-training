export default function Stool({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  height = 0.65,
  color = '#3f474d',
}) {
  const seatThickness = 0.12
  const supportHeight = height - seatThickness

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, height - seatThickness / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.32, seatThickness, 16]} />
        <meshStandardMaterial color={color} roughness={0.72} />
      </mesh>
      <mesh position={[0, supportHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.055, 0.07, supportHeight, 12]} />
        <meshStandardMaterial color="#2f3539" metalness={0.45} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.27, 0.3, 0.08, 16]} />
        <meshStandardMaterial color="#2f3539" metalness={0.45} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.05, 0.08]} />
        <meshStandardMaterial color="#2f3539" metalness={0.45} roughness={0.5} />
      </mesh>
    </group>
  )
}
