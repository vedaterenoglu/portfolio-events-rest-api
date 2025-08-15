# Portfolio Events API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  <strong>Production-Ready Enterprise Event Management REST API</strong><br>
  Built with NestJS, TypeScript, PostgreSQL, and Stripe
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11.x-red?style=flat-square&logo=nestjs" alt="NestJS">
  <img src="https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-14.x-blue?style=flat-square&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Stripe-18.x-purple?style=flat-square&logo=stripe" alt="Stripe">
  <img src="https://img.shields.io/badge/Test%20Coverage-100%25-brightgreen?style=flat-square" alt="Coverage">
</p>

## 📖 Overview

The **Portfolio Events API** is a comprehensive enterprise-grade backend service demonstrating advanced NestJS development practices with real-world payment processing integration. This production-ready API showcases modern architecture patterns, secure authentication, payment processing with Stripe, and comprehensive testing strategies achieving 100% code coverage.

### 🎯 Key Features

- **💳 Payment Processing**: Secure Stripe integration for event ticket purchases with checkout sessions
- **🔐 Authentication & Authorization**: JWT-based auth with Clerk SDK integration and role-based access control
- **🚀 High Performance**: Dual-layer rate limiting, optimized queries, and connection pooling
- **🛡️ Enterprise Security**: Zod validation, DOMPurify sanitization, and comprehensive security headers
- **📊 Monitoring & Health**: Real-time health dashboard, system metrics, and graceful shutdown
- **🧪 Testing Excellence**: 100% test coverage across unit, integration, and E2E test suites
- **📚 Type Safety**: Strict TypeScript with Prisma-generated types and runtime validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or 20.x
- PostgreSQL 14.x or higher
- npm 8.x or higher

### Installation
```bash
# Clone repository
git clone https://github.com/vedaterenoglu/portfolio-events-rest-api.git
cd portfolio-events-rest-api

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Setup database
npx prisma generate
npx prisma db push
npm run seed

# Start development server
npm run start:dev
```

**API Available at**: `http://localhost:3060`

## 📋 Documentation

### 📚 Comprehensive Guides

- **[🔧 Installation & Setup](src/documents/readme-sub-documents/installation-setup.md)** - Complete setup guide with prerequisites, database configuration, and troubleshooting
- **[🌐 API Documentation](src/documents/readme-sub-documents/api-documentation.md)** - Detailed API endpoints, authentication, and usage examples
- **[🧪 Testing Guide](src/documents/readme-sub-documents/testing-guide.md)** - Testing strategies, coverage requirements, and best practices
- **[📦 Deployment Guide](src/documents/readme-sub-documents/deployment-guide.md)** - Production deployment strategies for various platforms

### 🔍 Interactive Documentation

- **Swagger UI**: `http://localhost:3060/api/docs`
- **Health Dashboard**: `http://localhost:3060/health`

## 🛠️ Development

### Quick Commands
```bash
# Development
npm run start:dev          # Hot reload development server
npm run start:debug        # Debug mode with inspector

# Testing
npm run test:unit:coverage # Unit tests with coverage
npm run test:integration:coverage # Integration tests with coverage  
npm run test:e2e:coverage  # E2E tests with coverage
npm run test:all          # Run all test suites sequentially

# Quality Assurance
npx tsc --noEmit          # Type checking
npm run lint              # Code linting
npm run format            # Code formatting

# Database
npx prisma studio         # Database GUI
npm run seed              # Seed sample data
npx prisma generate       # Generate Prisma client
npx prisma db push        # Push schema to database

# Build & Production
npm run build             # Build for production
npm run start:prod        # Start production server
npm run vercel-build      # Vercel deployment build
```

### Project Structure
```
portfolio-events-rest-api/
├── src/
│   ├── admin/           # Admin-only operations
│   ├── auth/            # JWT authentication module
│   ├── cities/          # City management module
│   ├── database/        # Database service & Prisma
│   ├── events/          # Event management module
│   ├── guards/          # Auth & authorization guards
│   ├── health/          # Health check endpoints
│   ├── middlewares/     # Custom middleware
│   ├── payments/        # Stripe payment integration
│   ├── schemas/         # Zod validation schemas
│   └── services/        # Shared services (logger, etc.)
├── test/
│   ├── unit/            # Unit tests (100% coverage)
│   ├── integration/     # Integration tests (100% coverage)
│   └── e2e/             # End-to-end tests (100% coverage)
├── prisma/
│   └── schema.prisma    # Database schema definition
├── .github/workflows/   # CI/CD configuration
└── scripts/             # Build and automation scripts
```

## 🔐 Security Features

- **JWT Authentication** with Clerk SDK integration
- **Role-based Authorization** (Admin/User permissions)
- **Input Validation** with Zod schemas
- **SQL Injection Prevention** via Prisma ORM
- **Rate Limiting** with dual-layer protection
- **CORS Configuration** for cross-origin security
- **Helmet Security Headers** for HTTP security
- **Data Sanitization** with DOMPurify

## 📊 Performance & Monitoring

### System Health
- **Health Checks**: `/health` endpoint with detailed metrics
- **Readiness Probes**: `/ready` for deployment verification
- **System Metrics**: `/metrics` with performance data
- **Graceful Shutdown**: Proper cleanup on termination

### Performance Optimization
- **Connection Pooling**: Efficient database connections
- **Request Optimization**: Efficient query patterns
- **Memory Management**: Optimized resource usage
- **Caching Strategy**: Smart data caching

## 🧪 Testing & Quality

### Coverage Statistics
- **Unit Tests**: 100% coverage
- **Integration Tests**: 100% coverage
- **E2E Tests**: 100% coverage
- **Overall Coverage**: 100% across all metrics

### Testing Strategy
- **Unit Testing**: Component-level testing with Jest
- **Integration Testing**: Module interaction testing
- **E2E Testing**: Complete workflow testing
- **Security Testing**: Automated vulnerability scanning

## 🌐 API Endpoints

### Public Endpoints (No Authentication)
```
GET    /                          - Welcome message
GET    /api/events                - List all events (with filtering & pagination)
GET    /api/events/:slug          - Get specific event by slug
GET    /api/cities                - List all cities (with filtering)
GET    /health                    - Health dashboard (HTML/JSON)
GET    /health/json               - Health status (JSON only)
GET    /ready                     - Readiness check
GET    /metrics                   - System metrics
```

### Payment Endpoints (No Authentication)
```
POST   /api/payments/checkout     - Create Stripe checkout session
GET    /api/payments/verify/:id   - Verify payment session
```

### Admin Endpoints (JWT + Admin Role Required)
```
POST   /api/admin/events          - Create new event
PUT    /api/admin/events/:id      - Update event (numeric ID)
DELETE /api/admin/events/:id      - Delete event (numeric ID)
POST   /api/admin/cities          - Create new city
PUT    /api/admin/cities/:citySlug - Update city by slug
POST   /admin/database/reset      - Reset database and seed data
DELETE /admin/database/truncate   - Truncate all tables
```

### Interactive Documentation
```
GET    /api/docs                  - Swagger UI with full API documentation
```

## 🚀 Deployment

### Supported Platforms
- **Docker**: Complete containerization support
- **AWS EC2**: Production deployment guide
- **Heroku**: One-click deployment
- **Vercel**: Serverless deployment
- **VPS**: Traditional server deployment

### Production Features
- **Load Balancing**: Horizontal scaling support
- **SSL/TLS**: HTTPS encryption
- **Monitoring**: Application performance monitoring
- **Backup Strategy**: Database backup automation
- **Rollback Support**: Zero-downtime deployments

## 📞 Support & Community

### Resources
- **Documentation**: Comprehensive guides and API reference
- **Issue Tracker**: [GitHub Issues](https://github.com/vedaterenoglu/portfolio-events-rest-api/issues)
- **Contributing**: [Contributing Guidelines](CONTRIBUTING.md)
- **License**: [MIT License](LICENSE)

### Author
**Vedat Erenoglu**
- Website: [vedaterenoglu.com](https://vedaterenoglu.com)
- Email: info@vedaterenoglu.com
- LinkedIn: [linkedin.com/in/vedaterenoglu](https://www.linkedin.com/in/vedaterenoglu/)

---

<p align="center">
  <strong>Built with ❤️ using NestJS, TypeScript, and PostgreSQL</strong>
</p>

<p align="center">
  <a href="https://portfolio-events-rest-api.demo.vedaterenoglu.com">🌐 Live Demo</a> •
  <a href="https://github.com/vedaterenoglu/portfolio-events-rest-api">📂 Repository</a> •
  <a href="src/documents/readme-sub-documents/api-documentation.md">📖 API Docs</a>
</p>