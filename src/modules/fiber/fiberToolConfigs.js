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
    restPosition: Object.freeze([-1.08, 0.962, 0.25]),
    restRotation: Object.freeze([0, 0.12, -0.1]),
    scale: 0.72,
    inspectionCameraPosition: Object.freeze([3.92, 2.16, -1.05]),
    inspectionCameraTarget: Object.freeze([3.92, 0.96, -2.25]),
  }),
  [FIBER_TOOL_IDS.PRECISION_STRIPPER]: Object.freeze({
    id: FIBER_TOOL_IDS.PRECISION_STRIPPER,
    name: 'Precision Fiber Stripper',
    purpose:
      'Precisely removes the fiber buffer and coating without damaging the glass strand.',
    restPosition: Object.freeze([-0.7, 0.962, 0.28]),
    restRotation: Object.freeze([0, -0.1, 0.08]),
    scale: 0.62,
    inspectionCameraPosition: Object.freeze([4.3, 2.15, -1.05]),
    inspectionCameraTarget: Object.freeze([4.3, 0.96, -2.22]),
  }),
  [FIBER_TOOL_IDS.CLEANING_PAD]: Object.freeze({
    id: FIBER_TOOL_IDS.CLEANING_PAD,
    name: 'Lint-Free Fiber Cleaning Wipe',
    purpose: 'Removes coating residue from bare fiber before precision cleaving.',
    restPosition: Object.freeze([-0.68, 0.944, -0.01]),
    restRotation: Object.freeze([0, 0.06, 0]),
    scale: 0.88,
    inspectionCameraPosition: Object.freeze([4.32, 2.12, -1.36]),
    inspectionCameraTarget: Object.freeze([4.32, 0.95, -2.51]),
  }),
  [FIBER_TOOL_IDS.CLEAVER]: Object.freeze({
    id: FIBER_TOOL_IDS.CLEAVER,
    name: 'Fiber Cleaver',
    purpose: 'Positions and cleaves bare fiber to create a clean square end.',
    restPosition: Object.freeze([-1.04, 0.953, -0.33]),
    restRotation: Object.freeze([0, 0.06, 0]),
    scale: 0.74,
    inspectionCameraPosition: Object.freeze([3.96, 2.16, -1.78]),
    inspectionCameraTarget: Object.freeze([3.96, 0.96, -2.83]),
  }),
  [FIBER_TOOL_IDS.FUSION_SPLICER]: Object.freeze({
    id: FIBER_TOOL_IDS.FUSION_SPLICER,
    name: 'Fusion Splicer',
    purpose: 'Loads, aligns, and arc-fuses two prepared optical fibers.',
    restPosition: Object.freeze([0, 0.95, -0.43]),
    restRotation: Object.freeze([0, 0, 0]),
    scale: 0.82,
    inspectionCameraPosition: Object.freeze([5, 2.3, -1.7]),
    inspectionCameraTarget: Object.freeze([5, 0.98, -2.95]),
  }),
  [FIBER_TOOL_IDS.PROTECTION_SLEEVE]: Object.freeze({
    id: FIBER_TOOL_IDS.PROTECTION_SLEEVE,
    name: 'Splice Protection Sleeve',
    purpose:
      'A heat-shrink tube with an internal reinforcement rod that protects a completed fusion joint.',
    restPosition: Object.freeze([1.02, 0.965, -0.02]),
    restRotation: Object.freeze([0, -0.16, 0]),
    scale: 0.72,
    inspectionCameraPosition: Object.freeze([6.02, 2.1, -1.42]),
    inspectionCameraTarget: Object.freeze([6.02, 0.96, -2.52]),
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
