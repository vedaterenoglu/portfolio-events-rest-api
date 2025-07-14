import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

// Mock the clerk config
jest.mock('../../../src/config/clerk.config', () => ({
  clerkClient: {
    verifyToken: jest.fn(),
  },
}))

import { clerkClient } from '../../../src/config/clerk.config'
import { JwtAuthGuard } from '../../../src/guards/jwt-auth.guard'

const mockClerkClient = clerkClient as jest.Mocked<typeof clerkClient>

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard
  let mockExecutionContext: ExecutionContext
  let mockRequest: {
    headers: { authorization?: string }
    user?: { sub: string; email: string }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile()

    guard = module.get<JwtAuthGuard>(JwtAuthGuard)

    mockRequest = {
      headers: {},
    }

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('canActivate', () => {
    it('should throw UnauthorizedException when no authorization header is present', async () => {
      mockRequest.headers = {}

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new UnauthorizedException('Authorization token not found'),
      )
    })

    it('should throw UnauthorizedException when authorization header does not have Bearer prefix', async () => {
      mockRequest.headers = {
        authorization: 'InvalidToken',
      }

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new UnauthorizedException('Authorization token not found'),
      )
    })

    it('should accept valid Clerk token and attach user to request', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const mockSession = {
        sub: 'clerk-user-id',
        email: 'user@example.com',
        __raw: 'raw-jwt-token',
        iss: 'https://clerk.com',
        sid: 'session-id',
        nbf: Date.now(),
        exp: Date.now() + 3600000,
        iat: Date.now(),
      }

      mockClerkClient.verifyToken.mockResolvedValue(mockSession)

      mockRequest.headers = {
        authorization: 'Bearer valid-clerk-token',
      }

      const result = await guard.canActivate(mockExecutionContext)

      expect(result).toBe(true)
      expect(mockRequest.user).toEqual(mockSession)
      expect(mockClerkClient.verifyToken).toHaveBeenCalledWith(
        'valid-clerk-token',
      )

      process.env.NODE_ENV = originalEnv
    })

    it('should throw UnauthorizedException when Clerk token validation fails', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      mockClerkClient.verifyToken.mockRejectedValue(new Error('Invalid token'))

      mockRequest.headers = {
        authorization: 'Bearer invalid-clerk-token',
      }

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new UnauthorizedException('Invalid authorization token'),
      )

      expect(mockClerkClient.verifyToken).toHaveBeenCalledWith(
        'invalid-clerk-token',
      )

      process.env.NODE_ENV = originalEnv
    })
  })
})
