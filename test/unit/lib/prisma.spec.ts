import { disconnectPrisma, getPrismaClient } from '../../../src/lib/prisma'

describe('Prisma lib', () => {
  describe('disconnectPrisma', () => {
    it('should handle disconnect when prisma instance exists', async () => {
      // Call disconnectPrisma to test the function
      await expect(disconnectPrisma()).resolves.toBeUndefined()
    })
  })

  describe('getPrismaClient', () => {
    it('should return prisma client instance', () => {
      const client = getPrismaClient()
      expect(client).toBeDefined()
      expect(typeof client).toBe('object')
    })

    it('should return same instance on multiple calls (singleton)', () => {
      const client1 = getPrismaClient()
      const client2 = getPrismaClient()
      expect(client1).toBe(client2)
    })
  })
})
