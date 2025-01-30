import { Request } from '../core/request';
import { RequestQueue } from '../core/queue';

/**
 * @typedef {Object} RequestManagerOptions
 * @property {import('../core/queue').QueueOptions} [queue={}] Queue configuration options
 * @property {number} [timeout=30000] Request timeout in ms
 */

/**
* Manages the lifecycle of requests in the Helios-Starling protocol
* All requests flow through the queue for consistent handling and control
*/
export class RequestsManager {
  /**
  * @param {import('../core/starling').BaseStarling} starling Starling instance
  * @param {import('../core/events').EventsManager} events Events manager
  * @param {RequestManagerOptions} [options={}] Manager options
  */
  constructor(starling, events, options = {}) {
    /** @private */
    this._starling = starling;
    
    /** @private */
    this._events = events;

    /** @private @type {RequestManagerOptions} */
    this._options = {
      queue: {},
      timeout: 30000,
      ...options
    }
    
    /** @private */
    this._queue = new RequestQueue(starling, this, this._options.queue);
    
    /**
    * Map for tracking active requests
    * @type {Map<string, Request>}
    * @private
    */
    this._activeRequests = new Map();
    
    /**
    * Map for tracking expired requests (for late response handling)
    * @type {Map<string, { timestamp: number, timeout: number }>}
    * @private
    */
    this._expiredRequests = new Map();
    
    // Start cleanup interval
    this._cleanupInterval = setInterval(() => this._cleanup(), 5 * 60 * 1000);
    
    // Subscribe to queue events for monitoring
    this._setupQueueMonitoring();
  }
  
  /**
  * Creates and queues a new request
  * @param {import('../core/starling').Starling} starling Starling instance
  * @param {string} method Method name
  * @param {*} payload Request payload
  * @param {import('../core/request').RequestOptions} [options={}] Request options
  * @throws {Error} If request creation fails
  */
  execute = (starling, method, payload, options = {}) => {    
    // Create new request
    const request = new Request(starling, method, payload, options)
  
    // Track request
    this._activeRequests.set(request.id, request);
    
    // Setup automatic cleanup
    //TODO: Without .catch on the .finally, it will throw an unhandled promise rejection error. Idk why, but we need to catch it. How can we make it better?
    request._promise.finally(() => {
      this._activeRequests.delete(request.id);
      
      // Track expired requests for late response handling
      if (request.error?.code === 'REQUEST_TIMEOUT') {
        this._expiredRequests.set(request.id, {
          timestamp: Date.now(),
          timeout: this._options.timeout || 30000
        });
      }
    }).catch(e => {});
    
    // Queue the request
    this._queue.add(request);
    
    // Emit debug event
    this._emitEvent('request:queued', {
      starling,
      requestId: request.id,
      method: request._method
    });
    
    return request;
  }
  
  /**
  * Handles an incoming response
  * @param {import('../core/starling').Starling} starling Starling instance
  * @param {import('../core').ResponseContext} context Response message
  */
  async handleResponse(starling, context) {
    const request = this._activeRequests.get(context.requestId);
    
    if (!request) {
      await Promise.resolve(this._handleUnknownResponse(starling, context));
      return;
    }
    
    // Process response
    if (context.success) {
      request.handleResponse(context);
    } else {
      request.handleError(context.error, context);
    }
    
    // Emit completion event
    this._emitEvent('request:completed', {
      starling,
      requestId: request.id,
      method: request.method,
      success: context.success,
      latency: Date.now() - request.timestamp
    });
  }
  
  /**
  * Handles request-related notifications
  * @param {import('../core/starling').Starling} starling Starling instance
  * @param {import('../core/context').NotificationContext} context Notification context
  */
  handleNotification(starling, context) {
    
    const request = this._activeRequests.get(context.requestId);

    
    
    if (request) {
      request.handleNotification(context);
      
      this._emitEvent('request:notification', {
        starling,
        requestId: request.id,
        method: request.method,
        type: context.type
      });
    }
  }
  
  /**
  * Cancels all active requests
  * @param {string} [reason='All requests cancelled'] Cancellation reason
  */
  cancelAll(reason = 'All requests cancelled') {
    // Cancel active requests
    for (const request of this._activeRequests.values()) {
      request.cancel(reason);
    }
    
    // Clear queue
    this._queue.clear(reason);
    
    // Clear tracking maps
    this._activeRequests.clear();
    this._expiredRequests.clear();
    
    this._emitEvent('requests:cancelled', {
      reason
    });
  }
  
  /**
  * @private
  */
  _handleUnknownResponse(starling, context) {
    const expiredInfo = this._expiredRequests.get(context.requestId);
    
    if (expiredInfo) {
      this._emitEvent('request:late_response', {
        starling,
        requestId: context.requestId,
        originalTimeout: expiredInfo.timeout,
        responseDelay: Date.now() - expiredInfo.timestamp
      });
    } else {
      this._emitEvent('request:unknown_response', {
        starling,
        requestId: context.requestId
      });
    }
  }
  
  /**
  * @private
  */
  _cleanup() {
    const now = Date.now();
    const expireTime = 60 * 60 * 1000; // 1 hour
    
    // Cleanup expired requests map
    for (const [id, info] of this._expiredRequests) {
      if (now - info.timestamp > expireTime) {
        this._expiredRequests.delete(id);
      }
    }
  }
  
  /**
  * Sets up monitoring for queue events
  * @private
  */
  _setupQueueMonitoring() {
    // Monitor queue size changes
    let lastQueueSize = 0;
    
    setInterval(() => {
      const currentSize = this._queue.size;
      if (currentSize !== lastQueueSize) {
        this._emitEvent('queue:size_changed', {
          previousSize: lastQueueSize,
          currentSize,
          activeRequests: this.activeCount
        });
        lastQueueSize = currentSize;
      }
    }, 1000);
    
    // Monitor queue stats
    setInterval(() => {
      const queueStats = this._queue.stats;
      const systemStats = this.stats;
      
      this._emitEvent('system:stats', {
        queue: queueStats,
        system: systemStats,
        timestamp: Date.now()
      });
    }, 5000);
  }
  
  /**
  * Helper for emitting events with debug info
  * @private
  */
  _emitEvent(event, data) {
    this._events.emit(event, {
      ...data,
      debug: {
        type: event.includes('error') || event.includes('invalid') ? 'error' : 'info',
        message: this._getDebugMessage(event, data)
      }
    });
  }
  
  /**
  * Generates debug messages for events
  * @private
  */
  _getDebugMessage(event, data) {
    switch (event) {
      case 'request:queued':
      return `Request ${data.requestId} queued for method ${data.method}`;
      case 'request:completed':
      return `Request ${data.requestId} completed with ${data.success ? 'success' : 'error'} (${data.latency}ms)`;
      case 'request:notification':
      return `Notification received for request ${data.requestId} (${data.type})`;
      case 'request:late_response':
      return `Late response received for request ${data.requestId} (+${data.responseDelay}ms)`;
      case 'request:unknown_response':
      return `Response received for unknown request ${data.requestId}`;
      case 'requests:cancelled':
      return `All requests cancelled: ${data.reason}`;
      case 'queue:size_changed':
      return `Queue size changed from ${data.previousSize} to ${data.currentSize}`;
      default:
      return `Event ${event} triggered`;
    }
  }
  
  /**
  * Disposes of the manager and cleans up resources
  */
  dispose() {
    clearInterval(this._cleanupInterval);
    this.cancelAll('Manager disposed');
  }
  
  /**
  * Number of active requests
  */
  get activeCount() {
    return this._activeRequests.size;
  }
  
  /**
  * System statistics
  */
  get stats() {
    return {
      active: this.activeCount,
      expired: this._expiredRequests.size,
      queue: this._queue.stats,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
  }
}