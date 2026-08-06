const RJ45_WORKSTATION = Object.freeze({
  id: 'rj45-workbench',
  displayName: 'RJ45 Cable Termination',
  interactionPosition: Object.freeze([-5, 0, -2.5]),
  focusCameraPosition: Object.freeze([-5, 1.4, -0.55]),
  focusCameraTarget: Object.freeze([-5, 0.98, -2.5]),
  transitionDuration: 1,
})

const workstationConfigs = Object.freeze({
  [RJ45_WORKSTATION.id]: RJ45_WORKSTATION,
})

function getWorkstationConfig(workstationId) {
  return workstationConfigs[workstationId] ?? null
}

export { getWorkstationConfig, RJ45_WORKSTATION, workstationConfigs }
