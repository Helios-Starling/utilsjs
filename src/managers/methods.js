import { Method } from "../core/method";
import { validateMethodName } from "../validators";
import { ReservedNamespaces } from "../constants";
import { parseMethod } from "../utils";

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
    constructor(events, builtInMethods) {
        
        /**
        * Map of registered methods
        * @type {Map<string, import('../core/method').Method>}
        * @private
        */
        this._methods = new Map();

        /**
        * Events manager
        */
        this._events = events;
        
        // Initialize built-in methods
        this._initializeBuiltInMethods(builtInMethods);
    }
    
    
    /**
    * Register a new method
    * @param {string} name Method name
    * @param {MethodHandler} handler Method handler
    * @param {import('../core/method').MethodOptions} [options={}] Method options
    */
    register = (name, handler, options = {}) => {
        // Validate method name unless it's internal
        if (!options.internal) {
            this._validateMethodName(name);
        }
        
        const method = new Method(name, handler, options);
        this._methods.set(name, method);
        
        
        this._events.emit('method:registered', {
            method,
            internal: options.internal,
            debug: {
                type: 'info',
                message: `Method ${name} registered`
            }
        });
    }
    
    
    /**
    * Gets a registered method
    * @param {string} name Method name
    * @returns {Method|undefined}
    */
    get = (name) => {
        return this._methods.get(name);
    }
    
    
    /**
    * Checks if a method exists
    * @param {string} name Method name
    * @returns {boolean}
    */
    has = (name) => {
        return this._methods.has(name);
    }
    
    /**
    * Unregisters a method
    * @param {string} name Method name
    * @returns {boolean} Whether the method was unregistered
    */
    unregister = (name) => {
        const removed = this._methods.delete(name);
        
        if (removed) {
            this._events.emit('method:unregistered', {
                method: name,
                debug: {
                    type: 'info',
                    message: `Method ${name} unregistered`
                }
            });
        }
        
        return removed;
    }
    
    /**
    * Gets all registered method names
    * @returns {string[]}
    */
    getAllMethodNames = () => {
        return Array.from(this._methods.keys());
    }
    
    
    /**
    * Gets methods by namespace
    * @param {string} namespace Namespace to filter by
    * @returns {Method[]}
    */
    getMethodsByNamespace = (namespace) => {
        return Array.from(this._methods.values())
        .filter(method => method.namespace === namespace);
    }
    

    /**
    * @private
    */
    _validateMethodName = (name) => {
        const validation = validateMethodName(name);
        if (!validation.valid) {
            throw new Error(`Invalid method name: ${validation.errors.join(', ')}`);
        }
        
        if (this._methods.has(name)) {
            throw new Error(`Method ${name} already exists`);
        }
    
        
        const { namespace } = parseMethod(name);    
        if (ReservedNamespaces.includes(namespace)) {
            throw new Error(`Namespace ${namespace} is reserved`);
        }
    }
    
    
    /**
    * @private
    */
    _initializeBuiltInMethods(builtInMethods) {        
        for (const [name, handler] of Object.entries(builtInMethods)) {
            this.register(name, handler, { internal: true, timeout: 5000 });
        }
    }
}