/**
* Common error codes
* @readonly
*/
export const CommonErrors = {
  // Protocol errors
  /** @type {import("../types/errors.d").ProtocolInvalidMessageError} */
  INVALID_MESSAGE: 'PROTOCOL_INVALID_MESSAGE',
  /** @type {import("../types/errors.d").ProtocolVersionMismatchError} */
  VERSION_MISMATCH: 'PROTOCOL_VERSION_MISMATCH',
  /** @type {import("../types/errors.d").ProtocolViolationError} */
  PROTOCOL_VIOLATION: 'PROTOCOL_VIOLATION',
  
  // Method errors
  /** @type {import("../types/errors.d").MethodNotFoundError} */
  METHOD_NOT_FOUND: 'METHOD_NOT_FOUND',
  /** @type {import("../types/errors.d").MethodError} */
  METHOD_ERROR: 'METHOD_ERROR',
  
  // Request errors
  /** @type {import("../types/errors.d").RequestInvalidError} */
  INVALID_REQUEST: 'REQUEST_INVALID',
  /** @type {import("../types/errors.d").RequestTimeoutError} */
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
  
  // Validation errors
  /** @type {import("../types/errors.d").ValidationError} */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // Internal errors
  /** @type {import("../types/errors.d").InternalError} */
  INTERNAL_ERROR: 'INTERNAL_ERROR',

  // Proxy errors
  /** @type {import("../types/errors.d").ProxyForbiddenError} */
  PROXY_FORBIDDEN: 'PROXY_FORBIDDEN',
  /** @type {import("../types/errors.d").ProxyTimeoutError} */
  PROXY_TIMEOUT: 'PROXY_TIMEOUT',
  /** @type {import("../types/errors.d").ProxyError} */
  PROXY_ERROR: 'PROXY_ERROR'
  
};