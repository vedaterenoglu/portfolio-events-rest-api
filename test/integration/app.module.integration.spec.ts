import { Test, TestingModule } from '@nestjs/testing'

import { AppController } from '../../src/app.controller'
import { AppModule } from '../../src/app.module'
import { AppService } from '../../src/app.service'

describe('AppModule Integration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Set required environment variables for testing
    process.env = {
      ...originalEnv,
      STRIPE_SECRET_KEY: 'sk_test_integration_key',
    }
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe('Module configuration', () => {
    it('should compile the module with all imports and providers', async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile()

      expect(moduleFixture).toBeDefined()
      expect(moduleFixture.get(AppController)).toBeDefined()
      expect(moduleFixture.get(AppService)).toBeDefined()
    })
  })
})
