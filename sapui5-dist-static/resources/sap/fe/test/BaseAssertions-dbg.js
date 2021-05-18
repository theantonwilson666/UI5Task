sap.ui.define(["sap/ui/test/Opa5", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder", "sap/fe/test/Utils"], function(
	Opa5,
	OpaBuilder,
	FEBuilder,
	Utils
) {
	"use strict";

	/**
	 * Constructs a new {@link sap.fe.test.Opa5} instance.
	 *
	 * @class All common assertions (<code>Then</code>) for all Opa tests are defined here.
	 *
	 * @alias sap.fe.test.BaseAssertions
	 * @public
	 */
	var BaseAssertions = Opa5.extend("sap.fe.test.BaseAssertions", {
		/**
		 * Checks whether a {@link sap.m.MessagePage} with given message is shown.
		 *
		 * @param {string} sMessage The message shown on the message page
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 *
		 * @function
		 * @name sap.fe.test.BaseAssertions#iSeeMessagePage
		 * @public
		 */
		iSeeMessagePage: function(sMessage) {
			return OpaBuilder.create(this)
				.hasType("sap.m.MessagePage")
				.hasProperties({ text: sMessage })
				.description(Utils.formatMessage("Error Page with message '{0}' is visible", sMessage))
				.execute();
		},
		/**
		 * Checks whether a {@link sap.m.MessageToast} with the given text is shown.
		 *
		 * @param {string} sText The text shown in the MessageToast
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 *
		 * @function
		 * @name sap.fe.test.BaseAssertions#iSeeMessageToast
		 * @public
		 */
		iSeeMessageToast: function(sText) {
			return FEBuilder.createMessageToastBuilder(sText).execute(this);
		}
	});

	return BaseAssertions;
});
