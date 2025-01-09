import { estimateMessageSize } from "./message";
import { validateRequest } from "../validators/request";

/**
   * Request utilities
   * @type {Object}
   */
export const RequestUtils = {
    /**
     * Checks if a value is a valid request message
     * @param {unknown} value - Value to check
     * @returns {boolean} Whether the value is a valid request message
     */
    isRequest(value) {
      return validateRequest(value).valid;
    },
  
    /**
     * Gets request size in bytes
     * @param {RequestMessage} request - Request to measure
     * @returns {number} Size in bytes
     */
    getSize(request) {
      return estimateMessageSize(request);
    },
  
    /**
     * Creates a copy of a request with optional modifications
     * @param {RequestMessage} request - Original request
     * @param {Object} [changes] - Properties to change
     * @returns {RequestMessage} New request object
     */
    clone(request, changes = {}) {
      return { ...request, ...changes };
    }
  };