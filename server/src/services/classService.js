import { randomInt } from 'node:crypto'
import { databasePool } from '../config/database.js'
import HttpError from '../utils/HttpError.js'
import { normalizeClassCode } from '../utils/classValidation.js'
import { getInstructorStudents } from './instructorService.js'

const CLASS_CODE_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CLASS_CODE_ATTEMPTS = 12

function generateClassCode() {
  let suffix = ''
  for (let index = 0; index < 6; index += 1) {
    suffix += CLASS_CODE_CHARACTERS[randomInt(CLASS_CODE_CHARACTERS.length)]
  }
  return `TS-${suffix}`
}

function mapClass(row) {
  return {
    id: Number(row.id),
    name: row.name,
    classCode: row.class_code,
    studentCount: Number(row.student_count ?? 0),
    isActive: Boolean(row.is_active),
    instructorId: Number(row.instructor_id),
    instructorName: row.instructor_name ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    enrolledAt: row.enrolled_at ?? null,
  }
}

function staffOwnershipSql(actor, alias = 'c') {
  if (actor.role === 'admin') return { sql: '1 = 1', parameters: [] }
  return { sql: `${alias}.instructor_id = ?`, parameters: [actor.id] }
}

async function getClassesForStaff(actor) {
  const ownership = staffOwnershipSql(actor)
  const [rows] = await databasePool.execute(
    `SELECT
       c.id,
       c.instructor_id,
       c.name,
       c.class_code,
       c.is_active,
       c.created_at,
       c.updated_at,
       CONCAT(u.first_name, ' ', u.last_name) AS instructor_name,
       COUNT(ce.id) AS student_count
     FROM classes c
     INNER JOIN users u ON u.id = c.instructor_id
     LEFT JOIN class_enrollments ce ON ce.class_id = c.id
     WHERE ${ownership.sql}
     GROUP BY c.id, u.first_name, u.last_name
     ORDER BY c.created_at DESC, c.id DESC`,
    ownership.parameters,
  )
  return { classes: rows.map(mapClass) }
}

async function getClassForStaff(actor, classId) {
  const ownership = staffOwnershipSql(actor)
  const [rows] = await databasePool.execute(
    `SELECT
       c.id,
       c.instructor_id,
       c.name,
       c.class_code,
       c.is_active,
       c.created_at,
       c.updated_at,
       CONCAT(u.first_name, ' ', u.last_name) AS instructor_name,
       COUNT(ce.id) AS student_count
     FROM classes c
     INNER JOIN users u ON u.id = c.instructor_id
     LEFT JOIN class_enrollments ce ON ce.class_id = c.id
     WHERE c.id = ? AND ${ownership.sql}
     GROUP BY c.id, u.first_name, u.last_name
     LIMIT 1`,
    [classId, ...ownership.parameters],
  )

  if (!rows[0]) {
    throw new HttpError(404, 'Class was not found.', 'CLASS_NOT_FOUND')
  }
  return mapClass(rows[0])
}

async function createClass(actor, { name }) {
  for (let attempt = 0; attempt < CLASS_CODE_ATTEMPTS; attempt += 1) {
    const classCode = generateClassCode()
    try {
      const [result] = await databasePool.execute(
        `INSERT INTO classes (instructor_id, name, class_code)
         VALUES (?, ?, ?)`,
        [actor.id, name, classCode],
      )
      return getClassForStaff(actor, result.insertId)
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') continue
      throw error
    }
  }

  throw new HttpError(
    503,
    'A unique class code could not be generated. Please try again.',
    'CLASS_CODE_UNAVAILABLE',
  )
}

async function updateClass(actor, classId, values) {
  await getClassForStaff(actor, classId)
  const assignments = []
  const parameters = []

  if (values.name !== undefined) {
    assignments.push('name = ?')
    parameters.push(values.name)
  }
  if (values.isActive !== undefined) {
    assignments.push('is_active = ?')
    parameters.push(values.isActive)
  }

  await databasePool.execute(
    `UPDATE classes SET ${assignments.join(', ')} WHERE id = ?`,
    [...parameters, classId],
  )
  return getClassForStaff(actor, classId)
}

async function getClassStudents(actor, classId, filters) {
  const classRecord = await getClassForStaff(actor, classId)
  const studentData = await getInstructorStudents(filters, actor, { classId })
  return { class: classRecord, ...studentData }
}

async function findClassByCode(connection, rawClassCode, { lock = false } = {}) {
  const classCode = normalizeClassCode(rawClassCode)
  const [rows] = await connection.execute(
    `SELECT id, instructor_id, name, class_code, is_active, created_at, updated_at
     FROM classes
     WHERE class_code = ?
     LIMIT 1${lock ? ' FOR UPDATE' : ''}`,
    [classCode],
  )
  const classRecord = rows[0]

  if (!classRecord) {
    throw new HttpError(404, 'Class code was not found.', 'CLASS_NOT_FOUND')
  }
  if (!classRecord.is_active) {
    throw new HttpError(409, 'This class is not accepting enrollments.', 'CLASS_INACTIVE')
  }
  return classRecord
}

async function enrollStudent(connection, classId, studentId) {
  const [result] = await connection.execute(
    `INSERT IGNORE INTO class_enrollments (class_id, student_id)
     VALUES (?, ?)`,
    [classId, studentId],
  )
  return result.affectedRows === 1
}

async function joinClass(student, rawClassCode) {
  const connection = await databasePool.getConnection()
  try {
    await connection.beginTransaction()
    const [studentRows] = await connection.execute(
      `SELECT id FROM users
       WHERE id = ? AND role = 'student' AND is_active = TRUE
       LIMIT 1 FOR UPDATE`,
      [student.id],
    )
    if (!studentRows[0]) {
      throw new HttpError(403, 'Student access is required.', 'STUDENT_ACCESS_REQUIRED')
    }

    const classRecord = await findClassByCode(connection, rawClassCode, { lock: true })
    const created = await enrollStudent(connection, classRecord.id, student.id)
    await connection.commit()

    return {
      status: created ? 'joined' : 'already_enrolled',
      message: created
        ? 'Class joined successfully.'
        : 'You are already enrolled in this class.',
      class: mapClass({ ...classRecord, student_count: 0 }),
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

async function getStudentClasses(studentId) {
  const [rows] = await databasePool.execute(
    `SELECT
       c.id,
       c.instructor_id,
       c.name,
       c.class_code,
       c.is_active,
       c.created_at,
       c.updated_at,
       ce.enrolled_at,
       CONCAT(u.first_name, ' ', u.last_name) AS instructor_name
     FROM class_enrollments ce
     INNER JOIN classes c ON c.id = ce.class_id
     INNER JOIN users u ON u.id = c.instructor_id
     WHERE ce.student_id = ?
     ORDER BY ce.enrolled_at DESC, c.name`,
    [studentId],
  )
  return { classes: rows.map(mapClass) }
}

export {
  createClass,
  enrollStudent,
  findClassByCode,
  generateClassCode,
  getClassesForStaff,
  getClassForStaff,
  getClassStudents,
  getStudentClasses,
  joinClass,
  updateClass,
}
