import { MessageType } from "../constants/protocol";
import { createBaseMessage } from "./base";

/**
   * Creates a new request message
   * @param {string} method - Method name
   * @param {*} [payload] - Optional request payload
   * @param {Object} [options] - Request options
   * @param {string} [options.requestId] - Custom request ID (will generate if not provided)
   * @param {string} [options.version] - Protocol version
   * @returns {RequestMessage} Formatted request message
   */
  export function createRequest(method, payload = undefined, options = {}) {
    return {
      ...createBaseMessage(options),
      type: MessageType.REQUEST,
      requestId: options.requestId || crypto.randomUUID(),
      method,
      ...(payload !== undefined && { payload })
    };
  }