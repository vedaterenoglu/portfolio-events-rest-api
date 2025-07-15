import { Injectable } from '@nestjs/common'

import { DatabaseService } from '../database/database.service'
import { CitiesQuery } from '../schemas/cities-query.schema'
import { City, CreateCity, UpdateCity } from '../schemas/city.schema'

interface CitiesResponse {
  count: number
  cities: City[]
}

@Injectable()
export class CitiesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllCities(
    query: Partial<CitiesQuery> = {},
  ): Promise<CitiesResponse> {
    const {
      search,
      limit = 50,
      offset = 0,
      orderBy = 'city',
      sortOrder = 'asc',
    } = query

    const where = search
      ? {
          city: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {}

    const cities = await this.databaseService.tCity.findMany({
      where,
      orderBy: { [orderBy]: sortOrder },
      take: limit,
      skip: offset,
    })

    const totalCount = await this.databaseService.tCity.count({ where })

    return {
      count: totalCount,
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
