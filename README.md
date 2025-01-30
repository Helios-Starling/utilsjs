# @helios-starling/utils

<div align="center">
  
[![npm version](https://img.shields.io/npm/v/@helios-starling/utils.svg?style=flat-square)](https://www.npmjs.org/package/@helios-starling/utils)
[![install size](https://img.shields.io/bundlephobia/min/@helios-starling/utils?style=flat-square)](https://bundlephobia.com/result?p=@helios-starling/utils)
[![npm downloads](https://img.shields.io/npm/dm/@helios-starling/utils.svg?style=flat-square)](https://npm-stat.com/charts.html?package=@helios-starling/utils)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)
  
</div>

<p align="center">
  <strong>Core utilities and foundation layer for the Helios-Starling protocol implementation</strong>
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#usage">Usage</a> •
  <a href="#api">API</a> •
  <a href="#advanced">Advanced</a> •
  <a href="#contributing">Contributing</a>
</p>

## Overview

Helios-Starling Utils provides the foundational building blocks for implementing the Helios-Starling protocol, a sophisticated WebSocket abstraction focused on bidirectional request/response patterns. This library contains all the shared utilities, validators, formatters, and core components used by both server (`@helios-starling/helios`) and client (`@helios-starling/starling`) implementations.

## Key Features

- **Protocol Implementation**: Complete implementation of the Helios-Starling protocol specification
- **Message Handling**: Robust message validation, formatting, and processing
- **Request Management**: Advanced request lifecycle management with timeout handling and retries
- **Event System**: Sophisticated event system with priority queues and filtering
- **Error Handling**: Comprehensive error management and standardized error types
- **Performance Optimized**: Built for high-performance real-time applications
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Extensible**: Modular architecture allowing easy customization and extension

## Installation

```bash
bun install @helios-starling/utils
```

## Architecture

The library is organized into several key modules:

### Core Components

- **Context**: Message context handling and lifecycle management
- **Events**: Advanced event system with filtering and prioritization
- **Request**: Request lifecycle and state management
- **Queue**: Priority-based request queue with retry capabilities
- **Method**: Method registration and execution framework
- **Buffer**: Message buffering for disconnected states

### Utilities

- **Message**: Message creation and manipulation utilities
- **Method**: Method name parsing and validation
- **Request**: Request creation and handling utilities
- **Response**: Response formatting and processing
- **Notification**: Notification system utilities
- **Retry**: Exponential backoff implementation with jitter

### Validators

Comprehensive validation system for all protocol messages:

```typescript
import { validateRequest, validateResponse, validateNotification } from '@helios-starling/utils';

// Validate a request message
const validation = validateRequest(message);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

### Message Formatters

Standardized message creation:

```typescript
import { createRequest, createSuccessResponse, createErrorResponse } from '@helios-starling/utils';

// Create a request
const request = createRequest('namespace:method', { data: 'payload' });

// Create a response
const response = createSuccessResponse(request.id, { result: 'success' });
```

## Usage

### Basic Protocol Message Handling

```typescript
import { resolve } from '@helios-starling/utils';

// Handle incoming messages
resolve(message)
  .onRequest(async request => {
    // Handle request
    console.log('Request received:', request.method);
  })
  .onResponse(response => {
    // Handle response
    console.log('Response received:', response.success);
  })
  .onNotification(notification => {
    // Handle notification
    console.log('Notification:', notification.topic);
  })
  .onViolation(violations => {
    // Handle protocol violations
    console.error('Protocol violated:', violations);
  });
```

### Request Management

```typescript
import { RequestsManager } from '@helios-starling/utils';

const manager = new RequestsManager(starling, events, {
  queue: {
    maxSize: 1000,
    maxRetries: 3,
    baseDelay: 1000
  }
});

// Execute a request
const request = manager.execute(starling, 'user:get', { id: 123 }, {
  timeout: 5000,
  retry: true
});

request
  .onProgress(progress => {
    console.log('Progress:', progress);
  })
  .onSuccess(response => {
    console.log('Success:', response);
  })
  .onError(error => {
    console.error('Error:', error);
  });
```

### Topic Management

```typescript
import { TopicsManager } from '@helios-starling/utils';

const topics = new TopicsManager(events);

// Subscribe to topics with pattern matching
topics.subscribe('user:*', async (context) => {
  const { topic, data } = context;
  console.log(`Received ${topic}:`, data);
}, {
  persistent: true,
  priority: 10
});

// Handle notifications
topics.handleNotification(starling, notificationContext);
```

## API

### Core Classes

#### RequestsManager

Manages the lifecycle of requests in the protocol:

```typescript
class RequestsManager {
  constructor(starling: Starling, events: Events, options?: {
    maxSize?: number;
    maxRetries?: number;
    baseDelay?: number;
    maxConcurrent?: number;
  });

  execute(starling: Starling, method: string, payload: any, options?: RequestOptions): Request;
  cancelAll(reason?: string): void;
  handleResponse(starling: Starling, response: ResponseMessage): void;
}
```

#### TopicsManager

Handles topic-based pub/sub functionality:

```typescript
class TopicsManager extends Events {
  constructor(events: Events);

  subscribe(topic: string, handler: NotificationHandler, options?: {
    persistent?: boolean;
    priority?: number;
    filter?: (data: any) => boolean;
  }): { off: () => void };

  handleNotification(starling: Starling, context: NotificationContext): Promise<void>;
}
```

#### Method

Handles method registration and execution:

```typescript
class Method {
  constructor(name: string, handler: MethodHandler, options?: MethodOptions);

  execute(context: RequestContext): Promise<void>;
  getMetrics(): MethodMetrics;
}
```

### Utilities

#### Message Validation

```typescript
function validateRequest(message: unknown, options?: RequestValidationOptions): ValidationResult;
function validateResponse(message: unknown, options?: ResponseValidationOptions): ValidationResult;
function validateNotification(message: unknown, options?: NotificationValidationOptions): ValidationResult;
```

#### Message Creation

```typescript
function createRequest(method: string, payload?: any, options?: RequestOptions): RequestMessage;
function createSuccessResponse(requestId: string, data?: any, options?: ResponseOptions): ResponseMessage;
function createErrorResponse(requestId: string, code: string, message: string, details?: any): ResponseMessage;
function createNotification(data: any, topic?: string, options?: NotificationOptions): NotificationMessage;
```

## Advanced Usage

### Custom Protocol Extensions

The protocol can be extended with custom message types and handlers:

```typescript
import { resolve, MessageType } from '@helios-starling/utils';

// Add custom message type handling
resolve(message, { allowCustomTypes: true })
  .onRequest(handleRequest)
  .onResponse(handleResponse)
  .onJson(handleCustomJson) // Handle non-protocol JSON
  .onBinary(handleBinaryData); // Handle raw binary data
```

### Advanced Request Queueing

Configure sophisticated request queueing behavior:

```typescript
const manager = new RequestsManager(starling, events, {
  queue: {
    maxSize: 1000,
    maxRetries: 3,
    baseDelay: 1000,
    maxConcurrent: 10,
    priorityQueuing: true,
    onFull: 'block',
    drainTimeout: 30000
  }
});
```

### Enhanced Error Handling

Implement comprehensive error handling:

```typescript
import { CommonErrors, ErrorCategory } from '@helios-starling/utils';

try {
  // Attempt operation
} catch (error) {
  switch (error.code) {
    case CommonErrors.METHOD_NOT_FOUND:
      // Handle method not found
      break;
    case CommonErrors.REQUEST_TIMEOUT:
      // Handle timeout
      break;
    default:
      if (error.category === ErrorCategory.PROTOCOL) {
        // Handle protocol error
      }
  }
}
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

MIT ©