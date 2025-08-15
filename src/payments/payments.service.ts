import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import Stripe from 'stripe'

import { EventsService } from '../events/events.service'
import {
  CreateCheckoutSessionDto,
  CheckoutSessionResponse,
} from '../schemas/payment.schema'
import { LoggerService } from '../services/logger/logger.service'

/**
 * PaymentsService - Secure payment processing with fraud prevention
 *
 * Design Patterns Applied:
 * 1. **Dependency Injection Pattern**: Injectable dependencies for testing
 * 2. **Service Layer Pattern**: Business logic separated from presentation
 * 3. **Strategy Pattern**: Configurable payment provider (Stripe)
 * 4. **Adapter Pattern**: Wraps Stripe SDK in our domain interface
 *
 * SOLID Principles:
 * - **SRP**: Only responsible for payment operations and validation
 * - **OCP**: Extensible for additional payment providers without modification
 * - **LSP**: Implements consistent payment interface contracts
 * - **ISP**: Focused interface for payment-specific operations
 * - **DIP**: Depends on abstractions (EventsService, LoggerService)
 */

@Injectable()
export class PaymentsService {
  private stripe: Stripe

  constructor(
    private readonly eventsService: EventsService,
    private readonly logger: LoggerService,
  ) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required')
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    })
  }

  /**
   * Creates a secure Stripe checkout session with server-side validation
   * Prevents client-side price manipulation through database verification
   */
  async createCheckoutSession(
    dto: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionResponse> {
    try {
      // Step 1: Validate event exists (security check)
      const event = await this.eventsService.getEventBySlug(dto.eventSlug)

      if (!event) {
        throw new NotFoundException('Event not found')
      }

      // Step 2: Verify price matches database (prevent client manipulation)
      if (Math.abs(event.price - dto.unitPrice) > 0.01) {
        this.logger.warn('Price mismatch attempt detected', {
          eventSlug: dto.eventSlug,
          databasePrice: event.price,
          clientPrice: dto.unitPrice,
          difference: Math.abs(event.price - dto.unitPrice),
        })
        throw new BadRequestException('Price mismatch detected')
      }

      // Step 3: Verify total calculation (additional fraud prevention)
      const expectedTotal = event.price * dto.quantity
      if (Math.abs(expectedTotal - dto.totalAmount) > 0.01) {
        this.logger.warn('Total amount calculation error', {
          eventSlug: dto.eventSlug,
          expectedTotal,
          clientTotal: dto.totalAmount,
          quantity: dto.quantity,
          unitPrice: event.price,
        })
        throw new BadRequestException('Total amount calculation error')
      }

      // Step 4: Create Stripe checkout session with validated data
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: dto.eventName,
                description: `${dto.quantity} ticket${
                  dto.quantity > 1 ? 's' : ''
                } for ${dto.eventName}`,
                images: event.imageUrl ? [event.imageUrl] : [],
              },
              unit_amount: Math.round(event.price * 100), // Stripe uses cents
            },
            quantity: dto.quantity,
          },
        ],
        mode: 'payment',
        success_url: `${dto.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: dto.cancelUrl,
        metadata: {
          eventSlug: dto.eventSlug,
          eventName: dto.eventName,
          eventId: event.id.toString(),
          quantity: dto.quantity.toString(),
          unitPrice: event.price.toString(),
          totalAmount: expectedTotal.toString(),
        },
      })

      // Step 5: Log successful session creation for monitoring
      this.logger.log('Checkout session created successfully')

      if (!session.url) {
        throw new BadRequestException('Failed to generate checkout URL')
      }

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      }
    } catch (error) {
      // Enhanced error logging for debugging and monitoring
      this.logger.error(
        `Failed to create checkout session: ${error instanceof Error ? error.message : String(error)}`,
      )

      // Re-throw known business logic errors
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error
      }

      // Handle Stripe-specific errors
      if (error instanceof Stripe.errors.StripeError) {
        this.logger.error(`Stripe API error: ${error.message}`)
        throw new BadRequestException('Payment system error')
      }

      // Generic fallback for unexpected errors
      throw new BadRequestException('Failed to create payment session')
    }
  }

  /**
   * Verifies a Stripe checkout session for payment confirmation
   * Used by success/cancel pages to validate payment status
   */
  async verifySession(sessionId: string): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId)

      this.logger.log('Session verified successfully')

      return session
    } catch (error) {
      this.logger.error(
        `Failed to verify checkout session: ${error instanceof Error ? error.message : String(error)}`,
      )

      if (error instanceof Stripe.errors.StripeError) {
        throw new BadRequestException('Invalid or expired session')
      }

      throw new BadRequestException('Session verification failed')
    }
  }
}
