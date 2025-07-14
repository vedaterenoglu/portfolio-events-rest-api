import { Controller, Post, HttpException, HttpStatus } from '@nestjs/common'

import { clerkClient } from '../config/clerk.config'

interface SignInResponse {
  token: string
  userId: string
}

@Controller('api/auth')
export class AuthController {
  @Post('test-token')
  getTestToken(): SignInResponse {
    // For testing purposes, we'll create a mock JWT token
    // In production, you must use Clerk's frontend authentication
    const mockToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJyb2xlIjoiYWRtaW4ifQ.mock-signature'

    return {
      token: mockToken,
      userId: 'test-user-id',
    }
  }

  @Post('test-token-real')
  async getRealTestToken(): Promise<SignInResponse> {
    const username = process.env.TEST_USERNAME
    const password = process.env.TEST_PASSWORD

    if (!username || !password) {
      throw new HttpException(
        'TEST_USERNAME and TEST_PASSWORD must be set in .env file',
        HttpStatus.BAD_REQUEST,
      )
    }

    try {
      // First, get the user by email
      const users = await clerkClient.users.getUserList({
        emailAddress: [username],
      })

      if (users.length === 0) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND)
      }

      const user = users[0]
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND)
      }

      // Create a session for the user
      // Note: Clerk SDK doesn't directly support password verification in backend
      // In production, you should use Clerk's frontend auth flow
      // This is just for testing purposes
      const sessions = await clerkClient.sessions.getSessionList({
        userId: user.id,
      })

      if (sessions.length > 0) {
        // Return the latest session token
        const session = sessions[0]
        if (!session) {
          throw new HttpException('No session found', HttpStatus.NOT_FOUND)
        }

        // Get the session JWT token
        const sessionWithToken = await clerkClient.sessions.getSession(
          session.id,
        )
        return {
          token: sessionWithToken.id, // Session ID can be used as token for testing
          userId: user.id,
        }
      }

      // If no session exists, we can't create one with password from backend
      // You'll need to sign in through frontend first
      throw new HttpException(
        'No active session found. Please sign in through Clerk frontend first.',
        HttpStatus.NOT_FOUND,
      )
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        'Failed to get token: ' + (error as Error).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
