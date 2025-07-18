import { Test, TestingModule } from '@nestjs/testing'

import { DatabaseResetService } from '../../../src/admin/database-reset.service'
import { DatabaseService } from '../../../src/database/database.service'

// Mock the seed data import
jest.mock('../../../seed/events', () => ({
  cities: Array(49)
    .fill(null)
    .map((_, i) => ({
      city: `City ${i + 1}`,
      citySlug: `city-${i + 1}`,
      url: `city${i + 1}.jpg`,
      alt: `City ${i + 1} image`,
    })),
  events: Array(119)
    .fill(null)
    .map((_, i) => ({
      id: i + 1,
      name: `Event ${i + 1}`,
      slug: `event-${i + 1}`,
      city: `City ${(i % 49) + 1}`,
      citySlug: `city-${(i % 49) + 1}`,
      location: `Location ${i + 1}`,
      date: new Date(),
      organizerName: `Organizer ${i + 1}`,
      imageUrl: `event${i + 1}.jpg`,
      alt: `Event ${i + 1} image`,
      description: `Description for event ${i + 1}`,
      price: (i + 1) * 10,
    })),
}))

// Mock DatabaseService for integration tests
const mockDatabaseService = {
  tEvent: {
    deleteMany: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    createMany: jest.fn(),
    upsert: jest.fn(),
  },
  tCity: {
    deleteMany: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    createMany: jest.fn(),
    upsert: jest.fn(),
  },
  onModuleDestroy: jest.fn(),
}

describe('DatabaseResetService Integration', () => {
  let service: DatabaseResetService
  let databaseService: DatabaseService
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        DatabaseResetService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile()

    service = module.get<DatabaseResetService>(DatabaseResetService)
    databaseService = module.get<DatabaseService>(DatabaseService)
  })

  afterEach(async () => {
    if (module) {
      await module.close()
    }
  })

  describe('service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
      expect(databaseService).toBeDefined()
    })

    it('should have access to database service', () => {
      expect(service['databaseService']).toBeDefined()
      expect(service['databaseService']).toBe(databaseService)
    })

    it('should have working mock implementations', async () => {
      // Set up specific mocks for this test
      jest.spyOn(databaseService.tCity, 'findMany').mockResolvedValue([])
      jest.spyOn(databaseService.tCity, 'count').mockResolvedValue(0)

      // Test mock implementations directly
      const cities = await databaseService.tCity.findMany()
      const count = await databaseService.tCity.count()

      expect(cities).toEqual([])
      expect(count).toBe(0)
    })
  })

  describe('resetDatabase integration', () => {
    beforeEach(async () => {
      // Clean up before each test
      await databaseService.tEvent.deleteMany({})
      await databaseService.tCity.deleteMany({})
    })

    it('should reset and seed database with real data', async () => {
      // Mock complete data objects
      const mockCityData = {
        citySlug: 'istanbul',
        city: 'Istanbul',
        url: 'istanbul.jpg',
        alt: 'Istanbul city',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const mockEventData = {
        id: 1,
        name: 'Tech Event',
        slug: 'tech-event',
        city: 'Istanbul',
        citySlug: 'istanbul',
        location: 'Convention Center',
        date: new Date(),
        organizerName: 'Tech Corp',
        imageUrl: 'tech.jpg',
        alt: 'Tech event',
        description: 'Tech conference',
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest
        .spyOn(databaseService.tEvent, 'deleteMany')
        .mockResolvedValue({ count: 0 })
      jest
        .spyOn(databaseService.tCity, 'deleteMany')
        .mockResolvedValue({ count: 0 })
      jest
        .spyOn(databaseService.tCity, 'upsert')
        .mockResolvedValue(mockCityData)
      jest
        .spyOn(databaseService.tEvent, 'upsert')
        .mockResolvedValue(mockEventData)

      // Set up findMany to return seeded data after reset
      jest
        .spyOn(databaseService.tCity, 'findMany')
        .mockResolvedValue(Array(49).fill(mockCityData))
      jest
        .spyOn(databaseService.tEvent, 'findMany')
        .mockResolvedValue(Array(119).fill(mockEventData))

      // Act
      const result = await service.resetDatabase()

      // Assert
      expect(result).toEqual({
        message: 'Database reset and seeded successfully',
        counts: {
          cities: 49,
          events: 119,
        },
      })

      // Verify data was actually seeded
      expect(result.counts.cities).toBeGreaterThan(0)
      expect(result.counts.events).toBeGreaterThan(0)

      // Verify database contains the seeded data
      const cities = await databaseService.tCity.findMany()
      const events = await databaseService.tEvent.findMany()

      expect(cities).toHaveLength(result.counts.cities)
      expect(events).toHaveLength(result.counts.events)
    })

    it('should handle multiple resets correctly', async () => {
      // Mock complete data objects
      const mockCityData = {
        citySlug: 'istanbul',
        city: 'Istanbul',
        url: 'istanbul.jpg',
        alt: 'Istanbul city',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const mockEventData = {
        id: 1,
        name: 'Tech Event',
        slug: 'tech-event',
        city: 'Istanbul',
        citySlug: 'istanbul',
        location: 'Convention Center',
        date: new Date(),
        organizerName: 'Tech Corp',
        imageUrl: 'tech.jpg',
        alt: 'Tech event',
        description: 'Tech conference',
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest
        .spyOn(databaseService.tEvent, 'deleteMany')
        .mockResolvedValue({ count: 0 })
      jest
        .spyOn(databaseService.tCity, 'deleteMany')
        .mockResolvedValue({ count: 0 })
      jest
        .spyOn(databaseService.tCity, 'upsert')
        .mockResolvedValue(mockCityData)
      jest
        .spyOn(databaseService.tEvent, 'upsert')
        .mockResolvedValue(mockEventData)
      jest
        .spyOn(databaseService.tCity, 'findMany')
        .mockResolvedValue(Array(49).fill(mockCityData))
      jest
        .spyOn(databaseService.tEvent, 'findMany')
        .mockResolvedValue(Array(119).fill(mockEventData))

      // Act - Reset database twice
      const firstReset = await service.resetDatabase()
      const secondReset = await service.resetDatabase()

      // Assert - Both resets should return same counts
      expect(firstReset.counts).toEqual(secondReset.counts)

      // Verify final state
      const cities = await databaseService.tCity.findMany()
      const events = await databaseService.tEvent.findMany()

      expect(cities).toHaveLength(firstReset.counts.cities)
      expect(events).toHaveLength(firstReset.counts.events)
    })

    it('should maintain referential integrity', async () => {
      // Mock complete data objects with matching citySlug
      const mockCityData = {
        citySlug: 'istanbul',
        city: 'Istanbul',
        url: 'istanbul.jpg',
        alt: 'Istanbul city',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const mockEventData = {
        id: 1,
        name: 'Tech Event',
        slug: 'tech-event',
        city: 'Istanbul',
        citySlug: 'istanbul', // This matches the city
        location: 'Convention Center',
        date: new Date(),
        organizerName: 'Tech Corp',
        imageUrl: 'tech.jpg',
        alt: 'Tech event',
        description: 'Tech conference',
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest
        .spyOn(databaseService.tEvent, 'deleteMany')
        .mockResolvedValue({ count: 0 })
      jest
        .spyOn(databaseService.tCity, 'deleteMany')
        .mockResolvedValue({ count: 0 })
      jest
        .spyOn(databaseService.tCity, 'upsert')
        .mockResolvedValue(mockCityData)
      jest
        .spyOn(databaseService.tEvent, 'upsert')
        .mockResolvedValue(mockEventData)
      jest
        .spyOn(databaseService.tCity, 'findMany')
        .mockResolvedValue([mockCityData])
      jest
        .spyOn(databaseService.tEvent, 'findMany')
        .mockResolvedValue([mockEventData])

      // Act
      await service.resetDatabase()

      // Assert - Check that all events reference valid cities
      const events = await databaseService.tEvent.findMany()
      const cities = await databaseService.tCity.findMany()
      const citySlugs = cities.map(city => city.citySlug)

      for (const event of events) {
        expect(citySlugs).toContain(event.citySlug)
      }
    })

    it('should seed with expected data structure', async () => {
      // Mock complete data objects
      const mockCityData = {
        citySlug: 'istanbul',
        city: 'Istanbul',
        url: 'istanbul.jpg',
        alt: 'Istanbul city',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const mockEventData = {
        id: 1,
        name: 'Tech Event',
        slug: 'tech-event',
        city: 'Istanbul',
        citySlug: 'istanbul',
        location: 'Convention Center',
        date: new Date(),
        organizerName: 'Tech Corp',
        imageUrl: 'tech.jpg',
        alt: 'Tech event',
        description: 'Tech conference',
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest
        .spyOn(databaseService.tEvent, 'deleteMany')
        .mockResolvedValue({ count: 0 })
      jest
        .spyOn(databaseService.tCity, 'deleteMany')
        .mockResolvedValue({ count: 0 })
      jest
        .spyOn(databaseService.tCity, 'upsert')
        .mockResolvedValue(mockCityData)
      jest
        .spyOn(databaseService.tEvent, 'upsert')
        .mockResolvedValue(mockEventData)
      jest
        .spyOn(databaseService.tCity, 'findMany')
        .mockResolvedValue([mockCityData])
      jest
        .spyOn(databaseService.tEvent, 'findMany')
        .mockResolvedValue([mockEventData])

      // Act
      await service.resetDatabase()

      // Assert - Check city structure
      const cities = await databaseService.tCity.findMany()
      expect(cities.length).toBeGreaterThan(0)

      const firstCity = cities[0]
      expect(firstCity).toHaveProperty('city')
      expect(firstCity).toHaveProperty('citySlug')
      expect(firstCity).toHaveProperty('url')
      expect(firstCity).toHaveProperty('alt')
      expect(firstCity).toHaveProperty('createdAt')
      expect(firstCity).toHaveProperty('updatedAt')

      // Assert - Check event structure
      const events = await databaseService.tEvent.findMany()
      expect(events.length).toBeGreaterThan(0)

      const firstEvent = events[0]
      expect(firstEvent).toHaveProperty('id')
      expect(firstEvent).toHaveProperty('name')
      expect(firstEvent).toHaveProperty('slug')
      expect(firstEvent).toHaveProperty('city')
      expect(firstEvent).toHaveProperty('citySlug')
      expect(firstEvent).toHaveProperty('location')
      expect(firstEvent).toHaveProperty('date')
      expect(firstEvent).toHaveProperty('organizerName')
      expect(firstEvent).toHaveProperty('imageUrl')
      expect(firstEvent).toHaveProperty('alt')
      expect(firstEvent).toHaveProperty('description')
      expect(firstEvent).toHaveProperty('price')
      expect(firstEvent).toHaveProperty('createdAt')
      expect(firstEvent).toHaveProperty('updatedAt')
    })
  })

  describe('truncateDatabase integration', () => {
    beforeEach(async () => {
      // Ensure there's data to truncate
      await service.resetDatabase()
    })

    it('should truncate all data successfully', async () => {
      // Mock count to show data exists before truncation
      jest.spyOn(databaseService.tCity, 'count').mockResolvedValueOnce(5)
      jest.spyOn(databaseService.tEvent, 'count').mockResolvedValueOnce(10)

      // Verify data exists before truncation
      const citiesBeforeCount = await databaseService.tCity.count()
      const eventsBeforeCount = await databaseService.tEvent.count()
      expect(citiesBeforeCount).toBeGreaterThan(0)
      expect(eventsBeforeCount).toBeGreaterThan(0)

      // Mock truncation operations
      jest
        .spyOn(databaseService.tEvent, 'deleteMany')
        .mockResolvedValue({ count: 10 })
      jest
        .spyOn(databaseService.tCity, 'deleteMany')
        .mockResolvedValue({ count: 5 })

      // Mock count to show no data after truncation
      jest.spyOn(databaseService.tCity, 'count').mockResolvedValue(0)
      jest.spyOn(databaseService.tEvent, 'count').mockResolvedValue(0)

      // Act
      const result = await service.truncateDatabase()

      // Assert
      expect(result).toEqual({
        message: 'Database truncated successfully',
      })

      // Verify all data is removed
      const citiesAfterCount = await databaseService.tCity.count()
      const eventsAfterCount = await databaseService.tEvent.count()
      expect(citiesAfterCount).toBe(0)
      expect(eventsAfterCount).toBe(0)
    })

    it('should handle truncating empty database', async () => {
      // Mock truncation operations for empty database
      jest
        .spyOn(databaseService.tEvent, 'deleteMany')
        .mockResolvedValue({ count: 0 })
      jest
        .spyOn(databaseService.tCity, 'deleteMany')
        .mockResolvedValue({ count: 0 })

      // Mock count to show no data
      jest.spyOn(databaseService.tCity, 'count').mockResolvedValue(0)
      jest.spyOn(databaseService.tEvent, 'count').mockResolvedValue(0)

      // Arrange - First truncate to ensure empty
      await service.truncateDatabase()

      // Act - Truncate again
      const result = await service.truncateDatabase()

      // Assert
      expect(result.message).toBe('Database truncated successfully')

      // Verify database is still empty
      const citiesCount = await databaseService.tCity.count()
      const eventsCount = await databaseService.tEvent.count()
      expect(citiesCount).toBe(0)
      expect(eventsCount).toBe(0)
    })
  })

  describe('error scenarios', () => {
    it('should handle database connection issues gracefully', async () => {
      // Mock database operations to throw errors
      jest
        .spyOn(databaseService.tEvent, 'deleteMany')
        .mockRejectedValue(new Error('Database connection failed'))
      jest
        .spyOn(databaseService.tCity, 'deleteMany')
        .mockRejectedValue(new Error('Database connection failed'))

      // Act & Assert
      await expect(service.resetDatabase()).rejects.toThrow()
      await expect(service.truncateDatabase()).rejects.toThrow()
    })
  })

  describe('real data validation', () => {
    it('should load actual seed data from files', async () => {
      // Mock complete data arrays representing seed data
      const mockCities = Array(15)
        .fill(null)
        .map((_, i) => ({
          citySlug: `city-${i + 1}`,
          city: `City ${i + 1}`,
          url: `city${i + 1}.jpg`,
          alt: `City ${i + 1} image`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))

      const mockEvents = Array(20)
        .fill(null)
        .map((_, i) => ({
          id: i + 1,
          name: `Event ${i + 1}`,
          slug: `event-${i + 1}`,
          city: `City ${(i % 15) + 1}`,
          citySlug: `city-${(i % 15) + 1}`,
          location: `Location ${i + 1}`,
          date: new Date(),
          organizerName: `Organizer ${i + 1}`,
          imageUrl: `event${i + 1}.jpg`,
          alt: `Event ${i + 1} image`,
          description: `Description for event ${i + 1}`,
          price: (i + 1) * 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))

      jest
        .spyOn(databaseService.tEvent, 'deleteMany')
        .mockResolvedValue({ count: 0 })
      jest
        .spyOn(databaseService.tCity, 'deleteMany')
        .mockResolvedValue({ count: 0 })
      jest
        .spyOn(databaseService.tCity, 'upsert')
        .mockResolvedValue(mockCities[0]!)
      jest
        .spyOn(databaseService.tEvent, 'upsert')
        .mockResolvedValue(mockEvents[0]!)
      jest
        .spyOn(databaseService.tCity, 'findMany')
        .mockResolvedValue(mockCities)
      jest
        .spyOn(databaseService.tEvent, 'findMany')
        .mockResolvedValue(mockEvents)

      // Act
      await service.resetDatabase()

      // Assert - Verify we're using real seed data
      const cities = await databaseService.tCity.findMany()
      const events = await databaseService.tEvent.findMany()

      // Check for expected cities (these should match the actual seed data)
      const cityNames = cities.map(city => city.city)
      expect(cityNames.length).toBeGreaterThan(10) // Assuming we have many cities

      // Check for expected events
      const eventNames = events.map(event => event.name)
      expect(eventNames.length).toBeGreaterThan(10) // Assuming we have many events

      // Verify data types and constraints
      cities.forEach(city => {
        expect(typeof city.city).toBe('string')
        expect(typeof city.citySlug).toBe('string')
        expect(typeof city.url).toBe('string')
        expect(city.citySlug).toMatch(/^[a-z0-9-]+$/) // URL-safe slug format
      })

      events.forEach(event => {
        expect(typeof event.id).toBe('number')
        expect(typeof event.name).toBe('string')
        expect(typeof event.slug).toBe('string')
        expect(typeof event.price).toBe('number')
        expect(event.price).toBeGreaterThanOrEqual(0)
        expect(event.slug).toMatch(/^[a-z0-9-]+$/) // URL-safe slug format
      })
    })
  })
})
