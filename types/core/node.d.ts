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
    constructor(config?: NetworkNodeConfig, options?: NetworkNodeOptions);
    _config: {
        /**
         * Built-in methods
         */
        builtInMethods: import("../managers/methods").builtInMethods;
        /**
         * Proxy handlers configuration
         */
        proxyConfiguration: ProxyHandlers;
    };
    /** @protected */
    protected _events: Events;
    /** @protected */
    protected _topics: TopicsManager;
    _methods: MethodsManager;
    /** @type {symbol} */
    _nodeId: symbol;
    /**
    * @param {string} name
    * @param {import('../managers/methods').MethodHandler} handler
    * @param {import('./method').MethodOptions} [options]
    */
    method: (name: string, handler: import("../managers/methods").MethodHandler, options?: import("./method").MethodOptions) => void;
    /**
    * Listen on inbounding notifications
    * @param {string} topic
    * @param {function(import('./context').NotificationContext): Promise<void>} handler
    * @param {import('../managers/topics').TopicHandlerOptions} [options]
    */
    on: (topic: string, handler: (arg0: import("./context").NotificationContext) => Promise<void>, options?: import("../managers/topics").TopicHandlerOptions) => import("../managers").SubscriptionResult;
    /**
    * Listen on inbounding error messages (on protocol level)
    * @param {function(import('./context').ErrorMessageContext): Promise<void>} handler
    */
    onError: (handler: (arg0: import("./context").ErrorMessageContext) => Promise<void>) => any;
    /**
    * Handles incoming text messages that are not part of the Helios-Starling protocol
    * @param {(context: import('./context').TextMessageContext) => void} callback
    */
    onText: (callback: (context: import("./context").TextMessageContext) => void) => any;
    /**
    * Handles incoming JSON messages that are not part of the Helios-Starling protocol
    * @param {(context: import('./context').JsonMessageContext) => void} callback
    */
    onJson: (callback: (context: import("./context").JsonMessageContext) => void) => any;
    /**
    * Handles incoming binary messages that are not part of the Helios-Starling protocol
    * @param {(context: import('./context').BinaryMessageContext) => void} callback
    */
    onBinary: (callback: (context: import("./context").BinaryMessageContext) => void) => any;
    get protocolInfo(): {
        name: "helios-starling";
        version: string;
        timestamp: number;
    };
    get events(): Events;
    get topics(): TopicsManager;
    get methods(): MethodsManager;
    get id(): symbol;
    /**
    * @type {NetworkNodeConfig}
    */
    get config(): NetworkNodeConfig;
}
export type NetworkNodeOptions = {
    /**
     * Enable debug mode
     */
    debug?: boolean;
};
export type ProxyHandlers = {
    /**
     * Proxied request handler
     */
    request: (arg0: import("./context").RequestContext) => Promise<void>;
    /**
     * Proxied response handler
     */
    response: (arg0: import("./context").ResponseContext) => Promise<void>;
    /**
     * Proxied notification handler
     */
    notification: (arg0: import("./context").NotificationContext) => Promise<void>;
    /**
     * Proxied error message handler
     */
    errorMessage: (arg0: import("./context").ErrorMessageContext) => Promise<void>;
};
export type NetworkNodeConfig = {
    /**
     * Built-in methods
     */
    builtInMethods: import("../managers/methods").builtInMethods;
    /**
     * Proxy handlers configuration
     */
    proxyConfiguration: ProxyHandlers;
};
import { Events } from "./events";
import { TopicsManager } from "../managers";
import { MethodsManager } from "../managers";
