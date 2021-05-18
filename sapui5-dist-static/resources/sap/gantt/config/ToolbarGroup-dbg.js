/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
	'sap/ui/core/Element', "sap/m/library"
], function (Element, mLibrary) {
	"use strict";

	var OverflowToolbarPriority = mLibrary.OverflowToolbarPriority,
		ButtonType = mLibrary.ButtonType;
	/**
	 * Creates and initializes a new toolbar group
	 *
	 * @param {string} [sId] ID of the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Defines the toolbar group. Toolbar groups enables you to categorize related toolbar items. For example, you can
	 * put all settings-related toolbar items in the Setting group.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version 1.88.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.gantt.config.ToolbarGroup
	 */
	var ToolbarGroup = Element.extend("sap.gantt.config.ToolbarGroup", /** @lends sap.gantt.config.ToolbarGroup.prototype */ {
		metadata: {
			library: "sap.gantt",
			properties: {

				/**
				 * Specifies the position of the toolbar group. Note that all toolbar groups must be put into the Gantt chart toolbar.
				 */
				position: {type: "string", defaultValue: null},

				/**
				 * Overflow priority. See {@link sap.m.OverflowToolbarPriority}
				 */
				overflowPriority: {type: "sap.m.OverflowToolbarPriority", defaultValue: OverflowToolbarPriority.Low},

				/**
				 * Type of a button in the toolbar group if it's a button
				 */
				buttonType: {type : "sap.m.ButtonType", group : "Appearance", defaultValue : ButtonType.Default}
			}
		}
	});

	return ToolbarGroup;
}, true);
