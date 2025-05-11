/**
 * Validates a request message
 * @param {unknown} message - Message to validate
 * @param {RequestValidationOptions} [options] - Validation options
 * @returns {ValidationResult} Validation result
 */
export function validateRequest(message: unknown, options?: RequestValidationOptions): ValidationResult;
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
export const DefaultRequestValidationOptions: RequestValidationOptions;
export type ValidationResult = import("./base.js").ValidationResult;
export type RequestValidationOptions = {
    /**
     * - Whether to validate payload structure
     */
    validatePayload?: boolean;
    /**
     * - Custom payload validator function
     */
    payloadValidator?: Function;
    /**
     * - List of allowed methods
     */
    allowedMethods?: string[];
    /**
     * - Maximum payload size in bytes
     */
    maxPayloadSize?: number;
};
