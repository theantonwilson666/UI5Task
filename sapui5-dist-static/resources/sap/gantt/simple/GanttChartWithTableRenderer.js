/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/gantt/library"],function(l){"use strict";var G={apiVersion:2};G.render=function(r,c){this.renderSplitter(r,c);};G.renderSplitter=function(r,c){r.openStart("div",c);r.style("width",c.getWidth());r.style("height",c.getHeight());r.class("sapGanttChartWithSingleTable");if(c.getDisplayType()===l.simple.GanttChartWithTableDisplayType.Chart){r.class("sapGanttChartWithTableShowOnlyChart");}else if(c.getDisplayType()===l.simple.GanttChartWithTableDisplayType.Table){r.class("sapGanttChartWithTableShowOnlyTable");}r.openEnd();var s=c.getAggregation("_splitter");s.getContentAreas()[0].getLayoutData().setSize(c.getSelectionPanelSize());s.triggerResize(true);r.renderControl(s);r.close("div");};return G;},true);
