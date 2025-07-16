import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'

import { disconnectPrisma } from '../lib/prisma'

interface CleanupTask {
  name: string
  priority: number
  timeout: number
  cleanup: () => Promise<void>
}

@Injectable()
export class GracefulShutdownService implements OnModuleDestroy {
  private readonly logger = new Logger(GracefulShutdownService.name)
  private readonly cleanupTasks: CleanupTask[] = []
  private isShuttingDown = false
  private shutdownPromise: Promise<void> | null = null

  /**
   * Register a cleanup task to be executed during shutdown
   * @param task - Cleanup task configuration
   */
  registerCleanupTask(task: CleanupTask): void {
    this.cleanupTasks.push(task)
    // Sort tasks by priority (higher priority first)
    this.cleanupTasks.sort((a, b) => b.priority - a.priority)
    this.logger.log(
      `Registered cleanup task: ${task.name} (priority: ${task.priority})`,
    )
  }

  /**
   * Check if the application is currently shutting down
   */
  isShuttingDownStatus(): boolean {
    return this.isShuttingDown
  }

  /**
   * Initiate graceful shutdown process
   */
  async initiateShutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      this.logger.warn('Shutdown already in progress, ignoring signal')
      return this.shutdownPromise || Promise.resolve()
    }

    this.isShuttingDown = true
    this.logger.log(`Graceful shutdown initiated by ${signal}`)

    this.shutdownPromise = this.performShutdown()
    return this.shutdownPromise
  }

  /**
   * Perform the multi-phase shutdown process
   */
  private async performShutdown(): Promise<void> {
    const startTime = Date.now()

    try {
      // Phase 1: Stop accepting new requests (handled by NestJS)
      this.logger.log('Phase 1: Stopping new request acceptance')

      // Phase 2: Execute cleanup tasks in priority order
      this.logger.log('Phase 2: Executing cleanup tasks')
      await this.executeCleanupTasks()

      // Phase 3: Final cleanup - database connections
      this.logger.log('Phase 3: Final cleanup - database connections')
      await this.performFinalCleanup()

      const duration = Date.now() - startTime
      this.logger.log(`Graceful shutdown completed in ${duration}ms`)
    } catch (error) {
      this.logger.error('Error during graceful shutdown:', error)
      throw error
    }
  }

  /**
   * Execute all registered cleanup tasks
   */
  private async executeCleanupTasks(): Promise<void> {
    for (const task of this.cleanupTasks) {
      try {
        this.logger.log(`Executing cleanup task: ${task.name}`)

        const timeoutPromise = new Promise<void>((_, reject) => {
          setTimeout(() => {
            reject(
              new Error(
                `Cleanup task ${task.name} timed out after ${task.timeout}ms`,
              ),
            )
          }, task.timeout)
        })

        await Promise.race([task.cleanup(), timeoutPromise])
        this.logger.log(`Cleanup task completed: ${task.name}`)
      } catch (error) {
        this.logger.error(`Cleanup task failed: ${task.name}`, error)
        // Continue with other tasks even if one fails
      }
    }
  }

  /**
   * Perform final cleanup operations
   */
  private async performFinalCleanup(): Promise<void> {
    try {
      // Disconnect Prisma client
      await disconnectPrisma()
      this.logger.log('Database connections closed')
    } catch (error) {
      this.logger.error('Error closing database connections:', error)
    }
  }

  /**
   * NestJS lifecycle hook - called during module destruction
   */
  async onModuleDestroy(): Promise<void> {
    if (!this.isShuttingDown) {
      this.logger.log('Module destruction - initiating graceful shutdown')
      await this.initiateShutdown('MODULE_DESTROY')
    }
  }
}
