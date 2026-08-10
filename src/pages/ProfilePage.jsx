import PageHeader from '../components/layout/PageHeader.jsx'
import useAuthStore from '../store/useAuthStore.js'
import TelecomIcon from '../ui/TelecomIcon.jsx'
import { isStaffRole } from '../utils/roleRoutes.js'

function formatRole(role) {
  return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Student'
}

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return null
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim()
  const staffProfile = isStaffRole(user.role)

  return (
    <div className="application-page profile-page">
      <PageHeader
        eyebrow={staffProfile ? 'Staff Account' : 'Student Account'}
        title="Profile"
        description="Review the identity information associated with your secure TeleSim session."
      />

      <section className="profile-summary-card">
        <header>
          <span><TelecomIcon name="user" size={30} /></span>
          <div>
            <small>{formatRole(user.role)}</small>
            <h2>{fullName}</h2>
            {!staffProfile && user.studentNumber && <p>{user.studentNumber}</p>}
          </div>
        </header>

        <dl>
          {!staffProfile && user.studentNumber && (
            <div>
              <dt>Student Number</dt>
              <dd>{user.studentNumber}</dd>
            </div>
          )}
          <div>
            <dt>Full Name</dt>
            <dd>{fullName}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Account Role</dt>
            <dd>{formatRole(user.role)}</dd>
          </div>
        </dl>

        <p className="profile-readonly-note">
          Profile editing and password management will be added in a future account-management sprint.
        </p>
      </section>
    </div>
  )
}
