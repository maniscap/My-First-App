import { get, set, del } from 'idb-keyval';

/**
 * A tiny wrapper around idb-keyval to manage large application data safely.
 * Handles fallbacks and migrations from localStorage automatically.
 */
export const idb = {
    get: async (key) => {
        try {
            let val = await get(key);
            if (!val) {
                // Migration fallback: check if it exists in localStorage
                const localData = localStorage.getItem(key);
                if (localData) {
                    val = JSON.parse(localData);
                    // Migrate it to IDB and clear from local storage to free up the 5MB quota
                    await set(key, val);
                    localStorage.removeItem(key);
                }
            }
            return val;
        } catch (e) {
            console.error("IDB Get Error:", e);
            // Emergency fallback
            return JSON.parse(localStorage.getItem(key) || 'null');
        }
    },
    set: async (key, val) => {
        try {
            await set(key, val);
        } catch (e) {
            console.error("IDB Set Error:", e);
            // Fallback just in case
            try {
                localStorage.setItem(key, JSON.stringify(val));
            } catch(lsError) {
                console.error("Critical Storage Failure: Quota exceeded.");
            }
        }
    },
    del: async (key) => {
        try {
            await del(key);
            localStorage.removeItem(key);
        } catch(e) {
            console.error("IDB Del Error:", e);
        }
    }
};
