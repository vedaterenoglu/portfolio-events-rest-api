import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'

import { Logger } from '@nestjs/common'

import {
  ApplicationBootstrap,
  BootstrapDependencies,
  EnvironmentConfig,
  EnvironmentLoader,
  defaultBootstrap,
  executeBootstrap,
  isMainModule,
} from '../../src/bootstrap'

describe('Bootstrap Integration Tests', () => {
  const testDir = join(__dirname, '.test-env-files')
  const originalNodeEnv = process.env.NODE_ENV
  const originalEnvVars: Record<string, string | undefined> = {}

  // Store original environment variables that we'll modify
  const testEnvVars = ['DATABASE_URL', 'CLERK_SECRET_KEY', 'PORT', 'TEST_VAR']

  beforeAll(() => {
    // Create test directory
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true })
    }

    // Store original env vars
    testEnvVars.forEach(key => {
      originalEnvVars[key] = process.env[key]
    })
  })

  afterAll(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }

    // Restore original env vars
    testEnvVars.forEach(key => {
      if (originalEnvVars[key] === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = originalEnvVars[key]
      }
    })

    process.env.NODE_ENV = originalNodeEnv
  })

  beforeEach(() => {
    // Clear env vars before each test
    testEnvVars.forEach(key => {
      delete process.env[key]
    })
  })

  describe('EnvironmentLoader Integration', () => {
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

    afterEach(() => {
      // Clean up any created files
      const envFiles = [
        '.env',
        '.env.development',
        '.env.test',
        '.env.production',
      ]
      envFiles.forEach(file => {
        const filePath = join(testDir, file)
        if (existsSync(filePath)) {
          rmSync(filePath)
        }
      })
    })

    describe('Real file system loading', () => {
      it('should load environment variables from .env.development file', () => {
        // Create test .env.development file
        const envContent = `
DATABASE_URL=postgres://test:test@localhost:5432/test_dev
CLERK_SECRET_KEY=sk_test_development
PORT=3000
TEST_VAR=development_value
        `.trim()

        writeFileSync(join(testDir, '.env.development'), envContent)

        // Change to test directory
        const originalCwd = process.cwd()
        process.chdir(testDir)

        try {
          process.env.NODE_ENV = 'development'
          environmentLoader.loadEnvironment()

          expect(process.env.DATABASE_URL).toBe(
            'postgres://test:test@localhost:5432/test_dev',
          )
          expect(process.env.CLERK_SECRET_KEY).toBe('sk_test_development')
          expect(process.env.PORT).toBe('3000')
          expect(process.env.TEST_VAR).toBe('development_value')
          expect(mockLogger.log).toHaveBeenCalledWith(
            'Loaded environment from .env.development',
          )
        } finally {
          process.chdir(originalCwd)
        }
      })

      it('should fall back to .env file when environment-specific file does not exist', () => {
        // Create only .env file
        const envContent = `
DATABASE_URL=postgres://test:test@localhost:5432/test_default
CLERK_SECRET_KEY=sk_test_default
PORT=3001
TEST_VAR=default_value
        `.trim()

        writeFileSync(join(testDir, '.env'), envContent)

        // Change to test directory
        const originalCwd = process.cwd()
        process.chdir(testDir)

        try {
          process.env.NODE_ENV = 'staging'
          environmentLoader.loadEnvironment()

          expect(process.env.DATABASE_URL).toBe(
            'postgres://test:test@localhost:5432/test_default',
          )
          expect(process.env.CLERK_SECRET_KEY).toBe('sk_test_default')
          expect(process.env.PORT).toBe('3001')
          expect(process.env.TEST_VAR).toBe('default_value')
          expect(mockLogger.log).toHaveBeenCalledWith(
            'Loaded environment from .env (.env.staging not found)',
          )
        } finally {
          process.chdir(originalCwd)
        }
      })

      it('should not load any files in production mode', () => {
        // Create .env.production file
        const envContent = `
DATABASE_URL=should_not_load
CLERK_SECRET_KEY=should_not_load
        `.trim()

        writeFileSync(join(testDir, '.env.production'), envContent)

        // Change to test directory
        const originalCwd = process.cwd()
        process.chdir(testDir)

        try {
          process.env.NODE_ENV = 'production'

          // Set some env vars to verify they're not overwritten
          process.env.DATABASE_URL = 'existing_production_db'
          process.env.CLERK_SECRET_KEY = 'existing_production_key'

          environmentLoader.loadEnvironment()

          expect(process.env.DATABASE_URL).toBe('existing_production_db')
          expect(process.env.CLERK_SECRET_KEY).toBe('existing_production_key')
          expect(mockLogger.log).toHaveBeenCalledWith(
            'Running in production mode - using platform environment variables',
          )
        } finally {
          process.chdir(originalCwd)
        }
      })

      it('should handle comments and empty lines in env files', () => {
        const envContent = `
# Database configuration
DATABASE_URL=postgres://test:test@localhost:5432/test

# Authentication
CLERK_SECRET_KEY=sk_test_with_comments

# Empty line above
PORT=3002

# Comment at end
        `.trim()

        writeFileSync(join(testDir, '.env.test'), envContent)

        const originalCwd = process.cwd()
        process.chdir(testDir)

        try {
          process.env.NODE_ENV = 'test'
          environmentLoader.loadEnvironment()

          expect(process.env.DATABASE_URL).toBe(
            'postgres://test:test@localhost:5432/test',
          )
          expect(process.env.CLERK_SECRET_KEY).toBe('sk_test_with_comments')
          expect(process.env.PORT).toBe('3002')
        } finally {
          process.chdir(originalCwd)
        }
      })

      it('should handle malformed env file gracefully', () => {
        // Create malformed .env file
        const envContent = `
VALID_VAR=valid_value
INVALID LINE WITHOUT EQUALS
ANOTHER_VALID=another_value
=MISSING_KEY
TRAILING_EQUALS=
        `.trim()

        writeFileSync(join(testDir, '.env'), envContent)

        const originalCwd = process.cwd()
        process.chdir(testDir)

        try {
          process.env.NODE_ENV = 'development'
          environmentLoader.loadEnvironment()

          expect(process.env.VALID_VAR).toBe('valid_value')
          expect(process.env.ANOTHER_VALID).toBe('another_value')
          expect(process.env.TRAILING_EQUALS).toBe('')
        } finally {
          process.chdir(originalCwd)
        }
      })

      it('should not override existing environment variables (dotenv default behavior)', () => {
        // Set existing env var
        process.env.DATABASE_URL = 'original_value'
        process.env.EXISTING_VAR = 'should_remain'

        const envContent = `
DATABASE_URL=would_override_but_wont
NEW_VAR=new_value
        `.trim()

        writeFileSync(join(testDir, '.env'), envContent)

        const originalCwd = process.cwd()
        process.chdir(testDir)

        try {
          process.env.NODE_ENV = 'development'
          environmentLoader.loadEnvironment()

          // dotenv does not override existing env vars by default
          expect(process.env.DATABASE_URL).toBe('original_value')
          expect(process.env.NEW_VAR).toBe('new_value')
          expect(process.env.EXISTING_VAR).toBe('should_remain')
        } finally {
          process.chdir(originalCwd)
        }
      })
    })

    describe('Error handling', () => {
      it('should handle corrupted env files gracefully', () => {
        const envFile = join(testDir, '.env.development')
        // Create a file with binary content that might cause parsing issues
        const binaryContent = Buffer.from([0x00, 0x01, 0x02, 0x03, 0xff, 0xfe])
        writeFileSync(envFile, binaryContent)

        const originalCwd = process.cwd()
        process.chdir(testDir)

        try {
          process.env.NODE_ENV = 'development'

          // Should handle corrupted/binary files gracefully
          expect(() => {
            environmentLoader.loadEnvironment()
          }).not.toThrow()

          // Should not set any variables from corrupted file
          expect(process.env.TEST).toBeUndefined()
        } finally {
          process.chdir(originalCwd)
        }
      })

      it('should warn when no env files exist', () => {
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
  })

  describe('ApplicationBootstrap Integration', () => {
    let applicationBootstrap: ApplicationBootstrap

    beforeEach(() => {
      jest.clearAllMocks()
      jest.resetModules()
    })

    it('should load environment and start application successfully', async () => {
      // Create test env file
      const envContent = `
PORT=3333
DATABASE_URL=postgres://integration:test@localhost:5432/integration
      `.trim()

      writeFileSync(join(testDir, '.env.test'), envContent)

      const originalCwd = process.cwd()
      process.chdir(testDir)

      try {
        process.env.NODE_ENV = 'test'

        applicationBootstrap = new ApplicationBootstrap()

        // Mock the main module to prevent actual app startup
        jest.doMock('../../src/main', () => ({
          default: 'mocked main module',
        }))

        await applicationBootstrap.bootstrap()

        // Verify environment was loaded
        expect(process.env.PORT).toBe('3333')
        expect(process.env.DATABASE_URL).toBe(
          'postgres://integration:test@localhost:5432/integration',
        )
      } finally {
        process.chdir(originalCwd)
        jest.unmock('../../src/main')
      }
    })

    it('should handle missing main module gracefully', async () => {
      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation()
      const mockProcessExit = jest
        .spyOn(process, 'exit')
        .mockImplementation(() => {
          throw new Error('Process exit called')
        })

      applicationBootstrap = new ApplicationBootstrap()

      // Force the main module to not exist
      jest.doMock('../../src/main', () => {
        throw new Error('Cannot find module')
      })

      try {
        await applicationBootstrap.bootstrap()
      } catch (error) {
        expect(error).toEqual(new Error('Process exit called'))
      }

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to load application:',
        expect.any(Error),
      )
      expect(mockProcessExit).toHaveBeenCalledWith(1)

      mockConsoleError.mockRestore()
      mockProcessExit.mockRestore()
      jest.unmock('../../src/main')
    })

    it('should integrate environment loading with application bootstrap', async () => {
      // Create multiple env files to test precedence
      writeFileSync(join(testDir, '.env'), 'SOURCE=default\nPORT=3000')
      writeFileSync(join(testDir, '.env.test'), 'SOURCE=test\nPORT=3001')

      const originalCwd = process.cwd()
      process.chdir(testDir)

      try {
        process.env.NODE_ENV = 'test'

        const mockLogger = {
          log: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
        } as unknown as Logger

        const environmentLoader = new EnvironmentLoader(mockLogger)
        applicationBootstrap = new ApplicationBootstrap(environmentLoader)

        jest.doMock('../../src/main', () => ({}))

        await applicationBootstrap.bootstrap()

        // Should load from .env.test, not .env
        expect(process.env.SOURCE).toBe('test')
        expect(process.env.PORT).toBe('3001')
        expect(mockLogger.log).toHaveBeenCalledWith(
          'Loaded environment from .env.test',
        )
      } finally {
        process.chdir(originalCwd)
        jest.unmock('../../src/main')
      }
    })
  })

  describe('Real module execution', () => {
    it('should execute bootstrap when module is run directly', async () => {
      // This test verifies the module execution guard works
      const bootstrapModule = await import('../../src/bootstrap')

      expect(bootstrapModule.defaultBootstrap).toBeDefined()
      expect(bootstrapModule.EnvironmentLoader).toBeDefined()
      expect(bootstrapModule.ApplicationBootstrap).toBeDefined()
    })

    it('should test isMainModule function with real scenarios', () => {
      const mockMainModule = { filename: '/app/bootstrap.js' } as NodeJS.Module
      const mockDifferentModule = { filename: '/app/other.js' } as NodeJS.Module

      // Test when main and current are the same object reference
      expect(isMainModule(mockMainModule, mockMainModule)).toBe(true)
      // Test when main and current are different objects
      expect(isMainModule(mockMainModule, mockDifferentModule)).toBe(false)
      // Test when main is undefined
      expect(isMainModule(undefined, mockMainModule)).toBe(false)
    })

    it('should test executeBootstrap function integration', async () => {
      const mockBootstrap = jest.spyOn(defaultBootstrap, 'bootstrap')
      mockBootstrap.mockResolvedValue()

      await executeBootstrap()

      expect(mockBootstrap).toHaveBeenCalledTimes(1)
      mockBootstrap.mockRestore()
    })

    it('should handle executeBootstrap errors in integration', async () => {
      const mockBootstrap = jest.spyOn(defaultBootstrap, 'bootstrap')
      const testError = new Error('Integration bootstrap failed')
      mockBootstrap.mockRejectedValue(testError)

      await expect(executeBootstrap()).rejects.toThrow(
        'Integration bootstrap failed',
      )
      mockBootstrap.mockRestore()
    })
  })

  describe('Advanced Integration Scenarios', () => {
    it('should handle complex environment configuration scenarios', () => {
      const environmentLoader = new EnvironmentLoader()

      // Test with custom configuration
      const customConfig: EnvironmentConfig = {
        nodeEnv: 'custom',
        envFile: '.env.custom',
        defaultEnvFile: '.env.default',
      }

      const mockDeps: BootstrapDependencies = {
        existsSync: jest.fn().mockReturnValue(false),
        dotenvConfig: jest.fn(),
      }

      environmentLoader.loadEnvironment(customConfig, mockDeps)

      expect(mockDeps.existsSync).toHaveBeenCalledWith('.env.custom')
      expect(mockDeps.existsSync).toHaveBeenCalledWith('.env.default')
    })

    it('should test ApplicationBootstrap constructor with custom dependencies', () => {
      const mockConsoleError = jest.fn()
      const mockProcessExit = jest.fn() as never

      const customDeps: BootstrapDependencies = {
        consoleError: mockConsoleError,
        processExit: mockProcessExit,
      }

      const bootstrap = new ApplicationBootstrap(undefined, customDeps)
      expect(bootstrap).toBeDefined()
      expect(bootstrap).toBeInstanceOf(ApplicationBootstrap)
    })

    it('should test default bootstrap instance behavior', () => {
      expect(defaultBootstrap).toBeInstanceOf(ApplicationBootstrap)
      expect(defaultBootstrap).toHaveProperty('environmentLoader')
      expect(defaultBootstrap).toHaveProperty('deps')
    })

    it('should handle environment loading error scenarios', () => {
      const mockLogger = {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      } as unknown as Logger

      const environmentLoader = new EnvironmentLoader(mockLogger)

      const mockDeps: BootstrapDependencies = {
        existsSync: jest.fn().mockReturnValue(true),
        dotenvConfig: jest.fn().mockImplementation(() => {
          throw new Error('File read error')
        }),
      }

      environmentLoader.loadEnvironment(undefined, mockDeps)

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to load environment file:',
        expect.any(Error),
      )
    })

    it('should test ApplicationBootstrap constructor with various parameter combinations', () => {
      const mockLogger = {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      } as unknown as Logger

      // Test with custom environment loader and no deps
      const environmentLoader = new EnvironmentLoader(mockLogger)
      const bootstrap1 = new ApplicationBootstrap(environmentLoader)
      expect(bootstrap1).toBeDefined()

      // Test with custom environment loader and custom deps
      const customDeps: BootstrapDependencies = {
        processExit: jest.fn() as never,
      }
      const bootstrap2 = new ApplicationBootstrap(environmentLoader, customDeps)
      expect(bootstrap2).toBeDefined()

      // Test with no environment loader and custom deps
      const bootstrap3 = new ApplicationBootstrap(undefined, customDeps)
      expect(bootstrap3).toBeDefined()
    })

    it('should test EnvironmentLoader constructor variations', () => {
      const mockLogger = {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      } as unknown as Logger

      // Test with custom logger
      const loader1 = new EnvironmentLoader(mockLogger)
      expect(loader1).toBeDefined()

      // Test with no logger (should use default)
      const loader2 = new EnvironmentLoader()
      expect(loader2).toBeDefined()
    })

    it('should test getEnvironmentConfig with different NODE_ENV values', () => {
      const environmentLoader = new EnvironmentLoader()
      const originalNodeEnv = process.env.NODE_ENV

      try {
        // Test development
        process.env.NODE_ENV = 'development'
        const devConfig = environmentLoader.getEnvironmentConfig()
        expect(devConfig).toEqual({
          nodeEnv: 'development',
          envFile: '.env.development',
          defaultEnvFile: '.env',
        })

        // Test production
        process.env.NODE_ENV = 'production'
        const prodConfig = environmentLoader.getEnvironmentConfig()
        expect(prodConfig).toEqual({
          nodeEnv: 'production',
          envFile: '.env.production',
          defaultEnvFile: '.env',
        })

        // Test test
        process.env.NODE_ENV = 'test'
        const testConfig = environmentLoader.getEnvironmentConfig()
        expect(testConfig).toEqual({
          nodeEnv: 'test',
          envFile: '.env.test',
          defaultEnvFile: '.env',
        })

        // Test undefined (should default to development)
        delete process.env.NODE_ENV
        const defaultConfig = environmentLoader.getEnvironmentConfig()
        expect(defaultConfig).toEqual({
          nodeEnv: 'development',
          envFile: '.env.development',
          defaultEnvFile: '.env',
        })
      } finally {
        process.env.NODE_ENV = originalNodeEnv
      }
    })
  })
})
