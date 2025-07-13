import { z } from 'zod'

import { TEventSchema } from '../generated/zod'

// Use auto-generated schema as base
export const EventSchema = TEventSchema

export type Event = z.infer<typeof EventSchema>

export const CreateEventSchema = EventSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateEvent = z.infer<typeof CreateEventSchema>

export const UpdateEventSchema = CreateEventSchema.partial()

export type UpdateEvent = z.infer<typeof UpdateEventSchema>
