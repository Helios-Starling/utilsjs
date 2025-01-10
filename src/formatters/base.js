/**
 * Creates base message structure
 * @param {Object} [options] - Message options
 * @param {string} [options.version] - Protocol version
 * @returns {BaseMessage} Base message structure
 */
export function createBaseMessage(options = {}) {
    return {
      protocol: 'helios-starling',
      version: options.version || '1.0.0',
      timestamp: Date.now()
    };
  }