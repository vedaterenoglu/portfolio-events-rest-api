import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  UsePipes,
} from '@nestjs/common'

import { CitiesService } from '../cities/cities.service'
import { AdminRoleGuard } from '../guards/admin-role.guard'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import {
  CreateCity,
  UpdateCity,
  City,
  CreateCitySchema,
  UpdateCitySchema,
} from '../schemas/city.schema'

@Controller('api/admin/cities')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminCitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateCitySchema))
  async createCity(@Body() createCityData: CreateCity): Promise<City> {
    return this.citiesService.createCity(createCityData)
  }

  @Put(':citySlug')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(UpdateCitySchema))
  async updateCity(
    @Param('citySlug') citySlug: string,
    @Body() updateCityData: UpdateCity,
  ): Promise<City> {
    return this.citiesService.updateCity(citySlug, updateCityData)
  }
}
