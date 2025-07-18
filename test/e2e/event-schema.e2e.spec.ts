import {
  EventSchema,
  CreateEventSchema,
  UpdateEventSchema,
} from '../../src/schemas/event.schema'

import { e2eTestHelper } from './helpers/e2e-test-helper'

describe('Event Schema Validation (E2E)', () => {
  beforeAll(async () => {
    await e2eTestHelper.setup()
  })

  afterAll(async () => {
    await e2eTestHelper.teardown()
  })

  describe('EventSchema validation', () => {
    it('should validate and transform valid event data', () => {
      const validEventData = {
        id: 1,
        name: 'Test Event',
        slug: 'test-event',
        city: 'Test City',
        citySlug: 'test-city',
        location: 'Test Location',
        date: new Date(),
        organizerName: 'Test Organizer',
        imageUrl: 'https://example.com/image.jpg',
        alt: 'Test image',
        description: 'Test description',
        price: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = EventSchema.parse(validEventData)
      expect(result).toBeDefined()
      expect(result.name).toBe('Test Event')
      expect(result.slug).toBe('test-event')
      expect(result.price).toBe(1000)
    })

    it('should sanitize HTML in name field', () => {
      const eventDataWithHtml = {
        id: 1,
        name: '<script>alert("xss")</script>Clean Event Name',
        slug: 'test-event',
        city: 'Test City',
        citySlug: 'test-city',
        location: 'Test Location',
        date: new Date(),
        organizerName: 'Test Organizer',
        imageUrl: 'https://example.com/image.jpg',
        alt: 'Test image',
        description: 'Test description',
        price: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = EventSchema.parse(eventDataWithHtml)
      expect(result.name).toBe('Clean Event Name')
      expect(result.name).not.toContain('<script>')
    })

    it('should sanitize rich text in description field', () => {
      const eventDataWithRichText = {
        id: 1,
        name: 'Test Event',
        slug: 'test-event',
        city: 'Test City',
        citySlug: 'test-city',
        location: 'Test Location',
        date: new Date(),
        organizerName: 'Test Organizer',
        imageUrl: 'https://example.com/image.jpg',
        alt: 'Test image',
        description:
          '<p>Valid <strong>HTML</strong></p><script>alert("xss")</script>',
        price: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = EventSchema.parse(eventDataWithRichText)
      expect(result.description).toContain('<p>')
      expect(result.description).toContain('<strong>')
      expect(result.description).not.toContain('<script>')
    })

    it('should validate slug format', () => {
      const eventDataWithInvalidSlug = {
        id: 1,
        name: 'Test Event',
        slug: 'invalid slug with spaces!',
        city: 'Test City',
        citySlug: 'test-city',
        location: 'Test Location',
        date: new Date(),
        organizerName: 'Test Organizer',
        imageUrl: 'https://example.com/image.jpg',
        alt: 'Test image',
        description: 'Test description',
        price: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => EventSchema.parse(eventDataWithInvalidSlug)).toThrow()
    })

    it('should validate URL format', () => {
      const eventDataWithInvalidUrl = {
        id: 1,
        name: 'Test Event',
        slug: 'test-event',
        city: 'Test City',
        citySlug: 'test-city',
        location: 'Test Location',
        date: new Date(),
        organizerName: 'Test Organizer',
        imageUrl: 'not-a-valid-url',
        alt: 'Test image',
        description: 'Test description',
        price: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => EventSchema.parse(eventDataWithInvalidUrl)).toThrow()
    })

    it('should validate price constraints', () => {
      const eventDataWithNegativePrice = {
        id: 1,
        name: 'Test Event',
        slug: 'test-event',
        city: 'Test City',
        citySlug: 'test-city',
        location: 'Test Location',
        date: new Date(),
        organizerName: 'Test Organizer',
        imageUrl: 'https://example.com/image.jpg',
        alt: 'Test image',
        description: 'Test description',
        price: -100,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => EventSchema.parse(eventDataWithNegativePrice)).toThrow()
    })
  })

  describe('CreateEventSchema validation', () => {
    it('should validate create event data without id, createdAt, updatedAt', () => {
      const createEventData = {
        name: 'New Event',
        slug: 'new-event',
        city: 'New City',
        citySlug: 'new-city',
        location: 'New Location',
        date: new Date(),
        organizerName: 'New Organizer',
        imageUrl: 'https://example.com/new-image.jpg',
        alt: 'New image',
        description: 'New description',
        price: 2000,
      }

      const result = CreateEventSchema.parse(createEventData)
      expect(result).toBeDefined()
      expect(result.name).toBe('New Event')
      expect(result.price).toBe(2000)
      expect(result).not.toHaveProperty('id')
      expect(result).not.toHaveProperty('createdAt')
      expect(result).not.toHaveProperty('updatedAt')
    })

    it('should validate required fields', () => {
      const incompleteData = {
        name: 'Event Name',
        // Missing required fields
      }

      expect(() => CreateEventSchema.parse(incompleteData)).toThrow()
    })

    it('should validate field length limits', () => {
      const dataWithTooLongName = {
        name: 'A'.repeat(201), // Exceeds 200 char limit
        slug: 'test-event',
        city: 'Test City',
        citySlug: 'test-city',
        location: 'Test Location',
        date: new Date(),
        organizerName: 'Test Organizer',
        imageUrl: 'https://example.com/image.jpg',
        alt: 'Test image',
        description: 'Test description',
        price: 1000,
      }

      expect(() => CreateEventSchema.parse(dataWithTooLongName)).toThrow()
    })
  })

  describe('UpdateEventSchema validation', () => {
    it('should validate partial update data', () => {
      const updateData = {
        name: 'Updated Event Name',
        price: 1500,
      }

      const result = UpdateEventSchema.parse(updateData)
      expect(result).toBeDefined()
      expect(result.name).toBe('Updated Event Name')
      expect(result.price).toBe(1500)
    })

    it('should allow empty update object', () => {
      const emptyUpdate = {}

      const result = UpdateEventSchema.parse(emptyUpdate)
      expect(result).toBeDefined()
      expect(Object.keys(result)).toHaveLength(0)
    })

    it('should validate individual fields when provided', () => {
      const updateWithInvalidPrice = {
        price: -50,
      }

      expect(() => UpdateEventSchema.parse(updateWithInvalidPrice)).toThrow()
    })

    it('should sanitize fields when provided', () => {
      const updateWithHtml = {
        name: '<script>alert("xss")</script>Updated Name',
        description:
          '<p>Updated <strong>description</strong></p><script>alert("xss")</script>',
      }

      const result = UpdateEventSchema.parse(updateWithHtml)
      expect(result.name).toBe('Updated Name')
      expect(result.name).not.toContain('<script>')
      expect(result.description).toContain('<p>')
      expect(result.description).not.toContain('<script>')
    })
  })

  describe('Field validation edge cases', () => {
    it('should handle minimum length validation', () => {
      const dataWithEmptyFields = {
        name: '',
        slug: 'test-event',
        city: 'Test City',
        citySlug: 'test-city',
        location: 'Test Location',
        date: new Date(),
        organizerName: 'Test Organizer',
        imageUrl: 'https://example.com/image.jpg',
        alt: 'Test image',
        description: 'Test description',
        price: 1000,
      }

      expect(() => CreateEventSchema.parse(dataWithEmptyFields)).toThrow()
    })

    it('should handle maximum length validation for all fields', () => {
      const dataWithTooLongFields = {
        name: 'A'.repeat(201),
        slug: 'a'.repeat(101),
        city: 'A'.repeat(101),
        citySlug: 'a'.repeat(51),
        location: 'A'.repeat(301),
        date: new Date(),
        organizerName: 'A'.repeat(151),
        imageUrl: 'https://example.com/' + 'a'.repeat(500),
        alt: 'A'.repeat(201),
        description: 'A'.repeat(2001),
        price: 1000,
      }

      expect(() => CreateEventSchema.parse(dataWithTooLongFields)).toThrow()
    })

    it('should validate price as integer', () => {
      const dataWithFloatPrice = {
        name: 'Test Event',
        slug: 'test-event',
        city: 'Test City',
        citySlug: 'test-city',
        location: 'Test Location',
        date: new Date(),
        organizerName: 'Test Organizer',
        imageUrl: 'https://example.com/image.jpg',
        alt: 'Test image',
        description: 'Test description',
        price: 19.99,
      }

      expect(() => CreateEventSchema.parse(dataWithFloatPrice)).toThrow()
    })
  })
})
