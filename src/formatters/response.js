import { MessageType } from "../constants/protocol";  
  
  /**
   * Creates a success response
   * @param {string} requestId - Original request ID
   * @param {*} [data] - Response data
   * @param {Object} [options] - Response options
   * @param {string} [options.version] - Protocol version
   * @returns {ResponseMessage} Formatted success response
   */
  export function createSuccessResponse(requestId, data = undefined, options = {}) {
    return {
      protocol: 'helios-starling',
      version: options.version || '1.0.0',
      timestamp: Date.now(),
      type: MessageType.RESPONSE,
      requestId,
      success: true,
      ...(data !== undefined && { data })
    };
  }
  
  /**
   * Creates an error response
   * @param {string} requestId - Original request ID
   * @param {string} code - Error code
   * @param {string} message - Error message
   * @param {*} [details] - Optional error details
   * @param {Object} [options] - Response options
   * @param {string} [options.version] - Protocol version
   * @returns {ResponseMessage} Formatted error response
   */
  export function createErrorResponse(requestId, code, message, details = undefined, options = {}) {
    return {
      protocol: 'helios-starling',
      version: options.version || '1.0.0',
      timestamp: Date.now(),
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