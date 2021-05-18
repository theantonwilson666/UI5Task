sap.ui.define([
	"sap/base/Log",
	"./SceneContext",
	"./CallbackHandler",
	"./Command",
	"./TotaraUtils",
	"../helpers/WorkerScriptLoader"
], function(
	Log,
	SceneContext,
	CallbackHandler,
	Command,
	TotaraUtils,
	WorkerScriptLoader
) {
	"use strict";

	var mark = TotaraUtils.mark;  // performance mark

	var TotaraLoader = function() {
		this._pushMesh = false;
		this._performanceTimingMsg = [];
		this._isPostable = true;
		this._suppressSendRequests = false;
		this._loadingFinishedSent = false;

		this.currentSceneInfo = {}; // TODO: should be removed!

		this.contextMap = new Map();      // sceneId -> SceneContext. One 3D model can consist of multiple 3D scenes loaded from the (same?) storage service.
		this.tokenContextMap = new Map(); // token -> SceneContext

		this._skipLowLODRendering = false;
		this._maxUrlLength = 2 * 1024;
		this._maxActiveRequests = 4;
		this._meshesBatchSize = 128;
		this._materialsBatchSize = 128;
		this._geometriesBatchSize = 128;
		this._geometriesMaxBatchDataSize = 1024 * 1024;
		this._geomMeshesBatchSize = 128;
		this._geomMeshesMaxBatchDataSize = 1024 * 1024;
		this._annotationsBatchSize = 128;
		this._tracksBatchSize = 128;
		this._sequencesBatchSize = 128;
		this._voxelThreshold = 0.0;

		// event related
		this.onErrorCallbacks = new CallbackHandler();
		this.onImageFinishedCallbacks = new CallbackHandler();
		this.onMaterialFinishedCallbacks = new CallbackHandler();
		this.onSetGeometryCallbacks = new CallbackHandler();
		this.onSetSequenceCallbacks = new CallbackHandler();
		this.onSetTrackCallbacks = new CallbackHandler();
		this.onViewGroupUpdatedCallbacks = new CallbackHandler();
		this.onLoadingFinishedCallbacks = new CallbackHandler();
	};

	TotaraLoader.prototype.running = function() {
		return this._worker !== null && this._worker !== undefined;
	};

	TotaraLoader.prototype.run = function() {
		var that = this;
		return new Promise(function(resolve) {
			if (!that._worker) {
				that._worker = WorkerScriptLoader.loadScript("sap/ui/vk/totara/TotaraLoaderWorker.js");

				that._worker.onmessage = function(event) {
					var context;
					var data = event.data;
					if (data.ready) {
						// Just an initial signal that worker is ready for processing
						return;
					}

					data.jsonContent = data.jsonContent || {};

					if (data.jsonString) {
						var jsonContent = JSON.parse(data.jsonString);
						delete data.jsonString;
						data.jsonContent = Object.assign(jsonContent, data.jsonContent);
					}

					if (data.name === "getAuthorization") {
						// If the application provided authorization handler then we will call it

						if (data.sceneId) {
							context = that.getContext(data.sceneId);
						}

						if (context && context.authorizationHandler) {
							context.authorizationHandler(data.jsonContent.url).then(function(token) {
								that.postMessage({
									"method": "setAuthorization",
									"authorizationToken": token
								});
							})
							.catch(function(err) {
								that.postMessage({
									"method": "setAuthorization",
									"authorizationToken": null,
									"error": err.toString()
								});
							});
						} else {
							that.postMessage({
								"method": "setAuthorization",
								"authorizationToken": null
							});
						}
						return;
					}

					if (data.name === "protocol") {
						that.protocolVersion = data.jsonContent.version.split(".").map(function(s) { return parseInt(s, 10); });
						return;
					}

					if (data.name === "batchSizeInfo") {
						var batchSizeInfo = data.jsonContent.batchSizeInfo;
						var requestQueue = that.getContext(data.jsonContent.sceneId).requestQueue;
						requestQueue.meshes.setBatchSizeInfo(batchSizeInfo[Command.getMesh]);
						requestQueue.materials.setBatchSizeInfo(batchSizeInfo[Command.getMaterial]);
						requestQueue.geometries.setBatchSizeInfo(batchSizeInfo[Command.getGeometry]);
						requestQueue.geomMeshes.setBatchSizeInfo(batchSizeInfo[Command.getGeomMesh]);
						requestQueue.annotations.setBatchSizeInfo(batchSizeInfo[Command.getAnnotation]);
						requestQueue.tracks.setBatchSizeInfo(batchSizeInfo[Command.getTrack]);
						requestQueue.sequences.setBatchSizeInfo(batchSizeInfo[Command.getSequence]);
						return;
					}

					context = that.processCommand(data.name, data.jsonContent, data.binaryContent, data.isInitial);

					if (context) {
						that.sendRequest(context.requestQueue);
					}
				};

				that._worker.onerror = function(event) {
					// Log.error("Error in WebWorker", event);
				};
			}
		});
	};

	TotaraLoader.prototype.getUrl = function() {
		return this._url;
	};
	TotaraLoader.prototype.setUrl = function(url) {
		this._url = url;
		return this;
	};

	TotaraLoader.prototype.getCorrelationId = function() {
		return this._correlationId;
	};
	TotaraLoader.prototype.setCorrelationId = function(correlationId) {
		this._correlationId = correlationId;
		return this;
	};

	TotaraLoader.prototype.getSkipLowLODRendering = function() {
		return this._skipLowLODRendering;
	};
	TotaraLoader.prototype.setSkipLowLODRendering = function(skipLowLODRendering) {
		this._skipLowLODRendering = skipLowLODRendering;
		return this;
	};

	TotaraLoader.prototype.getMaxUrlLength = function() {
		return this._maxUrlLength;
	};
	TotaraLoader.prototype.setMaxUrlLength = function(maxUrlLength) {
		this._maxUrlLength = maxUrlLength;
		return this;
	};

	TotaraLoader.prototype.getMaxActiveRequests = function() {
		return this._maxActiveRequests;
	};

	TotaraLoader.prototype.setMaxActiveRequests = function(maxActiveRequests) {
		this._maxActiveRequests = maxActiveRequests;
		this.postMessage({
			method: Command.setMaxActiveRequests,
			maxActiveRequests: maxActiveRequests
		});
	};

	TotaraLoader.prototype.getMeshesBatchSize = function() {
		return this._meshesBatchSize;
	};
	TotaraLoader.prototype.setMeshesBatchSize = function(meshesBatchSize) {
		this._meshesBatchSize = meshesBatchSize;
		return this;
	};

	TotaraLoader.prototype.getMaterialsBatchSize = function() {
		return this._materialsBatchSize;
	};
	TotaraLoader.prototype.setMaterialsBatchSize = function(materialsBatchSize) {
		this._materialsBatchSize = materialsBatchSize;
		return this;
	};

	TotaraLoader.prototype.getGeometriesBatchSize = function() {
		return this._geometriesBatchSize;
	};
	TotaraLoader.prototype.setGeometriesBatchSize = function(geometriesBatchSize) {
		this._geometriesBatchSize = geometriesBatchSize;
		return this;
	};

	TotaraLoader.prototype.getGeometriesMaxBatchDataSize = function() {
		return this._geometriesMaxBatchDataSize;
	};
	TotaraLoader.prototype.setGeometriesMaxBatchDataSize = function(geometriesMaxBatchDataSize) {
		this._geometriesMaxBatchDataSize = geometriesMaxBatchDataSize;
		return this;
	};

	TotaraLoader.prototype.getGeomMeshesBatchSize = function() {
		return this._geomMeshesBatchSize;
	};
	TotaraLoader.prototype.setGeomMeshesBatchSize = function(geomMeshesBatchSize) {
		this._geomMeshesBatchSize = geomMeshesBatchSize;
		return this;
	};

	TotaraLoader.prototype.getGeomMeshesMaxBatchDataSize = function() {
		return this._geomMeshesMaxBatchDataSize;
	};
	TotaraLoader.prototype.setGeomMeshesMaxBatchDataSize = function(geomMeshesMaxBatchDataSize) {
		this._geomMeshesMaxBatchDataSize = geomMeshesMaxBatchDataSize;
		return this;
	};

	TotaraLoader.prototype.getAnnotationsBatchSize = function() {
		return this._annotationsBatchSize;
	};
	TotaraLoader.prototype.setAnnotationsBatchSize = function(annotationsBatchSize) {
		this._annotationsBatchSize = annotationsBatchSize;
		return this;
	};

	TotaraLoader.prototype.getTracksBatchSize = function() {
		return this._tracksBatchSize;
	};
	TotaraLoader.prototype.setTracksBatchSize = function(tracksBatchSize) {
		this._tracksBatchSize = tracksBatchSize;
		return this;
	};

	TotaraLoader.prototype.getSequencesBatchSize = function() {
		return this._sequencesBatchSize;
	};
	TotaraLoader.prototype.setSequencesBatchSize = function(sequencesBatchSize) {
		this._sequencesBatchSize = sequencesBatchSize;
		return this;
	};

	TotaraLoader.prototype.getVoxelThreshold = function() {
		return this._voxelThreshold;
	};

	TotaraLoader.prototype.setVoxelThreshold = function(voxelThreshold) {
		this._voxelThreshold = voxelThreshold;
		if (this.sceneBuilder) {
			this.sceneBuilder.setVoxelThreshold(voxelThreshold);
		}
		return this;
	};

	TotaraLoader.prototype.setSceneBuilder = function(sceneBuilder) {
		this.sceneBuilder = sceneBuilder;
		this.sceneBuilder.setVoxelThreshold(this.getVoxelThreshold());
	};

	TotaraLoader.prototype.dispose = function() {
		this.contextMap.forEach(function(context) {
			context.dispose();
		});
		this.contextMap.clear();
		this.tokenContextMap.clear();

		this.postMessage({ method: "close" });
		this._worker = undefined;

		this.currentSceneInfo = null;

		this.sceneBuilder.cleanup();
		this.sceneBuilder = null;

		this.onErrorCallbacks = null;
		this.onMaterialFinishedCallbacks = null;
		this.onImageFinishedCallbacks = null;
		this.onSetGeometryCallbacks = null;
		this.onSetTrackCallbacks = null;
		this.onSetSequenceCallbacks = null;
	};

	TotaraLoader.prototype.cleanup = function() {
		this.currentSceneInfo = {};
		this.contextMap.clear();
		this.tokenContextMap.clear();

		this.sceneBuilder.cleanup();
	};

	// if pushMesh is disabled (which is default), loader will try to request meshes
	// then geometries. If this is set to true, we assume we have everything already and do not
	// request anything
	TotaraLoader.prototype.enablePushMesh = function(enable) {
		this._pushMesh = enable;
	};

	TotaraLoader.prototype.getSceneBuilder = function(){
		return this.sceneBuilder;
	};

	TotaraLoader.prototype.getContext = function(sceneId) {
		return this.contextMap.get(sceneId);
	};

	TotaraLoader.prototype.createContext = function(sceneId, params) {
		var context = new SceneContext(sceneId, params, this);

		this.contextMap.set(sceneId, context);
		this.tokenContextMap.set(context.requestQueue.token, context);

		// attach callbacks
		if (context.onActiveCamera) {
			context.onActiveCameraCallbacks.attach(context.onActiveCamera);
			delete context.onActiveCamera;
		}

		if (context.onInitialSceneFinished) {
			context.onInitialSceneFinishedCallbacks.attach(context.onInitialSceneFinished);
			delete context.onInitialSceneFinished;
		}

		if (context.onPartialRetrievalFinished) {
			context.onPartialRetrievalFinishedCallbacks.attach(context.onPartialRetrievalFinished);
			delete context.onPartialRetrievalFinished;
		}

		if (context.onViewFinished) {
			context.onViewFinishedCallbacks.attach(context.onViewFinished);
			delete context.onViewFinished;
		}

		if (context.onSceneCompleted) {
			context.onSceneCompletedCallbacks.attach(context.onSceneCompleted);
			delete context.onSceneCompleted;
		}

		if (context.onProgressChanged) {
			context.setOnProgressChanged(context.onProgressChanged);
			delete context.onProgressChanged;
		}

		if (context.onLoadingFinished) {
			this.onLoadingFinishedCallbacks.detachAll();
			this.onLoadingFinishedCallbacks.attach(context.onLoadingFinished);
			delete context.onLoadingFinished;
		}

		if (context.onContentChangesProgress) {
			context.onContentChangesProgressCallbacks.attach(context.onContentChangesProgress);
			delete context.onContentChangesProgress;
		}

		if (context.onInitialViewCompleted) {
			context.onInitialViewCompletedCallbacks.attach(context.onInitialViewCompleted);
			delete context.onInitialViewCompleted;
		}

		return context;
	};

	TotaraLoader.prototype.isLoadingFinished = function() {
		var contextIterator = this.contextMap.values();
		var contextItem = contextIterator.next();
		while (!contextItem.done) {
			if (!contextItem.value.isLoadingFinished()) {
				return false;
			}
			contextItem = contextIterator.next();
		}

		// console.log("!!!!! Loading finished", this);
		return true;
	};

	TotaraLoader.prototype.decrementResourceCountersForDeletedTreeNode = function(context, nodeId) {
		if (context) {
			this.sceneBuilder.decrementResourceCountersForDeletedTreeNode(nodeId, context.sceneId);
		}
	};

	function logPerformance(context, name) {
		if (context.progressLogger) {
			context.progressLogger.logPerformance(name, context.token);
		}
	}

	TotaraLoader.prototype.request = function(sceneVeId, contextParams, authorizationHandler) {
		if (!contextParams.root) {
			throw "Context must include root where loaded objects are attached to";
		}

		var context = this.createContext(sceneVeId, contextParams);
		context.token = context.requestQueue.token;

		this.currentSceneInfo.id = sceneVeId;
		context.retrievalType = SceneContext.RetrievalType.Initial;
		context.authorizationHandler = authorizationHandler;

		context.initialRequestTime = Date.now();

		if (context.enableLogger) {
			TotaraUtils.createLogger(sceneVeId, context, this);
		}

		context.includeHidden = contextParams.includeHidden;
		context.includeBackground = contextParams.includeBackground;
		context.includeParametric = contextParams.includeParametric;
		context.includeAnimation = contextParams.includeAnimation;
		context.selectField = contextParams.$select;
		context.pushViewGroups = contextParams.pushViewGroups;
		context.pushPMI = contextParams.pushPMI;
		context.metadataFilter = contextParams.metadataFilter;
		context.activateView = contextParams.activateView;

		var commandInStr = TotaraUtils.createCommand(Command.getScene, { sceneId: sceneVeId });

		var maxUrlLength;
		if (sap.ui.Device.browser.msie || sap.ui.Device.browser.edge) {
			maxUrlLength = Math.min(2 * 1024, this.getMaxUrlLength());
		} else if (sap.ui.Device.browser.mobile) {
			maxUrlLength = Math.min(8 * 1024, this.getMaxUrlLength());
		} else {
			maxUrlLength = Math.min(64 * 1024, this.getMaxUrlLength());
		}

		logPerformance(context, "modelRequested");
		mark("modelRequested");
		this.postMessage({
			method: "initializeConnection",
			url: this.getUrl(),
			cid: this.getCorrelationId(),
			useSecureConnection: contextParams.useSecureConnection,
			maxActiveRequests: this.getMaxActiveRequests(),
			token: context.token,
			command: commandInStr,
			sceneId: sceneVeId,
			maxUrlLength: maxUrlLength
		});
	};

	TotaraLoader.prototype.postMessage = function(message) {
		if (this._worker) {
			this._worker.postMessage(message);
		}
	};

	TotaraLoader.prototype.processSetSceneCommand = function(jsonContent) {
		var context = this.getContext(jsonContent.veid);

		if (context) {
			context.defaultViewId = jsonContent.defaultViewId;
			context.defaultViewGroupId = jsonContent.defaultViewGroupId;
			context.sceneThumbnailId = jsonContent.imageId;
			context.dimension = jsonContent.dimension;
			context.defaultRootEntityId = jsonContent.defaultRootEntityId;

			if (context.defaultViewGroupId) {
				context.currentViewGroupId = context.defaultViewGroupId;
			}

			var includeHidden = context.includeHidden !== undefined ? context.includeHidden : true; // include hidden by default
			var includeAnimation = context.includeAnimation !== undefined ? context.includeAnimation : true; // include animation by default
			var includeBackground = context.includeBackground != null ? context.includeBackground : true;
			var includeParametric = context.includeParametric != null ? context.includeParametric : true;
			var selectField = context.$select !== undefined ? context.$select : "name,transform,meshId,annotationId,materialId,contentType,visible,opacity,renderOrder,entityId,highlightStyleId";
			var pushViewGroups = context.pushViewGroups !== undefined ? context.pushViewGroups : true;
			var expand = "nodes,bounds,animation";

			if (!includeAnimation) {
				expand = "nodes,bounds";
			}

			var viewOptions = {
				pushMaterials: true,
				pushMeshes: this._pushMesh,
				sceneId: context.sceneId,
				token: context.token,
				includeHidden: includeHidden,
				includeParametric: includeParametric,
				includeBackground: includeBackground,
				// includeAnimation: includeAnimation,
				pushViewGroups: pushViewGroups,
				pushPMI: context.pushPMI || false,
				metadataFilter: context.metadataFilter,
				$select: selectField,
				$expand: expand
			};

			viewOptions.context = context.sceneId;

			if (context.activateView) {
				viewOptions.id = context.activateView;
			} else if (context.defaultViewId) {
				viewOptions.id = context.defaultViewId;
			}

			if (viewOptions.id) {
				context.initialViewId = viewOptions.id;
				context.currentViewId = viewOptions.id;
				context.initialViewDecided = true;
			}

			// getScene is the first streaming API that is called when you load a resource.
			// one of the things it returns is the initialViewId that is used to create the getView command.
			// Set the command's context to have isInitial true so that all contextCommands following setView for this
			// initial default view get it as well and we can determine when initialView is loaded.
			this.postMessage(TotaraUtils.createRequestCommand(Command.getView, viewOptions, true /* isInitial */));
		}
	};

	// Returns promise that performs partial tree retrieval
	// Partial tree retrival is considered finished when we get all the meshes
	// If there is no need to retrieve meshes (e.g delete node), it will finish
	// when the tree building is finished.
	// viewId is optional
	TotaraLoader.prototype.update = function(sceneVeId, sidArray, viewId) {
		this.currentSceneInfo.id = sceneVeId;

		var context = this.getContext(sceneVeId);
		if (!context) {
			return Promise.reject("no context for ${sceneVeId}");
		}

		var that = this;
		return new Promise(function(resolve, reject) {

			// context.nodeSidsForPartialTree.clear();
			context.nodeSidsForPartialTree = new Set(sidArray);

			context.retrievalType = SceneContext.RetrievalType.Partial;
			var includeHidden = context.includeHidden !== undefined ? context.includeHidden : true; // include hidden by default
			var includeAnimation = context.includeAnimation !== undefined ? context.includeAnimation : true; // include animation by default
			var includeBackground = context.includeBackground != null ? context.includeBackground : true;
			var includeParametric = context.includeParametric != null ? context.includeParametric : true;
			var selectField = context.$select !== undefined ? context.$select : "name,transform,meshId,annotationId,materialId,contentType,visible,opacity,renderOrder,entityId,highlightStyleId";

			var options = {
				sceneId: sceneVeId,
				token: context.token,
				pushMaterials: true,
				pushMeshes: that._pushMesh,
				filter: sidArray.join(),
				includeAnimation: includeAnimation,
				includeHidden: includeHidden,
				includeParametric: includeParametric,
				includeBackground: includeBackground,
				pushPMI: context.pushPMI || false,
				metadataFilter: context.metadataFilter,
				$select: selectField,
				breadcrumbs: true
			};


			if (viewId) {
				options.activateView = viewId;
			}

			var commandInStr = TotaraUtils.createCommand(Command.getTree, options);

			var callback = function() {
				context.onPartialRetrievalFinishedCallbacks.detach(callback);
				logPerformance(context, "updateFinished(mesh)");
				var rnks = [];
				var rnvs = [];
				context.replacedNodes.forEach(function(value, key){ rnvs.push(value); rnks.push(key); });

				var replacedNodes = rnks; // Array.from(context.replacedNodes.keys());
				var replacementNodes = rnvs; // Array.from(context.replacedNodes.values());
				resolve({
					sceneVeId: sceneVeId,
					sids: sidArray,
					replacedNodeRefs: replacedNodes,
					replacementNodeRefs: replacementNodes
				}); // succesfully finished partial retrieval
			};

			context.onPartialRetrievalFinishedCallbacks.attach(callback);

			logPerformance(context, "updateRequested");
			// connection.send(commandInStr, context);

			that.postMessage({
				method: "update",
				command: commandInStr
			});
		});
	};

	TotaraLoader.prototype.requestViewGroup = function(sceneVeId, viewGroupId, includeAnimation) {
		if (!viewGroupId) {
			return Promise.reject("invalid arg: viewGroupId undefined");
		}

		var context = this.getContext(sceneVeId);
		if (!context) {
			return Promise.reject("no context for ${sceneVeId}");
		}

		if (includeAnimation !== undefined) {
			context.includeAnimation = includeAnimation;
		}

		var that = this;
		var promise = new Promise(function(resolve, reject) {
			var views = that.sceneBuilder.getViewGroup(viewGroupId, sceneVeId);
			if (views && views.length) {
				resolve(views);
				return;
			}

			var options = {
				sceneId: sceneVeId,
				id: viewGroupId,
				token: context.token
			};

			var callback = function() {
				context.onViewGroupFinishedCallbacks.detach(callback);

				logPerformance(context, "onViewGroupFinished");

				var viewgroup = that.sceneBuilder.getViewGroup(viewGroupId, sceneVeId);
				if (viewgroup && viewgroup.length) {
					resolve(viewgroup);
				} else {
					reject("no view ground data");
				}
			};
			context.onViewGroupFinishedCallbacks.attach(callback);

			context.currentViewGroupId = viewGroupId;

			that.postMessage(TotaraUtils.createRequestCommand(Command.getViewGroups, options));
		});
		return promise;
	};

	TotaraLoader.prototype.requestView = function(sceneVeId, viewType, viewId, playbackIds, includeAnimation) {
		this.currentSceneInfo.id = sceneVeId;

		if (viewType !== "static" && viewType !== "dynamic") {
			return Promise.reject("invalid arg: supported type - static, dynamic");
		}

		if (!viewId) {
			return Promise.reject("invalid arg: viewId undefined");
		}

		var context = this.getContext(sceneVeId);
		if (!context) {
			return Promise.reject("no context for ${sceneVeId}");
		}

		context.currentViewId = viewId;

		var includeHidden = context.includeHidden !== undefined ? context.includeHidden : true; // include hidden by default, e.g. hidden background node
		var includeBackground = context.includeBackground != null ? context.includeBackground : true;
		var includeParametric = context.includeParametric != null ? context.includeParametric : true;

		var includeAnimationOption;
		if (includeAnimation) {
			includeAnimationOption = includeAnimation;
		} else {
			includeAnimationOption = context.includeAnimation !== undefined ? context.includeAnimation : true; // include animation by default
		}

		// var selectField = context.$select !== undefined ? context.$select : undefined;
		var selectField = context.$select !== undefined ? context.$select : "name,transform,meshId,annotationId,materialId,contentType,visible,opacity,renderOrder,entityId,highlightStyleId";

		var expand = "nodes,bounds,animation";
		if (!includeAnimationOption) {
			expand = "nodes,bounds";
		}

		this.hasAnimation = false;   // will be check on callback of setPlayback.

		var that = this;
		var promise = new Promise(function(resolve, reject) {

			// This piece of code avoids going to server for view info which is already fetched,
			// but also bypasses ViewBuilder.js, which handles node material update,
			// as a temporary fix for node material updating, we comment out the code, and ask for
			// view info from server every time.
			// Refactoring in totara.ViewBuilder and threejs.Viewport is required to properly fix the problem
			/*
			if (useCurrentDataIfAvailable) {
				var view = that.sceneBuilder.getView(viewId, sceneVeId);
				if (view) {
					resolve(view);
					return;
				}
			}
			*/
			var command, options;
			if (viewType === "static") {
				command = Command.getView;

				options = {
					sceneId: sceneVeId,
					id: viewId,
					token: context.token,
					includeHidden: includeHidden,
					includeParametric: includeParametric,
					includeBackground: includeBackground,
					// includeAnimation: includeAnimationOption,
					$select: selectField,
					$expand: expand
				};

				if (playbackIds && playbackIds.length) {
					options.$expand = "playback";
					context.playbackIds = playbackIds;
				}
			} else {
				command = Command.getDynamicView;

				options = {
					sceneId: sceneVeId,
					type: viewId,
					token: context.token
				};
			}

			context.onSetPlaybackCallbacks.detachAll();
			var setPlaybackCallback = function(resultView) {
				context.onSetPlaybackCallbacks.detach(setPlaybackCallback);

				logPerformance(context, "onSetPlayback");

				if (resultView) {
					resolve(resultView);
				} else {
					reject("no view data");
				}
			};
			context.onSetPlaybackCallbacks.attach(setPlaybackCallback);

			context.onViewFinishedCallbacks.detachAll();
			var callback = function(resultView) {
				context.onViewFinishedCallbacks.detach(callback);

				logPerformance(context, "onViewFinished");

				if (!that.hasAnimation){
					if (resultView) {
						resolve(resultView);
					} else {
						reject("no view data");
					}
				} else {
					context.currentView = resultView;

				}
			};
			context.onViewFinishedCallbacks.attach(callback);

			that.onSetSequenceCallbacks.detachAll();
			var setSequenceCallback = function() {
				that.onSetSequenceCallbacks.detach(setSequenceCallback);

				logPerformance(context, "onSetSequence");

				if (context.currentView){
					resolve(context.currentView);
				}
			};
			that.onSetSequenceCallbacks.attach(setSequenceCallback);

			that.onSetTrackCallbacks.detachAll();
			var setTrackCallback = function(resultView) {
				that.onSetTrackCallbacks.detach(setTrackCallback);

				logPerformance(context, "onSetTrack");

				if (context.currentView){
					resolve(context.currentView);
				}
			};
			that.onSetTrackCallbacks.attach(setTrackCallback);

			logPerformance(context, "viewRequested");

			that.postMessage(TotaraUtils.createRequestCommand(command, options));
		});

		return promise;
	};

	TotaraLoader.prototype.requestMaterial = function(sceneVeId, materialId) {
		if (!materialId) {
			return Promise.reject("invalid arg: materialId undefined");
		}

		var context = this.getContext(sceneVeId);
		if (!context) {
			return Promise.reject("no context for ${sceneVeId}");
		}

		var that = this;
		var promise = new Promise(function(resolve, reject) {

			var material = context.sceneBuilder.getMaterial(materialId);
			if (material) {
				resolve(material);
				return;
			}

			context.requestQueue.materials.push(materialId);

			var imageFinishedCallback = function(result) {
				var m = that.sceneBuilder.getMaterial(materialId);
				if (m && !m.userData.imageIdsToLoad) {// no more texture images to load, this material is now completed, resolve the promise
					that.onImageFinishedCallbacks.detach(imageFinishedCallback);
					resolve(m);
				}
			};

			var materialFinishedCallback = function(newMaterialId) {
				if (materialId != newMaterialId) {
					return;
				}

				that.onMaterialFinishedCallbacks.detach(materialFinishedCallback);

				var m = that.sceneBuilder.getMaterial(materialId);
				if (!m) {
					that.onImageFinishedCallbacks.detach(imageFinishedCallback);
					reject("no material data");
				}

				if (m.userData.imageIdsToLoad) {
					// we are waiting for material textures to arrive
					return;
				}

				// no texture images to load, detach image callback and resolve the promise
				that.onImageFinishedCallbacks.detach(imageFinishedCallback);
				resolve(m);
			};

			that.onMaterialFinishedCallbacks.attach(materialFinishedCallback);

			that.onImageFinishedCallbacks.attach(imageFinishedCallback);

			that.sendRequest(context.requestQueue);
		});

		return promise;
	};

	TotaraLoader.prototype.setSuppressSendRequests = function(suppressSendRequests) {
		this._suppressSendRequests = suppressSendRequests;
	};

	TotaraLoader.prototype.sendRequest = function(requestQueue) {
		if (!this._worker || this._suppressSendRequests) {
			return false;
		}

		var somethingRequested = false;

		while (!requestQueue.isEmpty()) {
			var newCommand = requestQueue.generateRequestCommand();
			// console.log("postMessage", newCommand);
			this.postMessage(newCommand);
			somethingRequested = true;
		}

		return somethingRequested;
	};

	TotaraLoader.prototype.timestamp = function(jsonContent) {
	};

	TotaraLoader.prototype.performanceTiming = function(jsonContent) {
	};

	TotaraLoader.prototype.checkError = function(jsonContent) {
		if (!jsonContent) {
			return true;
		}

		var result = jsonContent.result === "failure";
		if (result) {
			// if error, change the field name a little bit
			if (jsonContent.message) {
				jsonContent.error = jsonContent.message;
				delete jsonContent.message;
			} else {
				jsonContent.error = "Unknown error";
			}
		}

		return result;
	};

	TotaraLoader.prototype.reportError = function(context, errorText) {
		this.onErrorCallbacks.execute({
			error: errorText,
			context: context
		});
	};

	TotaraLoader.prototype.processContextCommand = function(context, name, jsonContent, binaryContent, isInitial) {
		if (!context) {
			var error = name + " error: unknown context - " + JSON.stringify(jsonContent);
			this.contextMap.forEach(function(context) {
				context[name].call(context, jsonContent, binaryContent);
			});
			return { error: error };
		}

		var result;
		try {
			result = context[name].call(context, jsonContent, binaryContent, isInitial);
		} catch (err) {
			result = {
				error: err
			};
		}
		return result;
	};

	TotaraLoader.prototype.processCommand = function(name, jsonContent, binaryContent, isInitial) {
		// console.log("process", name, jsonContent.sceneId)
		if (this.checkError(jsonContent)) {
			if (name === Command.setTree) {// ?
				if (jsonContent.events && jsonContent.events.length) { // check if setTree has infomation about the id
					var event = jsonContent.events[ 0 ];
					if (event.values && event.values.id) {
						// setTree context carries scene veid. remove it since failed
						this.contextMap.delete(event.values.id);
					}
				}
			}

			this.onErrorCallbacks.execute(jsonContent);
			return null;
		}

		var context = null;
		if (jsonContent.sceneId !== undefined) {
			context = this.getContext(jsonContent.sceneId);
		} else if (jsonContent.token !== undefined) {
			context = this.tokenContextMap.get(jsonContent.token);
		}
		if (context) {
			this.currentSceneInfo.id = context.sceneId;
		}

		this.setPerformance(name, jsonContent, context ? context.sceneId : null);

		var result;
		switch (name) {
			case Command.setScene:
				this.processSetSceneCommand(jsonContent);
				break;
			case Command.setTree:
			case Command.setTreeNode:
			case Command.notifyFinishedTree:

			case Command.setView:
			case Command.setViewNode:
			case Command.setViewGroup:
			case Command.notifyFinishedView:

			case Command.setCamera:
			case Command.setMesh:
			case Command.setMaterial:
			case Command.setGeometry:
			case Command.setImage:
			case Command.setAnnotation:
			case Command.setLineStyle:
			case Command.setFillStyle:
			case Command.setTextStyle:
			case Command.setParametric:

			case Command.setPlayback:
			case Command.setHighlightStyle:
			case Command.setSequence:
			case Command.setTrack:

			case Command.suppressSendRequests:
			case Command.unsuppressSendRequests:

				result = this.processContextCommand(context, name, jsonContent, binaryContent, isInitial);

				break;

			case Command.notifyError: result = { error: jsonContent.errorText }; break;
			case Command.timestamp: result = this.timestamp(jsonContent); break;
			case Command.performanceTiming: result = this.performanceTiming(jsonContent); break;

			default: result = { error: "Unknown command: " + name }; break;
		}

		if (this.isLoadingFinished()) {
			if (name !== Command.setScene &&
				name !== Command.setView &&
				name !== Command.setViewNode &&
				name !== Command.timestamp &&
				name !== Command.performanceTiming &&
				name !== Command.suppressSendRequests &&
				name !== Command.unsuppressSendRequests &&
				this._loadingFinishedSent === false) {
				this.onLoadingFinishedCallbacks.execute();

				// Ensure onLoadingFinishedCallbacks are called only once
				this._loadingFinishedSent = true;
				Log.info("Loading is finished - all streaming requests are fulfilled.");
			}
		} else if (this._loadingFinishedSent) {
			// We already called the onLoadingFinished callbacks but now we should do it again as there is more staff in the receiving queue
			this._loadingFinishedSent = false;
		}

		if (result && result.error) {
			Log.error(result.error);
			this.onErrorCallbacks.execute(result);
		}

		return context;
	};

	TotaraLoader.prototype.setPerformance = function(name, jsonContent, sid) {
		var id;
		switch (name) {
			case Command.setGeometry:
				id = jsonContent.id;
				mark("setGeometry-" + id);
				break;
			case Command.setImage:
				id = jsonContent.id;
				mark("setImage-" + id);
				break;
			case Command.setView:
				id = jsonContent.viewId;
				mark("setView-" + id);
				break;
			case Command.setViewGroup:
				id = jsonContent.id;
				mark("setViewGroup-" + id);
				break;
			case Command.setMesh:
				mark("setMesh-" + sid);
				break;
			case Command.setMaterial:
				mark("setMaterial-" + sid);
				break;
			case Command.setTree:
				mark("setTree-" + sid);
				break;
			case Command.performanceTiming:
				this._isPostable = true;
				this.postPerformanceTiming();
				break;
			default:
				break;
		}
	};

	TotaraLoader.prototype.postPerformanceTiming = function(msg) {
		if (msg) {
			this._performanceTimingMsg.push(msg);
		}
		if (this._isPostable && this._performanceTimingMsg.length > 0) {
			this.postMessage(this._performanceTimingMsg.shift());
			this._isPostable = false;
		}
	};

	TotaraLoader.prototype.printLogTokens = function() {
		this.contextMap.forEach(function(context, sceneId) {
			Log.info("log tokens for scene => " + sceneId);
			Log.info("---------------------------------------");
			if (context.progressLogger) {
				context.progressLogger.getTokens().forEach(function(token) {
					Log.info(token);
				});
			}
			Log.info("---------------------------------------");
		});
	};

	return TotaraLoader;
});
