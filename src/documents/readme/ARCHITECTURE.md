# 🏗️ Architecture Documentation

## 📐 System Architecture Overview

The Portfolio Events API follows a modular, layered architecture built on NestJS framework principles, implementing Domain-Driven Design (DDD) patterns with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────┐
│                    Client Applications                   │
│         (Web App, Mobile App, Third-party Services)      │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                      API Gateway                         │
│        (Rate Limiting, CORS, Authentication)             │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    NestJS Application                    │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Controllers Layer                   │    │
│  │    (REST endpoints, Request/Response handling)  │    │
│  └─────────────────────────────────────────────────┘    │
│                           │                              │
│  ┌─────────────────────────────────────────────────┐    │
│  │               Services Layer                     │    │
│  │     (Business logic, Data processing)           │    │
│  └─────────────────────────────────────────────────┘    │
│                           │                              │
│  ┌─────────────────────────────────────────────────┐    │
│  │             Data Access Layer                    │    │
│  │      (Prisma ORM, Database abstraction)         │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                  External Services                       │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐    │
│  │PostgreSQL│  │  Clerk   │  │      Stripe        │    │
│  │ Database │  │   Auth   │  │     Payments       │    │
│  └──────────┘  └──────────┘  └────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Core Design Principles

### SOLID Principles
- **Single Responsibility**: Each module handles one business domain
- **Open/Closed**: Extensible through dependency injection
- **Liskov Substitution**: Interfaces define contracts
- **Interface Segregation**: Focused, specific interfaces
- **Dependency Inversion**: High-level modules depend on abstractions

### Architectural Patterns
- **Dependency Injection**: IoC container manages dependencies
- **Repository Pattern**: Database access abstraction
- **DTO Pattern**: Data Transfer Objects for validation
- **Guard Pattern**: Authentication and authorization
- **Middleware Pattern**: Cross-cutting concerns
- **Module Pattern**: Feature encapsulation

## 📁 Project Structure

```
src/
├── admin/                    # Admin module
│   ├── admin.controller.ts  # Admin endpoints
│   ├── admin.service.ts     # Admin business logic
│   └── admin.module.ts      # Module definition
│
├── auth/                     # Authentication module
│   ├── auth.controller.ts   # Auth endpoints
│   ├── auth.service.ts      # JWT validation
│   ├── auth.module.ts       # Module definition
│   └── jwt.strategy.ts      # JWT strategy
│
├── cities/                   # Cities module
│   ├── cities.controller.ts # City endpoints
│   ├── cities.service.ts    # City business logic
│   └── cities.module.ts     # Module definition
│
├── database/                 # Database module
│   ├── database.service.ts  # Prisma client wrapper
│   └── database.module.ts   # Global database module
│
├── events/                   # Events module
│   ├── events.controller.ts # Event endpoints
│   ├── events.service.ts    # Event business logic
│   └── events.module.ts     # Module definition
│
├── guards/                   # Authorization guards
│   ├── admin.guard.ts       # Admin role guard
│   ├── auth.guard.ts        # JWT auth guard
│   └── api-key.guard.ts     # API key guard
│
├── health/                   # Health monitoring
│   ├── health.controller.ts # Health endpoints
│   └── health.module.ts     # Module definition
│
├── middlewares/              # Custom middleware
│   ├── logger.middleware.ts # Request logging
│   └── security.middleware.ts # Security headers
│
├── payments/                 # Payments module
│   ├── payments.controller.ts # Payment endpoints
│   ├── payments.service.ts  # Stripe integration
│   └── payments.module.ts   # Module definition
│
├── schemas/                  # Validation schemas
│   ├── event.schema.ts      # Event DTOs
│   ├── city.schema.ts       # City DTOs
│   └── payment.schema.ts    # Payment DTOs
│
├── services/                 # Shared services
│   └── logger/              # Logger service
│       ├── logger.service.ts
│       └── logger.module.ts
│
├── app.module.ts            # Root application module
├── main.ts                  # Application bootstrap
└── bootstrap.ts             # Server configuration
```

## 🔧 Module Architecture

### Module Dependency Graph
```
                    AppModule
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    CoreModules    FeatureModules  SharedModules
        │               │               │
    ├─DatabaseModule ├─EventsModule ├─LoggerModule
    ├─AuthModule     ├─CitiesModule └─ConfigModule
    └─HealthModule   ├─PaymentsModule
                     └─AdminModule
```

### Module Structure Pattern
```typescript
// Feature Module Template
@Module({
  imports: [
    DatabaseModule,      // Data access
    LoggerModule,        // Logging
    CommonModule,        // Shared utilities
  ],
  controllers: [
    FeatureController,   // REST endpoints
  ],
  providers: [
    FeatureService,      // Business logic
    FeatureRepository,   // Data access
  ],
  exports: [
    FeatureService,      // Export for other modules
  ],
})
export class FeatureModule {}
```

## 🔐 Security Architecture

### Defense in Depth
```
Layer 1: Network Security
├── Rate Limiting (IP-based)
├── CORS Policy
└── HTTPS/TLS

Layer 2: Application Security
├── JWT Authentication
├── Role-based Authorization
├── Input Validation (Zod)
└── SQL Injection Prevention (Prisma)

Layer 3: Data Security
├── Password Hashing
├── Data Sanitization (DOMPurify)
├── Secure Headers (Helmet)
└── Environment Variables

Layer 4: Monitoring & Auditing
├── Request Logging
├── Error Tracking
├── Security Events
└── Performance Metrics
```

### Authentication Flow
```
Client                  API                    Clerk               Database
  │                      │                       │                    │
  ├──Login Request──────▶│                       │                    │
  │                      ├──Verify Credentials──▶│                    │
  │                      │◀──JWT Token───────────┤                    │
  │◀──JWT Token──────────┤                       │                    │
  │                      │                       │                    │
  ├──API Request────────▶│                       │                    │
  │  (with JWT)          ├──Validate JWT────────▶│                    │
  │                      │◀──User Info───────────┤                    │
  │                      ├──Check Permissions────────────────────────▶│
  │                      │◀──Authorization Result────────────────────┤
  │◀──Response───────────┤                       │                    │
```

## 💾 Database Architecture

### Schema Design
```sql
-- Events Table
CREATE TABLE "TEvent" (
  id            INTEGER PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(100) UNIQUE NOT NULL,
  city          VARCHAR(100) NOT NULL,
  citySlug      VARCHAR(50) NOT NULL,
  location      VARCHAR(255) NOT NULL,
  date          TIMESTAMP NOT NULL,
  organizerName VARCHAR(255) NOT NULL,
  imageUrl      TEXT,
  alt           VARCHAR(255),
  description   TEXT,
  price         DECIMAL(10,2) NOT NULL,
  createdAt     TIMESTAMP DEFAULT NOW(),
  updatedAt     TIMESTAMP DEFAULT NOW()
);

-- Cities Table
CREATE TABLE "TCity" (
  id        INTEGER PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  slug      VARCHAR(50) UNIQUE NOT NULL,
  country   VARCHAR(100),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_event_slug ON "TEvent"(slug);
CREATE INDEX idx_event_city ON "TEvent"(citySlug);
CREATE INDEX idx_event_date ON "TEvent"(date);
CREATE INDEX idx_city_slug ON "TCity"(slug);
```

### Data Access Patterns
```typescript
// Repository Pattern with Prisma
class EventRepository {
  constructor(private database: DatabaseService) {}

  async findAll(filters: EventFilters): Promise<Event[]> {
    return this.database.tEvent.findMany({
      where: this.buildWhereClause(filters),
      orderBy: { date: 'desc' },
      take: filters.limit,
      skip: filters.offset,
    });
  }

  private buildWhereClause(filters: EventFilters) {
    // Complex query building logic
  }
}
```

## 🚀 Performance Architecture

### Optimization Strategies

1. **Database Optimization**
   - Connection pooling (max: 10 connections)
   - Indexed queries on frequently accessed fields
   - Pagination for large datasets
   - Query result caching

2. **Application Optimization**
   - Lazy loading of modules
   - Efficient serialization with class-transformer
   - Memory-efficient streaming for large responses
   - Request/Response compression

3. **Caching Strategy**
   ```
   Client Cache (Browser)
        │
        ▼
   CDN Cache (Static Assets)
        │
        ▼
   Application Cache (Redis - future)
        │
        ▼
   Database Query Cache
   ```

### Rate Limiting Architecture
```typescript
// Dual-layer rate limiting
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,  // 1 second
        limit: 10,  // 10 requests
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests
      },
    ]),
  ],
})
```

## 🧪 Testing Architecture

### Testing Pyramid
```
         E2E Tests
         /        \
        /  (10%)   \
       /____________\
      Integration Tests
      /              \
     /    (30%)       \
    /__________________\
        Unit Tests
    /                  \
   /      (60%)         \
  /______________________\
```

### Test Organization
```
test/
├── unit/                    # Isolated component tests
│   ├── events/
│   ├── cities/
│   └── payments/
├── integration/             # Module interaction tests
│   ├── services/
│   └── controllers/
└── e2e/                     # Full workflow tests
    ├── public-endpoints.e2e.spec.ts
    └── admin-endpoints.e2e.spec.ts
```

### Testing Strategy
- **Unit Tests**: Mock all dependencies, test in isolation
- **Integration Tests**: Test module interactions with test database
- **E2E Tests**: Test complete user workflows
- **Coverage Requirements**: 100% for all metrics

## 🔄 Deployment Architecture

### Container Architecture
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3060
CMD ["node", "dist/main.js"]
```

### Production Deployment
```
                Load Balancer
                     │
        ┌────────────┼────────────┐
        │            │            │
    Instance 1   Instance 2   Instance 3
        │            │            │
        └────────────┼────────────┘
                     │
                PostgreSQL
               (Primary-Replica)
```

## 🔄 Data Flow Architecture

### Request Lifecycle
```
1. Client Request
      ↓
2. Rate Limiter
      ↓
3. CORS Middleware
      ↓
4. Authentication Guard
      ↓
5. Authorization Guard
      ↓
6. Validation Pipe (DTO)
      ↓
7. Controller Method
      ↓
8. Service Layer
      ↓
9. Database Query
      ↓
10. Response Transformation
      ↓
11. Client Response
```

### Payment Processing Flow
```
User                API              Stripe           Database
 │                   │                 │                │
 ├─Select Event─────▶│                 │                │
 │                   ├─Get Event────────────────────────▶│
 │                   │◀─Event Details───────────────────┤
 │◀─Show Price───────┤                 │                │
 │                   │                 │                │
 ├─Purchase─────────▶│                 │                │
 │                   ├─Create Session──▶│                │
 │                   │◀─Checkout URL────┤                │
 │◀─Redirect─────────┤                 │                │
 │                   │                 │                │
 ├─Complete Payment──────────────────▶│                │
 │◀─Success Page─────────────────────┤                │
 │                   │                 │                │
 └─Verify────────────▶─Verify Session──▶│                │
                     │◀─Session Status──┤                │
                     └─Log Transaction──────────────────▶│
```

## 🛡️ Error Handling Architecture

### Error Hierarchy
```typescript
BaseException
├── ValidationException (400)
├── UnauthorizedException (401)
├── ForbiddenException (403)
├── NotFoundException (404)
├── ConflictException (409)
├── RateLimitException (429)
└── InternalServerException (500)
```

### Global Exception Filter
```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Centralized error handling
    // Logging
    // Error transformation
    // Client response
  }
}
```

## 📊 Monitoring Architecture

### Observability Stack
```
Application Metrics
      │
      ├── Health Checks
      │   ├── Database connectivity
      │   ├── External service availability
      │   └── System resource usage
      │
      ├── Performance Metrics
      │   ├── Response times
      │   ├── Throughput
      │   └── Error rates
      │
      └── Business Metrics
          ├── API usage
          ├── Payment transactions
          └── User activity
```

## 🔗 Integration Architecture

### External Service Integration
```
Application
    │
    ├── Clerk (Authentication)
    │   ├── JWT validation
    │   ├── User management
    │   └── Role management
    │
    ├── Stripe (Payments)
    │   ├── Checkout sessions
    │   ├── Payment processing
    │   └── Webhook handling
    │
    └── PostgreSQL (Data)
        ├── Transactional operations
        ├── Query optimization
        └── Connection pooling
```

## 📈 Scalability Considerations

### Horizontal Scaling
- Stateless application design
- Session management via JWT
- Database connection pooling
- Load balancer ready

### Vertical Scaling
- Efficient memory usage
- Optimized CPU utilization
- Configurable worker threads
- Resource monitoring

### Future Enhancements
- Redis caching layer
- Message queue integration
- Microservices migration path
- GraphQL API layer
- WebSocket support

---

**Related Documentation:**
- [API Reference](./API.md) - Detailed endpoint documentation
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [Contributing Guide](./CONTRIBUTING.md) - Development practices