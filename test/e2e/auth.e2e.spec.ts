import * as request from 'supertest'

import { E2ETestHelper } from './helpers/e2e-test-helper'

describe('Auth E2E Tests', () => {
  let testHelper: E2ETestHelper

  beforeAll(async () => {
    testHelper = new E2ETestHelper()
    await testHelper.setup()
  })

  afterAll(async () => {
    await testHelper.teardown()
  })

  describe('Auth Controller', () => {
    it('should have auth module loaded', async () => {
      const response = await request(testHelper.getServer() as never).get(
        '/health/json',
      )
      expect(response.status).toBe(200)
    })
  })
})
