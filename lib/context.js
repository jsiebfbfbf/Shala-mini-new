// lib/context.js
// In-memory context store for multi-step interactions (e.g., movie search → quality select → download)

const store = new Map();

// Auto-expire context after 10 minutes to prevent memory leaks
const EXPIRY_MS = 10 * 60 * 1000;

/**
 * Save context keyed by message ID
 * @param {string} messageId - The sent message's key.id
 * @param {object} data - Context data to store
 */
function set(messageId, data) {
    store.set(messageId, {
        ...data,
        _timestamp: Date.now()
    });
}

/**
 * Get context by message ID
 * @param {string} messageId
 * @returns {object|null}
 */
function get(messageId) {
    const entry = store.get(messageId);
    if (!entry) return null;

    // Check expiry
    if (Date.now() - entry._timestamp > EXPIRY_MS) {
        store.delete(messageId);
        return null;
    }
    return entry;
}

/**
 * Delete context by message ID
 * @param {string} messageId
 */
function del(messageId) {
    store.delete(messageId);
}

/**
 * Clear all expired entries
 */
function cleanup() {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
        if (now - value._timestamp > EXPIRY_MS) {
            store.delete(key);
        }
    }
}

// Auto cleanup every 5 minutes
setInterval(cleanup, 5 * 60 * 1000);

module.exports = { set, get, del };
