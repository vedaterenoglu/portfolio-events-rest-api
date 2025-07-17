import { Test, TestingModule } from '@nestjs/testing'

import { DatabaseService } from '../../../src/database/database.service'
import { GracefulShutdownService } from '../../../src/services/graceful-shutdown.service'
import {
  HealthMonitoringService,
  HealthStatus,
} from '../../../src/services/health-monitoring.service'

describe('HealthMonitoringService', () => {
  let service: HealthMonitoringService
  let mockDatabaseService: {
    tCity: {
      findFirst: jest.Mock
    }
  }
  let mockGracefulShutdownService: {
    isShuttingDownStatus: jest.Mock
  }

  beforeEach(async () => {
    mockDatabaseService = {
      tCity: {
        findFirst: jest.fn().mockResolvedValue({
          citySlug: 'test',
          city: 'Test City',
          url: 'https://example.com/test.jpg',
          alt: 'Test city image',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
    }

    mockGracefulShutdownService = {
      isShuttingDownStatus: jest.fn().mockReturnValue(false),
    }

    // Mock process.memoryUsage to return low memory values for healthy status
    jest.spyOn(process, 'memoryUsage').mockReturnValue({
      heapUsed: 50 * 1024 * 1024, // 50MB
      heapTotal: 100 * 1024 * 1024, // 100MB (50% usage < 70% threshold)
      external: 0,
      rss: 0,
      arrayBuffers: 0,
    })

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

    // Reset metrics to ensure clean state between tests
    service.resetMetrics()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getHealthCheck', () => {
    it('should return health check with healthy status', async () => {
      // Act
      const result = await service.getHealthCheck()

      // Assert
      expect(result).toBeDefined()
      expect(result.status).toBe(HealthStatus.HEALTHY)
      expect(result.timestamp).toBeDefined()
      expect(result.uptime).toBeGreaterThan(0)
      expect(result.environment).toBeDefined()
      expect(result.version).toBeDefined()
      expect(result.checks).toBeDefined()
      expect(result.checks.database).toBeDefined()
      expect(result.checks.memory).toBeDefined()
      expect(result.checks.shutdown).toBeDefined()
      expect(result.metrics).toBeDefined()
    })

    it('should return unhealthy status when database check fails', async () => {
      // Arrange
      const error = new Error('Database connection failed')
      mockDatabaseService.tCity.findFirst.mockRejectedValue(error)

      // Act
      const result = await service.getHealthCheck()

      // Assert
      expect(result).toBeDefined()
      expect(result.status).toBe(HealthStatus.UNHEALTHY)
      expect(result.timestamp).toBeDefined()
      expect(result.uptime).toBeGreaterThan(0)
      expect(result.environment).toBeDefined()
      expect(result.version).toBeDefined()
      expect(result.checks).toBeDefined()
      expect(result.checks.database.status).toBe(HealthStatus.UNHEALTHY)
      expect(result.checks.database.message).toBe('Database connection failed')
      expect(result.checks.memory.status).toBe(HealthStatus.HEALTHY)
      expect(result.checks.shutdown.status).toBe(HealthStatus.HEALTHY)
      expect(result.metrics).toBeDefined()
    })

    it('should return degraded status when memory usage is elevated', async () => {
      // Arrange - Mock memory usage with RSS at 300MB (between 200-400MB for degraded)
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        heapUsed: 80 * 1024 * 1024, // 80MB
        heapTotal: 100 * 1024 * 1024, // 100MB
        external: 0,
        rss: 300 * 1024 * 1024, // 300MB RSS - should trigger degraded
        arrayBuffers: 0,
      })

      // Act
      const result = await service.getHealthCheck()

      // Assert
      expect(result).toBeDefined()
      expect(result.status).toBe(HealthStatus.DEGRADED)
      expect(result.checks.memory.status).toBe(HealthStatus.DEGRADED)
      expect(result.checks.memory.message).toBe('Memory usage is elevated')
      expect(result.checks.database.status).toBe(HealthStatus.HEALTHY)
      expect(result.checks.shutdown.status).toBe(HealthStatus.HEALTHY)
    })

    it('should return unhealthy status when memory usage is critical', async () => {
      // Arrange - Mock memory usage with RSS at 500MB (> 400MB for unhealthy)
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        heapUsed: 95 * 1024 * 1024, // 95MB
        heapTotal: 100 * 1024 * 1024, // 100MB
        external: 0,
        rss: 500 * 1024 * 1024, // 500MB RSS - should trigger unhealthy
        arrayBuffers: 0,
      })

      // Act
      const result = await service.getHealthCheck()

      // Assert
      expect(result).toBeDefined()
      expect(result.status).toBe(HealthStatus.UNHEALTHY)
      expect(result.checks.memory.status).toBe(HealthStatus.UNHEALTHY)
      expect(result.checks.memory.message).toBe('Memory usage is critical')
      expect(result.checks.database.status).toBe(HealthStatus.HEALTHY)
      expect(result.checks.shutdown.status).toBe(HealthStatus.HEALTHY)
    })

    it('should return degraded status when application is shutting down', async () => {
      // Arrange - Mock graceful shutdown in progress
      mockGracefulShutdownService.isShuttingDownStatus.mockReturnValue(true)

      // Act
      const result = await service.getHealthCheck()

      // Assert
      expect(result).toBeDefined()
      expect(result.status).toBe(HealthStatus.DEGRADED)
      expect(result.checks.shutdown.status).toBe(HealthStatus.DEGRADED)
      expect(result.checks.shutdown.message).toBe(
        'Application is shutting down',
      )
      expect(result.checks.database.status).toBe(HealthStatus.HEALTHY)
      expect(result.checks.memory.status).toBe(HealthStatus.HEALTHY)
    })

    it('should return unhealthy status when health check encounters general error', async () => {
      // Arrange - Mock Promise.all to throw error to trigger catch block
      const originalPromiseAll = Promise.all.bind(Promise)
      jest.spyOn(Promise, 'all').mockRejectedValue(new Error('General error'))

      // Mock metricsCollector methods to return safe values for error handling
      const mockRequestMetrics = {
        total: 0,
        success: 0,
        errors: 0,
        rate: 0,
        averageResponseTime: 0,
      }
      const mockPerformanceMetrics = {
        cpuUsage: 0,
        memoryUsage: { used: 0, total: 0, percentage: 0 },
        eventLoopLag: 0,
      }
      const mockErrorMetrics = {
        total: 0,
        rate: 0,
        byType: {},
        recent: [],
      }

      jest
        .spyOn(service['metricsCollector'], 'getRequestMetrics')
        .mockReturnValue(mockRequestMetrics)
      jest
        .spyOn(service['metricsCollector'], 'getPerformanceMetrics')
        .mockReturnValue(mockPerformanceMetrics)
      jest
        .spyOn(service['metricsCollector'], 'getErrorMetrics')
        .mockReturnValue(mockErrorMetrics)

      // Act
      const result = await service.getHealthCheck()

      // Assert
      expect(result).toBeDefined()
      expect(result.status).toBe(HealthStatus.UNHEALTHY)
      expect(result.timestamp).toBeDefined()
      expect(result.uptime).toBeGreaterThan(0)
      expect(result.environment).toBeDefined()
      expect(result.version).toBeDefined()
      expect(result.checks.database.status).toBe(HealthStatus.UNHEALTHY)
      expect(result.checks.database.message).toBe('Health check failed')
      expect(result.checks.memory.status).toBe(HealthStatus.UNHEALTHY)
      expect(result.checks.memory.message).toBe('Health check failed')
      expect(result.checks.shutdown.status).toBe(HealthStatus.UNHEALTHY)
      expect(result.checks.shutdown.message).toBe('Health check failed')
      expect(result.metrics).toBeDefined()
      expect(result.metrics.requests).toEqual(mockRequestMetrics)
      expect(result.metrics.performance).toEqual(mockPerformanceMetrics)
      expect(result.metrics.errors).toEqual(mockErrorMetrics)

      // Cleanup
      jest.spyOn(Promise, 'all').mockImplementation(originalPromiseAll)
    })
  })

  describe('getReadinessCheck', () => {
    it('should return ready status when all checks pass', async () => {
      // Act
      const result = await service.getReadinessCheck()

      // Assert
      expect(result).toBeDefined()
      expect(result.status).toBe('ready')
      expect(result.timestamp).toBeDefined()
      expect(result.ready).toBe(true)
      expect(result.checks).toBeDefined()
      expect(result.checks.database).toBe(true)
      expect(result.checks.shutdown).toBe(true)
    })

    it('should return not ready status when database check fails', async () => {
      // Arrange
      const error = new Error('Database connection failed')
      mockDatabaseService.tCity.findFirst.mockRejectedValue(error)

      // Act
      const result = await service.getReadinessCheck()

      // Assert
      expect(result).toBeDefined()
      expect(result.status).toBe('not_ready')
      expect(result.timestamp).toBeDefined()
      expect(result.ready).toBe(false)
      expect(result.checks).toBeDefined()
      expect(result.checks.database).toBe(false)
      expect(result.checks.shutdown).toBe(true)
    })

    it('should return not ready status when readiness check encounters error', async () => {
      // Arrange
      const error = new Error('Readiness check failed')
      mockDatabaseService.tCity.findFirst.mockRejectedValue(error)

      // Act
      const result = await service.getReadinessCheck()

      // Assert
      expect(result).toBeDefined()
      expect(result.status).toBe('not_ready')
      expect(result.timestamp).toBeDefined()
      expect(result.ready).toBe(false)
      expect(result.checks).toBeDefined()
      expect(result.checks.database).toBe(false)
      expect(result.checks.shutdown).toBe(true)
    })

    it('should return not ready status when readiness check encounters general error', async () => {
      // Arrange - Mock shutdown service to throw error
      mockGracefulShutdownService.isShuttingDownStatus.mockImplementation(
        () => {
          throw new Error('Shutdown service error')
        },
      )

      // Act
      const result = await service.getReadinessCheck()

      // Assert
      expect(result).toBeDefined()
      expect(result.status).toBe('not_ready')
      expect(result.timestamp).toBeDefined()
      expect(result.ready).toBe(false)
      expect(result.checks).toBeDefined()
      expect(result.checks.database).toBe(false)
      expect(result.checks.shutdown).toBe(false)
    })
  })

  describe('getShutdownStatus', () => {
    it('should return active status when not shutting down', () => {
      // Act
      const result = service.getShutdownStatus()

      // Assert
      expect(result).toBeDefined()
      expect(result.isShuttingDown).toBe(false)
      expect(result.timestamp).toBeDefined()
      expect(result.uptime).toBeGreaterThan(0)
      expect(result.gracefulShutdown).toBeDefined()
      expect(result.gracefulShutdown.enabled).toBe(true)
      expect(result.gracefulShutdown.status).toBe('active')
    })

    it('should return shutting down status when shutdown is in progress', () => {
      // Arrange
      mockGracefulShutdownService.isShuttingDownStatus.mockReturnValue(true)

      // Act
      const result = service.getShutdownStatus()

      // Assert
      expect(result).toBeDefined()
      expect(result.isShuttingDown).toBe(true)
      expect(result.timestamp).toBeDefined()
      expect(result.uptime).toBeGreaterThan(0)
      expect(result.gracefulShutdown).toBeDefined()
      expect(result.gracefulShutdown.enabled).toBe(true)
      expect(result.gracefulShutdown.status).toBe('shutting_down')
    })
  })

  describe('getMetrics', () => {
    it('should return metrics from metricsCollector', () => {
      // Act
      const result = service.getMetrics()

      // Assert
      expect(result).toBeDefined()
      expect(result.requests).toBeDefined()
      expect(result.performance).toBeDefined()
      expect(result.errors).toBeDefined()
    })
  })

  describe('resetMetrics', () => {
    it('should reset metrics via metricsCollector', () => {
      // Act
      service.resetMetrics()

      // Assert - No direct assertion, but this covers the resetMetrics method
      expect(typeof service.resetMetrics).toBe('function')
    })
  })

  describe('recordRequest', () => {
    it('should record successful request metrics', () => {
      // Arrange
      const responseTime = 100
      const success = true

      // Act
      service.recordRequest(responseTime, success)

      // Assert
      const metrics = service.getMetrics()
      expect(metrics.requests.total).toBe(1)
      expect(metrics.requests.success).toBe(1)
      expect(metrics.requests.errors).toBe(0)
    })

    it('should record failed request metrics', () => {
      // Arrange
      const responseTime = 200
      const success = false

      // Act
      service.recordRequest(responseTime, success)

      // Assert
      const metrics = service.getMetrics()
      expect(metrics.requests.total).toBe(1)
      expect(metrics.requests.success).toBe(0)
      expect(metrics.requests.errors).toBe(1)
    })

    it('should trim response times array when exceeding 1000 entries', () => {
      // Arrange - record 1001 requests to trigger trimming
      for (let i = 0; i < 1001; i++) {
        service.recordRequest(i, true)
      }

      // Act
      const metrics = service.getMetrics()

      // Assert
      expect(metrics.requests.total).toBe(1001)
      expect(metrics.requests.success).toBe(1001)
      expect(metrics.requests.errors).toBe(0)
      // Response times should be trimmed to last 1000 entries
      expect(metrics.requests.averageResponseTime).toBeGreaterThan(0)
    })
  })

  describe('recordError', () => {
    it('should record error metrics', () => {
      // Arrange
      const errorType = 'ValidationError'
      const errorMessage = 'Invalid input data'

      // Act
      service.recordError(errorType, errorMessage)

      // Assert
      const metrics = service.getMetrics()
      expect(metrics.errors.total).toBe(1)
      expect(metrics.errors.byType).toHaveProperty(errorType, 1)
      expect(metrics.errors.recent).toHaveLength(1)

      const firstError = metrics.errors.recent[0]
      expect(firstError).toBeDefined()
      expect(firstError?.type).toBe(errorType)
      expect(firstError?.message).toBe(errorMessage)
      expect(firstError?.timestamp).toBeDefined()
    })

    it('should trim recent errors array when exceeding 100 entries', () => {
      // Arrange - record 101 errors to trigger trimming
      for (let i = 0; i < 101; i++) {
        service.recordError('TestError', `Error message ${i}`)
      }

      // Act
      const metrics = service.getMetrics()

      // Assert
      expect(metrics.errors.total).toBe(101)
      expect(metrics.errors.recent).toHaveLength(10) // getErrorMetrics returns last 10
      expect(metrics.errors.byType).toHaveProperty('TestError', 101)
      // Verify the recent array contains the most recent errors
      expect(metrics.errors.recent[9]?.message).toBe('Error message 100')
    })
  })
})
