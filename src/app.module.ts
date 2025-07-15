import { Module } from '@nestjs/common'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'

import { AdminModule } from './admin/admin.module'
import { AllExceptionsFilter } from './all-exceptions.filter'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { CitiesModule } from './cities/cities.module'
import { DatabaseModule } from './database/database.module'
import { EventsModule } from './events/events.module'
import { OutputSanitizationInterceptor } from './interceptors/output-sanitization.interceptor'
import { LoggerModule } from './services/logger/logger.module'

@Module({
  imports: [
    DatabaseModule,
    CitiesModule,
    EventsModule,
    AdminModule,
    AuthModule,
    ThrottlerModule.forRoot([
      // todo: request must satisfy both short and long limits
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
  ],
})
export class AppModule {}
