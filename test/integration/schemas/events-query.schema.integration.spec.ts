import { EventsQuerySchema } from '../../../src/schemas/events-query.schema'

describe('EventsQuerySchema (Integration)', () => {
  it('should validate and transform query parameters with HTML sanitization', () => {
    const queryParams = {
      search: '<script>alert("xss")</script>Concert',
      limit: '15',
      offset: '5',
      orderBy: 'name',
      sortOrder: 'asc',
    }

    const validationResult = EventsQuerySchema.safeParse(queryParams)
    expect(validationResult.success).toBe(true)

    if (validationResult.success) {
      expect(validationResult.data.search).toBe('Concert')
      expect(validationResult.data.limit).toBe(15)
      expect(validationResult.data.offset).toBe(5)
      expect(validationResult.data.orderBy).toBe('name')
      expect(validationResult.data.sortOrder).toBe('asc')
    }
  })

  it('should apply fallback values when parseInt returns NaN', () => {
    const queryParams = {
      limit: 'NaN',
      offset: 'NaN',
    }

    const validationResult = EventsQuerySchema.safeParse(queryParams)
    expect(validationResult.success).toBe(true)

    if (validationResult.success) {
      expect(validationResult.data.limit).toBe(50)
      expect(validationResult.data.offset).toBe(0)
    }
  })
})
