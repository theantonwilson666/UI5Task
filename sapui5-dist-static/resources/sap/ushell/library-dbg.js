// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

/**
 * Initialization Code and shared classes of library sap.ushell.
 */
sap.ui.define([
    "sap/ui/core/Core" // make sure that core is loaded
], function () {
    "use strict";

    // library dependencies
    // delegate further initialization of this library to the Core
    sap.ui.getCore().initLibrary({
        name: "sap.ushell",
        version: "1.88.1",
        dependencies: [
            "sap.f",
            "sap.m",
            "sap.ui.core",
            "sap.ui.layout"
        ],
        types: [
            "sap.ushell.AllMyAppsState",
            "sap.ushell.AppTitleState",
            "sap.ushell.ContentNodeType",
            "sap.ushell.components.container.ApplicationType",
            "sap.ushell.DisplayFormat",
            "sap.ushell.NavigationState",
            "sap.ushell.ui.launchpad.ViewPortState",
            "sap.ushell.ui.tile.State",
            "sap.ushell.ui.tile.StateArrow",
            "sap.ushell.VisualizationLoadState"
        ],
        interfaces: [],
        controls: [
            "sap.ushell.components.container.ApplicationContainer",
            "sap.ushell.components.factsheet.controls.PictureTile", // deprecated since 1.22
            "sap.ushell.components.factsheet.controls.PictureViewer", // deprecated since 1.22
            "sap.ushell.components.factsheet.controls.PictureViewerItem", // deprecated since 1.22
            "sap.ushell.components.shell.Settings.userDefaults.UserDefaultsForm",
            "sap.ushell.components.tiles.sbtilecontent", // more then one control

            // are these files still needed? -> ask Search colleagues
            "sap.ushell.renderers.fiori2.search.controls.CustomSearchResultListItem",
            "sap.ushell.renderers.fiori2.search.controls.CustomSearchResultListItemContent",
            "sap.ushell.renderers.fiori2.search.controls.DivContainer",
            "sap.ushell.renderers.fiori2.search.controls.SearchAdvancedCondition",
            "sap.ushell.renderers.fiori2.search.controls.SearchButton",
            "sap.ushell.renderers.fiori2.search.controls.SearchFacet",
            "sap.ushell.renderers.fiori2.search.controls.SearchFacetBarChart",
            "sap.ushell.renderers.fiori2.search.controls.SearchFacetDialog",
            "sap.ushell.renderers.fiori2.search.controls.SearchFacetFilter", // multiple controls
            "sap.ushell.renderers.fiori2.search.controls.SearchFacetItem",
            "sap.ushell.renderers.fiori2.search.controls.SearchFacetPieChart",
            "sap.ushell.renderers.fiori2.search.controls.SearchFacetTabBar", // multiple controls
            "sap.ushell.renderers.fiori2.search.controls.SearchFieldGroup",
            "sap.ushell.renderers.fiori2.search.controls.SearchFilterBar",
            "sap.ushell.renderers.fiori2.search.controls.SearchInput",
            "sap.ushell.renderers.fiori2.search.controls.SearchLabel",
            "sap.ushell.renderers.fiori2.search.controls.SearchLayout",
            "sap.ushell.renderers.fiori2.search.controls.SearchLink",
            "sap.ushell.renderers.fiori2.search.controls.SearchMultiSelectionControl",
            "sap.ushell.renderers.fiori2.search.controls.SearchNoResultScreen",
            "sap.ushell.renderers.fiori2.search.controls.SearchObjectSuggestionImage",
            "sap.ushell.renderers.fiori2.search.controls.SearchRelatedObjectsToolbar",
            "sap.ushell.renderers.fiori2.search.controls.SearchResultGrid",
            "sap.ushell.renderers.fiori2.search.controls.SearchResultList",
            "sap.ushell.renderers.fiori2.search.controls.SearchResultListContainer",
            "sap.ushell.renderers.fiori2.search.controls.SearchResultListItem",
            "sap.ushell.renderers.fiori2.search.controls.SearchResultListItemDocument",
            "sap.ushell.renderers.fiori2.search.controls.SearchResultListItemNote",
            "sap.ushell.renderers.fiori2.search.controls.SearchResultMap",
            "sap.ushell.renderers.fiori2.search.controls.SearchResultTable",
            "sap.ushell.renderers.fiori2.search.controls.SearchSelect",
            "sap.ushell.renderers.fiori2.search.controls.SearchText",
            "sap.ushell.renderers.fiori2.search.controls.SearchTilesContainer",
            "sap.ushell.renderers.fiori2.search.controls.twitter.SearchTweet",
            "sap.ushell.renderers.fiori2.search.inputhelp.SearchInputHelp",
            "sap.ushell.renderers.fiori2.search.inputhelp.SearchInputHelpDialog",
            "sap.ushell.renderers.fiori2.search.inputhelp.SearchInputHelpPage",
            "sap.ushell.renderers.fiori2.search.inputhelp.SearchInputHelpWizard",

            // VizInstance service
            "sap.ushell.ui.launchpad.VizInstance",
            "sap.ushell.ui.launchpad.VizInstanceAbap",
            "sap.ushell.ui.launchpad.VizInstanceCdm",
            "sap.ushell.ui.launchpad.VizInstanceLaunchPage",
            "sap.ushell.ui.launchpad.VizInstanceLink",

            "sap.ushell.ui.AppContainer",
            "sap.ushell.ui.ContentNodeSelector",
            "sap.ushell.ui.bookmark.ContentNodeTreeItem", // path miss-match
            "sap.ushell.ui.CustomGroupHeaderListItem",
            "sap.ushell.ui.ShellHeader",
            "sap.ushell.ui.appfinder.AppBox",
            "sap.ushell.ui.appfinder.PinButton",
            "sap.ushell.ui.footerbar.AboutButton",
            "sap.ushell.ui.footerbar.AddBookmarkButton",
            "sap.ushell.ui.footerbar.ContactSupportButton",
            "sap.ushell.ui.footerbar.EndUserFeedback",
            "sap.ushell.ui.footerbar.JamDiscussButton",
            "sap.ushell.ui.footerbar.JamShareButton",
            "sap.ushell.ui.footerbar.LogoutButton",
            "sap.ushell.ui.footerbar.SendAsEmailButton",
            "sap.ushell.ui.footerbar.SettingsButton",
            "sap.ushell.ui.footerbar.UserPreferencesButton",
            "sap.ushell.ui.launchpad.ActionItem",
            "sap.ushell.ui.launchpad.AnchorItem",
            "sap.ushell.ui.launchpad.AnchorNavigationBar",
            "sap.ushell.ui.launchpad.CatalogEntryContainer",
            "sap.ushell.ui.launchpad.CatalogsContainer",
            "sap.ushell.ui.launchpad.DashboardGroupsContainer",
            "sap.ushell.ui.launchpad.GridContainer",
            "sap.ushell.ui.launchpad.GroupHeaderActions",
            "sap.ushell.ui.launchpad.GroupListItem",
            "sap.ushell.ui.launchpad.LinkTileWrapper",
            "sap.ushell.ui.launchpad.LoadingDialog",
            "sap.ushell.ui.launchpad.Page",
            "sap.ushell.ui.launchpad.Panel",
            "sap.ushell.ui.launchpad.PlusTile",
            "sap.ushell.ui.launchpad.Section",
            "sap.ushell.ui.launchpad.Tile",
            "sap.ushell.ui.launchpad.TileContainer",
            "sap.ushell.ui.launchpad.TileState",
            "sap.ushell.ui.launchpad.section.CompactArea",
            "sap.ushell.ui.shell.FloatingContainer",
            "sap.ushell.ui.shell.NavigationMiniTile",
            "sap.ushell.ui.shell.OverflowListItem",
            "sap.ushell.ui.shell.RightFloatingContainer",
            "sap.ushell.ui.shell.ShellAppTitle",
            "sap.ushell.ui.shell.ShellFloatingAction",
            "sap.ushell.ui.shell.ShellFloatingActions",
            "sap.ushell.ui.shell.ShellHeadItem",
            "sap.ushell.ui.shell.ShellLayout",
            "sap.ushell.ui.shell.ShellNavigationMenu",
            "sap.ushell.ui.shell.ToolArea",
            "sap.ushell.ui.shell.ToolAreaItem",
            "sap.ushell.ui.tile.DynamicTile",
            "sap.ushell.ui.tile.ImageTile",
            "sap.ushell.ui.tile.StaticTile",
            "sap.ushell.ui.tile.TileBase"
        ],
        elements: [
            "sap.ushell.ui.launchpad.AccessibilityCustomData"
        ],
        extensions: {
            "sap.ui.support": {
                diagnosticPlugins: [
                    "sap/ushell/support/plugins/flpConfig/FlpConfigurationPlugin"
                ]
            }
        }
    });

    /**
     * SAP library: sap.ushell
     *
     * @namespace
     * @alias sap.ushell
     */
    var oUshellLibrary = sap.ushell;

    /**
     * Denotes the states of the all my apps menu.
     *
     * @enum {string}
     * @private
     * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
     */
    oUshellLibrary.AllMyAppsState = {
        /**
         * Show first level.
         * @private
         */
        FirstLevel: "FirstLevel",

        /**
         * Show second level.
         * @private
         */
        SecondLevel: "SecondLevel",

        /**
         * Show details.
         * @private
         */
        Details: "Details",

        /**
         * Show first level.
         * @private
         */
        FirstLevelSpread: "FirstLevelSpread"
    };

    /**
     * Denotes the states of the shell app title.
     *
     * @enum {string}
     * @private
     * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
     */
    oUshellLibrary.AppTitleState = {
        /**
         * Only the Shell Navigation menu is available.
         * @private
         */
        ShellNavMenuOnly: "ShellNavMenuOnly",

        /**
         * Only the All My Apps menu is available.
         * @private
         */
        AllMyAppsOnly: "AllMyAppsOnly",

        /**
         * The Shell Navigation menu is currently active.
         * This state is only relevant if both ShellNavMenu and AllMyApps are active
         * and the user can navigate between them.
         * @private
         */
        ShellNavMenu: "ShellNavMenu",

        /**
         * The All My Apps menu is currently active.
         * This state is only relevant if both ShellNavMenu and AllMyApps are active
         * and the user can navigate between them.
         * @private
         */
        AllMyApps: "AllMyApps"
    };

    /**
     * Denotes the types of the content nodes.
     *
     * @enum {string}
     * @public
     */
    oUshellLibrary.ContentNodeType = {
        /**
         * A group of the classic homepage
         * @public
         */
        HomepageGroup: "HomepageGroup",
        /**
         * A space in spaces mode
         * @public
         */
        Space: "Space",
        /**
         * A page which is assigned to a space in spaces mode
         * @public
         */
        Page: "Page"
    };

    /**
     * The application types supported by the embedding container.
     *
     * @since 1.15.0
     * @enum {String}
     * @private
     */
    oUshellLibrary.components.container.ApplicationType = {
        NWBC: "NWBC",
        SAPUI5: "SAPUI5",
        TR: "TR",
        URL: "URL",
        WCF: "WCF",
        WDA: "WDA"
    };

    /**
     * Denotes display types for tiles in Spaces mode
     *
     * @private
     * @since 1.85
     */
    oUshellLibrary.DisplayFormat = {
        /**
         * Indicates a standard 2x2 tile.
         */
        Standard: "standard",

        /**
         * Indicates that the tile is displayed as a link.
         */
        Compact: "compact",

        /**
         * Indicates a flat 1x2 tile.
         */
        Flat: "flat",

        /**
         * Indicates a flat, wide 1x4 tile.
         */
        FlatWide: "flatWide",

        /**
         * Indicates a wide 2x4 tile.
         */
        StandardWide: "standardWide"
    };

    /**
     * The state of a navigation operation
     *
     * @enum {string}
     * @public
     */
    oUshellLibrary.NavigationState = {
        InProgress: "InProgress",
        Finished: "Finished"
    };

    /**
     * Denotes display states of the viewport
     *
     * @enum {string}
     * @public
     * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
     */
    oUshellLibrary.ui.launchpad.ViewPortState = {
        /**
         * Indicates state, when only left content is in the viewport.
         * @public
         */
        Left: "Left",

        /**
         * Indicates state, when only center content is in the viewport.
         * @public
         */
        Center: "Center",

        /**
         * Indicates state, when only right content is in the viewport.
         * @public
         */
        Right: "Right",

        /**
         * Indicates state, when the left content as well as a part from the center content is in the viewport.
         * @public
         */
        LeftCenter: "LeftCenter",

        /**
         * Indicates state, when the center content as well as a part from the left content is in the viewport.
         * @public
         */
        CenterLeft: "CenterLeft",

        /**
         * Indicates state, when the right content as well as a part from the center content is in the viewport.
         * @public
         */
        RightCenter: "RightCenter",

        /**
         * Indicates state, when the center content as well as a part from the right content is in the viewport.
         * @public
         */
        CenterRight: "CenterRight"
    };

    /**
     * Denotes states for control parts and translates into standard SAP color codes
     *
     * @enum {string}
     * @private
     * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
     */
    oUshellLibrary.ui.tile.State = {
        /**
         * Indicates a state that is neutral, e.g. for standard display (Grey color)
         * @public
         */
        Neutral: "Neutral",

        /**
         * Alias for "None"
         * @public
         */
        None: "None",

        /**
         * Indicates a state that is negative,
         * e.g. marking an element that has to get attention urgently or indicates negative values (Red color)
         * @public
         */
        Negative: "Negative",

        /**
         * Alias for "Error"
         * @public
         */
        Error: "Error",

        /**
         * Indicates a state that is positive, e.g. marking a task successfully executed or a state where all is good (Green color)
         * @public
         */
        Positive: "Positive",

        /**
         * Alias for "Success"
         * @public
         */
        Success: "Success",

        /**
         * Indicates a state that is critical, e.g. marking an element that needs attention (Orange color)
         * @public
         */
        Critical: "Critical",

        /**
         * Alias for "Warning"
         * @public
         */
        Warning: "Warning"
    };

    /**
     * The state of an arrow as trend direction indicator, pointing either up or down
     *
     * @enum {string}
     * @private
     * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
     */
    oUshellLibrary.ui.tile.StateArrow = {
        /**
         * The trend direction indicator is invisible
         * @public
         */
        None: "None",

        /**
         * The trend direction indicator points up
         * @public
         */
        Up: "Up",

        /**
         * The trend direction indicator points down
         * @public
         */
        Down: "Down"
    };

    /**
     * Enumeration of possible VisualizationLoad statuses.
     *
     * @enum {string}
     * @private
     * @since 1.76.0
     * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
     */
    oUshellLibrary.VisualizationLoadState = {
        /**
         * The control is loading.
         * @private
         */
        Loading: "Loading",

        /**
         * The control has loaded.
         * @private
         */
        Loaded: "Loaded",

        /**
         * The control failed to load, because it has insufficient roles.
         * @private
         */
        InsufficientRoles: "InsufficientRoles",

        /**
         * The control is out of the selected role context.
         * @private
         */
        OutOfRoleContext: "OutOfRoleContext",

        /**
         * The control has no resolved navigation target.
         * @private
         */
        NoNavTarget: "NoNavTarget",

        /**
         * The control failed to load.
         * @private
         */
        Failed: "Failed",

        /**
         * The control is disabled.
         * @private
         */
        Disabled: "Disabled"
    };


    return oUshellLibrary;
});
