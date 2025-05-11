/**
* Creates a notification message
* @param {string} [topic] - Routing topic
* @param {*} data - Notification data
* @param {import("../types/messages.d").NotificationOptions} [options] - Message options
* @returns {import("../types/messages.d").NotificationMessage} Formatted notification message
*/
export function createNotification(topic?: string, data: any, options?: import("../types/messages.d").NotificationOptions): import("../types/messages.d").NotificationMessage;
