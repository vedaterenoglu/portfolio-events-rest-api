import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import {
  PrismaClientValidationError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
} from '@prisma/client/runtime/library'

import { AllExceptionsFilter } from '../../src/all-exceptions.filter'
import { LoggerService } from '../../src/services/logger/logger.service'

interface ErrorResponse {
  statusCode: number
  timestamp: string
  path: string
  response: string | object
  error?: string
}

interface PrismaKnownRequestError {
  code: string
  message: string
  meta?: Record<string, unknown>
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter
  let mockLoggerService: LoggerService

  beforeEach(async () => {
    mockLoggerService = {
      log: jest.fn(),
      error: jest.fn(),
    } as unknown as LoggerService

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllExceptionsFilter,
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile()

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter)
  })

  describe('handleHttpException', () => {
    it('should extract status and response from HttpException correctly', () => {
      const httpException = new HttpException(
        'Custom validation error',
        HttpStatus.BAD_REQUEST,
      )

      const errorResponse: ErrorResponse = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
        path: '/test-endpoint',
        response: 'Internal Server Error',
      }

      // Access private method for direct testing
      const filterWithPrivateMethods = filter as unknown as {
        handleHttpException: (
          exception: HttpException,
          errorResponse: ErrorResponse,
        ) => void
      }

      filterWithPrivateMethods.handleHttpException(httpException, errorResponse)

      expect(errorResponse.statusCode).toBe(HttpStatus.BAD_REQUEST)
      expect(errorResponse.response).toBe('Custom validation error')
    })
  })

  describe('cleanErrorMessage', () => {
    it('should clean error messages by removing newlines and extra spaces', () => {
      const dirtyMessage = '  Error with\n\nmultiple   spaces  and\nnewlines  '

      // Access private method for testing
      const filterWithPrivateMethods = filter as unknown as {
        cleanErrorMessage: (message: string) => string
      }

      const result = filterWithPrivateMethods.cleanErrorMessage(dirtyMessage)

      expect(result).toBe('Error with multiple spaces and newlines')
    })
  })

  describe('mapPrismaErrorCodeToHttpStatus', () => {
    it('should map Prisma error codes to correct HTTP status codes', () => {
      // Access private method for testing
      const filterWithPrivateMethods = filter as unknown as {
        mapPrismaErrorCodeToHttpStatus: (code: string) => number
      }

      expect(
        filterWithPrivateMethods.mapPrismaErrorCodeToHttpStatus('P2000'),
      ).toBe(HttpStatus.BAD_REQUEST)
      expect(
        filterWithPrivateMethods.mapPrismaErrorCodeToHttpStatus('P2001'),
      ).toBe(HttpStatus.NOT_FOUND)
      expect(
        filterWithPrivateMethods.mapPrismaErrorCodeToHttpStatus('P2002'),
      ).toBe(HttpStatus.CONFLICT)
      expect(
        filterWithPrivateMethods.mapPrismaErrorCodeToHttpStatus('UNKNOWN'),
      ).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('mapPrismaErrorCodeToMessage', () => {
    it('should map Prisma error codes to correct error messages', () => {
      // Access private method for testing
      const filterWithPrivateMethods = filter as unknown as {
        mapPrismaErrorCodeToMessage: (code: string) => string
      }

      expect(
        filterWithPrivateMethods.mapPrismaErrorCodeToMessage('P2000'),
      ).toBe('The provided value is too long for the field')
      expect(
        filterWithPrivateMethods.mapPrismaErrorCodeToMessage('P2001'),
      ).toBe('The record searched for does not exist')
      expect(
        filterWithPrivateMethods.mapPrismaErrorCodeToMessage('P2002'),
      ).toBe('Unique constraint failed - this value already exists')
      expect(
        filterWithPrivateMethods.mapPrismaErrorCodeToMessage('UNKNOWN'),
      ).toBe('An unknown database error occurred')
    })
  })

  describe('handleGenericError', () => {
    it('should handle Error instances and non-Error exceptions correctly', () => {
      // Access private method for testing
      const filterWithPrivateMethods = filter as unknown as {
        handleGenericError: (
          exception: unknown,
          errorResponse: ErrorResponse,
        ) => void
      }

      const errorResponse: ErrorResponse = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
        path: '/test-endpoint',
        response: 'Internal Server Error',
      }

      // Test Error instance
      const errorInstance = new Error('Generic error message')
      filterWithPrivateMethods.handleGenericError(errorInstance, errorResponse)

      expect(errorResponse.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(errorResponse.response).toBe('Internal Server Error')
      expect(errorResponse.error).toBe('Generic error message')

      // Reset for second test
      delete errorResponse.error

      // Test non-Error exception
      const nonErrorException = { someProperty: 'value' }
      filterWithPrivateMethods.handleGenericError(
        nonErrorException,
        errorResponse,
      )

      expect(errorResponse.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(errorResponse.response).toBe('Internal Server Error')
      expect(errorResponse.error).toBeUndefined()
    })
  })

  describe('handlePrismaKnownRequestError', () => {
    it('should handle PrismaKnownRequestError with specific error codes', () => {
      // Access private method for testing
      const filterWithPrivateMethods = filter as unknown as {
        handlePrismaKnownRequestError: (
          exception: PrismaKnownRequestError,
          errorResponse: ErrorResponse,
        ) => void
      }

      const errorResponse: ErrorResponse = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
        path: '/test-endpoint',
        response: 'Internal Server Error',
      }

      const prismaError: PrismaKnownRequestError = {
        code: 'P2002',
        message: 'Unique constraint failed',
        meta: { target: ['email'] },
      }

      filterWithPrivateMethods.handlePrismaKnownRequestError(
        prismaError,
        errorResponse,
      )

      expect(errorResponse.statusCode).toBe(HttpStatus.CONFLICT)
      expect(errorResponse.response).toBe(
        'Unique constraint failed - this value already exists',
      )
      expect(errorResponse.error).toBe('P2002')
    })
  })

  describe('handlePrismaValidationError', () => {
    it('should handle PrismaClientValidationError correctly', () => {
      // Access private method for testing
      const filterWithPrivateMethods = filter as unknown as {
        handlePrismaValidationError: (
          exception: { message: string },
          errorResponse: ErrorResponse,
        ) => void
      }

      const errorResponse: ErrorResponse = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
        path: '/test-endpoint',
        response: 'Internal Server Error',
      }

      const prismaValidationError = {
        message:
          'Invalid query:\n\n  Extra   spaces   and\nnewlines  in message  ',
      }

      filterWithPrivateMethods.handlePrismaValidationError(
        prismaValidationError,
        errorResponse,
      )

      expect(errorResponse.statusCode).toBe(HttpStatus.BAD_REQUEST)
      expect(errorResponse.response).toBe('Invalid data provided')
      expect(errorResponse.error).toBe(
        'Invalid query: Extra spaces and newlines in message',
      )
    })
  })

  describe('handlePrismaUnknownRequestError', () => {
    it('should handle PrismaClientUnknownRequestError correctly', () => {
      // Access private method for testing
      const filterWithPrivateMethods = filter as unknown as {
        handlePrismaUnknownRequestError: (
          exception: { message: string },
          errorResponse: ErrorResponse,
        ) => void
      }

      const errorResponse: ErrorResponse = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
        path: '/test-endpoint',
        response: 'Internal Server Error',
      }

      const prismaUnknownError = {
        message: 'Unknown database request error occurred',
      }

      filterWithPrivateMethods.handlePrismaUnknownRequestError(
        prismaUnknownError,
        errorResponse,
      )

      expect(errorResponse.statusCode).toBe(HttpStatus.BAD_REQUEST)
      expect(errorResponse.response).toBe('Database request failed')
      expect(errorResponse.error).toBe(
        'Unknown database request error occurred',
      )
    })
  })

  describe('handlePrismaRustPanicError', () => {
    it('should handle PrismaClientRustPanicError correctly', () => {
      // Access private method for testing
      const filterWithPrivateMethods = filter as unknown as {
        handlePrismaRustPanicError: (
          exception: { message: string },
          errorResponse: ErrorResponse,
        ) => void
      }

      const errorResponse: ErrorResponse = {
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
        path: '/test-endpoint',
        response: 'Bad Request',
      }

      const prismaRustPanicError = {
        message: 'Database engine panic occurred',
      }

      filterWithPrivateMethods.handlePrismaRustPanicError(
        prismaRustPanicError,
        errorResponse,
      )

      expect(errorResponse.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(errorResponse.response).toBe('Database engine error')
      expect(errorResponse.error).toBe('Database engine panic occurred')
    })
  })

  describe('handlePrismaInitializationError', () => {
    it('should handle PrismaClientInitializationError correctly', () => {
      // Access private method for testing
      const filterWithPrivateMethods = filter as unknown as {
        handlePrismaInitializationError: (
          exception: { message: string },
          errorResponse: ErrorResponse,
        ) => void
      }

      const errorResponse: ErrorResponse = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
        path: '/test-endpoint',
        response: 'Internal Server Error',
      }

      const prismaInitializationError = {
        message: 'Failed to initialize database connection',
      }

      filterWithPrivateMethods.handlePrismaInitializationError(
        prismaInitializationError,
        errorResponse,
      )

      expect(errorResponse.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE)
      expect(errorResponse.response).toBe('Database connection failed')
      expect(errorResponse.error).toBe(
        'Failed to initialize database connection',
      )
    })
  })

  describe('catch', () => {
    it('should handle HttpException through main catch method', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn<void, [ErrorResponse]>(),
      }
      const mockRequest = {
        url: '/test-endpoint',
      }
      const mockHttpContext = {
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }
      const mockArgumentsHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
        getArgByIndex: jest.fn(),
        getArgs: jest.fn(),
        getType: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
      }

      const httpException = new HttpException(
        'Validation failed',
        HttpStatus.BAD_REQUEST,
      )

      // Mock the super.catch method by spying on the parent class
      const superCatchSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(filter)), 'catch')
        .mockImplementation(() => {})

      filter.catch(httpException, mockArgumentsHost)

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
      expect(mockResponse.json).toHaveBeenCalledTimes(1)

      const jsonCall = mockResponse.json.mock.calls[0]
      expect(jsonCall).toBeDefined()
      expect(jsonCall).toHaveLength(1)

      if (!jsonCall) {
        fail('Expected json call to be defined')
      }

      const jsonCallArgs = jsonCall[0]
      expect(jsonCallArgs.statusCode).toBe(HttpStatus.BAD_REQUEST)
      expect(jsonCallArgs.response).toBe('Validation failed')
      expect(jsonCallArgs.path).toBe('/test-endpoint')
      expect(typeof jsonCallArgs.timestamp).toBe('string')
      expect(superCatchSpy).toHaveBeenCalledWith(
        httpException,
        mockArgumentsHost,
      )

      // Restore spy
      superCatchSpy.mockRestore()
    })

    it('should handle PrismaKnownRequestError through main catch method', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn<void, [ErrorResponse]>(),
      }
      const mockRequest = {
        url: '/test-prisma-endpoint',
      }
      const mockHttpContext = {
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }
      const mockArgumentsHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
        getArgByIndex: jest.fn(),
        getArgs: jest.fn(),
        getType: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
      }

      // Create mock PrismaKnownRequestError with proper constructor name
      const prismaKnownError = {
        code: 'P2001',
        message: 'Record not found',
        meta: { target: ['id'] },
        constructor: { name: 'PrismaClientKnownRequestError' },
      }

      // Mock the super.catch method
      const superCatchSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(filter)), 'catch')
        .mockImplementation(() => {})

      filter.catch(prismaKnownError, mockArgumentsHost)

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND)
      expect(mockResponse.json).toHaveBeenCalledTimes(1)

      const jsonCall = mockResponse.json.mock.calls[0]
      if (!jsonCall) {
        fail('Expected json call to be defined')
      }

      const jsonCallArgs = jsonCall[0]
      expect(jsonCallArgs.statusCode).toBe(HttpStatus.NOT_FOUND)
      expect(jsonCallArgs.response).toBe(
        'The record searched for does not exist',
      )
      expect(jsonCallArgs.path).toBe('/test-prisma-endpoint')
      expect(jsonCallArgs.error).toBe('P2001')
      expect(typeof jsonCallArgs.timestamp).toBe('string')
      expect(superCatchSpy).toHaveBeenCalledWith(
        prismaKnownError,
        mockArgumentsHost,
      )

      // Restore spy
      superCatchSpy.mockRestore()
    })

    it('should handle PrismaClientValidationError through main catch method', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn<void, [ErrorResponse]>(),
      }
      const mockRequest = {
        url: '/test-validation-endpoint',
      }
      const mockHttpContext = {
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }
      const mockArgumentsHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
        getArgByIndex: jest.fn(),
        getArgs: jest.fn(),
        getType: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
      }

      const prismaValidationError = new PrismaClientValidationError(
        'Invalid query structure:\n\n  Missing required field\n  value  ',
        {
          clientVersion: '5.0.0',
        },
      )

      // Mock the super.catch method
      const superCatchSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(filter)), 'catch')
        .mockImplementation(() => {})

      filter.catch(prismaValidationError, mockArgumentsHost)

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
      expect(mockResponse.json).toHaveBeenCalledTimes(1)

      const jsonCall = mockResponse.json.mock.calls[0]
      if (!jsonCall) {
        fail('Expected json call to be defined')
      }

      const jsonCallArgs = jsonCall[0]
      expect(jsonCallArgs.statusCode).toBe(HttpStatus.BAD_REQUEST)
      expect(jsonCallArgs.response).toBe('Invalid data provided')
      expect(jsonCallArgs.path).toBe('/test-validation-endpoint')
      expect(jsonCallArgs.error).toBe(
        'Invalid query structure: Missing required field value',
      )
      expect(typeof jsonCallArgs.timestamp).toBe('string')
      expect(superCatchSpy).toHaveBeenCalledWith(
        prismaValidationError,
        mockArgumentsHost,
      )

      // Restore spy
      superCatchSpy.mockRestore()
    })

    it('should handle generic Error through main catch method', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn<void, [ErrorResponse]>(),
      }
      const mockRequest = {
        url: '/test-generic-endpoint',
      }
      const mockHttpContext = {
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }
      const mockArgumentsHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
        getArgByIndex: jest.fn(),
        getArgs: jest.fn(),
        getType: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
      }

      const genericError = new Error('Generic application error occurred')

      // Mock the super.catch method
      const superCatchSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(filter)), 'catch')
        .mockImplementation(() => {})

      filter.catch(genericError, mockArgumentsHost)

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
      expect(mockResponse.json).toHaveBeenCalledTimes(1)

      const jsonCall = mockResponse.json.mock.calls[0]
      if (!jsonCall) {
        fail('Expected json call to be defined')
      }

      const jsonCallArgs = jsonCall[0]
      expect(jsonCallArgs.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(jsonCallArgs.response).toBe('Internal Server Error')
      expect(jsonCallArgs.path).toBe('/test-generic-endpoint')
      expect(jsonCallArgs.error).toBe('Generic application error occurred')
      expect(typeof jsonCallArgs.timestamp).toBe('string')
      expect(superCatchSpy).toHaveBeenCalledWith(
        genericError,
        mockArgumentsHost,
      )

      // Restore spy
      superCatchSpy.mockRestore()
    })

    it('should handle PrismaClientUnknownRequestError through main catch method', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn<void, [ErrorResponse]>(),
      }
      const mockRequest = {
        url: '/test-unknown-endpoint',
      }
      const mockHttpContext = {
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }
      const mockArgumentsHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
        getArgByIndex: jest.fn(),
        getArgs: jest.fn(),
        getType: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
      }

      const prismaUnknownError = new PrismaClientUnknownRequestError(
        'Database connection timeout occurred',
        {
          clientVersion: '5.0.0',
        },
      )

      // Mock the super.catch method
      const superCatchSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(filter)), 'catch')
        .mockImplementation(() => {})

      filter.catch(prismaUnknownError, mockArgumentsHost)

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
      expect(mockResponse.json).toHaveBeenCalledTimes(1)

      const jsonCall = mockResponse.json.mock.calls[0]
      if (!jsonCall) {
        fail('Expected json call to be defined')
      }

      const jsonCallArgs = jsonCall[0]
      expect(jsonCallArgs.statusCode).toBe(HttpStatus.BAD_REQUEST)
      expect(jsonCallArgs.response).toBe('Database request failed')
      expect(jsonCallArgs.path).toBe('/test-unknown-endpoint')
      expect(jsonCallArgs.error).toBe('Database connection timeout occurred')
      expect(typeof jsonCallArgs.timestamp).toBe('string')
      expect(superCatchSpy).toHaveBeenCalledWith(
        prismaUnknownError,
        mockArgumentsHost,
      )

      // Restore spy
      superCatchSpy.mockRestore()
    })

    it('should handle PrismaClientRustPanicError through main catch method', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn<void, [ErrorResponse]>(),
      }
      const mockRequest = {
        url: '/test-rust-panic-endpoint',
      }
      const mockHttpContext = {
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }
      const mockArgumentsHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
        getArgByIndex: jest.fn(),
        getArgs: jest.fn(),
        getType: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
      }

      const prismaRustPanicError = new PrismaClientRustPanicError(
        'Database engine crashed unexpectedly',
        '5.0.0',
      )

      // Mock the super.catch method
      const superCatchSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(filter)), 'catch')
        .mockImplementation(() => {})

      filter.catch(prismaRustPanicError, mockArgumentsHost)

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
      expect(mockResponse.json).toHaveBeenCalledTimes(1)

      const jsonCall = mockResponse.json.mock.calls[0]
      if (!jsonCall) {
        fail('Expected json call to be defined')
      }

      const jsonCallArgs = jsonCall[0]
      expect(jsonCallArgs.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(jsonCallArgs.response).toBe('Database engine error')
      expect(jsonCallArgs.path).toBe('/test-rust-panic-endpoint')
      expect(jsonCallArgs.error).toBe('Database engine crashed unexpectedly')
      expect(typeof jsonCallArgs.timestamp).toBe('string')
      expect(superCatchSpy).toHaveBeenCalledWith(
        prismaRustPanicError,
        mockArgumentsHost,
      )

      // Restore spy
      superCatchSpy.mockRestore()
    })

    it('should handle PrismaClientInitializationError through main catch method', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn<void, [ErrorResponse]>(),
      }
      const mockRequest = {
        url: '/test-initialization-endpoint',
      }
      const mockHttpContext = {
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }
      const mockArgumentsHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
        getArgByIndex: jest.fn(),
        getArgs: jest.fn(),
        getType: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
      }

      const prismaInitializationError = new PrismaClientInitializationError(
        'Failed to initialize database connection',
        '5.0.0',
        'error_code',
      )

      // Mock the super.catch method
      const superCatchSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(filter)), 'catch')
        .mockImplementation(() => {})

      filter.catch(prismaInitializationError, mockArgumentsHost)

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      )
      expect(mockResponse.json).toHaveBeenCalledTimes(1)

      const jsonCall = mockResponse.json.mock.calls[0]
      if (!jsonCall) {
        fail('Expected json call to be defined')
      }

      const jsonCallArgs = jsonCall[0]
      expect(jsonCallArgs.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE)
      expect(jsonCallArgs.response).toBe('Database connection failed')
      expect(jsonCallArgs.path).toBe('/test-initialization-endpoint')
      expect(jsonCallArgs.error).toBe(
        'Failed to initialize database connection',
      )
      expect(typeof jsonCallArgs.timestamp).toBe('string')
      expect(superCatchSpy).toHaveBeenCalledWith(
        prismaInitializationError,
        mockArgumentsHost,
      )

      // Restore spy
      superCatchSpy.mockRestore()
    })

    it('should handle non-Error exceptions through main catch method', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn<void, [ErrorResponse]>(),
      }
      const mockRequest = {
        url: '/test-unknown-endpoint',
      }
      const mockHttpContext = {
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }
      const mockArgumentsHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
        getArgByIndex: jest.fn(),
        getArgs: jest.fn(),
        getType: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
      }

      const unknownException = { someProperty: 'Unknown' }

      // Mock the super.catch method
      const superCatchSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(filter)), 'catch')
        .mockImplementation(() => {})

      filter.catch(unknownException, mockArgumentsHost)

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
      expect(mockResponse.json).toHaveBeenCalledTimes(1)

      const jsonCall = mockResponse.json.mock.calls[0]
      if (!jsonCall) {
        fail('Expected json call to be defined')
      }

      const jsonCallArgs = jsonCall[0]
      expect(jsonCallArgs.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(jsonCallArgs.response).toBe('Internal Server Error')
      expect(jsonCallArgs.path).toBe('/test-unknown-endpoint')
      expect(jsonCallArgs.error).toBeUndefined()
      expect(typeof jsonCallArgs.timestamp).toBe('string')
      expect(superCatchSpy).toHaveBeenCalledWith(
        unknownException,
        mockArgumentsHost,
      )

      // Restore spy
      superCatchSpy.mockRestore()
    })

    it('should handle exceptions with null constructor through main catch method', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn<void, [ErrorResponse]>(),
      }
      const mockRequest = {
        url: '/test-null-constructor-endpoint',
      }
      const mockHttpContext = {
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }
      const mockArgumentsHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
        getArgByIndex: jest.fn(),
        getArgs: jest.fn(),
        getType: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
      }

      // Create exception with null constructor to test line 44 branch
      const exceptionWithNullConstructor = {
        message: 'Exception with null constructor',
        constructor: null,
      } as { message: string; constructor: null }

      // Mock the super.catch method
      const superCatchSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(filter)), 'catch')
        .mockImplementation(() => {})

      filter.catch(exceptionWithNullConstructor, mockArgumentsHost)

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
      expect(mockResponse.json).toHaveBeenCalledTimes(1)

      const jsonCall = mockResponse.json.mock.calls[0]
      if (!jsonCall) {
        fail('Expected json call to be defined')
      }

      const jsonCallArgs = jsonCall[0]
      expect(jsonCallArgs.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(jsonCallArgs.response).toBe('Internal Server Error')
      expect(jsonCallArgs.path).toBe('/test-null-constructor-endpoint')
      expect(typeof jsonCallArgs.timestamp).toBe('string')
      expect(superCatchSpy).toHaveBeenCalledWith(
        exceptionWithNullConstructor,
        mockArgumentsHost,
      )

      // Restore spy
      superCatchSpy.mockRestore()
    })

    it('should handle PrismaKnownRequestError with missing code through main catch method', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn<void, [ErrorResponse]>(),
      }
      const mockRequest = {
        url: '/test-missing-code-endpoint',
      }
      const mockHttpContext = {
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }
      const mockArgumentsHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
        getArgByIndex: jest.fn(),
        getArgs: jest.fn(),
        getType: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
      }

      // Create PrismaKnownRequestError with missing/falsy code to test line 58 branch
      const prismaErrorWithoutCode = {
        code: '', // Empty string to trigger || 'unknown' fallback
        message: 'Prisma error without code',
        meta: { target: ['id'] },
        constructor: { name: 'PrismaClientKnownRequestError' },
      }

      // Mock the super.catch method
      const superCatchSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(filter)), 'catch')
        .mockImplementation(() => {})

      filter.catch(prismaErrorWithoutCode, mockArgumentsHost)

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
      expect(mockResponse.json).toHaveBeenCalledTimes(1)

      const jsonCall = mockResponse.json.mock.calls[0]
      if (!jsonCall) {
        fail('Expected json call to be defined')
      }

      const jsonCallArgs = jsonCall[0]
      expect(jsonCallArgs.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(jsonCallArgs.response).toBe('An unknown database error occurred')
      expect(jsonCallArgs.path).toBe('/test-missing-code-endpoint')
      expect(jsonCallArgs.error).toBe('UNKNOWN')
      expect(typeof jsonCallArgs.timestamp).toBe('string')
      expect(superCatchSpy).toHaveBeenCalledWith(
        prismaErrorWithoutCode,
        mockArgumentsHost,
      )

      // Restore spy
      superCatchSpy.mockRestore()
    })

    it('should handle HttpException with object response to test line 86 branch', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn<void, [ErrorResponse]>(),
      }
      const mockRequest = {
        url: '/test-object-response-endpoint',
      }
      const mockHttpContext = {
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }
      const mockArgumentsHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
        getArgByIndex: jest.fn(),
        getArgs: jest.fn(),
        getType: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
      }

      // Create HttpException with object response to test line 86 JSON.stringify branch
      const objectResponse = {
        message: 'Validation failed',
        statusCode: 400,
        error: 'Bad Request',
      }
      const httpExceptionWithObjectResponse = new HttpException(
        objectResponse,
        HttpStatus.BAD_REQUEST,
      )

      // Mock the super.catch method
      const superCatchSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(filter)), 'catch')
        .mockImplementation(() => {})

      filter.catch(httpExceptionWithObjectResponse, mockArgumentsHost)

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
      expect(mockResponse.json).toHaveBeenCalledTimes(1)

      const jsonCall = mockResponse.json.mock.calls[0]
      if (!jsonCall) {
        fail('Expected json call to be defined')
      }

      const jsonCallArgs = jsonCall[0]
      expect(jsonCallArgs.statusCode).toBe(HttpStatus.BAD_REQUEST)
      expect(jsonCallArgs.response).toEqual(objectResponse)
      expect(jsonCallArgs.path).toBe('/test-object-response-endpoint')
      expect(typeof jsonCallArgs.timestamp).toBe('string')
      expect(superCatchSpy).toHaveBeenCalledWith(
        httpExceptionWithObjectResponse,
        mockArgumentsHost,
      )

      // Restore spy
      superCatchSpy.mockRestore()
    })
  })
})
