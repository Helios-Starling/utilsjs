import { expect, test, describe } from "bun:test";
import {
  validateNotification,
  DefaultNotificationValidationOptions
} from "../../src/validators/notification.js";
import { createNotification } from "../../src/formatters/notification.js";
import { NotificationUtils } from "../../src/utils/notification.js";
import { StandardTopics, NotificationCategory } from "../../src/constants/notification.js";

describe('Notification Message Validation', () => {
  const validNotification = {
    protocol: 'helios-starling',
    version: '1.0.0',
    timestamp: Date.now(),
    type: 'notification',
    notification: {
      topic: 'user:presence',
      data: { userId: '123', status: 'online' }
    }
  };

  test('validates a correct notification message', () => {
    const result = validateNotification(validNotification);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('validates notification without topic', () => {
    const notificationWithoutTopic = {
      ...validNotification,
      notification: {
        data: { event: 'something-happened' }
      }
    };

    const result = validateNotification(notificationWithoutTopic);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('fails on wrong message type', () => {
    const notification = {
      ...validNotification,
      type: 'request'
    };

    const result = validateNotification(notification);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('type'))).toBe(true);
  });

  test('validates topic format', () => {
    const testCases = [
      { topic: 'user:presence', shouldPass: true },
      { topic: 'data:sync:complete', shouldPass: true },
      { topic: 'invalid:', shouldPass: false },
      { topic: ':invalid', shouldPass: false },
      { topic: 'no-colon', shouldPass: false },
      { topic: '123:invalid', shouldPass: false }
    ];

    testCases.forEach(({ topic, shouldPass }) => {
      const notification = {
        ...validNotification,
        notification: {
          topic,
          data: { test: true }
        }
      };
      
      const result = validateNotification(notification);
      expect(result.valid).toBe(shouldPass);
      if (!shouldPass) {
        expect(result.errors.some(e => e.includes('topic'))).toBe(true);
      }
    });
  });

  test('enforces required topic when configured', () => {
    const notificationWithoutTopic = {
      ...validNotification,
      notification: {
        data: { event: 'something-happened' }
      }
    };

    const options = {
      ...DefaultNotificationValidationOptions,
      requireTopic: true
    };

    const result = validateNotification(notificationWithoutTopic, options);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('topic is required'))).toBe(true);
  });

  test('validates against allowed topics', () => {
    const options = {
      ...DefaultNotificationValidationOptions,
      allowedTopics: ['user:presence', 'user:activity']
    };

    // Allowed topic
    let result = validateNotification(validNotification, options);
    expect(result.valid).toBe(true);

    // Not allowed topic
    const notification = {
      ...validNotification,
      notification: {
        topic: 'user:unauthorized',
        data: { test: true }
      }
    };
    result = validateNotification(notification, options);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('not allowed'))).toBe(true);
  });

  test('handles custom data validation', () => {
    const options = {
      ...DefaultNotificationValidationOptions,
      validateData: true,
      dataValidator: (data) => ({
        valid: typeof data.userId === 'string',
        errors: typeof data.userId !== 'string' ? ['userId must be a string'] : []
      })
    };

    // Valid data
    let result = validateNotification(validNotification, options);
    expect(result.valid).toBe(true);

    // Invalid data
    const invalidNotification = {
      ...validNotification,
      notification: {
        topic: 'user:presence',
        data: { userId: 123, status: 'online' }
      }
    };
    result = validateNotification(invalidNotification, options);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('userId must be a string'))).toBe(true);
  });

  test('validates data size limits', () => {
    const options = {
      ...DefaultNotificationValidationOptions,
      maxDataSize: 50
    };

    const largeNotification = {
      ...validNotification,
      notification: {
        topic: 'data:large',
        data: { content: 'x'.repeat(1000) }
      }
    };

    const result = validateNotification(largeNotification, options);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('size') && e.includes('exceeds'))).toBe(true);
  });
});

describe('Notification Creation', () => {
  test('creates valid notification message', () => {
    const data = { userId: '123', status: 'online' };
    const topic = 'user:presence';
    
    const notification = createNotification(data, topic);
    
    expect(notification.protocol).toBe('helios-starling');
    expect(notification.version).toBe('1.0.0');
    expect(notification.type).toBe('notification');
    expect(notification.notification.topic).toBe(topic);
    expect(notification.notification.data).toEqual(data);
    
    const validation = validateNotification(notification);
    expect(validation.valid).toBe(true);
  });

  test('creates notification without topic', () => {
    const data = { event: 'something-happened' };
    const notification = createNotification(data);
    
    expect(notification.notification.topic).toBeUndefined();
    expect(notification.notification.data).toEqual(data);
    
    const validation = validateNotification(notification);
    expect(validation.valid).toBe(true);
  });

  test('creates notification with custom version', () => {
    const notification = createNotification({ test: true }, 'test:topic', {
      version: '1.1.0'
    });

    expect(notification.version).toBe('1.1.0');
    expect(validateNotification(notification).valid).toBe(true);
  });
});

describe('Notification Utilities', () => {
  test('validates notification messages', () => {
    const notification = createNotification({ test: true }, 'test:topic');
    expect(NotificationUtils.isNotification(notification)).toBe(true);
    expect(NotificationUtils.isNotification({})).toBe(false);
  });

  test('extracts topic category', () => {
    const testCases = [
      { topic: 'user:presence', expected: 'user' },
      { topic: 'data:sync:complete', expected: 'data' },
      { topic: 'invalid', expected: null },
      { topic: ':invalid', expected: null }
    ];

    testCases.forEach(({ topic, expected }) => {
      expect(NotificationUtils.getTopicCategory(topic)).toBe(expected);
    });
  });

  test('measures notification size', () => {
    const notification = createNotification({
      data: 'x'.repeat(1000)
    }, 'test:topic');
    
    const size = NotificationUtils.getSize(notification);
    expect(size).toBeGreaterThan(1000);
  });

  test('creates working topic matcher', () => {
    const testCases = [
      { pattern: 'user:*', topic: 'user:presence', shouldMatch: true },
      { pattern: 'user:*', topic: 'data:sync', shouldMatch: false },
      { pattern: 'data:sync:*', topic: 'data:sync:complete', shouldMatch: true },
      { pattern: 'data:*:end', topic: 'data:sync:end', shouldMatch: true }
    ];

    testCases.forEach(({ pattern, topic, shouldMatch }) => {
      const matcher = NotificationUtils.createTopicMatcher(pattern);
      expect(matcher(topic)).toBe(shouldMatch);
    });
  });
});

describe('Standard Topics and Categories', () => {
  test('validates all standard topics', () => {
    Object.values(StandardTopics).forEach(topic => {
      const notification = createNotification({ test: true }, topic);
      expect(validateNotification(notification).valid).toBe(true);
    });
  });

  test('maps topics to correct categories', () => {
    const categoryMappings = {
      [StandardTopics.STATE_CHANGE]: NotificationCategory.STATE,
      [StandardTopics.USER_PRESENCE]: NotificationCategory.USER,
      [StandardTopics.DATA_CHANGE]: NotificationCategory.DATA
    };

    Object.entries(categoryMappings).forEach(([topic, expectedCategory]) => {
      expect(NotificationUtils.getTopicCategory(topic)).toBe(expectedCategory);
    });
  });
});