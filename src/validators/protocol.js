import { validateRequest, validateResponse, validateNotification, validateErrorMessage, isValidTimestamp, isValidVersion } from "./index.js";
import { Protocol, ValidationLevel, MessageType } from "../constants/protocol.js";
import { estimateMessageSize } from "../utils/message.js";

/**
 * Protocol resolution options
 * @typedef {Object} ResolutionOptions
 * @property {boolean} [strict=true] Whether to enforce strict protocol validation
 * @property {boolean} [allowCustomTypes=false] Whether to allow custom message types
 * @property {number} [maxMessageSize] Maximum allowed message size in bytes
 * @property {ValidationLevel} [level=ValidationLevel.PROTOCOL] Validation level
 */

/**
 * Message handler function
 * @typedef {(message: any) => void} MessageHandler
 */

/**
 * Violation handler function
 * @typedef {(violations: string[]) => void} ViolationHandler
 */

/**
 * Resolution result object
 * @typedef {Object} ResolutionResult
 * @property {boolean} isStandard Whether the message is a standard protocol message
 * @property {boolean} isValid Whether the message is valid
 * @property {string[]} violations Array of protocol violations
 * @property {string} type Resolved message type if valid
 */

/**
 * Protocol Resolution class
 * Immediately resolves and validates any incoming message according to the Helios-Starling protocol.
 */
class ProtocolResolution {
  /**
   * Creates a new protocol resolution instance
   * Immediately resolves and validates the message
   * @param {unknown} message Message to resolve
   * @param {ResolutionOptions} [options] Resolution options
   */
  constructor(message, options = {}) {
    /** @private */
    this._violations = [];
    
    /** @private */
    this._resolvedType = null;
    
    /** @private */
    this._message = message;
    
    /** @private */
    this._options = {
      strict: true,
      allowCustomTypes: false,
      level: ValidationLevel.PROTOCOL,
      ...options
    };

    /** @private */
    this._result = this._resolveMessage();
  }

  /**
   * Resolves the message and returns the resolution result
   * @private
   * @returns {ResolutionResult}
   */
  _resolveMessage() {
    // Basic type validation
    if (!this._message || typeof this._message !== 'object' || Array.isArray(this._message)) {
      this._addViolation('Message must be an object');
      return this._createResult(false);
    }

    // Protocol identification
    if (!('protocol' in this._message) || this._message.protocol !== Protocol.NAME) {
      return this._createResult(false);
    }

    // Base protocol validation
    this._validateBase();
    
    // Stop if base validation failed
    if (this._violations.length > 0) {
      return this._createResult(true);
    }

    // Type-specific validation
    this._validateType();
    
    // Store resolved type if valid
    if (this._violations.length === 0) {
      this._resolvedType = this._message.type;
    }

    return this._createResult(true);
  }

  /**
   * Validates base protocol requirements
   * @private
   */
  _validateBase() {
    // Version
    if (!('version' in this._message)) {
      this._addViolation('Missing required field: version');
    } else if (typeof this._message.version !== 'string') {
      this._addViolation('Version must be a string');
    } else if (!isValidVersion(this._message.version)) {
      this._addViolation('Version must be in semantic version format (x.y.z)');
    }

    // Timestamp
    if (!('timestamp' in this._message)) {
      this._addViolation('Missing required field: timestamp');
    } else if (!isValidTimestamp(this._message.timestamp)) {
      this._addViolation('Invalid timestamp format');
    }

    // Type
    if (!('type' in this._message)) {
      this._addViolation('Missing required field: type');
    } else if (!MessageType.isValid(this._message.type)) {
      this._addViolation(`Invalid type: must be one of ${MessageType.values().join(', ')}`);
    }

    // Size check if applicable
    if (this._options.maxMessageSize) {
      const size = estimateMessageSize(this._message);
      if (size > this._options.maxMessageSize) {
        this._addViolation(`Message size (${size} bytes) exceeds maximum allowed size (${this._options.maxMessageSize} bytes)`);
      }
    }
  }

  /**
   * Validates type-specific message structure
   * @private
   */
  _validateType() {
    if (!this._message.type) return;

    let typeValidation;
    switch (this._message.type) {
      case 'request':
        typeValidation = validateRequest(this._message);
        break;
      case 'response':
        typeValidation = validateResponse(this._message);
        break;
      case 'notification':
        typeValidation = validateNotification(this._message);
        break;
      case 'error':
        typeValidation = validateErrorMessage(this._message);
        break;
      default:
        if (this._options.strict) {
          this._addViolation(`Unsupported message type: ${this._message.type}`);
        }
        return;
    }

    if (!typeValidation.valid) {
      typeValidation.errors.forEach(violation => this._addViolation(violation));
    }
  }

  /**
   * Creates a resolution result object
   * @private
   * @param {boolean} isStandard Whether the message follows the protocol format
   * @returns {ResolutionResult}
   */
  _createResult(isStandard) {
    return {
      isStandard,
      isValid: isStandard && this._violations.length === 0,
      violations: this._violations,
      type: this._resolvedType
    };
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
   * Subscribes to non-protocol messages
   * @param {MessageHandler} handler Non-protocol message handler
   * @returns {this} For chaining
   */
  onAlien(handler) {
    if (!this._result.isStandard) {
      handler(this._message);
    }
    return this;
  }

  /**
   * Subscribes to request messages
   * @param {MessageHandler} handler Request handler
   * @returns {this} For chaining
   */
  onRequest(handler) {
    if (this._result.isValid && this._resolvedType === 'request') {
      handler(this._message);
    }
    return this;
  }

  /**
   * Subscribes to response messages
   * @param {MessageHandler} handler Response handler
   * @returns {this} For chaining
   */
  onResponse(handler) {
    if (this._result.isValid && this._resolvedType === 'response') {
      handler(this._message);
    }
    return this;
  }

  /**
   * Subscribes to notification messages
   * @param {MessageHandler} handler Notification handler
   * @returns {this} For chaining
   */
  onNotification(handler) {
    if (this._result.isValid && this._resolvedType === 'notification') {
      handler(this._message);
    }
    return this;
  }

  /**
   * Subscribes to error messages
   * @param {MessageHandler} handler Error message handler
   * @returns {this} For chaining
   */
  onErrorMessage(handler) {
    if (this._result.isValid && this._resolvedType === 'error') {
      handler(this._message);
    }
    return this;
  }

  /**
   * Enables non-strict mode for custom messages
   * @returns {this} For chaining
   */
  lenient() {
    this._options.strict = false;
    this._options.allowCustomTypes = true;
    return this;
  }

  /**
   * Gets the resolution result
   * @returns {ResolutionResult} Current resolution state
   */
  getResult() {
    return { ...this._result };
  }

  /**
   * Gets the resolved message type
   * @returns {string|null} Resolved message type or null if invalid
   */
  getType() {
    return this._resolvedType;
  }

  /**
   * Gets protocol violations
   * @returns {string[]} List of violations
   */
  getViolations() {
    return [...this._violations];
  }

  /**
   * Checks if message is a standard protocol message
   * @returns {boolean}
   */
  isStandard() {
    return this._result.isStandard;
  }

  /**
   * Checks if message is valid according to protocol
   * @returns {boolean}
   */
  isValid() {
    return this._result.isValid;
  }
}

/**
 * Core message resolution for the Helios-Starling protocol.
 * Immediately validates and resolves any incoming message, providing
 * a fluent API for handling different message types and violations.
 * 
 * @param {unknown} message Message to resolve
 * @param {ResolutionOptions} [options] Resolution options
 * @returns {ProtocolResolution} Resolution handler
 * 
 * @example
 * resolve(message)
 *   .onAlien(msg => {
 *     console.warn('Non-protocol message:', msg);
 *   })
 *   .onViolation(violations => {
 *     console.error('Protocol violated:', violations);
 *   })
 *   .onRequest(handleRequest)
 *   .onResponse(handleResponse)
 *   .onNotification(handleNotification)
 *   .onErrorMessage(handleError);
 *   
 * // Handlers are called immediately if applicable
 * // Chaining is optional, you can also split it:
 * const resolution = resolve(message);
 * 
 * if (resolution.isValid()) {
 *   switch(resolution.getType()) {
 *     case 'request':
 *       resolution.onRequest(handleRequest);
 *       break;
 *     // ...
 *   }
 * }
 */
export function resolve(message, options = {}) {
  return new ProtocolResolution(message, options);
}