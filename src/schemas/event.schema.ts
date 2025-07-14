import { z } from 'zod'

import { TEventSchema } from '../generated/zod'
import {
  sanitizePlainText,
  sanitizeRichText,
  validateAndSanitizeURL,
  validateSlug,
} from '../utils/sanitization'

// Enhanced schema with sanitization and validation
export const EventSchema = TEventSchema.extend({
  name: z
    .string()
    .min(1, 'Event name is required')
    .max(200, 'Event name too long')
    .transform(val => sanitizePlainText(val, 200)),

  slug: z
    .string()
    .min(1, 'Event slug is required')
    .max(100, 'Event slug too long')
    .transform(val => validateSlug(val, 100)),

  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City name too long')
    .transform(val => sanitizePlainText(val, 100)),

  citySlug: z
    .string()
    .min(1, 'City slug is required')
    .max(50, 'City slug too long')
    .transform(val => validateSlug(val, 50)),

  location: z
    .string()
    .min(1, 'Location is required')
    .max(300, 'Location too long')
    .transform(val => sanitizePlainText(val, 300)),

  organizerName: z
    .string()
    .min(1, 'Organizer name is required')
    .max(150, 'Organizer name too long')
    .transform(val => sanitizePlainText(val, 150)),

  imageUrl: z
    .string()
    .min(1, 'Image URL is required')
    .max(500, 'Image URL too long')
    .transform(val => validateAndSanitizeURL(val)),

  alt: z
    .string()
    .min(1, 'Alt text is required')
    .max(200, 'Alt text too long')
    .transform(val => sanitizePlainText(val, 200)),

  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description too long')
    .transform(val => sanitizeRichText(val, 2000)),

  price: z
    .number()
    .int('Price must be an integer')
    .min(0, 'Price cannot be negative'),
})

export type Event = z.infer<typeof EventSchema>

export const CreateEventSchema = EventSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateEvent = z.infer<typeof CreateEventSchema>

export const UpdateEventSchema = CreateEventSchema.partial()

export type UpdateEvent = z.infer<typeof UpdateEventSchema>
