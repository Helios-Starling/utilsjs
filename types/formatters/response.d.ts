/**
* Creates a success response
* @param {import("../types/protocol.d").requestId} requestId - Original request ID
* @param {*} [data] - Response data
* @param {import("../types/messages.d").MessageOptions} [options] - Response options
* @returns {import("../types/messages.d").ResponseMessage} Formatted success response
*/
export function createSuccessResponse(requestId: import("../types/protocol.d").requestId, data?: any, options?: import("../types/messages.d").MessageOptions): import("../types/messages.d").ResponseMessage;
/**
* Creates an error response
* @param {import("../types/protocol.d").requestId} requestId - Original request ID
* @param {import("../types/protocol.d").errorCode} code - Error code
* @param {import("../types/protocol.d").errorMessage} message - Error message
* @param {*} [details] - Optional error details
* @param {import("../types/messages.d").MessageOptions} [options] - Response options
* @returns {import("../types/messages.d").ResponseMessage} Formatted error response
*/
export function createErrorResponse(requestId: import("../types/protocol.d").requestId, code: import("../types/protocol.d").errorCode, message: import("../types/protocol.d").errorMessage, details?: any, options?: import("../types/messages.d").MessageOptions): import("../types/messages.d").ResponseMessage;
