import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AdminCitiesController } from '../../../src/admin/admin-cities.controller'
import { CitiesService } from '../../../src/cities/cities.service'
import { ZodValidationPipe } from '../../../src/pipes/zod-validation.pipe'
import { CreateCitySchema, CreateCity } from '../../../src/schemas/city.schema'

describe('ZodValidationPipe Integration', () => {
  let controller: AdminCitiesController
  let citiesService: CitiesService
  let module: TestingModule

  beforeEach(async () => {
    const mockCitiesService = {
      createCity: jest.fn(),
      updateCity: jest.fn(),
    }

    module = await Test.createTestingModule({
      controllers: [AdminCitiesController],
      providers: [
        {
          provide: CitiesService,
          useValue: mockCitiesService,
        },
      ],
    }).compile()

    controller = module.get<AdminCitiesController>(AdminCitiesController)
    citiesService = module.get<CitiesService>(CitiesService)
  })

  afterEach(async () => {
    await module.close()
  })

  it('should validate and sanitize data with ZodValidationPipe', async () => {
    const pipe = new ZodValidationPipe(CreateCitySchema)
    const validCityData = {
      citySlug: 'test-city',
      city: 'Test City',
      url: 'https://example.com',
      alt: 'Test alt text',
    }

    const mockCity = {
      ...validCityData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    jest.spyOn(citiesService, 'createCity').mockResolvedValue(mockCity)

    const result = pipe.transform(validCityData) as CreateCity
    const response = await controller.createCity(result)

    expect(response).toMatchObject({
      citySlug: 'test-city',
      city: 'Test City',
      url: 'https://example.com',
      alt: 'Test alt text',
    })
  })

  it('should throw BadRequestException for invalid data', () => {
    const pipe = new ZodValidationPipe(CreateCitySchema)
    const invalidCityData = {
      citySlug: '',
      city: '',
      url: 'invalid-url',
      alt: '',
    }

    expect(() => pipe.transform(invalidCityData)).toThrow(BadRequestException)
  })

  it('should format ZodError with detailed field paths', () => {
    const pipe = new ZodValidationPipe(CreateCitySchema)
    // Use null values to trigger ZodError before transform functions
    const invalidCityData = {
      citySlug: null,
      city: null,
      url: null,
      alt: null,
    }

    expect(() => pipe.transform(invalidCityData)).toThrow(BadRequestException)

    try {
      pipe.transform(invalidCityData)
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException)
      const badRequestError = error as BadRequestException
      expect(badRequestError.message).toContain('citySlug')
      expect(badRequestError.message).toContain('city')
      expect(badRequestError.message).toContain('url')
      expect(badRequestError.message).toContain('alt')
    }
  })
})
