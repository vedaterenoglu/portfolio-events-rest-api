import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { Request } from 'express'

import { clerkClient } from '../config/clerk.config'

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string
    [key: string]: unknown
  }
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const token = this.extractTokenFromHeader(request)

    if (!token) {
      throw new UnauthorizedException('Authorization token not found')
    }

    try {
      const session = await clerkClient.verifyToken(token)
      request.user = session
      return true
    } catch {
      throw new UnauthorizedException('Invalid authorization token')
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return undefined
    }

    const [type, token] = authHeader.split(' ')
    return type === 'Bearer' ? token : undefined
  }
}
