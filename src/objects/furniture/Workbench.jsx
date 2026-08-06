export default function Workbench({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  width = 3.6,
  depth = 1.4,
  height = 0.9,
  topThickness = 0.12,
  topColor = '#9b7147',
  frameColor = '#343a40',
}) {
  const legHeight = height - topThickness
  const legY = legHeight / 2
  const topY = height - topThickness / 2
  const legInset = 0.18
  const legPositions = [
    [-width / 2 + legInset, legY, -depth / 2 + legInset],
    [width / 2 - legInset, legY, -depth / 2 + legInset],
    [-width / 2 + legInset, legY, depth / 2 - legInset],
    [width / 2 - legInset, legY, depth / 2 - legInset],
  ]

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, topY, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, topThickness, depth]} />
        <meshStandardMaterial color={topColor} roughness={0.78} />
      </mesh>

      {legPositions.map((legPosition) => (
        <mesh
          key={legPosition.join('-')}
          position={legPosition}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.12, legHeight, 0.12]} />
          <meshStandardMaterial color={frameColor} metalness={0.35} roughness={0.6} />
        </mesh>
      ))}

      <mesh position={[0, 0.28, -depth / 2 + legInset]} castShadow receiveShadow>
        <boxGeometry args={[width - legInset * 2, 0.1, 0.1]} />
        <meshStandardMaterial color={frameColor} metalness={0.35} roughness={0.6} />
      </mesh>
    </group>
  )
}
