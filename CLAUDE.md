# AI Agent Development Guidelines - Portfolio Events API

## 📋 Essential Project Information

**For comprehensive project details, architecture, and API documentation, refer to:**  
→ **[PROJECT.md](./PROJECT.md)** - Complete technical documentation

## 🎯 Core Development Principles

### Pre-Development Assessment (MANDATORY for each iteration)

Before ANY code changes, assess:

1. **What**: Clear requirements and specifications
2. **Why**: Business logic and purpose understanding
3. **Expectations**: Predicted outcomes for current iteration
4. **Risks**: Potential failure modes and side effects
5. **Rollback**: Recovery procedures to restore previous state

## 🔄 Iteration Implementation Workflow

### The ONE Change Rule

Each iteration allows ONLY ONE of these actions:

- **ADD**: Write ONE test suite OR ONE file (never both)
- **EDIT**: Edit ONE test OR make ONE change in ONE file (never both)

### Complete Iteration Pattern

1. **Start Iteration** → State the Pre-Development Assessment
2. **Make ONE Change** → Follow the ONE Change Rule
3. **Fix TypeScript Errors** → Run `npx tsc --noEmit` (alias: `nxtsc`)
4. **Fix Lint Errors** → Run `npm run lint` (alias: `nrl`)
5. **Run Tests** → Execute relevant test command
6. **Report Coverage** → Show ALL metrics (statements, branches, functions, lines)
7. **Report Failng tests** → Report the tsts fails.
8. **Wait for Confirmation** → STOP and wait for user approval
9. **Repeat** → Continue with next iteration

## 📊 Testing Requirements

### Coverage Standards

- **Target**: 100% for statements, branches, and functions
- **Minimum**: 80% for each metric (only if 100% is impossible)
- **Requirement**: Each file must meet standards independently

### Test File Conventions

- Unit tests: `{filename}.spec.ts`
- Integration tests: `{filename}.integration.spec.ts`
- E2E tests: `{filename}.e2e-spec.ts`

### Test Commands Reference

```bash
# See PROJECT.md "Quick Start Commands" section for full list
npm run test:unit:coverage      # Unit tests with coverage
npm run test:integration:coverage # Integration tests with coverage
npm run test:e2e:coverage       # E2E tests with coverage
npm run test:ci                 # All tests sequentially
npm run test:parallel           # Parallel test execution (optimized)
npm run test:parallel:sequential # Fallback sequential mode
```

## ⚡ Quick Command Aliases

```bash
nxtsc  # npx tsc --noEmit (TypeScript checking)
nrl    # npm run lint (ESLint checking)
veh    # Show all custom shortcuts
```

## 🚨 Critical Rules

1. **NEVER** use `any` type - Always use proper TypeScript types
2. **NEVER** proceed without fixing all TYPESCRIPT, ESLINT AND PRETTIER errors when add or edit the code.
3. **NEVER** proceed without meeting coverage requirements
4. **NEVER** skip waiting for user confirmation between iterations
5. **NEVER** make multiple changes in a single iteration
6. **ALWAYS** report failing tests immediately

## 📋 ESLint Rules for AI Agents

**IMPORTANT**: When creating new files, follow these ESLint rules to avoid linting errors:

### Code Style Rules

- **No semicolons**: Use `semi: ['error', 'never']` - never end lines with semicolons
- **Arrow functions**: Use `arrowParens: 'avoid'` - no parentheses for single parameters
- **Console usage**: Only `console.warn` and `console.error` allowed - no `console.log`
- **File ending**: ALWAYS add a newline at the very end of every file - required by Prettier

### TypeScript Rules

- **No explicit any**: `@typescript-eslint/no-explicit-any: 'error'` - always use proper types
- **No floating promises**: `@typescript-eslint/no-floating-promises: 'error'` - always handle promises
- **No unsafe operations**: No unsafe calls, arguments, or member access on `any` types
- **Template expressions**: Only allow numbers and booleans in template literals

### Import Order Rules

Follow this exact import order with newlines between groups:

1. **Built-in modules** (Node.js: `fs`, `path`)
2. **External modules** (Third-party: `express`, `zod`, `@nestjs/...`)
3. **Internal modules** (Your modules with aliases: `@/...`)
4. **Parent imports** (Relative: `../`)
5. **Sibling imports** (Relative: `./`)
6. **Index imports** (Current directory: `./`)
7. **Object imports** (Destructuring)
8. **Type imports** (Type-only)

### Security Rules

- **No eval**: `security/detect-eval-with-expression: 'error'`
- **No non-literal require**: `security/detect-non-literal-require: 'error'`
- Follow all `eslint-plugin-security` recommended rules

### Example of Correct Code Style

```typescript
// Correct import order with newlines
import { readFileSync } from 'fs' // Built-in

import { Injectable } from '@nestjs/common' // External
import { z } from 'zod' // External (alphabetical)

import { DatabaseService } from '../database/database.service' // Parent
import { UserEntity } from './user.entity' // Sibling

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {} // No semicolon

  async getUser(id: string): Promise<UserEntity> {
    // Proper return type
    const user = await this.databaseService.findUser(id) // Await promises
    return user
  }
}
```

## 📁 Key File Locations

- **Project Documentation**: `src/documents/ignore/PROJECT.md`
- **API Endpoints**: See comprehensive list below
- **Database Schema**: See PROJECT.md "Database Schema"
- **Security Config**: See PROJECT.md "Security Implementation"
- **Testing Strategy**: See PROJECT.md "Testing Strategy"

## 🌐 Complete API Endpoints Reference

### Base URL

- **Development**: `http://localhost:3060`
- **Production**: `https://portfolio-events-rest-api.demo.vedaterenoglu.com`

### Authentication

- **Type**: JWT Bearer Token (Clerk-based)
- **Header**: `Authorization: Bearer <jwt-token>`
- **Required for**: All admin endpoints (`/api/admin/*` and `/admin/*`)

### Public Endpoints (No Authentication)

```
GET    /                          - Hello message
GET    /api/events                - Get all events (with filtering)
GET    /api/events/:slug          - Get event by slug
GET    /api/cities                - Get all cities (with filtering)
GET    /health                    - Health dashboard (HTML/JSON)
GET    /health/json               - Health status (JSON)
GET    /ready                     - Readiness check
GET    /metrics                   - System metrics
GET    /shutdown                  - Shutdown status
POST   /api/auth/test-token       - Get mock JWT token
POST   /api/auth/test-token-real  - Get real JWT token via Clerk
```

### Admin Endpoints (JWT + Admin Role Required)

```
POST   /api/admin/events          - Create new event
PUT    /api/admin/events/:id      - Update event by ID (numeric)
DELETE /api/admin/events/:id      - Delete event by ID (numeric)
POST   /api/admin/cities          - Create new city
PUT    /api/admin/cities/:citySlug - Update city by slug (string)
POST   /admin/database/reset      - Reset database and seed data
DELETE /admin/database/truncate   - Truncate all tables
```

### Key Path Parameter Types

- **Event ID**: `number` (integer) - Used in `/api/admin/events/:id`
- **Event Slug**: `string` (max 100 chars) - Used in `/api/events/:slug`
- **City Slug**: `string` (max 50 chars) - Used in `/api/admin/cities/:citySlug`

### Critical Path Patterns

- **Events**: Always use `/api/admin/events` (WITH `/api` prefix)
- **Cities**: Always use `/api/admin/cities` (WITH `/api` prefix)
- **Database**: Always use `/admin/database/` (WITHOUT `/api` prefix)

### OpenAPI Documentation

- **URL**: `/api/docs` - Interactive Swagger UI with authentication

## 🛠️ Development Workflow Examples

For detailed examples of:

- Adding new API endpoints
- Creating new modules
- Implementing middleware
- Writing tests
- Troubleshooting common issues

→ **Refer to PROJECT.md sections:**

- "Development Workflow"
- "Common Tasks & Solutions"
- "Troubleshooting Guide"
- "Performance Optimization"

## 🤖 AI Agent Quick Reference

```bash
# Before starting work
git pull origin main
npm install

# During development (each iteration)
npx tsc --noEmit  # Check types (alias: nxtsc)
npm run lint      # Check code quality (alias: nrl)

# Before committing
npm run test:ci   # Run all tests sequentially
npm run test:parallel # Run tests in parallel (faster)
npm run format    # Format code

# Testing and Code Quality
# Run before committing changes:
```

---

**Remember**: This document provides the essential workflow and rules. For technical details, architecture, and implementation guidance, always consult **[PROJECT.md](./src/documents/ignore/PROJECT.md)**.


## 🤖 AI Agent PROJECT.md Reference

**CRITICAL**: AI Agents MUST read PROJECT.md before starting any development work. It contains:

- Complete architecture overview and directory structure
- Database schema and API endpoints documentation
- Security implementation details
- Testing strategy and development configuration
- Development workflow examples and troubleshooting guide
- All essential technical specifications for the project

**Path**: `src/documents/ignore/PROJECT.md`
