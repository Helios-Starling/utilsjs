  import { validateResponse } from "../validators/response";
  import { estimateMessageSize } from "./message";
  
  /**
   * Response utilities
   * @type {Object}
   */
  export const ResponseUtils = {
    /**
     * Checks if a value is a valid response message
     * @param {unknown} value - Value to check
     * @returns {boolean} Whether the value is a valid response
     */
    isResponse(value) {
      return validateResponse(value).valid;
    },
  
    /**
     * Checks if a response is successful
     * @param {ResponseMessage} response - Response to check
     * @returns {boolean} Whether the response is successful
     */
    isSuccess(response) {
      return validateResponse(response).valid && response.success === true;
    },
  
    /**
     * Gets response size in bytes
     * @param {ResponseMessage} response - Response to measure
     * @returns {number} Size in bytes
     */
    getSize(response) {
      return estimateMessageSize(response);
    }
  };