import { z } from 'zod'

export const CitySchema = z.object({
  id: z.string().min(1),
  citySlug: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  url: z.string().regex(/^https?:\/\/.+/, 'Invalid URL format'),
  alt: z.string().min(1).max(200),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type City = z.infer<typeof CitySchema>

export const CreateCitySchema = CitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateCity = z.infer<typeof CreateCitySchema>

export const UpdateCitySchema = CreateCitySchema.partial()

export type UpdateCity = z.infer<typeof UpdateCitySchema>
