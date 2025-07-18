import 'reflect-metadata'
import { config } from 'dotenv'

// Load environment variables from .env.test file
config({ path: '.env.test' })

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
// Use the actual database URL from .env file for e2e tests
// Note: This will use the production database with test data isolation

// Global test timeout for e2e tests
jest.setTimeout(60000)
