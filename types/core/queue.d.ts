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
    constructor(starling: import("./starling").BaseStarling, requestsManager: import("../managers/requests").RequestsManager, options?: QueueOptions);
    /** @private */
    private _starling;
    /** @private */
    private _requestsManager;
    /** @private */
    private _options;
    /** @private */
    private _queue;
    /** @private */
    private _activeCount;
    /** @private */
    private _processing;
    /** @private */
    private _drainPromise;
    /** @private */
    private _drainResolve;
    /**
    * Adds a request to the queue
    * @param {import('./request').Request} request Request to queue
    * @returns {Promise<boolean>} Whether request was queued
    */
    add(request: import("./request").Request): Promise<boolean>;
    /**
    * Processes queued requests
    * @private
    */
    private _processQueue;
    /**
    * Handles permanent request failure
    * @private
    */
    private _handleRequestFailure;
    /**
    * Calculates retry delay with exponential backoff
    * @private
    */
    private _getRetryDelay;
    /**
    * Checks if queue can process requests
    * @private
    */
    private _canProcess;
    /**
    * Handles connection established
    * @private
    */
    private _onConnected;
    /**
    * Handles connection lost
    * @private
    */
    private _onDisconnected;
    /**
    * Sets up queue drain timeout monitoring
    * @private
    */
    private _setupDrainMonitor;
    /**
    * Waits for queue space
    * @private
    */
    private _waitForSpace;
    /**
    * Resolves drain promise
    * @private
    */
    private _resolveDrain;
    /**
    * Clears the queue
    * @param {string} [reason='Queue cleared'] Clear reason
    */
    clear(reason?: string): void;
    /**
    * Gets queue statistics
    * @returns {Object} Queue statistics
    */
    get stats(): any;
}
export type QueueOptions = {
    /**
     * Maximum queue size
     */
    maxSize?: number;
    /**
     * Maximum retry attempts
     */
    maxRetries?: number;
    /**
     * Base delay for exponential backoff in ms
     */
    baseDelay?: number;
    /**
     * Maximum concurrent requests
     */
    maxConcurrent?: number;
    /**
     * Enable priority-based queuing
     */
    priorityQueuing?: boolean;
    /**
     * Behavior when queue is full
     */
    onFull?: "block" | "drop" | "error";
    /**
     * Timeout for queue draining in ms
     */
    drainTimeout?: number;
};
