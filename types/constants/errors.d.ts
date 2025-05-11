export namespace CommonErrors {
    let INVALID_MESSAGE: import("../types/errors.d").ProtocolInvalidMessageError;
    let VERSION_MISMATCH: import("../types/errors.d").ProtocolVersionMismatchError;
    let PROTOCOL_VIOLATION: import("../types/errors.d").ProtocolViolationError;
    let METHOD_NOT_FOUND: import("../types/errors.d").MethodNotFoundError;
    let METHOD_ERROR: import("../types/errors.d").MethodError;
    let INVALID_REQUEST: import("../types/errors.d").RequestInvalidError;
    let REQUEST_TIMEOUT: import("../types/errors.d").RequestTimeoutError;
    let VALIDATION_ERROR: import("../types/errors.d").ValidationError;
    let INTERNAL_ERROR: import("../types/errors.d").InternalError;
    let PROXY_FORBIDDEN: import("../types/errors.d").ProxyForbiddenError;
    let PROXY_TIMEOUT: import("../types/errors.d").ProxyTimeoutError;
    let PROXY_ERROR: import("../types/errors.d").ProxyError;
}
