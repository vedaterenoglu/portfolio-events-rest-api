import { Test, TestingModule } from '@nestjs/testing'

import { disconnectPrisma } from '../../../src/lib/prisma'
import { GracefulShutdownService } from '../../../src/services/graceful-shutdown.service'

// Mock the prisma module
jest.mock('../../../src/lib/prisma', () => ({
  disconnectPrisma: jest.fn(),
}))

interface CleanupTask {
  name: string
  priority: number
  timeout: number
  cleanup: () => Promise<void>
}

describe('GracefulShutdownService', () => {
  let service: GracefulShutdownService
  let mockLogger: {
    log: jest.Mock
    error: jest.Mock
    warn: jest.Mock
    debug: jest.Mock
    verbose: jest.Mock
    fatal: jest.Mock
    setContext: jest.Mock
    localInstance: jest.Mock
  }
  let mockDisconnectPrisma: jest.MockedFunction<typeof disconnectPrisma>

  beforeEach(async () => {
    mockDisconnectPrisma = disconnectPrisma as jest.MockedFunction<
      typeof disconnectPrisma
    >
    mockDisconnectPrisma.mockClear()

    const module: TestingModule = await Test.createTestingModule({
      providers: [GracefulShutdownService],
    }).compile()

    service = module.get<GracefulShutdownService>(GracefulShutdownService)

    // Mock the logger
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      fatal: jest.fn(),
      setContext: jest.fn(),
      localInstance: jest.fn(),
    }

    // Replace the logger instance
    Object.defineProperty(service, 'logger', {
      value: mockLogger,
      writable: true,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  describe('registerCleanupTask', () => {
    it('should register a cleanup task and sort by priority', () => {
      const task1: CleanupTask = {
        name: 'Task 1',
        priority: 50,
        timeout: 5000,
        cleanup: jest.fn().mockResolvedValue(undefined),
      }
      const task2: CleanupTask = {
        name: 'Task 2',
        priority: 100,
        timeout: 3000,
        cleanup: jest.fn().mockResolvedValue(undefined),
      }

      service.registerCleanupTask(task1)
      service.registerCleanupTask(task2)

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Registered cleanup task: Task 1 (priority: 50)',
      )
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Registered cleanup task: Task 2 (priority: 100)',
      )

      // Verify tasks are sorted by priority (higher first)
      const cleanupTasks = (
        service as unknown as { cleanupTasks: CleanupTask[] }
      ).cleanupTasks
      expect(cleanupTasks[0]?.priority).toBe(100)
      expect(cleanupTasks[1]?.priority).toBe(50)
    })
  })

  describe('isShuttingDownStatus', () => {
    it('should return false initially', () => {
      expect(service.isShuttingDownStatus()).toBe(false)
    })

    it('should return true when shutdown is in progress', async () => {
      mockDisconnectPrisma.mockResolvedValue()

      const shutdownPromise = service.initiateShutdown('TEST_SIGNAL')

      expect(service.isShuttingDownStatus()).toBe(true)

      await shutdownPromise
    })
  })

  describe('initiateShutdown', () => {
    it('should initiate shutdown successfully', async () => {
      mockDisconnectPrisma.mockResolvedValue()

      await service.initiateShutdown('TEST_SIGNAL')

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Graceful shutdown initiated by TEST_SIGNAL',
      )
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Phase 1: Stopping new request acceptance',
      )
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Phase 2: Executing cleanup tasks',
      )
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Phase 3: Final cleanup - database connections',
      )
      expect(mockLogger.log).toHaveBeenCalledWith('Database connections closed')
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringMatching(/Graceful shutdown completed in \d+ms/),
      )
    })

    it('should return existing promise if shutdown already in progress', async () => {
      mockDisconnectPrisma.mockResolvedValue()

      const firstPromise = service.initiateShutdown('FIRST_SIGNAL')
      const secondPromise = service.initiateShutdown('SECOND_SIGNAL')

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Shutdown already in progress, ignoring signal',
      )

      await Promise.all([firstPromise, secondPromise])

      // Should only log the first shutdown initiation
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Graceful shutdown initiated by FIRST_SIGNAL',
      )
      expect(mockLogger.log).not.toHaveBeenCalledWith(
        'Graceful shutdown initiated by SECOND_SIGNAL',
      )
    })

    it('should handle shutdown errors gracefully', async () => {
      // Create a task that will throw an error
      const errorTask: CleanupTask = {
        name: 'Error Task',
        priority: 100,
        timeout: 5000,
        cleanup: jest.fn().mockImplementation(() => {
          throw new Error('Shutdown error')
        }),
      }

      service.registerCleanupTask(errorTask)

      // Mock disconnectPrisma to also throw an error
      mockDisconnectPrisma.mockRejectedValue(new Error('Prisma error'))

      // The service should still complete gracefully - it catches and logs errors
      await service.initiateShutdown('ERROR_SIGNAL')

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cleanup task failed: Error Task',
        expect.any(Error),
      )
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error closing database connections:',
        expect.any(Error),
      )
    })

    it('should handle errors in performShutdown and re-throw them', async () => {
      // Mock executeCleanupTasks to throw an error that will be caught by performShutdown
      const executeCleanupTasksSpy = jest.spyOn(
        service as unknown as { executeCleanupTasks: () => Promise<void> },
        'executeCleanupTasks',
      )
      const shutdownError = new Error('Critical shutdown error')
      executeCleanupTasksSpy.mockRejectedValue(shutdownError)

      // This should trigger the catch block in performShutdown (lines 76-77)
      await expect(service.initiateShutdown('ERROR_SIGNAL')).rejects.toThrow(
        'Critical shutdown error',
      )

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error during graceful shutdown:',
        shutdownError,
      )

      executeCleanupTasksSpy.mockRestore()
    })
  })

  describe('executeCleanupTasks', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should execute cleanup tasks in priority order', async () => {
      const task1: CleanupTask = {
        name: 'Task 1',
        priority: 50,
        timeout: 5000,
        cleanup: jest.fn().mockResolvedValue(undefined),
      }
      const task2: CleanupTask = {
        name: 'Task 2',
        priority: 100,
        timeout: 3000,
        cleanup: jest.fn().mockResolvedValue(undefined),
      }

      service.registerCleanupTask(task1)
      service.registerCleanupTask(task2)

      mockDisconnectPrisma.mockResolvedValue()

      const shutdownPromise = service.initiateShutdown('TEST_SIGNAL')

      // Fast forward timers to allow cleanup tasks to complete
      jest.runAllTimers()

      await shutdownPromise

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Executing cleanup task: Task 2',
      )
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Cleanup task completed: Task 2',
      )
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Executing cleanup task: Task 1',
      )
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Cleanup task completed: Task 1',
      )

      expect(task2.cleanup).toHaveBeenCalled()
      expect(task1.cleanup).toHaveBeenCalled()
    })

    it('should handle cleanup task failures without stopping other tasks', async () => {
      const error = new Error('Task failed')
      const task1: CleanupTask = {
        name: 'Failing Task',
        priority: 100,
        timeout: 5000,
        cleanup: jest.fn().mockRejectedValue(error),
      }
      const task2: CleanupTask = {
        name: 'Successful Task',
        priority: 50,
        timeout: 3000,
        cleanup: jest.fn().mockResolvedValue(undefined),
      }

      service.registerCleanupTask(task1)
      service.registerCleanupTask(task2)

      mockDisconnectPrisma.mockResolvedValue()

      const shutdownPromise = service.initiateShutdown('TEST_SIGNAL')

      jest.runAllTimers()

      await shutdownPromise

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cleanup task failed: Failing Task',
        error,
      )
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Cleanup task completed: Successful Task',
      )

      expect(task1.cleanup).toHaveBeenCalled()
      expect(task2.cleanup).toHaveBeenCalled()
    })

    it('should handle cleanup task timeout', async () => {
      const task: CleanupTask = {
        name: 'Slow Task',
        priority: 100,
        timeout: 1000,
        cleanup: jest
          .fn()
          .mockImplementation(
            () => new Promise(resolve => setTimeout(resolve, 2000)),
          ),
      }

      service.registerCleanupTask(task)
      mockDisconnectPrisma.mockResolvedValue()

      const shutdownPromise = service.initiateShutdown('TEST_SIGNAL')

      // Fast forward past the timeout
      jest.advanceTimersByTime(1500)

      await shutdownPromise

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cleanup task failed: Slow Task',
        expect.objectContaining({
          message: 'Cleanup task Slow Task timed out after 1000ms',
        }),
      )
    })
  })

  describe('performFinalCleanup', () => {
    it('should disconnect Prisma and log success', async () => {
      mockDisconnectPrisma.mockResolvedValue()

      await service.initiateShutdown('TEST_SIGNAL')

      expect(mockDisconnectPrisma).toHaveBeenCalled()
      expect(mockLogger.log).toHaveBeenCalledWith('Database connections closed')
    })

    it('should handle Prisma disconnection errors', async () => {
      const error = new Error('Prisma disconnect failed')
      mockDisconnectPrisma.mockRejectedValue(error)

      // The service should complete gracefully even with Prisma errors
      await service.initiateShutdown('TEST_SIGNAL')

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error closing database connections:',
        error,
      )
    })
  })

  describe('onModuleDestroy', () => {
    it('should initiate shutdown if not already shutting down', async () => {
      mockDisconnectPrisma.mockResolvedValue()

      await service.onModuleDestroy()

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Module destruction - initiating graceful shutdown',
      )
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Graceful shutdown initiated by MODULE_DESTROY',
      )
    })

    it('should not initiate shutdown if already shutting down', async () => {
      mockDisconnectPrisma.mockResolvedValue()

      // Start shutdown first
      const shutdownPromise = service.initiateShutdown('FIRST_SIGNAL')

      // Now call onModuleDestroy
      await service.onModuleDestroy()

      await shutdownPromise

      expect(mockLogger.log).not.toHaveBeenCalledWith(
        'Module destruction - initiating graceful shutdown',
      )
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Graceful shutdown initiated by FIRST_SIGNAL',
      )
    })
  })
})
