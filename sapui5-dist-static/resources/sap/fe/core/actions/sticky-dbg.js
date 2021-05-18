/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */

// Provides static functions for the sticky session programming model
sap.ui.define(["sap/fe/core/actions/operations"], function(operations) {
	"use strict";

	/**
	 * Opens a sticky session to edit a document.
	 *
	 * @function
	 * @name sap.fe.core.actions.sticky#editDocumentInStickySession
	 * @memberof sap.fe.core.actions.sticky
	 * @static
	 * @param {sap.ui.model.odata.v4.Context} oContext Context of the document to be edited
	 * @returns {Promise}
	 * @private
	 * @ui5-restricted
	 */
	function editDocumentInStickySession(oContext) {
		var oModel = oContext.getModel(),
			oMetaModel = oModel.getMetaModel(),
			sMetaPath = oMetaModel.getMetaPath(oContext.getPath()),
			sEditAction = oMetaModel.getObject(sMetaPath + "@com.sap.vocabularies.Session.v1.StickySessionSupported/EditAction"),
			oEditAction,
			oEditPromise;

		if (!sEditAction) {
			throw new Error("Edit Action for Sticky Session not found for " + sMetaPath);
		}

		oEditAction = oModel.bindContext(sEditAction + "(...)", oContext, { $$inheritExpandSelect: true });

		oEditPromise = oEditAction.execute("direct");
		oModel.submitBatch("direct");
		return oEditPromise;
	}

	/**
	 * Activates a document and closes sticky session.
	 *
	 * @function
	 * @name sap.fe.core.actions.sticky#activateDocument
	 * @memberof sap.fe.core.actions.sticky
	 * @static
	 * @param {sap.ui.model.odata.v4.Context} oContext Context of the document to be activated
	 * @returns {Promise}
	 * @private
	 * @ui5-restricted
	 */
	function activateDocument(oContext) {
		var oModel = oContext.getModel(),
			oMetaModel = oModel.getMetaModel(),
			sMetaPath = oMetaModel.getMetaPath(oContext.getPath()),
			sSaveAction = oMetaModel.getObject(sMetaPath + "@com.sap.vocabularies.Session.v1.StickySessionSupported/SaveAction"),
			oSaveAction,
			oSavePromise;

		if (!sSaveAction) {
			throw new Error("Save Action for Sticky Session not found for " + sMetaPath);
		}

		oSaveAction = oModel.bindContext(sSaveAction + "(...)", oContext, { $$inheritExpandSelect: true });

		oSavePromise = oSaveAction.execute("direct");
		oModel.submitBatch("direct");
		return oSavePromise;
	}

	/**
	 * Discards a document and closes sticky session.
	 *
	 * @function
	 * @name sap.fe.core.actions.sticky#discardDocument
	 * @memberof sap.fe.core.actions.sticky
	 * @static
	 * @param {sap.ui.model.odata.v4.Context} oContext Context of the document to be discarded
	 * @returns {Promise}
	 * @private
	 * @ui5-restricted
	 */
	function discardDocument(oContext) {
		var oModel = oContext.getModel(),
			oMetaModel = oModel.getMetaModel(),
			sMetaPath = oMetaModel.getMetaPath(oContext.getPath()),
			sDiscardAction = oMetaModel.getObject(sMetaPath + "@com.sap.vocabularies.Session.v1.StickySessionSupported/DiscardAction"),
			oDiscardAction,
			oDiscardPromise;

		if (!sDiscardAction) {
			throw new Error("Discard Action for Sticky Session not found for " + sMetaPath);
		}

		oDiscardAction = oModel.bindContext("/" + sDiscardAction + "(...)");
		oDiscardPromise = oDiscardAction.execute("direct").then(function() {
			return oContext;
		});
		oModel.submitBatch("direct");
		return oDiscardPromise;
	}

	/**
	 * Static functions for the sticky session programming model
	 *
	 * @namespace
	 * @alias sap.fe.core.actions.sticky
	 * @private
	 * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
	 * @since 1.54.0
	 */
	var sticky = {
		editDocumentInStickySession: editDocumentInStickySession,
		activateDocument: activateDocument,
		discardDocument: discardDocument
	};

	return sticky;
});
