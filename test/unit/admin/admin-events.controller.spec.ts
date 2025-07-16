import { Test, TestingModule } from '@nestjs/testing'

import { AdminEventsController } from '../../../src/admin/admin-events.controller'
import { EventsService } from '../../../src/events/events.service'
import { AdminRoleGuard } from '../../../src/guards/admin-role.guard'
import { JwtAuthGuard } from '../../../src/guards/jwt-auth.guard'
import {
  CreateEvent,
  UpdateEvent,
  Event,
} from '../../../src/schemas/event.schema'

describe('AdminEventsController', () => {
  let controller: AdminEventsController

  const mockCreateEvent = jest.fn()
  const mockUpdateEvent = jest.fn()

  const mockEventsService = {
    createEvent: mockCreateEvent,
    updateEvent: mockUpdateEvent,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminEventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminRoleGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<AdminEventsController>(AdminEventsController)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createEvent', () => {
    it('should create and return a new event', async () => {
      const createEventData: CreateEvent = {
        name: 'Test Event',
        slug: 'test-event',
        city: 'Test City',
        citySlug: 'test-city',
        location: 'Test Location',
        date: new Date('2024-01-01T19:00:00.000Z'),
        organizerName: 'Test Organizer',
        imageUrl: 'https://example.com/test-event.jpg',
        alt: 'Test event image',
        description: 'Test event description',
        price: 2500,
      }

      const expectedEvent: Event = {
        id: 1,
        name: 'Test Event',
        slug: 'test-event',
        city: 'Test City',
        citySlug: 'test-city',
        location: 'Test Location',
        date: new Date('2024-01-01T19:00:00.000Z'),
        organizerName: 'Test Organizer',
        imageUrl: 'https://example.com/test-event.jpg',
        alt: 'Test event image',
        description: 'Test event description',
        price: 2500,
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-01T00:00:00.000Z'),
      }

      mockCreateEvent.mockResolvedValue(expectedEvent)

      const result = await controller.createEvent(createEventData)

      expect(mockCreateEvent).toHaveBeenCalledWith(createEventData)
      expect(result).toEqual(expectedEvent)
    })
  })

  describe('updateEvent', () => {
    it('should update and return the updated event', async () => {
      const eventId = 1
      const updateEventData: UpdateEvent = {
        name: 'Updated Event Name',
        price: 3000,
      }

      const expectedEvent: Event = {
        id: 1,
        name: 'Updated Event Name',
        slug: 'test-event',
        city: 'Test City',
        citySlug: 'test-city',
        location: 'Test Location',
        date: new Date('2024-01-01T19:00:00.000Z'),
        organizerName: 'Test Organizer',
        imageUrl: 'https://example.com/test-event.jpg',
        alt: 'Test event image',
        description: 'Test event description',
        price: 3000,
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-01T00:00:00.000Z'),
      }

      mockUpdateEvent.mockResolvedValue(expectedEvent)

      const result = await controller.updateEvent(eventId, updateEventData)

      expect(mockUpdateEvent).toHaveBeenCalledWith(eventId, updateEventData)
      expect(result).toEqual(expectedEvent)
    })
  })
})
