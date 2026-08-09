const NETWORK_TOPOLOGY = Object.freeze({
  subnet: '192.168.10.0',
  prefixLength: 24,
  subnetMask: '255.255.255.0',
  broadcast: '192.168.10.255',
  router: Object.freeze({
    lanIp: '192.168.10.1',
    interfaceName: 'GigabitEthernet0/0',
  }),
  switch: Object.freeze({
    managementIp: '192.168.10.2',
    managementInterface: 'Vlan1',
    defaultGateway: '192.168.10.1',
  }),
  workstation: Object.freeze({
    ip: '192.168.10.10',
    gateway: '192.168.10.1',
    interfaceName: 'Ethernet',
  }),
})

export { NETWORK_TOPOLOGY }
