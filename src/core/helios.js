import { Events } from "..";
import { Protocol } from "../constants";
import { getCurrentTimestamp } from "..";

/**
 * @typedef {Object} BaseHeliosOptions
 * @property {number} [disconnectionTTL=300000] Disconnection TTL in ms
 * @property {boolean} [debug=false] Enable debug mode
 */

/**
* Base class for Helios implementations (server/client)
* @abstract
*/
export class BaseHelios {
  
  /**
  * @param {BaseHeliosOptions} options Configuration options
  */
  constructor(options = {}) {
    /** @protected */
    this._options = {
      disconnectionTTL: 5 * 60 * 1000,
      debug: false,
      ...options
    };
    
    /** @protected */
    this._events = new Events();
    
    /** @protected */
    this._id = Symbol('Helios');
    
    if (this._options.debug) {
      this._setupDebugMode();
    }
    
    // Initialize base managers
    this._initializeManagers();
  }
  
  /**
  * Initialize required managers
  * @abstract
  * @protected
  */
  _initializeManagers() {
    throw new Error('_initializeManagers must be implemented');
  }
  
  /**
  * Sets up debug mode
  * @protected
  */
  _setupDebugMode() {
    this._events.use(event => {
      if (event.data.error) {
        const { message, stack } = event.data.error;
        (this.logger && this.logger.error?.(message, stack)) || console.error(`[ERROR] ${message}\n${stack}`);
      }
      if (event.data.debug) {
        const { message, type = 'info' } = event.data.debug;
        (this.logger && this.logger[type]?.(message)) || console.log(`[${type.toUpperCase()}] ${message}`);
      }
    });
  }
  
  /**
  * Gets protocol information
  */
  get protocolInfo() {
    return {
      name: Protocol.NAME,
      version: Protocol.CURRENT_VERSION,
      timestamp: getCurrentTimestamp()
    };
  }
  
  /**
  * Gets configuration options
  */
  get options() {
    return this._options;
  }
  
  /**
  * Gets event emitter instance
  */
  get events() {
    return this._events;
  }
  
  /**
  * Gets unique identifier
  */
  get id() {
    return this._id;
  }
}