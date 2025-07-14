import { HttpException, HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

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

import { AuthController } from '../../../src/auth/auth.controller'
import { clerkClient } from '../../../src/config/clerk.config'

const mockClerkClient = clerkClient as jest.Mocked<typeof clerkClient>
const mockGetUserList = jest.fn()
const mockGetSessionList = jest.fn()
const mockGetSession = jest.fn()

describe('AuthController', () => {
  let controller: AuthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile()

    controller = module.get<AuthController>(AuthController)

    // Set up the mocks
    mockClerkClient.users.getUserList = mockGetUserList
    mockClerkClient.sessions.getSessionList = mockGetSessionList
    mockClerkClient.sessions.getSession = mockGetSession
  })

  afterEach(() => {
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

    it('should return token and userId when session is found', async () => {
      process.env.TEST_USERNAME = 'test@example.com'
      process.env.TEST_PASSWORD = 'password123'

      const mockUser = { id: 'user123' }
      const mockSession = { id: 'session456' }
      const mockSessionWithToken = { id: 'session456' }

      mockGetUserList.mockResolvedValue([mockUser])
      mockGetSessionList.mockResolvedValue([mockSession])
      mockGetSession.mockResolvedValue(mockSessionWithToken)

      const result = await controller.getRealTestToken()

      expect(result).toEqual({
        token: 'session456',
        userId: 'user123',
      })

      expect(mockGetUserList).toHaveBeenCalledWith({
        emailAddress: ['test@example.com'],
      })
      expect(mockGetSessionList).toHaveBeenCalledWith({
        userId: 'user123',
      })
      expect(mockGetSession).toHaveBeenCalledWith('session456')
    })

    it('should throw generic HttpException when clerkClient fails unexpectedly', async () => {
      process.env.TEST_USERNAME = 'test@example.com'
      process.env.TEST_PASSWORD = 'password123'

      const unexpectedError = new Error('Unexpected Clerk API error')
      mockGetUserList.mockRejectedValue(unexpectedError)

      await expect(controller.getRealTestToken()).rejects.toThrow(
        new HttpException(
          'Failed to get token: Unexpected Clerk API error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      )

      expect(mockGetUserList).toHaveBeenCalledWith({
        emailAddress: ['test@example.com'],
      })
    })
  })
})
