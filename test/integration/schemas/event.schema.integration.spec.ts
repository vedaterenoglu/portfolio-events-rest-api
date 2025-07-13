import { EventSchema } from '../../../src/schemas/event.schema'

describe('EventSchema Integration', () => {
  describe('EventSchema validation', () => {
    it('should validate a valid event object', () => {
      const validEvent = {
        id: 1,
        name: 'Tech Conference 2024',
        slug: 'tech-conference-2024',
        city: 'Istanbul',
        location: 'Istanbul Convention Center',
        date: new Date('2024-12-15T10:00:00Z'),
        organizerName: 'Tech Events Inc',
        imageUrl: 'https://example.com/event.jpg',
        alt: 'Tech conference event image',
        description: 'Annual technology conference',
        price: 299,
        citySlug: 'istanbul',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = EventSchema.parse(validEvent)

      expect(result).toEqual(validEvent)
    })
  })
})
