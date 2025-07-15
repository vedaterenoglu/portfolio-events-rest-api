import { CitiesQuerySchema } from '../../../src/schemas/cities-query.schema'

describe('CitiesQuerySchema', () => {
  describe('search parameter', () => {
    it('should validate and sanitize valid search term', () => {
      const result = CitiesQuerySchema.safeParse({
        search: 'New York',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.search).toBe('New York')
      }
    })

    it('should sanitize HTML in search parameter', () => {
      const result = CitiesQuerySchema.safeParse({
        search: '<script>alert("xss")</script>Paris',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.search).toBe('Paris')
      }
    })
  })

  describe('limit parameter', () => {
    it('should validate and transform limit parameter', () => {
      const result = CitiesQuerySchema.safeParse({
        limit: '25',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(25)
      }
    })
  })
})
