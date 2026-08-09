import { NETWORK_DEVICE_IDS } from './networkDeviceConfigs.js'
import { NETWORK_PROCEDURE_STEPS } from './networkProcedure.js'
import { NETWORK_TOPOLOGY } from './networkTopology.js'
import {
  canPing,
  getRouterInterfaceStatus,
  getSwitchManagementStatus,
  isRouterConfigurationCorrect,
  isSwitchConfigurationCorrect,
} from './networkConnectivity.js'
import { maskToPrefix, parseIPv4 } from './ipv4Utils.js'

const NETWORK_TERMINAL_TYPES = Object.freeze({
  ROUTER: 'router',
  SWITCH: 'switch',
  WORKSTATION: 'workstation',
})

const CLI_MODES = Object.freeze({
  USER_EXEC: 'user-exec',
  PRIVILEGED_EXEC: 'privileged-exec',
  GLOBAL_CONFIG: 'global-config',
  INTERFACE_CONFIG: 'interface-config',
})

const invalidModeOutput = '% Invalid input or command for current mode.'
const invalidInputOutput = '% Invalid input detected.'

function normalizeCommand(command) {
  return command.trim().replace(/\s+/g, ' ')
}

function getTerminalPrompt(terminalType, state) {
  if (terminalType === NETWORK_TERMINAL_TYPES.WORKSTATION) {
    return 'C:\\>'
  }

  const deviceName = terminalType === NETWORK_TERMINAL_TYPES.ROUTER
    ? 'Router'
    : 'Switch'
  const mode = terminalType === NETWORK_TERMINAL_TYPES.ROUTER
    ? state.routerCliMode
    : state.switchCliMode

  if (mode === CLI_MODES.PRIVILEGED_EXEC) {
    return `${deviceName}#`
  }

  if (mode === CLI_MODES.GLOBAL_CONFIG) {
    return `${deviceName}(config)#`
  }

  if (mode === CLI_MODES.INTERFACE_CONFIG) {
    return `${deviceName}(config-if)#`
  }

  return `${deviceName}>`
}

function applyRouterCompletion(state, updates) {
  const nextState = { ...state, ...updates }
  const routerLanConfigured = isRouterConfigurationCorrect(nextState)

  return {
    ...updates,
    routerLanConfigured,
    ...(routerLanConfigured &&
    state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.CONFIGURE_ROUTER
      ? {
          networkCurrentStep: NETWORK_PROCEDURE_STEPS.ROUTER_CONFIGURED,
          procedureFeedback: 'Router LAN configuration complete.',
        }
      : {}),
  }
}

function getRouterBrief(state) {
  const interfaceState = getRouterInterfaceStatus(state)
  const ipAddress = state.routerLanIp || 'unassigned'

  return [
    'Interface              IP-Address      Status                 Protocol',
    `${NETWORK_TOPOLOGY.router.interfaceName.padEnd(22)} ${ipAddress.padEnd(15)} ${interfaceState.status.padEnd(22)} ${interfaceState.protocol}`,
  ].join('\n')
}

function executeRouterCommand(command, state) {
  const normalizedCommand = normalizeCommand(command)
  const lowerCommand = normalizedCommand.toLowerCase()
  const mode = state.routerCliMode

  if (lowerCommand === 'enable') {
    return mode === CLI_MODES.USER_EXEC
      ? { output: '', updates: { routerCliMode: CLI_MODES.PRIVILEGED_EXEC } }
      : { output: invalidModeOutput }
  }

  if (lowerCommand === 'configure terminal') {
    return mode === CLI_MODES.PRIVILEGED_EXEC
      ? { output: 'Enter configuration commands, one per line.', updates: { routerCliMode: CLI_MODES.GLOBAL_CONFIG } }
      : { output: invalidModeOutput }
  }

  if (/^interface (?:gigabitethernet 0\/0|g0\/0)$/i.test(normalizedCommand)) {
    return mode === CLI_MODES.GLOBAL_CONFIG
      ? { output: '', updates: { routerCliMode: CLI_MODES.INTERFACE_CONFIG } }
      : { output: invalidModeOutput }
  }

  const ipMatch = normalizedCommand.match(/^ip address (\S+) (\S+)$/i)

  if (ipMatch) {
    if (mode !== CLI_MODES.INTERFACE_CONFIG) {
      return { output: invalidModeOutput }
    }

    if (!parseIPv4(ipMatch[1]) || maskToPrefix(ipMatch[2]) === null) {
      return { output: invalidInputOutput }
    }

    const updates = applyRouterCompletion(state, {
      routerLanIp: ipMatch[1],
      routerLanMask: ipMatch[2],
    })

    return {
      output: '',
      updates,
      feedback: updates.routerLanConfigured
        ? updates.procedureFeedback
        : 'The configured router address does not match the required LAN subnet.',
    }
  }

  if (lowerCommand === 'no shutdown') {
    if (mode !== CLI_MODES.INTERFACE_CONFIG) {
      return { output: invalidModeOutput }
    }

    const updates = applyRouterCompletion(state, { routerLanAdminUp: true })

    return {
      output: '%LINK-3-UPDOWN: Interface GigabitEthernet0/0, changed state to up',
      updates,
      feedback: updates.procedureFeedback,
    }
  }

  if (lowerCommand === 'exit') {
    const nextMode = mode === CLI_MODES.INTERFACE_CONFIG
      ? CLI_MODES.GLOBAL_CONFIG
      : mode === CLI_MODES.GLOBAL_CONFIG
        ? CLI_MODES.PRIVILEGED_EXEC
        : mode === CLI_MODES.PRIVILEGED_EXEC
          ? CLI_MODES.USER_EXEC
          : null

    return nextMode
      ? { output: '', updates: { routerCliMode: nextMode } }
      : { output: invalidModeOutput }
  }

  if (lowerCommand === 'end') {
    return mode === CLI_MODES.GLOBAL_CONFIG || mode === CLI_MODES.INTERFACE_CONFIG
      ? { output: '', updates: { routerCliMode: CLI_MODES.PRIVILEGED_EXEC } }
      : { output: invalidModeOutput }
  }

  if (lowerCommand === 'show ip interface brief') {
    return mode === CLI_MODES.USER_EXEC || mode === CLI_MODES.PRIVILEGED_EXEC
      ? { output: getRouterBrief(state) }
      : { output: invalidModeOutput }
  }

  return { output: invalidInputOutput }
}

function applySwitchCompletion(state, updates) {
  const nextState = { ...state, ...updates }
  const switchManagementConfigured = isSwitchConfigurationCorrect(nextState)

  return {
    ...updates,
    switchManagementConfigured,
    ...(switchManagementConfigured &&
    state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.CONFIGURE_SWITCH
      ? {
          networkCurrentStep: NETWORK_PROCEDURE_STEPS.SWITCH_CONFIGURED,
          procedureFeedback: 'Managed switch configuration complete.',
        }
      : {}),
  }
}

function getSwitchBrief(state) {
  const interfaceState = getSwitchManagementStatus(state)
  const ipAddress = state.switchManagementIp || 'unassigned'

  return [
    'Interface              IP-Address      Status                 Protocol',
    `${NETWORK_TOPOLOGY.switch.managementInterface.padEnd(22)} ${ipAddress.padEnd(15)} ${interfaceState.status.padEnd(22)} ${interfaceState.protocol}`,
  ].join('\n')
}

function getSwitchRunningConfig(state) {
  return [
    'Building configuration...',
    '',
    'interface Vlan1',
    state.switchManagementIp
      ? ` ip address ${state.switchManagementIp} ${state.switchManagementMask}`
      : ' no ip address',
    state.switchVlan1AdminUp ? ' no shutdown' : ' shutdown',
    '!',
    state.switchDefaultGateway
      ? `ip default-gateway ${state.switchDefaultGateway}`
      : 'no ip default-gateway',
    'end',
  ].join('\n')
}

function executeSwitchCommand(command, state) {
  const normalizedCommand = normalizeCommand(command)
  const lowerCommand = normalizedCommand.toLowerCase()
  const mode = state.switchCliMode

  if (lowerCommand === 'enable') {
    return mode === CLI_MODES.USER_EXEC
      ? { output: '', updates: { switchCliMode: CLI_MODES.PRIVILEGED_EXEC } }
      : { output: invalidModeOutput }
  }

  if (lowerCommand === 'configure terminal') {
    return mode === CLI_MODES.PRIVILEGED_EXEC
      ? { output: 'Enter configuration commands, one per line.', updates: { switchCliMode: CLI_MODES.GLOBAL_CONFIG } }
      : { output: invalidModeOutput }
  }

  if (lowerCommand === 'interface vlan 1') {
    return mode === CLI_MODES.GLOBAL_CONFIG
      ? { output: '', updates: { switchCliMode: CLI_MODES.INTERFACE_CONFIG } }
      : { output: invalidModeOutput }
  }

  const ipMatch = normalizedCommand.match(/^ip address (\S+) (\S+)$/i)

  if (ipMatch) {
    if (mode !== CLI_MODES.INTERFACE_CONFIG) {
      return { output: invalidModeOutput }
    }

    if (!parseIPv4(ipMatch[1]) || maskToPrefix(ipMatch[2]) === null) {
      return { output: invalidInputOutput }
    }

    const updates = applySwitchCompletion(state, {
      switchManagementIp: ipMatch[1],
      switchManagementMask: ipMatch[2],
    })

    return {
      output: '',
      updates,
      feedback: updates.switchManagementConfigured
        ? updates.procedureFeedback
        : 'The configured switch address does not match the required management subnet.',
    }
  }

  if (lowerCommand === 'no shutdown') {
    if (mode !== CLI_MODES.INTERFACE_CONFIG) {
      return { output: invalidModeOutput }
    }

    const updates = applySwitchCompletion(state, {
      switchVlan1AdminUp: true,
    })

    return {
      output: '%LINK-3-UPDOWN: Interface Vlan1, changed state to up',
      updates,
      feedback: updates.procedureFeedback,
    }
  }

  const gatewayMatch = normalizedCommand.match(/^ip default-gateway (\S+)$/i)

  if (gatewayMatch) {
    if (mode !== CLI_MODES.GLOBAL_CONFIG) {
      return { output: invalidModeOutput }
    }

    if (!parseIPv4(gatewayMatch[1])) {
      return { output: invalidInputOutput }
    }

    const updates = applySwitchCompletion(state, {
      switchDefaultGateway: gatewayMatch[1],
    })

    return {
      output: '',
      updates,
      feedback: updates.switchManagementConfigured
        ? updates.procedureFeedback
        : 'The switch default gateway does not match the required router address.',
    }
  }

  if (lowerCommand === 'exit') {
    const nextMode = mode === CLI_MODES.INTERFACE_CONFIG
      ? CLI_MODES.GLOBAL_CONFIG
      : mode === CLI_MODES.GLOBAL_CONFIG
        ? CLI_MODES.PRIVILEGED_EXEC
        : mode === CLI_MODES.PRIVILEGED_EXEC
          ? CLI_MODES.USER_EXEC
          : null

    return nextMode
      ? { output: '', updates: { switchCliMode: nextMode } }
      : { output: invalidModeOutput }
  }

  if (lowerCommand === 'end') {
    return mode === CLI_MODES.GLOBAL_CONFIG || mode === CLI_MODES.INTERFACE_CONFIG
      ? { output: '', updates: { switchCliMode: CLI_MODES.PRIVILEGED_EXEC } }
      : { output: invalidModeOutput }
  }

  if (lowerCommand === 'show ip interface brief') {
    return mode === CLI_MODES.USER_EXEC || mode === CLI_MODES.PRIVILEGED_EXEC
      ? { output: getSwitchBrief(state) }
      : { output: invalidModeOutput }
  }

  if (lowerCommand === 'show running-config') {
    return mode === CLI_MODES.PRIVILEGED_EXEC
      ? { output: getSwitchRunningConfig(state) }
      : { output: invalidModeOutput }
  }

  return { output: invalidInputOutput }
}

function getIpConfigOutput(state) {
  return [
    'Ethernet adapter Ethernet:',
    '',
    `   IPv4 Address. . . . . . . . . . : ${state.workstationIp || 'Not configured'}`,
    `   Subnet Mask . . . . . . . . . . : ${state.workstationMask || 'Not configured'}`,
    `   Default Gateway . . . . . . . . : ${state.workstationGateway || 'Not configured'}`,
  ].join('\n')
}

function getPingOutput(destinationIp, successful) {
  if (!successful) {
    return [
      `Pinging ${destinationIp} with 32 bytes of data:`,
      '',
      'Request timed out.',
      'Request timed out.',
      'Request timed out.',
      'Request timed out.',
      '',
      'Ping statistics:',
      '    Sent = 4, Received = 0, Lost = 4 (100% loss)',
    ].join('\n')
  }

  return [
    `Pinging ${destinationIp} with 32 bytes of data:`,
    '',
    `Reply from ${destinationIp}: bytes=32 time<1ms TTL=64`,
    `Reply from ${destinationIp}: bytes=32 time<1ms TTL=64`,
    `Reply from ${destinationIp}: bytes=32 time<1ms TTL=64`,
    `Reply from ${destinationIp}: bytes=32 time<1ms TTL=64`,
    '',
    'Ping statistics:',
    '    Sent = 4, Received = 4, Lost = 0 (0% loss)',
  ].join('\n')
}

function executeWorkstationCommand(command, state) {
  const normalizedCommand = normalizeCommand(command)
  const lowerCommand = normalizedCommand.toLowerCase()

  if (lowerCommand === 'cls') {
    return { output: '', clearHistory: true }
  }

  if (lowerCommand === 'ipconfig' || lowerCommand === 'ipconfig /all') {
    const verified = state.workstationIpConfigured

    return {
      output: getIpConfigOutput(state),
      updates:
        verified &&
        state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.VERIFY_PC_CONFIG
          ? {
              pcConfigVerified: true,
              networkCurrentStep: NETWORK_PROCEDURE_STEPS.PC_CONFIG_VERIFIED,
              procedureFeedback: 'Workstation IPv4 configuration verified.',
            }
          : {},
    }
  }

  const pingMatch = normalizedCommand.match(/^ping (\S+)$/i)

  if (pingMatch) {
    const destinationIp = pingMatch[1]

    if (!parseIPv4(destinationIp)) {
      return { output: 'Ping request could not find host.' }
    }

    const successful = canPing(
      NETWORK_DEVICE_IDS.WORKSTATION_PC,
      destinationIp,
      state,
    )
    const updates = {}
    let feedback = successful
      ? `Connectivity to ${destinationIp} verified.`
      : `Connectivity to ${destinationIp} failed.`

    if (
      state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.PING_ROUTER &&
      destinationIp === NETWORK_TOPOLOGY.router.lanIp &&
      successful
    ) {
      updates.routerPingPassed = true
      updates.networkCurrentStep = NETWORK_PROCEDURE_STEPS.ROUTER_PING_PASS
      updates.procedureFeedback = 'PC to Router connectivity: PASS'
      feedback = updates.procedureFeedback
    } else if (
      state.networkCurrentStep === NETWORK_PROCEDURE_STEPS.PING_SWITCH &&
      destinationIp === NETWORK_TOPOLOGY.switch.managementIp &&
      successful
    ) {
      updates.switchPingPassed = true
      updates.networkCurrentStep = NETWORK_PROCEDURE_STEPS.SWITCH_PING_PASS
      updates.procedureFeedback = 'PC to Switch connectivity: PASS'
      feedback = updates.procedureFeedback
    }

    return {
      output: getPingOutput(destinationIp, successful),
      updates,
      feedback,
    }
  }

  return {
    output: `'${normalizedCommand}' is not recognized as a supported training command.`,
  }
}

function executeTerminalCommand(terminalType, command, state) {
  if (terminalType === NETWORK_TERMINAL_TYPES.ROUTER) {
    return executeRouterCommand(command, state)
  }

  if (terminalType === NETWORK_TERMINAL_TYPES.SWITCH) {
    return executeSwitchCommand(command, state)
  }

  return executeWorkstationCommand(command, state)
}

export {
  CLI_MODES,
  executeTerminalCommand,
  getTerminalPrompt,
  NETWORK_TERMINAL_TYPES,
}
