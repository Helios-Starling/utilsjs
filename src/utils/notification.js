  import { validateNotification } from "../validators/notification";
  import { Patterns } from "../constants/protocol";
  import { estimateMessageSize } from "./message";
  
  /**
   * Notification utilities
   * @type {Object}
   */
  export const NotificationUtils = {
    /**
     * Checks if a value is a valid notification message
     * @param {unknown} value - Value to check
     * @returns {boolean} Whether the value is a valid notification
     */
    isNotification(value) {
      return validateNotification(value).valid;
    },
  
    /**
     * Gets topic category
     * @param {string} topic - Topic to analyze
     * @returns {string|null} Topic category or null if invalid
     */
    getTopicCategory(topic) {
      // Doit avoir un format valide ET contenir au moins un ':'
      if (!Patterns.TOPIC_NAME.test(topic) || !topic.includes(':')) {
          return null;
      }
      
      return topic.split(':')[0];
  },
  
    /**
     * Gets notification size in bytes
     * @param {NotificationMessage} notification - Notification to measure
     * @returns {number} Size in bytes
     */
    getSize(notification) {
      return estimateMessageSize(notification);
    },
  
    /**
     * Creates a topic matcher function
     * @param {string} pattern - Topic pattern (supports wildcards: *)
     * @returns {function(string): boolean} Function that matches topics against pattern
     */
    createTopicMatcher(pattern) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '[^:]+') + '$');
      return (topic) => regex.test(topic);
    }
  };