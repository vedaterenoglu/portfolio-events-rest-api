import { Controller, Get, Query } from '@nestjs/common'

import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
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
}
