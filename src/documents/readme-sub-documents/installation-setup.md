# Installation & Setup Guide

## 📋 Prerequisites

- **Node.js**: Version 18.x or 20.x
- **npm**: Version 8.x or higher
- **PostgreSQL**: Version 14.x or higher
- **Git**: For version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/vedaterenoglu/portfolio-events-rest-api.git
cd portfolio-events-rest-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/portfolio_events"

# Clerk Authentication
CLERK_PUBLISHABLE_KEY="pk_test_your_key_here"
CLERK_SECRET_KEY="sk_test_your_secret_here"

# Server Configuration
PORT=3060
NODE_ENV=development
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with sample data
npm run seed
```

### 5. Start Development Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3060`

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start production server |
| `npm run start:dev` | Start development server with hot reload |
| `npm run start:debug` | Start with debugging enabled |
| `npm run start:prod` | Start production server |
| `npm run build` | Build for production |
| `npm run seed` | Seed database with sample data |

## 🗄️ Database Configuration

### PostgreSQL Setup

1. **Install PostgreSQL**:
   ```bash
   # macOS
   brew install postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**:
   ```bash
   createdb portfolio_events
   ```

3. **Configure Environment**:
   Update `DATABASE_URL` in `.env` file with your PostgreSQL credentials.

### Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Create migration
npx prisma migrate dev

# View database in Prisma Studio
npx prisma studio
```

## 🔐 Authentication Setup

### Clerk Integration

1. **Create Clerk Account**: Visit [clerk.com](https://clerk.com)
2. **Create Application**: Set up a new application
3. **Get API Keys**: Copy publishable and secret keys
4. **Configure Environment**: Update `.env` file with your Clerk keys

### JWT Configuration

The API uses JWT tokens for authentication. Test tokens can be obtained from:
- `POST /api/auth/test-token` - Mock JWT for development
- `POST /api/auth/test-token-real` - Real JWT via Clerk

## 🚦 Health Check

After setup, verify the installation:

```bash
curl http://localhost:3060/health
```

Should return system health information.

## 📱 API Documentation

Once running, access interactive API documentation:
- **Swagger UI**: `http://localhost:3060/api/docs`
- **Postman Collection**: Available in `src/documents/ignore/`

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Verify PostgreSQL is running
   - Check `DATABASE_URL` in `.env`
   - Ensure database exists

2. **Port Already in Use**:
   ```bash
   # Change port in .env file
   PORT=3061
   ```

3. **Clerk Authentication Issues**:
   - Verify API keys in `.env`
   - Check Clerk dashboard configuration
   - Ensure correct application domain

4. **Module Not Found**:
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```
