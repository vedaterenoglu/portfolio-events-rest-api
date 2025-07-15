import { Test, TestingModule } from '@nestjs/testing'

import { CitiesController } from '../../../src/cities/cities.controller'
import { CitiesService } from '../../../src/cities/cities.service'

describe('CitiesController Integration', () => {
  let controller: CitiesController
  let citiesService: CitiesService
  let module: TestingModule

  beforeEach(async () => {
    const mockCitiesService = {
      getAllCities: jest.fn(),
    }

    module = await Test.createTestingModule({
      controllers: [CitiesController],
      providers: [
        {
          provide: CitiesService,
          useValue: mockCitiesService,
        },
      ],
    }).compile()

    controller = module.get<CitiesController>(CitiesController)
    citiesService = module.get<CitiesService>(CitiesService)
  })

  afterEach(async () => {
    if (module) {
      await module.close()
    }
  })

  describe('getAllCities', () => {
    it('should return cities response from service', async () => {
      const mockResponse = {
        count: 2,
        cities: [
          {
            id: '1',
            citySlug: 'istanbul',
            city: 'Istanbul',
            url: 'test1.jpg',
            alt: 'test1',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '2',
            citySlug: 'ankara',
            city: 'Ankara',
            url: 'test2.jpg',
            alt: 'test2',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }

      const getAllCitiesSpy = jest
        .spyOn(citiesService, 'getAllCities')
        .mockResolvedValue(mockResponse)

      const result = await controller.getAllCities({})

      expect(result).toEqual(mockResponse)
      expect(getAllCitiesSpy).toHaveBeenCalled()
    })
  })
})
