import { CommonErrors } from '../constants';
import { RequestContext } from '../core/context';
import { Maestro } from '@killiandvcz/maestro';

/**
* Handle request message (INBOUND)
* @param {import('../core/starling').BaseStarling} starling Starling instance
* @param {import('../validators/request').RequestMessage} request Request message
*/
export const handleRequest = async (starling, request) => {
    /**
    * @type {import('../managers/methods').MethodsManager}
    */
    const methods = starling?._helios?._methods || starling?._methods;
    const events = starling?._events;
    
    const method = methods.get(request.method);
    if (!method) {
        throw {
            code: CommonErrors.METHOD_NOT_FOUND,
            message: `Method ${request.method} not found`
        };
    }
    
    const context = new RequestContext(starling, request.payload, {
        requestId: request.requestId,
        timestamp: request.timestamp,
        metadata: request.metadata
    });
    
    /**
    * @type {import('@killiandvcz/maestro').Timer}
    */
    let timer;
    try {
        await Promise.race([
            method.execute(context),
            new Promise((_, reject) => {
                timer = Maestro.timer(() => {
                    if (!context.isProcessed) {
                        try {
                            context.error(
                                CommonErrors.REQUEST_TIMEOUT,
                                `Method execution timed out after ${method?.options?.timeout || 30000}ms`
                            );
                        } catch (err) {
                            events.emit('request:error', {
                                starling: starling,
                                request: context,
                                requestId: context.requestId,
                                method,
                                error: err,
                                debug: {
                                    type: 'error',
                                    message: `Timeout error handling failed: ${err.message}`
                                }
                            });
                        }
                    }
                    reject(new Error('Timeout'));
                    
                }, {delay: method?.options?.timeout || 30000}).link(starling.timers)
            })
        ]).finally(() => {
            timer?.clear();
        });
        
        if (!context.isProcessed) {
            context.error(
                CommonErrors.METHOD_ERROR,
                'Method did not provide a response'
            );
        }
    } catch (error) {
        if (!context.isProcessed) {
            handleRequestError(context, error);
          }
    }
    
    
};



/**
 * Handles request processing errors
 * @param {RequestContext} context Request context
 * @param {Error|Object} error Error object
 * @private
 */
function handleRequestError(context, error) {
    const { starling } = context;
  
    // Emit error event
    starling._events.emit('request:error', {
      starling: starling,
      request: context,
      requestId: context.requestId,
      error,
      debug: {
        type: 'error',
        message: `Request ${context.requestId} failed: ${error.message || 'Unknown error'}`
      }
    });
  
    // Send error response through context
    context.error(
      error.code || CommonErrors.METHOD_ERROR,
      error.message || 'Method execution failed',
      error.details
    );
  }