import { BoxGeometry, CylinderGeometry, MeshStandardMaterial } from 'three'
import {
  brushedMetalMaterial,
  darkPlasticMaterial,
  rubberMaterial,
  storageBinMaterial,
} from './labMaterials.js'

const boxGeometry = new BoxGeometry(1, 1, 1)
const cylinderGeometry = new CylinderGeometry(1, 1, 1, 16)
const cableJacketMaterial = new MeshStandardMaterial({
  color: '#276f98',
  roughness: 0.66,
})
const alcoholBottleMaterial = new MeshStandardMaterial({
  color: '#e5ece9',
  transparent: true,
  opacity: 0.72,
  roughness: 0.32,
  depthWrite: false,
})
const sleeveMaterial = new MeshStandardMaterial({
  color: '#c5d8d5',
  transparent: true,
  opacity: 0.56,
  roughness: 0.38,
  depthWrite: false,
})

function CableSpool() {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh
        geometry={cylinderGeometry}
        material={cableJacketMaterial}
        scale={[0.28, 0.17, 0.28]}
        castShadow
      />
      {[-0.19, 0.19].map((positionY) => (
        <mesh
          key={positionY}
          geometry={cylinderGeometry}
          material={darkPlasticMaterial}
          position={[0, positionY, 0]}
          scale={[0.36, 0.028, 0.36]}
          castShadow
        />
      ))}
      <mesh
        geometry={cylinderGeometry}
        material={rubberMaterial}
        position={[0, 0.22, 0]}
        scale={[0.06, 0.04, 0.06]}
      />
    </group>
  )
}

function PartsTray({ position }) {
  return (
    <group position={position}>
      <mesh
        geometry={boxGeometry}
        material={storageBinMaterial}
        position={[0, 0.035, 0]}
        scale={[0.56, 0.07, 0.34]}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={boxGeometry}
        material={darkPlasticMaterial}
        position={[0, 0.075, 0]}
        scale={[0.48, 0.018, 0.26]}
      />
      {[-0.15, 0, 0.15].map((positionX) => (
        <mesh
          key={positionX}
          geometry={boxGeometry}
          material={brushedMetalMaterial}
          position={[positionX, 0.09, 0]}
          scale={[0.012, 0.03, 0.24]}
        />
      ))}
    </group>
  )
}

function FiberSupplies({ workstationPosition }) {
  return (
    <group position={workstationPosition}>
      <group position={[1.45, 0.99, 0.35]}>
        <mesh
          geometry={cylinderGeometry}
          material={alcoholBottleMaterial}
          scale={[0.09, 0.18, 0.09]}
          castShadow
        />
        <mesh
          geometry={cylinderGeometry}
          material={storageBinMaterial}
          position={[0, 0.2, 0]}
          scale={[0.065, 0.04, 0.065]}
        />
      </group>
      <PartsTray position={[1.42, 0.935, -0.36]} />
      {[-0.12, 0, 0.12].map((positionZ) => (
        <mesh
          key={positionZ}
          geometry={cylinderGeometry}
          material={sleeveMaterial}
          position={[1.42, 1.03, positionZ - 0.36]}
          rotation={[0, 0, Math.PI / 2]}
          scale={[0.018, 0.14, 0.018]}
        />
      ))}
      <group position={[-1.45, 0.96, 0.5]}>
        <mesh
          geometry={boxGeometry}
          material={storageBinMaterial}
          position={[0, 0.09, 0]}
          scale={[0.38, 0.18, 0.3]}
          castShadow
        />
        <mesh
          geometry={boxGeometry}
          material={darkPlasticMaterial}
          position={[0, 0.19, 0]}
          scale={[0.33, 0.025, 0.25]}
        />
      </group>
    </group>
  )
}

export default function WorkbenchAccessories({
  rj45WorkbenchPosition,
  fiberWorkbenchPosition,
}) {
  return (
    <group>
      <group position={rj45WorkbenchPosition}>
        <group position={[-1.4, 1.03, 0.42]}>
          <CableSpool />
        </group>
        <PartsTray position={[1.42, 0.935, 0.46]} />
      </group>
      <FiberSupplies workstationPosition={fiberWorkbenchPosition} />
    </group>
  )
}
