import { Controller, Post, Body, Get, Param } from '@nestjs/common'

import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import {
  CreateCheckoutSessionSchema,
  CreateCheckoutSessionDto,
  CheckoutSessionResponse,
  SessionVerificationResponse,
} from '../schemas/payment.schema'

import { PaymentsService } from './payments.service'

/**
 * PaymentsController - Clean REST API for payment operations
 *
 * Design Patterns Applied:
 * 1. **Controller Pattern**: HTTP request handling separated from business logic
 * 2. **Facade Pattern**: Simplified interface to complex payment operations
 * 3. **Pipe Pattern**: Request validation through Zod validation pipes
 *
 * SOLID Principles:
 * - **SRP**: Only responsible for HTTP request/response handling
 * - **OCP**: Extensible for additional payment endpoints without modification
 * - **ISP**: Focused interface with minimal, payment-specific endpoints
 * - **DIP**: Depends on PaymentsService abstraction, not implementation
 */

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Creates a Stripe checkout session for event ticket purchase
   * POST /api/payments/create-checkout-session
   *
   * @param dto - Validated checkout session request data
   * @returns Stripe checkout URL and session ID
   */
  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body(new ZodValidationPipe(CreateCheckoutSessionSchema))
    dto: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionResponse> {
    return this.paymentsService.createCheckoutSession(dto)
  }

  /**
   * Verifies a Stripe checkout session status
   * GET /api/payments/verify-session/:sessionId
   *
   * @param sessionId - Stripe session identifier
   * @returns Session status and payment information
   */
  @Get('verify-session/:sessionId')
  async verifySession(
    @Param('sessionId') sessionId: string,
  ): Promise<SessionVerificationResponse> {
    const session = await this.paymentsService.verifySession(sessionId)

    return {
      id: session.id,
      status: session.status as 'open' | 'complete' | 'expired',
      payment_status: session.payment_status as
        | 'paid'
        | 'unpaid'
        | 'no_payment_required',
      metadata: session.metadata as Record<string, string> | undefined,
    }
  }
}
