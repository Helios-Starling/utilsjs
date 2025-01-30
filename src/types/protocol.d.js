"use strict";

/**
 * @typedef {number} Timestamp Unix timestamp
 */

/**
* @typedef {"helios-starling"} ProtocolName Name of the protocol
* @typedef {String} ProtocolVersion Version of the protocol
*/

/**
* @typedef {"request"} RequestType "request" message type
* @typedef {"response"} ResponseType "response" message type
* @typedef {"notification"} NotificationType "notification" message type
* @typedef {"error"} ErrorType "error" message type
* @typedef {"ack"} AckType "ack" message type
* @typedef {"ping"} PingType "ping" message type
* @typedef {RequestType|ResponseType|NotificationType|ErrorType|AckType|PingType} MessageType
*/

/**
* @typedef {"protocol"} ProtocolLevel Protocol validation level
* @typedef {"message"} MessageLevel Message validation level
* @typedef {ProtocolLevel|MessageLevel} ValidationLevel
*/

/**
* @typedef {"protocol"} ProtocolErrorSeverity Protocol error severity
* @typedef {"application"} ApplicationErrorSeverity Application error severity
* @typedef {ProtocolErrorSeverity|ApplicationErrorSeverity} ErrorSeverity
*/

/**
* @typedef {"system"} SystemNamespace System namespace
* @typedef {"internal"} InternalNamespace Internal namespace
* @typedef {"helios"} HeliosNamespace Helios namespace
* @typedef {"starling"} StarlingNamespace Starling namespace
* @typedef {SystemNamespace|InternalNamespace|HeliosNamespace|StarlingNamespace} ReservedNamespace Methods & Notifications reserved namespaces
*/

/**
 * @typedef {string} requestId Request identifier
 * @typedef {*} payload Request payload
 * @typedef {string} method Method name
 */


/**
 * @typedef {Object} Notification
 * @property {string} topic - Notification topic
 * @property {*} [data] - Optional notification data
 */


/**
 * @typedef {string} errorCode Error code
 * @typedef {string} errorMessage Error message
 * @typedef {*} errorDetails Optional error details
 */

/**
 * @typedef {Object} Error
 * @property {errorCode} code - Error code
 * @property {errorMessage} message - Error message
 * @property {errorDetails} [details] - Optional error details
 * @property {ErrorSeverity} severity - Error severity
 */

export default {};