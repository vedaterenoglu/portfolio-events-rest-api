import { Module } from '@nestjs/common'

import { EventsModule } from '../events/events.module'
import { LoggerModule } from '../services/logger/logger.module'

import { PaymentsController } from './payments.controller'
import { PaymentsService } from './payments.service'

/**
 * PaymentsModule - Encapsulated payment functionality
 *
 * Design Patterns Applied:
 * 1. **Module Pattern**: Encapsulated payment functionality with clear boundaries
 * 2. **Dependency Injection Container**: NestJS IoC container management
 *
 * SOLID Principles:
 * - **SRP**: Only responsible for payment feature organization and wiring
 * - **DIP**: Depends on other modules through abstractions (EventsModule, LoggerModule)
 */

@Module({
  imports: [EventsModule, LoggerModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
