import PatchPanel from './PatchPanel.jsx'
import RouterUnit from './RouterUnit.jsx'
import SwitchUnit from './SwitchUnit.jsx'

export default function NetworkRack({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  width = 2,
  height = 2.5,
  depth = 1,
}) {
  const postX = width / 2 - 0.08
  const postZ = depth / 2 - 0.08
  const postPositions = [
    [-postX, height / 2, -postZ],
    [postX, height / 2, -postZ],
    [-postX, height / 2, postZ],
    [postX, height / 2, postZ],
  ]

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

      <RouterUnit position={[0, 1.62, 0.16]} />
      <SwitchUnit position={[0, 1.31, 0.18]} />
      <PatchPanel position={[0, 1.02, 0.22]} />
    </group>
  )
}
