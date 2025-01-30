/**
 * Handle Response for Outbound Requests
 * @param {import('../core/starling').BaseStarling} starling Starling instance
 * @param {import('../core').ResponseContext} context Response message
 */
export const handleResponse = async (starling, context) => {
    /**
     * @type {import('../managers/requests').RequestsManager}
     */
    const requests = starling?._helios?._requests || starling?._requests;
    const events = starling?._events;

    
    try {
        requests.handleResponse(starling, context);
        events.emit('response:received', {
            starling: starling,
            requestId: context.requestId,
            success: context.success,
            debug: {
                type: context.success ? 'info' : 'warning',
                message: `Received ${context.success ? 'successful' : 'failed'} response for request ${context.requestId}`
            }
        });
    } catch (error) {
        handleResponseError(starling, context, error);
    }
    
};


/**
 * Handles response processing errors
 * @param {import('../core/starling').Starling} starling Starling instance
 * @param {import('../core').ResponseContext} context Original response message
 * @param {Error|Object} error Error object
 * @private
 */
function handleResponseError(starling, context, error) {
    starling._events.emit('response:error', {
      starling: starling,
      requestId: context.requestId,
      error,
      debug: {
        type: 'error',
        message: `Response processing error for request ${context.requestId}: ${error.message || 'Unknown error'}`
      }
    });
  }