import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { DatabaseService } from '../../../src/database/database.service'
import {
  EventsService,
  EventsResponse,
} from '../../../src/events/events.service'
import { TEvent } from '../../../src/generated/client'

describe('EventsService', () => {
  let service: EventsService
  let databaseService: jest.Mocked<DatabaseService>

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
        findUnique: jest.fn(),
        findFirst: jest
          .fn()
          .mockImplementation(
            (
              args:
                | { select?: { id?: boolean }; orderBy?: unknown }
                | undefined,
            ) => {
              if (args && args.select && args.select.id) {
                return Promise.resolve({ id: 2 })
              }
              return Promise.resolve(null)
            },
          ),
        create: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile()

    service = module.get<EventsService>(EventsService)
    databaseService = module.get<DatabaseService>(
      DatabaseService,
    ) as jest.Mocked<DatabaseService>
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getAllEvents', () => {
    it('should return events response with count and events array ordered by date', async () => {
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

      findManySpy.mockRestore()
      countSpy.mockRestore()
    })

    it('should return events response with search functionality', async () => {
      const findManySpy = jest
        .spyOn(databaseService.tEvent, 'findMany')
        .mockResolvedValue(mockEvents)
      const countSpy = jest
        .spyOn(databaseService.tEvent, 'count')
        .mockResolvedValue(2)

      const result: EventsResponse = await service.getAllEvents({
        search: 'test',
        limit: 10,
        offset: 5,
      })

      expect(findManySpy).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
            { city: { contains: 'test', mode: 'insensitive' } },
            { location: { contains: 'test', mode: 'insensitive' } },
            { organizerName: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        skip: 5,
        take: 10,
        orderBy: { date: 'desc' },
      })
      expect(countSpy).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
            { city: { contains: 'test', mode: 'insensitive' } },
            { location: { contains: 'test', mode: 'insensitive' } },
            { organizerName: { contains: 'test', mode: 'insensitive' } },
          ],
        },
      })
      expect(result).toEqual({
        count: 2,
        events: mockEvents,
        pagination: {
          limit: 10,
          offset: 5,
          hasMore: false,
        },
      })

      findManySpy.mockRestore()
      countSpy.mockRestore()
    })
  })

  describe('getEventBySlug', () => {
    it('should return a single event when found', async () => {
      const mockEvent = mockEvents[0]!
      const findUniqueSpy = jest
        .spyOn(databaseService.tEvent, 'findUnique')
        .mockResolvedValue(mockEvent)

      const result = await service.getEventBySlug('test-event-1')

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { slug: 'test-event-1' },
      })
      expect(result).toEqual(mockEvent)

      findUniqueSpy.mockRestore()
    })

    it('should throw NotFoundException when event not found', async () => {
      const findUniqueSpy = jest
        .spyOn(databaseService.tEvent, 'findUnique')
        .mockResolvedValue(null)

      await expect(service.getEventBySlug('non-existent-slug')).rejects.toThrow(
        new NotFoundException("Event with slug 'non-existent-slug' not found"),
      )

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { slug: 'non-existent-slug' },
      })

      findUniqueSpy.mockRestore()
    })
  })

  describe('createEvent', () => {
    it('should create a new event with auto-generated ID', async () => {
      const createEventData = {
        name: 'New Test Event',
        slug: 'new-test-event',
        city: 'New Test City',
        citySlug: 'new-test-city',
        location: 'New Test Location',
        date: new Date('2024-01-01T19:00:00.000Z'),
        organizerName: 'New Test Organizer',
        imageUrl: 'https://example.com/new-event.jpg',
        alt: 'New test event image',
        description: 'New test event description',
        price: 5000,
      }

      const mockCreatedEvent = {
        id: 3,
        ...createEventData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const findFirstSpy = jest.spyOn(databaseService.tEvent, 'findFirst')
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

      findFirstSpy.mockRestore()
      createSpy.mockRestore()
    })

    it('should create the first event with ID 1 when no existing events', async () => {
      const createEventData = {
        name: 'First Test Event',
        slug: 'first-test-event',
        city: 'First Test City',
        citySlug: 'first-test-city',
        location: 'First Test Location',
        date: new Date('2024-02-01T19:00:00.000Z'),
        organizerName: 'First Test Organizer',
        imageUrl: 'https://example.com/first-event.jpg',
        alt: 'First test event image',
        description: 'First test event description',
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

      findFirstSpy.mockRestore()
      createSpy.mockRestore()
    })
  })
})
