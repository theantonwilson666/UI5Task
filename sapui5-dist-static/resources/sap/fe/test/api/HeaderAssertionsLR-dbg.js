sap.ui.define(
	[
		"./HeaderLR",
		"sap/fe/test/Utils",
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MdcFieldBuilder",
		"./APIHelper"
	],
	function(HeaderLR, Utils, OpaBuilder, FEBuilder, FieldBuilder, APIHelper) {
		"use strict";

		/**
		 * Constructs a new HeaderAssertionsLR instance.
		 *
		 * @param {sap.fe.test.builder.FEBuilder} oHeaderBuilder The {@link sap.fe.test.builder.FEBuilder} instance used to interact with the UI
		 * @param {string} [vHeaderDescription] Description (optional) of the header to be used for logging messages
		 * @returns {sap.fe.test.api.HeaderAssertionsLR} The new instance
		 * @alias sap.fe.test.api.HeaderAssertionsLR
		 * @class
		 * @hideconstructor
		 * @public
		 */
		var HeaderAssertionsLR = function(oHeaderBuilder, vHeaderDescription) {
			return HeaderLR.call(this, oHeaderBuilder, vHeaderDescription);
		};
		HeaderAssertionsLR.prototype = Object.create(HeaderLR.prototype);
		HeaderAssertionsLR.prototype.constructor = HeaderAssertionsLR;
		HeaderAssertionsLR.prototype.isAction = false;

		/**
		 * Checks an action of the header toolbar.
		 *
		 * @param {string | sap.fe.test.api.ActionIdentifier} [vActionIdentifier] The identifier of the action, or its label
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 *
		 * @public
		 */
		HeaderAssertionsLR.prototype.iCheckAction = function(vActionIdentifier, mState) {
			var aArguments = Utils.parseArguments([[Object, String], Object], arguments),
				oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sPageId);
			return this.prepareResult(
				oOverflowToolbarBuilder
					.hasContent(this.createActionMatcher(vActionIdentifier), mState)
					.description(Utils.formatMessage("Checking custom header action '{0}' with state='{1}'", aArguments[0], aArguments[1]))
					.execute()
			);
		};

		/**
		 * Checks the <code>Save as Tile</code> action.
		 *
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 *
		 * @public
		 */
		HeaderAssertionsLR.prototype.iCheckSaveAsTile = function(mState) {
			var oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sPageId),
				sShareId = "fe::Share";

			if (mState && mState.visible === false) {
				oOverflowToolbarBuilder
					.hasContent(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sShareId))), mState)
					.description(Utils.formatMessage("Checking header '{0}' Share button with state='{1}'", this.getIdentifier(), mState));
			} else {
				oOverflowToolbarBuilder
					.doOnContent(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sShareId))), OpaBuilder.Actions.press())
					.description(Utils.formatMessage("Pressing header '{0}' Share button", this.getIdentifier()))
					.success(APIHelper.createSaveAsTileCheckBuilder(mState));
			}

			return this.prepareResult(oOverflowToolbarBuilder.execute());
		};

		/**
		 * Checks the <code>Send Email</code> action.
		 *
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 *
		 * @public
		 */
		HeaderAssertionsLR.prototype.iCheckSendEmail = function(mState) {
			var oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sPageId),
				sShareId = "fe::Share";

			if (mState && mState.visible === false) {
				oOverflowToolbarBuilder
					.hasContent(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sShareId))), mState)
					.description(Utils.formatMessage("Checking header '{0}' Share button with state='{1}'", this.getIdentifier(), mState));
			} else {
				oOverflowToolbarBuilder
					.doOnContent(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sShareId))), OpaBuilder.Actions.press())
					.description(Utils.formatMessage("Pressing header '{0}' Share button", this.getIdentifier()))
					.success(APIHelper.createSendEmailCheckBuilder(mState));
			}

			return this.prepareResult(oOverflowToolbarBuilder.execute());
		};

		return HeaderAssertionsLR;
	}
);
