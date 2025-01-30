"use strict";

/**
* @typedef {"PROTOCOL_INVALID_MESSAGE"} ProtocolInvalidMessageError
* @typedef {"PROTOCOL_VERSION_MISMATCH"} ProtocolVersionMismatchError
* @typedef {"PROTOCOL_VIOLATION"} ProtocolViolationError
* @typedef {ProtocolInvalidMessageError | ProtocolVersionMismatchError | ProtocolViolationError} ProtocolError
* 
* @typedef {"METHOD_NOT_FOUND"} MethodNotFoundError
* @typedef {"METHOD_ERROR"} MethodError
* @typedef {MethodNotFoundError | MethodError} MethodError
* 
* @typedef {"REQUEST_INVALID"} RequestInvalidError
* @typedef {"REQUEST_TIMEOUT"} RequestTimeoutError
* @typedef {RequestInvalidError | RequestTimeoutError} RequestError
* 
* 
* @typedef {"VALIDATION_ERROR"} ValidationError
* 
* @typedef {"INTERNAL_ERROR"} InternalError
* 
* 
* @typedef {"PROXY_FORBIDDEN"} ProxyForbiddenError
* @typedef {"PROXY_TIMEOUT"} ProxyTimeoutError
* @typedef {"PROXY_ERROR"} ProxyError
* @typedef {ProxyForbiddenError | ProxyTimeoutError | ProxyError} ProxyError
* 
* @typedef {ProtocolError | MethodError | RequestError | ValidationError | InternalError | ProxyError} CommonError
*/

export default {};