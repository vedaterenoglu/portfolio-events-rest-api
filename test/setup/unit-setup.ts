import 'reflect-metadata'

// Global test setup for unit tests
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()
  jest.resetAllMocks()
  jest.restoreAllMocks()
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

// Global test timeout
jest.setTimeout(10000)
