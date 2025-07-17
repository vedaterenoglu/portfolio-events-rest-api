import { join } from 'path'

import { ValidationPipe, Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as compression from 'compression'
import helmet from 'helmet'

import { AppModule } from './app.module'
import { GracefulShutdownService } from './services/graceful-shutdown.service'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const logger = new Logger('Bootstrap')

  // Serve static files from public directory
  app.useStaticAssets(join(__dirname, 'public'), {
    prefix: '/',
  })

  // Response compression middleware
  app.use(
    compression({
      filter: (req, res) => {
        // Don't compress responses if the client doesn't support it
        if (req.headers['x-no-compression']) {
          return false
        }

        // Skip compression for already compressed content
        const contentType = res.getHeader('content-type') as string
        if (contentType) {
          const skipTypes = [
            'image/',
            'video/',
            'audio/',
            'application/zip',
            'application/gzip',
            'application/x-gzip',
            'application/x-compress',
            'application/x-compressed',
          ]
          if (skipTypes.some(type => contentType.includes(type))) {
            return false
          }
        }

        // Use compression default filter for other content
        return compression.filter(req, res)
      },
      level: 6, // Balanced compression level (1-9, where 9 is best compression)
      threshold: 1024, // Only compress responses larger than 1KB
      windowBits: 15, // Memory usage vs compression ratio
      memLevel: 8, // Memory usage (1-9)
      strategy: 0, // Default strategy
    }),
  )

  // Global validation pipeline
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  )

  // Security headers middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          imgSrc: ["'self'", 'data:', 'https:', 'https://validator.swagger.io'],
          connectSrc: ["'self'", 'https://validator.swagger.io'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
          workerSrc: ["'self'", 'blob:'],
        },
      },
      crossOriginEmbedderPolicy: false, // Allow for API usage
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
    }),
  )

  // CORS protection - Environment-based configuration
  const corsOrigin = process.env.CORS_ORIGIN
  const corsConfiguration = {
    origin: corsOrigin === '*' ? true : corsOrigin?.split(',') || false,
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
  }

  app.enableCors(corsConfiguration)

  // Get graceful shutdown service
  const gracefulShutdownService = app.get(GracefulShutdownService)

  // Register example cleanup tasks
  gracefulShutdownService.registerCleanupTask({
    name: 'Active Request Completion',
    priority: 100,
    timeout: 30000, // 30 seconds
    cleanup: async () => {
      // Wait for active requests to complete
      await new Promise(resolve => setTimeout(resolve, 1000))
      logger.log('Active requests completed')
    },
  })

  gracefulShutdownService.registerCleanupTask({
    name: 'Cache Cleanup',
    priority: 50,
    timeout: 5000, // 5 seconds
    cleanup: async () => {
      await Promise.resolve()
      logger.log('Cache cleanup completed')
    },
  })

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Portfolio Events API')
    .setDescription(
      `
# Portfolio Events API

A comprehensive RESTful API for managing events and cities with authentication, validation, and monitoring capabilities.

## Features

- **Event Management**: Create, read, update, and delete events
- **City Management**: Manage cities and their associated events  
- **Authentication**: Clerk-based JWT authentication system
- **Validation**: Runtime request/response validation with Zod
- **Monitoring**: Health checks, metrics, and system status
- **Rate Limiting**: Configurable rate limiting per endpoint
- **Documentation**: Interactive API documentation with try-it-now functionality

## Authentication

Most admin endpoints require authentication using a JWT token from Clerk. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`
    `,
    )
    .setVersion('1.0.0')
    .setContact(
      'Vedat Erenoglu',
      'https://vedaterenoglu.com',
      'info@vedaterenoglu.com',
    )
    .setLicense(
      'Recruiter-Evaluation License',
      'https://github.com/vedaterenoglu/portfolio-events-rest-api',
    )
    .addServer('http://localhost:3060', 'Development server')
    .addServer(
      'https://portfolio-events-rest-api.demo.vedaterenoglu.com',
      'Production server',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Clerk-based JWT authentication token',
      },
      'ClerkJWT',
    )
    .addTag('Events', 'Event management operations')
    .addTag('Cities', 'City management operations')
    .addTag('Admin', 'Administrative operations requiring authentication')
    .addTag('Health', 'System monitoring and health checks')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document, {
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .scheme-container { 
        background: #f8f9fa; 
        padding: 20px; 
        border-radius: 8px;
        margin-bottom: 20px;
      }
      .swagger-ui .info .title { color: #2c3e50; }
      .swagger-ui .btn.authorize { 
        background-color: #4990e2; 
        border-color: #4990e2; 
      }
    `,
    customSiteTitle: 'Portfolio Events API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      displayRequestDuration: true,
    },
  })

  // Enable graceful shutdown
  app.enableShutdownHooks()

  // Setup signal handlers for graceful shutdown
  const setupGracefulShutdown = () => {
    const gracefulShutdown = async (signal: string) => {
      logger.log(`Received ${signal}, initiating graceful shutdown...`)

      try {
        await gracefulShutdownService.initiateShutdown(signal)
        await app.close()
        logger.log('Application closed successfully')
        process.exit(0)
      } catch (error) {
        logger.error('Error during graceful shutdown:', error)
        process.exit(1)
      }
    }

    // Handle termination signals
    process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => void gracefulShutdown('SIGINT'))

    // Handle uncaught exceptions
    process.on('uncaughtException', error => {
      logger.error('Uncaught exception:', error)
      void gracefulShutdown('UNCAUGHT_EXCEPTION')
    })

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection at:', promise, 'reason:', reason)
      void gracefulShutdown('UNHANDLED_REJECTION')
    })
  }

  setupGracefulShutdown()

  await app.listen(process.env.PORT ?? 3060, '0.0.0.0')
  logger.log(`Application is running on port ${process.env.PORT ?? 3060}`)
}

void bootstrap()
