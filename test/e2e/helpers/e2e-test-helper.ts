import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as compression from 'compression'
import helmet from 'helmet'
import * as request from 'supertest'

import { AllExceptionsFilter } from '../../../src/all-exceptions.filter'
import { AppModule } from '../../../src/app.module'
import { DatabaseService } from '../../../src/database/database.service'
import { OutputSanitizationInterceptor } from '../../../src/interceptors/output-sanitization.interceptor'
import { RequestMetricsInterceptor } from '../../../src/interceptors/request-metrics.interceptor'
import { RequestTimeoutInterceptor } from '../../../src/interceptors/request-timeout.interceptor'
import { GracefulShutdownService } from '../../../src/services/graceful-shutdown.service'
import { HealthMonitoringService } from '../../../src/services/health-monitoring.service'

export class E2ETestHelper {
  private app!: INestApplication
  private module!: TestingModule
  private databaseService!: DatabaseService
  private shutdownService!: GracefulShutdownService
  private adminToken!: string

  async setup(): Promise<void> {
    // Create testing module
    this.module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    // Create Nest application
    this.app = this.module.createNestApplication()

    // Get services
    this.databaseService = this.module.get<DatabaseService>(DatabaseService)
    this.shutdownService = this.module.get<GracefulShutdownService>(
      GracefulShutdownService,
    )
    const healthMonitoringService = this.module.get<HealthMonitoringService>(
      HealthMonitoringService,
    )

    // Apply global pipes
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    )

    // Apply global filters
    this.app.useGlobalFilters(new AllExceptionsFilter(healthMonitoringService))

    // Apply global interceptors
    this.app.useGlobalInterceptors(
      new RequestMetricsInterceptor(healthMonitoringService),
      new RequestTimeoutInterceptor(),
      new OutputSanitizationInterceptor(),
    )

    // Apply middleware
    this.app.use(helmet())
    this.app.use(compression())

    // Enable CORS for testing
    this.app.enableCors({
      origin: true,
      credentials: true,
    })

    // Initialize the application
    await this.app.init()

    // Generate admin token for testing
    this.adminToken = this.generateAdminToken()
  }

  async teardown(): Promise<void> {
    // Clean up database
    await this.cleanDatabase()

    // Close the application
    if (this.app) {
      await this.app.close()
    }
  }

  async cleanDatabase(): Promise<void> {
    // Delete in correct order to respect foreign key constraints
    // Delete all test data first - both from seed and from our test data
    await this.databaseService.tEvent.deleteMany({})
    await this.databaseService.tCity.deleteMany({})
  }

  async seedDatabase(): Promise<void> {
    // Create test cities
    await this.databaseService.tCity.createMany({
      data: [
        {
          citySlug: 'austin',
          city: 'Austin',
          url: 'https://example.com/austin.jpg',
          alt: 'Austin city image',
        },
        {
          citySlug: 'seattle',
          city: 'Seattle',
          url: 'https://example.com/seattle.jpg',
          alt: 'Seattle city image',
        },
      ],
    })

    // Create test events
    await this.databaseService.tEvent.createMany({
      data: [
        {
          id: 1,
          name: 'Tech Conference 2024',
          slug: 'tech-conference-2024',
          city: 'Austin',
          citySlug: 'austin',
          location: 'Austin Convention Center',
          date: new Date('2024-06-15'),
          organizerName: 'Tech Events Inc',
          imageUrl: 'https://example.com/tech-conf.jpg',
          alt: 'Tech conference image',
          description: 'Annual tech conference',
          price: 299.99,
        },
        {
          id: 2,
          name: 'Developer Summit',
          slug: 'developer-summit',
          city: 'Seattle',
          citySlug: 'seattle',
          location: 'Seattle Center',
          date: new Date('2024-07-20'),
          organizerName: 'Dev Community',
          imageUrl: 'https://example.com/dev-summit.jpg',
          alt: 'Developer summit image',
          description: 'Summit for developers',
          price: 199.99,
        },
      ],
    })
  }

  generateAdminToken(): string {
    // Generate a mock admin token for testing
    // This mimics the structure of a real JWT but is only for testing
    const mockToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LWFkbWluLWlkIiwicm9sZSI6ImFkbWluIiwiZXhwIjo5OTk5OTk5OTk5fQ.test-signature'
    return mockToken
  }

  getApp(): INestApplication {
    return this.app
  }

  getServer(): unknown {
    return this.app.getHttpServer()
  }

  getDatabaseService(): DatabaseService {
    return this.databaseService
  }

  getAdminToken(): string {
    return this.adminToken
  }

  getAuthHeader(): { Authorization: string } {
    return { Authorization: `Bearer ${this.adminToken}` }
  }

  // Helper method to create a request agent
  createRequest() {
    return request(this.app.getHttpServer() as never)
  }

  // Helper method to create an authenticated request
  createAuthenticatedRequest() {
    return request(this.app.getHttpServer() as never).auth(this.adminToken, {
      type: 'bearer',
    })
  }

  // Helper to wait for async operations
  async waitFor(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Helper to check if the service is shutting down
  isShuttingDown(): boolean {
    return this.shutdownService.isShuttingDownStatus()
  }
}

// Export a singleton instance
export const e2eTestHelper = new E2ETestHelper()
