/**
* @callback MethodHandler
* @param {import('../core/context').RequestContext} Request execution context
* @returns {Promise<void>}
*/
/**
 * @typedef {Object<string, import('../core/method').MethodHandler>} builtInMethods
 */
export class MethodsManager {
    /**
    * @param {import('../core/events').Events} events Events manager (binding to Helios for server, Starling for client)
    * @param {builtInMethods} builtInMethods Built-in methods
    */
    constructor(events: import("../core/events").Events, builtInMethods: builtInMethods);
    /**
    * Map of registered methods
    * @type {Map<string, import('../core/method').Method>}
    * @private
    */
    private _methods;
    /**
    * Events manager
    */
    _events: import("../core/events").Events;
    /**
    * Register a new method
    * @param {string} name Method name
    * @param {MethodHandler} handler Method handler
    * @param {import('../core/method').MethodOptions} [options={}] Method options
    */
    register: (name: string, handler: MethodHandler, options?: import("../core/method").MethodOptions) => void;
    /**
    * Gets a registered method
    * @param {string} name Method name
    * @returns {Method|undefined}
    */
    get: (name: string) => Method | undefined;
    /**
    * Checks if a method exists
    * @param {string} name Method name
    * @returns {boolean}
    */
    has: (name: string) => boolean;
    /**
    * Unregisters a method
    * @param {string} name Method name
    * @returns {boolean} Whether the method was unregistered
    */
    unregister: (name: string) => boolean;
    /**
    * Gets all registered method names
    * @returns {string[]}
    */
    getAllMethodNames: () => string[];
    /**
    * Gets methods by namespace
    * @param {string} namespace Namespace to filter by
    * @returns {Method[]}
    */
    getMethodsByNamespace: (namespace: string) => Method[];
    /**
    * @private
    */
    private _validateMethodName;
    /**
    * @private
    */
    private _initializeBuiltInMethods;
}
export type MethodHandler = (Request: import("../core/context").RequestContext) => Promise<void>;
export type builtInMethods = {
    [x: string]: import("../core/method").MethodHandler;
};
import { Method } from "../core/method";
