import { getCurrentTimestamp } from '../utils';
import {Maestro} from '@killiandvcz/maestro';
import { Events } from './events';

/**
* Base class for Starling implementations (server/client)
* @abstract
*/
export class BaseStarling {
    constructor(options = {}, events) {
        /** @protected */
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
        
        /** @protected */
        this._state = 'disconnected';
        
        /** @protected */
        this._data = new Map();
        
        // Initialize components
        this._initializeComponents();

        // // Bind events
        // this.events = events || new Events();

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
    * Send a message
    * @abstract
    */
    send(message) {
        throw new Error('send must be implemented');
    }
    
    /**
    * Send a notification
    * @abstract
    */
    notify(notification) {
        throw new Error('notify must be implemented');
    }
    
    /**
    * Send a request
    * @abstract
    */
    request(method, payload, options = {}) {
        throw new Error('request must be implemented');
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