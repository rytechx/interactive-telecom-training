import {
  getInstructorAttemptDetail,
  getInstructorModuleAnalytics,
  getInstructorOverview,
  getInstructorResults,
  getInstructorStudentAttempts,
  getInstructorStudentDetail,
  getInstructorStudents,
  getInstructorTroubleshootingAnalytics,
} from '../services/instructorService.js'
import {
  parseAttemptListQuery,
  parseInstructorListQuery,
  parsePositiveId,
} from '../utils/instructorValidation.js'

async function overview(request, response, next) {
  void request
  try {
    response.json({ success: true, data: await getInstructorOverview() })
  } catch (error) {
    next(error)
  }
}

async function students(request, response, next) {
  try {
    response.json({
      success: true,
      data: await getInstructorStudents(
        parseInstructorListQuery(request.query),
      ),
    })
  } catch (error) {
    next(error)
  }
}

async function studentDetail(request, response, next) {
  try {
    response.json({
      success: true,
      data: await getInstructorStudentDetail(
        parsePositiveId(request.params.studentId, 'Student'),
      ),
    })
  } catch (error) {
    next(error)
  }
}

async function studentAttempts(request, response, next) {
  try {
    response.json({
      success: true,
      data: await getInstructorStudentAttempts(
        parsePositiveId(request.params.studentId, 'Student'),
        parseAttemptListQuery(request.query),
      ),
    })
  } catch (error) {
    next(error)
  }
}

async function studentAttemptDetail(request, response, next) {
  try {
    response.json({
      success: true,
      data: await getInstructorAttemptDetail(
        parsePositiveId(request.params.studentId, 'Student'),
        parsePositiveId(request.params.attemptId, 'Attempt'),
      ),
    })
  } catch (error) {
    next(error)
  }
}

async function modules(request, response, next) {
  void request
  try {
    response.json({
      success: true,
      data: await getInstructorModuleAnalytics(),
    })
  } catch (error) {
    next(error)
  }
}

async function results(request, response, next) {
  try {
    response.json({
      success: true,
      data: await getInstructorResults(parseAttemptListQuery(request.query)),
    })
  } catch (error) {
    next(error)
  }
}

async function troubleshooting(request, response, next) {
  void request
  try {
    response.json({
      success: true,
      data: await getInstructorTroubleshootingAnalytics(),
    })
  } catch (error) {
    next(error)
  }
}

export {
  modules,
  overview,
  results,
  studentAttemptDetail,
  studentAttempts,
  studentDetail,
  students,
  troubleshooting,
}
