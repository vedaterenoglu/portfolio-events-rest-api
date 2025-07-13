import { Test, TestingModule } from '@nestjs/testing'

import { DatabaseService } from '../../../src/database/database.service'
import * as prismaLib from '../../../src/lib/prisma'

describe('DatabaseService', () => {
  let service: DatabaseService
  let mockPrismaClient: {
    $connect: jest.Mock<Promise<void>, []>
    $disconnect: jest.Mock<Promise<void>, []>
    tCity: Record<string, unknown>
    tEvent: Record<string, unknown>
  }

  beforeEach(async () => {
    // Create minimal mock matching only what DatabaseService uses
    mockPrismaClient = {
      $connect: jest.fn<Promise<void>, []>().mockResolvedValue(undefined),
      $disconnect: jest.fn<Promise<void>, []>().mockResolvedValue(undefined),
      tCity: {},
      tEvent: {},
    }

    // Mock the singleton function to return our minimal mock
    jest
      .spyOn(prismaLib, 'getPrismaClient')
      .mockReturnValue(mockPrismaClient as never)

    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseService],
    }).compile()

    service = module.get<DatabaseService>(DatabaseService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should have delegation methods and OnModuleInit interface', () => {
    expect(typeof service.tCity).toBe('object')
    expect(typeof service.tEvent).toBe('object')
    expect(typeof service.onModuleInit).toBe('function')
    expect(typeof service.onModuleDestroy).toBe('function')
    expect(service.constructor.name).toBe('DatabaseService')
  })

  describe('onModuleInit', () => {
    it('should call $connect when module initializes', async () => {
      await service.onModuleInit()

      expect(mockPrismaClient.$connect).toHaveBeenCalledTimes(1)
      expect(mockPrismaClient.$connect).toHaveBeenCalledWith()
    })

    it('should handle $connect errors properly', async () => {
      const connectionError = new Error('Database connection failed')
      mockPrismaClient.$connect.mockRejectedValue(connectionError)

      await expect(service.onModuleInit()).rejects.toThrow(
        'Database connection failed',
      )
      expect(mockPrismaClient.$connect).toHaveBeenCalledTimes(1)
    })
  })
})
