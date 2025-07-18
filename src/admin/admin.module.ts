import { Module } from '@nestjs/common'

import { CitiesModule } from '../cities/cities.module'
import { DatabaseModule } from '../database/database.module'
import { EventsModule } from '../events/events.module'

import { AdminCitiesController } from './admin-cities.controller'
import { AdminDatabaseController } from './admin-database.controller'
import { AdminEventsController } from './admin-events.controller'
import { DatabaseResetService } from './database-reset.service'

@Module({
  imports: [CitiesModule, EventsModule, DatabaseModule],
  controllers: [
    AdminCitiesController,
    AdminEventsController,
    AdminDatabaseController,
  ],
  providers: [DatabaseResetService],
})
export class AdminModule {}
