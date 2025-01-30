import {
    validateBaseMessage,
  } from './base.js';

  import { MessageType, Patterns, SizeLimits } from '../constants/protocol.js';
  
  /**
   * @typedef {import('./base.js').ValidationResult} ValidationResult
   * @typedef {import('./base.js').BaseMessage} BaseMessage
   */
  
  /**
   * @typedef {Object} ResponseValidationOptions
   * @property {boolean} [validateData=false] - Whether to validate response data
   * @property {function} [dataValidator] - Custom data validator function
   * @property {boolean} [requireRequestId=true] - Whether requestId is required
   * @property {number} [maxDataSize] - Maximum data size in bytes
   */
  
  /**
   * Default response validation options
   * @type {ResponseValidationOptions}
   */
  export const DefaultResponseValidationOptions = {
    validateData: false,
    dataValidator: null,
    requireRequestId: true,
    maxDataSize: SizeLimits.MAX_MESSAGE_SIZE
  };
  

  
  /**
   * Validates a response message
   * @param {unknown} message - Message to validate
   * @param {ResponseValidationOptions} [options] - Validation options
   * @returns {ValidationResult} Validation result
   */
  export function validateResponse(message, options = DefaultResponseValidationOptions) {
    const baseValidation = validateBaseMessage(message);
    if (!baseValidation.valid) {
      return baseValidation;
    }
  
    const errors = [];
  
    // Verify type
    if (message.type !== MessageType.RESPONSE) {
      errors.push(`Invalid message type: expected 'response', got '${message.type}'`);
      return { valid: false, errors };
    }
  
    // Validate requestId if required
    if (options.requireRequestId) {
      if (!('requestId' in message)) {
        errors.push('Missing required field: requestId');
      } else if (typeof message.requestId !== 'string') {
        errors.push('requestId must be a string');
      } else if (!Patterns.UUID.test(message.requestId)) {
        errors.push('requestId must be a valid UUID');
      }
    }
  
    // Validate success flag
    if (!('success' in message)) {
      errors.push('Missing required field: success');
    } else if (typeof message.success !== 'boolean') {
      errors.push('success must be a boolean');
    }
  
    // Validate based on success/error
    if (message.success === true) {
      if ('error' in message) {
        errors.push('Successful response should not contain error field');
      }
      if ('data' in message && options.validateData && options.dataValidator) {
        try {
          const dataValidation = options.dataValidator(message.data);
          if (!dataValidation.valid) {
            errors.push(...dataValidation.errors);
          }
        } catch (error) {
          errors.push(`Data validation error: ${error.message}`);
        }
      }
    } else {  // message.success === false
        if (!message.error) {  // Vérifie aussi si error est undefined
          errors.push('Failed response must contain error field');
        } else {
          const errorValidation = validateErrorObject(message.error);
          if (!errorValidation.valid) {
            errors.push(...errorValidation.errors);
          }
        }
      }
  
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validates an error object
   * @param {unknown} error - Error object to validate
   * @returns {ValidationResult} Validation result
   */
  function validateErrorObject(error) {
    const errors = [];
  
    if (!error || typeof error !== 'object') {
      return { valid: false, errors: ['Error must be an object'] };
    }
  
    // Vérifie le code
    if (!error.code) {  // Vérifie si le code existe et n'est pas vide
      errors.push('Error must contain non-empty code field');
    } else if (typeof error.code !== 'string') {
      errors.push('Error code must be a string');
    }
  
    // Vérifie le message
    if (!error.message) {
      errors.push('Error must contain non-empty message field');
    } else if (typeof error.message !== 'string') {
      errors.push('Error message must be a string');
    }
  
    // Vérifie les détails optionnels
    if ('details' in error && error.details === null) {
      errors.push('Error details cannot be null');
    }
  
    return {
      valid: errors.length === 0,
      errors
    };
  }

