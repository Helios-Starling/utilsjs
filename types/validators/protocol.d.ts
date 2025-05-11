/**
 * Core message resolution for the Helios-Starling protocol.
 * Immediately validates and resolves any incoming message, providing
 * typed handlers for different message formats.
 *
 * @param {unknown} message Message to resolve
 * @param {ResolutionOptions} [options] Resolution options
 * @returns {ProtocolResolution} Resolution handler
 *
 * @example
 * // Basic protocol handling
 * resolve(message)
 *   .onViolation(violations => {
 *     console.error('Protocol violated:', violations);
 *   })
 *   .onRequest(handleRequest)
 *   .onResponse(handleResponse);
 *
 * // Non-protocol message handling
 * resolve(message)
 *   .onText(text => {
 *     console.log('Received text:', text);
 *   })
 *   .onJson(data => {
 *     console.log('Received JSON:', data);
 *   })
 *   .onBinary(buffer => {
 *     console.log('Received binary data:', buffer);
 *   });
 *
 * // Format checking
 * const resolution = resolve(message);
 *
 * if (resolution.isBinary()) {
 *   const buffer = resolution.getBinary();
 *   // Process binary data...
 * } else if (resolution.isJson()) {
 *   const data = resolution.getJson();
 *   // Process JSON data...
 * }
 */
export function resolve(message: unknown, options?: ResolutionOptions): ProtocolResolution;
/**
 * Message format enumeration
 */
export type MessageFormat = string;
export namespace MessageFormat {
    let BINARY: string;
    let JSON: string;
    let TEXT: string;
    let PROTOCOL: string;
}
/**
 * Resolution options
 */
export type ResolutionOptions = {
    /**
     * Whether to enforce strict protocol validation
     */
    strict?: boolean;
    /**
     * Whether to allow custom message types
     */
    allowCustomTypes?: boolean;
    /**
     * Maximum allowed message size in bytes
     */
    maxMessageSize?: number;
    /**
     * Validation level
     */
    level?: ValidationLevel;
};
/**
 * Handler types
 */
export type MessageHandler = (message: unknown) => void;
/**
 * Handler types
 */
export type ViolationHandler = (violations: string[]) => void;
/**
 * Handler types
 */
export type TextHandler = (text: string) => void;
/**
 * Handler types
 */
export type JsonHandler = (data: object) => void;
/**
 * Handler types
 */
export type BinaryHandler = (data: ArrayBuffer | Uint8Array) => void;
/**
 * Resolution result object
 */
export type ResolutionResult = {
    /**
     * Detected message format
     */
    format: MessageFormat;
    /**
     * Whether the message is valid
     */
    isValid: boolean;
    /**
     * Array of protocol violations if any
     */
    violations: string[];
    /**
     * Resolved protocol message type if applicable
     */
    type?: string;
};
/**
 * Resolution options
 * @typedef {Object} ResolutionOptions
 * @property {boolean} [strict=true] Whether to enforce strict protocol validation
 * @property {boolean} [allowCustomTypes=false] Whether to allow custom message types
 * @property {number} [maxMessageSize] Maximum allowed message size in bytes
 * @property {ValidationLevel} [level=ValidationLevel.PROTOCOL] Validation level
 */
/**
 * Handler types
 * @typedef {(message: unknown) => void} MessageHandler
 * @typedef {(violations: string[]) => void} ViolationHandler
 * @typedef {(text: string) => void} TextHandler
 * @typedef {(data: object) => void} JsonHandler
 * @typedef {(data: ArrayBuffer|Uint8Array) => void} BinaryHandler
 */
/**
 * Resolution result object
 * @typedef {Object} ResolutionResult
 * @property {MessageFormat} format Detected message format
 * @property {boolean} isValid Whether the message is valid
 * @property {string[]} violations Array of protocol violations if any
 * @property {string} [type] Resolved protocol message type if applicable
 */
/**
 * Protocol Resolution class
 * Immediately resolves and validates any incoming message, providing typed handlers
 * for different message formats and protocol types.
 */
declare class ProtocolResolution {
    /**
     * Creates a new protocol resolution instance
     * @param {unknown} message Message to resolve
     * @param {ResolutionOptions} [options] Resolution options
     */
    constructor(message: unknown, options?: ResolutionOptions);
    /** @private */
    private _violations;
    /** @private */
    private _resolvedType;
    /** @private */
    private _parsedData;
    /** @private */
    private _options;
    /** @private */
    private _message;
    /** @private */
    private _format;
    /**
     * Detects the format of the incoming message
     * @private
     * @param {unknown} message Message to analyze
     * @returns {MessageFormat} Detected format
     */
    private _detectFormat;
    /**
     * Checks if a message follows the protocol format
     * @private
     * @param {object} message Message to check
     * @returns {boolean} Whether it's a protocol message
     */
    private _isProtocolMessage;
    /**
     * Resolves and validates the message
     * @private
     */
    private _resolveMessage;
    /**
     * Validates base protocol requirements
     * @private
     */
    private _validateBase;
    /**
     * Validates type-specific message structure
     * @private
     */
    private _validateType;
    /**
     * Adds a protocol violation
     * @private
     * @param {string} violation Violation description
     */
    private _addViolation;
    /**
     * Gets resolution result
     * @returns {ResolutionResult} Complete resolution result
     */
    getResult(): ResolutionResult;
    /**
     * Gets detected message format
     * @returns {MessageFormat} Message format
     */
    getFormat(): MessageFormat;
    /**
     * Gets resolved protocol message type if applicable
     * @returns {string|null} Message type or null
     */
    getType(): string | null;
    /**
     * Gets protocol violations if any
     * @returns {string[]} List of violations
     */
    getViolations(): string[];
    /**
     * Gets binary data if message is binary
     * @returns {ArrayBuffer|Uint8Array|null} Binary data or null
     */
    getBinary(): ArrayBuffer | Uint8Array | null;
    /**
     * Gets JSON data if message is JSON
     * @returns {object|null} Parsed JSON object or null
     */
    getJson(): object | null;
    /**
     * Gets text content if message is text
     * @returns {string|null} Text content or null
     */
    getText(): string | null;
    /**
     * Checks message format
     */
    isBinary(): boolean;
    isJson(): boolean;
    isText(): boolean;
    isProtocol(): boolean;
    /**
     * Checks if protocol message is valid
     * @returns {boolean} Whether message is valid
     */
    isValid(): boolean;
    /**
     * Subscribes to text messages
     * @param {TextHandler} handler Text handler
     * @returns {this} For chaining
     */
    onText(handler: TextHandler): this;
    /**
     * Subscribes to JSON messages (non-protocol)
     * @param {JsonHandler} handler JSON handler
     * @returns {this} For chaining
     */
    onJson(handler: JsonHandler): this;
    /**
     * Subscribes to binary messages
     * @param {BinaryHandler} handler Binary handler
     * @returns {this} For chaining
     */
    onBinary(handler: BinaryHandler): this;
    /**
     * Subscribes to protocol violations
     * @param {ViolationHandler} handler Violation handler
     * @returns {this} For chaining
     */
    onViolation(handler: ViolationHandler): this;
    /**
     * Subscribes to request messages
     * @param {MessageHandler} handler Request handler
     * @returns {this} For chaining
     */
    onRequest(handler: MessageHandler): this;
    /**
     * Subscribes to response messages
     * @param {MessageHandler} handler Response handler
     * @returns {this} For chaining
     */
    onResponse(handler: MessageHandler): this;
    /**
     * Subscribes to notification messages
     * @param {MessageHandler} handler Notification handler
     * @returns {this} For chaining
     */
    onNotification(handler: MessageHandler): this;
    /**
     * Subscribes to ack messages
     * @param {MessageHandler} handler Ack handler
     * @returns {this} For chaining
     */
    onAck(handler: MessageHandler): this;
    /**
     * Subscribes to error messages
     * @param {MessageHandler} handler Error message handler
     * @returns {this} For chaining
     */
    onErrorMessage(handler: MessageHandler): this;
    /**
     * Enables non-strict mode
     * @returns {this} For chaining
     */
    lenient(): this;
}
import { ValidationLevel } from "../constants/protocol.js";
export {};
