let _nextId = 0;

/**
 * Fetches the next unique ID.
 * 
 * @returns A unique ID.
 */
function nextID() { return _nextId++; }

/**
 * Fetches the last ID returned.
 * Useful for debugging object pooling.
 * 
 * @returns
 */
function curID() { return _nextId - 1; }

export { nextID, curID };
export default nextID;