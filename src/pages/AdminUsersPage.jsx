import { useEffect, useState } from 'react'
import AdminAccountActionDialog from '../components/instructor/AdminAccountActionDialog.jsx'
import AdminCreateStaffDialog from '../components/instructor/AdminCreateStaffDialog.jsx'
import InstructorLoadingState from '../components/instructor/InstructorLoadingState.jsx'
import InstructorPagination from '../components/instructor/InstructorPagination.jsx'
import InstructorStatePanel from '../components/instructor/InstructorStatePanel.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import useAdminStore from '../store/useAdminStore.js'
import useAuthStore from '../store/useAuthStore.js'
import { formatDate } from '../utils/instructorFormatters.js'

const roleLabels = Object.freeze({
  student: 'Student',
  instructor: 'Instructor',
  admin: 'Administrator',
})

export default function AdminUsersPage() {
  const currentUserId = useAuthStore((state) => state.user?.id)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [pendingRoles, setPendingRoles] = useState({})
  const [pendingAction, setPendingAction] = useState(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const users = useAdminStore((state) => state.users)
  const pagination = useAdminStore((state) => state.pagination)
  const isLoading = useAdminStore((state) => state.isLoading)
  const error = useAdminStore((state) => state.error)
  const updatingUserId = useAdminStore((state) => state.updatingUserId)
  const isCreating = useAdminStore((state) => state.isCreating)
  const mutationError = useAdminStore((state) => state.mutationError)
  const mutationMessage = useAdminStore((state) => state.mutationMessage)
  const loadUsers = useAdminStore((state) => state.loadUsers)
  const createStaffAccount = useAdminStore(
    (state) => state.createStaffAccount,
  )
  const updateUserRole = useAdminStore((state) => state.updateUserRole)
  const updateUserStatus = useAdminStore((state) => state.updateUserStatus)
  const clearMutationState = useAdminStore(
    (state) => state.clearMutationState,
  )

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, 320)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    void loadUsers({ search: debouncedSearch, role, status, page, limit })
  }, [debouncedSearch, limit, loadUsers, page, role, status])

  const retry = () => void loadUsers({
    search: debouncedSearch,
    role,
    status,
    page,
    limit,
  })

  const confirmAction = async () => {
    if (!pendingAction) return
    const succeeded = pendingAction.type === 'role'
      ? await updateUserRole(
          pendingAction.user.id,
          pendingAction.nextRole,
        )
      : await updateUserStatus(
          pendingAction.user.id,
          pendingAction.nextIsActive,
        )

    if (succeeded && pendingAction.type === 'role') {
      setPendingRoles((current) => {
        const next = { ...current }
        delete next[pendingAction.user.id]
        return next
      })
    }
    setPendingAction(null)
  }

  return (
    <div className="application-page instructor-page admin-users-page">
      <PageHeader
        eyebrow="Administrator Controls"
        title="User Management"
        description="Manage account access and roles without altering historical training records."
        action={(
          <button
            type="button"
            className="admin-create-staff-button"
            onClick={() => {
              clearMutationState()
              setCreateDialogOpen(true)
            }}
          >
            Create Staff Account
          </button>
        )}
      />

      <section className="instructor-filter-bar" aria-label="User filters">
        <label>
          <span>Search</span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Name, email, or identifier"
          />
        </label>
        <label>
          <span>Role</span>
          <select value={role} onChange={(event) => {
            setRole(event.target.value)
            setPage(1)
          }}>
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
            <option value="admin">Administrators</option>
          </select>
        </label>
        <label>
          <span>Status</span>
          <select value={status} onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}>
            <option value="all">All Accounts</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label>
          <span>Rows</span>
          <select value={limit} onChange={(event) => {
            setLimit(Number(event.target.value))
            setPage(1)
          }}>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </label>
      </section>

      {(mutationError || mutationMessage) && (
        <div
          className={`admin-action-message ${mutationError ? 'is-error' : 'is-success'}`}
          role={mutationError ? 'alert' : 'status'}
        >
          <span>{mutationError ?? mutationMessage}</span>
          <button type="button" onClick={clearMutationState}>Dismiss</button>
        </div>
      )}

      {isLoading && !users.length ? (
        <InstructorLoadingState label="Loading user accounts..." />
      ) : error ? (
        <InstructorStatePanel
          title="Unable to load user accounts"
          message={error}
          onAction={retry}
        />
      ) : users.length ? (
        <>
          <section className="instructor-table-card">
            <div className="instructor-table-scroll">
              <table className="instructor-table admin-users-table">
                <thead>
                  <tr>
                    <th scope="col">Account</th>
                    <th scope="col">Identifier</th>
                    <th scope="col">Role</th>
                    <th scope="col">Status</th>
                    <th scope="col">Created</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isCurrentAccount = user.id === currentUserId
                    const selectedRole = pendingRoles[user.id] ?? user.role
                    const isUpdating = updatingUserId === user.id

                    return (
                      <tr key={user.id}>
                        <td><strong>{user.fullName}</strong><small>{user.email}</small></td>
                        <td>{user.identifier ?? user.studentNumber ?? 'Staff account'}</td>
                        <td>
                          <span className="admin-role-label">{roleLabels[user.role]}</span>
                        </td>
                        <td>
                          <span className={`instructor-status ${user.isActive ? 'is-completed' : 'is-inactive'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          {isCurrentAccount ? (
                            <span className="admin-current-account">Current Account</span>
                          ) : (
                            <div className="admin-user-actions">
                              <select
                                aria-label={`Role for ${user.fullName}`}
                                value={selectedRole}
                                disabled={isUpdating}
                                onChange={(event) => setPendingRoles((current) => ({
                                  ...current,
                                  [user.id]: event.target.value,
                                }))}
                              >
                                <option value="student">Student</option>
                                <option value="instructor">Instructor</option>
                                <option value="admin">Administrator</option>
                              </select>
                              <button
                                type="button"
                                disabled={selectedRole === user.role || isUpdating}
                                onClick={() => setPendingAction({
                                  type: 'role',
                                  user,
                                  nextRole: selectedRole,
                                })}
                              >
                                Save Role
                              </button>
                              <button
                                type="button"
                                className={!user.isActive ? 'is-activate' : 'is-deactivate'}
                                disabled={isUpdating}
                                onClick={() => setPendingAction({
                                  type: 'status',
                                  user,
                                  nextIsActive: !user.isActive,
                                })}
                              >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
          <InstructorPagination pagination={pagination} onPageChange={setPage} />
        </>
      ) : (
        <InstructorStatePanel
          title="No user accounts found"
          message="No accounts match the selected filters."
        />
      )}

      <AdminAccountActionDialog
        action={pendingAction}
        isLoading={Boolean(updatingUserId)}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => void confirmAction()}
      />
      <AdminCreateStaffDialog
        isOpen={createDialogOpen}
        isLoading={isCreating}
        onCancel={() => setCreateDialogOpen(false)}
        onSubmit={createStaffAccount}
        onCreated={() => {
          setCreateDialogOpen(false)
          if (page === 1) retry()
          else setPage(1)
        }}
      />
    </div>
  )
}
