import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { sanitizePlainText } from '../utils/sanitization'

@Injectable()
export class OutputSanitizationInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(map(data => this.sanitizeResponse(data)))
  }

  private sanitizeResponse(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data
    }

    if (typeof data === 'string') {
      return sanitizePlainText(data, 10000)
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeResponse(item))
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: Record<string, unknown> = {}
      const obj = data as Record<string, unknown>

      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          // Skip sanitizing certain fields that should not be modified
          if (this.shouldSkipField(key)) {
            // eslint-disable-next-line security/detect-object-injection
            sanitized[key] = obj[key]
          } else {
            // eslint-disable-next-line security/detect-object-injection
            sanitized[key] = this.sanitizeResponse(obj[key])
          }
        }
      }
      return sanitized
    }

    return data
  }

  private shouldSkipField(fieldName: string): boolean {
    const skipFields = [
      'id',
      'citySlug',
      'slug',
      'price',
      'count',
      'limit',
      'offset',
      'createdAt',
      'updatedAt',
      'date',
      'imageUrl',
      'url',
    ]
    return skipFields.includes(fieldName)
  }
}
