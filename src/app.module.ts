import { Module } from '@nestjs/common'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'

import { AdminModule } from './admin/admin.module'
import { AllExceptionsFilter } from './all-exceptions.filter'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { CitiesModule } from './cities/cities.module'
import { getThrottlingConfig } from './config/throttling.config'
import { DatabaseModule } from './database/database.module'
import { EventsModule } from './events/events.module'
import { HealthModule } from './health/health.module'
import { OutputSanitizationInterceptor } from './interceptors/output-sanitization.interceptor'
import { RequestMetricsInterceptor } from './interceptors/request-metrics.interceptor'
import { RequestTimeoutInterceptor } from './interceptors/request-timeout.interceptor'
import { PaymentsModule } from './payments/payments.module'
import { GracefulShutdownService } from './services/graceful-shutdown.service'
import { HealthMonitoringService } from './services/health-monitoring.service'
import { LoggerModule } from './services/logger/logger.module'

@Module({
  imports: [
    DatabaseModule,
    CitiesModule,
    EventsModule,
    PaymentsModule,
    AdminModule,
    AuthModule,
    HealthModule,
    ThrottlerModule.forRoot(getThrottlingConfig()),
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    GracefulShutdownService,
    HealthMonitoringService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: OutputSanitizationInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestMetricsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestTimeoutInterceptor,
    },
  ],
})
export class AppModule {}
