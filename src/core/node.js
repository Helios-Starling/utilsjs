import { Protocol } from "../constants";
import { MethodsManager, TopicsManager } from "../managers";
import { getCurrentTimestamp } from "../utils";
import { BinaryMessageContext, ErrorMessageContext, JsonMessageContext, TextMessageContext } from "./context";
import { Events } from "./events";

/**
* @typedef {Object} NetworkNodeOptions
* @property {boolean} [debug=false] Enable debug mode
*/

/**
* @typedef {Object} ProxyHandlers
* @property {function(import('./context').RequestContext): Promise<void>} request Proxied request handler
* @property {function(import('./context').ResponseContext): Promise<void>} response Proxied response handler
* @property {function(import('./context').NotificationContext): Promise<void>} notification Proxied notification handler
* @property {function(import('./context').ErrorMessageContext): Promise<void>} errorMessage Proxied error message handler
*/

/**
* @typedef {Object} NetworkNodeConfig
* @property {import('../managers/methods').builtInMethods} builtInMethods Built-in methods
* @property {ProxyHandlers} proxyConfiguration Proxy handlers configuration
*/

/**
* Base class for network nodes (server/client)
* @abstract
*/
export class NetworkNode {
    
    /**
    * @param {NetworkNodeConfig} config Configuration
    * @param {NetworkNodeOptions} options Configuration options
    */
    constructor(config = {}, options = {}) {
        this._config = {
            builtInMethods: {},
            proxyConfiguration: {},
            ...config
        }
        
        /** @protected */
        this._events = new Events();
        
        /** @protected */
        this._topics = new TopicsManager(this._events);
        this._methods = new MethodsManager(this._events, config.builtInMethods || {});
        
        /** @type {symbol} */
        this._nodeId = Symbol('HeliosStarlingNode');
        
        if (options.debug) {
            this._events.use(event => {
                if (event.data.error) {
                    const { message, stack } = event.data.error;
                    (this.logger && this.logger.error?.(message, stack)) || console.error(`[ERROR] ${message}\n${stack}`);
                }
                if (event.data.debug) {
                    const { message, type = 'info' } = event.data.debug;
                    (this.logger && this.logger[type]?.(message)) || console.log(`[${type.toUpperCase()}] ${message}`);
                }
            })
        }
        console.log('NetworkNode constructor');
        
    }
    
    /**
    * @param {string} name
    * @param {import('../managers/methods').MethodHandler} handler
    * @param {import('./method').MethodOptions} [options]
    */
    method = (name, handler, options = {}) => this._methods.register(name, handler, options);
    
    /**
    * Listen on inbounding notifications
    * @param {string} topic
    * @param {function(import('./context').NotificationContext): Promise<void>} handler
    * @param {import('../managers/topics').TopicHandlerOptions} [options]
    */
    on = (topic, handler, options = {}) => this._topics.subscribe(topic, handler, options);
    
    
    /**
    * Listen on inbounding error messages (on protocol level)
    * @param {function(import('./context').ErrorMessageContext): Promise<void>} handler
    */
    onError = handler => this._events.on('message:error', event => {
        if (event.error && event.error instanceof ErrorMessageContext) {
            handler(event.error);
        } else if (event.error) {
            const context = new ErrorMessageContext(event.starling, event.error);
            handler(context);
        } else {
            handler(new ErrorMessageContext(event.starling, {
                error: new Error('Unknown error'),
                timestamp: getCurrentTimestamp()
            }));
        }
    });
    
    /**
    * Handles incoming text messages that are not part of the Helios-Starling protocol
    * @param {(context: import('./context').TextMessageContext) => void} callback
    */
    onText = callback => this._events.on('message:text', event => callback(new TextMessageContext(event.starling, event.message)));
    
    /**
    * Handles incoming JSON messages that are not part of the Helios-Starling protocol
    * @param {(context: import('./context').JsonMessageContext) => void} callback
    */
    onJson = callback => this._events.on('message:json', event => callback(new JsonMessageContext(event.starling, event.data)));
    
    /**
    * Handles incoming binary messages that are not part of the Helios-Starling protocol
    * @param {(context: import('./context').BinaryMessageContext) => void} callback
    */
    onBinary = callback => this._events.on('message:binary', event => callback(new BinaryMessageContext(event.starling, event.data)));
    
    get protocolInfo() {
        return {
            name: Protocol.NAME,
            version: Protocol.CURRENT_VERSION,
            timestamp: getCurrentTimestamp()
        }
    }
    
    get events() {
        return this._events;
    }
    
    get topics() {
        return this._topics;
    }
    
    get methods() {
        return this._methods;
    }
    
    get id() {
        return this._nodeId;
    }
    
    /**
    * @type {NetworkNodeConfig}
    */
    get config() {
        return this._config;
    }
    
}