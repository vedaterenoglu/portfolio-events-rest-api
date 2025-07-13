import { Test, TestingModule } from '@nestjs/testing'

import { CitiesService } from '../../../src/cities/cities.service'
import { DatabaseService } from '../../../src/database/database.service'
import { TCity } from '../../../src/generated/client'

interface MockDatabaseService {
  tCity: {
    findMany: jest.MockedFunction<() => Promise<TCity[]>>
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

      const result = await service.getAllCities()

      expect(mockDatabaseService.tCity.findMany).toHaveBeenCalledWith({
        orderBy: { city: 'asc' },
      })
      expect(result).toEqual({
        count: 2,
        cities: mockCities,
      })
    })

    it('should return empty cities with zero count when database returns empty array', async () => {
      mockDatabaseService.tCity.findMany.mockResolvedValue([])

      const result = await service.getAllCities()

      expect(mockDatabaseService.tCity.findMany).toHaveBeenCalledWith({
        orderBy: { city: 'asc' },
      })
      expect(result).toEqual({
        count: 0,
        cities: [],
      })
    })
  })
})
