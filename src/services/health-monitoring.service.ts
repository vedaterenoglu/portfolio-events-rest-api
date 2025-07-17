import { Injectable, Logger } from '@nestjs/common'

import { DatabaseService } from '../database/database.service'

import { GracefulShutdownService } from './graceful-shutdown.service'

// System health status enum
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

// Health check result interface
export interface HealthCheckResult {
  status: HealthStatus
  timestamp: string
  uptime: number
  environment: string
  version: string
  checks: {
    database: HealthCheckDetail
    memory: HealthCheckDetail
    shutdown: HealthCheckDetail
  }
  metrics: {
    requests: RequestMetrics
    performance: PerformanceMetrics
    errors: ErrorMetrics
  }
}

// Individual health check detail
export interface HealthCheckDetail {
  status: HealthStatus
  message: string
  responseTime?: number
  details?: Record<string, unknown>
}

// Request metrics interface
export interface RequestMetrics {
  total: number
  success: number
  errors: number
  rate: number // requests per second
  averageResponseTime: number
}

// Performance metrics interface
export interface PerformanceMetrics {
  cpuUsage: number
  memoryUsage: {
    used: number
    total: number
    percentage: number
  }
  eventLoopLag: number
}

// Error metrics interface
export interface ErrorMetrics {
  total: number
  rate: number // errors per minute
  byType: Record<string, number>
  recent: Array<{
    timestamp: string
    type: string
    message: string
  }>
}

// Readiness check interface
export interface ReadinessCheckResult {
  status: string
  timestamp: string
  ready: boolean
  checks: {
    database: boolean
    shutdown: boolean
  }
}

// Shutdown status interface
export interface ShutdownStatusResult {
  isShuttingDown: boolean
  timestamp: string
  uptime: number
  gracefulShutdown: {
    enabled: boolean
    status: string
  }
}

// Metrics collection class
class MetricsCollector {
  private static instance: MetricsCollector
  private metrics = {
    requests: {
      total: 0,
      success: 0,
      errors: 0,
      responseTimes: [] as number[],
      startTime: Date.now(),
    },
    errors: {
      total: 0,
      byType: {} as Record<string, number>,
      recent: [] as Array<{ timestamp: string; type: string; message: string }>,
    },
    performance: {
      lastUpdate: Date.now(),
      samples: [] as number[],
    },
  }

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector()
    }
    return MetricsCollector.instance
  }

  // Record request metrics
  recordRequest(responseTime: number, success: boolean): void {
    // Debug logging removed for production
    this.metrics.requests.total++
    this.metrics.requests.responseTimes.push(responseTime)

    if (success) {
      this.metrics.requests.success++
    } else {
      this.metrics.requests.errors++
    }

    // Keep only recent response times (last 1000 requests)
    if (this.metrics.requests.responseTimes.length > 1000) {
      this.metrics.requests.responseTimes =
        this.metrics.requests.responseTimes.slice(-1000)
    }
  }

  // Record error metrics
  recordError(type: string, message: string): void {
    // Debug logging removed for production
    this.metrics.errors.total++
    // eslint-disable-next-line security/detect-object-injection
    this.metrics.errors.byType[type] =
      // eslint-disable-next-line security/detect-object-injection
      (this.metrics.errors.byType[type] || 0) + 1
    this.metrics.errors.recent.push({
      timestamp: new Date().toISOString(),
      type,
      message,
    })

    // Keep only recent errors (last 100)
    if (this.metrics.errors.recent.length > 100) {
      this.metrics.errors.recent = this.metrics.errors.recent.slice(-100)
    }
  }

  // Get request metrics
  getRequestMetrics(): RequestMetrics {
    const uptime = (Date.now() - this.metrics.requests.startTime) / 1000
    const rate = this.metrics.requests.total / uptime
    const averageResponseTime =
      this.metrics.requests.responseTimes.length > 0
        ? this.metrics.requests.responseTimes.reduce((a, b) => a + b, 0) /
          this.metrics.requests.responseTimes.length
        : 0

    return {
      total: this.metrics.requests.total,
      success: this.metrics.requests.success,
      errors: this.metrics.requests.errors,
      rate: Math.round(rate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
    }
  }

  // Get error metrics
  getErrorMetrics(): ErrorMetrics {
    const recentErrors = this.metrics.errors.recent.filter(
      error => Date.now() - new Date(error.timestamp).getTime() < 60000, // Last minute
    )
    const errorRate = recentErrors.length

    return {
      total: this.metrics.errors.total,
      rate: errorRate,
      byType: { ...this.metrics.errors.byType },
      recent: this.metrics.errors.recent.slice(-10), // Last 10 errors
    }
  }

  // Get performance metrics
  getPerformanceMetrics(): PerformanceMetrics {
    const memUsage = process.memoryUsage()

    return {
      cpuUsage: process.cpuUsage().user / 1000000, // Convert to seconds
      memoryUsage: {
        used: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100, // MB
        total: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100, // MB
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      },
      eventLoopLag: this.measureEventLoopLag(),
    }
  }

  // Measure event loop lag
  private measureEventLoopLag(): number {
    // Start measuring for next time
    const start = process.hrtime.bigint()
    setImmediate(() => {
      const lag = Number(process.hrtime.bigint() - start) / 1000000 // Convert to milliseconds
      this.metrics.performance.samples.push(lag)

      // Keep only recent samples
      if (this.metrics.performance.samples.length > 100) {
        this.metrics.performance.samples =
          this.metrics.performance.samples.slice(-100)
      }
    })

    // Return average of recent samples
    if (this.metrics.performance.samples.length === 0) {
      // Initialize with a measurement if no samples exist
      this.initializeEventLoopLag()
      return 0
    }
    return (
      this.metrics.performance.samples.reduce((a, b) => a + b, 0) /
      this.metrics.performance.samples.length
    )
  }

  // Initialize event loop lag measurement
  private initializeEventLoopLag(): void {
    const start = process.hrtime.bigint()
    setImmediate(() => {
      const lag = Number(process.hrtime.bigint() - start) / 1000000
      this.metrics.performance.samples.push(lag)
    })
  }

  // Reset metrics
  reset(): void {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        responseTimes: [],
        startTime: Date.now(),
      },
      errors: {
        total: 0,
        byType: {},
        recent: [],
      },
      performance: {
        lastUpdate: Date.now(),
        samples: [],
      },
    }
  }
}

@Injectable()
export class HealthMonitoringService {
  private readonly logger = new Logger(HealthMonitoringService.name)
  private metricsCollector = MetricsCollector.getInstance()

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly gracefulShutdownService: GracefulShutdownService,
  ) {
    // Initialize event loop lag measurement
    this.metricsCollector.getPerformanceMetrics()
  }

  // Comprehensive health check
  async getHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now()

    try {
      const [databaseCheck, memoryCheck, shutdownCheck] = await Promise.all([
        this.checkDatabase(),
        Promise.resolve(this.checkMemory()),
        Promise.resolve(this.checkShutdown()),
      ])

      const overallStatus = this.determineOverallStatus([
        databaseCheck.status,
        memoryCheck.status,
        shutdownCheck.status,
      ])

      const result: HealthCheckResult = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        checks: {
          database: databaseCheck,
          memory: memoryCheck,
          shutdown: shutdownCheck,
        },
        metrics: {
          requests: this.metricsCollector.getRequestMetrics(),
          performance: this.metricsCollector.getPerformanceMetrics(),
          errors: this.metricsCollector.getErrorMetrics(),
        },
      }

      const responseTime = Date.now() - startTime
      this.logger.log(
        `Health check completed - Status: ${result.status}, Response Time: ${responseTime}ms, Uptime: ${Math.round(result.uptime)}s`,
      )

      return result
    } catch (error) {
      this.logger.error('Health check failed', error)

      return {
        status: HealthStatus.UNHEALTHY,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        checks: {
          database: {
            status: HealthStatus.UNHEALTHY,
            message: 'Health check failed',
          },
          memory: {
            status: HealthStatus.UNHEALTHY,
            message: 'Health check failed',
          },
          shutdown: {
            status: HealthStatus.UNHEALTHY,
            message: 'Health check failed',
          },
        },
        metrics: {
          requests: this.metricsCollector.getRequestMetrics(),
          performance: this.metricsCollector.getPerformanceMetrics(),
          errors: this.metricsCollector.getErrorMetrics(),
        },
      }
    }
  }

  // Simple readiness check
  async getReadinessCheck(): Promise<ReadinessCheckResult> {
    try {
      const [databaseReady, shutdownReady] = await Promise.all([
        this.isDatabaseReady(),
        Promise.resolve(this.isShutdownReady()),
      ])

      const ready = databaseReady && shutdownReady

      return {
        status: ready ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString(),
        ready,
        checks: {
          database: databaseReady,
          shutdown: shutdownReady,
        },
      }
    } catch (error) {
      this.logger.error('Readiness check failed', error)
      return {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        ready: false,
        checks: {
          database: false,
          shutdown: false,
        },
      }
    }
  }

  // Shutdown status check
  getShutdownStatus(): ShutdownStatusResult {
    const isShuttingDown = this.gracefulShutdownService.isShuttingDownStatus()

    return {
      isShuttingDown,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      gracefulShutdown: {
        enabled: true,
        status: isShuttingDown ? 'shutting_down' : 'active',
      },
    }
  }

  // Database health check
  private async checkDatabase(): Promise<HealthCheckDetail> {
    const startTime = Date.now()

    try {
      await this.databaseService.tCity.findFirst()
      const responseTime = Date.now() - startTime

      return {
        status: HealthStatus.HEALTHY,
        message: 'Database connection successful',
        responseTime,
        details: {
          provider: 'postgresql',
          responseTime: `${responseTime}ms`,
        },
      }
    } catch (error) {
      const responseTime = Date.now() - startTime

      return {
        status: HealthStatus.UNHEALTHY,
        message: 'Database connection failed',
        responseTime,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          responseTime: `${responseTime}ms`,
        },
      }
    }
  }

  // Memory health check
  private checkMemory(): HealthCheckDetail {
    const memUsage = process.memoryUsage()

    // Use RSS (Resident Set Size) for a more accurate memory assessment
    // RSS includes all memory: heap, stack, and code
    const rssInMB = memUsage.rss / 1024 / 1024

    // Default Node.js heap limit is ~1.4GB on 64-bit systems
    // Use more reasonable thresholds based on absolute memory usage
    const maxHeapInMB = 1400 // 1.4GB default max heap
    const heapUsedInMB = memUsage.heapUsed / 1024 / 1024

    // Calculate percentage based on max possible heap, not current heap total
    const heapPercentOfMax = (heapUsedInMB / maxHeapInMB) * 100

    // Also calculate the traditional percentage for display
    const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100

    let status: HealthStatus
    let message: string

    // Use absolute memory thresholds that make sense for production
    if (rssInMB < 200 && heapPercentOfMax < 50) {
      status = HealthStatus.HEALTHY
      message = 'Memory usage is normal'
    } else if (rssInMB < 400 && heapPercentOfMax < 70) {
      status = HealthStatus.DEGRADED
      message = 'Memory usage is elevated'
    } else {
      status = HealthStatus.UNHEALTHY
      message = 'Memory usage is critical'
    }

    return {
      status,
      message,
      details: {
        heapUsed: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100, // MB
        heapTotal: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100, // MB
        percentage: Math.round(memoryUsagePercent * 100) / 100,
        rss: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100, // MB
        heapPercentOfMax: Math.round(heapPercentOfMax * 100) / 100,
        maxHeapSize: maxHeapInMB,
      },
    }
  }

  // Shutdown health check
  private checkShutdown(): HealthCheckDetail {
    const isShuttingDown = this.gracefulShutdownService.isShuttingDownStatus()

    if (isShuttingDown) {
      return {
        status: HealthStatus.DEGRADED,
        message: 'Application is shutting down',
        details: {
          shutdownInProgress: true,
          gracefulShutdown: true,
        },
      }
    }

    return {
      status: HealthStatus.HEALTHY,
      message: 'Application is running normally',
      details: {
        shutdownInProgress: false,
        gracefulShutdown: true,
      },
    }
  }

  // Check if database is ready
  private async isDatabaseReady(): Promise<boolean> {
    try {
      await this.databaseService.tCity.findFirst()
      return true
    } catch {
      return false
    }
  }

  // Check if shutdown is ready
  private isShutdownReady(): boolean {
    return !this.gracefulShutdownService.isShuttingDownStatus()
  }

  // Determine overall status from multiple checks
  private determineOverallStatus(statuses: HealthStatus[]): HealthStatus {
    if (statuses.includes(HealthStatus.UNHEALTHY)) {
      return HealthStatus.UNHEALTHY
    }
    if (statuses.includes(HealthStatus.DEGRADED)) {
      return HealthStatus.DEGRADED
    }
    return HealthStatus.HEALTHY
  }

  // Record request for metrics
  recordRequest(responseTime: number, success: boolean): void {
    // Debug logging removed for production
    this.metricsCollector.recordRequest(responseTime, success)
  }

  // Record error for metrics
  recordError(type: string, message: string): void {
    // Debug logging removed for production
    this.metricsCollector.recordError(type, message)
  }

  // Get metrics only
  getMetrics(): {
    requests: RequestMetrics
    performance: PerformanceMetrics
    errors: ErrorMetrics
  } {
    return {
      requests: this.metricsCollector.getRequestMetrics(),
      performance: this.metricsCollector.getPerformanceMetrics(),
      errors: this.metricsCollector.getErrorMetrics(),
    }
  }

  // Reset all metrics
  resetMetrics(): void {
    this.metricsCollector.reset()
  }
}
