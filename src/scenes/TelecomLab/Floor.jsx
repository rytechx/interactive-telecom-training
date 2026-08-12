import { industrialFloorMaterial } from './labMaterials.js'

export default function Floor({ width = 20, depth = 20 }) {
  return (
    <group>
      <mesh
        material={industrialFloorMaterial}
        position={[0, -0.035, 0]}
        receiveShadow
      >
        <boxGeometry args={[width, 0.07, depth]} />
      </mesh>
      <gridHelper
        args={[width, 20, '#788388', '#6a757a']}
        position={[0, 0.003, 0]}
        material-transparent
        material-opacity={0.16}
        material-depthWrite={false}
      />
    </group>
  )
}
