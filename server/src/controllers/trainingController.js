import {
  completeAttempt as completeTrainingAttempt,
  getAttemptDetail,
  getAttempts,
  getTrainingProgress,
  saveNetworkScenario,
  startAttempt as createTrainingAttempt,
} from '../services/trainingService.js'
import HttpError from '../utils/HttpError.js'
import {
  MODULE_KEYS,
  validateCompletionInput,
  validateScenarioInput,
  validateStartAttemptInput,
} from '../utils/trainingValidation.js'

function parseAttemptId(value) {
  const attemptId = Number.parseInt(value, 10)

  if (!Number.isInteger(attemptId) || attemptId <= 0 || String(attemptId) !== String(value)) {
    throw new HttpError(400, 'Attempt ID must be a positive integer.', 'INVALID_ATTEMPT_ID')
  }

  return attemptId
}

function validationFailure(response, validation) {
  response.status(400).json({
    success: false,
    message: 'Please correct the training result data.',
    errors: validation.errors,
  })
}

async function startAttempt(request, response, next) {
  const validation = validateStartAttemptInput(request.body)

  if (!validation.isValid) {
    validationFailure(response, validation)
    return
  }

  try {
    const attempt = await createTrainingAttempt(
      request.user.id,
      validation.values.moduleKey,
    )
    response.status(201).json({ success: true, data: attempt })
  } catch (error) {
    next(error)
  }
}

async function completeAttempt(request, response, next) {
  const validation = validateCompletionInput(request.body)

  if (!validation.isValid) {
    validationFailure(response, validation)
    return
  }

  try {
    const attempt = await completeTrainingAttempt(
      request.user.id,
      parseAttemptId(request.params.attemptId),
      validation.values,
    )
    response.json({ success: true, data: attempt })
  } catch (error) {
    next(error)
  }
}

async function saveScenario(request, response, next) {
  const validation = validateScenarioInput(request.body)

  if (!validation.isValid) {
    validationFailure(response, validation)
    return
  }

  try {
    const scenario = await saveNetworkScenario(
      request.user.id,
      parseAttemptId(request.params.attemptId),
      validation.values,
    )
    response.status(scenario.alreadySaved ? 200 : 201).json({
      success: true,
      data: scenario,
    })
  } catch (error) {
    next(error)
  }
}

async function progress(request, response, next) {
  try {
    response.json({
      success: true,
      data: await getTrainingProgress(request.user.id),
    })
  } catch (error) {
    next(error)
  }
}

async function listAttempts(request, response, next) {
  const moduleKey = request.query.moduleKey?.trim().toLowerCase() || null
  const status = request.query.status?.trim().toLowerCase() || null
  const parsedLimit = request.query.limit
    ? Number.parseInt(request.query.limit, 10)
    : 50

  if (moduleKey && !MODULE_KEYS.includes(moduleKey)) {
    next(new HttpError(400, 'Module filter is invalid.', 'INVALID_MODULE_FILTER'))
    return
  }

  if (status && !['in_progress', 'completed', 'abandoned'].includes(status)) {
    next(new HttpError(400, 'Status filter is invalid.', 'INVALID_STATUS_FILTER'))
    return
  }

  if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    next(new HttpError(400, 'Limit must be from 1 to 100.', 'INVALID_LIMIT'))
    return
  }

  try {
    response.json({
      success: true,
      data: {
        attempts: await getAttempts(request.user.id, {
          moduleKey,
          status,
          limit: parsedLimit,
        }),
      },
    })
  } catch (error) {
    next(error)
  }
}

async function attemptDetail(request, response, next) {
  try {
    response.json({
      success: true,
      data: await getAttemptDetail(
        request.user.id,
        parseAttemptId(request.params.attemptId),
      ),
    })
  } catch (error) {
    next(error)
  }
}

export {
  attemptDetail,
  completeAttempt,
  listAttempts,
  progress,
  saveScenario,
  startAttempt,
}
