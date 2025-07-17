import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { throwError } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'

import { HealthMonitoringService } from '../services/health-monitoring.service'

@Injectable()
export class RequestMetricsInterceptor implements NestInterceptor {
  constructor(
    private readonly healthMonitoringService: HealthMonitoringService,
  ) {}

  intercept<T = unknown>(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<T> {
    const startTime = Date.now()
    const request = context.switchToHttp().getRequest<Request>()

    // Skip health check endpoints to avoid recursive calls
    if (
      request.url?.includes('/health') ||
      request.url?.includes('/ready') ||
      request.url?.includes('/metrics')
    ) {
      return next.handle()
    }

    return next.handle().pipe(
      tap(() => {
        // Record successful request
        const responseTime = Date.now() - startTime
        this.healthMonitoringService.recordRequest(responseTime, true)
      }),
      catchError((error: Error) => {
        // Record failed request
        const responseTime = Date.now() - startTime
        this.healthMonitoringService.recordRequest(responseTime, false)

        // Also record the error
        const errorType = error.constructor?.name || 'UnknownError'
        const errorMessage = error.message || 'Unknown error occurred'
        this.healthMonitoringService.recordError(errorType, errorMessage)

        return throwError(() => error)
      }),
    )
  }
}
