import * as fs from 'fs'
import { promises as fsPromises } from 'fs'
import * as path from 'path'

import { Injectable, ConsoleLogger } from '@nestjs/common'

@Injectable()
export class LoggerService extends ConsoleLogger {
  async logToFile(entry: string): Promise<void> {
    const formattedEntry = `${Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'America/Chicago',
    }).format(new Date())}\t${entry}\n`

    try {
      if (!fs.existsSync(path.join(__dirname, '..', '..', 'logs'))) {
        await fsPromises.mkdir(path.join(__dirname, '..', '..', 'logs'))
      }
      await fsPromises.appendFile(
        path.join(__dirname, '..', '..', 'logs', 'myLogFile.log'),
        formattedEntry,
      )
    } catch (e) {
      if (e instanceof Error) console.error(e.message)
    }
  }

  override log(message: unknown, context?: string): void {
    const entry = `${context ?? ''}\t${String(message)}`
    void this.logToFile(entry)
    super.log(message, context)
  }

  override error(message: unknown, stackOrContext?: string): void {
    const entry = `${stackOrContext ?? ''}\t${String(message)}`
    void this.logToFile(entry)
    super.error(message, stackOrContext)
  }
}
