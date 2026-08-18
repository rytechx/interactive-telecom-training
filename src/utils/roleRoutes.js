const STAFF_ROLES = Object.freeze(['instructor', 'admin'])

function isStaffRole(role) {
  return STAFF_ROLES.includes(role)
}

function getHomeRouteForRole(role) {
  return isStaffRole(role) ? '/instructor' : '/dashboard'
}

export { getHomeRouteForRole, isStaffRole, STAFF_ROLES }
