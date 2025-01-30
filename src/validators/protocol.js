import { validateRequest, validateResponse, validateNotification, validateErrorMessage, isValidTimestamp, isValidVersion } from "./index.js";
import { Protocol, ValidationLevel, MessageType } from "../constants/protocol.js";
import { estimateMessageSize } from "../utils/message.js";
import { validateAck } from "./ack.js";

/**
 * Message format enumeration
 * @readonly
 * @enum {string}
 */
export const MessageFormat = {
  BINARY: 'binary',
  JSON: 'json',
  TEXT: 'text',
  PROTOCOL: 'protocol'
};

/**
 * Resolution options
 * @typedef {Object} ResolutionOptions
 * @property {boolean} [strict=true] Whether to enforce strict protocol validation
 * @property {boolean} [allowCustomTypes=false] Whether to allow custom message types
 * @property {number} [maxMessageSize] Maximum allowed message size in bytes
 * @property {ValidationLevel} [level=ValidationLevel.PROTOCOL] Validation level
 */

/**
 * Handler types
 * @typedef {(message: unknown) => void} MessageHandler
 * @typedef {(violations: string[]) => void} ViolationHandler
 * @typedef {(text: string) => void} TextHandler
 * @typedef {(data: object) => void} JsonHandler
 * @typedef {(data: ArrayBuffer|Uint8Array) => void} BinaryHandler
 */

/**
 * Resolution result object
 * @typedef {Object} ResolutionResult
 * @property {MessageFormat} format Detected message format
 * @property {boolean} isValid Whether the message is valid
 * @property {string[]} violations Array of protocol violations if any
 * @property {string} [type] Resolved protocol message type if applicable
 */

/**
 * Protocol Resolution class
 * Immediately resolves and validates any incoming message, providing typed handlers
 * for different message formats and protocol types.
 */
class ProtocolResolution {
  /**
   * Creates a new protocol resolution instance
   * @param {unknown} message Message to resolve
   * @param {ResolutionOptions} [options] Resolution options
   */
  constructor(message, options = {}) {
    /** @private */
    this._violations = [];
    
    /** @private */
    this._resolvedType = null;

    /** @private */
    this._parsedData = null;

    /** @private */
    this._options = {
      strict: true,
      allowCustomTypes: false,
      level: ValidationLevel.PROTOCOL,
      ...options
    };
    
    /** @private */
    this._message = message;
    
    /** @private */
    this._format = this._detectFormat(message);

    // Parse and validate immediately
    try {
      this._resolveMessage();
    } catch (error) {
      console.error("Error resolving message:", error);
    } 
  }

  /**
   * Detects the format of the incoming message
   * @private
   * @param {unknown} message Message to analyze
   * @returns {MessageFormat} Detected format
   */
  _detectFormat = (message) => {
    if (message instanceof ArrayBuffer || message instanceof Uint8Array) {
      return MessageFormat.BINARY;
    }

    if (typeof message === 'string') {
      try {
        this._parsedData = JSON.parse(message);
        
        return this._isProtocolMessage(this._parsedData) 
          ? MessageFormat.PROTOCOL 
          : MessageFormat.JSON;
      } catch { 
        return MessageFormat.TEXT;
      }
    }

    if (message && typeof message === 'object') {
      this._parsedData = message;
      return this._isProtocolMessage(message) 
        ? MessageFormat.PROTOCOL 
        : MessageFormat.JSON;
    }

    return MessageFormat.TEXT;
  }

  /**
   * Checks if a message follows the protocol format
   * @private
   * @param {object} message Message to check
   * @returns {boolean} Whether it's a protocol message
   */
  _isProtocolMessage = (message) => {
    return message?.protocol === Protocol.NAME;
  }

  /**
   * Resolves and validates the message
   * @private
   */
  _resolveMessage = () => {
    if (this._format !== MessageFormat.PROTOCOL) {
      return;
    }

  

    // Base protocol validation
    this._validateBase();
    
    // Type-specific validation if base passed
    if (this._violations.length === 0) {
      this._validateType();
      
      // Store resolved type if valid
      if (this._violations.length === 0) {
        this._resolvedType = this._parsedData.type;
      }
    }
  }

  /**
   * Validates base protocol requirements
   * @private
   */
  _validateBase() {
    // Version check

  
    if (!('version' in this._parsedData)) {
      this._addViolation('Missing required field: version');
    } else if (typeof this._parsedData.version !== 'string') {
      this._addViolation('Version must be a string');
    } else if (!isValidVersion(this._parsedData.version)) {
      this._addViolation('Version must be in semantic version format (x.y.z)');
    }

    // Timestamp check
    if (!('timestamp' in this._parsedData)) {
      this._addViolation('Missing required field: timestamp');
    } else if (!isValidTimestamp(this._parsedData.timestamp)) {
      this._addViolation('Invalid timestamp format');
    }

    // Type check
    if (!('type' in this._parsedData)) {
      this._addViolation('Missing required field: type');
    } else if (!MessageType.isValid(this._parsedData.type)) {
      this._addViolation(`Invalid type: must be one of ${MessageType.values().join(', ')}`);
    }

    // Peer check
    if (!('peer' in this._parsedData)) {
      this._parsedData.peer = false;
    } else if (typeof this._parsedData.peer !== 'boolean' && typeof this._parsedData.peer !== 'object') {
      this._addViolation('Peer must be a boolean or free object');
    }

    // Size check if applicable
    if (this._options.maxMessageSize) {
      const size = estimateMessageSize(this._parsedData);
      if (size > this._options.maxMessageSize) {
        this._addViolation(`Message size (${size} bytes) exceeds maximum allowed size`);
      }
    }
  }

  /**
   * Validates type-specific message structure
   * @private
   */
  _validateType() {
    if (!this._parsedData?.type) return;

    let typeValidation;
    switch (this._parsedData.type) {
      case MessageType.REQUEST:
        typeValidation = validateRequest(this._parsedData);
        break;
      case MessageType.RESPONSE:
        typeValidation = validateResponse(this._parsedData);
        break;
      case MessageType.NOTIFICATION:
        typeValidation = validateNotification(this._parsedData);
        break;
      case MessageType.ERROR:
        typeValidation = validateErrorMessage(this._parsedData);
        break;
      case MessageType.ACK:
        typeValidation = validateAck(this._parsedData);
        break;
      default:
        if (this._options.strict) {
          this._addViolation(`Unsupported message type: ${this._parsedData.type}`);
        }
        return;
    }

    if (!typeValidation.valid) {
      typeValidation.errors.forEach(error => this._addViolation(error));
    }
  }

  /**
   * Adds a protocol violation
   * @private
   * @param {string} violation Violation description
   */
  _addViolation(violation) {
    this._violations.push(violation);
  }

  /**
   * Gets resolution result
   * @returns {ResolutionResult} Complete resolution result
   */
  getResult() {
    return {
      format: this._format,
      isValid: this.isValid(),
      violations: [...this._violations],
      ...(this._resolvedType && { type: this._resolvedType })
    };
  }

  /**
   * Gets detected message format
   * @returns {MessageFormat} Message format
   */
  getFormat() {
    return this._format;
  }

  /**
   * Gets resolved protocol message type if applicable
   * @returns {string|null} Message type or null
   */
  getType() {
    return this._resolvedType;
  }

  /**
   * Gets protocol violations if any
   * @returns {string[]} List of violations
   */
  getViolations() {
    return [...this._violations];
  }

  /**
   * Gets binary data if message is binary
   * @returns {ArrayBuffer|Uint8Array|null} Binary data or null
   */
  getBinary() {
    return this._format === MessageFormat.BINARY ? this._message : null;
  }

  /**
   * Gets JSON data if message is JSON
   * @returns {object|null} Parsed JSON object or null
   */
  getJson() {
    return this._format === MessageFormat.JSON ? this._parsedData : null;
  }

  /**
   * Gets text content if message is text
   * @returns {string|null} Text content or null
   */
  getText() {
    return this._format === MessageFormat.TEXT ? String(this._message) : null;
  }

  /**
   * Checks message format
   */
  isBinary() { return this._format === MessageFormat.BINARY; }
  isJson() { return this._format === MessageFormat.JSON; }
  isText() { return this._format === MessageFormat.TEXT; }
  isProtocol() { return this._format === MessageFormat.PROTOCOL; }

  /**
   * Checks if protocol message is valid
   * @returns {boolean} Whether message is valid
   */
  isValid() {
    return this._format === MessageFormat.PROTOCOL && 
           this._violations.length === 0;
  }

  /**
   * Subscribes to text messages
   * @param {TextHandler} handler Text handler
   * @returns {this} For chaining
   */
  onText(handler) {
    if (this._format === MessageFormat.TEXT) {
      handler(String(this._message));
    }
    return this;
  }

  /**
   * Subscribes to JSON messages (non-protocol)
   * @param {JsonHandler} handler JSON handler
   * @returns {this} For chaining
   */
  onJson(handler) {
    if (this._format === MessageFormat.JSON) {
      handler(this._parsedData);
    }
    return this;
  }

  /**
   * Subscribes to binary messages
   * @param {BinaryHandler} handler Binary handler
   * @returns {this} For chaining
   */
  onBinary(handler) {
    if (this._format === MessageFormat.BINARY) {
      handler(this._message);
    }
    return this;
  }

  /**
   * Subscribes to protocol violations
   * @param {ViolationHandler} handler Violation handler
   * @returns {this} For chaining
   */
  onViolation(handler) {
    if (this._violations.length > 0) {
      handler(this._violations);
    }
    return this;
  }

  /**
   * Subscribes to request messages
   * @param {MessageHandler} handler Request handler
   * @returns {this} For chaining
   */
  onRequest(handler) {
    if (this.isValid() && this._resolvedType === MessageType.REQUEST) {
      handler(this._parsedData);
    }
    return this;
  }

  /**
   * Subscribes to response messages
   * @param {MessageHandler} handler Response handler
   * @returns {this} For chaining
   */
  onResponse(handler) {
    if (this.isValid() && this._resolvedType === MessageType.RESPONSE) {
      handler(this._parsedData);
    }
    return this;
  }

  /**
   * Subscribes to notification messages
   * @param {MessageHandler} handler Notification handler
   * @returns {this} For chaining
   */
  onNotification(handler) {
    if (this.isValid() && this._resolvedType === MessageType.NOTIFICATION) {
      handler(this._parsedData);
    }
    return this;
  }

  /**
   * Subscribes to ack messages
   * @param {MessageHandler} handler Ack handler
   * @returns {this} For chaining
   */
  onAck(handler) {
    if (this.isValid() && this._resolvedType === MessageType.ACK) {
      handler(this._parsedData);
    }
    return this;
  }

  /**
   * Subscribes to error messages
   * @param {MessageHandler} handler Error message handler
   * @returns {this} For chaining
   */
  onErrorMessage(handler) {
    if (this.isValid() && this._resolvedType === MessageType.ERROR) {
      handler(this._parsedData);
    }
    return this;
  }

  /**
   * Enables non-strict mode
   * @returns {this} For chaining
   */
  lenient() {
    this._options.strict = false;
    this._options.allowCustomTypes = true;
    return this;
  }
}

/**
 * Core message resolution for the Helios-Starling protocol.
 * Immediately validates and resolves any incoming message, providing
 * typed handlers for different message formats.
 * 
 * @param {unknown} message Message to resolve
 * @param {ResolutionOptions} [options] Resolution options
 * @returns {ProtocolResolution} Resolution handler
 * 
 * @example
 * // Basic protocol handling
 * resolve(message)
 *   .onViolation(violations => {
 *     console.error('Protocol violated:', violations);
 *   })
 *   .onRequest(handleRequest)
 *   .onResponse(handleResponse);
 *   
 * // Non-protocol message handling
 * resolve(message)
 *   .onText(text => {
 *     console.log('Received text:', text);
 *   })
 *   .onJson(data => {
 *     console.log('Received JSON:', data);
 *   })
 *   .onBinary(buffer => {
 *     console.log('Received binary data:', buffer);
 *   });
 *   
 * // Format checking
 * const resolution = resolve(message);
 * 
 * if (resolution.isBinary()) {
 *   const buffer = resolution.getBinary();
 *   // Process binary data...
 * } else if (resolution.isJson()) {
 *   const data = resolution.getJson();
 *   // Process JSON data...
 * }
 */
export function resolve(message, options = {}) {
  return new ProtocolResolution(message, options);
}