import {
  getThrottlingConfig,
  ThrottlingConfig,
} from '../../../src/config/throttling.config'

describe('ThrottlingConfig', () => {
  let originalNodeEnv: string | undefined

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  describe('getThrottlingConfig', () => {
    it('should return production configuration when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production'

      const result: ThrottlingConfig[] = getThrottlingConfig()

      expect(result).toEqual([
        { name: 'short', ttl: 1000, limit: 3 },
        { name: 'long', ttl: 60000, limit: 100 },
      ])
    })

    it('should return empty array when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test'

      const result: ThrottlingConfig[] = getThrottlingConfig()

      expect(result).toEqual([])
    })

    it('should return development configuration when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development'

      const result: ThrottlingConfig[] = getThrottlingConfig()

      expect(result).toEqual([
        { name: 'short', ttl: 1000, limit: 50 },
        { name: 'long', ttl: 60000, limit: 1000 },
      ])
    })

    it('should return development configuration when NODE_ENV is undefined', () => {
      delete process.env.NODE_ENV

      const result: ThrottlingConfig[] = getThrottlingConfig()

      expect(result).toEqual([
        { name: 'short', ttl: 1000, limit: 50 },
        { name: 'long', ttl: 60000, limit: 1000 },
      ])
    })

    it('should return development configuration for unknown environment', () => {
      process.env.NODE_ENV = 'staging'

      const result: ThrottlingConfig[] = getThrottlingConfig()

      expect(result).toEqual([
        { name: 'short', ttl: 1000, limit: 50 },
        { name: 'long', ttl: 60000, limit: 1000 },
      ])
    })

    it('should return development configuration when NODE_ENV is empty string', () => {
      process.env.NODE_ENV = ''

      const result: ThrottlingConfig[] = getThrottlingConfig()

      expect(result).toEqual([
        { name: 'short', ttl: 1000, limit: 50 },
        { name: 'long', ttl: 60000, limit: 1000 },
      ])
    })
  })

  describe('ThrottlingConfig interface', () => {
    it('should have correct structure for production config', () => {
      process.env.NODE_ENV = 'production'

      const result = getThrottlingConfig()

      result.forEach((config: ThrottlingConfig) => {
        expect(config).toHaveProperty('name')
        expect(config).toHaveProperty('ttl')
        expect(config).toHaveProperty('limit')
        expect(typeof config.name).toBe('string')
        expect(typeof config.ttl).toBe('number')
        expect(typeof config.limit).toBe('number')
      })
    })

    it('should have correct structure for development config', () => {
      process.env.NODE_ENV = 'development'

      const result = getThrottlingConfig()

      result.forEach((config: ThrottlingConfig) => {
        expect(config).toHaveProperty('name')
        expect(config).toHaveProperty('ttl')
        expect(config).toHaveProperty('limit')
        expect(typeof config.name).toBe('string')
        expect(typeof config.ttl).toBe('number')
        expect(typeof config.limit).toBe('number')
      })
    })
  })
})
