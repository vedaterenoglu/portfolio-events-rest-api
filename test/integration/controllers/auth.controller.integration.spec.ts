import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { AuthController } from '../../../src/auth/auth.controller'
import { AuthModule } from '../../../src/auth/auth.module'

describe('AuthController Integration', () => {
  let app: INestApplication
  let authController: AuthController

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile()

    app = moduleRef.createNestApplication()
    authController = moduleRef.get<AuthController>(AuthController)
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('AuthController', () => {
    it('should be defined', () => {
      expect(authController).toBeDefined()
    })

    it('should be an instance of AuthController', () => {
      expect(authController).toBeInstanceOf(AuthController)
    })
  })
})
