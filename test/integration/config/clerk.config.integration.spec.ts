// Set environment variables before any imports
process.env.CLERK_SECRET_KEY = 'sk_test_example_for_imports'
process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_example_for_imports'

// Mock the clerk SDK to prevent module-level execution errors
jest.mock('@clerk/clerk-sdk-node', () => ({
  createClerkClient: jest.fn(() => ({})),
}))

import { validateClerkConfig } from '../../../src/config/clerk.config'

describe('ClerkConfig Integration', () => {
  let originalSecretKey: string | undefined
  let originalPublishableKey: string | undefined

  beforeEach(() => {
    originalSecretKey = process.env.CLERK_SECRET_KEY
    originalPublishableKey = process.env.CLERK_PUBLISHABLE_KEY
  })

  afterEach(() => {
    process.env.CLERK_SECRET_KEY = originalSecretKey
    process.env.CLERK_PUBLISHABLE_KEY = originalPublishableKey
  })

  describe('validateClerkConfig', () => {
    it('should throw error when CLERK_SECRET_KEY is missing', () => {
      delete process.env.CLERK_SECRET_KEY
      process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_example'

      expect(() => validateClerkConfig()).toThrow(
        'CLERK_SECRET_KEY environment variable is required',
      )
    })

    it('should throw error when CLERK_PUBLISHABLE_KEY is missing', () => {
      process.env.CLERK_SECRET_KEY = 'sk_test_example'
      delete process.env.CLERK_PUBLISHABLE_KEY

      expect(() => validateClerkConfig()).toThrow(
        'CLERK_PUBLISHABLE_KEY environment variable is required',
      )
    })

    it('should return config when both keys are present', () => {
      process.env.CLERK_SECRET_KEY = 'sk_test_example'
      process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_example'

      const config = validateClerkConfig()

      expect(config).toEqual({
        secretKey: 'sk_test_example',
        publishableKey: 'pk_test_example',
      })
    })
  })
})
