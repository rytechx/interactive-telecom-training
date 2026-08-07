import { BoxGeometry, CylinderGeometry, MeshStandardMaterial } from 'three'
import CableTesterDisplay from '../../modules/rj45/CableTesterDisplay.jsx'

const CABLE_TESTER_PORT_POSITION = Object.freeze([0, 0.11, -0.38])
const CABLE_TESTER_BUTTON_POSITION = Object.freeze([0.14, 0.228, 0.23])
const unitBoxGeometry = new BoxGeometry(1, 1, 1)
const unitCylinderGeometry = new CylinderGeometry(1, 1, 1, 12)
const bodyTrimMaterial = new MeshStandardMaterial({
  color: '#26343a',
  metalness: 0.16,
  roughness: 0.54,
})
const gripMaterial = new MeshStandardMaterial({
  color: '#182228',
  metalness: 0.06,
  roughness: 0.82,
})
const portMaterial = new MeshStandardMaterial({
  color: '#090d0f',
  metalness: 0.22,
  roughness: 0.4,
})
const portLipMaterial = new MeshStandardMaterial({
  color: '#738087',
  metalness: 0.62,
  roughness: 0.36,
})
const highlightedPortMaterial = new MeshStandardMaterial({
  color: '#84ddec',
  emissive: '#43b7d1',
  emissiveIntensity: 0.72,
  metalness: 0.28,
  roughness: 0.3,
})
const buttonMaterial = new MeshStandardMaterial({
  color: '#c34f44',
  metalness: 0.08,
  roughness: 0.54,
})
const highlightedButtonMaterial = new MeshStandardMaterial({
  color: '#ffbe58',
  emissive: '#ef9c26',
  emissiveIntensity: 0.78,
  roughness: 0.42,
})

export default function CableTester({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  color = '#3a515b',
  pinResults,
  finalTestResult,
  buttonRef,
  isPortHighlighted = false,
  isButtonHighlighted = false,
  onPortPointerEnter,
  onPortPointerLeave,
  onPortClick,
  onButtonPointerEnter,
  onButtonPointerLeave,
  onButtonClick,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh
        geometry={unitBoxGeometry}
        position={[0, 0.1, 0]}
        scale={[0.46, 0.2, 0.72]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} roughness={0.62} />
      </mesh>
      <mesh
        geometry={unitBoxGeometry}
        material={bodyTrimMaterial}
        position={[0, 0.208, 0]}
        scale={[0.4, 0.035, 0.63]}
        castShadow
        receiveShadow
      />
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          geometry={unitBoxGeometry}
          material={gripMaterial}
          position={[side * 0.225, 0.09, 0.08]}
          scale={[0.025, 0.14, 0.44]}
          castShadow
        />
      ))}

      <group position={[0, 0.228, -0.075]}>
        <CableTesterDisplay
          pinResults={pinResults}
          finalTestResult={finalTestResult}
        />
      </group>

      <mesh
        geometry={unitBoxGeometry}
        material={portMaterial}
        position={CABLE_TESTER_PORT_POSITION}
        scale={[0.27, 0.17, 0.04]}
        receiveShadow
      />
      <mesh
        geometry={unitBoxGeometry}
        material={isPortHighlighted ? highlightedPortMaterial : portLipMaterial}
        position={[0, 0.2, -0.397]}
        scale={[0.3, 0.018, 0.026]}
      />
      <mesh
        geometry={unitBoxGeometry}
        material={isPortHighlighted ? highlightedPortMaterial : portLipMaterial}
        position={[0, 0.02, -0.397]}
        scale={[0.3, 0.018, 0.026]}
      />
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          geometry={unitBoxGeometry}
          material={isPortHighlighted ? highlightedPortMaterial : portLipMaterial}
          position={[side * 0.142, 0.11, -0.397]}
          scale={[0.018, 0.19, 0.026]}
        />
      ))}
      <mesh
        geometry={unitBoxGeometry}
        position={[0, 0.11, -0.42]}
        scale={[0.35, 0.25, 0.13]}
        onPointerEnter={onPortPointerEnter}
        onPointerLeave={onPortPointerLeave}
        onClick={onPortClick}
      >
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh
        ref={buttonRef}
        geometry={unitCylinderGeometry}
        material={
          isButtonHighlighted ? highlightedButtonMaterial : buttonMaterial
        }
        position={CABLE_TESTER_BUTTON_POSITION}
        scale={[0.04, 0.022, 0.04]}
        castShadow
        onPointerEnter={onButtonPointerEnter}
        onPointerLeave={onButtonPointerLeave}
        onClick={onButtonClick}
      />
      <mesh
        geometry={unitCylinderGeometry}
        position={CABLE_TESTER_BUTTON_POSITION}
        scale={[0.085, 0.06, 0.085]}
        onPointerEnter={onButtonPointerEnter}
        onPointerLeave={onButtonPointerLeave}
        onClick={onButtonClick}
      >
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

export { CABLE_TESTER_BUTTON_POSITION, CABLE_TESTER_PORT_POSITION }
