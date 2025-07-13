import { Test, TestingModule } from '@nestjs/testing'

import { DatabaseService } from '../../../src/database/database.service'

describe('DatabaseService', () => {
  let service: DatabaseService

  beforeEach(async () => {
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

  it('should have PrismaClient methods and OnModuleInit interface', () => {
    expect(typeof service.$connect).toBe('function')
    expect(typeof service.$disconnect).toBe('function')
    expect(typeof service.onModuleInit).toBe('function')
    expect(service.constructor.name).toBe('DatabaseService')
  })

  describe('onModuleInit', () => {
    it('should call $connect when module initializes', async () => {
      const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue()

      await service.onModuleInit()

      expect(connectSpy).toHaveBeenCalledTimes(1)
      expect(connectSpy).toHaveBeenCalledWith()
    })

    it('should handle $connect errors properly', async () => {
      const connectionError = new Error('Database connection failed')
      const connectSpy = jest
        .spyOn(service, '$connect')
        .mockRejectedValue(connectionError)

      await expect(service.onModuleInit()).rejects.toThrow(
        'Database connection failed',
      )
      expect(connectSpy).toHaveBeenCalledTimes(1)
    })
  })
})
