import { Controller, Delete, Post, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AdminRoleGuard } from '../guards/admin-role.guard'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'

import { DatabaseResetService } from './database-reset.service'

@ApiTags('Admin Database')
@Controller('admin/database')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminDatabaseController {
  constructor(private readonly databaseResetService: DatabaseResetService) {}

  @Post('reset')
  @ApiOperation({
    summary: 'Reset database and seed with initial data',
    description:
      'Truncates all tables and seeds them with initial cities and events data',
  })
  @ApiResponse({
    status: 200,
    description: 'Database reset and seeded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        counts: {
          type: 'object',
          properties: {
            cities: { type: 'number' },
            events: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async resetDatabase() {
    return this.databaseResetService.resetDatabase()
  }

  @Delete('truncate')
  @ApiOperation({
    summary: 'Truncate all database tables',
    description: 'Removes all data from cities and events tables',
  })
  @ApiResponse({
    status: 200,
    description: 'Database truncated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async truncateDatabase() {
    return this.databaseResetService.truncateDatabase()
  }
}
