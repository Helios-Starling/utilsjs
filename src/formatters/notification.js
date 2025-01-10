import { MessageType } from "../constants/protocol";
import { createBaseMessage } from "./base";

/**
   * Creates a notification message
   * @param {*} data - Notification data
   * @param {string} [topic] - Optional routing topic
   * @param {Object} [options] - Notification options
   * @param {string} [options.version] - Protocol version
   * @returns {NotificationMessage} Formatted notification message
   */
  export function createNotification(data, topic = undefined, options = {}) {
    return {
      ...createBaseMessage(options),
      type: MessageType.NOTIFICATION,
      notification: {
        ...(topic !== undefined && { topic }),
        data
      }
    };
  }