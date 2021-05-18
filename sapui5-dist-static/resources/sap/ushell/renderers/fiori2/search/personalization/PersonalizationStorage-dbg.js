// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
/* global */

sap.ui.define([
    'sap/ushell/renderers/fiori2/search/personalization/FLPPersonalizationStorage',
    'sap/ushell/renderers/fiori2/search/personalization/BrowserPersonalizationStorage',
    'sap/ushell/renderers/fiori2/search/personalization/MemoryPersonalizationStorage',
    'sap/ushell/renderers/fiori2/search/SearchConfiguration'
], function (FLPPersonalizationStorage, BrowserPersonalizationStorage, MemoryPersonalizationStorage, SearchConfiguration) {
    "use strict";

    var config = SearchConfiguration.getInstance();

    // =======================================================================
    // personalization storage
    // =======================================================================
    var PersonalizationStorage = {

        instance: null,

        isLaunchpad: function () {
            try {
                return !!sap.ushell.Container.getService("Personalization");
            } catch (e) {
                return false;
            }
        },

        getInstance: function () {
            var that = this;
            if (this.instancePromise) {
                return this.instancePromise;
            }
            switch (config.personalizationStorage) {
            case 'auto':
                if (this.isLaunchpad()) {
                    this.instancePromise = FLPPersonalizationStorage.getInstance();
                } else {
                    this.instancePromise = BrowserPersonalizationStorage.getInstance();
                }
                break;
            case 'browser':
                this.instancePromise = BrowserPersonalizationStorage.getInstance();
                break;
            case 'flp':
                this.instancePromise = FLPPersonalizationStorage.getInstance();
                break;
            case 'memory':
                this.instancePromise = MemoryPersonalizationStorage.getInstance();
                break;
            default:
                // nix
            }
            this.instancePromise.then(function (instance) {
                that.instance = instance;
            });
            return this.instancePromise;
        },

        getInstanceSync: function () {
            if (!this.instance) {
                throw 'No instance, call async method getInstance for getting the instance';
            }
            return this.instance;
        },

        isInitialized: function () {
            return !!this.instance;
        }
    };

    return PersonalizationStorage;
});
