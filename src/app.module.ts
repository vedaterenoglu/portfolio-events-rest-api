import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CitiesModule } from './cities/cities.module'
import { DatabaseModule } from './database/database.module'
import { LoggerModule } from './services/logger/logger.module'

@Module({
  imports: [
    DatabaseModule,
    CitiesModule,
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
  ],
})
export class AppModule {}
