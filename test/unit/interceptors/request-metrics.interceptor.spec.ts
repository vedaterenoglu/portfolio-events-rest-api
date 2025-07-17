import { ExecutionContext, CallHandler } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { of, throwError } from 'rxjs'

import { RequestMetricsInterceptor } from '../../../src/interceptors/request-metrics.interceptor'
import { HealthMonitoringService } from '../../../src/services/health-monitoring.service'

describe('RequestMetricsInterceptor', () => {
  let interceptor: RequestMetricsInterceptor
  let mockHealthMonitoringService: {
    recordRequest: jest.Mock
    recordError: jest.Mock
  }
  let mockExecutionContext: ExecutionContext
  let mockCallHandler: CallHandler

  beforeEach(async () => {
    mockHealthMonitoringService = {
      recordRequest: jest.fn(),
      recordError: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestMetricsInterceptor,
        {
          provide: HealthMonitoringService,
          useValue: mockHealthMonitoringService,
        },
      ],
    }).compile()

    interceptor = module.get<RequestMetricsInterceptor>(
      RequestMetricsInterceptor,
    )

    // Mock ExecutionContext
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          url: '/api/events',
        }),
      }),
    } as unknown as ExecutionContext

    // Mock CallHandler
    mockCallHandler = {
      handle: jest.fn(),
    } as unknown as CallHandler
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('intercept', () => {
    it('should record successful request metrics', done => {
      // Arrange
      const responseData = { success: true }
      mockCallHandler.handle = jest.fn().mockReturnValue(of(responseData))

      // Act
      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      )

      // Assert
      result.subscribe({
        next: data => {
          expect(data).toEqual(responseData)
          expect(
            mockHealthMonitoringService.recordRequest,
          ).toHaveBeenCalledWith(expect.any(Number), true)
          expect(mockHealthMonitoringService.recordError).not.toHaveBeenCalled()
          done()
        },
      })
    })

    it('should record failed request metrics and error details', done => {
      // Arrange
      const error = new Error('Test error')
      mockCallHandler.handle = jest
        .fn()
        .mockReturnValue(throwError(() => error))

      // Act
      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      )

      // Assert
      result.subscribe({
        error: err => {
          expect(err).toBe(error)
          expect(
            mockHealthMonitoringService.recordRequest,
          ).toHaveBeenCalledWith(expect.any(Number), false)
          expect(mockHealthMonitoringService.recordError).toHaveBeenCalledWith(
            'Error',
            'Test error',
          )
          done()
        },
      })
    })

    it('should skip health endpoints and not record metrics', done => {
      // Arrange
      const responseData = { status: 'healthy' }
      mockCallHandler.handle = jest.fn().mockReturnValue(of(responseData))

      // Mock request URL to be a health endpoint
      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          url: '/health',
        }),
      })

      // Act
      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      )

      // Assert
      result.subscribe({
        next: data => {
          expect(data).toEqual(responseData)
          expect(
            mockHealthMonitoringService.recordRequest,
          ).not.toHaveBeenCalled()
          expect(mockHealthMonitoringService.recordError).not.toHaveBeenCalled()
          done()
        },
      })
    })

    it('should handle error without constructor name or message', done => {
      // Arrange
      const error = { unknownProperty: 'test' } // Object without constructor.name or message
      mockCallHandler.handle = jest
        .fn()
        .mockReturnValue(throwError(() => error))

      // Act
      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      )

      // Assert
      result.subscribe({
        error: err => {
          expect(err).toBe(error)
          expect(
            mockHealthMonitoringService.recordRequest,
          ).toHaveBeenCalledWith(expect.any(Number), false)
          expect(mockHealthMonitoringService.recordError).toHaveBeenCalledWith(
            'Object',
            'Unknown error occurred',
          )
          done()
        },
      })
    })

    it('should handle error without constructor name', done => {
      // Arrange - Create error object without constructor.name
      const error = Object.create(null) as { message: string }
      error.message = 'Test error message'
      mockCallHandler.handle = jest
        .fn()
        .mockReturnValue(throwError(() => error))

      // Act
      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      )

      // Assert
      result.subscribe({
        error: err => {
          expect(err).toBe(error)
          expect(
            mockHealthMonitoringService.recordRequest,
          ).toHaveBeenCalledWith(expect.any(Number), false)
          expect(mockHealthMonitoringService.recordError).toHaveBeenCalledWith(
            'UnknownError',
            'Test error message',
          )
          done()
        },
      })
    })
  })
})
