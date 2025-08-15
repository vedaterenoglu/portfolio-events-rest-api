import { Test, TestingModule } from '@nestjs/testing'

import { DatabaseService } from '../../../src/database/database.service'
import {
  EventsService,
  EventsResponse,
} from '../../../src/events/events.service'
import { TEvent } from '../../../src/generated/client'
import { UpdateEvent } from '../../../src/schemas/event.schema'

describe('EventsService Integration', () => {
  let service: EventsService
  let databaseService: DatabaseService
  let module: TestingModule

  const mockEvents: TEvent[] = [
    {
      id: 1,
      name: 'Test Event 1',
      slug: 'test-event-1',
      city: 'Test City 1',
      citySlug: 'test-city-1',
      location: 'Test Location 1',
      date: new Date('2023-12-01T19:00:00.000Z'),
      organizerName: 'Test Organizer 1',
      imageUrl: 'https://example.com/event1.jpg',
      alt: 'Test event 1 image',
      description: 'Test event 1 description',
      price: 2500,
      createdAt: new Date('2023-01-01T00:00:00.000Z'),
      updatedAt: new Date('2023-01-01T00:00:00.000Z'),
    },
    {
      id: 2,
      name: 'Test Event 2',
      slug: 'test-event-2',
      city: 'Test City 2',
      citySlug: 'test-city-2',
      location: 'Test Location 2',
      date: new Date('2023-12-02T20:00:00.000Z'),
      organizerName: 'Test Organizer 2',
      imageUrl: 'https://example.com/event2.jpg',
      alt: 'Test event 2 image',
      description: 'Test event 2 description',
      price: 3000,
      createdAt: new Date('2023-01-02T00:00:00.000Z'),
      updatedAt: new Date('2023-01-02T00:00:00.000Z'),
    },
  ]

  beforeEach(async () => {
    const mockDatabaseService = {
      tEvent: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    }

    module = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile()

    service = module.get<EventsService>(EventsService)
    databaseService = module.get<DatabaseService>(DatabaseService)
  })

  afterEach(async () => {
    if (module) {
      await module.close()
    }
  })

  describe('getAllEvents', () => {
    it('should return events with pagination when no search query provided', async () => {
      const findManySpy = jest
        .spyOn(databaseService.tEvent, 'findMany')
        .mockResolvedValue(mockEvents)
      const countSpy = jest
        .spyOn(databaseService.tEvent, 'count')
        .mockResolvedValue(2)

      const result: EventsResponse = await service.getAllEvents()

      expect(findManySpy).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 50,
        orderBy: { date: 'desc' },
      })
      expect(countSpy).toHaveBeenCalledWith({ where: {} })
      expect(result).toEqual({
        count: 2,
        events: mockEvents,
        pagination: {
          limit: 50,
          offset: 0,
          hasMore: false,
        },
      })
    })

    it('should return events with search query and custom pagination', async () => {
      const query = {
        search: 'test',
        limit: 10,
        offset: 5,
        orderBy: 'name' as const,
        sortOrder: 'asc' as const,
      }

      const searchCondition = {
        OR: [
          { name: { contains: 'test', mode: 'insensitive' as const } },
          { description: { contains: 'test', mode: 'insensitive' as const } },
          { city: { contains: 'test', mode: 'insensitive' as const } },
          { citySlug: { contains: 'test', mode: 'insensitive' as const } },
          { location: { contains: 'test', mode: 'insensitive' as const } },
          { organizerName: { contains: 'test', mode: 'insensitive' as const } },
        ],
      }

      const findManySpy = jest
        .spyOn(databaseService.tEvent, 'findMany')
        .mockResolvedValue([mockEvents[0]!])
      const countSpy = jest
        .spyOn(databaseService.tEvent, 'count')
        .mockResolvedValue(1)

      const result: EventsResponse = await service.getAllEvents(query)

      expect(findManySpy).toHaveBeenCalledWith({
        where: searchCondition,
        skip: 5,
        take: 10,
        orderBy: { name: 'asc' },
      })
      expect(countSpy).toHaveBeenCalledWith({ where: searchCondition })
      expect(result).toEqual({
        count: 1,
        events: [mockEvents[0]!],
        pagination: {
          limit: 10,
          offset: 5,
          hasMore: false,
        },
      })
    })
  })

  describe('createEvent', () => {
    it('should create a new event with next available ID when events exist', async () => {
      const createEventData = {
        name: 'New Integration Event',
        slug: 'new-integration-event',
        city: 'New City',
        citySlug: 'new-city',
        location: 'New Location',
        date: new Date('2024-01-01T19:00:00.000Z'),
        organizerName: 'New Organizer',
        imageUrl: 'https://example.com/new-event.jpg',
        alt: 'New event image',
        description: 'New event description',
        price: 5000,
      }

      const mockCreatedEvent = {
        id: 3,
        ...createEventData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const findFirstSpy = jest
        .spyOn(databaseService.tEvent, 'findFirst')
        .mockResolvedValue({ id: 2 } as TEvent)
      const createSpy = jest
        .spyOn(databaseService.tEvent, 'create')
        .mockResolvedValue(mockCreatedEvent as TEvent)

      const result = await service.createEvent(createEventData)

      expect(findFirstSpy).toHaveBeenCalledWith({
        orderBy: { id: 'desc' },
        select: { id: true },
      })
      expect(createSpy).toHaveBeenCalledWith({
        data: {
          ...createEventData,
          id: 3,
        },
      })
      expect(result).toEqual(mockCreatedEvent)
    })

    it('should create first event with ID 1 when no events exist', async () => {
      const createEventData = {
        name: 'First Integration Event',
        slug: 'first-integration-event',
        city: 'First City',
        citySlug: 'first-city',
        location: 'First Location',
        date: new Date('2024-02-01T19:00:00.000Z'),
        organizerName: 'First Organizer',
        imageUrl: 'https://example.com/first-event.jpg',
        alt: 'First event image',
        description: 'First event description',
        price: 1000,
      }

      const mockCreatedEvent = {
        id: 1,
        ...createEventData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const findFirstSpy = jest
        .spyOn(databaseService.tEvent, 'findFirst')
        .mockResolvedValue(null)
      const createSpy = jest
        .spyOn(databaseService.tEvent, 'create')
        .mockResolvedValue(mockCreatedEvent as TEvent)

      const result = await service.createEvent(createEventData)

      expect(findFirstSpy).toHaveBeenCalledWith({
        orderBy: { id: 'desc' },
        select: { id: true },
      })
      expect(createSpy).toHaveBeenCalledWith({
        data: {
          ...createEventData,
          id: 1,
        },
      })
      expect(result).toEqual(mockCreatedEvent)
    })
  })

  describe('getEventBySlug', () => {
    it('should return event when found by slug', async () => {
      const mockEvent = mockEvents[0]!
      const findUniqueSpy = jest
        .spyOn(databaseService.tEvent, 'findUnique')
        .mockResolvedValue(mockEvent)

      const result = await service.getEventBySlug('test-event-1')

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { slug: 'test-event-1' },
      })
      expect(result).toEqual(mockEvent)
    })

    it('should throw NotFoundException when event not found', async () => {
      const findUniqueSpy = jest
        .spyOn(databaseService.tEvent, 'findUnique')
        .mockResolvedValue(null)

      await expect(service.getEventBySlug('non-existent-slug')).rejects.toThrow(
        "Event with slug 'non-existent-slug' not found",
      )

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { slug: 'non-existent-slug' },
      })
    })
  })

  describe('updateEvent', () => {
    it('should update and return updated event when event exists', async () => {
      const eventId = 1
      const updateEventData: UpdateEvent = {
        name: 'Updated Integration Event',
        price: 3500,
      }

      const existingEvent = mockEvents[0]!
      const updatedEvent = {
        ...existingEvent,
        name: 'Updated Integration Event',
        price: 3500,
        updatedAt: new Date(),
      }

      const findUniqueSpy = jest
        .spyOn(databaseService.tEvent, 'findUnique')
        .mockResolvedValue(existingEvent)
      const updateSpy = jest
        .spyOn(databaseService.tEvent, 'update')
        .mockResolvedValue(updatedEvent as TEvent)

      const result = await service.updateEvent(eventId, updateEventData)

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: eventId },
      })
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: eventId },
        data: updateEventData,
      })
      expect(result).toEqual(updatedEvent)
    })

    it('should throw NotFoundException when event not found', async () => {
      const eventId = 999
      const updateEventData: UpdateEvent = {
        name: 'Updated Event Name',
      }

      const findUniqueSpy = jest
        .spyOn(databaseService.tEvent, 'findUnique')
        .mockResolvedValue(null)

      await expect(
        service.updateEvent(eventId, updateEventData),
      ).rejects.toThrow(`Event with ID ${eventId} not found`)

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: eventId },
      })
    })
  })

  describe('deleteEvent', () => {
    it('should delete an event when it exists', async () => {
      const eventId = 1
      const existingEvent = mockEvents[0]!

      const findUniqueSpy = jest
        .spyOn(databaseService.tEvent, 'findUnique')
        .mockResolvedValue(existingEvent)
      const deleteSpy = jest
        .spyOn(databaseService.tEvent, 'delete')
        .mockResolvedValue(existingEvent)

      await service.deleteEvent(eventId)

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: eventId },
      })
      expect(deleteSpy).toHaveBeenCalledWith({
        where: { id: eventId },
      })
    })

    it('should throw NotFoundException when event not found', async () => {
      const eventId = 999

      const findUniqueSpy = jest
        .spyOn(databaseService.tEvent, 'findUnique')
        .mockResolvedValue(null)

      await expect(service.deleteEvent(eventId)).rejects.toThrow(
        `Event with ID ${eventId} not found`,
      )

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: eventId },
      })
    })
  })
})
