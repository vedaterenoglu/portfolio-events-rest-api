import { z } from 'zod'

import { sanitizePlainText } from '../utils/sanitization'

export const EventsQuerySchema = z
  .object({
    search: z
      .string()
      .min(1, 'Search term too short')
      .max(50, 'Search term too long')
      .transform(val => sanitizePlainText(val, 50))
      .optional(),

    limit: z
      .string()
      .optional()
      .transform(val => parseInt(val || '50') || 50)
      .refine(val => val >= 1 && val <= 100, {
        message: 'Limit must be between 1 and 100',
      }),

    offset: z
      .string()
      .optional()
      .transform(val => parseInt(val || '0') || 0)
      .refine(val => val >= 0, {
        message: 'Offset must be non-negative',
      }),

    orderBy: z
      .enum(['date', 'name', 'city', 'createdAt', 'updatedAt'])
      .optional()
      .default('date'),

    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  })
  .transform(data => ({
    search: data.search,
    limit: data.limit,
    offset: data.offset,
    orderBy: data.orderBy,
    sortOrder: data.sortOrder,
  }))

export type EventsQuery = z.infer<typeof EventsQuerySchema>
