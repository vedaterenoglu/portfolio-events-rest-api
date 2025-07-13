import * as fs from 'fs'

import { Test, TestingModule } from '@nestjs/testing'

import { LoggerService } from '../../../src/services/logger/logger.service'

describe('LoggerService Integration', () => {
  let service: LoggerService
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile()

    service = module.get<LoggerService>(LoggerService)
  })

  afterEach(async () => {
    if (module) {
      await module.close()
    }
  })

  describe('log method', () => {
    it('should call logToFile and super.log when log method is called', () => {
      const testMessage = 'Test log message'
      const testContext = 'TestContext'

      const logToFileSpy = jest.spyOn(service, 'logToFile').mockResolvedValue()
      const superLogSpy = jest.spyOn(
        Object.getPrototypeOf(Object.getPrototypeOf(service)),
        'log',
      )

      service.log(testMessage, testContext)

      expect(logToFileSpy).toHaveBeenCalledWith(
        `${testContext}\t${testMessage}`,
      )
      expect(superLogSpy).toHaveBeenCalledWith(testMessage, testContext)

      logToFileSpy.mockRestore()
      superLogSpy.mockRestore()
    })

    it('should handle undefined context parameter in log method', () => {
      const testMessage = 'Test log message without context'

      const logToFileSpy = jest.spyOn(service, 'logToFile').mockResolvedValue()
      const superLogSpy = jest.spyOn(
        Object.getPrototypeOf(Object.getPrototypeOf(service)),
        'log',
      )

      service.log(testMessage)

      expect(logToFileSpy).toHaveBeenCalledWith(`\t${testMessage}`)
      expect(superLogSpy).toHaveBeenCalledWith(testMessage, undefined)

      logToFileSpy.mockRestore()
      superLogSpy.mockRestore()
    })
  })

  describe('error method', () => {
    it('should call logToFile and super.error when error method is called', () => {
      const testMessage = 'Test error message'
      const testStackOrContext = 'TestStack'

      const logToFileSpy = jest.spyOn(service, 'logToFile').mockResolvedValue()
      const superErrorSpy = jest.spyOn(
        Object.getPrototypeOf(Object.getPrototypeOf(service)),
        'error',
      )

      service.error(testMessage, testStackOrContext)

      expect(logToFileSpy).toHaveBeenCalledWith(
        `${testStackOrContext}\t${testMessage}`,
      )
      expect(superErrorSpy).toHaveBeenCalledWith(
        testMessage,
        testStackOrContext,
      )

      logToFileSpy.mockRestore()
      superErrorSpy.mockRestore()
    })
  })

  describe('logToFile method', () => {
    it('should handle file system operations correctly', async () => {
      const testMessage = 'Test file log message'

      const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true)
      const appendFileSpy = jest
        .spyOn(fs.promises, 'appendFile')
        .mockResolvedValue(undefined)

      await service.logToFile(testMessage)

      expect(existsSyncSpy).toHaveBeenCalled()
      expect(appendFileSpy).toHaveBeenCalled()

      existsSyncSpy.mockRestore()
      appendFileSpy.mockRestore()
    })

    it('should handle file system errors gracefully', async () => {
      const testMessage = 'Error test log entry'

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true)
      const appendFileSpy = jest
        .spyOn(fs.promises, 'appendFile')
        .mockRejectedValue(new Error('ENOSPC: no space left on device'))

      await service.logToFile(testMessage)

      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(existsSyncSpy).toHaveBeenCalled()
      expect(appendFileSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
      existsSyncSpy.mockRestore()
      appendFileSpy.mockRestore()
    })

    it('should handle directory creation errors gracefully', async () => {
      const testMessage = 'Directory error test log entry'

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false)
      const mkdirSpy = jest
        .spyOn(fs.promises, 'mkdir')
        .mockRejectedValue(new Error('EACCES: permission denied'))

      await service.logToFile(testMessage)

      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(existsSyncSpy).toHaveBeenCalled()
      expect(mkdirSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
      existsSyncSpy.mockRestore()
      mkdirSpy.mockRestore()
    })

    it('should handle non-Error exceptions in catch block', async () => {
      const testMessage = 'Non-error exception test'

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true)
      const appendFileSpy = jest
        .spyOn(fs.promises, 'appendFile')
        .mockRejectedValue('String error instead of Error object')

      await service.logToFile(testMessage)

      expect(consoleErrorSpy).not.toHaveBeenCalled()
      expect(existsSyncSpy).toHaveBeenCalled()
      expect(appendFileSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
      existsSyncSpy.mockRestore()
      appendFileSpy.mockRestore()
    })
  })
})
