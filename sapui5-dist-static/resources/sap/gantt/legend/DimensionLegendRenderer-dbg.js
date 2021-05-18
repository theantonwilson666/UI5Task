/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/performance/Measurement",
	"sap/ui/Device",
	"sap/ui/core/Core"
], function (Measurement, Device, Core) {
	"use strict";

	/**
	 * Dimension Legend renderer.
	 *
	 * @namespace
	 */
	var DimensionLegendRenderer = {};

	DimensionLegendRenderer.render = function (oRenderManager, oLegend) {
		Measurement.start("DimensionLegendRenderer render","GanttPerf:DimensionLegendRenderer render function");
		oRenderManager.write("<div");
		oRenderManager.writeControlData(oLegend);
		oRenderManager.addStyle("width", "100%");
		oRenderManager.addStyle("height", "100%");
		oRenderManager.addStyle("position", "relative");
		oRenderManager.writeStyles();
		oRenderManager.write(">");

		this.renderSvgDefs(oRenderManager, oLegend);

		oRenderManager.write("<div");
		oRenderManager.addStyle("float", Core.getConfiguration().getRTL() ? "right" : "left");
		oRenderManager.writeStyles();
		oRenderManager.write(">");
			oRenderManager.write("<svg");
			oRenderManager.writeAttribute("id", oLegend.getId() + "-svg");
			oRenderManager.writeClasses();
			oRenderManager.writeAttributeEscaped("tabindex", (Device.browser.chrome ? null : -1));
			oRenderManager.writeAttributeEscaped("focusable", false);
			oRenderManager.write("></svg>");
			oRenderManager.write("<svg");
			oRenderManager.writeAttribute("id", oLegend.getId() + "-dimension-path");
			oRenderManager.addClass("sapGanttDimensionLegendPath");
			oRenderManager.writeClasses();
			oRenderManager.addStyle("position", "absolute");
			oRenderManager.addStyle(Core.getConfiguration().getRTL() ? "right" : "left", "0px");
			oRenderManager.writeStyles();
			//in Browser chrome, element still can be focused with tabindex=-1, tabindex=null can avoid that
			oRenderManager.writeAttributeEscaped("tabindex", (Device.browser.chrome ? null : -1));
			oRenderManager.writeAttributeEscaped("focusable", false);
			oRenderManager.write(">");
			oRenderManager.write("</svg>");
			oRenderManager.write("</div>");

			oRenderManager.write("<div><svg");
			oRenderManager.writeAttribute("id", oLegend.getId() + "-dimension-text");
			oRenderManager.addClass("sapGanttDLItemTxt");
			oRenderManager.writeClasses();
			oRenderManager.addStyle("position", "absolute");
			oRenderManager.writeStyles();
			oRenderManager.writeAttributeEscaped("tabindex", (Device.browser.chrome ? null : -1));
			oRenderManager.writeAttributeEscaped("focusable", false);
			oRenderManager.write("></svg></div>");
		oRenderManager.write("</div>");
		Measurement.end("DimensionLegendRenderer render");
	};

	DimensionLegendRenderer.renderSvgDefs = function (oRenderManager, oLegend) {
		var oSvgDefs = oLegend.getSvgDefs();
		if (oSvgDefs) {
			oRenderManager.write("<svg");
			oRenderManager.writeAttribute("id", oLegend.getId() + "-svg-psdef");
			oRenderManager.writeAttribute("aria-hidden", "true");
			oRenderManager.writeAttributeEscaped("tabindex", (Device.browser.chrome ? null : -1));
			oRenderManager.writeAttribute("focusable", false);
			oRenderManager.addStyle("float", "left");
			oRenderManager.addStyle("width", "0px");
			oRenderManager.addStyle("height", "0px");
			oRenderManager.writeStyles();
			oRenderManager.write(">");
			oRenderManager.write(oSvgDefs.getDefString());
			oRenderManager.write("</svg>");
		}
	};

	return DimensionLegendRenderer;
}, true);
