import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Request, Response } from 'express'
import { ZodError } from 'zod'

import {
  PrismaClientValidationError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
} from './lib/prisma'

interface ErrorResponse {
  statusCode: number
  timestamp: string
  path: string
  response: string | object
  error?: string | object
}

interface PrismaKnownRequestError {
  code: string
  message: string
  meta?: Record<string, unknown>
}

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  override catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const errorResponse: ErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      response: 'Internal Server Error',
    }

    // Debug logging to see what type of exception we're dealing with
    const exceptionName = exception?.constructor?.name || 'Unknown'
    const exceptionMessage =
      exception instanceof Error
        ? exception.message.substring(0, 100)
        : 'Unknown'
    this.logger.log(`Exception caught: ${exceptionName} - ${exceptionMessage}`)

    // Additional debug for Prisma errors
    if (exception?.constructor?.name === 'PrismaClientKnownRequestError') {
      const prismaError = exception as PrismaKnownRequestError
      this.logger.log(
        `Prisma error detected with code: ${prismaError.code || 'unknown'}`,
      )
    }

    if (exception instanceof HttpException) {
      this.handleHttpException(exception, errorResponse)
    } else if (exception instanceof ZodError) {
      this.handleZodError(exception, errorResponse)
    } else if (
      exception?.constructor?.name === 'PrismaClientKnownRequestError'
    ) {
      this.handlePrismaKnownRequestError(
        exception as PrismaKnownRequestError,
        errorResponse,
      )
    } else if (exception instanceof PrismaClientValidationError) {
      this.handlePrismaValidationError(exception, errorResponse)
    } else if (exception instanceof PrismaClientUnknownRequestError) {
      this.handlePrismaUnknownRequestError(exception, errorResponse)
    } else if (exception instanceof PrismaClientRustPanicError) {
      this.handlePrismaRustPanicError(exception, errorResponse)
    } else if (exception instanceof PrismaClientInitializationError) {
      this.handlePrismaInitializationError(exception, errorResponse)
    } else {
      this.handleGenericError(exception, errorResponse)
    }

    response.status(errorResponse.statusCode).json(errorResponse)
    this.logger.error(
      `${errorResponse.statusCode} ${typeof errorResponse.response === 'object' ? JSON.stringify(errorResponse.response) : errorResponse.response}`,
    )

    super.catch(exception, host)
  }

  private handleHttpException(
    exception: HttpException,
    errorResponse: ErrorResponse,
  ): void {
    errorResponse.statusCode = exception.getStatus()
    errorResponse.response = exception.getResponse()
  }

  private handleZodError(
    exception: ZodError,
    errorResponse: ErrorResponse,
  ): void {
    errorResponse.statusCode = HttpStatus.BAD_REQUEST
    errorResponse.response = 'Validation failed'

    // Extract specific validation errors from Zod
    const validationErrors = exception.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }))

    errorResponse.error = {
      message: 'Input validation failed',
      details: validationErrors,
    }
  }

  private handlePrismaKnownRequestError(
    exception: PrismaKnownRequestError,
    errorResponse: ErrorResponse,
  ): void {
    const code: string = exception.code || 'UNKNOWN'
    this.logger.log(`Prisma error code: ${code}`)
    errorResponse.statusCode = this.mapPrismaErrorCodeToHttpStatus(code)
    errorResponse.response = this.mapPrismaErrorCodeToMessage(code)
    errorResponse.error = code
  }

  private handlePrismaValidationError(
    exception: PrismaClientValidationError,
    errorResponse: ErrorResponse,
  ): void {
    errorResponse.statusCode = HttpStatus.BAD_REQUEST
    errorResponse.response = 'Invalid data provided'
    errorResponse.error = this.cleanErrorMessage(
      exception instanceof Error ? exception.message : 'Validation error',
    )
  }

  private handlePrismaUnknownRequestError(
    exception: PrismaClientUnknownRequestError,
    errorResponse: ErrorResponse,
  ): void {
    errorResponse.statusCode = HttpStatus.BAD_REQUEST
    errorResponse.response = 'Database request failed'
    errorResponse.error =
      exception instanceof Error ? exception.message : 'Unknown request error'
  }

  private handlePrismaRustPanicError(
    exception: PrismaClientRustPanicError,
    errorResponse: ErrorResponse,
  ): void {
    errorResponse.statusCode = HttpStatus.INTERNAL_SERVER_ERROR
    errorResponse.response = 'Database engine error'
    errorResponse.error =
      exception instanceof Error ? exception.message : 'Database engine error'
  }

  private handlePrismaInitializationError(
    exception: PrismaClientInitializationError,
    errorResponse: ErrorResponse,
  ): void {
    errorResponse.statusCode = HttpStatus.SERVICE_UNAVAILABLE
    errorResponse.response = 'Database connection failed'
    errorResponse.error =
      exception instanceof Error
        ? exception.message
        : 'Database connection failed'
  }

  private handleGenericError(
    exception: unknown,
    errorResponse: ErrorResponse,
  ): void {
    errorResponse.statusCode = HttpStatus.INTERNAL_SERVER_ERROR
    errorResponse.response = 'Internal Server Error'
    if (exception instanceof Error) {
      // Clean up Prisma error messages by removing newlines and extra spaces
      errorResponse.error = this.cleanErrorMessage(exception.message)
    }
  }

  private cleanErrorMessage(message: string): string {
    return message
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim() // Remove leading/trailing whitespace
  }

  private mapPrismaErrorCodeToHttpStatus(code: string): number {
    const errorMap: Record<string, number> = {
      P2000: HttpStatus.BAD_REQUEST, // Value too long
      P2001: HttpStatus.NOT_FOUND, // Record not found
      P2002: HttpStatus.CONFLICT, // Unique constraint violation
      P2003: HttpStatus.BAD_REQUEST, // Foreign key constraint violation
      P2004: HttpStatus.BAD_REQUEST, // Constraint violation
      P2005: HttpStatus.BAD_REQUEST, // Invalid value
      P2006: HttpStatus.BAD_REQUEST, // Invalid value
      P2007: HttpStatus.BAD_REQUEST, // Data validation error
      P2008: HttpStatus.BAD_REQUEST, // Failed to parse query
      P2009: HttpStatus.BAD_REQUEST, // Failed to validate query
      P2010: HttpStatus.INTERNAL_SERVER_ERROR, // Raw query failed
      P2011: HttpStatus.BAD_REQUEST, // Null constraint violation
      P2012: HttpStatus.BAD_REQUEST, // Missing required value
      P2013: HttpStatus.BAD_REQUEST, // Missing required argument
      P2014: HttpStatus.BAD_REQUEST, // Relation violation
      P2015: HttpStatus.NOT_FOUND, // Related record not found
      P2016: HttpStatus.BAD_REQUEST, // Query interpretation error
      P2017: HttpStatus.BAD_REQUEST, // Records not connected
      P2018: HttpStatus.NOT_FOUND, // Required connected records not found
      P2019: HttpStatus.BAD_REQUEST, // Input error
      P2020: HttpStatus.BAD_REQUEST, // Value out of range
      P2021: HttpStatus.NOT_FOUND, // Table does not exist
      P2022: HttpStatus.NOT_FOUND, // Column does not exist
      P2023: HttpStatus.BAD_REQUEST, // Inconsistent column data
      P2024: HttpStatus.REQUEST_TIMEOUT, // Timed out fetching connection
      P2025: HttpStatus.NOT_FOUND, // Record not found
      P2026: HttpStatus.BAD_REQUEST, // Unsupported feature
      P2027: HttpStatus.INTERNAL_SERVER_ERROR, // Multiple errors
      P2028: HttpStatus.INTERNAL_SERVER_ERROR, // Transaction API error
    }

    // eslint-disable-next-line security/detect-object-injection
    return errorMap[code] || HttpStatus.INTERNAL_SERVER_ERROR
  }

  private mapPrismaErrorCodeToMessage(code: string): string {
    const messageMap: Record<string, string> = {
      P2000: 'The provided value is too long for the field',
      P2001: 'The record searched for does not exist',
      P2002: 'Unique constraint failed - this value already exists',
      P2003: 'Foreign key constraint failed',
      P2004: 'A constraint failed on the database',
      P2005: 'The value stored in the database is invalid for the field type',
      P2006: 'The provided value is invalid for the field type',
      P2007: 'Data validation error',
      P2008: 'Failed to parse the query',
      P2009: 'Failed to validate the query',
      P2010: 'Raw query failed',
      P2011: 'Null constraint violation',
      P2012: 'Missing a required value',
      P2013: 'Missing the required argument',
      P2014: 'The change would violate the required relation',
      P2015: 'A related record could not be found',
      P2016: 'Query interpretation error',
      P2017: 'The records for relation are not connected',
      P2018: 'The required connected records were not found',
      P2019: 'Input error',
      P2020: 'Value out of range for the type',
      P2021: 'The table does not exist in the current database',
      P2022: 'The column does not exist in the current database',
      P2023: 'Inconsistent column data',
      P2024: 'Timed out fetching a new connection from the connection pool',
      P2025:
        'An operation failed because it depends on one or more records that were required but not found',
      P2026: 'The current database provider does not support a feature',
      P2027: 'Multiple errors occurred on the database during query execution',
      P2028: 'Transaction API error',
    }

    // eslint-disable-next-line security/detect-object-injection
    return messageMap[code] || 'An unknown database error occurred'
  }
}
