import { APP_GUARD } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import { ThrottlerGuard } from '@nestjs/throttler'

import { AppController } from '../../src/app.controller'
import { AppModule } from '../../src/app.module'
import { AppService } from '../../src/app.service'

interface ProviderConfig {
  provide: string | symbol
  useClass: new (...args: unknown[]) => unknown
}

describe('AppModule', () => {
  let module: TestingModule
  const originalEnv = process.env

  beforeEach(async () => {
    // Set required environment variables for testing
    process.env = {
      ...originalEnv,
      STRIPE_SECRET_KEY: 'sk_test_mock_stripe_key_for_testing',
    }

    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
  })

  afterEach(async () => {
    // Restore original environment variables
    process.env = originalEnv
    
    if (module) {
      await module.close()
    }
  })

  describe('Module compilation', () => {
    it('should compile the module successfully', () => {
      expect(module).toBeDefined()
      expect(module).toBeInstanceOf(TestingModule)
    })

    it('should provide AppController', () => {
      const controller = module.get<AppController>(AppController)
      expect(controller).toBeDefined()
      expect(controller).toBeInstanceOf(AppController)
    })

    it('should provide AppService', () => {
      const service = module.get<AppService>(AppService)
      expect(service).toBeDefined()
      expect(service).toBeInstanceOf(AppService)
    })

    it('should provide ThrottlerGuard as APP_GUARD', () => {
      const providers = (Reflect.getMetadata('providers', AppModule) ||
        []) as ProviderConfig[]
      const appGuardProvider = providers.find(
        (provider: ProviderConfig) =>
          provider.provide === APP_GUARD &&
          provider.useClass === ThrottlerGuard,
      )
      expect(appGuardProvider).toBeDefined()
      expect(appGuardProvider?.provide).toBe(APP_GUARD)
      expect(appGuardProvider?.useClass).toBe(ThrottlerGuard)
    })
  })
})
