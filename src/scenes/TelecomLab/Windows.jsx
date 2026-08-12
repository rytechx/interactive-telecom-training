import {
  glassMaterial,
  powderCoatedMetalMaterial,
} from './labMaterials.js'

function Window({ position, width, height, frameDepth, frameThickness }) {
  const paneWidth = width - frameThickness * 2
  const paneHeight = height - frameThickness * 2

  return (
    <group position={position}>
      <mesh material={glassMaterial} receiveShadow>
        <boxGeometry args={[frameDepth * 0.32, paneHeight, paneWidth]} />
      </mesh>

      <mesh material={powderCoatedMetalMaterial} position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[frameDepth, frameThickness, width]} />
      </mesh>
      <mesh material={powderCoatedMetalMaterial} position={[0, -height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[frameDepth, frameThickness, width]} />
      </mesh>
      <mesh material={powderCoatedMetalMaterial} position={[0, 0, width / 2]} castShadow receiveShadow>
        <boxGeometry args={[frameDepth, height, frameThickness]} />
      </mesh>
      <mesh material={powderCoatedMetalMaterial} position={[0, 0, -width / 2]} castShadow receiveShadow>
        <boxGeometry args={[frameDepth, height, frameThickness]} />
      </mesh>
      <mesh material={powderCoatedMetalMaterial} castShadow receiveShadow>
        <boxGeometry args={[frameDepth, height, frameThickness * 0.75]} />
      </mesh>
      <mesh
        material={powderCoatedMetalMaterial}
        position={[-frameDepth * 0.35, -height / 2 - 0.065, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[frameDepth * 1.8, 0.08, width + 0.18]} />
      </mesh>
    </group>
  )
}

export default function Windows({
  roomWidth = 20,
  wallThickness = 0.2,
  width = 3.2,
  height = 1.5,
  sillHeight = 1.15,
}) {
  const frameDepth = 0.1
  const frameThickness = 0.12
  const windowX = roomWidth / 2 - wallThickness - frameDepth / 2 - 0.01
  const windowY = sillHeight + height / 2

  return (
    <group>
      <Window
        position={[windowX, windowY, -3.5]}
        width={width}
        height={height}
        frameDepth={frameDepth}
        frameThickness={frameThickness}
      />
      <Window
        position={[windowX, windowY, 3.5]}
        width={width}
        height={height}
        frameDepth={frameDepth}
        frameThickness={frameThickness}
      />
    </group>
  )
}
