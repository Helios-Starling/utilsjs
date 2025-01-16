import { createRequest } from "../formatters";
import { Maestro } from "@killiandvcz/maestro";

/**
* Represents a pending request with enhanced Promise-like behavior and event listeners
* @typedef {Object} RequestOptions
* @property {number} [timeout=30000] Request timeout in milliseconds
* @property {boolean} [retry=true] Whether to retry on connection loss
* @property {Object} [metadata={}] Additional request metadata
* @property {boolean} [noResponse=false] Whether the request doesn't expect a response
*/

/**
* Represents a pending request with enhanced Promise-like behavior and event listeners
*/
export class Request {
    
    /**
    * Creates a new OUTCOMING request
    * @param {import('./starling').BaseStarling} starling Starling instance
    * @param {string} method Method name
    * @param {*} payload Request payload
    * @param {RequestOptions} [options={}] Request options
    */
    constructor(starling, method, payload, options = {}) {
        /** @private */
        this._starling = starling;
        
        /** @private */
        this._method = method;
        
        /** @private */
        this._payload = payload;
        
        /** @private */
        this._options = {
            timeout: 30000,
            retry: true,
            metadata: {},
            noResponse: false,
            ...options
        };
        
        /**
        * Unique request identifier
        * @type {string}
        * @readonly
        */
        this.id = crypto.randomUUID();
        
        /**
        * Request creation timestamp
        * @type {number}
        * @readonly
        */
        this.timestamp = Date.now();
        
        /** @private */
        this._timeout = null;
        
        
        
        /** @private */
        this._promise = null;
        
        /** @private */
        this._resolve = null;
        
        /** @private */
        this._reject = null;
        
        /** @private */
        this._state = 'pending';
        
        
        /** @private */
        this._result = null;
        
        /** @private */
        this._error = null;
        
        /** @private */
        this._listeners = {
            notification: new Set(),
            progress: new Set(),
            success: new Set(),
            error: new Set(),
            complete: new Set(),
            timeout: new Set()
        };
    }
    
    
    /**
    * Adds a notification listener
    * @param {function(Object): void} listener Notification handler
    * @returns {this} For chaining
    */
    onNotification(listener) {
        this._listeners.notification.add(listener);
        return this;
    }
    
    /**
    * Adds a progress listener
    * @param {function(Object): void} listener Progress handler
    * @returns {this} For chaining
    */
    onProgress(listener) {
        this._listeners.progress.add(listener);
        return this;
    }
    
    /**
    * Adds a success listener
    * @param {function(*): void} listener Success handler
    * @returns {this} For chaining
    */
    onSuccess(listener) {
        this._listeners.success.add(listener);
        if (this._state === 'fulfilled') {
            listener(this._result);
        }
        return this;
    }
    
    /**
    * Adds an error listener
    * @param {function(Error): void} listener Error handler
    * @returns {this} For chaining
    */
    onError(listener) {
        this._listeners.error.add(listener);
        if (this._state === 'rejected') {
            listener(this._error);
        }
        return this;
    }
    
    /**
    * Adds a completion listener (called on both success and error)
    * @param {function(): void} listener Completion handler
    * @returns {this} For chaining
    */
    onComplete(listener) {
        this._listeners.complete.add(listener);
        if (this._state !== 'pending') {
            listener();
        }
        return this;
    }
    
    /**
    * Adds a timeout listener
    * @param {function(): void} listener Timeout handler
    * @returns {this} For chaining
    */
    onTimeout(listener) {
        this._listeners.timeout.add(listener);
        return this;
    }
    
    
    /**
    * Executes the request
    * @returns {Promise<*>} Request promise
    */
    execute() {
        if (this._promise) {
            return this;
        }
        
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
            
            try {
                // Send the request
                this._starling.send(createRequest(this._method, this._payload, {
                    requestId: this.id,
                    metadata: this._options.metadata
                }));
                
                // Start timeout if needed
                if (this._options.timeout > 0 && !this._options.noResponse) {
                    this._startTimeout();
                }
                
            } catch (error) {
                this._handleError(error);
            }
        });
        
        return this;
    }
    
    /**
    * Handles an incoming notification
    * @param {Object} notification Notification data
    */
    handleNotification(notification) {
        if (notification.type === 'progress') {
            this._emit('progress', notification.data);
        } else {
            this._emit('notification', notification);
        }
    }
    
    /**
    * Handles a successful response
    * @param {Object} response Response data
    */
    handleResponse(response) {
        if (this._state !== 'pending') return;
        
        this._clearTimeout();
        this._state = 'fulfilled';
        this._result = response.data;
        
        this._emit('success', response.data);
        this._emit('complete');
        this._resolve(response.data);
    }
    
    /**
    * Handles an error response
    * @param {Object|Error} error Error data
    */
    handleError(error) {
        if (this._state !== 'pending') return;
        this._handleError(error);
    }
    
    /**
    * Cancels the request
    * @param {string} [reason='Request cancelled'] Cancellation reason
    */
    cancel(reason = 'Request cancelled') {
        if (this._state !== 'pending') return;
        
        this._handleError({
            code: 'REQUEST_CANCELLED',
            message: reason
        });
    }
    
    /** @private */
    _handleError(error) {
        this._clearTimeout();
        this._state = 'rejected';
        this._error = error;
        
        this._emit('error', error);
        this._emit('complete');
        this._reject(error);
    }
    
    /** @private */
    _startTimeout() {
        this._timeout = Maestro.timer(() => {
            this._emit('timeout');
            this._handleError({
                code: 'REQUEST_TIMEOUT',
                message: `Request timed out after ${this._options.timeout}ms`
            });
        }, {delay: this._options.timeout}).link(this._starling.timers);
    }
    
    /** @private */
    _clearTimeout() {
        if (this._timeout) {
            this._timeout.clear();
            this._timeout = null;
        }
    }
    
    /** @private */
    _emit(event, data) {
        for (const listener of this._listeners[event]) {
            try {
                listener(data);
            } catch (error) {
                console.error(`Error in ${event} listener:`, error);
            }
        }
    }

    /**
  * Current request state
  * @type {'pending'|'fulfilled'|'rejected'}
  * @readonly
  */
  get state() {
    return this._state;
  }
  
  /**
  * Whether the request is pending
  * @type {boolean}
  * @readonly
  */
  get isPending() {
    return this._state === 'pending';
  }
  
  /**
  * Response data if fulfilled
  * @type {*}
  * @readonly
  */
  get result() {
    return this._result;
  }
  
  /**
  * Error if rejected
  * @type {Error|Object}
  * @readonly
  */
  get error() {
    return this._error;
  }
    
}