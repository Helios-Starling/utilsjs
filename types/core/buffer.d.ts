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
    constructor(starling: import("../core/starling").BaseStarling, options?: BufferOptions);
}
export type BufferOptions = import("@killiandvcz/buffer").BufferConfig;
import { MegaBuffer } from "@killiandvcz/buffer";
