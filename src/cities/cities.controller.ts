import { Controller, Get } from '@nestjs/common'

import { TCity } from '../generated/client'

import { CitiesService } from './cities.service'

interface CitiesResponse {
  count: number
  cities: TCity[]
}

@Controller('api/cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  async getAllCities(): Promise<CitiesResponse> {
    return this.citiesService.getAllCities()
  }
}
