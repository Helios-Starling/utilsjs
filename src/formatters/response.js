import { MessageType } from "../constants/protocol";  
import { createBaseMessage } from "./base";


/**
* Creates a success response
* @param {import("../types/protocol.d").requestId} requestId - Original request ID
* @param {*} [data] - Response data
* @param {import("../types/messages.d").MessageOptions} [options] - Response options
* @returns {import("../types/messages.d").ResponseMessage} Formatted success response
*/
export function createSuccessResponse(requestId, data = undefined, options = {}) {
  return {
    ...createBaseMessage(options),
    type: MessageType.RESPONSE,
    requestId,
    success: true,
    ...(data !== undefined && { data })
  };
}

/**
* Creates an error response
* @param {import("../types/protocol.d").requestId} requestId - Original request ID
* @param {import("../types/protocol.d").errorCode} code - Error code
* @param {import("../types/protocol.d").errorMessage} message - Error message
* @param {*} [details] - Optional error details
* @param {import("../types/messages.d").MessageOptions} [options] - Response options
* @returns {import("../types/messages.d").ResponseMessage} Formatted error response
*/
export function createErrorResponse(requestId, code, message, details = undefined, options = {}) {
  return {
    ...createBaseMessage(options),
    type: MessageType.RESPONSE,
    requestId,
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined && details !== null && { details })  // On n'ajoute details que s'il n'est ni undefined ni null
    }
  };
}