sap.ui.define(
	["sap/ui/test/Opa5", "sap/ui/test/OpaBuilder", "sap/ui/thirdparty/jquery", "sap/base/util/UriParameters", "./Utils", "./Stubs"],
	function(Opa5, OpaBuilder, jQuery, UriParameters, Utils, Stubs) {
		"use strict";

		/**
		 * Constructs a new {@link sap.fe.test.Opa5} instance.
		 *
		 * @param {object} mSettings The settings object required for launching the application
		 * @param {string} mSettings.launchUrl The URL to the launching page (usually a FLP.html)
		 * @param {object} mSettings.launchParameters The URL launch parameters
		 *
		 * @class All common arrangements (<code>Given</code>) for all Opa tests are defined here.
		 *
		 * @alias sap.fe.test.BaseArrangements
		 * @extends sap.ui.test.Opa5
		 * @public
		 */
		var BaseArrangements = Opa5.extend("sap.fe.test.BaseArrangements", {
			constructor: function(mSettings) {
				Opa5.apply(this);
				var oUriParams = new UriParameters(window.location.href),
					mDefaultLaunchParameters = {
						"sap-ui-log-level": "ERROR",
						"sap-ui-xx-viewCache": true
					};
				if (oUriParams.get("useBackendUrl")) {
					mDefaultLaunchParameters.useBackendUrl = oUriParams.get("useBackendUrl");
				}
				this._mSettings = Utils.mergeObjects(
					{
						launchParameters: mDefaultLaunchParameters
					},
					mSettings
				);
			},

			/**
			 * Starts the app in an IFrame, using the <code>launchUrl</code> and <code>launchParameters</code> provided via the settings object of the {@link sap.fe.test.BaseArrangements#constructor}.
			 *
			 * @param {string} [sAppHash] The app hash
			 * @param {object} [mUrlParameters] A map with additional URL parameters
			 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
			 *
			 * @function
			 * @name sap.fe.test.BaseArrangements#iStartMyApp
			 * @public
			 */
			iStartMyApp: function(sAppHash, mUrlParameters) {
				var sLaunchUrl = this._mSettings.launchUrl,
					mUrlParameters = Utils.mergeObjects(this._mSettings.launchParameters, mUrlParameters),
					sUrlParameters = Object.keys(mUrlParameters).reduce(function(sCurrent, sKey) {
						return sCurrent + "&" + sKey + "=" + mUrlParameters[sKey];
					}, ""),
					sStartupUrl = sLaunchUrl + (sUrlParameters ? "?" + sUrlParameters.substring(1) : "") + (sAppHash ? "#" + sAppHash : "");

				this.iStartMyAppInAFrame(sStartupUrl);

				// We need to reset the native navigation functions in the IFrame
				// as the navigation mechanism in SAP Fiori elements uses them
				// (they are overridden in OPA by the iFrameLauncher)
				// We also need to override the native confirm dialog, as it blocks the test
				return OpaBuilder.create(this)
					.success(function() {
						var oWindow = Opa5.getWindow();

						Stubs.stubAll(oWindow);
					})
					.description(Utils.formatMessage("Started URL '{0}' in iFrame", sStartupUrl))
					.execute();
			},

			/**
			 * Clears the browser's local storage and session storage.
			 *
			 * NOTE: The function itself is not meant to be called directly within a journey.
			 * Instead, it can be overwritten to add custom clean-up functionality when calling {@link sap.fe.test.BaseArrangements#iResetTestData}.
			 *
			 * @returns {object} A <code>Promise</code> object
			 *
			 * @function
			 * @name sap.fe.test.BaseArrangements#resetTestData
			 * @protected
			 */
			resetTestData: function() {
				function _deleteDatabase(sName) {
					return new Promise(function(resolve, reject) {
						var oRequest = indexedDB.deleteDatabase(sName);
						oRequest.onsuccess = resolve;
						oRequest.onerror = reject;
					});
				}

				localStorage.clear();
				sessionStorage.clear();

				if (indexedDB) {
					if (typeof indexedDB.databases === "function") {
						// browser supports enumerating existing databases - wipe all.
						return indexedDB.databases().then(function(aDatabases) {
							return Promise.all(
								aDatabases.map(function(oDatabase) {
									return _deleteDatabase(oDatabase.name);
								})
							);
						});
					} else {
						// browser does not support enumerating databases (e.g. Firefox) - at least delete the UI5 cache.
						return _deleteDatabase("ui5-cachemanager-db");
					}
				} else {
					// no indexedDB
					return Promise.resolve();
				}
			},

			/**
			 * Resets the test data.
			 *
			 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
			 *
			 * @function
			 * @name sap.fe.test.BaseArrangements#iResetTestData
			 * @public
			 */
			iResetTestData: function() {
				var that = this,
					bSuccess = false;

				return OpaBuilder.create(this)
					.success(function() {
						//clear local storage so no flex change / variant management zombies exist
						that.resetTestData()
							.finally(function() {
								bSuccess = true;
							})
							.catch(function(oError) {
								throw oError;
							});

						return OpaBuilder.create(this)
							.check(function() {
								return bSuccess;
							})
							.execute();
					})
					.description(Utils.formatMessage("Resetting test data"))
					.execute();
			},

			/**
			 * Tears down the current application.
			 *
			 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
			 *
			 * @function
			 * @name sap.fe.test.BaseArrangements#iTearDownMyApp
			 * @public
			 */
			iTearDownMyApp: function() {
				return OpaBuilder.create(this)
					.do(function() {
						var oWindow = Opa5.getWindow();
						Stubs.restoreAll(oWindow);
					})
					.do(this.iTeardownMyAppFrame.bind(this))
					.description("Tearing down my app")
					.execute();
			},

			/**
			 * Simulates a refresh of the page by tearing it down and then restarting it with the very same hash.
			 *
			 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
			 *
			 * @function
			 * @name sap.fe.test.BaseArrangements#iRestartMyApp
			 * @public
			 */
			iRestartMyApp: function() {
				var that = this;
				return OpaBuilder.create(this)
					.success(function() {
						var sCurrentHash = Opa5.getWindow().location.hash.substring(1);
						return that.iTearDownMyApp().and.iStartMyApp(sCurrentHash);
					})
					.description("Restarting the app")
					.execute();
			}
		});

		return BaseArrangements;
	}
);
