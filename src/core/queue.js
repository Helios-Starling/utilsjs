import { withRetry } from '../utils/retry';

/**
* @typedef {Object} QueueOptions
* @property {number} [maxSize=1000] Maximum queue size
* @property {number} [maxRetries=3] Maximum retry attempts
* @property {number} [baseDelay=1000] Base delay for exponential backoff in ms
* @property {number} [maxConcurrent=10] Maximum concurrent requests
* @property {boolean} [priorityQueuing=false] Enable priority-based queuing
* @property {'block'|'drop'|'error'} [onFull='block'] Behavior when queue is full
* @property {number} [drainTimeout=30000] Timeout for queue draining in ms
*/

/**
* Robust request queue with advanced flow control and monitoring
*/
export class RequestQueue {
  /**
  * @param {import('./starling').BaseStarling} starling Starling instance
  * @param {import('../managers/requests').RequestsManager} requestsManager Requests manager
  * @param {QueueOptions} [options={}] Queue options
  */
  constructor(starling, requestsManager, options = {}) {
    /** @private */
    this._starling = starling;
    
    /** @private */
    this._requestsManager = requestsManager;
    
    /** @private */
    this._options = {
      maxSize: 1000,
      maxRetries: 3,
      baseDelay: 1000,
      maxConcurrent: 10,
      priorityQueuing: false,
      onFull: 'block',
      drainTimeout: 30000,
      ...options
    };
    
    /** @private */
    this._queue = new Map();
    
    /** @private */
    this._activeCount = 0;
    
    /** @private */
    this._processing = false;
    
    /** @private */
    this._drainPromise = null;
    
    /** @private */
    this._drainResolve = null;
    
    // Monitor connection state
    this._starling.events.on('starling:connected', () => this._onConnected());
    this._starling.events.on('starling:disconnected', () => this._onDisconnected());
    
    // Setup drain timeout monitor
    this._setupDrainMonitor();
  }
  
  /**
  * Adds a request to the queue
  * @param {import('./request').Request} request Request to queue
  * @returns {Promise<boolean>} Whether request was queued
  */
  async add(request) {
    // Check queue capacity
    if (this._queue.size >= this._options.maxSize) {
      switch (this._options.onFull) {
        case 'block':
        await this._waitForSpace();
        break;
        case 'drop':
        return false;
        case 'error':
        throw new Error('Queue is full');
      }
    }
    
    // Add to queue with metadata
    this._queue.set(request.id, {
      request,
      retryCount: 0,
      addedAt: Date.now(),
      priority: request._options.metadata?.priority || 0
    });
    
    // Emit added event
    this._starling.events.emit('queue:added', {
      requestId: request.id,
      queueSize: this._queue.size
    });
    

    if (this._canProcess()) {
      this._processQueue();
    }
    
    return true;
  }
  
  /**
  * Processes queued requests
  * @private
  */
  async _processQueue() {
    if (!this._canProcess()) return;
    
    this._processing = true;
    
    try {
      // Get requests to process (with priority if enabled)
      const entries = this._options.priorityQueuing 
      ? Array.from(this._queue.entries()).sort((a, b) => b[1].priority - a[1].priority)
      : this._queue.entries();
      
      for (const [id, entry] of entries) {
        // Check concurrent limit
        if (this._activeCount >= this._options.maxConcurrent) {
          break;
        }
        
        this._activeCount++;
        
        try {
          // Calculate retry delay
          const delay = this._getRetryDelay(entry.retryCount);
          
          // Execute with retry
          await withRetry(
            () => {
              entry.request.execute();
            },
            {
              maxRetries: this._options.maxRetries,
              retryDelay: delay,
              onRetry: () => { entry.retryCount++ }
            }
          );
          
          // Success - remove from queue and emit event
          this._queue.delete(id);
          this._starling.events.emit('queue:removed', {
            requestId: id,
            queueSize: this._queue.size
          });
          
        } catch (error) {
          // Max retries exceeded - handle failure
          this._handleRequestFailure(entry.request, error);
          this._queue.delete(id);
        } finally {
          this._activeCount--;
        }
      }
    } finally {
      this._processing = false;
      
      // Check if more processing needed
      if (this._canProcess()) {
        this._processQueue();
      } else if (this._queue.size === 0) {
        this._resolveDrain();
      }
    }
  }
  
  /**
  * Handles permanent request failure
  * @private 
  */
  _handleRequestFailure(request, error) {
    request.handleError({
      code: 'QUEUE_RETRY_EXCEEDED',
      message: `Max retries exceeded: ${error.message}`,
      details: { originalError: error }
    });
  }
  
  /**
  * Calculates retry delay with exponential backoff
  * @private
  */
  _getRetryDelay(retryCount) {
    return Math.min(
      this._options.baseDelay * Math.pow(2, retryCount),
      30000 // Cap at 30 seconds
    );
  }
  
  /**
  * Checks if queue can process requests
  * @private
  */
  _canProcess() {
    return (
      !this._processing &&
      this._queue.size > 0 && 
      this._starling.isConnected &&
      this._activeCount < this._options.maxConcurrent
    );
  }
  
  /**
  * Handles connection established
  * @private
  */
  _onConnected() {
    console.log('🚀 Starling connected');
    
    if (this._queue.size > 0) {
      this._processQueue();
    }
  }
  
  /**
  * Handles connection lost
  * @private
  */
  _onDisconnected() {
    this._processing = false;
  }
  
  /**
  * Sets up queue drain timeout monitoring
  * @private
  */
  _setupDrainMonitor() {
    let timeoutId = null;
    
    // Monitor queue additions
    const checkDrainTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      if (this._queue.size > 0) {
        timeoutId = setTimeout(() => {
          const timedOutRequests = new Map(
            Array.from(this._queue.entries())
            .filter(([_, entry]) => 
              Date.now() - entry.addedAt > this._options.drainTimeout
          )
        );
        
        for (const [id, entry] of timedOutRequests) {
          entry.request.handleError({
            code: 'QUEUE_DRAIN_TIMEOUT',
            message: 'Queue drain timeout exceeded'
          });
          console.warn(`Queue drain timeout exceeded for request ${id}`);
          this._queue.delete(id);
        }
      }, this._options.drainTimeout);
    }
  };
  
  this._starling.events.on('queue:added', checkDrainTimeout);
  this._starling.events.on('queue:removed', checkDrainTimeout);
}

/**
* Waits for queue space
* @private
*/
async _waitForSpace() {
  if (!this._drainPromise) {
    this._drainPromise = new Promise(resolve => {
      this._drainResolve = resolve;
    });
  }
  await this._drainPromise;
}

/**
* Resolves drain promise
* @private
*/
_resolveDrain() {
  if (this._drainResolve) {
    this._drainResolve();
    this._drainPromise = null;
    this._drainResolve = null;
  }
}

/**
* Clears the queue
* @param {string} [reason='Queue cleared'] Clear reason
*/
clear(reason = 'Queue cleared') {
  for (const entry of this._queue.values()) {
    entry.request.cancel(reason);
  }
  this._queue.clear();
  this._resolveDrain();
}

/**
* Gets queue statistics
* @returns {Object} Queue statistics
*/
get stats() {
  const retryStats = Array.from(this._queue.values()).reduce((acc, entry) => {
    acc[entry.retryCount] = (acc[entry.retryCount] || 0) + 1;
    return acc;
  }, {});
  
  const ageStats = Array.from(this._queue.values()).reduce((acc, entry) => {
    const age = Date.now() - entry.addedAt;
    if (age < 1000) acc['<1s']++;
    else if (age < 5000) acc['<5s']++;
    else if (age < 30000) acc['<30s']++;
    else acc['>30s']++;
    return acc;
  }, { '<1s': 0, '<5s': 0, '<30s': 0, '>30s': 0 });
  
  return {
    size: this._queue.size,
    active: this._activeCount,
    processing: this._processing,
    maxSize: this._options.maxSize,
    maxRetries: this._options.maxRetries,
    retriesByCount: retryStats,
    requestAges: ageStats
  };
}
}