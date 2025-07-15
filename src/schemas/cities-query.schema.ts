import { z } from 'zod'

import { sanitizePlainText } from '../utils/sanitization'

// Query parameter validation schema for GET /api/cities
export const CitiesQuerySchema = z.object({
  search: z
    .string()
    .min(1, 'Search term must be at least 1 character')
    .max(50, 'Search term cannot exceed 50 characters')
    .transform(val => sanitizePlainText(val, 50))
    .optional(),

  limit: z
    .string()
    .optional()
    .transform(val => parseInt(val || '50') || 50)
    .refine(val => val >= 1, 'Limit must be at least 1')
    .refine(val => val <= 100, 'Limit cannot exceed 100'),

  offset: z
    .string()
    .optional()
    .transform(val => parseInt(val || '0') || 0)
    .refine(val => val >= 0, 'Offset must be at least 0'),

  orderBy: z
    .enum(['city', 'createdAt', 'updatedAt'])
    .optional()
    .default('city'),

  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),

  includeEventCount: z
    .string()
    .optional()
    .transform(val => val === 'true'),
})

export type CitiesQuery = z.infer<typeof CitiesQuerySchema>
