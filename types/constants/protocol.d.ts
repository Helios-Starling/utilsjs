export type MessageType = RequestType | ResponseType | NotificationType | ErrorType | AckType | PingType;
export namespace MessageType {
    let REQUEST: RequestType;
    let RESPONSE: ResponseType;
    let NOTIFICATION: NotificationType;
    let ERROR: ErrorType;
    let ACK: AckType;
    let PING: PingType;
    /** @returns {string[]} Array of all valid message types */
    function values(): string[];
    /**
    * Checks if a value is a valid message type
    * @param {string} value - Value to check
    * @returns {boolean} Whether the value is a valid message type
    */
    function isValid(value: string): boolean;
}
export type ValidationLevel = ProtocolLevel | MessageLevel;
export namespace ValidationLevel {
    let PROTOCOL: ProtocolLevel;
    let MESSAGE: MessageLevel;
}
export type ErrorSeverity = ProtocolErrorSeverity | ApplicationErrorSeverity;
export namespace ErrorSeverity {
    let PROTOCOL_1: ProtocolErrorSeverity;
    export { PROTOCOL_1 as PROTOCOL };
    export let APPLICATION: ApplicationErrorSeverity;
}
export namespace Protocol {
    let NAME: ProtocolName;
    let CURRENT_VERSION: ProtocolVersion;
    let MIN_VERSION: ProtocolVersion;
    let DEFAULT_BUFFER_SIZE: number;
    let DEFAULT_TIMEOUT: number;
}
export namespace Patterns {
    let VERSION: RegExp;
    let METHOD_NAME: RegExp;
    let TOPIC_NAME: RegExp;
    let UUID: RegExp;
}
/**
 * Reserved namespaces that cannot be used in method names
 */
export type ReservedNamespaces = string[];
/**
* Reserved namespaces that cannot be used in method names
* @readonly
* @enum {string[]}
*/
export const ReservedNamespaces: string[];
/**
 * Message size limits in bytes
 */
export type SizeLimits = number;
export namespace SizeLimits {
    let MAX_MESSAGE_SIZE: number;
    let MAX_METHOD_NAME: number;
    let MAX_ERROR_MESSAGE: number;
    let MAX_TOPIC_NAME: number;
}
/**
* Validation options
* @typedef {Object} ValidationOptions
* @property {boolean} [strict=false] - Whether to perform strict validation
* @property {boolean} [allowExtraFields=true] - Whether to allow extra fields
* @property {number} [maxSize] - Maximum message size in bytes
*/
/**
* Default validation options
* @type {ValidationOptions}
*/
export const DefaultValidationOptions: ValidationOptions;
/**
 * Time-related constants in milliseconds
 */
export type TimeConstants = number;
export namespace TimeConstants {
    let MIN_TIMESTAMP: number;
    let MAX_REQUEST_TIMEOUT: number;
    let DEFAULT_REQUEST_TIMEOUT: number;
    let MIN_REQUEST_TIMEOUT: number;
    let RECONNECT_MIN_DELAY: number;
    let RECONNECT_MAX_DELAY: number;
}
export type RequestType = "request";
export type ResponseType = "response";
export type NotificationType = "notification";
export type ErrorType = "error";
export type AckType = "ack";
export type PingType = "ping";
export type ProtocolLevel = "protocol";
export type MessageLevel = "message";
export type ProtocolErrorSeverity = "protocol";
export type ApplicationErrorSeverity = "application";
export type ProtocolName = "helios-starling";
export type ProtocolVersion = string;
/**
 * Validation options
 */
export type ValidationOptions = {
    /**
     * - Whether to perform strict validation
     */
    strict?: boolean;
    /**
     * - Whether to allow extra fields
     */
    allowExtraFields?: boolean;
    /**
     * - Maximum message size in bytes
     */
    maxSize?: number;
};
