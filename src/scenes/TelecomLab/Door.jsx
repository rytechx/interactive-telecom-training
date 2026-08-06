export default function Door({
  roomDepth = 20,
  wallThickness = 0.2,
  width = 1.6,
  height = 2.4,
  thickness = 0.08,
  color = '#30373d',
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
      <mesh position={[0, height / 2, doorZ]} castShadow receiveShadow>
        <boxGeometry args={[width, height, thickness]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>

      <mesh
        position={[-(width / 2 + frameThickness / 2), height / 2, doorZ]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[frameThickness, height, thickness * 1.4]} />
        <meshStandardMaterial color="#171b1f" roughness={0.7} />
      </mesh>
      <mesh
        position={[width / 2 + frameThickness / 2, height / 2, doorZ]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[frameThickness, height, thickness * 1.4]} />
        <meshStandardMaterial color="#171b1f" roughness={0.7} />
      </mesh>
      <mesh
        position={[0, height + frameThickness / 2, doorZ]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[width + frameThickness * 2, frameThickness, thickness * 1.4]}
        />
        <meshStandardMaterial color="#171b1f" roughness={0.7} />
      </mesh>

      <mesh position={[width * 0.32, height * 0.5, doorZ + thickness]} castShadow>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#a8adb0" metalness={0.7} roughness={0.25} />
      </mesh>
    </group>
  )
}
