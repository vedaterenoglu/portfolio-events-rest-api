import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { z } from 'zod'

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

  it('should format ZodError with root-level error using same pattern as unit test', () => {
    // Use exact same pattern as unit test to ensure consistency
    const rootLevelSchema = z.number()
    const pipe = new ZodValidationPipe(rootLevelSchema)
    const invalidInput = 'not-a-number'

    expect(() => pipe.transform(invalidInput)).toThrow(BadRequestException)

    try {
      pipe.transform(invalidInput)
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException)
      const badRequestError = error as BadRequestException
      expect(badRequestError.message).toContain('root:')
      expect(badRequestError.message).toContain('Invalid input')
    }
  })
})
