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
	 * @class All common actions (<code>When</code>) for all Opa tests are defined here.
	 *
	 * @alias sap.fe.test.BaseActions
	 * @public
	 */
	var BaseActions = Opa5.extend("sap.fe.test.BaseActions", {
		/**
		 * Closes the open popover via function.
		 *
		 * NOTE: This function ensures that a certain UI state is maintained in some exceptional cases.
		 * This function isn't usually called directly in a journey.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 *
		 * @function
		 * @name sap.fe.test.BaseActions#iClosePopover
		 * @public
		 */
		iClosePopover: function() {
			return FEBuilder.createClosePopoverBuilder(this)
				.description("Closing open popover")
				.execute();
		},
		/**
		 * Simulates the pressing of the Esc key for the element in focus.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 *
		 * @function
		 * @name sap.fe.test.BaseActions#iPressEscape
		 * @public
		 */
		iPressEscape: function() {
			return FEBuilder.create(this)
				.has(FEBuilder.Matchers.FOCUSED_ELEMENT)
				.do(FEBuilder.Actions.keyboardShortcut("Escape"))
				.description("Pressing escape button")
				.execute();
		},
		/**
		 * Waits for the specified amount of milliseconds.
		 *
		 * NOTE: Use this function with care, as waiting for a specified timeframe only makes sense in exceptional cases.
		 *
		 * @param {number} iMilliseconds The amount of milliseconds to wait before proceeding
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 *
		 * @function
		 * @name sap.fe.test.BaseActions#iWait
		 * @private
		 */
		iWait: function(iMilliseconds) {
			var bWaitingPeriodOver = false,
				bFirstTime = true;
			return FEBuilder.create(this)
				.check(function() {
					if (bFirstTime) {
						bFirstTime = false;
						setTimeout(function() {
							bWaitingPeriodOver = true;
						}, iMilliseconds);
					}
					return bWaitingPeriodOver;
				})
				.description(Utils.formatMessage("Waiting for '{0}' milliseconds ", iMilliseconds))
				.execute();
		},
		/**
		 * Emulates a browser back navigation.
		 *
		 * NOTE: If the application is executed within the FLP, use {@link sap.fe.test.Shell#iNavigateBack} instead.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 *
		 * @function
		 * @name sap.fe.test.BaseActions#iNavigateBack
		 * @private
		 */
		iNavigateBack: function() {
			return OpaBuilder.create(this)
				.viewId(null)
				.do(function() {
					Opa5.getWindow().history.back();
				})
				.description("Navigating back via browser back")
				.execute();
		}
	});

	return BaseActions;
});
