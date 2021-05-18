sap.ui.define(
	["./BaseRectangle", "./BasePath"],
	function (BaseRectangle, BasePath) {
		"use strict";

		/**
		 * Creates and initializes a new BaseTriangle class.
		 *
		 * @param {string} [sId] ID of the new control. This is generated automatically, if ID is not provided.
		 *
		 * @class
		 * BaseTriangle represents a basic shape that creates triangles based on the Orientation property.
		 *
		 * @extends sap.gantt.simple.BaseRectangle
		 *
		 * @author SAP SE
		 * @version 1.88.0
     	 * @since 1.84
		 *
		 * @constructor
		 * @public
		 * @alias sap.gantt.simple.BaseTriangle
		 */
		var BaseTriangle = BaseRectangle.extend("sap.gantt.simple.BaseTriangle", {
			metadata: {
				properties: {
				/**
				 * Standard SVG 'stroke' attribute.
				 * You can provide the stroke attribute with HTML colors and URL reference to the paint server.
				 * Paint server definitions usually come from paint servers rendered by {@link sap.gantt.GanttChartContainer},
				 * {@link sap.gantt.GanttChartWithTable} or {@link sap.gantt.GanttChart}.
				 */
				stroke: {type : "sap.gantt.ValueSVGPaintServer"},

				/**
				 * Standard SVG 'stroke-width' attribute.
				 */
				strokeWidth: {type: "float", defaultValue: 1},

				/**
				 * Standard SVG 'stroke-dasharray' attribute.
				 */
				strokeDasharray: {type: "string"},
					/**
					 * Width of the triangle
					 */
					width: { type: "sap.gantt.SVGLength", defaultValue: 0 },

					/**
					 * Height of the triangle
					 */
					height: { type: "sap.gantt.SVGLength", defaultValue: 0 },

					/**
					 * Orientation of the triangle
					 */
					orientation: { type: "string", defaultValue: "right" }
				},
				events: {
					press: {},
					mouseEnter: {},
					mouseLeave: {}
				}
			},
			renderer: {
				apiVersion: 2    // enable in-place DOM patching
			}
		});

		/**
		 * Checking the BaseTriangle property "x" is valid
		 *
		 * @return {sap.gantt.SVGLength} Value of property x.
		 */
		BaseTriangle.prototype._isValid = function () {
			var x = this.getX();
			return x !== undefined && x !== null;
		};

		/**
		 * Firing event on the mouse hover of BaseTriangle
		 *
		 * @param {object} oEvent - holding event details of BaseTriangle
		 */
		BaseTriangle.prototype.onmouseover = function (oEvent) {
			this.fireMouseEnter(oEvent);
		};

		/**
		 * Firing event on the mouseout of BaseTriangle
		 *
		 * @param {object} oEvent - holding event details of BaseTriangle
		 */
		BaseTriangle.prototype.onmouseout = function (oEvent) {
			this.fireMouseLeave(oEvent);
		};

		/**
		 * Firing event on selecting the BaseTriangle
		 *
		 * @param {object} oEvent - holding event details of BaseTriangle
		 */
		BaseTriangle.prototype.onclick = function (oEvent) {
			this.firePress(oEvent);
		};

		/**
		 * Triangle extends from Rectangle but is rendered as a path
		 *
		 * @return {string} Value of property d.
		 * @private
		 */
		BaseTriangle.prototype.getD = function () {
			var x = this.getX(),
				w = this.getWidth(),
				h = this.getHeight(),
				y = this.getRowYCenter(),
				o = this.getOrientation(),
				d = "";

			var concat = function () {
				var sResult = "";
				for (var iIdx = 0; iIdx < arguments.length; iIdx++) {
					sResult += arguments[iIdx] + " ";
				}
				return sResult;
			};

			if (o === "left") {
				d = concat("M", x + 1, y, "l", -w, h / 2, "l", w, h / 2) + "Z";
			} else {
				d = concat("M", x - 1, y, "l", w, h / 2, "l", -w, h / 2) + "Z";
			}
			return d;
		};

		/**
		 * Get width of the BaseTriangle
		 *
		 * @return {sap.gantt.SVGLength} Value of property width.
		 */
		BaseTriangle.prototype.getWidth = function () {
			var vWidth = this.getProperty("width");
			if (vWidth === "auto") {
				return parseFloat(this._iBaseRowHeight * 0.625, 10);
			}
			if (vWidth === "inherit") {
				return this._iBaseRowHeight;
			}
			return vWidth;
		};

		/**
		 * Get Orientation property of the BaseTriangle
		 *
		 *  @return {string} Value of property orientation.
		 */
		BaseTriangle.prototype.getOrientation = function () {
			var sOrientation = this.getProperty("orientation");
			return sOrientation;
		};

		BaseTriangle.prototype.renderElement = BasePath.prototype.renderElement;

		/**
		 * Rendering the properties of BaseTriangle
		 */
		BaseTriangle.prototype.renderElement = function () {
			if (this._isValid()) {
				BasePath.prototype.renderElement.apply(this, arguments);
			}
		};

		return BaseTriangle;
	},
	true
);
