import { CommonErrors } from '../constants';

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
    constructor(name, handler, options = {}) {
        this.name = name;
        this.handler = handler;
        
        /** @private */
        this._options = {
            timeout: 5000,
            internal: false,
            validator: null,
            metadata: {},
            private: false,
            ...options
        };
        
        
        /** @private */
        this._metrics = {
            calls: 0,
            errors: 0,
            totalExecutionTime: 0,
            averageExecutionTime: 0,
            lastExecutionTime: 0,
            lastError: null,
            
        };
    }
    
    /**
    * Exécute la méthode avec timeout
    * @param {import('../core/context').RequestContext} context Contexte de la requête
    * @returns {Promise<void>}
    */
    async execute(context) {
        const start = performance.now();
        this._metrics.calls++;
        this._metrics.lastCall = Date.now();
        
        try {
            // Valider le payload si un validateur est défini
            if (this._options.validator) {
                const validation = this._options.validator(context.payload);
                if (!validation.valid) {
                    throw {
                        code: CommonErrors.VALIDATION_ERROR,
                        message: 'Invalid method payload',
                        details: { errors: validation.errors }
                    };
                }
            }
            
            await this.handler(context);
            
            if (!context.isProcessed) {
                context.error(
                    CommonErrors.METHOD_ERROR,
                    'Method handler did not provide a response'
                );
            }
        } catch (error) {
            this._metrics.errors++;
            this._metrics.lastError = {
                timestamp: Date.now(),
                error
            };
            if (error.code && error.message) {
                context.error(error.code, error.message, error.details);
            } else {
                context.error(
                    CommonErrors.METHOD_ERROR,
                    error.message || 'Method execution failed',
                    error
                );
            }
        } finally {
            const duration = performance.now() - start;
            this._metrics.totalExecutionTime += duration;
            this._metrics.lastExecutionTime = duration;
            this._metrics.averageExecutionTime = (this._metrics.averageExecutionTime + duration) / this._metrics.calls;
        }
    }
    
    /**
    * Récupère les métriques de la méthode
    * @returns {Object} Métriques de la méthode
    */
    getMetrics() {
        return {
            ...this._metrics,
            averageExecutionTime: this._metrics.calls > 0 
            ? this._metrics.totalExecutionTime / this._metrics.calls 
            : 0
        };
    }
}