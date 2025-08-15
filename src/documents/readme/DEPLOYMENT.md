# 🚀 Deployment Guide

## 📋 Table of Contents
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Deployment Platforms](#deployment-platforms)
  - [DigitalOcean](#digitalocean-deployment)
  - [Docker](#docker-deployment)
  - [AWS EC2](#aws-ec2-deployment)
  - [Heroku](#heroku-deployment)
  - [VPS](#vps-deployment)
- [Database Deployment](#database-deployment)
- [Post-Deployment](#post-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)

## ✅ Pre-Deployment Checklist

### Code Preparation
- [ ] All tests passing (`npm run test:all`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No linting errors (`npm run lint`)
- [ ] Production build successful (`npm run build`)
- [ ] Environment variables documented
- [ ] Sensitive data removed from codebase
- [ ] Dependencies up to date
- [ ] Security vulnerabilities resolved

### Database Preparation
- [ ] Production database provisioned
- [ ] Database migrations ready
- [ ] Backup strategy in place
- [ ] Connection pooling configured

### Infrastructure
- [ ] Domain/subdomain configured
- [ ] SSL certificates ready
- [ ] CDN configured (if needed)
- [ ] Monitoring tools set up
- [ ] Error tracking configured

## 🔧 Environment Configuration

### Production Environment Variables
```env
# Server Configuration
NODE_ENV=production
PORT=3060
APP_URL=https://your-domain.com

# Database Configuration
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_key
CLERK_SECRET_KEY=sk_live_your_clerk_secret
CLERK_WEBHOOK_SECRET=whsec_live_webhook_secret

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_live_stripe_webhook

# Security
JWT_SECRET=your_very_strong_jwt_secret_key
CORS_ORIGINS=https://your-frontend.com,https://app.your-domain.com

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# Monitoring (Optional)
SENTRY_DSN=https://your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your_license_key
```

## 🌐 Deployment Platforms

### DigitalOcean Deployment

#### Prerequisites
- DigitalOcean account
- GitHub repository connected

#### App Platform Deployment
1. Create new app in DigitalOcean App Platform
2. Connect GitHub repository
3. Configure build settings:
   - Build Command: `npm run build`
   - Run Command: `npm run start:prod`
4. Set environment variables in App Settings
5. Deploy

#### Droplet Deployment
See VPS deployment section for manual setup on DigitalOcean Droplets.

---

### Docker Deployment

#### Dockerfile
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3060

CMD ["node", "dist/main.js"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3060:3060"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=portfolio_events
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Deployment Commands
```bash
# Build and run
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Scale application
docker-compose up -d --scale app=3

# Update deployment
docker-compose pull
docker-compose up -d --no-deps --build app
```

---

### AWS EC2 Deployment

#### Instance Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

#### Application Deployment
```bash
# Clone repository
git clone https://github.com/your-username/portfolio-events-rest-api.git
cd portfolio-events-rest-api

# Install dependencies
npm ci --only=production

# Setup environment
cp .env.example .env
nano .env  # Edit with production values

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Build application
npm run build

# Start with PM2
pm2 start dist/main.js --name portfolio-api
pm2 save
pm2 startup
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3060;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### SSL Setup with Certbot
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

### Heroku Deployment

#### Prerequisites
- Heroku account
- Heroku CLI installed

#### Configuration
Create `Procfile`:
```
web: node dist/main.js
release: npx prisma migrate deploy
```

#### Deployment Steps
```bash
# Create Heroku app
heroku create portfolio-events-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set CLERK_SECRET_KEY=your_key
heroku config:set STRIPE_SECRET_KEY=your_key

# Deploy
git push heroku main

# View logs
heroku logs --tail

# Scale dynos
heroku ps:scale web=1
```

---

### VPS Deployment

#### Server Setup (Ubuntu/Debian)
```bash
# Create deploy user
sudo adduser deploy
sudo usermod -aG sudo deploy

# Setup SSH key authentication
su - deploy
mkdir ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys  # Add your public key
chmod 600 ~/.ssh/authorized_keys
```

#### Automated Deployment Script
```bash
#!/bin/bash
# deploy.sh

# Variables
APP_DIR="/home/deploy/portfolio-api"
REPO_URL="https://github.com/your-username/portfolio-events-rest-api.git"
BRANCH="main"

# Pull latest code
cd $APP_DIR
git fetch origin
git reset --hard origin/$BRANCH

# Install dependencies
npm ci --only=production

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
npm run build

# Restart application
pm2 restart portfolio-api

# Reload Nginx
sudo nginx -s reload

echo "Deployment completed successfully!"
```

## 💾 Database Deployment

### PostgreSQL on Cloud Providers

#### Supabase
```bash
# Connection string format
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres?sslmode=require"
```

#### Railway
```bash
# Connection string format
DATABASE_URL="postgresql://postgres:[password]@[host].railway.app:[port]/railway"
```

#### AWS RDS
```bash
# Connection string format
DATABASE_URL="postgresql://username:password@database.region.rds.amazonaws.com:5432/dbname?sslmode=require"
```

### Database Migration
```bash
# Generate migration
npx prisma migrate dev --name init

# Deploy migration
npx prisma migrate deploy

# Seed production data
NODE_ENV=production npm run seed
```

### Backup Strategy
```bash
# Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore database
psql $DATABASE_URL < backup_20250115.sql

# Automated daily backup
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
```

## 📮 Post-Deployment

### Verification Checklist
- [ ] Application accessible via domain
- [ ] SSL certificate working
- [ ] All API endpoints responding
- [ ] Database connection stable
- [ ] Authentication working
- [ ] Payment processing functional
- [ ] Health checks passing
- [ ] Monitoring active

### Performance Testing
```bash
# Load testing with k6
k6 run load-test.js

# Stress testing
ab -n 1000 -c 10 https://your-domain.com/api/events
```

### Security Hardening
```bash
# Update security headers
# Check SSL configuration
# Enable rate limiting
# Configure firewall rules
# Set up DDoS protection
```

## 📊 Monitoring & Maintenance

### Health Monitoring
```bash
# Setup health check endpoint monitoring
curl https://your-domain.com/health

# Monitor with external service
# - UptimeRobot
# - Pingdom
# - StatusCake
```

### Application Monitoring

#### PM2 Monitoring
```bash
# View status
pm2 status

# View logs
pm2 logs portfolio-api

# Monitor resources
pm2 monit

# Setup PM2 web dashboard
pm2 install pm2-web
```

#### Logging Setup
```javascript
// winston configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### Maintenance Tasks

#### Regular Updates
```bash
# Weekly: Update dependencies
npm audit
npm update

# Monthly: Security patches
npm audit fix

# Quarterly: Major updates
npm outdated
```

#### Database Maintenance
```sql
-- Analyze tables
ANALYZE;

-- Vacuum database
VACUUM FULL;

-- Reindex
REINDEX DATABASE portfolio_events;
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test:all
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /home/deploy/portfolio-api
            ./deploy.sh
```

## 🔐 Security Considerations

### Environment Security
- Never commit `.env` files
- Use secrets management services
- Rotate credentials regularly
- Use least privilege principle

### Network Security
- Enable firewall
- Use VPN for database access
- Implement rate limiting
- Enable DDoS protection

### Application Security
- Keep dependencies updated
- Regular security audits
- Implement logging and monitoring
- Use HTTPS everywhere

## 🆘 Rollback Procedures

### Quick Rollback
```bash
# PM2 rollback
pm2 reload portfolio-api --update-env

# Docker rollback
docker-compose down
docker-compose up -d --build

# Git rollback
git revert HEAD
git push origin main
```

### Database Rollback
```bash
# Rollback last migration
npx prisma migrate rollback

# Restore from backup
psql $DATABASE_URL < backup_previous.sql
```

## 📞 Support & Resources

### Deployment Issues
- Check logs first
- Verify environment variables
- Test database connection
- Check domain/DNS configuration

### Performance Issues
- Monitor CPU/Memory usage
- Check database queries
- Review rate limiting
- Analyze response times

### Additional Resources
- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [Prisma Production](https://www.prisma.io/docs/guides/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Need Help?** Check the [Troubleshooting Guide](./TROUBLESHOOTING.md) or contact support at info@vedaterenoglu.com