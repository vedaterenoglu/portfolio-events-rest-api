import { Test, TestingModule } from '@nestjs/testing'

import { DatabaseService } from '../../../src/database/database.service'

describe('DatabaseService Integration', () => {
  let service: DatabaseService
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [DatabaseService],
    }).compile()

    service = module.get<DatabaseService>(DatabaseService)
  })

  afterEach(async () => {
    if (module) {
      await module.close()
    }
  })

  describe('service initialization', () => {
    it('should be defined and have required properties', () => {
      expect(service).toBeDefined()
      expect(service.tCity).toBeDefined()
      expect(service.tEvent).toBeDefined()
    })

    it('should call onModuleInit lifecycle method', async () => {
      const prismaClient = (
        service as unknown as { prisma: { $connect: () => Promise<void> } }
      ).prisma
      const connectSpy = jest
        .spyOn(prismaClient, '$connect')
        .mockResolvedValue()

      await service.onModuleInit()

      expect(connectSpy).toHaveBeenCalled()
    })
  })
})
