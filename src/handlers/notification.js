import { CommonErrors } from '../constants';


/**
 * 
 * @param {import('../core/starling').BaseStarling} starling Starling instance
 * @param {import('../core').NotificationContext} context Notification context
 */
export const handleNotification = async (starling, context) => {

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


    if (!context.topic) {
        throw {
            code: CommonErrors.INVALID_MESSAGE,
            message: 'Notification topic is required',
        };
    }

    try {
        if (context.requestId) {
            requests.handleNotification(starling, context);
        } else {
            topics.handleNotification(starling, context);
        }
    } catch (error) {
        starling._events.emit('notification:error', {
            starling: starling,
            topic: context.topic,
            error,
            debug: {
                type: 'error',
                message: `Notification handling error: ${error.message}`
            }
        });
        throw error;
    }

}