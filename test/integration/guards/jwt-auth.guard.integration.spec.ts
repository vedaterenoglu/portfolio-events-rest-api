import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { clerkClient } from '../../../src/config/clerk.config'
import { JwtAuthGuard } from '../../../src/guards/jwt-auth.guard'

// Mock the clerk config
jest.mock('../../../src/config/clerk.config', () => ({
  clerkClient: {
    verifyToken: jest.fn(),
  },
}))

const mockClerkClient = clerkClient as jest.Mocked<typeof clerkClient>
const mockVerifyToken = jest.fn()

describe('JwtAuthGuard Integration', () => {
  let guard: JwtAuthGuard
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile()

    guard = module.get<JwtAuthGuard>(JwtAuthGuard)

    // Set up the mocks
    mockClerkClient.verifyToken = mockVerifyToken
  })

  afterEach(async () => {
    if (module) {
      await module.close()
    }
    jest.clearAllMocks()
  })

  interface MockRequest {
    headers: {
      authorization?: string
    }
    user?: {
      sub: string
      email: string
    }
  }

  const createMockExecutionContext = (
    authHeader?: string,
  ): ExecutionContext => {
    const mockRequest: MockRequest = {
      headers: {
        ...(authHeader && { authorization: authHeader }),
      },
    }

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext
  }

  describe('canActivate', () => {
    it('should throw UnauthorizedException when no authorization header', async () => {
      const context = createMockExecutionContext()

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Authorization token not found'),
      )
    })

    it('should return true for mock token in development mode', async () => {
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const context = createMockExecutionContext(
        'Bearer eyJhbGciOiJIUzI1NiJ9.mock-signature',
      )

      const result = await guard.canActivate(context)

      expect(result).toBe(true)

      process.env.NODE_ENV = originalNodeEnv
    })

    it('should return true for valid real token', async () => {
      const mockSession = {
        sub: 'clerk-user-id',
        email: 'user@example.com',
      }

      mockVerifyToken.mockResolvedValue(mockSession)

      const context = createMockExecutionContext('Bearer valid-real-token')

      const result = await guard.canActivate(context)

      expect(result).toBe(true)
      expect(mockVerifyToken).toHaveBeenCalledWith('valid-real-token')
    })
  })
})
