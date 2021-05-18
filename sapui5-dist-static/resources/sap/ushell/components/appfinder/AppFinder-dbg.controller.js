// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/core/library",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Component",
    "sap/ushell/ui/launchpad/AccessibilityCustomData",
    "sap/ushell/ui5service/ShellUIService",
    "sap/ushell/EventHub",
    "sap/ushell/components/CatalogsManager",
    "sap/ushell/components/appfinder/VisualizationOrganizerHelper",
    "sap/ui/core/routing/HashChanger",
    "sap/ui/thirdparty/jquery",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (
    coreLibrary,
    Controller,
    Component,
    AccessibilityCustomData,
    ShellUIService,
    EventHub,
    CatalogsManager,
    VisualizationOrganizerHelper,
    HashChanger,
    jQuery,
    JSONModel,
    Device
) {
    "use strict";

    // shortcut for sap.ui.core.mvc.ViewType
    var ViewType = coreLibrary.mvc.ViewType;

    return Controller.extend("sap.ushell.components.appfinder.AppFinder", {
        onInit: function () {
            var oComponent = Component.getOwnerComponentFor(this.getView());
            this.oRouter = oComponent.getRouter();

            var oView = this.getView();
            var oModel = oComponent.getModel();

            oView.setModel(oModel);

            this.bEnableEasyAccessSAPMenu = oModel.getProperty("/enableEasyAccessSAPMenu");
            this.bEnableEasyAccessUserMenu = oModel.getProperty("/enableEasyAccessUserMenu");

            this.bShowEasyAccessMenu = (this.bEnableEasyAccessSAPMenu || this.bEnableEasyAccessUserMenu) && (!Device.system.phone && !Device.system.tablet || Device.system.combi);

            sap.ushell.Container.getRenderer("fiori2").createExtendedShellState("appFinderExtendedShellState", function () {
                sap.ushell.Container.getRenderer("fiori2").showHeaderItem("backBtn", true);
                sap.ushell.Container.getRenderer("fiori2").showHeaderItem("homeBtn", true);
            });

            // Initialise the CatalogManager
            // After that, sap.ushell.components.getCatalogsManager() is used to get CatalogManager
            this.oCatalogsManager = new CatalogsManager("catalogsMgr", {
                model: oModel
            });
            this.oVisualizationOrganizerHelper = VisualizationOrganizerHelper.getInstance();

            // model
            this.getView().setModel(this._getSubHeaderModel(), "subHeaderModel");
            this.oConfig = oComponent.getComponentData().config;
            this.oCatalogView = sap.ui.view("catalogView", {
                type: ViewType.JS,
                viewName: "sap.ushell.components.appfinder.Catalog",
                height: "100%",
                viewData: {
                    parentComponent: oComponent,
                    subHeaderModel: this._getSubHeaderModel()
                }
            }).addStyleClass("sapUiGlobalBackgroundColor sapUiGlobalBackgroundColorForce");

            // routing for both 'catalog' and 'appFinder' is supported and added below
            this.oRouter.attachRouteMatched(this._handleAppFinderNavigation.bind(this));

            oView.createSubHeader();

            // setting first focus
            if (!this.bShowEasyAccessMenu) {
                oView.oPage.addContent(this.oCatalogView);

                setTimeout(function () {
                    jQuery("#catalogSelect").focus();
                }, 0);
            }

            // attaching a resize handler to determine is hamburger button should be visible or not in the App Finder sub header.
            Device.resize.attachHandler(this._resizeHandler.bind(this));

            // This router instance needs the ShellNavigationHashChanger instance in order to get the intent prefixed to the new hash automatically.
            // This router doesn't need to be initialized because it doesn't react to any hashChanged event.
            // The new hash will be consumed when the router in Renderer.js component calls its parse method.
            this.oRouter.oHashChanger = HashChanger.getInstance();
        },

        onExit: function () {
            // Explicitly destroy the view to avoid memory leaks if it is not part of the UI5 hierarchy.
            this.oCatalogView.destroy();
        },

        _resizeHandler: function () {
            // update the visibility of the hamburger button upon resizing
            var bShowOpenCloseSplitAppButton = this._showOpenCloseSplitAppButton();

            var bCurrentShowOpenCloseSplitAppButton = this.oSubHeaderModel.getProperty("/openCloseSplitAppButtonVisible");
            if (bShowOpenCloseSplitAppButton !== bCurrentShowOpenCloseSplitAppButton) {
                this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonVisible", bShowOpenCloseSplitAppButton);

                // in case we now show the button, then it must be foced untoggled, as the left panel closes automatically
                if (bShowOpenCloseSplitAppButton) {
                    this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonToggled", false);
                }
            }
            // toggle class on app finder page
            this._toggleViewWithToggleButtonClass(bShowOpenCloseSplitAppButton);
        },

        _handleAppFinderNavigation: function (oEvent) {
            var oView = this.getView();

            this._preloadAppHandler();
            this._getPathAndHandleGroupContext(oEvent);

            // toggle class on app finder page
            this._toggleViewWithToggleButtonClass(this._showOpenCloseSplitAppButton());
            if (this.bShowEasyAccessMenu) {
                // in case we need to show the easy access menu buttons, update sub header accordingly (within the onShow)
                this.onShow(oEvent);
            } else if (oView._showSearch("catalog")) {
                // else no easy access menu buttons, update sub header accordingly
                oView.updateSubHeader("catalog", false);
                // we still have to adjust the view in case we do show the tags in subheader
                this._toggleViewWithSearchAndTagsClasses("catalog");
            }
            sap.ui.getCore().getEventBus().publish("showCatalog");
            EventHub.emit("CenterViewPointContentRendered", "appFinder");

            // Date is included as data to force a call to the subscribers
            // Id is included for UserActivityLog
            EventHub.emit("showCatalog", { sId: "showCatalog", oData: Date.now() });
            sap.ui.getCore().getEventBus().publish("launchpad", "contentRendered");
        },

        _showOpenCloseSplitAppButton: function () {
            return !Device.orientation.landscape || Device.system.phone || this.oView.getModel().getProperty("/isPhoneWidth");
        },

        _resetSubHeaderModel: function () {
            this.oSubHeaderModel.setProperty("/activeMenu", null);

            this.oSubHeaderModel.setProperty("/search", {
                searchMode: false,
                searchTerm: null
            });

            this.oSubHeaderModel.setProperty("/tag", {
                tagMode: false,
                selectedTags: []
            });

            this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonVisible", this._showOpenCloseSplitAppButton());
            this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonToggled", false);
        },

        _getSubHeaderModel: function () {
            if (this.oSubHeaderModel) {
                return this.oSubHeaderModel;
            }
            this.oSubHeaderModel = new JSONModel();
            this._resetSubHeaderModel();
            return this.oSubHeaderModel;
        },

        onTagsFilter: function (oEvent) {
            var oTagsFilter = oEvent.getSource(),
                oSubHeaderModel = oTagsFilter.getModel("subHeaderModel"),
                aSelectedTags = oEvent.getSource().getSelectedItems(),
                bTagsMode = aSelectedTags.length > 0,
                oTagsData = {
                    tagMode: bTagsMode,
                    selectedTags: []
                };

            aSelectedTags.forEach(function (oTag) {
                oTagsData.selectedTags.push(oTag.getText());
            });
            oSubHeaderModel.setProperty("/activeMenu", this.getCurrentMenuName());
            oSubHeaderModel.setProperty("/tag", oTagsData);

            this.oCatalogView.getController().onTag(oTagsData);
        },

        searchHandler: function (oEvent) {
            // get all custom tile keywords
            var oCatalogsManager = sap.ushell.components.getCatalogsManager();
            oCatalogsManager.loadCustomTilesKeyWords();

            var sSearchTerm = oEvent.getSource().getValue(),
                searchChanged = false;
            if (sSearchTerm === null) {
                return;
            }

            // take the data from the model
            var oSearchData = this.oSubHeaderModel.getProperty("/search");
            var sActiveMenu = this.oSubHeaderModel.getProperty("/activeMenu");

            // update active menu to current
            if (this.getCurrentMenuName() !== sActiveMenu) {
                sActiveMenu = this.getCurrentMenuName();
            }
            // update search mode to true - ONLY in case the handler is not invoked by the 'X' button.
            // In case it does we do not update the search mode, it stays as it is
            if (!oSearchData.searchMode && !oEvent.getParameter("clearButtonPressed")) {
                oSearchData.searchMode = true;
            }

            // we are in search mode and on Phone
            if (oSearchData.searchMode && Device.system.phone) {
                // in case we are in phone we untoggle the toggle button when search is invoked as
                // the detailed page of the search results is nevigated to and opened.
                // therefore we untoggle the button of the master page
                this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonToggled", false);
            }

            // check and update the search term
            if (sSearchTerm !== oSearchData.searchTerm) {
                if (this.containsOnlyWhitepaces(sSearchTerm)) {
                    sSearchTerm = "*";
                }
                oSearchData.searchTerm = sSearchTerm;

                searchChanged = true;
            }
            // setting property once so no redundant binding updates will occur
            this.oSubHeaderModel.setProperty("/search", oSearchData);
            this.oSubHeaderModel.setProperty("/activeMenu", sActiveMenu);
            this.oSubHeaderModel.refresh(true);

            if (searchChanged) {
                this.oCatalogView.getController().onSearch(oSearchData);
            }
        },

        /**
         * This method comes to prepare relevant modifications before loading the app.
         * This includes;
         *   - applying custom shell states
         *   - setting the shell-header-title accordingly
         */
        _preloadAppHandler: function () {
            setTimeout(function () {
                if (sap.ushell.Container) {
                    sap.ushell.Container.getRenderer("fiori2").applyExtendedShellState("appFinderExtendedShellState");
                }
                this._updateShellHeader(this.oView.oPage.getTitle());
            }.bind(this), 0);
        },

        getCurrentMenuName: function () {
            return this.currentMenu;
        },

        _navigateTo: function (sName) {
            var sContextNavigation = this.oVisualizationOrganizerHelper.getNavigationContextAsText.apply(this);
            if (sContextNavigation) {
                this.oRouter.navTo(sName, {
                    filters: sContextNavigation
                }, true);
            } else {
                this.oRouter.navTo(sName, {}, true);
            }
        },

        /**
         * Return the navigation context as a string if app finder was opened in scope of a group.
         *
         * @returns {string} Return navigation context or null if no group scope
         *
         * @since 1.76.0
         * @protected
         */
        getGroupNavigationContext: function () {
            var oGroupContext = this.oView.getModel().getProperty("/groupContext");
            var sGroupContextPath = oGroupContext ? oGroupContext.path : null;

            if (sGroupContextPath) {
                return JSON.stringify({ targetGroup: encodeURIComponent(sGroupContextPath) });
            }

            return null;
        },

        getSystemsModels: function () {
            var that = this;
            if (this.getSystemsPromise) {
                return this.getSystemsPromise;
            }

            var getSystemsDeferred = new jQuery.Deferred();
            this.getSystemsPromise = getSystemsDeferred.promise();

            var aModelPromises = ["userMenu", "sapMenu"].map(function (menuType) {
                var systemsModel = new JSONModel();
                systemsModel.setProperty("/systemSelected", null);
                systemsModel.setProperty("/systemsList", []);

                return that.getSystems(menuType).then(function (aReturnSystems) {
                    systemsModel.setProperty("/systemsList", aReturnSystems);
                    return systemsModel;
                });
            });
            jQuery.when.apply(jQuery, aModelPromises).then(function (userMenuModel, sapMenuModel) {
                getSystemsDeferred.resolve(userMenuModel, sapMenuModel);
            });

            return this.getSystemsPromise;
        },

        onSegmentButtonClick: function (oEvent) {
            this.oSubHeaderModel.setProperty("/search/searchMode", false);
            this.oSubHeaderModel.setProperty("/search/searchTerm", "");

            var sName = oEvent.getParameter("id");

            this._navigateTo(sName);
        },

        onShow: function (oEvent) {
            var sParameter = oEvent.getParameter("name");
            if (sParameter === this.getCurrentMenuName()) {
                return;
            }

            // update place holder string on the search input according to the showed menu
            var oView = this.getView();
            oView._updateSearchWithPlaceHolder(sParameter);

            this._updateCurrentMenuName(sParameter);
            this.getSystemsModels().then(function (userMenuSystemsModel, sapMenuSystemsModel) {
                var sapMenuSystemsList = sapMenuSystemsModel.getProperty("/systemsList");
                var userMenuSystemsList = userMenuSystemsModel.getProperty("/systemsList");

                // call view to remove content from page
                oView.oPage.removeAllContent();

                // in case we have systems we do want the sub header to be rendered accordingly
                // (no systems ==> no easy access menu buttons in sub header)
                var systemsList = (this.currentMenu === "sapMenu" ? sapMenuSystemsList : userMenuSystemsList);
                if (systemsList && systemsList.length) {
                    // call view to render the sub header with easy access menus
                    oView.updateSubHeader(this.currentMenu, true);
                } else if (oView._showSearch(this.currentMenu)) {
                    // call view to render the sub header without easy access menus
                    oView.updateSubHeader(this.currentMenu, false);
                }

                if (this.currentMenu === "catalog") {
                    // add catalog view
                    oView.oPage.addContent(this.oCatalogView);
                } else if (this.currentMenu === "userMenu") {
                    // add user menu view, create if first time
                    if (!this.userMenuView) {
                        this.userMenuView = new sap.ui.view("userMenuView", {
                            type: ViewType.JS,
                            viewName: "sap.ushell.components.appfinder.EasyAccess",
                            height: "100%",
                            viewData: {
                                menuName: "USER_MENU",
                                easyAccessSystemsModel: userMenuSystemsModel,
                                parentComponent: Component.getOwnerComponentFor(this.getView()),
                                subHeaderModel: this._getSubHeaderModel(),
                                enableSearch: this.getView()._showSearch("userMenu")
                            }
                        });
                    }
                    oView.oPage.addContent(this.userMenuView);
                } else if (this.currentMenu === "sapMenu") {
                    // add sap menu view, create if first time
                    if (!this.sapMenuView) {
                        this.sapMenuView = new sap.ui.view("sapMenuView", {
                            type: ViewType.JS,
                            viewName: "sap.ushell.components.appfinder.EasyAccess",
                            height: "100%",
                            viewData: {
                                menuName: "SAP_MENU",
                                easyAccessSystemsModel: sapMenuSystemsModel,
                                parentComponent: Component.getOwnerComponentFor(this.getView()),
                                subHeaderModel: this._getSubHeaderModel(),
                                enableSearch: this.getView()._showSearch("sapMenu")
                            }
                        });
                    }
                    oView.oPage.addContent(this.sapMenuView);
                }

                // focus is set on segmented button
                this._setFocusToSegmentedButton(systemsList);

                // SubHeader Model active-menu is updated with current menu
                this.oSubHeaderModel.setProperty("/activeMenu", this.currentMenu);

                // In case toggle button is visible (SubHeader Model toggle button toggled), then it is set to false as we switch the menu
                if (this.oSubHeaderModel.getProperty("/openCloseSplitAppButtonVisible")) {
                    this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonToggled", false);
                }

                this.oSubHeaderModel.refresh(true);
            }.bind(this));
        },

        _updateCurrentMenuName: function (sMenu) {
            // Verify that the menu exists!
            // In case one of the easy access menus is disabled and the user is navigating to the disabled menu,
            // (using some existing link) we need to make sure we will not show the disabled menu!
            if (!this.bShowEasyAccessMenu || (sMenu === "sapMenu" && !this.bEnableEasyAccessSAPMenu) || (sMenu === "userMenu" && !this.bEnableEasyAccessUserMenu)) {
                this.currentMenu = "catalog";
            } else {
                this.currentMenu = sMenu;
            }

            // toggle relevant classes on the App Finder page according to wether it displays search or tags in its subheader or not
            this._toggleViewWithSearchAndTagsClasses(sMenu);
        },

        /*
         * This method sets a class on the AppFinder page to state if tags are shown or not currently in the subheader.
         * The reason for it is that if tags do appear than we have a whole set of different styling to the header and its behavior,
         * so we use different css selectors
         */
        _toggleViewWithSearchAndTagsClasses: function (sMenu) {
            var oView = this.getView();

            if (oView._showSearch(sMenu)) {
                oView.oPage.addStyleClass("sapUshellAppFinderSearch");
            } else {
                oView.oPage.removeStyleClass("sapUshellAppFinderSearch");
            }

            if (oView._showSearchTag(sMenu)) {
                oView.oPage.addStyleClass("sapUshellAppFinderTags");
            } else {
                oView.oPage.removeStyleClass("sapUshellAppFinderTags");
            }
        },

        _toggleViewWithToggleButtonClass: function (bButtonVisible) {
            var oView = this.getView();
            if (bButtonVisible) {
                oView.oPage.addStyleClass("sapUshellAppFinderToggleButton");
            } else {
                oView.oPage.removeStyleClass("sapUshellAppFinderToggleButton");
            }
        },

        _setFocusToSegmentedButton: function (systemsList) {
            var oView = this.getView();

            if (systemsList && systemsList.length) {
                var sButtonId = oView.segmentedButton.getSelectedButton();
                setTimeout(function () {
                    jQuery("#" + sButtonId).focus();
                }, 0);

            } else {
                setTimeout(function () {
                    jQuery("#catalogSelect").focus();
                }, 0);
            }
        },

        /**
         * get the group path (if exists) and update the model with the group context
         * @param {Object} oEvent oEvent
         * @private
         */
        _getPathAndHandleGroupContext: function (oEvent) {
            var oParameters = oEvent.getParameter("arguments");
            var sDataParam = oParameters.filters;
            var oDataParam;
            try {
                oDataParam = JSON.parse(sDataParam);
            } catch (e) {
                oDataParam = sDataParam;
            }

            this.oVisualizationOrganizerHelper.updateModelWithContext.apply(this, [oDataParam]);
        },

        /**
         * Update the groupContext part of the model with the path and ID of the context group, if exists
         *
         * @param {object} [oDataParam] - object contains targetGroup property, like /groups/index_of_group_in_model
         */
        _updateModelWithGroupContext: function (oDataParam) {
            var oLaunchPageService = sap.ushell.Container.getService("LaunchPage"),
                oModel = this.oView.getModel(),
                sPath = (oDataParam && decodeURIComponent(oDataParam.targetGroup)) || "";

            var oGroupModel,
                oGroupContext;

            sPath = sPath === "undefined" ? undefined : sPath;
            oGroupContext = {
                path: sPath,
                id: "",
                title: ""
            };
            // If sPath is defined and is different than empty string - set the group context id.
            // The recursive call is needed in order to wait until groups data is inserted to the model
            if (sPath && sPath !== "") {
                var timeoutGetGroupDataFromModel = function () {
                    var aModelGroups = oModel.getProperty("/groups");
                    if (aModelGroups.length) {
                        oGroupModel = oModel.getProperty(sPath);
                        oGroupContext.id = oLaunchPageService.getGroupId(oGroupModel.object);
                        oGroupContext.title = oGroupModel.title || oLaunchPageService.getGroupTitle(oGroupModel.object);
                        return;
                    }
                    setTimeout(timeoutGetGroupDataFromModel, 100);
                };
                timeoutGetGroupDataFromModel();
            }
            oModel.setProperty("/groupContext", oGroupContext);
        },

        /**
         * @param {string} sMenuType - the menu type. One of sapMenu, userMenu.
         * @returns {*} - a list of systems to show in the system selector dialog
         */
        getSystems: function (sMenuType) {
            var oDeferred = new jQuery.Deferred();
            var clientService = sap.ushell.Container.getService("ClientSideTargetResolution");
            if (!clientService) {
                oDeferred.reject("cannot get ClientSideTargetResolution service");
            } else {
                clientService.getEasyAccessSystems(sMenuType).done(function (oSystems) {
                    var systemsModel = [];
                    var aSystemsID = Object.keys(oSystems);
                    for (var i = 0; i < aSystemsID.length; i++) {
                        var sCurrentsystemID = aSystemsID[i];
                        systemsModel[i] = {
                            systemName: oSystems[sCurrentsystemID].text,
                            systemId: sCurrentsystemID
                        };
                    }

                    oDeferred.resolve(systemsModel);
                }).fail(function (sErrorMsg) {
                    oDeferred.reject("An error occurred while retrieving the systems: " + sErrorMsg);
                });
            }
            return oDeferred.promise();
        },

        _initializeShellUIService: function () {
            this.oShellUIService = new ShellUIService({
                scopeObject: this.getOwnerComponent(),
                scopeType: "component"
            });
        },

        _updateShellHeader: function (sTitle) {
            if (!this.oShellUIService) {
                this._initializeShellUIService();
            }
            this.oShellUIService.setTitle(sTitle);
            this.oShellUIService.setHierarchy();
        },

        /**
         * @param {string} sTerm The input fields
         * @returns {boolean} True if the input field is ' ' (space) or '    ' (a few spaces).
         *     False if the input field contains not only spaces (for example 'a b') or if it is an empty string.
         */
        containsOnlyWhitepaces: function (sTerm) {
            if (!sTerm || sTerm === "") {
                return false;
            }

            return (!sTerm.replace(/\s/g, "").length);
        }
    });
});
