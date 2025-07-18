import { Test, TestingModule } from '@nestjs/testing'

import { AdminDatabaseController } from '../../../src/admin/admin-database.controller'
import { DatabaseResetService } from '../../../src/admin/database-reset.service'
import { AdminRoleGuard } from '../../../src/guards/admin-role.guard'
import { JwtAuthGuard } from '../../../src/guards/jwt-auth.guard'

describe('AdminDatabaseController', () => {
  let controller: AdminDatabaseController
  let databaseResetService: DatabaseResetService

  const mockResetDatabase = jest.fn()
  const mockTruncateDatabase = jest.fn()

  const mockDatabaseResetService = {
    resetDatabase: mockResetDatabase,
    truncateDatabase: mockTruncateDatabase,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDatabaseController],
      providers: [
        {
          provide: DatabaseResetService,
          useValue: mockDatabaseResetService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .overrideGuard(AdminRoleGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile()

    controller = module.get<AdminDatabaseController>(AdminDatabaseController)
    databaseResetService =
      module.get<DatabaseResetService>(DatabaseResetService)

    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
    expect(databaseResetService).toBeDefined()
  })

  describe('resetDatabase', () => {
    it('should call databaseResetService.resetDatabase and return result', async () => {
      // Arrange
      const expectedResult = {
        message: 'Database reset and seeded successfully',
        counts: {
          cities: 5,
          events: 10,
        },
      }
      mockResetDatabase.mockResolvedValue(expectedResult)

      // Act
      const result = await controller.resetDatabase()

      // Assert
      expect(mockResetDatabase).toHaveBeenCalledTimes(1)
      expect(mockResetDatabase).toHaveBeenCalledWith()
      expect(result).toEqual(expectedResult)
    })

    it('should handle service errors correctly', async () => {
      // Arrange
      const serviceError = new Error('Database reset failed')
      mockResetDatabase.mockRejectedValue(serviceError)

      // Act & Assert
      await expect(controller.resetDatabase()).rejects.toThrow(
        'Database reset failed',
      )
      expect(mockResetDatabase).toHaveBeenCalledTimes(1)
    })
  })

  describe('truncateDatabase', () => {
    it('should call databaseResetService.truncateDatabase and return result', async () => {
      // Arrange
      const expectedResult = {
        message: 'Database truncated successfully',
      }
      mockTruncateDatabase.mockResolvedValue(expectedResult)

      // Act
      const result = await controller.truncateDatabase()

      // Assert
      expect(mockTruncateDatabase).toHaveBeenCalledTimes(1)
      expect(mockTruncateDatabase).toHaveBeenCalledWith()
      expect(result).toEqual(expectedResult)
    })

    it('should handle service errors correctly', async () => {
      // Arrange
      const serviceError = new Error('Database truncate failed')
      mockTruncateDatabase.mockRejectedValue(serviceError)

      // Act & Assert
      await expect(controller.truncateDatabase()).rejects.toThrow(
        'Database truncate failed',
      )
      expect(mockTruncateDatabase).toHaveBeenCalledTimes(1)
    })
  })

  describe('constructor', () => {
    it('should inject DatabaseResetService correctly', () => {
      expect(controller['databaseResetService']).toBe(databaseResetService)
    })
  })
})
