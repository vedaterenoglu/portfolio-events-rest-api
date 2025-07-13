import { Injectable } from '@nestjs/common'

import { DatabaseService } from '../database/database.service'
import { City } from '../schemas/city.schema'

interface CitiesResponse {
  count: number
  cities: City[]
}

@Injectable()
export class CitiesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllCities(): Promise<CitiesResponse> {
    const cities = await this.databaseService.tCity.findMany({
      orderBy: { city: 'asc' },
    })

    return {
      count: cities.length,
      cities,
    }
  }
}
