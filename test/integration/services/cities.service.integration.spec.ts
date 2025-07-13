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

      const result = await service.getAllCities()

      expect(result).toEqual({ count: mockCities.length, cities: mockCities })
      expect(findManySpy).toHaveBeenCalledWith({
        orderBy: { city: 'asc' },
      })
    })
  })
})
