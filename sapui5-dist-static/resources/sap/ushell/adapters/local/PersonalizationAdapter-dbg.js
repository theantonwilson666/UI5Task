// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

/**
 * @fileOverview The Personalization adapter for the local platform.
 *
 *
 * The local personalization adapter can be configured to store data either in
 * the local storage (default) or in memory.
 * @version 1.88.1
 */
sap.ui.define([
    "sap/ushell/utils",
    "sap/base/util/ObjectPath",
    "sap/ui/thirdparty/jquery"
], function (utils, ObjectPath, jQuery) {
    "use strict";

    var oMemoryPersData;

    /*
     * This method MUST be called by the Unified Shell's container only.
     * Constructs a new instance of the personalization adapter for the
     * "Local" platform.
     *
     * @param {object}
     *            oSystem the system served by the adapter
     * @returns {sap.ushell.adapters.local.PersonalizationAdapter}
     *
     * @class The Unified Shell's personalization adapter for the "local"
     *        platform.
     *
     * @constructor
     * @since 1.15.0
     */
    var PersonalizationAdapter = function (oUnused, sParameter, oAdapterConfiguration) {
        this._sStorageType = ObjectPath.get("config.storageType", oAdapterConfiguration) ||
                PersonalizationAdapter.prototype.constants.storage.LOCAL_STORAGE; // default = local storage
        switch (this._sStorageType) {
        case PersonalizationAdapter.prototype.constants.storage.LOCAL_STORAGE:
            break; // sap.ui.require("jquery.sap.storage") used to be here; case is still kept to preserve the break
        case PersonalizationAdapter.prototype.constants.storage.MEMORY:
            oMemoryPersData = ObjectPath.get("config.personalizationData", oAdapterConfiguration) || {};
                // initialization data is only supported for MEMORY storage
                break;
            default:
                throw new utils.Error("Personalization Adapter Local Platform: unsupported storage type '" + this._sStorageType + "'");
        }
    };

    PersonalizationAdapter.prototype.constants = {
        storage: {
            MEMORY: "MEMORY",
            LOCAL_STORAGE: "LOCAL_STORAGE"
        }
    };

    /**
     * Factory methods for obtaining AdapterContainer objects
     * Note that deletion does not invalidate handed out containers
     */

    PersonalizationAdapter.prototype.getAdapterContainer = function (sContainerKey) {
        return new sap.ushell.adapters.local.AdapterContainer(sContainerKey, this._sStorageType);
    };

    /**
     * Delete all personalization from LocalStorage
     *
     * @returns {Promise} A promise that resolves once all personalizations have been deleted
     * @since 1.86.0
     */
    PersonalizationAdapter.prototype.resetEntirePersonalization = function () {
        return new Promise(function (resolve, reject) {
            var oLocalStorage = this._getLocalStorage();
            setTimeout(function () {
                var bDeletedAllPersonalizations = oLocalStorage.removeAll();
                if (bDeletedAllPersonalizations) {
                    resolve();
                } else {
                    reject("could not delete personalization");
                }
            }, 0);
        }.bind(this));
    };

    /**
     * Confirms that the requested method deleteAllPersonalizations is available
     *
     * @returns {Promise} A promise that resolves to true if deleteAllPersonalizations is supported
     * @since 1.86.0
     */
    PersonalizationAdapter.prototype.isResetEntirePersonalizationSupported = function () {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(true);
            }, 0);
        });
    };

    /**
     * Remove the content of the given container key from the storage
     *
     * Note: a previously obtained AdaterContainer for the instance is not invalidated
     * @returns a promise (though technically this is a synchronous op)
     */
    PersonalizationAdapter.prototype.delAdapterContainer = function (sContainerKey) {
        return this.getAdapterContainer(sContainerKey).del();
    };

    // --- Adapter Container ---
    sap.ushell.adapters.local.AdapterContainer = function (sContainerKey, sStorageType) {
        this._sContainerKey = sContainerKey;
        this._sStorageType = sStorageType;
        this._oItemMap = new utils.Map();
    };

    PersonalizationAdapter.prototype._getLocalStorage = getLocalStorage;

    function getLocalStorage () {
        var Storage = sap.ui.requireSync("sap/ui/util/Storage");
        return new Storage(Storage.Type.local, "com.sap.ushell.adapters.sandbox.Personalization");
    }

    function parse (sJson) {
        try {
            return JSON.parse(sJson);
        } catch (e) {
            return undefined;
        }
    }

    function stringify (oJson) {
        return JSON.stringify(oJson);
    }

    function clone (oJson) {
        if (oJson === undefined) {
            return undefined;
        }
        try {
            return JSON.parse(JSON.stringify(oJson));
        } catch (e) {
            return undefined;
        }
    }

    sap.ushell.adapters.local.AdapterContainer.prototype.load = function () {
        var oDeferred = new jQuery.Deferred(),
            oLocalStorage,
            sItems,
            that = this;

        switch (this._sStorageType) {
            case PersonalizationAdapter.prototype.constants.storage.LOCAL_STORAGE:
                oLocalStorage = getLocalStorage();
                setTimeout(function () {
                    sItems = oLocalStorage.get(that._sContainerKey);
                    that._oItemMap.entries = parse(sItems) || {};
                    oDeferred.resolve(that);
                }, 0);
                break;
            case PersonalizationAdapter.prototype.constants.storage.MEMORY:
                setTimeout(function () {
                    that._oItemMap.entries = clone(oMemoryPersData[that._sContainerKey]) || {};
                    oDeferred.resolve(that);
                }, 0);
                break;
            default:
                setTimeout(function () {
                    oDeferred.reject("unknown storage type");
                }, 0);
        }
        return oDeferred.promise();
    };

    sap.ushell.adapters.local.AdapterContainer.prototype.save = function () {
        var oDeferred = new jQuery.Deferred(),
            oLocalStorage,
            sItems,
            that = this;

        switch (this._sStorageType) {
            case PersonalizationAdapter.prototype.constants.storage.LOCAL_STORAGE:
                oLocalStorage = getLocalStorage();
                setTimeout(function () {
                    sItems = stringify(that._oItemMap.entries);
                    oLocalStorage.put(that._sContainerKey, sItems);
                    oDeferred.resolve();
                }, 0);
                break;
            case PersonalizationAdapter.prototype.constants.storage.MEMORY:
                setTimeout(function () {
                    oMemoryPersData[that._sContainerKey] = clone(that._oItemMap.entries);
                    oDeferred.resolve();
                }, 0);
                break;
            default:
                setTimeout(function () {
                    oDeferred.reject("unknown storage type");
                }, 0);
        }
        return oDeferred.promise();
    };

    sap.ushell.adapters.local.AdapterContainer.prototype.del = function () {
        var oDeferred = new jQuery.Deferred(),
            oLocalStorage,
            that = this;

        switch (this._sStorageType) {
            case PersonalizationAdapter.prototype.constants.storage.LOCAL_STORAGE:
                oLocalStorage = getLocalStorage();
                setTimeout(function () {
                    oLocalStorage.remove(that._sContainerKey); // delete in storage
                    that._oItemMap.entries = {}; // delete container local data
                    oDeferred.resolve();
                }, 0);
                break;
            case PersonalizationAdapter.prototype.constants.storage.MEMORY:
                setTimeout(function () {
                    if (oMemoryPersData && oMemoryPersData[that._sContainerKey]) {
                        delete oMemoryPersData[that._sContainerKey]; // delete in storage
                    }
                    that._oItemMap.entries = {}; // delete container local data
                    oDeferred.resolve();
                }, 0);
                break;
            default:
                setTimeout(function () {
                    oDeferred.reject("unknown storage type");
                }, 0);
        }
        return oDeferred.promise();
    };

    sap.ushell.adapters.local.AdapterContainer.prototype.getItemKeys = function () {
        return this._oItemMap.keys();
    };

    sap.ushell.adapters.local.AdapterContainer.prototype.containsItem = function (sItemKey) {
        return this._oItemMap.containsKey(sItemKey);
    };

    sap.ushell.adapters.local.AdapterContainer.prototype.getItemValue = function (sItemKey) {
        return this._oItemMap.get(sItemKey);
    };

    sap.ushell.adapters.local.AdapterContainer.prototype.setItemValue = function (sItemKey, oItemValue) {
        this._oItemMap.put(sItemKey, oItemValue);
    };

    sap.ushell.adapters.local.AdapterContainer.prototype.delItem = function (sItemKey) {
        this._oItemMap.remove(sItemKey);
    };

    return PersonalizationAdapter;
}, /* bExport= */ true);
