import { NETWORK_DEVICE_IDS } from './networkDeviceConfigs.js'
import { NETWORK_TOPOLOGY } from './networkTopology.js'
import {
  getNetworkAddress,
  ipv4ToNumber,
  isSameSubnet,
  maskToPrefix,
  parseIPv4,
} from './ipv4Utils.js'

function addressesMatch(firstAddress, secondAddress) {
  return ipv4ToNumber(firstAddress) === ipv4ToNumber(secondAddress)
}

function isExpectedSubnet(ipAddress, subnetMask) {
  return (
    maskToPrefix(subnetMask) === NETWORK_TOPOLOGY.prefixLength &&
    getNetworkAddress(ipAddress, subnetMask) === NETWORK_TOPOLOGY.subnet
  )
}

function isWorkstationConfigurationCorrect(state) {
  return Boolean(
    parseIPv4(state.workstationIp) &&
      isExpectedSubnet(state.workstationIp, state.workstationMask) &&
      addressesMatch(state.workstationIp, NETWORK_TOPOLOGY.workstation.ip) &&
      addressesMatch(state.workstationGateway, NETWORK_TOPOLOGY.workstation.gateway) &&
      isSameSubnet(
        state.workstationIp,
        state.workstationGateway,
        state.workstationMask,
      ),
  )
}

function isRouterConfigurationCorrect(state) {
  return Boolean(
    parseIPv4(state.routerLanIp) &&
      isExpectedSubnet(state.routerLanIp, state.routerLanMask) &&
      addressesMatch(state.routerLanIp, NETWORK_TOPOLOGY.router.lanIp) &&
      state.routerLanAdminUp,
  )
}

function isSwitchConfigurationCorrect(state) {
  return Boolean(
    parseIPv4(state.switchManagementIp) &&
      isExpectedSubnet(state.switchManagementIp, state.switchManagementMask) &&
      addressesMatch(
        state.switchManagementIp,
        NETWORK_TOPOLOGY.switch.managementIp,
      ) &&
      addressesMatch(
        state.switchDefaultGateway,
        NETWORK_TOPOLOGY.switch.defaultGateway,
      ) &&
      isSameSubnet(
        state.switchManagementIp,
        state.switchDefaultGateway,
        state.switchManagementMask,
      ) &&
      state.switchVlan1AdminUp,
  )
}

function isRouterPowered(state) {
  return Boolean(state.networkPowered && state.routerPowerConnected)
}

function isSwitchPowered(state) {
  return Boolean(state.networkPowered && state.switchPowerConnected)
}

function isSwitchReady(state) {
  return Boolean(
    isSwitchPowered(state) &&
      (!state.switchStartupReadyAt || Date.now() >= state.switchStartupReadyAt),
  )
}

function isPcSwitchLinkReady(state) {
  return Boolean(
    state.pcSwitchConnected &&
      isSwitchReady(state) &&
      (!state.pcLinkReadyAt || Date.now() >= state.pcLinkReadyAt),
  )
}

function getRouterInterfaceStatus(state) {
  if (!state.routerLanAdminUp) {
    return { status: 'administratively down', protocol: 'down' }
  }

  if (
    !isRouterPowered(state) ||
    !isSwitchReady(state) ||
    !state.switchRouterConnected ||
    !parseIPv4(state.routerLanIp) ||
    maskToPrefix(state.routerLanMask) === null
  ) {
    return { status: 'down', protocol: 'down' }
  }

  return { status: 'up', protocol: 'up' }
}

function getSwitchManagementStatus(state) {
  if (!state.switchVlan1AdminUp) {
    return { status: 'administratively down', protocol: 'down' }
  }

  if (
    !isSwitchReady(state) ||
    (!state.pcSwitchConnected && !state.switchRouterConnected) ||
    !parseIPv4(state.switchManagementIp) ||
    maskToPrefix(state.switchManagementMask) === null
  ) {
    return { status: 'down', protocol: 'down' }
  }

  return { status: 'up', protocol: 'up' }
}

function canPing(sourceDeviceId, destinationIp, state) {
  if (
    sourceDeviceId !== NETWORK_DEVICE_IDS.WORKSTATION_PC ||
    !state.workstationIpConfigured ||
    !isPcSwitchLinkReady(state) ||
    !parseIPv4(state.workstationIp) ||
    maskToPrefix(state.workstationMask) === null ||
    !parseIPv4(destinationIp)
  ) {
    return false
  }

  const isLocalDestination = isSameSubnet(
    state.workstationIp,
    destinationIp,
    state.workstationMask,
  )

  if (!isLocalDestination) {
    const gatewayCorrect = Boolean(
      parseIPv4(state.workstationGateway) &&
        addressesMatch(
          state.workstationGateway,
          NETWORK_TOPOLOGY.workstation.gateway,
        ) &&
        isSameSubnet(
          state.workstationIp,
          state.workstationGateway,
          state.workstationMask,
        ),
    )
    const routerStatus = getRouterInterfaceStatus(state)

    return Boolean(
      addressesMatch(destinationIp, NETWORK_TOPOLOGY.remoteHost.ip) &&
        isWorkstationConfigurationCorrect(state) &&
        gatewayCorrect &&
        state.switchRouterConnected &&
        routerStatus.status === 'up' &&
        routerStatus.protocol === 'up',
    )
  }

  if (addressesMatch(destinationIp, state.routerLanIp)) {
    const routerStatus = getRouterInterfaceStatus(state)
    return routerStatus.status === 'up' && routerStatus.protocol === 'up'
  }

  if (addressesMatch(destinationIp, state.switchManagementIp)) {
    const switchStatus = getSwitchManagementStatus(state)
    return switchStatus.status === 'up' && switchStatus.protocol === 'up'
  }

  return addressesMatch(destinationIp, state.workstationIp)
}

function getActiveNetworkLinkPortIds(state) {
  const activePortIds = []

  if (state.patchSwitchConnected && isSwitchPowered(state)) {
    activePortIds.push('patch-panel-port-1', 'switch-port-1')
  }

  if (state.pcSwitchConnected && isSwitchPowered(state)) {
    activePortIds.push('pc-eth0', 'switch-port-2')
  }

  if (
    state.switchRouterConnected &&
    isSwitchPowered(state) &&
    isRouterPowered(state)
  ) {
    activePortIds.push('switch-port-8', 'router-lan-1')
  }

  return activePortIds
}

export {
  canPing,
  getActiveNetworkLinkPortIds,
  getRouterInterfaceStatus,
  getSwitchManagementStatus,
  isRouterPowered,
  isRouterConfigurationCorrect,
  isPcSwitchLinkReady,
  isSwitchPowered,
  isSwitchReady,
  isSwitchConfigurationCorrect,
  isWorkstationConfigurationCorrect,
}
