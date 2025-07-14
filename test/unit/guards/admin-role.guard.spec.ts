import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

// Mock the clerk config
jest.mock('../../../src/config/clerk.config', () => ({
  clerkClient: {
    users: {
      getUser: jest.fn(),
    },
  },
}))

import { clerkClient } from '../../../src/config/clerk.config'
import { AdminRoleGuard } from '../../../src/guards/admin-role.guard'

const mockClerkClient = clerkClient as jest.Mocked<typeof clerkClient>
const mockGetUser = jest.fn()

describe('AdminRoleGuard', () => {
  let guard: AdminRoleGuard
  let mockExecutionContext: ExecutionContext
  let mockRequest: {
    user?: { sub: string; email: string } | undefined
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminRoleGuard],
    }).compile()

    guard = module.get<AdminRoleGuard>(AdminRoleGuard)

    mockRequest = {}

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext

    // Set up the mock to use our mockGetUser function
    mockClerkClient.users.getUser = mockGetUser
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('canActivate', () => {
    it('should throw ForbiddenException when user is not authenticated', async () => {
      mockRequest.user = undefined

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new ForbiddenException('User not authenticated'),
      )
    })

    it('should allow test user in development mode', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      mockRequest.user = {
        sub: 'test-user-id',
        email: 'test@test.com',
      }

      const result = await guard.canActivate(mockExecutionContext)

      expect(result).toBe(true)

      process.env.NODE_ENV = originalEnv
    })

    it('should allow user with admin role', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      mockRequest.user = {
        sub: 'admin-user-id',
        email: 'admin@test.com',
      }

      const mockUser = {
        publicMetadata: {
          role: 'admin',
        },
      }

      mockGetUser.mockResolvedValue(mockUser)

      const result = await guard.canActivate(mockExecutionContext)

      expect(result).toBe(true)
      expect(mockGetUser).toHaveBeenCalledWith('admin-user-id')

      process.env.NODE_ENV = originalEnv
    })

    it('should throw ForbiddenException when user is not admin', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      mockRequest.user = {
        sub: 'regular-user-id',
        email: 'user@test.com',
      }

      const mockUser = {
        publicMetadata: {
          role: 'user',
        },
      }

      mockGetUser.mockResolvedValue(mockUser)

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new ForbiddenException('Admin access required'),
      )

      expect(mockGetUser).toHaveBeenCalledWith('regular-user-id')

      process.env.NODE_ENV = originalEnv
    })

    it('should throw ForbiddenException when clerkClient throws an error', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      mockRequest.user = {
        sub: 'error-user-id',
        email: 'error@test.com',
      }

      mockGetUser.mockRejectedValue(new Error('Clerk API error'))

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new ForbiddenException('Access denied'),
      )

      expect(mockGetUser).toHaveBeenCalledWith('error-user-id')

      process.env.NODE_ENV = originalEnv
    })
  })
})
