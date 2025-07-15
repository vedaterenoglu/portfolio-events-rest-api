import { Test, TestingModule } from '@nestjs/testing'

import { CitiesService } from '../../../src/cities/cities.service'
import { DatabaseService } from '../../../src/database/database.service'

describe('CitiesService Integration', () => {
  let service: CitiesService
  let databaseService: DatabaseService
  let module: TestingModule

  beforeEach(async () => {
    const mockDatabaseService = {
      tCity: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    }

    module = await Test.createTestingModule({
      providers: [
        CitiesService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile()

    service = module.get<CitiesService>(CitiesService)
    databaseService = module.get<DatabaseService>(DatabaseService)
  })

  afterEach(async () => {
    if (module) {
      await module.close()
    }
  })

  describe('getAllCities', () => {
    it('should return cities with count from database', async () => {
      const mockCities = [
        {
          id: '1',
          citySlug: 'istanbul',
          city: 'Istanbul',
          url: 'test.jpg',
          alt: 'test',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const findManySpy = jest
        .spyOn(databaseService.tCity, 'findMany')
        .mockResolvedValue(mockCities)

      const countSpy = jest
        .spyOn(databaseService.tCity, 'count')
        .mockResolvedValue(mockCities.length)

      const result = await service.getAllCities()

      expect(result).toEqual({ count: mockCities.length, cities: mockCities })
      expect(findManySpy).toHaveBeenCalledWith({
        where: {},
        orderBy: { city: 'asc' },
        take: 50,
        skip: 0,
      })
      expect(countSpy).toHaveBeenCalledWith({ where: {} })
    })
  })

  describe('createCity', () => {
    it('should create and return a new city', async () => {
      const createCityData = {
        citySlug: 'ankara',
        city: 'Ankara',
        url: 'ankara.jpg',
        alt: 'Ankara image',
      }

      const mockCreatedCity = {
        id: '2',
        ...createCityData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const createSpy = jest
        .spyOn(databaseService.tCity, 'create')
        .mockResolvedValue(mockCreatedCity)

      const result = await service.createCity(createCityData)

      expect(result).toEqual(mockCreatedCity)
      expect(createSpy).toHaveBeenCalledWith({
        data: createCityData,
      })
    })
  })

  describe('updateCity', () => {
    it('should update and return the updated city', async () => {
      const citySlug = 'istanbul'
      const updateCityData = {
        city: 'Istanbul Updated',
        url: 'istanbul-updated.jpg',
        alt: 'Updated Istanbul image',
      }

      const mockUpdatedCity = {
        id: '1',
        citySlug,
        ...updateCityData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updateSpy = jest
        .spyOn(databaseService.tCity, 'update')
        .mockResolvedValue(mockUpdatedCity)

      const result = await service.updateCity(citySlug, updateCityData)

      expect(result).toEqual(mockUpdatedCity)
      expect(updateSpy).toHaveBeenCalledWith({
        where: { citySlug },
        data: updateCityData,
      })
    })
  })
})
