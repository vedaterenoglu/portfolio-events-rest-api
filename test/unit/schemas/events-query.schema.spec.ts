import {
  EventsQuerySchema,
  EventsQuery,
} from '../../../src/schemas/events-query.schema'
import { sanitizePlainText } from '../../../src/utils/sanitization'

jest.mock('../../../src/utils/sanitization', () => ({
  sanitizePlainText: jest.fn(),
}))

describe('EventsQuerySchema', () => {
  const mockSanitizePlainText = sanitizePlainText as jest.MockedFunction<
    typeof sanitizePlainText
  >

  beforeEach(() => {
    mockSanitizePlainText.mockImplementation((value: string) => value)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('valid input parsing', () => {
    it('should parse valid query parameters with all fields', () => {
      const input = {
        search: 'test event',
        limit: '10',
        offset: '5',
        orderBy: 'name',
        sortOrder: 'asc',
      }

      const result: EventsQuery = EventsQuerySchema.parse(input)

      expect(mockSanitizePlainText).toHaveBeenCalledWith('test event', 50)
      expect(result).toEqual({
        search: 'test event',
        limit: 10,
        offset: 5,
        orderBy: 'name',
        sortOrder: 'asc',
      })
    })

    it('should apply default values when limit and offset are missing or invalid', () => {
      const input = {
        orderBy: 'date',
        sortOrder: 'desc',
      }

      const result: EventsQuery = EventsQuerySchema.parse(input)

      expect(result).toEqual({
        limit: 50,
        offset: 0,
        orderBy: 'date',
        sortOrder: 'desc',
      })
    })

    it('should use fallback value when limit is invalid non-numeric string', () => {
      const input = {
        limit: 'invalid',
        offset: '10',
        orderBy: 'name',
        sortOrder: 'asc',
      }

      const result: EventsQuery = EventsQuerySchema.parse(input)

      expect(result).toEqual({
        limit: 50,
        offset: 10,
        orderBy: 'name',
        sortOrder: 'asc',
      })
    })

    it('should apply all default values when parsing completely empty object', () => {
      const input = {}

      const result: EventsQuery = EventsQuerySchema.parse(input)

      expect(result).toEqual({
        search: undefined,
        limit: 50,
        offset: 0,
        orderBy: 'date',
        sortOrder: 'desc',
      })
    })
  })
})
