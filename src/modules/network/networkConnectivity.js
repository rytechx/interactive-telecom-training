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

function getRouterInterfaceStatus(state) {
  if (!state.routerLanAdminUp) {
    return { status: 'administratively down', protocol: 'down' }
  }

  if (
    !state.networkPowered ||
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
    !state.networkPowered ||
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
    !state.networkPowered ||
    !state.pcSwitchConnected ||
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
    return false
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

export {
  canPing,
  getRouterInterfaceStatus,
  getSwitchManagementStatus,
  isRouterConfigurationCorrect,
  isSwitchConfigurationCorrect,
  isWorkstationConfigurationCorrect,
}
