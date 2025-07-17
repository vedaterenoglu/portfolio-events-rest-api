import {
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { of, throwError, TimeoutError } from 'rxjs'

import { RequestTimeoutInterceptor } from '../../../src/interceptors/request-timeout.interceptor'

describe('RequestTimeoutInterceptor', () => {
  let interceptor: RequestTimeoutInterceptor
  let mockExecutionContext: ExecutionContext
  let mockCallHandler: CallHandler
  let mockRequest: { url?: string }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestTimeoutInterceptor],
    }).compile()

    interceptor = module.get<RequestTimeoutInterceptor>(
      RequestTimeoutInterceptor,
    )

    mockRequest = { url: '/test' }
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of('test-response')),
    }
  })

  describe('intercept', () => {
    it('should handle successful request with default timeout', done => {
      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      )

      result.subscribe({
        next: response => {
          expect(response).toBe('test-response')
          done()
        },
        error: done,
      })
    })

    it('should convert TimeoutError to RequestTimeoutException', done => {
      jest
        .spyOn(mockCallHandler, 'handle')
        .mockReturnValue(throwError(() => new TimeoutError()))

      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      )

      result.subscribe({
        next: () => {
          done(new Error('Expected error to be thrown'))
        },
        error: error => {
          expect(error).toBeInstanceOf(RequestTimeoutException)
          expect((error as RequestTimeoutException).message).toBe(
            'Request timeout after 30000ms',
          )
          done()
        },
      })
    })

    it('should propagate non-timeout errors unchanged', done => {
      const originalError = new Error('Database connection failed')
      jest
        .spyOn(mockCallHandler, 'handle')
        .mockReturnValue(throwError(() => originalError))

      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      )

      result.subscribe({
        next: () => {
          done(new Error('Expected error to be thrown'))
        },
        error: error => {
          expect(error).toBe(originalError)
          expect((error as Error).message).toBe('Database connection failed')
          done()
        },
      })
    })

    it('should use specific timeout for health endpoint', done => {
      mockRequest.url = '/health'

      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      )

      result.subscribe({
        next: response => {
          expect(response).toBe('test-response')
          done()
        },
        error: done,
      })
    })

    it('should use pattern-based timeout for API endpoints', done => {
      mockRequest.url = '/api/events/123'

      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      )

      result.subscribe({
        next: response => {
          expect(response).toBe('test-response')
          done()
        },
        error: done,
      })
    })

    it('should handle undefined URL with default timeout', done => {
      delete mockRequest.url

      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      )

      result.subscribe({
        next: response => {
          expect(response).toBe('test-response')
          done()
        },
        error: done,
      })
    })
  })
})
