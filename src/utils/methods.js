/**
* Extracts method components
* @param {method} method - Method name (e.g., "namespace:action")
* @returns {{ namespace: string, action: string }} Method components
*/
export function parseMethod(method) {
  const [namespace, ...rest] = method.split(':');
  return {
    namespace,
    subspaces: rest.slice(0, -1),
    action: rest[rest.length - 1]
  };
}