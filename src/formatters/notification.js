import { MessageType } from "../constants/protocol";

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
      protocol: 'helios-starling',
      version: options.version || '1.0.0',
      timestamp: Date.now(),
      type: MessageType.NOTIFICATION,
      notification: {
        ...(topic !== undefined && { topic }),
        data
      }
    };
  }