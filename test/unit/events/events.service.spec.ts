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
  })
})
