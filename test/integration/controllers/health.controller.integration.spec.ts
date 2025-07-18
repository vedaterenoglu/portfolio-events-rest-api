import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'

import { HealthController } from '../../../src/controllers/health.controller'
import {
  HealthMonitoringService,
  HealthStatus,
} from '../../../src/services/health-monitoring.service'

describe('HealthController (Integration)', () => {
  let app: INestApplication
  let healthMonitoringService: HealthMonitoringService

  beforeEach(async () => {
    const mockHealthMonitoringService = {
      getHealthCheck: jest.fn(),
      getReadinessCheck: jest.fn(),
      getMetrics: jest.fn(),
      getShutdownStatus: jest.fn(),
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

    app = module.createNestApplication()
    healthMonitoringService = module.get<HealthMonitoringService>(
      HealthMonitoringService,
    )
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('GET /health', () => {
    it('should return JSON response when Accept header contains application/json', async () => {
      // Arrange
      const mockHealthCheck = {
        status: HealthStatus.HEALTHY,
        timestamp: new Date().toISOString(),
        uptime: 123,
        environment: 'test',
        version: '1.0.0',
        checks: {
          database: { status: HealthStatus.HEALTHY, message: 'Connected' },
          memory: { status: HealthStatus.HEALTHY, message: 'Normal' },
          shutdown: { status: HealthStatus.HEALTHY, message: 'Active' },
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
            memoryUsage: { used: 0, total: 0, percentage: 0 },
            eventLoopLag: 0,
          },
          errors: { total: 0, rate: 0, byType: {}, recent: [] },
        },
      }

      jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockResolvedValue(mockHealthCheck)

      // Act & Assert
      await request(app.getHttpServer() as unknown as never)
        .get('/health')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(mockHealthCheck)
    })

    it('should return HTML response when Accept header does not contain application/json', async () => {
      // Arrange
      const mockHealthCheck = {
        status: HealthStatus.HEALTHY,
        timestamp: new Date().toISOString(),
        uptime: 123,
        environment: 'test',
        version: '1.0.0',
        checks: {
          database: { status: HealthStatus.HEALTHY, message: 'Connected' },
          memory: { status: HealthStatus.HEALTHY, message: 'Normal' },
          shutdown: { status: HealthStatus.HEALTHY, message: 'Active' },
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
            memoryUsage: { used: 0, total: 0, percentage: 0 },
            eventLoopLag: 0,
          },
          errors: { total: 0, rate: 0, byType: {}, recent: [] },
        },
      }

      jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockResolvedValue(mockHealthCheck)

      // Act & Assert
      const response = await request(app.getHttpServer() as unknown as never)
        .get('/health')
        .set('Accept', 'text/html')
        .expect(200)
        .expect('Content-Type', /html/)

      expect(response.text).toContain('Portfolio Events API')
      expect(response.text).toContain('healthy')
    })
  })

  describe('GET /health/json', () => {
    it('should return JSON health check data', async () => {
      // Arrange
      const mockHealthCheck = {
        status: HealthStatus.HEALTHY,
        timestamp: new Date().toISOString(),
        uptime: 123,
        environment: 'test',
        version: '1.0.0',
        checks: {
          database: { status: HealthStatus.HEALTHY, message: 'Connected' },
          memory: { status: HealthStatus.HEALTHY, message: 'Normal' },
          shutdown: { status: HealthStatus.HEALTHY, message: 'Active' },
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
            memoryUsage: { used: 0, total: 0, percentage: 0 },
            eventLoopLag: 0,
          },
          errors: { total: 0, rate: 0, byType: {}, recent: [] },
        },
      }

      jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockResolvedValue(mockHealthCheck)

      // Act & Assert
      await request(app.getHttpServer() as unknown as never)
        .get('/health/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(mockHealthCheck)
    })
  })

  describe('GET /ready', () => {
    it('should return readiness check data', async () => {
      // Arrange
      const mockReadinessCheck = {
        status: 'ready',
        timestamp: new Date().toISOString(),
        ready: true,
        checks: {
          database: true,
          shutdown: true,
        },
      }

      jest
        .spyOn(healthMonitoringService, 'getReadinessCheck')
        .mockResolvedValue(mockReadinessCheck)

      // Act & Assert
      await request(app.getHttpServer() as unknown as never)
        .get('/ready')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(mockReadinessCheck)
    })
  })

  describe('GET /metrics', () => {
    it('should return metrics data', async () => {
      // Arrange
      const mockMetrics = {
        requests: {
          total: 100,
          success: 95,
          errors: 5,
          rate: 10,
          averageResponseTime: 150,
        },
        performance: {
          cpuUsage: 0.25,
          memoryUsage: {
            used: 128,
            total: 512,
            percentage: 25,
          },
          eventLoopLag: 2,
        },
        errors: {
          total: 5,
          rate: 0.5,
          byType: {
            ValidationError: 3,
            DatabaseError: 2,
          },
          recent: [],
        },
      }

      jest
        .spyOn(healthMonitoringService, 'getMetrics')
        .mockReturnValue(mockMetrics)

      // Act & Assert
      await request(app.getHttpServer() as unknown as never)
        .get('/metrics')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(mockMetrics)
    })
  })

  describe('GET /shutdown', () => {
    it('should return shutdown status data', async () => {
      // Arrange
      const mockShutdownStatus = {
        isShuttingDown: false,
        timestamp: new Date().toISOString(),
        uptime: 123.45,
        gracefulShutdown: {
          enabled: true,
          status: 'active',
        },
      }

      jest
        .spyOn(healthMonitoringService, 'getShutdownStatus')
        .mockReturnValue(mockShutdownStatus)

      // Act & Assert
      await request(app.getHttpServer() as unknown as never)
        .get('/shutdown')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(mockShutdownStatus)
    })
  })

  describe('GET /health/json - Error Handling', () => {
    it('should handle error and throw exception', async () => {
      // Arrange
      jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockRejectedValue(new Error('Health check failed'))

      // Act & Assert
      await request(app.getHttpServer() as unknown as never)
        .get('/health/json')
        .expect(500)
    })
  })

  describe('GET /health - Error Handling and Coverage', () => {
    it('should handle JSON format when getHealthCheck throws error', async () => {
      // Arrange
      jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockRejectedValue(new Error('Service unavailable'))

      // Act & Assert
      const response = await request(app.getHttpServer() as unknown as never)
        .get('/health')
        .set('Accept', 'application/json')
        .expect(503)
        .expect('Content-Type', /json/)

      expect((response.body as { status: string }).status).toBe(
        HealthStatus.UNHEALTHY,
      )
      expect(
        (response.body as { checks: { database: { status: string } } }).checks
          .database.status,
      ).toBe(HealthStatus.UNHEALTHY)
      expect(
        (response.body as { checks: { memory: { status: string } } }).checks
          .memory.status,
      ).toBe(HealthStatus.UNHEALTHY)
      expect(
        (response.body as { checks: { shutdown: { status: string } } }).checks
          .shutdown.status,
      ).toBe(HealthStatus.UNHEALTHY)
    })

    it('should handle HTML format when getHealthCheck throws error', async () => {
      // Arrange
      jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockRejectedValue(new Error('Service unavailable'))

      // Act & Assert
      const response = await request(app.getHttpServer() as unknown as never)
        .get('/health')
        .set('Accept', 'text/html')
        .expect(503)
        .expect('Content-Type', /html/)

      expect(response.text).toContain('Portfolio Events API')
      expect(response.text).toContain('unhealthy') // CSS class for status indicator
    })

    it('should handle format=json query parameter for JSON response', async () => {
      // Arrange
      const mockHealthCheck = {
        status: HealthStatus.HEALTHY,
        timestamp: new Date().toISOString(),
        uptime: 123,
        environment: 'test',
        version: '1.0.0',
        checks: {
          database: { status: HealthStatus.HEALTHY, message: 'Connected' },
          memory: { status: HealthStatus.HEALTHY, message: 'Normal' },
          shutdown: { status: HealthStatus.HEALTHY, message: 'Active' },
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
            memoryUsage: { used: 0, total: 0, percentage: 0 },
            eventLoopLag: 0,
          },
          errors: { total: 0, rate: 0, byType: {}, recent: [] },
        },
      }

      jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockResolvedValue(mockHealthCheck)

      // Act & Assert
      await request(app.getHttpServer() as unknown as never)
        .get('/health?format=json')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(mockHealthCheck)
    })

    it('should return status 200 for DEGRADED health status', async () => {
      // Arrange
      const mockHealthCheck = {
        status: HealthStatus.DEGRADED,
        timestamp: new Date().toISOString(),
        uptime: 123,
        environment: 'test',
        version: '1.0.0',
        checks: {
          database: { status: HealthStatus.HEALTHY, message: 'Connected' },
          memory: { status: HealthStatus.DEGRADED, message: 'High usage' },
          shutdown: { status: HealthStatus.HEALTHY, message: 'Active' },
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
            memoryUsage: { used: 0, total: 0, percentage: 0 },
            eventLoopLag: 0,
          },
          errors: { total: 0, rate: 0, byType: {}, recent: [] },
        },
      }

      jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockResolvedValue(mockHealthCheck)

      // Act & Assert
      await request(app.getHttpServer() as unknown as never)
        .get('/health')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(mockHealthCheck)
    })

    it('should return status 503 for UNHEALTHY health status', async () => {
      // Arrange
      const mockHealthCheck = {
        status: HealthStatus.UNHEALTHY,
        timestamp: new Date().toISOString(),
        uptime: 123,
        environment: 'test',
        version: '1.0.0',
        checks: {
          database: {
            status: HealthStatus.UNHEALTHY,
            message: 'Connection failed',
          },
          memory: { status: HealthStatus.HEALTHY, message: 'Normal' },
          shutdown: { status: HealthStatus.HEALTHY, message: 'Active' },
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
            memoryUsage: { used: 0, total: 0, percentage: 0 },
            eventLoopLag: 0,
          },
          errors: { total: 0, rate: 0, byType: {}, recent: [] },
        },
      }

      jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockResolvedValue(mockHealthCheck)

      // Act & Assert
      await request(app.getHttpServer() as unknown as never)
        .get('/health')
        .set('Accept', 'application/json')
        .expect(503)
        .expect('Content-Type', /json/)
        .expect(mockHealthCheck)
    })
  })

  describe('GET /health - HTML Dashboard Coverage', () => {
    it('should generate HTML dashboard with DEGRADED status and comprehensive metrics', async () => {
      // Arrange
      const mockHealthCheck = {
        status: HealthStatus.DEGRADED,
        timestamp: new Date().toISOString(),
        uptime: 3661.5, // More than an hour for uptime display
        environment: 'production',
        version: '2.1.0',
        checks: {
          database: {
            status: HealthStatus.HEALTHY,
            message: 'Connected successfully',
            responseTime: 45,
            details: { provider: 'PostgreSQL' },
          },
          memory: {
            status: HealthStatus.DEGRADED,
            message: 'High memory usage detected',
            details: { percentage: 85.7, heapUsed: 150, heapTotal: 200 },
          },
          shutdown: {
            status: HealthStatus.HEALTHY,
            message: 'Active and responsive',
            details: { gracefulShutdown: true, shutdownInProgress: false },
          },
        },
        metrics: {
          requests: {
            total: 1500,
            success: 1450,
            errors: 50,
            rate: 25.5,
            averageResponseTime: 125,
          },
          performance: {
            cpuUsage: 0.456,
            memoryUsage: { used: 150, total: 200, percentage: 85.7 },
            eventLoopLag: 12,
          },
          errors: {
            total: 50,
            rate: 2.1,
            byType: { ValidationError: 30, DatabaseError: 15, TimeoutError: 5 },
            recent: [
              {
                type: 'ValidationError',
                message: 'Invalid input data',
                timestamp: new Date().toISOString(),
              },
              {
                type: 'DatabaseError',
                message: 'Connection timeout',
                timestamp: new Date().toISOString(),
              },
            ],
          },
        },
      }

      jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockResolvedValue(mockHealthCheck)

      // Act & Assert
      const response = await request(app.getHttpServer() as unknown as never)
        .get('/health')
        .set('Accept', 'text/html')
        .expect(200)
        .expect('Content-Type', /html/)

      // Verify HTML content contains all the data
      expect(response.text).toContain('Portfolio Events API')
      expect(response.text).toContain('degraded') // CSS class for status indicator
      expect(response.text).toContain('⚠️')
      expect(response.text).toContain('production')
      expect(response.text).toContain('2.1.0')
      expect(response.text).toContain('3662s') // Rounded uptime
      expect(response.text).toContain('PostgreSQL')
      expect(response.text).toContain('85.7%')
      expect(response.text).toContain('ValidationError')
      expect(response.text).toContain('Invalid input data')
      expect(response.text).toContain('1500') // Total requests
      expect(response.text).toContain('1450/1500') // Success rate
    })

    it('should generate HTML dashboard with UNHEALTHY status and missing optional data', async () => {
      // Arrange
      const mockHealthCheck = {
        status: HealthStatus.UNHEALTHY,
        timestamp: new Date().toISOString(),
        uptime: 30,
        environment: 'development',
        version: '1.0.0-beta',
        checks: {
          database: {
            status: HealthStatus.UNHEALTHY,
            message: 'Database connection failed',
            responseTime: 5000,
            // Missing details
          },
          memory: {
            status: HealthStatus.UNHEALTHY,
            message: 'Memory check failed',
            // Missing details
          },
          shutdown: {
            status: HealthStatus.UNHEALTHY,
            message: 'Shutdown check failed',
            // Missing details
          },
        },
        metrics: {
          requests: {
            total: 5,
            success: 2,
            errors: 3,
            rate: 0.1,
            averageResponseTime: 800,
          },
          performance: {
            cpuUsage: 0.012,
            memoryUsage: { used: 50, total: 100, percentage: 50 },
            eventLoopLag: 200,
          },
          errors: {
            total: 3,
            rate: 1.5,
            byType: {},
            recent: [], // Empty recent errors
          },
        },
      }

      jest
        .spyOn(healthMonitoringService, 'getHealthCheck')
        .mockResolvedValue(mockHealthCheck)

      // Act & Assert
      const response = await request(app.getHttpServer() as unknown as never)
        .get('/health')
        .set('Accept', 'text/html')
        .expect(503)
        .expect('Content-Type', /html/)

      // Verify HTML content handles missing data gracefully
      expect(response.text).toContain('unhealthy') // CSS class for status indicator
      expect(response.text).toContain('❌')
      expect(response.text).toContain('development')
      expect(response.text).toContain('1.0.0-beta')
      expect(response.text).toContain('undefined') // For missing provider in mock data
      expect(response.text).toContain(
        'No recent errors - System running smoothly!',
      ) // Empty errors
      expect(response.text).toContain('5000ms') // High response time
      expect(response.text).toContain('0.0%') // Memory percentage (percentage field is missing in details)
    })
  })
})
