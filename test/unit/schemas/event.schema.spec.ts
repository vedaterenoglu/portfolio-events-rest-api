import {
  EventSchema,
  CreateEventSchema,
  UpdateEventSchema,
} from '../../../src/schemas/event.schema'

describe('EventSchema', () => {
  it('should validate a valid event object', () => {
    const validEvent = {
      id: 1,
      name: 'Test Event',
      slug: 'test-event',
      city: 'Test City',
      citySlug: 'test-city',
      location: 'Test Location',
      date: new Date(),
      organizerName: 'Test Organizer',
      imageUrl: 'https://example.com/test-event.jpg',
      alt: 'Test event image',
      description: 'Test event description',
      price: 25,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = EventSchema.safeParse(validEvent)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validEvent)
    }
  })

  it('should validate CreateEventSchema without timestamp and id fields', () => {
    const createEventData = {
      name: 'New Event',
      slug: 'new-event',
      city: 'New City',
      citySlug: 'new-city',
      location: 'New Location',
      date: new Date(),
      organizerName: 'New Organizer',
      imageUrl: 'https://example.com/new-event.jpg',
      alt: 'New event image',
      description: 'New event description',
      price: 30,
    }

    const result = CreateEventSchema.safeParse(createEventData)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(createEventData)
    }
  })

  it('should validate UpdateEventSchema with partial fields', () => {
    const updateEventData = {
      name: 'Updated Event Name',
      price: 35,
    }

    const result = UpdateEventSchema.safeParse(updateEventData)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(updateEventData)
    }
  })
})
