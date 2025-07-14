import { Test, TestingModule } from '@nestjs/testing'

import { AdminCitiesController } from '../../../src/admin/admin-cities.controller'
import { CitiesService } from '../../../src/cities/cities.service'
import { AdminRoleGuard } from '../../../src/guards/admin-role.guard'
import { JwtAuthGuard } from '../../../src/guards/jwt-auth.guard'

describe('AdminCitiesController Integration', () => {
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
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminRoleGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<AdminCitiesController>(AdminCitiesController)
    citiesService = module.get<CitiesService>(CitiesService)
  })

  afterEach(async () => {
    if (module) {
      await module.close()
    }
  })

  describe('createCity', () => {
    it('should create and return a new city', async () => {
      const createCityData = {
        citySlug: 'test-integration-city',
        city: 'Test Integration City',
        url: 'https://example.com/test-city.jpg',
        alt: 'Test city image',
      }

      const expectedCity = {
        citySlug: 'test-integration-city',
        city: 'Test Integration City',
        url: 'https://example.com/test-city.jpg',
        alt: 'Test city image',
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-01T00:00:00.000Z'),
      }

      const createCitySpy = jest
        .spyOn(citiesService, 'createCity')
        .mockResolvedValue(expectedCity)

      const result = await controller.createCity(createCityData)

      expect(result).toEqual(expectedCity)
      expect(createCitySpy).toHaveBeenCalledWith(createCityData)
    })
  })

  describe('updateCity', () => {
    it('should update and return the updated city', async () => {
      const citySlug = 'existing-city'
      const updateCityData = {
        city: 'Updated City Name',
        url: 'https://example.com/updated-city.jpg',
        alt: 'Updated city image',
      }

      const expectedUpdatedCity = {
        citySlug,
        city: 'Updated City Name',
        url: 'https://example.com/updated-city.jpg',
        alt: 'Updated city image',
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-02T00:00:00.000Z'),
      }

      const updateCitySpy = jest
        .spyOn(citiesService, 'updateCity')
        .mockResolvedValue(expectedUpdatedCity)

      const result = await controller.updateCity(citySlug, updateCityData)

      expect(result).toEqual(expectedUpdatedCity)
      expect(updateCitySpy).toHaveBeenCalledWith(citySlug, updateCityData)
    })
  })
})
