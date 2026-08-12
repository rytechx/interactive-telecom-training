const NETWORK_WORKSTATION_LAYOUT = Object.freeze({
  preparationBenchPosition: Object.freeze([5.25, 0, 1.15]),
  preparationBenchWidth: 5,
  preparationBenchDepth: 1.8,
  preparationBenchHeight: 0.88,
  preparationBenchTopThickness: 0.1,
  preparationBenchLegOffsetX: 2.32,
  preparationBenchLegOffsetZ: 0.78,
  preparationZoneMarkings: Object.freeze([
    Object.freeze({
      id: 'device-preparation',
      label: 'DEVICE PREP',
      position: Object.freeze([1.5, 0.892, 0]),
      dimensions: Object.freeze([1.78, 0.018, 1.62]),
      color: '#526269',
    }),
    Object.freeze({
      id: 'power-connections',
      label: 'POWER',
      position: Object.freeze([-0.15, 0.892, 0]),
      dimensions: Object.freeze([1.34, 0.018, 1.62]),
      color: '#4a555a',
    }),
    Object.freeze({
      id: 'network-cabling',
      label: 'CABLING',
      position: Object.freeze([-1.68, 0.892, 0]),
      dimensions: Object.freeze([1.42, 0.018, 1.62]),
      color: '#4b5f63',
    }),
  ]),
  patchPanelPreparationPosition: Object.freeze([6.75, 1.01, 0.5]),
  switchPreparationPosition: Object.freeze([6.75, 1.02, 1.15]),
  routerPreparationPosition: Object.freeze([6.75, 1.02, 1.8]),
  routerPowerHomePosition: Object.freeze([5.13, 0.98, 0.66]),
  switchPowerHomePosition: Object.freeze([5.13, 0.98, 1.64]),
  patchCableHomePosition: Object.freeze([3.71, 0.97, 0.48]),
  uplinkCableHomePosition: Object.freeze([3.71, 0.97, 1.15]),
  workstationCableHomePosition: Object.freeze([3.71, 0.97, 1.82]),
  workstationDeskPosition: Object.freeze([-4.3, 0, 1.15]),
  workstationDeskWidth: 1.9,
  workstationDeskDepth: 1,
  workstationDeskHeight: 0.8,
  workstationDeskTopThickness: 0.08,
  workstationDeskLegThickness: 0.07,
  workstationDeskLegInset: 0.08,
  workstationPcPosition: Object.freeze([-4.83, 0.32, 1.18]),
  workstationMonitorPosition: Object.freeze([-4.3, 1.39, 1.02]),
  workstationRacewayPosition: Object.freeze([-2.68, 0.055, -0.2]),
  workstationRacewayDimensions: Object.freeze([3.3, 0.1, 0.16]),
  workstationDeskRacewayPosition: Object.freeze([-4.33, 0.055, 0.75]),
  workstationDeskRacewayDimensions: Object.freeze([0.16, 0.1, 2.1]),
  workstationRacewayClipPositions: Object.freeze([
    Object.freeze([-4.05, 0.12, -0.2]),
    Object.freeze([-3.2, 0.12, -0.2]),
    Object.freeze([-2.35, 0.12, -0.2]),
    Object.freeze([-1.5, 0.12, -0.2]),
  ]),
  rackCableGuidePosition: Object.freeze([-0.8, 1.42, 0.55]),
  rackHorizontalManagerPosition: Object.freeze([0, 1.31, 0.55]),
  rackLightPosition: Object.freeze([-0.15, 2.75, 1.05]),
  rackRearLightPosition: Object.freeze([0, 2.3, -1.15]),
  stationLightPosition: Object.freeze([4.45, 3.15, 1.4]),
  workstationLightPosition: Object.freeze([-4.15, 2.8, 1.15]),
})

const NETWORK_INSPECTION_LIMITS = Object.freeze({
  minDistance: 1.35,
  maxDistance: 5.8,
  minPolarAngle: (35 * Math.PI) / 180,
  maxPolarAngle: (85 * Math.PI) / 180,
  roomBounds: Object.freeze({
    minX: -9.35,
    maxX: 9.35,
    minY: 0.35,
    maxY: 3.65,
    minZ: -9.35,
    maxZ: 9.35,
  }),
})

function getNetworkWorkstationWorldPosition(
  localPosition,
  workstationPosition,
  workstationRotation = [0, 0, 0],
) {
  const rotationY = workstationRotation[1] ?? 0
  const cosine = Math.cos(rotationY)
  const sine = Math.sin(rotationY)
  const [localX, localY, localZ] = localPosition

  return [
    workstationPosition[0] + localX * cosine + localZ * sine,
    workstationPosition[1] + localY,
    workstationPosition[2] - localX * sine + localZ * cosine,
  ]
}

export {
  getNetworkWorkstationWorldPosition,
  NETWORK_INSPECTION_LIMITS,
  NETWORK_WORKSTATION_LAYOUT,
}
