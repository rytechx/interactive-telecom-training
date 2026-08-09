import {
  FIBER_WORKSTATION,
  NETWORK_WORKSTATION,
  RJ45_WORKSTATION,
} from '../workstations/workstationConfigs.js'

const TRAINING_MODULE_IDS = Object.freeze({
  RJ45: 'rj45',
  FIBER: 'fiber',
  NETWORK: 'network',
})

const TRAINING_MODULE_STATUS = Object.freeze({
  NOT_ATTEMPTED: 'not-attempted',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
})

const TRAINING_MODULES = Object.freeze([
  Object.freeze({
    id: TRAINING_MODULE_IDS.RJ45,
    title: 'RJ45 Cable Termination',
    shortTitle: 'RJ45 Termination',
    description:
      'Practice cable preparation, T568B conductor arrangement, RJ45 insertion, crimping, and cable testing.',
    category: 'Copper Cabling',
    difficulty: 'Beginner',
    icon: 'rj45',
    workstationId: RJ45_WORKSTATION.id,
    objective: 'Locate and interact with the RJ45 workstation.',
  }),
  Object.freeze({
    id: TRAINING_MODULE_IDS.FIBER,
    title: 'Fiber Optic Fusion Splicing',
    shortTitle: 'Fiber Fusion Splicing',
    description:
      'Practice fiber preparation, coating removal, cleaning, cleaving, alignment, fusion splicing, protection, and inspection.',
    category: 'Fiber Optics',
    difficulty: 'Intermediate',
    icon: 'fiber',
    workstationId: FIBER_WORKSTATION.id,
    objective: 'Locate and interact with the Fiber workstation.',
  }),
  Object.freeze({
    id: TRAINING_MODULE_IDS.NETWORK,
    title: 'Network Device Installation & Troubleshooting',
    shortTitle: 'Network Installation',
    description:
      'Install and cable network devices, configure IPv4 and CLI interfaces, verify connectivity, and diagnose network faults.',
    category: 'Networking & Troubleshooting',
    difficulty: 'Intermediate / Advanced',
    icon: 'network',
    workstationId: NETWORK_WORKSTATION.id,
    objective: 'Proceed to the Network training station.',
  }),
])

function getTrainingModule(moduleId) {
  return TRAINING_MODULES.find((module) => module.id === moduleId) ?? null
}

export {
  getTrainingModule,
  TRAINING_MODULE_IDS,
  TRAINING_MODULE_STATUS,
  TRAINING_MODULES,
}
