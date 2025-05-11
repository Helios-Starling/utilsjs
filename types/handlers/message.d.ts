/**
* Main message handler that routes messages to appropriate sub-handlers
* @param {import('../core/starling').BaseStarling} starling Starling instance
* @param {string|ArrayBuffer|Uint8Array} rawMessage Raw message received
*/
export function handleMessage(starling: import("../core/starling").BaseStarling, rawMessage: string | ArrayBuffer | Uint8Array): Promise<void>;
export function handleInternalError(starling: any, error: any): void;
/**
* Handles message processing errors
* @param {import('../core/starling').BaseStarling} starling Starling instance
* @param {import('../core').ErrorMessageContext} context Error object
*/
export function handleMessageError(starling: import("../core/starling").BaseStarling, context: import("../core").ErrorMessageContext): void;
