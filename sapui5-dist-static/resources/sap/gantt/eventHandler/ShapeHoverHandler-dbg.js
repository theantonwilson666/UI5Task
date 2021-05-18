/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"sap/ui/thirdparty/jquery", "sap/ui/base/Object"
], function (jQuery, BaseObject) {
	"use strict";

	/**
	 * Constructor for a new ShapeHoverHandler
	 *
	 * Initialize the handler and reserve the caller of this handler as the '_oSourceChart'
	 * currently, '_oSourceChart' may be an instance of GanttChart or GanttChartWithTable
	 * @param {object} oChart an instance of the caller
	 *
	 * @class
	 * Handler for shape mouse enter and mouse leave event
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version 1.88.0
	 *
	 * @constructor
	 * @private
	 * @alias sap.gantt.eventHandler.ShapeHoverHandler
	 */
	var ShapeHoverHandler = BaseObject.extend("sap.gantt.eventHandler.ShapeHoverHandler", {
		constructor : function (oChart) {
			BaseObject.call(this);
			this._oSourceChart = oChart;
			this._oShapeManager = oChart._oShapeManager;
			this._oLastHoverShapeUID = undefined;
			this._oLastHoverShapeData = undefined;
			this._sHoverDelayCall = undefined;
			this._iHoverDelayInMillionsecond = 500;
		}
	});

	ShapeHoverHandler.prototype.handleShapeHover = function(oShapeData, oEvent) {
		// Most cases are mousemove, fire mouse leave when event type is mouseleave
		if (this._oSourceChart._bDragStart) {
			if (oEvent && this._oLastHoverShapeUID !== undefined) {
				//force close before drag start.
				window.clearTimeout(this._sHoverDelayCall);
				this.fireMouseLeave(oEvent);
			}
		} else {
			if (oEvent) {
				var sShapeInstanceId = oEvent.target.getAttribute("class") ?
						oEvent.target.getAttribute("class").split(" ")[0] : undefined;

				window.clearTimeout(this._sHoverDelayCall);
				this._sHoverDelayCall = window.setTimeout(this.fireHoverEvent.bind(this), this._iHoverDelayInMillionsecond, oShapeData, sShapeInstanceId, oEvent);
			}
		}
	};

	ShapeHoverHandler.prototype.fireHoverEvent = function(oShapeData, sShapeInstanceId, oEvent) {
		if (!oShapeData && this._oLastHoverShapeUID !== undefined) {
			this.fireMouseLeave(oEvent);
		} else if (this._oShapeManager.isShapeHoverable(oShapeData, sShapeInstanceId)) {
			if (this._oLastHoverShapeUID !== oShapeData.uid){
				if (this._oLastHoverShapeUID !== undefined){
					this.fireMouseLeave(oEvent);
				}

				this.fireMouseEnter(oShapeData, oEvent);
			}
		} else {
			if (this._oLastHoverShapeUID !== undefined){
				this.fireMouseLeave(oEvent);
			}
		}
	};

	ShapeHoverHandler.prototype.fireMouseEnter = function(oCurrentShapeData, oOriginEvent){
		this._oLastHoverShapeUID = oCurrentShapeData.uid;
		this._oLastHoverShapeData = oCurrentShapeData;
		this._oSourceChart.fireShapeMouseEnter({
			shapeData: oCurrentShapeData,
			pageX: oOriginEvent.pageX,
			pageY: oOriginEvent.pageY,
			originEvent: oOriginEvent
		});
	};

	ShapeHoverHandler.prototype.fireMouseLeave = function(oOriginEvent){
		this._oSourceChart.fireShapeMouseLeave({
			shapeData: this._oLastHoverShapeData,
			originEvent: oOriginEvent
		});
		this._oLastHoverShapeUID = undefined;
		this._oLastHoverShapeData = undefined;
	};

	return ShapeHoverHandler;
}, true);
