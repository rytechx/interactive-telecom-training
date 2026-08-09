import { databasePool } from '../config/database.js'
import HttpError from '../utils/HttpError.js'
import { derivePerformanceRating } from '../utils/trainingValidation.js'

function parseJson(value) {
  if (!value) return {}
  if (typeof value === 'object') return value

  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

function mapAttempt(row, { includeMetrics = false } = {}) {
  const attempt = {
    attemptId: Number(row.id),
    moduleKey: row.module_key,
    moduleName: row.module_name,
    attemptNumber: Number(row.attempt_number),
    status: row.status,
    score: row.score === null ? null : Number(row.score),
    performanceRating: row.performance_rating,
    procedureAccuracy:
      row.procedure_accuracy === null ? null : Number(row.procedure_accuracy),
    durationSeconds:
      row.duration_seconds === null ? null : Number(row.duration_seconds),
    startedAt: row.started_at,
    completedAt: row.completed_at,
  }

  if (includeMetrics) {
    attempt.metrics = parseJson(row.metrics_json)
  }

  return attempt
}

function mapScenario(row) {
  return {
    scenarioKey: row.scenario_key,
    scenarioTitle: row.scenario_title,
    score: Number(row.score),
    performanceRating: row.performance_rating,
    durationSeconds: Number(row.duration_seconds),
    diagnosisAttempts: Number(row.diagnosis_attempts),
    incorrectDiagnosisAttempts: Number(row.incorrect_diagnosis_attempts),
    repairAttempts: Number(row.repair_attempts),
    failedRepairAttempts: Number(row.failed_repair_attempts),
    hintsUsed: Number(row.hints_used),
    diagnosticCommands: parseJson(row.diagnostic_commands_json),
    metrics: parseJson(row.metrics_json),
    completedAt: row.completed_at,
  }
}

async function startAttempt(userId, moduleKey) {
  const connection = await databasePool.getConnection()

  try {
    await connection.beginTransaction()
    const [modules] = await connection.execute(
      `SELECT id, module_key
       FROM training_modules
       WHERE module_key = ? AND is_active = TRUE
       LIMIT 1`,
      [moduleKey],
    )
    const module = modules[0]

    if (!module) {
      throw new HttpError(404, 'Training module is unavailable.', 'MODULE_NOT_FOUND')
    }

    await connection.execute('SELECT id FROM users WHERE id = ? FOR UPDATE', [userId])
    const [attemptRows] = await connection.execute(
      `SELECT COALESCE(MAX(attempt_number), 0) + 1 AS next_attempt_number
       FROM training_attempts
       WHERE user_id = ? AND module_id = ?`,
      [userId, module.id],
    )
    const attemptNumber = Number(attemptRows[0].next_attempt_number)
    const [result] = await connection.execute(
      `INSERT INTO training_attempts
         (user_id, module_id, attempt_number, status)
       VALUES (?, ?, ?, 'in_progress')`,
      [userId, module.id, attemptNumber],
    )
    const [createdRows] = await connection.execute(
      `SELECT id, started_at
       FROM training_attempts
       WHERE id = ?`,
      [result.insertId],
    )

    await connection.commit()

    return {
      attemptId: Number(result.insertId),
      moduleKey,
      attemptNumber,
      startedAt: createdRows[0].started_at,
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

async function completeAttempt(userId, attemptId, completion) {
  const connection = await databasePool.getConnection()

  try {
    await connection.beginTransaction()
    const [attempts] = await connection.execute(
      `SELECT a.id, a.attempt_number, a.status, a.score,
              a.performance_rating, a.procedure_accuracy, a.duration_seconds,
              a.started_at, a.completed_at, a.metrics_json,
              m.module_key, m.name AS module_name
       FROM training_attempts a
       INNER JOIN training_modules m ON m.id = a.module_id
       WHERE a.id = ? AND a.user_id = ?
       FOR UPDATE`,
      [attemptId, userId],
    )
    const attempt = attempts[0]

    if (!attempt) {
      throw new HttpError(404, 'Training attempt was not found.', 'ATTEMPT_NOT_FOUND')
    }

    if (attempt.module_key !== completion.moduleKey) {
      throw new HttpError(409, 'Training attempt does not match this module.', 'MODULE_MISMATCH')
    }

    if (attempt.status === 'completed') {
      await connection.commit()
      return { ...mapAttempt(attempt, { includeMetrics: true }), alreadyCompleted: true }
    }

    if (attempt.status !== 'in_progress') {
      throw new HttpError(409, 'Only an in-progress attempt can be completed.', 'ATTEMPT_NOT_ACTIVE')
    }

    const performanceRating = derivePerformanceRating(completion.score)
    await connection.execute(
      `UPDATE training_attempts
       SET status = 'completed', score = ?, performance_rating = ?,
           procedure_accuracy = ?, duration_seconds = ?, metrics_json = ?,
           completed_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [
        completion.score,
        performanceRating,
        completion.procedureAccuracy,
        completion.durationSeconds,
        JSON.stringify(completion.metrics),
        attemptId,
        userId,
      ],
    )
    const [completedRows] = await connection.execute(
      `SELECT a.id, a.attempt_number, a.status, a.score,
              a.performance_rating, a.procedure_accuracy, a.duration_seconds,
              a.started_at, a.completed_at, a.metrics_json,
              m.module_key, m.name AS module_name
       FROM training_attempts a
       INNER JOIN training_modules m ON m.id = a.module_id
       WHERE a.id = ?`,
      [attemptId],
    )

    await connection.commit()
    return mapAttempt(completedRows[0], { includeMetrics: true })
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

async function saveNetworkScenario(userId, attemptId, scenario) {
  const connection = await databasePool.getConnection()

  try {
    await connection.beginTransaction()
    const [attempts] = await connection.execute(
      `SELECT a.id, a.status, m.module_key
       FROM training_attempts a
       INNER JOIN training_modules m ON m.id = a.module_id
       WHERE a.id = ? AND a.user_id = ?
       FOR UPDATE`,
      [attemptId, userId],
    )
    const attempt = attempts[0]

    if (!attempt) {
      throw new HttpError(404, 'Training attempt was not found.', 'ATTEMPT_NOT_FOUND')
    }

    if (attempt.module_key !== 'network') {
      throw new HttpError(409, 'Scenario results require a Network attempt.', 'MODULE_MISMATCH')
    }

    const [existingRows] = await connection.execute(
      `SELECT *
       FROM network_scenario_results
       WHERE attempt_id = ? AND scenario_key = ?
       LIMIT 1`,
      [attemptId, scenario.scenarioKey],
    )

    if (existingRows[0]) {
      await connection.commit()
      return { ...mapScenario(existingRows[0]), alreadySaved: true }
    }

    const performanceRating = derivePerformanceRating(scenario.score)
    await connection.execute(
      `INSERT INTO network_scenario_results
         (attempt_id, scenario_key, scenario_title, score,
          performance_rating, duration_seconds, diagnosis_attempts,
          incorrect_diagnosis_attempts, repair_attempts,
          failed_repair_attempts, hints_used, diagnostic_commands_json,
          metrics_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        attemptId,
        scenario.scenarioKey,
        scenario.scenarioTitle,
        scenario.score,
        performanceRating,
        scenario.durationSeconds,
        scenario.diagnosisAttempts,
        scenario.incorrectDiagnosisAttempts,
        scenario.repairAttempts,
        scenario.failedRepairAttempts,
        scenario.hintsUsed,
        JSON.stringify(scenario.diagnosticCommands),
        JSON.stringify(scenario.metrics),
      ],
    )
    const [createdRows] = await connection.execute(
      `SELECT *
       FROM network_scenario_results
       WHERE attempt_id = ? AND scenario_key = ?`,
      [attemptId, scenario.scenarioKey],
    )

    await connection.commit()
    return mapScenario(createdRows[0])
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

async function getTrainingProgress(userId) {
  const [modules] = await databasePool.execute(
    `SELECT id, module_key, name, category, difficulty
     FROM training_modules
     WHERE is_active = TRUE
     ORDER BY id`,
  )
  const [attempts] = await databasePool.execute(
    `SELECT a.id, a.module_id, a.attempt_number, a.status, a.score,
            a.performance_rating, a.started_at, a.completed_at,
            m.module_key, m.name AS module_name
     FROM training_attempts a
     INNER JOIN training_modules m ON m.id = a.module_id
     WHERE a.user_id = ? AND m.is_active = TRUE
     ORDER BY COALESCE(a.completed_at, a.started_at) DESC, a.id DESC`,
    [userId],
  )
  const moduleProgress = {}

  modules.forEach((module) => {
    const moduleAttempts = attempts.filter((attempt) => attempt.module_id === module.id)
    const completedAttempts = moduleAttempts.filter(
      (attempt) => attempt.status === 'completed',
    )
    const latestCompleted = completedAttempts[0] ?? null
    const bestScore = completedAttempts.length
      ? Math.max(...completedAttempts.map((attempt) => Number(attempt.score)))
      : null

    moduleProgress[module.module_key] = {
      status: completedAttempts.length
        ? 'completed'
        : moduleAttempts.some((attempt) => attempt.status === 'in_progress')
          ? 'in_progress'
          : 'not_attempted',
      attemptCount: moduleAttempts.length,
      completedAttemptCount: completedAttempts.length,
      latestScore: latestCompleted ? Number(latestCompleted.score) : null,
      bestScore,
      performanceRating: latestCompleted?.performance_rating ?? null,
      latestCompletedAt: latestCompleted?.completed_at ?? null,
    }
  })

  const completedModules = Object.values(moduleProgress).filter(
    (module) => module.status === 'completed',
  )
  const averageScore = completedModules.length
    ? Math.round(
        completedModules.reduce((total, module) => total + module.bestScore, 0) /
          completedModules.length,
      )
    : null
  const recentActivity = attempts
    .filter((attempt) => attempt.status === 'completed')
    .slice(0, 5)
    .map((attempt) => ({
      attemptId: Number(attempt.id),
      moduleKey: attempt.module_key,
      moduleName: attempt.module_name,
      attemptNumber: Number(attempt.attempt_number),
      score: Number(attempt.score),
      performanceRating: attempt.performance_rating,
      completedAt: attempt.completed_at,
    }))

  return {
    modulesCompleted: completedModules.length,
    totalModules: modules.length,
    overallProgress: modules.length
      ? Math.round((completedModules.length / modules.length) * 100)
      : 0,
    averageScore,
    averageScorePolicy: 'best_completed_attempt_per_module',
    modules: moduleProgress,
    recentActivity,
  }
}

async function getAttempts(userId, { moduleKey = null, status = null, limit = 50 } = {}) {
  const conditions = ['a.user_id = ?']
  const parameters = [userId]

  if (moduleKey) {
    conditions.push('m.module_key = ?')
    parameters.push(moduleKey)
  }

  if (status) {
    conditions.push('a.status = ?')
    parameters.push(status)
  }

  parameters.push(limit)
  const [attempts] = await databasePool.execute(
    `SELECT a.id, a.attempt_number, a.status, a.score,
            a.performance_rating, a.procedure_accuracy, a.duration_seconds,
            a.started_at, a.completed_at, m.module_key,
            m.name AS module_name
     FROM training_attempts a
     INNER JOIN training_modules m ON m.id = a.module_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY COALESCE(a.completed_at, a.started_at) DESC, a.id DESC
     LIMIT ?`,
    parameters,
  )

  return attempts.map((attempt) => mapAttempt(attempt))
}

async function getAttemptDetail(userId, attemptId) {
  const [attempts] = await databasePool.execute(
    `SELECT a.id, a.attempt_number, a.status, a.score,
            a.performance_rating, a.procedure_accuracy, a.duration_seconds,
            a.started_at, a.completed_at, a.metrics_json,
            m.module_key, m.name AS module_name
     FROM training_attempts a
     INNER JOIN training_modules m ON m.id = a.module_id
     WHERE a.id = ? AND a.user_id = ?
     LIMIT 1`,
    [attemptId, userId],
  )
  const attempt = attempts[0]

  if (!attempt) {
    throw new HttpError(404, 'Training attempt was not found.', 'ATTEMPT_NOT_FOUND')
  }

  let scenarios = []

  if (attempt.module_key === 'network') {
    const [scenarioRows] = await databasePool.execute(
      `SELECT *
       FROM network_scenario_results
       WHERE attempt_id = ?
       ORDER BY completed_at, id`,
      [attemptId],
    )
    scenarios = scenarioRows.map(mapScenario)
  }

  return {
    ...mapAttempt(attempt, { includeMetrics: true }),
    scenarios,
  }
}

export {
  completeAttempt,
  getAttemptDetail,
  getAttempts,
  getTrainingProgress,
  saveNetworkScenario,
  startAttempt,
}
