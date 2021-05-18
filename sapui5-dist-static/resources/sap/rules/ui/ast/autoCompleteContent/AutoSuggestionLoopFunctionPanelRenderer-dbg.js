/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

sap.ui.define(['jquery.sap.global'],

	function (jQuery) {
		"use strict";

		/**
		 * Loop Functions Panel renderer.
		 *  @namespace
		 */
		var AutoSuggestionLoopFunctionPanelRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided
		 * {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm
		 *            the RenderManager that can be used for writing to
		 *            the Render-Output-Buffer
		 * @param {sap.ui.core.Control} oControl
		 *            the control to be rendered
		 */
		AutoSuggestionLoopFunctionPanelRenderer.render = function (oRm, oControl) {

			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapAstLoopFunctionPanel");
			oRm.writeClasses();
			oRm.write(">");
			var AutoSuggestionLoopFunctionPanelRenderer = oControl.getAggregation("PanelLayout");
			oRm.renderControl(AutoSuggestionLoopFunctionPanelRenderer);
			oRm.write("</div>");

		};

		return AutoSuggestionLoopFunctionPanelRenderer;

	}, /* bExport= */ true);