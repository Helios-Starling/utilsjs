/**
* @typedef {Object} MethodOptions
* @property {number} [timeout=30000] Execution timeout in ms
* @property {boolean} [internal=false] If it's an internal method
* @property {function} [validator] Payload validation function
* @property {Object} [metadata] Additional metadata
* @property {boolean} [private=false] Will not be listed if true when the client requests the list of methods
*/
/**
 * @typedef {function(import('./context').RequestContext): Promise<void>} MethodHandler Handler de la méthode
 */
export class Method {
    /**
    * @param {string} name Nom de la méthode
    * @param {function(import('./context').RequestContext): Promise<void>} handler Handler de la méthode
    * @param {MethodOptions} options Options de la méthode
    */
    constructor(name: string, handler: (arg0: import("./context").RequestContext) => Promise<void>, options?: MethodOptions);
    name: string;
    handler: (arg0: import("./context").RequestContext) => Promise<void>;
    /** @private */
    private _options;
    /** @private */
    private _metrics;
    /**
    * Exécute la méthode avec timeout
    * @param {import('../core/context').RequestContext} context Contexte de la requête
    * @returns {Promise<void>}
    */
    execute(context: import("../core/context").RequestContext): Promise<void>;
    /**
    * Récupère les métriques de la méthode
    * @returns {Object} Métriques de la méthode
    */
    getMetrics(): any;
}
export type MethodOptions = {
    /**
     * Execution timeout in ms
     */
    timeout?: number;
    /**
     * If it's an internal method
     */
    internal?: boolean;
    /**
     * Payload validation function
     */
    validator?: Function;
    /**
     * Additional metadata
     */
    metadata?: any;
    /**
     * Will not be listed if true when the client requests the list of methods
     */
    private?: boolean;
};
/**
 * Handler de la méthode
 */
export type MethodHandler = (arg0: import("./context").RequestContext) => Promise<void>;
