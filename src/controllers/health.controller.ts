import { Controller, Get, HttpCode, HttpStatus, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'

import {
  HealthMonitoringService,
  HealthCheckResult,
  HealthStatus,
} from '../services/health-monitoring.service'

@Controller()
export class HealthController {
  constructor(
    private readonly healthMonitoringService: HealthMonitoringService,
  ) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  async getHealthCheck(@Req() req: Request, @Res() res: Response) {
    try {
      const healthCheck = await this.healthMonitoringService.getHealthCheck()
      const statusCode =
        healthCheck.status === HealthStatus.HEALTHY
          ? 200
          : healthCheck.status === HealthStatus.DEGRADED
            ? 200
            : 503

      // Check if client wants JSON (API consumers)
      const acceptsJson =
        req.headers.accept?.includes('application/json') ||
        req.query.format === 'json'

      if (acceptsJson) {
        res.status(statusCode).json(healthCheck)
      } else {
        // Serve HTML dashboard
        res.status(statusCode).send(this.generateHealthDashboard(healthCheck))
      }
    } catch {
      const errorResponse: HealthCheckResult = {
        status: HealthStatus.UNHEALTHY,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'unknown',
        version: process.env.npm_package_version || '1.0.0',
        checks: {
          database: {
            status: HealthStatus.UNHEALTHY,
            message: 'Database check failed',
          },
          memory: {
            status: HealthStatus.UNHEALTHY,
            message: 'Memory check failed',
          },
          shutdown: {
            status: HealthStatus.UNHEALTHY,
            message: 'Shutdown check failed',
          },
        },
        metrics: {
          requests: {
            total: 0,
            success: 0,
            errors: 0,
            rate: 0,
            averageResponseTime: 0,
          },
          performance: {
            cpuUsage: 0,
            memoryUsage: {
              used: 0,
              total: 0,
              percentage: 0,
            },
            eventLoopLag: 0,
          },
          errors: {
            total: 0,
            rate: 0,
            byType: {},
            recent: [],
          },
        },
      }

      const acceptsJson =
        req.headers.accept?.includes('application/json') ||
        req.query.format === 'json'

      if (acceptsJson) {
        res.status(503).json(errorResponse)
      } else {
        res.status(503).send(this.generateHealthDashboard(errorResponse))
      }
    }
  }

  @Get('health/json')
  @HttpCode(HttpStatus.OK)
  async getHealthCheckJson() {
    try {
      const healthCheck = await this.healthMonitoringService.getHealthCheck()
      return healthCheck
    } catch {
      throw new Error('Health check failed')
    }
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  async getReadinessCheck() {
    return this.healthMonitoringService.getReadinessCheck()
  }

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  getMetrics() {
    return this.healthMonitoringService.getMetrics()
  }

  @Get('shutdown')
  @HttpCode(HttpStatus.OK)
  getShutdownStatus() {
    return this.healthMonitoringService.getShutdownStatus()
  }

  // HTML Health Dashboard Generator
  private generateHealthDashboard(healthData: HealthCheckResult): string {
    const statusColor =
      healthData.status === HealthStatus.HEALTHY
        ? '#10b981'
        : healthData.status === HealthStatus.DEGRADED
          ? '#f59e0b'
          : '#ef4444'

    const statusIcon =
      healthData.status === HealthStatus.HEALTHY
        ? '✅'
        : healthData.status === HealthStatus.DEGRADED
          ? '⚠️'
          : '❌'

    const memoryPercentage = Number(
      healthData.checks?.memory?.details?.percentage || 0,
    )
    const memoryColor =
      memoryPercentage < 70
        ? '#10b981'
        : memoryPercentage < 90
          ? '#f59e0b'
          : '#ef4444'

    const dbResponseTime = healthData.checks?.database?.responseTime || 0
    const dbColor =
      dbResponseTime < 100
        ? '#10b981'
        : dbResponseTime < 500
          ? '#f59e0b'
          : '#ef4444'

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Portfolio Events API - Health Dashboard</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
          line-height: 1.6;
        }
        
        .container {
          max-width: 1400px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
          overflow: hidden;
          backdrop-filter: blur(10px);
          animation: slideIn 0.6s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .header {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
          animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .header h1 {
          font-size: 3rem;
          margin-bottom: 10px;
          font-weight: 800;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          position: relative;
          z-index: 1;
        }
        
        .header p {
          font-size: 1.2rem;
          opacity: 0.9;
          position: relative;
          z-index: 1;
        }
        
        .status-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
          padding: 40px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }
        
        .status-card {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          border: 1px solid rgba(255,255,255,0.2);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          animation: fadeInUp 0.6s ease-out;
        }
        
        .status-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: ${statusColor};
          border-radius: 15px 15px 0 0;
        }
        
        .status-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.12);
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .status-card h3 {
          font-size: 1.1rem;
          color: #374151;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
        }
        
        .status-value {
          font-size: 2.2rem;
          font-weight: 800;
          color: ${statusColor};
          text-transform: uppercase;
          letter-spacing: -0.5px;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
          padding: 40px;
          background: #ffffff;
        }
        
        .metric-card {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          animation: fadeInUp 0.8s ease-out;
        }
        
        .metric-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.12);
          border-color: #cbd5e1;
        }
        
        .metric-card h3 {
          font-size: 1.3rem;
          color: #1f2937;
          margin-bottom: 25px;
          border-bottom: 3px solid #e5e7eb;
          padding-bottom: 15px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .metric-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          padding: 8px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        
        .metric-row:last-child {
          border-bottom: none;
        }
        
        .metric-label {
          font-weight: 600;
          color: #6b7280;
          font-size: 0.95rem;
        }
        
        .metric-value {
          font-weight: 700;
          color: #1f2937;
          font-size: 1rem;
        }
        
        .progress-bar {
          width: 100%;
          height: 12px;
          background: #e5e7eb;
          border-radius: 6px;
          overflow: hidden;
          margin-top: 8px;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, ${memoryColor} 0%, ${memoryColor}dd 100%);
          transition: width 0.8s ease;
          border-radius: 6px;
          position: relative;
          overflow: hidden;
        }
        
        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%);
          animation: progressShimmer 2s infinite;
        }
        
        @keyframes progressShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .status-indicator {
          display: inline-block;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          margin-right: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .healthy { 
          background: radial-gradient(circle, #10b981 0%, #059669 100%);
        }
        .degraded { 
          background: radial-gradient(circle, #f59e0b 0%, #d97706 100%);
        }
        .unhealthy { 
          background: radial-gradient(circle, #ef4444 0%, #dc2626 100%);
        }
        
        .footer {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 30px;
          text-align: center;
          color: #6b7280;
          font-size: 0.95rem;
          border-top: 1px solid #e2e8f0;
        }
        
        .footer p {
          margin-bottom: 20px;
          font-weight: 500;
        }
        
        .button-group {
          display: flex;
          gap: 20px;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .json-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 25px;
          transition: all 0.3s ease;
          border: 2px solid #3b82f6;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .json-link:hover {
          background: #3b82f6;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        
        .auto-refresh-info {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 12px 24px;
          border-radius: 25px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          animation: pulse 2s infinite;
        }
        
        @media (max-width: 768px) {
          .container {
            margin: 10px;
            border-radius: 15px;
          }
          
          .header h1 {
            font-size: 2.2rem;
          }
          
          .status-overview,
          .metrics-grid {
            grid-template-columns: 1fr;
            padding: 20px;
          }
          
          .button-group {
            flex-direction: column;
            gap: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${statusIcon} Portfolio Events API</h1>
          <p>System Health Dashboard</p>
          <p style="margin-top: 15px; font-size: 1rem; opacity: 0.8;">🔄 Auto-refreshing every 5 seconds</p>
        </div>
        
        <div class="status-overview">
          <div class="status-card">
            <h3>
              <span class="status-indicator ${healthData.status}"></span>
              Overall Status
            </h3>
            <div class="status-value">${healthData.status}</div>
          </div>
          
          <div class="status-card">
            <h3>🌍 Environment</h3>
            <div class="status-value">${healthData.environment}</div>
          </div>
          
          <div class="status-card">
            <h3>📊 Version</h3>
            <div class="status-value">${healthData.version}</div>
          </div>
          
          <div class="status-card">
            <h3>⏱️ Uptime</h3>
            <div class="status-value">${Math.round(healthData.uptime)}s</div>
          </div>
        </div>
        
        <div class="metrics-grid">
          <div class="metric-card">
            <h3>🗄️ Database Health</h3>
            <div class="metric-row">
              <span class="metric-label">Status:</span>
              <span class="metric-value" style="color: ${dbColor}">
                <span class="status-indicator ${healthData.checks?.database?.status || 'unhealthy'}"></span>
                ${healthData.checks?.database?.status || 'Unknown'}
              </span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Response Time:</span>
              <span class="metric-value">${dbResponseTime}ms</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Provider:</span>
              <span class="metric-value">${String(healthData.checks?.database?.details?.provider) || 'Unknown'}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Message:</span>
              <span class="metric-value">${healthData.checks?.database?.message || 'No message'}</span>
            </div>
          </div>
          
          <div class="metric-card">
            <h3>💾 Memory Usage</h3>
            <div class="metric-row">
              <span class="metric-label">Status:</span>
              <span class="metric-value" style="color: ${memoryColor}">
                <span class="status-indicator ${healthData.checks?.memory?.status || 'unhealthy'}"></span>
                ${healthData.checks?.memory?.status || 'Unknown'}
              </span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Usage:</span>
              <span class="metric-value">${memoryPercentage.toFixed(1)}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${memoryPercentage.toFixed(1)}%"></div>
            </div>
            <div class="metric-row">
              <span class="metric-label">Heap Used:</span>
              <span class="metric-value">${Number(healthData.checks?.memory?.details?.heapUsed || 0)} MB</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Heap Total:</span>
              <span class="metric-value">${Number(healthData.checks?.memory?.details?.heapTotal || 0)} MB</span>
            </div>
          </div>
          
          <div class="metric-card">
            <h3>🔄 Shutdown Status</h3>
            <div class="metric-row">
              <span class="metric-label">Status:</span>
              <span class="metric-value" style="color: ${healthData.checks?.shutdown?.status === HealthStatus.HEALTHY ? '#10b981' : '#f59e0b'}">
                <span class="status-indicator ${healthData.checks?.shutdown?.status || 'unhealthy'}"></span>
                ${healthData.checks?.shutdown?.status === HealthStatus.HEALTHY ? 'Active' : 'Shutting Down'}
              </span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Graceful Shutdown:</span>
              <span class="metric-value">${healthData.checks?.shutdown?.details?.gracefulShutdown ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Shutdown in Progress:</span>
              <span class="metric-value">${healthData.checks?.shutdown?.details?.shutdownInProgress ? 'Yes' : 'No'}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Message:</span>
              <span class="metric-value">${healthData.checks?.shutdown?.message || 'No message'}</span>
            </div>
          </div>
          
          <div class="metric-card">
            <h3>📈 Performance Metrics</h3>
            <div class="metric-row">
              <span class="metric-label">Total Requests:</span>
              <span class="metric-value">${healthData.metrics?.requests?.total || 0}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Success Rate:</span>
              <span class="metric-value">${healthData.metrics?.requests?.success || 0}/${healthData.metrics?.requests?.total || 0}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Request Rate:</span>
              <span class="metric-value">${healthData.metrics?.requests?.rate || 0}/sec</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Avg Response:</span>
              <span class="metric-value">${healthData.metrics?.requests?.averageResponseTime || 0}ms</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">CPU Usage:</span>
              <span class="metric-value">${(healthData.metrics?.performance?.cpuUsage || 0).toFixed(3)}s</span>
            </div>
          </div>
          
          <div class="metric-card">
            <h3>⚠️ Error Tracking</h3>
            <div class="metric-row">
              <span class="metric-label">Total Errors:</span>
              <span class="metric-value">${healthData.metrics?.errors?.total || 0}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Error Rate:</span>
              <span class="metric-value">${healthData.metrics?.errors?.rate || 0}/min</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Recent Errors:</span>
              <span class="metric-value">${healthData.metrics?.errors?.recent?.length || 0}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Event Loop Lag:</span>
              <span class="metric-value">${healthData.metrics?.performance?.eventLoopLag || 0}ms</span>
            </div>
          </div>
        </div>
        
        <div class="metrics-grid">
          <div class="metric-card" style="grid-column: 1 / -1;">
            <h3>🚨 Recent Errors</h3>
            <div class="recent-errors-container">
              ${
                healthData.metrics?.errors?.recent?.length
                  ? healthData.metrics.errors.recent
                      .map(
                        error => `
                  <div class="metric-row" style="border-left: 4px solid #ef4444; padding-left: 16px; margin-bottom: 20px;">
                    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="metric-label" style="color: #ef4444; font-weight: 700;">
                          🔴 ${error.type}
                        </span>
                        <span class="metric-value" style="font-size: 0.85rem; color: #6b7280;">
                          ${new Date(error.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div style="background: #fef2f2; padding: 12px; border-radius: 8px; border: 1px solid #fecaca;">
                        <span style="color: #7f1d1d; font-size: 0.9rem; font-family: monospace;">
                          ${error.message}
                        </span>
                      </div>
                    </div>
                  </div>
                `,
                      )
                      .join('')
                  : '<div class="metric-row"><div style="text-align: center; color: #10b981; font-weight: 600; padding: 20px;">✅ No recent errors - System running smoothly!</div></div>'
              }
            </div>
          </div>
        </div>
        
        <div class="metrics-grid">
          <div class="metric-card" style="grid-column: 1 / -1;">
            <h3>📊 Historical Performance Charts</h3>
            <div class="charts-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 30px; margin-top: 20px;">
              <div class="chart-wrapper">
                <h4 style="margin-bottom: 15px; color: #374151; font-size: 1.1rem;">Response Time Trends</h4>
                <canvas id="responseTimeChart" width="400" height="200"></canvas>
              </div>
              <div class="chart-wrapper">
                <h4 style="margin-bottom: 15px; color: #374151; font-size: 1.1rem;">Request Success Rate</h4>
                <canvas id="successRateChart" width="400" height="200"></canvas>
              </div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>Last updated: ${new Date().toLocaleString()}</p>
          <div class="button-group">
            <a href="/health/json" class="json-link">
              <span>📄</span>
              <span>View JSON</span>
            </a>
          </div>
          <p style="margin-top: 15px; font-size: 0.95rem; color: #6b7280;">🔄 Auto-refreshing every 5 seconds</p>
        </div>
      </div>
      
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script src="/health-dashboard.js"></script>
    </body>
    </html>
  `
  }
}
