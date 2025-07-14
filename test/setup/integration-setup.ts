import 'reflect-metadata'

// Global DOMPurify setup for integration tests
const mockSanitize = jest.fn(
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
      let result = input.replace(/<script[^>]*>.*?<\/script>/gi, '')
      result = result.replace(/<[^>]*>/g, '')
      return result
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

// Global test setup for integration tests
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
        let result = input.replace(/<script[^>]*>.*?<\/script>/gi, '')
        result = result.replace(/<[^>]*>/g, '')
        return result
      }
      return input
    },
  )
})

beforeAll(async () => {
  // Setup for integration tests
  // Integration test suite initialization
})

afterAll(async () => {
  // Cleanup after all integration tests
  // Integration test suite cleanup completed
})

// Mock process.env for tests
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.PORT = '3001'

// Global test timeout for integration tests
jest.setTimeout(30000)
