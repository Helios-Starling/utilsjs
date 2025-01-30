import { MegaBuffer } from "@killiandvcz/buffer";


/**
 * @typedef {import('@killiandvcz/buffer').BufferConfig} BufferOptions
 */

/**
* Manages message buffering for disconnected states
*/
export class Buffer extends MegaBuffer {
    
    /**
    * @param {import('../core/starling').BaseStarling} starling
    * @param {BufferOptions} options
    */
    constructor(starling, options = {}) {
        super((batches) => {
            batches.forEach(content => starling._send(content));
        },
        {
            canProcess: () => starling.isConnected,
            maxBatchDelay: 100,
            ...options
        });
    }
}