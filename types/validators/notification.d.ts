/**
 * Validates a notification message
 * @param {unknown} message - Message to validate
 * @param {NotificationValidationOptions} [options] - Validation options
 * @returns {ValidationResult} Validation result
 */
export function validateNotification(message: unknown, options?: NotificationValidationOptions): ValidationResult;
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
export const DefaultNotificationValidationOptions: NotificationValidationOptions;
export type ValidationResult = import("./base.js").ValidationResult;
export type BaseMessage = import("./base.js").BaseMessage;
export type NotificationValidationOptions = {
    /**
     * - Whether to validate notification data
     */
    validateData?: boolean;
    /**
     * - Custom data validator function
     */
    dataValidator?: Function;
    /**
     * - Whether topic is required
     */
    requireTopic?: boolean;
    /**
     * - List of allowed topics
     */
    allowedTopics?: string[];
    /**
     * - Maximum data size in bytes
     */
    maxDataSize?: number;
};
