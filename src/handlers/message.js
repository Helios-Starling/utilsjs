import { resolve, createProtocolError, createApplicationError, CommonErrors, ErrorMessageContext, RequestContext, ResponseContext, NotificationContext } from '@helios-starling/utils';
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
            const context = new RequestContext(starling, request.payload, {
                method: request.method,
                requestId: request.requestId,
                timestamp: request.timestamp,
                metadata: request.metadata,
                peer: request.peer || null
            });


            

            
            
            
            
            if (context.peer) {
                starling._networkNode?.config.proxyConfiguration.request(context);
                return;
            }
            
            handleRequest(starling, context);
        })
        .onResponse(async response => {
            const context = new ResponseContext(starling, {
                data: response.data || null,
                success: response.success || false,
                error: response.error || null,
            }, {
                ...(response.requestId ? { requestId: response.requestId } : {}),
                timestamp: response.timestamp,
                metadata: response.metadata,
                peer: response.peer || null
            });
            
            if (context.peer) {
                starling._networkNode?.config.proxyConfiguration.response(context);
                return;
            }
            
            handleResponse(starling, context);
        })
        .onNotification(async message => {
            
            const { topic, data, metadata = {} } = message.notification;
            
            const context = new NotificationContext(starling, {topic, data}, {
                timestamp: message.timestamp,
                metadata: metadata,
                ...(message.requestId ? {requestId: message.requestId} : {}),
                peer: message.peer || null
            });
            
            if (context.peer) {

                starling._networkNode?.config.proxyConfiguration.notification(context);
                return;
            }
            
            handleNotification(starling, context);
        })
        .onErrorMessage(error => {
            const context = new ErrorMessageContext(starling, error, {
                timestamp: error.timestamp,
                metadata: error.metadata,
                peer: error.peer || null,
            });
            
            if (context.peer) {

                starling._networkNode?.config.proxyConfiguration.errorMessage(context);
                return;
            }

            handleMessageError(starling, context);
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
* @param {import('../core').ErrorMessageContext} context Error object
*/
export function handleMessageError(starling, context) {
    // Don't emit error for buffered messages
    if (context.code === 'MESSAGE_BUFFERED') {
        starling._events.emit('message:buffered', {
            starling: starling,
            error: context,
            debug: {
                type: 'info',
                message: `Message buffered: ${context.message || 'Unknown error'}`
            }
        });
        return;
    }
    
    // Emit error event
    starling._events.emit('message:error', {
        starling: starling,
        error: context,
        debug: {
            type: 'error',
            message: `Message handling error: ${context.message || 'Unknown error'}`
        }
    });
}