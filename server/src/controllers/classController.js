import {
  createClass,
  getClassesForStaff,
  getClassForStaff,
  getClassStudents,
  getStudentClasses,
  joinClass,
  updateClass,
} from '../services/classService.js'
import {
  validateClassCode,
  validateClassCreateInput,
  validateClassUpdateInput,
} from '../utils/classValidation.js'
import {
  parseInstructorListQuery,
  parsePositiveId,
} from '../utils/instructorValidation.js'

function sendValidationError(response, message, errors) {
  response.status(400).json({ success: false, message, errors })
}

async function staffClasses(request, response, next) {
  try {
    response.json({ success: true, data: await getClassesForStaff(request.user) })
  } catch (error) {
    next(error)
  }
}

async function staffClass(request, response, next) {
  try {
    response.json({
      success: true,
      data: {
        class: await getClassForStaff(
          request.user,
          parsePositiveId(request.params.classId, 'Class'),
        ),
      },
    })
  } catch (error) {
    next(error)
  }
}

async function staffCreateClass(request, response, next) {
  try {
    const validation = validateClassCreateInput(request.body)
    if (!validation.isValid) {
      sendValidationError(response, 'Please enter a valid class name.', validation.errors)
      return
    }
    const classRecord = await createClass(request.user, validation.values)
    response.status(201).json({ success: true, data: { class: classRecord } })
  } catch (error) {
    next(error)
  }
}

async function staffUpdateClass(request, response, next) {
  try {
    const validation = validateClassUpdateInput(request.body)
    if (!validation.isValid) {
      sendValidationError(response, 'Please correct the class details.', validation.errors)
      return
    }
    const classRecord = await updateClass(
      request.user,
      parsePositiveId(request.params.classId, 'Class'),
      validation.values,
    )
    response.json({ success: true, data: { class: classRecord } })
  } catch (error) {
    next(error)
  }
}

async function staffClassStudents(request, response, next) {
  try {
    response.json({
      success: true,
      data: await getClassStudents(
        request.user,
        parsePositiveId(request.params.classId, 'Class'),
        parseInstructorListQuery(request.query),
      ),
    })
  } catch (error) {
    next(error)
  }
}

async function studentClasses(request, response, next) {
  try {
    response.json({ success: true, data: await getStudentClasses(request.user.id) })
  } catch (error) {
    next(error)
  }
}

async function studentJoinClass(request, response, next) {
  try {
    const validation = validateClassCode(request.body?.classCode)
    if (validation.error) {
      sendValidationError(response, validation.error, { classCode: validation.error })
      return
    }
    response.json({
      success: true,
      data: await joinClass(request.user, validation.classCode),
    })
  } catch (error) {
    next(error)
  }
}

export {
  staffClass,
  staffClasses,
  staffClassStudents,
  staffCreateClass,
  staffUpdateClass,
  studentClasses,
  studentJoinClass,
}
