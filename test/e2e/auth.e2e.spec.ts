import { HttpStatus } from '@nestjs/common'

import { e2eTestHelper } from './helpers/e2e-test-helper'

interface SignInResponse {
  token: string
  userId: string
}

interface ErrorResponse {
  path: string
  response: string
  statusCode: number
  timestamp: string
}

describe('Auth Endpoints (E2E)', () => {
  beforeAll(async () => {
    await e2eTestHelper.setup()
  })

  afterAll(async () => {
    await e2eTestHelper.teardown()
  })

  describe('POST /api/auth/test-token', () => {
    it('should return a mock JWT token', async () => {
      const response = await e2eTestHelper
        .createRequest()
        .post('/api/auth/test-token')
        .expect(HttpStatus.CREATED)

      const body = response.body as SignInResponse
      expect(body).toHaveProperty('token')
      expect(body).toHaveProperty('userId')
      expect(body.token).toBe(process.env.INTEGRATION_TEST_MOCK_TOKEN)
      expect(body.userId).toBe(process.env.INTEGRATION_TEST_USER_ID)
    })

    it('should return valid token structure', async () => {
      const response = await e2eTestHelper
        .createRequest()
        .post('/api/auth/test-token')
        .expect(HttpStatus.CREATED)

      const body = response.body as SignInResponse
      expect(typeof body.token).toBe('string')
      expect(typeof body.userId).toBe('string')
      expect(body.token.length).toBeGreaterThan(0)
      expect(body.userId.length).toBeGreaterThan(0)
    })
  })

  describe('POST /api/auth/test-token-real', () => {
    it('should return BAD_REQUEST when TEST_USERNAME is not set', async () => {
      const originalUsername = process.env.TEST_USERNAME
      const originalPassword = process.env.TEST_PASSWORD

      // Temporarily remove environment variables
      delete process.env.TEST_USERNAME
      delete process.env.TEST_PASSWORD

      const response = await e2eTestHelper
        .createRequest()
        .post('/api/auth/test-token-real')
        .expect(HttpStatus.BAD_REQUEST)

      const body = response.body as ErrorResponse
      expect(body).toHaveProperty('response')
      expect(body.response).toBe(
        'TEST_USERNAME and TEST_PASSWORD must be set in .env file',
      )

      // Restore environment variables
      if (originalUsername) process.env.TEST_USERNAME = originalUsername
      if (originalPassword) process.env.TEST_PASSWORD = originalPassword
    })

    it('should return BAD_REQUEST when TEST_PASSWORD is not set', async () => {
      const originalPassword = process.env.TEST_PASSWORD

      // Set username but remove password
      process.env.TEST_USERNAME = process.env.INTEGRATION_TEST_USERNAME
      delete process.env.TEST_PASSWORD

      const response = await e2eTestHelper
        .createRequest()
        .post('/api/auth/test-token-real')
        .expect(HttpStatus.BAD_REQUEST)

      const body = response.body as ErrorResponse
      expect(body).toHaveProperty('response')
      expect(body.response).toBe(
        'TEST_USERNAME and TEST_PASSWORD must be set in .env file',
      )

      // Restore environment variables
      if (originalPassword) process.env.TEST_PASSWORD = originalPassword
    })

    it('should return NOT_FOUND when user does not exist', async () => {
      // Set fake credentials
      process.env.TEST_USERNAME = process.env.INTEGRATION_TEST_FAKE_USERNAME
      process.env.TEST_PASSWORD = process.env.INTEGRATION_TEST_FAKE_PASSWORD

      const response = await e2eTestHelper
        .createRequest()
        .post('/api/auth/test-token-real')
        .expect(HttpStatus.NOT_FOUND)

      const body = response.body as ErrorResponse
      expect(body).toHaveProperty('response')
      expect(body.response).toBe('User not found')
    })

    it('should handle clerk client errors gracefully', async () => {
      // Set valid-looking but fake credentials
      process.env.TEST_USERNAME =
        process.env.INTEGRATION_TEST_VALID_FORMAT_USERNAME
      process.env.TEST_PASSWORD =
        process.env.INTEGRATION_TEST_VALID_FORMAT_PASSWORD

      const response = await e2eTestHelper
        .createRequest()
        .post('/api/auth/test-token-real')

      // The response should be either NOT_FOUND or INTERNAL_SERVER_ERROR
      // depending on how Clerk handles the fake credentials
      expect([
        HttpStatus.NOT_FOUND,
        HttpStatus.INTERNAL_SERVER_ERROR,
      ]).toContain(response.status)
      expect(response.body).toHaveProperty('response')
    })
  })
})
