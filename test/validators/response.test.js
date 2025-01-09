import { expect, test, describe } from "bun:test";
import {
  validateResponse,
  DefaultResponseValidationOptions
} from "../../src/validators/response.js";
import { CommonErrors } from "../../src/constants/errors.js";
import { ResponseUtils } from "../../src/utils/response.js";
import {createErrorResponse, createSuccessResponse} from "../../src/formatters/response.js";


describe('Response Message Validation', () => {
  const validSuccessResponse = {
    protocol: 'helios-starling',
    version: '1.0.0',
    timestamp: Date.now(),
    type: 'response',
    requestId: crypto.randomUUID(),
    success: true,
    data: { result: 'ok' }
  };

  const validErrorResponse = {
    protocol: 'helios-starling',
    version: '1.0.0',
    timestamp: Date.now(),
    type: 'response',
    requestId: crypto.randomUUID(),
    success: false,
    error: {
      code: CommonErrors.VALIDATION_ERROR,
      message: 'Validation failed'
    }
  };

  test('validates a correct success response', () => {
    const result = validateResponse(validSuccessResponse);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('validates a correct error response', () => {
    const result = validateResponse(validErrorResponse);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('fails on wrong message type', () => {
    const response = {
      ...validSuccessResponse,
      type: 'request'
    };

    const result = validateResponse(response);
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
      const response = { ...validSuccessResponse, requestId };
      const result = validateResponse(response);
      expect(result.valid).toBe(shouldPass);
      if (!shouldPass) {
        expect(result.errors.some(e => e.includes('requestId'))).toBe(true);
      }
    });
  });

  test('validates success/error field combinations', () => {
    // Success response should not have error field
    const invalidSuccess = {
      ...validSuccessResponse,
      error: {
        code: 'SOME_ERROR',
        message: 'Should not be here'
      }
    };
    let result = validateResponse(invalidSuccess);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('should not contain error'))).toBe(true);

    // Error response must have error field
    const invalidError = {
      ...validErrorResponse,
      error: undefined
    };
    result = validateResponse(invalidError);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('must contain error'))).toBe(true);
  });

  test('validates error object structure', () => {
    const testCases = [
      {
        error: { code: 'ERROR', message: 'Valid error' },
        shouldPass: true
      },
      {
        error: { code: 'ERROR' }, // Missing message
        shouldPass: false
      },
      {
        error: { message: 'Missing code' }, // Missing code
        shouldPass: false
      },
      {
        error: { code: 123, message: 'Invalid code type' },
        shouldPass: false
      },
      {
        error: { code: 'ERROR', message: 'With details', details: { extra: 'info' } },
        shouldPass: true
      }
    ];

    testCases.forEach(({ error, shouldPass }) => {
      const response = {
        ...validErrorResponse,
        error
      };
      const result = validateResponse(response);
      expect(result.valid).toBe(shouldPass);
    });
  });

  test('handles custom data validation', () => {
    const options = {
      ...DefaultResponseValidationOptions,
      validateData: true,
      dataValidator: (data) => ({
        valid: typeof data.result === 'string',
        errors: typeof data.result !== 'string' ? ['result must be a string'] : []
      })
    };

    // Valid data
    let result = validateResponse(validSuccessResponse, options);
    expect(result.valid).toBe(true);

    // Invalid data
    const invalidResponse = {
      ...validSuccessResponse,
      data: { result: 123 }
    };
    result = validateResponse(invalidResponse, options);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('result must be a string'))).toBe(true);
  });
});

describe('Response Creation', () => {
  test('creates valid success response', () => {
    const requestId = crypto.randomUUID();
    const data = { result: 'ok' };
    
    const response = createSuccessResponse(requestId, data);
    
    expect(response.protocol).toBe('helios-starling');
    expect(response.version).toBe('1.0.0');
    expect(response.type).toBe('response');
    expect(response.requestId).toBe(requestId);
    expect(response.success).toBe(true);
    expect(response.data).toEqual(data);
    
    const validation = validateResponse(response);
    expect(validation.valid).toBe(true);
  });

  test('creates valid error response', () => {
    const requestId = crypto.randomUUID();
    const code = CommonErrors.VALIDATION_ERROR;
    const message = 'Validation failed';
    const details = { field: 'username' };
    
    const response = createErrorResponse(requestId, code, message, details);
    
    expect(response.protocol).toBe('helios-starling');
    expect(response.success).toBe(false);
    expect(response.error.code).toBe(code);
    expect(response.error.message).toBe(message);
    expect(response.error.details).toEqual(details);
    
    const validation = validateResponse(response);
    expect(validation.valid).toBe(true);
  });

  test('creates responses with custom version', () => {
    const requestId = crypto.randomUUID();
    const options = { version: '1.1.0' };

    const successResponse = createSuccessResponse(requestId, null, options);
    expect(successResponse.version).toBe('1.1.0');
    expect(validateResponse(successResponse).valid).toBe(true);

    const errorResponse = createErrorResponse(requestId, 'ERROR', 'message', null, options);
    expect(errorResponse.version).toBe('1.1.0');
    
    // Ajoutons ceci pour debug
    const validation = validateResponse(errorResponse);
    
    expect(validateResponse(errorResponse).valid).toBe(true);
});
});

describe('Response Utilities', () => {
  test('validates response messages', () => {
    const successResponse = createSuccessResponse(crypto.randomUUID());
    const errorResponse = createErrorResponse(crypto.randomUUID(), 'ERROR', 'message');

    expect(ResponseUtils.isResponse(successResponse)).toBe(true);
    expect(ResponseUtils.isResponse(errorResponse)).toBe(true);
    expect(ResponseUtils.isResponse({})).toBe(false);
  });

  test('checks response success', () => {
    const successResponse = createSuccessResponse(crypto.randomUUID());
    const errorResponse = createErrorResponse(crypto.randomUUID(), 'ERROR', 'message');

    expect(ResponseUtils.isSuccess(successResponse)).toBe(true);
    expect(ResponseUtils.isSuccess(errorResponse)).toBe(false);
  });

  test('measures response size', () => {
    const response = createSuccessResponse(crypto.randomUUID(), {
      data: 'x'.repeat(1000)
    });
    const size = ResponseUtils.getSize(response);
    expect(size).toBeGreaterThan(1000);
  });
});