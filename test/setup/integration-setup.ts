import 'reflect-metadata';

// Global test setup for integration tests
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

beforeAll(async () => {
  // Setup for integration tests
  console.log('Starting integration test suite...');
});

afterAll(async () => {
  // Cleanup after all integration tests
  console.log('Integration test suite completed.');
});

// Mock process.env for tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Global test timeout for integration tests
jest.setTimeout(30000);