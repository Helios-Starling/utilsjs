import { MessageType, ErrorSeverity } from '../constants/protocol.js';
import { createBaseMessage } from './base.js';

/**
 * Creates a protocol-level error message
 * @param {import('../types/protocol.d.js').errorCode} code Error code
 * @param {import('../types/protocol.d.js').errorMessage} message Error message
 * @param {import('../types/protocol.d.js').errorDetails} [details] Additional error details
 * @param {import('../types/messages.d.js').MessageOptions} [options] Message options
 * @returns {import('../types/messages.d.js').ProtocolErrorMessage} Protocol error message
 */
export function createProtocolError(code, message, details = undefined, options = {}) {
  return {
    ...createBaseMessage(options),
    type: MessageType.ERROR,
    error: {
      severity: ErrorSeverity.PROTOCOL,
      code,
      message,
      ...(details && { details })
    }
  };
}

/**
 * Creates an application-level error message
 * @param {import('../types/protocol.d.js').errorCode} code Error code
 * @param {import('../types/protocol.d.js').errorMessage} message Error message
 * @param {import('../types/protocol.d.js').errorMessage} [details] Additional error details
 * @param {import('../types/messages.d.js').MessageOptions} [options] Message options
 * @returns {import('../types/messages.d.js').ApplicationErrorMessage} Application error message
 */
export function createApplicationError(code, message, details = undefined, options = {}) {
  return {
    ...createBaseMessage(options),
    type: MessageType.ERROR,
    error: {
      severity: ErrorSeverity.APPLICATION,
      code,
      message,
      ...(details && { details })
    }
  };
}