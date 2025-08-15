import { z } from 'zod'

/**
 * Payment Schema - Type-safe validation for payment operations
 *
 * Design Patterns Applied:
 * 1. **Schema Pattern**: Centralized data validation and typing
 * 2. **Data Transfer Object Pattern**: Clean data contracts between layers
 * 3. **Validation Pattern**: Input sanitization and type safety
 *
 * SOLID Principles:
 * - **SRP**: Only responsible for payment data validation and typing
 * - **OCP**: Extensible for additional payment fields without modification
 * - **ISP**: Focused schemas for specific payment operations
 * - **DIP**: Services depend on these type abstractions
 */

// Input validation schema for checkout session creation
export const CreateCheckoutSessionSchema = z.object({
  eventSlug: z
    .string()
    .min(1, 'Event slug is required')
    .max(100, 'Event slug too long'),
  eventName: z
    .string()
    .min(1, 'Event name is required')
    .max(200, 'Event name too long'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Maximum 100 tickets per transaction'),
  unitPrice: z
    .number()
    .min(0, 'Unit price must be non-negative')
    .max(10000, 'Unit price too high'),
  totalAmount: z
    .number()
    .min(0, 'Total amount must be non-negative')
    .max(1000000, 'Total amount too high'),
  successUrl: z
    .string()
    .url('Success URL must be valid')
    .max(500, 'Success URL too long'),
  cancelUrl: z
    .string()
    .url('Cancel URL must be valid')
    .max(500, 'Cancel URL too long'),
})

// Type inference for request DTOs
export type CreateCheckoutSessionDto = z.infer<
  typeof CreateCheckoutSessionSchema
>

// Response schema for checkout session
export const CheckoutSessionResponseSchema = z.object({
  checkoutUrl: z.string().url('Checkout URL must be valid'),
  sessionId: z.string().min(1, 'Session ID is required'),
})

// Type inference for response DTOs
export type CheckoutSessionResponse = z.infer<
  typeof CheckoutSessionResponseSchema
>

// Session verification response schema
export const SessionVerificationResponseSchema = z.object({
  id: z.string(),
  status: z.enum(['open', 'complete', 'expired']),
  payment_status: z.enum(['paid', 'unpaid', 'no_payment_required']),
  metadata: z.record(z.string(), z.string()).optional(),
})

// Type inference for session verification
export type SessionVerificationResponse = z.infer<
  typeof SessionVerificationResponseSchema
>

// Error response schema for consistent error handling
export const PaymentErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.enum([
    'VALIDATION_ERROR',
    'EVENT_NOT_FOUND',
    'PRICE_MISMATCH',
    'STRIPE_ERROR',
    'SERVER_ERROR',
  ]),
  message: z.string(),
})

// Type inference for error responses
export type PaymentErrorResponse = z.infer<typeof PaymentErrorResponseSchema>
