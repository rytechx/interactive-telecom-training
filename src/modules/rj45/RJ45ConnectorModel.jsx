import { Html } from '@react-three/drei'
import {
  GUIDE_CENTER_X,
  GUIDE_SLOT_SPACING,
  TRIMMED_TIP_Z,
  WIRE_COUNT,
} from './wireDefinitions.js'

const CONNECTOR_WIDTH = GUIDE_SLOT_SPACING * WIRE_COUNT + 0.08
const CONNECTOR_HEIGHT = 0.24
const CONNECTOR_LENGTH = 0.42
const CONNECTOR_ALIGNED_POSITION = Object.freeze([
  GUIDE_CENTER_X,
  0.068,
  -0.28,
])
const CONNECTOR_INITIAL_POSITION = Object.freeze([
  GUIDE_CENTER_X + 0.46,
  0.23,
  -0.13,
])
const CONNECTOR_ALIGNED_ROTATION = Object.freeze([0, 0, 0])
const CONNECTOR_INITIAL_ROTATION = Object.freeze([-0.12, 0.18, -0.08])
const CONNECTOR_REAR_ENTRY_Z =
  CONNECTOR_ALIGNED_POSITION[2] + CONNECTOR_LENGTH / 2
const CONNECTOR_FRONT_CONTACT_Z =
  CONNECTOR_ALIGNED_POSITION[2] - CONNECTOR_LENGTH / 2 + 0.045
const CONDUCTOR_INSERTION_DISTANCE =
  CONNECTOR_FRONT_CONTACT_Z - TRIMMED_TIP_Z
const JACKET_INSERTION_DISTANCE = -0.09

function getChannelX(index) {
  return (index - (WIRE_COUNT - 1) / 2) * GUIDE_SLOT_SPACING
}

export default function RJ45ConnectorModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  isEntryHighlighted = false,
  showPinNumbers = true,
  onEntryPointerEnter,
  onEntryPointerLeave,
  onEntryClick,
}) {
  const shellColor = isEntryHighlighted ? '#dff8ff' : '#b8d7df'

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh
        position={[0, CONNECTOR_HEIGHT / 2 - 0.018, 0]}
        castShadow
      >
        <boxGeometry args={[CONNECTOR_WIDTH, 0.036, CONNECTOR_LENGTH]} />
        <meshStandardMaterial
          color={shellColor}
          transparent
          opacity={0.34}
          roughness={0.24}
          depthWrite={false}
        />
      </mesh>

      <mesh
        position={[0, -CONNECTOR_HEIGHT / 2 + 0.018, 0]}
        receiveShadow
      >
        <boxGeometry args={[CONNECTOR_WIDTH, 0.036, CONNECTOR_LENGTH]} />
        <meshStandardMaterial
          color={shellColor}
          transparent
          opacity={0.4}
          roughness={0.28}
          depthWrite={false}
        />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * (CONNECTOR_WIDTH / 2 - 0.018), 0, 0]}
          castShadow
        >
          <boxGeometry args={[0.036, CONNECTOR_HEIGHT, CONNECTOR_LENGTH]} />
          <meshStandardMaterial
            color={shellColor}
            transparent
            opacity={0.38}
            roughness={0.24}
            depthWrite={false}
          />
        </mesh>
      ))}

      <mesh position={[0, 0, -CONNECTOR_LENGTH / 2 + 0.014]}>
        <boxGeometry args={[CONNECTOR_WIDTH, CONNECTOR_HEIGHT, 0.028]} />
        <meshStandardMaterial
          color="#bad7dd"
          transparent
          opacity={0.26}
          roughness={0.22}
          depthWrite={false}
        />
      </mesh>

      {Array.from({ length: WIRE_COUNT }, (_, index) => {
        const channelX = getChannelX(index)

        return (
          <group key={index}>
            <mesh position={[channelX, -0.018, 0.005]}>
              <boxGeometry
                args={[
                  GUIDE_SLOT_SPACING * 0.68,
                  0.026,
                  CONNECTOR_LENGTH * 0.82,
                ]}
              />
              <meshStandardMaterial
                color="#55717b"
                transparent
                opacity={0.3}
                roughness={0.5}
                depthWrite={false}
              />
            </mesh>
            <mesh
              position={[
                channelX,
                CONNECTOR_HEIGHT / 2 - 0.038,
                -CONNECTOR_LENGTH / 2 + 0.068,
              ]}
              castShadow
            >
              <boxGeometry
                args={[GUIDE_SLOT_SPACING * 0.54, 0.026, 0.105]}
              />
              <meshStandardMaterial
                color="#d9ad42"
                emissive="#74551a"
                emissiveIntensity={0.22}
                metalness={0.78}
                roughness={0.3}
              />
            </mesh>
          </group>
        )
      })}

      {Array.from({ length: WIRE_COUNT - 1 }, (_, index) => (
        <mesh
          key={index}
          position={[
            (index - (WIRE_COUNT - 2) / 2) * GUIDE_SLOT_SPACING,
            0.008,
            0.01,
          ]}
        >
          <boxGeometry args={[0.012, 0.13, CONNECTOR_LENGTH * 0.76]} />
          <meshStandardMaterial
            color="#9db8bf"
            transparent
            opacity={0.28}
            roughness={0.35}
            depthWrite={false}
          />
        </mesh>
      ))}

      <group position={[0, 0, CONNECTOR_LENGTH / 2 - 0.018]}>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * CONNECTOR_WIDTH * 0.43, 0, 0]}>
            <boxGeometry args={[0.035, CONNECTOR_HEIGHT * 0.76, 0.055]} />
            <meshStandardMaterial
              color={isEntryHighlighted ? '#f2d276' : '#6f8991'}
              emissive={isEntryHighlighted ? '#c28a24' : '#000000'}
              emissiveIntensity={isEntryHighlighted ? 0.72 : 0}
              metalness={0.25}
              roughness={0.42}
            />
          </mesh>
        ))}
        <mesh position={[0, CONNECTOR_HEIGHT * 0.34, 0]}>
          <boxGeometry args={[CONNECTOR_WIDTH * 0.86, 0.035, 0.055]} />
          <meshStandardMaterial
            color={isEntryHighlighted ? '#f2d276' : '#6f8991'}
            emissive={isEntryHighlighted ? '#c28a24' : '#000000'}
            emissiveIntensity={isEntryHighlighted ? 0.72 : 0}
            metalness={0.25}
            roughness={0.42}
          />
        </mesh>
        <mesh position={[0, -CONNECTOR_HEIGHT * 0.34, 0]}>
          <boxGeometry args={[CONNECTOR_WIDTH * 0.86, 0.035, 0.055]} />
          <meshStandardMaterial
            color={isEntryHighlighted ? '#f2d276' : '#6f8991'}
            emissive={isEntryHighlighted ? '#c28a24' : '#000000'}
            emissiveIntensity={isEntryHighlighted ? 0.72 : 0}
            metalness={0.25}
            roughness={0.42}
          />
        </mesh>
      </group>

      <mesh
        position={[0, -CONNECTOR_HEIGHT / 2 - 0.055, 0.055]}
        rotation={[-0.22, 0, 0]}
        castShadow
      >
        <boxGeometry args={[CONNECTOR_WIDTH * 0.48, 0.035, 0.22]} />
        <meshStandardMaterial
          color="#9fb9c0"
          transparent
          opacity={0.64}
          roughness={0.32}
        />
      </mesh>

      <mesh
        position={[0, 0, CONNECTOR_LENGTH / 2 + 0.025]}
        onPointerEnter={onEntryPointerEnter}
        onPointerLeave={onEntryPointerLeave}
        onClick={onEntryClick}
      >
        <boxGeometry
          args={[CONNECTOR_WIDTH * 0.94, CONNECTOR_HEIGHT * 0.82, 0.08]}
        />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {showPinNumbers && (
        <Html
          position={[0, CONNECTOR_HEIGHT / 2 + 0.11, -CONNECTOR_LENGTH * 0.3]}
          center
        >
          <div className="connector-pin-labels" aria-label="RJ45 pins 1 through 8">
            {Array.from({ length: WIRE_COUNT }, (_, index) => (
              <span key={index}>{index + 1}</span>
            ))}
          </div>
        </Html>
      )}

      {isEntryHighlighted && (
        <Html position={[0, CONNECTOR_HEIGHT / 2 + 0.24, 0.12]} center>
          <div className="tool-tooltip" role="tooltip">
            Insert Conductors
          </div>
        </Html>
      )}
    </group>
  )
}

export {
  CONDUCTOR_INSERTION_DISTANCE,
  CONNECTOR_ALIGNED_POSITION,
  CONNECTOR_ALIGNED_ROTATION,
  CONNECTOR_FRONT_CONTACT_Z,
  CONNECTOR_HEIGHT,
  CONNECTOR_INITIAL_POSITION,
  CONNECTOR_INITIAL_ROTATION,
  CONNECTOR_LENGTH,
  CONNECTOR_REAR_ENTRY_Z,
  CONNECTOR_WIDTH,
  JACKET_INSERTION_DISTANCE,
}
