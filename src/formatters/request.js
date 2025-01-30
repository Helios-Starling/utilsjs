import { MessageType } from "../constants/protocol";
import { createBaseMessage } from "./base";

/**
   * Creates a new request message
   * @param {import("../types/protocol.d").method} method - Method name
   * @param {import("../types/protocol.d").payload} [payload] - Optional request payload
   * @param {import("../types/messages.d").RequestOptions} [options] - Request options
   * @returns {import("../types/messages.d").RequestMessage} Formatted request message
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