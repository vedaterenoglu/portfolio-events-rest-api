import { Test, TestingModule } from '@nestjs/testing'

import { CitiesService } from '../../../src/cities/cities.service'
import { DatabaseService } from '../../../src/database/database.service'
import { TCity } from '../../../src/generated/client'

interface MockDatabaseService {
  tCity: {
    findMany: jest.MockedFunction<() => Promise<TCity[]>>
    create: jest.MockedFunction<(args: { data: unknown }) => Promise<TCity>>
    update: jest.MockedFunction<
      (args: { where: { citySlug: string }; data: unknown }) => Promise<TCity>
    >
    count: jest.MockedFunction<() => Promise<number>>
  }
}

describe('CitiesService', () => {
  let service: CitiesService
  let mockDatabaseService: MockDatabaseService

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

  beforeEach(async () => {
    mockDatabaseService = {
      tCity: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitiesService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile()

    service = module.get<CitiesService>(CitiesService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getAllCities', () => {
    it('should return cities with count when database returns data', async () => {
      mockDatabaseService.tCity.findMany.mockResolvedValue(mockCities)
      mockDatabaseService.tCity.count.mockResolvedValue(2)

      const result = await service.getAllCities()

      expect(mockDatabaseService.tCity.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { city: 'asc' },
        take: 50,
        skip: 0,
      })
      expect(mockDatabaseService.tCity.count).toHaveBeenCalledWith({
        where: {},
      })
      expect(result).toEqual({
        count: 2,
        cities: mockCities,
      })
    })

    it('should return empty cities with zero count when database returns empty array', async () => {
      mockDatabaseService.tCity.findMany.mockResolvedValue([])
      mockDatabaseService.tCity.count.mockResolvedValue(0)

      const result = await service.getAllCities()

      expect(mockDatabaseService.tCity.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { city: 'asc' },
        take: 50,
        skip: 0,
      })
      expect(mockDatabaseService.tCity.count).toHaveBeenCalledWith({
        where: {},
      })
      expect(result).toEqual({
        count: 0,
        cities: [],
      })
    })
  })

  describe('createCity', () => {
    it('should create and return a new city', async () => {
      const createCityData = {
        citySlug: 'new-city',
        city: 'New City',
        url: 'https://example.com/new-city.jpg',
        alt: 'New city image',
      }

      const expectedCity: TCity = {
        ...createCityData,
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-01T00:00:00.000Z'),
      }

      mockDatabaseService.tCity.create.mockResolvedValue(expectedCity)

      const result = await service.createCity(createCityData)

      expect(mockDatabaseService.tCity.create).toHaveBeenCalledWith({
        data: createCityData,
      })
      expect(result).toEqual(expectedCity)
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

      const expectedUpdatedCity: TCity = {
        citySlug,
        city: 'Updated City Name',
        url: 'https://example.com/updated-city.jpg',
        alt: 'Updated city image',
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-02T00:00:00.000Z'),
      }

      mockDatabaseService.tCity.update.mockResolvedValue(expectedUpdatedCity)

      const result = await service.updateCity(citySlug, updateCityData)

      expect(mockDatabaseService.tCity.update).toHaveBeenCalledWith({
        where: { citySlug },
        data: updateCityData,
      })
      expect(result).toEqual(expectedUpdatedCity)
    })
  })
})
