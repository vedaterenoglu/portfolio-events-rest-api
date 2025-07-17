import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common'
import { Request } from 'express'
import { Observable, throwError, TimeoutError } from 'rxjs'
import { timeout, catchError } from 'rxjs/operators'

@Injectable()
export class RequestTimeoutInterceptor implements NestInterceptor {
  private readonly defaultTimeout = 30000 // 30 seconds
  private readonly endpointTimeouts: Record<string, number> = {
    // Health endpoints - shorter timeout for monitoring
    '/health': 5000,
    '/ready': 5000,
    '/metrics': 5000,
    // API endpoints - standard timeout
    '/api/events': 15000,
    '/api/cities': 10000,
    // Admin endpoints - longer timeout for complex operations
    '/admin/events': 45000,
    // File uploads or heavy operations
    '/upload': 120000,
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>()
    const requestTimeout = this.getTimeoutForRequest(request.url || '')

    return next.handle().pipe(
      timeout(requestTimeout),
      catchError((error: unknown) => {
        if (error instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException(
                `Request timeout after ${requestTimeout}ms`,
              ),
          )
        }
        return throwError(() => error)
      }),
    )
  }

  private getTimeoutForRequest(url: string): number {
    // Check for exact matches first
    if (Object.prototype.hasOwnProperty.call(this.endpointTimeouts, url)) {
      // eslint-disable-next-line security/detect-object-injection
      const exactTimeout = this.endpointTimeouts[url]
      if (exactTimeout !== undefined) {
        return exactTimeout
      }
    }

    // Check for pattern matches
    for (const pattern of Object.keys(this.endpointTimeouts)) {
      if (url.startsWith(pattern)) {
        // eslint-disable-next-line security/detect-object-injection
        const timeoutValue = this.endpointTimeouts[pattern]
        if (timeoutValue !== undefined) {
          return timeoutValue
        }
      }
    }

    return this.defaultTimeout
  }
}
