import { Test, TestingModule } from '@nestjs/testing'

import { AdminCitiesController } from '../../../src/admin/admin-cities.controller'
import { CitiesService } from '../../../src/cities/cities.service'
import { AdminRoleGuard } from '../../../src/guards/admin-role.guard'
import { JwtAuthGuard } from '../../../src/guards/jwt-auth.guard'
import { CreateCity, UpdateCity, City } from '../../../src/schemas/city.schema'

describe('AdminCitiesController', () => {
  let controller: AdminCitiesController

  const mockCreateCity = jest.fn()
  const mockUpdateCity = jest.fn()

  const mockCitiesService = {
    createCity: mockCreateCity,
    updateCity: mockUpdateCity,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createCity', () => {
    it('should create and return a new city', async () => {
      const createCityData: CreateCity = {
        citySlug: 'test-city',
        city: 'Test City',
        url: 'https://example.com/test-city.jpg',
        alt: 'Test city image',
      }

      const expectedCity: City = {
        citySlug: 'test-city',
        city: 'Test City',
        url: 'https://example.com/test-city.jpg',
        alt: 'Test city image',
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-01T00:00:00.000Z'),
      }

      mockCreateCity.mockResolvedValue(expectedCity)

      const result = await controller.createCity(createCityData)

      expect(mockCreateCity).toHaveBeenCalledWith(createCityData)
      expect(result).toEqual(expectedCity)
    })
  })

  describe('updateCity', () => {
    it('should update and return the updated city', async () => {
      const citySlug = 'existing-city'
      const updateCityData: UpdateCity = {
        city: 'Updated City Name',
        url: 'https://example.com/updated-city.jpg',
        alt: 'Updated city image',
      }

      const expectedUpdatedCity: City = {
        citySlug,
        city: 'Updated City Name',
        url: 'https://example.com/updated-city.jpg',
        alt: 'Updated city image',
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-02T00:00:00.000Z'),
      }

      mockUpdateCity.mockResolvedValue(expectedUpdatedCity)

      const result = await controller.updateCity(citySlug, updateCityData)

      expect(mockUpdateCity).toHaveBeenCalledWith(citySlug, updateCityData)
      expect(result).toEqual(expectedUpdatedCity)
    })
  })
})
