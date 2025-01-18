import { createRequest } from "../formatters";
import { Maestro } from "@killiandvcz/maestro";

/**
* @typedef {Object} RequestOptions
* @property {number} [timeout=30000] Request timeout in milliseconds
* @property {boolean} [retry=true] Whether to retry on connection loss
* @property {Object} [metadata={}] Additional request metadata
* @property {boolean} [noResponse=false] Whether the request doesn't expect a response
*/

/**
* Extended Promise with additional request-specific features
* @extends {Promise}
*/
export class Request {
    /**
    * Creates a new request
    * @param {import('./starling').BaseStarling} starling Starling instance
    * @param {string} method Method name
    * @param {*} payload Request payload
    * @param {RequestOptions} [options={}] Request options
    */
    constructor(starling, method, payload, options = {}) {
        // Créer la promise interne
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });

        this.then = this._promise.then.bind(this._promise);
        this.catch = this._promise.catch.bind(this._promise);
        this.finally = this._promise.finally.bind(this._promise);
        
        
        /**
        * Internal state
        * @private
        */
        this._starling = starling;
        this._method = method;
        this._payload = payload;
        this._options = {
            timeout: 30000,
            retry: true,
            metadata: {},
            noResponse: false,
            ...options
        };
        
        /**
        * Event listeners
        * @private 
        */
        this._progressListeners = new Set();
        this._notificationListeners = new Set();
        
        /**
        * Request metadata
        */
        this.id = crypto.randomUUID();
        this.timestamp = Date.now();
        
    }
    
    /**
    * Executes the request
    * @returns {this} For chaining
    */
    execute() {
        
        try {
            // Send the request
            this._starling.send(createRequest(this._method, this._payload, {
                requestId: this.id,
                metadata: this._options.metadata
            }));
            
            // Setup timeout if needed
            if (this._options.timeout > 0 && !this._options.noResponse) {
                this._timeout = Maestro.timer(() => {
                    this.handleError({
                        code: 'REQUEST_TIMEOUT',
                        message: `Request timed out after ${this._options.timeout}ms`
                    });
                }, { delay: this._options.timeout }).link(this._starling.timers);
            }
            
        } catch (error) {
            
            this.handleError(error);
        }
        
        return this;
    }
    
    
    
    /**
    * Adds a progress listener
    * @param {function(Object): void} listener Progress event handler
    * @returns {this} For chaining
    */
    onProgress(listener) {
        this._progressListeners.add(listener);
        return this;
    }
    
    /**
    * Adds a notification listener
    * @param {function(import('./context').NotificationContext): void} listener Notification event handler
    * @returns {this} For chaining
    */
    onNotification(listener) {
        this._notificationListeners.add(listener);
        return this;
    }
    
    /**
    * Handles incoming notification
    * @param {import('./context').NotificationContext} notification Notification context
    */
    handleNotification(notification) {
        if (notification.type === 'progress') {
            for (const listener of this._progressListeners) {
                try {
                    listener(notification.data);
                } catch (error) {
                    console.error('Error in progress listener:', error);
                }
            }
        } else {
            for (const listener of this._notificationListeners) {
                try {
                    listener(notification);
                } catch (error) {
                    console.error('Error in notification listener:', error);
                }
            }
        }
    }
    
    /**
    * Handles successful response
    * @param {Object} response Response data
    */
    handleResponse(response) {
        if (this._timeout) {
            this._timeout.clear();
        }
        this._resolve(response.data);
    }
    
    /**
    * Handles error response
    * @param {Object|Error} error Error data
    */
    handleError(error) {
        if (this._timeout) {
            this._timeout.clear();
        }
        this._reject(error);
    }
    
    /**
    * Cancels the request
    * @param {string} [reason='Request cancelled'] Cancellation reason
    */
    cancel(reason = 'Request cancelled') {
        this.handleError({
            code: 'REQUEST_CANCELLED',
            message: reason
        });
    }
    
    /**
    * For backwards compatibility (optional)
    * @param {function} listener Success handler
    * @returns {Promise} Promise instance
    */
    onSuccess(listener) {
        return this.then(listener);
    }
    
    /**
    * For backwards compatibility (optional)
    * @param {function} listener Error handler
    * @returns {Promise} Promise instance
    */
    onError(listener) {
        return this.catch(listener);
    }
    
    /**
    * For backwards compatibility (optional)
    * @param {function} listener Complete handler
    * @returns {Promise} Promise instance
    */
    onComplete(listener) {
        return this.finally(listener);
    }
}