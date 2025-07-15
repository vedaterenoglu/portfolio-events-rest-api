import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
  UsePipes,
} from '@nestjs/common'

import { EventsService } from '../events/events.service'
import { AdminRoleGuard } from '../guards/admin-role.guard'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { CreateEvent, Event, CreateEventSchema } from '../schemas/event.schema'

@Controller('api/admin/events')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminEventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateEventSchema))
  async createEvent(@Body() createEventData: CreateEvent): Promise<Event> {
    return this.eventsService.createEvent(createEventData)
  }
}
