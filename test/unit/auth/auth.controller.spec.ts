import { Test } from '@nestjs/testing'

import { AuthController } from '../../../src/auth/auth.controller'

describe('AuthController', () => {
  let authController: AuthController

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile()

    authController = moduleRef.get<AuthController>(AuthController)
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
