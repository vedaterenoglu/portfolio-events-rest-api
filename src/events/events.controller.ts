import { Controller, Get, Query, Param } from '@nestjs/common'

import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { Event } from '../schemas/event.schema'
import { EventsQuerySchema, EventsQuery } from '../schemas/events-query.schema'

import { EventsService, EventsResponse } from './events.service'

@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  getAllEvents(
    @Query(new ZodValidationPipe(EventsQuerySchema)) query?: EventsQuery,
  ): Promise<EventsResponse> {
    return this.eventsService.getAllEvents(query)
  }

  @Get(':slug')
  getEventBySlug(@Param('slug') slug: string): Promise<Event> {
    return this.eventsService.getEventBySlug(slug)
  }
}
