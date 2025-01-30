"use strict";

/**
* @typedef {Boolean|Object} PeerConfiguration - Peer configuration
*/

/**
 * @typedef {Object} MessageOptions
 * @property {PeerConfiguration} [peer] Peer configuration
 */

/**
* @typedef {Object} BaseMessage
* @property {import("./protocol.d").ProtocolName} protocol - Protocol name
* @property {import("./protocol.d").ProtocolVersion} version - Protocol version
* @property {import("./protocol.d").Timestamp} timestamp - Unix timestamp in milliseconds
* @property {import("./protocol.d").MessageType} type - Message type
* @property {PeerConfiguration} [peer=false] - Peer configuration
*/

/**
 * @typedef {MessageOptions & {
 *    requestId: import("./protocol.d").requestId
 * }} RequestOptions
 */

/**
* @typedef {BaseMessage & {
*  type: import("./protocol.d").RequestType
*  requestId: import("./protocol.d").requestId
*  method: import("./protocol.d").method
*  payload?: import("./protocol.d").payload
* }} RequestMessage
*/

 /**
 * @typedef {BaseMessage & {
 * type: import("./protocol.d").ResponseType
 * requestId: import("./protocol.d").requestId
 * success: boolean
 * data?: *
 * error?: ResponseError
 * }} ResponseMessage
 */

 /**
  * @typedef {Object} ResponseError
  * @property {string} code - Error code
  * @property {string} message - Error message
  * @property {*} [details] - Optional error details
  */



 /**
  * @typedef {MessageOptions & {
  *     requestId?: import("./protocol.d").requestId
  * }} NotificationOptions
  */

/**
* @typedef {BaseMessage & {
*    type: import("./protocol.d").NotificationType
*    requestId?: import("./protocol.d").requestId
*    notification: import("./protocol.d").Notification
* }} NotificationMessage
*/

/**
* @typedef {BaseMessage & {
*   type: import("./protocol.d").ErrorType,
*   error: import("./protocol.d").Error
* }} ErrorMessage
*/

/**
* @typedef {ErrorMessage & {
*     error: {
*     severity: import("./protocol.d").ProtocolErrorSeverity
* }
* }} ProtocolErrorMessage
*/

/**
* @typedef {ErrorMessage & {
*    error: {
*   severity: import("./protocol.d").ApplicationErrorSeverity
* }
* }} ApplicationErrorMessage
*/

export default {};