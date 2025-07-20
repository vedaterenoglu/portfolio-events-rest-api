import { existsSync } from 'fs'

import { Logger } from '@nestjs/common'
import * as dotenv from 'dotenv'

export interface EnvironmentConfig {
  nodeEnv: string
  envFile: string
  defaultEnvFile: string
}

export interface BootstrapDependencies {
  logger?: Logger
  existsSync?: typeof existsSync
  dotenvConfig?: typeof dotenv.config
  processExit?: typeof process.exit
  consoleError?: typeof console.error
}

export class EnvironmentLoader {
  private readonly logger: Logger

  constructor(logger?: Logger) {
    this.logger = logger || new Logger('Environment')
  }

  getEnvironmentConfig(): EnvironmentConfig {
    const nodeEnv = process.env.NODE_ENV || 'development'
    return {
      nodeEnv,
      envFile: `.env.${nodeEnv}`,
      defaultEnvFile: '.env',
    }
  }

  loadEnvironment(
    config?: EnvironmentConfig,
    deps: BootstrapDependencies = {},
  ): void {
    const {
      existsSync: existsSyncFn = existsSync,
      dotenvConfig = dotenv.config,
    } = deps
    const envConfig = config || this.getEnvironmentConfig()

    if (envConfig.nodeEnv === 'production') {
      this.logger.log(
        'Running in production mode - using platform environment variables',
      )
      return
    }

    try {
      if (existsSyncFn(envConfig.envFile)) {
        dotenvConfig({ path: envConfig.envFile })
        this.logger.log(`Loaded environment from ${envConfig.envFile}`)
      } else if (existsSyncFn(envConfig.defaultEnvFile)) {
        dotenvConfig({ path: envConfig.defaultEnvFile })
        this.logger.log(
          `Loaded environment from ${envConfig.defaultEnvFile} (${envConfig.envFile} not found)`,
        )
      } else {
        this.logger.warn(
          'No environment file found, using process environment variables only',
        )
      }
    } catch (error) {
      this.logger.error('Failed to load environment file:', error)
    }
  }
}

export class ApplicationBootstrap {
  private readonly environmentLoader: EnvironmentLoader
  private readonly deps: BootstrapDependencies

  constructor(
    environmentLoader?: EnvironmentLoader,
    deps: BootstrapDependencies = {},
  ) {
    this.environmentLoader = environmentLoader || new EnvironmentLoader()
    this.deps = {
      processExit: (code?: number) => process.exit(code),
      consoleError: (...args: unknown[]) => console.error(...args),
      ...deps,
    }
  }

  async loadApplication(): Promise<void> {
    try {
      await import('./main')
    } catch (error) {
      const {
        consoleError = (...args: unknown[]) => console.error(...args),
        processExit = (code?: number) => process.exit(code),
      } = this.deps
      consoleError('Failed to load application:', error)
      processExit(1)
    }
  }

  async bootstrap(): Promise<void> {
    this.environmentLoader.loadEnvironment()
    await this.loadApplication()
  }
}

export const defaultBootstrap = new ApplicationBootstrap()

// Helper function to check if module is run directly (testable)
export function isMainModule(
  main: NodeJS.Module | undefined,
  currentModule: NodeJS.Module,
): boolean {
  return main === currentModule
}

// Entry point execution (now testable)
export async function executeBootstrap(): Promise<void> {
  await defaultBootstrap.bootstrap()
}

if (isMainModule(require.main, module)) {
  void executeBootstrap()
}
