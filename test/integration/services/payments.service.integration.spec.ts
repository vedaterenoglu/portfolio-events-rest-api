import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import Stripe from 'stripe'

import { DatabaseModule } from '../../../src/database/database.module'
import { EventsModule } from '../../../src/events/events.module'
import { EventsService } from '../../../src/events/events.service'
import { PaymentsModule } from '../../../src/payments/payments.module'
import { PaymentsService } from '../../../src/payments/payments.service'
import {
  CreateCheckoutSessionDto,
  CheckoutSessionResponse,
} from '../../../src/schemas/payment.schema'
import { LoggerModule } from '../../../src/services/logger/logger.module'
import { LoggerService } from '../../../src/services/logger/logger.service'

// Mock Stripe at module level
jest.mock('stripe')

describe('PaymentsService Integration', () => {
  let service: PaymentsService
  let eventsService: EventsService
  let loggerService: LoggerService
  let mockStripeInstance: {
    checkout: {
      sessions: {
        create: jest.Mock
        retrieve: jest.Mock
      }
    }
  }
  const originalEnv = process.env

  const mockEvent = {
    id: 1,
    name: 'Integration Test Event',
    slug: 'integration-test-event',
    price: 149.99,
    imageUrl: 'https://example.com/integration-image.jpg',
    alt: 'Integration Test Event Image',
    description: 'Integration Test Description',
    date: new Date('2025-06-01'),
    location: 'Integration Test Location',
    city: 'Integration City',
    citySlug: 'integration-city',
    organizerName: 'Integration Organizer',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockCheckoutSession = {
    id: 'cs_integration_test_123',
    url: 'https://checkout.stripe.com/integration-test',
    payment_status: 'unpaid',
    status: 'open',
    metadata: {
      eventSlug: 'integration-test-event',
      eventName: 'Integration Test Event',
    },
    // Additional Stripe properties
    object: 'checkout.session',
    amount_subtotal: 14999,
    amount_total: 14999,
    currency: 'usd',
    customer: null,
    customer_details: null,
    customer_email: null,
    expires_at: Date.now() + 3600000,
    livemode: false,
    locale: null,
    mode: 'payment',
    payment_intent: null,
    payment_method_collection: 'always',
    payment_method_types: ['card'],
    success_url: 'https://example.com/success',
    cancel_url: 'https://example.com/cancel',
  }

  const mockCreateCheckoutSessionDto: CreateCheckoutSessionDto = {
    eventSlug: 'integration-test-event',
    eventName: 'Integration Test Event',
    quantity: 3,
    unitPrice: 149.99,
    totalAmount: 449.97,
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel',
  }

  beforeEach(async () => {
    // Set required environment variable
    process.env = {
      ...originalEnv,
      STRIPE_SECRET_KEY: 'sk_test_integration_mock_key',
      NODE_ENV: 'test',
    }

    // Clear all mocks
    jest.clearAllMocks()

    // Create mock Stripe instance
    mockStripeInstance = {
      checkout: {
        sessions: {
          create: jest.fn(),
          retrieve: jest.fn(),
        },
      },
    }

    // Mock Stripe constructor
    const MockedStripe = jest.mocked(Stripe)
    MockedStripe.mockImplementation(
      () => mockStripeInstance as unknown as Stripe,
    )

    // Mock Stripe.errors for error handling tests
    ;(
      MockedStripe as unknown as {
        errors: {
          StripeError: new (message: string) => Error
          StripeAPIError: new (message: string) => Error
        }
      }
    ).errors = {
      StripeError: class StripeError extends Error {
        constructor(message: string) {
          super(message)
          this.name = 'StripeError'
        }
      },
      StripeAPIError: class StripeAPIError extends Error {
        constructor(message: string) {
          super(message)
          this.name = 'StripeAPIError'
        }
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, EventsModule, LoggerModule, PaymentsModule],
    }).compile()

    service = module.get<PaymentsService>(PaymentsService)
    eventsService = module.get<EventsService>(EventsService)
    loggerService = module.get<LoggerService>(LoggerService)
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
    jest.clearAllMocks()
  })

  describe('Module Integration', () => {
    it('should be defined with all dependencies', () => {
      expect(service).toBeDefined()
      expect(eventsService).toBeDefined()
      expect(loggerService).toBeDefined()
    })

    it('should initialize Stripe correctly', () => {
      const MockedStripe = jest.mocked(Stripe)
      expect(MockedStripe).toHaveBeenCalledWith(
        'sk_test_integration_mock_key',
        {
          apiVersion: '2025-06-30.basil',
        },
      )
    })
  })

  describe('createCheckoutSession - Integration', () => {
    it('should create checkout session with all services integrated', async () => {
      // Mock event service to return event
      jest.spyOn(eventsService, 'getEventBySlug').mockResolvedValue(mockEvent)

      // Mock Stripe to return session
      mockStripeInstance.checkout.sessions.create.mockResolvedValue(
        mockCheckoutSession,
      )

      // Spy on logger
      const logSpy = jest.spyOn(loggerService, 'log')
      const warnSpy = jest.spyOn(loggerService, 'warn')

      const result: CheckoutSessionResponse =
        await service.createCheckoutSession(mockCreateCheckoutSessionDto)

      // Verify all integrations worked
      expect(eventsService.getEventBySlug).toHaveBeenCalledWith(
        'integration-test-event',
      )
      expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Integration Test Event',
                description: '3 tickets for Integration Test Event',
                images: ['https://example.com/integration-image.jpg'],
              },
              unit_amount: 14999,
            },
            quantity: 3,
          },
        ],
        mode: 'payment',
        success_url:
          'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://example.com/cancel',
        metadata: {
          eventSlug: 'integration-test-event',
          eventName: 'Integration Test Event',
          eventId: '1',
          quantity: '3',
          unitPrice: '149.99',
          totalAmount: '449.97',
        },
      })

      expect(result).toEqual({
        checkoutUrl: 'https://checkout.stripe.com/integration-test',
        sessionId: 'cs_integration_test_123',
      })

      expect(logSpy).toHaveBeenCalledWith(
        'Checkout session created successfully',
      )
      expect(warnSpy).not.toHaveBeenCalled()
    })

    it('should handle price mismatch with logging integration', async () => {
      const mismatchedDto = {
        ...mockCreateCheckoutSessionDto,
        unitPrice: 99.99, // Wrong price
      }

      jest.spyOn(eventsService, 'getEventBySlug').mockResolvedValue(mockEvent)
      const warnSpy = jest.spyOn(loggerService, 'warn')

      await expect(
        service.createCheckoutSession(mismatchedDto),
      ).rejects.toThrow(BadRequestException)

      expect(warnSpy).toHaveBeenCalledWith(
        'Price mismatch attempt detected',
        expect.objectContaining({
          eventSlug: 'integration-test-event',
          databasePrice: 149.99,
          clientPrice: 99.99,
        }),
      )
    })

    it('should handle total amount mismatch with logging integration', async () => {
      const wrongTotalDto = {
        ...mockCreateCheckoutSessionDto,
        totalAmount: 400.0, // Wrong total
      }

      jest.spyOn(eventsService, 'getEventBySlug').mockResolvedValue(mockEvent)
      const warnSpy = jest.spyOn(loggerService, 'warn')

      await expect(
        service.createCheckoutSession(wrongTotalDto),
      ).rejects.toThrow(BadRequestException)

      expect(warnSpy).toHaveBeenCalledWith(
        'Total amount calculation error',
        expect.objectContaining({
          eventSlug: 'integration-test-event',
          expectedTotal: 449.97,
          clientTotal: 400.0,
        }),
      )
    })

    it('should handle event not found through EventsService integration', async () => {
      jest
        .spyOn(eventsService, 'getEventBySlug')
        .mockResolvedValue(null as unknown as typeof mockEvent)

      await expect(
        service.createCheckoutSession(mockCreateCheckoutSessionDto),
      ).rejects.toThrow(NotFoundException)
    })

    it('should handle event without image URL', async () => {
      const eventWithoutImage = { ...mockEvent, imageUrl: '' }
      jest
        .spyOn(eventsService, 'getEventBySlug')
        .mockResolvedValue(eventWithoutImage)
      mockStripeInstance.checkout.sessions.create.mockResolvedValue(
        mockCheckoutSession,
      )

      await service.createCheckoutSession(mockCreateCheckoutSessionDto)

      expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [
            expect.objectContaining({
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              price_data: expect.objectContaining({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                product_data: expect.objectContaining({
                  images: [],
                }),
              }),
            }),
          ],
        }),
      )
    })

    it('should handle single ticket purchase correctly', async () => {
      const singleTicketDto = {
        ...mockCreateCheckoutSessionDto,
        quantity: 1,
        totalAmount: 149.99,
      }

      jest.spyOn(eventsService, 'getEventBySlug').mockResolvedValue(mockEvent)
      mockStripeInstance.checkout.sessions.create.mockResolvedValue(
        mockCheckoutSession,
      )

      await service.createCheckoutSession(singleTicketDto)

      expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [
            expect.objectContaining({
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              price_data: expect.objectContaining({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                product_data: expect.objectContaining({
                  description: '1 ticket for Integration Test Event',
                }),
              }),
              quantity: 1,
            }),
          ],
        }),
      )
    })

    it('should handle missing checkout URL from Stripe', async () => {
      const sessionWithoutUrl = { ...mockCheckoutSession, url: null }
      jest.spyOn(eventsService, 'getEventBySlug').mockResolvedValue(mockEvent)
      mockStripeInstance.checkout.sessions.create.mockResolvedValue(
        sessionWithoutUrl,
      )

      await expect(
        service.createCheckoutSession(mockCreateCheckoutSessionDto),
      ).rejects.toThrow('Failed to generate checkout URL')
    })

    it('should handle Stripe API errors with logging', async () => {
      const MockedStripe = jest.mocked(Stripe) as unknown as {
        errors: { StripeError: new (message: string) => Error }
      }
      const stripeError = new MockedStripe.errors.StripeError(
        'Stripe integration error',
      )

      jest.spyOn(eventsService, 'getEventBySlug').mockResolvedValue(mockEvent)
      mockStripeInstance.checkout.sessions.create.mockRejectedValue(stripeError)
      const errorSpy = jest.spyOn(loggerService, 'error')

      await expect(
        service.createCheckoutSession(mockCreateCheckoutSessionDto),
      ).rejects.toThrow('Payment system error')

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Stripe API error'),
      )
    })

    it('should handle generic errors with logging', async () => {
      jest.spyOn(eventsService, 'getEventBySlug').mockResolvedValue(mockEvent)
      mockStripeInstance.checkout.sessions.create.mockRejectedValue(
        new Error('Integration error'),
      )
      const errorSpy = jest.spyOn(loggerService, 'error')

      await expect(
        service.createCheckoutSession(mockCreateCheckoutSessionDto),
      ).rejects.toThrow('Failed to create payment session')

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Integration error'),
      )
    })

    it('should re-throw NotFoundException from EventsService', async () => {
      const notFoundError = new NotFoundException('Event not found')
      jest
        .spyOn(eventsService, 'getEventBySlug')
        .mockRejectedValue(notFoundError)
      const errorSpy = jest.spyOn(loggerService, 'error')

      await expect(
        service.createCheckoutSession(mockCreateCheckoutSessionDto),
      ).rejects.toThrow(notFoundError)

      expect(errorSpy).toHaveBeenCalled()
    })

    it('should handle non-Error objects in catch block', async () => {
      jest.spyOn(eventsService, 'getEventBySlug').mockResolvedValue(mockEvent)
      mockStripeInstance.checkout.sessions.create.mockRejectedValue(
        'string error',
      )
      const errorSpy = jest.spyOn(loggerService, 'error')

      await expect(
        service.createCheckoutSession(mockCreateCheckoutSessionDto),
      ).rejects.toThrow('Failed to create payment session')

      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to create checkout session: string error',
      )
    })
  })

  describe('verifySession - Integration', () => {
    it('should verify session successfully with logging', async () => {
      mockStripeInstance.checkout.sessions.retrieve.mockResolvedValue(
        mockCheckoutSession,
      )
      const logSpy = jest.spyOn(loggerService, 'log')

      const result = await service.verifySession('cs_integration_test_123')

      expect(
        mockStripeInstance.checkout.sessions.retrieve,
      ).toHaveBeenCalledWith('cs_integration_test_123')
      expect(result).toEqual(mockCheckoutSession)
      expect(logSpy).toHaveBeenCalledWith('Session verified successfully')
    })

    it('should handle different session states', async () => {
      const completedSession = {
        ...mockCheckoutSession,
        status: 'complete',
        payment_status: 'paid',
      }
      mockStripeInstance.checkout.sessions.retrieve.mockResolvedValue(
        completedSession,
      )

      const result = await service.verifySession('cs_completed')

      expect(result.status).toBe('complete')
      expect(result.payment_status).toBe('paid')
    })

    it('should handle expired sessions', async () => {
      const expiredSession = {
        ...mockCheckoutSession,
        status: 'expired',
        payment_status: 'unpaid',
      }
      mockStripeInstance.checkout.sessions.retrieve.mockResolvedValue(
        expiredSession,
      )

      const result = await service.verifySession('cs_expired')

      expect(result.status).toBe('expired')
      expect(result.payment_status).toBe('unpaid')
    })

    it('should handle Stripe errors during verification with logging', async () => {
      const MockedStripe = jest.mocked(Stripe) as unknown as {
        errors: { StripeError: new (message: string) => Error }
      }
      const stripeError = new MockedStripe.errors.StripeError(
        'Session not found',
      )

      mockStripeInstance.checkout.sessions.retrieve.mockRejectedValue(
        stripeError,
      )
      const errorSpy = jest.spyOn(loggerService, 'error')

      await expect(service.verifySession('invalid_session')).rejects.toThrow(
        'Invalid or expired session',
      )

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Session not found'),
      )
    })

    it('should handle network errors with logging', async () => {
      mockStripeInstance.checkout.sessions.retrieve.mockRejectedValue(
        new Error('Network timeout'),
      )
      const errorSpy = jest.spyOn(loggerService, 'error')

      await expect(service.verifySession('cs_network_error')).rejects.toThrow(
        'Session verification failed',
      )

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Network timeout'),
      )
    })

    it('should handle non-Error objects during verification', async () => {
      mockStripeInstance.checkout.sessions.retrieve.mockRejectedValue({
        code: 'UNKNOWN',
        message: 'Unknown integration error',
      })
      const errorSpy = jest.spyOn(loggerService, 'error')

      await expect(service.verifySession('cs_unknown')).rejects.toThrow(
        'Session verification failed',
      )

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[object Object]'),
      )
    })
  })

  describe('Error Recovery Integration', () => {
    it('should recover from temporary Stripe outage', async () => {
      jest.spyOn(eventsService, 'getEventBySlug').mockResolvedValue(mockEvent)

      // First call fails
      mockStripeInstance.checkout.sessions.create
        .mockRejectedValueOnce(new Error('Service temporarily unavailable'))
        .mockResolvedValueOnce(mockCheckoutSession)

      // First attempt should fail
      await expect(
        service.createCheckoutSession(mockCreateCheckoutSessionDto),
      ).rejects.toThrow('Failed to create payment session')

      // Second attempt should succeed
      const result = await service.createCheckoutSession(
        mockCreateCheckoutSessionDto,
      )
      expect(result.sessionId).toBe('cs_integration_test_123')
    })

    it('should handle multiple concurrent requests', async () => {
      jest.spyOn(eventsService, 'getEventBySlug').mockResolvedValue(mockEvent)
      mockStripeInstance.checkout.sessions.create.mockResolvedValue(
        mockCheckoutSession,
      )

      const promises = Array(5)
        .fill(null)
        .map(() => service.createCheckoutSession(mockCreateCheckoutSessionDto))

      const results = await Promise.all(promises)

      expect(results).toHaveLength(5)
      results.forEach(result => {
        expect(result.sessionId).toBe('cs_integration_test_123')
      })

      expect(eventsService.getEventBySlug).toHaveBeenCalledTimes(5)
      expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledTimes(
        5,
      )
    })
  })
})
