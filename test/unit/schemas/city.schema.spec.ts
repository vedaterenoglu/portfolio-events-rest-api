import { CitySchema } from '../../../src/schemas/city.schema'

describe('CitySchema', () => {
  it('should validate a valid city object', () => {
    const validCity = {
      id: 'clmn1abc23456789def01234',
      citySlug: 'test-city',
      city: 'Test City',
      url: 'https://example.com/test-city.jpg',
      alt: 'Test city image',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = CitySchema.safeParse(validCity)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validCity)
    }
  })
})
