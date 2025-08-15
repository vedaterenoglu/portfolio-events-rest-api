# 🤝 Contributing Guide

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)

## 📜 Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior
- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the project
- Show empathy towards other contributors

### Unacceptable Behavior
- Harassment or discriminatory language
- Personal attacks or trolling
- Publishing private information without consent
- Unprofessional conduct

## 🚀 Getting Started

### Prerequisites
1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/portfolio-events-rest-api.git
cd portfolio-events-rest-api
```

3. Add upstream remote:
```bash
git remote add upstream https://github.com/vedaterenoglu/portfolio-events-rest-api.git
```

4. Install dependencies:
```bash
npm install
```

5. Set up environment:
```bash
cp .env.example .env
# Configure your local environment variables
```

6. Set up database:
```bash
npx prisma generate
npx prisma db push
npm run seed
```

## 💻 Development Workflow

### Branch Strategy
```
main
  ├── feature/feature-name
  ├── fix/bug-description
  ├── docs/documentation-update
  └── refactor/component-name
```

### Creating a Feature Branch
```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### Development Cycle
1. **Write Tests First** (TDD approach)
2. **Implement Feature**
3. **Run Tests**
4. **Fix Linting Issues**
5. **Update Documentation**
6. **Commit Changes**

### Before Committing
```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Format code
npm run format

# Run tests
npm run test:unit:coverage
npm run test:integration:coverage
npm run test:e2e:coverage
```

## 📝 Code Standards

### TypeScript Guidelines

#### Type Safety
```typescript
// ✅ GOOD - Explicit types
interface EventData {
  name: string;
  date: Date;
  price: number;
}

function createEvent(data: EventData): Promise<Event> {
  // Implementation
}

// ❌ BAD - Using any
function createEvent(data: any): any {
  // Implementation
}
```

#### Error Handling
```typescript
// ✅ GOOD - Proper error handling
try {
  const event = await this.eventsService.create(data);
  return event;
} catch (error) {
  if (error instanceof ValidationError) {
    throw new BadRequestException(error.message);
  }
  throw new InternalServerErrorException('Failed to create event');
}

// ❌ BAD - Silent failures
try {
  const event = await this.eventsService.create(data);
  return event;
} catch (error) {
  console.log(error);
}
```

### NestJS Best Practices

#### Module Structure
```typescript
// ✅ GOOD - Clear separation of concerns
@Module({
  imports: [DatabaseModule],
  controllers: [EventsController],
  providers: [EventsService, EventsRepository],
  exports: [EventsService],
})
export class EventsModule {}
```

#### Dependency Injection
```typescript
// ✅ GOOD - Constructor injection
constructor(
  private readonly eventsService: EventsService,
  private readonly logger: LoggerService,
) {}

// ❌ BAD - Direct instantiation
const eventsService = new EventsService();
```

### Code Style Rules

#### Imports
```typescript
// Order: Node → External → Internal → Relative
import { readFile } from 'fs';

import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { DatabaseService } from '@/database/database.service';

import { EventDto } from './event.dto';
```

#### Naming Conventions
- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Interfaces**: `IPascalCase` or `PascalCase`
- **Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Enums**: `PascalCase` with `UPPER_SNAKE_CASE` values

## 🧪 Testing Requirements

### Coverage Standards
- **Minimum**: 80% for all metrics
- **Target**: 100% for new code
- **Required Metrics**: Statements, Branches, Functions, Lines

### Test Structure
```typescript
describe('EventsService', () => {
  let service: EventsService;
  let mockDatabase: jest.Mocked<DatabaseService>;

  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('createEvent', () => {
    it('should create event with valid data', async () => {
      // Arrange
      const eventData = { /* ... */ };
      
      // Act
      const result = await service.createEvent(eventData);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(eventData.name);
    });

    it('should throw error with invalid data', async () => {
      // Test error cases
    });
  });
});
```

### Test Types Required

#### Unit Tests
- Test individual components in isolation
- Mock all external dependencies
- Location: `test/unit/`

#### Integration Tests
- Test module interactions
- Use test database
- Location: `test/integration/`

#### E2E Tests
- Test complete user workflows
- Test actual HTTP requests
- Location: `test/e2e/`

## 📊 Commit Guidelines

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **build**: Build system or dependencies
- **ci**: CI configuration
- **chore**: Other changes that don't modify src or test files

### Examples
```bash
# Feature
git commit -m "feat(events): add pagination support for event listing"

# Bug fix
git commit -m "fix(auth): resolve JWT token validation issue"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Test
git commit -m "test(payments): add integration tests for Stripe checkout"
```

### Commit Best Practices
- Keep commits atomic (one feature/fix per commit)
- Write clear, descriptive commit messages
- Reference issue numbers when applicable
- Sign commits if required: `git commit -S`

## 🔄 Pull Request Process

### Before Creating PR

1. **Update from upstream**
```bash
git fetch upstream
git rebase upstream/main
```

2. **Run all checks**
```bash
npm run test:all
npx tsc --noEmit
npm run lint
```

3. **Update documentation**
- Update README if needed
- Add/update JSDoc comments
- Update API documentation

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Coverage requirements met

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
```

### PR Review Process

#### For Contributors
1. Create PR with descriptive title
2. Fill out PR template
3. Link related issues
4. Request review from maintainers
5. Address review feedback
6. Keep PR updated with main branch

#### For Reviewers
1. Check code quality and standards
2. Verify test coverage
3. Test functionality locally
4. Provide constructive feedback
5. Approve when requirements met

### Merge Requirements
- All CI checks passing
- Code review approval
- No merge conflicts
- Documentation updated
- Test coverage maintained

## 📚 Documentation

### Code Documentation

#### JSDoc Comments
```typescript
/**
 * Creates a new event in the database
 * @param {CreateEventDto} data - Event creation data
 * @returns {Promise<Event>} Created event entity
 * @throws {ConflictException} If event slug already exists
 * @throws {BadRequestException} If validation fails
 */
async createEvent(data: CreateEventDto): Promise<Event> {
  // Implementation
}
```

#### README Updates
- Update when adding new features
- Keep examples current
- Update configuration instructions
- Document breaking changes

### API Documentation
- Update OpenAPI/Swagger decorators
- Keep endpoint descriptions current
- Document request/response schemas
- Include example payloads

## 🐛 Reporting Issues

### Bug Reports
Include:
- Clear description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
- Error messages/logs
- Screenshots if applicable

### Feature Requests
Include:
- Use case description
- Proposed solution
- Alternative solutions considered
- Impact on existing features

## 🏆 Recognition

Contributors will be recognized in:
- Contributors list in README
- Release notes
- Project documentation

## 📞 Getting Help

- **Documentation**: Check existing docs first
- **Issues**: Search existing issues
- **Discussions**: Ask questions in discussions
- **Contact**: info@vedaterenoglu.com

## 🔐 Security

### Reporting Security Issues
- **DO NOT** create public issues for security vulnerabilities
- Email security concerns to: security@vedaterenoglu.com
- Include detailed description and proof of concept
- Allow time for patch before disclosure

### Security Best Practices
- Never commit secrets or credentials
- Use environment variables
- Validate all user input
- Follow OWASP guidelines
- Keep dependencies updated

---

**Thank you for contributing to Portfolio Events API! Your efforts help make this project better for everyone.**