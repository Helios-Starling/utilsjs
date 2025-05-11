import { 
  createSuccessResponse,
  createErrorResponse,
  CommonErrors, 
  createRequest
} from '@helios-starling/utils';

/**
* @typedef {Object} ContextOptions
* @property {number} timestamp - Message timestamp
* @property {Object} [metadata={}] - Additional metadata
* @property {Object|Boolean} [peer=false] - Proxy configuration
*/


/**
* Base context class for handling all types of incoming messages
* @abstract
*/
export class Context {
  /**
  * @param {import('./starling').BaseStarling} starling - The Starling instance
  * @param {ContextOptions} options - Context options
  */
  constructor(starling, options = {}) {
    /** @protected */
    this._starling = starling;
    /** @protected */
    this._timestamp = options.timestamp;
    /** @protected */
    this._metadata = options.metadata || {};
    /** @protected */
    this._processed = false;
    /** @protected */
    this._startTime = performance.now();
    /** @protected */
    this._peer = options.peer || false;
  }
  
  /**
  * Marks the context as processed and emits metrics
  * @protected
  */
  _markProcessed() {
    if (this._processed) return;
    this._processed = true;
    
    const duration = performance.now() - this._startTime;
    this._emitMetrics({ duration });
  }
  
  /**
  * Emits processing metrics
  * @protected
  * @param {Object} metrics - Metrics to emit
  */
  _emitMetrics(metrics) {
    this._starling.events.emit('message:processed', {
      starling: this._starling.id,
      contextType: this.constructor.name,
      timestamp: this._timestamp,
      ...metrics,
      metadata: this._metadata,
      debug: {
        type: 'info',
        message: `Message processed in ${metrics.duration.toFixed(2)}ms`
      }
    });
  }
  
  /**
  * The associated Starling instance
  * @type {import('./starling').BaseStarling}
  */
  get starling() {
    return this._starling;
  }
  
  /**
  * Message timestamp
  * @type {number}
  */
  get timestamp() {
    return this._timestamp;
  }
  
  /**
  * Additional metadata
  * @type {Object}
  */
  get metadata() {
    return this._metadata;
  }
  
  /**
  * Whether the context has been processed
  * @type {boolean}
  */
  get isProcessed() {
    return this._processed;
  }
  
  /**
  * Alias for isProcessed to maintain backwards compatibility
  * @type {boolean}
  * @deprecated Use isProcessed instead
  */
  get isFinished() {
    return this.isProcessed;
  }
  
  /**
  * Proxy configuration
  * @type {Object|Boolean}
  * @readonly
  */
  get peer() {
    return this._peer;
  }
}

/**
* @typedef {Object} RequestContextOptions
* @property {string} requestId - Request ID
* @property {import('../types/protocol.d').method} method - Request method
*/

/**
* Context for handling incoming requests
* @extends Context
*/
export class RequestContext extends Context {
  /**
  * @param {import('./starling').BaseStarling} starling - The Starling instance
  * @param {*} payload - Request payload
  * @param {ContextOptions & RequestContextOptions} options - Context options
  */
  constructor(starling, payload, options = {}) {
    super(starling, { ...options });
    
    /** @protected */
    this._method = options.method;
    /** @protected */
    this._requestId = options.requestId;
    /** @protected */
    this._payload = payload;
    /** @protected */
    this._streaming = false;
    /** @protected */
    this._streamStats = {
      notifications: 0,
      lastNotification: null
    };
  }
  
  /**
  * Sends a success response (if you need to override the default success handler)
  * @param {*} data - Response data
  * @throws {Error} If context is already processed
  */
  _success(data) {
    if (this._processed) {
      throw new Error('Request already processed');
    }
    this._markProcessed();
    
    this._starling.send(createSuccessResponse(
      this._requestId,
      data,
      {
        ...(this._peer && { peer: this._peer })
      }
    ));
  }
  
  /**
  * Sends a success response
  * @param {*} data - Response data
  * @throws {Error} If context is already processed
  */
  success(data) {
    return this._success(data);
  }
  
  /**
  * Sends an error response
  * @param {string} code - Error code
  * @param {string} message - Error message
  * @param {*} [details] - Optional error details
  * @throws {Error} If context is already processed
  */
  error(code, message, details = undefined) {
    if (this._processed) {
      throw new Error('Request already processed');
    }
    this._markProcessed();
    
    this._starling.send(createErrorResponse(
      this._requestId,
      code || CommonErrors.INTERNAL_ERROR,
      message,
      details,
      {
        ...(this._peer && { peer: this._peer })
      }
    ));
  }
  
  /**
  * Sends an intermediate notification (for streaming/progress)
  * @param {Object|*} data - Notification data
  * @param {string} [topic] - Optional notification topic
  * @throws {Error} If context is already processed
  */
  notify(topic, data = {}) {
    if (this._processed) {
      throw new Error('Request already processed');
    }
    
    // Track streaming stats
    this._streaming = true;
    this._streamStats.notifications++;
    this._streamStats.lastNotification = Date.now();
    
    this._starling.notify(topic, data, this._requestId, {
      ...(this._peer && { peer: this._peer })
    });
  }
  
  
  /**
  * Sends a warning notification
  * @param {string} message - Warning message
  * @throws {Error} If context is already processed
  */
  warn(message) {
    this.notify('warn', { message });
  }
  
  /**
  * Sends a progress notification
  * @param {number} progress - Progress percentage (0-100)
  * @param {string} [status] - Optional status message
  * @param {Object} [details] - Additional progress details
  */
  progress(progress, status = undefined, details = undefined) {
    this.notify({
      type: 'progress',
      progress: Math.min(100, Math.max(0, progress)),
      ...(status && { status }),
      ...(details && { details })
    }, `${this._requestId}:progress`);
  }
  
  /**
  * Enhanced metrics emission for requests
  * @protected
  * @override
  */
  _emitMetrics(metrics) {
    super._emitMetrics({
      ...metrics,
      requestId: this._requestId,
      streaming: this._streaming,
      streamStats: this._streamStats
    });
  }
  
  /**
  * Request ID
  * @type {string}
  */
  get requestId() {
    return this._requestId;
  }
  
  /**
  * Request method
  * @type {import('../types/protocol.d').method}
  */
  get method() {
    return this._method;
  }
  
  /**
  * Request payload
  * @type {*}
  */
  get payload() {
    return this._payload;
  }
  
  /**
  * Whether the request used streaming
  * @type {boolean}
  */
  get isStreaming() {
    return this._streaming;
  }
}


/**
* Context for handling incoming responses
* @extends Context
*/
export class ResponseContext extends Context {
  /**
  * @param {import('./starling').BaseStarling} starling - The Starling instance
  * @param {{data?: Object, error?: Object, success: Boolean}} result - Response data
  * @param {ContextOptions & ResponseContextOptions} options - Context options
  */
  constructor(starling, result = {}, options = {}) {
    super(starling, { ...options });
    
    /** @protected */
    this._data = result.data || null;
    
    /** @protected */
    this._success = result.success || !result.error;
    
    /** @protected */
    this._error = result.error || null;
    
    if (options.requestId) {
      this._requestId = options.requestId;
    }
  }
  
  get data() {
    return this._data;
  }
  
  get error() {
    return this._error;
  }
  
  get success() {
    return this._success;
  }
  
  get requestId() {
    return this._requestId;
  }
  
  
}

/**
* @typedef {Object} ResponseContextOptions
* @property {string} requestId - Request ID
*/

/**
* Context for handling incoming notifications
* @extends Context
*/
export class NotificationContext extends Context {
  /**
  * @param {import('./starling').BaseStarling} starling - The Starling instance
  * @param {Object} notification - Notification object
  * @param {ContextOptions & ResponseContextOptions} options - Context options
  */
  constructor(starling, notification, options = {}) {
    super(starling, { ...options });
    
    /** @protected */
    this._topic = notification.topic;
    /** @protected */
    this._data = notification.data;
    
    /** @protected */
    this._type = notification.type;
    
    if (options.requestId) {
      
      this._requestId = options.requestId;
    }
  }
  
  /**
  * Acknowledges the notification processing
  * @param {Object} [response] - Optional response data
  */
  acknowledge(response = undefined) {
    if (this._processed) {
      throw new Error('Notification already processed');
    }
    this._markProcessed();
    
    if (response) {
      this._starling.notify({
        topic: `${this._topic}:ack`,
        data: response
      });
    }
  }
  
  /**
  * Notification topic
  * @type {string}
  */
  get topic() {
    return this._topic;
  }
  
  /**
  * Notification data
  * @type {*}
  */
  get data() {
    return this._data;
  }
  
  /**
  * Request ID (if applicable)
  * @type {string}
  */
  get requestId() {
    return this._requestId;
  }
  
  /**
  * Notification type
  * @type {string}
  */
  get type() {
    return this._type;
  }
}

/**
* Context for handling incoming error messages
* @extends Context
*/
export class ErrorMessageContext extends Context {
  /**
  * @param {import('./starling').BaseStarling} starling - The Starling instance
  * @param {Object} error - Error object
  * @param {ContextOptions} options - Context options
  */
  constructor(starling, error, options = {  }) {
    super(starling, {...options});
    
    /** @protected */
    this._raw = error;
    
    /** @protected */
    this._code = error.code;
    /** @protected */
    this._message = error.message;
    /** @protected */
    this._details = error.details;
  }
  
  /**
  * Acknowledges error processing
  */
  acknowledge() {
    if (this._processed) return;
    this._markProcessed();
  }
  
  /**
  * Raw error object
  * @type {Object}
  */
  get raw() {
    return this._raw;
  }
  
  /**
  * Error code
  * @type {string}
  */
  get code() {
    return this._code;
  }
  
  /**
  * Error message
  * @type {string}
  */
  get message() {
    return this._message;
  }
  
  /**
  * Error details
  * @type {*}
  */
  get details() {
    return this._details;
  }
}

// Non-protocol message contexts

/**
* Context for handling raw text messages
* @extends Context
*/
export class TextMessageContext extends Context {
  /**
  * @param {import('./starling').BaseStarling} starling - The Starling instance
  * @param {string} content - Text content
  * @param {ContextOptions} options - Context options
  */
  constructor(starling, content, options = {}) {
    super(starling, { ...options });
    /** @protected */
    this._content = content;
  }
  
  /**
  * Acknowledges text message processing
  */
  acknowledge() {
    if (this._processed) return;
    this._markProcessed();
  }
  
  /**
  * Text content
  * @type {string}
  */
  get content() {
    return this._content;
  }
}

/**
* Context for handling binary messages
* @extends Context
*/
export class BinaryMessageContext extends Context {
  /**
  * @param {import('./starling').BaseStarling} starling - The Starling instance
  * @param {ArrayBuffer} data - Binary data
  * @param {ContextOptions} options - Context options
  */
  constructor(starling, data, options = {}) {
    super(starling, { ...options });
    /** @protected */
    this._data = data;
  }
  
  /**
  * Acknowledges binary message processing
  */
  acknowledge() {
    if (this._processed) return;
    this._markProcessed();
  }
  
  /**
  * Binary data
  * @type {ArrayBuffer}
  */
  get data() {
    return this._data;
  }
}

/**
* Context for handling non-protocol JSON messages
* @extends Context
*/
export class JsonMessageContext extends Context {
  /**
  * @param {import('./starling').BaseStarling} starling - The Starling instance
  * @param {Object} data - JSON data
  * @param {ContextOptions} options - Context options
  */
  constructor(starling, data, options = {}) {
    super(starling, {...options });
    /** @protected */
    this._data = data;
  }
  
  /**
  * Acknowledges JSON message processing
  */
  acknowledge() {
    if (this._processed) return;
    this._markProcessed();
  }
  
  /**
  * JSON data
  * @type {Object}
  */
  get data() {
    return this._data;
  }
}