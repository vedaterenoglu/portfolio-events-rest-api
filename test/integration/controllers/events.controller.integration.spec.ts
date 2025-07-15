import { Test, TestingModule } from '@nestjs/testing'

import { EventsController } from '../../../src/events/events.controller'
import {
  EventsService,
  EventsResponse,
} from '../../../src/events/events.service'

describe('EventsController Integration', () => {
  let controller: EventsController
  let eventsService: EventsService
  let module: TestingModule

  beforeEach(async () => {
    const mockEventsService = {
      getAllEvents: jest.fn(),
      getEventBySlug: jest.fn(),
    }

    module = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile()

    controller = module.get<EventsController>(EventsController)
    eventsService = module.get<EventsService>(EventsService)
  })

  afterEach(async () => {
    if (module) {
      await module.close()
    }
  })

  describe('getAllEvents', () => {
    it('should return events response from service', async () => {
      const mockResponse: EventsResponse = {
        count: 2,
        events: [
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
        ],
        pagination: {
          limit: 50,
          offset: 0,
          hasMore: false,
        },
      }

      const getAllEventsSpy = jest
        .spyOn(eventsService, 'getAllEvents')
        .mockResolvedValue(mockResponse)

      const result = await controller.getAllEvents()

      expect(result).toEqual(mockResponse)
      expect(getAllEventsSpy).toHaveBeenCalledWith(undefined)
    })

    it('should pass query parameters to service', async () => {
      const mockQuery = {
        search: 'test',
        limit: 10,
        offset: 5,
        orderBy: 'name' as const,
        sortOrder: 'asc' as const,
      }

      const mockResponse: EventsResponse = {
        count: 1,
        events: [],
        pagination: {
          limit: 10,
          offset: 5,
          hasMore: false,
        },
      }

      const getAllEventsSpy = jest
        .spyOn(eventsService, 'getAllEvents')
        .mockResolvedValue(mockResponse)

      const result = await controller.getAllEvents(mockQuery)

      expect(result).toEqual(mockResponse)
      expect(getAllEventsSpy).toHaveBeenCalledWith(mockQuery)
    })
  })

  describe('getEventBySlug', () => {
    it('should return a single event from service', async () => {
      const mockEvent = {
        id: 1,
        name: 'Test Event',
        slug: 'test-event',
        city: 'Test City',
        citySlug: 'test-city',
        location: 'Test Location',
        date: new Date('2023-12-01T19:00:00.000Z'),
        organizerName: 'Test Organizer',
        imageUrl: 'https://example.com/event.jpg',
        alt: 'Test event image',
        description: 'Test event description',
        price: 2500,
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-01T00:00:00.000Z'),
      }

      const getEventBySlugSpy = jest
        .spyOn(eventsService, 'getEventBySlug')
        .mockResolvedValue(mockEvent)

      const result = await controller.getEventBySlug('test-event')

      expect(result).toEqual(mockEvent)
      expect(getEventBySlugSpy).toHaveBeenCalledWith('test-event')
    })
  })
})
