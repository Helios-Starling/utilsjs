export function withRetry<T>(operation: () => Promise<T>, options?: RetryOptions, onRetry?: (arg0: RetryAttemptInfo) => void): Promise<T>;
/**
 * Exponential backoff configuration
 */
export type RetryOptions = {
    /**
     * - Maximum number of retry attempts
     */
    maxRetries?: number;
    /**
     * - Base delay in milliseconds
     */
    baseDelay?: number;
    /**
     * - Maximum delay between retries
     */
    maxDelay?: number;
    /**
     * - Random jitter factor (0-1) to add to delay
     */
    jitter?: number;
};
/**
 * Retry result containing attempt information
 */
export type RetryAttemptInfo = {
    /**
     * - Current attempt number (1-based)
     */
    attempt: number;
    /**
     * - Calculated delay for next attempt
     */
    delay: number;
    /**
     * - Error from last attempt
     */
    error: Error;
    /**
     * - Maximum number of attempts
     */
    totalAttempts: number;
};
