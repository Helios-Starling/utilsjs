/**
* Extracts method components
* @param {method} method - Method name (e.g., "namespace:action")
* @returns {{ namespace: string, action: string }} Method components
*/
export function parseMethod(method: any): {
    namespace: string;
    action: string;
};
