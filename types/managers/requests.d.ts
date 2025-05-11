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
    constructor(starling: import("../core/starling").BaseStarling, events: import("../core/events").EventsManager, options?: RequestManagerOptions);
    /** @private */
    private _starling;
    /** @private */
    private _events;
    /** @private @type {RequestManagerOptions} */
    private _options;
    /** @private */
    private _queue;
    /**
    * Map for tracking active requests
    * @type {Map<string, Request>}
    * @private
    */
    private _activeRequests;
    /**
    * Map for tracking expired requests (for late response handling)
    * @type {Map<string, { timestamp: number, timeout: number }>}
    * @private
    */
    private _expiredRequests;
    _cleanupInterval: Timer;
    /**
    * Creates and queues a new request
    * @param {import('../core/starling').Starling} starling Starling instance
    * @param {string} method Method name
    * @param {*} payload Request payload
    * @param {import('../core/request').RequestOptions} [options={}] Request options
    * @throws {Error} If request creation fails
    */
    execute: (starling: import("../core/starling").Starling, method: string, payload: any, options?: import("../core/request").RequestOptions) => Request;
    /**
    * Handles an incoming response
    * @param {import('../core/starling').Starling} starling Starling instance
    * @param {import('../core').ResponseContext} context Response message
    */
    handleResponse(starling: import("../core/starling").Starling, context: import("../core").ResponseContext): Promise<void>;
    /**
    * Handles request-related notifications
    * @param {import('../core/starling').Starling} starling Starling instance
    * @param {import('../core/context').NotificationContext} context Notification context
    */
    handleNotification(starling: import("../core/starling").Starling, context: import("../core/context").NotificationContext): void;
    /**
    * Cancels all active requests
    * @param {string} [reason='All requests cancelled'] Cancellation reason
    */
    cancelAll(reason?: string): void;
    /**
    * @private
    */
    private _handleUnknownResponse;
    /**
    * @private
    */
    private _cleanup;
    /**
    * Sets up monitoring for queue events
    * @private
    */
    private _setupQueueMonitoring;
    /**
    * Helper for emitting events with debug info
    * @private
    */
    private _emitEvent;
    /**
    * Generates debug messages for events
    * @private
    */
    private _getDebugMessage;
    /**
    * Disposes of the manager and cleans up resources
    */
    dispose(): void;
    /**
    * Number of active requests
    */
    get activeCount(): number;
    /**
    * System statistics
    */
    get stats(): {
        active: number;
        expired: number;
        queue: any;
    };
}
export type RequestManagerOptions = {
    /**
     * Queue configuration options
     */
    queue?: import("../core/queue").QueueOptions;
    /**
     * Request timeout in ms
     */
    timeout?: number;
};
import { Request } from '../core/request';
