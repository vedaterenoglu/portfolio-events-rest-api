import { existsSync } from 'fs'

import { Logger } from '@nestjs/common'
import * as dotenv from 'dotenv'

// Load environment variables based on NODE_ENV
function loadEnvironment() {
  const logger = new Logger('Environment')
  const nodeEnv = process.env.NODE_ENV || 'development'

  // In production, we expect env vars to be set by the platform (Vercel)
  if (nodeEnv === 'production') {
    logger.log(
      'Running in production mode - using platform environment variables',
    )
    return
  }

  // For development and test environments, load from .env files
  const envFile = `.env.${nodeEnv}`
  const defaultEnvFile = '.env'

  try {
    // Check if environment-specific file exists
    if (existsSync(envFile)) {
      dotenv.config({ path: envFile })
      logger.log(`Loaded environment from ${envFile}`)
    } else if (existsSync(defaultEnvFile)) {
      // Fall back to default .env file
      dotenv.config({ path: defaultEnvFile })
      logger.log(
        `Loaded environment from ${defaultEnvFile} (${envFile} not found)`,
      )
    } else {
      logger.warn(
        'No environment file found, using process environment variables only',
      )
    }
  } catch (error) {
    logger.error('Failed to load environment file:', error)
  }
}

// Load environment BEFORE importing main
loadEnvironment()

// Now import and run main after environment is loaded
import('./main')
  .then(() => {
    // Main module loaded successfully
  })
  .catch(error => {
    console.error('Failed to load application:', error)
    process.exit(1)
  })
