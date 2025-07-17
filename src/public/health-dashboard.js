/* eslint-env browser */
// Enhanced health dashboard with AJAX updates
(function() {
  let refreshInterval = 5000; // 5 seconds
  let isRefreshing = true;
  let refreshTimer = null;
  let isPaused = false;

  // Fetch health data via AJAX
  async function fetchHealthData() {
    try {
      const response = await fetch('/health/json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      updateDashboard(data);
    } catch (error) {
      console.error('Failed to fetch health data:', error);
      updateErrorState(error.message);
    }
  }

  // Update dashboard with new data
  function updateDashboard(data) {
    // Update status
    const statusValue = document.querySelector('.status-value');
    if (statusValue) {
      statusValue.textContent = data.status.toUpperCase();
      updateStatusColor(data.status);
    }

    // Update environment
    const envElements = document.querySelectorAll('.status-value');
    if (envElements[1]) envElements[1].textContent = data.environment;
    if (envElements[2]) envElements[2].textContent = data.version;
    if (envElements[3]) envElements[3].textContent = Math.round(data.uptime) + 's';

    // Update database health
    updateDatabaseMetrics(data.checks?.database);

    // Update memory usage
    updateMemoryMetrics(data.checks?.memory);

    // Update shutdown status
    updateShutdownStatus(data.checks?.shutdown);

    // Update performance metrics
    updatePerformanceMetrics(data.metrics);

    // Update error tracking
    updateErrorMetrics(data.metrics?.errors, data.metrics?.performance);

    // Update recent errors
    updateRecentErrors(data.metrics?.errors);

    // Update last updated time
    updateTimestamp();
  }

  function updateStatusColor(status) {
    const statusColors = {
      healthy: '#10b981',
      degraded: '#f59e0b',
      unhealthy: '#ef4444'
    };
    
    const color = statusColors[status] || '#ef4444';
    
    // Update status card border color
    const statusCard = document.querySelector('.status-card');
    if (statusCard) {
      const beforeElement = statusCard.querySelector('::before');
      if (beforeElement) {
        statusCard.style.setProperty('--status-color', color);
      }
    }

    // Update status indicators
    const indicators = document.querySelectorAll('.status-indicator');
    indicators.forEach(indicator => {
      indicator.className = `status-indicator ${status}`;
    });
  }

  function updateDatabaseMetrics(database) {
    if (!database) return;

    const dbSection = findMetricCard('Database Health');
    if (!dbSection) return;

    const rows = dbSection.querySelectorAll('.metric-row');
    if (rows[0]) {
      const statusSpan = rows[0].querySelector('.metric-value');
      if (statusSpan) {
        statusSpan.innerHTML = `<span class="status-indicator ${database.status}"></span>${database.status}`;
      }
    }
    if (rows[1]) {
      const rtSpan = rows[1].querySelector('.metric-value');
      if (rtSpan) rtSpan.textContent = `${database.responseTime || 0}ms`;
    }
    if (rows[3]) {
      const msgSpan = rows[3].querySelector('.metric-value');
      if (msgSpan) msgSpan.textContent = database.message || 'No message';
    }
  }

  function updateMemoryMetrics(memory) {
    if (!memory) return;

    const memSection = findMetricCard('Memory Usage');
    if (!memSection) return;

    const percentage = Number(memory.details?.percentage || 0);
    const rows = memSection.querySelectorAll('.metric-row');
    
    if (rows[0]) {
      const statusSpan = rows[0].querySelector('.metric-value');
      if (statusSpan) {
        statusSpan.innerHTML = `<span class="status-indicator ${memory.status}"></span>${memory.status}`;
      }
    }
    if (rows[1]) {
      const usageSpan = rows[1].querySelector('.metric-value');
      if (usageSpan) usageSpan.textContent = `${percentage.toFixed(1)}%`;
    }

    // Update progress bar
    const progressFill = memSection.querySelector('.progress-fill');
    if (progressFill) {
      progressFill.style.width = `${percentage.toFixed(1)}%`;
      
      // Update color based on percentage
      const color = percentage < 70 ? '#10b981' : percentage < 90 ? '#f59e0b' : '#ef4444';
      progressFill.style.background = `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`;
    }

    if (rows[2]) {
      const heapUsedSpan = rows[2].querySelector('.metric-value');
      if (heapUsedSpan) heapUsedSpan.textContent = `${Number(memory.details?.heapUsed || 0)} MB`;
    }
    if (rows[3]) {
      const heapTotalSpan = rows[3].querySelector('.metric-value');
      if (heapTotalSpan) heapTotalSpan.textContent = `${Number(memory.details?.heapTotal || 0)} MB`;
    }
  }

  function updateShutdownStatus(shutdown) {
    if (!shutdown) return;

    const shutdownSection = findMetricCard('Shutdown Status');
    if (!shutdownSection) return;

    const rows = shutdownSection.querySelectorAll('.metric-row');
    
    if (rows[0]) {
      const statusSpan = rows[0].querySelector('.metric-value');
      if (statusSpan) {
        const statusText = shutdown.status === 'healthy' ? 'Active' : 'Shutting Down';
        const statusColor = shutdown.status === 'healthy' ? '#10b981' : '#f59e0b';
        statusSpan.style.color = statusColor;
        statusSpan.innerHTML = `<span class="status-indicator ${shutdown.status}"></span>${statusText}`;
      }
    }
    if (rows[1]) {
      const gracefulSpan = rows[1].querySelector('.metric-value');
      if (gracefulSpan) gracefulSpan.textContent = shutdown.details?.gracefulShutdown ? 'Enabled' : 'Disabled';
    }
    if (rows[2]) {
      const inProgressSpan = rows[2].querySelector('.metric-value');
      if (inProgressSpan) inProgressSpan.textContent = shutdown.details?.shutdownInProgress ? 'Yes' : 'No';
    }
    if (rows[3]) {
      const messageSpan = rows[3].querySelector('.metric-value');
      if (messageSpan) messageSpan.textContent = shutdown.message || 'No message';
    }
  }

  function updatePerformanceMetrics(metrics) {
    if (!metrics) return;

    const perfSection = findMetricCard('Performance Metrics');
    if (!perfSection) return;

    const rows = perfSection.querySelectorAll('.metric-row');
    const values = [
      metrics.requests?.total || 0,
      `${metrics.requests?.success || 0}/${metrics.requests?.total || 0}`,
      `${metrics.requests?.rate || 0}/sec`,
      `${metrics.requests?.averageResponseTime || 0}ms`,
      `${(metrics.performance?.cpuUsage || 0).toFixed(3)}s`
    ];

    rows.forEach((row, index) => {
      const valueSpan = row.querySelector('.metric-value');
      if (valueSpan && values[index] !== undefined) {
        valueSpan.textContent = values[index];
      }
    });
  }

  function updateErrorMetrics(errors, performance) {
    if (!errors) return;

    const errorSection = findMetricCard('Error Tracking');
    if (!errorSection) return;

    const rows = errorSection.querySelectorAll('.metric-row');
    const values = [
      errors.total || 0,
      `${errors.rate || 0}/min`,
      errors.recent?.length || 0,
      `${(performance?.eventLoopLag || 0).toFixed(2)}ms`
    ];

    rows.forEach((row, index) => {
      const valueSpan = row.querySelector('.metric-value');
      if (valueSpan && values[index] !== undefined) {
        valueSpan.textContent = values[index];
      }
    });
  }

  function updateRecentErrors(errors) {
    if (!errors) return;

    const errorSection = findMetricCard('Recent Errors');
    if (!errorSection) return;

    // Find the container that holds the error content
    const errorContainer = errorSection.querySelector('.recent-errors-container');
    if (!errorContainer) return;

    // Update the recent errors content
    if (errors.recent?.length) {
      errorContainer.innerHTML = errors.recent.map(error => `
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
      `).join('');
    } else {
      errorContainer.innerHTML = '<div class="metric-row"><div style="text-align: center; color: #10b981; font-weight: 600; padding: 20px;">✅ No recent errors - System running smoothly!</div></div>';
    }
  }

  function findMetricCard(title) {
    const cards = document.querySelectorAll('.metric-card');
    for (const card of cards) {
      const h3 = card.querySelector('h3');
      if (h3 && h3.textContent.includes(title)) {
        return card;
      }
    }
    return null;
  }

  function updateTimestamp() {
    const footer = document.querySelector('.footer p');
    if (footer) {
      footer.textContent = `Last updated: ${new Date().toLocaleString()}`;
    }
  }

  function updateErrorState(message) {
    const container = document.querySelector('.container');
    if (container) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-notification';
      errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
      `;
      errorDiv.textContent = `Error: ${message}`;
      document.body.appendChild(errorDiv);

      setTimeout(() => {
        errorDiv.remove();
      }, 5000);
    }
  }

  // Start refresh cycle
  function startRefresh() {
    if (!isRefreshing || isPaused) return;
    
    fetchHealthData();
    refreshTimer = setTimeout(startRefresh, refreshInterval);
  }

  // Toggle pause/resume
  function togglePause() {
    isPaused = !isPaused;
    updatePauseButton();
    
    if (!isPaused) {
      // Resume refreshing
      startRefresh();
    } else {
      // Clear any pending refresh
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    }
  }

  // Update pause button UI
  function updatePauseButton() {
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
      pauseBtn.textContent = isPaused ? '▶️ Resume' : '⏸️ Pause';
      pauseBtn.className = isPaused ? 'control-btn resume' : 'control-btn pause';
    }
  }

  // Change refresh interval
  function changeInterval(newInterval) {
    refreshInterval = parseInt(newInterval);
    
    // Clear current timer and restart if not paused
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }
    
    if (!isPaused) {
      startRefresh();
    }
    
    // Update UI to show current interval
    updateIntervalDisplay();
  }

  // Update interval display
  function updateIntervalDisplay() {
    const intervalBtns = document.querySelectorAll('.interval-btn');
    intervalBtns.forEach(btn => {
      const btnInterval = parseInt(btn.dataset.interval);
      if (btnInterval === refreshInterval) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', function() {
    // Add custom styles for dynamic updates and controls
    const style = document.createElement('style');
    style.textContent = `
      .status-card::before {
        background: var(--status-color, #10b981);
      }
      
      @keyframes fadeIn {
        from { opacity: 0.7; }
        to { opacity: 1; }
      }
      
      .metric-value {
        transition: all 0.3s ease;
      }
      
      .metric-value.updated {
        animation: fadeIn 0.3s ease;
      }
      
      .refresh-controls {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        z-index: 1000;
        display: flex;
        gap: 10px;
        align-items: center;
        max-width: calc(100vw - 40px);
        flex-wrap: wrap;
      }
      
      .control-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
      }
      
      .control-btn.pause {
        background: #f59e0b;
        color: white;
      }
      
      .control-btn.pause:hover {
        background: #d97706;
      }
      
      .control-btn.resume {
        background: #10b981;
        color: white;
      }
      
      .control-btn.resume:hover {
        background: #059669;
      }
      
      .interval-controls {
        display: flex;
        gap: 5px;
        align-items: center;
        margin-left: 10px;
        padding-left: 10px;
        border-left: 2px solid #e5e7eb;
      }
      
      .interval-label {
        font-size: 14px;
        font-weight: 600;
        color: #6b7280;
        margin-right: 5px;
      }
      
      .interval-btn {
        padding: 6px 12px;
        border: 1px solid #e5e7eb;
        background: white;
        border-radius: 4px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .interval-btn:hover {
        background: #f3f4f6;
        border-color: #d1d5db;
      }
      
      .interval-btn.active {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
      }
      
      @media (max-width: 768px) {
        .refresh-controls {
          position: fixed;
          top: 10px;
          left: 10px;
          right: 10px;
          max-width: none;
          padding: 10px;
          flex-direction: column;
          gap: 10px;
          align-items: stretch;
        }
        
        .control-btn {
          width: 100%;
          text-align: center;
          padding: 12px;
          font-size: 16px;
        }
        
        .interval-controls {
          margin-left: 0;
          padding-left: 0;
          border-left: none;
          border-top: 2px solid #e5e7eb;
          padding-top: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .interval-label {
          width: 100%;
          text-align: center;
          margin-bottom: 8px;
          margin-right: 0;
        }
        
        .interval-btn {
          flex: 1;
          min-width: 60px;
          padding: 10px 8px;
          font-size: 14px;
        }
      }
      
      @media (max-width: 480px) {
        .refresh-controls {
          top: 5px;
          left: 5px;
          right: 5px;
          padding: 8px;
        }
        
        .interval-btn {
          min-width: 50px;
          padding: 8px 6px;
          font-size: 12px;
        }
      }
    `;
    document.head.appendChild(style);

    // Create refresh controls
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'refresh-controls';
    controlsDiv.innerHTML = `
      <button id="pauseBtn" class="control-btn pause">⏸️ Pause</button>
      <div class="interval-controls">
        <span class="interval-label">Refresh:</span>
        <button class="interval-btn active" data-interval="5000">5s</button>
        <button class="interval-btn" data-interval="10000">10s</button>
        <button class="interval-btn" data-interval="30000">30s</button>
        <button class="interval-btn" data-interval="60000">60s</button>
      </div>
    `;
    document.body.appendChild(controlsDiv);

    // Add event listeners
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    
    const intervalBtns = document.querySelectorAll('.interval-btn');
    intervalBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        changeInterval(this.dataset.interval);
      });
    });

    // Start the refresh cycle
    startRefresh();
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', function() {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }
  });
})();