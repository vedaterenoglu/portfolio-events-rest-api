import { Server } from 'http'

import {
  INestApplication,
  Controller,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { z, ZodError } from 'zod'

import { AllExceptionsFilter } from '../../../src/all-exceptions.filter'
import {
  PrismaClientValidationError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
} from '../../../src/lib/prisma'
import { HealthMonitoringService } from '../../../src/services/health-monitoring.service'

interface ErrorResponse {
  statusCode: number
  timestamp: string
  path: string
  response: string | object
  error?: string | object
}

interface MockPrismaError extends Error {
  code: string
  meta: { target: string[] }
}

// Test controller to trigger different exceptions
@Controller('test')
class TestController {
  @Get('http-exception')
  throwHttpException(): never {
    throw new HttpException('Test HTTP exception', HttpStatus.BAD_REQUEST)
  }

  @Get('http-exception-object')
  throwHttpExceptionWithObject(): never {
    throw new HttpException(
      { message: 'Test message', code: 'TEST_CODE' },
      HttpStatus.FORBIDDEN,
    )
  }

  @Get('zod-error')
  throwZodError(): never {
    const schema = z.object({
      name: z.string(),
      age: z.string().min(3),
    })

    try {
      schema.parse({
        name: 123, // This will cause invalid_type error
        age: 'ab', // This will cause too_small error
      })
    } catch (error) {
      if (error instanceof ZodError) {
        throw error
      }
    }

    // Fallback in case the parse doesn't throw
    throw new Error('Expected ZodError was not thrown')
  }

  @Get('prisma-known-error')
  throwPrismaKnownError(): never {
    const error = new Error(
      'Unique constraint failed on the fields: (`email`)',
    ) as MockPrismaError
    Object.defineProperty(error, 'constructor', {
      value: { name: 'PrismaClientKnownRequestError' },
      writable: true,
      enumerable: false,
      configurable: true,
    })
    error.code = 'P2002'
    error.meta = { target: ['email'] }
    throw error
  }

  @Get('prisma-validation-error')
  throwPrismaValidationError(): never {
    throw new PrismaClientValidationError(
      'Invalid `prisma.user.create()` invocation:\n\n  Missing required field\n  value  ',
      { clientVersion: '5.0.0' },
    )
  }

  @Get('prisma-unknown-error')
  throwPrismaUnknownError(): never {
    throw new PrismaClientUnknownRequestError(
      'Database connection timeout occurred',
      { clientVersion: '5.0.0' },
    )
  }

  @Get('generic-error')
  throwGenericError(): never {
    throw new Error(
      'Generic error message with\nmultiple lines\n  and extra spaces  ',
    )
  }

  @Get('prisma-rust-panic-error')
  throwPrismaRustPanicError(): never {
    throw new PrismaClientRustPanicError(
      'Database engine crashed unexpectedly',
      '5.0.0',
    )
  }

  @Get('prisma-initialization-error')
  throwPrismaInitializationError(): never {
    throw new PrismaClientInitializationError(
      'Failed to initialize database connection',
      '5.0.0',
    )
  }

  @Get('non-error-exception')
  throwNonErrorException(): never {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw 'This is a string error, not an Error object'
  }

  @Get('prisma-known-error-no-code')
  throwPrismaKnownErrorNoCode(): never {
    const error = new Error('Prisma error without code') as MockPrismaError
    Object.defineProperty(error, 'constructor', {
      value: { name: 'PrismaClientKnownRequestError' },
      writable: true,
      enumerable: false,
      configurable: true,
    })
    // Intentionally not setting error.code to test fallback
    error.meta = { target: ['field'] }
    throw error
  }
}

describe('AllExceptionsFilter (Integration)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
    }).compile()

    app = moduleFixture.createNestApplication()

    const mockHealthMonitoringService = {
      recordError: jest.fn(),
    } as unknown as HealthMonitoringService

    app.useGlobalFilters(new AllExceptionsFilter(mockHealthMonitoringService))
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('HTTP Exceptions', () => {
    it('should handle HttpException with string message', async () => {
      const server = app.getHttpServer() as Server
      const response = await request(server)
        .get('/test/http-exception')
        .expect(HttpStatus.BAD_REQUEST)

      const errorResponse = response.body as ErrorResponse
      expect(errorResponse.statusCode).toBe(HttpStatus.BAD_REQUEST)
      expect(errorResponse.response).toBe('Test HTTP exception')
      expect(errorResponse.path).toBe('/test/http-exception')
      expect(typeof errorResponse.timestamp).toBe('string')
      expect(errorResponse.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      )

      const contentType = response.get('content-type')
      expect(contentType).toMatch(/application\/json/)
    })

    it('should handle HttpException with object response', async () => {
      const server = app.getHttpServer() as Server
      const response = await request(server)
        .get('/test/http-exception-object')
        .expect(HttpStatus.FORBIDDEN)

      const errorResponse = response.body as ErrorResponse
      expect(errorResponse.statusCode).toBe(HttpStatus.FORBIDDEN)
      expect(errorResponse.response).toEqual({
        message: 'Test message',
        code: 'TEST_CODE',
      })
      expect(errorResponse.path).toBe('/test/http-exception-object')
      expect(typeof errorResponse.timestamp).toBe('string')
      expect(errorResponse.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      )

      const contentType = response.get('content-type')
      expect(contentType).toMatch(/application\/json/)
    })
  })

  describe('Zod Validation Errors', () => {
    it('should handle ZodError with detailed validation errors', async () => {
      const server = app.getHttpServer() as Server
      const response = await request(server)
        .get('/test/zod-error')
        .expect(HttpStatus.BAD_REQUEST)

      const errorResponse = response.body as ErrorResponse
      expect(errorResponse.statusCode).toBe(HttpStatus.BAD_REQUEST)
      expect(errorResponse.response).toBe('Validation failed')
      expect(errorResponse.path).toBe('/test/zod-error')
      expect(typeof errorResponse.timestamp).toBe('string')
      expect(errorResponse.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      )

      expect(errorResponse.error).toEqual({
        message: 'Input validation failed',
        details: [
          {
            field: 'name',
            message: 'Invalid input: expected string, received number',
            code: 'invalid_type',
          },
          {
            field: 'age',
            message: 'Too small: expected string to have >=3 characters',
            code: 'too_small',
          },
        ],
      })

      const contentType = response.get('content-type')
      expect(contentType).toMatch(/application\/json/)
    })
  })

  describe('Prisma Errors', () => {
    it('should handle PrismaClientKnownRequestError with unique constraint violation', async () => {
      const server = app.getHttpServer() as Server
      const response = await request(server)
        .get('/test/prisma-known-error')
        .expect(HttpStatus.CONFLICT)

      const errorResponse = response.body as ErrorResponse
      expect(errorResponse.statusCode).toBe(HttpStatus.CONFLICT)
      expect(errorResponse.response).toBe(
        'Unique constraint failed - this value already exists',
      )
      expect(errorResponse.path).toBe('/test/prisma-known-error')
      expect(errorResponse.error).toBe('P2002')
      expect(typeof errorResponse.timestamp).toBe('string')
      expect(errorResponse.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      )

      const contentType = response.get('content-type')
      expect(contentType).toMatch(/application\/json/)
    })

    it('should handle PrismaClientValidationError', async () => {
      const server = app.getHttpServer() as Server
      const response = await request(server)
        .get('/test/prisma-validation-error')
        .expect(HttpStatus.BAD_REQUEST)

      const errorResponse = response.body as ErrorResponse
      expect(errorResponse.statusCode).toBe(HttpStatus.BAD_REQUEST)
      expect(errorResponse.response).toBe('Invalid data provided')
      expect(errorResponse.path).toBe('/test/prisma-validation-error')
      expect(errorResponse.error).toBe(
        'Invalid `prisma.user.create()` invocation: Missing required field value',
      )
      expect(typeof errorResponse.timestamp).toBe('string')
      expect(errorResponse.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      )

      const contentType = response.get('content-type')
      expect(contentType).toMatch(/application\/json/)
    })

    it('should handle PrismaClientRustPanicError', async () => {
      const server = app.getHttpServer() as Server
      const response = await request(server)
        .get('/test/prisma-rust-panic-error')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)

      const errorResponse = response.body as ErrorResponse
      expect(errorResponse.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(errorResponse.response).toBe('Database engine error')
      expect(errorResponse.path).toBe('/test/prisma-rust-panic-error')
      expect(errorResponse.error).toBe('Database engine crashed unexpectedly')
      expect(typeof errorResponse.timestamp).toBe('string')
      expect(errorResponse.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      )

      const contentType = response.get('content-type')
      expect(contentType).toMatch(/application\/json/)
    })

    it('should handle PrismaClientKnownRequestError without error code', async () => {
      const server = app.getHttpServer() as Server
      const response = await request(server)
        .get('/test/prisma-known-error-no-code')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)

      const errorResponse = response.body as ErrorResponse
      expect(errorResponse.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(errorResponse.response).toBe('An unknown database error occurred')
      expect(errorResponse.path).toBe('/test/prisma-known-error-no-code')
      expect(errorResponse.error).toBe('UNKNOWN')
      expect(typeof errorResponse.timestamp).toBe('string')
      expect(errorResponse.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      )

      const contentType = response.get('content-type')
      expect(contentType).toMatch(/application\/json/)
    })

    it('should handle PrismaClientInitializationError', async () => {
      const server = app.getHttpServer() as Server
      const response = await request(server)
        .get('/test/prisma-initialization-error')
        .expect(HttpStatus.SERVICE_UNAVAILABLE)

      const errorResponse = response.body as ErrorResponse
      expect(errorResponse.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE)
      expect(errorResponse.response).toBe('Database connection failed')
      expect(errorResponse.path).toBe('/test/prisma-initialization-error')
      expect(errorResponse.error).toBe(
        'Failed to initialize database connection',
      )
      expect(typeof errorResponse.timestamp).toBe('string')
      expect(errorResponse.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      )

      const contentType = response.get('content-type')
      expect(contentType).toMatch(/application\/json/)
    })

    it('should handle PrismaClientUnknownRequestError', async () => {
      const server = app.getHttpServer() as Server
      const response = await request(server)
        .get('/test/prisma-unknown-error')
        .expect(HttpStatus.BAD_REQUEST)

      const errorResponse = response.body as ErrorResponse
      expect(errorResponse.statusCode).toBe(HttpStatus.BAD_REQUEST)
      expect(errorResponse.response).toBe('Database request failed')
      expect(errorResponse.path).toBe('/test/prisma-unknown-error')
      expect(errorResponse.error).toBe('Database connection timeout occurred')
      expect(typeof errorResponse.timestamp).toBe('string')
      expect(errorResponse.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      )

      const contentType = response.get('content-type')
      expect(contentType).toMatch(/application\/json/)
    })
  })

  describe('Generic Errors', () => {
    it('should handle generic Error with message cleanup', async () => {
      const server = app.getHttpServer() as Server
      const response = await request(server)
        .get('/test/generic-error')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)

      const errorResponse = response.body as ErrorResponse
      expect(errorResponse.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(errorResponse.response).toBe('Internal Server Error')
      expect(errorResponse.path).toBe('/test/generic-error')
      expect(errorResponse.error).toBe(
        'Generic error message with multiple lines and extra spaces',
      )
      expect(typeof errorResponse.timestamp).toBe('string')
      expect(errorResponse.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      )

      const contentType = response.get('content-type')
      expect(contentType).toMatch(/application\/json/)
    })

    it('should handle non-Error exception objects', async () => {
      const server = app.getHttpServer() as Server
      const response = await request(server)
        .get('/test/non-error-exception')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)

      const errorResponse = response.body as ErrorResponse
      expect(errorResponse.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(errorResponse.response).toBe('Internal Server Error')
      expect(errorResponse.path).toBe('/test/non-error-exception')
      expect(errorResponse.error).toBeUndefined()
      expect(typeof errorResponse.timestamp).toBe('string')
      expect(errorResponse.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      )

      const contentType = response.get('content-type')
      expect(contentType).toMatch(/application\/json/)
    })
  })
})
