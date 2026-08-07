const RJ45_WORKSTATION = Object.freeze({
  id: 'rj45-workbench',
  displayName: 'RJ45 Cable Termination',
  interactionPosition: Object.freeze([-5, 0, -2.5]),
  focusCameraPosition: Object.freeze([-5, 1.4, -0.55]),
  focusCameraTarget: Object.freeze([-5, 0.98, -2.5]),
  arrangementCameraPosition: Object.freeze([-4.65, 1.95, -1.52]),
  arrangementCameraTarget: Object.freeze([-4.65, 0.98, -2.88]),
  arrangementLightPosition: Object.freeze([-4.65, 2.35, -2.05]),
  arrangementTransitionDuration: 0.85,
  trimmingCameraPosition: Object.freeze([-4.05, 1.58, -1.98]),
  trimmingCameraTarget: Object.freeze([-4.63, 1.03, -2.99]),
  trimmingLightPosition: Object.freeze([-4.25, 2.15, -2.35]),
  trimmingToolPosition: Object.freeze([-4.63, 0.95, -2.58]),
  trimmingToolRotation: Object.freeze([0, 0, 0]),
  trimmingTransitionDuration: 0.85,
  connectorInsertionCameraPosition: Object.freeze([-4.02, 1.58, -2.12]),
  connectorInsertionCameraTarget: Object.freeze([-4.63, 1.05, -3.23]),
  connectorInsertionLightPosition: Object.freeze([-4.22, 2.12, -2.62]),
  connectorInsertionTransitionDuration: 0.85,
  transitionDuration: 1,
})

const workstationConfigs = Object.freeze({
  [RJ45_WORKSTATION.id]: RJ45_WORKSTATION,
})

function getWorkstationConfig(workstationId) {
  return workstationConfigs[workstationId] ?? null
}

export { getWorkstationConfig, RJ45_WORKSTATION, workstationConfigs }
