/**
* @typedef {Object} ValidationResult
* @property {boolean} valid - Whether the validation passed
* @property {string[]} errors - Array of error messages if validation failed
*/

/**
* @typedef {Boolean|Object} PeerConfiguration - Peer configuration
*/

/**
* @typedef {Object} BaseMessage
* @property {string} protocol - Must be "helios-starling"
* @property {string} version - Semantic version (x.y.z)
* @property {number} timestamp - Unix timestamp in milliseconds
* @property {MessageType} type - Message type
* @property {PeerConfiguration} [peer=false] - Peer configuration
*/

import { Patterns, SizeLimits, ReservedNamespaces, MessageType } from "../constants/protocol.js";
import { estimateMessageSize } from "../utils/message.js";
import { DefaultValidationOptions } from "../constants/protocol.js";

// Utility functions

/**
* Checks if a string matches a pattern
* @param {string} value - Value to check
* @param {RegExp} pattern - Pattern to match against
* @returns {boolean} Whether the value matches the pattern
*/
export function matchesPattern(value, pattern) {
  return pattern.test(value);
}

/**
* Validates a method name
* @param {string} methodName - Method name to validate
* @returns {ValidationResult} Validation result
*/
export function validateMethodName(methodName) {
  const errors = [];
  
  if (typeof methodName !== 'string') {
    return {
      valid: false,
      errors: ['Method name must be a string']
    };
  }
  
  if (methodName.length > SizeLimits.MAX_METHOD_NAME) {
    errors.push(`Method name exceeds maximum length of ${SizeLimits.MAX_METHOD_NAME}`);
  }
  
  if (!matchesPattern(methodName, Patterns.METHOD_NAME)) {
    errors.push('Invalid method name format. Must be namespace:action');
  }
  
  const namespace = methodName.split(':')[0];
  if (ReservedNamespaces.includes(namespace)) {
    errors.push(`Namespace "${namespace}" is reserved`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
* Validates a message against the base message schema
* @param {unknown} message - Message to validate
* @returns {ValidationResult} Validation result
*/
export function validateBaseMessage(message) {
  const errors = [];
  
  // Type check
  if (!message || typeof message !== 'object' || Array.isArray(message)) {
    return {
      valid: false,
      errors: ['Message must be an object']
    };
  }
  
  // Protocol check
  if (!('protocol' in message)) {
    errors.push('Missing required field: protocol');
  } else if (message.protocol !== 'helios-starling') {
    errors.push('Invalid protocol: must be "helios-starling"');
  }
  
  // Version check
  if (!('version' in message)) {
    errors.push('Missing required field: version');
  } else if (typeof message.version !== 'string') {
    errors.push('Version must be a string');
  } else if (!isValidVersion(message.version)) {
    errors.push('Version must be in semantic version format (x.y.z)');
  }
  
  // Timestamp check
  if (!('timestamp' in message)) {
    errors.push('Missing required field: timestamp');
  } else if (typeof message.timestamp !== 'number' || !Number.isInteger(message.timestamp)) {
    errors.push('Timestamp must be an integer');
  } else if (message.timestamp < 0) {
    errors.push('Timestamp must be a positive number');
  }
  
  // Type check
  const validTypes = MessageType.values().join(', ')
  if (!('type' in message)) {
    errors.push('Missing required field: type');
  } else if (!validTypes.includes(message.type)) {
    errors.push(`Invalid type: must be one of ${validTypes.join(', ')}`);
  }
  
  // Peer check
  if ('peer' in message) {
    if (typeof message.peer !== 'boolean' && typeof message.peer !== 'object') {
      errors.push('Peer must be a boolean or object');
    }
  } else {
    message.peer = false;
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
* Utility function to check if a string is a valid semantic version
* @param {string} version - Version string to validate
* @returns {boolean} Whether the version is valid
*/
export function isValidVersion(version) {
  return Patterns.VERSION.test(version);
}

/**
* Utility function to check if a timestamp is valid
* @param {number} timestamp - Timestamp to validate
* @returns {boolean} Whether the timestamp is valid
*/
export function isValidTimestamp(timestamp) {
  return typeof timestamp === 'number' && 
  Number.isInteger(timestamp) && 
  timestamp > 0;
}


/**
* Extended validation result
* @typedef {Object} ExtendedValidationResult
* @property {boolean} valid - Whether the validation passed
* @property {string[]} errors - Array of error messages if validation failed
* @property {object} [details] - Additional validation details
* @property {number} [size] - Size of the message in bytes
*/

/**
* Performs complete validation of a message with size estimation
* @param {unknown} message - Message to validate
* @param {ValidationOptions} [options] - Validation options
* @returns {ExtendedValidationResult} Detailed validation result
*/
export function validateMessage(message, options = DefaultValidationOptions) {
  const baseValidation = validateBaseMessage(message);
  if (!baseValidation.valid) {
    return baseValidation;
  }
  
  const size = estimateMessageSize(message);
  if (options.maxSize && size > options.maxSize) {
    return {
      valid: false,
      errors: [`Message size (${size} bytes) exceeds maximum allowed size (${options.maxSize} bytes)`],
      size
    };
  }
  
  return {
    valid: true,
    errors: [],
    size,
    details: {
      type: message.type,
      version: message.version,
      timestamp: message.timestamp
    }
  };
}