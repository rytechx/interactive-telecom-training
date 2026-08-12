import { BoxGeometry } from 'three'
import {
  laminatedBenchMaterial,
  powderCoatedMetalMaterial,
  rubberMaterial,
} from '../../scenes/TelecomLab/labMaterials.js'

const boxGeometry = new BoxGeometry(1, 1, 1)

export default function Workbench({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  width = 3.6,
  depth = 1.4,
  height = 0.9,
  topThickness = 0.12,
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
      <mesh
        geometry={boxGeometry}
        material={laminatedBenchMaterial}
        position={[0, topY, 0]}
        scale={[width, topThickness, depth]}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={boxGeometry}
        material={powderCoatedMetalMaterial}
        position={[0, topY - topThickness / 2 - 0.035, 0]}
        scale={[width - 0.12, 0.07, depth - 0.1]}
        castShadow
        receiveShadow
      />

      {legPositions.map((legPosition) => (
        <group key={legPosition.join('-')} position={legPosition}>
          <mesh
            geometry={boxGeometry}
            material={powderCoatedMetalMaterial}
            scale={[0.12, legHeight, 0.12]}
            castShadow
            receiveShadow
          />
          <mesh
            geometry={boxGeometry}
            material={rubberMaterial}
            position={[0, -legHeight / 2 + 0.025, 0]}
            scale={[0.17, 0.05, 0.17]}
            receiveShadow
          />
        </group>
      ))}

      <mesh
        geometry={boxGeometry}
        material={powderCoatedMetalMaterial}
        position={[0, 0.28, -depth / 2 + legInset]}
        scale={[width - legInset * 2, 0.1, 0.1]}
        castShadow
        receiveShadow
      />
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          geometry={boxGeometry}
          material={powderCoatedMetalMaterial}
          position={[side * (width / 2 - legInset), 0.42, 0]}
          scale={[0.08, 0.08, depth - legInset * 2]}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  )
}
