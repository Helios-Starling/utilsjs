  /**
   * Standard notification categories
   * @readonly
   * @enum {string}
   */
  export const NotificationCategory = {
    SYSTEM: 'system',
    STATE: 'state',
    USER: 'user',
    PRESENCE: 'presence',
    DATA: 'data',
    CUSTOM: 'custom'
  };
  
  /**
   * Standard notification topics
   * @readonly
   * @enum {string}
   */
  export const StandardTopics = {
    STATE_CHANGE: 'state:change',
    CONNECTION_STATE: 'connection:state',
    USER_PRESENCE: 'user:presence',
    USER_ACTIVITY: 'user:activity',
    DATA_CHANGE: 'data:change',
    DATA_SYNC: 'data:sync'
  };