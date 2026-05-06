// lib/context.js
// ─────────────────────────────────────────────────────────────────────────────
// A lightweight in-memory store that maps a bot-sent message ID to a context
// object.  Interaction-based plugins (e.g. anime.js) write a context when they
// send a numbered-menu message, and the generic interaction dispatcher in
// bot.js reads it back when the user replies with a number.
//
// Entries are automatically purged after 30 minutes so the Map never grows
// unboundedly in long-running sessions.
// ─────────────────────────────────────────────────────────────────────────────

const TTL_MS = 30 * 60 * 1000; // 30 minutes

/** @type {Map<string, { data: any, expiresAt: number }>} */
const store = new Map();

/**
 * Store a context object keyed by a WhatsApp message ID.
 *
 * @param {string} messageId  – key.id of the bot-sent menu message
 * @param {any}    data       – arbitrary context payload
 */
function set(messageId, data) {
    store.set(messageId, { data, expiresAt: Date.now() + TTL_MS });
}

/**
 * Retrieve a context by message ID.  Returns null if not found or expired.
 *
 * @param {string} messageId
 * @returns {any|null}
 */
function get(messageId) {
    const entry = store.get(messageId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        store.delete(messageId);
        return null;
    }
    return entry.data;
}

/**
 * Remove a context entry manually (optional clean-up).
 *
 * @param {string} messageId
 */
function del(messageId) {
    store.delete(messageId);
}

// Periodic GC — remove all expired entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [id, entry] of store.entries()) {
        if (now > entry.expiresAt) store.delete(id);
    }
}, 10 * 60 * 1000);

module.exports = { set, get, del };
