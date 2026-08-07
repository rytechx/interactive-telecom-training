const FIBER_TOOL_IDS = Object.freeze({
  JACKET_STRIPPER: 'fiber-jacket-stripper',
  PRECISION_STRIPPER: 'precision-fiber-stripper',
  CLEANING_PAD: 'fiber-cleaning-pad',
  CLEAVER: 'fiber-cleaver',
  FUSION_SPLICER: 'fusion-splicer',
  PROTECTION_SLEEVE: 'fiber-protection-sleeve',
})

const fiberToolConfigs = Object.freeze({
  [FIBER_TOOL_IDS.JACKET_STRIPPER]: Object.freeze({
    id: FIBER_TOOL_IDS.JACKET_STRIPPER,
    name: 'Fiber Jacket Stripper',
    purpose:
      'Removes the outer fiber cable jacket without damaging the internal buffer.',
    restPosition: Object.freeze([-0.88, 0.96, 0.38]),
    restRotation: Object.freeze([0, 0.16, -0.12]),
    scale: 0.72,
    inspectionCameraPosition: Object.freeze([4.12, 2.18, -1.12]),
    inspectionCameraTarget: Object.freeze([4.12, 0.96, -2.12]),
  }),
  [FIBER_TOOL_IDS.PRECISION_STRIPPER]: Object.freeze({
    id: FIBER_TOOL_IDS.PRECISION_STRIPPER,
    name: 'Precision Fiber Stripper',
    purpose:
      'Removes the fiber buffer and coating during a later preparation step.',
    restPosition: Object.freeze([0.86, 0.96, 0.38]),
    restRotation: Object.freeze([0, -0.18, 0.12]),
    scale: 0.62,
    inspectionCameraPosition: Object.freeze([5.86, 2.16, -1.14]),
    inspectionCameraTarget: Object.freeze([5.86, 0.96, -2.12]),
  }),
  [FIBER_TOOL_IDS.CLEANING_PAD]: Object.freeze({
    id: FIBER_TOOL_IDS.CLEANING_PAD,
    name: 'Lint-Free Cleaning Pad',
    purpose: 'Cleans prepared fiber before cleaving and fusion splicing.',
    restPosition: Object.freeze([-1.08, 0.94, -0.02]),
    restRotation: Object.freeze([0, 0.08, 0]),
    scale: 0.82,
    inspectionCameraPosition: Object.freeze([3.95, 2.14, -1.5]),
    inspectionCameraTarget: Object.freeze([3.92, 0.94, -2.52]),
  }),
  [FIBER_TOOL_IDS.CLEAVER]: Object.freeze({
    id: FIBER_TOOL_IDS.CLEAVER,
    name: 'Fiber Cleaver',
    purpose: 'Creates a precise square fiber end for fusion splicing.',
    restPosition: Object.freeze([-0.92, 0.95, -0.4]),
    restRotation: Object.freeze([0, 0.08, 0]),
    scale: 0.72,
    inspectionCameraPosition: Object.freeze([4.08, 2.18, -1.82]),
    inspectionCameraTarget: Object.freeze([4.08, 0.95, -2.9]),
  }),
  [FIBER_TOOL_IDS.FUSION_SPLICER]: Object.freeze({
    id: FIBER_TOOL_IDS.FUSION_SPLICER,
    name: 'Fusion Splicer',
    purpose: 'Aligns and fuses prepared optical fibers in a later task.',
    restPosition: Object.freeze([0, 0.95, -0.43]),
    restRotation: Object.freeze([0, 0, 0]),
    scale: 0.68,
    inspectionCameraPosition: Object.freeze([5, 2.3, -1.7]),
    inspectionCameraTarget: Object.freeze([5, 0.98, -2.95]),
  }),
  [FIBER_TOOL_IDS.PROTECTION_SLEEVE]: Object.freeze({
    id: FIBER_TOOL_IDS.PROTECTION_SLEEVE,
    name: 'Fiber Protection Sleeve',
    purpose: 'Protects the completed splice during a later finishing step.',
    restPosition: Object.freeze([1.08, 0.95, -0.05]),
    restRotation: Object.freeze([0, 0.24, Math.PI / 2]),
    scale: 0.9,
    inspectionCameraPosition: Object.freeze([6.05, 2.14, -1.45]),
    inspectionCameraTarget: Object.freeze([6.08, 0.95, -2.55]),
  }),
})

const FIBER_TOOL_CONFIGS = Object.freeze(
  Object.values(fiberToolConfigs),
)

function getFiberToolConfig(toolId) {
  return fiberToolConfigs[toolId] ?? null
}

export {
  FIBER_TOOL_CONFIGS,
  FIBER_TOOL_IDS,
  fiberToolConfigs,
  getFiberToolConfig,
}
