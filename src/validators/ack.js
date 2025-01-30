import {
    validateBaseMessage
} from './base.js';

import { MessageType, Patterns } from '../constants/protocol.js';

/**
* @typedef {import('./base.js').ValidationResult} ValidationResult
*/

/**
* @typedef {import('./base.js').BaseMessage} BaseMessage
*/

/**
* @typedef {Object} AckMessage
* @property {string} protocol - Must be "helios-starling"
* @property {string} version - Semantic version (x.y.z)
* @property {number} timestamp - Unix timestamp in milliseconds
* @property {'ack'} type - Must be "ack"
* @property {string} messageId - Request ID
*/

/**
* @typedef {Object} AckValidationOptions
* @property {boolean} [requireMessageId=true] - Whether messageId is required
*/

/**
 * Default ack validation options
 * @type {AckValidationOptions}
 */
export const DefaultAckValidationOptions = {
    requireMessageId: true
};

/**
 * Validates an ack message
 * @param {unknown} message - Message to validate
 * @param {AckValidationOptions} [options] - Validation options
 * @returns {ValidationResult} Validation result
 */
export function validateAck(message, options = DefaultAckValidationOptions) {
    const baseValidation = validateBaseMessage(message);
    if (!baseValidation.valid) {
        return baseValidation;
    }

    const errors = [];

    // Verify type
    if (message.type !== MessageType.ACK) {
        errors.push('Invalid message type: must be "ack"');
    }

    // Verify messageId
    if (options.requireMessageId) {
        if (!('messageId' in message)) {
            errors.push('Missing required field: messageId');
        } else if (typeof message.messageId !== 'string') {
            errors.push('Message ID must be a string');
        } else if (!Patterns.UUID.test(message.messageId)) {
            errors.push('Invalid message ID: must be a UUID');
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}