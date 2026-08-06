const portPositions = [-0.63, -0.49, -0.35, -0.21, -0.07, 0.07, 0.21, 0.35, 0.49, 0.63]

export default function PatchPanel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  width = 1.65,
  height = 0.16,
  depth = 0.35,
}) {
  const frontZ = depth / 2 + 0.012

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#252b30" metalness={0.5} roughness={0.5} />
      </mesh>
      {portPositions.map((portX) => (
        <mesh key={portX} position={[portX, 0, frontZ]}>
          <boxGeometry args={[0.09, 0.06, 0.025]} />
          <meshStandardMaterial color="#080a0b" roughness={0.72} />
        </mesh>
      ))}
    </group>
  )
}
