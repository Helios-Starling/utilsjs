/**
 * Validates a response message
 * @param {unknown} message - Message to validate
 * @param {ResponseValidationOptions} [options] - Validation options
 * @returns {ValidationResult} Validation result
 */
export function validateResponse(message: unknown, options?: ResponseValidationOptions): ValidationResult;
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
export const DefaultResponseValidationOptions: ResponseValidationOptions;
export type ValidationResult = import("./base.js").ValidationResult;
export type BaseMessage = import("./base.js").BaseMessage;
export type ResponseValidationOptions = {
    /**
     * - Whether to validate response data
     */
    validateData?: boolean;
    /**
     * - Custom data validator function
     */
    dataValidator?: Function;
    /**
     * - Whether requestId is required
     */
    requireRequestId?: boolean;
    /**
     * - Maximum data size in bytes
     */
    maxDataSize?: number;
};
