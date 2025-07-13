import { Injectable } from '@nestjs/common'

import { DatabaseService } from '../database/database.service'
import { TCity } from '../generated/client'

interface CitiesResponse {
  count: number
  cities: TCity[]
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
