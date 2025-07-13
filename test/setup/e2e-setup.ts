import 'reflect-metadata'

// Global test setup for e2e tests
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()
  jest.resetAllMocks()
  jest.restoreAllMocks()
})

beforeAll(() => {
  // Setup for e2e tests
  // E2E test suite initialization
})

afterAll(() => {
  // Cleanup after all e2e tests
  // E2E test suite cleanup completed
})

// Mock process.env for tests
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

// Global test timeout for e2e tests
jest.setTimeout(60000)
