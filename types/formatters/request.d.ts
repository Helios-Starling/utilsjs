/**
   * Creates a new request message
   * @param {import("../types/protocol.d").method} method - Method name
   * @param {import("../types/protocol.d").payload} [payload] - Optional request payload
   * @param {import("../types/messages.d").RequestOptions} [options] - Request options
   * @returns {import("../types/messages.d").RequestMessage} Formatted request message
   */
export function createRequest(method: import("../types/protocol.d").method, payload?: import("../types/protocol.d").payload, options?: import("../types/messages.d").RequestOptions): import("../types/messages.d").RequestMessage;
