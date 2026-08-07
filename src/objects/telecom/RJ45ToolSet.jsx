import {
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
} from 'three'
import RJ45ConnectorModel from '../../modules/rj45/RJ45ConnectorModel.jsx'

const toolBoxGeometry = new BoxGeometry(1, 1, 1)
const toolCylinderGeometry = new CylinderGeometry(1, 1, 1, 12)
const steelMaterial = new MeshStandardMaterial({
  color: '#3a4248',
  metalness: 0.52,
  roughness: 0.5,
})
const darkSteelMaterial = new MeshStandardMaterial({
  color: '#23292e',
  metalness: 0.58,
  roughness: 0.46,
})
const gripMaterial = new MeshStandardMaterial({
  color: '#9a4439',
  metalness: 0.04,
  roughness: 0.8,
})
const stripperGripMaterial = new MeshStandardMaterial({
  color: '#b85b45',
  metalness: 0.04,
  roughness: 0.68,
})
const stripperHeadMaterial = new MeshStandardMaterial({
  color: '#30373c',
  metalness: 0.4,
  roughness: 0.52,
})
const bladeMaterial = new MeshStandardMaterial({
  color: '#a7b0b5',
  metalness: 0.74,
  roughness: 0.32,
})
const pivotMaterial = new MeshStandardMaterial({
  color: '#77838a',
  metalness: 0.76,
  roughness: 0.3,
})

function ToolPart({
  position,
  rotation = [0, 0, 0],
  scale,
  material,
  castShadow = true,
  receiveShadow = false,
}) {
  return (
    <mesh
      geometry={toolBoxGeometry}
      material={material}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  )
}

function CrimpingTool({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  leftHandleRef,
  rightHandleRef,
  upperJawRef,
  lowerJawRef,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group
        ref={leftHandleRef}
        position={[-0.105, 0, 0]}
        rotation={[0, -0.16, 0]}
      >
        <ToolPart
          position={[0, 0, -0.13]}
          scale={[0.065, 0.058, 0.28]}
          material={steelMaterial}
        />
        <ToolPart
          position={[0, 0, 0.34]}
          scale={[0.05, 0.052, 0.7]}
          material={steelMaterial}
        />
        <ToolPart
          position={[0, 0, 0.47]}
          scale={[0.058, 0.062, 0.46]}
          material={gripMaterial}
        />
        <ToolPart
          position={[0, 0, 0.7]}
          scale={[0.064, 0.068, 0.035]}
          material={gripMaterial}
        />
      </group>

      <group
        ref={rightHandleRef}
        position={[0.105, 0, 0]}
        rotation={[0, 0.16, 0]}
      >
        <ToolPart
          position={[0, 0, -0.13]}
          scale={[0.065, 0.058, 0.28]}
          material={steelMaterial}
        />
        <ToolPart
          position={[0, 0, 0.34]}
          scale={[0.05, 0.052, 0.7]}
          material={steelMaterial}
        />
        <ToolPart
          position={[0, 0, 0.47]}
          scale={[0.058, 0.062, 0.46]}
          material={gripMaterial}
        />
        <ToolPart
          position={[0, 0, 0.7]}
          scale={[0.064, 0.068, 0.035]}
          material={gripMaterial}
        />
      </group>

      <mesh
        geometry={toolCylinderGeometry}
        material={pivotMaterial}
        position={[0, 0.006, 0]}
        scale={[0.075, 0.072, 0.075]}
        castShadow
      />
      <mesh
        geometry={toolCylinderGeometry}
        material={darkSteelMaterial}
        position={[0, 0.083, 0]}
        scale={[0.038, 0.01, 0.038]}
      />
      <mesh
        geometry={toolCylinderGeometry}
        material={darkSteelMaterial}
        position={[0, -0.071, 0]}
        scale={[0.038, 0.01, 0.038]}
      />

      {[-1, 1].map((side) => (
        <ToolPart
          key={side}
          position={[side * 0.15, 0.006, -0.34]}
          scale={[0.036, 0.2, 0.4]}
          material={steelMaterial}
          receiveShadow
        />
      ))}

      <ToolPart
        position={[0, 0.006, -0.19]}
        scale={[0.28, 0.16, 0.055]}
        material={darkSteelMaterial}
        receiveShadow
      />

      <group ref={upperJawRef} position={[0, 0.115, 0]}>
        <ToolPart
          position={[0, 0, -0.39]}
          scale={[0.32, 0.05, 0.3]}
          material={steelMaterial}
          receiveShadow
        />
        <ToolPart
          position={[0, -0.03, -0.42]}
          scale={[0.22, 0.016, 0.12]}
          material={bladeMaterial}
        />
        <ToolPart
          position={[0, -0.022, -0.26]}
          scale={[0.28, 0.018, 0.035]}
          material={darkSteelMaterial}
        />
      </group>

      <group ref={lowerJawRef} position={[0, -0.1, 0]}>
        <ToolPart
          position={[0, 0, -0.39]}
          scale={[0.32, 0.04, 0.3]}
          material={darkSteelMaterial}
          receiveShadow
        />
        <ToolPart
          position={[0, 0.026, -0.42]}
          scale={[0.22, 0.016, 0.12]}
          material={bladeMaterial}
        />
        <ToolPart
          position={[0, 0.018, -0.26]}
          scale={[0.28, 0.018, 0.035]}
          material={steelMaterial}
        />
      </group>

      <ToolPart
        position={[-0.126, 0.006, -0.43]}
        scale={[0.022, 0.16, 0.15]}
        material={darkSteelMaterial}
      />
      <ToolPart
        position={[0.126, 0.006, -0.43]}
        scale={[0.022, 0.16, 0.15]}
        material={darkSteelMaterial}
      />
      <ToolPart
        position={[0, 0.006, -0.548]}
        scale={[0.29, 0.05, 0.026]}
        material={darkSteelMaterial}
        receiveShadow
      />
      <ToolPart
        position={[0, 0.006, -0.515]}
        scale={[0.235, 0.018, 0.025]}
        material={bladeMaterial}
      />
      <ToolPart
        position={[0, 0, -0.08]}
        scale={[0.17, 0.014, 0.045]}
        material={bladeMaterial}
      />
    </group>
  )
}

function WireStripper({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  leftHandleRef,
  rightHandleRef,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh
        ref={leftHandleRef}
        geometry={toolBoxGeometry}
        material={stripperGripMaterial}
        position={[-0.055, 0.03, 0.03]}
        rotation={[0, 0.14, 0]}
        scale={[0.065, 0.06, 0.38]}
        castShadow
      />
      <mesh
        ref={rightHandleRef}
        geometry={toolBoxGeometry}
        material={stripperGripMaterial}
        position={[0.055, 0.03, 0.03]}
        rotation={[0, -0.14, 0]}
        scale={[0.065, 0.06, 0.38]}
        castShadow
      />
      <mesh
        geometry={toolBoxGeometry}
        material={stripperHeadMaterial}
        position={[0, 0.05, -0.19]}
        scale={[0.22, 0.1, 0.14]}
        castShadow
        receiveShadow
      />
      {[-1, 1].map((side) => (
        <ToolPart
          key={side}
          position={[side * 0.057, 0.104, -0.225]}
          scale={[0.082, 0.012, 0.048]}
          material={bladeMaterial}
        />
      ))}
      <mesh
        geometry={toolCylinderGeometry}
        material={pivotMaterial}
        position={[0, 0.108, -0.15]}
        scale={[0.028, 0.012, 0.028]}
      />
    </group>
  )
}

function RJ45Connector({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RJ45ConnectorModel
        scale={[0.65, 0.65, 0.5]}
      />
    </group>
  )
}

export default function RJ45ToolSet({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <CrimpingTool position={[-0.3, 0, 0.08]} />
      <WireStripper position={[0.38, 0, 0.08]} />
      <RJ45Connector position={[0.58, 0.05, -0.33]} />
    </group>
  )
}

export { CrimpingTool, RJ45Connector, WireStripper }
