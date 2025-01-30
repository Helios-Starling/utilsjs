
import {
    validateBaseMessage,
  } from './base.js';

  import { MessageType, Patterns, SizeLimits } from '../constants/protocol.js';
  import { estimateMessageSize } from '../utils/message.js';

  /**
   * @typedef {import('./base.js').ValidationResult} ValidationResult
   * @typedef {import('./base.js').BaseMessage} BaseMessage
   */
  
  /**
   * @typedef {Object} NotificationValidationOptions
   * @property {boolean} [validateData=false] - Whether to validate notification data
   * @property {function} [dataValidator] - Custom data validator function
   * @property {boolean} [requireTopic=false] - Whether topic is required
   * @property {string[]} [allowedTopics] - List of allowed topics
   * @property {number} [maxDataSize] - Maximum data size in bytes
   */
  
  /**
   * Default notification validation options
   * @type {NotificationValidationOptions}
   */
  export const DefaultNotificationValidationOptions = {
    validateData: false,
    dataValidator: null,
    requireTopic: false,
    allowedTopics: null,
    maxDataSize: SizeLimits.MAX_MESSAGE_SIZE
  };
  
  
  /**
   * Validates a notification message
   * @param {unknown} message - Message to validate
   * @param {NotificationValidationOptions} [options] - Validation options
   * @returns {ValidationResult} Validation result
   */
  export function validateNotification(message, options = DefaultNotificationValidationOptions) {
    const baseValidation = validateBaseMessage(message);
    if (!baseValidation.valid) {
      return baseValidation;
    }
  
    const errors = [];
  
    // Verify type
    if (message.type !== MessageType.NOTIFICATION) {
      errors.push(`Invalid message type: expected 'notification', got '${message.type}'`);
      return { valid: false, errors };
    }
  
    // Validate notification object
    if (!('notification' in message)) {
      errors.push('Missing required field: notification');
    } else if (!message.notification || typeof message.notification !== 'object') {
      errors.push('notification must be an object');
    } else {
      // Validate topic if present or required
      if (options.requireTopic && !message.notification.topic) {
        errors.push('notification.topic is required');
      } else if (message.notification.topic !== undefined) {
        if (typeof message.notification.topic !== 'string') {
          errors.push('notification.topic must be a string');
        } else if (!Patterns.TOPIC_NAME.test(message.notification.topic)) {
          errors.push('Invalid topic format');
        } else if (options.allowedTopics && !options.allowedTopics.includes(message.notification.topic)) {
          errors.push(`Topic '${message.notification.topic}' is not allowed`);
        }
      }
  
      // Validate data
      if (!('data' in message.notification)) {
        // errors.push('notification.data is required');
      } else if (options.validateData && options.dataValidator) {
        try {
          const dataValidation = options.dataValidator(message.notification.data);
          if (!dataValidation.valid) {
            errors.push(...dataValidation.errors);
          }
        } catch (error) {
          errors.push(`Data validation error: ${error.message}`);
        }
      }
  
      // Check data size if maxDataSize is specified
      if (options.maxDataSize) {
        const dataSize = estimateMessageSize(message.notification.data);
        if (dataSize > options.maxDataSize) {
          errors.push(`Notification data size (${dataSize} bytes) exceeds maximum allowed size (${options.maxDataSize} bytes)`);
        }
      }
    }
  
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  
  
