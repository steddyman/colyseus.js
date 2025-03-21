// colyseus.js@0.16.11
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');

/// <reference path="../typings/cocos-creator.d.ts" />
/**
 * We do not assign 'storage' to window.localStorage immediatelly for React
 * Native compatibility. window.localStorage is not present when this module is
 * loaded.
 */
var storage;
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
    var value = getStorage().getItem(key);
    if (typeof (Promise) === 'undefined' || // old browsers
        !(value instanceof Promise)) {
        // browser has synchronous return
        callback(value);
    }
    else {
        // react-native is asynchronous
        value.then(function (id) { return callback(id); });
    }
}
/**
 * When running in a Web Worker, we need to use IndexedDB to store data.
 */
var IndexedDBStorage = /** @class */ (function () {
    function IndexedDBStorage() {
        this.dbPromise = new Promise(function (resolve) {
            var request = indexedDB.open('_colyseus_storage', 1);
            request.onupgradeneeded = function () { return request.result.createObjectStore('store'); };
            request.onsuccess = function () { return resolve(request.result); };
        });
    }
    IndexedDBStorage.prototype.tx = function (mode, fn) {
        return tslib.__awaiter(this, void 0, void 0, function () {
            var db, store;
            return tslib.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dbPromise];
                    case 1:
                        db = _a.sent();
                        store = db.transaction('store', mode).objectStore('store');
                        return [2 /*return*/, fn(store)];
                }
            });
        });
    };
    IndexedDBStorage.prototype.setItem = function (key, value) {
        return this.tx('readwrite', function (store) { return store.put(value, key); }).then();
    };
    IndexedDBStorage.prototype.getItem = function (key) {
        return tslib.__awaiter(this, void 0, void 0, function () {
            var request;
            return tslib.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.tx('readonly', function (store) { return store.get(key); })];
                    case 1:
                        request = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve) {
                                request.onsuccess = function () { return resolve(request.result); };
                            })];
                }
            });
        });
    };
    IndexedDBStorage.prototype.removeItem = function (key) {
        return this.tx('readwrite', function (store) { return store.delete(key); }).then();
    };
    return IndexedDBStorage;
}());

exports.getItem = getItem;
exports.removeItem = removeItem;
exports.setItem = setItem;
//# sourceMappingURL=Storage.js.map
