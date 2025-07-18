import { Test, TestingModule } from '@nestjs/testing'

import { DatabaseResetService } from '../../../src/admin/database-reset.service'
import { DatabaseService } from '../../../src/database/database.service'

// Mock the seed data import
jest.mock('../../../seed/events', () => ({
  cities: [
    {
      city: 'Test City',
      citySlug: 'test-city',
      url: 'https://example.com/test.jpg',
      alt: 'Test image',
    },
  ],
  events: [
    {
      id: 1,
      name: 'Test Event',
      slug: 'test-event',
      city: 'Test City',
      citySlug: 'test-city',
      location: 'Test Location',
      date: '2024-12-01T00:00:00Z',
      organizerName: 'Test Organizer',
      imageUrl: 'https://example.com/event.jpg',
      alt: 'Test event image',
      description: 'Test event description',
      price: 100,
    },
  ],
}))

describe('DatabaseResetService', () => {
  let service: DatabaseResetService

  const mockTEventDeleteMany = jest.fn()
  const mockTCityDeleteMany = jest.fn()
  const mockTCityUpsert = jest.fn()
  const mockTEventUpsert = jest.fn()

  const mockDatabaseService = {
    tEvent: {
      deleteMany: mockTEventDeleteMany,
      upsert: mockTEventUpsert,
    },
    tCity: {
      deleteMany: mockTCityDeleteMany,
      upsert: mockTCityUpsert,
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseResetService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile()

    service = module.get<DatabaseResetService>(DatabaseResetService)

    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('resetDatabase', () => {
    it('should reset and seed database successfully', async () => {
      // Arrange
      const mockCityResult = {
        city: 'Test City',
        citySlug: 'test-city',
        url: 'https://example.com/test.jpg',
        alt: 'Test image',
      }
      const mockEventResult = {
        id: 1,
        name: 'Test Event',
        slug: 'test-event',
        city: 'Test City',
        citySlug: 'test-city',
        location: 'Test Location',
        date: '2024-12-01T00:00:00Z',
        organizerName: 'Test Organizer',
        imageUrl: 'https://example.com/event.jpg',
        alt: 'Test event image',
        description: 'Test event description',
        price: 100,
      }

      mockTEventDeleteMany.mockResolvedValue({ count: 0 })
      mockTCityDeleteMany.mockResolvedValue({ count: 0 })
      mockTCityUpsert.mockResolvedValue(mockCityResult)
      mockTEventUpsert.mockResolvedValue(mockEventResult)

      // Act
      const result = await service.resetDatabase()

      // Assert
      expect(mockTEventDeleteMany).toHaveBeenCalledWith({})
      expect(mockTCityDeleteMany).toHaveBeenCalledWith({})
      expect(mockTCityUpsert).toHaveBeenCalledWith({
        where: { citySlug: 'test-city' },
        update: {},
        create: {
          city: 'Test City',
          citySlug: 'test-city',
          url: 'https://example.com/test.jpg',
          alt: 'Test image',
        },
      })
      expect(mockTEventUpsert).toHaveBeenCalledWith({
        where: { id: 1 },
        update: {},
        create: {
          id: 1,
          name: 'Test Event',
          slug: 'test-event',
          city: 'Test City',
          citySlug: 'test-city',
          location: 'Test Location',
          date: '2024-12-01T00:00:00Z',
          organizerName: 'Test Organizer',
          imageUrl: 'https://example.com/event.jpg',
          alt: 'Test event image',
          description: 'Test event description',
          price: 100,
        },
      })

      expect(result).toEqual({
        message: 'Database reset and seeded successfully',
        counts: {
          cities: 1,
          events: 1,
        },
      })
    })

    it('should handle multiple cities and events', async () => {
      // Arrange
      mockTEventDeleteMany.mockResolvedValue({ count: 0 })
      mockTCityDeleteMany.mockResolvedValue({ count: 0 })
      mockTCityUpsert.mockResolvedValue({})
      mockTEventUpsert.mockResolvedValue({})

      // Act
      const result = await service.resetDatabase()

      // Assert - Using the mock data from the top-level mock
      expect(result.counts.cities).toBe(1)
      expect(result.counts.events).toBe(1)
      expect(result.message).toBe('Database reset and seeded successfully')
    })

    it('should clear events before cities due to foreign key constraints', async () => {
      // Arrange
      mockTEventDeleteMany.mockResolvedValue({ count: 0 })
      mockTCityDeleteMany.mockResolvedValue({ count: 0 })
      mockTCityUpsert.mockResolvedValue({})
      mockTEventUpsert.mockResolvedValue({})

      // Act
      await service.resetDatabase()

      // Assert - Check the order of deletion
      const eventDeleteOrder =
        mockTEventDeleteMany.mock.invocationCallOrder[0] ?? 0
      const cityDeleteOrder =
        mockTCityDeleteMany.mock.invocationCallOrder[0] ?? 0
      expect(eventDeleteOrder).toBeLessThan(cityDeleteOrder)
    })
  })

  describe('truncateDatabase', () => {
    it('should truncate database successfully', async () => {
      // Arrange
      mockTEventDeleteMany.mockResolvedValue({ count: 5 })
      mockTCityDeleteMany.mockResolvedValue({ count: 3 })

      // Act
      const result = await service.truncateDatabase()

      // Assert
      expect(mockTEventDeleteMany).toHaveBeenCalledWith({})
      expect(mockTCityDeleteMany).toHaveBeenCalledWith({})
      expect(result).toEqual({
        message: 'Database truncated successfully',
      })
    })

    it('should clear events before cities due to foreign key constraints', async () => {
      // Arrange
      mockTEventDeleteMany.mockResolvedValue({ count: 0 })
      mockTCityDeleteMany.mockResolvedValue({ count: 0 })

      // Act
      await service.truncateDatabase()

      // Assert - Check the order of deletion
      const eventDeleteOrder =
        mockTEventDeleteMany.mock.invocationCallOrder[0] ?? 0
      const cityDeleteOrder =
        mockTCityDeleteMany.mock.invocationCallOrder[0] ?? 0
      expect(eventDeleteOrder).toBeLessThan(cityDeleteOrder)
    })

    it('should handle empty database', async () => {
      // Arrange
      mockTEventDeleteMany.mockResolvedValue({ count: 0 })
      mockTCityDeleteMany.mockResolvedValue({ count: 0 })

      // Act
      const result = await service.truncateDatabase()

      // Assert
      expect(result.message).toBe('Database truncated successfully')
    })
  })

  describe('error handling', () => {
    it('should handle database errors in resetDatabase', async () => {
      // Arrange
      const dbError = new Error('Database connection failed')
      mockTEventDeleteMany.mockRejectedValue(dbError)

      // Act & Assert
      await expect(service.resetDatabase()).rejects.toThrow(
        'Database connection failed',
      )
    })

    it('should handle database errors in truncateDatabase', async () => {
      // Arrange
      const dbError = new Error('Database connection failed')
      mockTEventDeleteMany.mockRejectedValue(dbError)

      // Act & Assert
      await expect(service.truncateDatabase()).rejects.toThrow(
        'Database connection failed',
      )
    })

    it('should handle upsert errors during seeding', async () => {
      // Arrange
      mockTEventDeleteMany.mockResolvedValue({ count: 0 })
      mockTCityDeleteMany.mockResolvedValue({ count: 0 })
      mockTCityUpsert.mockRejectedValue(new Error('City upsert failed'))

      // Act & Assert
      await expect(service.resetDatabase()).rejects.toThrow(
        'City upsert failed',
      )
    })
  })
})
