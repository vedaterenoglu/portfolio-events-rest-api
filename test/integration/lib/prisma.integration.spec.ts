import {
  getLoggingConfig,
  createPrismaClient,
  getPrismaClient,
  disconnectPrisma,
} from '../../../src/lib/prisma'

describe('Prisma Integration Tests', () => {
  let originalNodeEnv: string | undefined

  beforeEach(() => {
    // Store original NODE_ENV
    originalNodeEnv = process.env.NODE_ENV
  })

  afterEach(async () => {
    // Restore original NODE_ENV
    if (originalNodeEnv !== undefined) {
      process.env.NODE_ENV = originalNodeEnv
    } else {
      delete process.env.NODE_ENV
    }

    // Clean up any Prisma instances
    await disconnectPrisma()
  })

  describe('getLoggingConfig', () => {
    it('should return development logging config when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development'

      const config = getLoggingConfig()

      expect(config).toEqual(['query', 'error', 'warn'])
    })

    it('should return production logging config when NODE_ENV is not development', () => {
      process.env.NODE_ENV = 'production'

      const config = getLoggingConfig()

      expect(config).toEqual(['error'])
    })

    it('should return production logging config when NODE_ENV is undefined', () => {
      delete process.env.NODE_ENV

      const config = getLoggingConfig()

      expect(config).toEqual(['error'])
    })

    it('should return production logging config when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test'

      const config = getLoggingConfig()

      expect(config).toEqual(['error'])
    })
  })

  describe('createPrismaClient', () => {
    it('should create a new PrismaClient instance with logging configuration', () => {
      const client = createPrismaClient()

      expect(client).toBeDefined()
      expect(typeof client.$connect).toBe('function')
      expect(typeof client.$disconnect).toBe('function')
    })

    it('should create different instances on multiple calls', () => {
      const client1 = createPrismaClient()
      const client2 = createPrismaClient()

      expect(client1).toBeDefined()
      expect(client2).toBeDefined()
      expect(typeof client1.$connect).toBe('function')
      expect(typeof client2.$connect).toBe('function')
      expect(client1).not.toBe(client2)
    })
  })

  describe('getPrismaClient', () => {
    it('should return the same instance on multiple calls (singleton behavior)', () => {
      const client1 = getPrismaClient()
      const client2 = getPrismaClient()

      expect(client1).toBeDefined()
      expect(client2).toBeDefined()
      expect(typeof client1.$connect).toBe('function')
      expect(typeof client2.$connect).toBe('function')
      expect(client1).toBe(client2)
    })

    it('should create a new instance if none exists', () => {
      const client = getPrismaClient()

      expect(client).toBeDefined()
      expect(typeof client.$connect).toBe('function')
      expect(typeof client.$disconnect).toBe('function')
    })
  })

  describe('disconnectPrisma', () => {
    it('should disconnect existing Prisma instance', async () => {
      // Create an instance first
      const client = getPrismaClient()
      expect(client).toBeDefined()
      expect(typeof client.$disconnect).toBe('function')

      // Mock the $disconnect method to verify it's called
      const disconnectSpy = jest
        .spyOn(client, '$disconnect')
        .mockResolvedValue()

      await disconnectPrisma()

      expect(disconnectSpy).toHaveBeenCalledTimes(1)
      disconnectSpy.mockRestore()
    })

    it('should handle gracefully when no Prisma instance exists', async () => {
      // Ensure no instance exists by calling disconnect first
      await disconnectPrisma()

      // This should not throw an error
      await expect(disconnectPrisma()).resolves.toBeUndefined()
    })
  })
})
