// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/library",
    "sap/ushell/ui/appfinder/AppBox",
    "sap/ushell/ui/appfinder/PinButton",
    "sap/ushell/ui/launchpad/CatalogEntryContainer",
    "sap/ushell/ui/launchpad/CatalogsContainer",
    "sap/ushell/ui/launchpad/Tile",
    "sap/ui/thirdparty/jquery",
    "sap/ui/performance/Measurement",
    "sap/ushell/resources",
    "sap/ushell/ui/launchpad/AccessibilityCustomData",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/ui/Device",
    "sap/m/MessagePage",
    "sap/m/Page",
    "sap/m/PageAccessibleLandmarkInfo",
    "sap/m/BusyIndicator",
    "sap/m/SplitApp",
    "sap/ushell/Config",
    "sap/ushell/components/appfinder/VisualizationOrganizerHelper",
    "sap/ushell/renderers/fiori2/AccessKeysHandler"
], function (
    coreLibrary,
    AppBox,
    PinButton,
    CatalogEntryContainer,
    CatalogsContainer,
    Tile,
    jQuery,
    Measurement,
    resources,
    AccessibilityCustomData,
    List,
    StandardListItem,
    Device,
    MessagePage,
    Page,
    PageAccessibleLandmarkInfo,
    BusyIndicator,
    SplitApp,
    Config,
    VisualizationOrganizerHelper,
    AccessKeysHandler
) {
    "use strict";

    var AccessibleLandmarkRole = coreLibrary.AccessibleLandmarkRole;

    sap.ui.jsview("sap.ushell.components.appfinder.Catalog", {
        oController: null,
        oVisualizationOrganizerHelper: VisualizationOrganizerHelper.getInstance(),

        formatPinButtonTooltip: function (aGroupsIDs, oGroupContext) {
            var sText;

            if (oGroupContext.path) {
                var iCatalogTileInGroup = aGroupsIDs ? Array.prototype.indexOf.call(aGroupsIDs, oGroupContext.id) : -1;
                sText = iCatalogTileInGroup !== -1 ? "removeAssociatedTileFromContextGroup" : "addAssociatedTileToContextGroup";

                return resources.i18n.getText(sText, oGroupContext.title);
            }

            sText = aGroupsIDs && aGroupsIDs.length ? "EasyAccessMenu_PinButton_Toggled_Tooltip" : "EasyAccessMenu_PinButton_UnToggled_Tooltip";
            return resources.i18n.getText(sText);
        },

        formatPinButtonSelectState: function (aAssociatedGroups, associatedGroupsLength, sGroupContextModelPath, sGroupContextId) {
            if (sGroupContextModelPath) {
                // If in group context - the icon is determined according to whether this catalog tile exists in the group or not
                var iCatalogTileInGroup = aAssociatedGroups ? Array.prototype.indexOf.call(aAssociatedGroups, sGroupContextId) : -1;
                return iCatalogTileInGroup !== -1;
            }
            return !!associatedGroupsLength;
        },

        createContent: function (oController) {
            var that = this;

            this.oViewData = this.getViewData();
            this.parentComponent = this.oViewData.parentComponent;

            var oModel = this.parentComponent.getModel();
            this.setModel(oModel);
            this.setModel(this.oViewData.subHeaderModel, "subHeaderModel");
            this.oVisualizationOrganizerHelper.setModel(oModel);
            this.oController = oController;

            function iflong (sLong) {
                return ((sLong !== null) && (sLong === "1x2" || sLong === "2x2")) || false;
            }

            var oTilePinButton = new PinButton({
                icon: { path: "id", formatter: this.oVisualizationOrganizerHelper.formatPinButtonIcon },
                type: { path: "id", formatter: this.oVisualizationOrganizerHelper.formatPinButtonType },
                selected: {
                    parts: ["associatedGroups", "associatedGroups/length", "/groupContext/path", "/groupContext/id"],
                    formatter: this.oVisualizationOrganizerHelper.formatPinButtonSelectState.bind(this)
                },
                tooltip: {
                    parts: ["associatedGroups", "/groupContext", "id"],
                    formatter: this.oVisualizationOrganizerHelper.formatPinButtonTooltip.bind(this)
                },
                press: [this.oVisualizationOrganizerHelper.onTilePinButtonClick, this]
            });

            var oAppBoxPinButton = new PinButton({
                icon: { path: "id", formatter: this.oVisualizationOrganizerHelper.formatPinButtonIcon },
                type: { path: "id", formatter: this.oVisualizationOrganizerHelper.formatPinButtonType },
                selected: {
                    parts: ["associatedGroups", "associatedGroups/length", "/groupContext/path", "/groupContext/id"],
                    formatter: this.oVisualizationOrganizerHelper.formatPinButtonSelectState.bind(this)
                },
                tooltip: {
                    parts: ["associatedGroups", "/groupContext", "id"],
                    formatter: this.oVisualizationOrganizerHelper.formatPinButtonTooltip.bind(this)
                },
                press: [this.oVisualizationOrganizerHelper.onTilePinButtonClick, this]
            });

            this.oAppBoxesTemplate = new AppBox({
                title: "{title}",
                icon: "{icon}",
                subtitle: "{subtitle}",
                url: "{url}",
                navigationMode: "{navigationMode}",
                pinButton: oAppBoxPinButton,
                press: [oController.onAppBoxPressed, oController]
            });

            // When personalization is disabled, one should not see any option to click the pin button to personalize one's homepage.
            var bEnabledPersonalization = Config.last("/core/shell/enablePersonalization");
            oAppBoxPinButton.setVisible(bEnabledPersonalization);

            oAppBoxPinButton.addCustomData(new AccessibilityCustomData({
                key: "tabindex",
                value: "-1",
                writeToDom: true
            }));
            oAppBoxPinButton.addStyleClass("sapUshellPinButton");

            oTilePinButton.setVisible(bEnabledPersonalization);
            oTilePinButton.addCustomData(new AccessibilityCustomData({
                key: "tabindex",
                value: "-1",
                writeToDom: true
            }));
            oTilePinButton.addStyleClass("sapUshellPinButton");

            this.oTileTemplate = new Tile({
                tileViews: {
                    path: "content",
                    factory: function (sId, oContext) {
                        return oContext.getObject();
                    }
                },
                long: {
                    path: "size",
                    formatter: iflong
                },
                tileCatalogId: "{id}",
                pinButton: oTilePinButton,
                press: [oController.catalogTilePress, oController],
                afterRendering: oController.onTileAfterRendering
            });

            this.oCatalogSelect = new List("catalogSelect", {
                visible: "{/enableCatalogSelection}",
                rememberSelections: true,
                mode: "SingleSelectMaster",
                items: {
                    path: "/masterCatalogs",
                    template: new StandardListItem({
                        type: "Active",
                        title: "{title}"
                    })
                },
                showNoData: false,
                itemPress: [oController._handleCatalogListItemPress, oController],
                selectionChange: [oController._handleCatalogListItemPress, oController]
            });

            this.getCatalogSelect = function () {
                return this.oCatalogSelect;
            };

            /*
             * override original onAfterRendering as currently sap.m.Select does not support afterRendering handler in the constructor
             * this is done to support tab order accessibility
             */
            var origCatalogSelectOnAfterRendering = this.oCatalogSelect.onAfterRendering;
            if (Device.system.desktop) {
                this.oCatalogSelect.addEventDelegate({
                    onsaptabnext: function (oEvent) {
                        try {
                            oEvent.preventDefault();
                            AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                            sap.ushell.components.ComponentKeysHandler.setFocusOnCatalogTile();
                        } catch (e) {
                            // continue regardless of error
                        }
                    },
                    onsapskipforward: function (oEvent) {
                        try {
                            oEvent.preventDefault();
                            AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                            sap.ushell.components.ComponentKeysHandler.setFocusOnCatalogTile();
                        } catch (e) {
                            // continue regardless of error
                        }
                    },
                    onsapskipback: function (oEvent) {
                        try {
                            oEvent.preventDefault();
                            AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                            var openCloseSplitAppButton = sap.ui.getCore().byId("openCloseButtonAppFinderSubheader");
                            if (openCloseSplitAppButton.getVisible()) {
                                openCloseSplitAppButton.focus();
                            } else {
                                sap.ushell.components.ComponentKeysHandler.appFinderFocusMenuButtons(oEvent);
                            }
                        } catch (e) {
                            // continue regardless of error
                        }
                    }
                });
            }
            // if xRay is enabled
            if (oModel.getProperty("/enableHelp")) {
                this.oCatalogSelect.addStyleClass("help-id-catalogCategorySelect");// xRay help ID
            }

            this.setCategoryFilterSelection = function (sSelection, shouldFocusOnCategory) {
                var oCatalogSelection = that.getCatalogSelect();
                var aCatalogListItems = oCatalogSelection.getItems();
                var sSelected = sSelection;
                var selectedIndex = 0;

                if (!sSelected || sSelected === "") {
                    sSelected = resources.i18n.getText("all");
                }

                aCatalogListItems.forEach(function (oListItem, nIndex) {
                    if (oListItem.getTitle() === sSelected) {
                        selectedIndex = nIndex;
                        oCatalogSelection.setSelectedItem(oListItem);
                    }
                });

                if (aCatalogListItems.length !== 0 && shouldFocusOnCategory) {
                    aCatalogListItems[selectedIndex].focus();
                }
            };

            this.oCatalogSelect.onAfterRendering = function () {
                //set the selected item.
                var sSelected = that.oController.categoryFilter || resources.i18n.getText("all");

                that.setCategoryFilterSelection(sSelected);

                if (origCatalogSelectOnAfterRendering) {
                    origCatalogSelectOnAfterRendering.apply(this, arguments);
                }

                if (!this.getSelectedItem()) {
                    this.setSelectedItem(this.getItems()[0]);
                }

                //set focus on first segmented button
                setTimeout(function () {
                    var buttons = jQuery("#catalog-button, #userMenu-button, #sapMenu-button").filter("[tabindex=0]");
                    if (buttons.length) {
                        buttons.eq(0).focus();
                    } else {
                        jQuery("#catalog-button").focus();
                    }
                }, 0);
            };

            /*
             * setting followOf to false, so the popover won't close on IE.
             */
            var origOnAfterRenderingPopover = this.oCatalogSelect._onAfterRenderingPopover;
            this.oCatalogSelect._onAfterRenderingPopover = function () {
                if (this._oPopover) {
                    this._oPopover.setFollowOf(false);
                }
                if (origOnAfterRenderingPopover) {
                    origOnAfterRenderingPopover.apply(this, arguments);
                }
            };

            var oEventBus = sap.ui.getCore().getEventBus();
            var sDetailPageId;
            var fnUpdateMasterDetail = function () {
                this.splitApp.toMaster("catalogSelect", "show");
                if (!Device.system.phone) {
                    sDetailPageId = this._calculateDetailPageId();
                    if (sDetailPageId !== this.splitApp.getCurrentDetailPage().getId()) {
                        this.splitApp.toDetail(sDetailPageId);
                    }
                }
            }.bind(this);

            oEventBus.subscribe("launchpad", "catalogContentLoaded", function () {
                setTimeout(fnUpdateMasterDetail, 500);
            }, this);
            oEventBus.subscribe("launchpad", "afterCatalogSegment", fnUpdateMasterDetail, this);

            var oCatalogTemplate = new CatalogEntryContainer({
                header: "{title}",
                customTilesContainer: {
                    path: "customTiles",
                    template: this.oTileTemplate,
                    templateShareable: true
                },
                appBoxesContainer: {
                    path: "appBoxes",
                    template: this.oAppBoxesTemplate,
                    templateShareable: true
                }
            });

            this.oMessagePage = new MessagePage({
                visible: true,
                showHeader: false,
                text: resources.i18n.getText("EasyAccessMenu_NoAppsToDisplayMessagePage_Text"),
                description: ""
            });

            this.oCatalogsContainer = new CatalogsContainer("catalogTiles", {
                categoryFilter: "{/categoryFilter}",
                catalogs: {
                    path: "/catalogs",
                    templateShareable: true,
                    template: oCatalogTemplate
                },
                busy: true
            }).addStyleClass("sapUiTinyMarginTop");

            this.oCatalogsContainer.addStyleClass("sapUshellCatalogTileContainer");

            this.oCatalogsContainer.addEventDelegate({
                onsaptabprevious: function (oEvent) {
                    var openCloseSplitAppButton = sap.ui.getCore().byId("openCloseButtonAppFinderSubheader");
                    var jqCurrentElement = jQuery(oEvent.srcControl.getDomRef());
                    if (openCloseSplitAppButton.getVisible() && !openCloseSplitAppButton.getPressed() &&
                        !jqCurrentElement.hasClass("sapUshellPinButton")) {
                        oEvent.preventDefault();
                        var appFinderSearch = sap.ui.getCore().byId("appFinderSearch");
                        appFinderSearch.focus();
                    }
                },
                onsapskipback: function (oEvent) {
                    var openCloseSplitAppButton = sap.ui.getCore().byId("openCloseButtonAppFinderSubheader");
                    if (openCloseSplitAppButton.getVisible() && !openCloseSplitAppButton.getPressed()) {
                        oEvent.preventDefault();
                        openCloseSplitAppButton.focus();
                    }
                }
            });

            this.oCatalogsContainer.onAfterRendering = function () {
                var oCatalogTilesDetailedPage = sap.ui.getCore().byId("catalogTilesDetailedPage");
                if (!this.getBusy()) {
                    oCatalogTilesDetailedPage.setBusy(false);
                    Measurement.end("FLP:AppFinderLoadingStartToEnd");
                } else {
                    oCatalogTilesDetailedPage.setBusy(true);
                }

                jQuery("#catalogTilesDetailedPage-cont").scroll(function () {
                    var oPage = sap.ui.getCore().byId("catalogTilesDetailedPage");
                    var scroll = oPage.getScrollDelegate();
                    var currentPos = scroll.getScrollTop();
                    var max = scroll.getMaxScrollTop();

                    if (max - currentPos <= 30 + 3 * that.oController.PagingManager.getTileHeight() && that.oController.bIsInProcess === false) {
                        that.oController.bIsInProcess = true;
                        that.oController.allocateNextPage();
                        setTimeout(
                            function () {
                                that.oController.bIsInProcess = false;
                            }, 0);
                    }
                });
            };

            var oCatalogDetailedPage = new Page("catalogTilesDetailedPage", {
                showHeader: false,
                showFooter: false,
                showNavButton: false,
                content: [
                    this.oCatalogsContainer.addStyleClass("sapUshellCatalogPage")
                ],
                landmarkInfo: new PageAccessibleLandmarkInfo({
                    contentLabel: resources.i18n.getText("appFinderCatalogTitle"),
                    contentRole: AccessibleLandmarkRole.Region
                })
            });

            var oCatalogMessage = new Page("catalogMessagePage", {
                showHeader: false,
                showFooter: false,
                showNavButton: false,
                content: [this.oMessagePage]
            });

            var oSelectBusyIndicator = new BusyIndicator("catalogSelectBusyIndicator", { size: "1rem" });
            this.splitApp = new SplitApp("catalogViewMasterDetail", {
                masterPages: [oSelectBusyIndicator, this.oCatalogSelect],
                detailPages: [oCatalogDetailedPage, oCatalogMessage],
                mode: "{= ${/isPhoneWidth} ? 'HideMode' : 'ShowHideMode'}"
            });

            return this.splitApp;
        },

        // calculate what is the relevant current detail page according to configuration and state of the view
        _calculateDetailPageId: function () {
            var oSubHeaderModel = this.getModel("subHeaderModel");
            var bSearchMode = oSubHeaderModel.getProperty("/search/searchMode");
            var bTagMode = oSubHeaderModel.getProperty("/tag/tagMode");
            var bNoCatalogs = !!this.getModel().getProperty("/catalogsNoDataText");
            var sId;
            if (bSearchMode || bTagMode) {
                sId = this.getController().bSearchResults ? "catalogTilesDetailedPage" : "catalogMessagePage";
            } else if (bNoCatalogs) {
                sId = "catalogMessagePage";
            } else {
                sId = "catalogTilesDetailedPage";
            }
            return sId;
        },

        getControllerName: function () {
            return "sap.ushell.components.appfinder.Catalog";
        }
    });
});
