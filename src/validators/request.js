import {
    validateBaseMessage,
    validateMethodName,
  } from './base.js';
  import { MessageType, Patterns, SizeLimits, } from '../constants/protocol.js';
  import { estimateMessageSize } from '../utils/message.js';

  /**
   * @typedef {import('./base.js').ValidationResult} ValidationResult
   */
  
  /**
   * @typedef {Object} RequestValidationOptions
   * @property {boolean} [validatePayload=false] - Whether to validate payload structure
   * @property {function} [payloadValidator] - Custom payload validator function
   * @property {string[]} [allowedMethods] - List of allowed methods
   * @property {number} [maxPayloadSize] - Maximum payload size in bytes
   */
  
  /**
   * Default validation options for requests
   * @type {RequestValidationOptions}
   */
  export const DefaultRequestValidationOptions = {
    validatePayload: false,
    payloadValidator: null,
    allowedMethods: null,
    maxPayloadSize: SizeLimits.MAX_MESSAGE_SIZE
  };
  
  /**
   * Validates a request message
   * @param {unknown} message - Message to validate
   * @param {RequestValidationOptions} [options] - Validation options
   * @returns {ValidationResult} Validation result
   */
  export function validateRequest(message, options = DefaultRequestValidationOptions) {
    // First validate the base message structure
    const baseValidation = validateBaseMessage(message);
    if (!baseValidation.valid) {
      return baseValidation;
    }
  
    const errors = [];
  
    // Ensure it's a request type
    if (message.type !== MessageType.REQUEST) {
      errors.push(`Invalid message type: expected 'request', got '${message.type}'`);
      return { valid: false, errors };
    }
  
    // Validate requestId
    if (!('requestId' in message)) {
      errors.push('Missing required field: requestId');
    } else if (typeof message.requestId !== 'string') {
      errors.push('requestId must be a string');
    } else if (!Patterns.UUID.test(message.requestId)) {
      errors.push('requestId must be a valid UUID');
    }
  
    // Validate method
    if (!('method' in message)) {
      errors.push('Missing required field: method');
    } else {
      const methodValidation = validateMethodName(message.method);
      if (!methodValidation.valid) {
        errors.push(...methodValidation.errors);
      }
  
      // Check if method is allowed
      if (options.allowedMethods && !options.allowedMethods.includes(message.method)) {
        errors.push(`Method '${message.method}' is not allowed`);
      }
    }
  
    // Validate payload if necessary
    if ('payload' in message) {
      // Check payload size
      const payloadSize = estimateMessageSize(message.payload);
      if (payloadSize > options.maxPayloadSize) {
        errors.push(`Payload size (${payloadSize} bytes) exceeds maximum allowed size (${options.maxPayloadSize} bytes)`);
      }
  
      // Custom payload validation
      if (options.validatePayload && options.payloadValidator) {
        try {
          const payloadValidation = options.payloadValidator(message.payload);
          if (!payloadValidation.valid) {
            errors.push(...payloadValidation.errors);
          }
        } catch (error) {
          errors.push(`Payload validation error: ${error.message}`);
        }
      }
    }
  
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  
  
  