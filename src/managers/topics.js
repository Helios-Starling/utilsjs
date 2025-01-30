import { NotificationContext } from "../core/context";
import { Events } from "../core/events";


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
    constructor(events) {
        super();
        this._events = events;
        
        this.use(async (event) => {
            if (event.data?.debug !== false) {
                this._events.emit('topic:handled', {
                    topic: event.name,
                    starling: event.data?.starling,
                    debug: {
                        type: 'info',
                        message: `Handling topic ${event.name}`
                    }
                });
            }
        });
        
        this._handlerOptions = new Map();
    }
    
    
    
    /**
    * Subscribe to a topic with enhanced options
    * @param {string} topic Topic to subscribe to (supports wildcards)
    * @param {function(import('../core/context').NotificationContext): Promise<void>} handler Notification handler
    * @param {TopicHandlerOptions} [options={}] Subscription options
    * @returns {SubscriptionResult} Subscription handle with .off() method
    */
    subscribe(topic, handler, options = {}) {
        const wrappedHandler = async event => {
            try {
                const { data, starling, metadata = {} } = event.data;
                
                if (options.filter && !options.filter(data)) {
                    return;
                }
                
                const context = new NotificationContext(starling, {
                    data,
                    topic: event.name,
                }, {metadata, timestamp: event.timestamp});
                
                await handler(context);
            } catch (error) {
                this._events.emit('topic:error', {
                    topic,
                    error,
                    debug: {
                        type: 'error',
                        message: `Error handling topic ${topic}`
                    }
                });
            }
        }
        
        this._handlerOptions.set(wrappedHandler, {
            topic,
            persistent: options.persistent || false,
        });
        

        const listener = this.on(topic, wrappedHandler, {
            priority: options.priority || 0
        });
        
        return {
            off: () => {
                this._handlerOptions.delete(wrappedHandler);
                listener.off();
            }
        };
    }
    
    
    /**
    * Handle an incoming notification
    * @param {import('../core/starling').Starling} starling Starling instance
    * @param {import('../core/context').NotificationContext} context Notification context
    */
    async handleNotification(starling, context) {
        try {
            await this.emit(context.topic, context);
        } catch (error) {
            this._events.emit('notification:error', {
                starling: starling,
                topic: context.topic,
                notification: context.data,
                error,
                debug: {
                    type: 'error',
                    message: `Failed to handle notification: ${error.message}`
                }
            });
        }
    }
}