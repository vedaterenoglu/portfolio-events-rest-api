import * as fs from 'fs'
import { promises as fsPromises } from 'fs'

import { Test, TestingModule } from '@nestjs/testing'

import { LoggerService } from '../../../src/services/logger/logger.service'

jest.mock('fs')
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    appendFile: jest.fn(),
  },
  existsSync: jest.fn(),
}))

describe('LoggerService', () => {
  let service: LoggerService
  let mockExistsSync: jest.MockedFunction<typeof fs.existsSync>
  let mockMkdir: jest.MockedFunction<typeof fsPromises.mkdir>
  let mockAppendFile: jest.MockedFunction<typeof fsPromises.appendFile>
  let consoleErrorSpy: jest.SpyInstance
  let superLogSpy: jest.SpyInstance
  let superErrorSpy: jest.SpyInstance

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService] as const,
    }).compile()

    service = module.get<LoggerService>(LoggerService)

    mockExistsSync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>
    mockMkdir = fsPromises.mkdir as jest.MockedFunction<typeof fsPromises.mkdir>
    mockAppendFile = fsPromises.appendFile as jest.MockedFunction<
      typeof fsPromises.appendFile
    >

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    superLogSpy = jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(service)), 'log')
      .mockImplementation()
    superErrorSpy = jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(service)), 'error')
      .mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
    consoleErrorSpy.mockRestore()
    superLogSpy.mockRestore()
    superErrorSpy.mockRestore()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('logToFile', () => {
    it('should create logs directory and append to file when directory does not exist', async () => {
      mockExistsSync.mockReturnValue(false)
      mockMkdir.mockResolvedValue(undefined)
      mockAppendFile.mockResolvedValue()

      await service.logToFile('test message')

      expect(mockExistsSync).toHaveBeenCalledWith(
        expect.stringContaining('logs'),
      )
      expect(mockMkdir).toHaveBeenCalledWith(expect.stringContaining('logs'))
      expect(mockAppendFile).toHaveBeenCalledWith(
        expect.stringContaining('myLogFile.log'),
        expect.stringContaining('test message'),
      )
    })

    it('should append to file when directory exists', async () => {
      mockExistsSync.mockReturnValue(true)
      mockAppendFile.mockResolvedValue()

      await service.logToFile('test message')

      expect(mockExistsSync).toHaveBeenCalledWith(
        expect.stringContaining('logs'),
      )
      expect(mockMkdir).not.toHaveBeenCalled()
      expect(mockAppendFile).toHaveBeenCalledWith(
        expect.stringContaining('myLogFile.log'),
        expect.stringContaining('test message'),
      )
    })

    it('should handle Error instances in catch block', async () => {
      const error = new Error('File system error')
      mockExistsSync.mockReturnValue(false)
      mockMkdir.mockRejectedValue(error)

      await service.logToFile('test message')

      expect(consoleErrorSpy).toHaveBeenCalledWith('File system error')
    })

    it('should handle non-Error exceptions in catch block', async () => {
      mockExistsSync.mockReturnValue(false)
      mockMkdir.mockRejectedValue('string error')

      await service.logToFile('test message')

      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })
  })

  describe('log', () => {
    it('should call logToFile and super.log with context', () => {
      const logToFileSpy = jest
        .spyOn(service, 'logToFile')
        .mockResolvedValue(undefined)

      service.log('test message', 'TestContext')

      expect(logToFileSpy).toHaveBeenCalledWith('TestContext\ttest message')
      expect(superLogSpy).toHaveBeenCalledWith('test message', 'TestContext')
    })

    it('should call logToFile and super.log without context', () => {
      const logToFileSpy = jest
        .spyOn(service, 'logToFile')
        .mockResolvedValue(undefined)

      service.log('test message')

      expect(logToFileSpy).toHaveBeenCalledWith('\ttest message')
      expect(superLogSpy).toHaveBeenCalledWith('test message', undefined)
    })
  })

  describe('error', () => {
    it('should call logToFile and super.error with stack/context', () => {
      const logToFileSpy = jest
        .spyOn(service, 'logToFile')
        .mockResolvedValue(undefined)

      service.error('error message', 'ErrorStack')

      expect(logToFileSpy).toHaveBeenCalledWith('ErrorStack\terror message')
      expect(superErrorSpy).toHaveBeenCalledWith('error message', 'ErrorStack')
    })

    it('should call logToFile and super.error without stack/context', () => {
      const logToFileSpy = jest
        .spyOn(service, 'logToFile')
        .mockResolvedValue(undefined)

      service.error('error message')

      expect(logToFileSpy).toHaveBeenCalledWith('\terror message')
      expect(superErrorSpy).toHaveBeenCalledWith('error message', undefined)
    })
  })
})
