import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import { ZodType, ZodError } from 'zod'

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown) {
    try {
      const parsedValue = this.schema.parse(value)
      return parsedValue
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(this.formatZodError(error))
      }
      throw new BadRequestException('Validation failed')
    }
  }

  private formatZodError(error: ZodError): string {
    const messages = error.issues.map(issue => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'root'
      return `${path}: ${issue.message}`
    })
    return messages.join(', ')
  }
}
