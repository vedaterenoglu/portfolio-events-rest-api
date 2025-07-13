# AI Agent Documentation - Portfolio Events API

## The crucial rules for AI Agent Developer

## Core Engineering Principles

Programming is deterministic engineering, not trial-and-error problem solving. Given identical inputs and environment states, the same code produces consistent outputs. Follow systematic development approach:

### Pre-Development Assessment Framework
Before any code changes, address these questions:
- **What**: Clear requirements and specifications
- **Why**: Business logic and purpose understanding  
- **Expectations**: Predicted outcomes and success criteria
- **Risks**: Potential failure modes and side effects
- **Rollback**: Recovery procedures to restore previous state

### Rollback Safety Protocol
Maintain comprehensive rollback mechanisms:
- Version control with meaningful commits
- Database backups before schema changes
- Deployment snapshots for infrastructure changes
- Test environment isolation to prevent production impact

### Post-Execution Validation
After every change, immediately validate:
- Results match expected behavior exactly
- No unintended side effects occurred
- All tests pass with required coverage thresholds
- System remains in stable, functional state

## UNIT TESTS

### Unit Test Engineering Principles

**Core Philosophy**: Unit testing validates isolated component behavior in complete isolation from external dependencies. Mock all external dependencies to test pure business logic.

### Unit Test Systematic Approach

**Per Iteration Framework**:

1. **Rationale**: Why this unit test is necessary for component validation
2. **Specification**: What specific method/function behavior will be tested
3. **Expected Output**: Predicted function return values, state changes, method calls
4. **Risk Assessment**: Potential failure modes (invalid inputs, edge cases, error conditions)
5. **Rollback Plan**: How to restore clean test state (mock resets, object restoration)
6. **Post-execution Validation**: Verify test results, coverage metrics, TypeScript compliance

**Unit Test Iteration Rules**:

- ✅ One iteration = One test method/scenario only
- ✅ Never use `any` type - create proper TypeScript interfaces
- ✅ Mock all external dependencies (services, databases, HTTP clients)
- ✅ Target 100% coverage (minimum 80% for all metrics: statements, branches, functions, lines)
- ✅ Test private methods using type assertion when necessary

**CRITICAL WORKFLOW ENFORCEMENT - The Atomic Testing Rule**:

**Rule**: NEVER add multiple tests in a single iteration. This rule exists to prevent test interference and maintain debugging capabilities.

**What happens when violated**:
- Previously covered branches can lose coverage due to test interference
- Mock pollution between tests can break existing test execution
- Shared state contamination affects test isolation
- Impossible to identify which specific change caused the regression
- Coverage can appear to "improve" while actually breaking existing coverage

**Real-world consequence example**:
- BEFORE: Previously covered lines under branch coverage
- AFTER adding multiple tests: Same lines lost branch coverage despite higher total percentage
- Result: Higher coverage percentage but broken existing coverage - logically impossible unless test interference occurred

**Why one test per iteration matters**:
- Immediate identification of breaking changes
- Clean rollback capability to last working state
- Preservation of existing test coverage
- Maintainable and debuggable test development
- Prevention of cumulative test interference bugs

**Enforcement**: If any existing coverage decreases after adding a test, the iteration MUST be rolled back and the interference identified before proceeding.
- ✅ After making changes, check lint/TypeScript errors BEFORE running tests
- ✅ Run tests with coverage after each iteration
- ✅ Provide formatted coverage results

**Expected Coverage Format**:
```
Test Suites: 36 passed, 36 total
Tests:       802 passed, 802 total
Snapshots:   0 total
Time:        5.203 s
Ran all test suites.
```

**Coverage Requirements**: ALL metrics must be ≥80%:

- Statements: ≥80%
- Branches: ≥80% 
- Functions: ≥80%
- Lines: ≥80%

## INTEGRATION TESTS

### Integration Test Engineering Principles

**Core Philosophy**: Integration testing validates component interactions and end-to-end request-response cycles. Test the complete middleware chain: HTTP → Middleware → Controllers → Services → Database → Response.

### Integration Test Systematic Approach

**Per Iteration Framework**:

1. **Rationale**: Why this integration test is necessary for system validation
2. **Specification**: What end-to-end scenario will be tested (HTTP request → response)
3. **Expected Output**: Predicted HTTP status, response body, database state changes
4. **Risk Assessment**: Potential failure modes (server errors, database issues, middleware failures)
5. **Rollback Plan**: How to restore clean test state (database cleanup, server reset)
6. **Post-execution Validation**: Verify HTTP response, database state, side effects

**Integration Test Iteration Rules**:

- ✅ One iteration = One integration test scenario only
- ✅ Test real HTTP requests using supertest with proper imports (`import * as request from 'supertest'`)
- ✅ Include full middleware chain (auth, validation, rate limiting, error handling)
- ✅ Test database interactions with real or test database
- ✅ Verify end-to-end behavior (request → database → response)
- ✅ Clean state between tests (database reset, server restart)
- ✅ Test both success and error scenarios
- ✅ Validate HTTP status codes, response structure, database changes

### Test Organization Structure

**Mirror Directory Structure**: Test folders must mirror src structure exactly:

```
test/
├── unit/                    # Unit tests mirror src/
│   ├── controllers/         # Mirror src/controllers/
│   ├── services/           # Mirror src/services/
│   ├── middleware/         # Mirror src/middleware/
│   └── utils/              # Mirror src/utils/
├── integration/            # Integration tests  
│   ├── controllers/        # End-to-end controller tests
│   └── services/           # Service integration tests
└── e2e/                    # End-to-end application tests
```

**Test File Naming**: `{filename}.spec.ts` for unit tests, `{filename}.integration.spec.ts` for integration tests

**Jest Configuration**: Separate configs for each test type:

- `test/jest-unit.json` - Unit test configuration
- `test/jest-integration.json` - Integration test configuration  
- `test/jest-e2e.json` - E2E test configuration

## Project Overview

The Portfolio Events API is a **production-ready, enterprise-grade REST API** built with Node.js, NestJS, TypeScript, and Prisma ORM. It serves as both a functional backend service and a technical showcase, powering multiple frontend applications while demonstrating advanced backend development practices.

### API Endpoints Structure

**Currently Implemented Endpoints (3 total)**

*System Endpoints:*
- `GET /` - API root (returns "Hello World!")

*Data Endpoints:*
- `GET /api/cities` - All cities list with count
  - Response: `{ count: number, cities: TCity[] }`
  - Sorted alphabetically by city name
- `GET /api/events` - Events list (paginated)
  - Query parameters:
    - `page` (default: 0)
    - `limit` (default: 12, max: 50)
    - `city` - Filter by city slug
    - `search` - Search in name, description, organizerName
    - `sort` - Sort by 'date', 'name', or 'price' (default: 'date')
    - `order` - 'asc' or 'desc' (default: 'asc')
  - Returns: Paginated response with event data and metadata

**Planned Endpoints (Not Yet Implemented)**

*System Endpoints:*
- `GET /health` - Health dashboard  
- `GET /health/json` - JSON health check
- `GET /ready` - Readiness check
- `GET /shutdown` - Shutdown status

*Data Endpoints:*
- `GET /api/events/:slug` - Single event by slug

*Admin Endpoints:*
- `POST /api/admin/cities` - Create city
- `PUT /api/admin/cities/:id` - Update city
- `POST /api/admin/events` - Create event
- `PUT /api/admin/events/:id` - Update event
- `DELETE /api/admin/events/:id` - Delete event

> **Note**: Admin endpoints and authentication are not yet implemented. Clerk integration is configured in environment variables but guards are not active.

### Key Architecture

**Currently Implemented:**
- **TypeScript-first** development with strict type safety
- **NestJS framework** with modular architecture and dependency injection
- **Prisma ORM** with PostgreSQL integration (custom output to `src/generated/client`)
- **Class-validator & class-transformer** for DTO validation
- **Rate limiting** with @nestjs/throttler (2 tiers: 3/sec, 100/min)
- **Exception filters** for centralized error handling with Prisma error mapping
- **Custom logger service** with file logging to `src/logs/myLogFile.log`
- **CORS** enabled (currently allows all origins - TODO noted)

**Planned but Not Implemented:**
- **Clerk authentication** with JWT tokens and role-based access control
- **Guards & Interceptors** for authentication and request processing
- **Health monitoring** and health check endpoints
- **Graceful shutdown** system
- **Admin role authorization**

## Development Environment Setup

### Prerequisites

- Node.js (18.x or higher)
- PostgreSQL database
- npm or yarn
- Clerk account for authentication

### Quick Setup

```bash
# Clone and install
git clone https://github.com/vedaterenoglu/portfolio-events-api-nestjs.git
cd portfolio-events-api-nestjs
npm install

# Environment setup
cp .env.example .env
# Edit .env with your actual values

# Database setup
npx prisma generate
npx prisma db push
npx prisma db seed

# Start development
npm run start:dev
```

### Essential Environment Variables

```bash
# Environment
NODE_ENV=development
PORT=3060

# Database Configuration (REQUIRED)
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
DATABASE_DIRECT_URL=postgresql://username:password@localhost:5432/database_name

# Security Configuration (REQUIRED for admin routes)
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100    # Max requests per window

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
CORS_CREDENTIALS=true

# Logging Configuration
LOG_LEVEL=info                 # error, warn, info, debug, trace
LOG_FORMAT=combined           # combined, common, dev, short, tiny

# Performance Configuration
REQUEST_TIMEOUT_MS=30000      # 30 seconds
BODY_LIMIT=10mb              # Request body size limit

# Health Check Configuration
HEALTH_CHECK_ENABLED=true
METRICS_ENABLED=true
```

## Code Architecture & Patterns

### Project Structure

**Feature-Based Organization**: Given that this is a Portfolio Events API with clear domain boundaries (cities, events, admin), we organize by feature for better maintainability and scalability.

```text
src/
├── config/              # Environment configuration and validation
├── cities/              # Cities feature module
│   ├── cities.controller.ts
│   ├── cities.service.ts
│   └── cities.module.ts
├── events/              # Events feature module
│   ├── events.controller.ts
│   ├── events.service.ts
│   └── events.module.ts
├── admin/               # Admin feature module
│   ├── admin-cities.controller.ts
│   ├── admin-events.controller.ts
│   └── admin.module.ts
├── database/            # Database module and service
│   ├── database.module.ts
│   └── database.service.ts
├── guards/              # Authentication and authorization guards
│   ├── jwt-auth.guard.ts
│   └── admin-role.guard.ts
├── services/            # Shared services
│   └── logger/          # Centralized logging service
│       ├── logger.module.ts
│       └── logger.service.ts
├── middleware/          # NestJS middleware (rate limiting, etc.)
├── filters/             # Exception filters
│   └── all-exceptions.filter.ts
├── types/               # TypeScript interfaces and DTOs
├── utils/               # Utility functions and helpers
├── public/              # Static files (health dashboard)
├── app.module.ts        # Root application module
└── main.ts             # Application entry point
```

**Benefits of Feature-Based Structure**:
- Clear domain separation and encapsulation
- Easy to locate related files within each feature
- Follows NestJS best practices for modular architecture
- Scales well as features grow and become more complex
- Matches the API endpoint structure for intuitive navigation

### Key Files for AI Understanding

- **src/main.ts** - NestJS application bootstrap and configuration
- **src/app.module.ts** - Root module with all imports and providers
- **src/database/database.module.ts** - Prisma database integration
- **src/guards/jwt-auth.guard.ts** - Clerk JWT authentication guard
- **src/guards/admin-role.guard.ts** - Admin role authorization guard
- **src/controllers/admin/** - Protected admin-only endpoints
- **src/services/logger/logger.service.ts** - Centralized logging service
- **src/filters/all-exceptions.filter.ts** - Global exception handling

### Naming Conventions

- **Controllers**: kebab-case with suffix (`events.controller.ts`, `admin-cities.controller.ts`)
- **Services**: kebab-case with suffix (`events.service.ts`, `cities.service.ts`)
- **Guards**: kebab-case with suffix (`jwt-auth.guard.ts`, `admin-role.guard.ts`)
- **Modules**: kebab-case with suffix (`database.module.ts`, `logger.module.ts`)
- **Filters**: kebab-case with suffix (`all-exceptions.filter.ts`)
- **DTOs**: PascalCase with suffix (`CreateEventDto.ts`, `UpdateCityDto.ts`)
- **Interfaces**: PascalCase (`EventInterface.ts`, `CityInterface.ts`)
- **Utilities**: camelCase (`prismaErrorMapping.ts`)

## API Implementation Details

### Controllers Pattern

**Public Controller Example:**
```typescript
// src/controllers/events.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common'
import { EventsService } from '../services/events.service'
import { GetEventsQueryDto } from '../types/event.dto'

@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async getAllEvents(@Query() query: GetEventsQueryDto) {
    return this.eventsService.getAllEvents(query)
  }

  @Get(':slug')
  async getEventBySlug(@Param('slug') slug: string) {
    return this.eventsService.getEventBySlug(slug)
  }
}
```

**Admin Controller Example:**
```typescript
// src/controllers/admin/admin-events.controller.ts
import { Controller, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../guards/jwt-auth.guard'
import { AdminRoleGuard } from '../../guards/admin-role.guard'
import { EventsService } from '../../services/events.service'
import { CreateEventDto, UpdateEventDto } from '../../types/event.dto'

@Controller('api/admin/events')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminEventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async createEvent(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.createEvent(createEventDto)
  }

  @Put(':id')
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto
  ) {
    return this.eventsService.updateEvent(id, updateEventDto)
  }

  @Delete(':id')
  async deleteEvent(@Param('id') id: string) {
    return this.eventsService.deleteEvent(id)
  }
}
```

### Services Pattern

```typescript
// src/services/events.service.ts
import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { CreateEventDto, UpdateEventDto, GetEventsQueryDto } from '../types/event.dto'
import { Event } from '@prisma/client'

@Injectable()
export class EventsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllEvents(query: GetEventsQueryDto): Promise<Event[]> {
    return this.databaseService.event.findMany({
      where: {
        ...(query.city && { citySlug: query.city }),
        ...(query.search && {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } }
          ]
        })
      },
      include: { cityRelation: true },
      orderBy: { date: 'asc' },
      take: query.limit || 20,
      skip: query.offset || 0
    })
  }

  async getEventBySlug(slug: string): Promise<Event | null> {
    return this.databaseService.event.findUnique({
      where: { slug },
      include: { cityRelation: true }
    })
  }

  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    return this.databaseService.event.create({
      data: createEventDto,
      include: { cityRelation: true }
    })
  }

  async updateEvent(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    return this.databaseService.event.update({
      where: { id },
      data: updateEventDto,
      include: { cityRelation: true }
    })
  }

  async deleteEvent(id: string): Promise<Event> {
    return this.databaseService.event.delete({
      where: { id }
    })
  }
}
```

### NestJS Request Processing Pipeline

1. **Global Middleware** - CORS, body parsing, compression
2. **Guards** - Authentication and authorization
   - `JwtAuthGuard` - Validates Clerk JWT tokens
   - `AdminRoleGuard` - Checks admin role from user metadata
3. **Interceptors** - Request/response transformation and logging
4. **Pipes** - Data validation and transformation
   - `ValidationPipe` - Validates DTOs with class-validator
5. **Controllers** - Route handlers with decorators
6. **Services** - Business logic with dependency injection
7. **Filters** - Exception handling
   - `AllExceptionsFilter` - Global error handling and formatting
8. **Rate Limiting** - @nestjs/throttler for request throttling

**Guard Implementation Example:**
```typescript
// src/guards/jwt-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { clerkClient } from '@clerk/clerk-sdk-node'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)
    
    if (!token) {
      throw new UnauthorizedException('Token not found')
    }

    try {
      const session = await clerkClient.verifyToken(token)
      request.user = session
      return true
    } catch (error) {
      throw new UnauthorizedException('Invalid token')
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
```

**Admin Role Guard Example:**
```typescript
// src/guards/admin-role.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { clerkClient } from '@clerk/clerk-sdk-node'

@Injectable()
export class AdminRoleGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const userId = request.user?.sub
    
    if (!userId) {
      throw new ForbiddenException('User not authenticated')
    }

    try {
      const user = await clerkClient.users.getUser(userId)
      const isAdmin = user.publicMetadata.role === 'admin'
      
      if (!isAdmin) {
        throw new ForbiddenException('Admin access required')
      }
      
      return true
    } catch (error) {
      throw new ForbiddenException('Access denied')
    }
  }
}
```

## Database Schema & Operations

### Prisma Models

```prisma
model Event {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  city        String
  location    String
  date        DateTime
  organizer   String
  image       String
  description String
  price       Decimal
  citySlug    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  cityRelation City @relation(fields: [citySlug], references: [citySlug])
}

model City {
  id        String   @id @default(cuid())
  citySlug  String   @unique
  city      String   @unique
  url       String
  alt       String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  events Event[]
}
```

### Database Operations

- **Prisma Client** - Type-safe database queries
- **Relationships** - Foreign key constraints between Cities and Events
- **Migrations** - Schema evolution management
- **Connection pooling** - Performance optimization
- **Error handling** - Custom error mapping

## Authentication & Security

### Clerk Integration

**Environment Configuration:**
```bash
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
```

**JWT Token Validation:**
```typescript
// In JwtAuthGuard
import { clerkClient } from '@clerk/clerk-sdk-node'

const session = await clerkClient.verifyToken(token)
request.user = session // Attach user to request
```

**Admin Role Authorization:**
```typescript
// In AdminRoleGuard
const user = await clerkClient.users.getUser(userId)
const isAdmin = user.publicMetadata.role === 'admin'

if (!isAdmin) {
  throw new ForbiddenException('Admin access required')
}
```

**Protecting Routes:**
```typescript
// Public routes (no guards)
@Controller('api/events')
export class EventsController {}

// Admin-only routes (both guards required)
@Controller('api/admin/events')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminEventsController {}
```

### Security Features

- **JWT-based authentication** with Clerk integration and secure token validation
- **Role-based access control** (admin role required for admin endpoints)
- **Guard composition** - Multiple guards for layered security
- **Rate limiting** with @nestjs/throttler (configurable via environment)
- **CORS protection** with environment-specific origins
- **Input validation** with class-validator and DTOs
- **Global exception filtering** for consistent error responses
- **Request sanitization** and validation pipelines
- **Secure headers** and middleware chain protection

## Monitoring & Health System

### Health Check Implementation

```typescript
// Health check with comprehensive metrics
GET /health -> {
  status: 'healthy' | 'degraded' | 'unhealthy',
  checks: {
    database: { status, responseTime },
    memory: { status, usage },
    // ... other checks
  },
  metrics: {
    requests: { total, success, errors },
    performance: { cpu, memory, eventLoopLag },
    errors: { byType, recent }
  }
}
```

### Monitoring Features

- **Request tracking** - All HTTP requests with timing
- **Error categorization** - By type and severity
- **Performance monitoring** - CPU, memory, event loop lag
- **Database health** - Connection and response time
- **Auto-refresh dashboard** - Real-time metrics at /health

## Graceful Shutdown System

### Multi-Phase Shutdown Process

1. **Signal Reception** - SIGTERM, SIGINT handling
2. **Stop New Connections** - Prevent new requests
3. **Connection Drainage** - Wait for active requests
4. **Resource Cleanup** - Priority-based cleanup
5. **Process Exit** - Clean termination

### Implementation Pattern

```typescript
// Shutdown service singleton
const shutdownService = ShutdownService.getInstance()

// Register cleanup functions
shutdownService.registerCleanup({
  name: 'Database Connections',
  priority: 1,
  timeout: 5000,
  cleanup: async () => await prisma.$disconnect(),
})
```

## Testing & Quality Assurance

### Available Scripts

**Development:**
```bash
npm run start:dev          # NestJS development server with hot reload
npm run start:debug        # Development server with debug mode
npm run start:prod         # Production server
npm run build              # NestJS production build
```

**Code Quality:**
```bash
npm run lint               # ESLint checking with auto-fix
npm run format             # Prettier code formatting
```

**Database:**
```bash
npx prisma generate        # Generate Prisma client
npx prisma db push         # Push schema to database
npx prisma db seed         # Seed database with sample data
npx prisma studio          # Open Prisma Studio
```

**Testing:**
```bash
npm run test                    # Run all tests
npm run test:watch             # Run tests in watch mode
npm run test:coverage          # Run tests with coverage
npm run test:unit              # Run unit tests only
npm run test:unit:coverage     # Run unit tests with coverage
npm run test:integration       # Run integration tests only
npm run test:integration:coverage # Run integration tests with coverage
npm run test:e2e               # Run e2e tests only
npm run test:e2e:coverage      # Run e2e tests with coverage
npm run test:ci                # Run all tests for CI
```

### Code Quality Tools

- **ESLint** - Code linting with TypeScript, security, and import rules
- **Prettier** - Automated code formatting
- **TypeScript** - Static type checking and compilation
- **Class-validator** - DTO validation with decorators
- **Class-transformer** - Object transformation and serialization
- **Prisma** - Type-safe database operations
- **Jest** - Testing framework with coverage reporting
- **Supertest** - HTTP integration testing
- **@nestjs/testing** - NestJS-specific testing utilities

## Deployment & Production

### Build Process

```bash
# NestJS build process
npm run build                    # Compiles TypeScript to JavaScript
# Output: dist/ directory with compiled code

# Production deployment
npm run start:prod              # Runs compiled application
```

### Environment Requirements

**Production Requirements:**
- **Database**: `DATABASE_URL` and `DATABASE_DIRECT_URL`
- **Authentication**: `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY`
- **Security**: Rate limiting and CORS configuration
- **Performance**: Request timeout and body limit settings
- **Monitoring**: Health check and metrics configuration

**Development Requirements:**
- **Minimal**: `DATABASE_URL` for database connection
- **Optional**: All other environment variables have defaults

**Environment Validation:**
- Startup validation ensures all required variables are present
- Clear error messages for missing configuration
- Type-safe environment configuration with validation

### Health Check Integration

```yaml
# Kubernetes example
livenessProbe:
  httpGet:
    path: /health
    port: 3060
  initialDelaySeconds: 30
  periodSeconds: 30
```

## Common Development Tasks

### Adding New Endpoints

1. Create/update controller method
2. Add service layer logic
3. Update routes with middleware
4. Add OpenAPI documentation
5. Update types if needed

### Database Changes

1. Update Prisma schema
2. Generate new client: `npm run db:generate`
3. Push to database: `npm run db:push`
4. Update TypeScript types

### Error Handling

```typescript
// Custom error classes
throw new ValidationError('Invalid input', { field: 'email' })
throw new NotFoundError('Event not found')
throw new DatabaseError('Connection failed')
```

## Code Improvement Guidelines

### Performance Optimization

- **Database queries** - Use appropriate indexes and relations
- **Response compression** - Enable gzip compression
- **Caching** - Implement response caching where appropriate
- **Connection pooling** - Optimize database connections

### Security Best Practices

- **Input validation** - Always validate with Zod schemas
- **Rate limiting** - Implement appropriate limits per endpoint
- **Authentication** - Verify JWT tokens on protected routes
- **Error handling** - Don't expose sensitive information

### Monitoring Integration

- **Health checks** - Monitor all critical components
- **Error tracking** - Log and categorize all errors
- **Performance metrics** - Track response times and resource usage
- **Alerting** - Set up appropriate thresholds

### Development Workflow

1. **Read existing code** - Understand patterns before adding new features
2. **Follow conventions** - Use established naming and structure patterns
3. **Test thoroughly** - Verify functionality with health checks
4. **Document changes** - Update OpenAPI specs for API changes
5. **Monitor impact** - Check health dashboard after deployments

## Key Implementation Files

### Core Application

- **src/server.ts:1-100** - Main application setup and middleware
- **src/config/environment.ts:1-50** - Environment validation with Zod
- **src/config/swagger.ts:1-200** - OpenAPI documentation configuration

### Controllers & Services

- **src/controllers/EventController.ts:1-150** - Event management logic
- **src/controllers/CityController.ts:1-100** - City management logic
- **src/services/EventService.ts:1-200** - Event business logic
- **src/services/CityService.ts:1-150** - City business logic

### Middleware & Security

- **src/middleware/authMiddleware.ts:1-50** - JWT authentication
- **src/middleware/rateLimiter.ts:1-100** - Rate limiting configuration
- **src/middleware/monitoringMiddleware.ts:1-150** - Request tracking

### Monitoring & Health

- **src/services/MonitoringService.ts:1-300** - Health check implementation
- **src/services/ShutdownService.ts:1-250** - Graceful shutdown system
- **src/public/health-dashboard.js:1-10** - Auto-refresh dashboard

This documentation provides AI agents with comprehensive understanding of the codebase architecture, patterns, and implementation details necessary for effective code assistance and improvements.
