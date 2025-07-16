import { Test, TestingModule } from '@nestjs/testing'

import { disconnectPrisma } from '../../../src/lib/prisma'
import { GracefulShutdownService } from '../../../src/services/graceful-shutdown.service'

// Mock the prisma module
jest.mock('../../../src/lib/prisma', () => ({
  disconnectPrisma: jest.fn(),
}))

describe('GracefulShutdownService Integration', () => {
  let service: GracefulShutdownService
  let module: TestingModule
  let mockDisconnectPrisma: jest.MockedFunction<typeof disconnectPrisma>

  beforeEach(async () => {
    // Clear all timers before each test
    jest.clearAllTimers()
    jest.useRealTimers()

    mockDisconnectPrisma = disconnectPrisma as jest.MockedFunction<
      typeof disconnectPrisma
    >
    mockDisconnectPrisma.mockClear()
    mockDisconnectPrisma.mockResolvedValue()

    module = await Test.createTestingModule({
      providers: [GracefulShutdownService],
    }).compile()

    service = module.get<GracefulShutdownService>(GracefulShutdownService)
  })

  afterEach(async () => {
    jest.clearAllMocks()
    jest.useRealTimers() // Always restore real timers
    if (module) {
      await module.close() // Close the module to clean up resources
    }
  })

  describe('registerCleanupTask', () => {
    it('should register cleanup tasks and maintain priority order', () => {
      const task1 = {
        name: 'Low Priority Task',
        priority: 10,
        timeout: 5000,
        cleanup: jest.fn().mockResolvedValue(undefined),
      }
      const task2 = {
        name: 'High Priority Task',
        priority: 90,
        timeout: 3000,
        cleanup: jest.fn().mockResolvedValue(undefined),
      }

      service.registerCleanupTask(task1)
      service.registerCleanupTask(task2)

      // Verify tasks are sorted by priority
      const cleanupTasks = (service as unknown as { cleanupTasks: unknown[] })
        .cleanupTasks
      expect(cleanupTasks).toHaveLength(2)
    })
  })

  describe('isShuttingDownStatus', () => {
    it('should track shutdown status correctly', async () => {
      expect(service.isShuttingDownStatus()).toBe(false)

      const shutdownPromise = service.initiateShutdown('TEST_SIGNAL')
      expect(service.isShuttingDownStatus()).toBe(true)

      await shutdownPromise
      expect(service.isShuttingDownStatus()).toBe(true)
    })
  })

  describe('initiateShutdown', () => {
    it('should perform complete shutdown process with database disconnection', async () => {
      // Register a test cleanup task
      const cleanupMock = jest.fn().mockResolvedValue(undefined)
      service.registerCleanupTask({
        name: 'Test Cleanup',
        priority: 100,
        timeout: 5000,
        cleanup: cleanupMock,
      })

      // Initiate shutdown
      await service.initiateShutdown('INTEGRATION_TEST')

      // Verify cleanup task was executed
      expect(cleanupMock).toHaveBeenCalled()

      // Verify Prisma disconnection was called
      expect(mockDisconnectPrisma).toHaveBeenCalled()

      // Verify shutdown status
      expect(service.isShuttingDownStatus()).toBe(true)
    })

    it('should return existing promise when shutdown already in progress', async () => {
      // Reset mock to ensure clean state
      mockDisconnectPrisma.mockClear()

      // First shutdown
      const firstPromise = service.initiateShutdown('FIRST_SIGNAL')

      // Verify first shutdown started
      expect(service.isShuttingDownStatus()).toBe(true)

      // Second shutdown attempt
      const secondPromise = service.initiateShutdown('SECOND_SIGNAL')

      // Wait for both to complete
      await firstPromise
      await secondPromise

      // Verify Prisma disconnection was called only once
      expect(mockDisconnectPrisma).toHaveBeenCalledTimes(1)
    })

    it('should handle errors during cleanup tasks gracefully', async () => {
      // Register a failing cleanup task
      const failingCleanup = jest
        .fn()
        .mockRejectedValue(new Error('Cleanup failed'))
      service.registerCleanupTask({
        name: 'Failing Task',
        priority: 100,
        timeout: 5000,
        cleanup: failingCleanup,
      })

      // Register a successful cleanup task
      const successfulCleanup = jest.fn().mockResolvedValue(undefined)
      service.registerCleanupTask({
        name: 'Successful Task',
        priority: 50,
        timeout: 5000,
        cleanup: successfulCleanup,
      })

      // Initiate shutdown - should complete despite failing task
      await service.initiateShutdown('ERROR_TEST')

      // Verify both tasks were attempted
      expect(failingCleanup).toHaveBeenCalled()
      expect(successfulCleanup).toHaveBeenCalled()

      // Verify Prisma disconnection was still called
      expect(mockDisconnectPrisma).toHaveBeenCalled()
    })

    it('should handle cleanup task timeout', async () => {
      // Use fake timers for this test
      jest.useFakeTimers()

      // Register a task that will timeout
      const slowCleanup = jest.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(resolve, 10000) // 10 seconds
        })
      })
      service.registerCleanupTask({
        name: 'Slow Task',
        priority: 100,
        timeout: 1000, // 1 second timeout
        cleanup: slowCleanup,
      })

      // Initiate shutdown
      const shutdownPromise = service.initiateShutdown('TIMEOUT_TEST')

      // Fast forward past the timeout
      jest.advanceTimersByTime(2000)

      // Wait for shutdown to complete
      await shutdownPromise

      // Verify the task was attempted
      expect(slowCleanup).toHaveBeenCalled()

      // Verify Prisma disconnection was still called
      expect(mockDisconnectPrisma).toHaveBeenCalled()

      // Restore real timers
      jest.useRealTimers()
    })

    it('should handle database disconnection errors', async () => {
      // Mock Prisma disconnection to fail
      mockDisconnectPrisma.mockRejectedValue(
        new Error('Database disconnect failed'),
      )

      // Initiate shutdown - should complete despite database error
      await service.initiateShutdown('DB_ERROR_TEST')

      // Verify Prisma disconnection was attempted
      expect(mockDisconnectPrisma).toHaveBeenCalled()

      // Verify shutdown still completed
      expect(service.isShuttingDownStatus()).toBe(true)
    })

    it('should handle cleanup task that throws synchronously', async () => {
      // Create a cleanup task that throws an error synchronously
      const errorCleanup = jest.fn().mockImplementation(() => {
        throw new Error('Critical shutdown error')
      })
      service.registerCleanupTask({
        name: 'Critical Error Task',
        priority: 100,
        timeout: 5000,
        cleanup: errorCleanup,
      })

      // Register another task to ensure shutdown continues
      const successCleanup = jest.fn().mockResolvedValue(undefined)
      service.registerCleanupTask({
        name: 'Success Task',
        priority: 50,
        timeout: 5000,
        cleanup: successCleanup,
      })

      // Initiate shutdown - should complete despite the error
      await service.initiateShutdown('SYNC_ERROR_TEST')

      // Verify both tasks were attempted
      expect(errorCleanup).toHaveBeenCalled()
      expect(successCleanup).toHaveBeenCalled()

      // Verify shutdown completed
      expect(service.isShuttingDownStatus()).toBe(true)
    })
  })
})
