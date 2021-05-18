sap.ui.define(
	[
		"./DialogAssertions",
		"./FilterBarAPI",
		"./TableAPI",
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MdcFilterBarBuilder",
		"sap/fe/test/builder/MdcTableBuilder",
		"sap/fe/test/Utils"
	],
	function(DialogAssertions, FilterBarAPI, TableAPI, OpaBuilder, FEBuilder, FilterBarBuilder, TableBuilder, Utils) {
		"use strict";

		/**
		 * Constructs a new DialogValueHelpAssertions instance.
		 *
		 * @param {sap.fe.test.builder.DialogBuilder} oDialogBuilder The {@link sap.fe.test.builder.DialogBuilder} instance used to interact with the UI
		 * @param {string} [vDialogDescription] Description (optional) of the dialog to be used for logging messages
		 * @returns {sap.fe.test.api.DialogValueHelpAssertions} The new instance
		 *
		 * @extends sap.fe.test.api.DialogAssertions
		 * @alias sap.fe.test.api.DialogValueHelpAssertions
		 * @hideconstructor
		 * @class
		 * @public
		 */
		var DialogValueHelpAssertions = function(oDialogBuilder, vDialogDescription) {
			return DialogAssertions.call(this, oDialogBuilder, vDialogDescription, 1);
		};
		DialogValueHelpAssertions.prototype = Object.create(DialogAssertions.prototype);
		DialogValueHelpAssertions.prototype.constructor = DialogValueHelpAssertions;
		DialogValueHelpAssertions.prototype.isAction = false;

		/**
		 * Checks the filter bar.
		 *
		 * @param {object} [mState] Defines the expected state of the filter bar
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 *
		 * @public
		 */
		DialogValueHelpAssertions.prototype.iCheckFilterBar = function(mState) {
			return this.prepareResult(
				FilterBarBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.ui.mdc.filterbar.vh.FilterBar")
					.hasState(mState)
					.description(
						Utils.formatMessage(
							"Checking that the value help dialog '{0}' has a filter bar with state='{1}'",
							this.getIdentifier(),
							mState
						)
					)
					.execute()
			);
		};

		/**
		 * Checks a filter field.
		 * If <code>vConditionValues</code> is <code>undefined</code>, the current condition values are ignored.
		 *
		 * @param {object | sap.fe.test.api.FilterFieldIdentifier} vFieldIdentifier The identifier of the filter field
		 * @param {string|object|Array} [vConditionValues] The expected value(s) of the filter field
		 * @param {string} [sOperator] The expected operator
		 * @param {object} [mState] Defines the expected state of the filter field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 *
		 * @public
		 */
		DialogValueHelpAssertions.prototype.iCheckFilterField = function(vFieldIdentifier, vConditionValues, sOperator, mState) {
			var aArguments = Utils.parseArguments([[String, Object], [String, Array, Object, Boolean], String, Object], arguments),
				oFilterBarBuilder = FilterBarBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.ui.mdc.filterbar.vh.FilterBar"),
				oFieldBuilder = FilterBarAPI.createFilterFieldBuilder(oFilterBarBuilder, aArguments[0], aArguments[3]);

			if (!aArguments[3] || aArguments[3].visible !== false) {
				oFieldBuilder.hasValue(aArguments[1], aArguments[2]);
			}

			return this.prepareResult(
				oFieldBuilder
					.description(
						Utils.formatMessage(
							"Checking that the field '{1}' in value help dialog '{0}' has condition values='{2}' and operator='{3}' and state='{4}'",
							this.getIdentifier(),
							aArguments[0],
							aArguments[1],
							aArguments[2],
							aArguments[3]
						)
					)
					.execute()
			);
		};

		/**
		 * Checks the search field in the filter bar. If the <code>sSearchText</code> parameter is <code>undefined</code>, the search text is not validated.
		 *
		 * @param {string} [sSearchText] The expected text in the search field
		 * @param {object} [mState] Defines the expected state of the search field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 *
		 * @public
		 */
		DialogValueHelpAssertions.prototype.iCheckSearchField = function(sSearchText, mState) {
			var aArguments = Utils.parseArguments([String, Object], arguments),
				oFilterBarBuilder = FilterBarBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.ui.mdc.filterbar.vh.FilterBar");
			return this.prepareResult(
				oFilterBarBuilder
					.hasSearchField(aArguments[0], aArguments[1])
					.description(
						Utils.formatMessage(
							"Checking that the search field on value help dialog '{0}' has search text '{1}' and state='{2}'",
							this.getIdentifier(),
							aArguments[0] || "",
							aArguments[1]
						)
					)
					.execute()
			);
		};

		/**
		 * Checks the table.
		 *
		 * @param {object} [mState] Defines the expected state of the search field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 *
		 * @public
		 */
		DialogValueHelpAssertions.prototype.iCheckTable = function(mState) {
			return this.prepareResult(
				TableBuilder.createWrapper(this.getOpaInstance(), "sap.m.Table")
					.isDialogElement()
					.hasState(mState)
					.description(
						Utils.formatMessage(
							"Checking that the value help dialog '{0}' has a table with state='{1}'",
							this.getIdentifier(),
							mState
						)
					)
					.execute()
			);
		};

		/**
		 * Checks the rows of a table.
		 * If <code>mRowValues</code> is provided, only rows with the corresponding values are considered.
		 * If <code>iNumberOfRows</code> is provided, the number of rows are checked with respect to the provided <code>mRowValues</code> (if set) or in total.
		 * If <code>iNumberOfRows</code> is omitted, it checks for at least one matching row.
		 * If <code>mState</code> is provided, the row must be in the given state.
		 *
		 * @param {object} [mRowValues] Defines the row values of the target row. The pattern is:
		 * <code><pre>
		 * 	{
		 * 		&lt;column-name-or-index>: &lt;expected-value>
		 *  }
		 * </pre></code>
		 * @param {number} [iExpectedNumberOfRows] The expected number of rows considering <code>mRowValues</code> and <code>mRowState</code>
		 * @param {object} [mState] Defines the expected state of the target row
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 *
		 * @public
		 */
		DialogValueHelpAssertions.prototype.iCheckRows = function(mRowValues, iExpectedNumberOfRows, mState) {
			var aArguments = Utils.parseArguments([Object, Number, Object], arguments),
				iNumberOfRows = aArguments[1],
				aRowMatcher = TableAPI.createRowMatchers(aArguments[0], aArguments[2]),
				oTableBuilder = TableBuilder.createWrapper(this.getOpaInstance(), "sap.m.Table").isDialogElement();

			// the order of the matchers matters here
			if (aRowMatcher.length) {
				// if matchers are defined, first match rows then check number of results
				oTableBuilder.hasRows(aRowMatcher, true).has(function(aRows) {
					return Utils.isOfType(iNumberOfRows, Number) ? aRows.length === iNumberOfRows : aRows.length > 0;
				});
			} else {
				// if no row matchers are defined, check the numbers of row based on table (binding)
				oTableBuilder
					.hasNumberOfRows(iNumberOfRows)
					// but still ensure that matcher returns the row aggregation
					.hasRows(null, true);
			}

			return this.prepareResult(
				oTableBuilder
					.description(
						Utils.formatMessage(
							"Checking that the table on value help dialog '{0}' has {1} rows with values='{2}' and state='{3}'",
							this.getIdentifier(),
							iNumberOfRows === undefined ? "> 0" : iNumberOfRows,
							aArguments[0],
							aArguments[2]
						)
					)
					.execute()
			);
		};

		function _checkTabBuilder(oApiInstance, sIdSuffix, mState) {
			var oBuilder = FEBuilder.create(oApiInstance.getOpaInstance())
					.isDialogElement()
					.mustBeVisible(false)
					.hasType("sap.m.IconTabFilter")
					.description(
						Utils.formatMessage(
							"Checking that the tab '{1}' on value help dialog '{0}' has state='{2}'",
							oApiInstance.getIdentifier(),
							sIdSuffix,
							mState
						)
					),
				oTabIdMatcher = FEBuilder.Matchers.id(RegExp(sIdSuffix + "$"));

			if (mState && mState.visible === false) {
				oBuilder.check(function(aIconTabFilters) {
					return OpaBuilder.Matchers.filter(oTabIdMatcher)(aIconTabFilters).length === 0;
				});
			} else {
				oBuilder.has(oTabIdMatcher).hasState(mState);
			}

			return oApiInstance.prepareResult(oBuilder.execute());
		}

		/**
		 * Checks the <code>Search and Select</code> tab.
		 *
		 * @param {object} [mState] Defines the expected state of the filter bar
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 *
		 * @public
		 */
		DialogValueHelpAssertions.prototype.iCheckSearchAndSelect = function(mState) {
			return _checkTabBuilder(this, "-VHP--fromList", mState);
		};

		/**
		 * Checks the <code>Define conditions</code> tab.
		 *
		 * @param {object} [mState] Defines the expected state of the filter bar
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 *
		 * @public
		 */
		DialogValueHelpAssertions.prototype.iCheckDefineConditions = function(mState) {
			return _checkTabBuilder(this, "-VHP--defineCondition", mState);
		};

		return DialogValueHelpAssertions;
	}
);
