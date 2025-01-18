/**
 * Handle Response for Outbound Requests
 * @param {import('../core/starling').BaseStarling} starling Starling instance
 * @param {import('../validators/response').ResponseMessage} response Response message
 */
export const handleResponse = async (starling, response) => {
    /**
     * @type {import('../managers/requests').RequestsManager}
     */
    const requests = starling?._helios?._requests || starling?._requests;
    const events = starling?._events;

    
    try {
        requests.handleResponse(starling, response);
        
        events.emit('response:received', {
            starling: starling,
            requestId: response.requestId,
            success: response.success,
            debug: {
                type: response.success ? 'info' : 'warning',
                message: `Received ${response.success ? 'successful' : 'failed'} response for request ${response.requestId}`
            }
        });
    } catch (error) {
        handleResponseError(starling, response, error);
    }
    
};


/**
 * Handles response processing errors
 * @param {import('../core/starling').Starling} starling Starling instance
 * @param {Object} message Original response message
 * @param {Error|Object} error Error object
 * @private
 */
function handleResponseError(starling, message, error) {
    starling._events.emit('response:error', {
      starling: starling,
      requestId: message.requestId,
      error,
      debug: {
        type: 'error',
        message: `Response processing error for request ${message.requestId}: ${error.message || 'Unknown error'}`
      }
    });
  }