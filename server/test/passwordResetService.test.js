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
  createPasswordResetService,
  FORGOT_PASSWORD_PUBLIC_MESSAGE,
  hashResetToken,
  INVALID_RESET_TOKEN_MESSAGE,
} = await import('../src/services/passwordResetService.js')
const { hashPassword, verifyPassword } = await import(
  '../src/utils/passwordSecurity.js'
)

function createFakeRepository(users, initialTokens = []) {
  const state = {
    users: users.map((user) => ({ ...user })),
    tokens: initialTokens.map((token) => ({ ...token })),
  }

  return {
    state,
    async createPasswordResetToken({
      email,
      tokenHash,
      expiresAt,
      createdAt,
      cooldownCutoff,
    }) {
      const user = state.users.find(
        (candidate) => candidate.email === email && candidate.isActive,
      )

      if (!user) return { status: 'not_eligible' }

      const coolingDown = state.tokens.some(
        (token) =>
          token.userId === user.id && token.createdAt > cooldownCutoff,
      )

      if (coolingDown) return { status: 'cooldown' }

      for (const token of state.tokens) {
        if (token.userId === user.id && !token.usedAt) {
          token.usedAt = createdAt
        }
      }

      state.tokens.push({
        userId: user.id,
        tokenHash,
        expiresAt,
        createdAt,
        usedAt: null,
      })

      return {
        status: 'created',
        account: { email: user.email, role: user.role },
      }
    },
    async invalidatePasswordResetToken(tokenHash, usedAt) {
      const token = state.tokens.find(
        (candidate) => candidate.tokenHash === tokenHash,
      )
      if (token && !token.usedAt) token.usedAt = usedAt
    },
    async resetPasswordWithToken({ tokenHash, passwordHash, now }) {
      const token = state.tokens.find(
        (candidate) => candidate.tokenHash === tokenHash,
      )
      const user = state.users.find(
        (candidate) => candidate.id === token?.userId,
      )

      if (
        !token ||
        !user?.isActive ||
        token.usedAt ||
        token.expiresAt <= now
      ) {
        return null
      }

      user.passwordHash = passwordHash
      for (const userToken of state.tokens) {
        if (userToken.userId === user.id && !userToken.usedAt) {
          userToken.usedAt = now
        }
      }

      return { role: user.role }
    },
  }
}

async function createHarness({ users, tokens, tokenValues, mailFailure } = {}) {
  const repository = createFakeRepository(users ?? [], tokens)
  const sentMail = []
  let currentTime = new Date('2026-10-22T08:00:00.000Z')
  const queuedTokens = [...(tokenValues ?? ['a'.repeat(43)])]
  const service = createPasswordResetService({
    configuration: {
      enabled: true,
      ttlMinutes: 30,
      cooldownSeconds: 60,
    },
    clientOrigin: 'https://telesim3d.site',
    repository,
    sendResetEmail: async (message) => {
      if (mailFailure) throw Object.assign(new Error('mail failed'), { code: 'ETESTMAIL' })
      sentMail.push(message)
    },
    tokenFactory: () => queuedTokens.shift(),
    clock: () => new Date(currentTime),
    logger: { error() {} },
  })

  return {
    repository,
    sentMail,
    service,
    setTime(value) {
      currentTime = new Date(value)
    },
  }
}

test('known and unknown emails receive the same public response', async () => {
  const user = {
    id: 1,
    email: 'student@test.local',
    role: 'student',
    isActive: true,
  }
  const harness = await createHarness({ users: [user] })
  const known = await harness.service.requestPasswordReset(user.email)
  const unknown = await harness.service.requestPasswordReset('unknown@test.local')

  assert.equal(known.message, FORGOT_PASSWORD_PUBLIC_MESSAGE)
  assert.equal(unknown.message, FORGOT_PASSWORD_PUBLIC_MESSAGE)
  assert.equal(harness.sentMail.length, 1)
})

test('request stores only the SHA-256 token hash and routes staff UX safely', async () => {
  const rawToken = 'b'.repeat(43)
  const harness = await createHarness({
    users: [{
      id: 2,
      email: 'instructor@test.local',
      role: 'instructor',
      isActive: true,
    }],
    tokenValues: [rawToken],
  })

  await harness.service.requestPasswordReset('instructor@test.local')

  assert.equal(harness.repository.state.tokens.length, 1)
  assert.equal(harness.repository.state.tokens[0].tokenHash, hashResetToken(rawToken))
  assert.notEqual(harness.repository.state.tokens[0].tokenHash, rawToken)
  assert.equal(harness.repository.state.tokens[0].tokenHash.length, 64)
  const resetUrl = new URL(harness.sentMail[0].resetUrl)
  assert.equal(resetUrl.searchParams.get('token'), rawToken)
  assert.equal(resetUrl.searchParams.get('portal'), 'staff')
})

test('cooldown suppresses repeated reset email delivery', async () => {
  const harness = await createHarness({
    users: [{
      id: 3,
      email: 'cooldown@test.local',
      role: 'student',
      isActive: true,
    }],
    tokenValues: ['c'.repeat(43), 'd'.repeat(43)],
  })

  await harness.service.requestPasswordReset('cooldown@test.local')
  await harness.service.requestPasswordReset('cooldown@test.local')

  assert.equal(harness.sentMail.length, 1)
  assert.equal(harness.repository.state.tokens.length, 1)
})

test('email failure invalidates the newly-created token without exposing it', async () => {
  const harness = await createHarness({
    users: [{
      id: 4,
      email: 'mail-failure@test.local',
      role: 'student',
      isActive: true,
    }],
    mailFailure: true,
  })

  const result = await harness.service.requestPasswordReset(
    'mail-failure@test.local',
  )

  assert.equal(result.message, FORGOT_PASSWORD_PUBLIC_MESSAGE)
  assert.ok(harness.repository.state.tokens[0].usedAt)
  assert.equal(JSON.stringify(result).includes('a'.repeat(43)), false)
})

test('valid student reset changes the password and invalidates all tokens', async () => {
  const oldPassword = 'old-password-123'
  const newPassword = 'new-password-456'
  const user = {
    id: 5,
    email: 'reset-student@test.local',
    role: 'student',
    isActive: true,
    passwordHash: await hashPassword(oldPassword),
  }
  const rawToken = 'e'.repeat(43)
  const otherToken = 'f'.repeat(43)
  const createdAt = new Date('2026-10-22T07:59:00.000Z')
  const harness = await createHarness({
    users: [user],
    tokenValues: [rawToken],
    tokens: [{
      userId: user.id,
      tokenHash: hashResetToken(otherToken),
      expiresAt: new Date('2026-10-22T08:30:00.000Z'),
      createdAt,
      usedAt: null,
    }],
  })
  harness.setTime('2026-10-22T08:01:01.000Z')
  await harness.service.requestPasswordReset(user.email)
  const result = await harness.service.resetPassword({
    token: rawToken,
    password: newPassword,
  })
  const updatedUser = harness.repository.state.users[0]

  assert.equal(result.loginPortal, 'student')
  assert.equal(await verifyPassword(oldPassword, updatedUser.passwordHash), false)
  assert.equal(await verifyPassword(newPassword, updatedUser.passwordHash), true)
  assert.equal(
    harness.repository.state.tokens.every((token) => Boolean(token.usedAt)),
    true,
  )
})

test('instructor and administrator resets return the staff login destination', async () => {
  for (const [index, role] of ['instructor', 'admin'].entries()) {
    const rawToken = String.fromCharCode(103 + index).repeat(43)
    const harness = await createHarness({
      users: [{
        id: index + 6,
        email: `${role}@test.local`,
        role,
        isActive: true,
      }],
      tokenValues: [rawToken],
    })
    await harness.service.requestPasswordReset(`${role}@test.local`)
    const result = await harness.service.resetPassword({
      token: rawToken,
      password: 'new-staff-password',
    })

    assert.equal(result.loginPortal, 'staff')
  }
})

test('invalid, expired, and used tokens cannot reset a password', async () => {
  const user = {
    id: 8,
    email: 'token-state@test.local',
    role: 'student',
    isActive: true,
  }
  const expiredToken = 'i'.repeat(43)
  const usedToken = 'j'.repeat(43)
  const harness = await createHarness({
    users: [user],
    tokens: [
      {
        userId: user.id,
        tokenHash: hashResetToken(expiredToken),
        expiresAt: new Date('2026-10-22T07:00:00.000Z'),
        createdAt: new Date('2026-10-22T06:30:00.000Z'),
        usedAt: null,
      },
      {
        userId: user.id,
        tokenHash: hashResetToken(usedToken),
        expiresAt: new Date('2026-10-22T09:00:00.000Z'),
        createdAt: new Date('2026-10-22T07:00:00.000Z'),
        usedAt: new Date('2026-10-22T07:30:00.000Z'),
      },
    ],
  })

  for (const token of ['z'.repeat(43), expiredToken, usedToken]) {
    await assert.rejects(
      harness.service.resetPassword({ token, password: 'replacement-password' }),
      (error) =>
        error.code === 'INVALID_PASSWORD_RESET_TOKEN' &&
        error.message === INVALID_RESET_TOKEN_MESSAGE,
    )
  }
})

test('a valid token is single-use', async () => {
  const rawToken = 'k'.repeat(43)
  const harness = await createHarness({
    users: [{
      id: 9,
      email: 'single-use@test.local',
      role: 'student',
      isActive: true,
    }],
    tokenValues: [rawToken],
  })
  await harness.service.requestPasswordReset('single-use@test.local')
  await harness.service.resetPassword({
    token: rawToken,
    password: 'replacement-password',
  })

  await assert.rejects(
    harness.service.resetPassword({
      token: rawToken,
      password: 'another-password',
    }),
    (error) => error.code === 'INVALID_PASSWORD_RESET_TOKEN',
  )
})

test('inactive accounts receive no usable token or email', async () => {
  const harness = await createHarness({
    users: [{
      id: 10,
      email: 'inactive@test.local',
      role: 'student',
      isActive: false,
    }],
  })

  const result = await harness.service.requestPasswordReset(
    'inactive@test.local',
  )

  assert.equal(result.message, FORGOT_PASSWORD_PUBLIC_MESSAGE)
  assert.equal(harness.repository.state.tokens.length, 0)
  assert.equal(harness.sentMail.length, 0)
})
