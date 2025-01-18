import { CommonErrors } from '../constants';
import { NotificationContext } from '../core/context';

/**
 * 
 * @param {import('../core/starling').BaseStarling} starling Starling instance
 * @param {import('../validators/notification').NotificationMessage} message Notification message
 */
export const handleNotification = async (starling, message) => {

    /**
     * @type {import('../managers/topics').TopicsManager}
     */
    const topics = starling?._helios?._topics || starling?._topics;
    if (!topics) {
        throw {
            code: CommonErrors.INTERNAL_ERROR,
            message: 'Topics manager not found'
        };
    }

    /**
     * @type {import('../managers/requests').RequestsManager}
     */
    const requests = starling?._requests;
    if (!requests) {
        throw {
            code: CommonErrors.INTERNAL_ERROR,
            message: 'Requests manager not found'
        };
    }

    const { topic, data, metadata = {} } = message.notification;
    
    const notificationContext = new NotificationContext(starling, {topic, data}, {
        timestamp: message.timestamp,
        metadata: metadata,
        ...(message.requestId ? {requestId: message.requestId} : {})
    });

    if (!topic) {
        throw {
            code: CommonErrors.INVALID_MESSAGE,
            message: 'Notification topic is required',
        };
    }

    try {
        if (message.requestId) {
            
            requests.handleNotification(starling, notificationContext);
        } else {
            topics.handleNotification(starling, notificationContext);
        }
    } catch (error) {
        starling._events.emit('notification:error', {
            starling: starling,
            topic,
            error,
            debug: {
                type: 'error',
                message: `Notification handling error: ${error.message}`
            }
        });
        throw error;
    }

}