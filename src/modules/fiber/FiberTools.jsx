import {
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
} from 'three'
import { FIBER_TOOL_IDS } from './fiberToolConfigs.js'

const boxGeometry = new BoxGeometry(1, 1, 1)
const cylinderGeometry = new CylinderGeometry(1, 1, 1, 12)
const metalMaterial = new MeshStandardMaterial({
  color: '#5f6c72',
  metalness: 0.46,
  roughness: 0.44,
})
const darkMetalMaterial = new MeshStandardMaterial({
  color: '#2b353a',
  metalness: 0.3,
  roughness: 0.58,
})
const bladeMaterial = new MeshStandardMaterial({
  color: '#c6d0d3',
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
const rubberFootMaterial = new MeshStandardMaterial({
  color: '#12191c',
  metalness: 0,
  roughness: 0.9,
})
const softWhiteMaterial = new MeshStandardMaterial({
  color: '#edf0ec',
  roughness: 0.88,
})
const wipeFoldMaterial = new MeshStandardMaterial({
  color: '#d7ddda',
  roughness: 0.96,
})
const splicerMaterial = new MeshStandardMaterial({
  color: '#46555c',
  metalness: 0.12,
  roughness: 0.64,
})
const splicerTrimMaterial = new MeshStandardMaterial({
  color: '#56656c',
  metalness: 0.32,
  roughness: 0.42,
})
const controlAccentMaterial = new MeshStandardMaterial({
  color: '#3699aa',
  emissive: '#174d57',
  emissiveIntensity: 0.24,
  roughness: 0.46,
})
const screenMaterial = new MeshStandardMaterial({
  color: '#15252b',
  emissive: '#2b7a88',
  emissiveIntensity: 0.28,
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
const heaterChannelMaterial = new MeshStandardMaterial({
  color: '#11181c',
  metalness: 0.42,
  roughness: 0.46,
})
const heaterTrayMaterial = new MeshStandardMaterial({
  color: '#59676d',
  metalness: 0.5,
  roughness: 0.4,
})
const heaterIndicatorMaterial = new MeshStandardMaterial({
  color: '#a87535',
  emissive: '#a95d18',
  emissiveIntensity: 0.24,
  roughness: 0.4,
  toneMapped: false,
})
const sleeveOuterMaterial = new MeshStandardMaterial({
  color: '#d9f1ef',
  transparent: true,
  opacity: 0.44,
  depthWrite: false,
  roughness: 0.26,
})
const sleeveInnerMaterial = new MeshStandardMaterial({
  color: '#a8c9c5',
  transparent: true,
  opacity: 0.5,
  depthWrite: false,
  roughness: 0.4,
})
const sleeveHighlightMaterial = new MeshStandardMaterial({
  color: '#83e0ec',
  emissive: '#3b9caf',
  emissiveIntensity: 0.62,
  transparent: true,
  opacity: 0.28,
  depthWrite: false,
  wireframe: true,
  toneMapped: false,
})
const sleeveHitMaterial = new MeshStandardMaterial({
  transparent: true,
  opacity: 0,
  depthWrite: false,
})

function BoxPart({
  position,
  rotation = [0, 0, 0],
  scale,
  material,
  castShadow = true,
  receiveShadow = false,
  onPointerEnter,
  onPointerLeave,
  onClick,
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
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
    />
  )
}

function CylinderPart({
  partRef,
  position,
  rotation = [0, 0, 0],
  scale,
  material,
  castShadow = true,
  receiveShadow = false,
  onPointerEnter,
  onPointerLeave,
  onClick,
}) {
  return (
    <mesh
      ref={partRef}
      geometry={cylinderGeometry}
      material={material}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
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
          position={[0, 0.003, 0.405]}
          scale={[0.079, 0.07, 0.045]}
          material={rubberFootMaterial}
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
          position={[0, 0.003, 0.405]}
          scale={[0.079, 0.07, 0.045]}
          material={rubberFootMaterial}
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
      <CylinderPart
        position={[0, 0.057, -0.055]}
        scale={[0.018, 0.023, 0.018]}
        material={darkMetalMaterial}
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
          position={[0, 0.002, 0.365]}
          scale={[0.058, 0.056, 0.04]}
          material={rubberFootMaterial}
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
          position={[0, 0.002, 0.365]}
          scale={[0.058, 0.056, 0.04]}
          material={rubberFootMaterial}
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
      <CylinderPart
        position={[0, 0.054, -0.04]}
        scale={[0.014, 0.019, 0.014]}
        material={darkMetalMaterial}
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
        position={[0, 0.012, 0]}
        scale={[0.25, 0.024, 0.19]}
        material={softWhiteMaterial}
        receiveShadow
      />
      <BoxPart
        position={[0.055, 0.03, -0.035]}
        rotation={[0, 0.12, -0.03]}
        scale={[0.14, 0.012, 0.115]}
        material={softWhiteMaterial}
        castShadow={false}
      />
      <BoxPart
        position={[-0.058, 0.028, 0.045]}
        rotation={[0, -0.08, 0.02]}
        scale={[0.105, 0.008, 0.07]}
        material={wipeFoldMaterial}
        castShadow={false}
      />
      {[-0.065, 0.065].map((positionX) => (
        <BoxPart
          key={positionX}
          position={[positionX, 0.037, -0.015]}
          scale={[0.008, 0.004, 0.145]}
          material={wipeFoldMaterial}
          castShadow={false}
        />
      ))}
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
          material={splicerMaterial}
          receiveShadow
        />
        <BoxPart
          position={[0, 0.073, 0]}
          scale={[0.13, 0.012, 0.16]}
          material={softWhiteMaterial}
          castShadow={false}
        />
        <BoxPart
          position={[0, 0.081, 0.052]}
          scale={[0.085, 0.006, 0.025]}
          material={controlAccentMaterial}
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
        material={splicerMaterial}
        receiveShadow
      />
      <BoxPart
        position={[0, 0.028, 0.205]}
        scale={[0.46, 0.045, 0.035]}
        material={controlAccentMaterial}
        castShadow={false}
      />
      <BoxPart
        position={[0, 0.148, 0]}
        scale={[0.035, 0.018, 0.35]}
        material={bladeMaterial}
        castShadow={false}
      />
      <BoxPart
        position={[-0.17, 0.153, 0]}
        scale={[0.022, 0.012, 0.34]}
        material={softWhiteMaterial}
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
          material={splicerTrimMaterial}
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
          material={splicerTrimMaterial}
        />
        <BoxPart
          position={[0, 0.084, -0.14]}
          scale={[0.34, 0.012, 0.18]}
          material={darkMetalMaterial}
          castShadow={false}
        />
      </group>
      <CylinderPart
        position={[0, 0.18, 0.17]}
        rotation={[0, 0, Math.PI / 2]}
        scale={[0.025, 0.23, 0.025]}
        material={bladeMaterial}
      />
      <CylinderPart
        position={[0.205, 0.185, 0.17]}
        scale={[0.032, 0.028, 0.032]}
        material={controlAccentMaterial}
      />
      {[-1, 1].flatMap((sideX) =>
        [-1, 1].map((sideZ) => (
          <CylinderPart
            key={`${sideX}-${sideZ}`}
            position={[sideX * 0.21, -0.005, sideZ * 0.14]}
            scale={[0.025, 0.02, 0.025]}
            material={rubberFootMaterial}
            castShadow={false}
          />
        )),
      )}
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
  heaterCoverRef,
  heaterIndicatorRef,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <BoxPart
        position={[0, 0.115, 0]}
        scale={[1.36, 0.23, 0.72]}
        material={splicerMaterial}
        receiveShadow
      />
      <BoxPart
        position={[0, 0.245, 0.335]}
        scale={[1.16, 0.055, 0.05]}
        material={splicerTrimMaterial}
      />
      {[-1, 1].map((side) => (
        <group key={`side-detail-${side}`}>
          <BoxPart
            position={[side * 0.69, 0.14, 0]}
            scale={[0.055, 0.15, 0.46]}
            material={rubberFootMaterial}
          />
          <BoxPart
            position={[side * 0.68, 0.18, 0.05]}
            scale={[0.026, 0.065, 0.22]}
            material={controlAccentMaterial}
            castShadow={false}
          />
        </group>
      ))}
      <BoxPart
        position={[0, 0.265, -0.055]}
        scale={[1.2, 0.07, 0.56]}
        material={darkMetalMaterial}
      />
      <BoxPart
        position={[0, 0.325, -0.08]}
        scale={[0.56, 0.085, 0.3]}
        material={heaterChannelMaterial}
      />
      {[-0.075, -0.045].map((zPosition) => (
        <BoxPart
          key={zPosition}
          position={[0, 0.376, zPosition]}
          scale={[0.48, 0.012, 0.012]}
          material={bladeMaterial}
          castShadow={false}
        />
      ))}
      {[-1, 1].map((side) => (
        <group key={side}>
          <BoxPart
            position={[side * 0.46, 0.35, -0.04]}
            scale={[0.38, 0.07, 0.15]}
            material={splicerTrimMaterial}
          />
          <BoxPart
            position={[side * 0.46, 0.39, -0.04]}
            scale={[0.31, 0.018, 0.048]}
            material={softWhiteMaterial}
            castShadow={false}
          />
          <BoxPart
            position={[side * 0.46, 0.405, 0.025]}
            scale={[0.13, 0.012, 0.025]}
            material={controlAccentMaterial}
            castShadow={false}
          />
        </group>
      ))}
      <group ref={leftClampRef} position={[-0.47, 0.46, -0.035]}>
        <BoxPart
          position={[0, 0, 0]}
          scale={[0.27, 0.075, 0.17]}
          material={splicerTrimMaterial}
        />
        <BoxPart
          position={[0, -0.045, 0]}
          scale={[0.18, 0.018, 0.1]}
          material={rubberFootMaterial}
        />
        <BoxPart
          position={[-0.085, 0.044, 0]}
          scale={[0.055, 0.012, 0.105]}
          material={controlAccentMaterial}
          castShadow={false}
        />
      </group>
      <group ref={rightClampRef} position={[0.47, 0.46, -0.035]}>
        <BoxPart
          position={[0, 0, 0]}
          scale={[0.27, 0.075, 0.17]}
          material={splicerTrimMaterial}
        />
        <BoxPart
          position={[0, -0.045, 0]}
          scale={[0.18, 0.018, 0.1]}
          material={rubberFootMaterial}
        />
        <BoxPart
          position={[0.085, 0.044, 0]}
          scale={[0.055, 0.012, 0.105]}
          material={controlAccentMaterial}
          castShadow={false}
        />
      </group>
      {[-1, 1].map((side) => (
        <group key={`electrode-${side}`}>
          <CylinderPart
            position={[side * 0.155, 0.39, -0.075]}
            scale={[0.04, 0.025, 0.04]}
            material={splicerTrimMaterial}
          />
          <CylinderPart
            position={[side * 0.105, 0.42, -0.075]}
            rotation={[0, 0, side * 0.58]}
            scale={[0.012, 0.13, 0.012]}
            material={bladeMaterial}
          />
        </group>
      ))}
      <group ref={lidRef} position={[0, 0.41, -0.34]} rotation={[-1.02, 0, 0]}>
        {[-1, 1].map((side) => (
          <BoxPart
            key={side}
            position={[side * 0.385, 0.035, 0.27]}
            scale={[0.16, 0.07, 0.5]}
            material={splicerTrimMaterial}
          />
        ))}
        {[0.065, 0.475].map((zPosition) => (
          <BoxPart
            key={zPosition}
            position={[0, 0.035, zPosition]}
            scale={[0.61, 0.07, 0.1]}
            material={splicerTrimMaterial}
          />
        ))}
        <BoxPart
          position={[0, 0.074, 0.27]}
          scale={[0.57, 0.012, 0.3]}
          material={chamberWindowMaterial}
          castShadow={false}
        />
        <BoxPart
          position={[0, 0.092, 0.505]}
          scale={[0.32, 0.045, 0.055]}
          material={rubberFootMaterial}
        />
      </group>
      <CylinderPart
        position={[0, 0.405, -0.34]}
        rotation={[0, 0, Math.PI / 2]}
        scale={[0.04, 0.55, 0.04]}
        material={darkMetalMaterial}
      />
      <BoxPart
        position={[0, 0.285, 0.38]}
        rotation={[-0.3, 0, 0]}
        scale={[0.76, 0.16, 0.22]}
        material={darkMetalMaterial}
      />
      <BoxPart
        position={[-0.07, 0.35, 0.445]}
        rotation={[-0.3, 0, 0]}
        scale={[0.5, 0.028, 0.165]}
        material={rubberFootMaterial}
        castShadow={false}
      />
      <BoxPart
        position={[-0.07, 0.365, 0.45]}
        rotation={[-0.3, 0, 0]}
        scale={[0.43, 0.012, 0.13]}
        material={screenMaterial}
        castShadow={false}
      />
      <CylinderPart
        position={[0.49, 0.355, 0.445]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.052, 0.018, 0.052]}
        material={indicatorMaterial}
      />
      {[-0.5, 0.34, 0.42].map((positionX, index) => (
        <CylinderPart
          key={positionX}
          position={[positionX, 0.35, 0.445]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.026, 0.012, 0.026]}
          material={index === 0 ? orangeGripMaterial : controlAccentMaterial}
          castShadow={false}
        />
      ))}
      {[0.34, 0.42].map((positionX) => (
        <BoxPart
          key={`button-mark-${positionX}`}
          position={[positionX, 0.369, 0.448]}
          rotation={[-0.3, 0, 0]}
          scale={[0.009, 0.006, 0.038]}
          material={softWhiteMaterial}
          castShadow={false}
        />
      ))}
      <BoxPart
        position={[0, 0.292, -0.42]}
        scale={[1.02, 0.055, 0.25]}
        material={heaterTrayMaterial}
        receiveShadow
      />
      <BoxPart
        position={[0, 0.326, -0.42]}
        scale={[0.68, 0.018, 0.065]}
        material={heaterChannelMaterial}
        castShadow={false}
      />
      {[-0.44, 0.44].map((xPosition) => (
        <BoxPart
          key={xPosition}
          position={[xPosition, 0.335, -0.42]}
          scale={[0.15, 0.055, 0.12]}
          material={splicerTrimMaterial}
        />
      ))}
      <group
        ref={heaterCoverRef}
        position={[0, 0.345, -0.545]}
        rotation={[-1.02, 0, 0]}
      >
        <BoxPart
          position={[0, 0.04, 0.12]}
          scale={[1.02, 0.075, 0.25]}
          material={splicerTrimMaterial}
        />
        <BoxPart
          position={[0, 0.082, 0.12]}
          scale={[0.62, 0.012, 0.12]}
          material={chamberWindowMaterial}
          castShadow={false}
        />
      </group>
      <CylinderPart
        partRef={heaterIndicatorRef}
        position={[0.5, 0.352, -0.53]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.032, 0.012, 0.032]}
        material={heaterIndicatorMaterial}
        castShadow={false}
      />
      <BoxPart
        position={[0.59, 0.348, -0.42]}
        scale={[0.13, 0.025, 0.11]}
        material={orangeGripMaterial}
        castShadow={false}
      />
      <BoxPart
        position={[-0.55, 0.35, -0.42]}
        scale={[0.11, 0.018, 0.07]}
        material={controlAccentMaterial}
        castShadow={false}
      />
      {[-1, 1].flatMap((sideX) =>
        [-1, 1].map((sideZ) => (
          <CylinderPart
            key={`${sideX}-${sideZ}`}
            position={[sideX * 0.56, -0.025, sideZ * 0.25]}
            scale={[0.052, 0.035, 0.052]}
            material={rubberFootMaterial}
            castShadow={false}
          />
        )),
      )}
    </group>
  )
}

function FiberProtectionSleeve({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  outerTubeRef,
  innerTubeRef,
  reinforcementRodRef,
  highlighted = false,
  onPointerEnter,
  onPointerLeave,
  onClick,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <CylinderPart
        partRef={outerTubeRef}
        position={[0, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        scale={[0.068, 0.38, 0.068]}
        material={sleeveOuterMaterial}
        receiveShadow
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
      />
      <CylinderPart
        partRef={innerTubeRef}
        position={[0, -0.012, 0]}
        rotation={[0, 0, Math.PI / 2]}
        scale={[0.055, 0.34, 0.055]}
        material={sleeveInnerMaterial}
        castShadow={false}
      />
      <CylinderPart
        partRef={reinforcementRodRef}
        position={[0, 0.019, 0]}
        rotation={[0, 0, Math.PI / 2]}
        scale={[0.009, 0.35, 0.009]}
        material={bladeMaterial}
        castShadow={false}
      />
      {highlighted && (
        <CylinderPart
          position={[0, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          scale={[0.081, 0.4, 0.081]}
          material={sleeveHighlightMaterial}
          castShadow={false}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onClick={onClick}
        />
      )}
      {onClick && (
        <CylinderPart
          position={[0, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          scale={[0.12, 0.5, 0.12]}
          material={sleeveHitMaterial}
          castShadow={false}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onClick={onClick}
        />
      )}
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
