function parseIPv4(value) {
  if (typeof value !== 'string') {
    return null
  }

  const normalizedValue = value.trim()

  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(normalizedValue)) {
    return null
  }

  const octets = normalizedValue.split('.').map(Number)

  return octets.every((octet) => octet >= 0 && octet <= 255)
    ? octets
    : null
}

function ipv4ToNumber(value) {
  const octets = Array.isArray(value) ? value : parseIPv4(value)

  if (!octets || octets.length !== 4) {
    return null
  }

  return (
    ((octets[0] << 24) >>> 0) +
    (octets[1] << 16) +
    (octets[2] << 8) +
    octets[3]
  ) >>> 0
}

function numberToIPv4(value) {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) {
    return null
  }

  return [24, 16, 8, 0]
    .map((shift) => (value >>> shift) & 255)
    .join('.')
}

function maskToPrefix(mask) {
  const octets = parseIPv4(mask)

  if (!octets) {
    return null
  }

  const bits = octets
    .map((octet) => octet.toString(2).padStart(8, '0'))
    .join('')

  if (!/^1*0*$/.test(bits)) {
    return null
  }

  return bits.indexOf('0') === -1 ? 32 : bits.indexOf('0')
}

function getNetworkAddress(ipAddress, subnetMask) {
  const ipNumber = ipv4ToNumber(ipAddress)
  const maskNumber = ipv4ToNumber(subnetMask)

  if (ipNumber === null || maskNumber === null || maskToPrefix(subnetMask) === null) {
    return null
  }

  return numberToIPv4((ipNumber & maskNumber) >>> 0)
}

function getBroadcastAddress(ipAddress, subnetMask) {
  const ipNumber = ipv4ToNumber(ipAddress)
  const maskNumber = ipv4ToNumber(subnetMask)

  if (ipNumber === null || maskNumber === null || maskToPrefix(subnetMask) === null) {
    return null
  }

  return numberToIPv4(((ipNumber & maskNumber) | (~maskNumber >>> 0)) >>> 0)
}

function isSameSubnet(firstIp, secondIp, subnetMask) {
  const firstNetwork = getNetworkAddress(firstIp, subnetMask)
  const secondNetwork = getNetworkAddress(secondIp, subnetMask)

  return Boolean(firstNetwork && secondNetwork && firstNetwork === secondNetwork)
}

function validateIPv4Values(values) {
  const entries = Object.values(values)

  if (entries.some((value) => !parseIPv4(value))) {
    return { valid: false, message: 'Invalid IPv4 address.' }
  }

  if (values.subnetMask && maskToPrefix(values.subnetMask) === null) {
    return { valid: false, message: 'Invalid IPv4 address.' }
  }

  return { valid: true, message: null }
}

export {
  getBroadcastAddress,
  getNetworkAddress,
  ipv4ToNumber,
  isSameSubnet,
  maskToPrefix,
  numberToIPv4,
  parseIPv4,
  validateIPv4Values,
}
