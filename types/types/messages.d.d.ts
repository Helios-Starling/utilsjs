declare const _default: {};
export default _default;
/**
 * - Peer configuration
 */
export type PeerConfiguration = boolean | any;
export type MessageOptions = {
    /**
     * Peer configuration
     */
    peer?: PeerConfiguration;
};
export type BaseMessage = {
    /**
     * - Protocol name
     */
    protocol: import("./protocol.d").ProtocolName;
    /**
     * - Protocol version
     */
    version: import("./protocol.d").ProtocolVersion;
    /**
     * - Unix timestamp in milliseconds
     */
    timestamp: import("./protocol.d").Timestamp;
    /**
     * - Message type
     */
    type: import("./protocol.d").MessageType;
    /**
     * - Peer configuration
     */
    peer?: PeerConfiguration;
};
export type RequestOptions = MessageOptions & {
    requestId: import("./protocol.d").requestId;
};
export type RequestMessage = BaseMessage & {
    type: import("./protocol.d").RequestType;
    requestId: import("./protocol.d").requestId;
    method: import("./protocol.d").method;
    payload?: import("./protocol.d").payload;
};
export type ResponseMessage = BaseMessage & {
    type: import("./protocol.d").ResponseType;
    requestId: import("./protocol.d").requestId;
    success: boolean;
    data?: any;
    error?: ResponseError;
};
export type ResponseError = {
    /**
     * - Error code
     */
    code: string;
    /**
     * - Error message
     */
    message: string;
    /**
     * - Optional error details
     */
    details?: any;
};
export type NotificationOptions = MessageOptions & {
    requestId?: import("./protocol.d").requestId;
};
export type NotificationMessage = BaseMessage & {
    type: import("./protocol.d").NotificationType;
    requestId?: import("./protocol.d").requestId;
    notification: import("./protocol.d").Notification;
};
export type ErrorMessage = BaseMessage & {
    type: import("./protocol.d").ErrorType;
    error: import("./protocol.d").Error;
};
export type ProtocolErrorMessage = ErrorMessage & {
    error: {
        severity: import("./protocol.d").ProtocolErrorSeverity;
    };
};
export type ApplicationErrorMessage = ErrorMessage & {
    error: {
        severity: import("./protocol.d").ApplicationErrorSeverity;
    };
};
