# Testing Guide

## 🧪 Testing Strategy

This project implements comprehensive testing with **100% coverage** across three testing layers:

- **Unit Tests**: Test individual components and services
- **Integration Tests**: Test module interactions and database operations
- **E2E Tests**: Test complete API workflows and user scenarios

## 🚀 Quick Test Commands

### Basic Testing
```bash
# Run all test types
npm run test:unit:coverage
npm run test:integration:coverage
npm run test:e2e:coverage

# Run individual test types
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e           # E2E tests only
```

### Development Testing
```bash
# Watch mode for unit tests
npm run test:unit:watch

# Debug mode
npm run test:debug

# Run tests for specific file
npm test -- --testNamePattern="EventsController"
```

## 📊 Coverage Standards

### Target Coverage
- **Statements**: 100%
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%

### Current Coverage
- **Unit Tests**: 100% across all metrics
- **Integration Tests**: 100% across all metrics
- **E2E Tests**: 100% across all metrics

## 📁 Test Structure

### Directory Organization
```
test/
├── unit/                    # Unit tests
│   ├── admin/
│   ├── auth/
│   ├── cities/
│   ├── events/
│   └── guards/
├── integration/             # Integration tests
│   ├── controllers/
│   ├── services/
│   └── interceptors/
├── e2e/                     # End-to-end tests
│   ├── event-schema.e2e.spec.ts
│   ├── logger-service.e2e.spec.ts
│   └── schemas-index.e2e.spec.ts
└── setup/                   # Test configuration
    ├── e2e-setup.ts
    └── test-utils.ts
```

### Test File Naming
- Unit tests: `*.spec.ts`
- Integration tests: `*.integration.spec.ts`
- E2E tests: `*.e2e.spec.ts`

## 🔧 Test Configuration

### Jest Configuration Files
- `jest-unit.json`: Unit test configuration
- `jest-integration.json`: Integration test configuration
- `jest-e2e.json`: E2E test configuration

### Environment Setup
```bash
# Test environment variables
NODE_ENV=test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio_events_test
CLERK_PUBLISHABLE_KEY=pk_test_mock_key
CLERK_SECRET_KEY=sk_test_mock_key
```

## 🏗️ Unit Testing

### Example Unit Test
```typescript
// src/events/events.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { EventsController } from './events.controller'
import { EventsService } from './events.service'

describe('EventsController', () => {
  let controller: EventsController
  let service: EventsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: {
            findAll: jest.fn(),
            findBySlug: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<EventsController>(EventsController)
    service = module.get<EventsService>(EventsService)
  })

  it('should return all events', async () => {
    const mockEvents = [{ id: 1, name: 'Test Event' }]
    jest.spyOn(service, 'findAll').mockResolvedValue(mockEvents)

    const result = await controller.findAll({})
    expect(result).toEqual(mockEvents)
    expect(service.findAll).toHaveBeenCalled()
  })
})
```

### Unit Test Best Practices
- Mock all external dependencies
- Test both success and error scenarios
- Use descriptive test names
- Group related tests with `describe` blocks
- Set up clean test data for each test

## 🔗 Integration Testing

### Example Integration Test
```typescript
// test/integration/controllers/events.controller.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { EventsModule } from '../../../src/events/events.module'
import { DatabaseModule } from '../../../src/database/database.module'

describe('EventsController (Integration)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EventsModule, DatabaseModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('should integrate with database correctly', async () => {
    // Test database interactions
    const eventsService = app.get(EventsService)
    const result = await eventsService.findAll({})
    expect(result).toBeDefined()
  })

  afterAll(async () => {
    await app.close()
  })
})
```

### Integration Test Features
- Real database connections
- Module interaction testing
- Service layer integration
- Database transaction testing

## 🌐 E2E Testing

### Example E2E Test
```typescript
// test/e2e/events.e2e.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'

describe('EventsController (E2E)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/api/events (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/events')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined()
        expect(Array.isArray(res.body.data)).toBe(true)
      })
  })

  afterEach(async () => {
    await app.close()
  })
})
```

### E2E Test Features
- Full application bootstrap
- HTTP request/response testing
- Authentication flow testing
- Database state validation
- Error handling verification

## 🛠️ Testing Tools & Utilities

### Test Utilities
```typescript
// test/setup/test-utils.ts
export const createMockEvent = (overrides = {}) => ({
  id: 1,
  name: 'Test Event',
  slug: 'test-event',
  city: 'Austin',
  ...overrides,
})

export const createMockJwtToken = (role = 'admin') => {
  // Mock JWT token generation
  return `mock-jwt-token-${role}`
}
```

### Database Testing
- **Test Database**: Separate PostgreSQL database for testing
- **Data Seeding**: Automated test data setup
- **Cleanup**: Automatic database cleanup between tests
- **Isolation**: Each test runs in isolation

## 📈 Performance Testing

### Test Performance Metrics
```bash
# Run tests with performance monitoring
npm run test:unit -- --verbose --detectOpenHandles

# Memory usage analysis
npm run test:unit -- --logHeapUsage
```

### Optimization Techniques
- **Test Isolation**: Minimize test interdependencies
- **Mock Strategy**: Use mocks to reduce external dependencies
- **Selective Testing**: Run only affected tests during development
- **Efficient Setup**: Minimize database operations in tests

## 🔍 Test Coverage Analysis

### Generate Coverage Reports
```bash
# Generate HTML coverage report
npm run test:unit:coverage
open coverage/unit/lcov-report/index.html

# Generate coverage for all test types
npm run test:unit:coverage && npm run test:integration:coverage && npm run test:e2e:coverage
```

### Coverage Metrics
- **Line Coverage**: Lines executed during tests
- **Branch Coverage**: Code branches tested
- **Function Coverage**: Functions called during tests
- **Statement Coverage**: Statements executed during tests

## 🚨 Debugging Tests

### Debug Configuration
```bash
# Debug specific test
npm run test:debug -- --testNamePattern="EventsController"

# Debug with VS Code
# Use F5 with Jest debug configuration
```

### Common Debugging Tips
- Use `console.log` for debugging (temporarily)
- Add `--verbose` flag for detailed output
- Use `--detectOpenHandles` to find hanging resources
- Check async/await patterns in tests
- Verify mock implementations

## 📋 Test Checklist

Before committing code, ensure:
- [ ] All tests pass (unit, integration, and E2E)
- [ ] Coverage meets 100% target
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No linting errors (`npm run lint`)
- [ ] Database cleanup works correctly
- [ ] Authentication tests cover all scenarios
- [ ] Error handling is properly tested

## 🤝 Contributing to Tests

### Adding New Tests
1. Follow existing test patterns
2. Use appropriate test type (unit/integration/e2e)
3. Include both positive and negative test cases
4. Mock external dependencies appropriately
5. Ensure test isolation

### Test Review Guidelines
- Tests should be readable and maintainable
- Use descriptive test names
- Include setup and teardown as needed
- Verify test coverage meets standards
- Check for potential flaky tests