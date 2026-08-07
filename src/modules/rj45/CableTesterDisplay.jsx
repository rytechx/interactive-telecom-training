import { BoxGeometry, MeshStandardMaterial } from 'three'
import { TEST_PIN_COUNT, TEST_PIN_STATUSES } from './testSequenceConfig.js'

const unitBoxGeometry = new BoxGeometry(1, 1, 1)
const displayFrameMaterial = new MeshStandardMaterial({
  color: '#182328',
  metalness: 0.16,
  roughness: 0.42,
})
const displayScreenMaterial = new MeshStandardMaterial({
  color: '#0f181a',
  emissive: '#152b2b',
  emissiveIntensity: 0.2,
  roughness: 0.3,
})
const passedScreenMaterial = new MeshStandardMaterial({
  color: '#1f4b31',
  emissive: '#3db86a',
  emissiveIntensity: 0.5,
  roughness: 0.3,
})
const failedScreenMaterial = new MeshStandardMaterial({
  color: '#512d2b',
  emissive: '#d85d51',
  emissiveIntensity: 0.5,
  roughness: 0.3,
})
const indicatorMaterials = Object.freeze({
  [TEST_PIN_STATUSES.PENDING]: new MeshStandardMaterial({
    color: '#263136',
    emissive: '#000000',
    roughness: 0.5,
  }),
  [TEST_PIN_STATUSES.TESTING]: new MeshStandardMaterial({
    color: '#f0b84d',
    emissive: '#f0a928',
    emissiveIntensity: 1.1,
    toneMapped: false,
    roughness: 0.34,
  }),
  [TEST_PIN_STATUSES.PASS]: new MeshStandardMaterial({
    color: '#64d484',
    emissive: '#38b761',
    emissiveIntensity: 0.92,
    toneMapped: false,
    roughness: 0.34,
  }),
  [TEST_PIN_STATUSES.FAIL]: new MeshStandardMaterial({
    color: '#e16b5e',
    emissive: '#ce4439',
    emissiveIntensity: 0.92,
    toneMapped: false,
    roughness: 0.34,
  }),
})

export default function CableTesterDisplay({
  pinResults = [],
  finalTestResult = null,
}) {
  const screenMaterial =
    finalTestResult === 'PASS'
      ? passedScreenMaterial
      : finalTestResult === 'FAIL'
        ? failedScreenMaterial
        : displayScreenMaterial

  return (
    <group>
      <mesh
        geometry={unitBoxGeometry}
        material={displayFrameMaterial}
        position={[0, 0, 0]}
        scale={[0.34, 0.018, 0.19]}
        receiveShadow
      />
      <mesh
        geometry={unitBoxGeometry}
        material={screenMaterial}
        position={[0, 0.011, -0.047]}
        scale={[0.29, 0.01, 0.06]}
      />
      {Array.from({ length: TEST_PIN_COUNT }, (_, index) => {
        const status = pinResults[index] ?? TEST_PIN_STATUSES.PENDING

        return (
          <mesh
            key={index}
            geometry={unitBoxGeometry}
            material={
              indicatorMaterials[status] ??
              indicatorMaterials[TEST_PIN_STATUSES.PENDING]
            }
            position={[(index - 3.5) * 0.038, 0.012, 0.045]}
            scale={[0.024, 0.012, 0.035]}
          />
        )
      })}
    </group>
  )
}
