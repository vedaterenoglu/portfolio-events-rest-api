# Portfolio Events API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  A production-ready, enterprise-grade REST API built with NestJS, TypeScript, and PostgreSQL
</p>


## 📖 Overview

The **Portfolio Events API** is a comprehensive backend service showcasing advanced NestJS development practices. Built with enterprise-grade architecture, it demonstrates production-ready patterns including authentication, authorization, comprehensive testing, and monitoring capabilities.

### 🎯 Key Features

- **🔐 Authentication & Authorization**: JWT-based auth with Clerk integration and role-based access control
- **🚀 High Performance**: Rate limiting, request optimization, and efficient database queries
- **🛡️ Enterprise Security**: Input validation, sanitization, and comprehensive security middleware
- **📊 Monitoring & Health**: Real-time health checks, system metrics, and graceful shutdown
- **🧪 Testing Excellence**: 100% test coverage with unit, integration, and E2E tests
- **📚 Type Safety**: Strict TypeScript with comprehensive type checking and validation

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

# Quality Assurance
npx tsc --noEmit          # Type checking
npm run lint              # Code linting
npm run format            # Code formatting

# Database
npx prisma studio         # Database GUI
npm run seed              # Seed sample data
```

### Project Structure
```
portfolio-events-rest-api/
├── src/
│   ├── admin/           # Admin-only operations
│   ├── auth/            # Authentication module
│   ├── cities/          # City management
│   ├── events/          # Event management
│   ├── guards/          # Auth & authorization
│   └── schemas/         # Data validation schemas
├── test/
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── e2e/             # End-to-end tests
├── .github/workflows/   # GitHub configuration
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

### Public Endpoints
- `GET /` - Welcome message
- `GET /api/events` - List all events with filtering
- `GET /api/events/:slug` - Get specific event
- `GET /api/cities` - List all cities
- `GET /health` - System health dashboard

### Admin Endpoints (Authentication Required)
- `POST /api/admin/events` - Create new event
- `PUT /api/admin/events/:id` - Update event
- `DELETE /api/admin/events/:id` - Delete event
- `POST /api/admin/cities` - Create new city
- `POST /admin/database/reset` - Reset database

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