import { Injectable } from '@nestjs/common'

import { DatabaseService } from '../database/database.service'

@Injectable()
export class DatabaseResetService {
  constructor(private readonly databaseService: DatabaseService) {}

  async resetDatabase(): Promise<{
    message: string
    counts: { cities: number; events: number }
  }> {
    // Import seed data
    const { cities, events } = await import('../../seed/events')

    // Clear existing data (events first due to foreign key constraint)
    await this.databaseService.tEvent.deleteMany({})
    await this.databaseService.tCity.deleteMany({})

    // Seed cities first
    const cityResults = []
    for (const city of cities) {
      const result = await this.databaseService.tCity.upsert({
        where: { citySlug: city.citySlug },
        update: {},
        create: city,
      })
      cityResults.push(result)
    }

    // Seed events
    const eventResults = []
    for (const event of events) {
      const result = await this.databaseService.tEvent.upsert({
        where: { id: event.id },
        update: {},
        create: event,
      })
      eventResults.push(result)
    }

    return {
      message: 'Database reset and seeded successfully',
      counts: {
        cities: cityResults.length,
        events: eventResults.length,
      },
    }
  }

  async truncateDatabase(): Promise<{ message: string }> {
    // Clear all data (events first due to foreign key constraint)
    await this.databaseService.tEvent.deleteMany({})
    await this.databaseService.tCity.deleteMany({})

    return {
      message: 'Database truncated successfully',
    }
  }
}
