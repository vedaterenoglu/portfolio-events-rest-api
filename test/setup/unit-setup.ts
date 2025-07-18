import 'reflect-metadata'

// Global DOMPurify setup for unit tests
const mockSanitize = jest.fn(
  (
    input: string,
    options?: {
      ALLOWED_TAGS?: string[]
      ALLOWED_ATTR?: string[]
      KEEP_CONTENT?: boolean
    },
  ) => {
    if (options?.ALLOWED_TAGS?.length === 0) {
      // removeHTMLCompletely = true: remove HTML tags
      let result = input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      result = result.replace(/<[^>]*>/g, '')
      return result
    } else if (options?.ALLOWED_TAGS && options.ALLOWED_TAGS.length > 0) {
      // sanitizeRichText: filter tags based on allowedTags (with or without KEEP_CONTENT)
      let result = input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      const allowedTags = options.ALLOWED_TAGS
      result = result.replace(
        /<(\/?)([\w\d]+)([^>]*)>/g,
        (match, _slash, tag) => {
          if (allowedTags.includes(String(tag).toLowerCase())) {
            return match
          }
          return ''
        },
      )
      return result
    } else if (options?.KEEP_CONTENT === true) {
      // removeHTMLCompletely = false: preserve input
      return input
    }
    return input
  },
)

const mockDOMPurifyInstance = {
  sanitize: mockSanitize,
}

// Mock DOMPurify globally
jest.mock('dompurify', () => ({
  __esModule: true,
  default: jest.fn(() => mockDOMPurifyInstance),
}))

// Mock JSDOM globally
jest.mock('jsdom', () => ({
  JSDOM: jest.fn(() => ({
    window: {},
  })),
  DOMWindow: jest.fn(),
}))

// Global test setup for unit tests
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()
  jest.resetAllMocks()
  jest.restoreAllMocks()

  // Reset mock implementations
  mockSanitize.mockImplementation(
    (
      input: string,
      options?: {
        ALLOWED_TAGS?: string[]
        ALLOWED_ATTR?: string[]
        KEEP_CONTENT?: boolean
      },
    ) => {
      if (options?.KEEP_CONTENT === true) {
        // removeHTMLCompletely = false: preserve input
        return input
      } else if (options?.ALLOWED_TAGS?.length === 0) {
        // removeHTMLCompletely = true: remove HTML tags
        let result = input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        result = result.replace(/<[^>]*>/g, '')
        return result
      }
      return input
    },
  )
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock process.env for tests
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.CLERK_SECRET_KEY = 'sk_test_mock_key_for_unit_tests'
process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_mock_key_for_unit_tests'

// Global test timeout
jest.setTimeout(10000)
