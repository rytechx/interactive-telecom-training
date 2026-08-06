export default function Floor({ width = 20, depth = 20 }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  )
}
