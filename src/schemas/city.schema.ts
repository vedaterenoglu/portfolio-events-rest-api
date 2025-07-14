import { z } from 'zod'

import { TCitySchema } from '../generated/zod'
import {
  sanitizePlainText,
  validateAndSanitizeURL,
  validateSlug,
} from '../utils/sanitization'

// Enhanced schema with sanitization and validation
export const CitySchema = TCitySchema.extend({
  citySlug: z
    .string()
    .min(1, 'City slug is required')
    .max(50, 'City slug too long')
    .transform(val => validateSlug(val, 50)),

  city: z
    .string()
    .min(1, 'City name is required')
    .max(100, 'City name too long')
    .transform(val => sanitizePlainText(val, 100)),

  url: z
    .string()
    .min(1, 'URL is required')
    .max(500, 'URL too long')
    .transform(val => validateAndSanitizeURL(val)),

  alt: z
    .string()
    .min(1, 'Alt text is required')
    .max(200, 'Alt text too long')
    .transform(val => sanitizePlainText(val, 200)),
})

export type City = z.infer<typeof CitySchema>

export const CreateCitySchema = CitySchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type CreateCity = z.infer<typeof CreateCitySchema>

export const UpdateCitySchema = CreateCitySchema.partial()

export type UpdateCity = z.infer<typeof UpdateCitySchema>
