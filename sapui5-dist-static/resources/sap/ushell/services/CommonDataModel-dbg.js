// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
/**
 * @fileOverview
 *
 * <p>This module exposes a CommonDataModel based site document in a platform neutral format
 * to it's clients
 * </p>
 *
 *
 * @version 1.88.1
 */
sap.ui.define([
    "sap/ushell/services/_CommonDataModel/PersonalizationProcessor",
    "sap/base/util/ObjectPath",
    "sap/ui/thirdparty/jquery",
    "sap/base/util/isPlainObject",
    "sap/ushell/services/_CommonDataModel/SiteConverter",
    "sap/base/util/isEmptyObject",
    "sap/base/util/deepClone",
    "sap/base/util/Version",
    "sap/ushell/Config",
    "sap/base/util/includes",
    "sap/base/util/values",
    "sap/ushell/library",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readApplications"
], function (
    PersonalizationProcessor,
    ObjectPath,
    jQuery,
    isPlainObject,
    SiteConverter,
    isEmptyObject,
    deepClone,
    Version,
    Config,
    includes,
    objectValues,
    ushellLibrary,
    readApplications
) {

    "use strict";

    var DisplayFormat = ushellLibrary.DisplayFormat;

    var S_COMPONENT_NAME = "sap.ushell.services.CommonDataModel",
        O_STANDARD_VIZ_TYPES = {
            STATIC_LAUNCHER: "sap.ushell.StaticAppLauncher",
            DYNAMIC_LAUNCHER: "sap.ushell.DynamicAppLauncher",
            CARD: "sap.ushell.Card"
        };

    /**
     * @param {object} oAdapter
     *   Adapter, provides an array of Inbounds
     * @param {object} oContainerInterface
     *   Not in use
     * @param {string} sParameters
     *   Parameter string, not in use
     * @param {object} oServiceConfiguration
     *   The service configuration not in use
     *
     * @constructor
     * @class
     * @see {@link sap.ushell.services.Container#getServiceAsync}
     * @since 1.40.0
     */
    function CommonDataModel (oAdapter, oContainerInterface, sParameters, oServiceConfiguration) {

        var oSiteDeferred = new jQuery.Deferred();

        this._oAdapter = oAdapter;
        this._oPersonalizationProcessor = new PersonalizationProcessor();
        this._oSiteDeferred = oSiteDeferred;
        this._oOriginalSite = {};
        this._oPersonalizedSite = {};
        this._oContentProviderIndex = {};
        this._oSiteConverter = new SiteConverter();
        this._oPersonalizationDeltas = {};

        // load site and personalization as early as possible
        this._oGetSitePromise = oAdapter.getSite()
            .then(this._loadAndApplyPersonalization.bind(this))
            .fail(oSiteDeferred.reject);
    }

    CommonDataModel.prototype._loadAndApplyPersonalization = function (oSite) {
        this._oOriginalSite = jQuery.extend(true, {}, oSite);
        var oCDMSiteVersion = new Version(oSite._version);
        if (oCDMSiteVersion.compareTo("3.1.0") < 0) {
            this._oAdapter.getPersonalization(oCDMSiteVersion)
                .then(function (oPers) {
                    if (oPers) {
                        this._oPersonalizationDeltas = deepClone(oPers);
                    } else {
                        this._oPersonalizationDeltas = {version: "3.0.0", _version: "3.0.0"};
                    }
                    this._triggerMixinPersonalisationInSite(oSite, oPers);
                }.bind(this))
                .fail(this._oSiteDeferred.reject); // mixinPersonalization
        } else {
            this._oPersonalizedPages = {};
            this._oOriginalSite = this._ensureStandardVizTypesPresent(this._oOriginalSite);
            this._oOriginalSite = this._ensureProperDisplayFormats(this._oOriginalSite);
            this._oSiteDeferred.resolve(this._oOriginalSite);
        }
    };

    /**
     * Applies the personalization to the page and stores it
     * @param {object} oPage The page without the personalization
     * @param {object} oPersonalization The personalization object of the CDM site
     * @returns {Promise<object>} Resolves with the personalized page
     *
     * @since 1.78.0
     * @private
     */
    CommonDataModel.prototype._applyPagePersonalization = function (oPage, oPersonalization) {
        var sPageId = oPage.identification.id;

        if (Object.keys(oPersonalization).length) {
            // BCP: 002075129400005034972020
            // Recover old personalization
            var oClassicPers = oPersonalization.classicHomePage;
            if (oClassicPers && oClassicPers.version === "3.1.0") {
                Object.keys(oClassicPers).forEach(function (sPage) {
                    // only recover pages which were not further personalized
                    if (!oPersonalization[sPage]) {
                        oPersonalization[sPage] = oClassicPers[sPage];
                    }
                });
                delete oPersonalization.classicHomePage;
                oPersonalization._version = oPersonalization.version;
            }

            // Migrate classic hompage personalization to pages personalization
            var oVersion = new Version(oPersonalization._version || oPersonalization.version);
            if (oVersion.compareTo("3.1.0") < 0) {
                oPersonalization = {
                    classicHomePage: oPersonalization,
                    _version: "3.1.0",
                    version: "3.1.0"
                };
            }
        }
        this._oPersonalizationDeltas = oPersonalization;

        var oPagePersonalization = oPersonalization[sPageId] || {};

        var oConvertedPage = this._oSiteConverter.convertTo("3.0.0", deepClone(oPage, 20));

        return this._triggerMixinPersonalisationInSite(oConvertedPage, oPagePersonalization)

            .then(function (oPersonalizedSite) {
                this._oPersonalizedPages[sPageId] = this._oSiteConverter.convertTo("3.1.0", deepClone(oPersonalizedSite, 20));
                return this._oPersonalizedPages[sPageId];
            }.bind(this));
    };

    /**
     * This function is used to trigger the mixing of the personalisation into a site object and afterwards
     * checking the personalised site for errors.
     * @param {object} site CDM 3.0 site
     * @param {object} personalization of an individual site object
     * @returns {Promise<object>} resolves when a valid personalised site was generated
     * @private
     * @since 1.76.0
     */
    CommonDataModel.prototype._triggerMixinPersonalisationInSite = function (site, personalization) {
        return new Promise(function (resolve, reject) {
            this._oPersonalizationProcessor.mixinPersonalization(site, personalization)
                .done(function (oPersonalizedSite) {
                    // Apply the Null Object Pattern to prevent errors
                    // e.g.: Avoid errors when accessing links when no links are present
                    // See internal incident BCP: 1780350619
                    this._oPersonalizedSite = this._ensureCompleteSite(oPersonalizedSite);
                    this._oPersonalizedSite = this._ensureGroupsOrder(this._oPersonalizedSite);
                    // add standard vizTypes, as otherwise they would needed to be added by an
                    // admin in the design time tool manually on all platforms...
                    this._oPersonalizedSite = this._ensureStandardVizTypesPresent(this._oPersonalizedSite);
                    this._oPersonalizedSite = this._ensureProperDisplayFormats(this._oPersonalizedSite);
                    this._oSiteDeferred.resolve(this._oPersonalizedSite);
                    resolve(this._oPersonalizedSite);
                }.bind(this))
                .fail(function (sMessage) {
                    this._oSiteDeferred.reject(sMessage);
                    reject();
                }.bind(this));
        }.bind(this));
    };

    /**
     * TODO to be removed
     * @private
     */
    CommonDataModel.prototype.getHomepageGroups = function () {
        var oDeferred = new jQuery.Deferred();

        this._oSiteDeferred.then(function (oSite) {
            // the group order was not available in the very first ABAP CDM RT Site
            var aGroupsOrder = (oSite && oSite.site && oSite.site.payload && oSite.site.payload.groupsOrder)
                ? oSite.site.payload.groupsOrder : [];

            oDeferred.resolve(aGroupsOrder);
        });
        return oDeferred.promise();
    };

    /**
     * TODO to be removed
     * @private
     */
    CommonDataModel.prototype.getGroups = function () {

        var oDeferred = new jQuery.Deferred();

        this._oSiteDeferred.then(function (oSite) {
            var aGroups = [];
            Object.keys(oSite.groups).forEach(function (sKey) {
                aGroups.push(oSite.groups[sKey]);
            });
            oDeferred.resolve(aGroups);
        });
        return oDeferred.promise();
    };

    /**
     * TODO to be removed
     * @private
     */
    CommonDataModel.prototype.getGroup = function (sId) {
        var oDeferred = new jQuery.Deferred();
        this._oSiteDeferred.then(function (oSite) {
            var oGroup = oSite.groups[sId];
            if (oGroup) {
                oDeferred.resolve(oGroup);
            } else {
                oDeferred.reject("Group " + sId + " not found");
            }
        });
        return oDeferred.promise();
    };

    /**
     * Returns the Common Data Model site with mixed in personalization.
     * The following sections are allowed to be changed:
     *   - site.payload.groupsOrder
     *   - groups
     * Everything else must not be changed.
     *
     * @returns {jQuery.promise}
     *    resolves with the Common Data Model site
     * @private
     *
     * @see #save
     * @since 1.40.0
     */
    CommonDataModel.prototype.getSite = function () {
        //TODO JSDoc: tbd is it allowed to change "personalization" section?
        return this._oSiteDeferred.promise();
    };

    /**
     * Returns the Common Data Model site of a Page
     * @param {string} sPageId The Id of the page to return
     *
     * @returns {Promise<object>}
     *    Resolves with the Common Data Model site
     * @since 1.72.0
     *
     * @private
     *
     */
    CommonDataModel.prototype.getPage = function (sPageId) {
        return new Promise(function (resolve, reject) {
            var bEnablePersonalization = Config.last("/core/shell/enablePersonalization");

            Promise.resolve(this._oGetSitePromise)
                .then(function () {
                    // Allow multiple fetches without rebuilding the page
                    // This enables multiple personalization actions with a single save
                    if (bEnablePersonalization && this._oPersonalizedPages[sPageId]) {
                        resolve(this._oPersonalizedPages[sPageId]);
                        return;
                    }
                    if (!bEnablePersonalization) {
                        resolve(this._getPageFromAdapter(sPageId));
                        return;
                    }
                    Promise.all([
                        this._getPageFromAdapter(sPageId),
                        this._oAdapter.getPersonalization(this._oOriginalSite._version)
                    ]).then(function (aPageAndPersonalization) {
                            this._applyPagePersonalization(aPageAndPersonalization[0], aPageAndPersonalization[1])
                                .then(resolve)
                                .catch(function () {
                                    reject("Personalization Processor: Cannot mixin the personalization.");
                            });

                    }.bind(this))
                        .catch(function () {
                            reject("CommonDataModel Service: Cannot get page " + sPageId);
                        });
                }.bind(this))
                .catch(reject);
        }.bind(this));
    };

    /**
     * Returns a specific page and provides a fallback for a missing adapter method
     * @param {string} sPageId The id of the page
     * @returns {Promise<object>} The page
     *
     * @since 1.78.0
     * @private
     */
    CommonDataModel.prototype._getPageFromAdapter = function (sPageId) {
        if (!this._oAdapter.getPage) {
            return Promise.resolve(deepClone(this._oOriginalSite.pages[sPageId], 20));
        }
        return this._oAdapter.getPage(sPageId)
            .then(function (oPage) {
                this._oOriginalSite.pages[sPageId] = oPage;
                return deepClone(oPage, 20);
            }.bind(this));
    };

    /**
     * Returns a filtered array of pages, for a given array of pages
     * Only proper pages that are not undefined or falsy are returned.
     * @param {object[]} aPages Pages to be filtered
     * @returns {obect[]} The filtered pages
     */
    CommonDataModel.prototype._filterForProperPages = function (aPages) {
        return aPages.filter(function (oPage) {
            return !!oPage;
        });
    };

    /**
     * Returns an array of pages
     * @param {string[]} aPageIds An array of page IDs to load
     *
     * @returns {Promise<object[]>}
     *    Resolves with an array of all loaded pages
     * @since 1.75.0
     *
     * @private
     *
     */
    CommonDataModel.prototype.getPages = function (aPageIds) {
        return new Promise(function (resolve, reject) {
            var bEnablePersonalization = Config.last("/core/shell/enablePersonalization");

            Promise.resolve(this._oGetSitePromise)
                .then(function () {
                    if (!bEnablePersonalization) {
                        this._getPagesFromAdapter(aPageIds)
                            .then(function (oPages) {
                                resolve(this._filterForProperPages(objectValues(oPages)));
                            }.bind(this));
                    } else {
                        Promise.all([
                            this._getPagesFromAdapter(aPageIds),
                            /* jquery promise is ok here*/
                            this._oAdapter.getPersonalization(this._oOriginalSite._version)
                        ]).then(function (aPagesAndPersonalization) {
                            var oPages = aPagesAndPersonalization[0];
                            var oPersonalizationPromise = Promise.all(Object.keys(oPages).map(function (sPageId) {
                                // Allow multiple fetches without rebuilding the page
                                // This enables multiple personalization actions with a single save
                                if (this._oPersonalizedPages[sPageId]) {
                                    return Promise.resolve(this._oPersonalizedPages[sPageId]);
                                }
                                return this._applyPagePersonalization(oPages[sPageId], aPagesAndPersonalization[1])
                                    .catch(function () {
                                        reject("Personalization Processor: Cannot mixin the personalization.");
                                    });
                            }.bind(this)));
                            oPersonalizationPromise.then(function (aPages) {
                                resolve(this._filterForProperPages(aPages));
                            }.bind(this));
                        }.bind(this))
                            .catch(function () {
                                reject("CommonDataModel Service: Cannot get pages");
                            });
                    }
                }.bind(this))
                .catch(reject);
        }.bind(this));
    };

    /**
     * Returns a list of specific pages and provides a fallback for a missing adapter method
     * @param {string[]} aPageIds The array of page ids
     * @returns {Promise<object[]>} The array of pages
     *
     * @since 1.78.0
     * @private
     */
    CommonDataModel.prototype._getPagesFromAdapter = function (aPageIds) {
        if (!this._oAdapter.getPages) {
            var oPagesToReturn = {};
            for (var sPageId in this._oOriginalSite.pages) {
                if (includes(aPageIds, this._oOriginalSite.pages[sPageId].identification.id)) {
                    oPagesToReturn[sPageId] = this._oOriginalSite.pages[sPageId];
                }
            }
            return Promise.resolve(deepClone(oPagesToReturn, 20));
        }
        return this._oAdapter.getPages(aPageIds)
            .then(function (oPages) {
                Object.keys(oPages).forEach(function (sPageId) {
                    this._oOriginalSite.pages[sPageId] = oPages[sPageId];
                }.bind(this));
                return deepClone(oPages, 20);
            }.bind(this));
    };

    /**
     * Loads all assigned pages
     *
     * @returns {Promise<object[]>}
     *    Resolves with an array of all loaded pages
     * @since 1.77.0
     *
     * @private
     *
     */
    CommonDataModel.prototype.getAllPages = function () {
        return sap.ushell.Container.getServiceAsync("Menu")
            .then(function (oMenuService) {
                return oMenuService.getSpacesPagesHierarchy();
            })
            .then(function (oHierarchy) {
                var aPageIds = [];
                oHierarchy.spaces.forEach(function (oSpace) {
                    oSpace.pages.forEach(function (oPage) {
                        if (aPageIds.indexOf(oPage.id) === -1) {
                            aPageIds.push(oPage.id);
                        }
                    });
                });
                return this.getPages(aPageIds);
            }.bind(this));
    };

    /**
     * Returns all applications of the Common Data Model.
     *
     * @returns {Promise<object>}
     *  A promise which resolves with all applications
     *  of the Common Data Model
     *
     * @private
     * @since 1.75.0
     */
    CommonDataModel.prototype.getApplications = function () {
        return new Promise(function (resolve, reject) {
            this._oSiteDeferred
                .then(function (oSite) {
                    var oApplications = oSite.applications;
                    if (oApplications) {
                        resolve(oApplications);
                    } else {
                        reject("CDM applications not found.");
                    }
                })
                .fail(reject);
        }.bind(this));
    };

    /**
     * Returns all vizTypes of the Common Data Model.
     *
     * @returns {Promise<object>}
     *  A promise which resolves with all vizTypes
     *  of the Common Data Model
     *
     * @private
     * @since 1.78.0
     */
    CommonDataModel.prototype.getVizTypes = function () {
        return new Promise(function (resolve, reject) {
            this._oSiteDeferred
                .then(function (oSite) {
                    var oVizTypes = oSite.vizTypes;
                    if (oVizTypes) {
                        resolve(oVizTypes);
                    } else {
                        reject("CDM vizTypes not found.");
                    }
                })
                .fail(reject);
        }.bind(this));
    };

    /**
     * Returns all visualizations of the Common Data Model.
     *
     * @returns {Promise<object>}
     *  A promise which resolves with all visualizations
     *  of the Common Data Model
     *
     * @private
     * @since 1.75.0
     */
    CommonDataModel.prototype.getVisualizations = function () {
        return new Promise(function (resolve, reject) {
            this._oSiteDeferred
                .then(function (oSite) {
                    var oVisualizations = oSite.visualizations;
                    if (oVisualizations) {
                        resolve(oVisualizations);
                    } else {
                        reject("CDM visualizations not found.");
                    }
                })
                .fail(reject);
        }.bind(this));
    };

    /**
     * Returns a given group from the original site.
     *
     * @param {string} sGroupId
     *  Group id
     * @returns {jQuery.promise}
     *  Resolves with the respective group from the original site.
     *  In case the group is not existing in the original site,
     *  a respective error message is passed to the fail handler.
     * @private
     *
     * @since 1.42.0
     */
    CommonDataModel.prototype.getGroupFromOriginalSite = function (sGroupId) {
        var oDeferred = new jQuery.Deferred();

        if (typeof sGroupId === "string" &&
            this._oOriginalSite &&
            this._oOriginalSite.groups &&
            this._oOriginalSite.groups[sGroupId]) {
            oDeferred.resolve(jQuery.extend(true, {}, this._oOriginalSite.groups[sGroupId]));
        } else {
            oDeferred.reject("Group does not exist in original site.");
        }

        return oDeferred.promise();
    };

    /**
     * Returns the page with the given id of the original site.
     *
     * @param {string} pageId The id of the page to be retrieved.
     *
     * @private
     * @returns {object} The page of the original site.
     *
     * @since 1.75.0
     */
    CommonDataModel.prototype.getOriginalPage = function (pageId) {
        return deepClone(this._oOriginalSite.pages[pageId], 20);
    };

    /**
     * Saves the personalization change together with the collected personalization
     * changes since the last FLP reload.
     *
     * @param {string} [pageId] The ID of the page. Needs to be provided for CDM 3.1.0
     * @returns {jQuery.promise}
     *   The promise's done handler indicates whether the collected personalization has been saved successfully.
     *   In case an error occurred, the promise's fail handler returns an error message.
     * @private
     *
     * @see #getSite
     * @since 1.40.0
     */
    CommonDataModel.prototype.save = function (pageId) {
        var oDeferred = new jQuery.Deferred(),
            oPersonalizedPage,
            oOriginalPage;

        if (this._oOriginalSite._version === "3.1.0") {
            if (!pageId) {
                return oDeferred.reject("No page id was provided").promise();
            }

            oOriginalPage = this._oSiteConverter.convertTo("3.0.0", this._oOriginalSite.pages[pageId]);
            oPersonalizedPage = this._oSiteConverter.convertTo("3.0.0", this._oPersonalizedPages[pageId]);
        } else {
            oOriginalPage = this._oOriginalSite;
            oPersonalizedPage = this._oPersonalizedSite;
        }

        this._oPersonalizationProcessor.extractPersonalization(deepClone(oPersonalizedPage, 20), deepClone(oOriginalPage, 20))
            .done(function (oExtractedPersonalization) {
                if (!isEmptyObject(oExtractedPersonalization)) {

                    /* This is a problem based on the ADR which said ".version" but the CDM Adapter checks for "._version".
                    * Now we have to check for both version notations and make sure both have been written so personalization
                    * does not fail the version check.
                    */
                    if (this._oPersonalizationDeltas.version === undefined || this._oPersonalizationDeltas._version === undefined) {
                        this._oPersonalizationDeltas.version = this._oOriginalSite._version;
                        this._oPersonalizationDeltas._version = this._oOriginalSite._version;
                    }
                    if (pageId) {
                        this._oPersonalizationDeltas[pageId] = oExtractedPersonalization;
                    } else {
                        this._oPersonalizationDeltas = oExtractedPersonalization;
                    }
                    this._setPersonalization(this._oPersonalizationDeltas)
                        .then(oDeferred.resolve)
                        .catch(oDeferred.reject);
                } else {
                    oDeferred.resolve();
                }
            }.bind(this))
            .fail(function () {
                oDeferred.reject("Personalization Processor: Cannot extract personalization.");
            });

        return oDeferred.promise();
    };

    /**
     * Sets the personalization based on the provided delta and page id.
     * Also prevents multiple requests and instead queries a later delta to be persisted until the currently active request is finished.
     * Only the latest delta will be persisted in this manner. If more than one request is queried all promises will be resolved as soon as the latest delta is persisted
     *
     * @param {object} extractedPersonalization The personalization delta to be persisted
     * @param {string} pageId The page ID the personalization belongs to
     * @returns {Promise<void>} A promise that wraps the Deferred of the CDM Adapter to save the personalization
     */
    CommonDataModel.prototype._setPersonalization = function (extractedPersonalization, pageId) {
        if (this._oPendingPersonalizationDeferred) {
            if (!this._oNextPersonalizationQuery) {
                this._oNextPersonalizationQuery = {
                    fnNextCall: null,
                    aPromiseResolvers: []
                };
            }
            return new Promise(function (resolve, reject) {
                this._oNextPersonalizationQuery.fnNextCall = this._setPersonalization.bind(this, extractedPersonalization, pageId);
                this._oNextPersonalizationQuery.aPromiseResolvers.push({
                    resolve: resolve,
                    reject: reject
                });
            }.bind(this));
        }
        this._oPendingPersonalizationDeferred = this._oAdapter.setPersonalization(extractedPersonalization, pageId);
        return new Promise(function (resolve, reject) {
            this._oPendingPersonalizationDeferred
                .then(resolve)
                .fail(reject)
                .always(function () {
                    delete this._oPendingPersonalizationDeferred;
                    if (this._oNextPersonalizationQuery) {
                        var oNextPersonalizationPromise = this._oNextPersonalizationQuery.fnNextCall();
                        this._cleanupPersonalizationQueuePromises(
                            oNextPersonalizationPromise,
                            this._oNextPersonalizationQuery.aPromiseResolvers
                        );
                        delete this._oNextPersonalizationQuery;
                    }
                }.bind(this));
        }.bind(this));
    };

    /**
     * Resolves or rejects the queried promises based on the result of the Adapters setPersonalization call
     *
     * @param {Promise} nextPersonalizationPromise The promise of the Adapter
     * @param {object[]} queuedPromises The pending promises that are waiting to be resolved or rejected
     */
    CommonDataModel.prototype._cleanupPersonalizationQueuePromises = function (nextPersonalizationPromise, queuedPromises) {
        queuedPromises.forEach(function (oPromise) {
            nextPersonalizationPromise
                .then(oPromise.resolve)
                .catch(oPromise.reject);
        });
    };

    function loadContentProviderPlugins () {
        var oPluginManager = sap.ushell.Container.getService("PluginManager");

        return oPluginManager.loadPlugins("ContentProvider");
    }

    /**
     * Finds invalid applications in a site.
     *
     * @param {object} oExtensionSite
     *   The extension site to be checked
     *
     * @returns {object}
     *   An object indicating which apps from which catalogs are invalid:
     *   {
     *      CatalogId1: {   // only lists invalid apps
     *          AppId1: true,
     *          AppId2: true,
     *          ...
     *          AppIdN: true
     *      },
     *      ...
     *   }
     *   </pre>
     *   This method guarantees non-empty objects. Therefore it can be assumed
     *   that if the result is an empty object, there are no errors
     *
     * @private
     */
    CommonDataModel.prototype._getUnreferencedCatalogApplications = function (oExtensionSite) {
        var oUnreferencedApplicationPerCatalogIndex = {};

        // the id property counts in the end...
        var oAllApplicationIdsIndex = Object.keys(oExtensionSite.applications)
            .map(function (sAppId) {
                return oExtensionSite.applications[sAppId]["sap.app"].id;
            })
            .reduce(function (oIndex, sAppId) {
                oIndex[sAppId] = true;
                return oIndex;
            }, {});

        var oCatalogs = oExtensionSite.catalogs;

        Object.keys(oCatalogs).forEach(function (sCatalog) {
            var aAppDescriptors = oCatalogs[sCatalog].payload.appDescriptors;

            aAppDescriptors.map(function (oAppDescriptor) {
                return oAppDescriptor.id;
            }).filter(function (sAppIdFromAppDescriptors) {
                // only invalid: avoids empty catalogs
                return !oAllApplicationIdsIndex[sAppIdFromAppDescriptors];
            }).forEach(function (sBadAppIdFromAppDescriptors) {
                if (!oUnreferencedApplicationPerCatalogIndex.hasOwnProperty(sCatalog)) {
                    oUnreferencedApplicationPerCatalogIndex[sCatalog] = {};
                }

                // mark as invalid
                oUnreferencedApplicationPerCatalogIndex[sCatalog][sBadAppIdFromAppDescriptors]
                    = true;
            });
        });

        return oUnreferencedApplicationPerCatalogIndex;
    };

    /**
     * Formats an invalid application index into a human readable string.
     *
     * @param {string} sContentProviderId
     *   The id of the provider that returned the site.
     *
     * @param {object} oUnreferencedApplicationPerCatalogIndex
     *   An index of all the invalid applications per catalog as returned by
     *   <code>#_getUnreferencedCatalogApplications</code>.
     *
     * @returns {string}
     *   A nice error message
     *
     * @private
     */
    CommonDataModel.prototype._formatUnreferencedApplications = function (sContentProviderId, oUnreferencedApplicationPerCatalogIndex) {
        return "One or more apps from " + sContentProviderId
            + " content provider are not listed among the applications section " +
            "of the extended site and will be discarded - "
            + Object.keys(oUnreferencedApplicationPerCatalogIndex)
                .map(function (sCatalogId) {

                    var aBadCatalogAppsQuoted = Object.keys(oUnreferencedApplicationPerCatalogIndex[sCatalogId])
                        .map(function (sUnquoted) {
                            return "'" + sUnquoted + "'";
                        });

                    return "From catalog '" + sCatalogId + "': "
                        + aBadCatalogAppsQuoted.join(", ");

                }).join("; ");
    };
    /**
     * Removes invalid appDescriptors from an extended site according to the
     * index. This method operates in place on the site.
     *
     * @param {object} oExtensionSite
     *   The extended site
     *
     * @param {object} oUnreferencedApplicationPerCatalogIndex
     *   An index of all the invalid applications per catalog as returned by
     *   <code>#_getUnreferencedCatalogApplications</code>.
     */
    CommonDataModel.prototype._removeUnreferencedApplications = function (oExtensionSite, oUnreferencedApplicationPerCatalogIndex) {
        Object.keys(oExtensionSite.catalogs).forEach(function (sCatalogId) {
            var oCatalogPayload = oExtensionSite.catalogs[sCatalogId].payload;
            var aAppDescriptors = oCatalogPayload.appDescriptors;

            oCatalogPayload.appDescriptors = aAppDescriptors.filter(function (oAppDescriptor) {
                return oUnreferencedApplicationPerCatalogIndex[sCatalogId]
                    && !oUnreferencedApplicationPerCatalogIndex[sCatalogId][oAppDescriptor.id];
            });
        });
    };

    /**
     * Loads extension sites from ContentProvider plugins.
     *
     * @returns {jQuery.promise}
     *   A promise that resolves when all the ContentProviders have returned a
     *   site or failed to do so. This promise is always resolved (and never
     *   rejected) with an array of "report" objects also indicating if the
     *   operation of retrieving the site was successful. For example, when the
     *   site is correctly retrieved, an item of this array is an object like:
     *   <pre>
     *   {
     *      providerId: "SomeProviderId",
     *      success: true,
     *      site: { ... }  // the extension site
     *   }
     *   </pre>
     *   Likewise, when the operation fails, the object looks more like:
     *   <pre>
     *   {
     *      providerId: "SomeProviderId",
     *      success: false,
     *      error: "..."
     *   }
     *   </pre>
     *   The promise .progress handler is called only when a site is
     *   successfully loaded, therefore the consumer must check the result of
     *   the done handler to inspect or report failures.
     *
     * @private
     */
    CommonDataModel.prototype.getExtensionSites = function () {
        var that = this;

        //jQuery promise as all other methods also return those
        var oDeferred = new jQuery.Deferred();

        loadContentProviderPlugins().done(function () {
            var aContentProviderIds = Object.keys(that._oContentProviderIndex),
                iTotalContentProviders = aContentProviderIds.length;

            if (iTotalContentProviders === 0) {
                oDeferred.resolve([]);
                return;
            }

            // assumption: all ContentProvider register themselves on init
            var aGetSitePromises = aContentProviderIds.map(function (sContentProviderId, iIdx) {
                var oContentProvider = that._oContentProviderIndex[sContentProviderId];

                var oGetSitePromise;
                try {
                    oGetSitePromise = oContentProvider.getSite();
                    if (!oGetSitePromise || typeof oGetSitePromise.then !== "function") {
                        throw "getSite does not return a Promise";
                    }
                } catch (oError) {
                    oGetSitePromise = Promise.reject(
                        "call to getSite failed: " + oError
                    );
                }

                return oGetSitePromise
                    .then(
                        // success handler
                        function (/* bound */ sContentProviderId, oExtensionSite) {
                            var oExtensionSiteClone = jQuery.extend(true, {}, oExtensionSite);

                            var oUnreferencedApplicationPerCatalogIndex = that._getUnreferencedCatalogApplications(oExtensionSite);
                            if (Object.keys(oUnreferencedApplicationPerCatalogIndex).length > 0) {
                                var sErrorMessage = that._formatUnreferencedApplications(
                                    sContentProviderId,
                                    oUnreferencedApplicationPerCatalogIndex
                                );

                                jQuery.sap.log.error(sErrorMessage, null, S_COMPONENT_NAME);

                                that._removeUnreferencedApplications(oExtensionSiteClone, oUnreferencedApplicationPerCatalogIndex);
                            }

                            var oLoadResult = {
                                providerId: sContentProviderId,
                                success: true,
                                site: oExtensionSiteClone
                            };

                            oDeferred.notify(oLoadResult);

                            return oLoadResult;
                        }.bind(null, sContentProviderId),

                        // fail handler
                        function (/* bound */ sContentProviderId, sErrorMessage) {
                            return {
                                providerId: sContentProviderId,
                                success: false,
                                error: sErrorMessage
                            };
                        }.bind(null, sContentProviderId)
                    );
            });

            Promise.all(aGetSitePromises).then(function (aLoadResults) {
                oDeferred.resolve(aLoadResults);
            });
        });
        // .fail({
        //   On failure just leave promise in pending state. This should be fine
        //   with the caller.
        // });

        return oDeferred.promise();

    };

    /**
     * Registers extension catalogs (i.e., 3rd Party catalogs).
     *
     * @param {string} sId
     *   The unique id of the content provider.
     * @param {object} oSiteContentProvider
     *   The site content provider implementation.
     * @private
     */
    CommonDataModel.prototype.registerContentProvider = function (sId, oSiteContentProvider) {
        if (this._oContentProviderIndex[sId]) {
            jQuery.sap.log.error(
                "a content provider with ID '" + sId + "' is already registered",
                null,
                S_COMPONENT_NAME
            );
            return;
        }

        this._oContentProviderIndex[sId] = oSiteContentProvider;

        jQuery.sap.log.debug(
            "ContentProvider '" + sId + "' was registered",
            null,
            S_COMPONENT_NAME
        );
    };

    /**
     * Applies the Null Object Pattern to make sure that all group payload properties are initialised with empty
     * arrays or objects.
     *
     * Example:
     * Some adapter functions might assume empty arrays which produces errors if the property is undefined instead.
     * To avoid these problems we just add empty properties where they are needed.
     *
     * @param {object} oPersonalizedSite
     *      Site with personalization.
     *
     * @returns {object}
     *   The modified site
     *
     * @private
     */
    CommonDataModel.prototype._ensureCompleteSite = function (oPersonalizedSite) {
        if (oPersonalizedSite.groups) {
            var oGroups = oPersonalizedSite.groups;

            Object.keys(oGroups).forEach(function (sKey) {
                if (!oGroups[sKey]) {
                    // Undefined group detected. Cleaning it up...
                    delete oGroups[sKey];
                } else {
                    if (!oGroups[sKey].payload) {
                        // We need a payload first
                        oGroups[sKey].payload = {};
                    }

                    // Links
                    if (!oGroups[sKey].payload.links) {
                        oGroups[sKey].payload.links = [];
                    }
                    // Tiles
                    if (!oGroups[sKey].payload.tiles) {
                        oGroups[sKey].payload.tiles = [];
                    }
                    // Groups
                    if (!oGroups[sKey].payload.groups) {
                        oGroups[sKey].payload.groups = [];
                    }
                }
            });
        }

        return oPersonalizedSite;
    };

    /**
     * Filters out groups from the groups order that are not available in the site.
     * This prevents that operations that rely on a consistent groups order work incorrectly,
     * like rearranging the groups on the homepage.
     *
     * @param {object} site The site
     * @returns {object} The site with potentially modified groups order
     *
     * @private
     */
    CommonDataModel.prototype._ensureGroupsOrder = function (site) {
        var aGroupsOrder = ObjectPath.get("site.payload.groupsOrder", site),
            oGroups = site.groups,
            sGroupId,
            i = 0;

        if (!aGroupsOrder) {
            return site;
        }

        // we could use Array.filter here but as there is nothing to do in the most cases we avoid copying the array
        while (i < aGroupsOrder.length) {
            sGroupId = aGroupsOrder[i];
            if (!oGroups[sGroupId]) {
                aGroupsOrder.splice(i, 1);
            } else {
                i++;
            }
        }

        return site;
    };


    /**
     * Gets all plugins of every category in the site.
     *
     * @param {object} [oPluginSetsCache] Cache to use for fetching plugin set.
     * This is useful for testing, if the value is undefined then an internal cache will be used.
     * To invalidate the internal cache, pass null as the value.
     *
     * @returns {jQuery.promise}
     *  A promise which may resolve to the list of plugins on the site.
     *  In the case where the promise gets resolved, it resolves to an immutable
     *  reference.
     *
     * @since 1.48.0
     */
    CommonDataModel.prototype.getPlugins = (function () {
        var fnDeepFreeze,
            fnExtractPluginConfigFromInboundSignature,
            oPluginSets;

        fnExtractPluginConfigFromInboundSignature = function (sPluginName, oSignatureInbounds) {
            var oSignatureParams,
                iNumInbounds = Object.keys(oSignatureInbounds).length;

            if (iNumInbounds === 0) {
                return {};
            }

            if (!oSignatureInbounds.hasOwnProperty("Shell-plugin")) {
                jQuery.sap.log.error(
                    "Cannot find inbound with id 'Shell-plugin' for plugin '" +
                    sPluginName + "'",
                    "plugin startup configuration cannot be determined correctly",
                    S_COMPONENT_NAME
                );
                return {};
            }

            if (iNumInbounds > 1) {
                jQuery.sap.log.warning(
                    "Multiple inbounds are defined for plugin '" + sPluginName + "'",
                    "plugin startup configuration will be determined using "
                    + "the signature of 'Shell-plugin' inbound.",
                    S_COMPONENT_NAME
                );
            }

            oSignatureParams = ObjectPath.get("signature.parameters", oSignatureInbounds["Shell-plugin"]) || {};

            return Object.keys(oSignatureParams).reduce(
                function (oResult, sNextParam) {
                    var sDefaultValue = ObjectPath.get(sNextParam + ".defaultValue.value", oSignatureParams);

                    if (typeof sDefaultValue === "string") {
                        oResult[sNextParam] = sDefaultValue;
                    }

                    return oResult;
                },
                {} /* oResult */
            );
        };

        // Recursively freezes an object.
        fnDeepFreeze = function (o) {
            Object.keys(o)
                .filter(function (sProperty) {
                    return typeof o[sProperty] === "object";
                })
                .forEach(function (sProperty) {
                    o[sProperty] = fnDeepFreeze(o[sProperty]);
                });

            return Object.freeze(o);
        };

        return function (oPluginSetsCache) {

            if (oPluginSetsCache !== undefined) {
                oPluginSets = oPluginSetsCache;
            }

            if (oPluginSets) {
                return jQuery.when(oPluginSets);
            }

            oPluginSets = {};

            return this.getSite().then(function (oSite) {
                var oApplications = oSite.applications || {};

                Object.keys(oApplications).filter(function (sAppName) {

                    return ObjectPath.get("type", this[sAppName]["sap.flp"]) === "plugin";

                }, oApplications).forEach(function (sPluginName) {
                    var oPluginConfig,
                        oConfigFromInboundSignature,
                        oPlugin = this[sPluginName],
                        oComponentProperties = {};

                    if (!isPlainObject(oPlugin["sap.platform.runtime"])) {
                        jQuery.sap.log.error("Cannot find 'sap.platform.runtime' section for plugin '"
                            + sPluginName + "'",
                            "plugin might not be started correctly",
                            "sap.ushell.services.CommonDataModel");
                    } else if (!isPlainObject(oPlugin["sap.platform.runtime"].componentProperties)) {
                        jQuery.sap.log.error("Cannot find 'sap.platform.runtime/componentProperties' " +
                            "section for plugin '"
                            + sPluginName + "'",
                            "plugin might not be started correctly",
                            "sap.ushell.services.CommonDataModel");
                    } else {
                        oComponentProperties = oPlugin["sap.platform.runtime"].componentProperties;
                    }

                    oPluginSets[sPluginName] = {
                        url: oComponentProperties.url,
                        component: oPlugin["sap.ui5"].componentName
                    };

                    //
                    // define plugin configuration
                    //
                    var oSignatureInbounds = ObjectPath.get(
                        "crossNavigation.inbounds", oPlugin["sap.app"]
                    ) || {};

                    oConfigFromInboundSignature = fnExtractPluginConfigFromInboundSignature(
                        sPluginName,
                        oSignatureInbounds
                    );

                    oPluginConfig = jQuery.extend(
                        oComponentProperties.config || {},
                        oConfigFromInboundSignature // has precendence
                    );

                    if (oPluginConfig) {
                        oPluginSets[sPluginName].config = oPluginConfig;
                    }

                    if (oComponentProperties.asyncHints) {
                        oPluginSets[sPluginName].asyncHints = oComponentProperties.asyncHints;
                    }

                    var oDeviceTypes = ObjectPath.get("deviceTypes", oPlugin["sap.ui"]);
                    if (oDeviceTypes) {
                        oPluginSets[sPluginName].deviceTypes = oDeviceTypes;
                    }

                }, oApplications);

                return fnDeepFreeze(oPluginSets);
            }, function (vError) {
                return vError;
            });
        };
    })();

    /**
     * Checks if each of the given display formats is a valid enum entry of {@link sap.ushell.DisplayFormat}.
     * Unsupported values are filtered out from the resulting list.
     *
     * @param {string[]} aDisplayFormats A list of display formats coming from a CDM site. May contain entries that are not part of {@link sap.ushell.DisplayFormat}.
     * @returns {sap.ushell.DisplayFormat[]} A list of supported display formats.
     * @private
     */
    CommonDataModel.prototype._mapDisplayFormats = function (aDisplayFormats) {
        var oDisplayFormatMap = {
            tile: DisplayFormat.Standard,
            standard: DisplayFormat.Standard,
            link: DisplayFormat.Compact,
            compact: DisplayFormat.Compact,
            flat: DisplayFormat.Flat,
            flatWide: DisplayFormat.FlatWide,
            tileWide: DisplayFormat.StandardWide,
            standardWide: DisplayFormat.StandardWide
        };

        var aSupportedFormats = Object.keys(oDisplayFormatMap).filter(function (sDisplayFormat) {
            return aDisplayFormats.indexOf(sDisplayFormat) > -1;
        });

        return aSupportedFormats.map(function (sSupportedFormat) {
            return oDisplayFormatMap[sSupportedFormat];
        });
    };

    CommonDataModel.prototype._ensureProperDisplayFormats = function (oSite) {

        if (oSite.vizTypes) {
            Object.keys(oSite.vizTypes).forEach(function (sKey) {
                if (oSite.vizTypes[sKey]["sap.flp"] && oSite.vizTypes[sKey]["sap.flp"].vizOptions) {
                    var oVizType = oSite.vizTypes[sKey];
                    var aSupportedDisplayFormats = ObjectPath.get("vizOptions.displayFormats.supported", oVizType["sap.flp"]);
                    var sDefaultDisplayFormat = ObjectPath.get("vizOptions.displayFormats.default", oVizType["sap.flp"]);

                    if (aSupportedDisplayFormats) {
                        oSite.vizTypes[sKey]["sap.flp"].vizOptions.displayFormats.supported = this._mapDisplayFormats(aSupportedDisplayFormats);
                    }
                    if (sDefaultDisplayFormat) {
                        oSite.vizTypes[sKey]["sap.flp"].vizOptions.displayFormats.default = this._mapDisplayFormats([sDefaultDisplayFormat])[0];
                    }
                }
            }.bind(this));
        }

        if (oSite.hasOwnProperty("pages")) {
            Object.keys(oSite.pages).forEach(function (sKey) {
                var oPage = oSite.pages[sKey];
                if (oPage.payload && oPage.payload.sections) {
                    var oSections = oPage.payload.sections;
                    Object.keys(oSections).forEach(function (sSectionKey) {
                        var oSection = oSections[sSectionKey];
                        Object.keys(oSection.viz).forEach(function (sVizKey) {
                            var oViz = oSection.viz[sVizKey];
                            if (oViz.displayFormatHint) {
                                var aMappedFormat = this._mapDisplayFormats([oViz.displayFormatHint])[0];
                                oViz.displayFormatHint = aMappedFormat || oViz.displayFormatHint;
                            }
                        }.bind(this));
                    }.bind(this));
                }
            }.bind(this));
        } else if (oSite.hasOwnProperty("groups")) {
            Object.keys(oSite.groups).forEach(function (sGroupKey) {
                var oGroup = oSite.groups[sGroupKey];
                oGroup.payload.tiles.forEach(function (oTile) {
                    if (oTile.displayFormatHint) {
                        var aMappedFormat = this._mapDisplayFormats([oTile.displayFormatHint])[0];
                        oTile.displayFormatHint = aMappedFormat || oTile.displayFormatHint;
                    }
                }.bind(this));
            }.bind(this));
        }

        return oSite;
    };

    /**
     * Adds the standard visualization types if they are not already present in the site.
     *
     * @param {object} oSite
     *  The site
     * @returns {object}
     *  The site, including the standard visualization types
     * @private
     */
    CommonDataModel.prototype._ensureStandardVizTypesPresent = function (oSite) {

        if (!(oSite._version && oSite._version.startsWith("3."))) {
            return oSite;
        }

        if (!oSite.vizTypes) {
            oSite.vizTypes = {};
        }

        if (!oSite.vizTypes[O_STANDARD_VIZ_TYPES.STATIC_LAUNCHER]) {
            // TODO: migration not possible. jQuery.sap.loadResource is deprecated and private.
            oSite.vizTypes[O_STANDARD_VIZ_TYPES.STATIC_LAUNCHER]
                = jQuery.sap.loadResource("sap/ushell/components/tiles/cdm/applauncher/manifest.json");
        }

        if (!oSite.vizTypes[O_STANDARD_VIZ_TYPES.DYNAMIC_LAUNCHER]) {
            // TODO: migration not possible. jQuery.sap.loadResource is deprecated and private.
            oSite.vizTypes[O_STANDARD_VIZ_TYPES.DYNAMIC_LAUNCHER]
                = jQuery.sap.loadResource("sap/ushell/components/tiles/cdm/applauncherdynamic/manifest.json");
        }

        if (!oSite.vizTypes[O_STANDARD_VIZ_TYPES.CARD]) {
            // TODO: migration not possible. jQuery.sap.loadResource is deprecated and private.
            oSite.vizTypes[O_STANDARD_VIZ_TYPES.CARD]
                = jQuery.sap.loadResource("sap/ushell/services/_CommonDataModel/vizTypeDefaults/cardManifest.json");
        }

        return oSite;
    };

    /**
     * Returns the menu entries for a menu
     * @param {string} sMenuKey key of a menu
     *
     * @returns {Promise<object[]>} A promise which resolves in an array of menu entries
     *
     * @private
     * @since 1.76.0
     */
    CommonDataModel.prototype.getMenuEntries = function (sMenuKey) {
        return new Promise(function (resolve, reject) {
            this._oSiteDeferred.then(function (oSite) {
                var aMenuEntries = ObjectPath.get("menus." + sMenuKey + ".payload.menuEntries", oSite);
                // return a copy of the menu so that the original site cannot get changed
                resolve(deepClone(aMenuEntries) || []);
            });
        }.bind(this));
    };

    /**
     * Returns the id of all content providers.
     *
     * @returns {Promise<string[]>} A Promise resolving to an array containing the content provider ids
     *
     * @private
     * @since 1.80.0
     */
    CommonDataModel.prototype.getContentProviderIds = function () {
        return new Promise(function (resolve, reject) {
            this._oSiteDeferred.then(function (oSite) {
                var aSystemAliases = Object.keys(oSite.systemAliases);
                var oContentProviderIds = {};

                objectValues(oSite.applications).forEach(function (oApplication) {
                   var sContentProviderId = readApplications.getContentProviderId(oApplication);

                    if (includes(aSystemAliases, sContentProviderId)) {
                        oContentProviderIds[sContentProviderId] = true;
                    }
                });

                resolve(Object.keys(oContentProviderIds));
            });
        }.bind(this));
    };

    CommonDataModel.hasNoAdapter = false;
    return CommonDataModel;

}, true /* bExport */);
