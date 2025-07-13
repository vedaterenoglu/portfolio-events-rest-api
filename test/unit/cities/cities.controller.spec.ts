import { Test, TestingModule } from '@nestjs/testing'

import { CitiesController } from '../../../src/cities/cities.controller'
import { CitiesService } from '../../../src/cities/cities.service'
import { TCity } from '../../../src/generated/client'

interface CitiesResponse {
  count: number
  cities: TCity[]
}

describe('CitiesController', () => {
  let controller: CitiesController
  let citiesService: jest.Mocked<CitiesService>

  const mockCities: TCity[] = [
    {
      citySlug: 'test-city-1',
      city: 'Test City 1',
      url: 'https://example.com/city1.jpg',
      alt: 'Test city 1 image',
      createdAt: new Date('2023-01-01T00:00:00.000Z'),
      updatedAt: new Date('2023-01-01T00:00:00.000Z'),
    },
    {
      citySlug: 'test-city-2',
      city: 'Test City 2',
      url: 'https://example.com/city2.jpg',
      alt: 'Test city 2 image',
      createdAt: new Date('2023-01-02T00:00:00.000Z'),
      updatedAt: new Date('2023-01-02T00:00:00.000Z'),
    },
  ]

  const mockCitiesResponse: CitiesResponse = {
    count: 2,
    cities: mockCities,
  }

  beforeEach(async () => {
    const mockCitiesService = {
      getAllCities: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitiesController],
      providers: [
        {
          provide: CitiesService,
          useValue: mockCitiesService,
        },
      ],
    }).compile()

    controller = module.get<CitiesController>(CitiesController)
    citiesService = module.get<CitiesService>(
      CitiesService,
    ) as jest.Mocked<CitiesService>
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getAllCities', () => {
    it('should return cities response with count and cities array', async () => {
      const getAllCitiesSpy = jest
        .spyOn(citiesService, 'getAllCities')
        .mockResolvedValue(mockCitiesResponse)

      const result = await controller.getAllCities()

      expect(getAllCitiesSpy).toHaveBeenCalledWith()
      expect(result).toEqual(mockCitiesResponse)

      getAllCitiesSpy.mockRestore()
    })
  })
})
