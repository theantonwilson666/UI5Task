sap.ui.define(
	["sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory", "sap/base/Log", "sap/fe/navigation/NavigationHandler"],
	function(Service, ServiceFactory, Log, NavigationHandler) {
		"use strict";

		var NavigationService = Service.extend("sap.fe.core.services.NavigationService", {
			initPromise: null,
			init: function() {
				var oContext = this.getContext(),
					oComponent = oContext && oContext.scopeObject;

				this.oNavHandler = new NavigationHandler(oComponent);
				this.oNavHandler.setModel(oComponent.getModel());
				this.initPromise = Promise.resolve(this);
			},
			exit: function() {
				this.oNavHandler.destroy();
				delete this.oNavHandler;
			},

			/**
			 * Triggers a cross-app navigation after saving the inner and the cross-app states.
			 * @private
			 * @ui5-restricted
			 * @param {string} sSemanticObject semantic object of the target app
			 * @param {string} sActionName action of the target app
			 * @param {object | string } [vNavigationParameters] Navigation parameters as an object with key/value pairs or as a string representation of
			 *        such an object. If passed as an object, the properties are not checked against the <code>IsPotentialSensitive</code> or
			 *        <code>Measure</code> type.
			 * @param {object} [oInnerAppData] Object for storing current state of the app
			 * @param {Function} [fnOnError] Callback that is called if an error occurs during navigation <br>
			 * @param {object} oExternalAppData Object for storing the state which will be forwarded to the target component.
			 * @param {string} [sNavMode] Argument is used to overwrite the FLP-configured target for opening a URL. If used, only the
			 *        <code>explace</code> or <code>inplace</code> values are allowed. Any other value will lead to an exception
			 *        <code>NavigationHandler.INVALID_NAV_MODE</code>.
			 **/
			navigate: function(sSemanticObject, sActionName, vNavigationParameters, oInnerAppData, fnOnError, oExternalAppData, sNavMode) {
				// TODO: Navigation Handler does not handle navigation without a context
				// but in v4 DataFieldForIBN with requiresContext false can trigger a navigation without any context
				// This should be handled
				this.oNavHandler.navigate(
					sSemanticObject,
					sActionName,
					vNavigationParameters,
					oInnerAppData,
					fnOnError,
					oExternalAppData,
					sNavMode
				);
			},
			/**
			 * Parses the incoming URL and returns a Promise.
			 * @returns {object} A Promise object which returns the
			 * extracted app state, the startup parameters, and the type of navigation when execution is successful,
			 * @private
			 * @ui5-restricted
			 **/
			parseNavigation: function() {
				return this.oNavHandler.parseNavigation();
			},
			/**
			 * Processes navigation-related tasks related to beforePopoverOpens event handling for the SmartLink control and returns a Promise object.
			 *
			 * @param {object} oTableEventParameters The parameters made available by the SmartTable control when the SmartLink control has been clicked,
			 *        an instance of a PopOver object
			 * @param {string} sSelectionVariant Stringified JSON object as returned, for example, from getDataSuiteFormat() of the SmartFilterBar control
			 * @param {object} [mInnerAppData] Object containing the current state of the app. If provided, opening the Popover is deferred until the
			 *        inner app data is saved in a consistent way.
			 * @returns {Promise} A Promise object to monitor when all actions of the function have been executed; if the execution is successful, the
			 *          modified oTableEventParameters is returned; if an error occurs, an error object of type
			 *          {@link sap.fe.navigation.NavError} is returned
			 * @private
			 */
			_processBeforeSmartLinkPopoverOpens: function(oTableEventParameters, sSelectionVariant, mInnerAppData) {
				return this.oNavHandler.processBeforeSmartLinkPopoverOpens(oTableEventParameters, sSelectionVariant, mInnerAppData);
			},

			/**
			 * Processes selectionVariant string and returns a Promise object (semanticAttributes and AppStateKey).
			 * @param {string} sSelectionVariant Stringified JSON object
			 * @returns {object} A Promise object to monitor when all actions of the function have been executed; if the execution is successful, the
			 *          semanticAttributes as well as the appStateKey are returned; if an error occurs, an error object of type
			 *          {@link sap.fe.navigation.NavError} is returned
			 * <br>
			 * @example <code>
			 *
			 * 		var oSelectionVariant = new sap.fe.navigation.SelectionVariant();
			 * 		oSelectionVariant.addSelectOption("CompanyCode", "I", "EQ", "0001");
			 * 		oSelectionVariant.addSelectOption("Customer", "I", "EQ", "C0001");
			 * 		var sSelectionVariant= oSelectionVariant.toJSONString();
			 *
			 * 		var oNavigationHandler = new sap.fe.navigation.NavigationHandler(oController);
			 * 		var oPromiseObject = oNavigationHandler._getAppStateKeyAndUrlParameters(sSelectionVariant);
			 *
			 * 		oPromiseObject.done(function(oSemanticAttributes, sAppStateKey){
			 * 			// here you can add coding that should run after all app state and the semantic attributes have been returned.
			 * 		});
			 *
			 * 		oPromiseObject.fail(function(oError){
			 * 			//some error handling
			 * 		});
			 *
			 * </code>
			 * @private
			 * @ui5-restricted
			 */
			getAppStateKeyAndUrlParameters: function(sSelectionVariant) {
				return this.oNavHandler._getAppStateKeyAndUrlParameters(sSelectionVariant);
			},

			/**
			 * Gets the application specific technical parameters.
			 * @returns {Array} Containing the technical parameters.
			 * @private
			 * @ui5-restricted
			 */
			getTechnicalParameters: function() {
				return this.oNavHandler.getTechnicalParameters();
			},
			/**
			 * Sets the application specific technical parameters. Technical parameters will not be added to the selection variant passed to the
			 * application.
			 * As a default sap-system, sap-ushell-defaultedParameterNames and hcpApplicationId are considered as technical parameters.
			 * @param {Array} aTechnicalParameters list of parameter names to be considered as technical parameters. <code>null</code> or
			 *        <code>undefined</code> may be used to reset the complete list.
			 * @private
			 * @ui5-restricted
			 */
			setTechnicalParameters: function(aTechnicalParameters) {
				this.oNavHandler.setTechnicalParameters(aTechnicalParameters);
			},
			/**
			 * Sets the model that is used for verification of sensitive information. If the model is not set, the unnamed component model is used for the
			 * verification of sensitive information.
			 * @private
			 * @ui5-restricted
			 * @param {sap.ui.model.odata.v2.ODataModel} oModel for checking sensitive information
			 */
			setModel: function(oModel) {
				this.oNavHandler.setModel(oModel);
			},
			/**
			 * Changes the URL according to the current app state and stores the app state for later retrieval.
			 * @private
			 * @ui5-restricted
			 * @param {object} mInnerAppData Object containing the current state of the app
			 * @param {boolean} [bImmediateHashReplace=false] If set to false, the inner app hash will not be replaced until storing is successful; do not
			 * @returns {object} A Promise object to monitor when all the actions of the function have been executed; if the execution is successful, the
			 *          app state key is returned; if an error occurs, an object of type {@link sap.fe.navigation.NavError} is
			 *          returned
			 **/
			storeInnerAppState: function(mInnerAppData, bImmediateHashReplace) {
				return this.oNavHandler.storeInnerAppState(mInnerAppData);
			},
			/**
				* Changes the URL according to the current app state and stores the app state for later retrieval.
				* @private
				* @ui5-restricted
				* @param {object} mInnerAppData Object containing the current state of the app
				* @param {boolean} [bImmediateHashReplace=false] If set to false, the inner app hash will not be replaced until storing is successful; do not
			 * @param bNotLegacy

			 * @returns {object} An object containing the appStateId and a promise object to monitor when all the actions of the function have been
				* executed; Please note that the appStateKey may be undefined or empty.
				*/
			storeInnerAppStateWithImmediateReturn: function(mInnerAppData, bImmediateHashReplace, bNotLegacy) {
				return this.oNavHandler.storeInnerAppStateWithImmediateReturn(mInnerAppData, bImmediateHashReplace, bNotLegacy);
			},
			/**
			 * Changes the URL according to the current sAppStateKey. As an reaction route change event will be triggered.
			 * @private
			 * @ui5-restricted
			 * @param {string} sAppStateKey the new app state key.
			 */
			replaceHash: function(sAppStateKey) {
				this.oNavHandler.replaceHash(sAppStateKey);
			},
			replaceInnerAppStateKey: function(sAppHash, sAppStateKey) {
				return this.oNavHandler._replaceInnerAppStateKey(sAppHash, sAppStateKey);
			},
			/**
			 * Get single values from SelectionVariant for url parameters.
			 *
			 * @private
			 * @ui5-restricted
			 * @param {object | string } [vSelectionVariant]
			 * @param {object} [vSelectionVariant.oUrlParamaters]
			 * @returns {pbject}
			 */
			getUrlParametersFromSelectionVariant: function(vSelectionVariant) {
				return this.oNavHandler._getURLParametersFromSelectionVariant(vSelectionVariant);
			},

			/**
			 * Save app state and return immediately without waiting for response.
			 *
			 * @private
			 * @ui5-restricted
			 * @param {object} oSelectionVariant - Instance of sap.fe.navigation.SelectionVariant
			 * @returns {string} AppState key
			 */
			saveAppStateWithImmediateReturn: function(oSelectionVariant) {
				if (oSelectionVariant) {
					var sSelectionVariant = oSelectionVariant.toJSONString(), // create an SV for app state in string format
						oSelectionVariant = JSON.parse(sSelectionVariant), // convert string into JSON to store in AppState
						oXAppStateObject = {
							selectionVariant: oSelectionVariant
						},
						oReturn = this.oNavHandler._saveAppStateWithImmediateReturn(oXAppStateObject);
					return oReturn.appStateKey ? oReturn.appStateKey : "";
				}
			},

			/**
			 * Mix Attributes and selectionVariant.
			 *
			 * @param {object|Array} vSemanticAttributes Object/(Array of Objects) containing key/value pairs
			 * @param {string} sSelectionVariant The selection variant in string format as provided by the SmartFilterBar control
			 * @param {int} [iSuppressionBehavior=sap.fe.navigation.SuppressionBehavior.standard] Indicates whether semantic
			 *        attributes with special values (see {@link sap.fe.navigation.SuppressionBehavior suppression behavior}) must be
			 *        suppressed before they are combined with the selection variant; several
			 *        {@link sap.fe.navigation.SuppressionBehavior suppression behaviors} can be combined with the bitwise OR operator
			 *        (|)
			 * @returns {object} Instance of {@link sap.fe.navigation.SelectionVariant}
			 */
			mixAttributesAndSelectionVariant: function(vSemanticAttributes, sSelectionVariant, iSuppressionBehavior) {
				return this.oNavHandler.mixAttributesAndSelectionVariant(vSemanticAttributes, sSelectionVariant, iSuppressionBehavior);
			},

			/**
			 * The method creates a context url based on provided data. This context url can either be used as.
			 *
			 * @param {string} sEntitySetName used for url determination
			 * @param [oModel] used for url determination. If omitted, the NavigationHandler model is used.
			 * @returns {string} context url for the given entities
			 */
			constructContextUrl: function(sEntitySetName, oModel) {
				return this.oNavHandler.constructContextUrl(sEntitySetName, oModel);
			}
		});

		function NavigationServicesMock() {
			this.initPromise = Promise.resolve(this);
			this.getInterface = function() {
				return this;
			};

			function fnGetEmptyObject() {
				return {};
			}

			function fnGetPromise() {
				return Promise.resolve({});
			}

			function fnGetJQueryPromise() {
				var oMyDeffered = jQuery.Deferred();
				oMyDeffered.resolve({}, {}, "initial");
				return oMyDeffered.promise();
			}

			function fnGetEmptyString() {
				return "";
			}

			// return empty object
			this.createEmptyAppState = fnGetEmptyObject;
			this.storeInnerAppStateWithImmediateReturn = fnGetEmptyObject;
			this.mixAttributesAndSelectionVariant = fnGetEmptyObject;

			// return promise
			this.getAppState = fnGetPromise;
			this.getStartupAppState = fnGetPromise;
			this.parseNavigation = fnGetJQueryPromise;

			// return empty string
			this.constructContextUrl = fnGetEmptyString;

			this.replaceInnerAppStateKey = function(sAppHash) {
				return sAppHash ? sAppHash : "";
			};

			this.navigate = function() {};
		}

		return ServiceFactory.extend("sap.fe.core.services.NavigationServiceFactory", {
			createInstance: function(oServiceContext) {
				var oNavigationService =
					sap.ushell && sap.ushell.Container ? new NavigationService(oServiceContext) : new NavigationServicesMock();
				// Wait For init
				return oNavigationService.initPromise.then(function(oService) {
					return oService;
				});
			}
		});
	},
	true
);
