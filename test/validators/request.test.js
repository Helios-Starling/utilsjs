import { expect, test, describe } from "bun:test";
import {
  validateRequest,
  DefaultRequestValidationOptions
} from "../../src/validators/request.js";
import { RequestErrorCode } from "../../src/constants/errors.js";
import { StandardMethods } from "../../src/constants/methods.js";
import { RequestUtils } from "../../src/utils/request.js";
import { parseMethod, isSystemMethod, isStandardMethod, buildMethod } from "../../src/utils/methods.js";
import { createRequest } from "../../src/formatters/request.js";
import { validateMethodName } from "../../src/validators/base.js";

describe('Request Message Validation', () => {
  const validRequest = {
    protocol: 'helios-starling',
    version: '1.0.0',
    timestamp: Date.now(),
    type: 'request',
    requestId: crypto.randomUUID(),
    method: 'users:getProfile'
  };

  test('validates a correct request message', () => {
    const result = validateRequest(validRequest);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('validates a request with payload', () => {
    const request = {
      ...validRequest,
      payload: { userId: 123 }
    };

    const result = validateRequest(request);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('fails on wrong message type', () => {
    const request = {
      ...validRequest,
      type: 'response'
    };

    const result = validateRequest(request);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('type'))).toBe(true);
  });

  test('validates requestId format', () => {
    const testCases = [
      { requestId: crypto.randomUUID(), shouldPass: true },
      { requestId: 'not-a-uuid', shouldPass: false },
      { requestId: 123, shouldPass: false },
      { requestId: '', shouldPass: false },
    ];

    testCases.forEach(({ requestId, shouldPass }) => {
      const request = { ...validRequest, requestId };
      const result = validateRequest(request);
      expect(result.valid).toBe(shouldPass);
      if (!shouldPass) {
        expect(result.errors.some(e => e.includes('requestId'))).toBe(true);
      }
    });
  });

  test('validates method names', () => {
    const testCases = [
      { method: 'users:getProfile', shouldPass: true },
      { method: 'auth:login', shouldPass: true },
      { method: 'invalidmethod', shouldPass: false },
      { method: 'system:reserved', shouldPass: false },
      { method: '', shouldPass: false },
    ];
  
    testCases.forEach(({ method, shouldPass }) => {
      const request = { ...validRequest, method };
      const result = validateRequest(request);
      
      // Test validity
      expect(result.valid).toBe(shouldPass);
      
      // For failing cases, check if any error is related to the method
      // by checking various possible error messages
      if (!shouldPass) {
        const hasMethodError = result.errors.some(e => 
          e.includes('method') || 
          e.includes('Method') ||
          e.includes('namespace') || 
          e.includes('Namespace')
        );
        expect(hasMethodError).toBe(true, `Expected error about method, got: ${result.errors.join(', ')}`);
      }
    });
  });

  test('handles custom payload validation', () => {
    const request = {
      ...validRequest,
      payload: { userId: 123 }
    };

    const options = {
      ...DefaultRequestValidationOptions,
      validatePayload: true,
      payloadValidator: (payload) => ({
        valid: typeof payload.userId === 'number',
        errors: typeof payload.userId !== 'number' ? ['userId must be a number'] : []
      })
    };

    // Valid payload
    let result = validateRequest(request, options);
    expect(result.valid).toBe(true);

    // Invalid payload
    const invalidRequest = {
      ...request,
      payload: { userId: '123' }
    };
    result = validateRequest(invalidRequest, options);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('userId'))).toBe(true);
  });

  test('validates against allowed methods', () => {
    const options = {
      ...DefaultRequestValidationOptions,
      allowedMethods: ['users:getProfile', 'users:updateProfile']
    };

    // Allowed method
    let result = validateRequest(validRequest, options);
    expect(result.valid).toBe(true);

    // Not allowed method
    const request = {
      ...validRequest,
      method: 'users:deleteProfile'
    };
    result = validateRequest(request, options);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('not allowed'))).toBe(true);
  });
});

describe('Request Creation', () => {
  test('creates a valid request message', () => {
    const method = 'users:getProfile';
    const payload = { userId: 123 };
    
    const request = createRequest(method, payload);
    
    expect(request.protocol).toBe('helios-starling');
    expect(request.version).toBe('1.0.0');
    expect(request.type).toBe('request');
    expect(request.method).toBe(method);
    expect(request.payload).toEqual(payload);
    expect(typeof request.timestamp).toBe('number');
    expect(typeof request.requestId).toBe('string');
    
    const validation = validateRequest(request);
    expect(validation.valid).toBe(true);
  });

  test('creates request with custom options', () => {
    const request = createRequest('users:getProfile', null, {
      requestId: crypto.randomUUID(),
      version: '1.1.0'
    });

    expect(request.version).toBe('1.1.0');
    expect(validateRequest(request).valid).toBe(true);
  });
});

describe('Method Utilities', () => {
  test('parses method components', () => {
    const testCases = [
      {
        input: 'users:getProfile',
        expected: { namespace: 'users', action: 'getProfile' }
      },
      {
        input: 'auth:tokens:refresh',
        expected: { namespace: 'auth', action: 'tokens:refresh' }
      }
    ];

    testCases.forEach(({ input, expected }) => {
      const result = parseMethod(input);
      expect(result).toEqual(expected);
    });
  });

  test('identifies system methods', () => {
    expect(isSystemMethod('system:ping')).toBe(true);
    expect(isSystemMethod('users:getProfile')).toBe(false);
  });

  test('identifies standard methods', () => {
    Object.values(StandardMethods).forEach(method => {
      expect(isStandardMethod(method)).toBe(true);
    });
    expect(isStandardMethod('custom:method')).toBe(false);
  });

  test('builds valid method names', () => {
    const method = buildMethod('users', 'getProfile');
    expect(method).toBe('users:getProfile');
    expect(validateMethodName(method).valid).toBe(true);

    expect(() => buildMethod('system', 'custom')).toThrow();
  });
});

describe('Request Utilities', () => {
  test('validates request messages', () => {
    const request = createRequest('users:getProfile');
    expect(RequestUtils.isRequest(request)).toBe(true);
    expect(RequestUtils.isRequest({})).toBe(false);
  });

  test('measures request size', () => {
    const request = createRequest('users:getProfile', { data: 'x'.repeat(1000) });
    const size = RequestUtils.getSize(request);
    expect(size).toBeGreaterThan(1000);
  });

  test('clones and modifies requests', () => {
    const original = createRequest('users:getProfile');
    const modified = RequestUtils.clone(original, { method: 'users:updateProfile' });

    expect(modified.requestId).toBe(original.requestId);
    expect(modified.method).toBe('users:updateProfile');
    expect(validateRequest(modified).valid).toBe(true);
  });
});