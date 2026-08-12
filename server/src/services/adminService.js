import { databasePool } from '../config/database.js'
import HttpError from '../utils/HttpError.js'
import { hashPassword } from '../utils/passwordSecurity.js'

function mapAccount(row) {
  return {
    id: Number(row.id),
    studentNumber: row.student_number,
    identifier: row.student_number ?? row.email,
    fullName: `${row.first_name} ${row.last_name}`.trim(),
    email: row.email,
    role: row.role,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  }
}

async function createStaffAccount({ firstName, lastName, email, password, role }) {
  const [existingUsers] = await databasePool.execute(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email],
  )

  if (existingUsers.length) {
    throw new HttpError(
      409,
      'An account with that email already exists.',
      'EMAIL_EXISTS',
    )
  }

  const passwordHash = await hashPassword(password)

  try {
    const [result] = await databasePool.execute(
      `INSERT INTO users
        (student_number, first_name, last_name, email, password_hash, role)
       VALUES (NULL, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, passwordHash, role],
    )
    const [rows] = await databasePool.execute(
      `SELECT id, student_number, first_name, last_name, email,
              role, is_active, created_at
       FROM users
       WHERE id = ?`,
      [result.insertId],
    )

    return mapAccount(rows[0])
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpError(
        409,
        'An account with that email already exists.',
        'EMAIL_EXISTS',
      )
    }
    throw error
  }
}

function createPagination(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalItems: total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}

async function getAdminUsers({ search, role, status, page, limit }) {
  const conditions = ['1 = 1']
  const parameters = []

  if (search) {
    const searchValue = `%${search}%`
    conditions.push(`(
      student_number LIKE ? OR
      first_name LIKE ? OR
      last_name LIKE ? OR
      email LIKE ? OR
      CONCAT(first_name, ' ', last_name) LIKE ?
    )`)
    parameters.push(
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      searchValue,
    )
  }

  if (role) {
    conditions.push('role = ?')
    parameters.push(role)
  }

  if (status) {
    conditions.push('is_active = ?')
    parameters.push(status === 'active')
  }

  const whereClause = conditions.join(' AND ')
  const [[countRows], [userRows]] = await Promise.all([
    databasePool.execute(
      `SELECT COUNT(*) AS total
       FROM users
       WHERE ${whereClause}`,
      parameters,
    ),
    databasePool.execute(
      `SELECT id, student_number, first_name, last_name, email,
              role, is_active, created_at
       FROM users
       WHERE ${whereClause}
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...parameters, limit, (page - 1) * limit],
    ),
  ])
  const total = Number(countRows[0]?.total ?? 0)

  return {
    users: userRows.map(mapAccount),
    pagination: createPagination(page, limit, total),
    filters: { search, role, status },
  }
}

async function readAccountForUpdate(connection, userId) {
  const [rows] = await connection.execute(
    `SELECT id, student_number, first_name, last_name, email,
            role, is_active, created_at
     FROM users
     WHERE id = ?
     FOR UPDATE`,
    [userId],
  )

  if (!rows.length) {
    throw new HttpError(404, 'User account was not found.', 'USER_NOT_FOUND')
  }

  return rows[0]
}

async function updateUserRole(actorId, userId, role) {
  if (actorId === userId) {
    throw new HttpError(
      409,
      'You cannot change the role of your current account.',
      'SELF_ROLE_CHANGE_FORBIDDEN',
    )
  }

  const connection = await databasePool.getConnection()

  try {
    await connection.beginTransaction()
    const account = await readAccountForUpdate(connection, userId)

    if (account.role !== role) {
      await connection.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, userId],
      )
      account.role = role
    }

    await connection.commit()
    return mapAccount(account)
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

async function updateUserStatus(actorId, userId, isActive) {
  if (actorId === userId && !isActive) {
    throw new HttpError(
      409,
      'You cannot deactivate your current account.',
      'SELF_DEACTIVATION_FORBIDDEN',
    )
  }

  const connection = await databasePool.getConnection()

  try {
    await connection.beginTransaction()
    const account = await readAccountForUpdate(connection, userId)

    if (Boolean(account.is_active) !== isActive) {
      await connection.execute(
        'UPDATE users SET is_active = ? WHERE id = ?',
        [isActive, userId],
      )
      account.is_active = isActive
    }

    await connection.commit()
    return mapAccount(account)
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export {
  createStaffAccount,
  getAdminUsers,
  updateUserRole,
  updateUserStatus,
}
