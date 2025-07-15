import { BadRequestException } from '@nestjs/common'
import { z } from 'zod'

import { ZodValidationPipe } from '../../../src/pipes/zod-validation.pipe'

describe('ZodValidationPipe', () => {
  it('should validate and transform data successfully', () => {
    const schema = z.object({
      name: z.string().min(1),
      age: z.number().positive(),
    })
    const pipe = new ZodValidationPipe(schema)
    const input = { name: 'John', age: 25 }

    const result = pipe.transform(input)

    expect(result).toEqual({ name: 'John', age: 25 })
  })

  it('should throw BadRequestException for ZodError', () => {
    const schema = z.object({
      name: z.string().min(1),
      age: z.number().positive(),
    })
    const pipe = new ZodValidationPipe(schema)
    const input = { name: '', age: -5 }

    expect(() => pipe.transform(input)).toThrow(BadRequestException)
  })

  it('should throw BadRequestException for generic error', () => {
    const schema = z.object({
      name: z.string(),
    })
    const pipe = new ZodValidationPipe(schema)

    // Mock the parse method to throw generic error
    jest.spyOn(schema, 'parse').mockImplementation(() => {
      throw new Error('Generic error')
    })

    const input = { name: 'test' }

    expect(() => pipe.transform(input)).toThrow(
      new BadRequestException('Validation failed'),
    )
  })

  it('should format ZodError with empty path as root', () => {
    const schema = z.string()
    const pipe = new ZodValidationPipe(schema)
    const input = 123 // Invalid input to trigger error with empty path

    expect(() => pipe.transform(input)).toThrow(BadRequestException)
  })
})
