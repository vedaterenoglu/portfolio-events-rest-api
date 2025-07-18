import { HttpStatus } from '@nestjs/common'

import { getThrottlingConfig } from '../../src/config/throttling.config'

import { e2eTestHelper } from './helpers/e2e-test-helper'

describe('Throttling Configuration (E2E)', () => {
  beforeAll(async () => {
    await e2eTestHelper.setup()
  })

  afterAll(async () => {
    await e2eTestHelper.teardown()
  })

  describe('Throttling Configuration in Test Environment', () => {
    it('should have no throttling configuration in test environment', () => {
      // Verify that NODE_ENV is set to test
      expect(process.env.NODE_ENV).toBe('test')

      // Get the throttling configuration
      const throttlingConfig = getThrottlingConfig()

      // In test environment, throttling should be disabled (empty array)
      expect(throttlingConfig).toEqual([])
      expect(throttlingConfig).toHaveLength(0)
    })

    it('should handle multiple rapid requests without throttling in test environment', async () => {
      // Make sequential requests to avoid connection issues
      const responses = []

      for (let i = 0; i < 5; i++) {
        const response = await e2eTestHelper
          .createRequest()
          .get('/')
          .expect(HttpStatus.OK)
        responses.push(response)
      }

      // All requests should succeed since throttling is disabled in test
      expect(responses).toHaveLength(5)
      responses.forEach(response => {
        expect(response.status).toBe(HttpStatus.OK)
        expect(response.text).toBe('Hello World!')
      })
    })

    it('should allow rapid requests to different endpoints without throttling', async () => {
      const endpoints = [
        { path: '/', expectedStatus: HttpStatus.OK },
        { path: '/api/events', expectedStatus: HttpStatus.OK },
        { path: '/api/cities', expectedStatus: HttpStatus.OK },
        { path: '/health/json', expectedStatus: HttpStatus.OK },
      ]

      // Make sequential requests to different endpoints to avoid connection issues
      const responses = []

      for (const endpoint of endpoints) {
        for (let i = 0; i < 3; i++) {
          const response = await e2eTestHelper
            .createRequest()
            .get(endpoint.path)
            .expect(endpoint.expectedStatus)
          responses.push(response)
        }
      }

      // All 12 requests should succeed (3 per endpoint)
      expect(responses).toHaveLength(12)
      responses.forEach(response => {
        expect([HttpStatus.OK].includes(response.status)).toBe(true)
      })
    })
  })

  describe('Throttling Configuration Environment Testing', () => {
    let originalNodeEnv: string | undefined

    beforeEach(() => {
      originalNodeEnv = process.env.NODE_ENV
    })

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv
    })

    it('should return production throttling configuration when simulating production', () => {
      process.env.NODE_ENV = 'production'

      const config = getThrottlingConfig()

      expect(config).toHaveLength(2)
      expect(config[0]).toEqual({
        name: 'short',
        ttl: 1000,
        limit: 3,
      })
      expect(config[1]).toEqual({
        name: 'long',
        ttl: 60000,
        limit: 100,
      })
    })

    it('should return development throttling configuration when simulating development', () => {
      process.env.NODE_ENV = 'development'

      const config = getThrottlingConfig()

      expect(config).toHaveLength(2)
      expect(config[0]).toEqual({
        name: 'short',
        ttl: 1000,
        limit: 50,
      })
      expect(config[1]).toEqual({
        name: 'long',
        ttl: 60000,
        limit: 1000,
      })
    })

    it('should handle unknown environment as development', () => {
      process.env.NODE_ENV = 'staging'

      const config = getThrottlingConfig()

      expect(config).toHaveLength(2)
      expect(config[0]!.limit).toBe(50) // Should default to development
      expect(config[1]!.limit).toBe(1000)
    })

    it('should handle missing NODE_ENV as development', () => {
      delete process.env.NODE_ENV

      const config = getThrottlingConfig()

      expect(config).toHaveLength(2)
      expect(config[0]!.limit).toBe(50) // Should default to development
      expect(config[1]!.limit).toBe(1000)
    })
  })

  describe('Throttling Configuration Validation in E2E Context', () => {
    it('should validate throttling configuration structure', () => {
      const environments = ['production', 'development', 'test']

      environments.forEach(env => {
        const originalEnv = process.env.NODE_ENV
        process.env.NODE_ENV = env

        const config = getThrottlingConfig()

        if (env === 'test') {
          expect(config).toEqual([])
        } else {
          expect(config).toHaveLength(2)
          expect(config[0]).toHaveProperty('name', 'short')
          expect(config[0]).toHaveProperty('ttl', 1000)
          expect(config[0]).toHaveProperty('limit')
          expect(config[1]).toHaveProperty('name', 'long')
          expect(config[1]).toHaveProperty('ttl', 60000)
          expect(config[1]).toHaveProperty('limit')
        }

        process.env.NODE_ENV = originalEnv
      })
    })

    it('should ensure test environment disables throttling completely', () => {
      // This test verifies that the configuration used by the E2E test app
      // properly disables throttling
      process.env.NODE_ENV = 'test'

      const config = getThrottlingConfig()

      expect(config).toEqual([])
      expect(Array.isArray(config)).toBe(true)
      expect(config.length).toBe(0)
    })

    it('should verify environment-specific throttling limits', () => {
      // Test production environment
      process.env.NODE_ENV = 'production'
      let config = getThrottlingConfig()
      expect(config[0]!.limit).toBe(3) // Strict production limit
      expect(config[1]!.limit).toBe(100)

      // Test development environment
      process.env.NODE_ENV = 'development'
      config = getThrottlingConfig()
      expect(config[0]!.limit).toBe(50) // Lenient development limit
      expect(config[1]!.limit).toBe(1000)

      // Reset to test environment
      process.env.NODE_ENV = 'test'
      config = getThrottlingConfig()
      expect(config).toEqual([]) // No throttling in test
    })
  })
})
