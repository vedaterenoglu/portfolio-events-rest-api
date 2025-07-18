/** @format */

import { DatabaseService } from '../src/database/database.service'

import { cities, events } from './events'

async function main() {
  const databaseService = new DatabaseService()
  await databaseService.onModuleInit()

  console.warn('Seeding has started 🌱')

  // Clear existing data (events first due to foreign key constraint)
  await databaseService.tEvent.deleteMany({})
  await databaseService.tCity.deleteMany({})

  // Seed cities first
  console.warn('Seeding cities...')
  for (const city of cities) {
    const result = await databaseService.tCity.upsert({
      where: { citySlug: city.citySlug },
      update: {},
      create: city,
    })
    console.warn(`Created city: ${result.city} (${result.citySlug})`)
  }

  // Seed events
  console.warn('Seeding events...')
  for (const event of events) {
    const result = await databaseService.tEvent.upsert({
      where: { id: event.id },
      update: {},
      create: event,
    })
    console.warn(`Created event: ${result.name} (ID: ${result.id})`)
  }

  console.warn('Seeding has completed 🌱')
  await databaseService.onModuleDestroy()
}

main()
  .then(() => {
    console.warn('Seeding completed successfully')
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
