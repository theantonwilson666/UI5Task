/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

sap.ui.define(["./MacroMetadata"], function(MacroMetadata) {
	"use strict";

	/**
	 * @classdesc
	 * Macro for creating a chart based on the metadata provided by OData V4.
	 *
	 * @class sap.fe.macros.Chart
	 * @hideconstructor
	 * @private
	 * @experimental
	 */
	var Chart = MacroMetadata.extend("sap.fe.macros.Chart", {
		/**
		 * Name of the macro control.
		 */
		name: "Chart",
		/**
		 * Namespace of the macro control
		 */
		namespace: "sap.fe.macros",
		/**
		 * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name
		 */
		fragment: "sap.fe.macros.Chart",
		/**
		 * The metadata describing the macro control.
		 */
		metadata: {
			/**
			 * Define macro stereotype for documentation purpose
			 */
			stereotype: "xmlmacro",
			/**
			 * Properties.
			 */
			properties: {
				chartDefinition: {
					type: "sap.ui.model.Context"
				},
				/**
				 * ID of the chart
				 */
				id: {
					type: "string"
				},
				/**
				 * Metadata path to the entitySet or navigationProperty
				 */
				collection: {
					type: "sap.ui.model.Context",
					required: true,
					$kind: ["EntitySet", "NavigationProperty"]
				},
				/**
				 * Metadata path to the presentation (UI.Chart w or w/o qualifier)
				 */
				presentation: {
					type: "sap.ui.model.Context",
					required: true
				},
				/**
				 * Binding information for chart - if not specified it is created from the metadata information
				 */
				data: {
					type: "string"
				},
				/**
				 * The chart type (Column, Bar, etc.) - if not specified chartType is picked from the metadata information
				 */
				chartType: {
					type: "string"
				},
				/**
				 * The header text of the chart - if not specified it is picked up from the metadata information
				 */
				header: {
					type: "string"
				},
				/**
				 * The height of the chart
				 */
				height: {
					type: "string",
					defaultValue: "400px"
				},
				/**
				 * The width of the chart
				 */
				width: {
					type: "string",
					defaultValue: "1000px"
				},
				/**
				 * Specifies the selection mode
				 */
				selectionMode: {
					type: "sap.chart.SelectionMode",
					defaultValue: "NONE"
				},
				/**
				 * Parameter which sets the personalization of the mdc chart
				 */
				p13nMode: {
					type: "array"
				},
				/**
				 * Parameter which sets the id of the filterbar associating it to the chart
				 */
				filter: {
					type: "string"
				},
				/**
				 * Parameter which sets the noDataText for the mdc chart
				 */
				noDataText: {
					type: "string"
				},
				/**
				 * Parameter which sets the chart delegate for the mdc chart
				 */
				chartDelegate: {
					type: "string"
				},
				/**
				 * Parameter which sets the viz properties for the mdc chart
				 */
				vizProperties: {
					type: "string"
				},
				/**
				 * Parameter which sets the event handler on a chart selection
				 */
				dataPointsSelected: {
					type: "function"
				},
				/**
				 * The actions to be shown in the action area of the chart
				 */
				actions: {
					type: "sap.ui.model.Context"
				},
				visible: {
					type: "string"
				}
			},
			events: {
				onSegmentedButtonPressed: {
					type: "function"
				}
			}
		},
		create: function(oProps, oControlConfiguration, mSettings) {
			var oChartDefinition;
			if (oProps.chartDefinition === undefined || oProps.chartDefinition === null) {
				// TODO Fix standalone usage
				oChartDefinition = {};
			} else {
				oChartDefinition = oProps.chartDefinition.getObject();
			}
			this.setDefaultValue(oProps, "autoBindOnInit", oChartDefinition.autoBindOnInit);
			return oProps;
		}
	});

	return Chart;
});
