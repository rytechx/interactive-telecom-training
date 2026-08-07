const RJ45_WORKSTATION = Object.freeze({
  id: 'rj45-workbench',
  displayName: 'RJ45 Cable Termination',
  interactionPosition: Object.freeze([-5, 0, -2.5]),
  workspacePosition: Object.freeze([-5.15, 0.95, -2.95]),
  focusCameraPosition: Object.freeze([-4.78, 1.72, -1.05]),
  focusCameraTarget: Object.freeze([-4.95, 0.93, -2.72]),
  technicianCameraPosition: Object.freeze([-5.28, 2.72, -1.4]),
  technicianCameraTarget: Object.freeze([-5.28, 0.95, -2.95]),
  technicianLightPosition: Object.freeze([-5.08, 3.12, -2.5]),
  technicianCameraRoll: 0,
  technicianTransitionDuration: 0.9,
  arrangementCameraPosition: Object.freeze([-5.32, 2.55, -1.88]),
  arrangementCameraTarget: Object.freeze([-5.32, 0.98, -3]),
  arrangementLightPosition: Object.freeze([-5.12, 2.9, -2.9]),
  arrangementTransitionDuration: 0.78,
  trimmingCameraPosition: Object.freeze([-5.32, 2.58, -2.27]),
  trimmingCameraTarget: Object.freeze([-5.32, 0.98, -3.55]),
  trimmingLightPosition: Object.freeze([-5.12, 2.88, -3.42]),
  trimmingToolStandbyPosition: Object.freeze([-4.52, 0.96, -2.34]),
  trimmingToolStandbyRotation: Object.freeze([0, 0.14, -0.18]),
  trimmingToolPosition: Object.freeze([-5.15, 0.95, -3.88]),
  trimmingToolRotation: Object.freeze([0, 0, 0]),
  trimmingTransitionDuration: 0.85,
  strippingToolPosition: Object.freeze([-5.15, 0.94, -2.99]),
  strippingToolRotation: Object.freeze([0, 0, 0]),
  connectorInsertionCameraPosition: Object.freeze([-5.32, 2.75, -2.5]),
  connectorInsertionCameraTarget: Object.freeze([-5.32, 1, -3.95]),
  connectorInsertionLightPosition: Object.freeze([-5.12, 2.98, -3.62]),
  connectorInsertionTransitionDuration: 0.85,
  crimpingCameraPosition: Object.freeze([-4.52, 2.62, -1.46]),
  crimpingCameraTarget: Object.freeze([-4.52, 1, -2.78]),
  crimpingLightPosition: Object.freeze([-4.46, 2.94, -2.18]),
  crimpingTransitionDuration: 0.85,
  cableTestingCameraPosition: Object.freeze([-4.5, 2.62, -1.42]),
  cableTestingCameraTarget: Object.freeze([-4.5, 1, -2.78]),
  cableTestingLightPosition: Object.freeze([-4.56, 2.94, -2.16]),
  cableTestingTransitionDuration: 0.85,
  assessmentCameraPosition: Object.freeze([-4.62, 2.78, -1.62]),
  assessmentCameraTarget: Object.freeze([-4.62, 1, -2.92]),
  assessmentLightPosition: Object.freeze([-4.72, 3.02, -2.36]),
  assessmentTransitionDuration: 0.9,
  transitionDuration: 1,
})

const FIBER_WORKSTATION = Object.freeze({
  id: 'fiber-workbench',
  displayName: 'Fiber Optic Fusion Splicing',
  interactionPosition: Object.freeze([5, 0, -2.5]),
  workspacePosition: Object.freeze([5, 0.95, -2.5]),
  focusCameraPosition: Object.freeze([5.18, 1.72, -0.82]),
  focusCameraTarget: Object.freeze([5, 0.93, -2.5]),
  technicianCameraPosition: Object.freeze([5.15, 2.55, -1.38]),
  technicianCameraTarget: Object.freeze([5.05, 0.94, -2.55]),
  technicianLightPosition: Object.freeze([5.25, 3.05, -2.05]),
  technicianTransitionDuration: 0.9,
  transitionDuration: 1,
})

const workstationConfigs = Object.freeze({
  [RJ45_WORKSTATION.id]: RJ45_WORKSTATION,
  [FIBER_WORKSTATION.id]: FIBER_WORKSTATION,
})

function getWorkstationConfig(workstationId) {
  return workstationConfigs[workstationId] ?? null
}

export {
  FIBER_WORKSTATION,
  getWorkstationConfig,
  RJ45_WORKSTATION,
  workstationConfigs,
}
