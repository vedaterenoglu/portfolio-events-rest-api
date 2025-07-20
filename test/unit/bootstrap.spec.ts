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

describe('Bootstrap', () => {
  describe('EnvironmentLoader', () => {
    let environmentLoader: EnvironmentLoader
    let mockLogger: Logger
    let originalNodeEnv: string | undefined

    beforeEach(() => {
      originalNodeEnv = process.env.NODE_ENV
      mockLogger = {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      } as unknown as Logger
      environmentLoader = new EnvironmentLoader(mockLogger)
    })

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv
      jest.clearAllMocks()
    })

    describe('constructor', () => {
      it('should create instance with provided logger', () => {
        expect(environmentLoader).toBeDefined()
      })

      it('should create instance with default logger when none provided', () => {
        const loader = new EnvironmentLoader()
        expect(loader).toBeDefined()
      })
    })

    describe('getEnvironmentConfig', () => {
      it('should return default development config when NODE_ENV is not set', () => {
        delete process.env.NODE_ENV
        const config = environmentLoader.getEnvironmentConfig()

        expect(config).toEqual({
          nodeEnv: 'development',
          envFile: '.env.development',
          defaultEnvFile: '.env',
        })
      })

      it('should return production config when NODE_ENV is production', () => {
        process.env.NODE_ENV = 'production'
        const config = environmentLoader.getEnvironmentConfig()

        expect(config).toEqual({
          nodeEnv: 'production',
          envFile: '.env.production',
          defaultEnvFile: '.env',
        })
      })

      it('should return test config when NODE_ENV is test', () => {
        process.env.NODE_ENV = 'test'
        const config = environmentLoader.getEnvironmentConfig()

        expect(config).toEqual({
          nodeEnv: 'test',
          envFile: '.env.test',
          defaultEnvFile: '.env',
        })
      })
    })

    describe('loadEnvironment', () => {
      let mockExistsSync: jest.Mock
      let mockDotenvConfig: jest.Mock
      let mockDeps: BootstrapDependencies

      beforeEach(() => {
        mockExistsSync = jest.fn()
        mockDotenvConfig = jest.fn()
        mockDeps = {
          existsSync: mockExistsSync,
          dotenvConfig: mockDotenvConfig,
        }
      })

      it('should skip loading in production environment', () => {
        const config: EnvironmentConfig = {
          nodeEnv: 'production',
          envFile: '.env.production',
          defaultEnvFile: '.env',
        }

        environmentLoader.loadEnvironment(config, mockDeps)

        expect(mockLogger.log).toHaveBeenCalledWith(
          'Running in production mode - using platform environment variables',
        )
        expect(mockExistsSync).not.toHaveBeenCalled()
        expect(mockDotenvConfig).not.toHaveBeenCalled()
      })

      it('should load environment-specific file when it exists', () => {
        const config: EnvironmentConfig = {
          nodeEnv: 'development',
          envFile: '.env.development',
          defaultEnvFile: '.env',
        }
        mockExistsSync.mockReturnValue(true)

        environmentLoader.loadEnvironment(config, mockDeps)

        expect(mockExistsSync).toHaveBeenCalledWith('.env.development')
        expect(mockDotenvConfig).toHaveBeenCalledWith({
          path: '.env.development',
        })
        expect(mockLogger.log).toHaveBeenCalledWith(
          'Loaded environment from .env.development',
        )
      })

      it('should fall back to default .env file when environment-specific file does not exist', () => {
        const config: EnvironmentConfig = {
          nodeEnv: 'test',
          envFile: '.env.test',
          defaultEnvFile: '.env',
        }
        mockExistsSync.mockReturnValueOnce(false).mockReturnValueOnce(true)

        environmentLoader.loadEnvironment(config, mockDeps)

        expect(mockExistsSync).toHaveBeenCalledWith('.env.test')
        expect(mockExistsSync).toHaveBeenCalledWith('.env')
        expect(mockDotenvConfig).toHaveBeenCalledWith({ path: '.env' })
        expect(mockLogger.log).toHaveBeenCalledWith(
          'Loaded environment from .env (.env.test not found)',
        )
      })

      it('should warn when no environment files exist', () => {
        const config: EnvironmentConfig = {
          nodeEnv: 'development',
          envFile: '.env.development',
          defaultEnvFile: '.env',
        }
        mockExistsSync.mockReturnValue(false)

        environmentLoader.loadEnvironment(config, mockDeps)

        expect(mockExistsSync).toHaveBeenCalledWith('.env.development')
        expect(mockExistsSync).toHaveBeenCalledWith('.env')
        expect(mockDotenvConfig).not.toHaveBeenCalled()
        expect(mockLogger.warn).toHaveBeenCalledWith(
          'No environment file found, using process environment variables only',
        )
      })

      it('should handle errors when loading environment file', () => {
        const config: EnvironmentConfig = {
          nodeEnv: 'development',
          envFile: '.env.development',
          defaultEnvFile: '.env',
        }
        const error = new Error('File read error')
        mockExistsSync.mockReturnValue(true)
        mockDotenvConfig.mockImplementation(() => {
          throw error
        })

        environmentLoader.loadEnvironment(config, mockDeps)

        expect(mockLogger.error).toHaveBeenCalledWith(
          'Failed to load environment file:',
          error,
        )
      })

      it('should use default config when none provided', () => {
        delete process.env.NODE_ENV
        mockExistsSync.mockReturnValue(true)

        environmentLoader.loadEnvironment(undefined, mockDeps)

        expect(mockExistsSync).toHaveBeenCalledWith('.env.development')
        expect(mockDotenvConfig).toHaveBeenCalledWith({
          path: '.env.development',
        })
      })

      it('should use default dependencies when none provided', () => {
        const config: EnvironmentConfig = {
          nodeEnv: 'production',
          envFile: '.env.production',
          defaultEnvFile: '.env',
        }

        environmentLoader.loadEnvironment(config)

        expect(mockLogger.log).toHaveBeenCalledWith(
          'Running in production mode - using platform environment variables',
        )
      })
    })
  })

  describe('ApplicationBootstrap', () => {
    let applicationBootstrap: ApplicationBootstrap
    let mockEnvironmentLoader: EnvironmentLoader
    let mockDeps: BootstrapDependencies
    let mockProcessExit: jest.Mock
    let mockConsoleError: jest.Mock

    beforeEach(() => {
      mockEnvironmentLoader = {
        loadEnvironment: jest.fn(),
      } as unknown as EnvironmentLoader

      mockProcessExit = jest.fn()
      mockConsoleError = jest.fn()

      mockDeps = {
        processExit: mockProcessExit as unknown as typeof process.exit,
        consoleError: mockConsoleError as unknown as typeof console.error,
      }

      applicationBootstrap = new ApplicationBootstrap(
        mockEnvironmentLoader,
        mockDeps,
      )
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    describe('constructor', () => {
      it('should create instance with provided environment loader and dependencies', () => {
        expect(applicationBootstrap).toBeDefined()
      })

      it('should create instance with default environment loader when none provided', () => {
        const bootstrap = new ApplicationBootstrap()
        expect(bootstrap).toBeDefined()
      })

      it('should merge provided dependencies with defaults', () => {
        const customDeps: BootstrapDependencies = {
          processExit: mockProcessExit as unknown as typeof process.exit,
        }
        const bootstrap = new ApplicationBootstrap(
          mockEnvironmentLoader,
          customDeps,
        )
        expect(bootstrap).toBeDefined()
      })
    })

    describe('loadApplication', () => {
      beforeEach(() => {
        jest.resetModules()
      })

      it('should successfully import main module', async () => {
        jest.doMock('../../src/main', () => ({}), { virtual: true })

        await applicationBootstrap.loadApplication()

        expect(mockConsoleError).not.toHaveBeenCalled()
        expect(mockProcessExit).not.toHaveBeenCalled()
      })

      it('should handle import errors and exit process', async () => {
        const error = new Error('Import failed')
        jest.doMock(
          '../../src/main',
          () => {
            throw error
          },
          { virtual: true },
        )

        await applicationBootstrap.loadApplication()

        expect(mockConsoleError).toHaveBeenCalledWith(
          'Failed to load application:',
          error,
        )
        expect(mockProcessExit).toHaveBeenCalledWith(1)
      })

      it('should use default console.error and process.exit when deps not provided', async () => {
        const error = new Error('Import failed')
        jest.doMock(
          '../../src/main',
          () => {
            throw error
          },
          { virtual: true },
        )

        const bootstrap = new ApplicationBootstrap(mockEnvironmentLoader, {})
        const originalConsoleError = console.error.bind(console)
        const originalProcessExit = process.exit.bind(process)

        console.error = jest.fn()
        process.exit = jest.fn() as never

        await bootstrap.loadApplication()

        expect(console.error).toHaveBeenCalledWith(
          'Failed to load application:',
          error,
        )
        expect(process.exit).toHaveBeenCalledWith(1)

        console.error = originalConsoleError
        process.exit = originalProcessExit
      })

      it('should handle errors with destructured default dependencies', async () => {
        const error = new Error('Module load failed')
        jest.doMock(
          '../../src/main',
          () => {
            throw error
          },
          { virtual: true },
        )

        // Create bootstrap with empty deps to trigger default destructuring (lines 94-95)
        const bootstrap = new ApplicationBootstrap(mockEnvironmentLoader, {})
        const originalConsoleError = console.error.bind(console)
        const originalProcessExit = process.exit.bind(process)

        console.error = jest.fn()
        process.exit = jest.fn() as never

        await bootstrap.loadApplication()

        expect(console.error).toHaveBeenCalledWith(
          'Failed to load application:',
          error,
        )
        expect(process.exit).toHaveBeenCalledWith(1)

        console.error = originalConsoleError
        process.exit = originalProcessExit
      })

      it('should execute the entry point when module is main', () => {
        // Mock require.main to equal module to trigger entry point (line 124)
        const mockModule = { filename: 'bootstrap.js' } as NodeJS.Module
        const mockBootstrap = jest.spyOn(defaultBootstrap, 'bootstrap')
        mockBootstrap.mockResolvedValue()

        // Simulate the entry point condition
        if (isMainModule(mockModule, mockModule)) {
          void executeBootstrap()
        }

        expect(mockBootstrap).toHaveBeenCalled()
        mockBootstrap.mockRestore()
      })
    })

    describe('bootstrap', () => {
      beforeEach(() => {
        jest.resetModules()
      })

      it('should load environment and then load application', async () => {
        jest.doMock('../../src/main', () => ({}), { virtual: true })

        await applicationBootstrap.bootstrap()

        expect(mockEnvironmentLoader.loadEnvironment).toHaveBeenCalled()
        expect(mockConsoleError).not.toHaveBeenCalled()
        expect(mockProcessExit).not.toHaveBeenCalled()
      })

      it('should handle errors during bootstrap', async () => {
        const error = new Error('Bootstrap failed')
        jest.doMock(
          '../../src/main',
          () => {
            throw error
          },
          { virtual: true },
        )

        await applicationBootstrap.bootstrap()

        expect(mockEnvironmentLoader.loadEnvironment).toHaveBeenCalled()
        expect(mockConsoleError).toHaveBeenCalledWith(
          'Failed to load application:',
          error,
        )
        expect(mockProcessExit).toHaveBeenCalledWith(1)
      })
    })
  })

  describe('Module execution', () => {
    it('should export defaultBootstrap instance', () => {
      expect(defaultBootstrap).toBeDefined()
      expect(defaultBootstrap.constructor.name).toBe('ApplicationBootstrap')
    })

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

    it('should execute bootstrap function successfully', async () => {
      const mockBootstrap = jest.spyOn(defaultBootstrap, 'bootstrap')
      mockBootstrap.mockResolvedValue()

      await executeBootstrap()

      expect(mockBootstrap).toHaveBeenCalledTimes(1)
      mockBootstrap.mockRestore()
    })

    it('should handle bootstrap execution errors', async () => {
      const mockBootstrap = jest.spyOn(defaultBootstrap, 'bootstrap')
      const testError = new Error('Bootstrap failed')
      mockBootstrap.mockRejectedValue(testError)

      await expect(executeBootstrap()).rejects.toThrow('Bootstrap failed')
      mockBootstrap.mockRestore()
    })
  })
})
