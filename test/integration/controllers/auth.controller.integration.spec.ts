import { HttpException, HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AuthController } from '../../../src/auth/auth.controller'
import { clerkClient } from '../../../src/config/clerk.config'

// Mock the clerk config
jest.mock('../../../src/config/clerk.config', () => ({
  clerkClient: {
    users: {
      getUserList: jest.fn(),
    },
    sessions: {
      getSessionList: jest.fn(),
      getSession: jest.fn(),
    },
  },
}))

const mockClerkClient = clerkClient as jest.Mocked<typeof clerkClient>
const mockGetUserList = jest.fn()
const mockGetSessionList = jest.fn()
const mockGetSession = jest.fn()

describe('AuthController Integration', () => {
  let controller: AuthController
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile()

    controller = module.get<AuthController>(AuthController)

    // Set up the mocks
    mockClerkClient.users.getUserList = mockGetUserList
    mockClerkClient.sessions.getSessionList = mockGetSessionList
    mockClerkClient.sessions.getSession = mockGetSession
  })

  afterEach(async () => {
    if (module) {
      await module.close()
    }
    jest.clearAllMocks()
  })

  describe('getTestToken', () => {
    it('should return a mock token and user ID', () => {
      const result = controller.getTestToken()

      expect(result).toHaveProperty('token')
      expect(result).toHaveProperty('userId')
      expect(result.userId).toBe('test-user-id')
      expect(typeof result.token).toBe('string')
      expect(result.token.length).toBeGreaterThan(0)
    })
  })

  describe('getRealTestToken', () => {
    it('should throw HttpException when TEST_USERNAME is not set', async () => {
      const originalUsername = process.env.TEST_USERNAME
      const originalPassword = process.env.TEST_PASSWORD

      delete process.env.TEST_USERNAME
      delete process.env.TEST_PASSWORD

      await expect(controller.getRealTestToken()).rejects.toThrow(
        new HttpException(
          'TEST_USERNAME and TEST_PASSWORD must be set in .env file',
          HttpStatus.BAD_REQUEST,
        ),
      )

      process.env.TEST_USERNAME = originalUsername
      process.env.TEST_PASSWORD = originalPassword
    })

    it('should throw HttpException when user is not found', async () => {
      process.env.TEST_USERNAME = 'test@example.com'
      process.env.TEST_PASSWORD = 'password123'

      mockGetUserList.mockResolvedValue([])

      await expect(controller.getRealTestToken()).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      )

      expect(mockGetUserList).toHaveBeenCalledWith({
        emailAddress: ['test@example.com'],
      })
    })

    it('should throw HttpException when user is null', async () => {
      process.env.TEST_USERNAME = 'test@example.com'
      process.env.TEST_PASSWORD = 'password123'

      mockGetUserList.mockResolvedValue([null])

      await expect(controller.getRealTestToken()).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      )

      expect(mockGetUserList).toHaveBeenCalledWith({
        emailAddress: ['test@example.com'],
      })
    })

    it('should throw HttpException when no active sessions found', async () => {
      process.env.TEST_USERNAME = 'test@example.com'
      process.env.TEST_PASSWORD = 'password123'

      const mockUser = { id: 'user123' }
      mockGetUserList.mockResolvedValue([mockUser])
      mockGetSessionList.mockResolvedValue([])

      await expect(controller.getRealTestToken()).rejects.toThrow(
        new HttpException(
          'No active session found. Please sign in through Clerk frontend first.',
          HttpStatus.NOT_FOUND,
        ),
      )

      expect(mockGetUserList).toHaveBeenCalledWith({
        emailAddress: ['test@example.com'],
      })
      expect(mockGetSessionList).toHaveBeenCalledWith({
        userId: 'user123',
      })
    })

    it('should throw HttpException when session is null', async () => {
      process.env.TEST_USERNAME = 'test@example.com'
      process.env.TEST_PASSWORD = 'password123'

      const mockUser = { id: 'user123' }
      mockGetUserList.mockResolvedValue([mockUser])
      mockGetSessionList.mockResolvedValue([null])

      await expect(controller.getRealTestToken()).rejects.toThrow(
        new HttpException('No session found', HttpStatus.NOT_FOUND),
      )

      expect(mockGetUserList).toHaveBeenCalledWith({
        emailAddress: ['test@example.com'],
      })
      expect(mockGetSessionList).toHaveBeenCalledWith({
        userId: 'user123',
      })
    })

    it('should return token and userId when valid session exists', async () => {
      process.env.TEST_USERNAME = 'test@example.com'
      process.env.TEST_PASSWORD = 'password123'

      const mockUser = { id: 'user123' }
      const mockSession = { id: 'session123' }
      const mockSessionWithToken = { id: 'session123' }

      mockGetUserList.mockResolvedValue([mockUser])
      mockGetSessionList.mockResolvedValue([mockSession])
      mockGetSession.mockResolvedValue(mockSessionWithToken)

      const result = await controller.getRealTestToken()

      expect(result).toEqual({
        token: 'session123',
        userId: 'user123',
      })

      expect(mockGetUserList).toHaveBeenCalledWith({
        emailAddress: ['test@example.com'],
      })
      expect(mockGetSessionList).toHaveBeenCalledWith({
        userId: 'user123',
      })
      expect(mockGetSession).toHaveBeenCalledWith('session123')
    })
  })
})
