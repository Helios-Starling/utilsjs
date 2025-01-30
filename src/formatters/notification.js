import { MessageType } from "../constants/protocol";
import { createBaseMessage } from "./base";

/**
* Creates a notification message
* @param {string} [topic] - Routing topic
* @param {*} data - Notification data
* @param {import("../types/messages.d").NotificationOptions} [options] - Message options
* @returns {import("../types/messages.d").NotificationMessage} Formatted notification message
*/
export function createNotification(topic, data, options = {}) {
  return {
    ...createBaseMessage(options),
    type: MessageType.NOTIFICATION,
    ...(options.requestId !== undefined && { requestId: options.requestId }),
    notification: {
      ...(topic !== undefined && { topic }),
      data
    }
  };
}