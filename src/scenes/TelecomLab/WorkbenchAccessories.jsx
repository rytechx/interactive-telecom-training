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
const bottleLabelMaterial = new MeshStandardMaterial({
  color: '#3b8796',
  roughness: 0.58,
})
const wipePackMaterial = new MeshStandardMaterial({
  color: '#e4e9e6',
  roughness: 0.9,
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
      <group position={[1.25, 1.08, 0.38]}>
        <mesh
          geometry={cylinderGeometry}
          material={alcoholBottleMaterial}
          scale={[0.075, 0.12, 0.075]}
          castShadow
        />
        <mesh
          geometry={cylinderGeometry}
          material={storageBinMaterial}
          position={[0, 0.16, 0]}
          scale={[0.055, 0.035, 0.055]}
        />
        <mesh
          geometry={cylinderGeometry}
          material={bottleLabelMaterial}
          position={[0, -0.025, 0]}
          scale={[0.078, 0.045, 0.078]}
        />
        <mesh
          geometry={boxGeometry}
          material={darkPlasticMaterial}
          position={[0.045, 0.205, 0]}
          scale={[0.09, 0.025, 0.035]}
        />
      </group>
      <PartsTray position={[1.24, 0.94, -0.34]} />
      {[-0.12, 0, 0.12].map((positionZ) => (
        <mesh
          key={positionZ}
          geometry={cylinderGeometry}
          material={sleeveMaterial}
          position={[1.24, 1.035, positionZ - 0.34]}
          rotation={[0, 0, Math.PI / 2]}
          scale={[0.018, 0.14, 0.018]}
        />
      ))}
      <group position={[0.94, 0.962, 0.35]}>
        <mesh
          geometry={boxGeometry}
          material={wipePackMaterial}
          position={[0, 0.022, 0]}
          scale={[0.3, 0.044, 0.22]}
          castShadow
        />
        <mesh
          geometry={boxGeometry}
          material={bottleLabelMaterial}
          position={[0, 0.047, 0]}
          scale={[0.2, 0.008, 0.055]}
        />
      </group>
      <group position={[-1.32, 0.94, -0.46]}>
        <mesh
          geometry={boxGeometry}
          material={storageBinMaterial}
          position={[0, 0.035, 0]}
          scale={[0.28, 0.07, 0.18]}
          castShadow
        />
        <mesh
          geometry={boxGeometry}
          material={darkPlasticMaterial}
          position={[0, 0.074, 0]}
          scale={[0.22, 0.012, 0.12]}
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
