import { Injectable, NotFoundException } from '@nestjs/common'

import { DatabaseService } from '../database/database.service'
import { Event } from '../schemas/event.schema'
import { EventsQuery } from '../schemas/events-query.schema'

export interface EventsResponse {
  count: number
  events: Event[]
  pagination: {
    limit: number
    offset: number
    hasMore: boolean
  }
}

@Injectable()
export class EventsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllEvents(
    query: Partial<EventsQuery> = {},
  ): Promise<EventsResponse> {
    const {
      limit = 50,
      offset = 0,
      search,
      orderBy = 'date',
      sortOrder = 'desc',
    } = query

    const whereCondition = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
            { city: { contains: search, mode: 'insensitive' as const } },
            { location: { contains: search, mode: 'insensitive' as const } },
            {
              organizerName: { contains: search, mode: 'insensitive' as const },
            },
          ],
        }
      : {}

    const [events, totalCount] = await Promise.all([
      this.databaseService.tEvent.findMany({
        where: whereCondition,
        skip: offset,
        take: limit,
        orderBy: { [orderBy]: sortOrder },
      }),
      this.databaseService.tEvent.count({ where: whereCondition }),
    ])

    return {
      count: totalCount,
      events,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    }
  }

  async getEventBySlug(slug: string): Promise<Event> {
    const event = await this.databaseService.tEvent.findUnique({
      where: { slug },
    })

    if (!event) {
      throw new NotFoundException(`Event with slug '${slug}' not found`)
    }

    return event
  }
}
