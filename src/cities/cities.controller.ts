import { Controller, Get } from '@nestjs/common'

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
  async getAllCities(): Promise<CitiesResponse> {
    return this.citiesService.getAllCities()
  }
}
