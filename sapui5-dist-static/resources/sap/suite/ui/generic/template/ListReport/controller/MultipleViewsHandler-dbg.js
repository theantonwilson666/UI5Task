sap.ui.define([
	"sap/ui/base/Object",
	"sap/suite/ui/generic/template/js/StableIdHelper",
	"sap/suite/ui/generic/template/lib/multipleViews/MultipleViewsHandler",
	"sap/base/util/extend",
	"sap/suite/ui/generic/template/genericUtilities/FeError"
], function(BaseObject, StableIdHelper, MultipleViewsHandler, extend, FeError) {
	"use strict";

	// This helper class handles multiple views in the List Report.
	// In case the enclosing List Report really supports the multiple views feature it instantiates an instance of
	// sap.suite.ui.generic.template.lib.multipleViews.MultipleViewsHandler which implements the main part of the logic.
	// This class only contains the glue code which is used to adapt the services provided by this generic class to the requirements of the List Report

	// oState is used as a channel to transfer data to the controller and back.
	// oController is the controller of the enclosing ListReport
	// oTemplateUtils are the template utils as passed to the controller implementation
	var	sClassName = "ListReport.controller.MultipleViewsHandler";
	function getMethods(oState, oController, oTemplateUtils) {
		// Begin: Instance variables
		var oGenericMultipleViewsHandler;   // the generic implementation of the multiple views feature. Will be instantiated if this List Report uses the multiple views feature.
		var oQuickVariantSelectionEffective;
		// indicates either single or multi
		var sMode;
		var enableAutoBindingMultiView;



		function onDataRequested() {
			if (!oGenericMultipleViewsHandler) {
				return;
			}
			oGenericMultipleViewsHandler.updateCounts();
		}

		function onRebindContentControl(oBindingParams, aFiltersFromSmartTable) {
			if (!oGenericMultipleViewsHandler) {
				return;
			}
			oGenericMultipleViewsHandler.onRebindContentControl(oBindingParams, aFiltersFromSmartTable);
		}

		function fnFormatMessageStrip(aIgnoredFilters, sSelectedKey) {
			return oGenericMultipleViewsHandler ? oGenericMultipleViewsHandler.formatMessageStrip(aIgnoredFilters, sSelectedKey) : "";
		}

		function fnGetContentForIappState(){
			if (oGenericMultipleViewsHandler) {
				var sSelectedKey = oGenericMultipleViewsHandler.getSelectedKey();
				var oTableState = oGenericMultipleViewsHandler.getContentForIappState(sSelectedKey);
				return {
					state: oTableState
				};
			}
			return null;
		}


		function fnHasEntitySet(sEntitySet){
			if (!oGenericMultipleViewsHandler){
				return oController.getOwnerComponent().getEntitySet() === sEntitySet;
			}
			return oGenericMultipleViewsHandler.hasEntity(sEntitySet);
		}

		function fnFormatItemTextForMultipleView(oItemDataModel) {
			// if (!oGenericMultipleViewsHandler) {
			// 	return null;
			// }
			return oGenericMultipleViewsHandler && oGenericMultipleViewsHandler.formatItemTextForMultipleView(oItemDataModel);
		}

		function fnRestoreFromIappState(oState) {
			if (oGenericMultipleViewsHandler) {
				oGenericMultipleViewsHandler.restoreFromIappState(oState);
				fnSetSmartTable();
			}
		}

		function fnDetermineSortOrder() {
			// if (!oGenericMultipleViewsHandler) {
			// 	return null;
			// }
			return oGenericMultipleViewsHandler && oGenericMultipleViewsHandler.determineSortOrder();
		}

		function fnRefreshOperation(iRequest, vTabKey, mEntitySets) {
			if (!oGenericMultipleViewsHandler) {
				return false;
			}
			oGenericMultipleViewsHandler.refreshOperation(iRequest, vTabKey, mEntitySets);
			// tells caller there is generic multiple views handler which does the refresh
			return true;
		}

		function fnGetEnableAutoBinding() {
			// make it boolean value
			return !!(oQuickVariantSelectionEffective && oQuickVariantSelectionEffective.enableAutoBinding);
		}

		function fnGetOriginalEnableAutoBinding(){
			return enableAutoBindingMultiView;
		}

		function fnSetActiveButtonState() {
			if (!oGenericMultipleViewsHandler) {
				return;
			}
			oGenericMultipleViewsHandler.setActiveButtonState();
		}

		function fnRestoreActiveButtonState() {
			if (!oGenericMultipleViewsHandler) {
				return null;
			}
			return oGenericMultipleViewsHandler.restoreActiveButtonState();
		}

		function fnSetControlVariant(sChartVariantId, sTableVariantId, sPageVariantId) {
			if (!oGenericMultipleViewsHandler) {
				return;
			}
			oGenericMultipleViewsHandler.setControlVariant(sChartVariantId, sTableVariantId, sPageVariantId);
		}

		function fnHandleStartUpObject(oStartupObject) {
			if (!oGenericMultipleViewsHandler) {
				return;
			}
			if (oStartupObject.selectedQuickVariantSelectionKey) {
				oGenericMultipleViewsHandler.setSelectedKey(oStartupObject.selectedQuickVariantSelectionKey);
			}
		}

		function fnGetSelectedKeyPropertyName() {
			if (!sMode){
				return null;
			}
			return sMode === "single" ? "tableViewData" : "tableTabData";
		}

		function fnGetSelectedKey() {
			return oGenericMultipleViewsHandler.getSelectedKey();
		}

		function fnSetSelectedKey(sKey) {
			return oGenericMultipleViewsHandler.setSelectedKey(sKey);
		}

		function fnOnDetailsActionPress(oEvent) {
			var oBindingContext = oEvent.getParameter("itemContexts") && oEvent.getParameter("itemContexts")[0];
			oTemplateUtils.oCommonEventHandlers.onListNavigate(oEvent, oState, undefined, oBindingContext);
		}


		function fnSetSmartTable() {
			if (sMode === "multi") {
				var sKey = oGenericMultipleViewsHandler.getSelectedKey();
				var sSmartTableId = StableIdHelper.getStableId( {type: "ListReportTable", subType: "SmartTable", sQuickVariantKey: sKey});
				oState.oSmartTable = oController.byId(sSmartTableId);
			}
		}
		
		// should ensure that all other smart controls that use the same entity set will refresh their data
		function fnRefreshSiblingControls(oSmartControl){
			if (sMode === "multi"){
				oGenericMultipleViewsHandler.refreshSiblingControls(oSmartControl);
			}
		}

		(function() { // constructor coding encapsulated in order to reduce scope of helper variables
			var oSettings = oTemplateUtils.oComponentUtils.getSettings();
			var oQuickVariantSelectionX = oSettings.quickVariantSelectionX;
			var oQuickVariantSelection = oSettings.quickVariantSelection;
			if (oQuickVariantSelectionX && oQuickVariantSelection) {
				throw new FeError(sClassName, "Defining both QuickVariantSelection and QuickVariantSelectionX in the manifest is not allowed.");
			}
			oQuickVariantSelectionEffective = oQuickVariantSelectionX || oQuickVariantSelection;
			if (oQuickVariantSelectionX) {
				enableAutoBindingMultiView = oQuickVariantSelectionX.enableAutoBinding;		//Check if value of enableAutoBinding is being set from manifest
				if (enableAutoBindingMultiView === null || enableAutoBindingMultiView === undefined) {
					oQuickVariantSelectionX.enableAutoBinding = true;							//set the default value of enableAutoBinding to true
				}
			}
			if (!oQuickVariantSelectionEffective) {
				return;
			}
			var oSwitchingControl;
			if (oQuickVariantSelectionX){
				sMode = "multi";
				var sIdForIconTabBar =  StableIdHelper.getStableId({type:"QuickVariantSelectionX", subType: "IconTabBar"});
				oSwitchingControl = oController.byId(sIdForIconTabBar);
			} else {
				sMode = "single";
				var sSegmentedButton = StableIdHelper.getStableId({type:"QuickVariantSelection", subType: "SegmentedButton"});
				var sVariantSelect = StableIdHelper.getStableId({type:"QuickVariantSelection", subType: "VariantSelect"});
				oSwitchingControl = oController.byId(sSegmentedButton) || oController.byId(sVariantSelect);
			}

			// manifestSettings: indicates whether multiple tab multiview or multiple tab single view
			// pathInTemplatePrivateModel: path of the model to be read
			// smartControl: smartControl which contains table
			// getSmartControl : function which returns the smartcontrol by key
			// switchingControl: the control which is used to switch between the views. It must possess a getItems() method.
			// smartFilterBar: smartfilterbar which contains filter values
			var oConfiguration = {
				manifestSettings: oQuickVariantSelectionEffective,
				pathInTemplatePrivateModel: "/listReport/multipleViews",
				smartControl: oQuickVariantSelection && oState.oSmartTable, // only in single views mode a single smart control is being transfered
				getSmartControl: oQuickVariantSelectionX && function(sKey){
					var sId = StableIdHelper.getStableId({type: "ListReportTable", subType: "SmartTable", "sQuickVariantKey": sKey});
					return oController.byId(sId);
				},
				switchingControl: oSwitchingControl,
				smartFilterBar: oState.oSmartFilterbar,
				getSearchValue: function () {
					return oState.oSmartFilterbar.getBasicSearchValue();
				},
				appStateChange: function(){
					if (oGenericMultipleViewsHandler) {
						fnSetSmartTable();
						// The following logic checks whether we need to rebind or refresh (or both) the SmartControl which is switched to.
						var bSearchButtonPressed = oState.oIappStateHandler.areDataShownInTable() || oState.oWorklistData.bWorkListEnabled;
						oState.oIappStateHandler.changeIappState(true, bSearchButtonPressed);
					}
				},
				isDataToBeShown: function () {
					return oState.oIappStateHandler.areDataShownInTable() || oState.oWorklistData.bWorkListEnabled;
				},
				adaptRefreshRequestMode: function(iRefreshRequest) {
					// worklist is always refreshed
					return iRefreshRequest + (oState.oWorklistData.bWorkListEnabled && iRefreshRequest < 2 ? 2 : 0);
				},
				pathToActiveObjectEnabled: "/listReport/activeObjectEnabled",
				refreshModelOnTableRefresh: true
			};
			oGenericMultipleViewsHandler = new MultipleViewsHandler(oController, oTemplateUtils, oConfiguration);
			fnSetSmartTable();

		})();

		// public instance methods
		return {
			onDataRequested: onDataRequested,
			refreshOperation: fnRefreshOperation,
			onRebindContentControl: onRebindContentControl,
			formatMessageStrip: fnFormatMessageStrip,
			getContentForIappState: fnGetContentForIappState,
			restoreFromIappState: fnRestoreFromIappState,
			formatItemTextForMultipleView: fnFormatItemTextForMultipleView,
			getEnableAutoBinding: fnGetEnableAutoBinding,
			getOriginalEnableAutoBinding: fnGetOriginalEnableAutoBinding,
			determineSortOrder: fnDetermineSortOrder,
			setActiveButtonState: fnSetActiveButtonState,
			restoreActiveButtonState: fnRestoreActiveButtonState,
			setControlVariant: fnSetControlVariant,
			handleStartUpObject: fnHandleStartUpObject,
			onDetailsActionPress: fnOnDetailsActionPress,
			getSelectedKeyPropertyName: fnGetSelectedKeyPropertyName,
			getSelectedKey: fnGetSelectedKey,
			setSelectedKey: fnSetSelectedKey,
			hasEntitySet: fnHasEntitySet,
			refreshSiblingControls: fnRefreshSiblingControls
		};
	}

	return BaseObject.extend("sap.suite.ui.generic.template.ListReport.controller.MultipleViewsHandler", {
		constructor: function(oState, oController, oTemplateUtils) {
			extend(this, getMethods(oState, oController, oTemplateUtils));
		}
	});
});
