const TOOL_IDS = Object.freeze({
  CRIMPING_TOOL: 'crimping-tool',
  WIRE_STRIPPER: 'wire-stripper',
  RJ45_CONNECTOR: 'rj45-connector',
  CABLE_TESTER: 'cable-tester',
})

const toolConfigs = Object.freeze({
  [TOOL_IDS.CRIMPING_TOOL]: Object.freeze({
    id: TOOL_IDS.CRIMPING_TOOL,
    name: 'Crimping Tool',
    purpose:
      'Used to trim Ethernet conductors and press RJ45 connector contacts into place.',
    restPosition: Object.freeze([0.95, 0.94, -0.08]),
    restRotation: Object.freeze([0, 0.08, 0]),
    scale: 0.6,
    inspectionCameraPosition: Object.freeze([-4.05, 2.32, -1.5]),
    inspectionCameraTarget: Object.freeze([-4.05, 0.96, -2.58]),
    inspectionCameraRoll: 0,
    activePosition: Object.freeze([0.43, -0.31, -0.86]),
    activeRotation: Object.freeze([0.15, 0.18, -0.2]),
    activeScale: 0.88,
  }),
  [TOOL_IDS.WIRE_STRIPPER]: Object.freeze({
    id: TOOL_IDS.WIRE_STRIPPER,
    name: 'Wire Stripper',
    purpose:
      'Used to remove the Ethernet cable jacket without damaging inner wires.',
    restPosition: Object.freeze([-0.72, 0.9, 0.03]),
    restRotation: Object.freeze([0, 0.12, 0]),
    scale: 0.68,
    inspectionCameraPosition: Object.freeze([-5.72, 2.2, -1.5]),
    inspectionCameraTarget: Object.freeze([-5.72, 0.94, -2.47]),
    inspectionCameraRoll: 0,
    activePosition: Object.freeze([0.43, -0.3, -0.84]),
    activeRotation: Object.freeze([0.12, 0.16, -0.22]),
    activeScale: 0.86,
  }),
  [TOOL_IDS.RJ45_CONNECTOR]: Object.freeze({
    id: TOOL_IDS.RJ45_CONNECTOR,
    name: 'RJ45 Connector',
    purpose:
      'The modular plug that receives the ordered conductors before crimping.',
    restPosition: Object.freeze([0.78, 0.95, -0.68]),
    restRotation: Object.freeze([0, 0, 0]),
    scale: 1.05,
    inspectionCameraPosition: Object.freeze([-4.22, 2.28, -2]),
    inspectionCameraTarget: Object.freeze([-4.22, 0.98, -3.18]),
    inspectionCameraRoll: 0,
    activePosition: Object.freeze([0.43, -0.27, -0.76]),
    activeRotation: Object.freeze([0.12, -0.12, -0.12]),
    activeScale: 1.35,
  }),
  [TOOL_IDS.CABLE_TESTER]: Object.freeze({
    id: TOOL_IDS.CABLE_TESTER,
    name: 'Cable Tester',
    purpose: 'Used to verify wire continuity and correct pin order.',
    restPosition: Object.freeze([-0.82, 0.9, -0.72]),
    restRotation: Object.freeze([0, 0, 0]),
    scale: 0.54,
    inspectionCameraPosition: Object.freeze([-5.82, 2.36, -2.05]),
    inspectionCameraTarget: Object.freeze([-5.82, 0.98, -3.22]),
    inspectionCameraRoll: 0,
    activePosition: Object.freeze([0.44, -0.32, -0.88]),
    activeRotation: Object.freeze([0.12, 0.18, -0.1]),
    activeScale: 0.74,
  }),
})

const RJ45_TOOL_CONFIGS = Object.freeze([
  toolConfigs[TOOL_IDS.CRIMPING_TOOL],
  toolConfigs[TOOL_IDS.WIRE_STRIPPER],
  toolConfigs[TOOL_IDS.RJ45_CONNECTOR],
  toolConfigs[TOOL_IDS.CABLE_TESTER],
])

function getToolConfig(toolId) {
  return toolConfigs[toolId] ?? null
}

export { getToolConfig, RJ45_TOOL_CONFIGS, TOOL_IDS, toolConfigs }
