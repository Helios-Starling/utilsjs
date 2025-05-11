/**
* Checks if a string matches a pattern
* @param {string} value - Value to check
* @param {RegExp} pattern - Pattern to match against
* @returns {boolean} Whether the value matches the pattern
*/
export function matchesPattern(value: string, pattern: RegExp): boolean;
/**
* Validates a method name
* @param {string} methodName - Method name to validate
* @returns {ValidationResult} Validation result
*/
export function validateMethodName(methodName: string): ValidationResult;
/**
* Validates a message against the base message schema
* @param {unknown} message - Message to validate
* @returns {ValidationResult} Validation result
*/
export function validateBaseMessage(message: unknown): ValidationResult;
/**
* Utility function to check if a string is a valid semantic version
* @param {string} version - Version string to validate
* @returns {boolean} Whether the version is valid
*/
export function isValidVersion(version: string): boolean;
/**
* Utility function to check if a timestamp is valid
* @param {number} timestamp - Timestamp to validate
* @returns {boolean} Whether the timestamp is valid
*/
export function isValidTimestamp(timestamp: number): boolean;
/**
* Extended validation result
* @typedef {Object} ExtendedValidationResult
* @property {boolean} valid - Whether the validation passed
* @property {string[]} errors - Array of error messages if validation failed
* @property {object} [details] - Additional validation details
* @property {number} [size] - Size of the message in bytes
*/
/**
* Performs complete validation of a message with size estimation
* @param {unknown} message - Message to validate
* @param {ValidationOptions} [options] - Validation options
* @returns {ExtendedValidationResult} Detailed validation result
*/
export function validateMessage(message: unknown, options?: ValidationOptions): ExtendedValidationResult;
/**
 * Extended validation result
 */
export type ExtendedValidationResult = {
    /**
     * - Whether the validation passed
     */
    valid: boolean;
    /**
     * - Array of error messages if validation failed
     */
    errors: string[];
    /**
     * - Additional validation details
     */
    details?: object;
    /**
     * - Size of the message in bytes
     */
    size?: number;
};
export type ValidationResult = {
    /**
     * - Whether the validation passed
     */
    valid: boolean;
    /**
     * - Array of error messages if validation failed
     */
    errors: string[];
};
/**
 * - Peer configuration
 */
export type PeerConfiguration = boolean | any;
export type BaseMessage = {
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
     * - Message type
     */
    type: MessageType;
    /**
     * - Peer configuration
     */
    peer?: PeerConfiguration;
};
import { MessageType } from "../constants/protocol.js";
