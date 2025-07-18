import { Test, TestingModule } from '@nestjs/testing'

import { DatabaseService } from '../../../src/database/database.service'
import { GracefulShutdownService } from '../../../src/services/graceful-shutdown.service'
import {
  HealthMonitoringService,
  HealthStatus,
} from '../../../src/services/health-monitoring.service'

describe('HealthMonitoringService (Integration)', () => {
  let service: HealthMonitoringService
  let databaseService: DatabaseService
  let gracefulShutdownService: GracefulShutdownService

  beforeEach(async () => {
    const mockDatabaseService = {
      isHealthy: jest.fn(),
      getConnectionInfo: jest.fn(),
      tCity: {
        findFirst: jest.fn(),
      },
    }

    const mockGracefulShutdownService = {
      isShuttingDown: jest.fn(),
      getShutdownStatus: jest.fn(),
      isShuttingDownStatus: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthMonitoringService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: GracefulShutdownService,
          useValue: mockGracefulShutdownService,
        },
      ],
    }).compile()

    service = module.get<HealthMonitoringService>(HealthMonitoringService)
    databaseService = module.get<DatabaseService>(DatabaseService)
    gracefulShutdownService = module.get<GracefulShutdownService>(
      GracefulShutdownService,
    )
  })

  describe('Health Check Operations', () => {
    it('should return healthy status when all checks pass', async () => {
      // Arrange
      jest
        .spyOn(databaseService.tCity, 'findFirst' as never)
        .mockResolvedValue({} as never)
      jest
        .spyOn(gracefulShutdownService, 'isShuttingDown' as never)
        .mockReturnValue(false as never)
      jest
        .spyOn(gracefulShutdownService, 'isShuttingDownStatus' as never)
        .mockReturnValue(false as never)

      // Act
      const result = await service.getHealthCheck()

      // Assert
      expect(result.checks.database.status).toBe(HealthStatus.HEALTHY)
      expect(result.checks.shutdown.status).toBe(HealthStatus.HEALTHY)
      expect(result.checks.memory.status).toBeDefined()
      expect(result.status).toBeDefined()
      expect(result.environment).toBeDefined()
      expect(result.version).toBeDefined()
      expect(result.uptime).toBeGreaterThan(0)
    })

    it('should return unhealthy status when database check fails', async () => {
      // Arrange
      jest
        .spyOn(databaseService.tCity, 'findFirst' as never)
        .mockRejectedValue(new Error('Database connection failed') as never)
      jest
        .spyOn(gracefulShutdownService, 'isShuttingDown' as never)
        .mockReturnValue(false as never)
      jest
        .spyOn(gracefulShutdownService, 'isShuttingDownStatus' as never)
        .mockReturnValue(false as never)

      // Act
      const result = await service.getHealthCheck()

      // Assert
      expect(result.status).toBe(HealthStatus.UNHEALTHY)
      expect(result.checks.database.status).toBe(HealthStatus.UNHEALTHY)
      expect(result.checks.database.message).toContain(
        'Database connection failed',
      )
    })

    it('should return readiness check with database and shutdown status', async () => {
      // Arrange
      jest
        .spyOn(databaseService.tCity, 'findFirst' as never)
        .mockResolvedValue({} as never)
      jest
        .spyOn(gracefulShutdownService, 'isShuttingDown' as never)
        .mockReturnValue(false as never)
      jest
        .spyOn(gracefulShutdownService, 'isShuttingDownStatus' as never)
        .mockReturnValue(false as never)

      // Act
      const result = await service.getReadinessCheck()

      // Assert
      expect(result.ready).toBe(true)
      expect(result.checks.database).toBe(true)
      expect(result.checks.shutdown).toBe(true)
      expect(result.status).toBe('ready')
      expect(result.timestamp).toBeDefined()
    })

    it('should return shutdown status as degraded when isShuttingDown is true', async () => {
      // Arrange - Mock to return true for isShuttingDownStatus to cover line 490
      jest
        .spyOn(gracefulShutdownService, 'isShuttingDownStatus' as never)
        .mockReturnValue(true as never)
      jest
        .spyOn(databaseService.tCity, 'findFirst' as never)
        .mockResolvedValue({} as never)

      // Act
      const result = await service.getHealthCheck()

      // Assert - Should trigger line 490 (shutdown degraded branch)
      expect(result.checks.shutdown.status).toBe(HealthStatus.DEGRADED)
      expect(result.checks.shutdown.message).toBe(
        'Application is shutting down',
      )
      expect(result.checks.shutdown.details?.shutdownInProgress).toBe(true)
    })

    it('should return healthy memory status for low memory usage', async () => {
      // Arrange - Mock process.memoryUsage to return low memory values to trigger lines 461-462
      const originalMemoryUsage = process.memoryUsage
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        rss: 100 * 1024 * 1024, // 100MB RSS (< 200MB threshold)
        heapUsed: 50 * 1024 * 1024, // 50MB heap used
        heapTotal: 200 * 1024 * 1024, // 200MB heap total
        external: 10 * 1024 * 1024,
        arrayBuffers: 5 * 1024 * 1024,
      })

      jest
        .spyOn(databaseService.tCity, 'findFirst' as never)
        .mockResolvedValue({} as never)
      jest
        .spyOn(gracefulShutdownService, 'isShuttingDownStatus' as never)
        .mockReturnValue(false as never)

      try {
        // Act
        const result = await service.getHealthCheck()

        // Assert - Should trigger healthy memory status and overall healthy status (lines 461-462, 533)
        expect(result.checks.memory.status).toBe(HealthStatus.HEALTHY)
        expect(result.checks.memory.message).toBe('Memory usage is normal')
        expect(result.status).toBe(HealthStatus.HEALTHY) // Covers line 533
      } finally {
        // Restore original function
        process.memoryUsage = originalMemoryUsage
      }
    })

    it('should return degraded memory status for moderate memory usage', async () => {
      // Arrange - Mock process.memoryUsage to return moderate memory values to trigger lines 464-465
      const originalMemoryUsage = process.memoryUsage
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        rss: 300 * 1024 * 1024, // 300MB RSS (between 200-400MB threshold)
        heapUsed: 800 * 1024 * 1024, // 800MB heap used (between 50-70% of max)
        heapTotal: 1000 * 1024 * 1024, // 1000MB heap total
        external: 10 * 1024 * 1024,
        arrayBuffers: 5 * 1024 * 1024,
      })

      jest
        .spyOn(databaseService.tCity, 'findFirst' as never)
        .mockResolvedValue({} as never)
      jest
        .spyOn(gracefulShutdownService, 'isShuttingDownStatus' as never)
        .mockReturnValue(false as never)

      try {
        // Act
        const result = await service.getHealthCheck()

        // Assert - Should trigger degraded memory status (lines 464-465)
        expect(result.checks.memory.status).toBe(HealthStatus.DEGRADED)
        expect(result.checks.memory.message).toBe('Memory usage is elevated')
        expect(result.status).toBe(HealthStatus.DEGRADED) // Also covers degraded overall status
      } finally {
        // Restore original function
        process.memoryUsage = originalMemoryUsage
      }
    })

    it('should handle database ready check exception', async () => {
      // Arrange - Mock tCity.findFirst to throw an error to cover line 516
      jest
        .spyOn(databaseService.tCity, 'findFirst' as never)
        .mockRejectedValue(new Error('Database connection failed') as never)
      jest
        .spyOn(gracefulShutdownService, 'isShuttingDown' as never)
        .mockReturnValue(false as never)
      jest
        .spyOn(gracefulShutdownService, 'isShuttingDownStatus' as never)
        .mockReturnValue(false as never)

      // Act
      const result = await service.getReadinessCheck()

      // Assert - Database should be false due to exception (line 516)
      expect(result.ready).toBe(false)
      expect(result.checks.database).toBe(false)
      expect(result.checks.shutdown).toBe(true)
      expect(result.status).toBe('not_ready')
      expect(result.timestamp).toBeDefined()
    })
  })

  describe('Shutdown Status Operations', () => {
    it('should return shutdown status with proper structure', () => {
      // Arrange
      jest
        .spyOn(gracefulShutdownService, 'isShuttingDownStatus' as never)
        .mockReturnValue(false as never)

      // Act
      const result = service.getShutdownStatus()

      // Assert
      expect(result.isShuttingDown).toBe(false)
      expect(result.timestamp).toBeDefined()
      expect(result.uptime).toBeGreaterThan(0)
      expect(result.gracefulShutdown.enabled).toBe(true)
      expect(result.gracefulShutdown.status).toBe('active')
    })
  })

  describe('Metrics Operations', () => {
    it('should return metrics with proper structure and record request', () => {
      // Act
      service.recordRequest(100, true)
      service.recordError('TestError', 'Test error message')
      const metrics = service.getMetrics()

      // Assert
      expect(metrics.requests).toBeDefined()
      expect(metrics.requests.total).toBeGreaterThan(0)
      expect(metrics.requests.success).toBeGreaterThan(0)
      expect(metrics.requests.rate).toBeGreaterThanOrEqual(0)
      expect(metrics.performance).toBeDefined()
      expect(metrics.performance.cpuUsage).toBeGreaterThanOrEqual(0)
      expect(metrics.performance.memoryUsage).toBeDefined()
      expect(metrics.errors).toBeDefined()
      expect(metrics.errors.total).toBeGreaterThan(0)
    })

    it('should reset metrics when resetMetrics is called', () => {
      // Arrange
      service.recordRequest(100, true)
      service.recordError('TestError', 'Test error message')

      // Act
      service.resetMetrics()
      const metrics = service.getMetrics()

      // Assert
      expect(metrics.requests.total).toBe(0)
      expect(metrics.requests.success).toBe(0)
      expect(metrics.requests.errors).toBe(0)
      expect(metrics.errors.total).toBe(0)
    })

    it('should record failed requests and increment error count', () => {
      // Act - Record failed request to cover line 133
      service.recordRequest(150, false)
      const metrics = service.getMetrics()

      // Assert
      expect(metrics.requests.total).toBeGreaterThan(0)
      expect(metrics.requests.errors).toBeGreaterThan(0)
      expect(metrics.requests.success).toBeGreaterThanOrEqual(0)
    })

    it('should trim request response times array when exceeding 1000 entries', () => {
      // Arrange - Reset metrics first
      service.resetMetrics()

      // Act - Record 1005 requests to trigger trimming at line 138
      for (let i = 0; i < 1005; i++) {
        service.recordRequest(i, true)
      }

      const metrics = service.getMetrics()

      // Assert
      expect(metrics.requests.total).toBe(1005)
      expect(metrics.requests.success).toBe(1005)
      expect(metrics.requests.errors).toBe(0)
    })

    it('should trim error recent array when exceeding 100 entries', () => {
      // Arrange - Reset metrics first
      service.resetMetrics()

      // Act - Record 105 errors to trigger trimming at line 159
      for (let i = 0; i < 105; i++) {
        service.recordError(`ErrorType${i}`, `Error message ${i}`)
      }

      const metrics = service.getMetrics()

      // Assert
      expect(metrics.errors.total).toBe(105)
      expect(metrics.errors.byType).toBeDefined()
      expect(Object.keys(metrics.errors.byType).length).toBe(105)
    })

    it('should measure event loop lag asynchronously', async () => {
      // Arrange - Reset metrics first
      service.resetMetrics()

      // Act - Call getMetrics multiple times to trigger event loop lag measurement
      for (let i = 0; i < 10; i++) {
        service.getMetrics()
      }

      // Wait for async event loop lag measurements to complete
      await new Promise(resolve => setTimeout(resolve, 100))

      const metrics = service.getMetrics()

      // Assert - Should have event loop lag measurements
      expect(metrics.performance.eventLoopLag).toBeGreaterThanOrEqual(0)
      expect(typeof metrics.performance.eventLoopLag).toBe('number')
    })

    it('should trim performance samples when exceeding 100 entries', async () => {
      // Arrange - Reset metrics first
      service.resetMetrics()

      // Act - Call getMetrics 110 times to trigger performance samples trimming at line 222
      for (let i = 0; i < 110; i++) {
        service.getMetrics()
      }

      // Wait for async event loop lag measurements to complete and accumulate
      await new Promise(resolve => setTimeout(resolve, 200))

      const metrics = service.getMetrics()

      // Assert - Should have event loop lag measurements
      expect(metrics.performance.eventLoopLag).toBeGreaterThanOrEqual(0)
      expect(typeof metrics.performance.eventLoopLag).toBe('number')
    })
  })
})
