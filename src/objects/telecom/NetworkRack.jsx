export default function NetworkRack({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  width = 2.05,
  height = 2.85,
  depth = 0.9,
  children,
}) {
  const postX = width / 2 - 0.08
  const postZ = depth / 2 - 0.08
  const postPositions = [
    [-postX, height / 2, -postZ],
    [postX, height / 2, -postZ],
    [-postX, height / 2, postZ],
    [postX, height / 2, postZ],
  ]
  const railHolePositions = Array.from(
    { length: 12 },
    (_, index) => 0.28 + index * 0.2,
  )

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.12, depth]} />
        <meshStandardMaterial color="#1d2327" metalness={0.65} roughness={0.45} />
      </mesh>
      <mesh position={[0, height - 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.12, depth]} />
        <meshStandardMaterial color="#1d2327" metalness={0.65} roughness={0.45} />
      </mesh>
      <mesh position={[0, height / 2, -depth / 2 + 0.035]} receiveShadow>
        <boxGeometry args={[width - 0.2, height - 0.2, 0.07]} />
        <meshStandardMaterial color="#171c20" metalness={0.5} roughness={0.55} />
      </mesh>

      {postPositions.map((postPosition) => (
        <mesh
          key={postPosition.join('-')}
          position={postPosition}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.12, height, 0.12]} />
          <meshStandardMaterial color="#2b3237" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}

      {[-width / 2 + 0.11, width / 2 - 0.11].map((railX) => (
        <group key={railX} position={[railX, 0, depth / 2 + 0.005]}>
          <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.1, height - 0.22, 0.065]} />
            <meshStandardMaterial
              color="#333c42"
              metalness={0.75}
              roughness={0.38}
            />
          </mesh>
          {railHolePositions.map((holeY) => (
            <mesh key={holeY} position={[0, holeY, 0.038]}>
              <boxGeometry args={[0.035, 0.035, 0.012]} />
              <meshStandardMaterial color="#080b0d" roughness={0.75} />
            </mesh>
          ))}
        </group>
      ))}

      {children}
    </group>
  )
}
