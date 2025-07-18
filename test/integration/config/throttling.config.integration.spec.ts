import {
  getThrottlingConfig,
  ThrottlingConfig,
} from '../../../src/config/throttling.config'

describe('ThrottlingConfig Integration', () => {
  let originalNodeEnv: string | undefined

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  describe('getThrottlingConfig integration scenarios', () => {
    it('should return production throttling limits for production environment', () => {
      process.env.NODE_ENV = 'production'

      const config: ThrottlingConfig[] = getThrottlingConfig()

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

      // Verify production has stricter limits
      expect(config[0]!.limit).toBe(3) // Stricter short limit
      expect(config[1]!.limit).toBe(100) // Stricter long limit
    })

    it('should disable throttling completely in test environment', () => {
      process.env.NODE_ENV = 'test'

      const config: ThrottlingConfig[] = getThrottlingConfig()

      expect(config).toEqual([])
      expect(config).toHaveLength(0)
    })

    it('should return development throttling limits for development environment', () => {
      process.env.NODE_ENV = 'development'

      const config: ThrottlingConfig[] = getThrottlingConfig()

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

      // Verify development has more lenient limits
      expect(config[0]!.limit).toBe(50) // More lenient short limit
      expect(config[1]!.limit).toBe(1000) // More lenient long limit
    })

    it('should handle environment switching correctly', () => {
      // Start with production
      process.env.NODE_ENV = 'production'
      let config = getThrottlingConfig()
      expect(config[0]!.limit).toBe(3)

      // Switch to development
      process.env.NODE_ENV = 'development'
      config = getThrottlingConfig()
      expect(config[0]!.limit).toBe(50)

      // Switch to test
      process.env.NODE_ENV = 'test'
      config = getThrottlingConfig()
      expect(config).toHaveLength(0)

      // Switch back to production
      process.env.NODE_ENV = 'production'
      config = getThrottlingConfig()
      expect(config[0]!.limit).toBe(3)
    })

    it('should handle unknown environment as development', () => {
      process.env.NODE_ENV = 'staging'

      const config: ThrottlingConfig[] = getThrottlingConfig()

      expect(config).toHaveLength(2)
      expect(config[0]!.limit).toBe(50) // Should match development limits
      expect(config[1]!.limit).toBe(1000) // Should match development limits
    })

    it('should handle missing NODE_ENV as development', () => {
      delete process.env.NODE_ENV

      const config: ThrottlingConfig[] = getThrottlingConfig()

      expect(config).toHaveLength(2)
      expect(config[0]!.limit).toBe(50) // Should match development limits
      expect(config[1]!.limit).toBe(1000) // Should match development limits
    })
  })

  describe('throttling configuration validation', () => {
    it('should return valid configuration structure for all environments', () => {
      const environments = ['production', 'development', 'test', 'staging']

      environments.forEach(env => {
        process.env.NODE_ENV = env
        const config = getThrottlingConfig()

        if (env === 'test') {
          expect(config).toEqual([])
        } else {
          expect(config).toHaveLength(2)
          config.forEach((item: ThrottlingConfig) => {
            expect(item).toHaveProperty('name')
            expect(item).toHaveProperty('ttl')
            expect(item).toHaveProperty('limit')
            expect(typeof item.name).toBe('string')
            expect(typeof item.ttl).toBe('number')
            expect(typeof item.limit).toBe('number')
            expect(item.ttl).toBeGreaterThan(0)
            expect(item.limit).toBeGreaterThan(0)
          })
        }
      })
    })

    it('should maintain consistent configuration structure between environments', () => {
      process.env.NODE_ENV = 'production'
      const prodConfig = getThrottlingConfig()

      process.env.NODE_ENV = 'development'
      const devConfig = getThrottlingConfig()

      // Both should have same structure (2 items with same names)
      expect(prodConfig).toHaveLength(2)
      expect(devConfig).toHaveLength(2)
      expect(prodConfig[0]!.name).toBe(devConfig[0]!.name)
      expect(prodConfig[1]!.name).toBe(devConfig[1]!.name)
      expect(prodConfig[0]!.ttl).toBe(devConfig[0]!.ttl)
      expect(prodConfig[1]!.ttl).toBe(devConfig[1]!.ttl)

      // But different limits
      expect(prodConfig[0]!.limit).not.toBe(devConfig[0]!.limit)
      expect(prodConfig[1]!.limit).not.toBe(devConfig[1]!.limit)
    })
  })

  describe('throttling configuration edge cases', () => {
    it('should handle empty string NODE_ENV', () => {
      process.env.NODE_ENV = ''

      const config: ThrottlingConfig[] = getThrottlingConfig()

      expect(config).toHaveLength(2)
      expect(config[0]!.limit).toBe(50) // Should default to development
    })

    it('should handle whitespace NODE_ENV', () => {
      process.env.NODE_ENV = '   '

      const config: ThrottlingConfig[] = getThrottlingConfig()

      expect(config).toHaveLength(2)
      expect(config[0]!.limit).toBe(50) // Should default to development
    })

    it('should handle case sensitivity correctly', () => {
      process.env.NODE_ENV = 'PRODUCTION'

      const config: ThrottlingConfig[] = getThrottlingConfig()

      expect(config).toHaveLength(2)
      expect(config[0]!.limit).toBe(50) // Should default to development (case sensitive)
    })
  })
})
