import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'

import { Logger } from '@nestjs/common'
import { DotenvConfigOptions } from 'dotenv'

import {
  ApplicationBootstrap,
  BootstrapDependencies,
  EnvironmentLoader,
  defaultBootstrap,
  executeBootstrap,
  isMainModule,
} from '../../src/bootstrap'

describe('Bootstrap E2E Tests', () => {
  const testDir = join(__dirname, '.test-e2e-env')
  const originalCwd = process.cwd()
  const originalEnv = { ...process.env }

  beforeAll(() => {
    // Create test directory
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true })
    }
  })

  afterAll(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }

    // Restore original environment
    process.env = originalEnv
    process.chdir(originalCwd)
  })

  beforeEach(() => {
    // Clear specific test environment variables before each test
    const testVars = [
      'DATABASE_URL',
      'CLERK_SECRET_KEY',
      'PORT',
      'TEST_VAR',
      'SOURCE',
      'API_URL',
      'API_KEY',
      'FEATURE_FLAGS',
      'ALLOWED_ORIGINS',
      'MAX_CONNECTIONS',
      'TIMEOUT_MS',
      'LOG_LEVEL',
      'BOOTSTRAP_TEST',
    ]
    testVars.forEach((varName: string) => {
      delete process.env[varName]
    })
  })

  afterEach(() => {
    // Clean up any created files
    const envFiles = [
      '.env',
      '.env.test',
      '.env.development',
      '.env.production',
    ]
    envFiles.forEach(file => {
      const filePath = join(testDir, file)
      if (existsSync(filePath)) {
        rmSync(filePath)
      }
    })

    // Clear specific test environment variables
    const testVars = [
      'DATABASE_URL',
      'CLERK_SECRET_KEY',
      'PORT',
      'TEST_VAR',
      'SOURCE',
      'API_URL',
      'API_KEY',
      'FEATURE_FLAGS',
      'ALLOWED_ORIGINS',
      'MAX_CONNECTIONS',
      'TIMEOUT_MS',
      'LOG_LEVEL',
      'BOOTSTRAP_TEST',
    ]
    testVars.forEach((varName: string) => {
      delete process.env[varName]
    })

    // Restore original environment
    process.env = { ...originalEnv }
    process.chdir(originalCwd)
  })

  describe('Entry Point Detection E2E', () => {
    it('should correctly identify when module is run directly', () => {
      const mockModule = { filename: 'test.js' } as NodeJS.Module
      const result = isMainModule(mockModule, mockModule)
      expect(result).toBe(true)
    })

    it('should correctly identify when module is imported', () => {
      const mainModule = { filename: 'main.js' } as NodeJS.Module
      const currentModule = { filename: 'imported.js' } as NodeJS.Module
      const result = isMainModule(mainModule, currentModule)
      expect(result).toBe(false)
    })

    it('should handle undefined main module', () => {
      const currentModule = { filename: 'test.js' } as NodeJS.Module
      const result = isMainModule(undefined, currentModule)
      expect(result).toBe(false)
    })
  })

  describe('Bootstrap Execution E2E', () => {
    it('should execute bootstrap function successfully', async () => {
      const originalBootstrap = jest.spyOn(defaultBootstrap, 'bootstrap')
      originalBootstrap.mockResolvedValue()

      await executeBootstrap()

      expect(originalBootstrap).toHaveBeenCalledTimes(1)
      originalBootstrap.mockRestore()
    })

    it('should handle bootstrap execution errors', async () => {
      const originalBootstrap = jest.spyOn(defaultBootstrap, 'bootstrap')
      const testError = new Error('Bootstrap failed')
      originalBootstrap.mockRejectedValue(testError)

      await expect(executeBootstrap()).rejects.toThrow('Bootstrap failed')
      originalBootstrap.mockRestore()
    })
  })

  describe('EnvironmentLoader E2E Tests', () => {
    let environmentLoader: EnvironmentLoader
    let mockLogger: Logger

    beforeEach(() => {
      mockLogger = {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      } as unknown as Logger

      environmentLoader = new EnvironmentLoader(mockLogger)
    })

    it('should load environment from .env.development file in real filesystem', () => {
      const envContent = `
DATABASE_URL=postgres://test:test@localhost:5432/test_dev_e2e
CLERK_SECRET_KEY=sk_test_development_e2e
PORT=3062
TEST_VAR=development_value_e2e
      `.trim()

      writeFileSync(join(testDir, '.env.development'), envContent)

      const originalCwd = process.cwd()
      process.chdir(testDir)

      try {
        process.env.NODE_ENV = 'development'

        // Clear existing env vars that might interfere
        delete process.env.DATABASE_URL
        delete process.env.CLERK_SECRET_KEY
        delete process.env.PORT
        delete process.env.TEST_VAR

        const mockDotenvConfig = jest.fn((options?: DotenvConfigOptions) => {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const dotenv = require('dotenv') as typeof import('dotenv')
          return dotenv.config({ ...options, override: true })
        })

        environmentLoader.loadEnvironment(undefined, {
          dotenvConfig: mockDotenvConfig,
        })

        expect(process.env.DATABASE_URL).toBe(
          'postgres://test:test@localhost:5432/test_dev_e2e',
        )
        expect(process.env.CLERK_SECRET_KEY).toBe('sk_test_development_e2e')
        expect(process.env.PORT).toBe('3062')
        expect(process.env.TEST_VAR).toBe('development_value_e2e')
        expect(mockLogger.log).toHaveBeenCalledWith(
          'Loaded environment from .env.development',
        )
      } finally {
        process.chdir(originalCwd)
      }
    })

    it('should handle production mode correctly', () => {
      const envContent = `
DATABASE_URL=should_not_load_e2e
CLERK_SECRET_KEY=should_not_load_e2e
      `.trim()

      writeFileSync(join(testDir, '.env.production'), envContent)

      const originalCwd = process.cwd()
      process.chdir(testDir)

      try {
        process.env.NODE_ENV = 'production'
        process.env.DATABASE_URL = 'existing_production_db_e2e'
        process.env.CLERK_SECRET_KEY = 'existing_production_key_e2e'

        environmentLoader.loadEnvironment()

        expect(process.env.DATABASE_URL).toBe('existing_production_db_e2e')
        expect(process.env.CLERK_SECRET_KEY).toBe('existing_production_key_e2e')
        expect(mockLogger.log).toHaveBeenCalledWith(
          'Running in production mode - using platform environment variables',
        )
      } finally {
        process.chdir(originalCwd)
      }
    })

    it('should handle corrupted environment files gracefully', () => {
      const envFile = join(testDir, '.env.development')
      const binaryContent = Buffer.from([0x00, 0x01, 0x02, 0x03, 0xff, 0xfe])
      writeFileSync(envFile, binaryContent)

      const originalCwd = process.cwd()
      process.chdir(testDir)

      try {
        process.env.NODE_ENV = 'development'

        expect(() => {
          environmentLoader.loadEnvironment()
        }).not.toThrow()

        expect(process.env.TEST_VAR_E2E).toBeUndefined()
      } finally {
        process.chdir(originalCwd)
      }
    })

    it('should warn when no environment files exist', () => {
      const originalCwd = process.cwd()
      process.chdir(testDir)

      try {
        process.env.NODE_ENV = 'development'
        environmentLoader.loadEnvironment()

        expect(mockLogger.warn).toHaveBeenCalledWith(
          'No environment file found, using process environment variables only',
        )
      } finally {
        process.chdir(originalCwd)
      }
    })
  })

  describe('ApplicationBootstrap E2E Tests', () => {
    let applicationBootstrap: ApplicationBootstrap
    let mockDeps: BootstrapDependencies

    beforeEach(() => {
      jest.clearAllMocks()
      jest.resetModules()

      mockDeps = {
        processExit: jest.fn().mockImplementation(() => {
          throw new Error('Process exit called')
        }) as unknown as (code?: number) => never,
        consoleError: jest.fn(),
      }
    })

    it('should handle application loading failure gracefully', async () => {
      applicationBootstrap = new ApplicationBootstrap(undefined, mockDeps)

      jest.doMock('../../src/main', () => {
        throw new Error('Cannot load main module')
      })

      try {
        await applicationBootstrap.bootstrap()
      } catch (error: unknown) {
        expect(error).toEqual(new Error('Process exit called'))
      }

      expect(mockDeps.consoleError).toHaveBeenCalledWith(
        'Failed to load application:',
        expect.any(Error),
      )
      expect(mockDeps.processExit).toHaveBeenCalledWith(1)

      jest.unmock('../../src/main')
    })

    it('should handle environment configuration with custom config', () => {
      const mockLogger = {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      } as unknown as Logger

      const environmentLoader = new EnvironmentLoader(mockLogger)

      const customConfig = {
        nodeEnv: 'custom',
        envFile: '.env.custom',
        defaultEnvFile: '.env.default',
      }

      const mockExistsSync = jest.fn().mockReturnValue(false)
      const mockDotenvConfig = jest.fn()

      environmentLoader.loadEnvironment(customConfig, {
        existsSync: mockExistsSync,
        dotenvConfig: mockDotenvConfig,
      })

      expect(mockExistsSync).toHaveBeenCalledWith('.env.custom')
      expect(mockExistsSync).toHaveBeenCalledWith('.env.default')
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'No environment file found, using process environment variables only',
      )
    })

    it('should test ApplicationBootstrap with no environment loader (default assignment)', async () => {
      // This covers line 81: default environment loader assignment
      const bootstrap = new ApplicationBootstrap()

      jest.doMock('../../src/main', () => ({}))

      await bootstrap.bootstrap()

      expect(bootstrap).toBeDefined()
      jest.unmock('../../src/main')
    })

    it('should test full constructor coverage with all parameters', () => {
      const mockLogger = {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      } as unknown as Logger

      const environmentLoader = new EnvironmentLoader(mockLogger)
      const customDeps: BootstrapDependencies = {
        processExit: jest.fn() as never,
        consoleError: jest.fn(),
      }

      const bootstrap = new ApplicationBootstrap(environmentLoader, customDeps)
      expect(bootstrap).toBeDefined()
      expect(bootstrap).toHaveProperty('environmentLoader')
      expect(bootstrap).toHaveProperty('deps')
    })
  })

  describe('Default Bootstrap Instance E2E', () => {
    it('should have default bootstrap instance available', () => {
      expect(defaultBootstrap).toBeDefined()
      expect(defaultBootstrap).toBeInstanceOf(ApplicationBootstrap)
    })

    it('should use default environment loader in default bootstrap', () => {
      // Test that the default bootstrap has the expected structure
      expect(defaultBootstrap).toHaveProperty('environmentLoader')
      expect(defaultBootstrap).toHaveProperty('deps')
    })

    it('should test constructor with no dependencies to cover default deps assignment', () => {
      // This covers lines 83-84: default deps assignment in constructor
      const bootstrap = new ApplicationBootstrap()
      expect(bootstrap).toBeDefined()
      expect(bootstrap).toHaveProperty('deps')
    })

    it('should test constructor with partial dependencies to cover default merging', () => {
      // Test with only one dependency to ensure defaults are used for others
      const customDeps: BootstrapDependencies = {
        processExit: jest.fn() as never,
      }
      const bootstrap = new ApplicationBootstrap(undefined, customDeps)
      expect(bootstrap).toBeDefined()
    })
  })

  describe('Error Handling E2E Coverage', () => {
    it('should cover default destructuring in error handling (lines 94-95)', async () => {
      // Create bootstrap with empty deps to trigger default destructuring
      const bootstrap = new ApplicationBootstrap(undefined, {})

      const originalConsoleError = console.error.bind(console)
      const originalProcessExit = process.exit.bind(process)

      const mockConsoleError = jest.fn()
      const mockProcessExit = jest.fn().mockImplementation(() => {
        throw new Error('Process exit')
      })

      console.error = mockConsoleError
      process.exit = mockProcessExit as never

      jest.doMock('../../src/main', () => {
        throw new Error('Main module error')
      })

      try {
        await bootstrap.loadApplication()
      } catch (error) {
        expect(error).toEqual(new Error('Process exit'))
      }

      expect(mockConsoleError).toHaveBeenCalled()
      expect(mockProcessExit).toHaveBeenCalledWith(1)

      console.error = originalConsoleError
      process.exit = originalProcessExit
      jest.unmock('../../src/main')
    })

    it('should test environment loader with no logger to cover default assignment', () => {
      // This ensures we cover the default logger assignment in EnvironmentLoader
      const loader = new EnvironmentLoader()
      expect(loader).toBeDefined()
    })
  })

  describe('Entry Point Execution E2E (Line 124)', () => {
    it('should simulate entry point execution scenario', async () => {
      // Test the entry point logic by simulating the condition
      const mockModule = { filename: 'bootstrap.js' } as NodeJS.Module

      // Mock the bootstrap function to avoid actual execution
      const originalBootstrap = jest.spyOn(defaultBootstrap, 'bootstrap')
      originalBootstrap.mockResolvedValue()

      // Simulate the entry point condition (line 124)
      if (isMainModule(mockModule, mockModule)) {
        await executeBootstrap()
      }

      expect(originalBootstrap).toHaveBeenCalled()
      originalBootstrap.mockRestore()
    })

    it('should test executeBootstrap function directly', async () => {
      const mockBootstrap = jest.spyOn(defaultBootstrap, 'bootstrap')
      mockBootstrap.mockResolvedValue()

      await executeBootstrap()

      expect(mockBootstrap).toHaveBeenCalledTimes(1)
      mockBootstrap.mockRestore()
    })

    it('should handle executeBootstrap errors', async () => {
      const mockBootstrap = jest.spyOn(defaultBootstrap, 'bootstrap')
      const testError = new Error('Bootstrap execution failed')
      mockBootstrap.mockRejectedValue(testError)

      await expect(executeBootstrap()).rejects.toThrow(
        'Bootstrap execution failed',
      )
      mockBootstrap.mockRestore()
    })
  })

  describe('Real Environment Loading E2E', () => {
    it('should load actual environment variables from filesystem', () => {
      const testEnvContent = `
# Test configuration for E2E
DATABASE_URL=postgres://e2e:test@localhost:5432/e2e_test
CLERK_SECRET_KEY=sk_test_e2e_bootstrap
PORT=3068
LOG_LEVEL=debug
NODE_ENV=test
BOOTSTRAP_TEST=true
      `.trim()

      writeFileSync(join(testDir, '.env.test'), testEnvContent)

      const originalCwd = process.cwd()
      process.chdir(testDir)

      try {
        process.env.NODE_ENV = 'test'

        // Clear existing env vars that might interfere
        delete process.env.DATABASE_URL
        delete process.env.CLERK_SECRET_KEY
        delete process.env.PORT
        delete process.env.LOG_LEVEL
        delete process.env.BOOTSTRAP_TEST

        const mockLogger = {
          log: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
        } as unknown as Logger

        const mockDotenvConfig = jest.fn((options?: DotenvConfigOptions) => {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const dotenv = require('dotenv') as typeof import('dotenv')
          return dotenv.config({ ...options, override: true })
        })

        const environmentLoader = new EnvironmentLoader(mockLogger)
        environmentLoader.loadEnvironment(undefined, {
          dotenvConfig: mockDotenvConfig,
        })

        expect(process.env.DATABASE_URL).toBe(
          'postgres://e2e:test@localhost:5432/e2e_test',
        )
        expect(process.env.CLERK_SECRET_KEY).toBe('sk_test_e2e_bootstrap')
        expect(process.env.PORT).toBe('3068')
        expect(process.env.LOG_LEVEL).toBe('debug')
        expect(process.env.BOOTSTRAP_TEST).toBe('true')
        expect(mockLogger.log).toHaveBeenCalledWith(
          'Loaded environment from .env.test',
        )
      } finally {
        process.chdir(originalCwd)
      }
    })

    it('should handle complex environment variable scenarios', () => {
      const complexEnvContent = `
# Complex environment variables
API_URL=https://api.example.com/v1
API_KEY=abc123def456ghi789
FEATURE_FLAGS={"feature1":true,"feature2":false}
ALLOWED_ORIGINS=http://localhost:3000,https://app.example.com
MAX_CONNECTIONS=100
TIMEOUT_MS=30000
      `.trim()

      writeFileSync(join(testDir, '.env.development'), complexEnvContent)

      const originalCwd = process.cwd()
      process.chdir(testDir)

      try {
        process.env.NODE_ENV = 'development'

        // Clear existing env vars that might interfere
        delete process.env.API_URL
        delete process.env.API_KEY
        delete process.env.FEATURE_FLAGS
        delete process.env.ALLOWED_ORIGINS
        delete process.env.MAX_CONNECTIONS
        delete process.env.TIMEOUT_MS

        const mockLogger = {
          log: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
        } as unknown as Logger

        const mockDotenvConfig = jest.fn((options?: DotenvConfigOptions) => {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const dotenv = require('dotenv') as typeof import('dotenv')
          return dotenv.config({ ...options, override: true })
        })

        const environmentLoader = new EnvironmentLoader(mockLogger)
        environmentLoader.loadEnvironment(undefined, {
          dotenvConfig: mockDotenvConfig,
        })

        expect(process.env.API_URL).toBe('https://api.example.com/v1')
        expect(process.env.API_KEY).toBe('abc123def456ghi789')
        expect(process.env.FEATURE_FLAGS).toBe(
          '{"feature1":true,"feature2":false}',
        )
        expect(process.env.ALLOWED_ORIGINS).toBe(
          'http://localhost:3000,https://app.example.com',
        )
        expect(process.env.MAX_CONNECTIONS).toBe('100')
        expect(process.env.TIMEOUT_MS).toBe('30000')
      } finally {
        process.chdir(originalCwd)
      }
    })
  })
})
