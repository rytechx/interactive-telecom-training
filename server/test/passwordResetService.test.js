import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import test from 'node:test'

process.env.NODE_ENV = 'test'
process.env.DB_HOST = '127.0.0.1'
process.env.DB_PORT = '3306'
process.env.DB_USER = 'password-reset-test-user'
process.env.DB_PASSWORD = randomBytes(16).toString('hex')
process.env.DB_NAME = 'telesim3d'
process.env.JWT_SECRET = randomBytes(48).toString('hex')
process.env.CLIENT_ORIGIN = 'http://localhost:5173'

const {
  ATTEMPTS_EXHAUSTED_MESSAGE,
  createPasswordResetService,
  FORGOT_PASSWORD_PUBLIC_MESSAGE,
  generateResetOtp,
  hashResetAuthorization,
  hashResetOtp,
} = await import('../src/services/passwordResetService.js')
const { hashPassword, verifyPassword } = await import(
  '../src/utils/passwordSecurity.js'
)

function createFakeRepository(users, initialRequests = []) {
  const state = {
    users: users.map((user) => ({ ...user })),
    requests: initialRequests.map((request) => ({ ...request })),
    nextId: initialRequests.length + 1,
  }

  return {
    state,
    async createPasswordResetOtp({
      email,
      otpHash,
      expiresAt,
      createdAt,
      cooldownCutoff,
      maxAttempts,
    }) {
      const user = state.users.find(
        (candidate) => candidate.email === email && candidate.isActive,
      )

      if (!user) return { status: 'not_eligible' }

      const coolingDown = state.requests.some(
        (request) =>
          request.userId === user.id && request.createdAt > cooldownCutoff,
      )

      if (coolingDown) return { status: 'cooldown' }

      for (const request of state.requests) {
        if (request.userId === user.id && !request.usedAt) {
          request.usedAt = createdAt
        }
      }

      const request = {
        id: state.nextId,
        userId: user.id,
        otpHash,
        attemptsRemaining: maxAttempts,
        expiresAt,
        verifiedAt: null,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
        usedAt: null,
        createdAt,
      }
      state.nextId += 1
      state.requests.push(request)

      return {
        status: 'created',
        requestId: request.id,
        account: { email: user.email },
      }
    },
    async discardPasswordResetOtp(requestId) {
      state.requests = state.requests.filter(
        (request) => request.id !== requestId,
      )
    },
    async verifyPasswordResetOtp({
      email,
      otpHash,
      resetTokenHash,
      resetTokenExpiresAt,
      now,
    }) {
      const user = state.users.find(
        (candidate) => candidate.email === email && candidate.isActive,
      )

      if (!user) return { status: 'invalid' }

      const request = state.requests
        .filter((candidate) => candidate.userId === user.id && !candidate.usedAt)
        .sort((left, right) => right.id - left.id)[0]

      if (!request || request.verifiedAt) return { status: 'invalid' }
      if (request.expiresAt <= now) {
        request.usedAt = now
        return { status: 'invalid' }
      }
      if (request.attemptsRemaining <= 0) {
        request.usedAt = now
        return { status: 'attempts_exhausted' }
      }
      if (request.otpHash !== otpHash) {
        request.attemptsRemaining = Math.max(0, request.attemptsRemaining - 1)

        if (request.attemptsRemaining === 0) {
          request.usedAt = now
          return { status: 'attempts_exhausted', attemptsRemaining: 0 }
        }

        return {
          status: 'incorrect',
          attemptsRemaining: request.attemptsRemaining,
        }
      }

      request.verifiedAt = now
      request.resetTokenHash = resetTokenHash
      request.resetTokenExpiresAt = resetTokenExpiresAt
      return { status: 'verified' }
    },
    async resetPasswordWithAuthorization({
      resetTokenHash,
      passwordHash,
      now,
    }) {
      const request = state.requests.find(
        (candidate) => candidate.resetTokenHash === resetTokenHash,
      )
      const user = state.users.find(
        (candidate) => candidate.id === request?.userId,
      )

      if (
        !request ||
        !user?.isActive ||
        !request.verifiedAt ||
        request.usedAt ||
        request.resetTokenExpiresAt <= now
      ) {
        return null
      }

      user.passwordHash = passwordHash
      for (const userRequest of state.requests) {
        if (userRequest.userId === user.id && !userRequest.usedAt) {
          userRequest.usedAt = now
        }
      }

      return { role: user.role }
    },
  }
}

function createHarness({
  users = [],
  requests = [],
  otpValues = [],
  authorizationValues = [],
  mailFailure = false,
  passwordHasher = async (password) => `hashed:${password}`,
} = {}) {
  const repository = createFakeRepository(users, requests)
  const sentMail = []
  const logs = []
  let currentTime = new Date('2026-10-23T08:00:00.000Z')
  const queuedOtps = [...otpValues]
  const queuedAuthorizations = [...authorizationValues]
  const service = createPasswordResetService({
    configuration: {
      enabled: true,
      otpTtlMinutes: 10,
      maxAttempts: 3,
      cooldownSeconds: 60,
    },
    otpHashSecret: 'unit-test-otp-secret',
    repository,
    sendOtpEmail: async (message) => {
      if (mailFailure) {
        throw Object.assign(new Error('mail failed'), { code: 'ETESTMAIL' })
      }
      sentMail.push(message)
    },
    passwordHasher,
    otpFactory: () => queuedOtps.shift() ?? '123456',
    resetAuthorizationFactory: () =>
      queuedAuthorizations.shift() ?? 'a'.repeat(43),
    clock: () => new Date(currentTime),
    logger: { error: (...details) => logs.push(details) },
  })

  return {
    logs,
    repository,
    sentMail,
    service,
    setTime(value) {
      currentTime = new Date(value)
    },
  }
}

test('secure OTP generation always returns exactly six digits', () => {
  for (let index = 0; index < 500; index += 1) {
    assert.match(generateResetOtp(), /^\d{6}$/)
  }
})

test('OTP storage uses a keyed HMAC rather than plaintext', () => {
  const otp = '482731'
  const firstHash = hashResetOtp('student@test.local', otp, 'secret-one')
  const secondHash = hashResetOtp('student@test.local', otp, 'secret-two')

  assert.equal(firstHash.length, 64)
  assert.notEqual(firstHash, otp)
  assert.notEqual(firstHash, secondHash)
})

test('known, unknown, and inactive accounts receive one generic response', async () => {
  const harness = createHarness({
    users: [
      {
        id: 1,
        email: 'student@test.local',
        role: 'student',
        isActive: true,
      },
      {
        id: 2,
        email: 'inactive@test.local',
        role: 'student',
        isActive: false,
      },
    ],
    otpValues: ['111111', '222222', '333333'],
  })

  const known = await harness.service.requestPasswordReset('student@test.local')
  const unknown = await harness.service.requestPasswordReset('unknown@test.local')
  const inactive = await harness.service.requestPasswordReset('inactive@test.local')

  assert.equal(known.message, FORGOT_PASSWORD_PUBLIC_MESSAGE)
  assert.deepEqual(unknown, known)
  assert.deepEqual(inactive, known)
  assert.equal(harness.sentMail.length, 1)
  assert.equal(harness.repository.state.requests.length, 1)
})

test('request stores only the OTP HMAC and sends the six-digit code', async () => {
  const otp = '004271'
  const harness = createHarness({
    users: [{
      id: 3,
      email: 'hash-check@test.local',
      role: 'student',
      isActive: true,
    }],
    otpValues: [otp],
  })

  await harness.service.requestPasswordReset('hash-check@test.local')

  const storedRequest = harness.repository.state.requests[0]
  assert.equal(
    storedRequest.otpHash,
    hashResetOtp('hash-check@test.local', otp, 'unit-test-otp-secret'),
  )
  assert.notEqual(storedRequest.otpHash, otp)
  assert.equal(storedRequest.attemptsRemaining, 3)
  assert.equal(harness.sentMail[0].otp, otp)
  assert.match(harness.sentMail[0].otp, /^\d{6}$/)
})

test('resend cooldown suppresses another record and email', async () => {
  const harness = createHarness({
    users: [{
      id: 4,
      email: 'cooldown@test.local',
      role: 'student',
      isActive: true,
    }],
    otpValues: ['111111', '222222'],
  })

  await harness.service.requestPasswordReset('cooldown@test.local')
  const repeated = await harness.service.requestPasswordReset(
    'cooldown@test.local',
  )

  assert.equal(repeated.message, FORGOT_PASSWORD_PUBLIC_MESSAGE)
  assert.equal(harness.sentMail.length, 1)
  assert.equal(harness.repository.state.requests.length, 1)
})

test('a new OTP invalidates the previous OTP and restores three attempts', async () => {
  const harness = createHarness({
    users: [{
      id: 5,
      email: 'resend@test.local',
      role: 'student',
      isActive: true,
    }],
    otpValues: ['111111', '222222'],
  })

  await harness.service.requestPasswordReset('resend@test.local')
  harness.setTime('2026-10-23T08:01:01.000Z')
  await harness.service.requestPasswordReset('resend@test.local')

  assert.equal(harness.sentMail.length, 2)
  assert.ok(harness.repository.state.requests[0].usedAt)
  assert.equal(harness.repository.state.requests[1].attemptsRemaining, 3)
  await assert.rejects(
    harness.service.verifyResetOtp({
      email: 'resend@test.local',
      otp: '111111',
    }),
    (error) =>
      error.code === 'INCORRECT_RESET_OTP' &&
      error.data.attemptsRemaining === 2,
  )
})

test('email failure discards the OTP and never logs or returns it', async () => {
  const otp = '654321'
  const harness = createHarness({
    users: [{
      id: 6,
      email: 'mail-failure@test.local',
      role: 'student',
      isActive: true,
    }],
    otpValues: [otp],
    mailFailure: true,
  })

  const result = await harness.service.requestPasswordReset(
    'mail-failure@test.local',
  )
  const exposedOutput = JSON.stringify({ result, logs: harness.logs })

  assert.equal(result.message, FORGOT_PASSWORD_PUBLIC_MESSAGE)
  assert.equal(harness.repository.state.requests.length, 0)
  assert.equal(exposedOutput.includes(otp), false)
})

test('three incorrect OTPs report 2, 1, then zero and invalidate the request', async () => {
  const email = 'attempts@test.local'
  const harness = createHarness({
    users: [{ id: 7, email, role: 'student', isActive: true }],
    otpValues: ['482731'],
  })
  await harness.service.requestPasswordReset(email)

  for (const [index, expectedRemaining] of [2, 1, 0].entries()) {
    await assert.rejects(
      harness.service.verifyResetOtp({ email, otp: `00000${index}` }),
      (error) => {
        assert.equal(error.data.attemptsRemaining, expectedRemaining)
        if (expectedRemaining === 0) {
          assert.equal(error.code, 'RESET_OTP_ATTEMPTS_EXHAUSTED')
          assert.equal(error.message, ATTEMPTS_EXHAUSTED_MESSAGE)
        } else {
          assert.equal(error.code, 'INCORRECT_RESET_OTP')
        }
        return true
      },
    )
  }

  assert.equal(harness.repository.state.requests[0].attemptsRemaining, 0)
  assert.ok(harness.repository.state.requests[0].usedAt)
  await assert.rejects(
    harness.service.verifyResetOtp({ email, otp: '482731' }),
    (error) => error.code === 'INVALID_RESET_OTP',
  )
})

test('expired OTP cannot produce a reset authorization', async () => {
  const email = 'expired@test.local'
  const harness = createHarness({
    users: [{ id: 8, email, role: 'student', isActive: true }],
    otpValues: ['482731'],
  })
  await harness.service.requestPasswordReset(email)
  harness.setTime('2026-10-23T08:10:01.000Z')

  await assert.rejects(
    harness.service.verifyResetOtp({ email, otp: '482731' }),
    (error) => error.code === 'INVALID_RESET_OTP',
  )
})

test('correct OTP returns a hashed one-time authorization and cannot verify twice', async () => {
  const email = 'verified@test.local'
  const authorization = 'v'.repeat(43)
  const harness = createHarness({
    users: [{ id: 9, email, role: 'student', isActive: true }],
    otpValues: ['482731'],
    authorizationValues: [authorization, 'w'.repeat(43)],
  })
  await harness.service.requestPasswordReset(email)

  const result = await harness.service.verifyResetOtp({ email, otp: '482731' })
  const storedRequest = harness.repository.state.requests[0]

  assert.equal(result.resetAuthorization, authorization)
  assert.equal(
    storedRequest.resetTokenHash,
    hashResetAuthorization(authorization),
  )
  assert.notEqual(storedRequest.resetTokenHash, authorization)
  await assert.rejects(
    harness.service.verifyResetOtp({ email, otp: '482731' }),
    (error) => error.code === 'INVALID_RESET_OTP',
  )
})

test('invalid and expired reset authorizations are rejected', async () => {
  const email = 'authorization@test.local'
  const authorization = 'x'.repeat(43)
  const harness = createHarness({
    users: [{ id: 10, email, role: 'student', isActive: true }],
    otpValues: ['482731'],
    authorizationValues: [authorization],
  })
  await harness.service.requestPasswordReset(email)
  await harness.service.verifyResetOtp({ email, otp: '482731' })

  await assert.rejects(
    harness.service.resetPassword({
      resetAuthorization: 'z'.repeat(43),
      password: 'replacement-password',
    }),
    (error) => error.code === 'INVALID_RESET_AUTHORIZATION',
  )

  harness.setTime('2026-10-23T08:10:01.000Z')
  await assert.rejects(
    harness.service.resetPassword({
      resetAuthorization: authorization,
      password: 'replacement-password',
    }),
    (error) => error.code === 'INVALID_RESET_AUTHORIZATION',
  )
})

test('valid student reset changes the password and invalidates all requests', async () => {
  const email = 'student-reset@test.local'
  const oldPassword = 'old-password-123'
  const newPassword = 'new-password-456'
  const authorization = 's'.repeat(43)
  const harness = createHarness({
    users: [{
      id: 11,
      email,
      role: 'student',
      isActive: true,
      passwordHash: await hashPassword(oldPassword),
    }],
    requests: [{
      id: 1,
      userId: 11,
      otpHash: hashResetOtp(email, '111111', 'unit-test-otp-secret'),
      attemptsRemaining: 3,
      expiresAt: new Date('2026-10-23T08:10:00.000Z'),
      verifiedAt: null,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      usedAt: null,
      createdAt: new Date('2026-10-23T07:58:00.000Z'),
    }],
    otpValues: ['482731'],
    authorizationValues: [authorization],
    passwordHasher: hashPassword,
  })
  await harness.service.requestPasswordReset(email)
  const verification = await harness.service.verifyResetOtp({
    email,
    otp: '482731',
  })
  const result = await harness.service.resetPassword({
    resetAuthorization: verification.resetAuthorization,
    password: newPassword,
  })
  const updatedUser = harness.repository.state.users[0]

  assert.equal(result.loginPortal, 'student')
  assert.equal(await verifyPassword(oldPassword, updatedUser.passwordHash), false)
  assert.equal(await verifyPassword(newPassword, updatedUser.passwordHash), true)
  assert.equal(
    harness.repository.state.requests.every((request) => Boolean(request.usedAt)),
    true,
  )
  await assert.rejects(
    harness.service.resetPassword({
      resetAuthorization: authorization,
      password: 'another-password',
    }),
    (error) => error.code === 'INVALID_RESET_AUTHORIZATION',
  )
})

test('instructor and administrator resets return the staff login destination', async () => {
  for (const [index, role] of ['instructor', 'admin'].entries()) {
    const email = `${role}@test.local`
    const otp = `${index + 1}`.repeat(6)
    const authorization = String.fromCharCode(105 + index).repeat(43)
    const harness = createHarness({
      users: [{ id: 12 + index, email, role, isActive: true }],
      otpValues: [otp],
      authorizationValues: [authorization],
    })

    await harness.service.requestPasswordReset(email)
    const verified = await harness.service.verifyResetOtp({ email, otp })
    const result = await harness.service.resetPassword({
      resetAuthorization: verified.resetAuthorization,
      password: 'new-staff-password',
    })

    assert.equal(result.loginPortal, 'staff')
  }
})
