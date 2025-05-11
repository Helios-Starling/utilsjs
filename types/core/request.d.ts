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
    constructor(starling: import("./starling").BaseStarling, method: string, payload: any, options?: RequestOptions);
    _promiseId: string;
    _promise: Promise<any>;
    _resolve: (value: any) => void;
    _reject: (reason: any) => void;
    then: any;
    catch: any;
    finally: any;
    _starling: import("./starling").BaseStarling;
    _method: string;
    _payload: any;
    _options: {
        /**
         * Request timeout in milliseconds
         */
        timeout: number;
        /**
         * Whether to retry on connection loss
         */
        retry: boolean;
        /**
         * Additional request metadata
         */
        metadata: any;
        /**
         * Whether the request doesn't expect a response
         */
        noResponse: boolean;
        /**
         * Proxy peer options
         */
        peer?: any | boolean;
    };
    /**
    * Event listeners
    * @private
    */
    private _progressListeners;
    _notificationListeners: Set<any>;
    /**
    * Request metadata
    */
    id: `${string}-${string}-${string}-${string}-${string}`;
    timestamp: number;
    /**
    * Executes the request
    * @returns {this} For chaining
    */
    execute: () => this;
    _timeout: import("@killiandvcz/maestro").Timer;
    /**
    * Adds a progress listener
    * @param {function(Object): void} listener Progress event handler
    * @returns {this} For chaining
    */
    onProgress(listener: (arg0: any) => void): this;
    /**
    * Adds a notification listener
    * @param {function(import('./context').NotificationContext): void} listener Notification event handler
    * @returns {this} For chaining
    */
    onNotification(listener: (arg0: import("./context").NotificationContext) => void): this;
    /**
    * Handles incoming notification
    * @param {import('./context').NotificationContext} context Notification context
    */
    handleNotification(context: import("./context").NotificationContext): void;
    resolve(value: any): void;
    reject(error: any): void;
    /**
    * Handles successful response
    * @param {import("./context").ResponseContext} context Response data
    */
    handleResponse(context: import("./context").ResponseContext): void;
    /**
    * Handles error response
    * @param {Object|Error} error Error data
    * @param {import("./context").ResponseContext} context Response data
    */
    handleError(error: any | Error, context: import("./context").ResponseContext): void;
    /**
    * Cancels the request
    * @param {string} [reason='Request cancelled'] Cancellation reason
    */
    cancel(reason?: string): void;
    get method(): string;
}
export type RequestOptions = {
    /**
     * Request timeout in milliseconds
     */
    timeout?: number;
    /**
     * Whether to retry on connection loss
     */
    retry?: boolean;
    /**
     * Additional request metadata
     */
    metadata?: any;
    /**
     * Whether the request doesn't expect a response
     */
    noResponse?: boolean;
    /**
     * Proxy peer options
     */
    peer?: any | boolean;
};
