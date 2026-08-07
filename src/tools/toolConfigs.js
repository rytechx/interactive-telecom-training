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
    workbenchPosition: Object.freeze([0.05, 0.9, 0.08]),
    workbenchRotation: Object.freeze([0, 0, 0]),
    inspectionCameraPosition: Object.freeze([-4.95, 1.28, -1.42]),
    inspectionCameraTarget: Object.freeze([-4.95, 0.97, -2.42]),
    activeToolPosition: Object.freeze([0.43, -0.31, -0.82]),
    activeToolRotation: Object.freeze([0.15, 0.28, -0.4]),
    activeToolScale: 1.15,
  }),
  [TOOL_IDS.WIRE_STRIPPER]: Object.freeze({
    id: TOOL_IDS.WIRE_STRIPPER,
    name: 'Wire Stripper',
    purpose:
      'Used to remove the Ethernet cable jacket without damaging inner wires.',
    workbenchPosition: Object.freeze([0.73, 0.9, 0.08]),
    workbenchRotation: Object.freeze([0, 0, 0]),
    inspectionCameraPosition: Object.freeze([-4.48, 1.28, -1.42]),
    inspectionCameraTarget: Object.freeze([-4.27, 0.97, -2.42]),
    activeToolPosition: Object.freeze([0.43, -0.3, -0.8]),
    activeToolRotation: Object.freeze([0.12, 0.2, -0.34]),
    activeToolScale: 1.25,
  }),
  [TOOL_IDS.RJ45_CONNECTOR]: Object.freeze({
    id: TOOL_IDS.RJ45_CONNECTOR,
    name: 'RJ45 Connector',
    purpose:
      'The modular plug that receives the ordered conductors before crimping.',
    workbenchPosition: Object.freeze([0.93, 0.95, -0.33]),
    workbenchRotation: Object.freeze([0, 0, 0]),
    inspectionCameraPosition: Object.freeze([-4.35, 1.22, -1.7]),
    inspectionCameraTarget: Object.freeze([-4.07, 1, -2.83]),
    activeToolPosition: Object.freeze([0.43, -0.27, -0.72]),
    activeToolRotation: Object.freeze([0.15, -0.2, -0.25]),
    activeToolScale: 2,
  }),
  [TOOL_IDS.CABLE_TESTER]: Object.freeze({
    id: TOOL_IDS.CABLE_TESTER,
    name: 'Cable Tester',
    purpose: 'Used to verify wire continuity and correct pin order.',
    workbenchPosition: Object.freeze([-0.8, 0.9, -0.05]),
    workbenchRotation: Object.freeze([0, 0, 0]),
    inspectionCameraPosition: Object.freeze([-5.55, 1.28, -1.45]),
    inspectionCameraTarget: Object.freeze([-5.8, 1, -2.55]),
    activeToolPosition: Object.freeze([0.44, -0.32, -0.84]),
    activeToolRotation: Object.freeze([0.12, 0.3, -0.18]),
    activeToolScale: 1.2,
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
