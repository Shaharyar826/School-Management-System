import axios from 'axios';

/**
 * Centralized polling service to prevent multiple simultaneous API calls
 * and reduce server load by consolidating polling intervals
 */
class PollingService {
  constructor() {
    this.intervals = new Map();
    this.subscribers = new Map();
    this.cache = new Map();
    this.isPolling = new Map();
    
    // Default polling interval (60 seconds)
    this.defaultInterval = 60000;
    
    // Request deduplication
    this.pendingRequests = new Map();
  }

  /**
   * Subscribe to a polling endpoint
   * @param {string} endpoint - API endpoint to poll
   * @param {function} callback - Callback function to handle data
   * @param {number} interval - Polling interval in milliseconds
   * @returns {function} Unsubscribe function
   */
  subscribe(endpoint, callback, interval = this.defaultInterval) {
    // Initialize subscribers array for this endpoint if it doesn't exist
    if (!this.subscribers.has(endpoint)) {
      this.subscribers.set(endpoint, new Set());
    }

    // Add callback to subscribers
    this.subscribers.get(endpoint).add(callback);

    // Start polling for this endpoint if not already started
    if (!this.intervals.has(endpoint)) {
      this.startPolling(endpoint, interval);
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(endpoint, callback);
    };
  }

  /**
   * Unsubscribe from a polling endpoint
   * @param {string} endpoint - API endpoint
   * @param {function} callback - Callback function to remove
   */
  unsubscribe(endpoint, callback) {
    const subscribers = this.subscribers.get(endpoint);
    if (subscribers) {
      subscribers.delete(callback);
      
      // If no more subscribers, stop polling
      if (subscribers.size === 0) {
        this.stopPolling(endpoint);
      }
    }
  }

  /**
   * Start polling for an endpoint
   * @param {string} endpoint - API endpoint
   * @param {number} interval - Polling interval
   */
  startPolling(endpoint, interval) {
    // Prevent multiple polling for the same endpoint
    if (this.intervals.has(endpoint)) {
      return;
    }

    console.log(`Starting polling for ${endpoint} every ${interval}ms`);

    // Initial fetch
    this.fetchData(endpoint);

    // Set up interval
    const intervalId = setInterval(() => {
      this.fetchData(endpoint);
    }, interval);

    this.intervals.set(endpoint, intervalId);
  }

  /**
   * Stop polling for an endpoint
   * @param {string} endpoint - API endpoint
   */
  stopPolling(endpoint) {
    const intervalId = this.intervals.get(endpoint);
    if (intervalId) {
      console.log(`Stopping polling for ${endpoint}`);
      clearInterval(intervalId);
      this.intervals.delete(endpoint);
      this.subscribers.delete(endpoint);
      this.cache.delete(endpoint);
      this.isPolling.delete(endpoint);
      this.pendingRequests.delete(endpoint);
    }
  }

  /**
   * Fetch data for an endpoint with deduplication
   * @param {string} endpoint - API endpoint
   */
  async fetchData(endpoint) {
    // Prevent multiple simultaneous requests to the same endpoint
    if (this.isPolling.get(endpoint)) {
      console.log(`Skipping ${endpoint} - already polling`);
      return;
    }

    // Check if there's already a pending request
    if (this.pendingRequests.has(endpoint)) {
      console.log(`Skipping ${endpoint} - request already pending`);
      return;
    }

    try {
      this.isPolling.set(endpoint, true);
      
      // Create a promise for this request
      const requestPromise = axios.get(endpoint, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      this.pendingRequests.set(endpoint, requestPromise);

      const response = await requestPromise;
      
      // Cache the response
      this.cache.set(endpoint, response.data);

      // Notify all subscribers
      const subscribers = this.subscribers.get(endpoint);
      if (subscribers) {
        subscribers.forEach(callback => {
          try {
            callback(response.data);
          } catch (error) {
            console.error(`Error in subscriber callback for ${endpoint}:`, error);
          }
        });
      }

    } catch (error) {
      console.error(`Error polling ${endpoint}:`, error);
      
      // Notify subscribers of error
      const subscribers = this.subscribers.get(endpoint);
      if (subscribers) {
        subscribers.forEach(callback => {
          try {
            callback(null, error);
          } catch (callbackError) {
            console.error(`Error in error callback for ${endpoint}:`, callbackError);
          }
        });
      }
    } finally {
      this.isPolling.set(endpoint, false);
      this.pendingRequests.delete(endpoint);
    }
  }

  /**
   * Get cached data for an endpoint
   * @param {string} endpoint - API endpoint
   * @returns {any} Cached data or null
   */
  getCachedData(endpoint) {
    return this.cache.get(endpoint) || null;
  }

  /**
   * Force refresh data for an endpoint
   * @param {string} endpoint - API endpoint
   */
  async refresh(endpoint) {
    await this.fetchData(endpoint);
  }

  /**
   * Stop all polling
   */
  stopAll() {
    console.log('Stopping all polling services');
    this.intervals.forEach((intervalId, endpoint) => {
      this.stopPolling(endpoint);
    });
  }

  /**
   * Get status of all active polling
   */
  getStatus() {
    const status = {};
    this.intervals.forEach((intervalId, endpoint) => {
      const subscriberCount = this.subscribers.get(endpoint)?.size || 0;
      status[endpoint] = {
        active: true,
        subscribers: subscriberCount,
        cached: this.cache.has(endpoint),
        polling: this.isPolling.get(endpoint) || false
      };
    });
    return status;
  }
}

// Create singleton instance
const pollingService = new PollingService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    pollingService.stopAll();
  });
}

export default pollingService;
