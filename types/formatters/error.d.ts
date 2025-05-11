/**
 * Creates a protocol-level error message
 * @param {import('../types/protocol.d.js').errorCode} code Error code
 * @param {import('../types/protocol.d.js').errorMessage} message Error message
 * @param {import('../types/protocol.d.js').errorDetails} [details] Additional error details
 * @param {import('../types/messages.d.js').MessageOptions} [options] Message options
 * @returns {import('../types/messages.d.js').ProtocolErrorMessage} Protocol error message
 */
export function createProtocolError(code: import("../types/protocol.d.js").errorCode, message: import("../types/protocol.d.js").errorMessage, details?: import("../types/protocol.d.js").errorDetails, options?: import("../types/messages.d.js").MessageOptions): import("../types/messages.d.js").ProtocolErrorMessage;
/**
 * Creates an application-level error message
 * @param {import('../types/protocol.d.js').errorCode} code Error code
 * @param {import('../types/protocol.d.js').errorMessage} message Error message
 * @param {import('../types/protocol.d.js').errorMessage} [details] Additional error details
 * @param {import('../types/messages.d.js').MessageOptions} [options] Message options
 * @returns {import('../types/messages.d.js').ApplicationErrorMessage} Application error message
 */
export function createApplicationError(code: import("../types/protocol.d.js").errorCode, message: import("../types/protocol.d.js").errorMessage, details?: import("../types/protocol.d.js").errorMessage, options?: import("../types/messages.d.js").MessageOptions): import("../types/messages.d.js").ApplicationErrorMessage;
