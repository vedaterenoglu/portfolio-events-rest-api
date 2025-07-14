import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import { Request } from 'express'

import { clerkClient } from '../config/clerk.config'

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string
    [key: string]: unknown
  }
}

interface ClerkUser {
  publicMetadata: {
    role?: string
    [key: string]: unknown
  }
}

@Injectable()
export class AdminRoleGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const userId = request.user?.sub

    if (!userId) {
      throw new ForbiddenException('User not authenticated')
    }

    try {
      const user = (await clerkClient.users.getUser(userId)) as ClerkUser
      const isAdmin = user.publicMetadata.role === 'admin'

      if (!isAdmin) {
        throw new ForbiddenException('Admin access required')
      }

      return true
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error
      }
      throw new ForbiddenException('Access denied')
    }
  }
}
