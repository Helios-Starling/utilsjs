/**
* Validates an error message
* @param {unknown} message Message to validate
* @param {ErrorValidationOptions} [options] Validation options
* @returns {import('./base.js').ValidationResult} Validation result
*/
export function validateErrorMessage(message: unknown, options?: ErrorValidationOptions): import("./base.js").ValidationResult;
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
export const DefaultErrorValidationOptions: ErrorValidationOptions;
export type BaseMessage = import("./base.js").BaseMessage;
export type MessageType = import("../constants/protocol").MessageType;
export type ErrorSeverity = import("../constants/protocol").ErrorSeverity;
export type ErrorValidationOptions = {
    /**
     * Whether to validate error details
     */
    validateDetails?: boolean;
    /**
     * Custom details validator function
     */
    detailsValidator?: Function;
    /**
     * Maximum details size in bytes
     */
    maxDetailsSize?: number;
    /**
     * List of allowed error codes
     */
    allowedCodes?: string[];
};
