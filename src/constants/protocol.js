/**
 * Message types enum
 * @readonly
 * @enum {string}
 */
export const MessageType = {
    REQUEST: 'request',
    RESPONSE: 'response',
    NOTIFICATION: 'notification',
    ERROR: 'error',
    ACK: 'ack',
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
 * Message validation levels
 * @readonly
 * @enum {string}
 */
export const ValidationLevel = {
  PROTOCOL: 'protocol',  // Validation de base du protocole
  MESSAGE: 'message'     // Validation spécifique au type de message
};
  

/**
 * Error severity levels
 * @readonly
 * @enum {string}
 */
export const ErrorSeverity = {
  PROTOCOL: 'protocol',  // Erreur au niveau du protocole
  APPLICATION: 'application'  // Erreur applicative
};
  /**
   * Protocol constants
   * @readonly
   * @enum {string}
   */
  export const Protocol = {
    NAME: 'helios-starling',
    CURRENT_VERSION: '1.0.0',
    MIN_VERSION: '1.0.0',
    DEFAULT_BUFFER_SIZE: 1000,
    DEFAULT_TIMEOUT: 30000,
  };
  
  /**
   * Regular expressions used in validation
   * @readonly
   * @enum {RegExp}
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
  
  /**
   * Transport modes
   * @readonly
   * @enum {string}
   */
  export const TransportMode = {
    TEXT: 'text',
    BINARY: 'binary'
  };