import { ceilingMaterial } from './labMaterials.js'

export default function Ceiling({
  width = 20,
  depth = 20,
  height = 4,
  thickness = 0.2,
}) {
  return (
    <mesh
      material={ceilingMaterial}
      position={[0, height + thickness / 2, 0]}
      receiveShadow
    >
      <boxGeometry args={[width, thickness, depth]} />
    </mesh>
  )
}
