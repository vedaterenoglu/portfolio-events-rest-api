import { Test, TestingModule } from '@nestjs/testing'

import { AppController } from '../../src/app.controller'
import { AppModule } from '../../src/app.module'
import { AppService } from '../../src/app.service'

describe('AppModule Integration', () => {
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
