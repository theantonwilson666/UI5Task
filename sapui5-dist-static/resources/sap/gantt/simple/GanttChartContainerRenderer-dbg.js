/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([], function () {
	"use strict";

	/**
	 * Gantt Chart Container renderer.
	 *
	 * @namespace
	 */
	var GanttChartContainerRenderer = {
		apiVersion: 2    // enable in-place DOM patching
	};

	GanttChartContainerRenderer.render = function (oRm, oContainer) {
		oRm.openStart("div", oContainer);
		oRm.class("sapGanttContainer");
		oRm.style("width", oContainer.getWidth());
		oRm.style("height", oContainer.getHeight());
		oRm.openEnd();

		this.renderSvgDefs(oRm, oContainer);

		this.renderToolbar(oRm, oContainer);

		this.renderGanttCharts(oRm, oContainer);

		if (oContainer.getEnableStatusBar()) {
		this.renderStatusBar(oRm, oContainer);
		}
		oRm.close("div");
	};

	GanttChartContainerRenderer.renderSvgDefs = function (oRm, oContainer) {
		var oSvgDefs = oContainer.getSvgDefs();
		if (oSvgDefs) {
			oRm.openStart("svg", oContainer.getId() + "-svg-psdef");
			oRm.attr("aria-hidden", "true");
			oRm.attr("tabindex", -1);
			oRm.attr("focusable", false);
			oRm.class("sapGanttInvisiblePaintServer");
			oRm.openEnd();
			oRm.unsafeHtml(oSvgDefs.getDefString());
			oRm.close("svg");
		}
	};

	GanttChartContainerRenderer.renderToolbar = function (oRm, oContainer) {
		var oToolbar = oContainer.getToolbar();
		if (oToolbar) {
			oRm.openStart("div");
			oRm.class("sapGanttContainerTbl");
			oRm.openEnd();
			oRm.renderControl(oToolbar);
			oRm.close("div");
		}
	};
	GanttChartContainerRenderer.renderStatusBar = function (oRm, oContainer) {
		var oStatusBar = oContainer.getStatusBar();
		if (oStatusBar) {
			oRm.openStart("div");
			oRm.class("sapGanttContainerStatusBar");
			oRm.openEnd();
			oRm.renderControl(oStatusBar);
			oRm.close("div");
		}
	};

	GanttChartContainerRenderer.renderGanttCharts = function (oRm, oContainer) {
		oRm.openStart("div", oContainer.getId() + "-ganttContainerContent");
		if (oContainer.getEnableStatusBar()) {
			oRm.class("sapGanttContainerCntWithStatusBar");
		} else {
			oRm.class("sapGanttContainerCnt");
		}
		oRm.openEnd();
		oRm.renderControl(oContainer._oSplitter);
		oRm.close("div");
	};

	return GanttChartContainerRenderer;

}, /* bExport= */ true);
