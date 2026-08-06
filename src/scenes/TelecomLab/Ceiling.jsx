export default function Ceiling({
  width = 20,
  depth = 20,
  height = 4,
  thickness = 0.2,
  color = '#ffffff',
}) {
  return (
    <mesh position={[0, height + thickness / 2, 0]} receiveShadow>
      <boxGeometry args={[width, thickness, depth]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  )
}
