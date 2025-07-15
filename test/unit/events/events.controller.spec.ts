import { Test, TestingModule } from '@nestjs/testing'

import { EventsController } from '../../../src/events/events.controller'
import {
  EventsService,
  EventsResponse,
} from '../../../src/events/events.service'
import { TEvent } from '../../../src/generated/client'

describe('EventsController', () => {
  let controller: EventsController
  let eventsService: jest.Mocked<EventsService>

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

  const mockEventsResponse: EventsResponse = {
    count: 2,
    events: mockEvents,
    pagination: {
      limit: 50,
      offset: 0,
      hasMore: false,
    },
  }

  beforeEach(async () => {
    const mockEventsService = {
      getAllEvents: jest.fn(),
      getEventBySlug: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile()

    controller = module.get<EventsController>(EventsController)
    eventsService = module.get<EventsService>(
      EventsService,
    ) as jest.Mocked<EventsService>
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getAllEvents', () => {
    it('should return events response with count and events array', async () => {
      const getAllEventsSpy = jest
        .spyOn(eventsService, 'getAllEvents')
        .mockResolvedValue(mockEventsResponse)

      const result = await controller.getAllEvents()

      expect(getAllEventsSpy).toHaveBeenCalledWith(undefined)
      expect(result).toEqual(mockEventsResponse)

      getAllEventsSpy.mockRestore()
    })
  })

  describe('getEventBySlug', () => {
    it('should return a single event when found', async () => {
      const mockEvent = mockEvents[0]!
      const getEventBySlugSpy = jest
        .spyOn(eventsService, 'getEventBySlug')
        .mockResolvedValue(mockEvent)

      const result = await controller.getEventBySlug('test-event-1')

      expect(getEventBySlugSpy).toHaveBeenCalledWith('test-event-1')
      expect(result).toEqual(mockEvent)

      getEventBySlugSpy.mockRestore()
    })
  })
})
