import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'

import { getPrismaClient, disconnectPrisma } from '../lib/prisma'

import type { PrismaClient } from '../lib/prisma'

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient

  constructor() {
    this.prisma = getPrismaClient()
  }

  async onModuleInit() {
    await this.prisma.$connect()
  }

  async onModuleDestroy() {
    await disconnectPrisma()
  }

  // Delegate pattern to expose Prisma models
  get tCity() {
    return this.prisma.tCity
  }

  get tEvent() {
    return this.prisma.tEvent
  }

  // Add other models as needed
}
