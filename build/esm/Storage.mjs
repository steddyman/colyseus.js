// colyseus.js@0.16.11
/// <reference path="../typings/cocos-creator.d.ts" />
/**
 * We do not assign 'storage' to window.localStorage immediatelly for React
 * Native compatibility. window.localStorage is not present when this module is
 * loaded.
 */
let storage;
function getStorage() {
    if (!storage) {
        try {
            storage = (typeof (cc) !== 'undefined' && cc.sys && cc.sys.localStorage)
                ? cc.sys.localStorage // compatibility with cocos creator
                : window.localStorage; // RN does have window object at this point, but localStorage is not defined
        }
        catch (e) {
            // ignore error
        }
    }
    if (!storage && typeof (globalThis.indexedDB) !== 'undefined') {
        storage = new IndexedDBStorage();
    }
    if (!storage) {
        // mock localStorage if not available (Node.js or RN environment)
        storage = {
            cache: {},
            setItem: function (key, value) { this.cache[key] = value; },
            getItem: function (key) { this.cache[key]; },
            removeItem: function (key) { delete this.cache[key]; },
        };
    }
    return storage;
}
function setItem(key, value) {
    getStorage().setItem(key, value);
}
function removeItem(key) {
    getStorage().removeItem(key);
}
function getItem(key, callback) {
    const value = getStorage().getItem(key);
    if (typeof (Promise) === 'undefined' || // old browsers
        !(value instanceof Promise)) {
        // browser has synchronous return
        callback(value);
    }
    else {
        // react-native is asynchronous
        value.then((id) => callback(id));
    }
}
/**
 * When running in a Web Worker, we need to use IndexedDB to store data.
 */
class IndexedDBStorage {
    dbPromise = new Promise((resolve) => {
        const request = indexedDB.open('_colyseus_storage', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('store');
        request.onsuccess = () => resolve(request.result);
    });
    async tx(mode, fn) {
        const db = await this.dbPromise;
        const store = db.transaction('store', mode).objectStore('store');
        return fn(store);
    }
    setItem(key, value) {
        return this.tx('readwrite', store => store.put(value, key)).then();
    }
    async getItem(key) {
        const request = await this.tx('readonly', store => store.get(key));
        return new Promise((resolve) => {
            request.onsuccess = () => resolve(request.result);
        });
    }
    removeItem(key) {
        return this.tx('readwrite', store => store.delete(key)).then();
    }
}

export { getItem, removeItem, setItem };
//# sourceMappingURL=Storage.mjs.map
