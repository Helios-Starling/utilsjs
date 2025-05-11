/**
* @typedef {Object} BaseStarlingOptions
* @property {*} [id] Starling ID
* @property {number} [messageBufferSize=1000] Message buffer size
* @property {number} [messageMaxAge=300000] Maximum message age in ms (5 minutes)
* @property {number} [queueMaxSize=1000] Maximum queue size
* @property {number} [queueMaxRetries=3] Maximum number of retries
* @property {number[]} [queueRetryDelays=[1000, 2000, 5000]] Retry delays in ms
* @property {number} [maxMessageSize=1048576] Maximum message size in bytes
* @property {NetworkNode} [networkNode] Network node
* @property {import('./buffer').BufferOptions} [buffer] Buffer options
* @property {import('../managers/requests').RequestManagerOptions} [requests] Requests manager options
*/
/**
* Base class for Starling implementations (server/client)
*/
export class BaseStarling {
    /**
    * @param {BaseStarlingOptions} options
    * @param {import('./events').Events} events
    */
    constructor(options: BaseStarlingOptions, events: import("./events").Events);
    /** @protected
    * @type {BaseStarlingOptions}
    */
    protected _options: BaseStarlingOptions;
    /** @protected */
    protected _id: any;
    /** @protected @type {NetworkNode} */
    protected _networkNode: NetworkNode;
    /** @protected */
    protected _ws: any;
    /** @protected */
    protected _createdAt: number;
    /** @protected */
    protected _lastConnected: any;
    /** @protected */
    protected _disconnectedAt: any;
    /** @protected */
    protected _data: Map<any, any>;
    /**
    * Local starling events
    */
    events: Events;
    /**
    * High-scoped events (Starling ones if client, Helios ones if server)
    */
    _events: Events;
    /**
    * @type {import('@killiandvcz/maestro').Group}
    */
    timers: import("@killiandvcz/maestro").Group;
    _buffer: Buffer;
    _requests: RequestsManager;
    get _state(): "connected" | "connecting" | "disconnected" | "closing";
    /**
    * Handles incoming messages
    * @param {string|ArrayBuffer|Uint8Array} message Raw message data
    */
    handleMessage(message: string | ArrayBuffer | Uint8Array): void;
    /**
    *
    * @param {Object|string|ArrayBuffer|Uint8Array} message Raw message data
    * @returns
    */
    _send(message: any | string | ArrayBuffer | Uint8Array): boolean;
    /**
    * Send a message (let the buffer handle)
    * @param {Object|string|ArrayBuffer|Uint8Array} message Raw message data
    * @returns {Promise<boolean>} Whether the message was sent
    */
    send(message: any | string | ArrayBuffer | Uint8Array): Promise<boolean>;
    /**
    * Send a notification
    * @param {string} topic
    * @param {*} data
    * @param {string} [requestId=null]
    * @param {import("../types/messages.d").NotificationOptions} [options] - Message options
    */
    notify(topic: string, data?: any, requestId?: string, options?: import("../types/messages.d").NotificationOptions): void;
    /**
    * @param {import('../types/protocol.d').method} method
    * @param {import('../types/protocol.d').payload} payload
    * @param {import('./request').RequestOptions} [options={}]
    */
    request: (method: import("../types/protocol.d").method, payload: import("../types/protocol.d").payload, options?: import("./request").RequestOptions) => import("./request").Request;
    /**
    * Sends an error message
    * @param {string} code Error code
    * @param {string} message Error message
    * @param {Object} [details] Error details
    */
    sendError: (code: string, message: string, details?: any) => void;
    get id(): any;
    /**
    * Current connection state
    * @returns {'connecting'|'connected'|'disconnected'|'closing'} Connection state
    */
    get state(): "connecting" | "connected" | "disconnected" | "closing";
    /**
    * Whether currently connected
    */
    get isConnected(): boolean;
    /**
    * Last connection timestamp
    */
    get lastConnected(): any;
    /**
    * Creation timestamp
    */
    get createdAt(): number;
    /**
    * Custom data store
    */
    get data(): Map<any, any>;
}
export type BaseStarlingOptions = {
    /**
     * Starling ID
     */
    id?: any;
    /**
     * Message buffer size
     */
    messageBufferSize?: number;
    /**
     * Maximum message age in ms (5 minutes)
     */
    messageMaxAge?: number;
    /**
     * Maximum queue size
     */
    queueMaxSize?: number;
    /**
     * Maximum number of retries
     */
    queueMaxRetries?: number;
    /**
     * Retry delays in ms
     */
    queueRetryDelays?: number[];
    /**
     * Maximum message size in bytes
     */
    maxMessageSize?: number;
    /**
     * Network node
     */
    networkNode?: NetworkNode;
    /**
     * Buffer options
     */
    buffer?: import("./buffer").BufferOptions;
    /**
     * Requests manager options
     */
    requests?: import("../managers/requests").RequestManagerOptions;
};
import { NetworkNode } from './node';
import { Events } from './events';
import { Buffer } from './buffer';
import { RequestsManager } from '../managers';
