# 🔧 Troubleshooting Guide

## 📋 Table of Contents
- [Common Issues](#common-issues)
- [Installation Problems](#installation-problems)
- [Database Issues](#database-issues)
- [Authentication Errors](#authentication-errors)
- [Payment Integration](#payment-integration)
- [Testing Issues](#testing-issues)
- [Deployment Problems](#deployment-problems)
- [Performance Issues](#performance-issues)
- [Development Environment](#development-environment)

## 🚨 Common Issues

### Application Won't Start

#### Problem: "Cannot find module" error
```
Error: Cannot find module '@nestjs/core'
```

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# If persists, clear npm cache
npm cache clean --force
npm install
```

#### Problem: Port already in use
```
Error: listen EADDRINUSE: address already in use :::3060
```

**Solution:**
```bash
# Find process using port
lsof -i :3060  # macOS/Linux
netstat -ano | findstr :3060  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in .env
PORT=3061
```

#### Problem: TypeScript compilation errors
```
error TS2307: Cannot find module './app.module' or its corresponding type declarations
```

**Solution:**
```bash
# Regenerate TypeScript paths
npx tsc --build --clean
npx tsc --build

# Check tsconfig.json paths
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## 💾 Database Issues

### Connection Problems

#### Problem: Database connection failed
```
PrismaClientInitializationError: Can't reach database server
```

**Solution:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Start PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql  # macOS

# Verify connection string
psql "postgresql://user:pass@localhost:5432/portfolio_events_db"
```

#### Problem: SSL connection required
```
error: no pg_hba.conf entry for host
```

**Solution:**
```bash
# Add SSL to connection string
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# For local development without SSL
DATABASE_URL="postgresql://user:pass@localhost:5432/db?sslmode=disable"
```

### Prisma Issues

#### Problem: Prisma client not generated
```
Error: @prisma/client did not initialize yet
```

**Solution:**
```bash
# Generate Prisma client
npx prisma generate

# Clear cache and regenerate
rm -rf node_modules/.prisma
npx prisma generate
```

#### Problem: Database schema out of sync
```
Error: The database schema is not empty
```

**Solution:**
```bash
# Reset database (WARNING: Deletes all data)
npx prisma db push --force-reset

# Or migrate existing schema
npx prisma db pull
npx prisma generate
```

#### Problem: Migration failed
```
Error: P3009 migrate found failed migrations
```

**Solution:**
```bash
# Mark migration as applied
npx prisma migrate resolve --applied "migration_name"

# Or reset migrations (development only)
npx prisma migrate reset
```

## 🔐 Authentication Errors

### Clerk Integration

#### Problem: Invalid Clerk keys
```
Error: Clerk: Missing publishable key
```

**Solution:**
```bash
# Verify environment variables
echo $CLERK_PUBLISHABLE_KEY
echo $CLERK_SECRET_KEY

# Check .env file format
CLERK_PUBLISHABLE_KEY=pk_test_... # No quotes
CLERK_SECRET_KEY=sk_test_...       # No quotes
```

#### Problem: JWT validation failed
```
Error: Unauthorized - Invalid token
```

**Solution:**
```javascript
// Check JWT configuration in Clerk Dashboard
// Ensure custom claims are set:
{
  "userId": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "role": "{{user.public_metadata.role}}"
}
```

#### Problem: Admin role not working
```
Error: Forbidden - Insufficient permissions
```

**Solution:**
```javascript
// In Clerk Dashboard, update user metadata:
{
  "publicMetadata": {
    "role": "admin"
  }
}

// Verify in API call headers:
Authorization: Bearer <jwt_with_admin_role>
```

## 💳 Payment Integration

### Stripe Issues

#### Problem: Stripe key not working
```
Error: Stripe: Invalid API Key provided
```

**Solution:**
```bash
# Verify key format
STRIPE_SECRET_KEY=sk_test_...  # Test key starts with sk_test_
STRIPE_SECRET_KEY=sk_live_...  # Live key starts with sk_live_

# Test Stripe connection
curl https://api.stripe.com/v1/charges \
  -u sk_test_your_key_here:
```

#### Problem: Checkout session creation failed
```
Error: Payment system error
```

**Solution:**
```javascript
// Check event price in database matches request
const event = await getEvent(slug);
console.log('DB Price:', event.price);
console.log('Request Price:', unitPrice);

// Ensure price calculation is correct
const expectedTotal = quantity * unitPrice;
if (totalAmount !== expectedTotal) {
  throw new Error('Price mismatch');
}
```

#### Problem: Webhook signature verification failed
```
Error: Stripe webhook signature verification failed
```

**Solution:**
```bash
# Use raw body for signature verification
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

# Verify webhook secret
STRIPE_WEBHOOK_SECRET=whsec_...  # Must match Stripe Dashboard
```

## 🧪 Testing Issues

### Test Failures

#### Problem: Tests timeout
```
Error: Timeout - Async callback was not invoked within 5000ms
```

**Solution:**
```javascript
// Increase timeout in jest config
{
  "testTimeout": 30000
}

// Or in specific test
jest.setTimeout(30000);
```

#### Problem: Database not isolated in tests
```
Error: Unique constraint violation in tests
```

**Solution:**
```javascript
// Use transactions for test isolation
beforeEach(async () => {
  await prisma.$transaction([
    prisma.tEvent.deleteMany(),
    prisma.tCity.deleteMany(),
  ]);
});

// Or use test containers
import { PostgreSqlContainer } from '@testcontainers/postgresql';
```

#### Problem: Coverage not meeting requirements
```
Error: Coverage for statements (75%) does not meet threshold (80%)
```

**Solution:**
```bash
# Generate coverage report
npm run test:unit:coverage

# View detailed report
open coverage/lcov-report/index.html

# Focus on uncovered lines
npm test -- --coverage --collectCoverageFrom='src/payments/**'
```

## 🚀 Deployment Problems

### Build Issues

#### Problem: Build fails in production
```
Error: Cannot find module 'typescript'
```

**Solution:**
```bash
# Move dev dependencies if needed for build
npm install --production=false

# Or use multi-stage Docker build
FROM node:20 AS builder
RUN npm ci
RUN npm run build

FROM node:20
COPY --from=builder /app/dist ./dist
```

#### Problem: Environment variables not loading
```
Error: Missing required environment variable
```

**Solution:**
```bash
# Verify variables are set
printenv | grep CLERK
printenv | grep STRIPE

# For Heroku
heroku config

# For Docker
docker-compose config
```

### Runtime Errors

#### Problem: Memory limit exceeded
```
Error: JavaScript heap out of memory
```

**Solution:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" node dist/main.js

# For PM2
pm2 start dist/main.js --node-args="--max-old-space-size=4096"
```

#### Problem: Too many database connections
```
Error: remaining connection slots are reserved
```

**Solution:**
```javascript
// Configure connection pool in Prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Limit connections
  connection_limit = 5
}

// Or in connection string
DATABASE_URL="postgresql://user:pass@host/db?connection_limit=5"
```

## ⚡ Performance Issues

### Slow Response Times

#### Problem: API endpoints responding slowly
**Solution:**
```javascript
// Add query optimization
const events = await prisma.tEvent.findMany({
  take: 10,  // Limit results
  select: {  // Select only needed fields
    id: true,
    name: true,
    slug: true,
  },
});

// Add indexes in schema
model TEvent {
  @@index([slug])
  @@index([citySlug])
  @@index([date])
}
```

#### Problem: High memory usage
**Solution:**
```bash
# Monitor memory usage
pm2 monit

# Analyze memory leaks
node --inspect dist/main.js
# Open chrome://inspect

# Optimize imports
// Instead of
import * as _ from 'lodash';
// Use
import debounce from 'lodash/debounce';
```

### Rate Limiting Issues

#### Problem: Getting rate limited
```
Error: Too Many Requests
```

**Solution:**
```javascript
// Adjust rate limits in app.module.ts
ThrottlerModule.forRoot([
  {
    name: 'short',
    ttl: 1000,
    limit: 20,  // Increase limit
  },
  {
    name: 'long',
    ttl: 60000,
    limit: 200,  // Increase limit
  },
]),

// Or disable for specific endpoints
@SkipThrottle()
@Get('health')
```

## 🛠️ Development Environment

### IDE Issues

#### Problem: TypeScript IntelliSense not working
**Solution:**
```bash
# Restart TypeScript server in VS Code
Cmd+Shift+P -> "TypeScript: Restart TS Server"

# Clear TypeScript cache
rm -rf node_modules/.cache/typescript
```

#### Problem: ESLint not detecting issues
**Solution:**
```bash
# Clear ESLint cache
rm -rf .eslintcache
npx eslint . --fix

# Verify ESLint config
npx eslint --print-config src/main.ts
```

### Git Issues

#### Problem: Large file preventing push
```
Error: File too large for GitHub
```

**Solution:**
```bash
# Remove large file from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/large/file" \
  --prune-empty --tag-name-filter cat -- --all

# Or use Git LFS
git lfs track "*.sql"
git add .gitattributes
git lfs migrate import --include="*.sql"
```

## 📊 Logging & Debugging

### Enable Debug Logging

```javascript
// In main.ts
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'verbose'],
  });
}

// In services
private readonly logger = new Logger(EventsService.name);
this.logger.debug('Debug message');
```

### Database Query Logging

```javascript
// Enable Prisma logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Or in environment
DATABASE_URL="postgresql://...?log=query"
```

## 🆘 Getting Additional Help

### Resources
1. **Check logs first**
   ```bash
   # Application logs
   pm2 logs
   docker logs container_name
   heroku logs --tail
   
   # System logs
   journalctl -u portfolio-api
   ```

2. **Search existing issues**
   - [GitHub Issues](https://github.com/vedaterenoglu/portfolio-events-rest-api/issues)
   - [Stack Overflow](https://stackoverflow.com/questions/tagged/nestjs)

3. **Community Support**
   - [NestJS Discord](https://discord.gg/nestjs)
   - [Prisma Slack](https://slack.prisma.io/)

### Reporting New Issues

When reporting issues, include:
- Error message and stack trace
- Steps to reproduce
- Environment details (OS, Node version, npm version)
- Relevant configuration files
- Minimal reproducible example

### Debug Checklist
- [ ] Check error logs
- [ ] Verify environment variables
- [ ] Test database connection
- [ ] Check network connectivity
- [ ] Review recent code changes
- [ ] Test in isolation
- [ ] Compare with working environment

---

**Still stuck?** Contact support at info@vedaterenoglu.com with detailed error information.