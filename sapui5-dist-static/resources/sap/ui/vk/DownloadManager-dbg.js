/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

/* global File, sinon */

// Provides the DownloadManager class.
sap.ui.define([
	"sap/ui/base/EventProvider",
	"./Messages",
	"./getResourceBundle",
	"sap/base/Log"
], function(
	EventProvider,
	Messages,
	getResourceBundle,
	Log
) {
	"use strict";

	/**
	 * Creates a new DownloadManager object.
	 *
	 * @class
	 * Provides the functionality to download multiple files from remote locations (URLs) and from local files.
	 *
	 * @param {any[]} sources An array of strings (URLs) and File objects to download.
	 * @param {int} maxParallelTasks The maximum number of downloading tasks to execute in parallel.
	 * @param {sap.ui.vk.AuthorizationHandler} authorizationHandler Optional parameter to provide authorization callback function when source URL requires secure connection
	 * @private
	 * @author SAP SE
	 * @version 1.88.0
	 * @extends sap.ui.base.EventProvider
	 * @alias sap.ui.vk.DownloadManager
	 * @since 1.32.0
	 */
	var DownloadManager = EventProvider.extend("sap.ui.vk.DownloadManager", /** @lends sap.ui.vk.DownloadManager.prototype */ {
		metadata: {
			events: {
				/**
				 * Item is successfully downloaded.
				 */
				itemSucceeded: {
					parameters: {
						/**
						 * The source of type sap.ui.core.URI or File.
						 */
						source: {
							type: "any"
						},
						/**
						 * The content of source of type ArrayBuffer.
						 */
						response: {
							type: "object"
						}
					}
				},
				/**
				 * Event that is fired when the downloaded progress.
				 */
				itemProgress: {
					parameters: {
						/**
						 * The source of type sap.ui.core.URI or File.
						 */
						source: {
							type: "any"
						},
						/**
						 * The size of data which has been downloaded so far for a particular file.
						 */
						loaded: {
							type: "int"
						},
						/**
						 * The total size of the file being currently downloaded.
						 */
						total: {
							type: "int"
						}
					}
				},

				/**
				 * Item is not downloaded due to an error.
				 */
				itemFailed: {
					parameters: {
						/**
						 * The source of type sap.ui.core.URI or File.
						 */
						source: {
							type: "any"
						},
						/**
						 * The status of the downloading process. Type might be int or string.
						 */
						status: {
							type: "any"
						},
						/**
						 * The status text.
						 */
						statusText: {
							type: "string"
						}
					}
				},

				/**
				 * Downloading all items is completed, successfully or not.
				 */
				allItemsCompleted: {}
			}
		},
		constructor: function(sources, maxParallelTasks, authorizationHandler) {
			EventProvider.apply(this);

			this._maxParallelTasks = maxParallelTasks || 5;
			this._sourcesToProcess = sources.slice();
			this._sourcesBeingProcessed = [];
			this._authorizationHandler = authorizationHandler;
		}
	});

	/**
	 * Starts the downloading process.
	 * @returns {sap.ui.vk.DownloadManager} <code>this</code> to allow method chaining.
	 * @public
	 */
	DownloadManager.prototype.start = function() {
		// Schedule simultaneous downloading of up to this._maxParallelTasks.
		/* eslint-disable no-empty */
		while (this._pickAndDispatchTask()) {
			// A comment to avoid ESLint warnings.
		}
		/* eslint-enable no-empty */

		return this;
	};

	/**
	 * Adds a new source to the download queue.
	 *
	 * @param {any} source A new source to download.
	 * @returns {sap.ui.vk.DownloadManager} <code>this</code> to allow method chaining.
	 */
	DownloadManager.prototype.queue = function(source) {
		this._sourcesToProcess.push(source);
		this._pickAndDispatchTask();
		return this;
	};

	/**
	 * Picks and dispatches a source for downloading.
	 * @returns {boolean} Returns <code>true</code> if a source is picked and dispatched, returns <code>false</code> otherwise.
	 * @private
	 */
	DownloadManager.prototype._pickAndDispatchTask = function() {
		if (this._sourcesToProcess.length > 0 && this._sourcesBeingProcessed.length < this._maxParallelTasks) {
			var source = this._sourcesToProcess.shift();
			this._sourcesBeingProcessed.push(source);
			var that = this;
			if (this._authorizationHandler) {
				// Call autorization callback to get authorization token
				this._authorizationHandler(source).then(function(token) {
					var authToken = null;
					if (token != null) {
						authToken = token.token_type + " " + token.access_token;
					}
					var tenantUuid = token ? token.tenant_uuid : null;
					that._runTask(source, authToken, tenantUuid);
				}).catch(function(reason) {
					that.fireItemFailed({
						source: source,
						status: 0,
						statusText: reason
					});
					that._taskFinished(source);
					if (that._queueIsEmpty()) {
						that._asyncFireAllItemsCompleted();
					}
				});
			} else {
				// No autorization callback, just go and download file
				this._runTask(source);
			}
			return true;
		}
		return false;
	};

	/**
	 * @param {sap.ui.core.URI|File} source The URL or File that is completed.
	 * @returns {sap.ui.vk.DownloadManager} <code>this</code> to allow method chaining.
	 * @private
	 */
	DownloadManager.prototype._taskFinished = function(source) {
		var index = this._sourcesBeingProcessed.indexOf(source);
		if (index >= 0) {
			this._sourcesBeingProcessed.splice(index, 1);
		}

		return this;
	};

	DownloadManager.prototype._queueIsEmpty = function() {
		return this._sourcesToProcess.length === 0 && this._sourcesBeingProcessed.length === 0;
	};

	DownloadManager.prototype._runTask = function(source, authToken, tenantUuid) {
		var that = this;
		if (typeof source === "string") {
			// When sap.ui.core.util.MockServer is in use it loads the sinon.js library which replaces
			// the native XMLHttpRequest provided by the browser with its own implementation. That
			// implementation does not support 'arraybuffer' response type. For downloading 3D models
			// we should always use the native XMLHttpRequest object.
			var xhr = new (typeof sinon === "object" && sinon.xhr && sinon.xhr.XMLHttpRequest || XMLHttpRequest);

			xhr.onerror = function(event) {
				that._taskFinished(source);
				that._pickAndDispatchTask();

				// onerror event caters for events such as CORS errors
				that.fireItemFailed({
					source: source,
					status: xhr.status,
					statusText: xhr.statusText
				});

				if (that._queueIsEmpty()) {
					that._asyncFireAllItemsCompleted();
				}
			};

			xhr.onload = function(event) {
				that._taskFinished(source);
				that._pickAndDispatchTask();

				// When file is loaded from a Cordova container the status equals 0.
				if (xhr.status === 200 || xhr.status === 0) {
					that.fireItemSucceeded({
						source: source,
						response: xhr.response
					});
				} else {
					// onload event is also called in the case of status code 404 Not Found.
					// This is why we have to check for the right status. If the status is not
					// something that indicates success, we fire the fireItemFailed event.
					that.fireItemFailed({
						source: source,
						status: xhr.status,
						statusText: xhr.statusText
					});
				}
				if (that._queueIsEmpty()) {
					that._asyncFireAllItemsCompleted();
				}
			};

			xhr.onprogress = function(event) {
				that.fireItemProgress({
					source: source,
					loaded: event.loaded,
					total: event.total
				});
			};

			xhr.open("GET", source, true);
			xhr.responseType = "arraybuffer";
			if (authToken) {
				xhr.setRequestHeader("Authorization", authToken);
			}
			if (tenantUuid) {
				xhr.setRequestHeader("X-TenantUuid", tenantUuid);
			}
			xhr.send(null);
		} else if (source instanceof File) {
			var fileReader = new FileReader();

			fileReader.onload = function(event) {
				that._taskFinished(source);
				that._pickAndDispatchTask();

				that.fireItemSucceeded({
					source: source,
					response: fileReader.result
				});

				if (that._queueIsEmpty()) {
					that._asyncFireAllItemsCompleted();
				}
			};

			fileReader.onerror = function(event) {
				that._taskFinished(source);
				that._pickAndDispatchTask();

				that.fireItemFailed({
					source: source,
					status: fileReader.error.name,
					statusText: fileReader.error.message
				});

				if (that._queueIsEmpty()) {
					that._asyncFireAllItemsCompleted();
				}
			};

			fileReader.onprogress = function(event) {
				that.fireItemProgress({
					source: source.name,
					loaded: event.loaded,
					total: event.total
				});
			};

			fileReader.readAsArrayBuffer(source);
		} else {
			Log.error(getResourceBundle().getText(Messages.VIT5.summary), Messages.VIT5.code, "sap.ui.vk.DownloadManager");
		}

		return this;
	};

	/**
	 * The allItemsCompleted event is fired asynchronously as otherwise something is wrong in Emscripten
	 * e.g. std::cout is unusable, some global variables are uninitialised.
	 * @private
	 */
	DownloadManager.prototype._asyncFireAllItemsCompleted = function() {
		setTimeout(function() {
			this.fireAllItemsCompleted();
		}.bind(this), 0);
	};

	DownloadManager.prototype.attachItemSucceeded = function(data, func, listener) {
		return this.attachEvent("itemSucceeded", data, func, listener);
	};

	DownloadManager.prototype.detachItemSucceeded = function(func, listener) {
		return this.detachEvent("itemSucceeded", func, listener);
	};

	DownloadManager.prototype.fireItemSucceeded = function(parameters, allowPreventDefault, enableEventBubbling) {
		return this.fireEvent("itemSucceeded", parameters, allowPreventDefault, enableEventBubbling);
	};

	DownloadManager.prototype.attachItemFailed = function(data, func, listener) {
		return this.attachEvent("itemFailed", data, func, listener);
	};

	DownloadManager.prototype.detachItemFailed = function(func, listener) {
		return this.detachEvent("itemFailed", func, listener);
	};

	DownloadManager.prototype.fireItemFailed = function(parameters, allowPreventDefault, enableEventBubbling) {
		return this.fireEvent("itemFailed", parameters, allowPreventDefault, enableEventBubbling);
	};

	DownloadManager.prototype.attachAllItemsCompleted = function(data, func, listener) {
		return this.attachEvent("allItemsCompleted", data, func, listener);
	};

	DownloadManager.prototype.detachAllItemsCompleted = function(func, listener) {
		return this.detachEvent("allItemsCompleted", func, listener);
	};

	DownloadManager.prototype.fireAllItemsCompleted = function(parameters, allowPreventDefault, enableEventBubbling) {
		return this.fireEvent("allItemsCompleted", parameters, allowPreventDefault, enableEventBubbling);
	};

	DownloadManager.prototype.attachItemProgress = function(data, func, listener) {
		return this.attachEvent("itemProgress", data, func, listener);
	};

	DownloadManager.prototype.detachItemProgress = function(func, listener) {
		return this.detachEvent("itemProgress", func, listener);
	};

	DownloadManager.prototype.fireItemProgress = function(parameters, allowPreventDefault, enableEventBubbling) {
		return this.fireEvent("itemProgress", parameters, allowPreventDefault, enableEventBubbling);
	};

	return DownloadManager;
});
