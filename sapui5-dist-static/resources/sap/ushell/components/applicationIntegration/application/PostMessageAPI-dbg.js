// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
/**
 * @fileOverview defines the post message API for all applications running in iframe within the shell
 * @version 1.88.1
 * @private
 */
sap.ui.define([
    "sap/ushell/utils",
    "sap/ui/core/Popup",
    "sap/ui/core/library",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/ui/core/UIComponent",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/ui/footerbar/AddBookmarkButton",
    "sap/ushell/services/_AppState/AppStatePersistencyMethod",
    "sap/ushell/EventHub",
    "sap/ushell/components/applicationIntegration/application/PostMessageAPIInterface",
    "sap/ui/thirdparty/URI",
    "sap/base/util/ObjectPath",
    "sap/ushell/Config",
    "sap/base/util/UriParameters"
], function (
    utils,
    Popup,
    coreLib,
    jQuery,
    Log,
    UIComponent,
    AppConfiguration,
    AddBookmarkButton,
    AppStatePersistencyMethod,
    EventHub,
    PostMessageAPIInterface,
    URI,
    ObjectPath,
    Config,
    UriParameters
) {
    "use strict";

    var SAP_API_PREFIX = "sap.ushell.";

    var oDummyComponent = new UIComponent(),
        oPopup = {};

    /**
     * All APIs must start with "sap.ushell" prefix
     */
    var oAPIs = {
        "sap.ushell.services.CrossApplicationNavigation": {
            oServiceCalls: {
                "hrefForExternal": {
                    executeServiceCallFn: function (oServiceParams) {
                        return new jQuery.Deferred().resolve(sap.ushell.Container.getService("CrossApplicationNavigation").hrefForExternal(oServiceParams.oMessageData.body.oArgs)).promise();
                    }
                },
                "getSemanticObjectLinks": {
                    executeServiceCallFn: function (oServiceParams) {
                        // beware sSemanticObject may also be an array of argument arrays
                        // {sSemanticObject, mParameters, bIgnoreFormFactors }
                        return sap.ushell.Container.getService("CrossApplicationNavigation").
                        getSemanticObjectLinks(oServiceParams.oMessageData.body.sSemanticObject, oServiceParams.oMessageData.body.mParameters,
                            oServiceParams.oMessageData.body.bIgnoreFormFactors, undefined, undefined, oServiceParams.oMessageData.body.bCompactIntents);
                    }
                },
                "isIntentSupported": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("CrossApplicationNavigation").isIntentSupported(oServiceParams.oMessageData.body.aIntents);
                    }
                },
                "isNavigationSupported": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("CrossApplicationNavigation").isNavigationSupported(oServiceParams.oMessageData.body.aIntents);
                    }
                },
                "backToPreviousApp": {
                    executeServiceCallFn: function (/*oServiceParams*/) {
                        sap.ushell.Container.getService("CrossApplicationNavigation").backToPreviousApp();
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "historyBack": {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getService("CrossApplicationNavigation").historyBack(oServiceParams.oMessageData.body.iSteps);
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "getAppStateData": {
                    executeServiceCallFn: function (oServiceParams) {
                        // note: sAppStateKey may be an array of argument arrays
                        return sap.ushell.Container.getService("CrossApplicationNavigation").getAppStateData(oServiceParams.oMessageData.body.sAppStateKey);
                    }
                },
                "toExternal": {
                    executeServiceCallFn: function (oServiceParams) {
                        var oArgs = utils.clone(oServiceParams.oMessageData.body.oArgs);

                        utils.storeSapSystemToLocalStorage(oArgs);
                        return new jQuery.Deferred().resolve(sap.ushell.Container.getService("CrossApplicationNavigation").toExternal(oArgs)).promise();
                    }
                },
                "registerBeforeAppCloseEvent": {
                    executeServiceCallFn: function (oServiceParams) {
                        oServiceParams.oContainer.setProperty("beforeAppCloseEvent",
                            {
                                enabled:true,
                                params:oServiceParams.oMessageData.body
                            },
                            true
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "expandCompactHash": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("CrossApplicationNavigation").expandCompactHash(
                            oServiceParams.oMessageData.body.sHashFragment);
                    }
                },
                "getDistinctSemanticObjects": {
                    executeServiceCallFn: function (/*oServiceParams*/) {
                        return sap.ushell.Container.getService("CrossApplicationNavigation").getDistinctSemanticObjects();
                    }
                },
                "getLinks": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("CrossApplicationNavigation").getLinks(
                            oServiceParams.oMessageData.body);
                    }
                },
                "getPrimaryIntent": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("CrossApplicationNavigation").getPrimaryIntent(
                            oServiceParams.oMessageData.body.sSemanticObject,
                            oServiceParams.oMessageData.body.mParameters);
                    }
                },
                "hrefForAppSpecificHash": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("CrossApplicationNavigation").hrefForAppSpecificHash(
                            oServiceParams.oMessageData.body.sAppHash);
                    }
                },
                "isInitialNavigation": {
                    executeServiceCallFn: function () {
                        return sap.ushell.Container.getService("CrossApplicationNavigation").hrefForAppSpecificHash();
                    }
                },
                "getAppState": {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();

                        sap.ushell.Container.getService("CrossApplicationNavigation").getAppState(
                            oDummyComponent,
                            oServiceParams.oMessageData.body.sAppStateKey
                        ).done(function (oState) {
                            delete oState._oServiceInstance;
                            oDeferred.resolve(oState);
                        });

                        return oDeferred.promise();
                    }
                },
                "setInnerAppRoute": {
                    executeServiceCallFn: function (oServiceParams) {
                        var oUrlParsing = sap.ushell.Container.getService("URLParsing"),
                            oHash = oUrlParsing.parseShellHash(window.hasher.getHash()),
                            sNewHash;

                        //do nothing if new is exactly like the current one
                        if (oHash.appSpecificRoute === oServiceParams.oMessageData.body.appSpecificRoute) {
                            return new jQuery.Deferred().resolve().promise();
                        }
                        oHash.appSpecificRoute = oServiceParams.oMessageData.body.appSpecificRoute;
                        sNewHash = "#" + oUrlParsing.constructShellHash(oHash);
                        window.hasher.changed.active = false;
                        window.hasher.replaceHash(sNewHash);
                        window.hasher.changed.active = true;
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "setInnerAppStateData": {
                    executeServiceCallFn: function (oServiceParams) {
                        var sKey = PostMessageAPI.prototype._setInnerAppStateData(oServiceParams);
                        return new jQuery.Deferred().resolve(sKey).promise();
                    }
                },
                "resolveIntent": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("CrossApplicationNavigation").resolveIntent(
                            oServiceParams.oMessageData.body.sHashFragment);
                    }
                }
            }
        },
        "sap.ushell.ui5service.ShellUIService": {
            oServiceCalls: {
                "setTitle": {
                    executeServiceCallFn: function (oServiceParams) {
                        return new jQuery.Deferred().resolve(oServiceParams.oContainer.getShellUIService().setTitle(oServiceParams.oMessageData.body.sTitle)).promise();
                    }
                },
                "setBackNavigation": {
                    executeServiceCallFn: function (oServiceParams) {
                        return oServiceParams.executeSetBackNavigationService(oServiceParams.oMessage, oServiceParams.oMessageData);
                    }
                }
            }
        },
        "sap.ushell.services.ShellUIService": {
            oServiceCalls: {
                "setTitle": {
                    executeServiceCallFn: function (oServiceParams) {
                        return new jQuery.Deferred().resolve(oServiceParams.oContainer.getShellUIService().setTitle(oServiceParams.oMessageData.body.sTitle)).promise();
                    }
                },
                "setHierarchy": {
                    executeServiceCallFn: function (oServiceParams) {
                        return new jQuery.Deferred().resolve(oServiceParams.oContainer.getShellUIService().setHierarchy(oServiceParams.oMessageData.body.aHierarchyLevels)).promise();
                    }
                },
                "setRelatedApps": {
                    executeServiceCallFn: function (oServiceParams) {
                        return new jQuery.Deferred().resolve(oServiceParams.oContainer.getShellUIService().setRelatedApps(oServiceParams.oMessageData.body.aRelatedApps)).promise();
                    }
                },
                "setDirtyFlag": {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.setDirtyFlag(oServiceParams.oMessageData.body.bIsDirty);
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "showShellUIBlocker": {
                    executeServiceCallFn: function (oServiceParams) {
                        showUIBlocker(oServiceParams.oMessageData.body.bShow);
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "getFLPUrl": {
                    executeServiceCallFn: function (oServiceParams) {
                        var bIncludeHash = false;
                        if (oServiceParams.oMessageData.body && oServiceParams.oMessageData.body.bIncludeHash === true) {
                            bIncludeHash = true;
                        }
                        return new jQuery.Deferred().resolve(sap.ushell.Container.getFLPUrl(bIncludeHash)).promise();
                    }
                },
                "getShellGroupIDs": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("Bookmark").getShellGroupIDs(
                            (oServiceParams.oMessageData.body ? oServiceParams.oMessageData.body.bGetAll : undefined));
                    }
                },
                "addBookmark": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("Bookmark").addBookmarkByGroupId(
                            oServiceParams.oMessageData.body.oParameters,
                            oServiceParams.oMessageData.body.groupId
                        );
                    }
                },
                "addBookmarkDialog": {
                    executeServiceCallFn: function (oServiceParams) {
                        var dialogButton = new AddBookmarkButton();
                        dialogButton.firePress({});
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "getShellGroupTiles": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("LaunchPage").getTilesByGroupId(oServiceParams.oMessageData.body.groupId);
                    }
                },
                "sendUrlAsEmail" : {
                    executeServiceCallFn: function (oServiceParams) {
                        var sAppName = Config.last("/core/shellHeader/application").title;
                        var sSubject = (sAppName === undefined) ?
                                sap.ushell.resources.i18n.getText("linkToApplication") :
                                sap.ushell.resources.i18n.getText("linkTo") + " '" + sAppName + "'";
                        PostMessageAPI.prototype._sendEmail(
                            "",
                            sSubject,
                            document.URL,
                            "",
                            "",
                            document.URL,
                            true
                        );

                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "sendEmailWithFLPButton" : {
                    executeServiceCallFn: function (oServiceParams) {
                        var sAppName = Config.last("/core/shellHeader/application").title;
                        var sSubject = (sAppName === undefined) ?
                                sap.ushell.resources.i18n.getText("linkToApplication") :
                                sap.ushell.resources.i18n.getText("linkTo") + " '" + sAppName + "'";
                        PostMessageAPI.prototype._sendEmail(
                            "",
                            sSubject,
                            document.URL,
                            "",
                            "",
                            document.URL,
                            oServiceParams.oMessageData.body.bSetAppStateToPublic
                        );

                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "sendEmail": {
                    executeServiceCallFn: function (oServiceParams) {
                        PostMessageAPI.prototype._sendEmail(
                            oServiceParams.oMessageData.body.sTo,
                            oServiceParams.oMessageData.body.sSubject,
                            oServiceParams.oMessageData.body.sBody,
                            oServiceParams.oMessageData.body.sCc,
                            oServiceParams.oMessageData.body.sBcc,
                            oServiceParams.oMessageData.body.sIFrameURL,
                            oServiceParams.oMessageData.body.bSetAppStateToPublic
                        );
                    }
                },
                "processHotKey": {
                    executeServiceCallFn: function (oServiceParams) {
                        var oEvent;
                        // IE doesn't support creating the KeyboardEvent object with a the "new" constructor, hence if this will fail, it will be created
                        // using the document object- https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/KeyboardEvent
                        // This KeyboardEvent has a constructor, so checking for its ecsitaance will not solve this, hence, only solution found is try-catch
                        try {
                            oEvent = new KeyboardEvent('keydown', oServiceParams.oMessageData.body);
                        } catch (err) {
                            var IEevent = document.createEvent("KeyboardEvent"),
                                sSpecialKeys = "";
                            // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/initKeyboardEvent
                            if (oServiceParams.oMessageData.body.altKey) {
                                sSpecialKeys += "Alt ";
                            }
                            if (oServiceParams.oMessageData.body.ctrlKey) {
                                sSpecialKeys += "Control ";
                            }
                            if (oServiceParams.oMessageData.body.shiftKey) {
                                sSpecialKeys += "Shift ";
                            }
                            IEevent.initKeyboardEvent("keydown", false, false, null, oServiceParams.oMessageData.body.key, oServiceParams.oMessageData.body.keyCode, sSpecialKeys, 0, false);
                            oEvent = IEevent;
                        }
                        document.dispatchEvent(oEvent);
                        return new jQuery.Deferred().resolve().promise();
                    }
                }
            }
        },
        "sap.ushell.services.Container": {
            oServiceCalls: {
                "setDirtyFlag": {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.setDirtyFlag(oServiceParams.oMessageData.body.bIsDirty);
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "getFLPUrl": {
                    executeServiceCallFn: function (oServiceParams) {
                        var bIncludeHash = false;
                        if (oServiceParams.oMessageData.body && oServiceParams.oMessageData.body.bIncludeHash === true) {
                            bIncludeHash = true;
                        }
                        return new jQuery.Deferred().resolve(sap.ushell.Container.getFLPUrl(bIncludeHash)).promise();
                    }
                },
                "getFLPConfig": {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();

                        sap.ushell.Container.getFLPConfig().then(function (oFLPConfiguration) {
                            oDeferred.resolve(oFLPConfiguration);
                        });
                        return oDeferred.promise();
                    }
                }
            }
        },
        "sap.ushell.services.AppState": {
            oServiceCalls: {
                "getAppState": {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();

                        sap.ushell.Container.getService("AppState").getAppState(
                            oServiceParams.oMessageData.body.sKey
                        ).done(function (oState) {
                            delete oState._oServiceInstance;
                            oDeferred.resolve(oState);
                        }).fail(function (oState) {
                            delete oState._oServiceInstance;
                            oDeferred.resolve(oState);
                        });

                        return oDeferred.promise();
                    }
                },
                "_saveAppState": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("AppState")._saveAppState(
                            oServiceParams.oMessageData.body.sKey,
                            oServiceParams.oMessageData.body.sData,
                            oServiceParams.oMessageData.body.sAppName,
                            oServiceParams.oMessageData.body.sComponent,
                            oServiceParams.oMessageData.body.bTransient,
                            oServiceParams.oMessageData.body.iPersistencyMethod,
                            oServiceParams.oMessageData.body.oPersistencySettings
                        );
                    }
                },
                "_loadAppState": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("AppState")._loadAppState(
                            oServiceParams.oMessageData.body.sKey
                        );
                    }
                },
                "deleteAppState": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("AppState").deleteAppState(
                            oServiceParams.oMessageData.body.sKey
                        );
                    }
                },
                "makeStatePersistent": function (oServiceParams) {
                    return sap.ushell.Container.getService("AppState").makeStatePersistent(
                        oServiceParams.oMessageData.body.sKey,
                        oServiceParams.oMessageData.body.iPersistencyMethod,
                        oServiceParams.oMessageData.body.oPersistencySettings
                    );
                }
            }
        },
        "sap.ushell.services.Bookmark": {
            oServiceCalls: {
                "addBookmarkUI5": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("Bookmark").addBookmark(
                            oServiceParams.oMessageData.body.oParameters,
                            oServiceParams.oMessageData.body.vContainer
                        );
                    }
                },
                "addBookmark": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("Bookmark").addBookmarkByGroupId(
                            oServiceParams.oMessageData.body.oParameters,
                            oServiceParams.oMessageData.body.groupId
                        );
                    }
                },
                "getShellGroupIDs": {
                    executeServiceCallFn: function (/*oServiceParams*/) {
                        return sap.ushell.Container.getService("Bookmark").getShellGroupIDs();
                    }
                },
                "addCatalogTileToGroup": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("Bookmark").addCatalogTileToGroup(
                            oServiceParams.oMessageData.body.sCatalogTileId,
                            oServiceParams.oMessageData.body.sGroupId,
                            oServiceParams.oMessageData.body.oCatalogData
                        );
                    }
                },
                "countBookmarks": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("Bookmark").countBookmarks(
                            oServiceParams.oMessageData.body.sUrl);
                    }
                },
                "deleteBookmarks": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("Bookmark").deleteBookmarks(
                            oServiceParams.oMessageData.body.sUrl);
                    }
                },
                "updateBookmarks": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("Bookmark").updateBookmarks(
                            oServiceParams.oMessageData.body.sUrl,
                            oServiceParams.oMessageData.body.oParameters
                        );
                    }
                },
                "getContentNodes" : {
                    executeServiceCallFn: function (/*oServiceParams*/) {
                        var oDeferred = jQuery.Deferred();
                        sap.ushell.Container.getService("Bookmark").getContentNodes().then(function (oNodes) {
                            oDeferred.resolve(oNodes);
                        });
                        return oDeferred.promise();
                    }
                },
                "addCustomBookmark" : {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = jQuery.Deferred();
                        sap.ushell.Container.getService("Bookmark").addCustomBookmark(
                            oServiceParams.oMessageData.body.sVizType,
                            oServiceParams.oMessageData.body.oConfig,
                            oServiceParams.oMessageData.body.vContentNodes
                        ).then(function () {
                            oDeferred.resolve();
                        });
                        return oDeferred.promise();
                    }
                },
                "countCustomBookmarks" : {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = jQuery.Deferred();
                        sap.ushell.Container.getService("Bookmark").countCustomBookmarks(
                            oServiceParams.oMessageData.body.oIdentifier
                        ).then(function (oCount) {
                            oDeferred.resolve(oCount);
                        });
                        return oDeferred.promise();
                    }
                },
                "updateCustomBookmarks" : {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = jQuery.Deferred();
                        sap.ushell.Container.getService("Bookmark").updateCustomBookmarks(
                            oServiceParams.oMessageData.body.oIdentifier,
                            oServiceParams.oMessageData.body.oConfig
                        ).then(function (oCount) {
                            oDeferred.resolve(oCount);
                        });
                        return oDeferred.promise();
                    }
                },
                "deleteCustomBookmarks" : {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = jQuery.Deferred();
                        sap.ushell.Container.getService("Bookmark").deleteCustomBookmarks(
                            oServiceParams.oMessageData.body.oIdentifier
                        ).then(function (oCount) {
                            oDeferred.resolve(oCount);
                        });
                        return oDeferred.promise();
                    }
                }
            }
        },
        "sap.ushell.services.AppLifeCycle": {
            oServiceCalls: {
                "getFullyQualifiedXhrUrl": {
                    executeServiceCallFn: function (oServiceParams) {
                        var result = "",
                            xhr = "",
                            oDeferred = new jQuery.Deferred(),
                            path = oServiceParams.oMessageData.body.path;

                        if (path != "" && path != undefined && path != null) {
                            sap.ushell.Container.getService("AppLifeCycle").getCurrentApplication()
                                                    .getSystemContext().then(function (oSystemContext) {
                                xhr = oSystemContext.getFullyQualifiedXhrUrl(path);

                                var sHostName = "",
                                    sProtocol = "",
                                    sPort = "",
                                    sFlpURL = sap.ushell.Container.getFLPUrl(true),
                                    oURI = new URI(sFlpURL);
                                if (oURI.protocol() != null && oURI.protocol() != undefined && oURI.protocol() != "") {
                                    sProtocol = oURI.protocol() + "://";
                                }
                                if (oURI.hostname() != null && oURI.hostname() != undefined && oURI.hostname() != "") {
                                    sHostName = oURI.hostname();
                                }
                                if (oURI.port() != null && oURI.port() != undefined && oURI.port() != "") {
                                    sPort = ":" + oURI.port();
                                }

                                result = sProtocol + sHostName + sPort + xhr;
                                oDeferred.resolve(result);
                            });
                        }

                        return oDeferred.promise();
                    }
                },
                "getSystemAlias": {
                    executeServiceCallFn: function (oServiceParams) {
                        var sSystemAlias = oServiceParams.oContainer.getSystemAlias();
                        if (sSystemAlias === null || sSystemAlias === undefined) {
                            sSystemAlias = "";
                        }

                        return new jQuery.Deferred().resolve(sSystemAlias).promise();
                    }
                }
            }
        },
        "sap.ushell.services.AppConfiguration": {
            oServiceCalls: {
                "setApplicationFullWidth": {
                    executeServiceCallFn: function (oServiceParams) {
                        AppConfiguration.setApplicationFullWidth(oServiceParams.oMessageData.body.bValue);
                        return new jQuery.Deferred().resolve().promise();
                    }
                }
            }
        },
        "sap.ushell.appRuntime": {
            oRequestCalls: {
                "innerAppRouteChange": {
                    isActiveOnly: true,
                    distributionType: ["all"]
                },
                "hashChange": {
                    isActiveOnly: true,
                    distributionType: ["URL"]
                },
                "setDirtyFlag": {
                    isActiveOnly: true,
                    distributionType: ["URL"]
                },
                "themeChange": {
                    isActiveOnly: false,
                    distributionType: ["all"]
                },
                "uiDensityChange": {
                    isActiveOnly: false,
                    distributionType: ["all"]
                }
            },
            oServiceCalls: {
                "hashChange": {
                    executeServiceCallFn: function (oServiceParams) {
                        //FIX for internal incident #1980317281 - In general, hash structure in FLP is splitted into 3 parts:
                        //A - application identification & B - Application parameters & C - Internal application area
                        // Now, when an IFrame changes its hash, it sends PostMessage up to the FLP. The FLP does 2 things: Change its URL
                        // and send a PostMessage back to the IFrame. This fix instruct the Shell.Controller.js to block only
                        // the message back to the IFrame.
                        window.hasher.disableBlueBoxHashChangeTrigger = true;
                        window.hasher.replaceHash(oServiceParams.oMessageData.body.newHash);
                        window.hasher.disableBlueBoxHashChangeTrigger = false;
                        return new jQuery.Deferred().resolve().promise();
                    }
                }
            }
        },
        "sap.ushell.services.UserInfo": {
            oServiceCalls: {
                "getThemeList": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("UserInfo").getThemeList();
                    }
                },

                "openThemeManager": {
                    executeServiceCallFn: function (oServiceParams) {
                        EventHub.emit("openThemeManager", Date.now());
                        return new jQuery.Deferred().resolve().promise();
                    }
                }
            }
        },
        "sap.ushell.services.ShellNavigation": {
            oServiceCalls: {
                "toExternal": {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getService("ShellNavigation").toExternal(
                            oServiceParams.oMessageData.body.oArgs,
                            undefined,
                            oServiceParams.oMessageData.body.bWriteHistory
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "toAppHash": {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getService("ShellNavigation").toAppHash(
                            oServiceParams.oMessageData.body.sAppHash,
                            oServiceParams.oMessageData.body.bWriteHistory
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                }
            }
        },
        "sap.ushell.services.NavTargetResolution": {
            oServiceCalls: {
                "getDistinctSemanticObjects": {
                    executeServiceCallFn: function (/*oServiceParams*/) {
                        return sap.ushell.Container.getService("NavTargetResolution").getDistinctSemanticObjects();
                    }
                },
                "expandCompactHash": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("NavTargetResolution").expandCompactHash(
                            oServiceParams.oMessageData.body.sHashFragment
                        );
                    }
                },
                "resolveHashFragment": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("NavTargetResolution").resolveHashFragment(
                            oServiceParams.oMessageData.body.sHashFragment
                        );
                    }
                },
                "isNavigationSupported": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("NavTargetResolution").isNavigationSupported(
                            oServiceParams.oMessageData.body.aIntents
                        );
                    }
                }
            }
        },
        "sap.ushell.services.Renderer": {
            oServiceCalls: {
                "addHeaderItem": {
                    executeServiceCallFn: function (oServiceParams) {
                        addRendererButton("addHeaderItem", oServiceParams);
                        return new jQuery.Deferred().resolve().promise();
                    }
                },

                "addHeaderEndItem": {
                    executeServiceCallFn: function (oServiceParams) {
                        addRendererButton("addHeaderEndItem", oServiceParams);
                        return new jQuery.Deferred().resolve().promise();
                    }
                },

                "showHeaderItem": {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getRenderer("fiori2").showHeaderItem(
                            oServiceParams.oMessageData.body.aIds,
                            oServiceParams.oMessageData.body.bCurrentState || true,
                            oServiceParams.oMessageData.body.aStates
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "showHeaderEndItem": {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getRenderer("fiori2").showHeaderEndItem(
                            oServiceParams.oMessageData.body.aIds,
                            oServiceParams.oMessageData.body.bCurrentState || true,
                            oServiceParams.oMessageData.body.aStates
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "hideHeaderItem": {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getRenderer("fiori2").hideHeaderItem(
                            oServiceParams.oMessageData.body.aIds,
                            oServiceParams.oMessageData.body.bCurrentState || true,
                            oServiceParams.oMessageData.body.aStates
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "hideHeaderEndItem": {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getRenderer("fiori2").hideHeaderEndItem(
                            oServiceParams.oMessageData.body.aIds,
                            oServiceParams.oMessageData.body.bCurrentState || true,
                            oServiceParams.oMessageData.body.aStates
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "setHeaderTitle": {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getRenderer("fiori2").setHeaderTitle(
                            oServiceParams.oMessageData.body.sTitle
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "setHeaderVisibility": {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getRenderer("fiori2").setHeaderVisibility(
                            oServiceParams.oMessageData.body.bVisible,
                            oServiceParams.oMessageData.body.bCurrentState || true,
                            oServiceParams.oMessageData.body.aStates
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "createShellHeadItem": {
                    executeServiceCallFn: function (oServiceParams) {
                        var params = oServiceParams.oMessageData.body.params;
                        params.press = function () {
                            oServiceParams.oContainer.postMessageRequest(
                                "sap.ushell.appRuntime.buttonClick",
                                { buttonId: params.id }
                            );
                        };
                        new sap.ushell.ui.shell.ShellHeadItem(params);
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "showActionButton": {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getRenderer("fiori2").showActionButton(
                            oServiceParams.oMessageData.body.aIds,
                            oServiceParams.oMessageData.body.bCurrentState,
                            oServiceParams.oMessageData.body.aStates
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "hideActionButton": {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getRenderer("fiori2").hideActionButton(
                            oServiceParams.oMessageData.body.aIds,
                            oServiceParams.oMessageData.body.bCurrentState,
                            oServiceParams.oMessageData.body.aStates
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "addUserAction": {
                    executeServiceCallFn: function (oServiceParams) {
                        oServiceParams.oMessageData.body.oParameters.oControlProperties.press = function () {
                            oServiceParams.oContainer.postMessageRequest(
                                "sap.ushell.appRuntime.buttonClick",
                                { buttonId: oServiceParams.oMessageData.body.oParameters.oControlProperties.id }
                            );
                        };
                        sap.ushell.Container.getRenderer("fiori2").addUserAction(
                            oServiceParams.oMessageData.body.oParameters
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "addOptionsActionSheetButton": {
                    executeServiceCallFn: function (oServiceParams) {
                        new sap.m.Button({
                            id: oServiceParams.oMessageData.body.id,
                            text: oServiceParams.oMessageData.body.text,
                            icon: oServiceParams.oMessageData.body.icon,
                            tooltip: oServiceParams.oMessageData.tooltip,
                            press: function () {
                                oServiceParams.oContainer.postMessageRequest(
                                    "sap.ushell.appRuntime.buttonClick",
                                    { buttonId: oServiceParams.oMessageData.body.id }
                                );
                            }
                        });
                        sap.ushell.Container.getRenderer("fiori2").showActionButton(
                            [oServiceParams.oMessageData.body.id],
                            false,
                            oServiceParams.oMessageData.body.aStates
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "removeOptionsActionSheetButton": {
                    executeServiceCallFn: function (oServiceParams) {
                        var oBtn = sap.ui.getCore().byId(oServiceParams.oMessageData.body.id);
                        sap.ushell.Container.getRenderer("fiori2").hideActionButton(
                            oServiceParams.oMessageData.body.id,
                            false,
                            oServiceParams.oMessageData.body.aStates
                        );
                        oBtn.destroy();
                        return new jQuery.Deferred().resolve().promise();
                    }
                }
            }
        },
        "sap.ushell.services.LaunchPage": {
            oServiceCalls: {
                "getGroupsForBookmarks": {
                    executeServiceCallFn: function (/*oServiceParams*/) {
                        return sap.ushell.Container.getService("LaunchPage").getGroupsForBookmarks();
                    }
                }
            }
        }
    };

    /**
     * @private
     */
    function PostMessageAPI () {
        /**
         * @private
         */
        this._getBrowserURL = function () {
            return document.URL;
        };

        //check that all APIs start with "sap.ushell". FLP will not
        // start successfully if this is not the case
        Object.keys(oAPIs).forEach(function(sKey) {
            if (sKey.indexOf(SAP_API_PREFIX) != 0) {
                throw new Error("All Post Message APIs must start with '" + SAP_API_PREFIX + "' - " + sKey);
            }
        });

        PostMessageAPIInterface.init(
            true,
            PostMessageAPI.prototype.registerShellCommunicationHandler.bind(this));
    }

    /**
     * @private
     */
    PostMessageAPI.prototype.getAPIs = function () {
        return oAPIs;
    };

    /**
     * @private
     */
    function addShellCommunicationHandler (sKey, oCommunicationEntry) {
        //only one entry is possible in oCommunicationHandler because we got here from registerShellCommunicationHandler!
        var oCommObject = oAPIs[sKey],
            oNewCommEntry;

        //We have the entry just update it
        if (oCommObject) {
            //add the communication handler to that entry
            if (oCommunicationEntry.oServiceCalls) {
                Object.keys(oCommunicationEntry.oServiceCalls).forEach(function (key) {
                    oCommObject.oServiceCalls[key] = oCommunicationEntry.oServiceCalls[key];
                });
            }

            if (oCommunicationEntry.oRequestCalls) {
                Object.keys(oCommunicationEntry.oRequestCalls).forEach(function (key) {
                    oCommObject.oRequestCalls[key] = oCommunicationEntry.oRequestCalls[key];
                });
            }

            return;
        }

        //create a new entry..
        oNewCommEntry = {
            oRequestCalls: {},
            oServiceCalls: {}
        };

        if (oCommunicationEntry.oServiceCalls) {
            Object.keys(oCommunicationEntry.oServiceCalls).forEach(function (key) {
                oNewCommEntry.oServiceCalls[key] = oCommunicationEntry.oServiceCalls[key];
            });
        }

        if (oCommunicationEntry.oRequestCalls) {
            Object.keys(oCommunicationEntry.oRequestCalls).forEach(function (key) {
                oNewCommEntry.oRequestCalls[key] = oCommunicationEntry.oRequestCalls[key];
            });
        }

        oAPIs[sKey] = oNewCommEntry;
    }

    /**
     * @private
     */
    PostMessageAPI.prototype._getPostMesageInterface = function (sServiceName, sInterface) {
        var oCommHandlerService,
            oShellCommunicationHandlersObj = this.getAPIs();

        if (oShellCommunicationHandlersObj[sServiceName]) {
            oCommHandlerService = oShellCommunicationHandlersObj[sServiceName];
            if (oCommHandlerService && oCommHandlerService.oRequestCalls && oCommHandlerService.oRequestCalls[sInterface]) {
                return oCommHandlerService.oRequestCalls[sInterface];
            }
        }

        return undefined;
    };

    /**
     * @private
     */
    PostMessageAPI.prototype.registerShellCommunicationHandler = function (oCommunicationHandler) {
        Object.keys(oCommunicationHandler).forEach(function (sKey) {
            addShellCommunicationHandler(sKey, oCommunicationHandler[sKey]);
        });
    };

    /**
     * @private
     */
    PostMessageAPI.prototype.isActiveOnly = function (sServiceName, sInterface) {
        var oCommandInterface = this._getPostMesageInterface(sServiceName, sInterface);

        if (oCommandInterface) {
            return oCommandInterface.isActiveOnly;
        }

        return undefined;
    };

    /**
     * @private
     */
    PostMessageAPI.prototype.getResponseHandler = function (sServiceName, sInterface) {
        var oCommandInterface = this._getPostMesageInterface(sServiceName, sInterface);

        if (oCommandInterface) {
            return oCommandInterface.fnResponseHandler;
        }

        return undefined;
    };

    /**
     * @private
     */
    PostMessageAPI.prototype._createNewInnerAppState = function (oServiceParams) {
        var oService = sap.ushell.Container.getService("AppState"),
            oNewState,
            sHash,
            sCurrAppStateKey,
            sNewAppStateKey,
            oValue;

        oNewState = oService.createEmptyAppState(undefined, false);
        if (oServiceParams.oMessageData.body.sData !== undefined) {
            try {
                oValue = JSON.parse(oServiceParams.oMessageData.body.sData);
            } catch (e) {
                oValue = oServiceParams.oMessageData.body.sData;
            }
        } else {
            oValue = "";
        }
        oNewState.setData(oValue);
        oNewState.save();
        sNewAppStateKey = oNewState.getKey();


        sHash = window.hasher.getHash();
        if (sHash.indexOf("&/") > 0) {
            if (sHash.indexOf("sap-iapp-state=") > 0) {
                sCurrAppStateKey = /(?:sap-iapp-state=)([^&/]+)/.exec(sHash)[1];
                sHash = sHash.replace(sCurrAppStateKey, sNewAppStateKey);
            } else {
                sHash = sHash + "/sap-iapp-state=" + sNewAppStateKey;
            }
        } else {
            sHash = sHash + "&/sap-iapp-state=" + sNewAppStateKey;
        }

        window.hasher.changed.active = false;
        window.hasher.replaceHash(sHash);
        window.hasher.changed.active = true;

        return sNewAppStateKey;
    };

    /**
     * @private
     */
    PostMessageAPI.prototype._setInnerAppStateData = function (oServiceParams) {
        //at the moment, replace the state with a new one
        return PostMessageAPI.prototype._createNewInnerAppState(oServiceParams);
    };

    /**
     * Show/Hide UI blocker in the entire shell.
     * This functionality is needed for the cFLP scenario, when the
     * application that runs in the iframe locks the iframe UI (probably
     * sue to a dialog display) and as a result, the cFLP shell also needs
     * to lock itself.
     * The implementation is done in a non standard way by calling
     * private functions in the Popup class, and this is because the UI5
     * team was not able to provide duch functionality yet, and the POs
     * approved to go with this way
     *
     * @since 1.66.0
     * @private
     */
    function showUIBlocker (bShow) {
        if (bShow === true && oPopup.oDlg === undefined) {
            if (jQuery("#canvas") && jQuery("#canvas").hasClass("sapUshellShellBG")) {
                jQuery("#canvas").removeClass("sapUshellShellBG");
                oPopup.bClassRemoved = true;
            }
            oPopup.oDlg = new Popup();
            oPopup.oDlg.setShadow(true);
            oPopup.oDlg.setModal(true, "sapMDialogBlockLayerInit");
            oPopup.oDlg.setNavigationMode("SCOPE");
            oPopup.oDlg.eOpenState = coreLib.OpenState.OPEN;
            jQuery("#shell-cntnt").css("zIndex", 40);
            oPopup.oDlg._iZIndex = 30;
            oPopup.oDlg._duringOpen();
        } else if (bShow === false && oPopup.oDlg !== undefined) {
            oPopup.oDlg._oLastPosition = oPopup.oDlg._oDefaultPosition;
            oPopup.oDlg.destroy();
            if (oPopup.bClassRemoved === true) {
                jQuery("#canvas").addClass("sapUshellShellBG");
            }
            oPopup.oDlg = undefined;
            oPopup.bClassRemoved = false;
            jQuery("#shell-cntnt").css("zIndex", "auto");
        }
    }

    /**
     * @private
     */
    function addRendererButton (sAPI, oServiceParams) {
        sap.ushell.Container.getRenderer("fiori2")[sAPI](
            "sap.ushell.ui.shell.ShellHeadItem", {
                id: oServiceParams.oMessageData.body.sId,
                tooltip: oServiceParams.oMessageData.body.sTooltip,
                icon: oServiceParams.oMessageData.body.sIcon,
                press: function () {
                    oServiceParams.oContainer.postMessageRequest(
                        "sap.ushell.appRuntime.buttonClick",
                        { buttonId: oServiceParams.oMessageData.body.sId }
                    );
                }
            },
            oServiceParams.oMessageData.body.bVisible,
            oServiceParams.oMessageData.body.bCurrentState || true,
            oServiceParams.oMessageData.body.aStates);
    }

    /**
     * @private
     */
    PostMessageAPI.prototype._sendEmail = function (sTo, sSubject, sBody, sCc, sBcc, sIFrameURL, bSetAppStateToPublic) {
        var sFLPUrl = this._getBrowserURL();

        function replaceIframeUrlToFLPUrl(sIFrameURL, sFLPUrl) {
            if (sIFrameURL && sIFrameURL.length > 0
                && ((sSubject && sSubject.includes(sIFrameURL)) || (sBody && sBody.includes(sIFrameURL)))) {
                // Replace the URL
                if (sBody && sBody.includes(sIFrameURL)) {
                    sBody = sBody.replace(sIFrameURL, sFLPUrl);
                }
                if (sSubject && sSubject.includes(sIFrameURL)) {
                    sSubject = sSubject.replace(sIFrameURL, sFLPUrl);
                }
            }
        }

        if (bSetAppStateToPublic) {
            sap.ushell.Container.getService("AppState").setAppStateToPublic(sIFrameURL)
                .done(function (sNewURL, sXStateKey, sIStateKey, sXStateKeyNew, sIStateKeyNew) {
                    if (sXStateKeyNew !== undefined) {
                        sFLPUrl = sFLPUrl.replace(sXStateKey, sXStateKeyNew);
                    }
                    if (sIStateKeyNew !== undefined) {
                        sFLPUrl = sFLPUrl.replace(sIStateKey, sIStateKeyNew);
                    }
                    //check if the subject or the body of the email contain the IFrame URL
                    replaceIframeUrlToFLPUrl(sIFrameURL, sFLPUrl);
                    // Send the email
                    sap.m.URLHelper.triggerEmail(sTo, sSubject, sBody, sCc, sBcc);
                })
                .fail(Log.error);
        } else {
            //check if the subject or the body of the email contain the IFrame URL
            replaceIframeUrlToFLPUrl(sIFrameURL, sFLPUrl);
            //Send the email
            sap.m.URLHelper.triggerEmail(sTo, sSubject, sBody, sCc, sBcc);
        }
    };

    return new PostMessageAPI();
}, false);
