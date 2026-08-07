import {
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
} from 'three'
import { FIBER_TOOL_IDS } from './fiberToolConfigs.js'

const boxGeometry = new BoxGeometry(1, 1, 1)
const cylinderGeometry = new CylinderGeometry(1, 1, 1, 12)
const metalMaterial = new MeshStandardMaterial({
  color: '#313a40',
  metalness: 0.58,
  roughness: 0.42,
})
const darkMetalMaterial = new MeshStandardMaterial({
  color: '#1c2328',
  metalness: 0.48,
  roughness: 0.52,
})
const bladeMaterial = new MeshStandardMaterial({
  color: '#bac4c9',
  metalness: 0.78,
  roughness: 0.28,
})
const blueGripMaterial = new MeshStandardMaterial({
  color: '#327da4',
  roughness: 0.68,
})
const orangeGripMaterial = new MeshStandardMaterial({
  color: '#d06a35',
  roughness: 0.7,
})
const softWhiteMaterial = new MeshStandardMaterial({
  color: '#e8ece8',
  roughness: 0.88,
})
const splicerMaterial = new MeshStandardMaterial({
  color: '#48545b',
  metalness: 0.2,
  roughness: 0.58,
})
const screenMaterial = new MeshStandardMaterial({
  color: '#15252b',
  emissive: '#2b7a88',
  emissiveIntensity: 0.34,
  roughness: 0.32,
})
const sleeveMaterial = new MeshStandardMaterial({
  color: '#dce6df',
  transparent: true,
  opacity: 0.74,
  roughness: 0.36,
})

function BoxPart({
  position,
  rotation = [0, 0, 0],
  scale,
  material,
  castShadow = true,
  receiveShadow = false,
}) {
  return (
    <mesh
      geometry={boxGeometry}
      material={material}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  )
}

function CylinderPart({
  position,
  rotation = [0, 0, 0],
  scale,
  material,
  castShadow = true,
}) {
  return (
    <mesh
      geometry={cylinderGeometry}
      material={material}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow={castShadow}
    />
  )
}

function FiberJacketStripper({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  leftHandleRef,
  rightHandleRef,
  leftJawRef,
  rightJawRef,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group
        ref={leftHandleRef}
        position={[-0.075, 0.02, 0.12]}
        rotation={[0, 0.16, 0]}
      >
        <BoxPart
          position={[0, 0, 0.14]}
          scale={[0.075, 0.065, 0.5]}
          material={blueGripMaterial}
        />
        <BoxPart
          position={[0, 0.006, -0.16]}
          scale={[0.055, 0.055, 0.2]}
          material={metalMaterial}
        />
      </group>
      <group
        ref={rightHandleRef}
        position={[0.075, 0.02, 0.12]}
        rotation={[0, -0.16, 0]}
      >
        <BoxPart
          position={[0, 0, 0.14]}
          scale={[0.075, 0.065, 0.5]}
          material={blueGripMaterial}
        />
        <BoxPart
          position={[0, 0.006, -0.16]}
          scale={[0.055, 0.055, 0.2]}
          material={metalMaterial}
        />
      </group>
      <CylinderPart
        position={[0, 0.055, -0.055]}
        scale={[0.042, 0.02, 0.042]}
        material={bladeMaterial}
      />
      <group ref={leftJawRef} position={[-0.064, 0.025, -0.19]}>
        <BoxPart
          position={[0, 0, 0]}
          scale={[0.08, 0.09, 0.18]}
          material={darkMetalMaterial}
        />
        <BoxPart
          position={[0.042, 0.002, -0.02]}
          scale={[0.018, 0.06, 0.08]}
          material={bladeMaterial}
        />
      </group>
      <group ref={rightJawRef} position={[0.064, 0.025, -0.19]}>
        <BoxPart
          position={[0, 0, 0]}
          scale={[0.08, 0.09, 0.18]}
          material={darkMetalMaterial}
        />
        <BoxPart
          position={[-0.042, 0.002, -0.02]}
          scale={[0.018, 0.06, 0.08]}
          material={bladeMaterial}
        />
      </group>
    </group>
  )
}

function PrecisionFiberStripper({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * 0.052, 0.02, 0.08]}
          rotation={[0, side * -0.11, 0]}
        >
          <BoxPart
            position={[0, 0, 0.15]}
            scale={[0.055, 0.052, 0.43]}
            material={orangeGripMaterial}
          />
          <BoxPart
            position={[0, 0.003, -0.14]}
            scale={[0.04, 0.05, 0.18]}
            material={metalMaterial}
          />
        </group>
      ))}
      <CylinderPart
        position={[0, 0.052, -0.04]}
        scale={[0.035, 0.016, 0.035]}
        material={bladeMaterial}
      />
      <BoxPart
        position={[0, 0.02, -0.205]}
        scale={[0.16, 0.075, 0.13]}
        material={darkMetalMaterial}
      />
      <CylinderPart
        position={[0, 0.062, -0.23]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.025, 0.06, 0.025]}
        material={bladeMaterial}
      />
    </group>
  )
}

function FiberCleaningPad({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <BoxPart
        position={[0, 0.018, 0]}
        scale={[0.38, 0.036, 0.28]}
        material={softWhiteMaterial}
        receiveShadow
      />
      <BoxPart
        position={[0, 0.039, 0]}
        scale={[0.31, 0.01, 0.21]}
        material={screenMaterial}
        castShadow={false}
      />
    </group>
  )
}

function FiberCleaver({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <BoxPart
        position={[0, 0.065, 0]}
        scale={[0.48, 0.13, 0.38]}
        material={darkMetalMaterial}
        receiveShadow
      />
      <BoxPart
        position={[0, 0.145, -0.035]}
        scale={[0.4, 0.055, 0.25]}
        material={metalMaterial}
      />
      <BoxPart
        position={[0, 0.18, -0.03]}
        scale={[0.025, 0.025, 0.24]}
        material={bladeMaterial}
      />
      <BoxPart
        position={[0.16, 0.18, 0.11]}
        scale={[0.08, 0.025, 0.06]}
        material={orangeGripMaterial}
      />
    </group>
  )
}

function FusionSplicer({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <BoxPart
        position={[0, 0.13, 0]}
        scale={[0.78, 0.26, 0.5]}
        material={splicerMaterial}
        receiveShadow
      />
      <BoxPart
        position={[0, 0.29, -0.07]}
        rotation={[-0.22, 0, 0]}
        scale={[0.52, 0.045, 0.25]}
        material={darkMetalMaterial}
      />
      <BoxPart
        position={[0, 0.32, -0.095]}
        rotation={[-0.22, 0, 0]}
        scale={[0.39, 0.012, 0.15]}
        material={screenMaterial}
        castShadow={false}
      />
      <BoxPart
        position={[0, 0.29, 0.16]}
        scale={[0.46, 0.14, 0.17]}
        material={darkMetalMaterial}
      />
      {[-1, 1].map((side) => (
        <BoxPart
          key={side}
          position={[side * 0.19, 0.37, 0.16]}
          scale={[0.1, 0.04, 0.09]}
          material={bladeMaterial}
        />
      ))}
    </group>
  )
}

function FiberProtectionSleeve({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <CylinderPart
        position={[0, 0.028, 0]}
        rotation={[0, 0, Math.PI / 2]}
        scale={[0.025, 0.34, 0.025]}
        material={sleeveMaterial}
      />
      <CylinderPart
        position={[0, 0.028, 0]}
        rotation={[0, 0, Math.PI / 2]}
        scale={[0.008, 0.35, 0.008]}
        material={bladeMaterial}
        castShadow={false}
      />
    </group>
  )
}

function FiberToolModel({ toolId, ...props }) {
  if (toolId === FIBER_TOOL_IDS.JACKET_STRIPPER) {
    return <FiberJacketStripper {...props} />
  }

  if (toolId === FIBER_TOOL_IDS.PRECISION_STRIPPER) {
    return <PrecisionFiberStripper {...props} />
  }

  if (toolId === FIBER_TOOL_IDS.CLEANING_PAD) {
    return <FiberCleaningPad {...props} />
  }

  if (toolId === FIBER_TOOL_IDS.CLEAVER) {
    return <FiberCleaver {...props} />
  }

  if (toolId === FIBER_TOOL_IDS.FUSION_SPLICER) {
    return <FusionSplicer {...props} />
  }

  if (toolId === FIBER_TOOL_IDS.PROTECTION_SLEEVE) {
    return <FiberProtectionSleeve {...props} />
  }

  return null
}

export {
  FiberCleaningPad,
  FiberCleaver,
  FiberJacketStripper,
  FiberProtectionSleeve,
  FiberToolModel,
  FusionSplicer,
  PrecisionFiberStripper,
}
