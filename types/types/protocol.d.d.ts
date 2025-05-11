declare const _default: {};
export default _default;
/**
 * Unix timestamp
 */
export type Timestamp = number;
/**
 * Name of the protocol
 */
export type ProtocolName = "helios-starling";
/**
 * Version of the protocol
 */
export type ProtocolVersion = string;
/**
 * "request" message type
 */
export type RequestType = "request";
/**
 * "response" message type
 */
export type ResponseType = "response";
/**
 * "notification" message type
 */
export type NotificationType = "notification";
/**
 * "error" message type
 */
export type ErrorType = "error";
/**
 * "ack" message type
 */
export type AckType = "ack";
/**
 * "ping" message type
 */
export type PingType = "ping";
export type MessageType = RequestType | ResponseType | NotificationType | ErrorType | AckType | PingType;
/**
 * Protocol validation level
 */
export type ProtocolLevel = "protocol";
/**
 * Message validation level
 */
export type MessageLevel = "message";
export type ValidationLevel = ProtocolLevel | MessageLevel;
/**
 * Protocol error severity
 */
export type ProtocolErrorSeverity = "protocol";
/**
 * Application error severity
 */
export type ApplicationErrorSeverity = "application";
export type ErrorSeverity = ProtocolErrorSeverity | ApplicationErrorSeverity;
/**
 * System namespace
 */
export type SystemNamespace = "system";
/**
 * Internal namespace
 */
export type InternalNamespace = "internal";
/**
 * Helios namespace
 */
export type HeliosNamespace = "helios";
/**
 * Starling namespace
 */
export type StarlingNamespace = "starling";
/**
 * Methods & Notifications reserved namespaces
 */
export type ReservedNamespace = SystemNamespace | InternalNamespace | HeliosNamespace | StarlingNamespace;
/**
 * Request identifier
 */
export type requestId = string;
/**
 * Request payload
 */
export type payload = any;
/**
 * Method name
 */
export type method = string;
export type Notification = {
    /**
     * - Notification topic
     */
    topic: string;
    /**
     * - Optional notification data
     */
    data?: any;
};
/**
 * Error code
 */
export type errorCode = string;
/**
 * Error message
 */
export type errorMessage = string;
/**
 * Optional error details
 */
export type errorDetails = any;
export type Error = {
    /**
     * - Error code
     */
    code: errorCode;
    /**
     * - Error message
     */
    message: errorMessage;
    /**
     * - Optional error details
     */
    details?: errorDetails;
    /**
     * - Error severity
     */
    severity: ErrorSeverity;
};
