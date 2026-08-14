import { MeshPhysicalMaterial, MeshStandardMaterial } from 'three'

const industrialFloorMaterial = new MeshPhysicalMaterial({
  color: '#626d72',
  metalness: 0.06,
  roughness: 0.68,
  clearcoat: 0.08,
  clearcoatRoughness: 0.82,
})

const paintedWallMaterial = new MeshStandardMaterial({
  color: '#e7e5de',
  metalness: 0,
  roughness: 0.88,
})

const ceilingMaterial = new MeshStandardMaterial({
  color: '#d9dcd9',
  metalness: 0,
  roughness: 0.94,
})

const baseboardMaterial = new MeshStandardMaterial({
  color: '#59636a',
  metalness: 0.18,
  roughness: 0.64,
})

const powderCoatedMetalMaterial = new MeshStandardMaterial({
  color: '#3b454b',
  metalness: 0.48,
  roughness: 0.58,
})

const brushedMetalMaterial = new MeshStandardMaterial({
  color: '#8d999f',
  metalness: 0.7,
  roughness: 0.34,
})

const laminatedBenchMaterial = new MeshPhysicalMaterial({
  color: '#8a6847',
  metalness: 0.02,
  roughness: 0.58,
  clearcoat: 0.12,
  clearcoatRoughness: 0.66,
})

const darkPlasticMaterial = new MeshStandardMaterial({
  color: '#202a2f',
  metalness: 0.05,
  roughness: 0.72,
})

const rubberMaterial = new MeshStandardMaterial({
  color: '#151b1e',
  metalness: 0,
  roughness: 0.9,
})

const glassMaterial = new MeshPhysicalMaterial({
  color: '#a8c6cf',
  metalness: 0,
  roughness: 0.18,
  transmission: 0.22,
  transparent: true,
  opacity: 0.46,
  depthWrite: false,
  clearcoat: 0.5,
  clearcoatRoughness: 0.18,
})

const safetyRedMaterial = new MeshStandardMaterial({
  color: '#a83b32',
  metalness: 0.16,
  roughness: 0.52,
})

const safetyWhiteMaterial = new MeshStandardMaterial({
  color: '#e8ebe7',
  metalness: 0,
  roughness: 0.78,
})

const cartonMaterial = new MeshStandardMaterial({
  color: '#9b7b55',
  metalness: 0,
  roughness: 0.92,
})

const storageBinMaterial = new MeshStandardMaterial({
  color: '#376d82',
  metalness: 0.05,
  roughness: 0.76,
})

export {
  baseboardMaterial,
  brushedMetalMaterial,
  cartonMaterial,
  ceilingMaterial,
  darkPlasticMaterial,
  glassMaterial,
  industrialFloorMaterial,
  laminatedBenchMaterial,
  paintedWallMaterial,
  powderCoatedMetalMaterial,
  rubberMaterial,
  safetyRedMaterial,
  safetyWhiteMaterial,
  storageBinMaterial,
}
