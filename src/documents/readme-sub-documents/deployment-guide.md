# Deployment Guide

## 🚀 Deployment Overview

This guide covers deployment strategies for the Portfolio Events API across different environments and platforms.

## 🏗️ Production Deployment

### Environment Requirements
- **Node.js**: 18.x or 20.x
- **PostgreSQL**: 14.x or higher
- **Memory**: Minimum 512MB RAM
- **Storage**: 1GB available space
- **Network**: HTTPS-capable reverse proxy

### Environment Variables
```bash
# Production Environment
NODE_ENV=production
PORT=3060
DATABASE_URL=postgresql://username:password@host:5432/portfolio_events
CLERK_PUBLISHABLE_KEY=pk_live_your_key_here
CLERK_SECRET_KEY=sk_live_your_secret_here

# Optional Performance Settings
MAX_CONNECTIONS=100
QUERY_TIMEOUT=30000
CONNECTION_TIMEOUT=10000
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Expose port
EXPOSE 3060

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3060/health || exit 1

# Start application
CMD ["npm", "run", "start:prod"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3060:3060"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/portfolio_events
      - CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=portfolio_events
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

## ☁️ Cloud Deployment

### AWS Deployment

#### EC2 Deployment
```bash
# Install Node.js and dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup application
git clone https://github.com/vedaterenoglu/portfolio-events-rest-api.git
cd portfolio-events-rest-api
npm install --production
npm run build

# Setup PM2 for process management
sudo npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 startup
pm2 save
```

#### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'portfolio-events-api',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3060
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3060
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

### Heroku Deployment

#### Heroku Configuration
```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app
heroku create portfolio-events-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set CLERK_PUBLISHABLE_KEY=pk_live_your_key
heroku config:set CLERK_SECRET_KEY=sk_live_your_secret

# Deploy
git push heroku main
```

#### Procfile
```
web: npm run start:prod
release: npx prisma migrate deploy && npm run seed
```

### Vercel Deployment

#### Vercel Configuration
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/main.js"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "DATABASE_URL": "@database-url",
    "CLERK_PUBLISHABLE_KEY": "@clerk-publishable-key",
    "CLERK_SECRET_KEY": "@clerk-secret-key"
  }
}
```

## 🔒 Security Configuration

### HTTPS Setup
```bash
# Using Let's Encrypt with Certbot
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# Nginx configuration
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3060;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Firewall Configuration
```bash
# UFW Firewall setup
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Block direct access to application port
sudo ufw deny 3060/tcp
```

## 📊 Monitoring & Logging

### Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs portfolio-events-api

# Restart application
pm2 restart portfolio-events-api
```

### Health Monitoring
```bash
# Health check endpoint
curl -f https://your-domain.com/health || exit 1

# Automated health monitoring script
#!/bin/bash
while true; do
  if ! curl -f https://your-domain.com/health; then
    echo "Health check failed, restarting application..."
    pm2 restart portfolio-events-api
  fi
  sleep 30
done
```

## 🔄 Database Migration

### Production Migration
```bash
# Backup existing database
pg_dump -h hostname -U username -d database_name > backup.sql

# Run migrations
npx prisma migrate deploy

# Seed data (if needed)
npm run seed
```

### Migration Strategy
1. **Backup**: Always backup before migrations
2. **Staging**: Test migrations in staging environment
3. **Maintenance**: Schedule maintenance windows
4. **Rollback**: Prepare rollback procedures

## 📈 Performance Optimization

### Production Optimizations
```javascript
// Cluster mode with PM2
module.exports = {
  apps: [{
    name: 'portfolio-events-api',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    node_args: '--max-old-space-size=512'
  }]
}
```

### Database Connection Pooling
```javascript
// Prisma connection pooling
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 🚨 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
pm2 logs portfolio-events-api

# Check port availability
sudo netstat -tlnp | grep :3060

# Check environment variables
pm2 env 0
```

#### Database Connection Issues
```bash
# Test database connection
psql -h hostname -U username -d database_name

# Check connection string
echo $DATABASE_URL
```

#### Memory Issues
```bash
# Monitor memory usage
pm2 monit

# Increase memory limit
pm2 start ecosystem.config.js --node-args="--max-old-space-size=1024"
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates installed
- [ ] Firewall rules configured
- [ ] Monitoring setup complete
- [ ] Backup strategy in place

### Post-deployment
- [ ] Health check passing
- [ ] Database connectivity verified
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] Monitoring alerts configured
- [ ] Performance metrics baseline

## 🔄 Manual Deployment

### Production Deployment Steps
```bash
# Manual deployment process
cd /path/to/app
git pull origin main
npm install --production
npm run build
pm2 restart portfolio-events-api
```

### Rollback Strategy
```bash
# Quick rollback using PM2
pm2 stop portfolio-events-api
git checkout previous-stable-tag
npm install --production
npm run build
pm2 start portfolio-events-api

# Database rollback (if needed)
psql -h hostname -U username -d database_name < backup.sql
```

## 📞 Support & Maintenance

### Maintenance Schedule
- **Daily**: Health check monitoring
- **Weekly**: Security update review
- **Monthly**: Performance optimization review
- **Quarterly**: Full system backup verification

### Emergency Procedures
1. **Service Down**: Restart application and check logs
2. **Database Issues**: Switch to backup database
3. **High Load**: Scale horizontally with load balancer
4. **Security Breach**: Rotate secrets and review logs