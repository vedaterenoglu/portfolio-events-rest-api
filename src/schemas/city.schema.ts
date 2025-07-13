import { z } from 'zod'

import { TCitySchema } from '../generated/zod'

// Use auto-generated schema as base
export const CitySchema = TCitySchema

export type City = z.infer<typeof CitySchema>

export const CreateCitySchema = CitySchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type CreateCity = z.infer<typeof CreateCitySchema>

export const UpdateCitySchema = CreateCitySchema.partial()

export type UpdateCity = z.infer<typeof UpdateCitySchema>
