/*
 * ! OpenUI5
 * (c) Copyright 2009-2021 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantMerger",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/Change",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils"
], function(
	FlexState,
	ManifestUtils,
	CompVariantMerger,
	ChangesController,
	Change,
	Settings,
	Utils,
	LayerUtils
) {
	"use strict";

	function getPersistencyKey(oControl) {
		return oControl && oControl.getPersistencyKey && oControl.getPersistencyKey();
	}

	/**
	 * Returns the SmartVariant <code>ChangeMap</code> from the Change Persistence.
	 *
	 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} oControl - SAPUI5 Smart Variant Management control
	 * @returns {object} <code>persistencyKey</code> map and corresponding changes, or an empty object
	 * @param {object[]} aVariants - Variant data from other data providers like an OData service
	 * @private
	 */
	function getVariantsMap(oControl, aVariants) {
		var sReference = ManifestUtils.getFlexReferenceForControl(oControl);
		var sPersistencyKey = getPersistencyKey(oControl);
		var mCompVariantsMap = FlexState.getCompVariantsMap(sReference);
		return mCompVariantsMap._getOrCreate(sPersistencyKey, aVariants);
	}

	function getCompEntities(mPropertyBag) {
		var sReference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.control);

		// TODO clarify why in a test we come here without an initialized FlexState (1980546095)
		return FlexState.initialize({
			reference: sReference,
			componentData: {},
			manifest: Utils.getAppDescriptor(mPropertyBag.control),
			componentId: Utils.getAppComponentForControl(mPropertyBag.control).getId()
		})
			.then(getVariantsMap.bind(undefined, mPropertyBag.control));
	}

	/**
	 * Object containing data for a SmartVariantManagement control.
	 *
	 * @typedef {object} sap.ui.fl.apply.api.SmartVariantManagementApplyAPI.Response
	 * @property {sap.ui.fl.Change[]} variants - Variants for the control
	 * @property {sap.ui.fl.Change[]} changes - Changes on variants for the control
	 * @property {sap.ui.fl.Change | undefined} defaultVariant - DefaultVariant change to be applied
	 * @property {sap.ui.fl.Change | undefined} standardVariant - StandardVariant change to be applied
	 * @since 1.83
	 * @private
	 * @ui5-restricted
	 */

	/**
	 * Provides an API to handle specific functionalities for the <code>sap.ui.comp</code> library.
	 *
	 * @namespace sap.ui.fl.apply.api.SmartVariantManagementApplyAPI
	 * @experimental
	 * @since 1.69.0
	 * @private
	 * @ui5-restricted sap.ui.comp
	 */
	var SmartVariantManagementApplyAPI = /** @lends sap.ui.fl.apply.api.SmartVariantManagementApplyAPI */{
		/**
		 * @typedef {object} sap.ui.fl.apply.api.SmartVariantManagementApplyAPI.LoadVariantsInput
		 * @param {string} id - ID of the variant
		 * @param {string} name - Title of the variant
		 * @param {boolean} [favorite=false] - Flag if the favorite property should be set
		 * @param {boolean} [executeOnSelection=false] - Flag if the favorite property should be set
		 * @param {object} [content={}] - Filter values of the variant
		 */

		/**
		 * @typedef {object} sap.ui.fl.apply.api.SmartVariantManagementApplyAPI.LoadVariantsResponse
		 * @property {sap.ui.fl._internal.flexObjects.Variant} standardVariant - The instance of the passed or exchanged standard variant
		 * @property {sap.ui.fl._internal.flexObjects.Variant[]} variants - instances of the passed, loaded and changed variants
		 */

		/**
		 * Calls the back end asynchronously and fetches all {@link sap.ui.fl.Change}s and variants pointing to this control.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement|
		 * 			sap.ui.comp.smartfilterbar.SmartFilterBar|
		 * 			sap.ui.comp.smarttable.SmartTable|
		 * 			sap.ui.comp.smartchart.SmartChart} mPropertyBag.control - Variant management control for which the variants should be loaded
		 * @param {sap.ui.fl.apply.api.SmartVariantManagementApplyAPI.LoadVariantsInput} mPropertyBag.standardVariant - The standard variant of the control;
		 * a standard variant is created into the response but may be replaced later in case data is loaded afterwards instructing the SVM to do so
		 * @param {sap.ui.fl.apply.api.SmartVariantManagementApplyAPI.LoadVariantsInput[]} mPropertyBag.variants - Variant data from other data providers like an OData service
		 * @returns {Promise<sap.ui.fl.apply.api.SmartVariantManagementApplyAPI.LoadVariantsResponse>} Object with the standard variant and the variants
		 */
		loadVariants: function(mPropertyBag) {
			return getCompEntities(mPropertyBag)
				.then(function(mCompVariants) {
					var sPersistencyKey = getPersistencyKey(mPropertyBag.control);
					return CompVariantMerger.merge(sPersistencyKey, mCompVariants, mPropertyBag.standardVariant, mPropertyBag.variants);
				});
		},

		/**
		 * @param mPropertyBag
		 * @return {*}
		 * @deprecated
		 */
		getEntityById: function (mPropertyBag) {
			var sReference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.control);
			return FlexState.getCompEntitiesByIdMap(sReference)[mPropertyBag.id];
		},

		/**
		 * Indicates if the current application is a variant of an existing one.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} mPropertyBag.control - SAPUI5 Smart Variant Management control
		 * @returns {boolean} <code>true</code> if it's an application variant
		 * @private
		 * @ui5-restricted
		 */
		isApplicationVariant: function(mPropertyBag) {
			var oControl = mPropertyBag.control;
			if (Utils.isApplicationVariant(oControl)) {
				return true;
			}

			var oComponent = Utils.getComponentForControl(oControl);

			// special case for SmartTemplating to reach the real appComponent
			if (oComponent && oComponent.getAppComponent) {
				oComponent = oComponent.getAppComponent();

				if (oComponent) {
					return true;
				}
			}

			return false;
		},

		/**
		 * Indicates if the VENDOR layer is selected.
		 *
		 * @returns {boolean} <code>true</code> if VENDOR layer is enabled
		 * @private
		 * @ui5-restricted
		 */
		isVendorLayer: function() {
			return LayerUtils.isVendorLayer();
		},

		/**
		 * Indicates whether the variant downport scenario is enabled or not. This scenario is only enabled if the current layer is the VENDOR layer
		 * and the URL parameter hotfix is set to <code>true</code>.
		 *
		 * @returns {boolean} <code>true</code> if the variant downport scenario is enabled
		 * @private
		 * @ui5-restricted
		 */
		isVariantDownport: function() {
			return SmartVariantManagementApplyAPI.isVendorLayer() && Utils.isHotfixMode();
		},

		/**
		 * Retrieves the default variant for the current control synchronously. WARNING: The consumer has to make sure that the
		 * changes have already been retrieved with <code>getChanges</code>. It's recommended to use the async API <code>getDefaultVariantId</code>, which works regardless of any
		 * preconditions.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} mPropertyBag.control - SAPUI5 Smart Variant Management control
		 * @returns {String} ID of the default variant
		 * @private
		 * @ui5-restricted
		 * @deprecated
		 */
		getDefaultVariantId: function(mPropertyBag) {
			var oChange = getVariantsMap(mPropertyBag.control).defaultVariant;
			return oChange ? oChange.getContent().defaultVariantName : "";
		},

		/**
		 * Synchronously retrieves the <code>ExecuteOnSelection</code> for the standard variant for the current control. WARNING: The consumer has to make sure that the
		 * changes have already been retrieved with <code>getChanges</code>. It's recommended to use the async API <code>getExecuteOnSelection</code>, which works regardless of any
		 * preconditions.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} mPropertyBag.control - SAPUI5 Smart Variant Management control
		 * @returns {boolean} <code>ExecuteOnSelection</code> flag
		 * @private
		 * @ui5-restricted
		 * @deprecated
		 */
		getExecuteOnSelect: function(mPropertyBag) {
			var oChange = getVariantsMap(mPropertyBag.control).standardVariant;
			return oChange ? oChange.getContent().executeOnSelect : null;
		},

		/**
		 * @deprecated
		 */
		getChangeById: function (mPropertyBag) {
			return SmartVariantManagementApplyAPI.getEntityById(mPropertyBag);
		},

		/**
		 * Collects all changes related to a smartVariantManagement.
		 *
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} oControl - SAPUI5 Smart Variant Management control
		 * @returns {object} A map with all changes related to the SmartVariantManagement by their ID
		 * @private
		 *
		 * @deprecated only being used on a deletion of a variant to also delete changes; this should be handled within the delete call
		 */
		_getChangeMap: function(oControl) {
			var sReference = ManifestUtils.getFlexReferenceForControl(oControl);
			var sPersistencyKey = getPersistencyKey(oControl);
			var mCompVariantsMap = FlexState.getCompEntitiesByIdMap(sReference);
			var mChangesForVariantManagement = {};
			Object.keys(mCompVariantsMap).forEach(function (sId) {
				if (
					mCompVariantsMap[sId].getSelector &&
					mCompVariantsMap[sId].getSelector().persistencyKey === sPersistencyKey &&
					mCompVariantsMap[sId].getFileType() === "change"
				) {
					mChangesForVariantManagement[sId] = mCompVariantsMap[sId];
				}
			});

			return mChangesForVariantManagement;
		}
	};

	return SmartVariantManagementApplyAPI;
}, true);
