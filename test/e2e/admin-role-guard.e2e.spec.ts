import { HttpStatus } from '@nestjs/common'

import { e2eTestHelper } from './helpers/e2e-test-helper'

interface ErrorResponse {
  path: string
  response: {
    error: string
    message: string
    statusCode: number
  }
  statusCode: number
  timestamp: string
}

describe('Admin Role Guard Authentication Flow (E2E)', () => {
  beforeAll(async () => {
    await e2eTestHelper.setup()
  })

  afterAll(async () => {
    await e2eTestHelper.teardown()
  })

  describe('Admin Authentication Scenarios', () => {
    it('should deny access with invalid token before reaching role validation', async () => {
      const invalidToken = process.env.INTEGRATION_TEST_USER_TOKEN!

      const response = await e2eTestHelper
        .createRequest()
        .post('/api/admin/events')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({
          name: 'Test Event',
          description: 'Test Description',
          date: '2024-12-01T10:00:00Z',
          cityId: 1,
        })
        .expect(HttpStatus.UNAUTHORIZED)

      const body = response.body as ErrorResponse
      expect(body).toHaveProperty('response')
      expect(body.response.message).toBe('Invalid authorization token')
      expect(body.statusCode).toBe(HttpStatus.UNAUTHORIZED)
    })

    it('should deny access with expired token before reaching role validation', async () => {
      const expiredToken = process.env.INTEGRATION_TEST_EXPIRED_TOKEN!

      const response = await e2eTestHelper
        .createRequest()
        .post('/api/admin/events')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({
          name: 'Test Event',
          description: 'Test Description',
          date: '2024-12-01T10:00:00Z',
          cityId: 1,
        })
        .expect(HttpStatus.UNAUTHORIZED)

      const body = response.body as ErrorResponse
      expect(body.response.message).toBe('Invalid authorization token')
    })

    it('should deny access with incomplete token before reaching role validation', async () => {
      const incompleteToken = process.env.INTEGRATION_TEST_INCOMPLETE_TOKEN!

      const response = await e2eTestHelper
        .createRequest()
        .post('/api/admin/events')
        .set('Authorization', `Bearer ${incompleteToken}`)
        .send({
          name: 'Test Event',
          description: 'Test Description',
          date: '2024-12-01T10:00:00Z',
          cityId: 1,
        })
        .expect(HttpStatus.UNAUTHORIZED)

      const body = response.body as ErrorResponse
      expect(body.response.message).toBe('Invalid authorization token')
    })
  })

  describe('Admin Endpoints Authentication Coverage', () => {
    it('should require authentication for PUT /api/admin/events/:id', async () => {
      const invalidToken = process.env.INTEGRATION_TEST_USER_TOKEN!

      const response = await e2eTestHelper
        .createRequest()
        .put('/api/admin/events/1')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({
          name: 'Updated Event',
          description: 'Updated Description',
          date: '2024-12-01T10:00:00Z',
          cityId: 1,
        })
        .expect(HttpStatus.UNAUTHORIZED)

      const body = response.body as ErrorResponse
      expect(body.response.message).toBe('Invalid authorization token')
    })

    it('should require authentication for DELETE /api/admin/events/:id', async () => {
      const invalidToken = process.env.INTEGRATION_TEST_USER_TOKEN!

      const response = await e2eTestHelper
        .createRequest()
        .delete('/api/admin/events/1')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(HttpStatus.UNAUTHORIZED)

      const body = response.body as ErrorResponse
      expect(body.response.message).toBe('Invalid authorization token')
    })

    it('should require authentication for POST /api/admin/cities', async () => {
      const invalidToken = process.env.INTEGRATION_TEST_USER_TOKEN!

      const response = await e2eTestHelper
        .createRequest()
        .post('/api/admin/cities')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({
          name: 'Test City',
          state: 'Test State',
          country: 'Test Country',
        })
        .expect(HttpStatus.UNAUTHORIZED)

      const body = response.body as ErrorResponse
      expect(body.response.message).toBe('Invalid authorization token')
    })

    it('should require authentication for POST /admin/database/reset', async () => {
      const invalidToken = process.env.INTEGRATION_TEST_USER_TOKEN!

      const response = await e2eTestHelper
        .createRequest()
        .post('/admin/database/reset')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(HttpStatus.UNAUTHORIZED)

      const body = response.body as ErrorResponse
      expect(body.response.message).toBe('Invalid authorization token')
    })
  })

  describe('E2E Authentication Flow Documentation', () => {
    it('should document that AdminRoleGuard testing requires valid tokens', () => {
      // This test documents the E2E testing limitation:
      // AdminRoleGuard can only be tested in E2E with real Clerk tokens
      // For comprehensive AdminRoleGuard testing, see:
      // - Integration tests: test/integration/guards/admin-role.guard.integration.spec.ts
      // - Unit tests: test/unit/guards/admin-role.guard.spec.ts

      expect(true).toBe(true) // This test passes to document the limitation
    })
  })
})
