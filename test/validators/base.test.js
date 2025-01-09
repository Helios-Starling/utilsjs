import { expect, test, describe } from "bun:test";
import {
  validateBaseMessage,
  validateMethodName,
} from "../../src/validators/base.js";
import { MessageType, SizeLimits, Protocol, Patterns } from "../../src/constants/protocol.js";
import { estimateMessageSize } from "../../src/index.js";

describe('Base Message Validation', () => {
  test('validates a correct base message', () => {
    const message = {
      protocol: 'helios-starling',
      version: '1.0.0',
      timestamp: Date.now(),
      type: MessageType.REQUEST
    };

    const result = validateBaseMessage(message);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('fails on missing fields', () => {
    const message = {};
    const result = validateBaseMessage(message);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required field: protocol');
    expect(result.errors).toContain('Missing required field: version');
    expect(result.errors).toContain('Missing required field: timestamp');
    expect(result.errors).toContain('Missing required field: type');
  });

  test('fails on invalid protocol', () => {
    const message = {
      protocol: 'wrong-protocol',
      version: '1.0.0',
      timestamp: Date.now(),
      type: MessageType.REQUEST
    };

    const result = validateBaseMessage(message);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid protocol: must be "helios-starling"');
  });

  test('validates version format', () => {
    const testCases = [
      { version: '1.0.0', shouldPass: true },
      { version: '1.0', shouldPass: false },
      { version: '1.0.0.0', shouldPass: false },
      { version: 'abc', shouldPass: false },
      { version: '1.a.0', shouldPass: false },
    ];

    testCases.forEach(({ version, shouldPass }) => {
      const message = {
        protocol: 'helios-starling',
        version,
        timestamp: Date.now(),
        type: MessageType.REQUEST
      };

      const result = validateBaseMessage(message);
      expect(result.valid).toBe(shouldPass);
      if (!shouldPass) {
        expect(result.errors.some(e => e.includes('Version'))).toBe(true);
      }
    });
  });

  test('validates timestamp', () => {
    const testCases = [
      { timestamp: Date.now(), shouldPass: true },
      { timestamp: -1, shouldPass: false },
      { timestamp: 1.5, shouldPass: false },
      { timestamp: '123', shouldPass: false },
      { timestamp: null, shouldPass: false },
    ];

    testCases.forEach(({ timestamp, shouldPass }) => {
      const message = {
        protocol: 'helios-starling',
        version: '1.0.0',
        timestamp,
        type: MessageType.REQUEST
      };

      const result = validateBaseMessage(message);
      expect(result.valid).toBe(shouldPass);
      if (!shouldPass) {
        expect(result.errors.some(e => e.includes('Timestamp'))).toBe(true);
      }
    });
  });

  test('validates message type', () => {
    const testCases = [
      { type: MessageType.REQUEST, shouldPass: true },
      { type: MessageType.RESPONSE, shouldPass: true },
      { type: MessageType.NOTIFICATION, shouldPass: true },
      { type: 'invalid-type', shouldPass: false },
      { type: '', shouldPass: false },
    ];

    testCases.forEach(({ type, shouldPass }) => {
      const message = {
        protocol: 'helios-starling',
        version: '1.0.0',
        timestamp: Date.now(),
        type
      };

      const result = validateBaseMessage(message);
      expect(result.valid).toBe(shouldPass);
      if (!shouldPass) {
        expect(result.errors.some(e => e.includes('type'))).toBe(true);
      }
    });
  });
});

describe('Method Name Validation', () => {
  test('validates correct method names', () => {
    const validNames = [
      'users:getProfile',
      'auth:login',
      'data:sync:full',
      'messages:send:private'
    ];

    validNames.forEach(name => {
      const result = validateMethodName(name);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  test('rejects invalid method names', () => {
    const invalidNames = [
      ':invalid',
      'nonamespace',
      '123:invalid',
      'system:reserved',
      'internal:something',
      'a'.repeat(SizeLimits.MAX_METHOD_NAME + 1)
    ];

    invalidNames.forEach(name => {
      const result = validateMethodName(name);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Message Size Estimation', () => {
  test('estimates message size correctly', () => {
    const message = {
      protocol: 'helios-starling',
      version: '1.0.0',
      timestamp: Date.now(),
      type: MessageType.REQUEST
    };

    const size = estimateMessageSize(message);
    expect(size).toBeGreaterThan(0);
    expect(size).toBeLessThan(SizeLimits.MAX_MESSAGE_SIZE);
  });

  test('handles large messages', () => {
    const largeMessage = {
      protocol: 'helios-starling',
      version: '1.0.0',
      timestamp: Date.now(),
      type: MessageType.REQUEST,
      payload: 'a'.repeat(SizeLimits.MAX_MESSAGE_SIZE)
    };

    const size = estimateMessageSize(largeMessage);
    expect(size).toBeGreaterThan(SizeLimits.MAX_MESSAGE_SIZE);
  });
});

describe('Constants and Patterns', () => {
  test('UUID pattern matches valid UUIDs', () => {
    const validUUIDs = [
      '123e4567-e89b-12d3-a456-426614174000',
      '987fcdeb-51a2-4bc1-9d3e-123456789abc'
    ];

    validUUIDs.forEach(uuid => {
      expect(Patterns.UUID.test(uuid)).toBe(true);
    });
  });

  test('UUID pattern rejects invalid UUIDs', () => {
    const invalidUUIDs = [
      '123e4567',
      'not-a-uuid',
      '123e4567-e89b-12d3-a456-42661417400g'
    ];

    invalidUUIDs.forEach(uuid => {
      expect(Patterns.UUID.test(uuid)).toBe(false);
    });
  });
});