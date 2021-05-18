/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(['sap/ui/core/Element','sap/ui/core/library'],function(E,c){"use strict";var O=c.Orientation;var C=E.extend("sap.gantt.config.ContainerLayout",{metadata:{library:"sap.gantt",properties:{key:{type:"string",defaultValue:sap.gantt.config.DEFAULT_CONTAINER_SINGLE_LAYOUT_KEY},text:{type:"string",defaultValue:sap.ui.getCore().getLibraryResourceBundle("sap.gantt").getText("XLST_SINGLE_LAYOUT")},orientation:{type:"sap.ui.core.Orientation",defaultValue:O.Vertical},activeModeKey:{type:"string",defaultValue:sap.gantt.config.DEFAULT_MODE_KEY},toolbarSchemeKey:{type:"string",defaultValue:sap.gantt.config.DEFAULT_CONTAINER_TOOLBAR_SCHEME_KEY},selectionPanelSize:{type:"sap.ui.core.CSSSize",defaultValue:"30%"},ganttChartLayouts:{type:"object[]",defaultValue:[]}}}});return C;},true);
