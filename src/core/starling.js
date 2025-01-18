import { getCurrentTimestamp } from '../utils';
import {Maestro} from '@killiandvcz/maestro';
import { Events } from './events';

/**
* @typedef {Object} BaseStarlingOptions
* @property {number} [messageBufferSize=1000] Message buffer size
* @property {number} [messageMaxAge=300000] Maximum message age in ms (5 minutes)
* @property {number} [queueMaxSize=1000] Maximum queue size
* @property {number} [queueMaxRetries=3] Maximum number of retries
* @property {number[]} [queueRetryDelays=[1000, 2000, 5000]] Retry delays in ms
* @property {number} [maxMessageSize=1048576] Maximum message size in bytes
*/


/**
* Base class for Starling implementations (server/client)
* @abstract
*/
export class BaseStarling {
    
    /**
    * @param {BaseStarlingOptions} options 
    * @param {import('./events').Events} events
    */
    constructor(options = {}, events) {
        
        /** @protected
        * @type {BaseStarlingOptions}
        */
        this._options = {
            messageBufferSize: 1000,
            messageMaxAge: 5 * 60 * 1000,
            queueMaxSize: 1000,
            queueMaxRetries: 3,
            queueRetryDelays: [1000, 2000, 5000],
            maxMessageSize: 1024 * 1024,
            ...options
        };
        
        /** @protected */
        this._id = crypto.randomUUID();
        
        /** @protected */
        this._createdAt = getCurrentTimestamp();
        
        /** @protected */
        this._lastConnected = null;
        
        /** @protected */
        this._disconnectedAt = null;
        
        // /** @protected */
        // this._state = 'disconnected';
        
        /** @protected */
        this._data = new Map();
        
        /**
        * Local starling events
        */
        this.events = new Events();
        
        /**
        * High-scoped events (Starling ones if client, Helios ones if server)
        */
        this._events = events || this.events;
        
        // Timers group
        /**
        * @type {import('@killiandvcz/maestro').Group}
        */
        this.timers = Maestro.group({name: 'Starling Timers'});
    }
    
    get _state() {
        if (this._ws?.readyState) {
            switch (this._ws.readyState) {
                case 0:
                return 'connecting';
                case 1:
                return 'connected';
                case 2:
                return 'closing';
                case 3:
                return 'disconnected';
            }
        }
        return 'disconnected';
    }
    
    /**
    * Initialize required components
    * @abstract
    * @protected
    */
    _initializeComponents() {
        throw new Error('_initializeComponents must be implemented');
    }
    
    /**
    * Handle incoming messages
    * @abstract
    */
    handleMessage(message) {
        throw new Error('handleMessage must be implemented');
    }
    
    /**
    * Send a message directly (bypassing the buffer)
    * @protected
    * @abstract
    */
    _send(message) {
        throw new Error('_send must be implemented');
    }
    
    /**
    * Send a message (let the buffer handle)
    * @abstract
    */
    send(message) {
        throw new Error('send must be implemented');
    }
    
    /**
    * Send a notification
    * @abstract
    * @param {string} topic
    * @param {*} data
    * @param {string} [requestId=null]
    */
    notify(topic, data, requestId = null) {
        throw new Error('notify must be implemented');
    }
    
    /**
    * Send a request
    * @abstract
    * @returns {import('./request').Request} Request instance
    */
    request(method, payload, options = {}) {
        throw new Error('request must be implemented');
    }
    
    
    get id(){
        return this._id;
    }
    
    
    /**
    * Current connection state
    * @returns {'connecting'|'connected'|'disconnected'|'closing'} Connection state
    */
    get state() {
        return this._state;
    }
    
    /**
    * Whether currently connected
    */
    get isConnected() {
        return this.state === 'connected';
    }
    
    /**
    * Last connection timestamp
    */
    get lastConnected() {
        return this._lastConnected;
    }
    
    /**
    * Creation timestamp
    */
    get createdAt() {
        return this._createdAt;
    }
    
    /**
    * Custom data store
    */
    get data() {
        return this._data;
    }
}