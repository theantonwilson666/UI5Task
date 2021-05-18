// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/library",
    "sap/ui/core/mvc/Controller",
    "sap/ushell/Config",
    "sap/ushell/services/AppType",
    "sap/ushell/utils/WindowUtils",
    "sap/ui/model/json/JSONModel",
    "sap/m/library",
    "sap/base/Log"
], function (
    ushellLibrary,
    Controller,
    Config,
    AppType,
    WindowUtils,
    JSONModel,
    mobileLibrary,
    Log
) {
    "use strict";

    // shortcut for sap.m.GenericTileScope
    var GenericTileScope = mobileLibrary.GenericTileScope;

    var GenericTileMode = mobileLibrary.GenericTileMode;

    var DisplayFormat = ushellLibrary.DisplayFormat;

    /* global hasher */

    return Controller.extend("sap.ushell.components.tiles.cdm.applauncher.StaticTile", {
        _aDoableObject: {},
        _getConfiguration: function () {
            var oConfig = this.getView().getViewData();
            oConfig.properties.sizeBehavior = Config.last("/core/home/sizeBehavior");
            oConfig.properties.wrappingType = Config.last("/core/home/wrappingType");
            return oConfig;
        },

        onInit: function () {
            var oView = this.getView();
            var oModel = new JSONModel();
            oModel.setData(this._getConfiguration());

            // set model, add content
            oView.setModel(oModel);
            // listen for changes of the size behavior, as the end user can change it in the settings,(if enabled)
            this._aDoableObject = Config.on("/core/home/sizeBehavior").do(function (sSizeBehavior) {
                oModel.setProperty("/properties/sizeBehavior", sSizeBehavior);
            });

            var oViewData = this.getView().getViewData();
            var oViewDataProperties = oViewData.properties;
            var sContentProviderId = oViewData.properties.contentProviderId;

            oViewDataProperties.mode = oViewDataProperties.mode || (oViewDataProperties.icon ? "ContentMode" : "HeaderMode");

            if (oViewDataProperties.displayFormat === DisplayFormat.Compact
                && oViewDataProperties.title && oViewDataProperties.targetURL) {
                oModel.setProperty("/properties/mode", GenericTileMode.LineMode);
            }

            switch (oViewDataProperties.displayFormat) {
                case DisplayFormat.Flat:
                    oModel.setProperty("/properties/frameType", "OneByHalf");
                    break;
                case DisplayFormat.FlatWide:
                    oModel.setProperty("/properties/frameType", "TwoByHalf");
                    break;
                case DisplayFormat.StandardWide:
                    oModel.setProperty("/properties/frameType", "TwoByOne");
                    break;
                default: {
                    oModel.setProperty("/properties/frameType", "OneByOne");
                }
            }

            if (Config.last("/core/contentProviders/providerInfo/show")) {
                sap.ushell.Container.getServiceAsync("ClientSideTargetResolution")
                    .then(function (oCSTR) {
                        return oCSTR.getSystemContext(sContentProviderId);
                    })
                    .then(function (oSystemContext) {
                        oModel.setProperty("/properties/contentProviderLabel", oSystemContext.label);
                    })
                    .catch(function (oError) {
                        Log.error("StaticTile.controller threw an error:", oError);
                    });
            }
        },

        onExit: function () {
            this._aDoableObject.off();
        },

        // trigger to show the configuration UI if the tile is pressed in Admin mode
        onPress: function (oEvent) {
            var oTileConfig = this.getView().getViewData().properties;

            if (oEvent.getSource().getScope && oEvent.getSource().getScope() === GenericTileScope.Display) {
                var sTargetURL = this._createTargetUrl();
                if (!sTargetURL) {
                    return;
                }

                if (sTargetURL[0] === "#") {
                    hasher.setHash(sTargetURL);
                } else {
                    // add the URL to recent activity log
                    var bLogRecentActivity = Config.last("/core/shell/enableRecentActivity") && Config.last("/core/shell/enableRecentActivityLogging");
                    if (bLogRecentActivity) {
                        var oRecentEntry = {
                            title: oTileConfig.title,
                            appType: AppType.URL,
                            url: oTileConfig.targetURL,
                            appId: oTileConfig.targetURL
                        };
                        sap.ushell.Container.getRenderer("fiori2").logRecentActivity(oRecentEntry);
                    }

                    WindowUtils.openURL(sTargetURL, "_blank");
                }
            }
        },

        updatePropertiesHandler: function (oNewProperties) {
            var oTile = this.getView().getContent()[0],
                oTileContent = oTile.getTileContent()[0];

            if (typeof oNewProperties.title !== "undefined") {
                oTile.setHeader(oNewProperties.title);
            }
            if (typeof oNewProperties.subtitle !== "undefined") {
                oTile.setSubheader(oNewProperties.subtitle);
            }
            if (typeof oNewProperties.icon !== "undefined") {
                oTileContent.getContent().setSrc(oNewProperties.icon);
            }
            if (typeof oNewProperties.info !== "undefined") {
                oTileContent.setFooter(oNewProperties.info);
            }
        },

        _createTargetUrl: function () {
            var sTargetURL = this.getView().getViewData().properties.targetURL,
                sSystem = this.getView().getViewData().configuration["sap-system"],
                oUrlParser, oHash;

            if (sTargetURL && sSystem) {
                oUrlParser = sap.ushell.Container.getService("URLParsing");
                // when the navigation url is hash we want to make sure system parameter is in the parameters part
                if (oUrlParser.isIntentUrl(sTargetURL)) {
                    oHash = oUrlParser.parseShellHash(sTargetURL);
                    if (!oHash.params) {
                        oHash.params = {};
                    }
                    oHash.params["sap-system"] = sSystem;
                    sTargetURL = "#" + oUrlParser.constructShellHash(oHash);
                } else {
                    sTargetURL += ((sTargetURL.indexOf("?") < 0) ? "?" : "&") + "sap-system=" + sSystem;
                }
            }
            return sTargetURL;
        },

        // Return lean url for the <a> tag of the Generic Tile
        _getLeanUrl: function () {
            return WindowUtils.getLeanURL(this._createTargetUrl());
        },

        _getCurrentProperties: function () {
            var oTile = this.getView().getContent()[0],
                oTileContent = oTile.getTileContent()[0],
                sizeBehavior = Config.last("/core/home/sizeBehavior");

            return {
                title: oTile.getHeader(),
                subtitle: oTile.getSubheader(),
                info: oTileContent.getFooter(),
                icon: oTileContent.getContent().getSrc(),
                mode: oTile.getMode(),
                sizeBehavior: sizeBehavior
            };
        }
    });
}, /* bExport= */ true);
