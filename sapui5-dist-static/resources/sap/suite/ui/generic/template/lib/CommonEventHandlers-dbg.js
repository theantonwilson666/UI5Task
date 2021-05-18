sap.ui.define(["sap/ui/base/Object",
	"sap/ui/base/Event",
	"sap/m/MessageBox",
	"sap/m/Table",
	"sap/ui/model/Sorter",
	"sap/suite/ui/generic/template/genericUtilities/controlHelper",
	"sap/suite/ui/generic/template/genericUtilities/testableHelper",
	"sap/ui/model/json/JSONModel","sap/ui/core/library",
	"sap/suite/ui/generic/template/js/AnnotationHelper",
	"sap/ui/generic/app/navigation/service/SelectionVariant",
	"sap/ui/core/mvc/Controller",
	"sap/suite/ui/generic/template/genericUtilities/FeLogger",
	"sap/suite/ui/generic/template/lib/MessageUtils",
	"sap/base/util/extend",
	"sap/base/util/isEmptyObject",
	"sap/ui/generic/app/library",
	"sap/suite/ui/generic/template/js/placeholderHelper",
	"sap/suite/ui/generic/template/genericUtilities/polyFill"
], function(BaseObject, Event, MessageBox, Table, Sorter,
	controlHelper, testableHelper, JSONModel, coreLibrary, AnnotationHelper, SelectionVariant, Controller, FeLogger, MessageUtils, extend, isEmptyObject, genericAppLibrary, placeholderHelper) {

	"use strict";

	var oLogger = new FeLogger("lib.CommonEventHandlers").getLogger();
	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	// static helper functions

	function fnExtractPropertiesFromContextObject(vContextObject){
		if (!vContextObject){
			return vContextObject;
		}
		if (Array.isArray(vContextObject)){
			return fnExtractPropertiesFromContextObject(vContextObject[0]);
		}
		var oRet = {};
		return getReturnContextObject(vContextObject,oRet);
	}

	// return context object to fnExtractPropertiesFromContextObject, if the incoming context is array or object
	function getReturnContextObject(vContextObject,oRet){
		var oObject = typeof vContextObject.getObject === "function" ? vContextObject.getObject() : vContextObject;
				for (var sKey in oObject){
					if (!sKey.startsWith("_")){
						oRet[sKey] = oObject[sKey];
					}
				}
		return oRet;
	}
	// the multi contexts has to be passed in an arrayformat for navigationHandler to process
	function fnExtractPropertiesFromContextObjectForMultiContexts(aContextArray){
		var oRet = [];
			for (var i = 0; i < aContextArray.length; i++){
				var oRejObj = {};
				oRet[i] = getReturnContextObject(aContextArray[i],oRejObj);
			}
			return oRet;
	}


	function getMethods(oController, oComponentUtils, oServices, oCommonUtils) {

		function getSmartTableFromEvent(oEvent){
			var oTable = oCommonUtils.getOwnerControl(oEvent.getSource());
			//getOwnerControl returns a responsive table control in case table type is responsive table
			return controlHelper.isMTable(oTable) ? oTable.getParent() : oTable;
		}

		function fnEvaluateParameters(oParameters){
			var result = {};
			for (var prop in oParameters){
				var oParameterValue = oParameters[prop];

				if (typeof oParameterValue === "string"){
					result[prop] = oParameterValue;
				} else if (typeof oParameterValue === "object"){
					if (oParameterValue.value){
						result[prop] = fnEvaluateParameters(oParameterValue).value;
					} else {
						result[prop] = oParameterValue;
					}
				}
			}
			return result;
		}

		// TODO: Check
		// Fix for BCP 1770053414 where error message is displayed instead of error code
		function fnHandleError(oError) {
			if (oError instanceof sap.ui.generic.app.navigation.service.NavError) {
				if (oError.getErrorCode() === "NavigationHandler.isIntentSupported.notSupported") {
					sap.m.MessageBox.show(oCommonUtils.getText("ST_NAV_ERROR_NOT_AUTHORIZED_DESC"), {
						title: oCommonUtils.getText("ST_GENERIC_ERROR_TITLE")
					});
				} else {
					sap.m.MessageBox.show(oError.getErrorCode(), {
						title: oCommonUtils.getText("ST_GENERIC_ERROR_TITLE")
					});
				}
			}
		}

		var mVirtualItems = Object.create(null);
        function storeObjectPageNavigationRelatedInformation(oRow, oState) {
			var iIdx = -1;
			var oTable = oCommonUtils.getOwnerControl(oRow);

			if (oTable.getTable) {
				oTable = oTable.getTable();
			}

			var bIsAnalyticalTbl = controlHelper.isAnalyticalTable(oTable);
			var oPaginatorInformation;

			if (!bIsAnalyticalTbl) { // up/down navigation is not enabled in the analytical table scenario

				// get the table list binding now
				var oTableBindingInfo = oCommonUtils.getTableBindingInfo(oTable);
				var oListBinding = oTableBindingInfo && oTableBindingInfo.binding;
				var aCurrContexts = null;

				if (oListBinding) {
					//Getting context for Tree Table.
					if (controlHelper.isTreeTable(oTable)) {
						var oContextsLenght = (oListBinding.getLength() > 0 ) ? oListBinding.getLength() : 0;
						if (oContextsLenght > 0) {
							aCurrContexts = [];
							for (var index = 0; index < oContextsLenght; index++) {
								aCurrContexts.push(oListBinding.getContextByIndex(index));
							}
						}
					} else	if (controlHelper.isUiTable(oTable)) {
						// possibly a bug in the UI5 framework itself .. getCurrentContexts() only returns the contexts of selected rows in the table
						aCurrContexts = oListBinding.getContexts();
					} else if (oTable instanceof Table) {
						aCurrContexts = oListBinding.getCurrentContexts();
					}
				}

				var oContext = null;
				var sSelectedBindingPath = null;
				if (oRow && oRow.getBindingContext && oRow.getBindingContext().getPath) {
					sSelectedBindingPath = oRow.getBindingContext() ? oRow.getBindingContext().getPath() : null;
				}

				// get index of selected item
				if (oListBinding && oListBinding.getContexts && sSelectedBindingPath) {
					for (var i = 0; i < aCurrContexts.length; i++) {
						oContext = aCurrContexts[i];
						if (oContext && oContext.getPath() === sSelectedBindingPath) {
							iIdx = i;
							break;
						}
					}
				}

				if (iIdx !== -1 && aCurrContexts.length > 0) {
					var iThreshold;

					if (oTable instanceof Table) {
						iThreshold = oTable.getGrowingThreshold();
					} else if (controlHelper.isUiTable(oTable)) {
						iThreshold = oTable.getThreshold();
					} // in all other cases a default value for the threshold will be determined by PaginatorButtonHelper on demand


					var oParent = oRow.getParent();
					var sParentId = oParent.getId();
					var fnPaginate = function(oContext){
						var oVirtualItem = mVirtualItems[sParentId];
						if (!oVirtualItem){
							var bIsRowSelected = oRow.isSelected && oRow.isSelected();
							oVirtualItem = oRow.clone();
							oVirtualItem.setParent(oParent);
							if (bIsRowSelected){ // if oRow was selected it has possibly lost this property when oVirtualItem was added to the same parent
								oRow.setSelected(true);
							}
							mVirtualItems[sParentId] = oVirtualItem;
						}
						oVirtualItem.setBindingContext(oContext);
						onListNavigate(oVirtualItem, oState, oContext, true);
					};

					oPaginatorInformation = aCurrContexts && {
						listBinding: oListBinding,
						growingThreshold: iThreshold,
						selectedRelativeIndex: iIdx,
						objectPageNavigationContexts: aCurrContexts,
						paginate: fnPaginate
					};
				}
			}
			oComponentUtils.setPaginatorInfo(oPaginatorInformation, true);
		}

		function onMultiSelectionChange(oEvent) {
			var oPlugin = oEvent.getSource(),
				oTable = oPlugin.getParent();

			oCommonUtils.setEnabledToolbarButtons(oTable);
		}

		function onSmartFieldUrlPressed(oEvent, oState) {
			var sUrl = oEvent.getSource().getUrl();
			oEvent.preventDefault();
			//determination if Url is pointing externally, and only then open in a new window - not yet implemented
			//only then the data loss popup is needed when replacing the existing page
			oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
				sap.m.URLHelper.redirect(sUrl, false);
				}, Function.prototype, oState);
		}


		var oSmartTableForDeleteDialog; // make the SmartTable accessible for the controller
		/**
		 * Return an instance of the DeleteConfirmation fragment
		 * @oSmartTable the SmartTable the entry is deleted from
		 * @return {sap.m.Dialog} - returns the Delete Confirmation Dialog
		 * @private
		 */
		function getDeleteDialog(oSmartTable) {
			oSmartTableForDeleteDialog = oSmartTable;
			return oCommonUtils.getDialogFragmentAsync("sap.suite.ui.generic.template.ListReport.view.fragments.DeleteConfirmation", {
				onCancel: function(oEvent) {
					var oDialog = oEvent.getSource().getParent();
					oDialog.close();
				},
				onDelete: function(oEvent) {
					var oDialog = oEvent.getSource().getParent();
					var oDialogModel = oDialog.getModel("delete");
					var aSelectedItems = oDialogModel.getProperty("/items");
					var aPathsToBeDeletedActive = []; // contains only active entities whose draft does not exist
					var aPathsToBeDeletedDraftActive = [];  // contains selected Drafts and all Active entities for fallback
					var aPathsToBeDeletedDActive = []; // contains active of draft entities
					var aDraftPathsToBeDeleted = [];   //contains target of draft only
					// determine which items to delete
					for (var i = 0; i < aSelectedItems.length; i++) {
						if (!aSelectedItems[i].draftStatus.locked && aSelectedItems[i].deletable) {
							if (!aSelectedItems[i].draftStatus.draft) {
								if (aSelectedItems[i].draftStatus.draftActive) {
									aPathsToBeDeletedDActive.push(aSelectedItems[i].context.sPath);
								} else if (aSelectedItems.length === oDialogModel.getProperty("/unsavedChangesItemsCount") || !aSelectedItems[i].draftStatus.unsavedChanges || oDialogModel.getProperty("/unsavedChangesCheckboxSelected")) {
									aPathsToBeDeletedActive.push(aSelectedItems[i].context.sPath);
								}
							} else {
								aPathsToBeDeletedDraftActive.push(aSelectedItems[i].context.sPath);
								aDraftPathsToBeDeleted.push(aSelectedItems[i].context.sPath);
							}
						}
					}
					aPathsToBeDeletedDraftActive =  aPathsToBeDeletedDraftActive.concat(aPathsToBeDeletedActive).concat(aPathsToBeDeletedDActive);
					var oSettings = {
						smartTable: oSmartTableForDeleteDialog,
						pathes: aPathsToBeDeletedDraftActive,
						onlyOneDraftPlusActive: aPathsToBeDeletedDraftActive.length === 2 && aDraftPathsToBeDeleted.length === 1 && aPathsToBeDeletedDActive.length === 1,
						suppressRefreshAllComponents: !(isFclWithNextObjectLoad() || isMultipleView()),
						withWarningDialog: true
					};
					var oDeletePromise = oServices.oCRUDManager.deleteEntities(oSettings);
					oDeletePromise.then(
						function(aFailedPath) {
							//BCP 1780101314
							var iCountDeletedDraftTargetMatch = 0;
							var aFailedTargetPath = [];
							var bWarningOccured = aFailedPath.some(function(oFailedPathInfo){
								return oFailedPathInfo.isWarning;
							});
							for (var i = 0; i < aFailedPath.length; i++) {
								//when property like unit of measure is included in the target property i.e. /EntityType(key='')/PropertyName
								aFailedTargetPath.push("/" + aFailedPath[i].sPath.split('/')[1]);
								if (aPathsToBeDeletedDActive.indexOf(aFailedTargetPath[i]) !== -1) {
									iCountDeletedDraftTargetMatch = iCountDeletedDraftTargetMatch + 1;
								}
							}
							var totalVisualDeleteCount = aPathsToBeDeletedDraftActive.length - aPathsToBeDeletedDActive.length;
							var totalVisualFailedCount = aFailedPath.length - iCountDeletedDraftTargetMatch;
							var iSuccessfullyDeleted = totalVisualDeleteCount - totalVisualFailedCount;

							if (totalVisualFailedCount > 0) {
								var sErrorMessage = "";
								if (iSuccessfullyDeleted > 0) {
									sErrorMessage += oCommonUtils.getText("ST_GENERIC_NOT_DELETED_RECORDS", [totalVisualFailedCount, totalVisualDeleteCount] );

								} else {
									sErrorMessage = (totalVisualFailedCount > 1) ?
										oCommonUtils.getText("ST_GENERIC_DELETE_ERROR_PLURAL") :
										oCommonUtils.getText("ST_GENERIC_DELETE_ERROR");
								}
								if (bWarningOccured) {
									sErrorMessage += "\n";
									if (totalVisualFailedCount === 1) {
										sErrorMessage += oCommonUtils.getText("ST_GENERIC_DELETE_WITH_WARNING_SUGGESTION_SINGULAR");
									} else {
										sErrorMessage += oCommonUtils.getText("ST_GENERIC_DELETE_WITH_WARNING_SUGGESTION_PLURAL");
									}
								}

								MessageBox.error(sErrorMessage);

							} else {
								var sSuccessMessage = "";
								sSuccessMessage = (iSuccessfullyDeleted > 1) ?
									oCommonUtils.getText("ST_GENERIC_DELETE_SUCCESS_PLURAL") :
									oCommonUtils.getText("ST_GENERIC_OBJECT_DELETED");

								MessageUtils.showSuccessMessageIfRequired(sSuccessMessage, oServices);
							}
						},
						// this could be a different message b/c the batch request has failed here
						// currently, delete is only possible all or nothing - just let error handling be done by busyHelper
						Function.prototype);
					oDialog.close();
				}
			}, "delete");
		}

		/**
		 * Return the boolean flag if next object to be loaded after the delete operation in FCL layout
		 *
		 * @return Boolean
		*/
		function isFclWithNextObjectLoad(){
			return oComponentUtils.getFclProxy() && oComponentUtils.getFclProxy().isNextObjectLoadedAfterDelete();
		}

		/**
		 * Return the boolean flag if it is Multiple View layout
		 *
		 * @return Boolean
		*/
		function isMultipleView(){
			return !!(oComponentUtils && oComponentUtils.getSettings() && oComponentUtils.getSettings().quickVariantSelectionX);
		}

		/**
		 * Return the promise containing draft's sibling entity
		 *
		 * @param {String} sPath - contains path of the entity
		 * @param {object} oModel - contains oDataModel
		 * @return Promise
		 * @private
		 */

		function createDraftSiblingPromise(sPath, oModel) {
		    return new Promise(function(fnResolve, fnReject) {
		        oModel.read(sPath + "/SiblingEntity", {
		            success: function(oResponseData) {
		                var sActive = "/" + oModel.getKey(oResponseData);
		                fnResolve(sActive);
		            },
		            error: function(oError) {
		                var sError = "Error";
		                fnResolve(sError);
		            }
		        });
		    });
		}

		/**
		 * Return the data necessary for the Delete Confirmation Dialog
		 *
		 * @param [sap.m.ListItemBase] selectedItems
		 * @param [sap.ui.comp.smarttable.SmartTable] oSmartTable
		 * @return {map} JSON map containing the data for the Delete Confirmation Dialog
		 * @private
		 */
		function getDataForDeleteDialog(selectedItems, oSmartTable) {
			var oModel = oController.getView().getModel();
			var oMetaModel = oModel.getMetaModel();
			var oEntitySet = oMetaModel.getODataEntitySet(oController.getOwnerComponent().getEntitySet());
			var oDeleteRestrictions = oEntitySet["Org.OData.Capabilities.V1.DeleteRestrictions"];
			var sDeletablePath = (oDeleteRestrictions && oDeleteRestrictions.Deletable &&  oDeleteRestrictions.Deletable.Path) ? oDeleteRestrictions.Deletable.Path : "";

			var mJSONData = {
				items: undefined,
				itemsCount: selectedItems.length,
				text: {
					title: undefined,
					text: undefined,
					unsavedChanges: undefined,
					longText: undefined,
					undeletableText: undefined
				},
				lockedItemsCount: 0,
				unsavedChangesItemsCount: 0,
				undeletableCount: 0,
				unsavedChangesCheckboxSelected: true,
				unsavedChangesCheckboxVisible: true,
				undeletableLocked: 0,
				tableMode: ""
			};

			// Enhance the items with their context and draft status. Also keep track of the number of locked and unsaved items
			// + Enhance with undeletable status and track number of undeletable items
			var aItems = [];
			var aActiveArray = []; // This array contains active entities of draft
			var oEntity, mDraftStatus, mActive, bDeletable, oActiveEntity, sLockedBy;
			var aPromise = [];

			for (var i = 0; i < selectedItems.length; i++) {
				oEntity = oModel.getObject(selectedItems[i].getPath());
				if (!oEntity.IsActiveEntity) { // if the entity is not an active entity, we can assume it is a draft
					if (oEntity.HasActiveEntity) {
						aPromise.push(
							createDraftSiblingPromise(selectedItems[i].getPath(), oModel)
						);
					}
				}
			}
			var iActiveIterator = 0;

			return new Promise(function(fnResolve, fnReject) {
				Promise.all(aPromise).then(function(aResponses) {
					for (var i = 0; i < selectedItems.length; i++) {
						oEntity = oModel.getObject(selectedItems[i].getPath());
						mDraftStatus = {};
						mActive = {};
						bDeletable = true;
						oActiveEntity = {};
						sLockedBy = false;

						if (sDeletablePath) {
							if (oModel.getProperty(sDeletablePath, selectedItems[i]) === false) {
								bDeletable = false;
								mJSONData.undeletableCount++;
							}
						}

						if (!oEntity.IsActiveEntity) { // if the entity is not an active entity, we can assume it is a draft
							mDraftStatus.draft = true;

							if (oEntity.HasActiveEntity) {
								mActive.draft = false;
								mActive.draftActive = true;

								if (aResponses[iActiveIterator] != "Error") {
								    oActiveEntity["oModel"] = selectedItems[0].getModel();
								    oActiveEntity["sPath"] = aResponses[iActiveIterator++];
								}
								//If active entity has delete restriction then draft also not deletable
								if (oActiveEntity.sPath && bDeletable && oModel.getProperty(sDeletablePath, oModel.getContext(oActiveEntity.sPath)) === false) {
									bDeletable = false;
									mJSONData.undeletableCount++;
								}
							}
						} else if (oEntity.HasDraftEntity) { // if the entity is an active entity AND has a draft entity, we can assume someone else has a draft of the entity
							// check if first and last name are provided. If not then take technical user name
							var sNameLockedBy = oModel.getProperty("DraftAdministrativeData/CreatedByUserDescription", selectedItems[i]) || oModel.getProperty("DraftAdministrativeData/CreatedByUser", selectedItems[i]) ;
							sLockedBy = oModel.getProperty("DraftAdministrativeData/InProcessByUser", selectedItems[i]);

							if (sLockedBy) { // if sLockedBy = '' --> unsavedChanges otherwise locked!
								if (bDeletable === false) {
									mJSONData.undeletableLocked++;
								}
								mDraftStatus.locked = true;
								mDraftStatus.user = sNameLockedBy;
								mJSONData.lockedItemsCount++;
							} else if (bDeletable) { // else the entity has unsaved changes, if its delete restricted do not increase unsavedcount or set as unsavedchanges
								mDraftStatus.unsavedChanges = true;
								mDraftStatus.user = sNameLockedBy;
								mJSONData.unsavedChangesItemsCount++;
							}
						}

						aItems.push({
							context: selectedItems[i],
							draftStatus: mDraftStatus,
							deletable: bDeletable
						});

						// Pushing Active entities of Draft
						if (!oEntity.IsActiveEntity && oEntity.HasActiveEntity) {
							aActiveArray.push({
								context : oActiveEntity,
								draftStatus : mActive,
								deletable : bDeletable
							});
						}
					}

					if (aActiveArray.length > 0) {
						aItems = aItems.concat(aActiveArray);
					}
					mJSONData.items = aItems;

					// determine unsavedChanges Checkbox text
					mJSONData.text.unsavedChanges = oCommonUtils.getText("ST_GENERIC_UNSAVED_CHANGES_CHECKBOX");
					// determine short text
					if (mJSONData.itemsCount > 1) {
						var iDeletableItems = 0;
						if (mJSONData.lockedItemsCount === mJSONData.itemsCount) {
							mJSONData.text.text = oCommonUtils.getText("ST_GENERIC_DELETE_LOCKED_PLURAL");
						} else if (mJSONData.unsavedChangesItemsCount === mJSONData.itemsCount && mJSONData.undeletableCount === 0 ) {
							mJSONData.text.text = oCommonUtils.getText("ST_GENERIC_DELETE_UNSAVED_CHANGES_PLURAL");
						} else if (mJSONData.lockedItemsCount > 0) {
							iDeletableItems = mJSONData.itemsCount - mJSONData.lockedItemsCount;
							// 1st part of message
							mJSONData.text.text = fnGetLockedAndUnsavedmessage(mJSONData.lockedItemsCount, "ST_GENERIC_CURRENTLY_LOCKED_PLURAL", "ST_GENERIC_CURRENTLY_LOCKED", [mJSONData.lockedItemsCount, mJSONData.itemsCount]);
							mJSONData.text.text += "\n";

							// 2nd part of message
							// if item is locked and is nondeletable active object then exclude from further calculation as their counts are already calculated for lockeditems
							mJSONData.undeletableCount = mJSONData.undeletableLocked > 0 ? mJSONData.undeletableCount - mJSONData.undeletableLocked : mJSONData.undeletableCount;
							 if (mJSONData.undeletableCount > 0 && iDeletableItems >= mJSONData.undeletableCount) {
								mJSONData.text.text += oCommonUtils.getText("ST_GENERIC_DELETE_UNDELETABLE", [mJSONData.undeletableCount, mJSONData.itemsCount]);
								iDeletableItems = iDeletableItems - mJSONData.undeletableCount;
								mJSONData.text.text += "\n";
							 }
							 if (mJSONData.unsavedChangesItemsCount && iDeletableItems === mJSONData.unsavedChangesItemsCount) {
                                mJSONData.text.text += fnGetLockedAndUnsavedmessage(iDeletableItems, "ST_GENERIC_DELETE_REMAINING_UNSAVED_CHANGES_PLURAL", "ST_GENERIC_DELETE_REMAINING_UNSAVED_CHANGES");
								iDeletableItems = 0; // as remaining all are unsaved changes
							}
						}  else if (mJSONData.undeletableCount > 0){
							iDeletableItems = mJSONData.itemsCount - mJSONData.undeletableCount;
							// 1st part of message
							mJSONData.text.text = oCommonUtils.getText("ST_GENERIC_DELETE_UNDELETABLE", [mJSONData.undeletableCount, mJSONData.itemsCount]);
							mJSONData.text.text += "\n";

							// 2nd part of message
							if ((mJSONData.unsavedChangesItemsCount && iDeletableItems === mJSONData.unsavedChangesItemsCount) || mJSONData.itemsCount === mJSONData.unsavedChangesItemsCount) {
                                mJSONData.text.text += fnGetLockedAndUnsavedmessage(iDeletableItems, "ST_GENERIC_DELETE_REMAINING_UNSAVED_CHANGES_PLURAL", "ST_GENERIC_DELETE_REMAINING_UNSAVED_CHANGES");
								iDeletableItems = 0;
							}
						} else {
							mJSONData.text.text = oCommonUtils.getText("ST_GENERIC_DELETE_SELECTED_PLURAL");
						}

						if (iDeletableItems > 0) {
							mJSONData.text.text += (iDeletableItems > 1) ? oCommonUtils.getText("ST_GENERIC_DELETE_REMAINING_PLURAL", [iDeletableItems]) : oCommonUtils.getText("ST_GENERIC_DELETE_REMAINING");
						}
					} else {
						var sTableMode;
						if ("getMode" in oSmartTable.getTable()) {
							sTableMode = oSmartTable.getTable().getMode();
						}
						if (mJSONData.lockedItemsCount > 0) {
							mJSONData.text.text = oCommonUtils.getText("ST_GENERIC_DELETE_LOCKED", [" ", mJSONData.items[0].draftStatus.user]);
						} else if (mJSONData.undeletableCount > 0) {
							if (sTableMode === "Delete") {
								mJSONData.tableMode = sTableMode;
							}
							mJSONData.text.text = oCommonUtils.getText("ST_GENERIC_NOT_DELETABLE");
						} else if (mJSONData.unsavedChangesItemsCount > 0) {
							mJSONData.text.text = oCommonUtils.getText("ST_GENERIC_DELETE_UNSAVED_CHANGES", [" ", mJSONData.items[0].draftStatus.user]);
						} else {
							mJSONData.text.text = fnGetSelectedItemContextForDeleteMessage(oSmartTable, selectedItems[0]);
						}
					}

					// determine Dialog title
					if (mJSONData.lockedItemsCount === mJSONData.itemsCount) {
						mJSONData.text.title = oCommonUtils.getText("ST_GENERIC_ERROR_TITLE");
					} else if (mJSONData.itemsCount && (mJSONData.lockedItemsCount + mJSONData.undeletableCount === mJSONData.itemsCount)) {
						//if selected objects do not contain locked/non-deletable objects then its count will be 0
						mJSONData.text.title = oCommonUtils.getText("WARNING");
					} else {
						mJSONData.text.title = mJSONData.text.title = (mJSONData.itemsCount > 1) ?
						oCommonUtils.getText("ST_GENERIC_DELETE_TITLE_WITH_COUNT", [mJSONData.itemsCount]) :
						oCommonUtils.getText("ST_GENERIC_DELETE_TITLE");
					}

					// Unsavedchanges checkbox is required if from the total number of items to be deleted there is atleast one active object having unsavedchanges from others and one deletable object without others unsaved changes
					//If total objects selected = unsavedchangesitemscount or from total selected objects after removing non-deletable objects if all remaining active objects are having unsaved changes by others then unsavedchanges checkbox not required
					if (mJSONData.unsavedChangesItemsCount > 0) {
						if (mJSONData.unsavedChangesItemsCount !== mJSONData.itemsCount) {
							if (mJSONData.lockedItemsCount > 0) {
								if (mJSONData.undeletableCount > 0) {
									// from total selected objects after removing non-deletable objects if all remaining active objects are having unsaved changes by others
									if (((mJSONData.itemsCount - mJSONData.lockedItemsCount) - mJSONData.undeletableCount) === mJSONData.unsavedChangesItemsCount) {
										mJSONData.unsavedChangesCheckboxVisible = false;
									}
								} else if ((mJSONData.itemsCount - mJSONData.lockedItemsCount) === mJSONData.unsavedChangesItemsCount) {
									mJSONData.unsavedChangesCheckboxVisible = false;
								}
							} else if (mJSONData.undeletableCount > 0 && ((mJSONData.itemsCount - mJSONData.undeletableCount) === mJSONData.unsavedChangesItemsCount)) {
								mJSONData.unsavedChangesCheckboxVisible = false;
							}
						} else {
							mJSONData.unsavedChangesCheckboxVisible = false;
						}
					} else {
						mJSONData.unsavedChangesCheckboxVisible = false;
					}
					fnResolve(mJSONData);
				});
			});
		}

		/*
			Return the message text to be shown in deleteconfirmation dialog if selected objects to be deleted contain locked objects &/ unsavedchanges

			* @param iCount - count of locked objects or unsavedchanges objects
			* @param sMessagePlural - The message to be returned if count > 1
			* @param sMessage - the message to be returned is count = 1
			* @param aSelectedItemsList - array with two values, aSelectedItemsList[0] will contain the count of total locked/unsavedchanges, aSelectedItemsList[1] contains the total number of items selected to be deleted
			* @return String - Text to be displayed for locked/unsavedchanges objects in the delete dialog
		*/
		function fnGetLockedAndUnsavedmessage(iCount, sMessagePlural, sMessage, aSelectedItemsList) {
			var sMessageString;
			if (!aSelectedItemsList) {
				sMessageString = iCount > 1 ? oCommonUtils.getText(sMessagePlural) : oCommonUtils.getText(sMessage);
			} else if (iCount > 1 && aSelectedItemsList.length > 1) {
				sMessageString = oCommonUtils.getText(sMessagePlural, [aSelectedItemsList[0], aSelectedItemsList[1]]);
			} else if (aSelectedItemsList){
				sMessageString = oCommonUtils.getText(sMessage, [aSelectedItemsList[1]]);
			}
			return sMessageString;
		}

		/*
			Return the value of the property that is mapped to the HeaderInfo->Title

			* @param oSmartTable
			* @param oSelectedItem - Item that is being deleted
			* @param isObjectPage - boolean value indicating if the fn is called from the OP smart table
			* @return String - Text to be displayed in the dialog
		*/
		function fnGetSelectedItemContextForDeleteMessage(oSmartTable, oSelectedItem, isObjectPage) {
			var sContextPath;
			var sObjectTitle;
			var sObjectSubtitle;
			var oHeaderCustomData;
			var oModel = oSelectedItem.getModel();
			var oData = oModel.oData;
			var aTableCustomData = oSmartTable.getCustomData();
			var oRb = oSmartTable.getModel("@i18n") && oSmartTable.getModel("@i18n").getResourceBundle();
			//Get the HeaderInfo information from the customData built initially when the view was initialized
			for (var index in aTableCustomData) {
				if (aTableCustomData[index].getKey() && aTableCustomData[index].getKey() === "headerInfo" && aTableCustomData[index].getValue() && aTableCustomData[index].getValue()["headerTitle"]) {
					sContextPath = oSelectedItem.getPath().split("/")[1];
					oHeaderCustomData = aTableCustomData[index].getValue();
					sObjectTitle = oHeaderCustomData["headerTitle"];
					sObjectSubtitle = oHeaderCustomData["headerSubTitle"];
					if (oHeaderCustomData["isHeaderTitlePath"]) {
						sObjectTitle =  (oData[sContextPath] && oData[sContextPath][sObjectTitle]) || "";
					} else if (sObjectTitle.match(/{@i18n>.+}/gi)) { //To also consider i18n string
						sObjectTitle = oRb.getText(sObjectTitle.substring(sObjectTitle.indexOf(">") + 1, sObjectTitle.length - 1));
					} 
					if (sObjectSubtitle && oHeaderCustomData["isHeaderSubTitlePath"]) {
						sObjectSubtitle =  (oData[sContextPath] && oData[sContextPath][sObjectSubtitle]) || "";
					} else if (sObjectSubtitle.match(/{@i18n>.+}/gi)) { //To also consider i18n string
						sObjectSubtitle = oRb.getText(sObjectSubtitle.substring(sObjectSubtitle.indexOf(">") + 1, sObjectSubtitle.length - 1));
					}
					break;
				}
			}

			return fnGetDeleteText(sObjectTitle, sObjectSubtitle, isObjectPage, false, oSmartTable);
		}

		function fnBuildSelectionVariantForNavigation(oOutbound, oLineContext, oPageContext, sFilterBarSelectionVariant){
			var oNavigationHandler = oServices.oApplication.getNavigationHandler();
			var oOutboundParametersEmpty = {};
			var oOutboundParameters = {};
			oOutbound.parameters = fnEvaluateParameters(oOutbound.parameters);
			for (var prop in oOutbound.parameters){
				if (isEmptyObject(oOutbound.parameters[prop])){
					oOutboundParametersEmpty[prop] = oOutbound.parameters[prop];
				} else {
					oOutboundParameters[prop] = oOutbound.parameters[prop];
				}
			}
			oNavigationHandler.mixAttributesAndSelectionVariant({}, sFilterBarSelectionVariant).getParameterNames().forEach(
					function(prop) {delete oOutboundParametersEmpty[prop];});

			var oPageContextObject,oLineContextObject, oMixedContextObject;
			//when multi context is passed, we allow only the multiple line contexts to be passed.
			if (Array.isArray(oLineContext) && oLineContext.length >  1){
				var aLineContextArray = fnExtractPropertiesFromContextObjectForMultiContexts(oLineContext);
				return oNavigationHandler.mixAttributesAndSelectionVariant(aLineContextArray, sFilterBarSelectionVariant);
			} else {
				oPageContextObject = fnExtractPropertiesFromContextObject(oPageContext);
				oLineContextObject = fnExtractPropertiesFromContextObject(oLineContext);
				oMixedContextObject = extend({}, oOutboundParametersEmpty, oPageContextObject, oLineContextObject, oOutboundParameters);
				if ((Array.isArray(oLineContext) && oLineContext.length ===  1) || oPageContextObject) {
					return oNavigationHandler.mixAttributesAndSelectionVariant(oMixedContextObject, sFilterBarSelectionVariant);
				} else {
					return oNavigationHandler.mixAttributesAndSelectionVariant(oMixedContextObject, sFilterBarSelectionVariant, genericAppLibrary.navigation.service.SuppressionBehavior.ignoreEmptyString);
				}
			}
		}

		function fnNavigateIntent(oOutbound, oContext, oSmartFilterBar, oSmartControl) {
			var oNavigationHandler = oServices.oApplication.getNavigationHandler();
			var sSelectionVariant, oSelectionVariant;
			if (oSmartFilterBar) {
				sSelectionVariant = oSmartFilterBar.getUiState().getSelectionVariant();
				if (typeof sSelectionVariant !== "string"){
					sSelectionVariant = JSON.stringify(sSelectionVariant);
				}
				// if its a multiviewapplication filtercontext url should be set from the tab which is selected not the main entityset
				if (oSmartFilterBar.getEntitySet() !== oSmartControl.getEntitySet()) {
					var sFilterContextURL = oNavigationHandler.constructContextUrl(oSmartControl.getEntitySet(), oSmartControl.getModel());
					var oSelectionVariantSmartFilterBar = JSON.parse(sSelectionVariant);
					oSelectionVariantSmartFilterBar.FilterContextUrl = sFilterContextURL;
					sSelectionVariant = JSON.stringify(oSelectionVariantSmartFilterBar);
				}
			}

			oSelectionVariant = fnBuildSelectionVariantForNavigation(oOutbound, oContext, oController.getView().getBindingContext(), sSelectionVariant);
			var oObjectInfo = {
					semanticObject: oOutbound.semanticObject,
					action: oOutbound.action
			};
			oCommonUtils.removePropertiesFromNavigationContext(oSelectionVariant, oSmartControl);
			oController.adaptNavigationParameterExtension(oSelectionVariant, oObjectInfo);
			oNavigationHandler.navigate(oOutbound.semanticObject, oOutbound.action, oSelectionVariant.toJSONString(),
					null, fnHandleError);
			//null object has to be passed to the NavigationHandler as an
			//indicator that the state should not be overwritten
		}

		function fnNavigateIntentSmartLink(oOutbound, oEventSource) {
			var oNavigationHandler = oServices.oApplication.getNavigationHandler();
			var oObjectInfo = {
				semanticObject: oOutbound.semanticObject,
				action: oOutbound.action
			};
			var oSelectionVariant = oNavigationHandler.mixAttributesAndSelectionVariant(oOutbound.semanticAttributes);
			oCommonUtils.removePropertiesFromNavigationContext(oSelectionVariant, oEventSource);
			oController.adaptNavigationParameterExtension(oSelectionVariant, oObjectInfo);
			oNavigationHandler.navigate(oOutbound.semanticObject, oOutbound.action, oSelectionVariant.toJSONString(), null, fnHandleError);
		}

		function fnHideTitleArea(oSmLiContent,aContactTitleArea) {
			//get title data
			var oIcon = oSmLiContent.byId("icon");	// oIcon can be undefined, since the icon is optional
			var sIcon = oIcon && oIcon.getSrc();
			if (sIcon === ""){ // can be undefined - to make a later comparism easier set it to undefined if the value is ""
				sIcon = undefined;
			}
			var oTitle = oSmLiContent.byId("title");
			var sTitle = oTitle && oTitle.getText();//oTitle must always be there
			if (sTitle === ""){ // can be undefined - to make a later comparism easier set it to undefined if the value is ""
				sTitle = undefined;
			}
			var oDescription = oSmLiContent.byId("description");
			var sDescription = oDescription && oDescription.getText(); //oDescription must always be there
			if (sDescription === ""){ // can be undefined - to make a later comparism easier set it to undefined if the value is ""
				sDescription = undefined;
			}

			//check against contacts
			for (var j = 0; j < aContactTitleArea.length; j++) {
				var oContactTitleArea = aContactTitleArea[j];
				var sContactTitleAreaIdIcon  = AnnotationHelper.getStableIdPartFromFacet(oContactTitleArea) + "::contactTitleAreaIcon";
				var oContactTitleAreaIdIcon = oSmLiContent.byId(sContactTitleAreaIdIcon); 				// can be undefined
				var sContactTitleAreaIdTitle  = AnnotationHelper.getStableIdPartFromFacet(oContactTitleArea) + "::contactTitleAreaTitle";
				var oContactTitleAreaIdTitle = oSmLiContent.byId(sContactTitleAreaIdTitle); 			// can be undefined
				var sContactTitleAreaIdDescription  = AnnotationHelper.getStableIdPartFromFacet(oContactTitleArea) + "::contactTitleAreaDescription";
				var oContactTitleAreaIdDescription = oSmLiContent.byId(sContactTitleAreaIdDescription); // can be undefined

				var sContactTitleAreaIcon = oContactTitleAreaIdIcon && oContactTitleAreaIdIcon.getSrc();
				if (sContactTitleAreaIcon === ""){ // can be undefined - to make a later comparism easier set it to undefined if the value is ""
					sContactTitleAreaIcon = undefined;
				}
				var sContactTitleAreaTitle = oContactTitleAreaIdTitle && oContactTitleAreaIdTitle.getText();
				if (sContactTitleAreaTitle === ""){ // can be undefined - to make a later comparism easier set it to undefined if the value is ""
					sContactTitleAreaTitle = undefined;
				}
				var sContactTitleAreaDescription = oContactTitleAreaIdDescription && oContactTitleAreaIdDescription.getText();
				if (sContactTitleAreaDescription === ""){ // can be undefined - to make a later comparism easier set it to undefined if the value is ""
					sContactTitleAreaDescription = undefined;
				}

				//only hide the title area in case of filled fields - issue with timing of the hide check, therefore only checking if filled
				if ( sIcon 			&& sContactTitleAreaIcon &&
					 sTitle 		&& sContactTitleAreaTitle &&
					 sDescription 	&& sContactTitleAreaDescription) {

					if ((sIcon === sContactTitleAreaIcon || !sContactTitleAreaIcon) &&
						(sTitle === sContactTitleAreaTitle || !sContactTitleAreaTitle) &&
						(sDescription === sContactTitleAreaDescription || !sContactTitleAreaDescription)) {
						var sContactTitleAreaId = AnnotationHelper.getStableIdPartFromFacet(oContactTitleArea) + "::contactTitleArea";
						var oContactTitleAreaId = oSmLiContent.byId(sContactTitleAreaId);
						if (oContactTitleAreaId && oContactTitleAreaId.setVisible) {
							oContactTitleAreaId.setVisible(false);
						}
						//below is the old way of doing it:
						/*oContactQuickViewPage.setDescription("ccc") is not possible since of 2 way binding, also other entries are updated
                          the QuickViewPage does not have property to hide only the header
                        var sContactQuickViewPageQueryId = "#" + oContactQuickViewPage.getId();
                        var oContactQuickViewPageQuery = jQuery(sContactQuickViewPageQueryId);
                        var oContactQuickViewPageQueryFirstChild = oContactQuickViewPageQuery && oContactQuickViewPageQuery.children() && oContactQuickViewPageQuery.children().first();
                        if (oContactQuickViewPageQueryFirstChild && oContactQuickViewPageQueryFirstChild.remove) {
                            oContactQuickViewPageQueryFirstChild.remove();
                        }*/
					}
				}
			}
		}

		function fnNavigateIntentManifest(oEventSource, oContext, oSmartFilterBar, oSmartChart) {
			var oManifestEntry = oController.getOwnerComponent().getAppComponent().getManifestEntry("sap.app");
			var oOutbound = oManifestEntry.crossNavigation.outbounds[oEventSource.data("CrossNavigation")];
			var oSmartControl;
			if (oSmartFilterBar) {
				// To navigate from new showdetails item for chart
				if (controlHelper.isSmartChart(oEventSource)){
					oSmartControl = oCommonUtils.getOwnerControl(oSmartChart) || oCommonUtils.getOwnerControl(oEventSource);
				} else {
					oSmartControl = oCommonUtils.getOwnerControl(oEventSource).getParent();
				}
			}
			fnNavigateIntent(oOutbound, oContext, oSmartFilterBar, oSmartControl);
		}

		// ALP is consuming this method
		function fnSemanticObjectLinkPopoverLinkPressed (oEvent, oState){
			window.location.href = oEvent.mParameters.href;
		}
		function fnOnSemanticObjectLinkNavigationPressed(oEventSource, oEventParameters){
			oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
				var sSemanticObject = oEventSource.data('SemanticObject');
				var sAction = oEventSource.data('Action');
				var sSemanticAttributes = oEventSource.data('SemanticAttributes');
				if (sSemanticObject && sAction){
					var oOutbound = {
							semanticObject: sSemanticObject,
							action: sAction
					};
					if (sSemanticAttributes) {
						sSemanticAttributes = "{" + sSemanticAttributes + "}";
						oOutbound.semanticAttributes = JSON.parse(sSemanticAttributes);
					}
					fnNavigateIntentSmartLink(oOutbound, oEventSource);
				}
			}, Function.prototype);
		}

		function fnOnSemanticObjectLinkNavigationTargetObtained(oEventSource, oEventParameters, oState, sTitle, oMainNavigation) {
			var sSourceClickedField;
			var oMetaModel = oEventSource.getModel().getMetaModel();
			var getTargetAnnotation = function() {
				var getClickedField = function(){
					var sClickedFieldId = oEventParameters.originalId;
	
					//this works for fields on the object header which have a view relative id, but not in tables
					var oControl = oController.getView().byId(sClickedFieldId);
	
					//table fields get an absolute id "__link0-__clone34" - then jQuery is used to retrieve this absolut id (jQuery doesn't work with "::" as in ::Field-sl)
					if (!oControl ){
						var oElement = document.querySelector( "#" + sClickedFieldId.replace( /(:|\.|\[|\]|,|=)/g, "\\$1" ) );
						if (oElement){
							// Element.closest is not supported in IE11 so we are injecting polyFill as dependency
							var closestUI5ControlNode = oElement.closest('[data-sap-ui]');
							if (closestUI5ControlNode) {
								oControl = sap.ui.getCore().byId(closestUI5ControlNode.id);
							}
						}
					}
					return oControl && oControl.mProperties.fieldName;
				};
				var oEntitySet = oMetaModel.getODataEntitySet(oEventSource.getEntitySet());
				var mTargetEntities = oComponentUtils.getParameterModelForTemplating().oData.templateSpecific.targetEntities[oEntitySet.entityType].mTargetEntities;
				sSourceClickedField = getClickedField();

				//SemanticObjectController may also decide to render some as links even as we do not, using forceLinkRendering property
				if (mTargetEntities[sSourceClickedField]) {
					var sTargetEntityType = mTargetEntities[sSourceClickedField].entityType;
					var sTargetEntitySet = oMetaModel.getODataEntityContainer().entitySet.find(function(oEntitySet) {return oEntitySet.entityType == sTargetEntityType;}).name;

					var oTargetAnnotation = {
						navigation: 	mTargetEntities[sSourceClickedField].navName,
						entitySet:  	sTargetEntitySet,
						entityType: 	sTargetEntityType
					};
					var oTargetEntityType = oMetaModel.getODataEntityType(sTargetEntityType);
					if (oTargetEntityType && oTargetEntityType["com.sap.vocabularies.UI.v1.HeaderInfo"]) {
						var sHeaderInfoPath = oMetaModel.getODataEntityType(sTargetEntityType, true) + "/com.sap.vocabularies.UI.v1.HeaderInfo";
						oTargetAnnotation.headerInfoPath = sHeaderInfoPath;
					}

					if (oTargetEntityType && oTargetEntityType["com.sap.vocabularies.UI.v1.QuickViewFacets"]) {
						var sODataQuickViewFacetPath = oMetaModel.getODataEntityType(sTargetEntityType, true) + "/com.sap.vocabularies.UI.v1.QuickViewFacets";
						oTargetAnnotation.quickViewFacetODataPath = sODataQuickViewFacetPath; // e.g. /dataServices/schema/0/entityType/23/com.sap.vocabularies.UI.v1.QuickViewFacets/0/
					}

					//the header can be shown alone, as well as the quickViewFacet
					if (oTargetAnnotation.headerInfoPath || oTargetAnnotation.quickViewFacetODataPath) {
						return oTargetAnnotation;
					}
				}						
			};

			var oTargetAnnotation = getTargetAnnotation();
			var bQuickViewFacetAvailable = false;
			var bFieldGroupAvailable = false;
			var bContactAvailable = false;
			var aContactTitleArea = [];
			
			if (oTargetAnnotation){
				if (oTargetAnnotation.quickViewFacetODataPath){
					var oQuickViewFacetBindingContext = oMetaModel.createBindingContext(oTargetAnnotation.quickViewFacetODataPath, true);
					var aQuickViewFacet = oQuickViewFacetBindingContext && oQuickViewFacetBindingContext.getModel().getObject(oQuickViewFacetBindingContext.getPath());
					if (aQuickViewFacet){
						bQuickViewFacetAvailable = true;
						for (var j = 0; j < aQuickViewFacet.length; j++) {
							var oQuickViewFacet = aQuickViewFacet[j];
							if (oQuickViewFacet && oQuickViewFacet.Target && oQuickViewFacet.Target.AnnotationPath) {
								if (oQuickViewFacet.Target.AnnotationPath.indexOf("com.sap.vocabularies.UI.v1.FieldGroup") > -1 ){
									bFieldGroupAvailable = true;
								} else if (oQuickViewFacet.Target.AnnotationPath.indexOf("com.sap.vocabularies.Communication.v1.Contact") > -1 ){
									bContactAvailable = true;
									aContactTitleArea.push(oQuickViewFacet);
								}
							}
						}
					}
				}
			}

			//only if the QuickViewFacet is available we show it AND we take over the CMP title area and if available show the contact
			if (bQuickViewFacetAvailable ){

				var oSourceEntitySet, oSourceEntityType;
				oSourceEntitySet = oMetaModel.getODataEntitySet(oEventSource.getEntitySet());
				oSourceEntityType = oMetaModel.getODataEntityType(oSourceEntitySet.entityType);

				/* --- NEW title area preparation
				   header info is expected for each entity type, if this is not filled  */
				var oHeaderInfoBindingContext = oTargetAnnotation.headerInfoPath && oMetaModel.createBindingContext(oTargetAnnotation.headerInfoPath, true);
				// set header title link if displayFactSheet is available
				var oMainNavigation = oEventParameters.mainNavigation; //for testing ownNavigation can be used if set
				var sSemanticObject = oEventParameters.semanticObject;
				var sAction, oMainNavigationIntent;
				if (sSemanticObject && oMainNavigation){
					//set target
					var sTarget = oMainNavigation.getTarget && oMainNavigation.getTarget() || "";
					//set navigation info
					var sKey = oMainNavigation.getKey && oMainNavigation.getKey();
					if (sKey){ //sKey = "EPMProduct-displayFactSheet"
						var aAction =  sKey.split(sSemanticObject + "-");
						sAction = aAction && aAction[1];
						if (sSemanticObject && sAction){
							oMainNavigationIntent = {
								"Target" : sTarget,
								"SemanticObject": sSemanticObject,
								"Action": sAction
							};
						}
						if (oEventParameters.semanticAttributes){
							oMainNavigationIntent.SemanticAttributes = oEventParameters.semanticAttributes;
							//limit the parameters that are transferred
							for (var i in oEventParameters.semanticAttributes){
								var sSemanticAttribute = oEventParameters.semanticAttributes[i];
								if (sSemanticAttribute.indexOf("{\"__deferred\":") > -1) {
									delete oMainNavigationIntent.SemanticAttributes[i];
								}
								if (sSemanticAttribute.indexOf("{\"__ref\":") > -1) {
									delete oMainNavigationIntent.SemanticAttributes[i];
								}
							}
							if (oMainNavigationIntent.SemanticAttributes) {
								var sTemp = JSON.stringify(oMainNavigationIntent.SemanticAttributes);
								if (sTemp && sTemp.length > 1) {
									oMainNavigationIntent.SemanticAttributes = sTemp.substring(1, sTemp.length - 1); //if a JSON object is passed it gets removed
								}
							}
						}
					}
				}
				// used to determine the header title
				var oSourceClickedField = oMetaModel.getODataProperty(oSourceEntityType, sSourceClickedField);

				/* --- QuickView Content area preparation */
				var aIgnoredFields = oEventSource && oEventSource.mProperties && oEventSource.mProperties.fieldSemanticObjectMap;

				var oQuickViewModel = new JSONModel({sourceClickedField:	oSourceClickedField,
													 sourceEntityType: 		oSourceEntityType,
													 //showTitleArea: 		true, 		//will always be shown if this coding is reached
													 //showQuickViewContent:true,		//will be shown if there is 1 fieldgroup, but nothing is shown if there is 0 fieldgroup
													 showFieldGroup:		bFieldGroupAvailable,
													 showContact:			bContactAvailable,
													 ignoredFields:  		aIgnoredFields,
													 navigationPath: 		oTargetAnnotation.navigation,
													 mainNavigation:	    oMainNavigationIntent});
				oQuickViewModel.setDefaultBindingMode("OneWay");

				var oSmartFormSimpleViewController;
				var oSmartFormSimpleViewControllerClass = Controller.extend("", {
					oState: oState,
					_templateEventHandlers: {
						onSemanticObjectLinkNavigationPressed : oController._templateEventHandlers.onSemanticObjectLinkNavigationPressed.bind(oController._templateEventHandlers),
						onDataFieldWithIntentBasedNavigation  : oController._templateEventHandlers.onDataFieldWithIntentBasedNavigation.bind(oController._templateEventHandlers)
					},
					onInit : function() {},
					onExit : function() {},
					onAfterRendering : function() {
						//it will first be rendered if the batch is done
						//this is also called if a popover is repeatedly opened and no batch is needed
						var oSmartFormSimpleView = this.oView;
						var oNavContainer = oSmartFormSimpleView.getParent().getParent().getParent(); //set to sap.ui.comp.navpopover.NavigationPopover
						oNavContainer.setBusy(false);
					}
				});
				oSmartFormSimpleViewController = new oSmartFormSimpleViewControllerClass();
				oSmartFormSimpleViewControllerClass.connectToView = oController.connectToView.bind(oSmartFormSimpleViewController);

				var oSmartFormSimpleView = sap.ui.view({
					async: true,
					preprocessors: {
						xml: {
							bindingContexts: {
								sourceEntitySet: oMetaModel.createBindingContext(oMetaModel.getODataEntitySet(oEventSource.getEntitySet(), true)),
								entitySet: oMetaModel.createBindingContext(oMetaModel.getODataEntitySet(oTargetAnnotation.entitySet, true)),
								header: oHeaderInfoBindingContext,
								facetCollection: oQuickViewFacetBindingContext
							},
							models: {
								sourceEntitySet: oMetaModel,
								entitySet: oMetaModel,
								header: oMetaModel,
								facetCollection: oMetaModel,
								quickView: oQuickViewModel,
								parameter: oComponentUtils.getParameterModelForTemplating()
							}
						}
					},
					controller: oSmartFormSimpleViewController,
					type: ViewType.XML,
					viewName: "sap.suite.ui.generic.template.fragments.QuickViewSmartForm",
					height: "100%"
				});

				/*take over the image */
				/* sMainNavigationId: 	with "" the header is be surpressed,
				 * oMainNavigation: 	with null the main navigation object will be removed.
				 * This will still show the CMP title area if there is an text arrangement */
				//oEventParameters.show("", null, undefined, oSmartFormSimpleView);

				/* sMainNavigationId: 	with undefined, the description is calculated using the binding context of a given source object (for example SmartLink control)
				 * oMainNavigation: 	with undefined the old object will remain.
				 * This will still show the CMP title area - this is needed especially in slow systems, since then the CMP title area will be shown until the FE title area is available */
				oEventParameters.show(undefined, undefined, undefined, oSmartFormSimpleView);

				//set the navcontainer to busy until everything is evaluated
				var fnBusy = function(oEvent) {
					var oSmLiContent = oEvent.getSource(); //content of the smart link popover
					if (oSmLiContent){
						var oNavContainer = oSmLiContent.getParent().getParent().getParent(); //set to sap.ui.comp.navpopover.NavigationPopover
						oNavContainer.setBusy(true);
						/* small enough to not show busy indicator if no time delay is there
						 * but not too big to show the busy indicator to late
						 * throttling OFF  - when it was set to 0 busy was shown shortly ==> flickers
						 * throttling GPRS - when set to 100 data is shown already
						 * */
						oNavContainer.setBusyIndicatorDelay(10);
					}
				};
				oSmartFormSimpleView.attachBeforeRendering(fnBusy.bind(this));

				// post processing after the navcontainer is rendered
				var fnChange = function(oEvent) {
					var oSmLiContent = oEvent.getSource(); //content of the smart link popover
					if (oSmLiContent){
						//handler is called one without content
						var oNewTitleArea = oSmLiContent.byId("ownTitleArea");
						if (oNewTitleArea){
							//set old title area to invisible if available - needed since double registering/calling of navigationTargetObtained can't be avoided
							var oSemOController = oSmLiContent.getParent();
							if (oSemOController && oSemOController.getItems){
								var oPossibleOldTitleArea = oSemOController.getItems() && oSemOController.getItems()[0]; //could also be quickview, if no old title area has been built
								if (oPossibleOldTitleArea &&
									oPossibleOldTitleArea != oSmLiContent){
									oPossibleOldTitleArea.setVisible(false);
								}
							}
						}
						if (bContactAvailable && aContactTitleArea && oNewTitleArea){
							/*if the oNewTitleArea is similar to the info showing in the Contacts
								title, decription and icon are similar to
								contact fn,    role   	and photo
							  then remove them */
							fnHideTitleArea(oSmLiContent,aContactTitleArea);
						}
					}
				};
				oSmartFormSimpleView.attachAfterRendering(fnChange.bind(this));
			} else {
				oEventParameters.show(sTitle, oMainNavigation, undefined, undefined);
			}
		}
		// Returns the values of Semantic Keys/ Technical Keys for the current Object Page.
		function getObjectPageParameters(oController, appComponent){
			var oViewBindingContext = oController.getView && oController.getView().getBindingContext();
			var oEntity = oViewBindingContext.getObject();
			var oMetaModel = oController.getOwnerComponent().getModel().getMetaModel();
			var oEntitySet = oMetaModel.getODataEntitySet(oController.getOwnerComponent().getEntitySet());
			var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
			var aSemKey = oEntityType["com.sap.vocabularies.Common.v1.SemanticKey"];
			var oParam = {};
			// Adding Semantic Keys as parameters
			if (aSemKey && aSemKey.length > 0) {
				for (var j = 0; j < aSemKey.length; j++) {
					var sSemKey = aSemKey[j].PropertyPath;
					if (!oParam[sSemKey]) {
						oParam[sSemKey] = [];
						oParam[sSemKey].push(oEntity[sSemKey]);
					}
				}
			} else {
				// Add technical keys if semantic keys are not defined.
				for (var k in oEntityType.key.propertyRef) {
					var sObjKey = oEntityType.key.propertyRef[k].name;
					if (!oParam[sObjKey]) {
						oParam[sObjKey] = [];
						oParam[sObjKey].push(oEntity[sObjKey]);
					}
				}
			}
			return oParam;
		}

		// Returns the inline external navigation target (defined in sap.app.crossNavigation.outbounds) for a given table entity set if hideChevronForUnauthorizedExtNav flag is set to true
		function findOutboundTarget(aPages, i, sTableEntitySet, sNavigationProperty){
			// if navigationProperty is defined.
			if (aPages[i].entitySet == sTableEntitySet && sNavigationProperty === aPages[i].navigationProperty && aPages[i].navigation && aPages[i].navigation["display"] && (aPages[i].component && aPages[i].component.settings && aPages[i].component.settings.hideChevronForUnauthorizedExtNav === true)) {
				return aPages[i].navigation.display.target;
			} else if (aPages[i].entitySet == sTableEntitySet && aPages[i].navigation && aPages[i].navigation["display"] && (aPages[i].component && aPages[i].component.settings && aPages[i].component.settings.hideChevronForUnauthorizedExtNav === true)) { //if navigationProperty is not defined.
				return aPages[i].navigation.display.target;
			} else if (aPages[i].pages) {
				for (var j = 0; j < (aPages[i].pages.length); j++) {
					var sOutboundTarget = findOutboundTarget(aPages[i].pages, j, sTableEntitySet, sNavigationProperty);
					if (sOutboundTarget !== undefined && sOutboundTarget !== null) {
						return sOutboundTarget;
					}
				}
			}
		}

		// This function updates the chevron binding for inline external navigation in templPriv model for the corresponding table.
		//The binding depends on the result whether the external navigation is supported or not.
		function displayChevronIfExtNavigationSupported(oEvent){
			var oTable = oEvent.getSource().getTable();
			var sTableEntitySet = oEvent.getSource().getEntitySet();
			var sNavigationProperty = oEvent.getSource().getTableBindingPath();

			// CrossApplicationNavigation checks whether external navigation is supported or not.
			var oXApplNavigation = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService("CrossApplicationNavigation");

			// browse through the manifest pages to check if the corresponding table has inline external navigation defined and hideChevronForUnauthorizedExtNav flag is set to true.
			var aPages = oController.getOwnerComponent().getAppComponent().getConfig().pages;
			var sOutboundTarget = findOutboundTarget(aPages, 0, sTableEntitySet, sNavigationProperty); // 0 passed to enable traversing of pages from the top.

			if (sOutboundTarget !== undefined && sOutboundTarget !== null && oXApplNavigation) {
				var oCrossApp = oController.getOwnerComponent().getAppComponent().getManifestEntry("sap.app").crossNavigation.outbounds[sOutboundTarget];
				if (oCrossApp) {
					var sSemanticObj = oCrossApp.semanticObject;
					var sAction = oCrossApp.action;
					var oPrivModel = oController.getView().getModel("_templPriv");
					var oSupportedIntents = oPrivModel.getProperty("/generic/supportedIntents/");
					var sPath = (sNavigationProperty === "") ? sTableEntitySet : sTableEntitySet + "::" + sNavigationProperty; // unique path for corresponding table in the oPrivModel
					var oTablePathProp = oPrivModel.getProperty("/generic/supportedIntents/" + sSemanticObj + "/" + sAction + "/" + sPath);
					if (!oTablePathProp) {
						// No existing information in the model for corresponding table.
						var oOutboundParameters = {},oParam;
						var appComponent = oController.getOwnerComponent().getAppComponent();
						// Parameters defined in manifest for external navigation.
						for (var prop in oCrossApp.parameters) {
							if (!isEmptyObject(oCrossApp.parameters[prop])){
								oOutboundParameters[prop] = oCrossApp.parameters[prop];
							}
						}
						// Get Semantic Key/ Technical Key values to be sent as parameters for external navigation check in case of an Object Page table.
						if (oController.getMetadata().getName() === 'sap.suite.ui.generic.template.ObjectPage.view.Details') {
							oParam = getObjectPageParameters(oController, appComponent);
						}

						var oTarget = {
								semanticObject : sSemanticObj,
								action: sAction
						};
						var oNavParams = extend({}, oParam, oOutboundParameters);
						var oNavArguments = {
								target : oTarget,
								params : oNavParams
						};
						var oSupportedPromise = oXApplNavigation.isNavigationSupported([oNavArguments], appComponent);
						oSupportedPromise.done(function(oTargets){
							var oSemObjProp = oPrivModel.getProperty("/generic/supportedIntents/" + sSemanticObj);
							// Update model as per the result.
							if (!oSemObjProp) {
								oSupportedIntents[sSemanticObj] = {};
								oSupportedIntents[sSemanticObj][sAction] = {};
								oSupportedIntents[sSemanticObj][sAction][sPath] = {
										"supported": oTargets[0].supported
								};
							} else if (!oSemObjProp[sAction]) {
								oSemObjProp[sAction] = {};
								oSemObjProp[sAction][sPath] = {
										"supported": oTargets[0].supported
								};
							} else {
								oSemObjProp[sAction][sPath] = {
										"supported": oTargets[0].supported
								};
							}
							oPrivModel.updateBindings();
							// In case of UI Table, set chevron visibility to true if the outbound target is supported.
							// In case of Responsive table, this step is not required as visibility is automatically handled by model binding.
							if (oTargets[0].supported && controlHelper.isUiTable(oTable)) {
								var rowActionTemplate = oTable.getRowActionTemplate();
								rowActionTemplate.getItems()[0].setVisible(true);	//There is only "navigation" defined in the row action items.
								oTable.setRowActionTemplate(rowActionTemplate);
							}
						});
					}
				}
			}
		}
		function onDataReceived(oEvent){
			// whenever new data has been received for a table, we have to check the enablement of the buttons in the corresponding toolbar
			// this should be also done when the user clicks another tab (otherwise, delete button will not get updated correctly)
			oCommonUtils.setEnabledToolbarButtons(oEvent.getSource());

			// FooterButtons should not dependent on table content
			// however, if this would be needed it could be achieved like this:
//			var oSmartTable = oEvent.getSource();
//			if (oSmartTable instanceof SmartTable){
//				oCommonUtils.setEnabledFooterButtons(oSmartTable);
//			}
			// SmartTable would have to be define in sap.ui.define

			// update model binding for chevron display in table in case of inline external navigation.
			displayChevronIfExtNavigationSupported(oEvent);
		}

		// callback for the onBeforeRebindTable event of a smart table
		// oEvent is the original event
		// oCallbacks is an optional object which contains additional callbacks to be called.
		// Properties supported so far:
		// - determineSortOrder: a function that can be called to provide a given sort order
		// - ensureExtensionFields: a function that is called to enable extensions the possibility to add additional fields which should be part of the select clause
		//   a function fnEnsureSelectionPropertyFromExtension(oControllerExtension, sProperty) will be passed to this function.
		//   extensions might call fnEnsureSelectionPropertyFromExtension, identifying themselves via oControllerExtension and passing the property sProperty to be added.
		// - isPopinWithoutHeader: a flag to check whether popin display should set or not.
		// - isDataFieldForActionRequired: a flag to check if data field for action is required or not
		// - isFieldControlsPathRequired: a flag to check if path properties need to be added to actions.
		function onBeforeRebindTable(oEvent, oCallbacks) {
			// For line item actions, popin display must not have a label
			var oSmartTable = oEvent.getSource();
			var oTable = oSmartTable.getTable();
			var bIsMTable = controlHelper.isMTable(oTable);
			var oColumns = oTable.getColumns();

			if (!oCallbacks || (oCallbacks && oCallbacks.isPopinWithoutHeader) && bIsMTable) { //Setting popin display without header
				for (var iColumn = 0; iColumn < oColumns.length; iColumn++) {
					var sColumnKey = oColumns[iColumn].data("p13nData") && oColumns[iColumn].data("p13nData").columnKey;
					if (sColumnKey && (sColumnKey.search("template::DataFieldForIntentBasedNavigation") > -1 || sColumnKey.search("template::DataFieldForAction") > -1)) {
						oColumns[iColumn].setPopinDisplay("WithoutHeader");
					}
				}
			}
			// still open
			var oBindingParams = oEvent.getParameter("bindingParams");
			oBindingParams.parameters = oBindingParams.parameters || {};

			// WorkListLight search and personalization
			// Not required for ALP
			// When sort or filter operations are performed by clicking the buttons on responsive table header,
			// then the search value if present should be bound to the table. This check is explicitly performed for worklist since
			// search field is a custom element for worklist
			if (oSmartTable.data().allowSearchWorkListLight || oSmartTable && oSmartTable.data && oSmartTable.data().searchString) {
				oBindingParams.parameters["custom"] = {
					"search": oEvent.getSource().data().searchString
				};
				oSmartTable.data("allowSearchWorkListLight", false);
				if (oEvent.getSource().data().searchString) {
					oBindingParams.parameters["custom"] = {
						"search": oEvent.getSource().data().searchString
					};
				}
			}

			var oSmartFilterBar = oController.byId(oSmartTable.getSmartFilterId());
			//Get all the CustomData associated with Smarttable and create an object which is a key value pair of each custom data
			var aCustomData = oSmartTable.getCustomData();
			var oCustomData = {};
			for (var k = 0; k < aCustomData.length; k++) {
				oCustomData[aCustomData[k].getKey()] = aCustomData[k].getValue();
			}
			//Add InitialExpansionLevel to the binding params
			var numberOfExpandedLevels = oCustomData.InitialExpansionLevel;
			if (numberOfExpandedLevels) {
				oBindingParams.parameters.numberOfExpandedLevels = parseInt(numberOfExpandedLevels, 10);
			}
			// TABLE TABS ONLY
			if (!oSmartFilterBar && oController.getMetadata().getName() === 'sap.suite.ui.generic.template.ListReport.view.ListReport') {
				oSmartFilterBar = oController.byId("listReportFilter");
			// adding of filters from SmartFilterbar has been moved to MultipleViewsHandler.js
				var sSearchValue = oSmartFilterBar.getBasicSearchValue();
				if (sSearchValue) {
					oBindingParams.parameters["custom"] = {
						"search": sSearchValue
					};
				}
			}
			// (END) TABLE TABS ONLY

			// aProperties : contains list of fields sent to select parameter in the request
			var aProperties = [];
			// aDataFieldActionPath : contains list of custom action fields
			var aDataFieldActionPath = [];
			function fnGetFieldControlsPath(aSelects, oMetaModel, oEntityType, oEntitySet, sLineItemAnnotation) {
				for (var index = 0; index < aSelects.length; index++) {
					var sSelect = aSelects[index];
					if (sSelect){
						//needed for activating field control for DataField Annotation & when using the setting to add new columns
						var oProperty = oMetaModel.getODataProperty(oEntityType, sSelect);
						if (oProperty){
							var oFieldControl = oProperty["com.sap.vocabularies.Common.v1.FieldControl"];
							if (oFieldControl && oFieldControl !== " " && oFieldControl.Path) {
								// if Field Control required or CustomAction field is a part of FieldControls then consider this field
								if (oCallbacks.isFieldControlRequired || aDataFieldActionPath.indexOf(sSelect) !== -1) {
									aProperties.push(oFieldControl.Path);
								}
							}
						}
					}
				}

				// add deletable-path property
				var oDeleteRestrictions = oEntitySet["Org.OData.Capabilities.V1.DeleteRestrictions"];
				aProperties.push(oDeleteRestrictions && oDeleteRestrictions.Deletable && oDeleteRestrictions.Deletable.Path);

				// add updatable-path property as fix for incident 1770320335
				var oUpdateRestrictions = oEntitySet["Org.OData.Capabilities.V1.UpdateRestrictions"];
				aProperties.push(oUpdateRestrictions && oUpdateRestrictions.Updatable && oUpdateRestrictions.Updatable.Path);

				//LineItem and Criticality implementation for LR/OP
				//Check why we need different handling of criticality in LR and ALP and try to bring them together if possible
				var oCriticalityAnnotation = oEntityType[sLineItemAnnotation + "@com.sap.vocabularies.UI.v1.Criticality"];
				aProperties.push(oCriticalityAnnotation && oCriticalityAnnotation.Path);
			}

			function fnGetDataFieldWithNavigationPath(oLineItem, oMetaModel, oEntityType) {
				//Handling for DataFieldWithNavigationPath
				var oLineItemProperty, sRequestField;
				if (oLineItem.Value && oLineItem.Value.Path) {
					oLineItemProperty = oMetaModel.getODataProperty(oEntityType, oLineItem.Value.Path);
					if (oLineItemProperty) {
						if (oLineItemProperty["com.sap.vocabularies.Common.v1.Text"]) {
							sRequestField = oLineItemProperty["com.sap.vocabularies.Common.v1.Text"].Path;
						}
						if (oLineItemProperty["sap:text"]) {
							sRequestField = oLineItemProperty["sap:text"];
						}
					}
					if (!sRequestField) {
						sRequestField = oLineItem.Value.Path;
					}
				}
				return sRequestField;
			}

			function fnGetDataFieldActionPath(oLineItem, oMetaModel) {
				//add applicable-path properties for annotated actions
				var sFunctionImport = oMetaModel.getODataFunctionImport(oLineItem.Action.String, true);
				if (sFunctionImport) {   //else: break-out action, no backend data needed
					var oFunctionImport = oMetaModel.getObject(sFunctionImport);
					if (oFunctionImport["sap:action-for"] !== " " && oFunctionImport["sap:applicable-path"] !== " ") {
						return oFunctionImport["sap:applicable-path"];
					}
				}
				return null;
			}

			function fnGetDataFieldForAnnotationPath (oLineItem, oEntityType) {
				//handles chart annotation if in same entity type
				var aPropertyPath = [];
				if (oLineItem.Target && oLineItem.Target.AnnotationPath) {
					var sAnnotationPath = oLineItem.Target.AnnotationPath;
					var sChartQualifier = sAnnotationPath.split("@")[1];
					var oRequiredData = oEntityType[sChartQualifier];
					// checks and adds MeasureAttributes properties
					if (oRequiredData && oRequiredData.MeasureAttributes) {
						if (oRequiredData.MeasureAttributes[0] && oRequiredData.MeasureAttributes[0].DataPoint &&
								oRequiredData.MeasureAttributes[0].DataPoint.AnnotationPath) {
							var sDataPointQualifier = oRequiredData.MeasureAttributes[0].DataPoint.AnnotationPath.split("@")[1];
							var oRequiredDataPoint = oEntityType[sDataPointQualifier];
							if (oRequiredDataPoint) {
								for (var sDataPointProperty in oRequiredDataPoint) {
									aPropertyPath.push(oRequiredDataPoint[sDataPointProperty] && oRequiredDataPoint[sDataPointProperty].Path);
									// handles criticality calculation annotation
									if (sDataPointProperty === "CriticalityCalculation" && oRequiredDataPoint.CriticalityCalculation) {
										for (var criticalityProperty in oRequiredDataPoint.CriticalityCalculation) {
											aPropertyPath.push(oRequiredDataPoint.CriticalityCalculation[criticalityProperty].Path);
										}
									}
								}
							}
						}
					}
					// checks and adds Measures property
					aPropertyPath.push(oRequiredData && oRequiredData.Measures && oRequiredData.Measures[0] && oRequiredData.Measures[0].PropertyPath);
				}
				return aPropertyPath;
			}
			oCallbacks = oCallbacks || Object.create(null);
			oCallbacks.setBindingPath = oSmartTable.setTableBindingPath.bind(oSmartTable);
			oCallbacks.addNecessaryFields = function(aSelects, fnEnsureSelectionProperty, sEntitySet){
				var oMetaModel = oSmartTable.getModel().getMetaModel();
				var oEntitySet = oMetaModel.getODataEntitySet(sEntitySet);
				var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
				if (aSelects.length > 0) {
					var sLineItemQualifier = oSmartTable.data("lineItemQualifier");
					var sLineItemAnnotation = "com.sap.vocabularies.UI.v1.LineItem" + (sLineItemQualifier ? "#" + sLineItemQualifier : "");
					//LineItem and Criticality implementation for LR/OP
					var oLineItems = oEntityType[sLineItemAnnotation] || []; // some tests in safety net run wihtout any lineitem annotation - seems to work somehow at least for tree table;
					for (var index = 0; index < oLineItems.length; index++) {
						switch (oLineItems[index].RecordType) {
							default: break;
							case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
							case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
								var sDataFieldWithNavigationPath = fnGetDataFieldWithNavigationPath(oLineItems[index], oMetaModel, oEntityType);
								if (sDataFieldWithNavigationPath) {
									aProperties.push(sDataFieldWithNavigationPath);
								}
								break;
							case "com.sap.vocabularies.UI.v1.DataFieldForAction":
								if (oCallbacks.isDataFieldForActionRequired) {
									var sDataFieldActionPath = fnGetDataFieldActionPath(oLineItems[index], oMetaModel);
									if (sDataFieldActionPath) {
										aDataFieldActionPath.push(sDataFieldActionPath);
										aProperties.push(sDataFieldActionPath);
									}
								}
								break;
							case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
								//Handling for FieldGroup and Chart via DataFieldForAnnotation.
								var oLineItem = oLineItems[index];
								// add collection of fieldGroup to Lineitem for Semantically connected fields
								if (oLineItem.Target && oLineItem.Target.AnnotationPath && oLineItem.Target.AnnotationPath.indexOf("com.sap.vocabularies.UI.v1.FieldGroup") >= 0) {
									var sAnnotationPath = oLineItem.Target.AnnotationPath;
									var oRequiredData = oEntityType[sAnnotationPath.split("@")[1]];
									oLineItems = oLineItems.concat(oRequiredData && oRequiredData.Data);
									continue;
								}
								//handles chart annotation if in same entity type
								var aAnnotationPath = fnGetDataFieldForAnnotationPath(oLineItem, oEntityType);
								for (var iterator = 0; iterator < aAnnotationPath.length; iterator++) {
									if (aAnnotationPath[iterator]) {
										aProperties.push(aAnnotationPath[iterator]);
									}
								}
								break;
						}
					}

					if (oCallbacks.isFieldControlsPathRequired) {
						fnGetFieldControlsPath(aSelects, oMetaModel, oEntityType, oEntitySet, sLineItemAnnotation);

						// add applicablePath properties for breakout actions
						var oBreakoutActions = oCommonUtils.getBreakoutActions(oSmartTable);
						for (var sAction in oBreakoutActions) {
							aProperties.push(oBreakoutActions[sAction].requiresSelection && oBreakoutActions[sAction].applicablePath);
						}

						// add Draft Admin Data to expand if entity is Draft and Draft Root and has Draft Admin Data
						var oDraftContext = oServices.oDraftController.getDraftContext();
						if (oDraftContext.isDraftEnabled(sEntitySet) && oDraftContext.isDraftRoot(sEntitySet) && oDraftContext.hasDraftAdministrativeData(sEntitySet)) {
							if (aSelects.length > 0) {
								aProperties.push("DraftAdministrativeData");
							}
						}
					}
				}
				// sortOrder Annotation of presentation variant - only relevant for sap.m.Table
				var oVariant = oSmartTable.fetchVariant();
				if (!oCustomData.TemplateSortOrder && oCallbacks && oCallbacks.determineSortOrder) {
					// if no sort order could be derived directly, maybe it is provided by a callback
					oCustomData.TemplateSortOrder = oCallbacks.determineSortOrder();
				}
				if ((!oVariant || !oVariant.sort) && oCustomData.TemplateSortOrder) {
					var aSortOrder = oCustomData.TemplateSortOrder.split(", ");
					for (var j = 0; j < aSortOrder.length; j++) {
						var aSort = aSortOrder[j].split(" ");
						if (aSort.length > 1) {
							oBindingParams.sorter.push(new Sorter(aSort[0], aSort[1] === "true"));
						} else {
							oBindingParams.sorter.push(new Sorter(aSort[0]));
						}
					}
				}

				for (var i = 0; i < aProperties.length; i++) {
					fnEnsureSelectionProperty(aProperties[i]);
				}
			};
			oCommonUtils.onBeforeRebindTableOrChart(oEvent, oCallbacks, oSmartFilterBar);
		}

		function onListNavigateImpl(oEventSource, oEventParameters, oState, oBindingContext, bReplace){
			// unfortunately, the interface of onListNavigationExtension was build with providing the original event
			// with dataloss popup, the original event is lost (and in some cases, we now actually have to use a different event anyway), so we have to fake
			// the original event for the extension in a way, that the event in the extension is like the extension developer expects
			// (i.e. like it used to be: press event of ColumnListItem, target of navigation could be retrieved as source of event (but also provided as 2. parameter)
			var oEvent = new Event("press", oEventSource, oEventParameters);

			oBindingContext = oBindingContext || oEventSource.getBindingContext();
			if (oController.onListNavigationExtension && oController.onListNavigationExtension(oEvent, oBindingContext, bReplace)){
				return;
			}
			if (oEventSource.data("CrossNavigation")) {
					// intent based navigation
				fnNavigateIntentManifest(oEventSource, oBindingContext, oState.oSmartFilterbar);
				return;
			}
			storeObjectPageNavigationRelatedInformation(oEventSource, oState);
			oCommonUtils.navigateFromListItem(oBindingContext, bReplace);
		}

		/**
		 * Navigation from table
		 * @param {sap.ui.base.EventProvider} oEventOrSource - either event triggering navigation, or it's source control (if the event needs to be faked - then the control should be a ColumnListItem or mTable)
		 * @param {object} oState
		 * @param {boolean} bIsProgrammatic - If this is truthy it is assumed that no data loss and busy checks are needed
		 */
		function onListNavigate(oEventOrSource, oState, oBindingContext, bIsProgrammatic) {
			// method is called in different ways:
			// - UI table: source of event is context to navigate to
			// - responsive Table: itemPress event of table must be used, context to navigate to is provided in paramter listItem
			// - programmatical navigation: no event, but an item (ColumnListItem?) is provided
			// - chart: navigation target provided in oBindingContext, Extension not provided???
			// event source contains also information in custom data, if navigation is overidden by external navigation
			var oTemplatePrivateGlobalModel = oController.getOwnerComponent().getModel("_templPrivGlobal");
			placeholderHelper.setPlaceHolderPreconditions(oTemplatePrivateGlobalModel);
			var oEventSource, oEventParameters = {};
			if (oEventOrSource instanceof Event){
				oEventSource = oEventOrSource.getSource();
				oEventParameters = oEventOrSource.getParameters();
				if (controlHelper.isMTable(oEventSource)){
					// responsive table -> don't use the original event but replace it
					oEventSource = oEventOrSource.getParameter('listItem');
					oEventParameters.id = oEventSource.getId();
				}
			} else {
				// programmatical case
				oEventSource = oEventOrSource;
			}

			if (bIsProgrammatic){
				onListNavigateImpl(oEventSource, oEventParameters, oState, oBindingContext, true);
			} else {
				var iViewLevel = oComponentUtils.getViewLevel();
				var aCurrentKeys = oServices.oApplication.getCurrentKeys(iViewLevel + 1);
				var bReplace = aCurrentKeys.length > iViewLevel + 1;  // if the list from which the navigation is started is not the most right one, perform the navigation as a relace navigation
				// This will care for:
				// - wait until side-effects have been executed
				// - app is not busy (otherwise do nothing)
				// - send a data loss popup in case needed (might also result in doing nothing)
				oServices.oDataLossHandler.performIfNoDataLoss(onListNavigateImpl.bind(null, oEventSource, oEventParameters, oState, oBindingContext, bReplace), Function.prototype);
			}
		}

		// This is called, when the number of selected items is incorrect
		function fnShowMessageForInvalidNumberOfSelects(iCount){
			oServices.oApplication.performAfterSideEffectExecution(function(){ // wait until side-effects are finished (otherwise the app might be still busy)
				if (oServices.oApplication.getBusyHelper().isBusy()) {
					oLogger.info("Ignore incorrect selection, since app is busy anyway");
					return; // avoid sending messages while app is busy
				}
				var sTextId = iCount ? "ST_GENERIC_MULTIPLE_ITEMS_SELECTED" : "ST_GENERIC_NO_ITEM_SELECTED";
				MessageBox.error(oCommonUtils.getText(sTextId), {
					styleClass: oCommonUtils.getContentDensityClass()
				});
			});
		}

		function onDataFieldWithNavigationPath(oEvent) {
			var sNavProperty, i, ilength;
			var oComponent = oController.getOwnerComponent(),
				aCustomData = oEvent.getSource().getCustomData(),
				sContentWidth = "10rem";

			if (aCustomData.length === 0) {
				return;
			}
			for (i = 0, ilength = aCustomData.length; i < ilength; i++ ) {
				if (aCustomData[i].getProperty("key") === "Target") {
					sNavProperty = aCustomData[i].getProperty("value");
					break;
				}
			}
			if (!sNavProperty) {
				MessageBox.show(oCommonUtils.getText("ST_GENERIC_ERROR_IN_NAVIGATION"), {
					icon: MessageBox.Icon.ERROR,
					title: oCommonUtils.getText("ST_ERROR"),
					actions: [sap.m.MessageBox.Action.CLOSE],
					horizontalScrolling: true,
					contentWidth: sContentWidth,
					details: oCommonUtils.getText("ST_GENERIC_ERROR_IN_NAVIGATION_PROPERTY_MISSING", ["DataFieldWithNavigationPath"])
				});
				return;
			}
			var oModel = oComponent.getModel(),
					oMetaModel = oModel.getMetaModel();

			//Source
			var sNavPathSource = oEvent.getSource().getBindingContext().getPath(),
				sSourceEntitySet = sNavPathSource.slice(1, sNavPathSource.indexOf("(")),
				oSourceEntityType = oMetaModel.getODataEntityType(oMetaModel.getODataEntitySet(sSourceEntitySet).entityType),
				j, bNavPropertyFound = false,
				jLength = oSourceEntityType.navigationProperty.length;
			for (j = 0; j < jLength; j++) {
				if (oSourceEntityType.navigationProperty[j].name === sNavProperty) {
					bNavPropertyFound = true;
					break;
				}
			}
			if (!bNavPropertyFound) {
				MessageBox.show(oCommonUtils.getText("ST_GENERIC_ERROR_IN_NAVIGATION"), {
					icon: MessageBox.Icon.ERROR,
					title: oCommonUtils.getText("ST_ERROR"),
					actions: [sap.m.MessageBox.Action.CLOSE],
					horizontalScrolling: true,
					contentWidth: sContentWidth,
					details: oCommonUtils.getText("ST_GENERIC_ERROR_NAVIGATION_PROPERTY_NOT_CORRECT", [sNavProperty, "DataFieldWithNavigationPath"])
				});
				return;
			}

			//Target
			var oAssociationEnd = oMetaModel.getODataAssociationEnd(oSourceEntityType, sNavProperty),
				oTargetEntityType = oMetaModel.getODataEntityType(oAssociationEnd.type),
				sTargetEntityType,
				sTargetEntitySet;
			if (oTargetEntityType) {
				sTargetEntityType = oTargetEntityType.namespace + "." + oTargetEntityType.name;
			}
			var aEntitySetContainer = oMetaModel.getODataEntityContainer().entitySet;
			for (i = 0, ilength = aEntitySetContainer.length; i < ilength; i++  ) {
				if (aEntitySetContainer[i].entityType === sTargetEntityType) {
					sTargetEntitySet = aEntitySetContainer[i].name;
					break;
				}
			}

			if (!sTargetEntitySet) {
				var sTEntityset = sTargetEntityType.split(".")[1];
				sTEntityset = sTEntityset.slice(0, sTEntityset.length - 4);
				MessageBox.show(oCommonUtils.getText("ST_GENERIC_ERROR_IN_NAVIGATION"), {
					icon: MessageBox.Icon.ERROR,
					title: oCommonUtils.getText("ST_ERROR"),
					actions: [sap.m.MessageBox.Action.CLOSE],
					horizontalScrolling: true,
					contentWidth: sContentWidth,
					details: oCommonUtils.getText("ST_NAV_ERROR_TARGET_ENTITYSET_IS_MISSING",[sTEntityset])
				});
				return;
			}
			var aKeys = oCommonUtils.getNavigationKeyProperties(sTargetEntitySet),
				oNavigationController = oServices.oNavigationController,
				oUrlParameters = {
					"$expand": ""
				};

			if (oComponentUtils.isDraftEnabled()) {
				oUrlParameters = {
						"$expand": "DraftAdministrativeData"
				};
			}
//			function fnReadNavigationSource(sNavPathSource, sNavProperty, oUrlParameters, oNavigationController, aKeys, iLevel) {
			var oPromise = new Promise(function(fnResolve, fnReject) {
					oModel.read(sNavPathSource + "/" + sNavProperty , {
						urlParameters: oUrlParameters,
						success: function(oResponse) {
							fnResolve(oResponse);
							oServices.oApplication.invalidatePaginatorInfo();
							var sRoute = oCommonUtils.mergeNavigationKeyPropertiesWithValues(aKeys, oResponse);
							oServices.oApplication.setStoredTargetLayoutToFullscreen(1);
							oNavigationController.navigateToContext(sRoute, null, false);
						},
						error: function(oReject) {
							fnReject(oReject);
						}
					});

				});
//			}
			oComponentUtils.getBusyHelper().setBusy(oPromise);
		}

		/*
		 * Intent based navigation triggered from table toolbar
		 * @param {sap.ui.base.Event} oEvent - The triggered event with parameters
		 * @param {object} oState
		 */
		function onDataFieldForIntentBasedNavigation(oEvent, oState) {
			var oEventSource = oEvent.getSource();
			var oCustomData = oCommonUtils.getElementCustomData(oEventSource);
			var oControl = oCommonUtils.getOwnerControl(oEventSource);
			//getOwnerControl returns a responsive table control in case table type is responsive table
			//Condition below makes sure oControl is a smartTable which is used later for getting the contexts of selected objects
			oControl = controlHelper.isMTable(oControl) ? oControl.getParent() : oControl;
			var aContexts = oCommonUtils.getSelectedContexts(oControl);
			onDataFieldForIntentBasedNavigationSelectedContext(oEventSource, oCustomData, aContexts, oState);
		}


		function onDataFieldWithIntentBasedNavigation(oEvent, oState) {
			var oEventSource = oEvent.getSource();
			var oContext = oEventSource.getParent().getBindingContext();
			var sSemanticObject = oEventSource.data("SemanticObject");
			var sAction = oEventSource.data("Action");

			oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
				var oOutbound = {
						action: sAction,
						semanticObject:	sSemanticObject
				};
				fnNavigateIntent(oOutbound, oContext, oState.oSmartFilterbar || undefined, oState.oSmartTable || oEventSource);
			}, Function.prototype, oState);
		}

		/*
		 * Intent based navigation with selected contexts
		 * This handles multi context and single context navigation.
		 * @param {sap.ui.core.Control} oSource - Source which has triggered the navigation call.
		 * @param {object} oCustomData - customData of store in the event source.
		 * @param {array} aContexts - Array of selected contexts.
		 * @param {object} oState.
		 */
		function onDataFieldForIntentBasedNavigationSelectedContext(oSource, oCustomData, aContexts, oState) {
			var oOutbound = {
					action: oCustomData.Action,
					semanticObject:	oCustomData.SemanticObject
			};
			oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
			fnNavigateIntent(oOutbound, aContexts, oState.oSmartFilterbar || undefined, oState.oSmartTable || oSource);
				}, Function.prototype, oState);
		}

		/**
		 * Called from Determining Button belonging to Table and Chart Annotation of type DataFieldForIntentBasedNavigation
		 * @param {object} oButton the button the event was called on
		 * @param {object} oContextContainer the control hosting the selected contexts
		 * @param {object} oState additional state object
		 */
		function onDeterminingDataFieldForIntentBasedNavigation(oButton, oContextContainer, oState) {
			var oCustomData = oCommonUtils.getElementCustomData(oButton);
			var aContexts = oCommonUtils.getSelectedContexts(oContextContainer);
			var bRequiresContext = !(oCustomData.RequiresContext && oCustomData.RequiresContext === "false");
			if (bRequiresContext && !aContexts.length){ // not consistent, since contexts missing
				fnShowMessageForInvalidNumberOfSelects(aContexts.length);
			} else {
				onDataFieldForIntentBasedNavigationSelectedContext(oButton, oCustomData, aContexts, oState);
			}
		}

		function onInlineDataFieldForIntentBasedNavigation(oEventSource, oState){
			oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
				var oOutbound = {
						semanticObject: oEventSource.data("SemanticObject"),
						action: oEventSource.data("Action")
				};
				var oContext = oEventSource.getParent().getBindingContext();
				fnNavigateIntent(oOutbound, oContext, oState.oSmartFilterbar, oState.oSmartTable || oEventSource);
			}, Function.prototype, oState);
		}

		function onInlineDataFieldForAction(oEvent, oState) {
			var oEventSource = oEvent.getSource();
			var oTable = oCommonUtils.getOwnerControl(oEventSource).getParent();
			var aContexts = [oEventSource.getBindingContext()];
			var oCustomData = oCommonUtils.getElementCustomData(oEventSource);
			var sEntitySet = oTable.getEntitySet();
			oCommonUtils.triggerAction(aContexts, sEntitySet, oCustomData, oTable, oState);
		}

		/* Called from Determining Button belonging to Table's Annotation of type DataFieldForAction
		 * @param {object} oEvent
		 * @param {object} optional: the table the determining action belongs to. If not set, the whole view is taken.
		 */
		function onDeterminingDataFieldForAction(oEvent, oTable) {
			var oView = oController.getView();
			var oCustomData = oEvent.getSource().data(); // only needed if context-free determining actions should really be supported
			var aContexts = oTable ? oCommonUtils.getSelectedContexts(oTable) : [oView.getBindingContext()];
			if (oCustomData.ActionFor && aContexts.length === 0) { // determining actions must always have something to refer to
				fnShowMessageForInvalidNumberOfSelects(aContexts.length);
			} else {
				var oEventSource = oEvent.getSource();
				var oCustomData = oCommonUtils.getElementCustomData(oEventSource);
				var sEntitySet = oTable ? oTable.getEntitySet() : oController.getOwnerComponent().getEntitySet();
				oCommonUtils.triggerAction(aContexts, sEntitySet, oCustomData, oTable);
			}
		}

		/**
		 * Action triggered from Control's toolbar
		 * @param {sap.ui.base.Event} oEvent - the triggered event (most likely a 'click')
		 * @param {object} oState
		 */
		function onCallActionFromToolBar(oEvent, oState) {
			var oSourceControl, sEntitySet = "";
			var oControl = oCommonUtils.getOwnerControl(oEvent.getSource());
			//getOwnerControl returns a responsive table control in case table type is responsive table
			//Condition below makes sure oControl is a smartTable which is used later for getting the contexts of selected objects
			oControl = controlHelper.isMTable(oControl) ? oControl.getParent() : oControl;
			var oCustomData = oEvent.getSource().data();
			var aContexts = oCommonUtils.getSelectedContexts(oControl);

			if (controlHelper.isSmartTable(oControl)) {
				oSourceControl = oControl.getTable();
				sEntitySet = oControl.getEntitySet();

			} else if (controlHelper.isSmartChart(oControl)) {
				oControl.getChartAsync().then(function(oChart){
					oSourceControl = oChart;
				});
				sEntitySet = oControl.getEntitySet();
			}

			var mJSONData = getDataforActionDialog(aContexts,oCustomData);
			//when Table is Multi Select and few of the selected items are not applicable for action
			if (oCustomData.ActionFor && mJSONData.inApplicableCount > 0 && (controlHelper.isSmartTable(oControl) && ((oSourceControl.getMode && oSourceControl.getMode() === "MultiSelect") ||
					(oSourceControl.getSelectionMode && oSourceControl.getSelectionMode() === "MultiToggle")))) {
				var warningText = oCommonUtils.getText("ST_GENERIC_WARNING_TEXT", [mJSONData.inApplicableCount]);
				mJSONData.warningText = warningText;
				var mJSONActionData = {
						functionImportPath: oCustomData.Action,
						contexts: mJSONData.aApplicableContexts,
						sourceControl: oSourceControl,
						label: oCustomData.Label,
						operationGrouping: oCustomData.InvocationGrouping,
						sEntitySet: sEntitySet,
						oState: oState
				};
				getActionDialog(oControl).then(function (oActionDialog) {
					var oActionDialogModel = oActionDialog.getModel("Action");
					oActionDialogModel.setData(mJSONActionData);

					var oListModel = new sap.ui.model.json.JSONModel(mJSONData);
					oActionDialog.setModel(oListModel, "list");

					var oActionDialogListModel = oActionDialog.getModel("list");
					oActionDialogListModel.setData(mJSONData);

					oActionDialog.open();
				});
			} else {
				//When all the selected items are applicable for action
				CRUDManagerCallAction({
					functionImportPath: oCustomData.Action,
					contexts: aContexts,
					sourceControl: oSourceControl,
					label: oCustomData.Label,
					operationGrouping: oCustomData.InvocationGrouping
				}, oState, sEntitySet);
			}
		}

		/**
		 * Return an instance of the ActionConfirmation fragment
		 *
		 * @param {sap.m.Table} table
		 * @return {sap.m.Dialog} - returns the Delete Confirmation Dialog
		 * @private
		 */
		function getActionDialog(oControl){
			return oCommonUtils.getDialogFragmentAsync("sap.suite.ui.generic.template.fragments.ActionConfirmation", {
				onCancel: function(oEvent) {
					var oDialog = oEvent.getSource().getParent();
					oDialog.close();
				},
				onContinue: function(oEvent){
					var oDialog = oEvent.getSource().getParent();
					var jsonActionData = oEvent.getSource().getParent().getModel("Action").getData();

					CRUDManagerCallAction({
						functionImportPath: jsonActionData.functionImportPath,
						contexts: jsonActionData.contexts,
						sourceControl: jsonActionData.sourceControl,
						label: jsonActionData.label,
						operationGrouping: jsonActionData.operationGrouping
					}, jsonActionData.oState, jsonActionData.sEntitySet);
					oDialog.close();
				}
			}, "Action" );
		}

		/**
		 * Return the data necessary for the Action Confirmation Dialog
		 *
		 * @param [array] aContexts - Array of selected Items
		 * @param {object} oCustomData - Object containing the information about the action like label and action information
		 * @return {map} JSON map containing the data for the Action Confirmation Dialog
		 * @private
		 */

		function getDataforActionDialog(aContexts, oCustomData) {
			var oEntity, bActionName, sEntitySet, isValidEntitySet;
			var oModel = oController.getView().getModel();
			var oMetaModel = oModel.getMetaModel();
			if (aContexts && aContexts.length > 0) {
				sEntitySet = aContexts[0].sPath.substring(1, aContexts[0].sPath.indexOf('('));
				isValidEntitySet = oMetaModel.getODataEntitySet(sEntitySet);
			}
			if (isValidEntitySet){
				var aFunctionImport = oCustomData.Action.split("/")[1]; //getting the Function Import name
				var aItems = [], aValidContexts = [];
				var mJSONData = {
						aInApplicableItems: undefined,
						inApplicableCount: 0,
						dialogTitle: oCustomData.Label,
						warningText: undefined,
						aApplicableContexts: undefined
					};
				if (aFunctionImport) {
					//getting action property name as it is in Entity Type in metadata
					bActionName = oMetaModel.getODataFunctionImport(aFunctionImport)["sap:applicable-path"];
				}
				for (var i = 0; i < aContexts.length; i++) {
					oEntity = oModel.getObject(aContexts[i].getPath());
					if (bActionName && oEntity[bActionName] === false) {
						mJSONData.inApplicableCount++;
						//getting HeaderInfo Title value
						var oEntityType = oMetaModel.getODataEntityType(oMetaModel.getODataEntitySet(sEntitySet).entityType);
						var oHeaderInfoValue = oEntityType["com.sap.vocabularies.UI.v1.HeaderInfo"] ? (oEntityType["com.sap.vocabularies.UI.v1.HeaderInfo"].Title && oEntityType["com.sap.vocabularies.UI.v1.HeaderInfo"].Title.Value) || {} : {};
						// if com.sap.vocabularies.UI.v1.HeaderInfo/Value/Path does not return a result, check if com.sap.vocabularies.UI.v1.HeaderInfo/Value/String present
						var sTitle = "";
						if (oHeaderInfoValue.Path) {
							sTitle = aContexts[i].getProperty(oHeaderInfoValue.Path);
						} else {
							sTitle = oHeaderInfoValue.String || "";
						}
						aItems.push({
							sKey: sTitle
						});
					} else {
						aValidContexts.push(aContexts[i]);
					}
				}
				mJSONData.aInApplicableItems = aItems;
				mJSONData.aApplicableContexts = aValidContexts;
			}
			return mJSONData;
		}

		/**
		 * Call the CRUDManager callAction method
		 * @param {map} mParams - a map containing the parameters for the CRUDManager callAction method
		 * @param {object} oState
		 * @param {string} sEntitySet - the control's entity set
		 * @private
		 */
		function CRUDManagerCallAction(mParams, oState, sEntitySet) {
			var oResponse;

			// only for oCustomData.Type === "com.sap.vocabularies.UI.v1.DataFieldForAction"
			// DataFieldForIntentBasedNavigation separated within ToolbarButton.fragment, uses other event handler
			// NO ITEM SELECTED: supported - if selection is required then button will be disabled via applicable-path otherwise the button will always be enabled
			// ONE ITEM SELECTED: supported
			// MULTIPLE ITEMS SELECTED: supported
			oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
				//processing allowed
				// TODO check Denver implementation
				oServices.oCRUDManager.callAction({
					functionImportPath: mParams.functionImportPath,
					contexts: mParams.contexts,
					sourceControl: mParams.sourceControl,
					label: mParams.label,
					operationGrouping: mParams.operationGrouping
				}, oState).then(function(aResponses) {
					if (aResponses && aResponses.length) {
						for (var i = 0; i < aResponses.length; i++) {
							oResponse = aResponses[i];
							if (oResponse.response && oResponse.context && (!oResponse.actionContext || oResponse.actionContext && oResponse.context.getPath() !== oResponse.actionContext.getPath())) {
								//Delaying the content call of the component that triggered the action as it is not needed immediately as we have already navigated to the other component.
								//We set the calling component to dirty which will trigger the refresh of the content once it is activated again.
								oServices.oApplication.getBusyHelper().getUnbusy().then(oServices.oViewDependencyHelper.setMeToDirty.bind(null, oController.getOwnerComponent(), sEntitySet));
								break;
							}
						}
					}
				}, Function.prototype);
			}, Function.prototype, oState, "Proceed");
		}
		/**
		 * Adds a new entry to the table and returns a Promise
		 *
		 * @return Promise which resolves to - 1. undefined if oEventSource.data("CrossNavigation")
		 *                                   - 2. oNonDraftCreatePromise for non draft scenario
		 *                                   - 3. oNewContext for draft scenario and bCreateWithDialogEnabled = true
		 *                                   - 4. undefined for draft scenario and bSuppressNavigation = false
		 *                                   - 5. oNewContext for draft and bIgnoreTableRefresh = true
		 */
		function addEntry(oEventSource, bSuppressNavigation, oSmartFilterBar, oPredefinedValues, bIgnoreTableRefresh, bCreateWithDialogEnabled) {
			if (oEventSource.data("CrossNavigation")) {
				// intent based navigation
				fnNavigateIntentManifest(oEventSource, oEventSource.getBindingContext(), oSmartFilterBar);
				return new Promise(function(resolve) {
					resolve();
				});
			}

			var oTable = oCommonUtils.getOwnerControl(oEventSource);
			//getOwnerControl returns a responsive table control in case table type is responsive table
			//Condition below makes sure oControl is a smartTable which is used later for getting the contexts of selected objects
			oTable = controlHelper.isSmartTable(oTable) ? oTable : oTable.getParent();
			var sTablePath = oTable.getTableBindingPath();
			var sEntitySet = oTable.getEntitySet();
			var oComponent = oController.getOwnerComponent();
			var oBusyHelper = oServices.oApplication.getBusyHelper();
			var oNonDraftCreatePromise = oComponentUtils.getNonDraftCreatePromise(sEntitySet, oPredefinedValues);
			if (oNonDraftCreatePromise){ // non-draft case
				oBusyHelper.setBusy(oNonDraftCreatePromise);
				return oNonDraftCreatePromise;
			}
			// now we are in draft case
			var fnCRUDManagerCall = function(oPredefined){
				var oRet = oServices.oCRUDManager.addEntry(oTable, oPredefined).then(function(oNewContext){
					if (bCreateWithDialogEnabled){
						return oNewContext;
					} else if (!bSuppressNavigation){
						oServices.oApplication.navigateToSubContext(oNewContext, false, 4);
						// We expect that the content of the table we are navigating away from will be changed by the actions taking place on the follow-up page.
						// Therefore, we set it to dirty in advance. However, we have to postpone this until the table is no longer visible, since otherwise the
						// refresh of the table would be triggered immediately, which means before potential save actions being performed on the follow-up page.
						// In order to achieve this, setting this page to dirty is postponed until the busy session is finished (which means in particular, that
						// the navigation to the follow-up page has happened).
						oBusyHelper.getUnbusy().then(oServices.oViewDependencyHelper.setMeToDirty.bind(null, oComponent, sEntitySet));
					} else if (!bIgnoreTableRefresh){
						// In a paste event, multiple records are pasted at once, we do not want to call refreshSmartTable for every record pasted
						// Instead, we only call it once for one whole paste action
						oCommonUtils.refreshSmartTable(oTable);
							//execute side effects for inline create
						oServices.oApplicationController.executeSideEffects(oComponent.getBindingContext(), [], [sTablePath]);
						return oNewContext;
					}
				});

				oRet.catch(Function.prototype);
				return oRet;
			};

			if (oPredefinedValues instanceof Promise){
				return oPredefinedValues.then(fnCRUDManagerCall);
			} else {
				return fnCRUDManagerCall(oPredefinedValues);
			}
		}

		function submitChangesForSmartMultiInput() {
			var oParameter = {
				batchGroupId: "Changes",
				changeSetId: "Changes",
				draftSave: true,
				noBlockUI: true,
				noShowResponse: true,
				onlyIfPending: true,
				pendingChanges: true,
				forceSubmit: true
			};
			oServices.oTransactionController.triggerSubmitChanges(oParameter);
		}

		/**
		 * Event handler for single lineitem delete on the List Report or Object Page
		 * @param {sap.ui.base.Event} oEvent
		 * @public
		 */
		function deleteEntry(oEvent) {
			var oSmartTable = getSmartTableFromEvent(oEvent);
			var oListItem = oEvent.getParameter("listItem");
			var oListItemContext = oListItem.getBindingContext();
			deleteImpl(oSmartTable, [oListItemContext]);
		}

		/**
		 * Event handler for multi lineitem delete on the List Report or Object Page
		 * @param {sap.ui.base.Event} oEvent
		 * @public
		 */
		function deleteEntries(oEvent) {
			var oSmartTable = getSmartTableFromEvent(oEvent);
			var aSelectedContexts = oCommonUtils.getSelectedContexts(oSmartTable);
			deleteImpl(oSmartTable, aSelectedContexts);
		}

		/**
		 * Event handler for Delete on the List Report
		 * @param {sap.ui.comp.smarttable.SmartTable} oSmartTable
		 * @param {array} aSelectedItems - array of selected items in the table
		 * @public
		 */
		function deleteImpl(oSmartTable, aSelectedItems) {
			if (aSelectedItems.length > 0) {
				var oDialogParameterPromise = getDataForDeleteDialog(aSelectedItems, oSmartTable);
				// ensure to have a Promise (even if extension returns sth. different)
				var oBeforeDeleteExtensionPromise = Promise.resolve(oController.beforeDeleteExtension({aContexts: aSelectedItems}));
				oBeforeDeleteExtensionPromise.then(function(oExtensionResult){
					var oBusyHelper = oServices.oApplication.getBusyHelper();
					oBusyHelper.setBusy(oDialogParameterPromise);
					oDialogParameterPromise.then(function(oDialogParameter){
						extend(oDialogParameter.text, oExtensionResult);
						getDeleteDialog(oSmartTable).then(function (oDeleteDialog) {
							var oDeleteDialogModel = oDeleteDialog.getModel("delete");
							oDeleteDialogModel.setData(oDialogParameter);
							oDeleteDialog.open();
						});
					},
					/*
					 * In case the Promise returned from extension is rejected, don't show a popup and don't execute deletion. If
					 * extension needs an asynchronous step (e.g. backend request) to determine special text that could fail, it
					 * should use securedExecution. Then error messages from backend are shown by busyHelper automatically.
					 */
					Function.prototype
					);
				});
			} else {
				MessageBox.error(oCommonUtils.getText("ST_GENERIC_NO_ITEM_SELECTED"), {
					styleClass: oCommonUtils.getContentDensityClass()
				});
			}
		}

		// for ColumnLayout of smartForm, layouts are no longer accepted as a part of form content
		// Thus binding of fragment is to be done at runtime, as opposed to inline fragment call earlier
		function onContactDetails(oEvent) {
			var oSourceControl = oEvent.getSource();
			var oModel = oSourceControl.getModel();
			var oContactAnnotation = JSON.parse(oEvent.getSource().data("contactDetails"));
			var oContactData = oModel.getContext(oEvent.getSource().getBindingContext().getPath());

			oCommonUtils.getDialogFragmentAsync("sap.suite.ui.generic.template.fragments.ContactDetails", {}, "contact").then(function (oContactPopover) {
				var oContactModel = oContactPopover.getModel("contact");
				var sEnumType;

				// initializing the model
				oContactModel.setProperty("/", {});
				oContactModel.setProperty("/device", sap.ui.Device);
				// setting properties for contact model, to bind to the contactDetails fragment
				(oContactAnnotation.fn && oContactAnnotation.fn.Path) ? oContactModel.setProperty("/fn", (oContactData.getProperty(oContactAnnotation.fn.Path))) :
					oContactModel.setProperty("/fn", (oContactAnnotation.fn && oContactAnnotation.fn.String));

				(oContactAnnotation.title && oContactAnnotation.title.Path) ? oContactModel.setProperty("/title", (oContactData.getProperty(oContactAnnotation.title.Path))) :
					oContactModel.setProperty("/title", (oContactAnnotation.title && oContactAnnotation.title.String));

				(oContactAnnotation.photo && oContactAnnotation.photo.Path) ? oContactModel.setProperty("/photo", (oContactData.getProperty(oContactAnnotation.photo.Path))) :
					oContactModel.setProperty("/photo", (oContactAnnotation.photo && oContactAnnotation.photo.String));

				(oContactAnnotation.role && oContactAnnotation.role.Path) ? oContactModel.setProperty("/role", (oContactData.getProperty(oContactAnnotation.role.Path))) :
					oContactModel.setProperty("/role", (oContactAnnotation.role && oContactAnnotation.role.String));

				(oContactAnnotation.org && oContactAnnotation.org.Path) ? oContactModel.setProperty("/org", (oContactData.getProperty(oContactAnnotation.org && oContactAnnotation.org.Path))) :
					oContactModel.setProperty("/org", (oContactAnnotation.org && oContactAnnotation.org.String));

				if (oContactAnnotation.email && oContactAnnotation.email[0] &&  !oContactModel.getProperty("/email")) {
					sEnumType =  oContactAnnotation.email[0].type && oContactAnnotation.email[0].type.EnumMember;
					if (sEnumType && sEnumType.indexOf("com.sap.vocabularies.Communication.v1.ContactInformationType/work") > -1) {
						if (oContactAnnotation.email[0].address && oContactAnnotation.email[0].address.Path) {
							oContactModel.setProperty("/email", (oContactData.getProperty(oContactAnnotation.email[0].address.Path)));
						} else {
							oContactModel.setProperty("/email", (oContactAnnotation.email[0].address && oContactAnnotation.email[0].address.String));
						}
					}
				}

				var len = (oContactAnnotation.tel && oContactAnnotation.tel.length) || 0;
				for (var i = 0; i < len; i++) {
					if (oContactAnnotation.tel[i] && !oContactModel.getProperty("/fax")) {
						sEnumType =  oContactAnnotation.tel[i].type && oContactAnnotation.tel[i].type.EnumMember;
						if (sEnumType && sEnumType.indexOf("com.sap.vocabularies.Communication.v1.PhoneType/fax") > -1) {
							if (oContactAnnotation.tel[i].uri && oContactAnnotation.tel[i].uri.Path) {
								oContactModel.setProperty("/fax", (oContactData.getProperty(oContactAnnotation.tel[i].uri.Path)));
							} else {
								oContactModel.setProperty("/fax", (oContactAnnotation.tel[i].uri && oContactAnnotation.tel[i].uri.String));
							}
							continue;
						}
					}
					if (oContactAnnotation.tel[i] && !oContactModel.getProperty("/cell")) {
						sEnumType =  oContactAnnotation.tel[i].type && oContactAnnotation.tel[i].type.EnumMember;
						if (sEnumType && sEnumType.indexOf("com.sap.vocabularies.Communication.v1.PhoneType/cell") > -1) {
							if (oContactAnnotation.tel[i].uri && oContactAnnotation.tel[i].uri.Path) {
								oContactModel.setProperty("/cell", (oContactData.getProperty(oContactAnnotation.tel[i].uri.Path)));
							} else {
								oContactModel.setProperty("/cell", (oContactAnnotation.tel[i].uri && oContactAnnotation.tel[i].uri.String));
							}
							continue;
						}
					}
					if (oContactAnnotation.tel[i] &&  !oContactModel.getProperty("/work")) {
						sEnumType =  oContactAnnotation.tel[i].type && oContactAnnotation.tel[i].type.EnumMember;
						if (sEnumType && sEnumType.indexOf("com.sap.vocabularies.Communication.v1.PhoneType/work") > -1) {
							if (oContactAnnotation.tel[i].uri && oContactAnnotation.tel[i].uri.Path) {
								oContactModel.setProperty("/work", (oContactData.getProperty(oContactAnnotation.tel[i].uri.Path)));
							} else {
								oContactModel.setProperty("/work", (oContactAnnotation.tel[i].uri && oContactAnnotation.tel[i].uri.String));
							}
							continue;
						}
					}
				}
				oContactPopover.openBy(oSourceControl);
			});
		}

		function onRelatedAppNavigation(oOutbound, oContext) {
			var oNavigationHandler = oServices.oApplication.getNavigationHandler();
			var oSelectionVariant = fnBuildSelectionVariantForNavigation(oOutbound, null, oContext);
			oController.adaptNavigationParameterExtension(oSelectionVariant, oOutbound);
			oNavigationHandler.navigate(oOutbound.semanticObject, oOutbound.action, oSelectionVariant.toJSONString(),
					null, fnHandleError);
		}

		function onSmartFieldInitialise(oEvent,sViewId){
			var oSmartField = oEvent.getSource();
			onSmartLabelAttachFieldVisibility(oSmartField, sViewId);
		}

		function onSmartLabelAttachFieldVisibility(oSmartField, sViewId){
			var sValue = oSmartField.data('LabelId');
			var sSmartLabelId = sViewId + '--' + sValue;
			var oSmartLabel = sap.ui.getCore().byId(sSmartLabelId);
			if (oSmartLabel) {
			oSmartLabel.attachFieldVisibilityChange(oSmartField);
			}
		}

		/**
			* Returns the delete text based on the following four conditions
			* 1. HeaderInfo-> Title and HeaderInfo-> SubTitle in FCL mode
			* 2. HeaderInfo-> Title and HeaderInfo-> SubTitle in Fullscreen mode
			* 3. HeaderInfo-> Title
			* 4. HeaderInfo-> Without Title

			* @param sObjectTitle - Value of the title property
			* @param sObjectTitle - Value of the description property
			* @param isObjectPage - Boolean value indicating if the function is called from the OP smart table
			* @param isSubObjectPage - Boolean value indicating if the function is called from the sub object page
			* @param oSmartTable

			* @return sText - Text to be displayed
		*/
		function fnGetDeleteText(sObjectTitle, sObjectSubtitle, isObjectPage, isSubObjectPage, oSmartTable) {
			var aParams, sText;
			if (sObjectTitle) {
				if (sObjectSubtitle) {
					aParams = [" ", sObjectTitle, sObjectSubtitle];
					var oConfig = oController.getOwnerComponent().getAppComponent().getConfig();
					var isFCLApp = oConfig.settings && oConfig.settings.flexibleColumnLayout ? true : false;
					if (isFCLApp) {
						var oTemplatePrivateGlobalModel = oController.getOwnerComponent().getModel("_templPrivGlobal");
						if (oTemplatePrivateGlobalModel.getProperty("/generic/FCL/isVisuallyFullScreen")) {
							aParams.shift();
							if (isObjectPage) {
								sText = oSmartTable ? oCommonUtils.getContextText("DELETE_SELECTED_ITEM_WITH_OBJECTTITLE", oSmartTable.getId(), null, aParams) : oCommonUtils.getText("DELETE_WITH_OBJECTTITLE", aParams);
							} else {
								sText = isSubObjectPage ? oCommonUtils.getText("DELETE_SELECTED_ITEM_WITH_OBJECTTITLE", aParams) : oCommonUtils.getText("DELETE_WITH_OBJECTTITLE", aParams);
							}
						} else {
							if (isObjectPage) {
								sText = oSmartTable ? oCommonUtils.getContextText("DELETE_SELECTED_ITEM_WITH_OBJECTINFO", oSmartTable.getId(), null, aParams) : oCommonUtils.getText("DELETE_WITH_OBJECTINFO", aParams);
							} else {
								sText = isSubObjectPage ? oCommonUtils.getText("DELETE_SELECTED_ITEM_WITH_OBJECTINFO", aParams) : oCommonUtils.getText("DELETE_WITH_OBJECTINFO", aParams);
							}
						}
					} else {
						aParams.shift();
						if (isObjectPage) {
							sText = oSmartTable ? oCommonUtils.getContextText("DELETE_SELECTED_ITEM_WITH_OBJECTTITLE", oSmartTable.getId(), null, aParams) : oCommonUtils.getText("DELETE_WITH_OBJECTTITLE", aParams);
						} else {
							sText = isSubObjectPage ? oCommonUtils.getText("DELETE_SELECTED_ITEM_WITH_OBJECTTITLE", aParams) : oCommonUtils.getText("DELETE_WITH_OBJECTTITLE", aParams);
						}
					}
				} else {
					aParams = [sObjectTitle];
					if (isObjectPage) {
						sText = oSmartTable ? oCommonUtils.getContextText("DELETE_SELECTED_ITEM_WITH_OBJECTTITLE", oSmartTable.getId(), null, aParams) : oCommonUtils.getText("DELETE_WITH_OBJECTTITLE", aParams);
					} else {
						sText = isSubObjectPage ? oCommonUtils.getText("DELETE_SELECTED_ITEM_WITH_OBJECTTITLE", aParams) : oCommonUtils.getText("DELETE_WITH_OBJECTTITLE", aParams);
					}
				}
			} else {
				if (isObjectPage) {
					sText = oSmartTable ? oCommonUtils.getContextText("DELETE_SELECTED_ITEM", oSmartTable.getId()) : oCommonUtils.getText("ST_GENERIC_DELETE_SELECTED");
				} else {
					sText = isSubObjectPage ? oCommonUtils.getText("DELETE_SELECTED_ITEM") : oCommonUtils.getText("ST_GENERIC_DELETE_SELECTED");
				}
			}

			return sText;
		}

		/* eslint-disable */
		var fnBuildSelectionVariantForNavigation = testableHelper.testable(fnBuildSelectionVariantForNavigation, "fnBuildSelectionVariantForNavigation");
		var fnEvaluateParameters = testableHelper.testable(fnEvaluateParameters, "fnEvaluateParameters");
		var fnNavigateIntent = testableHelper.testable(fnNavigateIntent, "fnNavigateIntent");
		var fnHideTitleArea = testableHelper.testable(fnHideTitleArea, "fnHideTitleArea");
		var fnGetSelectedItemContextForDeleteMessage = testableHelper.testable(fnGetSelectedItemContextForDeleteMessage, "fnGetSelectedItemContextForDeleteMessage");
		var getDataForDeleteDialog = testableHelper.testable(getDataForDeleteDialog, "getDataForDeleteDialog");
		/* eslint-enable */

		return {
			onDataReceived: onDataReceived,
			onBeforeRebindTable: onBeforeRebindTable,
			onListNavigate: onListNavigate,
			onEditNavigateIntent: fnNavigateIntentManifest,
			onSemanticObjectLinkPopoverLinkPressed: fnSemanticObjectLinkPopoverLinkPressed,
			onRelatedAppNavigation: onRelatedAppNavigation,
			onDataFieldWithNavigationPath: onDataFieldWithNavigationPath,
			onDataFieldForIntentBasedNavigation: onDataFieldForIntentBasedNavigation,
			onDeterminingDataFieldForIntentBasedNavigation: onDeterminingDataFieldForIntentBasedNavigation,
			onDeterminingDataFieldForAction: onDeterminingDataFieldForAction,
			onInlineDataFieldForIntentBasedNavigation: onInlineDataFieldForIntentBasedNavigation,
			onDataFieldWithIntentBasedNavigation: onDataFieldWithIntentBasedNavigation,
			onInlineDataFieldForAction: onInlineDataFieldForAction,
			onMultiSelectionChange: onMultiSelectionChange,
			onSmartFieldUrlPressed: onSmartFieldUrlPressed,
			onCallActionFromToolBar: onCallActionFromToolBar,
			addEntry: addEntry,
			deleteEntry: deleteEntry,
			deleteEntries: deleteEntries,
			onContactDetails: onContactDetails,
			onSmartFieldInitialise: onSmartFieldInitialise,
			onSmartLabelAttachFieldVisibility: onSmartLabelAttachFieldVisibility,
			onSemanticObjectLinkNavigationTargetObtained: fnOnSemanticObjectLinkNavigationTargetObtained,
			onSemanticObjectLinkNavigationPressed: fnOnSemanticObjectLinkNavigationPressed,
			submitChangesForSmartMultiInput: submitChangesForSmartMultiInput,
			getSelectedItemContextForDeleteMessage: fnGetSelectedItemContextForDeleteMessage,
			getDeleteText: fnGetDeleteText
		};
	}

	return BaseObject.extend("sap.suite.ui.generic.template.lib.CommonEventHandlers", {
		constructor: function(oController, oComponentUtils, oServices, oCommonUtils) {
			extend(this, getMethods(oController, oComponentUtils, oServices, oCommonUtils));
		}
	});
});
