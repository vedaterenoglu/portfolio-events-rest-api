import { Module } from '@nestjs/common'

import { CitiesModule } from '../cities/cities.module'

import { AdminCitiesController } from './admin-cities.controller'

@Module({
  imports: [CitiesModule],
  controllers: [AdminCitiesController],
})
export class AdminModule {}
