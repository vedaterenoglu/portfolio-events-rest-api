import { Injectable } from '@nestjs/common'

import { DatabaseService } from '../database/database.service'
import { City, CreateCity, UpdateCity } from '../schemas/city.schema'

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

  async createCity(createCityData: CreateCity): Promise<City> {
    return this.databaseService.tCity.create({
      data: createCityData,
    })
  }

  async updateCity(
    citySlug: string,
    updateCityData: UpdateCity,
  ): Promise<City> {
    return this.databaseService.tCity.update({
      where: { citySlug },
      data: updateCityData as Parameters<
        typeof this.databaseService.tCity.update
      >[0]['data'],
    })
  }
}
