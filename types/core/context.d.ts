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
    constructor(starling: import("./starling").BaseStarling, options?: ContextOptions);
    /** @protected */
    protected _starling: import("./starling").BaseStarling;
    /** @protected */
    protected _timestamp: number;
    /** @protected */
    protected _metadata: any;
    /** @protected */
    protected _processed: boolean;
    /** @protected */
    protected _startTime: number;
    /** @protected */
    protected _peer: any;
    /**
    * Marks the context as processed and emits metrics
    * @protected
    */
    protected _markProcessed(): void;
    /**
    * Emits processing metrics
    * @protected
    * @param {Object} metrics - Metrics to emit
    */
    protected _emitMetrics(metrics: any): void;
    /**
    * The associated Starling instance
    * @type {import('./starling').BaseStarling}
    */
    get starling(): import("./starling").BaseStarling;
    /**
    * Message timestamp
    * @type {number}
    */
    get timestamp(): number;
    /**
    * Additional metadata
    * @type {Object}
    */
    get metadata(): any;
    /**
    * Whether the context has been processed
    * @type {boolean}
    */
    get isProcessed(): boolean;
    /**
    * Alias for isProcessed to maintain backwards compatibility
    * @type {boolean}
    * @deprecated Use isProcessed instead
    */
    get isFinished(): boolean;
    /**
    * Proxy configuration
    * @type {Object|Boolean}
    * @readonly
    */
    readonly get peer(): any | boolean;
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
    constructor(starling: import("./starling").BaseStarling, payload: any, options?: ContextOptions & RequestContextOptions);
    /** @protected */
    protected _method: string;
    /** @protected */
    protected _requestId: string;
    /** @protected */
    protected _payload: any;
    /** @protected */
    protected _streaming: boolean;
    /** @protected */
    protected _streamStats: {
        notifications: number;
        lastNotification: any;
    };
    /**
    * Sends a success response (if you need to override the default success handler)
    * @param {*} data - Response data
    * @throws {Error} If context is already processed
    */
    _success(data: any): void;
    /**
    * Sends a success response
    * @param {*} data - Response data
    * @throws {Error} If context is already processed
    */
    success(data: any): void;
    /**
    * Sends an error response
    * @param {string} code - Error code
    * @param {string} message - Error message
    * @param {*} [details] - Optional error details
    * @throws {Error} If context is already processed
    */
    error(code: string, message: string, details?: any): void;
    /**
    * Sends an intermediate notification (for streaming/progress)
    * @param {Object|*} data - Notification data
    * @param {string} [topic] - Optional notification topic
    * @throws {Error} If context is already processed
    */
    notify(topic?: string, data?: any | any): void;
    /**
    * Sends a warning notification
    * @param {string} message - Warning message
    * @throws {Error} If context is already processed
    */
    warn(message: string): void;
    /**
    * Sends a progress notification
    * @param {number} progress - Progress percentage (0-100)
    * @param {string} [status] - Optional status message
    * @param {Object} [details] - Additional progress details
    */
    progress(progress: number, status?: string, details?: any): void;
    /**
    * Enhanced metrics emission for requests
    * @protected
    * @override
    */
    protected override _emitMetrics(metrics: any): void;
    /**
    * Request ID
    * @type {string}
    */
    get requestId(): string;
    /**
    * Request method
    * @type {import('../types/protocol.d').method}
    */
    get method(): import("../types/protocol.d").method;
    /**
    * Request payload
    * @type {*}
    */
    get payload(): any;
    /**
    * Whether the request used streaming
    * @type {boolean}
    */
    get isStreaming(): boolean;
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
    constructor(starling: import("./starling").BaseStarling, result?: {
        data?: any;
        error?: any;
        success: boolean;
    }, options?: ContextOptions & ResponseContextOptions);
    /** @protected */
    protected _data: any;
    /** @protected */
    protected _success: boolean;
    /** @protected */
    protected _error: any;
    _requestId: string;
    get data(): any;
    get error(): any;
    get success(): boolean;
    get requestId(): string;
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
    constructor(starling: import("./starling").BaseStarling, notification: any, options?: ContextOptions & ResponseContextOptions);
    /** @protected */
    protected _topic: any;
    /** @protected */
    protected _data: any;
    /** @protected */
    protected _type: any;
    _requestId: string;
    /**
    * Acknowledges the notification processing
    * @param {Object} [response] - Optional response data
    */
    acknowledge(response?: any): void;
    /**
    * Notification topic
    * @type {string}
    */
    get topic(): string;
    /**
    * Notification data
    * @type {*}
    */
    get data(): any;
    /**
    * Request ID (if applicable)
    * @type {string}
    */
    get requestId(): string;
    /**
    * Notification type
    * @type {string}
    */
    get type(): string;
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
    constructor(starling: import("./starling").BaseStarling, error: any, options?: ContextOptions);
    /** @protected */
    protected _raw: any;
    /** @protected */
    protected _code: any;
    /** @protected */
    protected _message: any;
    /** @protected */
    protected _details: any;
    /**
    * Acknowledges error processing
    */
    acknowledge(): void;
    /**
    * Raw error object
    * @type {Object}
    */
    get raw(): any;
    /**
    * Error code
    * @type {string}
    */
    get code(): string;
    /**
    * Error message
    * @type {string}
    */
    get message(): string;
    /**
    * Error details
    * @type {*}
    */
    get details(): any;
}
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
    constructor(starling: import("./starling").BaseStarling, content: string, options?: ContextOptions);
    /** @protected */
    protected _content: string;
    /**
    * Acknowledges text message processing
    */
    acknowledge(): void;
    /**
    * Text content
    * @type {string}
    */
    get content(): string;
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
    constructor(starling: import("./starling").BaseStarling, data: ArrayBuffer, options?: ContextOptions);
    /** @protected */
    protected _data: ArrayBuffer;
    /**
    * Acknowledges binary message processing
    */
    acknowledge(): void;
    /**
    * Binary data
    * @type {ArrayBuffer}
    */
    get data(): ArrayBuffer;
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
    constructor(starling: import("./starling").BaseStarling, data: any, options?: ContextOptions);
    /** @protected */
    protected _data: any;
    /**
    * Acknowledges JSON message processing
    */
    acknowledge(): void;
    /**
    * JSON data
    * @type {Object}
    */
    get data(): any;
}
export type ContextOptions = {
    /**
     * - Message timestamp
     */
    timestamp: number;
    /**
     * - Additional metadata
     */
    metadata?: any;
    /**
     * - Proxy configuration
     */
    peer?: any | boolean;
};
export type RequestContextOptions = {
    /**
     * - Request ID
     */
    requestId: string;
    /**
     * - Request method
     */
    method: import("../types/protocol.d").method;
};
export type ResponseContextOptions = {
    /**
     * - Request ID
     */
    requestId: string;
};
