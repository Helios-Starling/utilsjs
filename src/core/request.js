import { createRequest } from "../formatters";
import { Maestro } from "@killiandvcz/maestro";

/**
* @typedef {Object} RequestOptions
* @property {number} [timeout=30000] Request timeout in milliseconds
* @property {boolean} [retry=true] Whether to retry on connection loss
* @property {Object} [metadata={}] Additional request metadata
* @property {boolean} [noResponse=false] Whether the request doesn't expect a response
* @property {Object|Boolean} [peer=false] Proxy peer options
*/

/**
* Extended Promise with additional request-specific features
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
        this._promiseId = Math.random().toString(36).substring(7);


        // Créer la promise interne
        this._promise = new Promise((resolve, reject) => {
            console.log('Request constructor');
            
            this._resolve = resolve;
            this._reject = (reason) => {
                console.log("REASON");
                
                reject(reason);
            };
        });
        this._promise._debugId = this._promiseId;

        this.then = this._promise.then.bind(this._promise);
        this.catch = this._promise.catch.bind(this._promise);
        this.finally = this._promise.finally.bind(this._promise);
        
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
    execute = () => {
        try {
            // Send the request
            this._starling.send(createRequest(this._method, this._payload, {
                requestId: this.id,
                metadata: this._options.metadata,
                ...(this._options.peer ? { peer: this._options.peer } : {})
                
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
    * @param {import('./context').NotificationContext} context Notification context
    */
    handleNotification(context) {
        if (context.type === 'progress') {
            for (const listener of this._progressListeners) {
                try {
                    listener(context);
                } catch (error) {
                    console.error('Error in progress listener:', error);
                }
            }
        } else {
            for (const listener of this._notificationListeners) {
                try {
                    listener(context);
                } catch (error) {
                    console.error('Error in notification listener:', error);
                }
            }
        }
    }
    
    // Méthode pour résoudre la requête
    resolve(value) {
        this._resolve(value);
    }
    
    // Méthode pour rejeter la requête
    reject(error) {
        this._reject(error);
    }
    
    /**
    * Handles successful response
    * @param {import("./context").ResponseContext} context Response data
    */
    handleResponse(context) {
        if (this._timeout) {
            this._timeout.clear();
        }
        this.resolve(context.data);
    }
    
    /**
    * Handles error response
    * @param {Object|Error} error Error data
    * @param {import("./context").ResponseContext} context Response data
    */
    handleError(error, context) {
        if (this._timeout) {
            this._timeout.clear();
        }
        
        
        this.reject(new Error(error.message || 'Request failed', {cause: {
            error,
            context: context || null
        }}));
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

    get method() {
        return this._method;
    }
}