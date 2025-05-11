/**
* @typedef {Object} TopicHandlerOptions
* @property {boolean} [persistent=false] - Whether the handler survives reconnections
* @property {number} [priority=0] - Handler priority (higher = executed first)
* @property {function} [filter] - Optional filter function for notifications
*/
/**
* @typedef {Object} SubscriptionResult
* @property {function} off - Unsubscribe function
*/
/**
* Extended Pulse event emitter for topic-based notifications
* @extends Events
*/
export class TopicsManager extends Events {
    /**
    * @param {import('../core/events').Events} events Events manager (binding to Helios for server, Starling for client)
    */
    constructor(events: import("../core/events").Events);
    _events: Events;
    _handlerOptions: Map<any, any>;
    /**
    * Subscribe to a topic with enhanced options
    * @param {string} topic Topic to subscribe to (supports wildcards)
    * @param {function(import('../core/context').NotificationContext): Promise<void>} handler Notification handler
    * @param {TopicHandlerOptions} [options={}] Subscription options
    * @returns {SubscriptionResult} Subscription handle with .off() method
    */
    subscribe(topic: string, handler: (arg0: import("../core/context").NotificationContext) => Promise<void>, options?: TopicHandlerOptions): SubscriptionResult;
    /**
    * Handle an incoming notification
    * @param {import('../core/starling').Starling} starling Starling instance
    * @param {import('../core/context').NotificationContext} context Notification context
    */
    handleNotification(starling: import("../core/starling").Starling, context: import("../core/context").NotificationContext): Promise<void>;
}
export type TopicHandlerOptions = {
    /**
     * - Whether the handler survives reconnections
     */
    persistent?: boolean;
    /**
     * - Handler priority (higher = executed first)
     */
    priority?: number;
    /**
     * - Optional filter function for notifications
     */
    filter?: Function;
};
export type SubscriptionResult = {
    /**
     * - Unsubscribe function
     */
    off: Function;
};
import { Events } from "../core/events";
