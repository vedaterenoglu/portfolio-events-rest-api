# 🔧 Installation & Setup Guide

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.x or 20.x (LTS versions)
- **PostgreSQL**: 14.x or higher
- **npm**: 8.x or higher
- **Git**: 2.x or higher
- **Operating System**: macOS, Linux, or Windows with WSL2

### Required Accounts
- **Clerk Account**: For authentication (https://clerk.dev)
- **Stripe Account**: For payment processing (https://stripe.com)
- **PostgreSQL Database**: Local or cloud-hosted

## 🚀 Installation Steps

### 1. Clone Repository
```bash
git clone https://github.com/vedaterenoglu/portfolio-events-rest-api.git
cd portfolio-events-rest-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

#### Create Environment File
```bash
cp .env.example .env
```

#### Configure Environment Variables
Edit `.env` file with your credentials:

```env
# Server Configuration
NODE_ENV=development
PORT=3060
APP_URL=http://localhost:3060

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/portfolio_events_db?schema=public"

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Security Configuration
JWT_SECRET=your_strong_jwt_secret_key_here
CORS_ORIGINS=http://localhost:3000,http://localhost:3060

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
```

### 4. Database Setup

#### Create Database
```bash
# Using PostgreSQL command line
createdb portfolio_events_db

# Or using psql
psql -U postgres -c "CREATE DATABASE portfolio_events_db;"
```

#### Generate Prisma Client
```bash
npx prisma generate
```

#### Push Schema to Database
```bash
npx prisma db push
```

#### Seed Sample Data
```bash
npm run seed
```

### 5. Verify Installation
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Run linting
npm run lint

# Run tests
npm run test:unit
```

### 6. Start Development Server
```bash
npm run start:dev
```

Server will be available at: `http://localhost:3060`

## 🔑 Service Configuration

### Clerk Setup

1. **Create Clerk Application**
   - Go to https://dashboard.clerk.dev
   - Create new application
   - Choose JWT authentication strategy

2. **Configure JWT Template**
   - Navigate to JWT Templates
   - Create custom template with these claims:
     ```json
     {
       "userId": "{{user.id}}",
       "email": "{{user.primary_email_address}}",
       "role": "{{user.public_metadata.role}}"
     }
     ```

3. **Set Admin Users**
   - In Clerk Dashboard, go to Users
   - Edit user metadata
   - Add to public_metadata:
     ```json
     {
       "role": "admin"
     }
     ```

### Stripe Setup

1. **Create Stripe Account**
   - Sign up at https://dashboard.stripe.com
   - Get API keys from Developers section

2. **Configure Webhooks** (Optional for local development)
   - Add webhook endpoint: `https://your-domain.com/api/payments/webhook`
   - Select events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`

3. **Test Mode**
   - Use test API keys for development
   - Test card: `4242 4242 4242 4242`

### PostgreSQL Setup

#### Local Installation

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql-14 postgresql-client-14
sudo systemctl start postgresql
```

**Windows:**
- Download installer from https://www.postgresql.org/download/windows/
- Run installer and follow setup wizard

#### Cloud Database Options

**Supabase:**
```bash
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
```

**Railway:**
```bash
DATABASE_URL="postgresql://postgres:[password]@[host].railway.app:[port]/railway"
```

**Neon:**
```bash
DATABASE_URL="postgresql://[user]:[password]@[host].neon.tech/[database]?sslmode=require"
```

## 🧪 Testing Setup

### Run All Tests
```bash
# Unit tests with coverage
npm run test:unit:coverage

# Integration tests with coverage
npm run test:integration:coverage

# E2E tests with coverage
npm run test:e2e:coverage

# All tests sequentially
npm run test:all
```

### Test Database Configuration
For testing, use a separate database:

```env
# .env.test
DATABASE_URL="postgresql://username:password@localhost:5432/portfolio_events_test?schema=public"
NODE_ENV=test
```

## 🐳 Docker Setup (Optional)

### Using Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: portfolio_events_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3060:3060"
    environment:
      DATABASE_URL: "postgresql://postgres:postgres@postgres:5432/portfolio_events_db"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### Start with Docker
```bash
docker-compose up -d
```

## 🔧 Common Setup Issues

### Port Already in Use
```bash
# Change port in .env file
PORT=3061
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection string
psql "postgresql://username:password@localhost:5432/portfolio_events_db"
```

### Prisma Client Issues
```bash
# Regenerate Prisma client
rm -rf node_modules/.prisma
npx prisma generate
```

### Permission Errors
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

## 📝 Development Tools

### Recommended VS Code Extensions
- **ESLint**: dbaeumer.vscode-eslint
- **Prettier**: esbenp.prettier-vscode
- **Prisma**: Prisma.prisma
- **Thunder Client**: rangav.vscode-thunder-client

### Database Management
```bash
# Open Prisma Studio
npx prisma studio

# View database migrations
npx prisma migrate status
```

### API Testing
- **Swagger UI**: http://localhost:3060/api/docs
- **Health Check**: http://localhost:3060/health
- **Postman Collection**: Available in `/docs/postman`

## 🚦 Verification Checklist

- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Swagger UI accessible at `/api/docs`
- [ ] Health endpoint returns 200 OK
- [ ] Unit tests pass
- [ ] Environment variables configured
- [ ] Clerk authentication working
- [ ] Stripe integration configured

## 📞 Support

If you encounter issues during setup:

1. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Review [Common Issues](https://github.com/vedaterenoglu/portfolio-events-rest-api/issues)
3. Create an issue with:
   - Error message
   - Node.js version (`node --version`)
   - npm version (`npm --version`)
   - Operating system
   - Steps to reproduce

---

**Next Steps:** After successful setup, proceed to the [Usage Guide](./USAGE.md) to learn about API endpoints and features.