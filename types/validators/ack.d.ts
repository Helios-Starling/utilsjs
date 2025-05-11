/**
 * Validates an ack message
 * @param {unknown} message - Message to validate
 * @param {AckValidationOptions} [options] - Validation options
 * @returns {ValidationResult} Validation result
 */
export function validateAck(message: unknown, options?: AckValidationOptions): ValidationResult;
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
export const DefaultAckValidationOptions: AckValidationOptions;
export type ValidationResult = import("./base.js").ValidationResult;
export type BaseMessage = import("./base.js").BaseMessage;
export type AckMessage = {
    /**
     * - Must be "helios-starling"
     */
    protocol: string;
    /**
     * - Semantic version (x.y.z)
     */
    version: string;
    /**
     * - Unix timestamp in milliseconds
     */
    timestamp: number;
    /**
     * - Must be "ack"
     */
    type: "ack";
    /**
     * - Request ID
     */
    messageId: string;
};
export type AckValidationOptions = {
    /**
     * - Whether messageId is required
     */
    requireMessageId?: boolean;
};
