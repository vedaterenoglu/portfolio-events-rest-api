import { BadRequestException } from '@nestjs/common'
import { z } from 'zod'

import { ZodValidationPipe } from '../../../src/pipes/zod-validation.pipe'

describe('ZodValidationPipe - formatZodError', () => {
  it('should format ZodError with empty path as root', () => {
    // Create a schema that will trigger empty path validation error
    const schema = z.number() // This will trigger type error at root level
    const pipe = new ZodValidationPipe(schema)
    const input = 'not-a-number' // String instead of number, triggers root-level type error

    expect(() => pipe.transform(input)).toThrow(BadRequestException)

    try {
      pipe.transform(input)
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException)
      const badRequestError = error as BadRequestException
      expect(badRequestError.message).toContain('root:')
      expect(badRequestError.message).toContain('Invalid input')
    }
  })
})
