import {
    validateBaseMessage,
} from './base.js';

import { MessageType, SizeLimits } from '../constants/protocol.js';
import { estimateMessageSize } from '../utils/message.js';

/**
* @typedef {import('./base.js').BaseMessage} BaseMessage
* @typedef {import('../constants/protocol').MessageType} MessageType
* @typedef {import('../constants/protocol').ErrorSeverity} ErrorSeverity
*/
                
                
/**
* @typedef {Object} ErrorValidationOptions
* @property {boolean} [validateDetails=false] Whether to validate error details
* @property {function} [detailsValidator] Custom details validator function
* @property {number} [maxDetailsSize] Maximum details size in bytes
* @property {string[]} [allowedCodes] List of allowed error codes
*/
                
/**
* Default validation options for error messages
* @type {ErrorValidationOptions}
*/
export const DefaultErrorValidationOptions = {
    validateDetails: false,
    detailsValidator: null,
    maxDetailsSize: SizeLimits.MAX_MESSAGE_SIZE,
    allowedCodes: null
};
                
/**
* Validates an error message
* @param {unknown} message Message to validate
* @param {ErrorValidationOptions} [options] Validation options
* @returns {import('./base.js').ValidationResult} Validation result
*/
export function validateErrorMessage(message, options = DefaultErrorValidationOptions) {
    // First validate base message structure
    const baseValidation = validateBaseMessage(message);
    if (!baseValidation.valid) {
        return baseValidation;
    }
    
    const errors = [];
    
    // Ensure it's an error type
    if (message.type !== MessageType.ERROR) {
        errors.push(`Invalid message type: expected 'error', got '${message.type}'`);
        return { valid: false, errors };
    }
    
    // Validate error object
    if (!('error' in message)) {
        errors.push('Missing required field: error');
    } else if (!message.error || typeof message.error !== 'object') {
        errors.push('error must be an object');
    } else {
        // Validate error code
        if (!('code' in message.error)) {
            errors.push('Missing required field: error.code');
        } else if (typeof message.error.code !== 'string') {
            errors.push('error.code must be a string');
        } else if (message.error.code.length === 0) {
            errors.push('error.code cannot be empty');
        } else if (options.allowedCodes && !options.allowedCodes.includes(message.error.code)) {
            errors.push(`Invalid error code: ${message.error.code}`);
        }
        
        // Validate error message
        if (!('message' in message.error)) {
            errors.push('Missing required field: error.message');
        } else if (typeof message.error.message !== 'string') {
            errors.push('error.message must be a string');
        } else if (message.error.message.length === 0) {
            errors.push('error.message cannot be empty');
        } else if (message.error.message.length > SizeLimits.MAX_ERROR_MESSAGE) {
            errors.push(`Error message exceeds maximum length of ${SizeLimits.MAX_ERROR_MESSAGE}`);
        }
        
        // Validate error details if present
        if ('details' in message.error) {
            if (message.error.details === null) {
                errors.push('error.details cannot be null');
            } else if (options.validateDetails && options.detailsValidator) {
                try {
                    const detailsValidation = options.detailsValidator(message.error.details);
                    if (!detailsValidation.valid) {
                        errors.push(...detailsValidation.errors);
                    }
                } catch (error) {
                    errors.push(`Details validation error: ${error.message}`);
                }
            }
            
            // Check details size if maxDetailsSize is specified
            if (options.maxDetailsSize) {
                const detailsSize = estimateMessageSize(message.error.details);
                if (detailsSize > options.maxDetailsSize) {
                    errors.push(`Error details size (${detailsSize} bytes) exceeds maximum allowed size`);
                }
            }
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}