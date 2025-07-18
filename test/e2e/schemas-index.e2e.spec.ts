import {
  TCitySchema,
  TEventSchema,
  type TCity,
  type TEvent,
  TCityScalarFieldEnumSchema,
  TEventScalarFieldEnumSchema,
  SortOrderSchema,
  QueryModeSchema,
  TransactionIsolationLevelSchema,
} from '../../src/schemas/index'

import { e2eTestHelper } from './helpers/e2e-test-helper'

describe('Schemas Index Export (E2E)', () => {
  beforeAll(async () => {
    await e2eTestHelper.setup()
  })

  afterAll(async () => {
    await e2eTestHelper.teardown()
  })

  describe('Schema exports', () => {
    it('should export TCitySchema', () => {
      expect(TCitySchema).toBeDefined()
      expect(typeof TCitySchema.parse).toBe('function')
    })

    it('should export TEventSchema', () => {
      expect(TEventSchema).toBeDefined()
      expect(typeof TEventSchema.parse).toBe('function')
    })

    it('should export scalar field enum schemas', () => {
      expect(TCityScalarFieldEnumSchema).toBeDefined()
      expect(TEventScalarFieldEnumSchema).toBeDefined()
    })

    it('should export utility schemas', () => {
      expect(SortOrderSchema).toBeDefined()
      expect(QueryModeSchema).toBeDefined()
      expect(TransactionIsolationLevelSchema).toBeDefined()
    })

    it('should validate city data using exported schema', () => {
      const cityData = {
        citySlug: 'test-city',
        city: 'Test City',
        url: 'https://example.com/test.jpg',
        alt: 'Test city image',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = TCitySchema.parse(cityData)
      expect(result).toBeDefined()
      expect(result.citySlug).toBe('test-city')
      expect(result.city).toBe('Test City')
    })

    it('should validate event data using exported schema', () => {
      const eventData = {
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

      const result = TEventSchema.parse(eventData)
      expect(result).toBeDefined()
      expect(result.id).toBe(1)
      expect(result.name).toBe('Test Event')
      expect(result.price).toBe(1000)
    })

    it('should validate enum values', () => {
      const sortOrder = SortOrderSchema.parse('asc')
      expect(sortOrder).toBe('asc')

      const queryMode = QueryModeSchema.parse('default')
      expect(queryMode).toBe('default')

      expect(() => SortOrderSchema.parse('invalid')).toThrow()
    })

    it('should provide type definitions', () => {
      const city: TCity = {
        citySlug: 'test-city',
        city: 'Test City',
        url: 'https://example.com/test.jpg',
        alt: 'Test city image',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const event: TEvent = {
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

      expect(city).toBeDefined()
      expect(event).toBeDefined()
    })
  })
})
