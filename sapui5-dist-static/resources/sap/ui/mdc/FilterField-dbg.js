/*!
 * OpenUI5
 * (c) Copyright 2009-2021 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	'sap/ui/mdc/field/FieldBase',
	'sap/ui/mdc/field/FieldBaseRenderer',
	'sap/base/util/merge'
], function(
		FieldBase,
		FieldBaseRenderer,
		merge
	) {
	"use strict";

	/**
	 * Constructor for a new <code>FilterField</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>FilterField</code> control is used to filter data based on the conditions. The conditions are managed
	 * in the corresponding {@link sap.ui.mdc.condition.ConditionModel ConditionModel}.
	 * That is why the <code>conditions</code> property must be bound to the related conditions in the {@link sap.ui.mdc.condition.ConditionModel ConditionModel}.
	 * The type of this data must be defined in the <code>dataType</code> property.
	 *
	 * @extends sap.ui.mdc.field.FieldBase
	 *
	 * @author SAP SE
	 * @version 1.88.0
	 *
	 * @constructor
	 * @alias sap.ui.mdc.FilterField
	 * @author SAP SE
	 * @version 1.88.0
	 * @since 1.48.0
	 *
	 * @experimental As of version 1.48
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	var FilterField = FieldBase.extend("sap.ui.mdc.FilterField", /* @lends sap.ui.mdc.FilterField.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Supported operator names for conditions.
				 *
				 * If empty, default operators depending on used data type are used.
				 *
				 * @since 1.73.0
				 */
				operators: {
					type: "string[]",
					group: "Data",
					defaultValue: []
				},
				/**
				 * Default operator name for conditions.
				 * If empty, the relevant default operator depending on the data type used is taken.
				 *
				 * <b>Note</b>: The <code>defaultOperator</code> can be the name of an {@link sap.ui.mdc.condition.Operator Operator} or the instance itself.
				 *
				 * @since 1.88.0
				 */
				defaultOperator: {
					type: "string",
					group: "Data",
					defaultValue: null
				}
			},
			events: {
				/**
				 * This event is fired when the <code>value</code> property of the field is changed.
				 *
				 * <b>Note</b> This event is only triggered if the used content control has a change event.
				 */
				change: {
					parameters: {

						/**
						 * The new value of the <code>control</code>
						 */
						value: { type: "string" },

						/**
						 * Flag that indicates if the entered <code>value</code> is valid
						 */
						valid: { type: "boolean" },

						/**
						 * Conditions of the field. This includes all conditions, not only the changed ones.
						 * @since 1.61.0
						 */
						conditions: { type: "object[]" },

						/**
						 * Returns a <code>Promise</code> for the change. The <code>Promise</code> returns the value if it is resolved.
						 * If the <code>change</code> event is synchronous, the promise has already been already resolved. If it is asynchronous,
						 * it will be resolved after the value has been updated.
						 *
						 * The <code>FilterField</code> should be set to busy during the parsing to prevent user input.
						 * As there might be a whole group of fields that needs to be busy, this cannot be done automatically.
						 *
						 * @since 1.69.0
						 */
						promise: { type: "boolean" }
					}
				}
			}
		},
		renderer: FieldBaseRenderer
	});

	FilterField.prototype.init = function() {

		FieldBase.prototype.init.apply(this, arguments);

	};

	FilterField.prototype.exit = function() {

		FieldBase.prototype.exit.apply(this, arguments);

	};

	FilterField.prototype._fireChange = function(aConditions, bValid, vWrongValue, oPromise) {

		var vValue;

		if (aConditions) { // even if empty and error is returned, only in async case it is really empty
			if (bValid) {
				if (aConditions.length == 1) {
					vValue = aConditions[0].values[0];
				}
			} else {
				vValue = vWrongValue;
			}
		}

		// do not return the original conditions to not change it by accident
		this.fireChange({ value: vValue, valid: bValid, conditions: merge([], aConditions), promise: oPromise });


	};

	FilterField.prototype._getOperators = function() {

		var aOperators = this.getOperators();

		if (aOperators.length === 0) {
			// use default operators
			aOperators = FieldBase.prototype._getOperators.apply(this, arguments);
		}

		return aOperators;

	};

	FilterField.prototype.setOperators = function(aOperators) {
		var aOperatorNames = [];

		aOperators.forEach(function(oOperator) {
			if (typeof oOperator  === "string") {
				aOperatorNames.push(oOperator);
			} else {
				aOperatorNames.push(oOperator.name);
			}
		});

		this.setProperty("operators", aOperatorNames);
		return this;
	};

	FilterField.prototype.addOperator = function(oOperator) {
		var aOperators = this._getOperators();
		if (typeof oOperator  === "string") {
			aOperators.push(oOperator);
		} else {
			aOperators.push(oOperator.name);
		}
		this.setOperators(aOperators);
	};

	FilterField.prototype.addOperators = function(aOperators) { // aOperators can be an array of operators or names
		aOperators.forEach(function(oOperator) {
			this.addOperator(oOperator);
		}.bind(this));

		return this;
	};

	FilterField.prototype.removeOperator = function(oOperator) {
		var aOperators = this.getOperators();
		var sName = oOperator;
		if (typeof oOperator !== "string") {
			sName = oOperator.name;
		}

		if (aOperators.indexOf(sName)) {
			aOperators.splice(aOperators.indexOf(sName), 1);
			this.setOperators(aOperators);
		}
	};

	FilterField.prototype.removeOperators = function(aOperators) {
		aOperators.forEach(function(oOperator) {
			this.removeOperator(oOperator);
		}.bind(this));

	};

	FilterField.prototype.removeAllOperators = function() {
		this.setOperators([]);
	};


	FilterField.prototype.setDefaultOperator = function(oOperator) {
		var sName = oOperator;
		if (oOperator && typeof oOperator !== "string") {
			sName = oOperator.name;
		}

		this.setProperty("defaultOperator", sName);
		return this;
	};


	return FilterField;

});
