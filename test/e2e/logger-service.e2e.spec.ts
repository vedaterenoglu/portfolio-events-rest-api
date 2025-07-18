import * as fs from 'fs'
import * as path from 'path'

import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AppModule } from '../../src/app.module'
import { LoggerService } from '../../src/services/logger/logger.service'

describe('Logger Service (E2E)', () => {
  let app: INestApplication
  let loggerService: LoggerService
  let logFilePath: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    loggerService = moduleFixture.get<LoggerService>(LoggerService)
    logFilePath = path.join(
      __dirname,
      '..',
      '..',
      'src',
      'logs',
      'myLogFile.log',
    )
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    // Clean up log file before each test
    if (fs.existsSync(logFilePath)) {
      await fs.promises.unlink(logFilePath)
    }
  })

  afterEach(async () => {
    // Clean up log file after each test
    if (fs.existsSync(logFilePath)) {
      await fs.promises.unlink(logFilePath)
    }
  })

  describe('logToFile', () => {
    it('should create log file and write entry', async () => {
      const testEntry = 'Test log entry'

      await loggerService.logToFile(testEntry)

      expect(fs.existsSync(logFilePath)).toBe(true)
      const logContent = await fs.promises.readFile(logFilePath, 'utf-8')
      expect(logContent).toContain(testEntry)
      expect(logContent).toMatch(/\d{1,2}\/\d{1,2}\/\d{2}/) // Date format
    })

    it('should create logs directory if it does not exist', async () => {
      const logsDir = path.dirname(logFilePath)

      // Remove logs directory if it exists
      if (fs.existsSync(logsDir)) {
        await fs.promises.rm(logsDir, { recursive: true })
      }

      await loggerService.logToFile('Test entry')

      expect(fs.existsSync(logsDir)).toBe(true)
      expect(fs.existsSync(logFilePath)).toBe(true)
    })

    it('should append multiple entries to the same file', async () => {
      const firstEntry = 'First log entry'
      const secondEntry = 'Second log entry'

      await loggerService.logToFile(firstEntry)
      await loggerService.logToFile(secondEntry)

      const logContent = await fs.promises.readFile(logFilePath, 'utf-8')
      expect(logContent).toContain(firstEntry)
      expect(logContent).toContain(secondEntry)

      // Should have two lines (each entry creates a new line)
      const lines = logContent.trim().split('\n')
      expect(lines.length).toBe(2)
    })

    it('should format log entry with timestamp', async () => {
      const testEntry = 'Formatted log entry'

      await loggerService.logToFile(testEntry)

      const logContent = await fs.promises.readFile(logFilePath, 'utf-8')

      // Check for timestamp format (MM/DD/YY, HH:MM AM/PM)
      expect(logContent).toMatch(
        /\d{1,2}\/\d{1,2}\/\d{2}, \d{1,2}:\d{2}\s?(AM|PM)/,
      )
      expect(logContent).toContain(testEntry)
    })

    it('should handle file write errors gracefully', async () => {
      // Mock fsPromises.appendFile to throw an error
      const originalAppendFile = fs.promises.appendFile
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      jest
        .spyOn(fs.promises, 'appendFile')
        .mockRejectedValue(new Error('File write error'))

      await loggerService.logToFile('Test entry')

      expect(consoleSpy).toHaveBeenCalledWith('File write error')

      // Restore original functions
      jest
        .spyOn(fs.promises, 'appendFile')
        .mockImplementation(originalAppendFile)
      consoleSpy.mockRestore()
    })

    it('should handle non-Error exceptions', async () => {
      // Mock fsPromises.appendFile to throw a non-Error object
      const originalAppendFile = fs.promises.appendFile
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      jest.spyOn(fs.promises, 'appendFile').mockRejectedValue('String error')

      await loggerService.logToFile('Test entry')

      // Should not call console.error for non-Error objects
      expect(consoleSpy).not.toHaveBeenCalled()

      // Restore original functions
      jest
        .spyOn(fs.promises, 'appendFile')
        .mockImplementation(originalAppendFile)
      consoleSpy.mockRestore()
    })
  })

  describe('log method', () => {
    it('should log message with context', async () => {
      const message = 'Test log message'
      const context = 'TestContext'

      // Mock console.log to capture output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      loggerService.log(message, context)

      // Wait for async file operation
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(fs.existsSync(logFilePath)).toBe(true)
      const logContent = await fs.promises.readFile(logFilePath, 'utf-8')
      expect(logContent).toContain(context)
      expect(logContent).toContain(message)

      consoleSpy.mockRestore()
    })

    it('should log message without context', async () => {
      const message = 'Test log message without context'

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      loggerService.log(message)

      // Wait for async file operation
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(fs.existsSync(logFilePath)).toBe(true)
      const logContent = await fs.promises.readFile(logFilePath, 'utf-8')
      expect(logContent).toContain(message)

      consoleSpy.mockRestore()
    })

    it('should handle non-string messages', async () => {
      const messageObject = { test: 'object' }
      const messageNumber = 42

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      loggerService.log(messageObject)
      loggerService.log(messageNumber)

      // Wait for async file operation
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(fs.existsSync(logFilePath)).toBe(true)
      const logContent = await fs.promises.readFile(logFilePath, 'utf-8')
      expect(logContent).toContain('[object Object]')
      expect(logContent).toContain('42')

      consoleSpy.mockRestore()
    })
  })

  describe('error method', () => {
    it('should log error message with stack/context', async () => {
      const errorMessage = 'Test error message'
      const stackOrContext = 'ErrorContext'

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      loggerService.error(errorMessage, stackOrContext)

      // Wait for async file operation
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(fs.existsSync(logFilePath)).toBe(true)
      const logContent = await fs.promises.readFile(logFilePath, 'utf-8')
      expect(logContent).toContain(stackOrContext)
      expect(logContent).toContain(errorMessage)

      consoleSpy.mockRestore()
    })

    it('should log error message without stack/context', async () => {
      const errorMessage = 'Test error message without context'

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      loggerService.error(errorMessage)

      // Wait for async file operation
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(fs.existsSync(logFilePath)).toBe(true)
      const logContent = await fs.promises.readFile(logFilePath, 'utf-8')
      expect(logContent).toContain(errorMessage)

      consoleSpy.mockRestore()
    })

    it('should handle non-string error messages', async () => {
      const errorObject = { error: 'object' }
      const errorNumber = 500

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      loggerService.error(errorObject)
      loggerService.error(errorNumber)

      // Wait for async file operation
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(fs.existsSync(logFilePath)).toBe(true)
      const logContent = await fs.promises.readFile(logFilePath, 'utf-8')
      expect(logContent).toContain('[object Object]')
      expect(logContent).toContain('500')

      consoleSpy.mockRestore()
    })
  })

  describe('Integration with application logging', () => {
    it('should be used throughout the application', () => {
      // Test that the logger service is properly integrated
      expect(loggerService).toBeDefined()
      expect(loggerService).toBeInstanceOf(LoggerService)
    })

    it('should maintain log file across multiple operations', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      // Perform multiple logging operations
      loggerService.log('First log entry', 'Context1')
      loggerService.error('First error entry', 'ErrorContext1')
      loggerService.log('Second log entry', 'Context2')
      loggerService.error('Second error entry', 'ErrorContext2')

      // Wait for async file operations
      await new Promise(resolve => setTimeout(resolve, 200))

      expect(fs.existsSync(logFilePath)).toBe(true)
      const logContent = await fs.promises.readFile(logFilePath, 'utf-8')

      // All entries should be present
      expect(logContent).toContain('First log entry')
      expect(logContent).toContain('First error entry')
      expect(logContent).toContain('Second log entry')
      expect(logContent).toContain('Second error entry')

      // All contexts should be present
      expect(logContent).toContain('Context1')
      expect(logContent).toContain('ErrorContext1')
      expect(logContent).toContain('Context2')
      expect(logContent).toContain('ErrorContext2')

      consoleSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })
  })
})
