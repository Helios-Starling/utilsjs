import { validateMethodName } from "../validators/base";
import { StandardMethods } from "../constants/methods";

/**
   * Extracts method components
   * @param {string} method - Method name (e.g., "namespace:action")
   * @returns {{ namespace: string, action: string }} Method components
   */
export function parseMethod(method) {
    const [namespace, ...rest] = method.split(':');
    return {
      namespace,
      action: rest.join(':')
    };
  }
  
  /**
   * Checks if a method is a system method
   * @param {string} method - Method to check
   * @returns {boolean} Whether the method is a system method
   */
  export function isSystemMethod(method) {
    return parseMethod(method).namespace === 'system';
  }
  
  /**
   * Checks if a method is a standard method
   * @param {string} method - Method to check
   * @returns {boolean} Whether the method is a standard method
   */
  export function isStandardMethod(method) {
    return Object.values(StandardMethods).includes(method);
  }
  
  /**
   * Helper to build method names safely
   * @param {string} namespace - Method namespace
   * @param {string} action - Method action
   * @returns {string} Properly formatted method name
   * @throws {Error} If resulting method name is invalid
   */
  export function buildMethod(namespace, action) {
    const method = `${namespace}:${action}`;
    const validation = validateMethodName(method);
    if (!validation.valid) {
      throw new Error(`Invalid method: ${validation.errors.join(', ')}`);
    }
    return method;
  }