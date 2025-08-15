import { Test, TestingModule } from '@nestjs/testing'

import { PaymentsController } from '../../../src/payments/payments.controller'
import { PaymentsService } from '../../../src/payments/payments.service'
import {
  CreateCheckoutSessionDto,
  CheckoutSessionResponse,
  SessionVerificationResponse,
} from '../../../src/schemas/payment.schema'

import type Stripe from 'stripe'

describe('PaymentsController', () => {
  let controller: PaymentsController
  let paymentsService: PaymentsService

  const mockCheckoutSessionDto: CreateCheckoutSessionDto = {
    eventSlug: 'test-event',
    eventName: 'Test Event',
    quantity: 2,
    unitPrice: 99.99,
    totalAmount: 199.98,
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel',
  }

  const mockCheckoutSessionResponse: CheckoutSessionResponse = {
    checkoutUrl: 'https://checkout.stripe.com/test',
    sessionId: 'cs_test_123',
  }

  const mockStripeSession: Partial<Stripe.Checkout.Session> = {
    id: 'cs_test_123',
    status: 'complete',
    payment_status: 'paid',
    metadata: {
      eventSlug: 'test-event',
      eventName: 'Test Event',
      quantity: '2',
    },
    // Additional Stripe session properties that we don't use
    object: 'checkout.session',
    amount_subtotal: 19998,
    amount_total: 19998,
    currency: 'usd',
    customer: null,
    customer_details: null,
    customer_email: null,
    expires_at: 1234567890,
    livemode: false,
    locale: null,
    mode: 'payment',
    payment_intent: 'pi_test_123',
    payment_method_collection: 'always',
    payment_method_types: ['card'],
    success_url: 'https://example.com/success',
    url: null,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: {
            createCheckoutSession: jest.fn(),
            verifySession: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<PaymentsController>(PaymentsController)
    paymentsService = module.get<PaymentsService>(PaymentsService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined()
    })
  })

  describe('createCheckoutSession', () => {
    it('should create a checkout session successfully', async () => {
      jest
        .spyOn(paymentsService, 'createCheckoutSession')
        .mockResolvedValue(mockCheckoutSessionResponse)

      const result = await controller.createCheckoutSession(
        mockCheckoutSessionDto,
      )

      expect(paymentsService.createCheckoutSession).toHaveBeenCalledWith(
        mockCheckoutSessionDto,
      )
      expect(result).toEqual(mockCheckoutSessionResponse)
    })

    it('should pass through service errors', async () => {
      const error = new Error('Payment service error')
      jest
        .spyOn(paymentsService, 'createCheckoutSession')
        .mockRejectedValue(error)

      await expect(
        controller.createCheckoutSession(mockCheckoutSessionDto),
      ).rejects.toThrow(error)
    })

    it('should return the exact response from service', async () => {
      const customResponse: CheckoutSessionResponse = {
        checkoutUrl: 'https://custom.stripe.com/session',
        sessionId: 'cs_custom_456',
      }

      jest
        .spyOn(paymentsService, 'createCheckoutSession')
        .mockResolvedValue(customResponse)

      const result = await controller.createCheckoutSession(
        mockCheckoutSessionDto,
      )

      expect(result).toBe(customResponse) // Check reference equality
      expect(result).toEqual(customResponse)
    })
  })

  describe('verifySession', () => {
    it('should verify a session successfully', async () => {
      jest
        .spyOn(paymentsService, 'verifySession')
        .mockResolvedValue(
          mockStripeSession as unknown as Stripe.Checkout.Session,
        )

      const result = await controller.verifySession('cs_test_123')

      expect(paymentsService.verifySession).toHaveBeenCalledWith('cs_test_123')
      expect(result).toEqual({
        id: 'cs_test_123',
        status: 'complete',
        payment_status: 'paid',
        metadata: {
          eventSlug: 'test-event',
          eventName: 'Test Event',
          quantity: '2',
        },
      })
    })

    it('should handle different session statuses', async () => {
      const openSession = {
        ...mockStripeSession,
        status: 'open',
        payment_status: 'unpaid',
      }

      jest
        .spyOn(paymentsService, 'verifySession')
        .mockResolvedValue(openSession as unknown as Stripe.Checkout.Session)

      const result = await controller.verifySession('cs_test_456')

      expect(result).toEqual({
        id: 'cs_test_123',
        status: 'open',
        payment_status: 'unpaid',
        metadata: {
          eventSlug: 'test-event',
          eventName: 'Test Event',
          quantity: '2',
        },
      })
    })

    it('should handle expired sessions', async () => {
      const expiredSession = {
        ...mockStripeSession,
        status: 'expired',
        payment_status: 'unpaid',
      }

      jest
        .spyOn(paymentsService, 'verifySession')
        .mockResolvedValue(expiredSession as unknown as Stripe.Checkout.Session)

      const result = await controller.verifySession('cs_expired_789')

      expect(result.status).toBe('expired')
      expect(result.payment_status).toBe('unpaid')
    })

    it('should handle sessions with no payment required', async () => {
      const freeSession = {
        ...mockStripeSession,
        status: 'complete',
        payment_status: 'no_payment_required',
      }

      jest
        .spyOn(paymentsService, 'verifySession')
        .mockResolvedValue(freeSession as unknown as Stripe.Checkout.Session)

      const result = await controller.verifySession('cs_free_000')

      expect(result.payment_status).toBe('no_payment_required')
    })

    it('should handle sessions without metadata', async () => {
      const sessionWithoutMetadata = {
        ...mockStripeSession,
        metadata: undefined,
      }

      jest
        .spyOn(paymentsService, 'verifySession')
        .mockResolvedValue(
          sessionWithoutMetadata as unknown as Stripe.Checkout.Session,
        )

      const result = await controller.verifySession('cs_no_meta')

      expect(result.metadata).toBeUndefined()
    })

    it('should handle sessions with null metadata', async () => {
      const sessionWithNullMetadata = {
        ...mockStripeSession,
        metadata: null,
      }

      jest
        .spyOn(paymentsService, 'verifySession')
        .mockResolvedValue(
          sessionWithNullMetadata as unknown as Stripe.Checkout.Session,
        )

      const result = await controller.verifySession('cs_null_meta')

      // The controller casts metadata but doesn't transform null values
      expect(result.metadata).toBeNull()
    })

    it('should handle sessions with empty metadata', async () => {
      const sessionWithEmptyMetadata = {
        ...mockStripeSession,
        metadata: {},
      }

      jest
        .spyOn(paymentsService, 'verifySession')
        .mockResolvedValue(
          sessionWithEmptyMetadata as unknown as Stripe.Checkout.Session,
        )

      const result = await controller.verifySession('cs_empty_meta')

      expect(result.metadata).toEqual({})
    })

    it('should pass through service errors', async () => {
      const error = new Error('Session not found')
      jest.spyOn(paymentsService, 'verifySession').mockRejectedValue(error)

      await expect(controller.verifySession('cs_invalid')).rejects.toThrow(
        error,
      )
    })

    it('should correctly map all session properties', async () => {
      const fullSession = {
        id: 'cs_full_test',
        status: 'complete',
        payment_status: 'paid',
        metadata: {
          eventSlug: 'full-event',
          eventName: 'Full Event',
          eventId: '123',
          quantity: '5',
          unitPrice: '49.99',
          totalAmount: '249.95',
        },
        // Extra properties that should be ignored
        customer: 'cus_123',
        payment_intent: 'pi_456',
        amount_total: 24995,
      }

      jest
        .spyOn(paymentsService, 'verifySession')
        .mockResolvedValue(fullSession as unknown as Stripe.Checkout.Session)

      const result: SessionVerificationResponse =
        await controller.verifySession('cs_full_test')

      // Should only include the mapped properties
      expect(result).toEqual({
        id: 'cs_full_test',
        status: 'complete',
        payment_status: 'paid',
        metadata: {
          eventSlug: 'full-event',
          eventName: 'Full Event',
          eventId: '123',
          quantity: '5',
          unitPrice: '49.99',
          totalAmount: '249.95',
        },
      })

      // Should not include unmapped properties
      expect(result).not.toHaveProperty('customer')
      expect(result).not.toHaveProperty('payment_intent')
      expect(result).not.toHaveProperty('amount_total')
    })
  })
})
