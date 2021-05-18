/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(
    [
        "sap/gantt/simple/BaseLine",
        "sap/gantt/simple/BaseTriangle",
        "sap/gantt/simple/BaseDeltaRectangle",
        "sap/gantt/misc/Format",
        "sap/ui/core/theming/Parameters",
        "sap/ui/core/Core"
    ],
    function (BaseLine, BaseTriangle, BaseDeltaRectangle, Format, Parameters, Core) {
        "use strict";

        var DeltaLineRenderer = {
            apiVersion: 2    // enable in-place DOM patching
        };

        /**
         * Rendering the Delta Lines
         *
         * @param {object} oRm - Instance of Render Manager
         * @param {object} oDeltaLine  - Reference of Delta Line
         * @param {object} oGantt  - Instance of Gantt Chart Header
         * @param {int} iHeaderHeight  - Gantt Header Height
         * @param {int} markerAreaHeight  - Delta Marker height
         */
        DeltaLineRenderer.renderDeltaLineHeader = function (
            oRm,
            oDeltaLine,
            oGantt,
            iHeaderHeight,
            markerAreaHeight
        ) {
            var oAxisTimes = oGantt.getAxisTime();
            var isRtl = Core.getConfiguration().getRTL();
            var iX1 = oAxisTimes.timeToView(
                Format.abapTimestampToDate(isRtl ? oDeltaLine.getEndTimeStamp() : oDeltaLine.getTimeStamp())
            );
            var iX2 = oAxisTimes.timeToView(
                Format.abapTimestampToDate(isRtl ? oDeltaLine.getTimeStamp() : oDeltaLine.getEndTimeStamp())
            );

            if (oGantt.getEnableDeltaLine() === false || isNaN(iX1) || isNaN(iX2)) {
                return;
            } else {
                var iMarkerHeight = 10;
                var iMarkerRectHeight = 4;
                var iMarkerWidth = 6;
                oDeltaLine._setEnableChartDeltaAreaHighlight(
                    oGantt.getEnableChartDeltaAreaHighlight()
                );
                var forwardMarkerPosition;
                var backwardMarkerPosition;
                var midOfMarker;
                var fillOpacity;
                var markerStroke;
                var sHeaderStrokeDasharray = oDeltaLine.getStrokeDasharray();
                var fHeaderLinesStrokeWidth = oDeltaLine._getStrokeWidth();
                var iHeaderDeltaAreaWidth = Math.abs(iX2 - iX1);
                iHeaderDeltaAreaWidth =
                    iHeaderDeltaAreaWidth <= 0 ? 1 : iHeaderDeltaAreaWidth;
                if (iHeaderDeltaAreaWidth < iMarkerWidth) {
                    midOfMarker = (iX2 + iX1) / 2;
                    forwardMarkerPosition = midOfMarker - iMarkerWidth;
                    backwardMarkerPosition = midOfMarker + iMarkerWidth;
                    fillOpacity = 1;
                    markerStroke = Parameters.get("sapUiChartDataPointBorderColor");
                    oDeltaLine._setVisibleMarker(true);
                } else {
                    forwardMarkerPosition = iX1;
                    backwardMarkerPosition = iX2;
                    fillOpacity = 0;
                    oDeltaLine._setVisibleMarker(false);
                    markerStroke = null;
                }
                if (oDeltaLine._getIsSelected() === true) {
                    fillOpacity = 1;
                    markerStroke = Parameters.get("sapUiChartDataPointBorderColor");
                    sHeaderStrokeDasharray = "solid";
                    fHeaderLinesStrokeWidth = fHeaderLinesStrokeWidth + 1;
                }

                var markerPosition;
                var tempHeaderHeight = iHeaderHeight - markerAreaHeight;

                //calculating y axis to place rectangle in marker header for delta lines
                markerPosition =
                    tempHeaderHeight + 2 + (oDeltaLine._getLevel() - 1) * 6;

                var oHeaderDeltaArea = oDeltaLine._getHeaderDeltaArea();
                if (!oHeaderDeltaArea) {
                    oHeaderDeltaArea = new BaseDeltaRectangle({
                        x: iX1,
                        y: markerPosition,
                        height: iMarkerRectHeight,
                        width: Math.abs(iX2 - iX1),
                        fill: oDeltaLine.getStroke(),
                        hoverable: true,
                        press: function (oEvent) {
                            oDeltaLine.press(oEvent);
                            oDeltaLine.firePress(oEvent);
                        },
                        mouseEnter: function (oEvent) {
                            oDeltaLine.mouseEnter(oEvent);
                            oDeltaLine.fireMouseEnter(oEvent);
                        },
                        mouseLeave: function (oEvent) {
                            oDeltaLine.mouseLeave(oEvent);
                            oDeltaLine.fireMouseLeave(oEvent);
                        }
                    }).addStyleClass("sapGanntChartMarkerCursorPointer");
                    oDeltaLine._setHeaderDeltaArea(oHeaderDeltaArea);
                } else {
                    oHeaderDeltaArea.setProperty("x", iX1, true);
                    oHeaderDeltaArea.setProperty("width", Math.abs(iX2 - iX1), true);
                    oHeaderDeltaArea.setProperty("y", markerPosition, true);
                }
                oHeaderDeltaArea.renderElement(oRm, oHeaderDeltaArea);

                // Rendering the Start Line on Delta Header Area
                var oHeaderStartLine = oDeltaLine._getHeaderStartLine();
                if (!oHeaderStartLine) {
                    oHeaderStartLine = new BaseLine({
                        x1: iX1,
                        y1: markerPosition,
                        x2: iX1,
                        y2: markerPosition + markerAreaHeight,
                        stroke: oDeltaLine.getStroke(),
                        strokeWidth: fHeaderLinesStrokeWidth,
                        strokeDasharray: sHeaderStrokeDasharray,
                        strokeOpacity: oDeltaLine.getStrokeOpacity(),
                        tooltip: oDeltaLine.getDescription()
                    });
                    oDeltaLine._setHeaderStartLine(oHeaderStartLine);
                } else {
                    oHeaderStartLine.setProperty("x1", iX1, true);
                    oHeaderStartLine.setProperty("x2", iX1, true);
                    oHeaderStartLine.setProperty("y1", markerPosition, true);
                    oHeaderStartLine.setProperty("y2", markerPosition + markerAreaHeight, true);
                    oHeaderStartLine.setProperty("strokeDasharray", sHeaderStrokeDasharray, true);
                    oHeaderStartLine.setProperty("strokeWidth", fHeaderLinesStrokeWidth, true);
                }
                oHeaderStartLine.renderElement(oRm, oHeaderStartLine);

                // Rendering the End Line on Header Delta Area
                var oHeaderEndLine = oDeltaLine._getHeaderEndLine();
                if (!oHeaderEndLine) {
                    oHeaderEndLine = new BaseLine({
                        x1: iX2,
                        y1: markerPosition,
                        x2: iX2,
                        y2: markerPosition + markerAreaHeight,
                        stroke: oDeltaLine.getStroke(),
                        strokeWidth: fHeaderLinesStrokeWidth,
                        strokeDasharray: sHeaderStrokeDasharray,
                        strokeOpacity: oDeltaLine.getStrokeOpacity(),
                        tooltip: oDeltaLine.getDescription()
                    });
                    oDeltaLine._setHeaderEndLine(oHeaderEndLine);
                } else {
                    oHeaderEndLine.setProperty("x1", iX2, true);
                    oHeaderEndLine.setProperty("x2", iX2, true);
                    oHeaderEndLine.setProperty("y1", markerPosition, true);
                    oHeaderEndLine.setProperty("y2", markerPosition + markerAreaHeight, true);
                    oHeaderEndLine.setProperty("strokeDasharray", sHeaderStrokeDasharray, true);
                    oHeaderEndLine.setProperty("strokeWidth", fHeaderLinesStrokeWidth, true);
                }
                oHeaderEndLine.renderElement(oRm, oHeaderEndLine);

                // Rendering the Header Forward Delta Marker
                var oForwardMarker = oDeltaLine._getForwardMarker();
                if (!oForwardMarker) {
                    oForwardMarker = new BaseTriangle({
                        x: forwardMarkerPosition,
                        y: 0,
                        height: iMarkerHeight,
                        width: iMarkerWidth,
                        stroke: markerStroke,
                        rowYCenter: markerPosition - 3,
                        fill: oDeltaLine.getStroke(),
                        fillOpacity: fillOpacity,
                        orientation: "right",
                        hoverable: true,
                        press: function (oEvent) {
                            oDeltaLine.press(oEvent);
                            oDeltaLine.firePress(oEvent);
                        },
                        mouseEnter: function (oEvent) {
                            oDeltaLine.mouseEnter(oEvent);
                            oDeltaLine.fireMouseEnter(oEvent);
                        },
                        mouseLeave: function (oEvent) {
                            oDeltaLine.mouseLeave(oEvent);
                            oDeltaLine.fireMouseLeave(oEvent);
                        }
                    }).addStyleClass("sapGanntChartMarkerCursorPointer");
                    oDeltaLine._setForwardMarker(oForwardMarker);
                } else {
                    oForwardMarker.setProperty("x", forwardMarkerPosition, true);
                    oForwardMarker.setProperty("fillOpacity", fillOpacity, true);
                    oForwardMarker.setProperty("rowYCenter", markerPosition - 3, true);
                    oForwardMarker.setProperty("stroke", markerStroke, true);
                }
                oForwardMarker.renderElement(oRm, oForwardMarker);

                // Rendering the Header Backward Delta Marker
                var oBackwardMarker = oDeltaLine._getBackwardMarker();
                if (!oBackwardMarker) {
                    oBackwardMarker = new BaseTriangle({
                        x: backwardMarkerPosition,
                        y: 0,
                        height: iMarkerHeight,
                        width: iMarkerWidth,
                        stroke: markerStroke,
                        rowYCenter: markerPosition - 3,
                        fill: oDeltaLine.getStroke(),
                        fillOpacity: fillOpacity,
                        orientation: "left",
                        hoverable: true,
                        press: function (oEvent) {
                            oDeltaLine.press(oEvent);
                            oDeltaLine.firePress(oEvent);
                        },
                        mouseEnter: function (oEvent) {
                            oDeltaLine.mouseEnter(oEvent);
                            oDeltaLine.fireMouseEnter(oEvent);
                        },
                        mouseLeave: function (oEvent) {
                            oDeltaLine.mouseLeave(oEvent);
                            oDeltaLine.fireMouseLeave(oEvent);
                        }
                    }).addStyleClass("sapGanntChartMarkerCursorPointer");
                    oDeltaLine._setBackwardMarker(oBackwardMarker);
                } else {
                    oBackwardMarker.setProperty("x", backwardMarkerPosition, true);
                    oBackwardMarker.setProperty("fillOpacity", fillOpacity, true);
                    oBackwardMarker.setProperty("rowYCenter", markerPosition - 3, true);
                    oBackwardMarker.setProperty("stroke", markerStroke, true);
                }
                oBackwardMarker.renderElement(oRm, oBackwardMarker);
            }
        };

        /**
         * Rendering the Delta Lines
         *
         * @param {object} oRm - Instance of Render Manager
         * @param {object} oDeltaLine  - Reference of Delta Line
         * @param {object} oGantt  - Instance of Gantt Chart
         */
        DeltaLineRenderer.renderDeltaLines = function (oRm, oDeltaLine, oGantt) {
            var oAxisTimes = oGantt.getAxisTime();
            var isRtl = Core.getConfiguration().getRTL();
            var iX1 = oAxisTimes.timeToView(
                Format.abapTimestampToDate(isRtl ? oDeltaLine.getEndTimeStamp() : oDeltaLine.getTimeStamp())
            );
            var iX2 = oAxisTimes.timeToView(
                Format.abapTimestampToDate(isRtl ? oDeltaLine.getTimeStamp() : oDeltaLine.getEndTimeStamp())
            );
            var sStrokeDasharray = oDeltaLine.getStrokeDasharray();
            var fStrokeWidth = oDeltaLine._getStrokeWidth();
            if (oDeltaLine._getIsSelected() === true) {
                sStrokeDasharray = "solid";
                fStrokeWidth = fStrokeWidth + 1;
            }

            // Rendering the Start Line of the Delta Line which indicates the start timestamp of the event
            var oStartLine = oDeltaLine._getStartLine();
            if (!oStartLine) {
                oStartLine = new BaseLine({
                    x1: iX1,
                    y1: 0,
                    x2: iX1,
                    y2: "100%",
                    stroke: oDeltaLine.getStroke(),
                    strokeWidth: fStrokeWidth,
                    strokeDasharray: sStrokeDasharray,
                    strokeOpacity: oDeltaLine.getStrokeOpacity(),
                    tooltip: oDeltaLine.getDescription()
                });
                oDeltaLine._setStartLine(oStartLine);
            } else {
                oStartLine.setProperty("x1", iX1, true);
                oStartLine.setProperty("x2", iX1, true);
                oStartLine.setProperty("strokeDasharray", sStrokeDasharray, true);
                oStartLine.setProperty("strokeWidth", fStrokeWidth, true);
            }
            oStartLine.renderElement(oRm, oStartLine);

            // Rendering the End Line of the Delta Line which indicates the end timestamp of the event
            var oEndLine = oDeltaLine._getEndLine();
            if (!oEndLine) {
                oEndLine = new BaseLine({
                    x1: iX2,
                    y1: 0,
                    x2: iX2,
                    y2: "100%",
                    stroke: oDeltaLine.getStroke(),
                    strokeWidth: fStrokeWidth,
                    strokeDasharray: sStrokeDasharray,
                    strokeOpacity: oDeltaLine.getStrokeOpacity(),
                    tooltip: oDeltaLine.getDescription()
                });
                oDeltaLine._setEndLine(oEndLine);
            } else {
                oEndLine.setProperty("x1", iX2, true);
                oEndLine.setProperty("x2", iX2, true);
                oEndLine.setProperty("strokeDasharray", sStrokeDasharray, true);
                oEndLine.setProperty("strokeWidth", fStrokeWidth, true);
            }
            oEndLine.renderElement(oRm, oEndLine);
        };
        /**
		 * Rendering Chart Area of the Delta Lines
		 *
		 * @param {object} oRm - Instance of Render Manager
		 * @param {object} oDeltaLine  - Reference of Delta Line
		 * @param {object} oGantt  - Instance of Gantt Chart
		 */
		DeltaLineRenderer.renderChartAreaOfDeltaLines = function (oRm, oDeltaLine, oGantt) {
            var oAxisTimes = oGantt.getAxisTime();
            var isRtl = Core.getConfiguration().getRTL();
			var iX1 = oAxisTimes.timeToView(
				Format.abapTimestampToDate(isRtl ? oDeltaLine.getEndTimeStamp() : oDeltaLine.getTimeStamp())
			);
			var iX2 = oAxisTimes.timeToView(
				Format.abapTimestampToDate(isRtl ? oDeltaLine.getTimeStamp() : oDeltaLine.getEndTimeStamp())
            );
            var opacity = 0.0;
			if (oDeltaLine._getIsSelected() === true) {
				opacity = 1.0;
			}
			// Rendering the Chart Delta Area between the lines
			var oChartDeltaArea = oDeltaLine._getChartDeltaArea();
			if (oGantt.getDeltaAreaHighlightColor() === "") {
				oGantt.setDeltaAreaHighlightColor("@sapUiListSelectionBackgroundColor");
			}
			if (!oChartDeltaArea) {
				oChartDeltaArea = new BaseDeltaRectangle({
					x: iX1 + 1,
					y: 0,
					height: "100%",
					width: Math.abs(iX2 - iX1) - 2,
					fill: oGantt.getDeltaAreaHighlightColor(),
					opacity: opacity
				});
				oDeltaLine._setChartDeltaArea(oChartDeltaArea);
			} else {
				oChartDeltaArea.setProperty("x", iX1 + 1, true);
				oChartDeltaArea.setProperty("width", Math.abs(iX2 - iX1) - 2, true);
				oChartDeltaArea.setProperty("opacity", opacity, true);
			}
			oChartDeltaArea.renderElement(oRm, oChartDeltaArea);
		};

        return DeltaLineRenderer;
    },
    /* bExport= */ true
);


