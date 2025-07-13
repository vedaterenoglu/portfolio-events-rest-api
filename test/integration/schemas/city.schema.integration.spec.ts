import { CitySchema } from '../../../src/schemas/city.schema'

describe('CitySchema Integration', () => {
  describe('TCitySchema validation', () => {
    it('should validate a valid city object', () => {
      const validCity = {
        citySlug: 'istanbul',
        city: 'Istanbul',
        url: 'https://example.com/istanbul.jpg',
        alt: 'Istanbul city image',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = CitySchema.parse(validCity)

      expect(result).toEqual(validCity)
    })
  })
})
