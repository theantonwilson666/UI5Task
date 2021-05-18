/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"sap/base/strings/capitalize",
	"sap/ui/core/Control",
	"sap/gantt/library",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/layout/Splitter",
	"sap/ui/layout/SplitterLayoutData",
	"sap/ui/core/library",
	"../control/AssociateContainer",
	"../config/TimeHorizon",
	"sap/ui/fl/write/api/ControlPersonalizationWriteAPI",
	"sap/m/FlexBox",
	"sap/m/Text",
	"./GanttChartContainerRenderer"
],
	function (
		capitalize,
		Control,
		library,
		ManagedObjectObserver,
		Splitter,
		SplitterLayoutData,
		coreLibrary,
		AssociateContainer,
		TimeHorizon,
		ControlPersonalizationWriteAPI,
		FlexBox,
		Text
	) {
	"use strict";

	var GanttChartWithTableDisplayType = library.simple.GanttChartWithTableDisplayType;
	var Orientation = coreLibrary.Orientation;

	/**
	 * Creates and initializes a new Gantt chart container.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A container that holds one or more <code>sap.gantt.simple.GanttChartWithTable</code> instances.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.88.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.gantt.simple.GanttChartContainer
	 */
	var GanttChartContainer = Control.extend("sap.gantt.simple.GanttChartContainer",  /** @lends sap.gantt.simple.GanttChartContainer.prototype */{
		metadata: {
			library: "sap.gantt",
			properties: {

				/**
				 * height of the container.
				 *
				 * Note that when a percentage is given, for the height to work as expected, the height of the surrounding container must be defined.
				 */
				height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'},

				/**
				 * width of the container.
				 *
				 * Note that when a percentage is given, for the width to work as expected, the width of the surrounding container must be defined.
				 */
				width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'},

				/**
				 * The GanttChartContainer use Splitter to manager the layout, it can have horizontal or vertical orientation.
				 * <b>Note:</b> the property only take effect if GanttChartContainer has more than 1 ganttChart instances
				 */
				layoutOrientation: {type : "sap.ui.core.Orientation", group : "Behavior", defaultValue : sap.ui.core.Orientation.Vertical},

				/**
				 * Flag to enable and disable scroll synchronization by time on instances of aggregation <code>ganttCharts</code>.
				 */
				enableTimeScrollSync: {type: "boolean", defaultValue: true},

				/**
				 * Flag to enable and disable the cursor line that follows the cursor.
				 *
				 * When this value is set, it overrides the corresponding value on instances of aggregation <code>ganttCharts</code>.
				 */
				enableCursorLine: {type: "boolean", defaultValue: true},

				/**
				 * Flag to enable and disable the present time indicator.
				 *
				 * When this value is set, it overrides the corresponding value on instances of aggregation <code>ganttCharts</code>.
				 */
				enableNowLine: {type: "boolean", defaultValue: true},

				/**
				 * Flag to enable and disable vertical lines representing intervals along the time axis.
				 *
				 * When this value is set, it overrides the corresponding value on instances of aggregation <code>ganttCharts</code>.
				 */
				enableVerticalLine: {type: "boolean", defaultValue: true},

				/**
				 * Flag to enable and disable adhoc lines representing milestones and events along the time axis.
				 *
				 * When this value is set, it overrides the corresponding value on instances of aggregation <code>ganttCharts</code>.
				 */
				enableAdhocLine: {type: "boolean", defaultValue: true},

				/**
				* Flag to enable and disable delta lines
				*
				* When this value is set, it overrides the corresponding value on instances of aggregation <code>ganttCharts</code>.
				* @since 1.84
				*/
				enableDeltaLine: { type: "boolean", defaultValue: true },

				/**
				* Flag to enable and disable non-working time
				*
				* When this value is set, it overrides the corresponding value on instances of aggregation <code>ganttCharts</code>.
				* @since 1.86
				*/
				enableNonWorkingTime: { type: "boolean", defaultValue: true },

				/**
				 * Defines how the Gantt chart is displayed.
				 * <ul>
				 * <li>If set to <code>Both</code>, both the table and the chart are displayed.</li>
				 * <li>If set to <code>Chart</code>, only the chart is displayed.</li>
				 * <li>If set to <code>Table</code>, only the table is displayed.</li>
				 * </ul>
				 * This property overrides the <code>displayType</code> properties of individual Gantt charts included
				 * in the <code>ganttCharts</code> aggregation.
				 */
				displayType: {type: "sap.gantt.simple.GanttChartWithTableDisplayType", defaultValue: GanttChartWithTableDisplayType.Both},

				/**
				* Flag to enable and disable status bar.
				* @since 1.88
				*/
				enableStatusBar: { type: "boolean", defaultValue: false },

				/**
				* Defines the message texts set on the status bar.
				* @since 1.88
				*/
				statusMessage: { type: "string",defaultValue:"" },

				/**
				 * Determines the date pattern set on the status bar.
				 * @since 1.88
				 */
				statusBarDatePattern:{ type: "string", defaultValue:'EEEE, MMMM d, yyyy' },

				/**
				 *Determines the time pattern set on the status bar.
				 * @since 1.88
				 */
				statusBarTimePattern:{ type: "string", defaultValue: 'hh:mm:ss a' },

				/**
				 * Defines the list of items to be hidden in Settings.
				 * @since 1.88
				 */
				hideSettingsItem:{ type:"string[]" ,defaultValue: []}
			},
			defaultAggregation : "ganttCharts",
			aggregations: {

				/**
				 * Toolbar of the container.
				 */
				toolbar: {type: "sap.gantt.simple.ContainerToolbar", multiple: false},

				/**
				 * Gantt Chart of the container
				 */
				ganttCharts: { type: "sap.gantt.simple.GanttChartWithTable", multiple: true },

				/**
				 * Status bar of the container
				 */
				statusBar: { type: "sap.m.FlexBox", multiple: false },
				/**
				 * Definitions of paint servers used for advanced shape features around SVG fill, stroke, and filter attributes.
				 * The generated SVG <defs> will be reused in all gantt chart instances
				 */
				svgDefs: {type: "sap.gantt.def.SvgDefs", multiple: false},
				/**
				* Custom variant handler of the container
				* @since 1.88
				*/
				variantHandler: { type: "sap.gantt.simple.CustomVariantHandler", multiple: false}
			},
			events: {

				/**
				 * Event fired when the custom settings value is changed.
				 *
				 * The custom settings are application provided settings that can be configured in the settings dialog. This event allows the application to handle these settings.
				 * Only check boxes are supported.
				 */
				customSettingChange: {
					parameters: {
						/**
						 * Name of the custom setting
						 */
						name: {type: "string"},

						/**
						 * The value of the custom setting
						 */
						value: {type: "boolean"}
					}
				},
				/**
				 * The event is triggered when a variant is applied. Note that all changes are saved before the variant is applied.
				 *
				 * This event enables the application to update binding parameters of tables, and also updates the charts, if required, after applying the changes.
				 * @since 1.88
				 */
				variantApplied :{}
			},
			designtime: "sap/gantt/designtime/simple/GanttChartContainer.designtime"
		}
	});

	var SharedProperties   = ["enableCursorLine", "enableNowLine", "enableVerticalLine", "enableAdhocLine", "enableDeltaLine", "enableNonWorkingTime"];
	var SettingsProperties = ["enableTimeScrollSync"].concat(SharedProperties).concat(["enableStatusBar"]);
	var oInitialValues = {
		zoomLevel : 0,
		displayType : GanttChartWithTableDisplayType.Both,
		enableCursorLine : true,
		enableNowLine : true ,
		enableVerticalLine : true,
		enableAdhocLine : true ,
		enableDeltaLine : true,
		enableTimeScrollSync : true,
		enableNonWorkingTime: true,
		enableStatusBar:false
	};
	SharedProperties.forEach(function(sProperty){
		GanttChartContainer.prototype["set" + capitalize(sProperty, 0)] = function(bValue) {
			this.setProperty(sProperty, bValue);
			// propogate to gantt chart
			this.getGanttCharts().forEach(function(oGantt){
				oGantt.setProperty(sProperty, bValue);
			});
			return this;
		};
	});

	/**
	 * To ensure that the value of the shared properties on Gantt Chart instances are
	 * always equals to it's parent.
	 *
	 * @private
	 */
	GanttChartContainer.prototype.setSharedPropertiesValueToGantts = function() {
		SharedProperties.forEach(function(sProperty){
			var sPropValue = this.getProperty(sProperty);
			this.getGanttCharts().forEach(function(oGantt){
				oGantt.setProperty(sProperty, sPropValue, true);
			});
		}.bind(this));
	};

	GanttChartContainer.prototype.init = function () {
		this._bInitHorizonApplied = false;
		this._nInitialRenderedGantts = 0; // used only when multiple Gantt charts (helps with their sync)

		this._oSplitter = new Splitter({
			id: this.getId() + "-ganttContainerSplitter",
			orientation: this.getLayoutOrientation()
		});

		this.oObserver = new ManagedObjectObserver(this.observePropertiesChanges.bind(this));
		this.oObserver.observe(this, {
			properties: SettingsProperties
		});
		this.oStatusBar = new FlexBox(this.getId() + "-ganttStatusBar", {
			renderType: "Bare",
			alignItems: "Center",
			justifyContent: "SpaceBetween"
		}).addStyleClass("sapUiSettingBox");
		this.setAggregation("statusBar", this.oStatusBar, true);
		this.createItems().forEach(function (oItem) {
			this.getStatusBar().addItem(oItem);
		}.bind(this));
	};

	GanttChartContainer.prototype.exit = function(){
		this.oObserver.disconnect();
		this._oSplitter.destroy();
	};

	GanttChartContainer.prototype.setDisplayType = function (sDisplayType) {
		this._setDisplayTypeForAll(sDisplayType);
		this.setProperty("displayType", sDisplayType, false);
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	GanttChartContainer.prototype.setToolbar = function(oToolbar) {
		this.setAggregation("toolbar", oToolbar, true);
		oToolbar.attachZoomStopChange(this._onToolbarZoomStopChange, this);
		oToolbar.attachBirdEyeButtonPress(this._onToolbarBirdEyeButtonPress, this);
		oToolbar.attachEvent("_settingsChange", this._onToolbarSettingsChange.bind(this));
		oToolbar.attachEvent("_zoomControlTypeChange", this._onToolbarZoomControlTypeChange.bind(this));
		oToolbar.attachDisplayTypeChange(this._onToolbarDisplayTypeChanged.bind(this), this);
		oToolbar._oDisplayTypeSegmentedButton.setSelectedKey(this.getDisplayType());
		return this;
	};

	GanttChartContainer.prototype.setVariantHandler = function(oVariantHandler) {
		this.setAggregation("variantHandler", oVariantHandler, true);
		oVariantHandler.attachSetDataComplete(this.customVariantChange, this);
	};

	GanttChartContainer.prototype.setLayoutOrientation = function(sOrientation) {
		this.setProperty("layoutOrientation", sOrientation);
		this._oSplitter.setOrientation(sOrientation);
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	GanttChartContainer.prototype.addGanttChart = function (oGanttChart) {
		this.addAggregation("ganttCharts", oGanttChart, true);
		this._insertGanttChart(oGanttChart);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	GanttChartContainer.prototype.insertGanttChart = function (oGanttChart, iIndex) {
		this.insertAggregation("ganttCharts", oGanttChart, iIndex);
		this._insertGanttChart(oGanttChart, iIndex);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	GanttChartContainer.prototype.removeGanttChart = function (vGanttChart) {
		this._removeGanttChartFromSplitter(vGanttChart);
		var oRemovedGantt = this.removeAggregation("ganttCharts", vGanttChart);
		this._adjustSplitterLayoutData();
		return oRemovedGantt;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	GanttChartContainer.prototype.removeAllGanttCharts = function () {
		var aGanttCharts = this.getGanttCharts();
		for (var i = 0; i < aGanttCharts.length; i++) {
			this._removeGanttChartFromSplitter(aGanttCharts[i]);
		}
		return this.removeAllAggregation("ganttCharts");
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	GanttChartContainer.prototype._insertGanttChart = function (oGanttChart, iIndex) {
		if (!oGanttChart) {
			return;
		}

		var sOtherGanttSelectionPanelSize = this._getOtherGanttSelectionPanelSize(oGanttChart);
		if (sOtherGanttSelectionPanelSize) {
			oGanttChart.setProperty("selectionPanelSize", sOtherGanttSelectionPanelSize, "true");
		}

		var oAssociateContainer = new AssociateContainer({
			content: oGanttChart,
			layoutData: oGanttChart.getLayoutData() ? oGanttChart.getLayoutData().clone() : new SplitterLayoutData()
		});

		if (iIndex !== 0 && !iIndex) {
			this._oSplitter.addContentArea(oAssociateContainer);
		} else {
			this._oSplitter.insertContentArea(oAssociateContainer, iIndex);
		}

		this._sanitizeGanttChartEvents(oGanttChart);

		this.setSharedPropertiesValueToGantts();
		oGanttChart.setDisplayType(this.getDisplayType());
	};

	GanttChartContainer.prototype._adjustSplitterLayoutData = function() {
		// check how many gantts left
		var aGantts = this.getGanttCharts();

		var aContents = this._oSplitter.getContentAreas();

		if (aGantts.length === 1) {
			// if only 1 left, then set the size to auto in order to occupy all the space
			aContents[0].getLayoutData().setSize("auto");
		}
	};

	GanttChartContainer.prototype._getOtherGanttSelectionPanelSize = function(oNewGantt) {
		var aOtherGantts = this.getGanttCharts().filter(function(oGantt) {
			return oGantt.getId() !== oNewGantt.getId();
		});

		return aOtherGantts && aOtherGantts.length > 0 ? aOtherGantts[0].getSelectionPanelSize() : null;
	};

	GanttChartContainer.prototype._sanitizeGanttChartEvents = function(oGanttChart) {
		// to prevent duplicate event listeners and incorrect property values
		var mEvents = {
			"_initialRenderGanttChartsSync" : this._onInitialRenderGanttChartsSync,
			"_timePeriodZoomOperation"      : this._onGanttChartTimePeriodZoomOperation,
			"_zoomInfoUpdated"              : this._onZoomInfoUpdated,
			"_selectionPanelResize"         : this._onSelectionPanelWidthChange,
			"_layoutDataChange"             : this._onGanttChartLayoutDataChange
		};

		// detach the events first
		Object.keys(mEvents).forEach(function(sEventName){
			oGanttChart.detachEvent(sEventName, mEvents[sEventName], this);
		}.bind(this));

		// attach them again
		Object.keys(mEvents).forEach(function(sEventName){
			oGanttChart.attachEvent(sEventName, mEvents[sEventName], this);
		}.bind(this));
	};

	GanttChartContainer.prototype._onGanttChartLayoutDataChange = function(oEvent) {
		var oGanttChart = oEvent.getSource(),
			oNewLayoutData = oGanttChart.getLayoutData();

		this._oSplitter.getContentAreas().forEach(function(oArea){
			if (oArea.getContent() === oGanttChart.getId()) {
				oArea.getLayoutData()
					.setSize(oNewLayoutData.getSize())
					.setMinSize(oNewLayoutData.getMinSize());
			}
		});
	};

	GanttChartContainer.prototype._removeGanttChartFromSplitter = function (vGanttChart) {
		var oGanttChart = vGanttChart;
		if ((typeof vGanttChart) === "number") {
			oGanttChart = this.getGanttCharts()[vGanttChart];
		}
		if (oGanttChart) {
			// remove associated container
			this._oSplitter.removeContentArea(oGanttChart);
		}
		return oGanttChart;
	};

	GanttChartContainer.prototype._onInitialRenderGanttChartsSync = function (oEvent) {
		var oParameter = oEvent.getParameters();
		var aGanttCharts = this.getGanttCharts();

		//in order to eliminate initial rendering sync dead lock
		if (oParameter.reasonCode === "initialRender" && !this.getEnableTimeScrollSync()){
			return;
		}

		if (!this.getEnableTimeScrollSync()) {
			if (oParameter.reasonCode === "visibleHorizonUpdated"){
				//in this default situation we will handle sync all gantt charts when user directly set visible horizon in axisTimeStartegy
				for (var i = 0; i < aGanttCharts.length; i++){
					if (oEvent.getSource().getId() === aGanttCharts[i].getId()){
						continue;
					}

					aGanttCharts[i].syncVisibleHorizon(oParameter.visibleHorizon, oParameter.visibleWidth, true);
				}
			} else {
				//at here we can handle some strange and specific sync logic, such as mouse wheel zoom
				var sSyncFunctionName;
				if (oParameter.reasonCode === "mouseWheelZoom"){
					sSyncFunctionName = "syncMouseWheelZoom";
				}

				if (sSyncFunctionName){
					for (var m = 0; m < aGanttCharts.length; m++){
						var oGanttWithSingleTable = aGanttCharts[m];
						var oGantt = oGanttWithSingleTable;
						if (oEvent.getSource().getId() === oGantt.getId()){
							continue;
						}
						oGantt[sSyncFunctionName](oParameter);
					}
				}
			}

		} else {
			//here we only need care default sync because the time scroll sync is set as true
			for (var j = 0; j < aGanttCharts.length; j++){
				aGanttCharts[j].syncVisibleHorizon(oParameter.visibleHorizon, oParameter.visibleWidth);
			}
		}
	};

	GanttChartContainer.prototype._onGanttChartTimePeriodZoomOperation = function (oEvent){
		var bTimeScrollSync = this.getEnableTimeScrollSync();
		var aGanttCharts = this.getGanttCharts();
		for (var i = 0; i < aGanttCharts.length; i++){
			if (oEvent.getSource().getId() === aGanttCharts[i].getId()){
				continue;
			}
			var sOrientation = this._oSplitter.getOrientation();
			aGanttCharts[i].syncTimePeriodZoomOperation(oEvent, bTimeScrollSync, sOrientation);
		}
	};

	GanttChartContainer.prototype._onSelectionPanelWidthChange = function(oEvent) {
		var sDisplayType = this.getDisplayType(),
			sGanttDisplayType = oEvent.getParameter("displayType");

		if (sDisplayType !== sGanttDisplayType) {
			this.setDisplayType(sGanttDisplayType);
			return;
		}

		if (this.getLayoutOrientation() === Orientation.Horizontal && sDisplayType !== GanttChartWithTableDisplayType.Both) {
			// ignore the selection panel size synchronization on horizontal layout
			// and the selection panel size of Gantt Charts in container can be different if the displayType is not Both
			return;
		}

		var	iNewWidth = oEvent.getParameter("newWidth");
		this.getGanttCharts().forEach(function (oGantt) {
			oGantt.setProperty("selectionPanelSize", iNewWidth + "px", false); // call ManagedObject directly to prevent custom logic from executing
			oGantt._draw();
		});
	};

	GanttChartContainer.prototype._removeGanttChartFromSplitter = function (vGanttChart) {
		var oGanttChart = vGanttChart;
		if ((typeof vGanttChart) === "number") {
			oGanttChart = this.getGanttCharts()[vGanttChart];
		}
		if (oGanttChart) {
			// remove associated container
			this._oSplitter.removeContentArea(oGanttChart._oAC);
		}
	};

	GanttChartContainer.prototype.onBeforeRendering = function () {
		this.observePropertiesChanges();
		this.handleZoomControlTypeToAxistimeStrategy();
	};
	GanttChartContainer.prototype.onAfterRendering = function () {
		if (this.getEnableStatusBar()){
			this.msgText.setText(this.getStatusMessage());
		}
	};

	GanttChartContainer.prototype.handleZoomControlTypeToAxistimeStrategy = function() {
		if (this.getToolbar()) {
			var aGanttCharts = this.getGanttCharts();
			var sZoomControlType = this.getToolbar().getZoomControlType();
			aGanttCharts.forEach(function (oGanttChart){
				oGanttChart.getAxisTimeStrategy()._updateZoomControlType(sZoomControlType);
			});
		}
	};

	GanttChartContainer.prototype._onZoomInfoUpdated = function (oEvent) {
		if (this.getToolbar()) {
			var iZoomLevel = oEvent.getParameter("zoomLevel");

			if (!isNaN(iZoomLevel)){
				this.getToolbar().updateZoomLevel(iZoomLevel);
			}
		}
	};

	GanttChartContainer.prototype._onToolbarDisplayTypeChanged = function (oEvent) {
		var aChanges = [];
		aChanges.push({
			"selectorElement": this,
			"changeSpecificData": {
				"changeType": "GanttContainerDisplayType",
				"content": {
					"propertyName": "displayType",
					"newValue": oEvent.getParameter("displayType"),
					"oldValue": oInitialValues.displayType //this.getDisplayType()
				}
			}
		});

		//once changes are complete, write them
		ControlPersonalizationWriteAPI.add({
			changes: aChanges
		});

	};

	GanttChartContainer.prototype._setDisplayTypeForAll = function (sDisplayType) {
		var oToolbar = this.getToolbar();

		if (oToolbar) {
			oToolbar._oDisplayTypeSegmentedButton.setSelectedKey(sDisplayType);
		}

		this.getGanttCharts().forEach(function (oChart) {
			oChart.setDisplayType(sDisplayType);
		});
	};

	GanttChartContainer.prototype._onToolbarBirdEyeButtonPress = function (oEvent) {
		var aGanttCharts = this.getGanttCharts();

		var oStartTime;
		var oEndTime;

		aGanttCharts.forEach(function (oGanttChart){
			var oHorizonRange = oGanttChart._getZoomExtension().calculateBirdEyeRange();
			if (oHorizonRange.startTime && oHorizonRange.endTime){
				if (!oStartTime || oHorizonRange.startTime.getTime() < oStartTime.getTime()) {
					oStartTime = oHorizonRange.startTime;
				}

				if (!oEndTime || oEndTime.getTime() < oHorizonRange.endTime.getTime()) {
					oEndTime = oHorizonRange.endTime;
				}
			}
		});

		if (oStartTime && oEndTime){
			var oBirdEyeHorizon = new TimeHorizon({
				startTime: oStartTime,
				endTime: oEndTime
			});
			aGanttCharts.forEach(function (oGanttChart){
				var oAxisTimeStrategy = oGanttChart.getAxisTimeStrategy();
                if (oAxisTimeStrategy.getMouseWheelZoomType() === library.MouseWheelZoomType.Stepwise) {
					oAxisTimeStrategy.bBirdEyeTriggered = true;
				}
				oGanttChart.syncVisibleHorizon(oBirdEyeHorizon);
			});
		}
	};

	GanttChartContainer.prototype._onToolbarZoomStopChange = function (oEvent) {
		var aGanttCharts = this.getGanttCharts();
		var aChanges = [];
		aGanttCharts.forEach(function(oGanttChart) {
			aChanges.push({
				"selectorElement": oGanttChart.getAxisTimeStrategy(),
				"changeSpecificData": {
					"changeType": "GanttContainerZoomLevel",
					"content": {
						"propertyName": "zoomLevel",
						"newValue": oEvent.getParameter("index"),
						"oldValue": oInitialValues.zoomLevel
					}
				}
			});
		});
		//once changes are complete, write them
		ControlPersonalizationWriteAPI.add({
			changes: aChanges
		});

		aGanttCharts.forEach(function (oGanttChart){
			oGanttChart.getAxisTimeStrategy().updateStopInfo({
				index: oEvent.getParameter("index"),
				selectedItem: oEvent.getParameter("selectedItem")
			});
		});
	};

	GanttChartContainer.prototype._onToolbarZoomControlTypeChange = function (oEvent) {
		this._handleZoomControlType(oEvent.getParameter("zoomControlType"));
		var oGanttChart = this.getGanttCharts()[0];
		oInitialValues = {
			zoomLevel: oGanttChart.getAggregation("axisTimeStrategy").getProperty("zoomLevel"),
			displayType: oGanttChart.getProperty("displayType"),
			enableAdhocLine: oGanttChart.getProperty("enableAdhocLine"),
			enableCursorLine: oGanttChart.getProperty("enableCursorLine"),
			enableDeltaLine: oGanttChart.getProperty("enableDeltaLine"),
			enableNowLine: oGanttChart.getProperty("enableNowLine"),
			enableVerticalLine: oGanttChart.getProperty("enableVerticalLine"),
			enableNonWorkingTime: oGanttChart.getProperty("enableNonWorkingTime"),
			enableStatusBar: this.getEnableStatusBar()
		};
	};

	GanttChartContainer.prototype._handleZoomControlType = function (sZoomControlType) {
		var aGanttCharts = this.getGanttCharts();
		aGanttCharts.forEach(function (oGanttChart){
			oGanttChart.getAxisTimeStrategy()._updateZoomControlType(sZoomControlType);
		});
	};

	GanttChartContainer.prototype._onToolbarSettingsChange = function(oEvent){
		var aParameters = oEvent.getParameters();
		var aCustomSettings = [], aChanges = [], sChangeType = "";
		aParameters.forEach(function(oParam) {
			if (oParam.isStandard) {
				var sProperty = oParam.name.substr(4);
				if (SettingsProperties.indexOf(sProperty) >= 0) {
					this["set" + capitalize(sProperty, 0)](oParam.value);
					switch (SettingsProperties.indexOf(sProperty)) {
						case 0:
							sChangeType = "GanttContainerEnableTimeScrollSync";
						  break;
						case 1:
							sChangeType = "GanttContainerEnableCursorLine";
						  break;
						case 2:
							sChangeType = "GanttContainerEnableNowLine";
						  break;
						case 3:
							sChangeType = "GanttContainerEnableVerticalLine";
						  break;
						case 4:
							sChangeType = "GanttContainerEnableAdhocLine";
						  break;
						case 5:
							sChangeType = "GanttContainerEnableDeltaLine";
						  break;
						case 6:
							sChangeType = "GanttContainerEnableNonWorkingTime";
							break;
						case 7:
							sChangeType = "GanttContainerEnableStatusBar";
							break;
					  }

					aChanges.push({
						"selectorElement": this,
						"changeSpecificData": {
							"changeType": sChangeType,
							"content": {
								"propertyName": sProperty,
								"newValue": oParam.value,
								"oldValue": oInitialValues[sProperty]
							}
						}
					});
				}
			} else {
				delete oParam.isStandard;
				aCustomSettings.push(oParam);
			}
		}.bind(this));

		if (aCustomSettings.length > 0) {
			this.fireCustomSettingChange(aCustomSettings);
		}

		ControlPersonalizationWriteAPI.add({
			changes: aChanges
		});

	};

	// Fired when custom settings or buttons are to be saved as part of variant management
	GanttChartContainer.prototype.customVariantChange = function() {
		var oCustom = this.getVariantHandler().getData(),
		aChanges = [];
		aChanges.push({
			"selectorElement": this,
			"changeSpecificData": {
				"changeType": "GanttContainerCustom",
				"content": oCustom
			}
		});
		ControlPersonalizationWriteAPI.add({
			changes: aChanges
		});
	};

	GanttChartContainer.prototype.observePropertiesChanges = function(oChanges){
		var mSettingsConfig;
		var oToolbar = this.getToolbar();
		if (!oChanges) {
			mSettingsConfig = SettingsProperties.reduce(function(mConfig, property){
				mConfig[property] = this.getProperty(property);
				return mConfig;
			}.bind(this), {});

			if  (oToolbar){
				var aCheckBoxes = oToolbar._oSettingsBox.getItems();
				var ahiddenSettingItems = this.getHideSettingsItem();

				aCheckBoxes.forEach(function(oCheckBox){
					var ohiddenSettingItem = ahiddenSettingItems.filter(function(oItem){
						return oCheckBox.getName().endsWith(oItem);
					})[0];
					if (ohiddenSettingItem) {
						oCheckBox.setVisible(false);
					}
				});
			}
		} else {
			mSettingsConfig = {};
			mSettingsConfig[oChanges.name] = oChanges.current;
		}
		if (oToolbar) {
			oToolbar.updateSettingsConfig(mSettingsConfig);
		}
	};
	GanttChartContainer.prototype.createItems = function () {
		this.msgText = new Text(this.getId() + "-ganttStatusBarMsgText", {
			maxLines: 1
		}).addStyleClass("sapUiSmallMarginEnd");
		this.dateTimeText = new Text(this.getId() + "-ganttStatusBarDateTimeText", {textAlign:sap.ui.core.TextAlign.Right });
		return [this.msgText, this.dateTimeText];
	};

	/**
	 * Update axis time strategy initial settings when a variant applied.
	 */

	GanttChartContainer.prototype.updateAxisTimeSettings = function() {
		this.getGanttCharts().forEach(function(oGanttChart) {
			oGanttChart.getAxisTimeStrategy().initialSettings.zoomLevel = oGanttChart.getAxisTimeStrategy().getZoomLevel();
		});
	};

	return GanttChartContainer;
}, true);
