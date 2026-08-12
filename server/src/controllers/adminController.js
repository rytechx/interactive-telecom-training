import {
  createStaffAccount,
  getAdminUsers,
  updateUserRole,
  updateUserStatus,
} from '../services/adminService.js'
import {
  parseAdminUserListQuery,
  parseRoleUpdate,
  parseStatusUpdate,
  validateStaffAccountInput,
} from '../utils/adminValidation.js'
import { parsePositiveId } from '../utils/instructorValidation.js'

async function users(request, response, next) {
  try {
    response.json({
      success: true,
      data: await getAdminUsers(parseAdminUserListQuery(request.query)),
    })
  } catch (error) {
    next(error)
  }
}

async function createStaff(request, response, next) {
  const validation = validateStaffAccountInput(request.body)

  if (!validation.isValid) {
    response.status(400).json({
      success: false,
      message: 'Please correct the highlighted staff account fields.',
      errors: validation.errors,
    })
    return
  }

  try {
    response.status(201).json({
      success: true,
      message: 'Staff account created successfully.',
      data: {
        user: await createStaffAccount(validation.values),
      },
    })
  } catch (error) {
    next(error)
  }
}

async function userRole(request, response, next) {
  try {
    response.json({
      success: true,
      data: {
        user: await updateUserRole(
          request.user.id,
          parsePositiveId(request.params.userId, 'User'),
          parseRoleUpdate(request.body),
        ),
      },
    })
  } catch (error) {
    next(error)
  }
}

async function userStatus(request, response, next) {
  try {
    response.json({
      success: true,
      data: {
        user: await updateUserStatus(
          request.user.id,
          parsePositiveId(request.params.userId, 'User'),
          parseStatusUpdate(request.body),
        ),
      },
    })
  } catch (error) {
    next(error)
  }
}

export { createStaff, userRole, users, userStatus }
