import {
  powderCoatedMetalMaterial,
  rubberMaterial,
} from '../../scenes/TelecomLab/labMaterials.js'

export default function Stool({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  height = 0.65,
}) {
  const seatThickness = 0.12
  const supportHeight = height - seatThickness

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh
        material={rubberMaterial}
        position={[0, height - seatThickness / 2, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.32, 0.32, seatThickness, 16]} />
      </mesh>
      <mesh
        material={powderCoatedMetalMaterial}
        position={[0, supportHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.055, 0.07, supportHeight, 12]} />
      </mesh>
      <mesh
        material={powderCoatedMetalMaterial}
        position={[0, 0.04, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.27, 0.3, 0.08, 16]} />
      </mesh>
      <mesh
        material={powderCoatedMetalMaterial}
        position={[0, 0.28, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.55, 0.05, 0.08]} />
      </mesh>
    </group>
  )
}
