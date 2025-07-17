import { ArgumentsHost, HttpStatus, HttpException } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Request, Response } from 'express'
import { ZodError, z } from 'zod'

import { AllExceptionsFilter } from '../../../src/all-exceptions.filter'
import {
  PrismaClientValidationError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
} from '../../../src/lib/prisma'
import { HealthMonitoringService } from '../../../src/services/health-monitoring.service'

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter
  let mockResponse: Partial<Response>
  let mockRequest: Partial<Request>
  let mockArgumentsHost: ArgumentsHost
  let mockHealthMonitoringService: HealthMonitoringService

  beforeEach(() => {
    mockHealthMonitoringService = {
      recordError: jest.fn(),
    } as unknown as HealthMonitoringService

    filter = new AllExceptionsFilter(mockHealthMonitoringService)

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      headersSent: false,
      getHeader: jest.fn(),
      setHeader: jest.fn(),
      removeHeader: jest.fn(),
    }

    mockRequest = {
      url: '/test-endpoint',
    }

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    }

    // Mock the super.catch method to avoid BaseExceptionFilter complexity
    jest
      .spyOn(BaseExceptionFilter.prototype, 'catch')
      .mockImplementation(() => {})
  })

  it('should handle ZodError with structured validation details', () => {
    // Create a real ZodError using schema validation
    const schema = z.object({ name: z.string() })
    let zodError: ZodError

    try {
      schema.parse({ name: 123 })
    } catch (error) {
      zodError = error as ZodError
    }

    filter.catch(zodError!, mockArgumentsHost)

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: expect.any(String) as string,
      path: '/test-endpoint',
      response: 'Validation failed',
      error: {
        message: 'Input validation failed',
        details: [
          {
            field: 'name',
            message: 'Invalid input: expected string, received number',
            code: 'invalid_type',
          },
        ],
      },
    })
  })

  it('should handle HttpException with proper status and response', () => {
    const httpException = new HttpException('Not Found', HttpStatus.NOT_FOUND)

    filter.catch(httpException, mockArgumentsHost)

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND)
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      timestamp: expect.any(String) as string,
      path: '/test-endpoint',
      response: 'Not Found',
    })
  })

  it('should handle PrismaClientKnownRequestError with proper error code mapping', () => {
    // Create a mock PrismaClientKnownRequestError with P2002 (unique constraint violation)
    const prismaError = {
      code: 'P2002',
      message: 'Unique constraint failed on the constraint: `User_email_key`',
      meta: { constraint: 'User_email_key' },
    }

    // Set constructor.name to match the check in the filter
    Object.defineProperty(prismaError, 'constructor', {
      value: { name: 'PrismaClientKnownRequestError' },
      writable: false,
    })

    filter.catch(prismaError, mockArgumentsHost)

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT)
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      timestamp: expect.any(String) as string,
      path: '/test-endpoint',
      response: 'Unique constraint failed - this value already exists',
      error: 'P2002',
    })
  })

  it('should handle generic error with cleaned error message', () => {
    // Test generic error path that calls cleanErrorMessage
    const genericError = new Error(
      'Invalid field value\n\n  for  column   name.\n  Please check your input   data.',
    )

    filter.catch(genericError, mockArgumentsHost)

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    )
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String) as string,
      path: '/test-endpoint',
      response: 'Internal Server Error',
      error:
        'Invalid field value for column name. Please check your input data.',
    })
  })

  it('should test handlePrismaValidationError private method directly', () => {
    // Test private method directly to achieve coverage
    const mockPrismaValidationError = new Error(
      'Invalid input\n\n  data   provided.',
    )
    const errorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: '/test-endpoint',
      response: 'Internal Server Error',
      error: undefined as string | undefined,
    }

    // Access private method using type assertion
    ;(
      filter as unknown as {
        handlePrismaValidationError: (
          exception: Error,
          errorResponse: {
            statusCode: number
            timestamp: string
            path: string
            response: string
            error?: string | undefined
          },
        ) => void
      }
    ).handlePrismaValidationError(mockPrismaValidationError, errorResponse)

    expect(errorResponse.statusCode).toBe(HttpStatus.BAD_REQUEST)
    expect(errorResponse.response).toBe('Invalid data provided')
    expect(errorResponse.error).toBe('Invalid input data provided.')
  })

  it('should test handlePrismaUnknownRequestError private method directly', () => {
    // Test private method directly to achieve coverage
    const mockPrismaUnknownError = new Error('Database connection timeout')
    const errorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: '/test-endpoint',
      response: 'Internal Server Error',
      error: undefined as string | undefined,
    }

    // Access private method using type assertion
    ;(
      filter as unknown as {
        handlePrismaUnknownRequestError: (
          exception: Error,
          errorResponse: {
            statusCode: number
            timestamp: string
            path: string
            response: string
            error?: string | undefined
          },
        ) => void
      }
    ).handlePrismaUnknownRequestError(mockPrismaUnknownError, errorResponse)

    expect(errorResponse.statusCode).toBe(HttpStatus.BAD_REQUEST)
    expect(errorResponse.response).toBe('Database request failed')
    expect(errorResponse.error).toBe('Database connection timeout')
  })

  it('should test handlePrismaRustPanicError private method directly', () => {
    // Test private method directly to achieve coverage
    const mockPrismaRustPanicError = new Error(
      'Database engine crashed unexpectedly',
    )
    const errorResponse = {
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: new Date().toISOString(),
      path: '/test-endpoint',
      response: 'Bad Request',
      error: undefined as string | undefined,
    }

    // Access private method using type assertion
    ;(
      filter as unknown as {
        handlePrismaRustPanicError: (
          exception: Error,
          errorResponse: {
            statusCode: number
            timestamp: string
            path: string
            response: string
            error?: string | undefined
          },
        ) => void
      }
    ).handlePrismaRustPanicError(mockPrismaRustPanicError, errorResponse)

    expect(errorResponse.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    expect(errorResponse.response).toBe('Database engine error')
    expect(errorResponse.error).toBe('Database engine crashed unexpectedly')
  })

  it('should test handlePrismaInitializationError private method directly', () => {
    // Test private method directly to achieve coverage
    const mockPrismaInitializationError = new Error(
      'Database initialization failed',
    )
    const errorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: '/test-endpoint',
      response: 'Internal Server Error',
      error: undefined as string | undefined,
    }

    // Access private method using type assertion
    ;(
      filter as unknown as {
        handlePrismaInitializationError: (
          exception: Error,
          errorResponse: {
            statusCode: number
            timestamp: string
            path: string
            response: string
            error?: string | undefined
          },
        ) => void
      }
    ).handlePrismaInitializationError(
      mockPrismaInitializationError,
      errorResponse,
    )

    expect(errorResponse.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE)
    expect(errorResponse.response).toBe('Database connection failed')
    expect(errorResponse.error).toBe('Database initialization failed')
  })

  it('should test error mapping functions with unknown codes to cover fallback branches', () => {
    // Test mapPrismaErrorCodeToHttpStatus with unknown code
    const unknownStatusCode = (
      filter as unknown as {
        mapPrismaErrorCodeToHttpStatus: (code: string) => number
      }
    ).mapPrismaErrorCodeToHttpStatus('P9999')

    expect(unknownStatusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR)

    // Test mapPrismaErrorCodeToMessage with unknown code
    const unknownMessage = (
      filter as unknown as {
        mapPrismaErrorCodeToMessage: (code: string) => string
      }
    ).mapPrismaErrorCodeToMessage('P9999')

    expect(unknownMessage).toBe('An unknown database error occurred')
  })

  it('should test ternary operator branches in error handlers with non-Error exceptions', () => {
    // Test handlePrismaValidationError with non-Error exception
    const nonErrorException = { message: 'not an error instance' }
    const errorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: '/test-endpoint',
      response: 'Internal Server Error',
      error: undefined as string | undefined,
    }

    ;(
      filter as unknown as {
        handlePrismaValidationError: (
          exception: unknown,
          errorResponse: {
            statusCode: number
            timestamp: string
            path: string
            response: string
            error?: string | undefined
          },
        ) => void
      }
    ).handlePrismaValidationError(nonErrorException, errorResponse)

    expect(errorResponse.statusCode).toBe(HttpStatus.BAD_REQUEST)
    expect(errorResponse.response).toBe('Invalid data provided')
    expect(errorResponse.error).toBe('Validation error')
  })

  it('should handle PrismaClientValidationError through instanceof check', () => {
    // Create a real PrismaClientValidationError instance to trigger the instanceof check
    const prismaValidationError = new PrismaClientValidationError(
      'Invalid data provided for the query',
      { clientVersion: '5.0.0' },
    )

    filter.catch(prismaValidationError, mockArgumentsHost)

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: expect.any(String) as string,
      path: '/test-endpoint',
      response: 'Invalid data provided',
      error: 'Invalid data provided for the query',
    })
  })

  it('should handle PrismaClientUnknownRequestError through instanceof check', () => {
    // Create a real PrismaClientUnknownRequestError instance to trigger the instanceof check
    const prismaUnknownError = new PrismaClientUnknownRequestError(
      'Database connection timeout',
      { clientVersion: '5.0.0' },
    )

    filter.catch(prismaUnknownError, mockArgumentsHost)

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: expect.any(String) as string,
      path: '/test-endpoint',
      response: 'Database request failed',
      error: 'Database connection timeout',
    })
  })

  it('should handle PrismaClientRustPanicError through instanceof check', () => {
    // Create a real PrismaClientRustPanicError instance to trigger the instanceof check
    const prismaRustPanicError = new PrismaClientRustPanicError(
      'Database engine crashed unexpectedly',
      '5.0.0',
    )

    filter.catch(prismaRustPanicError, mockArgumentsHost)

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    )
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String) as string,
      path: '/test-endpoint',
      response: 'Database engine error',
      error: 'Database engine crashed unexpectedly',
    })
  })

  it('should handle exception with no constructor to trigger Unknown fallback', () => {
    // Test exception with no constructor to trigger exception?.constructor?.name || 'Unknown' fallback
    const exceptionWithoutConstructor = {
      constructor: undefined,
      message: 'test exception without constructor',
    }

    filter.catch(exceptionWithoutConstructor, mockArgumentsHost)

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    )
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String) as string,
      path: '/test-endpoint',
      response: 'Internal Server Error',
    })
  })

  it('should handle non-Error exception without message property in handleGenericError', () => {
    // Test non-Error exception without message to trigger else branch in instanceof Error check
    const nonErrorExceptionWithoutMessage = {
      name: 'CustomException',
      code: 'CUSTOM_ERROR',
    }

    filter.catch(nonErrorExceptionWithoutMessage, mockArgumentsHost)

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    )
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String) as string,
      path: '/test-endpoint',
      response: 'Internal Server Error',
    })
  })

  it('should handle Error with message longer than 100 characters to test substring branch', () => {
    // Test Error with long message to trigger substring(0, 100) branch in debug logging
    const longMessage =
      'This is a very long error message that is definitely longer than one hundred characters to test the substring functionality in the exception filter debug logging section where messages are truncated to 100 characters maximum length for logging purposes and this message should definitely exceed that limit by a significant margin'
    const longMessageError = new Error(longMessage)

    filter.catch(longMessageError, mockArgumentsHost)

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    )
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String) as string,
      path: '/test-endpoint',
      response: 'Internal Server Error',
      error: longMessage,
    })
  })

  it('should handle PrismaClientKnownRequestError without code property to test fallback branches', () => {
    // Test PrismaClientKnownRequestError without code to trigger || 'UNKNOWN' and || 'unknown' fallbacks
    const prismaErrorWithoutCode = {
      message: 'Database constraint violation without code',
      meta: { constraint: 'User_email_key' },
    }

    // Set constructor.name to match the check in the filter
    Object.defineProperty(prismaErrorWithoutCode, 'constructor', {
      value: { name: 'PrismaClientKnownRequestError' },
      writable: false,
    })

    filter.catch(prismaErrorWithoutCode, mockArgumentsHost)

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    )
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String) as string,
      path: '/test-endpoint',
      response: 'An unknown database error occurred',
      error: 'UNKNOWN',
    })
  })
})
