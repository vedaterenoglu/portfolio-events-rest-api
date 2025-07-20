import { z } from 'zod'
import type { Prisma } from '../client'

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum([
  'ReadUncommitted',
  'ReadCommitted',
  'RepeatableRead',
  'Serializable',
])

export const TCityScalarFieldEnumSchema = z.enum([
  'citySlug',
  'city',
  'url',
  'alt',
  'createdAt',
  'updatedAt',
])

export const TEventScalarFieldEnumSchema = z.enum([
  'id',
  'name',
  'slug',
  'city',
  'citySlug',
  'location',
  'date',
  'organizerName',
  'imageUrl',
  'alt',
  'description',
  'price',
  'createdAt',
  'updatedAt',
])

export const SortOrderSchema = z.enum(['asc', 'desc'])

export const QueryModeSchema = z.enum(['default', 'insensitive'])
/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// T CITY SCHEMA
/////////////////////////////////////////

export const TCitySchema = z.object({
  citySlug: z.string(),
  city: z.string(),
  url: z.string(),
  alt: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type TCity = z.infer<typeof TCitySchema>

/////////////////////////////////////////
// T EVENT SCHEMA
/////////////////////////////////////////

export const TEventSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  slug: z.string(),
  city: z.string(),
  citySlug: z.string(),
  location: z.string(),
  date: z.coerce.date(),
  organizerName: z.string(),
  imageUrl: z.string(),
  alt: z.string(),
  description: z.string(),
  price: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type TEvent = z.infer<typeof TEventSchema>
