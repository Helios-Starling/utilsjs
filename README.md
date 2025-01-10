# @helios-starling/utils

Core utilities and validators for the Helios-Starling protocol implementation.

[![npm version](https://img.shields.io/npm/v/@helios-starling/utils.svg)](https://www.npmjs.com/package/@helios-starling/utils)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

The `@helios-starling/utils` package provides essential utilities for implementing the Helios-Starling protocol, a WebSocket-based protocol designed for bidirectional request/response patterns. This package includes message validators, formatters, and common utilities used by both client and server implementations.

## Installation

```bash
# Using npm
npm install @helios-starling/utils

# Using yarn
yarn add @helios-starling/utils

# Using bun
bun add @helios-starling/utils
```

## Usage

### Message Validation

```javascript
import { validateRequest, validateResponse, validateNotification } from '@helios-starling/utils/validators';

// Validate a request message
const request = {
  protocol: 'helios-starling',
  version: '1.0.0',
  timestamp: Date.now(),
  type: 'request',
  requestId: crypto.randomUUID(),
  method: 'users:getProfile',
  payload: { userId: '123' }
};

const validation = validateRequest(request);
if (validation.valid) {
  console.log('Request is valid!');
} else {
  console.error('Validation errors:', validation.errors);
}
```

### Message Creation

```javascript
import { createRequest, createSuccessResponse, createNotification } from '@helios-starling/utils/formatters';

// Create a request
const request = createRequest('users:getProfile', { userId: '123' });

// Create a success response
const response = createSuccessResponse(request.requestId, { 
  name: 'John Doe',
  email: 'john@example.com'
});

// Create a notification
const notification = createNotification({ status: 'online' }, 'user:presence');
```

### Constants and Utilities

```javascript
import { MessageType, Protocol, SizeLimits } from '@helios-starling/utils/constants';
import { estimateMessageSize } from '@helios-starling/utils/utils';

// Check message size limits
const message = createRequest('users:upload', { data: largePayload });
const size = estimateMessageSize(message);

if (size > SizeLimits.MAX_MESSAGE_SIZE) {
  console.error('Message is too large!');
}
```

## API Reference

### Validators

#### `validateRequest(message, options?)`
Validates a request message against the protocol specification.

```javascript
const options = {
  validatePayload: true,
  payloadValidator: (payload) => ({
    valid: true,
    errors: []
  }),
  allowedMethods: ['users:getProfile', 'users:update'],
  maxPayloadSize: 1024 * 1024 // 1MB
};
```

#### `validateResponse(message, options?)`
Validates a response message.

```javascript
const options = {
  validateData: true,
  dataValidator: (data) => ({
    valid: true,
    errors: []
  }),
  requireRequestId: true,
  maxDataSize: 1024 * 1024
};
```

#### `validateNotification(message, options?)`
Validates a notification message.

```javascript
const options = {
  validateData: true,
  requireTopic: true,
  allowedTopics: ['user:presence', 'chat:message'],
  maxDataSize: 1024 * 1024
};
```

### Formatters

#### `createRequest(method, payload?, options?)`
Creates a new request message.

#### `createSuccessResponse(requestId, data?, options?)`
Creates a success response message.

#### `createErrorResponse(requestId, code, message, details?, options?)`
Creates an error response message.

#### `createNotification(data, topic?, options?)`
Creates a notification message.

### Constants

- `MessageType`: Standard message types
- `Protocol`: Protocol constants
- `SizeLimits`: Message size limits
- `ErrorCategory`: Standard error categories
- `CommonErrors`: Standard error codes
- `StandardMethods`: Standard protocol methods
- `StandardTopics`: Standard notification topics

### Utilities

- `estimateMessageSize(message)`: Estimates message size in bytes
- `parseMethod(method)`: Parses method name components
- `isSystemMethod(method)`: Checks if method is a system method
- `createTopicMatcher(pattern)`: Creates a topic matching function

## Advanced Usage

### Custom Validation

```javascript
import { validateRequest } from '@helios-starling/utils/validators';

// Custom payload validator
const customValidator = {
  validatePayload: true,
  payloadValidator: (payload) => {
    const errors = [];
    if (!payload.userId) {
      errors.push('userId is required');
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
};

const result = validateRequest(message, customValidator);
```

### Pattern Matching

```javascript
import { NotificationUtils } from '@helios-starling/utils/utils';

// Create a topic matcher
const matcher = NotificationUtils.createTopicMatcher('user:*');

// Test topics
console.log(matcher('user:presence')); // true
console.log(matcher('chat:message')); // false
```

## Contributing

We welcome contributions! Please see our [contributing guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Testing

```bash
# Run all tests
bun test

# Run specific test file
bun test test/validators/request.test.js
```

## License

MIT © Helios-Starling Team