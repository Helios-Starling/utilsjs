import { MessageType, ErrorSeverity } from '../constants/protocol.js';
import { createBaseMessage } from './base.js';

/**
 * Creates a protocol-level error message
 * @param {string} code Error code
 * @param {string} message Error message
 * @param {Object} [details] Additional error details
 * @param {Object} [options] Message options
 * @returns {Object} Protocol error message
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
 * @param {string} code Error code
 * @param {string} message Error message
 * @param {Object} [details] Additional error details
 * @param {Object} [options] Message options
 * @returns {Object} Application error message
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