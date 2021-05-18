/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core",
	"sap/gantt/library",
	"./GanttExtension",
	"./CoordinateUtils",
	"./GanttUtils",
	"sap/gantt/misc/Format"
], function(
	jQuery,
	KeyCodes,
	Core,
	library,
	GanttExtension,
	CoordinateUtils,
	GanttUtils,
	Format
) {
	"use strict";

	var _sNamespace = ".sapGanttDragDrop";
	var aEvents = ["mousemove", "mouseup", "keydown"];
	var sMouseDown = "mousedown";
	var BrowserEvent = aEvents.reduce(function(events, name){
		events[name] = name;
		return events;
	}, {});
	BrowserEvent[sMouseDown] = sMouseDown;

	var aEventWithNamespace = aEvents.map(function(sEvent) { return sEvent + _sNamespace; });
	var sMouseDownWithNamespace = sMouseDown + _sNamespace;
	var I_DRAG_THRESHOLD_DISTANCE = 3;

	var GhostAlignment = library.dragdrop.GhostAlignment;
	var DragOrientation = sap.gantt.DragOrientation;

	var DragDropHelper = {
		dispatchEvent: function(oEvent) {
			var oExtension = this._getDragDropExtension();
			if (oEvent.type === BrowserEvent.mousedown) {
				oExtension.onMouseDown(oEvent);
			} else if (oEvent.type === BrowserEvent.mousemove) {
				oExtension.onMouseMove(oEvent);
			} else if (oEvent.type === BrowserEvent.mouseup) {
				oExtension.onMouseUp(oEvent);
			} else if (oEvent.type === BrowserEvent.keydown) {
				oExtension.onKeydown(oEvent);
			}
		},

		addEventListeners: function(oGantt) {
			this.removeEventListeners(oGantt);
			var oSvg = jQuery(oGantt._getDragDropExtension().getDomRefs().ganttSvg);
			oSvg.on(sMouseDownWithNamespace, DragDropHelper.dispatchEvent.bind(oGantt) );
			var oHeaderSvg = jQuery(oGantt._getDragDropExtension().getDomRefs().headerSvg);
			oHeaderSvg.on(sMouseDownWithNamespace, DragDropHelper.dispatchEvent.bind(oGantt) );
		},
		removeEventListeners: function(oGantt) {
			var oSvg = jQuery(oGantt._getDragDropExtension().getDomRefs().ganttSvg);
			oSvg.off(_sNamespace);
			var oHeaderSvg = jQuery(oGantt._getDragDropExtension().getDomRefs().headerSvg);
			oHeaderSvg.off(_sNamespace);
		},
		addDragDropEventListeners: function(oGantt) {
			this.removeDragDropEventListeners(oGantt);
			aEventWithNamespace.forEach(function(sEventName) {
				jQuery(document).on(sEventName, DragDropHelper.dispatchEvent.bind(oGantt) );
			});
		},
		removeDragDropEventListeners: function(oGantt) {
			aEventWithNamespace.forEach(function(sEventName) {
				jQuery(document).off(sEventName);
			});
		}
	};

	/**
	 * GanttDragDropExtension responsible for the followings:
	 *  1. Attach and detach DOM events for D&D
	 *  2. Create dragging ghost
	 *  3. Auto scroll during dragging
	 *  4. Fire D&D events on GanttChartWithTable instance
	 *
	 * @extends sap.gantt.simple.GanttExtension
	 * @author SAP SE
	 * @version 1.88.0
	 * @constructor
	 * @private
	 * @alias sap.gantt.simple.GanttExtension
	 */
	var GanttDragDropExtension = GanttExtension.extend("sap.gantt.simple.GanttDragDropExtension", {
		/**
		 * @override
		 * @inheritDoc
		 * @returns {string} The name of this extension.
		 */
		_init: function(oGantt, mSettings) {
			this._initDragStates();
			return "DragDropExtension";
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		_attachEvents: function() {
			var oGantt = this.getGantt();
			DragDropHelper.addEventListeners(oGantt);
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		_detachEvents: function() {
			var oGantt = this.getGantt();
			DragDropHelper.removeEventListeners(oGantt);
		}
	});

	GanttDragDropExtension.prototype._initDragStates = function() {
		this.bDragging = false;
		this.adhocLineDrag = false;
		this.deltaLineDrag = false;
		this.adhocLineDragStart = false;
		this.deltaLineDragStart = false;
		this.isCursorlineDisabled = false;
		this.bElementDraggable = false;
		this.oAdhocLineElmDraggable = false;
		this.oDeltaLineElmDraggable = false;
		this.oMouseDownTarget = null;
		this.oLastDraggedShapeData = null;
		// Used to determine whether or not to fire drag start event
		// mDragPoint stores 4 values
		// curosr X and y when mouse down; draggable shape x and width;
		this.mDragPoint = {};
		this.bDragging = false;
		this.$ghost = null;
	};

	//Triggers when mousedown event is fired at an adhoc marker.
	GanttDragDropExtension.prototype.onAdhocMarkerMouseDown = function(oEvent) {
		var mPoint = CoordinateUtils.getEventSVGPoint(this.getDomRefs().headerSvg, oEvent),
				oFrame = oEvent.target.getBBox();
		this.oMouseDownTarget = oEvent.target;
		this.mDragPoint = {
			cursorX: mPoint.x,
			cursorY: mPoint.y,
			shapeX: oFrame.x,
			shapeY: oFrame.y,
			shapeWidth: oFrame.width
		};
		DragDropHelper.addDragDropEventListeners(this.getGantt());
		this.adhocLineDrag = true;
	};

	//Triggers when mousedown event is fired at a delta marker.
	GanttDragDropExtension.prototype.onDeltaAreaMouseDown = function (oEvent) {
		var mPoint = CoordinateUtils.getEventSVGPoint(this.getDomRefs().headerSvg, oEvent),
				oFrame = oEvent.target.getBBox();
		this.oMouseDownTarget = oEvent.target;
		this.mDragPoint = {
			cursorX: mPoint.x,
			cursorY: mPoint.y,
			shapeX: oFrame.x,
			shapeY: oFrame.y,
			shapeWidth: oFrame.width
		};
		var oDraggedDelta = jQuery(oEvent.target).control(0, true).getParent();
		this.oLastDraggedShapeData = {
			timeStamp : oDraggedDelta.getTimeStamp(),
			endTimeStamp : oDraggedDelta.getEndTimeStamp()
		};
		DragDropHelper.addDragDropEventListeners(this.getGantt());
		this.deltaLineDrag = true;
	};

	//Triggers when an adhoc line is dropped.
	GanttDragDropExtension.prototype.onAdhocLineDrop = function(oEvent) {
		if (this.oMouseDownTarget) {
			var adhocLine = jQuery(this.oMouseDownTarget).control(0, true).getParent();
			// collect adhoc line drop event data
			var oEventData = this._getAdhocDropData(oEvent);
			if (oEventData) {
				adhocLine.fireAdhoclineDrop(oEventData);
			}
			if (this.isCursorlineDisabled) {
				this.getGantt().setEnableCursorLine(true);
			}
			this.stopDragging();
		}
	};

	//Triggers when a delta line is dropped.
	GanttDragDropExtension.prototype.onDeltaLineDrop = function (oEvent) {
		if (this.oMouseDownTarget) {
			var deltaLine = jQuery(this.oMouseDownTarget).control(0, true).getParent();
			var oEventData = this._getDeltaMarkerDropEvent(oEvent);
			if (oEventData) {
				deltaLine.fireDeltalineDrop(oEventData);
			}
			if (this.isCursorlineDisabled) {
				this.getGantt().setEnableCursorLine(true);
			}
			this.stopDragging();
		}
	};

	//Triggers when an adhoc line is moved.
	GanttDragDropExtension.prototype.onAdhocLineMove = function(oEvent) {
		if (!this.adhocLineDragStart) {
			this.$ghost = this.createDragGhost(this.oMouseDownTarget);
			this._hideScrollBarOnBody(true);
			this.adhocLineDragStart = true;
			if (this.getGantt().getEnableCursorLine()) {
				this.getGantt().setEnableCursorLine(false);
				this.isCursorlineDisabled = true;
			}
		} else {
			this.onLineDrag(oEvent);
		}
	};

	//Triggers when a delta line is moved.
	GanttDragDropExtension.prototype.onDeltaLineMove = function(oEvent) {
		if (!this.deltaLineDragStart) {
			this.$ghost = this.createDragGhost(this.oMouseDownTarget);
			this._hideScrollBarOnBody(true);
			this.deltaLineDragStart = true;
			if (this.getGantt().getEnableCursorLine()) {
				this.getGantt().setEnableCursorLine(false);
				this.isCursorlineDisabled = true;
			}
		} else {
			this.onLineDrag(oEvent);
		}
	};

	//Checks a valid drop zone for lines when mousemove event is triggered.
	GanttDragDropExtension.prototype.onLineDrag = function (oEvent) {
		if (this.isValidDropZoneForLines(oEvent)) {
			this.updateCursorStyle("Move");
			this.updateHeaderCursorStyle("Move");
		} else {
			this.updateCursorStyle("not-allowed");
			this.updateHeaderCursorStyle("not-allowed");
		}
		this.showGhost(oEvent);
	};

	GanttDragDropExtension.prototype.onMouseDown = function(oEvent) {
		if (this.isEventTargetAdhocLine(oEvent) ) {
			this.oAdhocLineElmDraggable = this.isAdhocLineDraggable(oEvent);
			if (this.oAdhocLineElmDraggable) {
				this.onAdhocMarkerMouseDown(oEvent);
				return;
			}
		}
		if (this.isEventTargetDeltaLine(oEvent)) {
			this.oDeltaLineElmDraggable = this.isDeltaLineDraggable(oEvent);
			if (this.oDeltaLineElmDraggable) {
				this.onDeltaAreaMouseDown(oEvent);
				return;
			}
		}
		if (!this.getGantt().getEnableSelectAndDrag()){
			var oDraggedShape = this.getShapeElementByTarget(oEvent.target);
			if (oDraggedShape) {
				this.shapeSelectedOnMouseDown = true;
				this.initiallySelected = oDraggedShape.getSelected();
				this.getGantt().getSelection().updateShape(oDraggedShape.getShapeUid(), {
					selected: true,
					ctrl: oEvent.ctrlKey || oEvent.metaKey,
					draggable: oDraggedShape.getDraggable(),
					time: oDraggedShape.getTime(),
					endTime: oDraggedShape.getEndTime()
				});
			}
		}

		this.bElementDraggable = this.isEventTargetDraggable(oEvent);
		if (this.bElementDraggable) {
			var mPoint = CoordinateUtils.getEventSVGPoint(this.getDomRefs().ganttSvg, oEvent);
			var oDraggedShapeDom = this.getDraggableDOMElement(oEvent.target),
				oFrame = oDraggedShapeDom.getBBox();
			this.mDragPoint = {
				cursorX: mPoint.x,
				cursorY: mPoint.y,
				shapeX: oFrame.x,
				shapeY: oFrame.y,
				shapeWidth: oFrame.width
			};

			var oDraggedShape = this.getShapeElementByTarget(oDraggedShapeDom);

			this.oMouseDownTarget = oDraggedShapeDom;
			this.oLastDraggedShapeData = {
				shapeUid: oDraggedShape.getShapeUid(),
				startTime: oDraggedShape.getTime(),
				endTime: oDraggedShape.getEndTime()
			};

			//Set SourceRow = Row instance from where the shape is dragged
			this.oSourceRow = this.getRowByShape(oDraggedShape);

			//If DragOritentation = Horizontal, set CurrentRow = Row instance where the Shape is present.
			if (this.getGantt().getDragOrientation() === DragOrientation.Horizontal) {
				this.oCurrentRow = GanttUtils.getRowInstancefromShape(oDraggedShape);
			}

			DragDropHelper.addDragDropEventListeners(this.getGantt());
		}
	};

	GanttDragDropExtension.prototype.updateCursorStyle = function(sStyle) {
		document.body.style.cursor = sStyle;
		this.getDomRefs().ganttSvg.style.cursor = sStyle;
	};

	GanttDragDropExtension.prototype.updateHeaderCursorStyle = function(sStyle) {
		this.getDomRefs().headerSvg.style.cursor = sStyle;
	};

	GanttDragDropExtension.prototype.onMouseMove = function(oEvent) {
		if (this.skipEvent(oEvent)) { return; }
		if (!!this.adhocLineDrag && !!this.oMouseDownTarget) {
			this.onAdhocLineMove(oEvent);
			return;
		}
		if (!!this.deltaLineDrag && !!this.oMouseDownTarget) {
			this.onDeltaLineMove(oEvent);
			return;
		}
		if (this.bDragging === false) {
			var oNewPoint = CoordinateUtils.getEventSVGPoint(this.getDomRefs().ganttSvg, oEvent),
				bExceedDraggingThreshold = this.isExceedDraggingThreshold(oNewPoint),
				bShouldDragStart = bExceedDraggingThreshold && this.isAllowedVerticalOrentationDrag();
			this.bDragging = bShouldDragStart;
			if (bShouldDragStart && this.oMouseDownTarget) {
				this._hideScrollBarOnBody(true);
				this.$ghost = this.createDragGhost(this.oMouseDownTarget);

				var oEventData = this._getDragStartEventData(oEvent);
				if (oEventData) {
					this.getGantt().fireDragStart(oEventData);
				}
			} else if (bExceedDraggingThreshold) {
				this.updateCursorStyle("not-allowed");
			}
		} else {
			this.onDragging(oEvent);
		}
	};

	GanttDragDropExtension.prototype.onMouseUp = function(oEvent) {
		if (this.bElementDraggable === true && this.bDragging === false) {
			// When mouseup on a draggable shape but dragging is false; then cleanup everything and return
			this.stopDragging(oEvent);
			// set everything on initial state
			this._initDragStates();
			return;
		}

		if (!!this.adhocLineDragStart && !!this.oMouseDownTarget) {
			this.onAdhocLineDrop(oEvent);
			this._initDragStates();
			return;
		}

		if (!!this.deltaLineDragStart && !!this.oMouseDownTarget) {
			this.onDeltaLineDrop(oEvent);
			this._initDragStates();
			return;
		}

		// collect shape drop event data
		var oEventData = this._getShapeDropEventData(oEvent);

		this.stopDragging(oEvent);

		// fire shapeDrop event
		if (oEventData) {
			this.getGantt().fireShapeDrop(oEventData);
		}
		//Rerendering assiociated Relationships
		if (this.oMouseDownTarget) {
			var oDraggedShape = this.getShapeElementByTarget(this.oMouseDownTarget);
			if (oDraggedShape) {
				GanttUtils.rerenderAssociatedRelationships(this.getGantt(), oDraggedShape);
			}
		}
		// set everything on initial state
		this._initDragStates();
	};

	GanttDragDropExtension.prototype._getDragStartEventData = function (oEvent) {
		return {
			sourceGanttChart: this.getGantt(),
			draggedShapeDates: this._getDraggedShapeDates(),
			lastDraggedShapeUid: this.oLastDraggedShapeData.shapeUid,
			cursorDateTime: this._getGhostTime(oEvent).cursorTime
		};
	};

	GanttDragDropExtension.prototype._getShapeDropEventData = function(oEvent) {
		if (this.isValidDropZone(oEvent)) {
			var oGantt = this.getGantt();
			var oDroppedRow;
			var aShapeDates = this._getDraggedShapeDates();
			var oTargetGantt = this.getGanttChartByTarget(oEvent.target);
			//If DragOritentation = Horizontal, set oDroppedRow = (this.oCurrentRow)Row instance where the Shape is present.
			if (this.getGantt().getDragOrientation() === DragOrientation.Horizontal){
				oDroppedRow = this.oCurrentRow;
			} else {
				oDroppedRow = GanttUtils.getRowInstance(oEvent, oTargetGantt.getTable());
			}
			var oTargetShape = this.getShapeElementByTarget(oEvent.target);
			var oGhostTime = this._getGhostTime(oEvent);
			return {
				sourceGanttChart: oGantt,
				targetGanttChart: oTargetGantt,
				draggedShapeDates: aShapeDates,
				lastDraggedShapeUid: this.oLastDraggedShapeData.shapeUid,
				targetRow: oDroppedRow,
				cursorDateTime: oGhostTime.cursorTime,
				newDateTime: oGhostTime.newDateTime,
				targetShape: oTargetShape,
				sourceRowData: this.oSourceRow
			};
		}
	};

	//Returns event data when an adhoc line is dropped.
	GanttDragDropExtension.prototype._getAdhocDropData = function(oEvent) {
		if (this.isValidDropZoneForLines(oEvent)) {
			var oGantt = this.getGantt();
			var oAxisTimes = oGantt.getAxisTime();
			var mPoint = CoordinateUtils.getEventSVGPoint(this.getDomRefs().headerSvg, oEvent);
			var oldTimeStamp = Format.dateToAbapTimestamp(oAxisTimes.viewToTime(this.mDragPoint.cursorX));
			var droppedTimeStamp = Format.dateToAbapTimestamp(oAxisTimes.viewToTime(mPoint.x));
			return {
				newTimeStamp : droppedTimeStamp,
				oldTimeStamp : oldTimeStamp
			};
		}
	};

	GanttDragDropExtension.prototype._getGhostTime = function(oEvent) {
		var oGantt = this.getGantt();
		var oTargetGantt = this.getGanttChartByTarget(oEvent.target);

		var bCrossGanttDrop = oTargetGantt != null ? (oTargetGantt.getId() !== oGantt.getId()) : false;
		var oAxisTime = bCrossGanttDrop ? oTargetGantt.getAxisTime() : oGantt.getAxisTime();
		var targetSvg = bCrossGanttDrop ? window.document.getElementById(oTargetGantt.getId() + "-svg") : window.document.getElementById(oGantt.getId() + "-svg");

		var iDroppedCursorX = CoordinateUtils.getEventSVGPoint(targetSvg, oEvent).x;
		var oCursorTime = oAxisTime.viewToTime(iDroppedCursorX);
		var oNewDateTime = oCursorTime;
		var bRtl = Core.getConfiguration().getRTL();
		var iShapeX = this.mDragPoint.shapeX,
			iShapeWidth = bRtl ? -this.mDragPoint.shapeWidth : this.mDragPoint.shapeWidth,
			iStartMouseX = this.mDragPoint.cursorX;

		var oGhostTime = oCursorTime;
		var oGhostEndTime = oCursorTime;
		var iShapeDuration = this.oLastDraggedShapeData.endTime - this.oLastDraggedShapeData.startTime;
		if (this.getGantt().getDragOrientation() === DragOrientation.Vertical) {
			oGhostTime = this.oLastDraggedShapeData.startTime;
			oGhostEndTime = this.oLastDraggedShapeData.endTime;
			oNewDateTime = oGhostTime;
		} else {
			if (this.getGantt().getGhostAlignment() === GhostAlignment.Start) {
				oGhostEndTime = new Date(oGhostTime.getTime() + iShapeDuration);
				oNewDateTime = oCursorTime;
			} else if (this.getGantt().getGhostAlignment() === GhostAlignment.End) {
				oGhostTime = new Date(oGhostEndTime.getTime() - iShapeDuration);
				oNewDateTime = oCursorTime;
			} else if (this.getGantt().getGhostAlignment() === GhostAlignment.None) {
				// cursor postion minus the delta
				var iNewShapeStartTime = bRtl ? (iDroppedCursorX - iShapeWidth - (iStartMouseX - iShapeX)) : (iDroppedCursorX - (iStartMouseX - iShapeX));
				var sNewShapeStartTime = oAxisTime.viewToTime(iNewShapeStartTime);
				oGhostTime = sNewShapeStartTime;
				oGhostEndTime = new Date(oGhostTime.getTime() + iShapeDuration);
				oNewDateTime = sNewShapeStartTime;
			}
		}

		return {
			newDateTime: oNewDateTime,
			cursorTime: oCursorTime,
			time: oGhostTime,
			endTime: oGhostEndTime
		};
	};

	//Returns event data when a delta line is dropped.
	GanttDragDropExtension.prototype._getDeltaMarkerDropEvent = function (oEvent) {
		if (this.isValidDropZoneForLines(oEvent)) {
			var deltaLine = jQuery(this.oMouseDownTarget).control(0, true).getParent();
			var bRtl = Core.getConfiguration().getRTL();
			var sAlignment = this.getGantt().getGhostAlignment();
			var oAxisTimes = this.getGantt().getAxisTime();
			var mPoint = CoordinateUtils.getEventSVGPoint(this.getDomRefs().headerSvg, oEvent);
			var startX,
				endX;
			var iShapeWidth = this.mDragPoint.shapeWidth,
				iShapeX = this.mDragPoint.shapeX,
				iStartMouseX = this.mDragPoint.cursorX;

			if (sAlignment === GhostAlignment.Start) {
				startX = bRtl ? (mPoint.x - iShapeWidth) : mPoint.x;
				endX = bRtl ? mPoint.x : mPoint.x + iShapeWidth;
			} else if (sAlignment === GhostAlignment.None) {
				startX = mPoint.x + (iShapeX - iStartMouseX);
				endX = startX + iShapeWidth;
			} else if (sAlignment === GhostAlignment.End) {
				startX = bRtl ? mPoint.x : (mPoint.x - iShapeWidth);
				endX = bRtl ? mPoint.x + iShapeWidth : mPoint.x;
			}
			return {
				newStartTime: Format.dateToAbapTimestamp(oAxisTimes.viewToTime(bRtl ? endX : startX)),
				newEndTime: Format.dateToAbapTimestamp(oAxisTimes.viewToTime(bRtl ? startX : endX)),
				oldStartTime: deltaLine.getTimeStamp(),
				oldEndTime: deltaLine.getEndTimeStamp()
			};
		}
	};

	GanttDragDropExtension.prototype._getDraggedShapeDates = function() {
		var oSelection = this.getGantt().getSelection();
		var aSelectedDraggableShapeUid = oSelection.allSelectedDraggableUid();

		var oDragShapeDates = {};
		aSelectedDraggableShapeUid.forEach(function(sUid) {
			var oShapeData = oSelection.getSelectedShapeDataByUid(sUid);
			oDragShapeDates[sUid] = {
				time: oShapeData.time,
				endTime: oShapeData.endTime
			};
		});

		return oDragShapeDates;
	};

	/**
	 * +---------------------------------+
	 * |               / \               |
	 * |<    delta      |                |
	 * +----------------------------------+
	 *
	 * @param {*} iDroppedCursorX Dropped SVG point X
	 * @param {*} oAxisTime AxisTime
	 */
	GanttDragDropExtension.prototype.getDroppedShapeStartTime = function(iDroppedCursorX, oAxisTime, oCursorDate) {
		if (this.getGantt().getGhostAlignment() === GhostAlignment.None) {
			var iShapeX = this.mDragPoint.shapeX,
				iShapeWidth = this.mDragPoint.shapeWidth,
				iStartMouseX = this.mDragPoint.cursorX;
			var bRtl = Core.getConfiguration().getRTL();
			// cursor postion minus the delta
			var iNewShapeStartTime = bRtl ? (iDroppedCursorX + iShapeWidth - (iStartMouseX - iShapeX)) : (iDroppedCursorX - (iStartMouseX - iShapeX));
			var sNewShapeStartTime = oAxisTime.viewToTime(iNewShapeStartTime),
				oNewDateTime = Format.abapTimestampToDate(sNewShapeStartTime);
			return oNewDateTime;
		}

		return oCursorDate;
	};

	GanttDragDropExtension.prototype.isValidDropZone = function(oEvent) {
		return jQuery(oEvent.target).closest("svg.sapGanttChartSvg").length === 1;
	};

	GanttDragDropExtension.prototype.isValidDropZoneForLines = function(oEvent) {
		return (jQuery(oEvent.target).closest("svg.sapGanttChartHeaderSvg").length === 1 ||
				jQuery(oEvent.target).closest("svg.sapGanttChartSvg").length === 1);
	};


	GanttDragDropExtension.prototype._hideScrollBarOnBody = function(bHide) {
		jQuery(document.body).toggleClass("sapGanttDraggingOverflow", bHide);
	};

	GanttDragDropExtension.prototype.onKeydown = function(oEvent) {
		if (this.skipEvent(oEvent)) { return; }

		if (oEvent.keyCode === KeyCodes.ESCAPE) {
			this.stopDragging(oEvent);
			// set everything on initial state
			this._initDragStates();
		}
	};

	GanttDragDropExtension.prototype.stopDragging = function(oEvent) {
		// enable text selection again
		this._enableTextSelection();

		// avoid shape selection
		this._avoidShapeSelectionAfterDragging();

		// remove ghost image regardless drop event fired or not
		this.removeGhost();


		// update mouse cursor to default again
		this.updateCursorStyle("default");

		// update mouse cursor to default on header
		this.updateHeaderCursorStyle("default");

		this._hideScrollBarOnBody(false);

		// stop auto scroll
		this._stopAutoScroll();

		DragDropHelper.removeDragDropEventListeners(this.getGantt());
	};

	GanttDragDropExtension.prototype._avoidShapeSelectionAfterDragging = function() {
		if (this.bDragging && this.oMouseDownTarget) {
			var oDraggedShape = this.getShapeElementByTarget(this.oMouseDownTarget);
			window.setTimeout(function() {
				if (oDraggedShape) {
					window.clearTimeout(oDraggedShape.iSingleClickTimer);
				}
			}, 100, this);
		}
	};

	GanttDragDropExtension.prototype.isEventTargetDraggable = function(oEvent) {
		var oShapeElement = this.getShapeElementByTarget(oEvent.target);
		if (oShapeElement) {
			return oShapeElement.getDraggable() && (oShapeElement.getSelected() || !this.getGantt().getEnableSelectAndDrag());
		}
		return false;
	};

	GanttDragDropExtension.prototype.getShapeElementByTarget = function(target) {
		return jQuery(this.getDraggableDOMElement(target)).control(0, true);
	};

	GanttDragDropExtension.prototype.getGanttChartByTarget = function(target) {
		return jQuery(target).closest("svg.sapGanttChartSvg").control(0, true);
	};

	GanttDragDropExtension.prototype.isEventTargetAdhocLine = function (oEvent) {
		return (jQuery(oEvent.target).control(0, true) &&
				jQuery(oEvent.target).control(0, true).sParentAggregationName === '_marker');
	};

	GanttDragDropExtension.prototype.isEventTargetDeltaLine = function (oEvent) {
		return (jQuery(oEvent.target).control(0, true) &&
				jQuery(oEvent.target).control(0, true).sParentAggregationName === '_headerDeltaArea');
	};

	GanttDragDropExtension.prototype.isAdhocLineDraggable = function (oEvent) {
		var oAdhocLineElement = jQuery(oEvent.target).control(0, true).getParent();
		return oAdhocLineElement.getDraggable() && oAdhocLineElement._getSelected();
	};

	GanttDragDropExtension.prototype.isDeltaLineDraggable = function (oEvent) {
		var oDeltaLineElement = jQuery(oEvent.target).control(0, true).getParent();
		return (oDeltaLineElement.getDraggable() && oDeltaLineElement._getIsSelected());
	};

	GanttDragDropExtension.prototype.getDraggableDOMElement = function(target) {
		return jQuery(target).closest("[" + GanttUtils.SHAPE_ID_DATASET_KEY + "]").get(0);
	};

	GanttDragDropExtension.prototype.isExceedDraggingThreshold = function(oPoint) {
		return Math.abs(oPoint.x - this.mDragPoint.cursorX) > I_DRAG_THRESHOLD_DISTANCE
			|| Math.abs(oPoint.y - this.mDragPoint.cursorY) > I_DRAG_THRESHOLD_DISTANCE;
	};

	GanttDragDropExtension.prototype.onDragging = function(oEvent) {
		if (this.$ghost) {
			var oPointerExtension = this.getGantt()._getPointerExtension();
			if (oPointerExtension.isPointerInGanttChart() === false) {
				this.updateCursorStyle("not-allowed");
				this._stopAutoScroll();
			} else {
				this.updateCursorStyle("move");
			}
			this.showGhost(oEvent);
			this._disableTextSelection();
		}
	};

	GanttDragDropExtension.prototype._stopAutoScroll = function() {
		var oPointerExtension = this.getGantt()._getPointerExtension();
		oPointerExtension._bAutoScroll = false;
	};

	GanttDragDropExtension.prototype.isDragging = function() {
		return this.bDragging;
	};

	GanttDragDropExtension.prototype.isAdhocLineDragging = function () {
		return this.adhocLineDragStart;
	};

	GanttDragDropExtension.prototype.isDeltaLineDragging = function () {
		return this.deltaLineDragStart;
	};

	GanttDragDropExtension.prototype.skipEvent = function(oEvent) {
		return this.bElementDraggable === false &&
			   this.oAdhocLineElmDraggable === false &&
			   this.oDeltaLineElmDraggable === false;
	};


	/// =======================================================================
	//  Create/Update/Remove Ghost when dragging shapes
	//  Some places need improvement
	/// =======================================================================
	/**
	 * @protected
	 */
	GanttDragDropExtension.prototype.showGhost = function(oEvent) {
		var sAlignment = this.getGantt().getGhostAlignment();
		var mOffset = (this.adhocLineDragStart || this.deltaLineDragStart) ?
						this.calcGhostAligmentForLines(oEvent,sAlignment) :
						this.calcGhostOffsetByAlignment(oEvent, sAlignment);
		if (this.adhocLineDragStart || this.deltaLineDragStart) {
			var timeLabel = GanttUtils.getTimeLabel(oEvent, this.getGantt().getAxisTime(),
								this.getGantt().getLocale(), this.getDomRefs().headerSvg);
			document.getElementById("sapGanttDragText").innerHTML = timeLabel;
		}
		jQuery(document.getElementById("sapGanttDragGhostWrapper")).css(mOffset).css({"visibility": "visible"});
	};

	GanttDragDropExtension.prototype.calcGhostAligmentForLines = function(oEvent,sAlignment) {
		var bRtl = Core.getConfiguration().getRTL();
		var iCurrentPageX = CoordinateUtils.xPosOfEvent(oEvent);
		if (this.adhocLineDragStart) {
			iCurrentPageX -= (this.mDragPoint.shapeWidth / 2);
		}
		if (this.deltaLineDragStart) {
			var iShapeWidth = this.mDragPoint.shapeWidth,
			iShapeX = this.mDragPoint.shapeX,
			iStartMouseX = this.mDragPoint.cursorX;

			if (sAlignment === GhostAlignment.Start) {
				iCurrentPageX = bRtl ? (iCurrentPageX - iShapeWidth) : iCurrentPageX;
			} else if (sAlignment === GhostAlignment.None) {
				// mouse pageX push the delta from the shape start point and dragged position
				iCurrentPageX = iCurrentPageX + (iShapeX - iStartMouseX);
			} else if (sAlignment === GhostAlignment.End) {
				iCurrentPageX = bRtl ? iCurrentPageX : (iCurrentPageX - iShapeWidth);
			}
		}
		var oScreenPoint = CoordinateUtils.getSvgScreenPoint(this.getDomRefs().headerSvg, {
			pageX: this.mDragPoint.cursorX,
			clientX: this.mDragPoint.cursorX,
			pageY: this.mDragPoint.cursorY,
			clientY: this.mDragPoint.cursorY
		});
		return {
			left: iCurrentPageX + "px",
			top: oScreenPoint.y + "px"
		};
	};

	GanttDragDropExtension.prototype.calcGhostOffsetByAlignment = function(oEvent, sAlignment) {
		var bRtl = Core.getConfiguration().getRTL();

		var iShapeWidth = this.mDragPoint.shapeWidth,
			iShapeX = this.mDragPoint.shapeX,
			iStartMouseX = this.mDragPoint.cursorX;

		var iFinalCursorX;

		var iCurrentPageX = CoordinateUtils.xPosOfEvent(oEvent);

		if (this.getGantt().getDragOrientation() === DragOrientation.Vertical) {
			var oScreenPoint1 = CoordinateUtils.getSvgScreenPoint(this.getDomRefs().ganttSvg, {
				pageX: this.mDragPoint.shapeX,
				clientX: this.mDragPoint.shapeX,
				pageY: this.mDragPoint.shapeY,
				clientY: this.mDragPoint.shapeY
			});
			iFinalCursorX = oScreenPoint1.x;
		} else {
			if (sAlignment === GhostAlignment.Start) {
				iFinalCursorX = bRtl ? (iCurrentPageX - iShapeWidth) : iCurrentPageX;
			} else if (sAlignment === GhostAlignment.None) {
				// mouse pageX push the delta from the shape start point and dragged position
				// Actually doesn't need to calculate everything, it's alway the same
				iFinalCursorX = iCurrentPageX + (iShapeX - iStartMouseX);
			} else if (sAlignment === GhostAlignment.End) {
				iFinalCursorX = bRtl ? iCurrentPageX : (iCurrentPageX - iShapeWidth);
			}
		}

		// minus 2px to make the cursor a little bit lower on the shape
		var sTop = (CoordinateUtils.getEventPosition(oEvent).pageY - 2);
		if (this.getGantt().getDragOrientation() === DragOrientation.Horizontal) {
			var oScreenPoint = CoordinateUtils.getSvgScreenPoint(this.getDomRefs().ganttSvg, {
				pageX: this.mDragPoint.shapeX,
				clientX: this.mDragPoint.shapeX,
				pageY: this.mDragPoint.shapeY,
				clientY: this.mDragPoint.shapeY
			});
			sTop = oScreenPoint.y;
		}

		return {
			left: iFinalCursorX + "px",
			top: sTop + "px"
		};
	};

	GanttDragDropExtension.prototype.removeGhost = function() {
		this.$ghost = null;
		jQuery(document.getElementById("sapGanttDragGhostWrapper")).remove();
	};

	/**
	 * @protected
	 */
	GanttDragDropExtension.prototype.createDragGhost = function(oLastNode) {
		var $container = jQuery("<div id='sapGanttDragGhostWrapper'></div>");
		jQuery(document.body).append($container);
		var canvas = document.createElement("canvas"); // eslint-disable-line sap-no-element-creation
		var bbox = oLastNode.getBBox();

		canvas.width = this.normalizeGhostImageWidth(bbox.width);
		canvas.height = bbox.height;
		if (this.adhocLineDrag) {
			//creating canvas for adhoc line.
			var _line = jQuery(this.oMouseDownTarget).control(0, true).getParent()._getLine();
			var lineNode = document.getElementById(_line.sId);
			var _headerLine = jQuery(this.oMouseDownTarget).control(0, true).getParent()._getHeaderLine();
			var headerLineNode = document.getElementById(_headerLine.sId);
			var _lineBBox = lineNode.getBBox();
			var _headerBBox = headerLineNode.getBBox();
			canvas.height += _lineBBox.height + _headerBBox.height;
		}
		if (this.deltaLineDrag) {
			//creating canvas for delta Line.
			var deltaLine = jQuery(this.oMouseDownTarget).control(0, true).getParent();
			var oStartLine = deltaLine._getStartLine();
			var oEndLine = deltaLine._getEndLine();
			var oHeaderStartLine = deltaLine._getHeaderStartLine();
			var oHeaderEndLine = deltaLine._getHeaderEndLine();
			var $startLine = document.getElementById(oStartLine.sId);
			var $endLine = document.getElementById(oEndLine.sId);
			var $headerStartLine = document.getElementById(oHeaderStartLine.sId);
			var $headerEndLine = document.getElementById(oHeaderEndLine.sId);
			var deltaLineElms = {
				headerStartLine : $headerStartLine,
				startLine : $startLine,
				headerEndLine: $headerEndLine,
				endLine : $endLine

			};
			var HeaderLineBBox = $headerStartLine.getBBox();
			var lineBbox = $startLine.getBBox();
			canvas.height += lineBbox.height + HeaderLineBBox.height;
		}

		this.createGhostImage(oLastNode, canvas, headerLineNode, lineNode, deltaLineElms);
		return $container;
	};

	GanttDragDropExtension.prototype.normalizeGhostImageWidth = function (iWidth) {
		return iWidth;
	};

	GanttDragDropExtension.prototype.createGhostImage = function(oLastNode, canvas, _headerLine, _line, deltaLineElms) {
		var sSvgString = this.serializeClonedSvg(canvas, oLastNode, _headerLine, _line, deltaLineElms);
		var sBase64 = this._b64EncodeUnicode(sSvgString);
		var fullImageUrl = "data:image/svg+xml;base64," + sBase64;
		this.appendGhostImageToWrapper(oLastNode, fullImageUrl);
	};

	GanttDragDropExtension.prototype._b64EncodeUnicode = function (str) {
		// same as btoa(unescape(encodeURIComponent(sSvgString)))
		// see https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
		// first we use encodeURIComponent to get percent-encoded UTF-8,
		// then we convert the percent encodings into raw bytes which
		// can be fed into btoa.
		return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
			function toSolidBytes(match, p1) {
				return String.fromCharCode('0x' + p1);
		}));
	};

	GanttDragDropExtension.prototype.appendGhostImageToWrapper = function(oLastNode, cropedImg) {
		var sNumberOfObjects = this.getNumberOfDragObject(oLastNode);
		var $container = jQuery(document.getElementById("sapGanttDragGhostWrapper"));
		var oStyle = this._getDragTextOverlayStyle(oLastNode);
		jQuery("<div class='sapGanttDragGhost'>" +
					"<img class='sapGanttDragGhostImg' src='" + cropedImg + "'>" +
					"<div id='sapGanttDragText' class='sapGanttDragTextOverlay " + oStyle.css + "' style='" + oStyle.style + "'>" + sNumberOfObjects + "</div>" +
				"</div>")
		.appendTo($container);
	};

	GanttDragDropExtension.prototype._getDragTextOverlayStyle = function(oLastNode) {
		var bRtl = Core.getConfiguration().getRTL();
		var sAlignment = this.getGantt().getGhostAlignment();
		var iShapeWidth = this.mDragPoint.shapeWidth,
			iShapeX = this.mDragPoint.shapeX,
			iStartMouseX = this.mDragPoint.cursorX;
		var iLeftCursorPart = iStartMouseX - iShapeX;

		var sCssClass = "";
		var sCssLeft = "";
		if (sAlignment === GhostAlignment.None) {
			sCssLeft = bRtl ? ("right: " + (iShapeWidth - iLeftCursorPart) + "px;") : ("left: " + (iLeftCursorPart) + "px;");
		} else if (sAlignment === GhostAlignment.End) {
			sCssClass = "sapGanttDragTextOverlayGhostAlignEnd";
		}

		var sStyle = "line-height: " + oLastNode.getBBox().height + "px;" + sCssLeft;
		return {
			style: sStyle,
			css: sCssClass
		};
	};

	GanttDragDropExtension.prototype.serializeClonedSvg = function(canvas, oDragNode, headerNode, lineNode, deltaLineElms) {
		var svgNS = d3.ns.prefix.svg;
		var oFrame = oDragNode.getBBox();

		// create a new SVG DOM element
		var oCopyedSvg = document.createElementNS(svgNS, "svg"); // eslint-disable-line sap-no-element-creation

		// the cloned SVG has the exactly the same size as the canvas
		oCopyedSvg.setAttribute("width", canvas.width);
		oCopyedSvg.setAttribute("height", canvas.height);

		var oClonedNode = oDragNode.cloneNode(true);
		// remove origial text node, otherwise the text overlay is hard to read
		this.removeOriginalTextNode(oClonedNode);

		var gWrapper = document.createElementNS(svgNS, "g"); // eslint-disable-line sap-no-element-creation
		// move the dragged the shape to the original point of the new SVG
		gWrapper.setAttribute("transform", "translate(" + -(oFrame.x) + ", " + -(oFrame.y) + ")");
		gWrapper.appendChild(oClonedNode);
		if (this.adhocLineDrag) {
			//creating adhoc line ghost image
			var oClonedHeaderNode = headerNode.cloneNode(true);
			var oClonedLineNode = lineNode.cloneNode(true);
			gWrapper.appendChild(oClonedHeaderNode);
			gWrapper.appendChild(oClonedLineNode);
		}
		if (this.deltaLineDrag) {
			//creating delta line ghost image.
			var oClonedHeaderStartLine = deltaLineElms.headerStartLine.cloneNode(true);
			var oClonedStartLine = deltaLineElms.startLine.cloneNode(true);
			var oClonedHeaderEndLine = deltaLineElms.headerEndLine.cloneNode(true);
			var oCLonedEndLine = deltaLineElms.endLine.cloneNode(true);
			gWrapper.appendChild(oClonedHeaderStartLine);
			gWrapper.appendChild(oClonedStartLine);
			gWrapper.appendChild(oClonedHeaderEndLine);
			gWrapper.appendChild(oCLonedEndLine);
		}

		// append defs
		var oSvgDefs = this.getGantt().getSvgDefs();
		if (oSvgDefs) {
			var oClonedSvgDefsNode = jQuery(document.getElementById(oSvgDefs.getId())).get(0).cloneNode(true);
			oCopyedSvg.appendChild(oClonedSvgDefsNode);
		}

		oCopyedSvg.appendChild(gWrapper);
		return new XMLSerializer().serializeToString(oCopyedSvg);
	};

	GanttDragDropExtension.prototype.removeOriginalTextNode = function(oNode) {
		if (oNode.tagName === "text") {
			oNode.parentNode.removeChild(oNode);
		}
		// for IE and Safari, oNode.children is undefined
		var children = oNode.children || oNode.childNodes;
		for (var i = 0; i < children.length; i++) {
			this.removeOriginalTextNode(children[i]);
		}
	};

	GanttDragDropExtension.prototype.getNumberOfDragObject = function(oLastNode) {
		var oSelection = this.getGantt().getSelection();
		var iSelectedDraggableShapes = oSelection.numberOfSelectedDraggableShapes();
		var oRb = Core.getLibraryResourceBundle("sap.gantt");
		var sObject = oRb.getText("GNT_DRAGGED_OBJECT");
		var sObjects = oRb.getText("GNT_DRAGGED_OBJECTS");
		var sDescr = iSelectedDraggableShapes > 1 ? sObjects : sObject;
		return iSelectedDraggableShapes + " " + sDescr;
	};

	/**
	 * disables text selection on the document (disabled fro Dnd)
	 * @private
	 */
	GanttDragDropExtension.prototype._disableTextSelection = function () {
		// prevent text selection
		jQuery(document.body).
			attr("unselectable", "on").
			css({
				"-moz-user-select": "none",
				"-webkit-user-select": "none",
				"user-select": "none"
			}).
			bind("selectstart", function(oEvent) {
				oEvent.preventDefault();
				return false;
			});
	};

	/**
	 * enables text selection on the document (disabled fro Dnd)
	 * @private
	 */
	GanttDragDropExtension.prototype._enableTextSelection = function () {
		jQuery(document.body).
			attr("unselectable", "off").
			css({
				"-moz-user-select": "",
				"-webkit-user-select": "",
				"user-select": ""
			}).
			unbind("selectstart");
	};

	GanttDragDropExtension.prototype.isAllowedVerticalOrentationDrag = function() {
		var oGantt = this.getGantt();
		if (oGantt.getDragOrientation() === DragOrientation.Vertical) {
			return oGantt.oSelection.numberOfSelectedDraggableShapes() < 2;
		}

		return true;
	};

	GanttDragDropExtension.prototype.getRowByShape = function(oShape) {
		var oOriginalRow = GanttUtils.getRowInstancefromShape(oShape);
		var oClonedRow = oOriginalRow.clone();
		oClonedRow = this._addBackOriginalGanttRowProperties(oOriginalRow, oClonedRow);
		return oClonedRow;
	};

	GanttDragDropExtension.prototype._addBackOriginalGanttRowProperties = function(oOriginalRow, oClonedRow) {
		oClonedRow.oPropagatedProperties = oOriginalRow._getPropertiesToPropagate();
		oClonedRow.propagateProperties(true);
		oClonedRow.setParent(oOriginalRow.getParent());
		return oClonedRow;
	};

	return GanttDragDropExtension;
});
