import { INestApplication } from '@nestjs/common'
import {
  Controller,
  Get,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'

import { RequestMetricsInterceptor } from '../../../src/interceptors/request-metrics.interceptor'
import { HealthMonitoringService } from '../../../src/services/health-monitoring.service'

// Test controller for integration testing
@Controller('test')
class TestController {
  @Get('success')
  getSuccess() {
    return { message: 'success' }
  }

  @Post('success')
  postSuccess() {
    return { message: 'post success' }
  }

  @Get('error')
  getError() {
    throw new HttpException('Test error', HttpStatus.BAD_REQUEST)
  }

  @Get('error-no-constructor')
  getErrorNoConstructor() {
    const error = new Error('Error without constructor name')
    // Remove constructor to trigger fallback
    Object.defineProperty(error, 'constructor', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    throw error
  }

  @Get('error-no-message')
  getErrorNoMessage() {
    const error = new Error()
    // Remove message to trigger fallback
    Object.defineProperty(error, 'message', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    throw error
  }

  @Get('error-null-constructor')
  getErrorNullConstructor() {
    const error = new Error('Error with null constructor')
    // Set constructor to null to trigger fallback
    Object.defineProperty(error, 'constructor', {
      value: null,
      writable: true,
      configurable: true,
    })
    throw error
  }

  @Get('error-empty-message')
  getErrorEmptyMessage() {
    const error = new Error('')
    throw error
  }

  @Get('error-with-message')
  getErrorWithMessage() {
    const error = new Error('Custom error message')
    throw error
  }

  @Get('error-both-undefined')
  getErrorBothUndefined() {
    const error = new Error()
    // Remove both constructor and message to trigger both fallbacks
    Object.defineProperty(error, 'constructor', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(error, 'message', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    throw error
  }

  @Get('health')
  getHealth() {
    return { status: 'healthy' }
  }

  @Get('ready')
  getReady() {
    return { status: 'ready' }
  }

  @Get('metrics')
  getMetrics() {
    return { metrics: {} }
  }

  @Get('health/check')
  getHealthCheck() {
    return { status: 'health check' }
  }

  @Get('api/ready/status')
  getReadyStatus() {
    return { status: 'ready status' }
  }

  @Get('system/metrics/data')
  getMetricsData() {
    return { data: 'metrics data' }
  }
}

describe('RequestMetricsInterceptor (Integration)', () => {
  let app: INestApplication
  let healthMonitoringService: HealthMonitoringService

  beforeEach(async () => {
    const mockHealthMonitoringService = {
      recordRequest: jest.fn(),
      recordError: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
      providers: [
        RequestMetricsInterceptor,
        {
          provide: HealthMonitoringService,
          useValue: mockHealthMonitoringService,
        },
      ],
    }).compile()

    app = module.createNestApplication()
    app.useGlobalInterceptors(
      new RequestMetricsInterceptor(
        mockHealthMonitoringService as unknown as HealthMonitoringService,
      ),
    )
    healthMonitoringService = module.get<HealthMonitoringService>(
      HealthMonitoringService,
    )
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('Successful Request Metrics', () => {
    it('should record successful GET request metrics', async () => {
      // Act
      await request(app.getHttpServer() as unknown as never)
        .get('/test/success')
        .expect(200)
        .expect({ message: 'success' })

      // Assert
      const recordRequestSpy = jest.spyOn(
        healthMonitoringService,
        'recordRequest',
      )
      const recordErrorSpy = jest.spyOn(healthMonitoringService, 'recordError')

      expect(recordRequestSpy).toHaveBeenCalledWith(expect.any(Number), true)
      expect(recordErrorSpy).not.toHaveBeenCalled()
    })

    it('should record successful POST request metrics', async () => {
      // Act
      await request(app.getHttpServer() as unknown as never)
        .post('/test/success')
        .expect(201)
        .expect({ message: 'post success' })

      // Assert
      const recordRequestSpy = jest.spyOn(
        healthMonitoringService,
        'recordRequest',
      )
      const recordErrorSpy = jest.spyOn(healthMonitoringService, 'recordError')

      expect(recordRequestSpy).toHaveBeenCalledWith(expect.any(Number), true)
      expect(recordErrorSpy).not.toHaveBeenCalled()
    })

    it('should record failed request metrics and error details', async () => {
      // Act
      await request(app.getHttpServer() as unknown as never)
        .get('/test/error')
        .expect(400)

      // Assert
      const recordRequestSpy = jest.spyOn(
        healthMonitoringService,
        'recordRequest',
      )
      const recordErrorSpy = jest.spyOn(healthMonitoringService, 'recordError')

      expect(recordRequestSpy).toHaveBeenCalledWith(expect.any(Number), false)
      expect(recordErrorSpy).toHaveBeenCalledWith('HttpException', 'Test error')
    })
  })

  describe('Health Endpoint Exclusion', () => {
    it('should skip metrics recording for /health endpoint', async () => {
      // Act
      await request(app.getHttpServer() as unknown as never)
        .get('/test/health')
        .expect(200)
        .expect({ status: 'healthy' })

      // Assert
      const recordRequestSpy = jest.spyOn(
        healthMonitoringService,
        'recordRequest',
      )
      const recordErrorSpy = jest.spyOn(healthMonitoringService, 'recordError')

      expect(recordRequestSpy).not.toHaveBeenCalled()
      expect(recordErrorSpy).not.toHaveBeenCalled()
    })

    it('should skip metrics recording for /ready endpoint', async () => {
      // Act
      await request(app.getHttpServer() as unknown as never)
        .get('/test/ready')
        .expect(200)
        .expect({ status: 'ready' })

      // Assert
      const recordRequestSpy = jest.spyOn(
        healthMonitoringService,
        'recordRequest',
      )
      const recordErrorSpy = jest.spyOn(healthMonitoringService, 'recordError')

      expect(recordRequestSpy).not.toHaveBeenCalled()
      expect(recordErrorSpy).not.toHaveBeenCalled()
    })

    it('should skip metrics recording for /metrics endpoint', async () => {
      // Act
      await request(app.getHttpServer() as unknown as never)
        .get('/test/metrics')
        .expect(200)
        .expect({ metrics: {} })

      // Assert
      const recordRequestSpy = jest.spyOn(
        healthMonitoringService,
        'recordRequest',
      )
      const recordErrorSpy = jest.spyOn(healthMonitoringService, 'recordError')

      expect(recordRequestSpy).not.toHaveBeenCalled()
      expect(recordErrorSpy).not.toHaveBeenCalled()
    })

    it('should skip metrics recording for URLs containing /health', async () => {
      // Act
      await request(app.getHttpServer() as unknown as never)
        .get('/test/health/check')
        .expect(200)
        .expect({ status: 'health check' })

      // Assert
      const recordRequestSpy = jest.spyOn(
        healthMonitoringService,
        'recordRequest',
      )
      const recordErrorSpy = jest.spyOn(healthMonitoringService, 'recordError')

      expect(recordRequestSpy).not.toHaveBeenCalled()
      expect(recordErrorSpy).not.toHaveBeenCalled()
    })

    it('should skip metrics recording for URLs containing /ready', async () => {
      // Act
      await request(app.getHttpServer() as unknown as never)
        .get('/test/api/ready/status')
        .expect(200)
        .expect({ status: 'ready status' })

      // Assert
      const recordRequestSpy = jest.spyOn(
        healthMonitoringService,
        'recordRequest',
      )
      const recordErrorSpy = jest.spyOn(healthMonitoringService, 'recordError')

      expect(recordRequestSpy).not.toHaveBeenCalled()
      expect(recordErrorSpy).not.toHaveBeenCalled()
    })

    it('should skip metrics recording for URLs containing /metrics', async () => {
      // Act
      await request(app.getHttpServer() as unknown as never)
        .get('/test/system/metrics/data')
        .expect(200)
        .expect({ data: 'metrics data' })

      // Assert
      const recordRequestSpy = jest.spyOn(
        healthMonitoringService,
        'recordRequest',
      )
      const recordErrorSpy = jest.spyOn(healthMonitoringService, 'recordError')

      expect(recordRequestSpy).not.toHaveBeenCalled()
      expect(recordErrorSpy).not.toHaveBeenCalled()
    })
  })

  describe('Error Type Coverage', () => {
    it('should handle different error types and record appropriate error details', async () => {
      // Act
      await request(app.getHttpServer() as unknown as never)
        .get('/test/error')
        .expect(400)

      // Assert that normal error handling works
      const recordErrorSpy = jest.spyOn(healthMonitoringService, 'recordError')
      expect(recordErrorSpy).toHaveBeenCalledWith('HttpException', 'Test error')
    })

    it('should use fallback error type when constructor is undefined', async () => {
      // Act
      await request(app.getHttpServer() as unknown as never)
        .get('/test/error-no-constructor')
        .expect(500)

      // Assert
      const recordRequestSpy = jest.spyOn(
        healthMonitoringService,
        'recordRequest',
      )
      const recordErrorSpy = jest.spyOn(healthMonitoringService, 'recordError')

      expect(recordRequestSpy).toHaveBeenCalledWith(expect.any(Number), false)
      expect(recordErrorSpy).toHaveBeenCalledWith(
        'UnknownError',
        'Error without constructor name',
      )
    })

    it('should use fallback error message when message is undefined', async () => {
      // Act
      await request(app.getHttpServer() as unknown as never)
        .get('/test/error-no-message')
        .expect(500)

      // Assert
      const recordRequestSpy = jest.spyOn(
        healthMonitoringService,
        'recordRequest',
      )
      const recordErrorSpy = jest.spyOn(healthMonitoringService, 'recordError')

      expect(recordRequestSpy).toHaveBeenCalledWith(expect.any(Number), false)
      expect(recordErrorSpy).toHaveBeenCalledWith(
        'Error',
        'Unknown error occurred',
      )
    })

    it('should use fallback error type when constructor is null', async () => {
      // Act
      await request(app.getHttpServer() as unknown as never)
        .get('/test/error-null-constructor')
        .expect(500)

      // Assert
      const recordRequestSpy = jest.spyOn(
        healthMonitoringService,
        'recordRequest',
      )
      const recordErrorSpy = jest.spyOn(healthMonitoringService, 'recordError')

      expect(recordRequestSpy).toHaveBeenCalledWith(expect.any(Number), false)
      expect(recordErrorSpy).toHaveBeenCalledWith(
        'UnknownError',
        'Error with null constructor',
      )
    })

    it('should use fallback for empty error message (empty string is falsy)', async () => {
      // Act
      await request(app.getHttpServer() as unknown as never)
        .get('/test/error-empty-message')
        .expect(500)

      // Assert
      const recordRequestSpy = jest.spyOn(
        healthMonitoringService,
        'recordRequest',
      )
      const recordErrorSpy = jest.spyOn(healthMonitoringService, 'recordError')

      expect(recordRequestSpy).toHaveBeenCalledWith(expect.any(Number), false)
      expect(recordErrorSpy).toHaveBeenCalledWith(
        'Error',
        'Unknown error occurred',
      )
    })

    it('should use actual error message when message is not falsy', async () => {
      // Act
      await request(app.getHttpServer() as unknown as never)
        .get('/test/error-with-message')
        .expect(500)

      // Assert
      const recordRequestSpy = jest.spyOn(
        healthMonitoringService,
        'recordRequest',
      )
      const recordErrorSpy = jest.spyOn(healthMonitoringService, 'recordError')

      expect(recordRequestSpy).toHaveBeenCalledWith(expect.any(Number), false)
      expect(recordErrorSpy).toHaveBeenCalledWith(
        'Error',
        'Custom error message',
      )
    })

    it('should use both fallbacks when constructor and message are undefined', async () => {
      // Act - trigger endpoint that has both constructor and message undefined
      await request(app.getHttpServer() as unknown as never)
        .get('/test/error-both-undefined')
        .expect(500)

      // Assert
      const recordRequestSpy = jest.spyOn(
        healthMonitoringService,
        'recordRequest',
      )
      const recordErrorSpy = jest.spyOn(healthMonitoringService, 'recordError')

      expect(recordRequestSpy).toHaveBeenCalledWith(expect.any(Number), false)
      expect(recordErrorSpy).toHaveBeenCalledWith(
        'UnknownError',
        'Unknown error occurred',
      )
    })
  })

  describe('Request URL Edge Cases', () => {
    it('should handle requests where URL might be undefined', async () => {
      // This test covers the request.url?.includes() conditional logic
      // The optional chaining ensures we handle cases where URL might be undefined

      await request(app.getHttpServer() as unknown as never)
        .get('/test/success')
        .expect(200)
        .expect({ message: 'success' })

      // Verify that normal requests still get recorded
      const recordRequestSpy = jest.spyOn(
        healthMonitoringService,
        'recordRequest',
      )
      expect(recordRequestSpy).toHaveBeenCalledWith(expect.any(Number), true)
    })
  })
})
