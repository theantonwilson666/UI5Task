sap.ui.define(
	["sap/fe/macros/filter/DraftEditState"],
	function(EditState) {
		"use strict";

		/**
		 * Enum for supported editing states.
		 *
		 * @name sap.fe.test.api.EditState
		 * @enum {string}
		 * @public
		 */
		return {
			/**
			 * All
			 *
			 * @name sap.fe.test.api.EditState.All
			 * @constant
			 * @type {string}
			 * @public
			 */
			All: EditState.ALL.id,
			/**
			 * Unchanged
			 *
			 * @name sap.fe.test.api.EditState.Unchanged
			 * @constant
			 * @type {string}
			 * @public
			 */
			Unchanged: EditState.UNCHANGED.id,
			/**
			 * Own Draft
			 *
			 * @name sap.fe.test.api.EditState.OwnDraft
			 * @constant
			 * @type {string}
			 * @public
			 */
			OwnDraft: EditState.OWN_DRAFT.id,
			/**
			 * Locked by Another User
			 *
			 * @name sap.fe.test.api.EditState.Locked
			 * @constant
			 * @type {string}
			 * @public
			 */
			Locked: EditState.LOCKED.id,
			/**
			 * Unsaved Changes by Another User
			 *
			 * @name sap.fe.test.api.EditState.UnsavedChanges
			 * @constant
			 * @type {string}
			 * @public
			 */
			UnsavedChanges: EditState.UNSAVED_CHANGES.id
		};
	},
	true
);
