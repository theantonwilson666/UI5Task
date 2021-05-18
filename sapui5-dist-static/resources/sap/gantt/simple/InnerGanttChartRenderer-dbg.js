/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/Core",
	"sap/gantt/simple/BaseLine",
	"sap/gantt/simple/RenderUtils",
	"sap/gantt/simple/GanttExtension",
	"sap/gantt/simple/Relationship",
	"sap/gantt/misc/Format",
	"sap/gantt/misc/Utility",
	"sap/gantt/library",
	"sap/m/Toolbar",
	'./GanttUtils',
	"./AdhocLineRenderer",
	"sap/gantt/simple/DeltaLineRenderer"
], function (
	Device,
	Core,
	BaseLine,
	RenderUtils,
	GanttExtension,
	Relationship,
	Format,
	Utility,
	library,
	Toolbar,
	GanttUtils,
	AdhocLineRenderer,
	DeltaLineRenderer
) {
	"use strict";

	var InnerGanttChartRenderer = {
		apiVersion: 2    // enable in-place DOM patching
	};
	var oAdhocLineLayer = library.AdhocLineLayer;
	var oDeltaLineLayer = library.DeltaLineLayer;

	InnerGanttChartRenderer.render = function (oRm, oControl) {
		var oGantt = oControl.getParent();
		this.renderGanttChart(oRm, oGantt);

		oGantt.getSyncedControl().scrollContentIfNecessary();
	};

	InnerGanttChartRenderer.renderGanttChart = function(oRm, oGantt) {
		oRm.openStart("div", oGantt.getId() + "-cnt");
		oRm.class("sapGanttChartCnt");
		oRm.style("height", "100%");
		oRm.style("width", "100%");
		oRm.openEnd();
		this.rerenderAllShapes(oRm, oGantt);
		oRm.close("div");
	};

	InnerGanttChartRenderer.renderImmediately = function(oGantt) {
		var oRm = Core.createRenderManager();
		this.renderGanttChart(oRm, oGantt);

		var oGntCnt = window.document.getElementById(oGantt.getId() + "-cnt");
		oRm.flush(oGntCnt, true /**bDoNotPreserve*/, false/**vInsert*/);

		this.renderRelationships(oRm, oGantt);
		oGantt._updateShapeSelections(oGantt.getSelectedShapeUid(), []);
		GanttExtension.attachEvents(oGantt);
		oRm.destroy();
	};

	InnerGanttChartRenderer.rerenderAllShapes = function(oRm, oGantt) {
		var aRowStates = oGantt.getSyncedControl().getRowStates();
		if (aRowStates.length === 0) {
			// row state is not synchronized, skip rendering.
			return;
		}

		oGantt.getAggregation("_header").renderElement();
		// Align chart with header when new variant is selected
		if (oGantt._getScrollExtension && oGantt._getScrollExtension.mOffsetWidth) {
			oGantt._getScrollExtension().scrollGanttChartToVisibleHorizon();
		}


		// Adds the toolbar in the tableheader when the overflow toolbar is not available
		// and the marker type is not none
		var aSimpleAdhocLines = oGantt.getSimpleAdhocLines().filter(function(oAdhocLine){
			return oAdhocLine.MarkerType != sap.gantt.simple.MarkerType.None;
		});

		var aDeltaLines = oGantt.getDeltaLines();
		if (aSimpleAdhocLines.length > 0 || aDeltaLines.length > 0) {
			var oTable = oGantt.getAggregation("table");
			GanttUtils.addToolbarToTable(this, oTable, false);
		}

		var iAllRowHeight = aRowStates.reduce(function(height, rowState){
			return height + rowState.height;
		}, 0);

		// 0. render body svg
		oRm.openStart("svg", oGantt.getId() + "-svg");
		oRm.class("sapGanttChartSvg");
		oRm.attr("height", iAllRowHeight + "px");
		var iRenderWidth = RenderUtils.getGanttRenderWidth(oGantt);

		oRm.attr("width", iRenderWidth + "px");
		oRm.openEnd();

		this.renderHelperDefs(oRm, oGantt.getId());

		// Rendering GanttBackGround
		this.renderGanttBackgrounds(oRm, oGantt, aRowStates);

		// Rendering chart area of the delta lines
		var aFnRenderChartShapes = RenderUtils.createOrderedListOfRenderFunctionsFromTemplate(
			this.createTemplateForChartAreaOfDeltaLines(oGantt));

			aFnRenderChartShapes.forEach(function(aFnRenderShape) {
				aFnRenderShape.apply(InnerGanttChartRenderer, [oRm, oGantt]);
		});

		// Rendering Row Borders
		this.renderGanttRowBorders(oRm, oGantt, aRowStates);

		// Rendering Adhoc and Delta Lines
		var aFnRenderShapes = RenderUtils.createOrderedListOfRenderFunctionsFromTemplate(
			this.createTemplateForRenderAdhocAndDeltaLines(oGantt));

			aFnRenderShapes.forEach(function(aFnRenderShape) {
				aFnRenderShape.apply(InnerGanttChartRenderer, [oRm, oGantt]);
		});
		// render calendar pattern into <defs>
		this.renderCalendarPattern(oRm, oGantt);

		this.renderCalendarShapes(oRm, oGantt);

		// render expanded background if has row expandnation
		this.renderExpandedRowBackground(oRm, oGantt);

		// Render vertical lines
		this.renderVerticalLines(oRm, oGantt);

		// Render Now line body
		this.renderNowLineBody(oRm, oGantt);

		// render in-row shapes
		var aFnRenderOrdered = RenderUtils.createOrderedListOfRenderFunctionsFromTemplate(
			this.createTemplateForOrderedListOfRenderFunctions(oGantt));

		aFnRenderOrdered.forEach(function(fnRenderer) {
			fnRenderer.apply(InnerGanttChartRenderer, [oRm, oGantt]);
		});

		oRm.close("svg");

		if (!oGantt._bPreventInitialRender) {
			oGantt._bPreventInitialRender = true; // this is a performance optimization
		}
	};
	InnerGanttChartRenderer.createTemplateForRenderAdhocAndDeltaLines = function (oGantt) {
		var aTemplate = [];
		if (oGantt.getEnableAdhocLine()) {
			aTemplate.push({
				fnCallback: this.renderAdhocLines,
				bUnshift: oGantt.getAdhocLineLayer() === oAdhocLineLayer.Bottom
			});
		}
		// Rendering DeltaLines if DeltaLines are present
		if (oGantt.getEnableDeltaLine()) {
			aTemplate.push({
				fnCallback: this.renderDeltaLines,
				bUnshift: oGantt.getDeltaLineLayer() === oDeltaLineLayer.Bottom
			});
		}
			return aTemplate;
		};
		InnerGanttChartRenderer.createTemplateForChartAreaOfDeltaLines = function (oGantt) {
			var aTemplate = [];
			// Rendering chart area of the delta lines if delta lines are present
			if (oGantt.getEnableDeltaLine()) {
				aTemplate.push({
					fnCallback: this.renderChartAreaOfDeltaLines,
					bUnshift: oGantt.getDeltaLineLayer() === oDeltaLineLayer.Bottom
				});
			}
				return aTemplate;
			};
		InnerGanttChartRenderer.createTemplateForOrderedListOfRenderFunctions = function (oGantt) {
			var aTemplate = [
				{fnCallback: this.renderAllShapesInRows},
				{fnCallback: this.renderRlsContainer, bUnshift: oGantt.getShapeOverRelationship()},
				{fnCallback: this.renderAssistedContainer}
			];
			return aTemplate;
		};

	InnerGanttChartRenderer.renderHelperDefs = function (oRm, sIdPrefix) {
		oRm.openStart("defs").openEnd();

		var sLinePatternId = sIdPrefix + "-helperDef-linePattern";

		oRm.openStart("pattern", sLinePatternId);
		oRm.attr("width", 2);
		oRm.attr("height", 2);
		oRm.attr("x", 0);
		oRm.attr("y", 0);
		oRm.attr("patternUnits", "userSpaceOnUse");
		oRm.openEnd();
		oRm.openStart("line");
		oRm.attr("x1", 1);
		oRm.attr("x2", 1);
		oRm.attr("y1", 0);
		oRm.attr("y2", 2);
		oRm.attr("stroke-width", 1);
		oRm.attr("stroke", "white");
		oRm.attr("shape-rendering", "crispEdges");
		oRm.openEnd();
		oRm.close("line");
		oRm.close("pattern");

		oRm.close("defs");
	};

	InnerGanttChartRenderer.renderGanttRowBorders = function(oRm, oGantt, aRowStates) {
		oRm.openStart("g", oGantt.getId() + "-bg");
		oRm.openEnd();
		this.renderRowBorders(oRm, oGantt, aRowStates);
		oRm.close("g");
	};

	InnerGanttChartRenderer.renderGanttBackgrounds = function(oRm, oGantt, aRowStates) {
		oRm.openStart("g", oGantt.getId() + "-bg");
		oRm.openEnd();
		this.renderRowBackgrounds(oRm, oGantt, aRowStates);
		oRm.close("g");
	};

	InnerGanttChartRenderer.renderRowBackgrounds = function(oRm, oGantt, aRowStates) {
		var nHeightOfPreviousRows = 0;
		oRm.openStart("g", oGantt.getId() + "-rowBackgrounds");
		oRm.class("rowBackgrounds");
		oRm.openEnd();

		aRowStates.forEach(function(oRowState, iIndex){
			oRm.openStart("rect", oGantt.getId() + "-bgRow-" + iIndex);
			oRm.attr("y", nHeightOfPreviousRows);
			oRm.attr("width", "100%");
			oRm.attr("height", oRowState.height);
			oRm.attr("data-sap-ui-index", iIndex);
			oRm.class("sapGanttBackgroundSVGRow");
			if (oRowState.selected) {
				oRm.class("sapGanttBackgroundSVGRowSelected");
			}
			if (oRowState.hovered) {
				oRm.class("sapGanttBackgroundSVGRowHovered");
			}
			oRm.openEnd().close("rect");
			nHeightOfPreviousRows += oRowState.height;
		});
		oRm.close("g");
	};

	InnerGanttChartRenderer.renderRowBorders = function(oRm, oGantt, aRowStates) {
		oRm.openStart("g", oGantt.getId() + "-rowBorders");
		oRm.class("rowBorders");
		oRm.openEnd();

		var nHeightOfPreviousRows = 0;
		aRowStates.forEach(function(oRowState, iIndex) {
			var nBorderY = (nHeightOfPreviousRows + oRowState.height) - 0.5;

			oRm.openStart("line", oGantt.getId() + "-bgRowBorder-" + iIndex);
			oRm.attr("x1", 0);
			oRm.attr("x2", "100%");
			oRm.attr("y1", nBorderY);
			oRm.attr("y2", nBorderY);
			oRm.style("pointer-events", "none");
			oRm.class("sapGanttBackgroundSVGRowBorder");
			oRm.openEnd().close("line");

			nHeightOfPreviousRows += oRowState.height;
		});
		oRm.close("g");
	};

	InnerGanttChartRenderer.renderAdhocLines = function(oRm, oGantt) {
		var aAdhocLinesSimple = oGantt.getSimpleAdhocLines();
		var mTimeRange = oGantt.getRenderedTimeRange(),
			oMinTime = mTimeRange[0],
			oMaxTime = mTimeRange[1];

		aAdhocLinesSimple = aAdhocLinesSimple.filter(function(oValue) {
			var oDate = Format.abapTimestampToDate(oValue.getTimeStamp());
			return oDate >= oMinTime && oDate <= oMaxTime && oValue.getProperty("visible");
		});
		var aAdhocLines = oGantt.getAdhocLines();

		aAdhocLines = aAdhocLines.filter(function(oValue) {
			var oDate = sap.gantt.misc.Format.abapTimestampToDate(oValue.getTimeStamp());
			return oDate >= oMinTime && oDate <= oMaxTime;
		});

		if (aAdhocLines.length === 0 && aAdhocLinesSimple.length === 0) { return; }
		var oAxisTime = oGantt.getAxisTime();
		oRm.openStart("g");
		oRm.class("sapGanttChartAdhocLine");
		oRm.openEnd();

		// render simple adhoc lines
		aAdhocLinesSimple.forEach(function(oAdhocLine) {
			AdhocLineRenderer.renderLine(oRm, oAdhocLine, oGantt);
		});

		//render adhoc lines
		aAdhocLines.map(function(oAdhocLine) {
			var iX = oAxisTime.timeToView(Format.abapTimestampToDate(oAdhocLine.getTimeStamp()));
			return new BaseLine({
				x1: iX,
				y1: 0,
				x2: iX,
				y2: "100%",
				stroke: oAdhocLine.getStroke(),
				strokeWidth: oAdhocLine.getStrokeWidth(),
				strokeDasharray: oAdhocLine.getStrokeDasharray(),
				strokeOpacity: oAdhocLine.getStrokeOpacity(),
				tooltip: oAdhocLine.getDescription()
			}).setProperty("childElement", true);
		}).forEach(function(oLine){
			oLine.renderElement(oRm, oLine);
		});
		oRm.close("g");
	};

	/**
		 * Renders the Delta Line in Gantt Chart
		 *
		 * @param {object} oRm - reference of rendering manager
		 * @param {*} oGantt - reference of Gantt Chart
		 */
		InnerGanttChartRenderer.renderDeltaLines = function (oRm, oGantt) {
			var aDeltaLines = oGantt.getDeltaLines();

			aDeltaLines = aDeltaLines.filter(function (oValue) {
				return oValue.getVisible();
			});
			if (aDeltaLines.length === 0) {
				return;
			}

			oRm.openStart("g");
			oRm.class("sapGanttChartDeltaLine");
			oRm.openEnd();
			aDeltaLines.forEach(function (oDeltaLine) {
				DeltaLineRenderer.renderDeltaLines(oRm, oDeltaLine, oGantt);
			});
			oRm.close("g");
		};
		InnerGanttChartRenderer.renderChartAreaOfDeltaLines = function (oRm, oGantt) {
			var aDeltaLines = oGantt.getDeltaLines();

			aDeltaLines = aDeltaLines.filter(function (oValue) {
				return oValue.getVisible();
			});
			if (aDeltaLines.length === 0) {
				return;
			}

			oRm.openStart("g");
			oRm.class("sapGanttChartDeltaLine");
			oRm.openEnd();
			aDeltaLines.forEach(function (oDeltaLine) {
				DeltaLineRenderer.renderChartAreaOfDeltaLines(oRm, oDeltaLine, oGantt);
			});
			oRm.close("g");
		};

	InnerGanttChartRenderer.renderVerticalLines = function(oRm, oGantt) {
		if (oGantt.getEnableVerticalLine()) {
			// var iRenderedWidth = oGantt.iGanttRenderedWidth
			var iRenderedWidth = RenderUtils.getGanttRenderWidth(oGantt),
				iChartHeight = jQuery(document.getElementById(oGantt.getId())).height(),
				oAxisTime = oGantt.getAxisTime();

			var oZoomStrategy = oAxisTime.getZoomStrategy();
			var aTickTimeIntervals = oAxisTime.getTickTimeIntervalLabel(oZoomStrategy.getTimeLineOption(), null, [0, iRenderedWidth]);

			// the second item have all the tick time info
			var aTicks = aTickTimeIntervals[1];

			var sPathContent = "";
			// By Default line width is 1, is need to minus the half width of line
			for (var i = 0; i < aTicks.length; i++) {
				sPathContent += " M" +
					" " + (aTicks[i].value - 1 / 2) +
					" 0" +
					" v " + iChartHeight;
			}
			if (sPathContent) {
				oRm.openStart("path");
				oRm.class("sapGanttChartVerticalLine");
				oRm.attr("d", sPathContent);
				oRm.openEnd().close("path");
			}
		}
	};

	InnerGanttChartRenderer.renderAssistedContainer = function (oRm, oGantt) {
		// for selection
		oRm.openStart("g");
		oRm.class("sapGanttChartSelection");
		oRm.openEnd().close("g");
		// for shape connect
		oRm.openStart("g");
		oRm.class("sapGanttChartShapeConnect");
		oRm.openEnd().close("g");
		// for lasso Selection
		oRm.openStart("g");
		oRm.class("sapGanttChartLasso");
		oRm.openEnd().close("g");
	};

	InnerGanttChartRenderer.renderNowLineBody = function(oRm, oGantt) {
		var iNowLineAxisX = oGantt.getAxisTime().getNowLabel(oGantt.getNowLineInUTC())[0].value;
		if (oGantt.getEnableNowLine() === false || isNaN(iNowLineAxisX)) { return; }

		oRm.openStart("g");
		oRm.class("sapGanttNowLineBodySvgLine");
		oRm.openEnd();
		var oStraightLine = new BaseLine({
			x1: iNowLineAxisX, y1: 0,
			x2: iNowLineAxisX, y2: "100%",
			strokeWidth: 1
		}).setProperty("childElement", true);

		oStraightLine.renderElement(oRm, oStraightLine);
		oRm.close("g");
	};

	InnerGanttChartRenderer.renderRlsContainer = function (oRm, oGantt) {
		oRm.openStart("g");
		oRm.class("sapGanttChartRls");
		oRm.openEnd().close("g");
	};

	InnerGanttChartRenderer.renderAllShapesInRows = function(oRm, oGantt) {
		if (!jQuery(document.getElementById(oGantt.getId() + "-gantt"))) { return; }

		oRm.openStart("g", oGantt.getId() + "-shapes");
		oRm.class("sapGanttChartShapes");
		oRm.openEnd();

		this._eachVisibleRowSettings(oGantt, function(oRowSettings) {
			oRowSettings.renderElement(oRm, oGantt);
		});
		oRm.close("g");
	};

	InnerGanttChartRenderer._eachVisibleRowSettings = function(oGantt, fnCallback) {
		var aAllRows = oGantt.getTable().getRows();
		var oBindingInfo = oGantt.getTable().getBindingInfo("rows"),
			sModelName = oBindingInfo && oBindingInfo.model;

		for (var iIndex = 0; iIndex < aAllRows.length; iIndex++) {
			var oRow = aAllRows[iIndex];
			var oRowContext = oRow.getBindingContext(sModelName);
			if (oRowContext && oRow.getIndex() !== -1) {
				var oRowSettings = oRow.getAggregation("_settings");
				if (fnCallback) {
					fnCallback(oRowSettings);
				}
			}
		}
	};

	InnerGanttChartRenderer.renderRelationships = function (oRm, oGantt) {
		var oGntSvg = window.document.getElementById(oGantt.getId() + "-svg");
		var oRlsCnt = jQuery(oGntSvg).children("g.sapGanttChartRls").get(0);

		if (oGntSvg == null || oRlsCnt == null) { return; }

		var mShapeIdFilterMap = Object.create(null);
		if (Device.browser.msie) {
			var oTmpCnt = jQuery("<div>").attr("id", oGantt.getId() + "-rls").get(0);
			var oTarget = window.document.getElementById("sap-ui-preserve").appendChild(oTmpCnt);
			oRm.openStart("svg").openEnd();
			this._eachVisibleRowSettings(oGantt, this._renderVisibleRowRelationships.bind(this, oRm, oGantt, mShapeIdFilterMap));
			this._renderNonVisibleRowRelationships(oRm, oGantt, mShapeIdFilterMap);
			oRm.close("svg");
			oRm.flush(oTarget, true, false);
			jQuery(oRlsCnt).append(jQuery(oTarget).children());
			jQuery(oTarget).remove();
		} else {
			this._eachVisibleRowSettings(oGantt, this._renderVisibleRowRelationships.bind(this, oRm, oGantt, mShapeIdFilterMap));
			this._renderNonVisibleRowRelationships(oRm, oGantt, mShapeIdFilterMap);
			oRm.flush(oRlsCnt, true, false);
		}
	};

	InnerGanttChartRenderer._renderVisibleRowRelationships = function (oRm, oGantt, mShapeIdFilterMap, oRowSettings) {
		oRowSettings.getRelationships().forEach(function (oRlsInst) {
			var sShapeId = oRlsInst.getShapeId();
			var sShapeUid = oRowSettings.getShapeUid(oRlsInst);
			if (!mShapeIdFilterMap[sShapeId]) {
				mShapeIdFilterMap[sShapeId] = true;
				oRlsInst.setProperty("shapeUid", sShapeUid, true);
				oRlsInst.renderElement(oRm, oRlsInst, oGantt.getId());
			}
		});
	};

	InnerGanttChartRenderer._renderNonVisibleRowRelationships = function (oRm, oGantt, mShapeIdFilterMap) {
		var oRelationshipsBindingInfo = Utility.safeCall(oGantt, ["getTable", "getRowSettingsTemplate", "getBindingInfo"], null, ["relationships"]);
		if (!oRelationshipsBindingInfo) { return; }
		var oShapeIdBindingInfo = oRelationshipsBindingInfo.template.getBindingInfo("shapeId");
		if (!oShapeIdBindingInfo) { return; }
		var sRelationshipShapeIdPath = oShapeIdBindingInfo.parts[0].path,
			oModel = oGantt.getTable().getModel(oRelationshipsBindingInfo.model);

		var fnRenderFakeRls = function (sShapeId, sBindingPath) {
			if (!mShapeIdFilterMap[sShapeId]) {
				mShapeIdFilterMap[sShapeId] = true;
				var oFakeRlsInstance = oRelationshipsBindingInfo.factory();
				oFakeRlsInstance.setModel(oModel, oRelationshipsBindingInfo.model);
				oFakeRlsInstance.bindObject({path: sBindingPath, model: oRelationshipsBindingInfo.model});
				oFakeRlsInstance.renderElement(oRm, oFakeRlsInstance, oGantt.getId());
				oFakeRlsInstance.destroy();
			}
		};

		if (oModel.isA("sap.ui.model.json.JSONModel")) {
			var aRlsEntities = oModel.getProperty(oRelationshipsBindingInfo.path);
			if (aRlsEntities) {
				aRlsEntities.forEach(function (oRlsEntity, i) {
					fnRenderFakeRls(oRlsEntity[sRelationshipShapeIdPath], oRelationshipsBindingInfo.path + "/" + i);
				});
			}
		} else { // ODataModel
			var mEntities = oModel.getProperty("/"); // OData entities are in the root (even expanded ones)
			Object.keys(mEntities).forEach(function (sEntityKey) {
				if (sEntityKey.startsWith(oRelationshipsBindingInfo.path)) {
					fnRenderFakeRls(mEntities[sEntityKey][sRelationshipShapeIdPath], sEntityKey[0] === "/" ? sEntityKey : "/" + sEntityKey);
				}
			});
		}
	};

	InnerGanttChartRenderer.renderSvgDefs = function (oRm, oGantt) {
		var oSvgDefs = oGantt.getSvgDefs();
		if (oSvgDefs) {
			oRm.openStart("svg", oGantt.getId() + "-svg-psdef");
			oRm.attr("aria-hidden", "true");
			oRm.style("float", "left");
			oRm.style("width", "0px");
			oRm.style("height", "0px");
			oRm.openEnd();
			oRm.unsafeHtml(oSvgDefs.getDefString());
			oRm.close("svg");
		}
	};

	InnerGanttChartRenderer.renderCalendarPattern = function(oRm, oGantt) {
		var oPatternDef = oGantt.getCalendarDef(),
			sGanttId = oGantt.getId(),
			iRenderedWidth = oGantt.iGanttRenderedWidth;
		if (oGantt.getEnableNonWorkingTime() === false) { return; }
		if (oPatternDef && oPatternDef.getDefNode() && oPatternDef.getDefNode().defNodes && iRenderedWidth > 0) {
			var defNode = oPatternDef.getDefNode();
			var defId = sGanttId + "-calendardefs";

			oRm.openStart("defs", defId);
			oRm.openEnd();

			for (var iIndex = 0; iIndex < defNode.defNodes.length; iIndex++) {
				var oNode = defNode.defNodes[iIndex];
				oRm.openStart("pattern", oNode.id);
				oRm.class("calendarPattern");
				oRm.attr("patternUnits", "userSpaceOnUse");
				oRm.attr("x", 0);
				oRm.attr("y", 0);
				oRm.attr("width", iRenderedWidth);
				oRm.attr("height", 32);
				oRm.openEnd();

				for (var iIndex2 = 0; iIndex2 < oNode.timeIntervals.length; iIndex2++) {
					var ti = oNode.timeIntervals[iIndex2];
					oRm.openStart("rect");
					oRm.attr("x", ti.x);
					oRm.attr("y", ti.y);
					oRm.attr("width", ti.width);
					oRm.attr("height", 32);
					oRm.attr("fill", ti.fill);
					oRm.openEnd().close("rect");
				}

				oRm.close("pattern");
			}

			oRm.close("defs");
		}

	};

	InnerGanttChartRenderer.renderCalendarShapes = function(oRm, oGantt) {
		oRm.openStart("g");
		oRm.class("sapGanttChartCalendar");
		oRm.openEnd();

		var aRowStates = oGantt.getSyncedControl().getRowStates();
		this._eachVisibleRowSettings(oGantt, function(oRowSetting) {
			var mPosition = RenderUtils.calcRowDomPosition(oRowSetting, aRowStates);
			oRowSetting.getCalendars().forEach(function(oCalendar){
				oCalendar.setProperty("rowYCenter", mPosition.rowYCenter, true);
				oCalendar._iBaseRowHeight = mPosition.rowHeight;
				//Add the BaseCalendar based on visiblility property.
				if (oCalendar.getVisible()) {
					oCalendar.renderElement(oRm, oCalendar);
				}
			});
		});

		oRm.close("g");
	};

	InnerGanttChartRenderer.renderExpandedRowBackground = function(oRm, oGantt) {
		var aData = oGantt.getExpandedBackgroundData();
		if (jQuery.isEmptyObject(aData)) { return; }

		var iBaseRowHeight = oGantt._oExpandModel.refreshRowYAxis(oGantt.getTable());

		var aExpandedData = Array.prototype.concat.apply([], aData);

		var iWidth = oGantt.iGanttRenderedWidth;

		oRm.openStart("g");
		oRm.class("sapGanttChartRowBackground");
		oRm.openEnd();

		for (var iIndex = 0; iIndex < aExpandedData.length; iIndex++) {
			var d = aExpandedData[iIndex];
			var sExpandedRowStyleClass;
			var fRectHeight;

			// Show or hide the expanded row background colour
			if (oGantt.getEnableExpandedRowBackground() === true){
				sExpandedRowStyleClass = "sapGanttExpandChartCntBG";
			} else {
				sExpandedRowStyleClass = "sapGanttExpandedRowBackground";
			}

			// Show or hide the expanded row borders
			if (oGantt.getEnableExpandedRowBorders() === true){
				fRectHeight = d.rowHeight - 1;
			} else {
				fRectHeight = d.rowHeight;
			}

			oRm.openStart("g");
			oRm.class("expandedRow");
			oRm.openEnd();

			var yValue;
			if (oGantt.getShowParentRowOnExpand()) {
				yValue = d.y;
			} else {
				yValue = d.y - (iBaseRowHeight);
			}

			oRm.openStart("rect");
			oRm.attr("x", d.x);
			oRm.attr("y", yValue);
			oRm.attr("height", fRectHeight);
			oRm.attr("width", "100%");
			oRm.class(sExpandedRowStyleClass);
			oRm.openEnd();
			oRm.close("rect");
			oRm.openStart("path");
			// Show or hide the borders of the expanded row
			if (oGantt.getEnableExpandedRowBorders() === true){
				oRm.class("sapGanttExpandChartLine");
			}
			oRm.attr("d", "M0 " + (yValue - 1) + " H" + (iWidth - 1));
			oRm.openEnd().close("path");

			oRm.close("g");
		}

		oRm.close("g");
	};

	return InnerGanttChartRenderer;

}, /* bExport= */ true);
