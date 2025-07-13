import 'reflect-metadata'

// Global test setup for integration tests
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()
  jest.resetAllMocks()
  jest.restoreAllMocks()
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
