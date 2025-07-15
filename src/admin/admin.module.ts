import { Module } from '@nestjs/common'

import { CitiesModule } from '../cities/cities.module'
import { EventsModule } from '../events/events.module'

import { AdminCitiesController } from './admin-cities.controller'
import { AdminEventsController } from './admin-events.controller'

@Module({
  imports: [CitiesModule, EventsModule],
  controllers: [AdminCitiesController, AdminEventsController],
})
export class AdminModule {}
