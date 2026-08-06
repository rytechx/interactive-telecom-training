export default function RJ45ToolSet({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[-0.3, 0, 0.08]}>
        <mesh position={[-0.08, 0.035, 0.06]} rotation={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[0.09, 0.07, 0.5]} />
          <meshStandardMaterial color="#365f86" roughness={0.68} />
        </mesh>
        <mesh position={[0.08, 0.035, 0.06]} rotation={[0, -0.12, 0]} castShadow>
          <boxGeometry args={[0.09, 0.07, 0.5]} />
          <meshStandardMaterial color="#365f86" roughness={0.68} />
        </mesh>
        <mesh position={[0, 0.06, -0.25]} castShadow receiveShadow>
          <boxGeometry args={[0.38, 0.12, 0.2]} />
          <meshStandardMaterial color="#333a3f" metalness={0.45} roughness={0.5} />
        </mesh>
      </group>

      <group position={[0.38, 0, 0.08]}>
        <mesh position={[-0.055, 0.03, 0.03]} rotation={[0, 0.14, 0]} castShadow>
          <boxGeometry args={[0.065, 0.06, 0.38]} />
          <meshStandardMaterial color="#b85b45" roughness={0.68} />
        </mesh>
        <mesh position={[0.055, 0.03, 0.03]} rotation={[0, -0.14, 0]} castShadow>
          <boxGeometry args={[0.065, 0.06, 0.38]} />
          <meshStandardMaterial color="#b85b45" roughness={0.68} />
        </mesh>
        <mesh position={[0, 0.05, -0.19]} castShadow receiveShadow>
          <boxGeometry args={[0.22, 0.1, 0.14]} />
          <meshStandardMaterial color="#30373c" metalness={0.4} roughness={0.52} />
        </mesh>
      </group>

      <mesh position={[0.58, 0.05, -0.33]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.1, 0.22]} />
        <meshStandardMaterial color="#c7d4d8" metalness={0.08} roughness={0.28} />
      </mesh>
    </group>
  )
}
