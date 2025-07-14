import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common'

import { CitiesService } from '../cities/cities.service'
import { AdminRoleGuard } from '../guards/admin-role.guard'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { CreateCity, UpdateCity, City } from '../schemas/city.schema'

@Controller('api/admin/cities')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminCitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCity(@Body() createCityData: CreateCity): Promise<City> {
    return this.citiesService.createCity(createCityData)
  }

  @Put(':citySlug')
  @HttpCode(HttpStatus.OK)
  async updateCity(
    @Param('citySlug') citySlug: string,
    @Body() updateCityData: UpdateCity,
  ): Promise<City> {
    return this.citiesService.updateCity(citySlug, updateCityData)
  }
}
