/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

/**
 * Initialization Code and shared classes of library sap.gantt.
 */
sap.ui.define([
	"sap/ui/base/DataType",
	"sap/ui/core/theming/Parameters",
	"sap/gantt/config/TimeHorizon",
	"sap/gantt/simple/MarkerType",
	"sap/gantt/simple/LegendShapeGroupOrientation",
	"sap/ui/core/Core", // provides sap.ui.getCore()
	"sap/ui/core/library", // library dependency
	"sap/ui/layout/library", // library dependency
	"sap/ui/table/library", // library dependency
	"sap/m/library" // library dependency
], function(DataType, Parameters, TimeHorizon, MarkerType, LegendShapeGroupOrientation) {
	"use strict";


	/**
	 * UI5 library: sap.gantt.
	 *
	 * @namespace
	 * @name sap.gantt
	 * @public
	 */

	// library dependencies

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.gantt",
		dependencies : ["sap.ui.core", "sap.ui.layout", "sap.ui.table", "sap.m", "sap.ui.export", "sap.ui.dt","sap.ui.fl"],
		designtime: "sap/gantt/designtime/library.designtime",
		types: [
			"sap.gantt.control.ToolbarType",
			"sap.gantt.SelectionMode",
			"sap.gantt.shape.ShapeCategory",
			"sap.gantt.def.filter.MorphologyOperator",
			"sap.gantt.def.filter.ColorMatrixValue",
			"sap.gantt.shape.ext.rls.RelationshipType",
			"sap.gantt.config.ZoomControlType",
			"sap.gantt.config.BirdEyeRange",
			"sap.gantt.GenericArray",
			"sap.gantt.dragdrop.GhostAlignment",

			// .simple package
			"sap.gantt.simple.GanttChartWithTableDisplayType",
			"sap.gantt.simple.ContainerToolbarPlaceholderType",
			"sap.gantt.simple.VisibleHorizonUpdateType",
			"sap.gantt.simple.MarkerType",
			"sap.gantt.simple.LegendShapeGroupOrientation"
		],
		interfaces: [
		],
		controls: [
			"sap.gantt.control.Toolbar",
			"sap.gantt.GanttChart",
			"sap.gantt.GanttChartBase",
			"sap.gantt.GanttChartWithTable",
			"sap.gantt.GanttChartContainer",
			"sap.gantt.legend.LegendContainer",
			"sap.gantt.legend.ListLegend",
			"sap.gantt.legend.DimensionLegend",

			// .simple package
			"sap.gantt.simple.GanttChartWithTable",
			"sap.gantt.simple.ContainerToolbar",
			"sap.gantt.simple.GanttChartContainer",
			"sap.gantt.simple.ContainerToolbarPlaceholder"

		],
		elements: [
			"sap.gantt.axistime.ProportionZoomStrategy",

			"sap.gantt.config.TimeHorizon",
			"sap.gantt.config.TimeAxis",
			"sap.gantt.config.ToolbarGroup",
			"sap.gantt.config.Mode",
			"sap.gantt.config.ModeGroup",
			"sap.gantt.config.LayoutGroup",
			"sap.gantt.config.ExpandChart",
			"sap.gantt.config.ExpandChartGroup",
			"sap.gantt.config.TimeZoomGroup",
			"sap.gantt.config.BirdEyeGroup",
			"sap.gantt.config.ToolbarScheme",
			"sap.gantt.config.Hierarchy",
			"sap.gantt.config.HierarchyColumn",
			"sap.gantt.config.ColumnAttribute",
			"sap.gantt.config.GanttChartLayout",
			"sap.gantt.config.ContainerLayout",
			"sap.gantt.config.SettingItem",
			"sap.gantt.config.SettingGroup",
			"sap.gantt.config.ObjectType",
			"sap.gantt.config.ChartScheme",
			"sap.gantt.config.Locale",
			"sap.gantt.config.Shape",
			"sap.gantt.def.SvgDefs",
			"sap.gantt.axistime.AxisTimeStrategyBase",
			"sap.gantt.AdhocLine",

			/// .simple package
			"sap.gantt.simple.GanttRowSettings",

			"sap.gantt.simple.BaseCalendar",
			"sap.gantt.simple.BaseChevron",
			"sap.gantt.simple.BaseDiamond",
			"sap.gantt.simple.BaseGroup",
			"sap.gantt.simple.BaseImage",
			"sap.gantt.simple.BaseLine",
			"sap.gantt.simple.BasePath",
			"sap.gantt.simple.BaseRectangle",
			"sap.gantt.simple.BaseShape",
			"sap.gantt.simple.BaseText",
			"sap.gantt.simple.BaseCursor",
			"sap.gantt.simple.BaseConditionalShape",
			"sap.gantt.simple.AdhocLine",
			"sap.gantt.simple.DeltaLine",
			"sap.gantt.simple.AdhocDiamond",
			"sap.gantt.simple.BaseTriangle",
			"sap.gantt.simple.LegendShapeGroup",
			"sap.gantt.simple.BaseDeltaRectangle",
			"sap.gantt.simple.MultiActivityGroup",
			"sap.gantt.simple.MultiActivityRowSettings",

			/// ULC & UBC
			"sap.gantt.simple.UtilizationBarChart",
			"sap.gantt.simple.UtilizationLineChart",
			"sap.gantt.simple.UtilizationChart",
			"sap.gantt.simple.UtilizationDimension",
			"sap.gantt.simple.UtilizationPeriod",

			"sap.gantt.simple.shapes.Shape",
			"sap.gantt.simple.shapes.Task"
		],
		extensions: {
			flChangeHandlers:{
				"sap.gantt.simple.GanttChartContainer": "sap/gantt/flexibility/simple/GanttChartContainer",
				"sap.ui.table.Column": "sap/gantt/flexibility/simple/GanttTableColumn",
				"sap.ui.table.TreeTable": "sap/gantt/flexibility/simple/GanttTableColumn",
				"sap.gantt.axistime.ProportionZoomStrategy": "sap/gantt/flexibility/simple/GanttChartContainer",
				"sap.gantt.axistime.StepwiseZoomStrategy": "sap/gantt/flexibility/simple/GanttChartContainer",
				"sap.gantt.axistime.FullScreenStrategy": "sap/gantt/flexibility/simple/GanttChartContainer"
			}
		},
		noLibraryCSS: false,
		version: "1.88.0"
	});

	this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.gantt");

	/**
	 * Different selection mode for GanttChart
	 *
	 * @enum {string}
	 * @public
	 */
	sap.gantt.SelectionMode = {

		/**
		 * Support multiple shape when pressing ctrl/meta key
		 * From version 1.40 to upper versions, support multiple selection without Ctrl key for rows
		 * @public
		 */
		MultiWithKeyboard : "MultiWithKeyboard",

		/**
		 * Select multiple shapes at a time
		 * @public
		 */
		Multiple : "Multiple",

		/**
		 * Support multiple shape alongwith lasso selection when pressing ctrl/meta key
		 * @public
		 */
		MultiWithKeyboardAndLasso : "MultiWithKeyboardAndLasso",

		/**
		 * Select multiple shapes alongwith lasso selection
		 * @public
		 */
		MultipleWithLasso : "MultipleWithLasso",

		/**
		 * Select one shape at a time
		 * @public
		 */
		Single : "Single",

		/**
		 * No shape can be selected
		 * @public
		 */
		None : "None"
	};

	/**
	 * The layer of adhoc line in chart area
	 *
	 * @enum {string}
	 * @public
	 */
	sap.gantt.AdhocLineLayer = {

		/**
		 * Adhoc lines are on top of all other shapes and patterns.
		 * @public
		 */
		Top : "Top",

		/**
		 * Adhoc lines are below all other shapes. If a calendar is shown in the chart area,
		 * adhoc lines are on top of the calendar.
		 * @public
		 */
		Bottom : "Bottom"
	};

	/**
		 * The layer of delta line in chart area
		 *
		 * @enum {string}
		 * @public
		 * @since 1.84
		 */
		sap.gantt.DeltaLineLayer = {
			/**
			 * Delta lines are above all other shapes and patterns.
			 * @public
			 */
			Top: "Top",

			/**
			 * Delta lines are below all other shapes and patterns.
			 * @public
			 */
			Bottom: "Bottom"
		};

	/**
	 * Different types for a tool bar (predefined types)
	 *
	 * @enum {string}
	 * @private
	 */
	sap.gantt.control.ToolbarType = {

		/**
		 * Toolbar of GanttContainer
		 * @private
		 */
		Global : "GLOBAL",

		/**
		 * Toolbar of GanttWithTable
		 * @private
		 */
		Local : "LOCAL"
	};

	/**
	 * @classdesc A string type that represents SVG fill color values.
	 *
	 * Allowed values are {@link sap.ui.core.CSSColor} and {@link sap.m.ValueColor} and LESS parameter
	 * The empty string and invalid less parameter fall back to default black color.
	 *
	 * @final
	 * @namespace
	 * @public
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.gantt.ValueSVGPaintServer = DataType.createType('sap.gantt.ValueSVGPaintServer', {
		isValid : function(vValue) {
			var bValid = sap.m.ValueCSSColor.isValid(vValue);
			if (!bValid){
				bValid = /(?:url\(['|"]?)(.*?)(?:['|"]?\))|^[@|#](.*?)$|initial|transparent|none|inherit/.test(vValue);
			}
			return bValid;
		}
	}, DataType.getType('string'));
	sap.gantt.ValueSVGPaintServer.setNormalizer(
		/**
		 * Check if the input value is an valid value for property fill and stroke. It allows hex/name color, URL pattern,
		 * Otherwise try to match the input with LESS parameters
		 *
		 * @param {vValue} vValue user passed value
		 * @return {string} valid paint value
		 */
		function (vValue) {
			if (!vValue) {
				// Return if input is undefined
				return vValue;
			}

			if (vValue.substr(0, 1) === "@") {
				vValue = vValue.substring(1);
			}

			var sRetValue = Parameters.get(vValue) || vValue;
			return sRetValue;
		}
	);

	/**
	 * @classdesc A length is a distance measurement, given as a number along with a unit.
	 * If unit is not provided, the length value represents a distance in the current user coordinate system.
	 *
	 * @final
	 * @namespace
	 * @public
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.gantt.SVGLength = DataType.createType("sap.gantt.SVGLength", {
		isValid : function(vValue) {
			if (vValue === "auto" || vValue === "inherit") { return true; }
			return /^[-+]?([0-9]*\.?[0-9]+)(em|ex|px|in|cm|mm|pt|pc|%)?$/.test(vValue);
		}
	}, DataType.getType("any"));

	/**
	 * Namespace <code>sap.gantt.palette</code> provides color palette definitions for standard shapes.
	 *
	 * @namespace
	 * @name sap.gantt.palette
	 * @public
	 * @since 1.69
	 */
	sap.gantt.palette = {};

	/**
	 * Semantic colors:
	 * <ul>
	 *     <li><code>sapUiNegativeText</code> - Negative (warning)</li>
	 *     <li><code>sapUiCriticalText</code> - Critical (alert)</li>
	 *     <li><code>sapUiPositiveText</code> - Positive (success)</li>
	 *     <li><code>sapUiInformativeText</code> - Informative (information)</li>
	 *     <li><code>sapUiNeutralText</code> - Neutral (no level)</li>
	 * </ul>
	 * @type {string[]}
	 * @public
	 * @since 1.69
	 */
	sap.gantt.palette.SemanticColors = [
		"sapUiNegativeText",
		"sapUiCriticalText",
		"sapUiPositiveText",
		"sapUiInformativeText",
		"sapUiNeutralText"
	];

	/**
	 * Legend colors: sapUiLegend1-sapUiLegend20
	 * @type {Array}
	 * @public
	 * @since 1.69
	 */
	sap.gantt.palette.LegendColors = [];

	var i;
	for (i = 1; i <= 20; i++) {
		sap.gantt.palette.LegendColors.push("sapUiLegend" + i);
	}

	/**
	 * Accent colors: sapUiAccent1-sapUiAccent10
	 * @type {Array}
	 * @public
	 * @since 1.69
	 */
	sap.gantt.palette.AccentColors = [];

	for (i = 1; i <= 10; i++) {
		sap.gantt.palette.AccentColors.push("sapUiAccent" + i);
	}

	/**
	 * Accepts only Gantt palette colors names.
	 *
	 * @final
	 * @namespace
	 * @public
	 * @since 1.69
	 */
	sap.gantt.PaletteColor = DataType.createType("sap.gantt.PaletteColor", {
		isValid: function (vValue) {
			var sValue = String(vValue);
			if (sValue[0].startsWith("@")) {
				sValue = sValue.substr(1);
			}
			return sap.gantt.palette.SemanticColors.indexOf(sValue) >= 0 ||
				sap.gantt.palette.LegendColors.indexOf(sValue) >= 0 ||
				sap.gantt.palette.AccentColors.indexOf(sValue) >= 0;
		},
		parseValue: function (vValue) {
			var sValue = String(vValue);
			if (sValue[0].startsWith("@")) {
				sValue = sValue.substr(1);
			}
			return sValue;
		}
	}, DataType.getType("string"));

	/**
	 * The <code>sap.gantt.shape</code> namespace.
	 *
	 * This namespace provides the following configuration related features:
	 * <ul>
	 * 		<li>A base class <code>sap.gantt.shape.Shape</code> is provided directly in this namespace</li>
	 * 		<li>A default selection shape class <code>sap.gantt.shape.SelectedShape</code> is provided directly in this namespace</li>
	 * 		<li>All basic shapes corresponding to SVG tag are provided directly in this namespace</li>
	 * 		<li>Extended shapes from tag shapes are provided in sub-namespace <code>ext</code></li>
	 * 		<li>Special calendar shape, which should be used in combination with the calendar paint server, is provided in sub-namespace<code>cal</code></li>
	 * </ul>
	 *
	 * @namespace
	 * @name sap.gantt.shape
	 * @public
	 */

	/**
	 * Namespace <code>sap.gantt.config</code> provides all configuration related objects and default configuration value for optional ones.
	 *
	 * @namespace
	 * @name sap.gantt.config
	 * @public
	 */

	/**
	 * Shape Categories.
	 *
	 * Different categories use different Drawers. Therefore, different categories may have different designs of parameters in their getter methods.
	 * @enum {string}
	 * @public
	 */
	sap.gantt.shape.ShapeCategory = {

		/**
		 * Shapes attached to one row.
		 * @public
		 */
		InRowShape: "InRowShape",

		/**
		 * Relationship shapes connecting two in-row shape instances.
		 * @public
		 */
		Relationship: "relationship"
	};

	/**
	 * Type of task shape.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.69
	 */
	sap.gantt.simple.shapes.TaskType = {
		/**
		 * A normal task.
		 */
		Normal: "Normal",
		/**
		 * An expanded summary task.
		 */
		SummaryExpanded: "SummaryExpanded",
		/**
		 * A collapsed summary task.
		 */
		SummaryCollapsed: "SummaryCollapsed",
		/**
		 * An error task.
		 */
		Error: "Error"
	};

	/**
	 * Configuration options for vertical alignment of shape representing a Task. This is only applicable for Tasks.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.81
	 */
	sap.gantt.simple.shapes.ShapeAlignment = {
		/**
		 * Summary task is aligned at the top.
		 *  @public
		 */
		Top: "Top",
		/**
		 * Summary task is aligned at the center.
		 *  @public
		 */
		Middle: "Middle",
		/**
		 * Summary task is aligned at the bottom.
		 *  @public
		 */
		Bottom: "Bottom"
	};

	/**
	 * Morphology Operators.
	 *
	 * The operator decides the morphology to make the shape fatter or slimmer.
	 * @enum {string}
	 * @public
	 */
	sap.gantt.def.filter.MorphologyOperator = {

		/**
		 * Fatter Morphology.
		 * @public
		 */
		Dilate: "dilate",

		/**
		 * Slimmer Morphology.
		 * @public
		 */
		Erode: "erode"
	};

	/**
	 * Color Matrix Values.
	 *
	 * The matrix decides what target color from source color.
	 * @enum {string}
	 * @public
	 */
	sap.gantt.def.filter.ColorMatrixValue = {

		/**
		 * Turns every color to white.
		 * @public
		 */
		AllToWhite: "-1 0 0 0 1, 0 -1 0 0 1, 0 0 -1 0 1, 0 0 0 1 0",

		/**
		 * Turns every color to black.
		 * @public
		 */
		AllToBlack: "-1 0 0 0 0, 0 -1 0 0 0, 0 0 -1 0 0, 0 0 0 1 0"
	};

	/**
	 * Type of relationships
	 *
	 * @enum {string}
	 * @public
	 */
	sap.gantt.shape.ext.rls.RelationshipType = {
		/**
		 * Finish to finish type.
		 * @public
		 */
		FinishToFinish: 0,
		/**
		 * Finish to start type.
		 * @public
		 */
		FinishToStart: 1,
		/**
		 * Start to finish type.
		 * @public
		 */
		StartToFinish: 2,
		/**
		 * Start to start type.
		 * @public
		 */
		StartToStart: 3
	};

	/**
	* Type connector shapes for relationship
	* @enum {string}
	* @public
	* @since 1.86
	*/
	sap.gantt.simple.connectorType = {
		/**
	    * @public
	    */
		Arrow: "Arrow",
		/**
		* @public
		*/
		Square: "Square",
		/**
		* @public
		*/
		Circle: "Circle",
		/**
		* @public
		*/
		Diamond: "Diamond",
		/**  primarily used for overlapping of connector shapes.
		* @public
		*/
		HorizontalRectangle: "HorizontalRectangle",
		/**
        * @public
        */
		VerticalRectangle: "VerticalRectangle",
		/**
		* @public
		*/
		None: "None"
	};

	/**
	 * Type of relationship shape.
	 * <code>sap.gantt.simple.RelationshipType</code> shall be used to define property type on class <code>sap.gantt.simple.Relationship</code>
	 *
	 * @enum {string}
	 * @since 1.60.0
	 * @public
	 */
	sap.gantt.simple.RelationshipType = {
		/**
		 * Finish to finish type.
		 * @public
		 */
		FinishToFinish: "FinishToFinish",
		/**
		 * Finish to start type.
		 * @public
		 */
		FinishToStart: "FinishToStart",
		/**
		 * Start to finish type.
		 * @public
		 */
		StartToFinish: "StartToFinish",
		/**
		 * Start to start type.
		 * @public
		 */
		StartToStart: "StartToStart"
	};

	/**
	 * Define the type of zoom control in global tool bar
	 * @version 1.88.0
	 * @enum {string}
	 * @public
	 */
	sap.gantt.config.ZoomControlType = {
		/**
		 * Uses the SliderWithButtons control to modify the time zoom rate.
		 * The SliderWithButtons control consists of zoom in and zoom out magnifier buttons and a slider.
		 * @public
		 */
		SliderWithButtons: "SliderWithButtons",

		/**
		 * Uses the SliderOnly control to modify the time zoom rate.
		 * The SliderOnly control only consists of a slider.
		 * @public
		 */
		SliderOnly: "SliderOnly",

		/**
		 * Uses the ButtonsOnly control to modify the time zoom rate.
		 * The SliderOnly control only consists of zoom in and zoom out buttons.
		 * @public
		 */
		ButtonsOnly: "ButtonsOnly",

		/**
		 * Uses the Select control to modify the time zoom rate.
		 * The Select control consists of a drop down list to select a suitable zoom rate.
		 * @public
		 */
		Select: "Select",

		/**
		 * Display no zoom control
		 * @public
		 */
		None: "None"
	};

	/**
	 * Define the range of data that bird eye would use to calculate visibleHorizon
	 *
	 * @enum {string}
	 * @public
	 */
	sap.gantt.config.BirdEyeRange = {
		/**
		 * Bird eye will calculate visibleHorizon based on all rows of current view, but this mode may cause
		 * low performance.
		 * Using this bird eye range, the result is not influenced by vertical scroll bar position as the total rows
		 * never changes.
		 *
		 * @public
		 */
		AllRows: "AllRows",

		/**
		 * Bird eye will calculate visibleHorizon based on row data only in visible rows.
		 * Using this bird eye range, the result can be influenced by vertical scroll bar position as visible rows
		 * may change with the movement of the vertical scroll bar position.
		 *
		 * @public
		 */
		VisibleRows: "VisibleRows"
	};

	/**
	 * Different time units used as part of the zoom level. They are names of d3 time unit classes.
	 *
	 * @enum {string}
	 * @public
	 */
	sap.gantt.config.TimeUnit = {

		/**
		 * Time unit of minute.
		 * @public
		 */
		minute: "d3.time.minute",

		/**
		 * Time unit of hour.
		 * @public
		 */
		hour: "d3.time.hour",

		/**
		 * Time unit of day.
		 * @public
		 */
		day: "d3.time.day",

		/**
		 * Time unit of week.
		 * @public
		 */
		week: "d3.time.week",

		/**
		 * Time unit of month.
		 * @public
		 */
		month: "d3.time.month",

		/**
		 * Time unit of year.
		 * @public
		 */
		year: "d3.time.year"
	};

	/**
	 * Different first day of week used as time axis.
	 *
	 * @enum {string}
	 * @private
	 */
	sap.gantt.config.WeekFirstDay = {
		"ad": "d3.time.monday",
		"ae": "d3.time.saturday",
		"af": "d3.time.saturday",
		"ag": "d3.time.sunday",
		"ai": "d3.time.monday",
		"al": "d3.time.monday",
		"am": "d3.time.monday",
		"an": "d3.time.monday",
		"ar": "d3.time.sunday",
		"as": "d3.time.sunday",
		"at": "d3.time.monday",
		"au": "d3.time.sunday",
		"ax": "d3.time.monday",
		"az": "d3.time.monday",
		"ba": "d3.time.monday",
		"bd": "d3.time.friday",
		"be": "d3.time.monday",
		"bg": "d3.time.monday",
		"bh": "d3.time.saturday",
		"bm": "d3.time.monday",
		"bn": "d3.time.monday",
		"br": "d3.time.sunday",
		"bs": "d3.time.sunday",
		"bt": "d3.time.sunday",
		"bw": "d3.time.sunday",
		"by": "d3.time.monday",
		"bz": "d3.time.sunday",
		"ca": "d3.time.sunday",
		"ch": "d3.time.monday",
		"cl": "d3.time.monday",
		"cm": "d3.time.monday",
		"cn": "d3.time.sunday",
		"co": "d3.time.sunday",
		"cr": "d3.time.monday",
		"cy": "d3.time.monday",
		"cz": "d3.time.monday",
		"de": "d3.time.monday",
		"dj": "d3.time.saturday",
		"dk": "d3.time.monday",
		"dm": "d3.time.sunday",
		"do": "d3.time.sunday",
		"dz": "d3.time.saturday",
		"ec": "d3.time.monday",
		"ee": "d3.time.monday",
		"eg": "d3.time.saturday",
		"es": "d3.time.monday",
		"et": "d3.time.sunday",
		"fi": "d3.time.monday",
		"fj": "d3.time.monday",
		"fo": "d3.time.monday",
		"fr": "d3.time.monday",
		"gb": "d3.time.monday",
		"gb-alt-variant": "d3.time.sunday",
		"ge": "d3.time.monday",
		"gf": "d3.time.monday",
		"gp": "d3.time.monday",
		"gr": "d3.time.monday",
		"gt": "d3.time.sunday",
		"gu": "d3.time.sunday",
		"hk": "d3.time.sunday",
		"hn": "d3.time.sunday",
		"hr": "d3.time.monday",
		"hu": "d3.time.monday",
		"id": "d3.time.sunday",
		"ie": "d3.time.sunday",
		"il": "d3.time.sunday",
		"in": "d3.time.sunday",
		"iq": "d3.time.saturday",
		"ir": "d3.time.saturday",
		"is": "d3.time.monday",
		"it": "d3.time.monday",
		"jm": "d3.time.sunday",
		"jo": "d3.time.saturday",
		"jp": "d3.time.sunday",
		"ke": "d3.time.sunday",
		"kg": "d3.time.monday",
		"kh": "d3.time.sunday",
		"kr": "d3.time.sunday",
		"kw": "d3.time.saturday",
		"kz": "d3.time.monday",
		"la": "d3.time.sunday",
		"lb": "d3.time.monday",
		"li": "d3.time.monday",
		"lk": "d3.time.monday",
		"lt": "d3.time.monday",
		"lu": "d3.time.monday",
		"lv": "d3.time.monday",
		"ly": "d3.time.saturday",
		"ma": "d3.time.saturday",
		"mc": "d3.time.monday",
		"md": "d3.time.monday",
		"me": "d3.time.monday",
		"mh": "d3.time.sunday",
		"mk": "d3.time.monday",
		"mm": "d3.time.sunday",
		"mn": "d3.time.monday",
		"mo": "d3.time.sunday",
		"mq": "d3.time.monday",
		"mt": "d3.time.sunday",
		"mv": "d3.time.friday",
		"mx": "d3.time.sunday",
		"my": "d3.time.monday",
		"mz": "d3.time.sunday",
		"ni": "d3.time.sunday",
		"nl": "d3.time.monday",
		"no": "d3.time.monday",
		"np": "d3.time.sunday",
		"nz": "d3.time.monday",
		"om": "d3.time.saturday",
		"pa": "d3.time.sunday",
		"pe": "d3.time.sunday",
		"ph": "d3.time.sunday",
		"pk": "d3.time.sunday",
		"pl": "d3.time.monday",
		"pr": "d3.time.sunday",
		"pt": "d3.time.monday",
		"py": "d3.time.sunday",
		"qa": "d3.time.saturday",
		"re": "d3.time.monday",
		"ro": "d3.time.monday",
		"rs": "d3.time.monday",
		"ru": "d3.time.monday",
		"sa": "d3.time.sunday",
		"sd": "d3.time.saturday",
		"se": "d3.time.monday",
		"sg": "d3.time.sunday",
		"si": "d3.time.monday",
		"sk": "d3.time.monday",
		"sm": "d3.time.monday",
		"sv": "d3.time.sunday",
		"sy": "d3.time.saturday",
		"th": "d3.time.sunday",
		"tj": "d3.time.monday",
		"tm": "d3.time.monday",
		"tn": "d3.time.sunday",
		"tr": "d3.time.monday",
		"tt": "d3.time.sunday",
		"tw": "d3.time.sunday",
		"ua": "d3.time.monday",
		"um": "d3.time.sunday",
		"us": "d3.time.sunday",
		"uy": "d3.time.monday",
		"uz": "d3.time.monday",
		"va": "d3.time.monday",
		"ve": "d3.time.sunday",
		"vi": "d3.time.sunday",
		"vn": "d3.time.monday",
		"ws": "d3.time.sunday",
		"xk": "d3.time.monday",
		"ye": "d3.time.sunday",
		"za": "d3.time.sunday",
		"zw": "d3.time.sunday"
	};

	/**
	 * Defines the default configuration planHorizon.
	 *
	 * <p>From one year ago, to one year from now.</p>
	 * @public
	 * @deprecated Since version 1.63. Using these constants may result in errors in your application.
	 * Create the time horizons directly:
	 * <pre><code> new TimeHorizon({
	 *         startTime: new Date((new Date()).getTime() - 31536000000),
	 *         endTime: new Date((new Date()).getTime() + 31536000000)
	 *     }); </code></pre>
	 */
	sap.gantt.config.DEFAULT_PLAN_HORIZON = new TimeHorizon({
		startTime: new Date((new Date()).getTime() - 31536000000),
		endTime: new Date((new Date()).getTime() + 31536000000)
	});

	/**
	 * Prevents destroying of default object when gantt chart is destroyed
	 */
	sap.gantt.config.DEFAULT_PLAN_HORIZON.destroy = function(){};

	/**
	 * Defines the default configuration initHorizon.
	 *
	 * <p>From one month ago, to one year from now.</p>
	 * @public
	 * @deprecated Since version 1.63. Using these constants may result in errors in your application.
	 * Create the time horizons directly:
	 * <pre><code> new TimeHorizon({
	 *         startTime: new Date((new Date()).getTime() - 2628000000),
	 *         endTime: new Date((new Date()).getTime() + 2628000000)
	 *     }); </code></pre>
	 */
	sap.gantt.config.DEFAULT_INIT_HORIZON = new TimeHorizon({
		startTime: new Date((new Date()).getTime() - 2628000000),
		endTime: new Date((new Date()).getTime() + 2628000000)
	});

	/**
	 * Prevents destroying of default object when gantt chart is destroyed
	 */
	sap.gantt.config.DEFAULT_INIT_HORIZON.destroy = function(){};

	var sUnitDayPattern = sap.ui.getCore().getConfiguration().getRTL() ? ".M.d" : "d.M.";

	var sDatePattern = sap.ui.getCore().getConfiguration().getFormatSettings().getDatePattern("short");
	sap.gantt.config.DEFAULT_DATE_PATTERN = sDatePattern ? sDatePattern : "EEEE, MMM d, yy";

	var sTimePattern = sap.ui.getCore().getConfiguration().getFormatSettings().getTimePattern("short");
	sap.gantt.config.DEFAULT_TIME_PATTERN = sTimePattern ? sTimePattern : "HH:mm";

	/**
	 * Defines the default configuration of the time zoom level.
	 * <p>The default time zoom level includes a granularity factor that determines the length of the interval between neighboring vertical lines.
	 *
	 * The time zoom level now is a JSON object with the granularity as the key and some internal information such as formatting. Each level has 3 interval objects
	 * describing the time unit, the time span, and the jump condition to the next level. The zoom level decides how the time axis behaves and how ticks are displayed.
	 *
	 * Take <code>"12hour"</code> level for example
	 * 	<ul>
	 * 		<li><code>"12hour":</code> - Granularity level ID.
	 * 			<ul>
	 * 				<li>
	 * 					<code>"innerInterval"</code> - Time interval between neighboring vertical lines is 12 hours. The jump condition to the next level is "1day" when the interval exceeds 90 pixels.
	 * 					<ul>
	 * 						<li><code>"unit": sap.gantt.config.TimeUnit.hour</code> - Time unit is hour.</li>
	 * 						<li><code>"span": 12</code> - Span is 12.</li>
	 * 						<li><code>"range": 90</code> - Jumping condition is 90 pixels between neighboring vertical lines.</li>
	 * 					</ul>
	 * 				</li>
	 * 				<li>
	 * 					<code>largeInterval</code> - Time interval of top row along the time axis is 1 day. Formatted in the locale language with the format string. This zoom level implements an interval larger than the interval in the default zoom level.
	 * 					<ul>
	 * 						<li><code>"unit": sap.gantt.config.TimeUnit.day</code> - </li>
	 * 						<li><code>"span": 1</code> - Time span is 1.</li>
	 * 						<li><code>"pattern": "cccc dd.M.yyyy"</code> - Formats the string in CLDR date/time symbols.</li>
	 * 					</ul>
	 * 				</li>
	 * 				<li>
	 * 					<code>smallInterval</code> - Time interval of the bottom row along the time axis is 12 hours. Formatted in the locale language with the format string. This zoom level implements an interval the same as the interval in the default zoom level.
	 * 					<ul>
	 * 						<li><code>"unit": sap.gantt.config.TimeUnit.hour</code> - Time unit is hour.</li>
	 * 						<li><code>"span": 12</code> - Time span is 12.</li>
	 * 						<li><code>"pattern": "HH:mm"</code> - Formats the string in CLDR date/time symbols.</li>
	 * 					</ul>
	 * 				</li>
	 * 			</ul>
	 * 		</li>
	 * 	</ul>
	 *
	 * The current granularity setting provides the following values in the default time zoom level:<br/>
	 * <code>5min</code>, <code>10min</code>, <code>15min</code>, <code>30min</code>,<br/>
	 * <code>1hour</code>, <code>2hour</code>, <code>4hour</code>, <code>6hour</code>, <code>12hour</code>,<br/>
	 * <code>1day</code>, <code>2day</code>, <code>4day</code>,<br/>
	 * <code>1week</code>, <code>2week</code>,<br/>
	 * <code>1month</code>, <code>2month</code>, <code>4month</code>, <code>6month</code>,<br/>
	 * <code>1year</code>, <code>2year</code>, <code>5year</code>.
	 *
	 * @public
	 */
	sap.gantt.config.DEFAULT_TIME_ZOOM_STRATEGY = {
		"1min": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.minute,
				span: 1,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.day,
				span: 1,
				pattern: sap.gantt.config.DEFAULT_DATE_PATTERN
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.minute,
				span: 1,
				pattern: sap.gantt.config.DEFAULT_TIME_PATTERN
			}
		},
		"5min": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.minute,
				span: 5,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.day,
				span: 1,
				pattern: sap.gantt.config.DEFAULT_DATE_PATTERN
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.minute,
				span: 5,
				pattern: sap.gantt.config.DEFAULT_TIME_PATTERN
			}
		},
		"10min": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.minute,
				span: 10,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.day,
				span: 1,
				pattern: sap.gantt.config.DEFAULT_DATE_PATTERN
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.minute,
				span: 10,
				pattern: sap.gantt.config.DEFAULT_TIME_PATTERN
			}
		},
		"15min": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.minute,
				span: 15,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.day,
				span: 1,
				pattern: sap.gantt.config.DEFAULT_DATE_PATTERN
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.minute,
				span: 15,
				pattern: sap.gantt.config.DEFAULT_TIME_PATTERN
			}
		},
		"30min": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.minute,
				span: 30,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.day,
				span: 1,
				pattern: sap.gantt.config.DEFAULT_DATE_PATTERN
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.minute,
				span: 30,
				pattern: sap.gantt.config.DEFAULT_TIME_PATTERN
			}
		},
		"1hour": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.hour,
				span: 1,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.day,
				span: 1,
				pattern: sap.gantt.config.DEFAULT_DATE_PATTERN
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.hour,
				span: 1,
				pattern: sap.gantt.config.DEFAULT_TIME_PATTERN
			}
		},
		"2hour": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.hour,
				span: 2,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.day,
				span: 1,
				pattern: sap.gantt.config.DEFAULT_DATE_PATTERN
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.hour,
				span: 2,
				pattern: sap.gantt.config.DEFAULT_TIME_PATTERN
			}
		},
		"4hour": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.hour,
				span: 4,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.day,
				span: 1,
				pattern: sap.gantt.config.DEFAULT_DATE_PATTERN
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.hour,
				span: 4,
				pattern: sap.gantt.config.DEFAULT_TIME_PATTERN
			}
		},
		"6hour": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.hour,
				span: 6,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.day,
				span: 1,
				pattern: sap.gantt.config.DEFAULT_DATE_PATTERN
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.hour,
				span: 6,
				pattern: sap.gantt.config.DEFAULT_TIME_PATTERN
			}
		},
		"12hour": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.hour,
				span: 12,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.day,
				span: 1,
				pattern: sap.gantt.config.DEFAULT_DATE_PATTERN
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.hour,
				span: 12,
				pattern: sap.gantt.config.DEFAULT_TIME_PATTERN
			}
		},
		"1day": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.day,
				span: 1,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.month,
				span: 1,
				format: "yyyyMMMM"
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.day,
				span: 1,
				pattern: sUnitDayPattern
			}
		},
		"2day": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.day,
				span: 2,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.month,
				span: 1,
				format: "yyyyMMMM"
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.day,
				span: 2,
				pattern: sUnitDayPattern
			}
		},
		"4day": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.day,
				span: 4,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.month,
				span: 1,
				format: "yyyyMMMM"
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.day,
				span: 4,
				pattern: sUnitDayPattern
			}
		},
		"1week": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.week,
				span: 1,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.month,
				span: 1,
				format: "yyyyMMMM"
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.week,
				span: 1,
				pattern: sUnitDayPattern
			}
		},
		"2week": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.week,
				span: 2,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.month,
				span: 1,
				format: "yyyyMMMM"
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.week,
				span: 2,
				pattern: sUnitDayPattern
			}
		},
		"1month": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.month,
				span: 1,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.month,
				span: 6,
				format: "yyyyMMMM"
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.month,
				span: 1,
				pattern: sUnitDayPattern
			}
		},
		"2month": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.month,
				span: 2,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.month,
				span: 6,
				format: "yyyyMMMM"
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.month,
				span: 2,
				pattern: sUnitDayPattern
			}
		},
		"4month": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.month,
				span: 4,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.year,
				span: 1,
				format: "yyyy"
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.month,
				span: 4,
				pattern: "LLLL"
			}
		},
		"6month": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.month,
				span: 6,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.year,
				span: 1,
				format: "yyyy"
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.month,
				span: 6,
				pattern: "LLLL"
			}
		},
		"1year": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.year,
				span: 1,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.year,
				span: 10,
				format: "yyyy"
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.year,
				span: 1,
				pattern: "LLLL"
			}
		},
		"2year": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.year,
				span: 2,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.year,
				span: 10,
				format: "yyyy"
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.year,
				span: 2,
				pattern: "LLLL"
			}
		},
		"5year": {
			innerInterval: {
				unit: sap.gantt.config.TimeUnit.year,
				span: 5,
				range: 90
			},
			largeInterval: {
				unit: sap.gantt.config.TimeUnit.year,
				span: 10,
				format: "yyyy"
			},
			smallInterval: {
				unit: sap.gantt.config.TimeUnit.year,
				span: 5,
				pattern: "LLLL"
			}
		}
	};

	/**
	 * Defines the default configuration for the time axis.
	 *
	 * Default values are:
	 * <ul>
	 * 		<li>planHorizon - <code>sap.gantt.config.DEFAULT_PLAN_HORIZON</code></li>
	 * 		<li>initHorizon - <code>sap.gantt.config.DEFAULT_INIT_HORIZON</code></li>
	 * 		<li>zoomStrategy - <code>sap.gantt.config.DEFAULT_TIME_ZOOM_STRATEGY</code></li>
	 * 		<li>finestGranularity - "15min"</li>
	 * 		<li>coarsestGranularity - "6month"</li>
	 * 		<li>rate> - 1</li>
	 * </ul>
	 * @public
	 * @deprecated Since version 1.63. Using these constants may result in errors in your application.
	 * Use <code> new AxisTimeStrategyBase() </code> instead.
	 */
	var DEFAULT_TIME_AXIS;
	Object.defineProperty(sap.gantt.config, "DEFAULT_TIME_AXIS", {
		get: function() {
			if (DEFAULT_TIME_AXIS) {
				return DEFAULT_TIME_AXIS;
			}
			DEFAULT_TIME_AXIS = new sap.gantt.axistime.AxisTimeStrategyBase();
			return DEFAULT_TIME_AXIS;
		},
		set: function(newValue) { DEFAULT_TIME_AXIS = newValue; }
	});

	/**
	 * Defines the default mode key.
	 *
	 * The default mode key is used in Gantt and the default mode configuration is used when no mode configuration is provided.
	 * @public
	 * @type {string}
	 */
	sap.gantt.config.DEFAULT_MODE_KEY = "sap_mode";

	/**
	 * Defines the default configuration mode.
	 *
	 * Default values are:
	 * <ul>
	 * 		<li>key - <code>sap.gantt.config.DEFAULT_MODE_KEY</code></li>
	 * 		<li>text - "Default"</li>
	 * 		<li>icon - <code>"sap-icon://status-positive"</code></li>
	 * </ul>
	 * @public
	 * @type {object}
	 * @deprecated Since version 1.63. Using these constants may result in errors in your application.
	 */
	sap.gantt.config.DEFAULT_MODE = new sap.gantt.config.Mode({
		key: sap.gantt.config.DEFAULT_MODE_KEY,
		text: this._oRb.getText("TLTP_DEFAULT"),
		icon: "sap-icon://status-positive"
	});

	/**
	 * Defines the default list of configuration modes.
	 *
	 * Default value:  <code>sap.gantt.config.DEFAULT_MODE</code>.
	 * @public
	 * @type {array}
	 */

	sap.gantt.config.DEFAULT_MODES = [sap.gantt.config.DEFAULT_MODE];

	/**
	 * Defines the default chart scheme key.
	 *
	 * The Default Chart Scheme Key is used in the default chart scheme configuration.
	 * @public
	 * @type {string}
	 */
	sap.gantt.config.DEFAULT_CHART_SCHEME_KEY = "sap_main";

	/**
	 * Defines the default configuration chart scheme.
	 *
	 * Default values:
	 * <ul>
	 * 		<li>key - <code>sap.gantt.config.DEFAULT_CHART_SCHEME_KEY</code></li>
	 * 		<li>name - "Default"</li>
	 * 		<li>rowSpan - 1</li>
	 * 		<li>icon - null</li>
	 * 		<li>modeKey - <code>sap.gantt.config.DEFAULT_MODE_KEY</code></li>
	 * 		<li>shapeKeys - []</li>
	 * </ul>
	 * @public
	 * @type {object}
	 * @deprecated Since version 1.63. Using these constants may result in errors in your application.
	 */
	sap.gantt.config.DEFAULT_CHART_SCHEME = new sap.gantt.config.ChartScheme({
		key: sap.gantt.config.DEFAULT_CHART_SCHEME_KEY,
		name: "Default",
		rowSpan: 1
	});

	/**
	 * Defines the default list of chart schemes.
	 *
	 * Default values is <code>sap.gantt.config.DEFAULT_CHART_SCHEME</code>
	 * @public
	 * @type {array}
	 */
	sap.gantt.config.DEFAULT_CHART_SCHEMES = [sap.gantt.config.DEFAULT_CHART_SCHEME];

	/**
	 * Defines the default object type key.
	 *
	 * Default object type key is used in the default object type configuration.
	 * @public
	 * @type {string}
	 */
	sap.gantt.config.DEFAULT_OBJECT_TYPE_KEY = "sap_object";

	/**
	 * Defines the default configuration object type.
	 *
	 * Default values:
	 * <ul>
	 * 		<li>key - <code>sap.gantt.config.DEFAULT_OBJECT_TYPE_KEY</code></li>
	 * 		<li>description - "Default"</li>
	 * 		<li>mainChartSchemeKey - <code>sap.gantt.config.DEFAULT_CHART_SCHEME_KEY</code></li>
	 * 		<li>expandedChartSchemeKeys - []</li>
	 * </ul>
	 * @public
	 * @type {object}
	 * @deprecated Since version 1.63. Using these constants may result in errors in your application.
	 */
	sap.gantt.config.DEFAULT_OBJECT_TYPE = new sap.gantt.config.ObjectType({
		key: sap.gantt.config.DEFAULT_OBJECT_TYPE_KEY,
		description: "Default",
		mainChartSchemeKey: sap.gantt.config.DEFAULT_CHART_SCHEME_KEY
	});

	/**
	 * Defines the default list of object types.
	 *
	 * The default value is <code>sap.gantt.config.DEFAULT_OBJECT_TYPE</code>.
	 * @public
	 * @type {array}
	 */
	sap.gantt.config.DEFAULT_OBJECT_TYPES = [sap.gantt.config.DEFAULT_OBJECT_TYPE];

	/**
	 * Defines the default setting item key for the present time indicator.
	 *
	 * Default setting item key for the present time indicator is used in the default settings group configuration.
	 * @public
	 * @type {string}
	 */
	sap.gantt.config.SETTING_ITEM_ENABLE_NOW_LINE_KEY = "sap_enableNowLine";

	/**
	 * Defines the default configuration object for enabling the present time indicator setting item.
	 * Default values:
	 * <ul>
	 * 		<li>key - <code>sap.gantt.config.SETTING_ITEM_ENABLE_NOW_LINE_KEY</code></li>
	 * 		<li>checked - true</li>
	 * 		<li>displayText - "Indicate Current Time"</li>
	 * 		<li>tooltip - "Draw a Vertical Line to Indicate the Current Time"</li>
	 * </ul>
	 * @public
	 * @type {object}
	 * @deprecated Since version 1.63. Using these constants may result in errors in your application.
	 */
	sap.gantt.config.SETTING_ITEM_ENABLE_NOW_LINE = new sap.gantt.config.SettingItem({
		id: "enableNowLineSettingItem",
		key: sap.gantt.config.SETTING_ITEM_ENABLE_NOW_LINE_KEY,
		checked: true,
		_isStandard: true,
		displayText: this._oRb.getText("XCKL_NOW_LINE"),
		tooltip: this._oRb.getText("TLTP_NOW_LINE")
	});

	/**
	 * Defines the default setting item key for status bar.
	 *
	 * The default setting item key for status bar is used in the default settings of group configuration.
	 * @public
	 * @type {string}
	 * @since 1.88
	 */
	sap.gantt.config.SETTING_ITEM_ENABLE_STATUS_BAR_KEY = "sap_enableStatusBar";

	/**
	 * Defines the default configuration object for enabling the satus bar.
	 * @public
	 * @type {object}
	 * @since 1.88
	 */
	sap.gantt.config.SETTING_ITEM_ENABLE_STATUS_BAR = new sap.gantt.config.SettingItem({
		id: "enableStatusBarSettingItem",
		key: sap.gantt.config.SETTING_ITEM_ENABLE_STATUS_BAR_KEY,
		checked: false,
		_isStandard: true,
		displayText: this._oRb.getText("XCKL_STATUS_BAR"),
		tooltip: this._oRb.getText("XCKL_STATUS_BAR")
	});


	/**
	 * Defines the default setting item key for the cursor line.
	 *
	 * Default setting item key for the cursor line is used in the default settings group configuration.
	 * @public
	 * @type {string}
	 */
	sap.gantt.config.SETTING_ITEM_ENABLE_CURSOR_LINE_KEY = "sap_enableCursorLine";

	/**
	 * Defines the default configuration object for enabling the cursor line setting items.
	 * Default values:
	 * <ul>
	 * 		<li>key - <code>sap.gantt.config.SETTING_ITEM_ENABLE_CURSOR_LINE_KEY</code></li>
	 * 		<li>checked - true</li>
	 * 		<li>displayText - "Show Cursor Line"</li>
	 * 		<li>tooltip - "Show a Vertical Line that Follows the Mouse Pointer"</li>
	 * </ul>
	 * @public
	 * @type {object}
	 * @deprecated Since version 1.63. Using these constants may result in errors in your application.
	 */
	sap.gantt.config.SETTING_ITEM_ENABLE_CURSOR_LINE = new sap.gantt.config.SettingItem({
		id: "enableCurserLineSettingItem",
		key: sap.gantt.config.SETTING_ITEM_ENABLE_CURSOR_LINE_KEY,
		checked: true,
		_isStandard: true,
		displayText: this._oRb.getText("XCKL_CURSOR_LINE"),
		tooltip: this._oRb.getText("TLTP_CURSOR_LINE")
	});

	/**
	 * Defines the default setting item key for the vertical lines.
	 *
	 * Default setting item key for vertical lines is used in the default settings group configuration.
	 * @public
	 * @type {string}
	 */
	sap.gantt.config.SETTING_ITEM_ENABLE_VERTICAL_LINE_KEY = "sap_enableVerticalLine";

	/**
	 * Defines the default setting item key for the adhoc lines.
	 *
	 * The default setting item key for adhoc lines is used in the default settings group configuration.
	 * @public
	 * @type {string}
	 */
	sap.gantt.config.SETTING_ITEM_ENABLE_ADHOC_LINE_KEY = "sap_enableAdhocLine";

	/**
		 * Defines the default setting of the item key for delta lines.
		 *
		 * The default setting of the item key for delta lines is used in the default settings of group configuration.
		 * @public
		 * @type {string}
		 */
		sap.gantt.config.SETTING_ITEM_ENABLE_DELTA_LINE_KEY = "sap_enableDeltaLine";

	/**
	 * Defines the default setting of the item key for calendar defs.
	 *
	 * The default setting of the item key for calendar defs is used in the default settings of group configuration.
	 * @public
	 * @type {string}
	 */
	sap.gantt.config.SETTING_ITEM_ENABLE_NON_WORKING_TIME_KEY = "sap_enableNonWorkingTime";

	/**
	 * Defines the default configuration object for enabling vertical line setting item.
	 * Default values:
	 * <ul>
	 * 		<li>key - <code>sap.gantt.config.SETTING_ITEM_ENABLE_VERTICAL_LINE_KEY</code></li>
	 * 		<li>checked - true</li>
	 * 		<li>displayText - "Show Divider Lines"</li>
	 * 		<li>tooltip - "Show Vertical Divider Lines between Time Periods"</li>
	 * </ul>
	 * @public
	 * @type {object}
	 * @deprecated Since version 1.63. Using these constants may result in errors in your application.
	 */
	sap.gantt.config.SETTING_ITEM_ENABLE_VERTICAL_LINE = new sap.gantt.config.SettingItem({
		id: "enableVerticalLineSettingItem",
		key: sap.gantt.config.SETTING_ITEM_ENABLE_VERTICAL_LINE_KEY,
		checked: true,
		_isStandard: true,
		displayText: this._oRb.getText("XCKL_VERTICAL_LINE"),
		tooltip: this._oRb.getText("TLTP_VERTICAL_LINE")
	});

	/**
	 * Defines the default configuration object for enabling the adhoc line setting item.
	 * Default values:
	 * <ul>
	 * 		<li>key - <code>sap.gantt.config.SETTING_ITEM_ENABLE_ADHOC_LINE_KEY</code></li>
	 * 		<li>checked - true</li>
	 * 		<li>displayText - "Show Adhoc Lines"</li>
	 * 		<li>tooltip - "Show Adhoc Lines"</li>
	 * </ul>
	 * @public
	 * @type {object}
	 * @deprecated Since version 1.63. Using these constants may result in errors in your application.
	 */
	sap.gantt.config.SETTING_ITEM_ENABLE_ADHOC_LINE = new sap.gantt.config.SettingItem({
		id: "enableAdhocLineSettingItem",
		key: sap.gantt.config.SETTING_ITEM_ENABLE_ADHOC_LINE_KEY,
		checked: true,
		_isStandard: true,
		displayText: this._oRb.getText("XCKL_ADHOC_LINE"),
		tooltip: this._oRb.getText("TLTP_ADHOC_LINE")
	});

	/**
		 * Defines the default configuration object for enabling the delta line setting item.
		 * @public
		 * @type {object}
		 */
		sap.gantt.config.SETTING_ITEM_ENABLE_DELTA_LINE = new sap.gantt.config.SettingItem(
			{
				id: "enableDeltaLineSettingItem",
				key: sap.gantt.config.SETTING_ITEM_ENABLE_DELTA_LINE_KEY,
				checked: true,
				_isStandard: true,
				displayText: this._oRb.getText("XCKL_DELTA_LINE"),
				tooltip: this._oRb.getText("TLTP_DELTA_LINE")
			}
		);

	/**
	 * Defines the default configuration object for enabling the Calendar Defs setting item.
	 * @public
	 * @type {object}
	 */
	sap.gantt.config.SETTING_ITEM_ENABLE_NON_WORKING_TIME = new sap.gantt.config.SettingItem(
		{
			id: "enableNonWorkingTimeSettingItem",
			key: sap.gantt.config.SETTING_ITEM_ENABLE_NON_WORKING_TIME_KEY,
			checked: true,
			_isStandard: true,
			displayText: this._oRb.getText("XCKL_NON_WORKING_TIME"),
			tooltip: this._oRb.getText("XCKL_NON_WORKING_TIME")
		}
	);

	/**
	 * Defines the default setting item key for synchronized time scroll.
	 *
	 * Default setting item key for synchronized time scroll is used in the default settings group configuration.
	 * @public
	 * @type {string}
	 */
	sap.gantt.config.SETTING_ITEM_ENABLE_TIME_SCROLL_SYNC_KEY = "sap_enableTimeScrollSync";

	/**
	 * Defines the default configuration object for enabling the synchronized time scroll setting item.
	 * Default values are:
	 * <ul>
	 * 		<li>key - <code>sap.gantt.config.SETTING_ITEM_ENABLE_TIME_SCROLL_SYNC_KEY</code></li>
	 * 		<li>checked - true</li>
	 * 		<li>displayText - "Synchronize Time Scroll"</li>
	 * 		<li>tooltip - "Synchronize Horizontal Scroll Bars in Chart"</li>
	 * </ul>
	 * @public
	 * @type {object}
	 * @deprecated Since version 1.63. Using these constants may result in errors in your application.
	 */
	sap.gantt.config.SETTING_ITEM_ENABLE_TIME_SCROLL_SYNC = new sap.gantt.config.SettingItem({
		id: "enableTimeScrollSyncSettingItem",
		key: sap.gantt.config.SETTING_ITEM_ENABLE_TIME_SCROLL_SYNC_KEY,
		checked: true,
		_isStandard: true,
		displayText: this._oRb.getText("XCKL_TIME_SCROLL_SYNC"),
		tooltip: this._oRb.getText("TLTP_TIME_SCROLL_SYNC")
	});

	/**
	 * Defines the default configuration object for setting groups in the toolbar.
	 *
	 * Default values:
	 * <ul>
	 * 		<li><code>sap.gantt.config.SETTING_ITEM_ENABLE_NOW_LINE</code></li>
	 * 		<li><code>sap.gantt.config.SETTING_ITEM_ENABLE_CURSOR_LINE</code></li>
	 * 		<li><code>sap.gantt.config.SETTING_ITEM_ENABLE_VERTICAL_LINE</code></li>
	 * 		<li><code>sap.gantt.config.SETTING_ITEM_ENABLE_TIME_SCROLL_SYNC</code></li>
	 * </ul>
	 * @public
	 * @type {array}
	 */
	sap.gantt.config.DEFAULT_TOOLBAR_SETTING_ITEMS = [
		sap.gantt.config.SETTING_ITEM_ENABLE_NOW_LINE,
		sap.gantt.config.SETTING_ITEM_ENABLE_CURSOR_LINE,
		sap.gantt.config.SETTING_ITEM_ENABLE_VERTICAL_LINE,
		sap.gantt.config.SETTING_ITEM_ENABLE_ADHOC_LINE,
		sap.gantt.config.SETTING_ITEM_ENABLE_DELTA_LINE,
		sap.gantt.config.SETTING_ITEM_ENABLE_NON_WORKING_TIME,
		sap.gantt.config.SETTING_ITEM_ENABLE_TIME_SCROLL_SYNC,
		sap.gantt.config.SETTING_ITEM_ENABLE_STATUS_BAR
	];

	/**
	 * Defines the default empty toolbar scheme key.
	 *
	 * The default empty toolbar scheme key is used in the default empty toolbar scheme.
	 * @public
	 * @type {string}
	 */
	sap.gantt.config.EMPTY_TOOLBAR_SCHEME_KEY = "sap_empty_toolbar";

	/**
	 * Defines the default empty toolbar scheme.
	 *
	 * This toolbar scheme has no built-in toolbar items. Only one toolbar group
	 * <code>customToolbarItems</code> is configured to allow applications to place custom toolbar items.
	 * Default values:
	 * <ul>
	 * 		<li>key - <code>sap.gantt.config.EMPTY_TOOLBAR_SCHEME_KEY</code></li>
	 * 		<li>customToolbarItems - <code>sap.gantt.config.ToolbarGroup({
	 * 				position: "L1",
	 * 				overflowPriority: sap.m.OverflowToolbarPriority.High
	 * 			})</code></li>
	 * </ul>
	 * @public
	 * @type {object}
	 * @deprecated Since version 1.63. Using these constants may result in errors in your application.
	 */
	sap.gantt.config.EMPTY_TOOLBAR_SCHEME = new sap.gantt.config.ToolbarScheme({
		key: sap.gantt.config.EMPTY_TOOLBAR_SCHEME_KEY,
		customToolbarItems: new sap.gantt.config.ToolbarGroup({
			position: "L1",
			overflowPriority: sap.m.OverflowToolbarPriority.High
		})
	});

	/**
	 * Defines the default toolbar scheme key for GanttContainer.
	 *
	 * The default GanttContainer toolbar scheme key is used in the default GanttContainer toolbar scheme configuration.
	 * @public
	 * @type {string}
	 */
	sap.gantt.config.DEFAULT_CONTAINER_TOOLBAR_SCHEME_KEY = "sap_container_toolbar";

	/**
	 * Defines the default configuration object for toolbar scheme on <code>sap.gantt.GanttChartContainer</code>.
	 *
	 * Default values:
	 * <ul>
	 * 		<li>key - <code>sap.gantt.config.DEFAULT_CONTAINER_TOOLBAR_SCHEME_KEY</code></li>
	 * 		<li>customToolbarItems - <code>sap.gantt.config.ToolbarGroup({
	 * 				position: "L1",
	 * 				overflowPriority: sap.m.OverflowToolbarPriority.High
	 * 			})</code></li>
	 * 		<li>timeZoom - <code>sap.gantt.config.ToolbarGroup({
	 * 				position: "R2",
	 * 				overflowPriority: sap.m.OverflowToolbarPriority.NeverOverflow
	 * 			})</code></li>
	 * 		<li>settings - <code>sap.gantt.config.ToolbarGroup({
	 * 				position: "R1",
	 * 				overflowPriority: sap.m.OverflowToolbarPriority.low,
	 * 				items: sap.gantt.config.DEFAULT_TOOLBAR_SETTING_ITEMS
	 * 			})</code></li>
	 * </ul>
	 * @public
	 * @type {object}
	 * @deprecated Since version 1.63. Using these constants may result in errors in your application.
	 */
	sap.gantt.config.DEFAULT_CONTAINER_TOOLBAR_SCHEME = new sap.gantt.config.ToolbarScheme({
		key: sap.gantt.config.DEFAULT_CONTAINER_TOOLBAR_SCHEME_KEY,
		customToolbarItems: new sap.gantt.config.ToolbarGroup({
			position: "L1",
			overflowPriority: sap.m.OverflowToolbarPriority.High
		}),
		timeZoom: new sap.gantt.config.TimeZoomGroup({
			position: "R2",
			overflowPriority: sap.m.OverflowToolbarPriority.NeverOverflow
		}),
		settings: new sap.gantt.config.SettingGroup({
			position: "R1",
			overflowPriority: sap.m.OverflowToolbarPriority.Low,
			items: sap.gantt.config.DEFAULT_TOOLBAR_SETTING_ITEMS
		})
	});

	/**
	 * Defines the default toolbar scheme key for GanttWithTable.
	 *
	 * The default GanttWithTable toolbar scheme key is used in the default GanttWithTable toolbar scheme configuration.
	 * @public
	 * @type {string}
	 */
	sap.gantt.config.DEFAULT_GANTTCHART_TOOLBAR_SCHEME_KEY = "sap_ganttchart_toolbar";

	/**
	 * Defines the default configuration object for the toolbar scheme on <code>sap.gantt.GanttChartWithTable</code>.
	 *
	 * Default values:
	 * <ul>
	 * 		<li>key - <code>sap.gantt.config.DEFAULT_GANTTCHART_TOOLBAR_SCHEME_KEY</code></li>
	 * 		<li>customToolbarItems - <code>sap.gantt.config.ToolbarGroup({
	 * 				position: "L2",
	 * 				overflowPriority: sap.m.OverflowToolbarPriority.High
	 * 			})</code></li>
	 * 		<li>expandTree - <code>sap.gantt.config.ToolbarGroup({
	 * 				position: "L3",
	 * 				overflowPriority: sap.m.OverflowToolbarPriority.Low
	 * 			})</code></li>
	 * </ul>
	 * @public
	 * @type {object}
	 * @deprecated Since version 1.63. Using these constants may result in errors in your application.
	 */
	sap.gantt.config.DEFAULT_GANTTCHART_TOOLBAR_SCHEME = new sap.gantt.config.ToolbarScheme({
		key: sap.gantt.config.DEFAULT_GANTTCHART_TOOLBAR_SCHEME_KEY,
		customToolbarItems: new sap.gantt.config.ToolbarGroup({
			position: "L2",
			overflowPriority: sap.m.OverflowToolbarPriority.High
		}),
		expandTree: new sap.gantt.config.ToolbarGroup({
			position: "L3",
			overflowPriority: sap.m.OverflowToolbarPriority.Low
		})
	});

	/**
	 * Defines the default list of toolbar schemes for <code>sap.gantt.GanttChartBase</code>.
	 *
	 * The default values include an empty toolbar and a default Gantt Chart toolbar.
	 * @public
	 * @type {array}
	 */
	sap.gantt.config.DEFAULT_GANTTCHART_TOOLBAR_SCHEMES = [
		sap.gantt.config.DEFAULT_GANTTCHART_TOOLBAR_SCHEME,
		sap.gantt.config.EMPTY_TOOLBAR_SCHEME
	];

	/**
	 * Define default list of toolbar schemes for <code>sap.gantt.GanttChartContainer</code>.
	 *
	 * The default values include an empty toolbar and a default Gantt Chart Container toolbar.
	 * @public
	 * @type {array}
	 */
	sap.gantt.config.DEFAULT_CONTAINER_TOOLBAR_SCHEMES = [
		sap.gantt.config.DEFAULT_CONTAINER_TOOLBAR_SCHEME,
		sap.gantt.config.EMPTY_TOOLBAR_SCHEME
	];

	/**
	 * Defines the default hierarchy key.
	 *
	 * The default hierarchy key is used in the default hierarchy configuration.
	 * @public
	 * @type {string}
	 */
	sap.gantt.config.DEFAULT_HIERARCHY_KEY = "sap_hierarchy";

	/**
	 * Defines the default configuration object for Hierarchy.
	 *
	 * Default values:
	 * <ul>
	 * 		<li>key - <code>sap.gantt.config.DEFAULT_HIERARCHY_KEY</code></li>
	 * 		<li>text - "Default Hierarchy"</li>
	 * 		<li>activeModeKey - <code>sap.gantt.config.DEFAULT_MODE_KEY</code></li>
	 * 		<li>toolbarSchemeKey - <code>sap.gantt.config.DEFAULT_GANTTCHART_TOOLBAR_SCHEME_KEY</code></li>
	 * 		<li>columns - null</li>
	 * 		<li>expandedLevels - null</li>
	 * </ul>
	 * @public
	 * @type {object}
	 * @deprecated Since version 1.63. Using these constants may result in errors in your application.
	 */
	sap.gantt.config.DEFAULT_HIERARCHY = new sap.gantt.config.Hierarchy();

	/**
	 * Defines the default list of hierarchies.
	 *
	 * The default value is <code>sap.gantt.config.DEFAULT_HIERARCHY</code>
	 * @public
	 * @type {array}
	 */
	sap.gantt.config.DEFAULT_HIERARCHYS = [sap.gantt.config.DEFAULT_HIERARCHY];

	/**
	 * Defines the default Gantt single layout key.
	 *
	 * The default Gantt single layout key is used in the default Gantt single layout configuration.
	 * @public
	 * @type {string}
	 */
	sap.gantt.config.DEFAULT_CONTAINER_SINGLE_LAYOUT_KEY = "sap_container_layout_single";

	/**
	 * Defines the default configuration object for the Single Container layout.
	 *
	 * Default values:
	 * <ul>
	 * 		<li>key - <code>sap.gantt.config.DEFAULT_CONTAINER_SINGLE_LAYOUT_KEY</code></li>
	 * 		<li>text - "Single Gantt Chart Layout"</li>
	 * 		<li>toolbarSchemeKey - <code>sap.gantt.config.DEFAULT_CONTAINER_TOOLBAR_SCHEME_KEY</code></li>
	 * 		<li>ganttChartLayouts - <code>[new sap.gantt.config.GanttChartLayout({
	 * 			activeModeKey: sap.gantt.config.DEFAULT_MODE_KEY,
				hierarchyKey: sap.gantt.config.DEFAULT_HIERARCHY_KEY
	 * 		})]</code></li>
	 * </ul>
	 * @public
	 * @deprecated Since version 1.63. Using these constants may result in errors in your application.
	 * @type {object}
	 */
	sap.gantt.config.DEFAULT_CONTAINER_SINGLE_LAYOUT = new sap.gantt.config.ContainerLayout({
		key: sap.gantt.config.DEFAULT_CONTAINER_SINGLE_LAYOUT_KEY,
		text: this._oRb.getText("XLST_SINGLE_LAYOUT"),
		toolbarSchemeKey: sap.gantt.config.DEFAULT_CONTAINER_TOOLBAR_SCHEME_KEY,
		ganttChartLayouts: [new sap.gantt.config.GanttChartLayout({
			activeModeKey: sap.gantt.config.DEFAULT_MODE_KEY,
			hierarchyKey: sap.gantt.config.DEFAULT_HIERARCHY_KEY
		})]
	});

	/**
	 * Defines the default Gantt dual-view layout key.
	 *
	 * The default Gantt dual-view layout key is used in the default Gantt dual layout configuration.
	 * @public
	 * @type {string}
	 */
	sap.gantt.config.DEFAULT_CONTAINER_DUAL_LAYOUT_KEY = "sap_container_layout_dual";

	/**
	 * Defines the default configuration object for Dual Container layout.
	 *
	 * Default values:
	 * <ul>
	 * 		<li>key - <code>sap.gantt.config.DEFAULT_CONTAINER_DUAL_LAYOUT_KEY</code></li>
	 * 		<li>text - "Dual Gantt Chart Layout"</li>
	 * 		<li>toolbarSchemeKey - <code>sap.gantt.config.DEFAULT_CONTAINER_TOOLBAR_SCHEME_KEY</code></li>
	 * 		<li>ganttChartLayouts - <code>[new sap.gantt.config.GanttChartLayout({
	 * 			activeModeKey: sap.gantt.config.DEFAULT_MODE_KEY,
	 *			hierarchyKey: sap.gantt.config.DEFAULT_HIERARCHY_KEY
	 * 		}), new sap.gantt.config.GanttChartLayout({
	 * 			activeModeKey: sap.gantt.config.DEFAULT_MODE_KEY,
	 *			hierarchyKey: sap.gantt.config.DEFAULT_HIERARCHY_KEY
	 * 		})]</code></li>
	 * </ul>
	 * @public
	 * @type {object}
	 * @deprecated Since version 1.63. Using these constants may result in errors in your application.
	 */
	sap.gantt.config.DEFAULT_CONTAINER_DUAL_LAYOUT = new sap.gantt.config.ContainerLayout({
		key: sap.gantt.config.DEFAULT_CONTAINER_DUAL_LAYOUT_KEY,
		text: this._oRb.getText("XLST_DUAL_LAYOUT"),
		toolbarSchemeKey: sap.gantt.config.DEFAULT_CONTAINER_TOOLBAR_SCHEME_KEY,
		ganttChartLayouts: [new sap.gantt.config.GanttChartLayout({
			activeModeKey: sap.gantt.config.DEFAULT_MODE_KEY,
			hierarchyKey: sap.gantt.config.DEFAULT_HIERARCHY_KEY
		}), new sap.gantt.config.GanttChartLayout({
			activeModeKey: sap.gantt.config.DEFAULT_MODE_KEY,
			hierarchyKey: sap.gantt.config.DEFAULT_HIERARCHY_KEY
		})]
	});

	/**
	 * Defines the default list of Container layouts.
	 *
	 * Default values are a single-view layout and a dual-view layout.
	 * @public
	 * @type {array}
	 */
	sap.gantt.config.DEFAULT_CONTAINER_LAYOUTS = [
		sap.gantt.config.DEFAULT_CONTAINER_SINGLE_LAYOUT,
		sap.gantt.config.DEFAULT_CONTAINER_DUAL_LAYOUT
	];

	/**
	 * Defines the default configuration object Locale.
	 *
	 * Default values
	 * <ul>
	 * 		<li>timeZoine - <code>"CET"</code></li>
	 * 		<li>utcdiff - <code>"000000"</code></li>
	 * 		<li>utcsign - <code>"+"</code></li>
	 * </ul>
	 * @public
	 * @type {object}
	 * @deprecated Since version 1.63. Using these constants may result in errors in your application.
	 */
	sap.gantt.config.DEFAULT_LOCALE_CET = new sap.gantt.config.Locale({
		timeZone: "CET",
		utcdiff: "000000",
		utcsign: "+"
	});

	/**
	 * Defines the default empty JSON object.
	 * @public
	 * @type {object}
	 */
	sap.gantt.config.DEFAULT_EMPTY_OBJECT = {};

	sap.gantt.DIMENSION_LEGEND_NIL = "NIL";

	/**
	 * Different zoom type for mouse wheel zooming
	 *
	 * @enum {string}
	 * @public
	 */
	sap.gantt.MouseWheelZoomType = {

		/**
		 * The granularity is the unit time range of innerInterval under current zoom level
		 * @public
		 */
		FineGranular : "FineGranular",

		/**
		 * The granularity is a whole zoom level, just like the global zoom slider does
		 * @public
		 */
		Stepwise : "Stepwise",

		/**
		 * Do not support mouse wheel zooming
		 * @public
		 */
		None : "None"
	};

	/**
	 * A hybrid data type that can represent an array of string, or array of object.
	 * The result value parsed by this data type are "string[]" or "object[]"
	 *
	 * Examples of valid values in js:
	 * <ol>
	 *   <li>["order", "activity"]</li>
	 *   <li>[{name:"order", idName:"OrderNo"},{name:"activity"}]</li>
	 *   <li>[{name:"order", idName:"OrderNo"},"activity"]</li>
	 * </ol>
	 *
	 * Examples of valid values in xml view:
	 * <ol>
	 *   <li>"order,activity"</li>
	 *   <li>"[order,activity]"</li>
	 *   <li>[{"name":"order", "idName":"OrderNo"},{"name":"activity"}]</li>
	 * </ol>
	 *
	 * @final
	 * @namespace
	 * @public
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.gantt.GenericArray = DataType.createType('sap.gantt.GenericArray', {
		isValid : function(vValue) {
			if (typeof vValue === "string" || vValue instanceof String) {
				return true;
			}
			if (Array.isArray(vValue)) {
				for (var i = 0; i < vValue.length; i++) {
					if (!(typeof vValue[i] === "string" || vValue[i] instanceof String || typeof vValue[i] === "object")) {
						return false;
					}
				}
				return true;
			}
			return false;
		},
		parseValue : function (sValue) {
			if (sValue) {
				if (Array.isArray(sValue)) {
					return sValue;
				} else if (typeof sValue === "string") {
					var aValues;

					//for valid example #5, #6, need to replace ' with ", because of JSON.parse
					if (sValue.indexOf("[") > -1 && sValue.indexOf("{") > -1) {
						sValue = sValue.replace(/\'/g,"\"");
						aValues = JSON.parse(sValue);
					} else {
						// for valid expample #3-#4, need to get the content between the '[]'
						if (sValue.indexOf("[") > -1) {
							var regex = /^\[(.*)\]$/g;
							var matches = regex.exec(sValue);
							if (matches) {
								sValue = matches[1];
							}
						}
						// for valid example #1-#4, just split by the ','
						aValues = sValue.split(",");
						for (var i = 0; i < aValues.length; i++) {
							//for valid example #2, #4, need to remove the blank space
							aValues[i] = aValues[i].trim();
						}
					}
					return aValues;
				}
			}
			return sValue;
		}
	}, DataType.getType("any"));

	/**
	 * Defines how Gantt Chart aligns a draggable shape to the mouse pointer before dragging.
	 *
	 * @enum {string}
	 * @public
	 */
	sap.gantt.dragdrop.GhostAlignment = {
		/**
		 * When you click on a shape to start a drag-and-drop operation, the upper-left corner
		 * of the shape is automatically moved to the mouse pointer before you start dragging.
		 * This option makes the start time of the shape align with the cursor line through
		 * the whole drag-and-drop process, and thus you can precisely determine the start
		 * time when you drop the shape.
		 * @public
		 */
		Start: "Start",

		/**
		 * Default drag-and-drop behavior. When you click on a shape to start a drag-and-drop
		 * operation, Gantt Chart does not move the shape before you start dragging. This option
		 * keeps the relative position between the shape and the mouse pointer intact through
		 * the whole drag-and-drop process.
		 * @public
		 */
		None: "None",

		/**
		 * When you click on a shape to start a drag-and-drop operation, the upper-right corner
		 * of the shape is automatically moved to the mouse pointer before you start dragging.
		 * This option makes the end time of the shape align with the cursor line through the
		 * whole drag-and-drop process, and thus you can precisely determine the end time when
		 * you drop the shape.
		 * @public
		 */
		End: "End"
	};

	/**
	 * Gantt chart display types.
	 *
	 * @enum {string}
	 * @public
	 */
	sap.gantt.simple.GanttChartWithTableDisplayType = {
		/**
		 * The {@link sap.gantt.simple.GanttChartWithTable} control displays both a table and a chart.
		 * @public
		 */
		Both: "Both",

		/**
		 * The {@link sap.gantt.simple.GanttChartWithTable} control displays only a chart.
		 * @public
		 */
		Chart: "Chart",

		/**
		 * The {@link sap.gantt.simple.GanttChartWithTable} control displays only a table.
		 * @public
		 */
		Table: "Table"
	};

	/**
	 * Toolbar placeholders for a Gantt chart container.
	 *
	 * @enum {string}
	 * @public
	 */
	sap.gantt.simple.ContainerToolbarPlaceholderType = {

		/**
		 * A Variant Management button.
		 * @public
		 */
		VariantManagement: "VariantManagement",
		/**
		/**
		 * A bird eye toolbar button.
		 * @public
		 */
		BirdEyeButton: "BirdEyeButton",

		/**
		 * A display type toolbar button.
		 * @public
		 */
		DisplayTypeButton: "DisplayTypeButton",

		/**
		 * A legend toolbar button.
		 * @public
		 */
		LegendButton: "LegendButton",

		/**
		 * Settings toolbar button.
		 * @public
		 */
		SettingButton: "SettingButton",

		/**
		 * A toolbar spacer that can be used between buttons.
		 * @public
		 */
		Spacer: "Spacer",

		/**
		 * A time zoom control.
		 * @public
		 */
		TimeZoomControl: "TimeZoomControl"
	};

	/**
	 * Defines how dragged ghost moves when dragging.
	 *
	 * @enum {string}
	 * @public
	 */
	sap.gantt.DragOrientation = {
		/**
		 * When you click on a shape to start a drag-and-drop operation, the dragged shape's ghost
		 * can only move in horizontal direction when dragging, which means, the axis y will not change.
		 * @public
		 */
		Horizontal: "Horizontal",

		/**
		 * When you click on a shape to start a drag-and-drop operation, the dragged shape's ghost
		 * can only move in vertical direction when dragging, which means, the axis x will not change. When
		 * drag in vertical direction, the ghost alignment will not work, and only one shape can be dragged.
		 * @public
		 */
		Vertical: "Vertical",

		/**
		 * When you click on a shape to start a drag-and-drop operation, the dragged shape's ghost
		 * can move in both horizontal and verital directions, which means, both axis x and y may
		 * change at the same time.
		 * @public
		 */
		Free: "Free"
	};

	/**
	 * This type specifies the reason why visible horizon is changing.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.68
	 */
	sap.gantt.simple.VisibleHorizonUpdateType = {
		/**
		 * The visible horizon is updated when a user scrolls using the Gantt chart horizontal scroll bar.
		 */
		HorizontalScroll: "HorizontalScroll",

		/**
		 * The visible horizon is updated when Gantt chart gets rendered (which is triggered by an <code>onAfterRenderer</code> event)
		 * and needs to set visible horizon based on the chart configuration.
		 */
		InitialRender: "InitialRender",

		/**
		 * The update is triggered by the user scrolling horizontally with a mouse wheel (Ctrl + Shift + mouse wheel).
		 */
		MouseWheelZoom: "MouseWheelZoom",

		/**
		 * The update is triggered by the {@link sap.gantt.simple.GanttChartContainer}. This update is used to keep all Gantt charts in one
		 * container in sync. When the user performs an action that changes the visible horizon, an event with the action type is
		 * fired on the original Gantt chart and <code>SyncVisibleHorizon</code> gets fired on all other Gantt charts in
		 * the container.
		 */
		SyncVisibleHorizon: "SyncVisibleHorizon",

		/**
		 * An update happens when the user selects a time period using the Z key + mouse.
		 */
		TimePeriodZooming: "TimePeriodZooming",

		/**
		 * The visible horizon is updated when the total horizon of a Gantt chart changes or is set. Changes in total horizon may affect the
		 * visible horizon as well.
		 */
		TotalHorizonUpdated: "TotalHorizonUpdated",

		/**
		 * The visible horizon is updated when the zoom level is changed, either by the user or the application.
		 */
		ZoomLevelChanged: "ZoomLevelChanged"
	};

	/**
	 * Different data types for Gantt Chart Table Export.
	 *
	 * @enum {string}
	 * @namespace
	 * @name sap.gantt.simple.exportTableCustomDataType
	 * @public
	 * @since 1.83
	 */
	sap.gantt.simple.exportTableCustomDataType = {

		/**
		 * Property of type Numeric.
		 * @public
		 */
		Numeric : "numeric",

		/**
		 * Property of type DateTime.
		 * @public
		 */
		DateTime : "dateTime",

		/**
		 * Property of type StringDate.
		 * @public
		 */
		StringDate : "stringDate",

		/**
		 * Property of type Date.
		 * @public
		 */
		Date : "date",
		/**
		 * Property of type Time.
		 * @public
		 */
		Time : "time",

		/**
		 * Property of type Boolean.
		 * @public
		 */
		Boolean : "boolean",

		/**
		* Property of type String.
		 * @public
		 */
		String : "string",

		/**
		* Property of type Currency.
		 * @public
		 */
		Currency : "currency"
	};

	/**
	 * Configuration options for horizontal alignment of title of the shape representing a Task.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.81
	 */
	sap.gantt.simple.horizontalTextAlignment = {
		/**
		 * Shape title is aligned at the start of the x-axis.
		 *  @public
		 */
		Start: "Start",
		/**
		 * Shape title is aligned at the end of the x-axis.
		 *  @public
		 */
		End: "End",
		/**
		 * Shape title is aligned at the center of the x-axis.
		 *  @public
		 */
		Middle: "Middle",
		/**
		 * Shape title is repeated throughout the shape.
		 *  @public
		 */
		Ribbon: "Ribbon"
	};

	/**
	 * Configuration options for vertical alignment of title of the shape representing a Task.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.81
	 */
	sap.gantt.simple.verticalTextAlignment = {
	/**
		 * Shape title is aligned at the top of the shape.
		 *  @public
		 */
		Top: "Top",
		/**
		 * Shape title is aligned at the bottom of the shape.
		 *  @public
		 */
		Bottom: "Bottom",
		/**
		 * Shape title is aligned at the center of the shape.
		 *  @public
		 */
		Center: "Center"
	};

	sap.gantt.simple.MarkerType = MarkerType;
	sap.gantt.simple.LegendShapeGroupOrientation = LegendShapeGroupOrientation;

	return sap.gantt;

});
