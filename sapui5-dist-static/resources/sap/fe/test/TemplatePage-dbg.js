sap.ui.define(
	[
		"sap/ui/test/OpaBuilder",
		"sap/ui/test/Opa5",
		"sap/ui/core/util/ShortcutHelper",
		"sap/fe/test/Utils",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MdcFieldBuilder",
		"sap/fe/test/builder/MacroFieldBuilder",
		"sap/fe/test/builder/MdcTableBuilder",
		"sap/fe/test/builder/DialogBuilder",
		"sap/fe/test/api/DialogType",
		"sap/fe/test/api/DialogActions",
		"sap/fe/test/api/DialogAssertions",
		"sap/fe/test/api/DialogMessageActions",
		"sap/fe/test/api/DialogMessageAssertions",
		"sap/fe/test/api/DialogValueHelpActions",
		"sap/fe/test/api/DialogValueHelpAssertions",
		"sap/fe/test/api/DialogCreateActions",
		"sap/fe/test/api/DialogCreateAssertions",
		"sap/fe/test/api/TableAssertions",
		"sap/fe/test/api/TableActions",
		"sap/fe/test/api/ChartAssertions",
		"sap/fe/test/api/ChartActions",
		"sap/fe/test/builder/MdcFilterBarBuilder",
		"sap/fe/test/api/FilterBarAssertions",
		"sap/fe/test/api/FilterBarActions",
		"sap/base/util/deepEqual",
		"sap/ushell/resources"
	],
	function(
		OpaBuilder,
		Opa5,
		ShortcutHelper,
		Utils,
		FEBuilder,
		FieldBuilder,
		MacroFieldBuilder,
		TableBuilder,
		DialogBuilder,
		DialogType,
		DialogActions,
		DialogAssertions,
		DialogMessageActions,
		DialogMessageAssertions,
		DialogValueHelpActions,
		DialogValueHelpAssertions,
		DialogCreateActions,
		DialogCreateAssertions,
		TableAssertions,
		TableActions,
		ChartAssertions,
		ChartActions,
		FilterBarBuilder,
		FilterBarAssertions,
		FilterBarActions,
		deepEqual,
		resources
	) {
		"use strict";

		function _getTableBuilder(vOpaInstance, vTableIdentifier) {
			var oTableBuilder = TableBuilder.create(vOpaInstance);
			if (Utils.isOfType(vTableIdentifier, String)) {
				oTableBuilder.hasProperties({ header: vTableIdentifier });
			} else {
				oTableBuilder.hasId(vTableIdentifier.id);
			}
			return oTableBuilder;
		}

		function _getFilterBarBuilder(vOpaInstance, vFilterBarIdentifier) {
			return FilterBarBuilder.create(vOpaInstance).hasId(vFilterBarIdentifier.id);
		}

		function _getDialogAPI(vOpaInstance, vDialogIdentifier, bAction) {
			if (Utils.isOfType(vDialogIdentifier, String, true)) {
				vDialogIdentifier = { type: DialogType.Confirmation, title: vDialogIdentifier };
			}

			var oDialogBuilder = DialogBuilder.create(vOpaInstance);
			switch (vDialogIdentifier.type) {
				case DialogType.ValueHelp:
					// oDialogBuilder.hasAggregation("content", FEBuilder.Matchers.state("controlType", "sap.ui.mdc.field.ValueHelpPanel"));
					if (vDialogIdentifier.property) {
						oDialogBuilder.has(
							FEBuilder.Matchers.id(
								RegExp(
									Utils.formatMessage("::FieldValueHelp::{0}-dialog$", vDialogIdentifier.property.replaceAll("/", "::"))
								)
							)
						);
					}
					return bAction
						? new DialogValueHelpActions(oDialogBuilder, vDialogIdentifier)
						: new DialogValueHelpAssertions(oDialogBuilder, vDialogIdentifier);
				case DialogType.Error:
					oDialogBuilder.hasProperties({
						icon: "sap-icon://message-error",
						title: "Error" // TODO localized?!
					});
					return bAction
						? new DialogActions(oDialogBuilder, vDialogIdentifier)
						: new DialogAssertions(oDialogBuilder, vDialogIdentifier);
				case DialogType.Message:
					oDialogBuilder.hasAggregation("content", FEBuilder.Matchers.state("controlType", "sap.m.MessageView"));
					return bAction
						? new DialogMessageActions(oDialogBuilder, vDialogIdentifier)
						: new DialogMessageAssertions(oDialogBuilder, vDialogIdentifier);
				case DialogType.Create:
					return bAction
						? new DialogCreateActions(oDialogBuilder, vDialogIdentifier)
						: new DialogCreateAssertions(oDialogBuilder, vDialogIdentifier);
				default:
					return bAction
						? new DialogActions(oDialogBuilder, vDialogIdentifier)
						: new DialogAssertions(oDialogBuilder, vDialogIdentifier);
			}
		}

		// assertions
		/**
		 * Shortcut for <code>&nbsp;onDialog({ type: sap.fe.test.api.DialogType.Confirmation })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogAssertions} The available dialog assertions
		 * @function
		 * @name sap.fe.test.TemplatePage.assertions#onConfirmationDialog
		 * @public
		 */
		/**
		 * Shortcut for <code>&nbsp;onDialog({ type: sap.fe.test.api.DialogType.ValueHelp })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogValueHelpAssertions} The available dialog assertions
		 * @function
		 * @name sap.fe.test.TemplatePage.assertions#onValueHelpDialog
		 * @public
		 */
		/**
		 * Shortcut for <code>&nbsp;onDialog({ type: sap.fe.test.api.DialogType.Message })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogMessageAssertions} The available dialog assertions
		 * @function
		 * @name sap.fe.test.TemplatePage.assertions#onMessageDialog
		 * @public
		 */
		/**
		 * Shortcut for <code>&nbsp;onDialog({ type: sap.fe.test.api.DialogType.Error })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogAssertions} The available dialog assertions
		 * @function
		 * @name sap.fe.test.TemplatePage.assertions#onErrorDialog
		 * @public
		 */
		/**
		 * Shortcut for <code>&nbsp;onDialog({ type: sap.fe.test.api.DialogType.Action })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogAssertions} The available dialog assertions
		 * @function
		 * @name sap.fe.test.TemplatePage.assertions#onActionDialog
		 * @public
		 */
		/**
		 * Shortcut for <code>&nbsp;onDialog({ type: sap.fe.test.api.DialogType.Create })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogCreateAssertions} The available dialog assertions
		 * @function
		 * @name sap.fe.test.TemplatePage.assertions#onCreateDialog
		 * @public
		 */
		// actions
		/**
		 * Shortcut for <code>&nbsp;onDialog({ type: sap.fe.test.api.DialogType.Confirmation })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogActions} The available dialog actions
		 * @function
		 * @name sap.fe.test.TemplatePage.actions#onConfirmationDialog
		 * @public
		 */
		/**
		 * Shortcut for <code>&nbsp;onDialog({ type: sap.fe.test.api.DialogType.ValueHelp })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogValueHelpActions} The available dialog actions
		 * @function
		 * @name sap.fe.test.TemplatePage.actions#onValueHelpDialog
		 * @public
		 */
		/**
		 * Shortcut for <code>&nbsp;onDialog({ type: sap.fe.test.api.DialogType.Message })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogMessageActions} The available dialog actions
		 * @function
		 * @name sap.fe.test.TemplatePage.actions#onMessageDialog
		 * @public
		 */
		/**
		 * Shortcut for <code>&nbsp;onDialog({ type: sap.fe.test.api.DialogType.Error })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogActions} The available dialog actions
		 * @function
		 * @name sap.fe.test.TemplatePage.actions#onErrorDialog
		 * @public
		 */
		/**
		 * Shortcut for <code>&nbsp;onDialog({ type: sap.fe.test.api.DialogType.Action })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogActions} The available dialog actions
		 * @function
		 * @name sap.fe.test.TemplatePage.actions#onActionDialog
		 * @public
		 */
		/**
		 * Shortcut for <code>&nbsp;onDialog({ type: sap.fe.test.api.DialogType.Create })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogCreateActions} The available dialog actions
		 * @function
		 * @name sap.fe.test.TemplatePage.actions#onCreateDialog
		 * @public
		 */
		function generateOnDialogShortcuts() {
			var oOnDialogFunctions = {};
			Object.keys(DialogType).forEach(function(sDialogType) {
				oOnDialogFunctions["on" + sDialogType + "Dialog"] = function() {
					return this.onDialog({ type: sDialogType });
				};
			});
			return oOnDialogFunctions;
		}

		/**
		 * @class Provides a test page definition for a template page with the corresponding parameters.
		 *
		 * @param {object | string} vViewId the viewId
		 * @param {...object} [aAdditionalPageDefinitions] Additional custom page functions, provided in an object containing <code>actions</code> and <code>assertions</code>
		 * @returns {sap.fe.test.TemplatePage} A list report page definition
		 * @name sap.fe.test.TemplatePage
		 * @hideconstructor
		 * @public
		 */
		function TemplatePage(vViewId, aAdditionalPageDefinitions) {
			var sViewId = Utils.isOfType(vViewId, String) ? vViewId : vViewId.viewId,
				aAdditionalPages = Array.prototype.slice.call(arguments, 1);

			return Utils.mergeObjects.apply(
				Utils,
				[
					{
						viewId: sViewId,
						/**
						 * TemplatePage actions
						 *
						 * @namespace sap.fe.test.TemplatePage.actions
						 * @public
						 */
						actions: Utils.mergeObjects(
							{
								_onTable: function(vTableIdentifier) {
									return new TableActions(_getTableBuilder(this, vTableIdentifier), vTableIdentifier);
								},
								_onChart: function(vChartIdentifier) {
									return new ChartActions(FEBuilder, vChartIdentifier);
								},
								_onFilterBar: function(vFilterBarIdentifier) {
									return new FilterBarActions(_getFilterBarBuilder(this, vFilterBarIdentifier), vFilterBarIdentifier);
								},
								/**
								 * Returns a {@link sap.fe.test.api.DialogActions} instance.
								 *
								 * @param {string | sap.fe.test.api.DialogIdentifier} vDialogIdentifier The identifier of the dialog, or its title
								 * @returns {sap.fe.test.api.DialogActions} The available dialog actions
								 * @function
								 * @name sap.fe.test.TemplatePage.actions#onDialog
								 * @public
								 */
								onDialog: function(vDialogIdentifier) {
									return _getDialogAPI(this, vDialogIdentifier, true);
								},
								iOpenVHOnActionDialog: function(sFieldName) {
									var sFieldId = "APD_::" + sFieldName + "-inner-vhi";
									return OpaBuilder.create(this)
										.hasId(sFieldId)
										.isDialogElement()
										.doPress()
										.description("Opening value help for '" + sFieldName + "'")
										.execute();
								},
								_iPressKeyboardShortcut: function(sId, sShortcut, mProperties, sType) {
									return OpaBuilder.create(this)
										.hasId(sId)
										.hasProperties(mProperties ? mProperties : {})
										.hasType(sType)
										.do(function(oElement) {
											var oNormalizedShorcut = ShortcutHelper.parseShortcut(sShortcut);
											oNormalizedShorcut.type = "keydown";
											oElement.$().trigger(oNormalizedShorcut);
										})
										.description("Execute keyboard shortcut " + sShortcut)
										.execute();
								},
								_iCollapseExpandPageHeader: function(bCollapse) {
									var oExpandedButtonMatcher = OpaBuilder.Matchers.resourceBundle(
											"tooltip",
											"sap.f",
											"COLLAPSE_HEADER_BUTTON_TOOLTIP"
										),
										oCollapsedButtonMatcher = OpaBuilder.Matchers.resourceBundle(
											"tooltip",
											"sap.f",
											"EXPAND_HEADER_BUTTON_TOOLTIP"
										);
									return OpaBuilder.create(this)
										.hasType("sap.m.Button")
										.has(OpaBuilder.Matchers.some(oExpandedButtonMatcher, oCollapsedButtonMatcher))
										.doConditional(
											bCollapse ? oExpandedButtonMatcher : oCollapsedButtonMatcher,
											OpaBuilder.Actions.press()
										)
										.description(
											Utils.formatMessage("{0} the current Page Header", bCollapse ? "Collapsing" : "Expanding")
										)
										.execute();
								}
							},
							generateOnDialogShortcuts()
						),
						/**
						 * Assertions that are available to all template pages used in SAP Fiori elements.
						 *
						 * @namespace sap.fe.test.TemplatePage.assertions
						 * @public
						 */
						assertions: Utils.mergeObjects(
							{
								_onTable: function(vTableIdentifier) {
									return new TableAssertions(_getTableBuilder(this, vTableIdentifier), vTableIdentifier);
								},
								_onChart: function(vChartIdentifier) {
									return new ChartAssertions(FEBuilder, vChartIdentifier);
								},
								_onFilterBar: function(vFilterBarIdentifier) {
									return new FilterBarAssertions(_getFilterBarBuilder(this, vFilterBarIdentifier), vFilterBarIdentifier);
								},
								/**
								 * Returns a {@link sap.fe.test.api.DialogAssertions} instance.
								 *
								 * @param {string | sap.fe.test.api.DialogIdentifier} vDialogIdentifier The identifier of the dialog, or its title
								 * @returns {sap.fe.test.api.DialogAssertions} The available dialog actions
								 * @function
								 * @alias sap.fe.test.TemplatePage.assertions#onDialog
								 * @public
								 */
								onDialog: function(vDialogIdentifier) {
									return _getDialogAPI(this, vDialogIdentifier, false);
								},
								/**
								 * Confirms the visibility of the current page.
								 *
								 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
								 *
								 * @function
								 * @name sap.fe.test.TemplatePage.assertions#iSeeThisPage
								 * @public
								 */
								iSeeThisPage: function() {
									return OpaBuilder.create(this)
										.hasId(sViewId)
										.viewId(null)
										.viewName(null)
										.description(Utils.formatMessage("Seeing the page '{0}'", sViewId))
										.execute();
								},
								iSeeFilterDefinedOnActionDialogValueHelp: function(sAction, sVHParameter, sFieldName, sValue) {
									return OpaBuilder.create(this)
										.hasId(sAction + "::" + sVHParameter + "::FilterBar::FilterField::" + sFieldName + "-inner")
										.isDialogElement()
										.hasAggregationProperties("tokens", { text: sValue })
										.description("Seeing filter for '" + sFieldName + "' set to '" + sValue + "'")
										.execute();
								},
								_iSeeTheMessageToast: function(sText) {
									return FEBuilder.createMessageToastBuilder(sText).execute(this);
								},
								_iSeeButtonWithText: function(sText, oButtonState) {
									return FEBuilder.create(this)
										.hasType("sap.m.Button")
										.hasProperties({ text: sText })
										.hasState(oButtonState)
										.checkNumberOfMatches(1)
										.description(
											Utils.formatMessage(
												"Seeing Button with text '{0}'" + (oButtonState ? " with state: '{1}'" : ""),
												sText,
												oButtonState
											)
										)
										.execute();
								},
								iSeeActionParameterContent: function(sFieldName, sContent) {
									var sFieldId = "APD_::" + sFieldName + "-inner",
										oBuilder = OpaBuilder.create(this)
											.hasId(sFieldId)
											.isDialogElement()
											.description("Seeing Action parameter '" + sFieldName + "' with content '" + sContent + "'");

									if (sContent) {
										oBuilder.hasProperties({ value: sContent });
									}
									return oBuilder.execute();
								},
								iSeePageHeaderButton: function(bCollapse) {
									return OpaBuilder.create(this)
										.hasType("sap.m.Button")
										.has(
											OpaBuilder.Matchers.resourceBundle(
												"tooltip",
												"sap.f",
												bCollapse ? "COLLAPSE_HEADER_BUTTON_TOOLTIP" : "EXPAND_HEADER_BUTTON_TOOLTIP"
											)
										)
										.description("Seeing the " + (bCollapse ? "Collapse" : "Expand") + " Page Header Button")
										.execute();
								},
								iSeeTileCreationMessage: function() {
									return this._iSeeTheMessageToast(resources.i18n.getText("tile_created_msg"));
								},
								iSeeMessageStrip: function(mProperties) {
									return OpaBuilder.create(this)
										.hasType("sap.m.MessageStrip")
										.hasProperties(mProperties)
										.description(Utils.formatMessage("Seeing message strip with properties='{0}'", mProperties))
										.execute();
								}
							},
							generateOnDialogShortcuts()
						)
					}
				].concat(aAdditionalPages)
			);
		}

		return TemplatePage;
	}
);
