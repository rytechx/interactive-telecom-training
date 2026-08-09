import useNetworkTrainingStore from '../../store/useNetworkTrainingStore.js'
import {
  getRouterInterfaceStatus,
  getSwitchManagementStatus,
} from './networkConnectivity.js'

export default function LogicalNetworkStatus() {
  const workstationIpConfigured = useNetworkTrainingStore(
    (state) => state.workstationIpConfigured,
  )
  const routerLanConfigured = useNetworkTrainingStore(
    (state) => state.routerLanConfigured,
  )
  const switchManagementConfigured = useNetworkTrainingStore(
    (state) => state.switchManagementConfigured,
  )
  const routerPingPassed = useNetworkTrainingStore(
    (state) => state.routerPingPassed,
  )
  const switchPingPassed = useNetworkTrainingStore(
    (state) => state.switchPingPassed,
  )
  const routerLanUp = useNetworkTrainingStore(
    (state) => getRouterInterfaceStatus(state).status === 'up',
  )
  const switchManagementUp = useNetworkTrainingStore(
    (state) => getSwitchManagementStatus(state).status === 'up',
  )

  return (
    <div className="network-logical-status" aria-label="Logical network status">
      <strong>Logical Network Status</strong>
      <span className={workstationIpConfigured ? 'is-complete' : ''}>
        Workstation IPv4
        <b>{workstationIpConfigured ? 'CONFIGURED' : 'PENDING'}</b>
      </span>
      <span className={routerLanConfigured ? 'is-complete' : ''}>
        Router LAN
        <b>
          {routerLanConfigured && routerLanUp ? 'UP' : 'PENDING'}
        </b>
      </span>
      <span className={switchManagementConfigured ? 'is-complete' : ''}>
        Switch Management
        <b>
          {switchManagementConfigured && switchManagementUp
            ? 'CONFIGURED'
            : 'PENDING'}
        </b>
      </span>
      <span className={routerPingPassed ? 'is-complete' : ''}>
        PC → Router <b>{routerPingPassed ? 'PASS' : 'NOT TESTED'}</b>
      </span>
      <span className={switchPingPassed ? 'is-complete' : ''}>
        PC → Switch <b>{switchPingPassed ? 'PASS' : 'NOT TESTED'}</b>
      </span>
    </div>
  )
}
