import {
  TRAINING_MODULE_IDS,
  TRAINING_MODULE_STATUS,
} from '../app/trainingModules.js'

function clampProgress(value) {
  return Math.min(100, Math.max(0, Math.round(value)))
}

function getSkillStatus(progress) {
  if (progress >= 100) return 'Completed'
  if (progress > 0) return 'In Progress'
  return 'Not Started'
}

function createSkill(id, label, progress) {
  const normalizedProgress = clampProgress(progress)

  return {
    id,
    label,
    progress: normalizedProgress,
    status: getSkillStatus(normalizedProgress),
  }
}

function getModuleSkillProgress(module) {
  if (!module) return 0
  if (module.status === TRAINING_MODULE_STATUS.COMPLETED) return 100
  return module.progressPercent ?? 0
}

function deriveTrainingSkills({ modules, networkState, scenarioCount }) {
  const moduleById = Object.fromEntries(
    modules.map((module) => [module.id, module]),
  )
  const networkCompleted =
    moduleById[TRAINING_MODULE_IDS.NETWORK]?.status ===
    TRAINING_MODULE_STATUS.COMPLETED
  const physicalMilestones = [
    networkState.patchPanelInstalled,
    networkState.switchInstalled,
    networkState.routerInstalled,
    networkState.routerPowerConnected,
    networkState.switchPowerConnected,
    networkState.patchSwitchConnected,
    networkState.switchRouterConnected,
    networkState.pcSwitchConnected,
    networkState.physicalLinksVerified,
  ]
  const physicalProgress = networkCompleted
    ? 100
    : (physicalMilestones.filter(Boolean).length / physicalMilestones.length) * 100
  const cliProgress = networkCompleted
    ? 100
    : ([
        networkState.routerLanConfigured,
        networkState.switchManagementConfigured,
      ].filter(Boolean).length /
        2) *
      100
  const completedScenarios = Object.values(
    networkState.scenarioResults ?? {},
  ).filter((record) => record?.latestResult).length
  const troubleshootingProgress = networkCompleted
    ? 100
    : scenarioCount
      ? (completedScenarios / scenarioCount) * 100
      : 0

  return [
    createSkill(
      'copper-cabling',
      'Copper Cabling',
      getModuleSkillProgress(moduleById[TRAINING_MODULE_IDS.RJ45]),
    ),
    createSkill(
      'fiber-optics',
      'Fiber Optics',
      getModuleSkillProgress(moduleById[TRAINING_MODULE_IDS.FIBER]),
    ),
    createSkill('network-installation', 'Network Installation', physicalProgress),
    createSkill(
      'ipv4-configuration',
      'IPv4 Configuration',
      networkCompleted || networkState.workstationIpConfigured ? 100 : 0,
    ),
    createSkill('cli-configuration', 'CLI Configuration', cliProgress),
    createSkill(
      'network-troubleshooting',
      'Network Troubleshooting',
      troubleshootingProgress,
    ),
  ]
}

export { deriveTrainingSkills }
