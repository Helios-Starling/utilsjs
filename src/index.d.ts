// Type definitions for @helios-starling/utils
// Project: https://github.com/helios-starling/utilsjs
// Definitions by: [Your Name]

export = HeliosUtils;
export as namespace HeliosUtils;

declare namespace HeliosUtils {
    // ============= Common Types =============
    export interface ValidationResult {
        valid: boolean;
        errors: string[];
    }

    export interface ExtendedValidationResult extends ValidationResult {
        details?: Record<string, any>;
        size?: number;
    }

    // ============= Message Types =============
    export interface BaseMessage {
        protocol: 'helios-starling';
        version: string;
        timestamp: number;
        type: MessageType;
    }

    export interface RequestMessage extends BaseMessage {
        type: 'request';
        requestId: string;
        method: string;
        payload?: any;
    }

    export interface ResponseMessage extends BaseMessage {
        type: 'response';
        requestId: string;
        success: boolean;
        data?: any;
        error?: ResponseError;
    }

    export interface ResponseError {
        code: string;
        message: string;
        details?: any;
    }

    export interface NotificationMessage extends BaseMessage {
        type: 'notification';
        notification: {
            topic?: string;
            data: any;
        };
    }

    // ============= Validation Options =============
    export interface ValidationOptions {
        strict?: boolean;
        allowExtraFields?: boolean;
        maxSize?: number;
    }

    export interface RequestValidationOptions {
        validatePayload?: boolean;
        payloadValidator?: (payload: any) => ValidationResult;
        allowedMethods?: string[];
        maxPayloadSize?: number;
    }

    export interface ResponseValidationOptions {
        validateData?: boolean;
        dataValidator?: (data: any) => ValidationResult;
        requireRequestId?: boolean;
        maxDataSize?: number;
    }

    export interface NotificationValidationOptions {
        validateData?: boolean;
        dataValidator?: (data: any) => ValidationResult;
        requireTopic?: boolean;
        allowedTopics?: string[];
        maxDataSize?: number;
    }

    // ============= Constants =============
    export enum MessageType {
        REQUEST = 'request',
        RESPONSE = 'response',
        NOTIFICATION = 'notification'
    }

    export interface Protocol {
        NAME: 'helios-starling';
        CURRENT_VERSION: string;
        MIN_VERSION: string;
        DEFAULT_BUFFER_SIZE: number;
        DEFAULT_TIMEOUT: number;
    }

    export interface Patterns {
        VERSION: RegExp;
        METHOD_NAME: RegExp;
        TOPIC_NAME: RegExp;
        UUID: RegExp;
    }

    export interface SizeLimits {
        MAX_MESSAGE_SIZE: number;
        MAX_METHOD_NAME: number;
        MAX_ERROR_MESSAGE: number;
        MAX_TOPIC_NAME: number;
    }

    export interface TimeConstants {
        MIN_TIMESTAMP: number;
        MAX_REQUEST_TIMEOUT: number;
        DEFAULT_REQUEST_TIMEOUT: number;
        MIN_REQUEST_TIMEOUT: number;
        RECONNECT_MIN_DELAY: number;
        RECONNECT_MAX_DELAY: number;
    }

    export interface StandardMethods {
        GET_TOKEN: 'starling:getToken';
        PING: 'system:ping';
        CAPABILITIES: 'system:capabilities';
    }

    export interface ErrorCategory {
        PROTOCOL: 'PROTOCOL';
        METHOD: 'METHOD';
        REQUEST: 'REQUEST';
        AUTH: 'AUTH';
        VALIDATION: 'VALIDATION';
        INTERNAL: 'INTERNAL';
    }

    export interface CommonErrors {
        INVALID_MESSAGE: string;
        VERSION_MISMATCH: string;
        METHOD_NOT_FOUND: string;
        METHOD_ERROR: string;
        INVALID_REQUEST: string;
        REQUEST_TIMEOUT: string;
        UNAUTHORIZED: string;
        FORBIDDEN: string;
        VALIDATION_ERROR: string;
        INTERNAL_ERROR: string;
    }

    // ============= Validators =============
    export function validateBaseMessage(message: unknown): ValidationResult;
    export function validateMethodName(methodName: string): ValidationResult;
    export function validateRequest(message: unknown, options?: RequestValidationOptions): ValidationResult;
    export function validateResponse(message: unknown, options?: ResponseValidationOptions): ValidationResult;
    export function validateNotification(message: unknown, options?: NotificationValidationOptions): ValidationResult;
    export function validateMessage(message: unknown, options?: ValidationOptions): ExtendedValidationResult;

    // ============= Formatters =============
    export interface MessageOptions {
        version?: string;
    }

    export interface RequestOptions extends MessageOptions {
        requestId?: string;
    }

    export function createRequest(method: string, payload?: any, options?: RequestOptions): RequestMessage;
    export function createSuccessResponse(requestId: string, data?: any, options?: MessageOptions): ResponseMessage;
    export function createErrorResponse(requestId: string, code: string, message: string, details?: any, options?: MessageOptions): ResponseMessage;
    export function createNotification(data: any, topic?: string, options?: MessageOptions): NotificationMessage;

    // ============= Utils =============
    export interface RequestUtils {
        isRequest(value: unknown): boolean;
        getSize(request: RequestMessage): number;
        clone(request: RequestMessage, changes?: Partial<RequestMessage>): RequestMessage;
    }

    export interface ResponseUtils {
        isResponse(value: unknown): boolean;
        isSuccess(response: ResponseMessage): boolean;
        getSize(response: ResponseMessage): number;
    }

    export interface NotificationUtils {
        isNotification(value: unknown): boolean;
        getTopicCategory(topic: string): string | null;
        getSize(notification: NotificationMessage): number;
        createTopicMatcher(pattern: string): (topic: string) => boolean;
    }

    export interface MethodUtils {
        parseMethod(method: string): { namespace: string; action: string; };
        isSystemMethod(method: string): boolean;
        isStandardMethod(method: string): boolean;
        buildMethod(namespace: string, action: string): string;
    }

    export function getCurrentTimestamp(): number;
    export function estimateMessageSize(message: object): number;
    export function isValidVersion(version: string): boolean;
    export function isValidTimestamp(timestamp: number): boolean;
}