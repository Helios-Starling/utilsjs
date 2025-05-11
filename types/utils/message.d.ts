/**
   * Gets the current timestamp in the format required by the protocol
   * @returns {number} Current timestamp in milliseconds
   */
export function getCurrentTimestamp(): number;
/**
 * Utility to estimate the size of a message in bytes
 * @param {object} message - Message to check
 * @returns {number} Approximate size in bytes
 */
export function estimateMessageSize(message: object): number;
