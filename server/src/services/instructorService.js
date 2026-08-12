import { databasePool } from '../config/database.js'
import HttpError from '../utils/HttpError.js'

const NEEDS_PRACTICE_THRESHOLD = 70
const SCORE_DISTRIBUTION_BANDS = Object.freeze([
  Object.freeze({ key: 'below_60', label: '<60' }),
  Object.freeze({ key: '60_69', label: '60-69' }),
  Object.freeze({ key: '70_79', label: '70-79' }),
  Object.freeze({ key: '80_89', label: '80-89' }),
  Object.freeze({ key: '90_94', label: '90-94' }),
  Object.freeze({ key: '95_100', label: '95-100' }),
])
const TROUBLESHOOTING_SCENARIOS = Object.freeze([
  Object.freeze({ key: 'wrong-workstation-ip', title: 'Wrong PC IPv4 Address' }),
  Object.freeze({ key: 'router-interface-down', title: 'Router Interface Down' }),
  Object.freeze({ key: 'wrong-switch-ip', title: 'Switch Management Address Error' }),
  Object.freeze({ key: 'wrong-default-gateway', title: 'Default Gateway Error' }),
  Object.freeze({ key: 'pc-switch-disconnected', title: 'Physical Cable Fault' }),
  Object.freeze({ key: 'switch-power-failure', title: 'Device Power Fault' }),
])

const STUDENT_RECORDS_SQL = `
  SELECT
    u.id,
    u.student_number,
    u.first_name,
    u.last_name,
    CONCAT(u.first_name, ' ', u.last_name) AS full_name,
    u.email,
    u.is_active,
    COALESCE(progress.total_attempts, 0) AS total_attempts,
    COALESCE(progress.completed_attempts, 0) AS completed_attempts,
    COALESCE(progress.modules_completed, 0) AS modules_completed,
    module_totals.total_modules,
    CASE
      WHEN module_totals.total_modules = 0 THEN 0
      ELSE ROUND(
        COALESCE(progress.modules_completed, 0) /
        module_totals.total_modules * 100
      )
    END AS overall_progress,
    progress.average_best_score,
    activity.latest_activity,
    CASE
      WHEN u.is_active = FALSE THEN 'inactive'
      WHEN COALESCE(progress.total_attempts, 0) = 0 THEN 'not_started'
      WHEN COALESCE(progress.low_score_modules, 0) > 0 THEN 'needs_practice'
      WHEN module_totals.total_modules > 0
        AND COALESCE(progress.modules_completed, 0) >= module_totals.total_modules
        THEN 'completed'
      ELSE 'in_progress'
    END AS training_status
  FROM users u
  CROSS JOIN (
    SELECT COUNT(*) AS total_modules
    FROM training_modules
    WHERE is_active = TRUE
  ) module_totals
  LEFT JOIN (
    SELECT
      module_progress.user_id,
      SUM(module_progress.attempt_count) AS total_attempts,
      SUM(module_progress.completed_attempt_count) AS completed_attempts,
      SUM(module_progress.completed_flag) AS modules_completed,
      ROUND(AVG(
        CASE
          WHEN module_progress.completed_flag = 1
            THEN module_progress.best_score
          ELSE NULL
        END
      ), 1) AS average_best_score,
      SUM(
        CASE
          WHEN module_progress.completed_flag = 1
            AND module_progress.best_score < ${NEEDS_PRACTICE_THRESHOLD}
            THEN 1
          ELSE 0
        END
      ) AS low_score_modules
    FROM (
      SELECT
        a.user_id,
        a.module_id,
        COUNT(*) AS attempt_count,
        SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END)
          AS completed_attempt_count,
        MAX(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END)
          AS completed_flag,
        MAX(CASE WHEN a.status = 'completed' THEN a.score ELSE NULL END)
          AS best_score
      FROM training_attempts a
      INNER JOIN training_modules m
        ON m.id = a.module_id AND m.is_active = TRUE
      GROUP BY a.user_id, a.module_id
    ) module_progress
    GROUP BY module_progress.user_id
  ) progress ON progress.user_id = u.id
  LEFT JOIN (
    SELECT
      user_id,
      MAX(COALESCE(completed_at, started_at)) AS latest_activity
    FROM training_attempts
    GROUP BY user_id
  ) activity ON activity.user_id = u.id
  WHERE u.role = 'student'
`

function parseJson(value) {
  if (!value) return {}
  if (typeof value === 'object') return value

  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

function toNumber(value) {
  return value === null || value === undefined ? null : Number(value)
}

function round(value, precision = 1) {
  if (!Number.isFinite(value)) return null
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

function mapStudentRecord(row) {
  return {
    id: Number(row.id),
    studentNumber: row.student_number,
    fullName: row.full_name,
    email: row.email,
    isActive: Boolean(row.is_active),
    modulesCompleted: Number(row.modules_completed),
    totalModules: Number(row.total_modules),
    overallProgress: Number(row.overall_progress),
    averageBestScore: toNumber(row.average_best_score),
    totalAttempts: Number(row.total_attempts),
    completedAttempts: Number(row.completed_attempts),
    latestActivity: row.latest_activity,
    status: row.training_status,
  }
}

function mapAttempt(row, { includeMetrics = false } = {}) {
  const attempt = {
    attemptId: Number(row.id),
    studentId: Number(row.user_id),
    studentNumber: row.student_number,
    studentName: row.full_name,
    moduleKey: row.module_key,
    moduleName: row.module_name,
    attemptNumber: Number(row.attempt_number),
    status: row.status,
    score: toNumber(row.score),
    performanceRating: row.performance_rating,
    procedureAccuracy: toNumber(row.procedure_accuracy),
    durationSeconds: toNumber(row.duration_seconds),
    startedAt: row.started_at,
    completedAt: row.completed_at,
  }

  if (includeMetrics) attempt.metrics = parseJson(row.metrics_json)
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

function createPagination(page, limit, totalItems) {
  return {
    page,
    limit,
    total: totalItems,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / limit)),
  }
}

function buildSearchConditions(search, conditions, parameters, alias = 'records') {
  if (!search) return
  const searchValue = `%${search}%`

  conditions.push(`(
    ${alias}.student_number LIKE ? OR
    ${alias}.first_name LIKE ? OR
    ${alias}.last_name LIKE ? OR
    ${alias}.email LIKE ? OR
    ${alias}.full_name LIKE ?
  )`)
  parameters.push(
    searchValue,
    searchValue,
    searchValue,
    searchValue,
    searchValue,
  )
}

async function getInstructorOverview() {
  const [[headlineRows], [statusRows], [moduleRows], [recentRows]] =
    await Promise.all([
      databasePool.execute(
        `SELECT
           COUNT(*) AS total_students,
           SUM(CASE WHEN records.is_active = TRUE THEN 1 ELSE 0 END)
             AS active_students,
           SUM(CASE WHEN records.total_attempts > 0 THEN 1 ELSE 0 END)
             AS students_with_activity,
           SUM(
             CASE
               WHEN records.total_modules > 0
                 AND records.modules_completed >= records.total_modules
                 THEN 1
               ELSE 0
             END
           ) AS students_completing_all_modules,
           ROUND(AVG(records.average_best_score), 1) AS average_overall_score,
           SUM(records.completed_attempts) AS total_completed_attempts
         FROM (${STUDENT_RECORDS_SQL}) records`,
      ),
      databasePool.execute(
        `SELECT training_status, COUNT(*) AS total
         FROM (${STUDENT_RECORDS_SQL}) records
         GROUP BY training_status`,
      ),
      databasePool.execute(
        `SELECT
           m.module_key,
           m.name AS module_name,
           totals.total_students,
           COALESCE(attempt_totals.total_attempts, 0) AS total_attempts,
           COUNT(module_best.user_id) AS students_completed,
           CASE
             WHEN totals.total_students = 0 THEN 0
             ELSE ROUND(
               COUNT(module_best.user_id) / totals.total_students * 100
             )
           END AS completion_rate,
           ROUND(AVG(module_best.best_score), 1) AS average_best_score
         FROM training_modules m
         CROSS JOIN (
           SELECT COUNT(*) AS total_students
           FROM users
           WHERE role = 'student'
         ) totals
         LEFT JOIN (
           SELECT a.module_id, COUNT(*) AS total_attempts
           FROM training_attempts a
           INNER JOIN users u ON u.id = a.user_id AND u.role = 'student'
           GROUP BY a.module_id
         ) attempt_totals ON attempt_totals.module_id = m.id
         LEFT JOIN (
           SELECT a.module_id, a.user_id, MAX(a.score) AS best_score
           FROM training_attempts a
           INNER JOIN users u ON u.id = a.user_id AND u.role = 'student'
           WHERE a.status = 'completed'
           GROUP BY a.module_id, a.user_id
         ) module_best ON module_best.module_id = m.id
         WHERE m.is_active = TRUE
         GROUP BY
           m.id,
           m.module_key,
           m.name,
           totals.total_students,
           attempt_totals.total_attempts
         ORDER BY m.id`,
      ),
      databasePool.execute(
        `SELECT
           a.id,
           a.user_id,
           u.student_number,
           CONCAT(u.first_name, ' ', u.last_name) AS full_name,
           a.attempt_number,
           a.status,
           a.score,
           a.performance_rating,
           a.procedure_accuracy,
           a.duration_seconds,
           a.started_at,
           a.completed_at,
           m.module_key,
           m.name AS module_name
         FROM training_attempts a
         INNER JOIN users u ON u.id = a.user_id AND u.role = 'student'
         INNER JOIN training_modules m ON m.id = a.module_id
         WHERE a.status = 'completed'
         ORDER BY a.completed_at DESC, a.id DESC
         LIMIT 8`,
      ),
    ])

  const headline = headlineRows[0] ?? {}
  const statusBreakdown = Object.fromEntries(
    statusRows.map((row) => [row.training_status, Number(row.total)]),
  )

  return {
    metrics: {
      totalStudents: Number(headline.total_students ?? 0),
      activeStudents: Number(headline.active_students ?? 0),
      studentsWithActivity: Number(headline.students_with_activity ?? 0),
      studentsCompletingAllModules: Number(
        headline.students_completing_all_modules ?? 0,
      ),
      averageOverallScore: toNumber(headline.average_overall_score),
      totalCompletedAttempts: Number(headline.total_completed_attempts ?? 0),
    },
    statusBreakdown: {
      notStarted: statusBreakdown.not_started ?? 0,
      inProgress: statusBreakdown.in_progress ?? 0,
      completed: statusBreakdown.completed ?? 0,
      needsPractice: statusBreakdown.needs_practice ?? 0,
      inactive: statusBreakdown.inactive ?? 0,
    },
    statusPolicy: {
      needsPracticeThreshold: NEEDS_PRACTICE_THRESHOLD,
      averageScore: 'average_of_each_students_best_completed_module_scores',
    },
    modules: moduleRows.map((row) => ({
      moduleKey: row.module_key,
      moduleName: row.module_name,
      studentsCompleted: Number(row.students_completed),
      totalStudents: Number(row.total_students),
      totalAttempts: Number(row.total_attempts),
      completionRate: Number(row.completion_rate),
      averageBestScore: toNumber(row.average_best_score),
    })),
    recentActivity: recentRows.map((row) => mapAttempt(row)),
  }
}

async function getInstructorStudents({
  search,
  status,
  moduleKey,
  page,
  limit,
}) {
  const conditions = ['1 = 1']
  const parameters = []
  buildSearchConditions(search, conditions, parameters)

  if (status) {
    conditions.push('records.training_status = ?')
    parameters.push(status)
  }

  if (moduleKey) {
    conditions.push(`EXISTS (
      SELECT 1
      FROM training_attempts module_attempt
      INNER JOIN training_modules filtered_module
        ON filtered_module.id = module_attempt.module_id
      WHERE module_attempt.user_id = records.id
        AND module_attempt.status = 'completed'
        AND filtered_module.module_key = ?
    )`)
    parameters.push(moduleKey)
  }

  const whereClause = conditions.join(' AND ')
  const [[countRows], [studentRows]] = await Promise.all([
    databasePool.execute(
      `SELECT COUNT(*) AS total
       FROM (${STUDENT_RECORDS_SQL}) records
       WHERE ${whereClause}`,
      parameters,
    ),
    databasePool.execute(
      `SELECT *
       FROM (${STUDENT_RECORDS_SQL}) records
       WHERE ${whereClause}
       ORDER BY
         records.latest_activity IS NULL,
         records.latest_activity DESC,
         records.full_name
       LIMIT ? OFFSET ?`,
      [...parameters, limit, (page - 1) * limit],
    ),
  ])
  const totalItems = Number(countRows[0]?.total ?? 0)

  return {
    students: studentRows.map(mapStudentRecord),
    pagination: createPagination(page, limit, totalItems),
    filters: { search, status, moduleKey },
  }
}

async function getInstructorStudentDetail(studentId) {
  const [[profileRows], [moduleRows], [attemptRows]] = await Promise.all([
    databasePool.execute(
      `SELECT id, student_number, first_name, last_name, email, role, is_active
       FROM users
       WHERE id = ? AND role = 'student'
       LIMIT 1`,
      [studentId],
    ),
    databasePool.execute(
      `SELECT id, module_key, name, category, difficulty
       FROM training_modules
       WHERE is_active = TRUE
       ORDER BY id`,
    ),
    databasePool.execute(
      `SELECT
         a.id,
         a.user_id,
         a.module_id,
         a.attempt_number,
         a.status,
         a.score,
         a.performance_rating,
         a.procedure_accuracy,
         a.duration_seconds,
         a.started_at,
         a.completed_at,
         m.module_key,
         m.name AS module_name
       FROM training_attempts a
       INNER JOIN training_modules m ON m.id = a.module_id
       WHERE a.user_id = ? AND m.is_active = TRUE
       ORDER BY COALESCE(a.completed_at, a.started_at) DESC, a.id DESC`,
      [studentId],
    ),
  ])
  const profile = profileRows[0]

  if (!profile) {
    throw new HttpError(404, 'Student record was not found.', 'STUDENT_NOT_FOUND')
  }

  const modules = moduleRows.map((module) => {
    const attempts = attemptRows.filter((row) => row.module_id === module.id)
    const completedAttempts = attempts.filter((row) => row.status === 'completed')
    const latestCompleted = completedAttempts[0] ?? null
    const bestScore = completedAttempts.length
      ? Math.max(...completedAttempts.map((row) => Number(row.score)))
      : null

    return {
      moduleKey: module.module_key,
      moduleName: module.name,
      category: module.category,
      difficulty: module.difficulty,
      status: completedAttempts.length
        ? 'completed'
        : attempts.some((row) => row.status === 'in_progress')
          ? 'in_progress'
          : 'not_started',
      attempts: attempts.length,
      latestScore: latestCompleted ? Number(latestCompleted.score) : null,
      bestScore,
      performanceRating: latestCompleted?.performance_rating ?? null,
      latestCompletion: latestCompleted?.completed_at ?? null,
    }
  })
  const completedModules = modules.filter((module) => module.status === 'completed')
  const averageBestScore = completedModules.length
    ? round(
        completedModules.reduce((total, module) => total + module.bestScore, 0) /
          completedModules.length,
      )
    : null
  const latestActivity = attemptRows[0]
    ? attemptRows[0].completed_at ?? attemptRows[0].started_at
    : null

  return {
    student: {
      id: Number(profile.id),
      studentNumber: profile.student_number,
      fullName: `${profile.first_name} ${profile.last_name}`.trim(),
      email: profile.email,
      role: profile.role,
      isActive: Boolean(profile.is_active),
    },
    summary: {
      modulesCompleted: completedModules.length,
      totalModules: modules.length,
      overallProgress: modules.length
        ? Math.round((completedModules.length / modules.length) * 100)
        : 0,
      averageBestScore,
      totalAttempts: attemptRows.length,
      latestActivity,
    },
    modules,
    scorePolicy: 'best_completed_attempt_per_module',
  }
}

async function getInstructorStudentAttempts(
  studentId,
  { moduleKey, page, limit },
) {
  const conditions = ['a.user_id = ?', "u.role = 'student'"]
  const parameters = [studentId]

  if (moduleKey) {
    conditions.push('m.module_key = ?')
    parameters.push(moduleKey)
  }

  const whereClause = conditions.join(' AND ')
  const [[studentRows], [countRows], [attemptRows]] = await Promise.all([
    databasePool.execute(
      `SELECT id FROM users WHERE id = ? AND role = 'student' LIMIT 1`,
      [studentId],
    ),
    databasePool.execute(
      `SELECT COUNT(*) AS total
       FROM training_attempts a
       INNER JOIN users u ON u.id = a.user_id
       INNER JOIN training_modules m ON m.id = a.module_id
       WHERE ${whereClause}`,
      parameters,
    ),
    databasePool.execute(
      `SELECT
         a.id,
         a.user_id,
         u.student_number,
         CONCAT(u.first_name, ' ', u.last_name) AS full_name,
         a.attempt_number,
         a.status,
         a.score,
         a.performance_rating,
         a.procedure_accuracy,
         a.duration_seconds,
         a.started_at,
         a.completed_at,
         m.module_key,
         m.name AS module_name
       FROM training_attempts a
       INNER JOIN users u ON u.id = a.user_id
       INNER JOIN training_modules m ON m.id = a.module_id
       WHERE ${whereClause}
       ORDER BY COALESCE(a.completed_at, a.started_at) DESC, a.id DESC
       LIMIT ? OFFSET ?`,
      [...parameters, limit, (page - 1) * limit],
    ),
  ])

  if (!studentRows.length) {
    throw new HttpError(404, 'Student record was not found.', 'STUDENT_NOT_FOUND')
  }

  const totalItems = Number(countRows[0]?.total ?? 0)
  return {
    attempts: attemptRows.map((row) => mapAttempt(row)),
    pagination: createPagination(page, limit, totalItems),
  }
}

async function getInstructorAttemptDetail(studentId, attemptId) {
  const [attemptRows] = await databasePool.execute(
    `SELECT
       a.id,
       a.user_id,
       u.student_number,
       CONCAT(u.first_name, ' ', u.last_name) AS full_name,
       a.attempt_number,
       a.status,
       a.score,
       a.performance_rating,
       a.procedure_accuracy,
       a.duration_seconds,
       a.started_at,
       a.completed_at,
       a.metrics_json,
       m.module_key,
       m.name AS module_name
     FROM training_attempts a
     INNER JOIN users u ON u.id = a.user_id AND u.role = 'student'
     INNER JOIN training_modules m ON m.id = a.module_id
     WHERE a.id = ? AND a.user_id = ?
     LIMIT 1`,
    [attemptId, studentId],
  )
  const attempt = attemptRows[0]

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

function averageMetric(rows, metricName) {
  const values = rows
    .map((row) => Number(row.metrics[metricName]))
    .filter(Number.isFinite)

  return values.length
    ? round(values.reduce((total, value) => total + value, 0) / values.length)
    : null
}

function isPass(value) {
  if (value === true) return true
  if (typeof value !== 'string') return false
  return ['PASS', 'PASSED', 'COMPLETE', 'COMPLETED'].includes(
    value.trim().toUpperCase(),
  )
}

function passRate(rows, metricName) {
  const applicableRows = rows.filter(
    (row) => row.metrics[metricName] !== null && row.metrics[metricName] !== undefined,
  )

  return applicableRows.length
    ? round(
        (applicableRows.filter((row) => isPass(row.metrics[metricName])).length /
          applicableRows.length) *
          100,
      )
    : null
}

function aggregateModuleDiagnostics(moduleKey, rows, scenarioSummary) {
  if (moduleKey === 'rj45') {
    return {
      averageProcedureAccuracy: averageMetric(rows, 'procedureAccuracy'),
      averageMistakes: averageMetric(rows, 'mistakes'),
      averageWrongToolSelections: averageMetric(rows, 'wrongToolSelections'),
      averageT568BValidationAttempts: averageMetric(
        rows,
        'incorrectT568BAttempts',
      ),
      cableTestPassRate: passRate(rows, 'cableTest'),
    }
  }

  if (moduleKey === 'fiber') {
    return {
      averageProcedureAccuracy: averageMetric(rows, 'procedureAccuracy'),
      averageMistakes: averageMetric(rows, 'mistakes'),
      averageWrongToolSelections: averageMetric(rows, 'wrongToolSelections'),
      averagePreparationErrors: averageMetric(rows, 'preparationErrors'),
      averageSpliceLoss: averageMetric(rows, 'spliceLossDb'),
      alignmentPassRate: passRate(rows, 'alignment'),
      fusionPassRate: passRate(rows, 'fusion'),
      protectionPassRate: passRate(rows, 'protection'),
      finalInspectionPassRate: passRate(rows, 'finalInspection'),
    }
  }

  const configurationRows = rows.filter((row) =>
    ['physicalInstallation', 'routerConfiguration', 'switchConfiguration'].some(
      (metricName) => row.metrics[metricName] !== undefined,
    ),
  )
  const configurationCompleted = configurationRows.filter((row) =>
    ['physicalInstallation', 'routerConfiguration', 'switchConfiguration'].every(
      (metricName) => isPass(row.metrics[metricName]),
    ),
  ).length

  return {
    configurationCompletionRate: configurationRows.length
      ? round((configurationCompleted / configurationRows.length) * 100)
      : null,
    pcToRouterPassRate: passRate(rows, 'pcToRouter'),
    pcToSwitchPassRate: passRate(rows, 'pcToSwitch'),
    averageTroubleshootingScenarioScore: toNumber(
      scenarioSummary?.average_scenario_score,
    ),
    scenariosCompleted: Number(scenarioSummary?.scenarios_completed ?? 0),
  }
}

async function getInstructorModuleAnalytics() {
  const [[moduleRows], [distributionRows], [metricRows], [scenarioRows]] =
    await Promise.all([
      databasePool.execute(
        `SELECT
           m.module_key,
           m.name AS module_name,
           m.category,
           m.difficulty,
           totals.total_students,
           COALESCE(attempts.total_attempts, 0) AS total_attempts,
           COALESCE(attempts.students_attempted, 0) AS students_attempted,
           COALESCE(completions.students_completed, 0) AS students_completed,
           CASE
             WHEN totals.total_students = 0 THEN 0
             ELSE ROUND(
               COALESCE(completions.students_completed, 0) /
               totals.total_students * 100
             )
           END AS completion_rate,
           attempts.average_score,
           completions.average_best_score,
           attempts.average_duration
         FROM training_modules m
         CROSS JOIN (
           SELECT COUNT(*) AS total_students
           FROM users
           WHERE role = 'student'
         ) totals
         LEFT JOIN (
           SELECT
             a.module_id,
             COUNT(*) AS total_attempts,
             COUNT(DISTINCT a.user_id) AS students_attempted,
             ROUND(AVG(
               CASE WHEN a.status = 'completed' THEN a.score ELSE NULL END
             ), 1) AS average_score,
             ROUND(AVG(
               CASE
                 WHEN a.status = 'completed' THEN a.duration_seconds
                 ELSE NULL
               END
             )) AS average_duration
           FROM training_attempts a
           INNER JOIN users u ON u.id = a.user_id AND u.role = 'student'
           GROUP BY a.module_id
         ) attempts ON attempts.module_id = m.id
         LEFT JOIN (
           SELECT
             module_best.module_id,
             COUNT(*) AS students_completed,
             ROUND(AVG(module_best.best_score), 1) AS average_best_score
           FROM (
             SELECT a.module_id, a.user_id, MAX(a.score) AS best_score
             FROM training_attempts a
             INNER JOIN users u ON u.id = a.user_id AND u.role = 'student'
             WHERE a.status = 'completed'
             GROUP BY a.module_id, a.user_id
           ) module_best
           GROUP BY module_best.module_id
         ) completions ON completions.module_id = m.id
         WHERE m.is_active = TRUE
         ORDER BY m.id`,
      ),
      databasePool.execute(
        `SELECT
           m.module_key,
           CASE
             WHEN a.score < 60 THEN 'below_60'
             WHEN a.score < 70 THEN '60_69'
             WHEN a.score < 80 THEN '70_79'
             WHEN a.score < 90 THEN '80_89'
             WHEN a.score < 95 THEN '90_94'
             ELSE '95_100'
           END AS score_band,
           COUNT(*) AS total
         FROM training_attempts a
         INNER JOIN users u ON u.id = a.user_id AND u.role = 'student'
         INNER JOIN training_modules m ON m.id = a.module_id
         WHERE a.status = 'completed'
         GROUP BY m.module_key, score_band`,
      ),
      databasePool.execute(
        `SELECT m.module_key, a.procedure_accuracy, a.metrics_json
         FROM training_attempts a
         INNER JOIN users u ON u.id = a.user_id AND u.role = 'student'
         INNER JOIN training_modules m ON m.id = a.module_id
         WHERE a.status = 'completed'`,
      ),
      databasePool.execute(
        `SELECT
           ROUND(AVG(r.score), 1) AS average_scenario_score,
           COUNT(*) AS scenarios_completed
         FROM network_scenario_results r
         INNER JOIN training_attempts a ON a.id = r.attempt_id
         INNER JOIN users u ON u.id = a.user_id AND u.role = 'student'`,
      ),
    ])
  const scenarioSummary = scenarioRows[0]

  return {
    modules: moduleRows.map((row) => {
      const moduleMetrics = metricRows
        .filter((metric) => metric.module_key === row.module_key)
        .map((metric) => ({
          metrics: {
            ...parseJson(metric.metrics_json),
            procedureAccuracy: toNumber(metric.procedure_accuracy),
          },
        }))
      const bandCounts = Object.fromEntries(
        distributionRows
          .filter((item) => item.module_key === row.module_key)
          .map((item) => [item.score_band, Number(item.total)]),
      )

      return {
        moduleKey: row.module_key,
        moduleName: row.module_name,
        category: row.category,
        difficulty: row.difficulty,
        totalStudents: Number(row.total_students),
        totalAttempts: Number(row.total_attempts),
        studentsAttempted: Number(row.students_attempted),
        studentsCompleted: Number(row.students_completed),
        completionRate: Number(row.completion_rate),
        averageScore: toNumber(row.average_score),
        averageBestScore: toNumber(row.average_best_score),
        averageDurationSeconds: toNumber(row.average_duration),
        scoreDistribution: SCORE_DISTRIBUTION_BANDS.map((band) => ({
          ...band,
          total: bandCounts[band.key] ?? 0,
        })),
        diagnostics: aggregateModuleDiagnostics(
          row.module_key,
          moduleMetrics,
          scenarioSummary,
        ),
      }
    }),
  }
}

function addScoreBandCondition(scoreBand, conditions) {
  if (scoreBand === 'below_70') conditions.push('a.score < 70')
  if (scoreBand === '70_84') conditions.push('a.score BETWEEN 70 AND 84.99')
  if (scoreBand === '85_94') conditions.push('a.score BETWEEN 85 AND 94.99')
  if (scoreBand === '95_100') conditions.push('a.score >= 95')
}

async function getInstructorResults({
  search,
  moduleKey,
  scoreBand,
  performanceRating,
  fromDate,
  toDate,
  page,
  limit,
}) {
  const conditions = ["a.status = 'completed'", "u.role = 'student'"]
  const parameters = []

  if (search) {
    const searchValue = `%${search}%`
    conditions.push(`(
      u.student_number LIKE ? OR
      u.first_name LIKE ? OR
      u.last_name LIKE ? OR
      u.email LIKE ? OR
      CONCAT(u.first_name, ' ', u.last_name) LIKE ?
    )`)
    parameters.push(
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      searchValue,
    )
  }

  if (moduleKey) {
    conditions.push('m.module_key = ?')
    parameters.push(moduleKey)
  }

  addScoreBandCondition(scoreBand, conditions)

  if (performanceRating) {
    conditions.push('a.performance_rating = ?')
    parameters.push(performanceRating)
  }

  if (fromDate) {
    conditions.push('a.completed_at >= ?')
    parameters.push(fromDate)
  }

  if (toDate) {
    conditions.push('a.completed_at < DATE_ADD(?, INTERVAL 1 DAY)')
    parameters.push(toDate)
  }

  const whereClause = conditions.join(' AND ')
  const [[countRows], [attemptRows]] = await Promise.all([
    databasePool.execute(
      `SELECT COUNT(*) AS total
       FROM training_attempts a
       INNER JOIN users u ON u.id = a.user_id
       INNER JOIN training_modules m ON m.id = a.module_id
       WHERE ${whereClause}`,
      parameters,
    ),
    databasePool.execute(
      `SELECT
         a.id,
         a.user_id,
         u.student_number,
         CONCAT(u.first_name, ' ', u.last_name) AS full_name,
         a.attempt_number,
         a.status,
         a.score,
         a.performance_rating,
         a.procedure_accuracy,
         a.duration_seconds,
         a.started_at,
         a.completed_at,
         m.module_key,
         m.name AS module_name
       FROM training_attempts a
       INNER JOIN users u ON u.id = a.user_id
       INNER JOIN training_modules m ON m.id = a.module_id
       WHERE ${whereClause}
       ORDER BY a.completed_at DESC, a.id DESC
       LIMIT ? OFFSET ?`,
      [...parameters, limit, (page - 1) * limit],
    ),
  ])
  const totalItems = Number(countRows[0]?.total ?? 0)

  return {
    attempts: attemptRows.map((row) => mapAttempt(row)),
    pagination: createPagination(page, limit, totalItems),
  }
}

async function getInstructorTroubleshootingAnalytics() {
  const [[networkAttemptRows], [scenarioRows]] = await Promise.all([
    databasePool.execute(
      `SELECT COUNT(*) AS total_network_attempts
       FROM training_attempts a
       INNER JOIN users u ON u.id = a.user_id AND u.role = 'student'
       INNER JOIN training_modules m
         ON m.id = a.module_id AND m.module_key = 'network'`,
    ),
    databasePool.execute(
      `SELECT
         r.scenario_key,
         MAX(r.scenario_title) AS scenario_title,
         COUNT(DISTINCT a.user_id) AS students_attempted,
         COUNT(DISTINCT r.attempt_id) AS attempts_completed,
         ROUND(AVG(r.score), 1) AS average_score,
         ROUND(AVG(r.duration_seconds)) AS average_completion_time,
         ROUND(AVG(r.diagnosis_attempts), 1) AS average_diagnosis_attempts,
         ROUND(AVG(r.incorrect_diagnosis_attempts), 1)
           AS average_incorrect_diagnoses,
         ROUND(AVG(r.repair_attempts), 1) AS average_repair_attempts,
         ROUND(AVG(r.hints_used), 1) AS average_hints_used
       FROM network_scenario_results r
       INNER JOIN training_attempts a ON a.id = r.attempt_id
       INNER JOIN users u ON u.id = a.user_id AND u.role = 'student'
       GROUP BY r.scenario_key`,
    ),
  ])
  const totalNetworkAttempts = Number(
    networkAttemptRows[0]?.total_network_attempts ?? 0,
  )
  const scenarioByKey = Object.fromEntries(
    scenarioRows.map((row) => [row.scenario_key, row]),
  )
  const scenarios = TROUBLESHOOTING_SCENARIOS.map((scenario) => {
    const row = scenarioByKey[scenario.key]
    const attemptsCompleted = Number(row?.attempts_completed ?? 0)

    return {
      scenarioKey: scenario.key,
      scenarioTitle: scenario.title,
      studentsAttempted: Number(row?.students_attempted ?? 0),
      attemptsCompleted,
      averageScore: toNumber(row?.average_score),
      averageCompletionTime: toNumber(row?.average_completion_time),
      averageDiagnosisAttempts: toNumber(row?.average_diagnosis_attempts),
      averageIncorrectDiagnoses: toNumber(row?.average_incorrect_diagnoses),
      averageRepairAttempts: toNumber(row?.average_repair_attempts),
      averageHintsUsed: toNumber(row?.average_hints_used),
      completionRate: totalNetworkAttempts
        ? round((attemptsCompleted / totalNetworkAttempts) * 100)
        : 0,
    }
  })
  const mostChallenging = scenarios
    .filter((scenario) => scenario.attemptsCompleted > 0)
    .sort(
      (left, right) =>
        left.averageScore - right.averageScore ||
        right.averageIncorrectDiagnoses - left.averageIncorrectDiagnoses,
    )
    .slice(0, 3)

  return {
    scenarios,
    mostChallenging,
    totalNetworkAttempts,
    rankingPolicy:
      'lowest_average_score_then_highest_average_incorrect_diagnoses',
  }
}

export {
  NEEDS_PRACTICE_THRESHOLD,
  getInstructorAttemptDetail,
  getInstructorModuleAnalytics,
  getInstructorOverview,
  getInstructorResults,
  getInstructorStudentAttempts,
  getInstructorStudentDetail,
  getInstructorStudents,
  getInstructorTroubleshootingAnalytics,
}
