import { resolve, createProtocolError, createApplicationError, CommonErrors } from '@helios-starling/utils';
import { handleRequest } from './request';
import { handleResponse } from './response';
import { handleNotification } from './notification';

/**
* Main message handler that routes messages to appropriate sub-handlers
* @param {import('../core/starling').BaseStarling} starling Starling instance
* @param {string|ArrayBuffer|Uint8Array} rawMessage Raw message received
*/
export async function handleMessage(starling, rawMessage) {
    
    try {
        resolve(rawMessage, {
            maxMessageSize: starling._options.maxMessageSize
        })
        .onRequest(async request => {
            handleRequest(starling, request);
            
        })
        .onResponse(async response => {
            
            handleResponse(starling, response);
            
        })
        .onNotification(async notification => {
            
            handleNotification(starling, notification);
            
        })
        .onErrorMessage(error => {
            handleMessageError(starling, error);
            
        })
        .onText(text => {
            starling._events.emit('message:text', {
                starling: starling,
                size: text.length,
                message: text,
                debug: {
                    type: 'info',
                    message: `Received text message of ${text.length} chars`
                }
            });
        })
        .onJson(json => {
            starling._events.emit('message:json', {
                starling: starling,
                data: json,
                debug: {
                    type: 'info',
                    message: 'Received non-protocol JSON message'
                }
            });
        })
        .onBinary(data => {
            starling._events.emit('message:binary', {
                starling: starling,
                size: data.byteLength,
                data,
                debug: {
                    type: 'info',
                    message: `Received binary message of ${data.byteLength} bytes`
                }
            });
        })
        .onViolation(violations => {
            handleProtocolError(starling, violations);
        });
        
    } catch (error) {
        handleInternalError(starling, error);
    }
    
}


/**
* Handles protocol error messages
* @private
*/
function handleProtocolError(starling, violations) {
    starling._events.emit('message:protocol_error', {
        starling: starling,
        violations,
        debug: {
            type: 'error',
            message: `Protocol error: ${violations.length} violations`
        }
    });
    
    // Send error response to client
    starling.send(createProtocolError(CommonErrors.PROTOCOL_VIOLATION, 'Message processing failed', { violations }));
}


export function handleInternalError(starling, error) {
    
    starling._events.emit('message:internal_error', {
        starling: starling,
        error,
        debug: {
            type: 'error',
            message: `Internal error: ${error.message || 'Unknown error'}`
        }
    });
    
    // Send error response to client
    starling.send(createApplicationError(CommonErrors.INTERNAL_ERROR, 'Internal error handling message'));
}

/**
 * Handles message processing errors
 * @param {import('../core/starling').BaseStarling} starling Starling instance
 * @param {Error|Object} error Error object
 */
export function handleMessageError(starling, error) {
    // Don't emit error for buffered messages
    if (error.code === 'MESSAGE_BUFFERED') {
      starling._events.emit('message:buffered', {
        starling: starling,
        error: error.details.original,
        debug: {
          type: 'info',
          message: `Message buffered: ${error.details.original.message}`
        }
      });
      return;
    }
  
    // Emit error event
    starling._events.emit('message:error', {
      starling: starling,
      error,
      debug: {
        type: 'error',
        message: `Message handling error: ${error.message || 'Unknown error'}`
      }
    });
  }