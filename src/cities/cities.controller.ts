import { Controller, Get, Query, UsePipes } from '@nestjs/common'

import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { CitiesQuerySchema, CitiesQuery } from '../schemas/cities-query.schema'
import { City } from '../schemas/city.schema'

import { CitiesService } from './cities.service'

interface CitiesResponse {
  count: number
  cities: City[]
}

@Controller('api/cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(CitiesQuerySchema))
  async getAllCities(
    @Query() query: Partial<CitiesQuery>,
  ): Promise<CitiesResponse> {
    return this.citiesService.getAllCities(query)
  }
}
