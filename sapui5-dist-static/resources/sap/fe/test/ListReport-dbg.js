sap.ui.define(
	[
		"sap/fe/test/Utils",
		"./TemplatePage",
		"sap/ui/test/Opa5",
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MacroFieldBuilder",
		"sap/fe/test/builder/VMBuilder",
		"sap/fe/test/builder/OverflowToolbarBuilder",
		"sap/fe/test/api/FooterActionsBase",
		"sap/fe/test/api/FooterAssertionsBase",
		"sap/fe/test/api/HeaderActionsLR",
		"sap/fe/test/api/HeaderAssertionsLR"
	],
	function(
		Utils,
		TemplatePage,
		Opa5,
		OpaBuilder,
		FEBuilder,
		FieldBuilder,
		VMBuilder,
		OverflowToolbarBuilder,
		FooterActionsBase,
		FooterAssertionsBase,
		HeaderActionsLR,
		HeaderAssertionsLR
	) {
		"use strict";

		function getTableId(sIconTabProperty) {
			return "fe::table::" + sIconTabProperty + "::LineItem";
		}

		function getChartId(sEntityType) {
			return "fe::Chart::" + sEntityType + "::Chart";
		}

		function _getHeaderBuilder(vOpaInstance, sPageId) {
			return FEBuilder.create(vOpaInstance).hasId(sPageId);
		}

		/**
		 * Constructs a new ListReport definition.
		 *
		 * @class Provides a test page definition for a list report page with the corresponding parameters.
		 *
		 * Sample usage:
		 * <code><pre>
		 * var oListReportDefinition = new ListReport({ appId: "MyApp", componentId: "MyListReportId", entitySet: "MyEntitySet" });
		 * </pre></code>
		 *
		 * @param {object} oPageDefinition The required parameters
		 * @param {string} oPageDefinition.appId The app id (defined in the manifest root)
		 * @param {string} oPageDefinition.componentId The component id (defined in the target section for the list report within the manifest)
		 * @param {string} oPageDefinition.entitySet The entitySet (defined in the settings of the corresponding target component within the manifest)
		 * @param {...object} [aAdditionalPageDefinitions] Additional custom page functions, provided in an object containing <code>actions</code> and <code>assertions</code>
		 * @returns {sap.fe.test.ListReport} A list report page definition
		 * @name sap.fe.test.ListReport
		 * @extends sap.fe.test.TemplatePage
		 * @public
		 */
		function ListReport(oPageDefinition, aAdditionalPageDefinitions) {
			var sAppId = oPageDefinition.appId,
				sComponentId = oPageDefinition.componentId,
				sEntityPath = oPageDefinition.entitySet,
				ViewId = sAppId + "::" + sComponentId,
				SingleTableId = "fe::table::" + sEntityPath + "::LineItem",
				SingleChartId = "fe::Chart::" + sEntityPath + "::Chart",
				FilterBarId = "fe::FilterBar::" + sEntityPath,
				FilterBarVHDId = FilterBarId + "::FilterFieldValueHelp::",
				oResourceBundleCore = sap.ui.getCore().getLibraryResourceBundle("sap.fe.core"),
				IconTabBarId = "fe::TabMultipleMode",
				PageId = "fe::ListReport",
				aAdditionalPageDefinitions = Array.isArray(arguments[1]) ? arguments[1] : Array.prototype.slice.call(arguments, 1);

			return TemplatePage.apply(
				TemplatePage,
				[
					ViewId,
					{
						/**
						 * ListReport actions
						 *
						 * @namespace sap.fe.test.ListReport.actions
						 * @extends sap.fe.test.TemplatePage.actions
						 * @public
						 */
						actions: {
							/**
							 * Returns a {@link sap.fe.test.api.TableActions} instance for the specified table.
							 *
							 * @param {string | sap.fe.test.api.TableIdentifier} vTableIdentifier The identifier of the table, or its header title
							 * @returns {sap.fe.test.api.TableActions} The available table actions
							 * @function
							 * @name sap.fe.test.ListReport.actions#onTable
							 * @public
							 */
							onTable: function(vTableIdentifier) {
								var sTableId;
								if (vTableIdentifier) {
									sTableId = !Utils.isOfType(vTableIdentifier, String)
										? getTableId(vTableIdentifier.property)
										: vTableIdentifier;
								} else {
									sTableId = SingleTableId;
								}
								return this._onTable({ id: sTableId });
							},
							onChart: function(vChartIdentifier) {
								var sChartId;
								if (vChartIdentifier) {
									sChartId = !Utils.isOfType(vChartIdentifier, String)
										? getChartId(vChartIdentifier.property)
										: vChartIdentifier;
								} else {
									sChartId = SingleChartId;
								}
								return this._onChart({
									id: sChartId
								});
							},
							/**
							 * Returns a {@link sap.fe.test.api.FilterBarActions} instance.
							 *
							 * @returns {sap.fe.test.api.FilterBarActions} The available filter bar actions
							 * @function
							 * @alias sap.fe.test.ListReport.actions#onFilterBar
							 * @public
							 */
							onFilterBar: function() {
								return this._onFilterBar({ id: FilterBarId });
							},
							/**
							 * Returns a {@link sap.fe.test.api.HeaderActionsLR} instance.
							 *
							 * @returns {sap.fe.test.api.HeaderActionsLR} The available header actions
							 * @function
							 * @alias sap.fe.test.ListReport.actions#onHeader
							 * @public
							 */
							onHeader: function() {
								return new HeaderActionsLR(_getHeaderBuilder(this, PageId), { id: PageId });
							},
							/**
							 * Collapses or expands the page header.
							 *
							 * @param {boolean} [bCollapse] Defines whether the header should be collapsed, else it is expanded (default)
							 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
							 *
							 * @function
							 * @name sap.fe.test.ListReport.actions#iCollapseExpandPageHeader
							 * @public
							 */
							iCollapseExpandPageHeader: function(bCollapse) {
								return this._iCollapseExpandPageHeader(bCollapse);
							},
							iExecuteActionOnDialog: function(sText) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Button")
									.hasProperties({ text: sText })
									.isDialogElement()
									.doPress()
									.description("Pressing dialog button '" + sText + "'")
									.execute();
							},
							iOpenIconTabWithTitle: function(sName) {
								return OpaBuilder.create(this)
									.hasId(IconTabBarId)
									.has(OpaBuilder.Matchers.aggregation("items", OpaBuilder.Matchers.properties({ text: sName })))
									.doPress()
									.description("Selecting Icon Tab " + sName)
									.execute();
							},
							iSaveVariant: function(sVariantName, bSetAsDefault, bApplyAutomatically) {
								var aArguments = Utils.parseArguments([String, Boolean, Boolean], arguments),
									oVMBuilder = VMBuilder.create(this).hasId("fe::PageVariantManagement");

								if (aArguments[0]) {
									oVMBuilder
										.doSaveAs(sVariantName, bSetAsDefault, bApplyAutomatically)
										.description(
											Utils.formatMessage(
												"Saving variant for '{0}' as '{1}' with default='{2}' and applyAutomatically='{3}'",
												"Page Variant",
												sVariantName,
												!!bSetAsDefault,
												!!bApplyAutomatically
											)
										);
								} else {
									oVMBuilder
										.doSave()
										.description(Utils.formatMessage("Updating current variant for '{0}'", "Page Variant"));
								}
								return oVMBuilder.execute();
							},
							iSelectVariant: function(sVariantName) {
								return VMBuilder.create(this)
									.hasId("fe::PageVariantManagement")
									.doSelectVariant(sVariantName)
									.description(Utils.formatMessage("Selecting variant '{1}' from '{0}'", "Page Variant", sVariantName))
									.execute();
							}
						},
						/**
						 * ListReport assertions
						 *
						 * @namespace sap.fe.test.ListReport.assertions
						 * @extends sap.fe.test.TemplatePage.assertions
						 * @public
						 */
						assertions: {
							/**
							 * Returns a {@link sap.fe.test.api.TableAssertions} instance for the specified table.
							 *
							 * @param {string | sap.fe.test.api.TableIdentifier} vTableIdentifier The identifier of the table, or its header title
							 * @returns {sap.fe.test.api.TableAssertions} The available table assertions
							 * @function
							 * @alias sap.fe.test.ListReport.assertions#onTable
							 * @public
							 */
							onTable: function(vTableIdentifier) {
								if (!vTableIdentifier) {
									vTableIdentifier = { id: SingleTableId };
								} else {
									var sTableProperty = !Utils.isOfType(vTableIdentifier, String)
										? vTableIdentifier.property
										: vTableIdentifier;
									vTableIdentifier = { id: getTableId(sTableProperty) };
								}

								return this._onTable(vTableIdentifier);
							},
							onChart: function(vChartIdentifier) {
								var sChartId;
								if (vChartIdentifier) {
									sChartId = !Utils.isOfType(vChartIdentifier, String)
										? getChartId(vChartIdentifier.property)
										: vChartIdentifier;
								} else {
									sChartId = SingleChartId;
								}
								return this._onChart({
									id: sChartId
								});
							},
							/**
							 * Returns a {@link sap.fe.test.api.FilterBarAssertions} instance.
							 *
							 * @returns {sap.fe.test.api.FilterBarAssertions} the available filter bar assertions
							 * @function
							 * @alias sap.fe.test.ListReport.assertions#onFilterBar
							 * @public
							 */
							onFilterBar: function() {
								return this._onFilterBar({ id: FilterBarId });
							},
							/**
							 * Returns a {@link sap.fe.test.api.HeaderAssertionsLR} instance.
							 *
							 * @returns {sap.fe.test.api.HeaderAssertionsLR} the available header assertions
							 * @function
							 * @alias sap.fe.test.ListReport.assertions#onHeader
							 * @public
							 */
							onHeader: function() {
								return new HeaderAssertionsLR(_getHeaderBuilder(this, PageId), { id: PageId });
							},
							iSeeTheMessageToast: function(sText) {
								return this._iSeeTheMessageToast(sText);
							},
							iSeeFilterFieldsInFilterBar: function(iNumberOfFilterFields) {
								return OpaBuilder.create(this)
									.hasId(FilterBarId)
									.hasAggregationLength("filterItems", iNumberOfFilterFields)
									.description("Seeing filter bar with " + iNumberOfFilterFields + " filter fields")
									.execute();
							},
							iSeeTableCellWithActions: function(sPath, nCellPos, sButtonText) {
								return OpaBuilder.create(this)
									.hasType("sap.m.ColumnListItem")
									.has(OpaBuilder.Matchers.bindingPath(sPath))
									.has(function(row) {
										var cell = row.getCells()[nCellPos];
										if (cell.isA("sap.fe.macros.MacroAPI")) {
											cell = cell.getContent();
										}
										return cell.getMetadata().getElementName() === "sap.m.Button" && cell.getText() === sButtonText;
									})
									.description("Inline Action is present in the table cell with the Text " + sButtonText)
									.execute();
							},
							iSeeLinkWithText: function(sText) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Link")
									.hasProperties({ text: sText })
									.description("Seeing link with text '" + sText + "'")
									.execute();
							},
							iSeeContactPopoverWithAvatarImage: function(sImageSource) {
								return OpaBuilder.create(this)
									.hasType("sap.ui.mdc.link.Panel")
									.check(function(avatars) {
										var bFound = avatars.some(function(avatar) {
											return avatar.src === sImageSource;
										});
										return bFound === false;
									}, true)
									.description("Seeing Contact Card with Avatar Image in ListReport")
									.execute();
							},
							iSeeLabelWithText: function(sText) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Label")
									.hasProperties({ text: sText })
									.description("Not Seeing label with text '" + sText + "'")
									.execute();
							},
							iSeeSummaryOfAppliedFilters: function() {
								var sAppliedFilters;
								OpaBuilder.create(this)
									.hasId(FilterBarId)
									.mustBeVisible(false)
									.do(function(oFilterbar) {
										sAppliedFilters = oFilterbar.getAssignedFiltersText().filtersText;
									})
									.execute();
								return OpaBuilder.create(this)
									.hasType("sap.f.DynamicPageTitle")
									.has(function(oDynamicPageTitle) {
										return oDynamicPageTitle.getSnappedContent()[0].getText() === sAppliedFilters;
									})
									.description("The correct text on the collapsed filterbar is displayed")
									.execute();
							},
							iSeeDeleteConfirmation: function() {
								return this._iSeeTheMessageToast(
									oResourceBundleCore.getText("C_TRANSACTION_HELPER_OBJECT_PAGE_DELETE_TOAST_SINGULAR")
								);
							},
							iSeePageTitle: function(sTitle) {
								return OpaBuilder.create(this)
									.hasType("sap.f.DynamicPageTitle")
									.hasAggregationProperties("heading", { text: sTitle })
									.description("Seeing title '" + sTitle + "'")
									.execute();
							},
							iSeeVariantTitle: function(sTitle) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Title")
									.hasId("fe::PageVariantManagement-text")
									.hasProperties({ text: sTitle })
									.description("Seeing variant title '" + sTitle + "'")
									.execute();
							},
							iSeeControlVMFilterBarTitle: function(sTitle) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Title")
									.hasId(FilterBarId + "::VariantManagement-text")
									.hasProperties({ text: sTitle })
									.description("Seeing variant title '" + sTitle + "'")
									.execute();
							},
							iSeeControlVMTableTitle: function(sTitle, sIconTabProperty) {
								var sTableId = sIconTabProperty ? getTableId(sIconTabProperty) : SingleTableId;
								return OpaBuilder.create(this)
									.hasType("sap.m.Title")
									.hasId(sTableId + "::VM-text")
									.hasProperties({ text: sTitle })
									.description("Seeing variant title '" + sTitle + "'")
									.execute();
							},
							iSeeVariantModified: function(bIsModified, bControl) {
								var sLabelId;
								if (bControl) {
									sLabelId = FilterBarId + "::VariantManagement-modified";
								} else {
									sLabelId = "fe::PageVariantManagement-modified";
								}

								bIsModified = bIsModified === undefined ? true : bIsModified;
								if (bIsModified) {
									return OpaBuilder.create(this)
										.hasType("sap.m.Label")
										.hasId(sLabelId)
										.hasProperties({ text: "*" })
										.description("Seeing variant state as 'modified'")
										.execute();
								} else {
									return OpaBuilder.create(this)
										.hasType("sap.m.Label")
										.check(function(oLabels) {
											return !oLabels.some(function(oLabel) {
												return oLabel.getId() === sLabelId;
											});
										}, true)
										.description("Seeing variant state as 'not modified'")
										.execute();
								}
							},
							iSeePageVM: function(mState) {
								return FEBuilder.create(this)
									.hasId("fe::PageVariantManagement")
									.hasState(mState)
									.description(Utils.formatMessage("Seeing page VM with state '{0}'", mState))
									.execute();
							},
							iSeeControlVMFilterBar: function() {
								return OpaBuilder.create(this)
									.hasId(FilterBarId + "::VariantManagement")
									.description("Seeing control VM - FilterBar")
									.execute();
							},
							iSeeDraftIndicator: function() {
								return OpaBuilder.create(this)
									.hasType("sap.m.Link")
									.hasProperties({
										text: oResourceBundleCore.getText("C_DRAFT_POPOVER_ADMIN_DATA_DRAFTINFO_DRAFT_OBJECT")
									})
									.description("Draft indicator is visible")
									.execute();
							},
							iSeeDraftIndicatorLocked: function(user) {
								var text =
									oResourceBundleCore.getText("C_DRAFT_POPOVER_ADMIN_DATA_DRAFTINFO_LOCKED_OBJECT") +
									" " +
									oResourceBundleCore.getText("C_EDIT_FLOW_OWNER", [user]);
								return OpaBuilder.create(this)
									.hasType("sap.m.Link")
									.hasProperties({ text: text })
									.description("Draft indicator is visible and displays '" + text + "'")
									.execute();
							},
							iSeeIconTabWithProperties: function(mProperties) {
								return (
									OpaBuilder.create(this)
										.hasId(IconTabBarId)
										.has(OpaBuilder.Matchers.aggregationMatcher("items", OpaBuilder.Matchers.properties(mProperties)))
										//.hasAggregationProperties("items", mProperties)
										.description(Utils.formatMessage("Seeing Icon Tab with properties '{0}'", mProperties))
										.execute()
								);
							},
							iSeeNumOfOperators: function(sFieldName, numItems) {
								return OpaBuilder.create(this)
									.hasId(FilterBarVHDId + sFieldName + "-DCP")
									.doOnChildren(OpaBuilder.create(this).hasAggregationLength("items", numItems))
									.description("Seeing a value list of condition operators with " + numItems + " items.")
									.execute();
							},
							iCheckValueForFieldInCreateDialog: function(sFieldId, sValue, bIsRequired) {
								return FieldBuilder.create(this)
									.isDialogElement()
									.hasId(sFieldId)
									.hasValue(sValue)
									.hasProperties({ required: !!bIsRequired })
									.description(
										Utils.formatMessage("Seeing Create dialog parameter '{0}' with value '{1}'", sFieldId, sValue)
									)
									.execute();
							}
						}
					}
				].concat(aAdditionalPageDefinitions)
			);
		}

		return ListReport;
	}
);
