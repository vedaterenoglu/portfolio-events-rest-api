import { Test, TestingModule } from '@nestjs/testing'

import { AdminEventsController } from '../../../src/admin/admin-events.controller'
import { EventsService } from '../../../src/events/events.service'
import { AdminRoleGuard } from '../../../src/guards/admin-role.guard'
import { JwtAuthGuard } from '../../../src/guards/jwt-auth.guard'

describe('AdminEventsController Integration', () => {
  let controller: AdminEventsController
  let eventsService: EventsService
  let module: TestingModule

  beforeEach(async () => {
    const mockEventsService = {
      createEvent: jest.fn(),
    }

    module = await Test.createTestingModule({
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
    eventsService = module.get<EventsService>(EventsService)
  })

  afterEach(async () => {
    if (module) {
      await module.close()
    }
  })

  describe('createEvent', () => {
    it('should create and return a new event', async () => {
      const createEventData = {
        name: 'Test Integration Event',
        slug: 'test-integration-event',
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

      const expectedEvent = {
        id: 1,
        name: 'Test Integration Event',
        slug: 'test-integration-event',
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

      const createEventSpy = jest
        .spyOn(eventsService, 'createEvent')
        .mockResolvedValue(expectedEvent)

      const result = await controller.createEvent(createEventData)

      expect(result).toEqual(expectedEvent)
      expect(createEventSpy).toHaveBeenCalledWith(createEventData)
    })
  })
})