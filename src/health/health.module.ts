import { Module } from '@nestjs/common'

import { HealthController } from '../controllers/health.controller'
import { DatabaseModule } from '../database/database.module'
import { GracefulShutdownService } from '../services/graceful-shutdown.service'
import { HealthMonitoringService } from '../services/health-monitoring.service'

@Module({
  imports: [DatabaseModule],
  controllers: [HealthController],
  providers: [HealthMonitoringService, GracefulShutdownService],
  exports: [HealthMonitoringService],
})
export class HealthModule {}
