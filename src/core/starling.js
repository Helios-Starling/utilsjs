import { getCurrentTimestamp } from '../utils';
import {Maestro} from '@killiandvcz/maestro';
import { Events } from './events';
import { Buffer } from './buffer';
import { RequestsManager } from '../managers';
import { handleMessage } from '../handlers';
import { createApplicationError, createNotification } from '../formatters';
import { NetworkNode } from './node';

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
    constructor(options = {}, events) {
        
        /** @protected
        * @type {BaseStarlingOptions}
        */
        this._options = {
            id: Symbol('Starling'),
            messageBufferSize: 1000,
            messageMaxAge: 5 * 60 * 1000,
            queueMaxSize: 1000,
            queueMaxRetries: 3,
            queueRetryDelays: [1000, 2000, 5000],
            maxMessageSize: 1024 * 1024,
            ...options
        };
        
        /** @protected */
        this._id = this._options.id;


        /** @protected @type {NetworkNode} */
        this._networkNode = options.networkNode instanceof NetworkNode ? options.networkNode : null;

        /** @protected */
        this._ws = null;
        
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
        this.events = events || new Events();
        
        /**
        * High-scoped events (Starling ones if client, Helios ones if server)
        */
        this._events = events || this.events;
        
        // Timers group
        /**
        * @type {import('@killiandvcz/maestro').Group}
        */
        this.timers = Maestro.group({name: 'Starling Timers'});
        
        
        this._buffer = new Buffer(this, this._options?.buffer || {});
        this._requests = new RequestsManager(this, this.events, this._options?.requests || {});
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
    * Handles incoming messages
    * @param {string|ArrayBuffer|Uint8Array} message Raw message data
    */
    handleMessage(message) {
        console.log('HANDLING MESSAGE:', message);
        handleMessage(this, message)
    }
    
    /**
    * 
    * @param {Object|string|ArrayBuffer|Uint8Array} message Raw message data
    * @returns 
    */
    _send(message) {
        try {
            const content = typeof message === 'object' && !(message instanceof ArrayBuffer)
            ? JSON.stringify(message)
            : message;
            console.log('TRUE SENDING MESSAGE:', content);
            
            
            this._ws.send(content);
            this.events.emit('message:send:success', {
                starling: this,
                message,
                debug: {
                    type: 'message',
                    message: `Message sent: ${content}`
                }
            });
            return true;
        } catch (error) {
            this.events.events.emit('message:send:failed', {
                starling: this,
                error,
                debug: {
                    type: 'error',
                    message: `Failed to send message: ${error.message}`
                }
            });
        }
    }
    
    /**
    * Send a message (let the buffer handle)
    * @param {Object|string|ArrayBuffer|Uint8Array} message Raw message data
    * @returns {Promise<boolean>} Whether the message was sent
    */
    send(message) {
        console.log('SENDING MESSAGE:', message);
        return this._buffer.add(message);
    }
    
    /**
    * Send a notification
    * @param {string} topic
    * @param {*} data
    * @param {string} [requestId=null]
    * @param {import("../types/messages.d").NotificationOptions} [options] - Message options
    */
    notify(topic, data = null, requestId = null, options = {}) {
        this.send(createNotification(topic, data, { requestId }, options));
    }
    
    /**
    * @param {import('../types/protocol.d').method} method
    * @param {import('../types/protocol.d').payload} payload
    * @param {import('./request').RequestOptions} [options={}]
    */
    request = (method, payload, options = {}) => this._requests.execute(this, method, payload, options); 
    
    
    /**
    * Sends an error message
    * @param {string} code Error code
    * @param {string} message Error message
    * @param {Object} [details] Error details
    */
    sendError = (code, message, details = undefined) => {
        this.send(createApplicationError(code, message, details));
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