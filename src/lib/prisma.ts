import { PrismaClient } from '../generated/client'
import {
  PrismaClientValidationError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
} from '../generated/client/runtime/library'

// Import model types
import type { TCity, TEvent, Prisma } from '../generated/client'

// Singleton instance
let prismaInstance: PrismaClient

/**
 * Get singleton instance of PrismaClient
 * Ensures only one database connection is created
 */
export const getPrismaClient = (): PrismaClient => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    })
  }
  return prismaInstance
}

/**
 * Disconnect Prisma client (for graceful shutdown)
 */
export const disconnectPrisma = async (): Promise<void> => {
  if (prismaInstance) {
    await prismaInstance.$disconnect()
  }
}

// Re-export PrismaClient class for type usage
export { PrismaClient }

// Re-export error classes (not as types, since they're used with instanceof)
export {
  PrismaClientValidationError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
}

// Re-export model types
export type { TCity, TEvent, Prisma }
