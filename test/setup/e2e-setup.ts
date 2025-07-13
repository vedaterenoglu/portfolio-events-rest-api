import 'reflect-metadata';

// Global test setup for e2e tests
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

beforeAll(async () => {
  // Setup for e2e tests
  console.log('Starting e2e test suite...');
});

afterAll(async () => {
  // Cleanup after all e2e tests
  console.log('E2E test suite completed.');
});

// Mock process.env for tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Global test timeout for e2e tests
jest.setTimeout(60000);