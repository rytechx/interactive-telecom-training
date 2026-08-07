import { Html } from '@react-three/drei'
import { BoxGeometry, MeshStandardMaterial } from 'three'
import {
  CABLE_EXIT_Z,
  CONNECTOR_CHANNEL_SPACING,
  CONNECTOR_WIRE_CENTER_X,
  TRIMMED_TIP_Z,
  WIRE_COUNT,
} from './wireDefinitions.js'

const RJ45_SCENE_UNITS_PER_MILLIMETER = 0.02
const CONNECTOR_LENGTH = 23 * RJ45_SCENE_UNITS_PER_MILLIMETER
const CONNECTOR_WIDTH = 12 * RJ45_SCENE_UNITS_PER_MILLIMETER
const CONNECTOR_HEIGHT = 8 * RJ45_SCENE_UNITS_PER_MILLIMETER
const CONNECTOR_FRONT_WIDTH = 11 * RJ45_SCENE_UNITS_PER_MILLIMETER
const CONNECTOR_ALIGNED_POSITION = Object.freeze([
  CONNECTOR_WIRE_CENTER_X,
  0.07,
  -1.29,
])
const CONNECTOR_INITIAL_POSITION = Object.freeze([
  CONNECTOR_WIRE_CENTER_X + 0.16,
  0.16,
  -1.52,
])
const CONNECTOR_ALIGNED_ROTATION = Object.freeze([0, 0, 0])
const CONNECTOR_INITIAL_ROTATION = Object.freeze([-0.1, 0.16, -0.06])
const CONNECTOR_REAR_ENTRY_Z =
  CONNECTOR_ALIGNED_POSITION[2] + CONNECTOR_LENGTH / 2
const CONNECTOR_FRONT_CONTACT_Z =
  CONNECTOR_ALIGNED_POSITION[2] - CONNECTOR_LENGTH / 2 + 0.04
const CONDUCTOR_INSERTION_DISTANCE =
  CONNECTOR_FRONT_CONTACT_Z - TRIMMED_TIP_Z
const CONNECTOR_JACKET_LENGTH = 0.72
const CONNECTOR_JACKET_FRONT_START_Z = CABLE_EXIT_Z
const CONNECTOR_JACKET_INITIAL_Z =
  CONNECTOR_JACKET_FRONT_START_Z + CONNECTOR_JACKET_LENGTH / 2
const JACKET_INSERTION_DISTANCE =
  CONNECTOR_REAR_ENTRY_Z - CONNECTOR_JACKET_FRONT_START_Z
const CONTACT_PRESS_DISTANCE = 0.018
const STRAIN_RELIEF_PRESS_DISTANCE = 0.026

const unitBoxGeometry = new BoxGeometry(1, 1, 1)
const housingMaterial = new MeshStandardMaterial({
  color: '#b8d6dc',
  transparent: true,
  opacity: 0.42,
  roughness: 0.3,
  metalness: 0.02,
  depthWrite: false,
})
const housingEdgeMaterial = new MeshStandardMaterial({
  color: '#78949d',
  transparent: true,
  opacity: 0.74,
  roughness: 0.34,
  metalness: 0.05,
})
const highlightedEdgeMaterial = new MeshStandardMaterial({
  color: '#e7c866',
  emissive: '#a06b18',
  emissiveIntensity: 0.38,
  roughness: 0.32,
  metalness: 0.12,
})
const channelMaterial = new MeshStandardMaterial({
  color: '#66828b',
  transparent: true,
  opacity: 0.62,
  roughness: 0.48,
  depthWrite: false,
})
const contactMaterial = new MeshStandardMaterial({
  color: '#c59a38',
  emissive: '#5c4417',
  emissiveIntensity: 0.16,
  metalness: 0.72,
  roughness: 0.34,
})

function getChannelX(index) {
  return (index - (WIRE_COUNT - 1) / 2) * CONNECTOR_CHANNEL_SPACING
}

function BoxPart({
  meshRef,
  position,
  scale,
  material,
  castShadow,
  receiveShadow,
}) {
  return (
    <mesh
      ref={meshRef}
      geometry={unitBoxGeometry}
      material={material}
      position={position}
      scale={scale}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  )
}

export default function RJ45ConnectorModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  isEntryHighlighted = false,
  contactBladeRefs,
  strainReliefRef,
  onEntryPointerEnter,
  onEntryPointerLeave,
  onEntryClick,
}) {
  const entryMaterial = isEntryHighlighted
    ? highlightedEdgeMaterial
    : housingEdgeMaterial

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <BoxPart
        position={[0, 0, 0.13]}
        scale={[CONNECTOR_WIDTH, CONNECTOR_HEIGHT, 0.2]}
        material={housingMaterial}
        castShadow
        receiveShadow
      />
      <BoxPart
        position={[0, 0.004, -0.095]}
        scale={[CONNECTOR_FRONT_WIDTH, 0.145, 0.29]}
        material={housingMaterial}
        castShadow
        receiveShadow
      />

      {[-1, 1].map((side) => (
        <group key={side}>
          <BoxPart
            position={[side * (CONNECTOR_WIDTH / 2 - 0.009), 0, 0.13]}
            scale={[0.018, CONNECTOR_HEIGHT, 0.2]}
            material={housingEdgeMaterial}
            castShadow
          />
          <BoxPart
            position={[
              side * (CONNECTOR_FRONT_WIDTH / 2 - 0.008),
              0.004,
              -0.095,
            ]}
            scale={[0.016, 0.145, 0.29]}
            material={housingEdgeMaterial}
            castShadow
          />
        </group>
      ))}

      <BoxPart
        position={[0, CONNECTOR_HEIGHT / 2 - 0.009, -0.07]}
        scale={[CONNECTOR_FRONT_WIDTH, 0.018, 0.34]}
        material={housingEdgeMaterial}
        castShadow
      />
      <BoxPart
        position={[0, -CONNECTOR_HEIGHT / 2 + 0.009, 0.015]}
        scale={[CONNECTOR_WIDTH, 0.018, 0.37]}
        material={housingEdgeMaterial}
        receiveShadow
      />
      <BoxPart
        position={[0, 0, -CONNECTOR_LENGTH / 2 + 0.008]}
        scale={[CONNECTOR_FRONT_WIDTH, 0.145, 0.016]}
        material={housingEdgeMaterial}
      />

      {Array.from({ length: WIRE_COUNT }, (_, index) => {
        const channelX = getChannelX(index)

        return (
          <group
            key={index}
            ref={(group) => {
              if (contactBladeRefs) {
                contactBladeRefs.current[index] = group
              }
            }}
          >
            <BoxPart
              position={[channelX, -0.035, -0.045]}
              scale={[0.018, 0.006, 0.34]}
              material={channelMaterial}
            />
            <BoxPart
              position={[
                channelX,
                CONNECTOR_HEIGHT / 2 - 0.014,
                -0.15,
              ]}
              scale={[0.012, 0.008, 0.11]}
              material={contactMaterial}
              castShadow
            />
            <BoxPart
              position={[channelX, 0.025, -0.105]}
              scale={[0.012, 0.066, 0.01]}
              material={contactMaterial}
            />
          </group>
        )
      })}

      {Array.from({ length: WIRE_COUNT - 1 }, (_, index) => (
        <BoxPart
          key={index}
          position={[
            (index - (WIRE_COUNT - 2) / 2) * CONNECTOR_CHANNEL_SPACING,
            -0.001,
            -0.045,
          ]}
          scale={[0.004, 0.05, 0.34]}
          material={channelMaterial}
        />
      ))}

      <group position={[0, 0, CONNECTOR_LENGTH / 2 - 0.008]}>
        {[-1, 1].map((side) => (
          <BoxPart
            key={side}
            position={[side * 0.079, 0, 0]}
            scale={[0.018, 0.118, 0.035]}
            material={entryMaterial}
          />
        ))}
        <BoxPart
          position={[0, 0.059, 0]}
          scale={[0.176, 0.018, 0.035]}
          material={entryMaterial}
        />
        <BoxPart
          position={[0, -0.059, 0]}
          scale={[0.176, 0.018, 0.035]}
          material={entryMaterial}
        />
      </group>

      <group ref={strainReliefRef}>
        <BoxPart
          position={[0, 0.054, 0.12]}
          scale={[0.16, 0.018, 0.06]}
          material={housingEdgeMaterial}
          castShadow
        />
      </group>

      <group position={[0, -CONNECTOR_HEIGHT / 2 - 0.012, 0.04]}>
        <mesh
          geometry={unitBoxGeometry}
          material={housingEdgeMaterial}
          position={[0, -0.012, 0]}
          rotation={[-0.16, 0, 0]}
          scale={[0.09, 0.018, 0.18]}
          castShadow
        />
        <BoxPart
          position={[0, -0.018, 0.085]}
          scale={[0.105, 0.026, 0.045]}
          material={housingEdgeMaterial}
          castShadow
        />
      </group>

      <mesh
        geometry={unitBoxGeometry}
        position={[0, 0, CONNECTOR_LENGTH / 2 + 0.018]}
        scale={[0.18, 0.125, 0.07]}
        onPointerEnter={onEntryPointerEnter}
        onPointerLeave={onEntryPointerLeave}
        onClick={onEntryClick}
      >
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {isEntryHighlighted && (
        <Html position={[0, CONNECTOR_HEIGHT / 2 + 0.09, 0.13]} center>
          <div className="tool-tooltip" role="tooltip">
            Insert Conductors
          </div>
        </Html>
      )}
    </group>
  )
}

export {
  CONTACT_PRESS_DISTANCE,
  CONDUCTOR_INSERTION_DISTANCE,
  CONNECTOR_ALIGNED_POSITION,
  CONNECTOR_ALIGNED_ROTATION,
  CONNECTOR_FRONT_CONTACT_Z,
  CONNECTOR_HEIGHT,
  CONNECTOR_INITIAL_POSITION,
  CONNECTOR_INITIAL_ROTATION,
  CONNECTOR_JACKET_INITIAL_Z,
  CONNECTOR_JACKET_LENGTH,
  CONNECTOR_LENGTH,
  CONNECTOR_REAR_ENTRY_Z,
  CONNECTOR_WIDTH,
  JACKET_INSERTION_DISTANCE,
  RJ45_SCENE_UNITS_PER_MILLIMETER,
  STRAIN_RELIEF_PRESS_DISTANCE,
}
