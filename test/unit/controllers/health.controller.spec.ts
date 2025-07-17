import { Test, TestingModule } from '@nestjs/testing'
import { Request, Response } from 'express'

import { HealthController } from '../../../src/controllers/health.controller'
import {
  HealthMonitoringService,
  HealthCheckResult,
  HealthStatus,
} from '../../../src/services/health-monitoring.service'

describe('HealthController', () => {
  let controller: HealthController
  let healthMonitoringService: jest.Mocked<HealthMonitoringService>
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>

  const mockHealthCheckResult: HealthCheckResult = {
    status: HealthStatus.HEALTHY,
    timestamp: '2023-01-01T00:00:00.000Z',
    uptime: 100,
    environment: 'test',
    version: '1.0.0',
    checks: {
      database: {
        status: HealthStatus.HEALTHY,
        message: 'Database connection successful',
        responseTime: 50,
        details: { provider: 'postgresql' },
      },
      memory: {
        status: HealthStatus.HEALTHY,
        message: 'Memory usage normal',
        details: { percentage: 45, heapUsed: 100, heapTotal: 200 },
      },
      shutdown: {
        status: HealthStatus.HEALTHY,
        message: 'Application ready',
      },
    },
    metrics: {
      requests: {
        total: 100,
        success: 95,
        errors: 5,
        rate: 10,
        averageResponseTime: 150,
      },
      performance: {
        cpuUsage: 0.5,
        memoryUsage: {
          used: 100,
          total: 200,
          percentage: 50,
        },
        eventLoopLag: 1,
      },
      errors: {
        total: 5,
        rate: 0.5,
        byType: { ValidationError: 2, DatabaseError: 3 },
        recent: [
          {
            timestamp: '2023-01-01T00:00:00.000Z',
            type: 'ValidationError',
            message: 'Invalid input',
          },
        ],
      },
    },
  }

  beforeEach(async () => {
    const mockHealthMonitoringService = {
      getHealthCheck: jest.fn(),
      getReadinessCheck: jest.fn(),
      getMetrics: jest.fn(),
      getShutdownStatus: jest.fn(),
      recordRequest: jest.fn(),
      recordError: jest.fn(),
      resetMetrics: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthMonitoringService,
          useValue: mockHealthMonitoringService,
        },
      ],
    }).compile()

    controller = module.get<HealthController>(HealthController)
    healthMonitoringService = module.get(HealthMonitoringService)

    mockRequest = {
      headers: {},
      query: {},
    }

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    }
  })

  describe('getHealthCheck', () => {
    it('should return JSON health check when Accept header includes application/json', async () => {
      // Arrange
      mockRequest.headers = { accept: 'application/json' }
      const getHealthCheckSpy = jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockResolvedValue(mockHealthCheckResult)

      // Act
      await controller.getHealthCheck(
        mockRequest as Request,
        mockResponse as Response,
      )

      // Assert
      expect(getHealthCheckSpy).toHaveBeenCalledTimes(1)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(mockHealthCheckResult)
      expect(mockResponse.send).not.toHaveBeenCalled()
    })

    it('should return JSON health check when query parameter format=json', async () => {
      // Arrange
      mockRequest.headers = {}
      mockRequest.query = { format: 'json' }
      const getHealthCheckSpy = jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockResolvedValue(mockHealthCheckResult)

      // Act
      await controller.getHealthCheck(
        mockRequest as Request,
        mockResponse as Response,
      )

      // Assert
      expect(getHealthCheckSpy).toHaveBeenCalledTimes(1)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(mockHealthCheckResult)
      expect(mockResponse.send).not.toHaveBeenCalled()
    })

    it('should return HTML dashboard when no JSON format requested', async () => {
      // Arrange
      mockRequest.headers = {}
      mockRequest.query = {}
      const getHealthCheckSpy = jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockResolvedValue(mockHealthCheckResult)

      // Act
      await controller.getHealthCheck(
        mockRequest as Request,
        mockResponse as Response,
      )

      // Assert
      expect(getHealthCheckSpy).toHaveBeenCalledTimes(1)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).not.toHaveBeenCalled()
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.stringContaining('<!DOCTYPE html>'),
      )
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.stringContaining('Portfolio Events API'),
      )
    })

    it('should handle error and return JSON error response', async () => {
      // Arrange
      mockRequest.headers = { accept: 'application/json' }
      const error = new Error('Health check failed')
      const getHealthCheckSpy = jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockRejectedValue(error)

      // Act
      await controller.getHealthCheck(
        mockRequest as Request,
        mockResponse as Response,
      )

      // Assert
      expect(getHealthCheckSpy).toHaveBeenCalledTimes(1)
      expect(mockResponse.status).toHaveBeenCalledWith(503)
      expect(mockResponse.json).toHaveBeenCalledTimes(1)
      expect(mockResponse.send).not.toHaveBeenCalled()

      // Verify basic error response structure
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HealthStatus.UNHEALTHY,
        }),
      )
    })

    it('should handle error and return HTML error response', async () => {
      // Arrange
      mockRequest.headers = {}
      mockRequest.query = {}
      const error = new Error('Health check failed')
      const getHealthCheckSpy = jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockRejectedValue(error)

      // Act
      await controller.getHealthCheck(
        mockRequest as Request,
        mockResponse as Response,
      )

      // Assert
      expect(getHealthCheckSpy).toHaveBeenCalledTimes(1)
      expect(mockResponse.status).toHaveBeenCalledWith(503)
      expect(mockResponse.json).not.toHaveBeenCalled()
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.stringContaining('<!DOCTYPE html>'),
      )
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.stringContaining('Portfolio Events API'),
      )
    })

    it('should return JSON health check with DEGRADED status and status code 200', async () => {
      // Arrange
      mockRequest.headers = { accept: 'application/json' }
      const degradedHealthResult = {
        ...mockHealthCheckResult,
        status: HealthStatus.DEGRADED,
      }
      const getHealthCheckSpy = jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockResolvedValue(degradedHealthResult)

      // Act
      await controller.getHealthCheck(
        mockRequest as Request,
        mockResponse as Response,
      )

      // Assert
      expect(getHealthCheckSpy).toHaveBeenCalledTimes(1)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(degradedHealthResult)
      expect(mockResponse.send).not.toHaveBeenCalled()
    })

    it('should return JSON health check with UNHEALTHY status and status code 503', async () => {
      // Arrange
      mockRequest.headers = { accept: 'application/json' }
      const unhealthyHealthResult = {
        ...mockHealthCheckResult,
        status: HealthStatus.UNHEALTHY,
      }
      const getHealthCheckSpy = jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockResolvedValue(unhealthyHealthResult)

      // Act
      await controller.getHealthCheck(
        mockRequest as Request,
        mockResponse as Response,
      )

      // Assert
      expect(getHealthCheckSpy).toHaveBeenCalledTimes(1)
      expect(mockResponse.status).toHaveBeenCalledWith(503)
      expect(mockResponse.json).toHaveBeenCalledWith(unhealthyHealthResult)
      expect(mockResponse.send).not.toHaveBeenCalled()
    })

    it('should return HTML dashboard with missing optional properties', async () => {
      // Arrange
      mockRequest.headers = {}
      mockRequest.query = {}
      const healthResultWithMissingProperties = {
        status: HealthStatus.UNHEALTHY,
        timestamp: '2023-01-01T00:00:00.000Z',
        uptime: 100,
        environment: 'test',
        version: '1.0.0',
        checks: {
          database: {
            status: HealthStatus.UNHEALTHY,
            message: 'Database connection failed',
            // responseTime and details omitted to test || fallback paths
          },
          memory: {
            status: HealthStatus.UNHEALTHY,
            message: 'Memory usage critical',
            // details omitted to test || fallback paths
          },
          shutdown: {
            status: HealthStatus.UNHEALTHY,
            message: 'Shutdown check failed',
          },
        },
        metrics: {
          requests: {
            total: 0,
            success: 0,
            errors: 0,
            rate: 0,
            averageResponseTime: 0,
          },
          performance: {
            cpuUsage: 0,
            memoryUsage: {
              used: 0,
              total: 0,
              percentage: 0,
            },
            eventLoopLag: 0,
          },
          errors: {
            total: 0,
            rate: 0,
            byType: {},
            recent: [],
          },
        },
      }
      const getHealthCheckSpy = jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockResolvedValue(healthResultWithMissingProperties)

      // Act
      await controller.getHealthCheck(
        mockRequest as Request,
        mockResponse as Response,
      )

      // Assert
      expect(getHealthCheckSpy).toHaveBeenCalledTimes(1)
      expect(mockResponse.status).toHaveBeenCalledWith(503)
      expect(mockResponse.json).not.toHaveBeenCalled()
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.stringContaining('<!DOCTYPE html>'),
      )
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.stringContaining('Portfolio Events API'),
      )
    })

    it('should return HTML dashboard with high memory usage and slow database response', async () => {
      // Arrange
      mockRequest.headers = {}
      mockRequest.query = {}
      const highUsageHealthResult = {
        status: HealthStatus.DEGRADED,
        timestamp: '2023-01-01T00:00:00.000Z',
        uptime: 100,
        environment: 'test',
        version: '1.0.0',
        checks: {
          database: {
            status: HealthStatus.DEGRADED,
            message: 'Database slow response',
            responseTime: 750, // > 500ms for red color branch
            details: { provider: 'postgresql' },
          },
          memory: {
            status: HealthStatus.DEGRADED,
            message: 'Memory usage elevated',
            details: {
              percentage: 85, // Between 70-90% for yellow color branch
              heapUsed: 85,
              heapTotal: 100,
            },
          },
          shutdown: {
            status: HealthStatus.HEALTHY,
            message: 'Application ready',
          },
        },
        metrics: mockHealthCheckResult.metrics,
      }
      const getHealthCheckSpy = jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockResolvedValue(highUsageHealthResult)

      // Act
      await controller.getHealthCheck(
        mockRequest as Request,
        mockResponse as Response,
      )

      // Assert
      expect(getHealthCheckSpy).toHaveBeenCalledTimes(1)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).not.toHaveBeenCalled()
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.stringContaining('<!DOCTYPE html>'),
      )
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.stringContaining('Portfolio Events API'),
      )
    })

    it('should handle error with undefined environment variables', async () => {
      // Arrange
      const originalNodeEnv = process.env.NODE_ENV
      const originalPackageVersion = process.env.npm_package_version

      delete process.env.NODE_ENV
      delete process.env.npm_package_version

      mockRequest = {
        headers: { accept: 'application/json' },
        query: {},
      }
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      }

      const error = new Error('Service unavailable')
      const getHealthCheckSpy = jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockRejectedValue(error)

      // Act
      await controller.getHealthCheck(
        mockRequest as Request,
        mockResponse as Response,
      )

      // Assert
      expect(getHealthCheckSpy).toHaveBeenCalledTimes(1)
      expect(mockResponse.status).toHaveBeenCalledWith(503)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          environment: 'unknown',
          version: '1.0.0',
        }),
      )

      // Restore environment variables
      if (originalNodeEnv) process.env.NODE_ENV = originalNodeEnv
      if (originalPackageVersion)
        process.env.npm_package_version = originalPackageVersion
    })
  })

  describe('getHealthCheckJson', () => {
    it('should return JSON health check via getHealthCheckJson method', async () => {
      // Arrange
      const getHealthCheckSpy = jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockResolvedValue(mockHealthCheckResult)

      // Act
      const result = await controller.getHealthCheckJson()

      // Assert
      expect(getHealthCheckSpy).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockHealthCheckResult)
    })

    it('should throw error when health check service fails', async () => {
      // Arrange
      const error = new Error('Service unavailable')
      const getHealthCheckSpy = jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockRejectedValue(error)

      // Act & Assert
      await expect(controller.getHealthCheckJson()).rejects.toThrow(
        'Health check failed',
      )
      expect(getHealthCheckSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('getReadinessCheck', () => {
    it('should return readiness check via getReadinessCheck method', async () => {
      // Arrange
      const mockReadinessResult = {
        status: 'ready',
        timestamp: '2023-01-01T00:00:00.000Z',
        ready: true,
        checks: {
          database: true,
          shutdown: true,
        },
      }
      const getReadinessCheckSpy = jest
        .spyOn(healthMonitoringService, 'getReadinessCheck')
        .mockResolvedValue(mockReadinessResult)

      // Act
      const result = await controller.getReadinessCheck()

      // Assert
      expect(getReadinessCheckSpy).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockReadinessResult)
    })
  })

  describe('getMetrics', () => {
    it('should return metrics via getMetrics method', () => {
      // Arrange
      const mockMetricsResult = {
        requests: mockHealthCheckResult.metrics.requests,
        performance: mockHealthCheckResult.metrics.performance,
        errors: mockHealthCheckResult.metrics.errors,
      }
      const getMetricsSpy = jest
        .spyOn(healthMonitoringService, 'getMetrics')
        .mockReturnValue(mockMetricsResult)

      // Act
      const result = controller.getMetrics()

      // Assert
      expect(getMetricsSpy).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockMetricsResult)
    })
  })

  describe('getShutdownStatus', () => {
    it('should return shutdown status via getShutdownStatus method', () => {
      // Arrange
      const mockShutdownResult = {
        isShuttingDown: false,
        timestamp: '2023-01-01T00:00:00.000Z',
        uptime: 100,
        gracefulShutdown: {
          enabled: true,
          status: 'active',
        },
      }
      const getShutdownStatusSpy = jest
        .spyOn(healthMonitoringService, 'getShutdownStatus')
        .mockReturnValue(mockShutdownResult)

      // Act
      const result = controller.getShutdownStatus()

      // Assert
      expect(getShutdownStatusSpy).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockShutdownResult)
    })
  })
})
