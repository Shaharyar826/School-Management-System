/**
 * Performance monitoring utility to track API calls, memory usage, and potential issues
 */
class PerformanceMonitor {
  constructor() {
    this.apiCalls = new Map();
    this.memorySnapshots = [];
    this.errorLog = [];
    this.isMonitoring = false;
    this.maxLogSize = 100; // Keep last 100 entries
    
    // Start monitoring if in development
    if (import.meta.env.DEV) {
      this.startMonitoring();
    }
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🔍 Performance monitoring started');

    // Monitor memory usage every 30 seconds
    this.memoryInterval = setInterval(() => {
      this.captureMemorySnapshot();
    }, 30000);

    // Monitor for potential memory leaks
    this.leakCheckInterval = setInterval(() => {
      this.checkForMemoryLeaks();
    }, 60000);

    // Log API call statistics every 2 minutes
    this.statsInterval = setInterval(() => {
      this.logApiStatistics();
    }, 120000);
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    console.log('🔍 Performance monitoring stopped');

    if (this.memoryInterval) clearInterval(this.memoryInterval);
    if (this.leakCheckInterval) clearInterval(this.leakCheckInterval);
    if (this.statsInterval) clearInterval(this.statsInterval);
  }

  /**
   * Track an API call
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {number} duration - Request duration in ms
   * @param {boolean} success - Whether the request was successful
   */
  trackApiCall(endpoint, method = 'GET', duration = 0, success = true) {
    const key = `${method} ${endpoint}`;
    
    if (!this.apiCalls.has(key)) {
      this.apiCalls.set(key, {
        count: 0,
        totalDuration: 0,
        errors: 0,
        lastCall: null,
        avgDuration: 0
      });
    }

    const stats = this.apiCalls.get(key);
    stats.count++;
    stats.totalDuration += duration;
    stats.lastCall = new Date();
    stats.avgDuration = stats.totalDuration / stats.count;
    
    if (!success) {
      stats.errors++;
    }

    // Log slow requests
    if (duration > 5000) {
      console.warn(`🐌 Slow API call detected: ${key} took ${duration}ms`);
    }

    // Log frequent calls (more than 10 per minute)
    if (stats.count > 10) {
      const timeSinceFirst = Date.now() - (stats.lastCall.getTime() - (stats.count - 1) * 60000);
      if (timeSinceFirst < 60000) {
        console.warn(`🔄 Frequent API calls detected: ${key} called ${stats.count} times in the last minute`);
      }
    }
  }

  /**
   * Capture memory snapshot
   */
  captureMemorySnapshot() {
    if (!performance.memory) return;

    const snapshot = {
      timestamp: new Date(),
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
    };

    this.memorySnapshots.push(snapshot);

    // Keep only last 20 snapshots
    if (this.memorySnapshots.length > 20) {
      this.memorySnapshots.shift();
    }
  }

  /**
   * Check for potential memory leaks
   */
  checkForMemoryLeaks() {
    if (this.memorySnapshots.length < 5) return;

    const recent = this.memorySnapshots.slice(-5);
    const oldest = recent[0];
    const newest = recent[recent.length - 1];

    const memoryIncrease = newest.usedJSHeapSize - oldest.usedJSHeapSize;
    const timeSpan = newest.timestamp - oldest.timestamp;

    // If memory increased by more than 10MB in 2.5 minutes, warn
    if (memoryIncrease > 10 * 1024 * 1024 && timeSpan < 150000) {
      console.warn(`🚨 Potential memory leak detected: Memory increased by ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB in ${(timeSpan / 1000).toFixed(1)}s`);
      this.logError('MEMORY_LEAK_WARNING', `Memory increased by ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  /**
   * Log API call statistics
   */
  logApiStatistics() {
    if (this.apiCalls.size === 0) return;

    console.group('📊 API Call Statistics');
    
    // Sort by call count
    const sortedCalls = Array.from(this.apiCalls.entries())
      .sort((a, b) => b[1].count - a[1].count);

    sortedCalls.forEach(([endpoint, stats]) => {
      const errorRate = ((stats.errors / stats.count) * 100).toFixed(1);
      console.log(`${endpoint}: ${stats.count} calls, avg ${stats.avgDuration.toFixed(0)}ms, ${errorRate}% errors`);
    });

    console.groupEnd();
  }

  /**
   * Log an error
   * @param {string} type - Error type
   * @param {string} message - Error message
   * @param {any} details - Additional details
   */
  logError(type, message, details = null) {
    const error = {
      timestamp: new Date(),
      type,
      message,
      details,
      url: window.location.href
    };

    this.errorLog.push(error);

    // Keep only last maxLogSize entries
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    console.error(`🚨 ${type}: ${message}`, details);
  }

  /**
   * Get performance report
   */
  getReport() {
    return {
      apiCalls: Object.fromEntries(this.apiCalls),
      memorySnapshots: this.memorySnapshots,
      errorLog: this.errorLog,
      isMonitoring: this.isMonitoring
    };
  }

  /**
   * Clear all data
   */
  clear() {
    this.apiCalls.clear();
    this.memorySnapshots = [];
    this.errorLog = [];
    console.log('🧹 Performance monitor data cleared');
  }

  /**
   * Export data for debugging
   */
  export() {
    const data = this.getReport();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('📁 Performance report exported');
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Add to window for debugging
if (typeof window !== 'undefined') {
  window.performanceMonitor = performanceMonitor;
}

export default performanceMonitor;
