import { CitySchema, CreateCitySchema } from '../../../src/schemas/city.schema'

describe('CitySchema', () => {
  it('should validate a valid city object', () => {
    const validCity = {
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

  it('should validate CreateCitySchema without timestamp fields', () => {
    const createCityData = {
      citySlug: 'new-city',
      city: 'New City',
      url: 'https://example.com/new-city.jpg',
      alt: 'New city image',
    }

    const result = CreateCitySchema.safeParse(createCityData)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(createCityData)
    }
  })
})
