/**
   * Request-specific error codes
   * @readonly
   * @enum {string}
   */
export const RequestErrorCode = {
    INVALID_REQUEST_ID: 'INVALID_REQUEST_ID',
    INVALID_METHOD: 'INVALID_METHOD',
    METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
    PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
    PAYLOAD_INVALID: 'PAYLOAD_INVALID'
  };


  /**
   * Standard error categories
   * @readonly
   * @enum {string}
   */
  export const ErrorCategory = {
   PROTOCOL: 'PROTOCOL',
   METHOD: 'METHOD',
   REQUEST: 'REQUEST',
   AUTH: 'AUTH',
   VALIDATION: 'VALIDATION',
   INTERNAL: 'INTERNAL'
 };
 
 /**
  * Common error codes
  * @readonly
  * @enum {string}
  */
 export const CommonErrors = {
   // Protocol errors
   INVALID_MESSAGE: 'PROTOCOL_INVALID_MESSAGE',
   VERSION_MISMATCH: 'PROTOCOL_VERSION_MISMATCH',
   
   // Method errors
   METHOD_NOT_FOUND: 'METHOD_NOT_FOUND',
   METHOD_ERROR: 'METHOD_ERROR',
   
   // Request errors
   INVALID_REQUEST: 'REQUEST_INVALID',
   REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
   
   // Auth errors
   UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
   FORBIDDEN: 'AUTH_FORBIDDEN',
   
   // Validation errors
   VALIDATION_ERROR: 'VALIDATION_ERROR',
   PROTOCOL_VIOLATION: 'PROTOCOL_VIOLATION',
   
   // Internal errors
   INTERNAL_ERROR: 'INTERNAL_ERROR'
 };