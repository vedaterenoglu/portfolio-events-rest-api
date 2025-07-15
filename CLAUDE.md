# AI Agent Documentation - Portfolio Events API

---

### The crucial rules for AI Agent Developer

## Core Engineering Principles

Programming is deterministic engineering, not trial-and-error problem solving. Given identical inputs and environment states, the same code produces consistent outputs. Follow systematic development approach:

## Pre-Development Assessment Workflow

Before any code changes, (at the beginning of eac iteration) address these questions:

- **What**: Clear requirements and specifications
- **Why**: Business logic and purpose understanding
- **Expectations**: Predicted outcomes and success criteria of the current iteration not generaly
- **Risks**: Potential failure modes and side effects
- **Rollback**: Recovery procedures to restore previous state

## Rollback Safety Protocol

Maintain comprehensive rollback mechanisms:

- Version control with meaningful commits
- Database backups before schema changes
- Deployment snapshots for infrastructure changes
- Test environment isolation to prevent production impact

## ITERATION IMPLEMENTATION DIRECTIVE

You are a test AI AGENT development specialist. Follow these strict requirements:
Core Rules

1. MANDATORY: AT THE BEGINNING OF THE EACH ITERATION GIVE INFO AS EXPLAINED IN CLAUDE.md FILE.
2. NEVER use any type - Always use proper TypeScript types
3. AT EACH ITERATION ADD OR EDIT ONLY ONE FILE OR ONE TEST NOT MORE.
4. MANDATORY: 100% coverage for ALL THREE metrics
   - Statements coverage: 100% (REQUIRED)
   - Branch coverage: 100% (REQUIRED)
   - Functions coverage: 100% (REQUIRED)
   - ABSOLUTE MINIMUM if 100% impossible: 80% for each metric
5. Always report coverage results after running tests
6. Complete current file fully before asking about next file
7. Check errors AFTER code changes: TypeScript → Lint → Run tests
8. Apply these rules at every step of test creation
   Workflow

Per Iteration Workflow (from CLAUDE.md) → Write ONE test / ONE file → Fix TS errors → Fix lint → Run test → Report coverage → Wait for confirmation → Repeat
Success Criteria

- ✅ Zero TypeScript/lint errors
- ✅ 100% coverage for ALL THREE metrics (statements, branches, functions) OR minimum 80% each if impossible
- ✅ All tests passing
- ✅ Complete file before proceeding

### Unit Test Engineering Principles

**Core Philosophy**: Unit testing validates isolated component behavior in complete isolation from external dependencies. Mock all external dependencies to test pure business logic. Think systematically—coding is not trial-and-error problem solving. Programming is engineering, and it follows deterministic principles. Given identical inputs and environment states, the same code produces consistent outputs. Avoid ad-hoc development. Don't implement without predicting outcomes. At each development phase, address these questions: What (requirements/specification), Why (business logic/purpose), Expectations(What we expect as result), Risks (failure modes/side effects). Ensure rollback mechanisms are in place—maintain version control, database backups, and deployment snapshots so any change can be reverted without data loss. After execution, immediately validate results against expected behaviour and be prepared to rollback if outcomes don't match expectations.

## Unit Test Systematic Approach

**Per Iteration Workflow**:

1. **Rationale**: Why this unit test is necessary for component validation
2. **Specification**: What specific method/function behavior will be tested
3. **Expected Output**: Predicted function return values, state changes, method calls
4. **Risk Assessment**: Potential failure modes (invalid inputs, edge cases, error conditions)
5. **Rollback Plan**: How to restore clean test state (mock resets, object restoration)
6. **Post-execution Validation**: Verify test results, coverage metrics, TypeScript compliance
7. DON'T START TO EXECUTE THE ITERATION BEFORE MY CONFIRMATION.

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

### Integration Test Engineering Principles

**Core Philosophy**: Integration testing validates component interactions and end-to-end request-response cycles. Test the complete middleware chain: HTTP → Middleware → Controllers → Services → Database → Response.

## Integration Test Systematic Approach

**Per Iteration Framework**:

1. **Rationale**: Why this integration test is necessary for system validation
2. **Specification**: What end-to-end scenario will be tested (HTTP request → response)
3. **Expected Output**: Predicted HTTP status, response body, database state changes
4. **Risk Assessment**: Potential failure modes (server errors, database issues, middleware failures)
5. **Rollback Plan**: How to restore clean test state (database cleanup, server reset)
6. **Post-execution Validation**: Verify HTTP response, database state, side effects

**Integration Test Iteration Rules**:

## Test Organization Structure

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

### Project Overview

The Portfolio Events API is a **production-ready, enterprise-grade REST API** built with Node.js, NestJS, TypeScript, and Prisma ORM. It serves as both a functional backend service and a technical showcase, powering multiple frontend applications while demonstrating advanced backend development practices.

**🏆 Current Status: PRODUCTION-READY**

- ✅ **Complete Security Implementation** (9/9 features)
- ✅ **100% Authentication & Authorization** (no test bypasses)
- ✅ **Comprehensive Test Coverage** (70 unit tests + 57 integration tests passing)
- ✅ **Enterprise-Grade Architecture** with full middleware chain

### API Endpoints Structure

**✅ IMPLEMENTED & SECURED ENDPOINTS**

_Public Endpoints (Rate Limited):_

- `GET /` - API root (returns "Hello World!")
- `GET /api/cities` - All cities list with count
  - Response: `{ count: number, cities: TCity[] }`
  - Features: Alphabetical sorting, comprehensive error handling

_Admin Endpoints (JWT + Admin Role Protected):_

- `POST /api/admin/cities` - Create city ✅ **SECURED**
- `PUT /api/admin/cities/:citySlug` - Update city ✅ **SECURED**

**🔐 Security Features Active on All Endpoints:**

- **Authentication**: Clerk JWT validation (production-secure)
- **Authorization**: Admin role verification from metadata
- **Rate Limiting**: 3 requests/second, 100 requests/minute
- **Input Validation**: Global ValidationPipe with sanitization
- **CORS Protection**: Environment-configured origins
- **Security Headers**: Helmet with CSP, HSTS, XSS protection
- **Exception Handling**: Comprehensive error filtering

**📋 PLANNED ENDPOINTS (Ready for Implementation)**

_System Endpoints:_

- `GET /health` - Health dashboard
- `GET /health/json` - JSON health check
- `GET /ready` - Readiness check

_Data Endpoints:_

- `GET /api/events/:slug` - Single event by slug
- `POST /api/admin/events` - Create event (security ready)
- `PUT /api/admin/events/:id` - Update event (security ready)
- `DELETE /api/admin/events/:id` - Delete event (security ready)

> **✅ Note**: All planned endpoints will automatically inherit the complete security stack (authentication, authorization, rate limiting, validation, sanitization) without additional configuration.

### Key Architecture

**✅ PRODUCTION-READY IMPLEMENTATION:**

- **TypeScript-first** development with strict type safety and Zod schema integration
- **NestJS framework** with modular architecture and dependency injection
- **Prisma ORM** with PostgreSQL integration (custom output to `src/generated/client`)
- **Zod schemas** for type safety with auto-generation from Prisma models
- **Complete security stack** with 9/9 implemented features:
  - **Authentication & Authorization**: Clerk JWT + Admin role guards (production-secure)
  - **Rate limiting**: Dual-tier protection (3/sec, 100/min) via @nestjs/throttler
  - **Input validation**: Global ValidationPipe with sanitization pipelines
  - **Security headers**: Helmet with CSP, HSTS, XSS protection
  - **CORS protection**: Environment-configured origins and credentials
  - **Exception filtering**: Comprehensive error handling with Prisma error mapping
  - **Request sanitization**: Property whitelisting and malformed data prevention
- **Custom logger service** with file logging to `src/logs/myLogFile.log`
- **Comprehensive testing**: 70/70 unit tests, 57/57 integration tests (99%+ coverage)

**🚀 READY FOR IMPLEMENTATION:**

- **Health monitoring** endpoints (security stack ready)
- **Events controller** (authentication/authorization already configured)
- **Graceful shutdown** system
- **Enhanced sanitization** (HTML/XSS prevention planned)

**🏗️ Complete Security Middleware Chain:**

```typescript
Request → Helmet → CORS → ValidationPipe → Rate Limiting → JWT Auth → Admin Role → Controllers → Exception Filter → Response
```

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

**Feature-Based Organization**: Current implementation follows NestJS best practices with modular architecture for cities and admin functionality.

```text
src/
├── config/              # Environment configuration and validation
│   └── clerk.config.ts  # Clerk authentication configuration
├── cities/              # Cities feature module (✅ IMPLEMENTED)
│   ├── cities.controller.ts
│   ├── cities.service.ts
│   └── cities.module.ts
├── admin/               # Admin feature module (✅ IMPLEMENTED)
│   ├── admin-cities.controller.ts
│   └── admin.module.ts
├── auth/                # Authentication module (✅ IMPLEMENTED)
│   ├── auth.controller.ts
│   └── auth.module.ts
├── database/            # Database module and service (✅ IMPLEMENTED)
│   ├── database.module.ts
│   └── database.service.ts
├── guards/              # Authentication and authorization guards (✅ IMPLEMENTED)
│   ├── jwt-auth.guard.ts
│   └── admin-role.guard.ts
├── services/            # Shared services (✅ IMPLEMENTED)
│   └── logger/          # Centralized logging service
│       ├── logger.module.ts
│       └── logger.service.ts
├── schemas/             # Zod schemas and TypeScript types (✅ IMPLEMENTED)
│   ├── city.schema.ts
│   ├── event.schema.ts
│   └── index.ts
├── generated/           # Auto-generated files (✅ IMPLEMENTED)
│   └── zod/             # Auto-generated Zod schemas from Prisma
├── lib/                 # Library utilities (✅ IMPLEMENTED)
│   └── prisma.ts
├── all-exceptions.filter.ts  # Global exception filter (✅ IMPLEMENTED)
├── app.controller.ts    # Root controller (✅ IMPLEMENTED)
├── app.service.ts       # Root service (✅ IMPLEMENTED)
├── app.module.ts        # Root application module (✅ IMPLEMENTED)
└── main.ts             # Application entry point (✅ IMPLEMENTED)
```

**Benefits of Current Structure**:

- Clear separation of implemented features (cities, admin, auth)
- Modular design ready for events feature addition
- Security infrastructure (guards, filters) properly organized
- Auto-generated schemas maintain type safety
- Follows NestJS best practices for enterprise applications

### Key Files for AI Understanding

- **src/main.ts** - NestJS application bootstrap with complete security stack
- **src/app.module.ts** - Root module with all imports, providers, and security configuration
- **src/database/database.module.ts** - Prisma database integration
- **src/guards/jwt-auth.guard.ts** - Production-secure Clerk JWT authentication guard
- **src/guards/admin-role.guard.ts** - Production-secure admin role authorization guard
- **src/admin/admin-cities.controller.ts** - Protected admin-only endpoints
- **src/cities/cities.controller.ts** - Public cities API endpoints
- **src/services/logger/logger.service.ts** - Centralized logging service
- **src/all-exceptions.filter.ts** - Global exception handling with Prisma error mapping
- **src/schemas/\*.ts** - Zod schemas for type safety and validation

### Naming Conventions

- **Controllers**: kebab-case with suffix (`cities.controller.ts`, `admin-cities.controller.ts`)
- **Services**: kebab-case with suffix (`cities.service.ts`, `database.service.ts`)
- **Guards**: kebab-case with suffix (`jwt-auth.guard.ts`, `admin-role.guard.ts`)
- **Modules**: kebab-case with suffix (`database.module.ts`, `logger.module.ts`)
- **Filters**: kebab-case with suffix (`all-exceptions.filter.ts`)
- **Schemas**: kebab-case with suffix (`city.schema.ts`, `event.schema.ts`)
- **Config**: kebab-case with suffix (`clerk.config.ts`)
- **Types**: Inferred from Zod schemas (`CreateCity`, `UpdateCity`)

## API Implementation Details

### Current Controller Implementation

**Public Cities Controller (✅ IMPLEMENTED):**

```typescript
// src/cities/cities.controller.ts - Actual Implementation
import { Controller, Get } from '@nestjs/common'
import { CitiesService } from './cities.service'

@Controller('api/cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  async getAllCities() {
    return this.citiesService.getAllCities()
  }
}
```

**Secured Admin Controller (✅ IMPLEMENTED):**

```typescript
// src/admin/admin-cities.controller.ts - Actual Implementation
import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common'

import { CitiesService } from '../cities/cities.service'
import { AdminRoleGuard } from '../guards/admin-role.guard'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { CreateCity, UpdateCity, City } from '../schemas/city.schema'

@Controller('api/admin/cities')
@UseGuards(JwtAuthGuard, AdminRoleGuard) // Production-secure guards
export class AdminCitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCity(@Body() createCityData: CreateCity): Promise<City> {
    return this.citiesService.createCity(createCityData)
  }

  @Put(':citySlug')
  @HttpCode(HttpStatus.OK)
  async updateCity(
    @Param('citySlug') citySlug: string,
    @Body() updateCityData: UpdateCity,
  ): Promise<City> {
    return this.citiesService.updateCity(citySlug, updateCityData)
  }
}
```

### Service Implementation Pattern

**Cities Service (✅ IMPLEMENTED):**

```typescript
// src/cities/cities.service.ts - Actual Implementation
import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { City, CreateCity, UpdateCity } from '../schemas/city.schema'

@Injectable()
export class CitiesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllCities() {
    const cities = await this.databaseService.tCity.findMany({
      orderBy: { city: 'asc' },
    })
    return { count: cities.length, cities }
  }

  async createCity(createCityData: CreateCity): Promise<City> {
    return this.databaseService.tCity.create({
      data: createCityData,
    })
  }

  async updateCity(
    citySlug: string,
    updateCityData: UpdateCity,
  ): Promise<City> {
    return this.databaseService.tCity.update({
      where: { citySlug },
      data: updateCityData,
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
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
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
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
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
model TCity {
  citySlug  String   @id
  city      String   @unique
  url       String
  alt       String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // One-to-many relationship with TEvent
  events    TEvent[]
}

model TEvent {
  id            Int      @id
  name          String
  slug          String   @unique
  city          String
  citySlug      String
  location      String
  date          DateTime
  organizerName String
  imageUrl      String
  alt           String
  description   String
  price         Int
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // One-to-many relationship with TCity
  cityData      TCity    @relation(fields: [citySlug], references: [citySlug])
}
```

### Database Operations

- **Prisma Client** - Type-safe database queries
- **Relationships** - Foreign key constraints between TCity and TEvent models
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
@Controller('api/cities')
export class CitiesController {}

// Admin-only routes (both guards required)
@Controller('api/admin/cities')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminCitiesController {}
```

### Complete Security Implementation (9/9 Features)

**🔐 AUTHENTICATION & AUTHORIZATION (✅ COMPLETE)**

- **JWT-based authentication** with Clerk integration and secure token validation (no test bypasses)
- **Role-based access control** with proper admin role verification from Clerk metadata
- **Guard composition** - Multi-layer security: JWT → Admin Role verification

**🛡️ REQUEST PROTECTION (✅ COMPLETE)**

- **Rate limiting** with dual-tier protection (3/sec, 100/min) via @nestjs/throttler
- **CORS protection** with environment-specific origins and credential support
- **Input validation** with global ValidationPipe (whitelist, forbidNonWhitelisted, transform)
- **Request sanitization** pipelines for malformed data prevention

**🔒 SECURITY HEADERS & MIDDLEWARE (✅ COMPLETE)**

- **Helmet security headers** with comprehensive CSP, HSTS, X-Frame-Options, XSS protection
- **Global exception filtering** with AllExceptionsFilter for centralized error handling
- **Secure middleware chain** with proper execution order

**📊 Current Security Middleware Pipeline:**

```
Request → Helmet Headers → CORS → ValidationPipe → Rate Limiting → JWT Auth → Admin Role → Controllers → AllExceptionsFilter → Response
```

**🎯 Security Test Coverage:**

- **Unit Tests**: 70/70 passing (98.67% coverage)
- **Integration Tests**: 57/57 passing (99.00% coverage)
- **Security Guards**: 100% coverage with production scenarios only

## Input Sanitization Strategy

### Current Sanitization Implementation (9/10 Security Level)

**✅ COMPREHENSIVE PROTECTION LAYERS:**

**1. Global ValidationPipe (Core Sanitization)**

```typescript
// Location: src/main.ts:10-18
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strips unknown properties (Property Pollution Protection)
    forbidNonWhitelisted: true, // Rejects requests with extra fields (Malicious Data Prevention)
    transform: true, // Type coercion and basic transformation
    disableErrorMessages: process.env.NODE_ENV === 'production', // Security in production
  }),
)
```

**2. Zod Schema Runtime Validation with HTML Sanitization**

```typescript
// Location: src/schemas/cities-query.schema.ts
export const CitiesQuerySchema = z.object({
  search: z.string().min(1).max(50).transform(val => sanitizePlainText(val, 50)).optional(),
  limit: z.string().optional().transform(val => parseInt(val || '50') || 50).refine(val => val >= 1 && val <= 100),
  offset: z.string().optional().transform(val => parseInt(val || '0') || 0).refine(val => val >= 0),
})
export type CitiesQuery = z.infer<typeof CitiesQuerySchema>
```

**3. Output Sanitization Interceptor (Defense-in-Depth)**

```typescript
// Location: src/interceptors/output-sanitization.interceptor.ts
@Injectable()
export class OutputSanitizationInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map(data => this.sanitizeResponse(data)))
  }
  
  private sanitizeResponse(data: unknown): unknown {
    // Recursively sanitizes HTML from all string fields in response
    if (typeof data === 'string') {
      return sanitizePlainText(data, 10000)
    }
    // Handles nested objects and arrays...
  }
}
```

**4. Prisma ORM Protection (Database Layer)**

- **SQL Injection Protection**: Parameterized queries automatically generated
- **Type Safety**: Database operations are type-safe through Prisma Client

**✅ COMPREHENSIVE PROTECTION AGAINST:**

- ✅ **SQL Injection**: Excellent (Prisma ORM with parameterized queries)
- ✅ **Property Pollution**: Excellent (ValidationPipe whitelist + forbidNonWhitelisted)
- ✅ **Type Confusion**: Excellent (TypeScript + Zod schemas)
- ✅ **XSS Prevention**: Excellent (Input + Output sanitization)
- ✅ **Input Length Control**: Excellent (Strict size limits enforced)
- ✅ **URL Injection Prevention**: Good (Validated external links)
- ✅ **Query Parameter Security**: Excellent (Complete validation)
- ✅ **Rate Limiting**: Excellent (Dual-tier protection)
- ✅ **NoSQL Injection**: N/A (PostgreSQL used)

**🔐 CURRENT SECURITY IMPLEMENTATION:**

**1. XSS (Cross-Site Scripting) - FULLY PROTECTED**

```typescript
// Input sanitization in schemas
search: z.string().min(1).max(50).transform(val => sanitizePlainText(val, 50))

// Output sanitization in interceptor
private sanitizeResponse(data: unknown): unknown {
  if (typeof data === 'string') {
    return sanitizePlainText(data, 10000) // Removes all HTML/scripts
  }
  // Recursively sanitizes nested objects...
}
```

**2. Input Length Attacks - FULLY PROTECTED**

```typescript
// Enforced length limits across all schemas
export const CitiesQuerySchema = z.object({
  search: z.string().min(1).max(50), // 50 char limit
  limit: z.string().refine(val => val >= 1 && val <= 100), // Range validation
  offset: z.string().refine(val => val >= 0), // Min validation
})
```

**3. URL Injection - PROTECTED**

```typescript
// URLs preserved in skip fields for legitimate use
private shouldSkipField(fieldName: string): boolean {
  const skipFields = ['imageUrl', 'url', 'citySlug', 'id', 'createdAt', 'updatedAt']
  return skipFields.includes(fieldName)
}
```

**ACHIEVED SECURITY LEVEL: 9/10**

**COMPREHENSIVE SANITIZATION COVERAGE:**

- ✅ **Input Sanitization**: HTML removal via Zod transform
- ✅ **Output Sanitization**: Global interceptor for all responses
- ✅ **Query Parameter Validation**: Complete validation and sanitization
- ✅ **Length Limits**: Enforced across all string fields
- ✅ **Type Safety**: 100% TypeScript coverage
- ✅ **Runtime Validation**: Zod schemas with custom validation

### Sanitization Architecture

**Current Request Flow:**

```
Request → ValidationPipe → Zod Sanitization → Controllers → Services → Database → Output Sanitization → Response
```

**Complete Security Pipeline:**

```
Request → Helmet → CORS → ValidationPipe → Rate Limiting → JWT Auth → Admin Role → Zod Sanitization → Controllers → Services → Database → Output Sanitization → Response
```

**Current Dependencies:**

```bash
# Already installed and configured
npm install dompurify jsdom @types/dompurify @types/jsdom
npm install class-validator class-transformer
npm install zod @nestjs/throttler
```

### File Upload Sanitization (Future Implementation)

**Note**: File upload feature is not currently planned for this API. When file uploads are added in the future, implement the following security measures:

**1. File Type Validation**
```typescript
// Future implementation example
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
const maxFileSize = 5 * 1024 * 1024 // 5MB

export const fileUploadConfig = {
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(new BadRequestException('Invalid file type'), false)
    }
    callback(null, true)
  },
  limits: { fileSize: maxFileSize },
}
```

**2. Filename Sanitization**
```typescript
// Sanitize uploaded filenames to prevent directory traversal
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars
    .replace(/\.{2,}/g, '_') // Remove multiple dots
    .substring(0, 255) // Limit length
}
```

**3. Content Scanning**
- Implement virus scanning using ClamAV or similar
- Check file headers to verify actual file type
- Scan for embedded scripts in documents

**4. Storage Security**
- Store files outside web root directory
- Generate unique identifiers for stored files
- Implement access control for file downloads
- Consider using cloud storage with proper IAM policies

**5. Image Processing**
- Re-encode images to remove metadata (EXIF)
- Resize/compress images to standard sizes
- Use libraries like Sharp for safe image manipulation

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
