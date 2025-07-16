import { Injectable, NotFoundException } from '@nestjs/common'

import { DatabaseService } from '../database/database.service'
import { Event, CreateEvent, UpdateEvent } from '../schemas/event.schema'
import { EventsQuery } from '../schemas/events-query.schema'

import type { Prisma } from '../generated/client'

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

  async createEvent(createEventData: CreateEvent): Promise<Event> {
    // Get the next available ID by finding the maximum existing ID
    const maxEvent = await this.databaseService.tEvent.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
    })

    const nextId = maxEvent ? maxEvent.id + 1 : 1

    return this.databaseService.tEvent.create({
      data: {
        ...createEventData,
        id: nextId,
      },
    })
  }

  async updateEvent(id: number, updateEventData: UpdateEvent): Promise<Event> {
    // Check if event exists
    const existingEvent = await this.databaseService.tEvent.findUnique({
      where: { id },
    })

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`)
    }

    return this.databaseService.tEvent.update({
      where: { id },
      data: updateEventData as Prisma.TEventUpdateInput,
    })
  }

  async deleteEvent(id: number): Promise<void> {
    // Check if event exists
    const existingEvent = await this.databaseService.tEvent.findUnique({
      where: { id },
    })

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`)
    }

    await this.databaseService.tEvent.delete({
      where: { id },
    })
  }
}
