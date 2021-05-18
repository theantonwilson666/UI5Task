/*
 * ! OpenUI5
 * (c) Copyright 2009-2021 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	'sap/ui/mdc/p13n/Engine', './ItemBaseFlex'
], function(Engine, ItemBaseFlex) {
	"use strict";

	var oColumnFlex = Object.assign({}, ItemBaseFlex);

	// Rebind triggered on the Control only during runtime JS change
	var fRebindControl = function(oControl) {
		if (oControl && oControl.isA && oControl.isA("sap.ui.mdc.Table") && oControl.isTableBound()) {
			if (!oControl._bWaitForBindChanges) {
				oControl._bWaitForBindChanges = true;
				Engine.getInstance().waitForChanges(oControl).then(function() {
					oControl.checkAndRebind();
					delete oControl._bWaitForBindChanges;
				});

			}
		}
	};

	oColumnFlex.findItem = function(oModifier, aColumns, sName) {
		return aColumns.find(function(oColumn) {
			var sDataProperty = oModifier.getProperty(oColumn, "dataProperty");
			return sDataProperty === sName;
		});
	};

	oColumnFlex.afterApply = function(sChangeType, oTable, bIsRevert) {
		if (sChangeType === "addColumn" && !bIsRevert || (sChangeType === "removeColumn" && bIsRevert)) {
			fRebindControl(oTable);
		}
	};

	oColumnFlex.addColumn = oColumnFlex.createAddChangeHandler();
	oColumnFlex.removeColumn = oColumnFlex.createRemoveChangeHandler();
	oColumnFlex.moveColumn = oColumnFlex.createMoveChangeHandler();

	return oColumnFlex;

});
