import { BoxGeometry, CylinderGeometry, MeshStandardMaterial } from 'three'
import {
  brushedMetalMaterial,
  cartonMaterial,
  darkPlasticMaterial,
  powderCoatedMetalMaterial,
  rubberMaterial,
  safetyRedMaterial,
  safetyWhiteMaterial,
  storageBinMaterial,
} from './labMaterials.js'

const boxGeometry = new BoxGeometry(1, 1, 1)
const cylinderGeometry = new CylinderGeometry(1, 1, 1, 16)
const racewayMaterial = new MeshStandardMaterial({
  color: '#c8cbc7',
  roughness: 0.78,
})
const cableBlueMaterial = new MeshStandardMaterial({
  color: '#2f7e9b',
  roughness: 0.66,
})
const cableYellowMaterial = new MeshStandardMaterial({
  color: '#c79835',
  roughness: 0.68,
})

function BoxPart({
  position,
  rotation = [0, 0, 0],
  scale,
  material,
  castShadow = true,
  receiveShadow = true,
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

function Raceway({ roomDepth }) {
  const wallZ = -(roomDepth / 2 - 0.16)

  return (
    <group position={[0, 1.08, wallZ]}>
      <BoxPart scale={[15.2, 0.13, 0.08]} material={racewayMaterial} />
      <BoxPart
        position={[0, 0.028, 0.047]}
        scale={[15, 0.025, 0.02]}
        material={brushedMetalMaterial}
        castShadow={false}
      />
    </group>
  )
}

function WallServices({ roomDepth }) {
  const wallZ = -(roomDepth / 2 - 0.105)

  return (
    <group position={[0, 0, wallZ]}>
      {[-3.1, 2.3].map((xPosition) => (
        <group key={xPosition} position={[xPosition, 0.82, 0.055]}>
          <BoxPart scale={[0.32, 0.2, 0.045]} material={safetyWhiteMaterial} />
          {[-0.07, 0.07].map((offset) => (
            <group key={offset} position={[offset, 0, 0.03]}>
              <BoxPart
                position={[0, 0.025, 0]}
                scale={[0.045, 0.055, 0.02]}
                material={darkPlasticMaterial}
                castShadow={false}
              />
              <BoxPart
                position={[0, -0.042, 0]}
                scale={[0.045, 0.025, 0.02]}
                material={darkPlasticMaterial}
                castShadow={false}
              />
            </group>
          ))}
        </group>
      ))}
      <group position={[4.12, 0.83, 0.055]}>
        <BoxPart scale={[0.3, 0.22, 0.05]} material={safetyWhiteMaterial} />
        <BoxPart
          position={[0, 0, 0.034]}
          scale={[0.17, 0.1, 0.024]}
          material={storageBinMaterial}
          castShadow={false}
        />
        <BoxPart
          position={[0, 0.015, 0.05]}
          scale={[0.082, 0.025, 0.016]}
          material={darkPlasticMaterial}
          castShadow={false}
        />
      </group>
    </group>
  )
}

function SafetyStation({ roomDepth }) {
  const wallZ = -(roomDepth / 2 - 0.18)

  return (
    <group position={[-2.05, 0, wallZ]}>
      <group position={[0, 2.48, 0]}>
        <BoxPart scale={[0.78, 0.58, 0.045]} material={safetyWhiteMaterial} />
        <BoxPart
          position={[0, 0.13, 0.032]}
          scale={[0.58, 0.14, 0.018]}
          material={safetyRedMaterial}
          castShadow={false}
        />
        <BoxPart
          position={[0, -0.11, 0.032]}
          scale={[0.38, 0.035, 0.018]}
          material={darkPlasticMaterial}
          castShadow={false}
        />
      </group>
      <group position={[-0.62, 1.34, 0.15]}>
        <mesh
          geometry={cylinderGeometry}
          material={safetyRedMaterial}
          scale={[0.13, 0.44, 0.13]}
          castShadow
        />
        <mesh
          geometry={cylinderGeometry}
          material={darkPlasticMaterial}
          position={[0, 0.26, 0]}
          scale={[0.08, 0.09, 0.08]}
          castShadow
        />
        <BoxPart
          position={[0.12, 0.27, 0]}
          rotation={[0, 0, -0.55]}
          scale={[0.2, 0.035, 0.04]}
          material={darkPlasticMaterial}
        />
        <BoxPart
          position={[0, -0.3, 0]}
          scale={[0.34, 0.055, 0.18]}
          material={powderCoatedMetalMaterial}
        />
      </group>
    </group>
  )
}

function CableReel({ position, cableMaterial }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh
        geometry={cylinderGeometry}
        material={cableMaterial}
        scale={[0.24, 0.18, 0.24]}
        castShadow
      />
      {[-0.2, 0.2].map((yPosition) => (
        <mesh
          key={yPosition}
          geometry={cylinderGeometry}
          material={darkPlasticMaterial}
          position={[0, yPosition, 0]}
          scale={[0.34, 0.035, 0.34]}
          castShadow
        />
      ))}
      <mesh
        geometry={cylinderGeometry}
        material={rubberMaterial}
        position={[0, 0.24, 0]}
        scale={[0.055, 0.04, 0.055]}
      />
    </group>
  )
}

function SupplyShelf({ roomDepth }) {
  const shelfZ = -(roomDepth / 2 - 0.42)

  return (
    <group position={[-6.6, 0, shelfZ]}>
      {[-1.7, 1.7].map((xPosition) => (
        <BoxPart
          key={xPosition}
          position={[xPosition, 1.15, 0]}
          scale={[0.08, 2.3, 0.6]}
          material={powderCoatedMetalMaterial}
        />
      ))}
      {[0.18, 0.84, 1.5, 2.16].map((yPosition) => (
        <BoxPart
          key={yPosition}
          position={[0, yPosition, 0]}
          scale={[3.6, 0.075, 0.65]}
          material={powderCoatedMetalMaterial}
        />
      ))}
      <BoxPart
        position={[-1.03, 0.53, 0]}
        scale={[1.05, 0.46, 0.48]}
        material={cartonMaterial}
      />
      <BoxPart
        position={[0.72, 0.53, 0]}
        scale={[1.2, 0.4, 0.5]}
        material={storageBinMaterial}
      />
      <BoxPart
        position={[1.25, 1.16, 0]}
        scale={[0.72, 0.48, 0.48]}
        material={cartonMaterial}
      />
      <CableReel position={[-0.78, 1.83, 0]} cableMaterial={cableBlueMaterial} />
      <CableReel position={[0.2, 1.83, 0]} cableMaterial={cableYellowMaterial} />
    </group>
  )
}

function OverheadCableTray({ roomDepth }) {
  const trayZ = roomDepth / 2 - 0.24

  return (
    <group position={[-4.8, 3.26, trayZ]}>
      {[-0.16, 0.16].map((zPosition) => (
        <BoxPart
          key={zPosition}
          position={[0, 0, zPosition]}
          scale={[7.2, 0.08, 0.055]}
          material={brushedMetalMaterial}
        />
      ))}
      {[-3.3, -2.2, -1.1, 0, 1.1, 2.2, 3.3].map((xPosition) => (
        <BoxPart
          key={xPosition}
          position={[xPosition, 0, 0]}
          scale={[0.05, 0.055, 0.38]}
          material={brushedMetalMaterial}
        />
      ))}
      <BoxPart
        position={[0, 0.08, -0.07]}
        scale={[6.65, 0.06, 0.045]}
        material={cableBlueMaterial}
        castShadow={false}
      />
    </group>
  )
}

export default function LabEnvironmentProps({ depth = 20 }) {
  return (
    <group>
      <Raceway roomDepth={depth} />
      <WallServices roomDepth={depth} />
      <SafetyStation roomDepth={depth} />
      <SupplyShelf roomDepth={depth} />
      <OverheadCableTray roomDepth={depth} />
    </group>
  )
}
