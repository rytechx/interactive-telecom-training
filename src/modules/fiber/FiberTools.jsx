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
const indicatorMaterial = new MeshStandardMaterial({
  color: '#52c7ad',
  emissive: '#278b7b',
  emissiveIntensity: 0.42,
  roughness: 0.4,
})
const chamberWindowMaterial = new MeshStandardMaterial({
  color: '#8da8af',
  transparent: true,
  opacity: 0.42,
  depthWrite: false,
  metalness: 0.08,
  roughness: 0.2,
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
  leftHandleRef,
  rightHandleRef,
  leftJawRef,
  rightJawRef,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group
        ref={leftHandleRef}
        position={[-0.052, 0.02, 0.08]}
        rotation={[0, 0.11, 0]}
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
      <group
        ref={rightHandleRef}
        position={[0.052, 0.02, 0.08]}
        rotation={[0, -0.11, 0]}
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
      <CylinderPart
        position={[0, 0.052, -0.04]}
        scale={[0.035, 0.016, 0.035]}
        material={bladeMaterial}
      />
      <group ref={leftJawRef} position={[-0.04, 0.02, -0.205]}>
        <BoxPart
          position={[0, 0, 0]}
          scale={[0.07, 0.075, 0.14]}
          material={darkMetalMaterial}
        />
        <BoxPart
          position={[0.032, 0.043, -0.025]}
          scale={[0.012, 0.016, 0.065]}
          material={bladeMaterial}
        />
      </group>
      <group ref={rightJawRef} position={[0.04, 0.02, -0.205]}>
        <BoxPart
          position={[0, 0, 0]}
          scale={[0.07, 0.075, 0.14]}
          material={darkMetalMaterial}
        />
        <BoxPart
          position={[-0.032, 0.043, -0.025]}
          scale={[0.012, 0.016, 0.065]}
          material={bladeMaterial}
        />
      </group>
    </group>
  )
}

function FiberCleaningWipe({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <BoxPart
        position={[0, 0.016, 0]}
        scale={[0.24, 0.032, 0.18]}
        material={softWhiteMaterial}
        receiveShadow
      />
      <BoxPart
        position={[0.055, 0.034, -0.035]}
        rotation={[0, 0.12, 0]}
        scale={[0.13, 0.012, 0.11]}
        material={softWhiteMaterial}
        castShadow={false}
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
      <FiberCleaningWipe position={[-0.08, 0, 0.01]} />
      <group position={[0.13, 0, -0.02]}>
        <BoxPart
          position={[0, 0.035, 0]}
          scale={[0.18, 0.07, 0.22]}
          material={screenMaterial}
          receiveShadow
        />
        <BoxPart
          position={[0, 0.073, 0]}
          scale={[0.13, 0.012, 0.16]}
          material={softWhiteMaterial}
          castShadow={false}
        />
      </group>
    </group>
  )
}

function FiberCleaver({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  lidRef,
  clampRef,
  bladeRef,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <BoxPart
        position={[0, 0.07, 0]}
        scale={[0.54, 0.14, 0.42]}
        material={darkMetalMaterial}
        receiveShadow
      />
      <BoxPart
        position={[0, 0.148, 0]}
        scale={[0.035, 0.018, 0.35]}
        material={bladeMaterial}
        castShadow={false}
      />
      {[-0.16, -0.08, 0.08, 0.16].map((zPosition) => (
        <BoxPart
          key={zPosition}
          position={[0.17, 0.148, zPosition]}
          scale={[0.08, 0.012, 0.012]}
          material={bladeMaterial}
          castShadow={false}
        />
      ))}
      <group ref={clampRef} position={[0, 0.17, 0.055]}>
        <BoxPart
          position={[0, 0, 0]}
          scale={[0.2, 0.045, 0.12]}
          material={metalMaterial}
        />
        <BoxPart
          position={[0, -0.025, 0]}
          scale={[0.035, 0.012, 0.1]}
          material={softWhiteMaterial}
        />
      </group>
      <group ref={bladeRef} position={[-0.14, 0.175, -0.055]}>
        <BoxPart
          position={[0, 0, 0]}
          scale={[0.09, 0.055, 0.1]}
          material={orangeGripMaterial}
        />
        <BoxPart
          position={[0.052, -0.015, 0]}
          scale={[0.018, 0.028, 0.075]}
          material={bladeMaterial}
        />
      </group>
      <group ref={lidRef} position={[0, 0.17, 0.17]} rotation={[-0.28, 0, 0]}>
        <BoxPart
          position={[0, 0.045, -0.14]}
          scale={[0.46, 0.07, 0.28]}
          material={metalMaterial}
        />
        <BoxPart
          position={[0, 0.084, -0.14]}
          scale={[0.34, 0.012, 0.18]}
          material={darkMetalMaterial}
          castShadow={false}
        />
      </group>
    </group>
  )
}

function FusionSplicer({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  lidRef,
  leftClampRef,
  rightClampRef,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <BoxPart
        position={[0, 0.13, 0]}
        scale={[1.45, 0.26, 0.78]}
        material={splicerMaterial}
        receiveShadow
      />
      <BoxPart
        position={[0, 0.285, -0.07]}
        scale={[1.28, 0.08, 0.6]}
        material={darkMetalMaterial}
      />
      <BoxPart
        position={[0, 0.34, -0.08]}
        scale={[0.48, 0.08, 0.3]}
        material={metalMaterial}
      />
      {[-1, 1].map((side) => (
        <group key={side}>
          <BoxPart
            position={[side * 0.46, 0.35, -0.04]}
            scale={[0.42, 0.07, 0.14]}
            material={metalMaterial}
          />
          <BoxPart
            position={[side * 0.46, 0.39, -0.04]}
            scale={[0.34, 0.018, 0.045]}
            material={softWhiteMaterial}
            castShadow={false}
          />
        </group>
      ))}
      <group ref={leftClampRef} position={[-0.47, 0.46, -0.035]}>
        <BoxPart
          position={[0, 0, 0]}
          scale={[0.28, 0.08, 0.17]}
          material={darkMetalMaterial}
        />
        <BoxPart
          position={[0, -0.045, 0]}
          scale={[0.18, 0.018, 0.1]}
          material={softWhiteMaterial}
        />
      </group>
      <group ref={rightClampRef} position={[0.47, 0.46, -0.035]}>
        <BoxPart
          position={[0, 0, 0]}
          scale={[0.28, 0.08, 0.17]}
          material={darkMetalMaterial}
        />
        <BoxPart
          position={[0, -0.045, 0]}
          scale={[0.18, 0.018, 0.1]}
          material={softWhiteMaterial}
        />
      </group>
      {[-1, 1].map((side) => (
        <CylinderPart
          key={side}
          position={[side * 0.105, 0.42, -0.075]}
          rotation={[0, 0, side * 0.58]}
          scale={[0.013, 0.15, 0.013]}
          material={bladeMaterial}
        />
      ))}
      <group ref={lidRef} position={[0, 0.41, -0.34]} rotation={[-1.02, 0, 0]}>
        {[-1, 1].map((side) => (
          <BoxPart
            key={side}
            position={[side * 0.43, 0.035, 0.27]}
            scale={[0.22, 0.07, 0.52]}
            material={metalMaterial}
          />
        ))}
        {[0.07, 0.47].map((zPosition) => (
          <BoxPart
            key={zPosition}
            position={[0, 0.035, zPosition]}
            scale={[0.64, 0.07, 0.12]}
            material={metalMaterial}
          />
        ))}
        <BoxPart
          position={[0, 0.074, 0.27]}
          scale={[0.62, 0.012, 0.28]}
          material={chamberWindowMaterial}
          castShadow={false}
        />
      </group>
      <BoxPart
        position={[0, 0.29, 0.41]}
        rotation={[-0.38, 0, 0]}
        scale={[0.68, 0.16, 0.19]}
        material={darkMetalMaterial}
      />
      <BoxPart
        position={[-0.08, 0.355, 0.465]}
        rotation={[-0.38, 0, 0]}
        scale={[0.43, 0.018, 0.13]}
        material={screenMaterial}
        castShadow={false}
      />
      <CylinderPart
        position={[0.5, 0.36, 0.46]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.055, 0.018, 0.055]}
        material={indicatorMaterial}
      />
      {[-0.2, 0, 0.2].map((xPosition) => (
        <BoxPart
          key={xPosition}
          position={[xPosition, 0.16, -0.425]}
          scale={[0.16, 0.035, 0.12]}
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
  FiberCleaningWipe,
  FiberCleaver,
  FiberJacketStripper,
  FiberProtectionSleeve,
  FiberToolModel,
  FusionSplicer,
  PrecisionFiberStripper,
}
