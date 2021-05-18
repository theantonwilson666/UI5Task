
/*!
 * OpenUI5
 * (c) Copyright 2009-2021 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/Registration",
	"sap/ui/fl/apply/_internal/changes/descriptor/app/ChangeDataSource",
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddNewModelEnhanceWith",
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/SetMinUI5Version",
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddComponentUsages",
	"sap/ui/fl/apply/_internal/changes/descriptor/fiori/SetRegistrationIds",
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/SetFlexExtensionPointEnabled",
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddNewModel",
	"sap/ui/fl/apply/_internal/changes/descriptor/app/AddAnnotationsToOData"
], function(
	Registration,
	ChangeDataSource,
	AddNewModelEnhanceWith,
	SetMinUI5Version,
	AddComponentUsages,
	SetRegistrationIds,
	SetFlexExtensionPointEnabled,
	AddNewModel,
	AddAnnotationsToOData
) {
	"use strict";

	/**
	 * Loads and registers all change handlers used during the build.
	 * Includes all change handlers used during runtime.
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild
	 * @experimental
	 * @since 1.77
	 * @version 1.88.0
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var RegistrationBuild = {
		appdescr_app_changeDataSource: ChangeDataSource,
		appdescr_ui5_addNewModelEnhanceWith: AddNewModelEnhanceWith,
		appdescr_ui5_addComponentUsages: AddComponentUsages,
		appdescr_ui5_setMinUI5Version: SetMinUI5Version,
		appdescr_fiori_setRegistrationIds: SetRegistrationIds,
		appdescr_ui5_setFlexExtensionPointEnabled: SetFlexExtensionPointEnabled,
		appdescr_ui5_addNewModel: AddNewModel,
		appdescr_app_addAnnotationsToOData: AddAnnotationsToOData
	};

	var RegistrationCopy = Object.assign({}, Registration);
	return Object.assign(RegistrationCopy, RegistrationBuild);
}, true);