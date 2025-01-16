// src/utils/retry.js

/**
 * Exponential backoff configuration
 * @typedef {Object} RetryOptions
 * @property {number} [maxRetries=3] - Maximum number of retry attempts
 * @property {number} [baseDelay=100] - Base delay in milliseconds
 * @property {number} [maxDelay=5000] - Maximum delay between retries
 * @property {number} [jitter=0.1] - Random jitter factor (0-1) to add to delay
 */

/**
 * Retry result containing attempt information
 * @typedef {Object} RetryAttemptInfo
 * @property {number} attempt - Current attempt number (1-based)
 * @property {number} delay - Calculated delay for next attempt
 * @property {Error} error - Error from last attempt
 * @property {number} totalAttempts - Maximum number of attempts
 */

/**
 * Calculates exponential backoff delay with jitter
 * @param {number} attempt - Current attempt number (0-based)
 * @param {RetryOptions} options - Retry configuration
 * @returns {number} Calculated delay in milliseconds
 * @private
 */
const calculateBackoffDelay = (attempt, { baseDelay, maxDelay, jitter }) => {
    const exponentialDelay = Math.min(
      baseDelay * Math.pow(2, attempt),
      maxDelay
    );
    
    const jitterMs = exponentialDelay * jitter;
    const randomJitter = Math.random() * jitterMs * 2 - jitterMs;
    
    return Math.max(0, exponentialDelay + randomJitter);
  };
  
  /**
   * Executes an operation with exponential backoff retry strategy
   * @param {function(): Promise<T>} operation - Async operation to retry
   * @param {RetryOptions} [options] - Retry configuration
   * @param {function(RetryAttemptInfo): void} [onRetry] - Called before each retry attempt
   * @returns {Promise<T>} Result of the operation
   * @template T
   */
  export const withRetry = async (operation, options = {}, onRetry = null) => {
    const config = {
      maxRetries: 3,
      baseDelay: 100,
      maxDelay: 5000,
      jitter: 0.1,
      ...options
    };
  
    let lastError;
  
    for (let attempt = 0; attempt < config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
  
        if (attempt < config.maxRetries - 1) {
          const delay = calculateBackoffDelay(attempt, config);
  
          if (onRetry) {
            onRetry({
              attempt: attempt + 1,
              delay,
              error,
              totalAttempts: config.maxRetries
            });
          }
  
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  
    throw lastError;
  };