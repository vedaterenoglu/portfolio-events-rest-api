import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { clerkClient } from '../../../src/config/clerk.config'
import { AdminRoleGuard } from '../../../src/guards/admin-role.guard'

// Mock the clerk config
jest.mock('../../../src/config/clerk.config', () => ({
  clerkClient: {
    users: {
      getUser: jest.fn(),
    },
  },
}))

const mockClerkClient = clerkClient as jest.Mocked<typeof clerkClient>
const mockGetUser = jest.fn()

describe('AdminRoleGuard Integration', () => {
  let guard: AdminRoleGuard
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [AdminRoleGuard],
    }).compile()

    guard = module.get<AdminRoleGuard>(AdminRoleGuard)

    // Set up the mocks
    mockClerkClient.users.getUser = mockGetUser
  })

  afterEach(async () => {
    if (module) {
      await module.close()
    }
    jest.clearAllMocks()
  })

  const createMockExecutionContext = (user?: {
    sub: string
  }): ExecutionContext => {
    const mockRequest = {
      user,
    }

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext
  }

  describe('canActivate', () => {
    it('should throw ForbiddenException when user is not authenticated', async () => {
      const context = createMockExecutionContext()

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('User not authenticated'),
      )
    })

    it('should return true for admin user with admin role', async () => {
      const mockUser = {
        publicMetadata: {
          role: 'admin',
        },
      }

      mockGetUser.mockResolvedValue(mockUser)

      const context = createMockExecutionContext({ sub: 'admin-user-id' })

      const result = await guard.canActivate(context)

      expect(result).toBe(true)
      expect(mockGetUser).toHaveBeenCalledWith('admin-user-id')
    })

    it('should throw ForbiddenException for non-admin user', async () => {
      const mockUser = {
        publicMetadata: {
          role: 'user',
        },
      }

      mockGetUser.mockResolvedValue(mockUser)

      const context = createMockExecutionContext({ sub: 'regular-user-id' })

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('Admin access required'),
      )

      expect(mockGetUser).toHaveBeenCalledWith('regular-user-id')
    })
  })
})
