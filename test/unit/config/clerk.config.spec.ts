// Set up environment variables for the test
process.env.CLERK_SECRET_KEY = 'sk_test_mock_secret_key'
process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_mock_publishable_key'

// Mock the Clerk SDK to prevent actual client instantiation
jest.mock('@clerk/clerk-sdk-node', () => ({
  createClerkClient: jest.fn().mockReturnValue({
    users: {},
    sessions: {},
  }),
}))

import { validateClerkConfig } from '../../../src/config/clerk.config'

describe('clerk.config', () => {
  describe('validateClerkConfig', () => {
    it('should throw error when CLERK_SECRET_KEY is not set', () => {
      const originalSecretKey = process.env.CLERK_SECRET_KEY
      const originalPublishableKey = process.env.CLERK_PUBLISHABLE_KEY

      delete process.env.CLERK_SECRET_KEY
      process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_publishable_key'

      expect(() => validateClerkConfig()).toThrow(
        'CLERK_SECRET_KEY environment variable is required',
      )

      process.env.CLERK_SECRET_KEY = originalSecretKey
      process.env.CLERK_PUBLISHABLE_KEY = originalPublishableKey
    })

    it('should throw error when CLERK_PUBLISHABLE_KEY is not set', () => {
      const originalSecretKey = process.env.CLERK_SECRET_KEY
      const originalPublishableKey = process.env.CLERK_PUBLISHABLE_KEY

      process.env.CLERK_SECRET_KEY = 'sk_test_secret_key'
      delete process.env.CLERK_PUBLISHABLE_KEY

      expect(() => validateClerkConfig()).toThrow(
        'CLERK_PUBLISHABLE_KEY environment variable is required',
      )

      process.env.CLERK_SECRET_KEY = originalSecretKey
      process.env.CLERK_PUBLISHABLE_KEY = originalPublishableKey
    })
  })
})
