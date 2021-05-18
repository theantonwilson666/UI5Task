sap.ui.define(["sap/ui/base/Object", "sap/suite/ui/generic/template/genericUtilities/testableHelper", "sap/base/util/extend"], function(BaseObject,
	testableHelper, extend) {
	"use strict";

	var oTooltips = (function() {
		var oResource = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		return {
			navDownTooltip: oResource.getText("FACETFILTER_NEXT"),
			navUpTooltip: oResource.getText("FACETFILTER_PREVIOUS")
		};
	})();

	function getMethods(oControllerBase, oController, oTemplateUtils) {
		var oTemplatePrivateModel = oTemplateUtils.oComponentUtils.getTemplatePrivateModel();
		var oTemplatePrivateGlobalModel = oTemplateUtils.oComponentUtils.getTemplatePrivateGlobalModel();

		function computeAndSetVisibleParamsForNavigationBtns() {
			var oPaginatorInfo = oTemplateUtils.oComponentUtils.getPaginatorInfo();
			var bPaginatorAvailable = !!oPaginatorInfo && (!oControllerBase.fclInfo.isContainedInFCL || oTemplatePrivateGlobalModel.getProperty(
				"/generic/FCL/isVisuallyFullScreen"));
			var iLength = bPaginatorAvailable && (oPaginatorInfo.listBinding ? oPaginatorInfo.listBinding.getLength() : oPaginatorInfo.objectPageNavigationContexts.length);
			var bNavDownEnabled = bPaginatorAvailable && (oPaginatorInfo.selectedRelativeIndex !== (iLength - 1));
			var bNavUpEnabled = bPaginatorAvailable && oPaginatorInfo.selectedRelativeIndex > 0;
			oTemplatePrivateModel.setProperty("/objectPage/navButtons/navUpEnabled", bNavUpEnabled);
			oTemplatePrivateModel.setProperty("/objectPage/navButtons/navDownEnabled", bNavDownEnabled);
		}

		function fnHandleNavigateToObject(oPaginatorInfo, index){
			var oContext = oPaginatorInfo.objectPageNavigationContexts[index];
			oPaginatorInfo.selectedRelativeIndex = index;
			oTemplateUtils.oComponentUtils.setPaginatorInfo(oPaginatorInfo, false);
			oPaginatorInfo.paginate(oContext);
		}

		function handleShowOtherObject(iStep) {
			oTemplateUtils.oServices.oApplication.performAfterSideEffectExecution(function() {
				var oBusyHelper = oTemplateUtils.oServices.oApplication.getBusyHelper();
				if (oBusyHelper.isBusy()) {
					return;
				}
				oTemplateUtils.oServices.oDataLossHandler.performIfNoDataLoss(function(){
					// now navigate to next object page
					var oPaginatorInfo = oTemplateUtils.oComponentUtils.getPaginatorInfo();
					var oListBinding = oPaginatorInfo.listBinding;
					var iNextIdx = oPaginatorInfo.selectedRelativeIndex + iStep;
					var aAllContexts = oPaginatorInfo.objectPageNavigationContexts;
					if (aAllContexts && aAllContexts[iNextIdx]) {
						fnHandleNavigateToObject(oPaginatorInfo, iNextIdx);
					} else {
						var oFetchNewRecordsPromise = new Promise(function(fnResolve, fnReject) {
							var iTableGrowingIncrement = oPaginatorInfo.growingThreshold || Math.ceil(oListBinding.getLength() / 5);
							var iStartingPoint = aAllContexts ? aAllContexts.length : iNextIdx;
							var newEndIdx = iStartingPoint + iTableGrowingIncrement;
							var fetchAndUpdateRecords = function(mParameters) {
								// get new fetched contexts and do stuff
								var aNewAllContexts = mParameters.getSource().getContexts(0, newEndIdx);
								oPaginatorInfo.objectPageNavigationContexts = aNewAllContexts;
								oListBinding.detachDataReceived(fetchAndUpdateRecords);
								// also.. navigate
								fnHandleNavigateToObject(oPaginatorInfo, iNextIdx);
								fnResolve();
							};
							oListBinding.attachDataReceived(fetchAndUpdateRecords);
							oListBinding.loadData(0, newEndIdx);
						});
						oBusyHelper.setBusy(oFetchNewRecordsPromise);
					}
				}, Function.prototype);
			});
		}

		function handleShowNextObject() {
			fnDataLossConfirmationIfNonDraft(1);
		}

		function handleShowPrevObject() {
			fnDataLossConfirmationIfNonDraft(-1);
		}

		function fnDataLossConfirmationIfNonDraft(iStep) {
			oTemplateUtils.oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
				handleShowOtherObject(iStep);
			}, Function.prototype, oControllerBase.state);
		}

		oTemplatePrivateModel.setProperty("/objectPage/navButtons", extend({
			navDownEnabled: false,
			navUpEnabled: false
		}, oTooltips));
		if (oControllerBase.fclInfo.isContainedInFCL) {
			var oFullscreenBinding = oTemplatePrivateGlobalModel.bindProperty("/generic/FCL/isVisuallyFullScreen");
			oFullscreenBinding.attachChange(computeAndSetVisibleParamsForNavigationBtns);
		}

		return {
			computeAndSetVisibleParamsForNavigationBtns: computeAndSetVisibleParamsForNavigationBtns,
			handleShowNextObject: handleShowNextObject,
			handleShowPrevObject: handleShowPrevObject
		};
	}

	return BaseObject.extend("sap.suite.ui.generic.template.detailTemplates.PaginatorButtonsHelper", {
		constructor: function(oControllerBase, oController, oTemplateUtils) {
			extend(this, (testableHelper.testableStatic(getMethods, "PaginatorButtonsHelper"))(oControllerBase, oController,
				oTemplateUtils));
		}
	});
});
