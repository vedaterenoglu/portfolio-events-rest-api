import { CitiesQuerySchema } from '../../../src/schemas/cities-query.schema'

describe('CitiesQuerySchema (Integration)', () => {
  it('should validate and transform query parameters with HTML sanitization', () => {
    const queryParams = {
      search: '<script>alert("xss")</script>New York',
      limit: '25',
      offset: '10',
      orderBy: 'createdAt',
      sortOrder: 'desc',
      includeEventCount: 'true',
    }

    const validationResult = CitiesQuerySchema.safeParse(queryParams)
    expect(validationResult.success).toBe(true)

    if (validationResult.success) {
      expect(validationResult.data.search).toBe('New York')
      expect(validationResult.data.limit).toBe(25)
      expect(validationResult.data.offset).toBe(10)
      expect(validationResult.data.orderBy).toBe('createdAt')
      expect(validationResult.data.sortOrder).toBe('desc')
      expect(validationResult.data.includeEventCount).toBe(true)
    }
  })

  it('should apply fallback value for invalid limit string', () => {
    const queryParams = {
      limit: 'invalid',
    }

    const validationResult = CitiesQuerySchema.safeParse(queryParams)
    expect(validationResult.success).toBe(true)

    if (validationResult.success) {
      expect(validationResult.data.limit).toBe(50)
    }
  })
})
