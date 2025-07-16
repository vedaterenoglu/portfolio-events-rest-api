import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  UsePipes,
  ParseIntPipe,
} from '@nestjs/common'

import { EventsService } from '../events/events.service'
import { AdminRoleGuard } from '../guards/admin-role.guard'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import {
  CreateEvent,
  UpdateEvent,
  Event,
  CreateEventSchema,
  UpdateEventSchema,
} from '../schemas/event.schema'

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

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(UpdateEventSchema))
  async updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventData: UpdateEvent,
  ): Promise<Event> {
    return this.eventsService.updateEvent(id, updateEventData)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEvent(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.eventsService.deleteEvent(id)
  }
}
