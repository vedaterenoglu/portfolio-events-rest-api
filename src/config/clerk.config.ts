import { createClerkClient } from '@clerk/clerk-sdk-node'

interface ClerkConfig {
  secretKey: string
  publishableKey: string
}

export function validateClerkConfig(): ClerkConfig {
  const secretKey = process.env.CLERK_SECRET_KEY
  const publishableKey = process.env.CLERK_PUBLISHABLE_KEY

  if (!secretKey) {
    throw new Error('CLERK_SECRET_KEY environment variable is required')
  }

  if (!publishableKey) {
    throw new Error('CLERK_PUBLISHABLE_KEY environment variable is required')
  }

  return {
    secretKey,
    publishableKey,
  }
}

export function createClerkClientInstance() {
  const config = validateClerkConfig()
  return createClerkClient({
    secretKey: config.secretKey,
  })
}

export const clerkClient = createClerkClientInstance()
