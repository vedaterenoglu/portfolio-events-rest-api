import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'

import { PaymentsService } from '../../../src/payments/payments.service'
import { EventsService } from '../../../src/events/events.service'
import { LoggerService } from '../../../src/services/logger/logger.service'
import {
  CreateCheckoutSessionDto,
  CheckoutSessionResponse,
} from '../../../src/schemas/payment.schema'

// Mock Stripe module
jest.mock('stripe')

describe('PaymentsService', () => {
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
    name: 'Test Event',
    slug: 'test-event',
    price: 99.99,
    imageUrl: 'https://example.com/image.jpg',
    alt: 'Test Event Image',
    description: 'Test Description',
    date: new Date('2025-01-01'),
    location: 'Test Location',
    city: 'Test City',
    citySlug: 'test-city',
    organizerName: 'Test Organizer',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockCheckoutSession = {
    id: 'cs_test_123',
    url: 'https://checkout.stripe.com/test',
    payment_status: 'unpaid',
    status: 'open',
    metadata: {},
  }

  const mockCreateCheckoutSessionDto: CreateCheckoutSessionDto = {
    eventSlug: 'test-event',
    eventName: 'Test Event',
    quantity: 2,
    unitPrice: 99.99,
    totalAmount: 199.98,
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel',
  }

  beforeEach(async () => {
    // Set required environment variable
    process.env = {
      ...originalEnv,
      STRIPE_SECRET_KEY: 'sk_test_mock_key',
    }

    // Reset all mocks
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
    const Stripe = require('stripe')
    Stripe.mockImplementation(() => mockStripeInstance)
    
    // Mock Stripe.errors for error handling tests
    Stripe.errors = {
      StripeError: class StripeError extends Error {
        constructor(message: string) {
          super(message)
          this.name = 'StripeError'
        }
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: EventsService,
          useValue: {
            getEventBySlug: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
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

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
    })

    it('should throw error if STRIPE_SECRET_KEY is not set', () => {
      delete process.env.STRIPE_SECRET_KEY
      
      expect(() => {
        new PaymentsService(eventsService, loggerService)
      }).toThrow('STRIPE_SECRET_KEY environment variable is required')
    })

    it('should initialize Stripe with correct API version', () => {
      const Stripe = require('stripe')
      expect(Stripe).toHaveBeenCalledWith('sk_test_mock_key', {
        apiVersion: '2025-06-30.basil',
      })
    })
  })

  describe('createCheckoutSession', () => {
    it('should create a checkout session successfully', async () => {
      jest.spyOn(eventsService, 'getEventBySlug').mockResolvedValue(mockEvent)
      mockStripeInstance.checkout.sessions.create.mockResolvedValue(mockCheckoutSession)

      const result: CheckoutSessionResponse = await service.createCheckoutSession(
        mockCreateCheckoutSessionDto,
      )

      expect(eventsService.getEventBySlug).toHaveBeenCalledWith('test-event')
      expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Test Event',
                description: '2 tickets for Test Event',
                images: ['https://example.com/image.jpg'],
              },
              unit_amount: 9999,
            },
            quantity: 2,
          },
        ],
        mode: 'payment',
        success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://example.com/cancel',
        metadata: {
          eventSlug: 'test-event',
          eventName: 'Test Event',
          eventId: '1',
          quantity: '2',
          unitPrice: '99.99',
          totalAmount: '199.98',
        },
      })
      expect(result).toEqual({
        checkoutUrl: 'https://checkout.stripe.com/test',
        sessionId: 'cs_test_123',
      })
      expect(loggerService.log).toHaveBeenCalledWith(
        'Checkout session created successfully',
      )
    })

    it('should handle event without imageUrl', async () => {
      const eventWithoutImage = { ...mockEvent, imageUrl: '' }
      jest.spyOn(eventsService, 'getEventBySlug').mockResolvedValue(eventWithoutImage)
      mockStripeInstance.checkout.sessions.create.mockResolvedValue(mockCheckoutSession)

      await service.createCheckoutSession(mockCreateCheckoutSessionDto)

      expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [
            expect.objectContaining({
              price_data: expect.objectContaining({
                product_data: expect.objectContaining({
                  images: [],
                }),
              }),
            }),
          ],
        }),
      )
    })

    it('should handle single quantity correctly', async () => {
      const singleQuantityDto = {
        ...mockCreateCheckoutSessionDto,
        quantity: 1,
        totalAmount: 99.99,
      }
      jest.spyOn(eventsService, 'getEventBySlug').mockResolvedValue(mockEvent)
      mockStripeInstance.checkout.sessions.create.mockResolvedValue(mockCheckoutSession)

      await service.createCheckoutSession(singleQuantityDto)

      expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [
            expect.objectContaining({
              price_data: expect.objectContaining({
                product_data: expect.objectContaining({
                  description: '1 ticket for Test Event',
                }),
              }),
            }),
          ],
        }),
      )
    })

    it('should throw NotFoundException when event not found', async () => {
      jest.spyOn(eventsService, 'getEventBySlug').mockResolvedValue(null as unknown as typeof mockEvent)

      await expect(
        service.createCheckoutSession(mockCreateCheckoutSessionDto),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw BadRequestException when price mismatches', async () => {
      const mismatchedDto = {
        ...mockCreateCheckoutSessionDto,
        unitPrice: 89.99, // Wrong price
      }
      jest.spyOn(eventsService, 'getEventBySlug').mockResolvedValue(mockEvent)

      await expect(
        service.createCheckoutSession(mismatchedDto),
      ).rejects.toThrow(BadRequestException)
      
      expect(loggerService.warn).toHaveBeenCalledWith(
        'Price mismatch attempt detected',
        expect.objectContaining({
          eventSlug: 'test-event',
          databasePrice: 99.99,
          clientPrice: 89.99,
        }),
      )
    })

    it('should throw BadRequestException when total amount calculation is wrong', async () => {
      const wrongTotalDto = {
        ...mockCreateCheckoutSessionDto,
        totalAmount: 150.00, // Wrong total
      }
      jest.spyOn(eventsService, 'getEventBySlug').mockResolvedValue(mockEvent)

      await expect(
        service.createCheckoutSession(wrongTotalDto),
      ).rejects.toThrow(BadRequestException)
      
      expect(loggerService.warn).toHaveBeenCalledWith(
        'Total amount calculation error',
        expect.objectContaining({
          eventSlug: 'test-event',
          expectedTotal: 199.98,
          clientTotal: 150.00,
        }),
      )
    })

    it('should throw BadRequestException when checkout URL is not generated', async () => {
      const sessionWithoutUrl = { ...mockCheckoutSession, url: null }
      jest.spyOn(eventsService, 'getEventBySlug').mockResolvedValue(mockEvent)
      mockStripeInstance.checkout.sessions.create.mockResolvedValue(sessionWithoutUrl)

      await expect(
        service.createCheckoutSession(mockCreateCheckoutSessionDto),
      ).rejects.toThrow('Failed to generate checkout URL')
    })

    it('should handle Stripe API errors', async () => {
      const Stripe = require('stripe')
      const stripeError = new Stripe.errors.StripeError('Stripe API error')
      
      jest.spyOn(eventsService, 'getEventBySlug').mockResolvedValue(mockEvent)
      mockStripeInstance.checkout.sessions.create.mockRejectedValue(stripeError)

      await expect(
        service.createCheckoutSession(mockCreateCheckoutSessionDto),
      ).rejects.toThrow('Payment system error')
      
      expect(loggerService.error).toHaveBeenCalledWith(
        expect.stringContaining('Stripe API error'),
      )
    })

    it('should handle generic errors', async () => {
      jest.spyOn(eventsService, 'getEventBySlug').mockResolvedValue(mockEvent)
      mockStripeInstance.checkout.sessions.create.mockRejectedValue(
        new Error('Generic error'),
      )

      await expect(
        service.createCheckoutSession(mockCreateCheckoutSessionDto),
      ).rejects.toThrow('Failed to create payment session')
      
      expect(loggerService.error).toHaveBeenCalledWith(
        expect.stringContaining('Generic error'),
      )
    })

    it('should re-throw NotFoundException from getEventBySlug', async () => {
      const notFoundError = new NotFoundException('Event not found')
      jest.spyOn(eventsService, 'getEventBySlug').mockRejectedValue(notFoundError)

      await expect(
        service.createCheckoutSession(mockCreateCheckoutSessionDto),
      ).rejects.toThrow(notFoundError)
    })

    it('should handle non-Error objects in catch block', async () => {
      jest.spyOn(eventsService, 'getEventBySlug').mockResolvedValue(mockEvent)
      mockStripeInstance.checkout.sessions.create.mockRejectedValue('string error')

      await expect(
        service.createCheckoutSession(mockCreateCheckoutSessionDto),
      ).rejects.toThrow('Failed to create payment session')
      
      expect(loggerService.error).toHaveBeenCalledWith(
        'Failed to create checkout session: string error',
      )
    })
  })

  describe('verifySession', () => {
    it('should verify a session successfully', async () => {
      mockStripeInstance.checkout.sessions.retrieve.mockResolvedValue(mockCheckoutSession)

      const result = await service.verifySession('cs_test_123')

      expect(mockStripeInstance.checkout.sessions.retrieve).toHaveBeenCalledWith('cs_test_123')
      expect(result).toEqual(mockCheckoutSession)
      expect(loggerService.log).toHaveBeenCalledWith('Session verified successfully')
    })

    it('should handle Stripe errors during verification', async () => {
      const Stripe = require('stripe')
      const stripeError = new Stripe.errors.StripeError('Session not found')
      
      mockStripeInstance.checkout.sessions.retrieve.mockRejectedValue(stripeError)

      await expect(service.verifySession('invalid_session')).rejects.toThrow(
        'Invalid or expired session',
      )
      
      expect(loggerService.error).toHaveBeenCalledWith(
        expect.stringContaining('Session not found'),
      )
    })

    it('should handle generic errors during verification', async () => {
      mockStripeInstance.checkout.sessions.retrieve.mockRejectedValue(
        new Error('Network error'),
      )

      await expect(service.verifySession('cs_test_123')).rejects.toThrow(
        'Session verification failed',
      )
      
      expect(loggerService.error).toHaveBeenCalledWith(
        expect.stringContaining('Network error'),
      )
    })

    it('should handle non-Error objects in verification catch block', async () => {
      mockStripeInstance.checkout.sessions.retrieve.mockRejectedValue({
        code: 'UNKNOWN',
        message: 'Unknown error object',
      })

      await expect(service.verifySession('cs_test_123')).rejects.toThrow(
        'Session verification failed',
      )
      
      expect(loggerService.error).toHaveBeenCalledWith(
        expect.stringContaining('[object Object]'),
      )
    })
  })
})
