import { Protocol } from "../constants";


/**
 * Creates base message structure
 * @param {import("../types/messages.d").MessageOptions} [options] Message options
 * @returns {import("../types/messages.d").BaseMessage} Base message structure
 */
export function createBaseMessage(options = {}) {
    return {
      protocol: Protocol.NAME,
      version: Protocol.CURRENT_VERSION,
      timestamp: Date.now(),
      ...(options.peer ? { peer: options.peer } : {})
    };
  }