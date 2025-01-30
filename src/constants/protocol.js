/**
* @typedef {"request"} RequestType
* @typedef {"response"} ResponseType
* @typedef {"notification"} NotificationType
* @typedef {"error"} ErrorType
* @typedef {"ack"} AckType
* @typedef {"ping"} PingType
* @typedef {RequestType|ResponseType|NotificationType|ErrorType|AckType|PingType} MessageType
*/

/**
* Message types enum
* @readonly
*/
export const MessageType = {
  /** @type {RequestType"} */
  REQUEST: 'request',
  /** @type {ResponseType"} */
  RESPONSE: 'response',
  /** @type {NotificationType"} */
  NOTIFICATION: 'notification',
  /** @type {ErrorType"} */
  ERROR: 'error',
  /** @type {AckType"} */
  ACK: 'ack',
  /** @type {PingType"} */
  PING: 'ping',
  
  /** @returns {string[]} Array of all valid message types */
  values() {
    return Object.values(this).filter(v => typeof v === 'string');
  },
  
  /** 
  * Checks if a value is a valid message type
  * @param {string} value - Value to check
  * @returns {boolean} Whether the value is a valid message type
  */
  isValid(value) {
    return this.values().includes(value);
  }
};


/**
 * @typedef {"protocol"} ProtocolLevel
 * @typedef {"message"} MessageLevel
 * @typedef {ProtocolLevel|MessageLevel} ValidationLevel
 */


/**
* Message validation levels
* @readonly
*/
export const ValidationLevel = {
  /** @type {ProtocolLevel} */
  PROTOCOL: 'protocol',
  /** @type {MessageLevel} */
  MESSAGE: 'message'
};


/**
* @typedef {"protocol"} ProtocolErrorSeverity
* @typedef {"application"} ApplicationErrorSeverity
* @typedef {ProtocolErrorSeverity|ApplicationErrorSeverity} ErrorSeverity
*/

/**
* Error severity levels
* @readonly
*/
export const ErrorSeverity = {
  /** @type {ProtocolErrorSeverity} */
  PROTOCOL: 'protocol',
  /** @type {ApplicationErrorSeverity} */
  APPLICATION: 'application'
};


/**
 * @typedef {"helios-starling"} ProtocolName
 * @typedef {String} ProtocolVersion
 */


/**
* Protocol constants
* @readonly
*/
export const Protocol = {
  /** @type {ProtocolName} */
  NAME: 'helios-starling',
  /** @type {ProtocolVersion} */
  CURRENT_VERSION: '1.0.0',
  /** @type {ProtocolVersion} */
  MIN_VERSION: '1.0.0',
  DEFAULT_BUFFER_SIZE: 1000,
  DEFAULT_TIMEOUT: 30000,
};

/**
* Regular expressions used in validation
* @readonly
*/
export const Patterns = {
  /** Matches semantic version format (x.y.z) */
  VERSION: /^\d+\.\d+\.\d+$/,
  
  /** Matches valid method names (namespace:action) */
  METHOD_NAME: /^[a-zA-Z][a-zA-Z0-9_]*(?::[a-zA-Z][a-zA-Z0-9_]*)+$/,
  
  /** Matches valid topic names */
  TOPIC_NAME: /^[a-zA-Z][a-zA-Z0-9_]*(?::[a-zA-Z][a-zA-Z0-9_]*)*$/,
  
  /** Matches UUID format */
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
};

/**
* Reserved namespaces that cannot be used in method names
* @readonly
* @enum {string[]}
*/
export const ReservedNamespaces = [
  'system',
  'internal',
  'stream',
  'helios'
];

/**
* Message size limits in bytes
* @readonly
* @enum {number}
*/
export const SizeLimits = {
  MAX_MESSAGE_SIZE: 1024 * 1024,    // 1MB
  MAX_METHOD_NAME: 128,
  MAX_ERROR_MESSAGE: 1024,
  MAX_TOPIC_NAME: 128
};

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
export const DefaultValidationOptions = {
  strict: false,
  allowExtraFields: true,
  maxSize: SizeLimits.MAX_MESSAGE_SIZE
};

/**
* Time-related constants in milliseconds
* @readonly
* @enum {number}
*/
export const TimeConstants = {
  MIN_TIMESTAMP: 0,
  MAX_REQUEST_TIMEOUT: 5 * 60 * 1000,  // 5 minutes
  DEFAULT_REQUEST_TIMEOUT: 30 * 1000,   // 30 seconds
  MIN_REQUEST_TIMEOUT: 1000,            // 1 second
  RECONNECT_MIN_DELAY: 100,            // 100ms
  RECONNECT_MAX_DELAY: 30 * 1000       // 30 seconds
};

