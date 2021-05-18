sap.ui.define(["sap/ui/base/Object",
	"sap/suite/ui/generic/template/lib/navigation/routingHelper",
	"sap/suite/ui/generic/template/genericUtilities/testableHelper",
    "sap/suite/ui/generic/template/genericUtilities/FeLogger",
	"sap/base/util/extend", "sap/base/util/deepExtend", "sap/base/util/isEmptyObject"
], function(BaseObject, routingHelper, testableHelper, FeLogger, extend, deepExtend, isEmptyObject) {
	"use strict";

	var oLogger = new FeLogger("lib.StatePreserver").getLogger();
	var oCrossAppNavService = routingHelper.getCrossAppNavService();

	// Allow unit tests to set a stub for the CrossAppNavService
	testableHelper.testableStatic(function setCrossAppNavService(oService){
		oCrossAppNavService = oService;
	}, "StatePreserver_setCrossAppNavService");

	/*
	 * oSettings should have the following properties:
	 * - oComponent: The owning component
	 * - appStateName: The name of the parameter used to store information within the url. It must be ensured that not two pages
	 *   shown at the same time (in FCL) use the same value
	 * - getCurrentState: a function returning the current state of the page.
	 *   The return value should be a map that maps keys (describing different aspects of the state) onto objects containing two properties:
	 *   # data: The data containing the state
	 *   # lifecycle: An object describing the lifecycle of the state
	 *     The following properties of this lifecycle object are evaluated:
	 *     % permanent: if this is set to true a hash that represents the state is stored within the url.
	 *                  The information how to resolve the hash back to a state is persisted (if the system settings allow this persistence)
	 *     % session: if this is set to true the a hash that represents the state is stored within the url.
	 *                The information how to resolve the hash back to the state is kept in the session
	 *     % pagination: if this is set to true the state information will be preserved on object change provided this change is done via pagination
	 *                   (pagination = object change while the corresponding view stays visible)
	 *     % page: if this is set to true the state information will be preserved for the page for the lifetime of the app (unless it is replaced by another state)
	 * - applyState: a function(oState) that applies the state (a map of keys to data) onto the page
	*/
	function getMethods(oTemplateContract, oSettings) {
		var oRegistryEntry = oTemplateContract.componentRegistry[oSettings.oComponent.getId()];

		var sRealizedAppStateKey = "";
		var oAppStateIsSetPromise = Promise.resolve(); // A Promise that is resolved when the current url and the content of sRealizedAppStateKey are consistent
		                                               // Otherwise the Promise will be resolved as soon as this is again the case
		var fnNotifyRealizedAppStateConsistent = null; // when this variable is not null a url has been caught which has not yet been adopted.
		                                       // In this case it is a function that should be called when the adoption has been performed successfully.
		var oAppStateCleanPromise = Promise.resolve(); // a promise that is resolved, when all url-relevant changes performed by the user are transferred to the url
		var fnAppStateCleanResolve = null; // corresponding resolve function - null, when promise is resolved
		var oStoringInformation = null; // when this parameter is not null a change of the url has been triggered which is not yet reflected in sRealizedAppStateKey.
		                                // In this case it contains a property appStateKey which contains the appStateKey which has been put into the url
		var sAppStateKeyInUrl = null; // the appstateKey which is currently in the url. It is (normally) updated in function isStateChange.

		var sLastAppKey, sLastBindingPath;

		var oCurrentAnalyzedState = Object.create(null);
		var oLastPermanentKeys = { };
		var oLastSessionKeys = { };

		function fnInitializeCurrentAnalyzedState(){
			oCurrentAnalyzedState.permanentEntries = Object.create(null);
			oCurrentAnalyzedState.sessionEntries = Object.create(null);
			oCurrentAnalyzedState.pageEntries = Object.create(null);
			oCurrentAnalyzedState.allEntries = Object.create(null);
		}
		fnInitializeCurrentAnalyzedState();

		function fnTransferStateToAnalyzedState(oState){
			fnInitializeCurrentAnalyzedState();
			for (var sKey in oState){
				var oEntry = deepExtend({}, oState[sKey]);
				oCurrentAnalyzedState.allEntries[sKey] = oEntry;
				var oLifecycle = oEntry.lifecycle || Object.create(null);
				if (oLifecycle.permanent){
					oCurrentAnalyzedState.permanentEntries[sKey] = oEntry;
				} else if (oLifecycle.session){
					oCurrentAnalyzedState.sessionEntries[sKey] = oEntry;
				}
				if (oLifecycle.page || oLifecycle.pagination){
					oCurrentAnalyzedState.pageEntries[sKey] = oEntry;
				}
			}
			return oCurrentAnalyzedState;
		}

		// Move an entry in a chained list to the front
		// oLastKeys: An object containing the pointer to the current fron object in its next-attribute
		// oPredecessor: An object containing the pointer to the object to be moved in its next-attribute
		function fnMoveKeyInfoToFront(oLastKeys, oPredecessor){
			if (oPredecessor === oLastKeys){
				return;
			}
			var oNext = oPredecessor.next.next; // oNext is a pointer to the tail currently behind the object to be moved
			oPredecessor.next.next = oLastKeys.next; // oPredecessor.next should be moved to the front. So its next must now point to the object currently being the first.
			oLastKeys.next = oPredecessor.next; // oPredecessor.next is now put into front
			oPredecessor.next = oNext; // let oPredecessor now point to the tail in order to close the gap
		}

		function getKeyForState(oLastKeys, oState, bPermanent){
			if (isEmptyObject(oState)){
				return { appStateKey: "" };
			}
			var sSerialize = JSON.stringify(oState);
			var iCount = 0;
			var oLast;
			for (oLast = oLastKeys; oLast.next && iCount < 10; iCount++){
				if (oLast.next.serialize === sSerialize){
					fnMoveKeyInfoToFront(oLastKeys, oLast);
					return {
						appStateKey: oLastKeys.next.appStateKey
					};
				}
				oLast = oLast.next;
			}
			oLast.next = null; // if no match was found the new match will be added in front below. This statement removes all entries from the chain which were not visited due to iCount, thus effectively limiting the length of this storage.
			// Todo: react on bPermanent, when FLP interface supports this.
			var oAppState = oCrossAppNavService.createEmptyAppState(oSettings.oComponent.getAppComponent(), !bPermanent);
			var oNewLast = {
				next: oLastKeys.next,
				serialize: sSerialize,
				appStateKey: oAppState.getKey()
			};
			oAppState.setData(oState);
			oAppState.save();
			oLastKeys.next = oNewLast;
			return {
				appStateKey: oNewLast.appStateKey
			};
		}

		function fnTransferAnalyzedStateToUrl(){
			var oSessionAppStateKey = getKeyForState(oLastSessionKeys, oCurrentAnalyzedState.sessionEntries, false);
			var oStorage = Object.create(null);
			if (oSessionAppStateKey.appStateKey){
				oStorage.sessionAppStateKey = oSessionAppStateKey.appStateKey;
			}
			if (!isEmptyObject(oCurrentAnalyzedState.permanentEntries)){
				oStorage.permanentEntries = oCurrentAnalyzedState.permanentEntries;
			}
			oStoringInformation = getKeyForState(oLastPermanentKeys, oStorage, true);

			if (sAppStateKeyInUrl === oStoringInformation.appStateKey){
				oStoringInformation = null;
			} else if (oRegistryEntry.utils.isComponentActive()){ // if the appstateKey really represents a new state and view is active set it to hash
				oTemplateContract.oNavigationControllerProxy.navigateByExchangingQueryParam(oSettings.appStateName, oStoringInformation.appStateKey);
			} else {
				sRealizedAppStateKey = oStoringInformation.appStateKey; // if the appstateKey really represents a new state and the view is no longer active -> at least ensure that we keep the information about last realized state
				oStoringInformation = null;
			}

			if (fnAppStateCleanResolve){
				fnAppStateCleanResolve(oTemplateContract.oBusyHelper.getUnbusy()); // Promise is resolved only, when also the busy session has ended
				fnAppStateCleanResolve = null;
			}
		}

		// This method is called when the app state has potentially changed, such that all information (in particular the url) must be updated.
		// fnAppStateCleanResolve tells us, whether there is really an open change
		function fnStoreCurrentAppStateAndAdjustURL() {
			if (!fnAppStateCleanResolve || sRealizedAppStateKey !== sAppStateKeyInUrl){ // if nothing to do or last update has not yet finished return
				return;
			}
			var oState = oSettings.getCurrentState() || Object.create(null);
			fnTransferStateToAnalyzedState(oState);
			fnTransferAnalyzedStateToUrl();
		}

		function getLastPath(){
			var aKeys = oRegistryEntry.aKeys;
			var sRet = "";
			var sRoute = oRegistryEntry.route;
			for (var i = aKeys.length - 1; i > 0; i--){
				var oTreeNode = oTemplateContract.mRoutingTree[sRoute];
				var sOdataReference = i === 1 ? oTreeNode.entitySet : oTreeNode.navigationProperty;
				sRet = "/" + sOdataReference + (aKeys[i] ? "(" + aKeys[i] + ")" : "") + sRet;
				sRoute = oTreeNode.parentRoute;
			}
			return sRet;
		}

		function getUrlParameterInfo(sPath, bAlreadyVisible){
			return oAppStateIsSetPromise.then(function(){
				var oRet = Object.create(null);
				var sKey = (!sPath || getLastPath() === sPath) && sLastAppKey;
				if (sKey){
					oRet[oSettings.appStateName] = sKey;
				}
				return oRet;
			});
		}

		function stateChanged(){
			// if there is no open change yet, i.e. no oAppStateCleanPromise, create it
			if (!fnAppStateCleanResolve){
				oAppStateCleanPromise = new Promise(function(resolve){
					fnAppStateCleanResolve = resolve;
					setTimeout(fnStoreCurrentAppStateAndAdjustURL, 0);
				});
			}
			return oAppStateCleanPromise;
		}

		function fnAdaptRealizedAppStateKey(){
			sRealizedAppStateKey = sAppStateKeyInUrl;
			oStoringInformation = null;
			sLastAppKey = sAppStateKeyInUrl;
		}

		function fnTransferEntries(oTarget, mEntries, bUnconditional){
			if (!mEntries){
				return;
			}
			for (var sKey in mEntries){
				var oEntry = mEntries[sKey];
				if (bUnconditional || oEntry.lifecycle.page){
					oTarget[sKey] = oEntry;
				}
			}
		}

		function fnRealizeState(bIsSameAsLast, oNewState){
			fnTransferStateToAnalyzedState(oNewState);
			var oState = Object.create(null);
			for (var sKey in oNewState){
				oState[sKey] = oNewState[sKey].data;
			}
			oSettings.applyState(oState, bIsSameAsLast);
			if (fnNotifyRealizedAppStateConsistent){
				fnNotifyRealizedAppStateConsistent();
				fnNotifyRealizedAppStateConsistent = null;
			}
			fnAdaptRealizedAppStateKey();
			fnTransferAnalyzedStateToUrl();
			fnStoreCurrentAppStateAndAdjustURL();
		}

		function fnAddKeyToLastKeys(oLastKeys, oState, sAppStateKey){
			// first check whether the key is already in
			for (var oLast = oLastKeys; oLast.next; oLast = oLast.next){
				if (oLast.next.appStateKey === sAppStateKey){
					fnMoveKeyInfoToFront(oLastKeys, oLast);
					return;
				}
			}
			var oNewLast = {
				next: oLastKeys.next,
				serialize: JSON.stringify(oState),
				appStateKey: sAppStateKey
			};
			oLastKeys.next = oNewLast;
		}

		// This function is called when the CrossAppNavService has retrieved the objects belonging to both appStateKeys (the one from the url and the session specific one which was stored inside).
		// The corresponding states are oPermanentState and oRetrievedState. These states may both be faulty (e.g. in case the retrieval failed).
		// oNewState is the target state which has already been initialized from the current state due to the analyzed transformation
		function fnAdaptToFullAppState(fnResolve, fnReject, sAppStateKey, bIsSameAsLast, oNewState, oPermanentState, sSessionAppStateKey, oRetrievedState){
			if (sAppStateKeyInUrl === null){ // startup case
				sAppStateKeyInUrl = sAppStateKey;
			} else if (sAppStateKey !== sAppStateKeyInUrl){ // sAppStateKey is already outdated
				fnReject();
				return;
			}
			if (oRetrievedState){
				var oSessionState = oRetrievedState.getData();
				fnAddKeyToLastKeys(oLastSessionKeys, oSessionState, sSessionAppStateKey);
				fnTransferEntries(oNewState, oSessionState, true);
			}
			fnTransferEntries(oNewState, oPermanentState, true);
			fnRealizeState(bIsSameAsLast, oNewState);
			fnResolve();
		}

		// This function is called when the CrossAppNavService has retrieved the object which belongs to the specified appStateKey from the url.
		// oRetrievedState is the corresponding object. Note that this will be null in case the CrossAppNavService failed to provide an object. In this case we will nevertheless proceed.
		// oNewState is the target state which has already been initialized from the current state due to the analyzed transformation
		function fnAdaptToUrlAppState(fnResolve, fnReject, sAppStateKey, bIsSameAsLast, oNewState, oRetrievedState){
			var oPermanentState = oRetrievedState && oRetrievedState.getData() || Object.create(null);
			fnAddKeyToLastKeys(oLastPermanentKeys, oPermanentState, sAppStateKey);

			if (!oPermanentState.permanentEntries){
				// assume legacy state created by LR or ALP before 1.83 => adapt to current format
				oPermanentState = {
					permanentEntries: {
						permanentState: {
							data: oPermanentState, 
							lifecycle: {
								permanent: true
							}
						}
					}
				};
			}
			
			if (oPermanentState.sessionAppStateKey){
				var oAppStatePromise = oCrossAppNavService.getAppState(oSettings.oComponent.getAppComponent(), oPermanentState.sessionAppStateKey);
				oAppStatePromise.done(fnAdaptToFullAppState.bind(null, fnResolve, fnReject, sAppStateKey, bIsSameAsLast, oNewState, oPermanentState.permanentEntries, oPermanentState.sessionAppStateKey));
				oAppStatePromise.fail(fnAdaptToFullAppState.bind(null, fnReject, fnReject, sAppStateKey, bIsSameAsLast, oNewState, oPermanentState.permanentEntries, "", null));
			} else {
				fnAdaptToFullAppState(fnResolve, fnReject, sAppStateKey, bIsSameAsLast, oNewState, oPermanentState.permanentEntries, "", null);
			}
		}

		function getSameAsLastPromise(sBindingPath){
			var oRegistryEntry = oTemplateContract.componentRegistry[oSettings.oComponent.getId()];
			var oHeaderDataPromise = oRegistryEntry.utils.getHeaderDataAvailablePromise() || Promise.resolve();
			return oHeaderDataPromise.then(function(){
				return oTemplateContract.oApplicationProxy.areTwoKnownPathesIdentical(sLastBindingPath, sBindingPath, oRegistryEntry.viewLevel === 1);
			});
		}

		function fnExecuteWithSameAsLast(sBindingPath, fnExecute){
			if (sBindingPath === sLastBindingPath){
				fnExecute(true);
				return;
			}
			if (!sBindingPath || !sLastBindingPath){
				// On initial load, sLastBindingPath is undefined - in this case, execute with bIsSameAsLast = false to allow the component to set uo its inital state
				fnExecute(false);
				return;
			}
			getSameAsLastPromise(sBindingPath).then(fnExecute);
		}

		function fnApplyAppState(sBindingPath, bIsComponentCurrentlyActive){
			var oRet = new Promise(function(fnResolve, fnReject){
				fnExecuteWithSameAsLast(sBindingPath, function(bIsSameAsLast){
					// Don't call component to apply state if it has not changed anyway.
					// However, if the object has changed (!bIsSameAsLast), component needs to (re)initialize its state.
					// On initial load, the state should be applied, to allow each component to set up its initial state.
					// In this situation, sAppStateKeyInUrl and sRealizedAppStateKey both are the empty string, so the second condition is true,
					// but the first condition (bIsSameAsLast) is false - see fnExecuteWithSameAsLast
					if (!oSettings.callAlways && bIsSameAsLast && sAppStateKeyInUrl === sRealizedAppStateKey){
						fnResolve();
						return;
					}
					sLastBindingPath = sBindingPath;
					var oNewState = Object.create(null);
					fnTransferEntries(oNewState, oCurrentAnalyzedState[bIsSameAsLast ? "allEntries" : "pageEntries"], bIsSameAsLast || bIsComponentCurrentlyActive);
					if (!sAppStateKeyInUrl){ // no need to retrieve the state from the CrossAppNavService once more
						if (bIsSameAsLast){
							fnTransferEntries(oNewState, oCurrentAnalyzedState.sessionEntries, true);
							fnTransferEntries(oNewState, oCurrentAnalyzedState.permanentEntries, true);
						}
						fnRealizeState(bIsSameAsLast, oNewState);
						fnResolve();
						return;
					}
					if (!fnNotifyRealizedAppStateConsistent){
						oAppStateIsSetPromise = new Promise(function(resolve){
							fnNotifyRealizedAppStateConsistent = resolve;
						});
					}
					var oAppStatePromise = oCrossAppNavService.getAppState(oSettings.oComponent.getAppComponent(), sAppStateKeyInUrl);
					oAppStatePromise.done(fnAdaptToUrlAppState.bind(null, fnResolve, fnReject, sAppStateKeyInUrl, bIsSameAsLast, oNewState));
					oAppStatePromise.fail(fnAdaptToUrlAppState.bind(null, fnReject, fnReject, sAppStateKeyInUrl, bIsSameAsLast, oNewState, null));
				}, fnReject);
			});
			return oRet;
		}

		// This method is called by the NavigationController when a new url is caught. It is the task of this method to provide the information, whether
		// the url change is just an appstate-change which can be handled by this class alone. In this case whole route-matched logic would not be started.
		// Whether this is the case is found out by checking whether oStoringInformation is currently truthy and contains the same AppStateKey as the url.
		// If this is the case we direrctly call fnParseUrlAndApplyAppState. Otherwise, it will be called later via the ComponentActivate.
		// Anyway we use this method to keep sAppStateKeyInUrl up to date.
		function isStateChange(mAppStates){
			sAppStateKeyInUrl = mAppStates[oSettings.appStateName] || "";
			if (Array.isArray(sAppStateKeyInUrl)){
				sAppStateKeyInUrl = sAppStateKeyInUrl.sort()[0] || "";
			}
			if (oStoringInformation){
				if (oStoringInformation.appStateKey !== sAppStateKeyInUrl){
					oLogger.error("StatePreserver: Got AppstateKey " + sAppStateKeyInUrl + " expected " + oStoringInformation.appStateKey);
					return false;
				}
				fnAdaptRealizedAppStateKey();
				return true;
			}
			return false;
		}

		function getAsStateChanger(){
			return {
				isStateChange: isStateChange
			};
		}

		return {
			getUrlParameterInfo: getUrlParameterInfo,
			stateChanged: stateChanged,
			applyAppState: fnApplyAppState,
			getAsStateChanger: getAsStateChanger
		};
	}

	return BaseObject.extend("sap.suite.ui.generic.template.lib.StatePreserver", {
		constructor: function(oTemplateContract, oSettings) {
			extend(this, getMethods(oTemplateContract, oSettings));
		}
	});
});
