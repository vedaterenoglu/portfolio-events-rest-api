import { join } from 'path'

import { ValidationPipe, Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
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
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
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

  // CORS protection
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })

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

  await app.listen(process.env.PORT ?? 3060)
  logger.log(`Application is running on port ${process.env.PORT ?? 3060}`)
}

void bootstrap()
