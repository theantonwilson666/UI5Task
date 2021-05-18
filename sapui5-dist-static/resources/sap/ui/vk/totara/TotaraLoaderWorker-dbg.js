(function() {
	"use strict";

	var methodPriority = {};
	[
		"getVersion",
		"initializeConnection",
		"getScene",
		"getMesh",
		"getParametric",
		"getGeomMesh",
		"getAnnotation",
		"getMaterial",
		"getGeometry",
		"getImage",
		"getSequence",
		"getTrack",
		"getView",
		"getHighlightStyle"
	].reverse().forEach(function(name, index) {
		methodPriority[ name ] = index;
	});

	var tileWidths = new Map();

	function HttpConnection() {
		this._url = null;
		this._url2 = null; // caching URL for geometries, images, thumbnails
		this._correlationId = null;
		this._authorizationToken = null;
		this._tenantUuidToken = null;

		this._onResponse = null;
		this._onError = null;

		this._requestQueue = [];
		this._maxActiveRequests = 4;
		this._activeRequestCount = 0;
	}

	HttpConnection.prototype.init = function(serverUrl, authorizationHandler, correlationId) {
		this._url = serverUrl;
		this._correlationId = correlationId;

		var that = this;
		return new Promise(function(resolve, reject) {
			if (authorizationHandler) {
				authorizationHandler(serverUrl).then(function(token) {
					that._authorizationToken = token ? token.token_type + " " + token.access_token : null;
					that._tenantUuidToken = token ? token.tenant_uuid : null;
					resolve({});
				}).catch(function(reason) {
					return reject(reason);
				});
			} else {
				resolve({});
			}
		});
	};

	HttpConnection.prototype.close = function() {
		// don't really need to close anything
	};

	HttpConnection.prototype.getURL = function() {
		return this._url;
	};

	HttpConnection.prototype.setCachingURL = function(dataUrl) {
		this._url2 = dataUrl;
	};

	HttpConnection.prototype.getCachingURL = function() {
		return this._url2;
	};

	HttpConnection.prototype.setMaxActiveRequests = function(maxActiveRequests) {
		this._maxActiveRequests = maxActiveRequests;
	};

	HttpConnection.prototype.send = function(message, context, onResponse) {
		if (!message) {
			return;
		}

		this._requestQueue.push({
			message: (onResponse ? this._url2 : this._url) + message,
			context: context,
			priority: methodPriority[ context && context.method ] || 0,
			onResponse: onResponse || this._onResponse
		});

		if (this._activeRequestCount < this._maxActiveRequests) {
			this._processNextRequest();
		}
	};

	HttpConnection.prototype._processNextRequest = function() {
		if (!this._requestQueue.length) {
			return;
		}

		this._requestQueue.sort(function(a, b) {
			return a.priority - b.priority;
		});
		var request = this._requestQueue.pop();
		this._activeRequestCount++;
		// console.log(">", request.priority, request.context && request.context.method, this._requestQueue.length);
		var that = this;
		this._makeRequestPromise(encodeURI(request.message)).then(function(result) {
			if (request.onResponse) {
				request.onResponse(result);
			}
			that._activeRequestCount--;
			that._processNextRequest();
		}).catch(function(reason) {
			if (that._onError) {
				that._onError({
					errorText: "Could not connect to server: " + that._url,
					error: reason.status,
					reason: reason.message ? reason.message : reason,
					context: request.context
				});
			}
			that._activeRequestCount--;
			that._processNextRequest();
		});
	};

	HttpConnection.prototype._makeRequestPromise = function(url) {
		var that = this;
		var promise = new Promise(function(resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.onload = function() {
				if (this.status >= 200 && this.status < 300) {
					if (this.getAllResponseHeaders().includes("tile-width")) {
						var tileWidth = this.getResponseHeader("tile-width");
						var re = new RegExp("[^\/]+$");
						var imageId = this.responseURL.match(re); // Get imageId from end of URL
						tileWidths.set(imageId[ 0 ], tileWidth);
					}
					resolve(this.response);
				} else {
					reject({
						status: this.status,
						statusText: this.statusText
					});
				}
			};

			xhr.onerror = function() {
				reject({
					status: this.status,
					statusText: this.statusText
				});
			};

			xhr.open("GET", url, true);
			if (that._authorizationToken) {
				xhr.setRequestHeader("Authorization", that._authorizationToken);
			}
			if (that._tenantUuidToken) {
				xhr.setRequestHeader("X-TenantUuid", that._tenantUuidToken);
			}
			xhr.setRequestHeader("X-CorrelationID", that._correlationId);
			xhr.responseType = "arraybuffer";
			xhr.send();
		});
		return promise;
	};



	function WebSocketConnection() { // inputUrl
		this._url = null;
		this._webSocket = null;

		this._onResponse = null;
		this._onError = null;

		this._isInitialised = false;
		this._timerId = 0;
	}

	WebSocketConnection.prototype.init = function(serverUrl, authorizationHandler) {
		this._url = serverUrl;

		var that = this;
		return new Promise(function(resolve, reject) {
			var webSocket = that._webSocket = new WebSocket(serverUrl);
			webSocket.binaryType = "arraybuffer";

			webSocket.onopen = function() {
				that._isInitialised = true;
				if (authorizationHandler != null) {
					authorizationHandler(serverUrl).then(function(token) {
						if (token != null) {
							var tokenObj = { "token": token.access_token };
							if (token.tenant_uuid) {
								tokenObj.tenantUuid = token.tenant_uuid;
							}
							var requestCommandContent = JSON.stringify(tokenObj);
							var cmd = "setStreamingToken" + ("[" + requestCommandContent.length + "]") + requestCommandContent;
							webSocket.send(cmd);
						}

						that._keepAlive();
						resolve({});
					}).catch(function(reason) {
						return reject(reason);
					});
				} else {
					that._keepAlive();
					resolve({});
				}
			};

			webSocket.onclose = function() {
				that._cancelKeepAlive();
			};

			webSocket.onmessage = function(e) {
				var msg = e.data;
				if (that._onResponse) {
					that._onResponse(msg);
				}
			};

			webSocket.onerror = function(e) {
				if (!that._isInitialised) {
					reject("error connecting to " + serverUrl);
				} else if (that._onError) {
					that._onError({
						errorText: e
					});
				}
			};
		});
	};

	WebSocketConnection.prototype.getURL = function() {
		return this._url;
	};

	WebSocketConnection.prototype.close = function() {
		if (this._webSocket) {
			this._webSocket.close();
			this._webSocket = null;
		}
	};

	WebSocketConnection.prototype._keepAlive = function() {
		var timeout = 60000;
		if (this._webSocket === null) {
			this._cancelKeepAlive();
			return;
		}

		if (this._webSocket.readyState === 1) {
			this._webSocket.send("");
		}
		this._timerId = setTimeout(this._keepAlive, timeout);
	};

	WebSocketConnection.prototype._cancelKeepAlive = function() {
		if (this._timerId) {
			clearTimeout(this._timerId);
			this._timerId = 0;
		}
	};

	WebSocketConnection.prototype.send = function(message, context) { // optional context for error handling
		if (!message) {
			return;
		}

		if (this._webSocket && this._webSocket.readyState === 1) {
			try {
				this._webSocket.send(message);
			} catch (e) {
				if (this._onError) {
					this._onError({
						errorText: e,
						context: context
					});
				}
			}
		} else if (this._onError) {
			this._onError({
				errorText: "websocket connection lost",
				context: context,
				error: 4 // TODO: add enum with error codes, this one is internal server error
			});
		}
	};



	function getContentLengths(contentLengthsString) {
		var list = contentLengthsString.split(",");

		if (list.length < 0 || list.length > 2) {
			throw "invalid content length";
		}

		var jsonContentLength = 0;
		var binaryContentLength = 0;

		try {
			jsonContentLength = parseInt(list[0], 10);

			if (list.length === 2) {
				binaryContentLength = parseInt(list[1], 10);
			}

		} catch (e) {
			throw "invalid content length";
		}

		return {
			jsonContentLength: jsonContentLength,
			binaryContentLength: binaryContentLength
		};
	}

	/**
	 * Parse arrayBuffer into a list of protocol commands with payloads.
	 *
	 * @param {ArrayBuffer} arrayBuffer Contains multiple commands in the following format:                                                   <br/>
	 *                                  <code>COMMAND[JSONLENGTH,BINARYLENGTH]{JSON}BINARY</code>                                             <br/>
	 *                                  or                                                                                                    <br/>
	 *                                  <code>COMMAND[JSONLENGTH]{JSON}</code>                                                                <br/>
	 *                                  where                                                                                                 <br/>
	 *                                  <code>JSONLENGTH</code> is the length in bytes of the JSON payload including {} in the UTF-8 encoding,<br/>
	 *                                  <code>BINARYLENGTH</code> is the length of the binary payload immediately following the JSON payload. <br/>
	 *                                  Multiple commands can optionally be delimited by newlines (\n) or spaces (' ').
	 * @param {boolean}		isInitial	Specifies whether the commands are part of the initialView loading.
	 * @returns {objects[]}             An array of objects with the following properties:
	 *                                  <ul>
	 *                                      <li>name: string</li>
	 *                                      <li>jsonString: JSON string</li>
	 *                                      <li>binaryContent: ArrayBuffer</li>
	 *                                  </ul>
	 * @private
	 */
	function createCommandList(arrayBuffer, isInitial) {
		var bracketOpen = "[".charCodeAt(0);
		var bracketClose = "]".charCodeAt(0);

		var commandList = [];

		var start = 0;
		var end = 0;

		var contentLengths;
		var jsonString;
		var binaryContent;

		var uint8Array = new Uint8Array(arrayBuffer); // This is not a copy, this is just a view into arrayBuffer.

		while (end < arrayBuffer.byteLength) {
			end = uint8Array.indexOf(bracketOpen, start);

			if (end === -1) {
				// Could not locate open bracket '['. So, no more commands.
				break;
			}

			// Get the command name and remove possible whitespaces.
			// The streaming protocol allows multiple commands in one message separated by whitespaces,
			// so, the second and subsequent commands might start with whitespaces.
			var commandName = utf8ToString(arrayBuffer, start, end).replace(/\n|\r|\s/g, "");
			start = end + 1;

			end = uint8Array.indexOf(bracketClose, start);

			if (end === -1) {
				throw "No matching [] for command length. abort";
			}

			contentLengths = getContentLengths(utf8ToString(arrayBuffer, start, end));

			start = end + 1;
			end = start + contentLengths.jsonContentLength;

			jsonString = utf8ToString(arrayBuffer, start, end);

			// binary content is optional atm
			if (contentLengths.binaryContentLength) {
				start = end;
				end = start + contentLengths.binaryContentLength;

				binaryContent = new Uint8Array(arrayBuffer, start, contentLengths.binaryContentLength);
			} else {
				binaryContent = undefined;
			}

			start = end;

			var command = {
				name: commandName,
				jsonString: jsonString,
				isInitial: isInitial
			};

			if (binaryContent) {
				command.binaryContent = binaryContent;
			}

			commandList.push(command);
		}

		return commandList;
	}

	var utf8Decoder;

	function utf8ToString(arrayBuffer, start, end) {
		if (TextDecoder) {
			if (!utf8Decoder) {
				utf8Decoder = new TextDecoder();
			}
			return utf8Decoder.decode(new DataView(arrayBuffer, start, end - start));
		}

		var encodedString = "";
		// If arrayBuffer is too long, the stack runs out of space in String.fromCharCode.apply,
		// so batch it in certain size.
		var MAX_CHUNK_SIZE = 1000; // arbitrary number here, not too small, not too big
		try {
			while (start < end) {
				var chunkSize = Math.min(MAX_CHUNK_SIZE, end - start);
				var uint8Array = new Uint8Array(arrayBuffer, start, chunkSize); // This does not create a copy of data, this is just a view inside `arrayBuffer`.
				encodedString += String.fromCharCode.apply(null, uint8Array);
				start += chunkSize;
			}
		} catch (e) {
			return "";
		}
		return decodeURIComponent(escape(encodedString));
	}

	function LoaderProxy() {
		// for handling continuous initializeConnection requests
		// there may be multiple requests before connection is establish
		this.resolveFunctions = [];
		this.rejectFunctions = [];

		this.init = function(providedConnection, httpConnection, builderId) {

			this._connection = providedConnection;
			this._connectionHTTP = httpConnection;
			this._sceneBuilderId = builderId;
			if (!providedConnection) {
				throw "no connection provided for loader!";
			}

			this._connection._onResponse = function(response) {
				// if this.context contains default view then process rest of the commands with
				// added isInitial flag
				var commandList = createCommandList(response, (this.context ? this.context.isInitial : false));
				processCommands(commandList);
			};

			this._connection.send("getVersion[2]{}", { method: "getVersion" });
		};

		var that = this;
		function setProtocolVersion(version) {
			that.protocolVersion = version.split(".").map(function(s) { return parseInt(s, 10); });
		}

		function processCommands(commandList) {
			var command;
			var setPlaybackCommandIndex = -1;
			var viewId, i;
			var needAddIdToSetView = false;
			var afterSetViewCommand  = false;
			var setPlaybackAfterSetSequence = false;
			var sceneId;
			for (i = 0; i < commandList.length; i++) {
				command = commandList[i];
				if (command.name === "setView") {
					if (!sceneId) {
						sceneId = JSON.parse(command.jsonString).sceneId;
					}
					if (!needAddIdToSetView) {
						if (!JSON.parse(command.jsonString).viewId) {
							needAddIdToSetView = true;
						}
					}
					afterSetViewCommand = true;
				} else if (command.name === "setViewNode") {
					if (viewId === undefined) {
						viewId = JSON.parse(command.jsonString).viewId;
					}
				} else if (command.name === "setSequence" && afterSetViewCommand) {
					setPlaybackAfterSetSequence = true;
				}
			}

			if (viewId && needAddIdToSetView) {
				for (i = 0; i < commandList.length; i++) {
					command = commandList[i];
					if (command.name === "setView") {
						command.jsonContent = {
							viewId: viewId
						};
						break;
					}
				}
			}

			if (sceneId) {
				self.postMessage({
					name: "suppressSendRequests",
					jsonContent: {
						sceneId: sceneId
					}
				});
			}

			var processCommand = function(command) {
				if (command.binaryContent) {
					self.postMessage({
						name: command.name,
						jsonString: command.jsonString,
						jsonContent: command.jsonContent,
						binaryContent: command.binaryContent,
						isInitial: command.isInitial
					}, [ command.binaryContent.buffer ]);
				} else {
					self.postMessage({
						name: command.name,
						jsonString: command.jsonString,
						jsonContent: command.jsonContent,
						isInitial: command.isInitial
					});
				}
			};

			for (i = 0; i < commandList.length; i++) {
				command = commandList[i];
				if (command.name === "protocol") {
					setProtocolVersion(JSON.parse(command.jsonString).version);
				}
				if (command.name === "setPlayback" && setPlaybackAfterSetSequence) {
					setPlaybackCommandIndex = i;
					continue;
				}
				if (command.name === "setImage") {
					var imageId = command.jsonContent.id;
					var tileWidth = imageId ? tileWidths.get(imageId) : null;
					if (tileWidth) {
						command.jsonContent.tileWidth = tileWidth;
					}
				}

				// We only handle setScene when it's response of getScene,
				// where we get default view and viewgroup information, and proceed to get views.
				// Setscene could also be part of response for getTree command,
				// as we only use getTree command for partial tree retrieval, no need to get view,
				// so setScene is ignored.
				if (command.name === "setScene" && commandList.length > 1) {
					continue;
				}
				processCommand(command);
			}

			if (setPlaybackCommandIndex !== -1) {
				command = commandList[setPlaybackCommandIndex];
				processCommand(command);
			}

			if (sceneId) {
				self.postMessage({
					name: "unsuppressSendRequests",
					jsonContent: {
						sceneId: sceneId
					}
				});
			}
		}

		this.getConnection = function() {
			return this._connection;
		};

		this.getConnectionHTTP = function() {
			return this._connectionHTTP;
		};

		this._sendGetImage = function(command) {
			var request;
			if (this.protocolVersion && (this.protocolVersion[0] > 1 || this.protocolVersion[1] > 0)) {
				if (command.materialId) {
					request = "scenes/" + command.sceneId + "/materials/" + command.materialId + "/images/" + command.imageId;
				} else if (command.viewId) {
					// request = "scenes/" + command.sceneId + "/views/" + command.viewId + "/thumbnail";
					request = "scenes/" + command.sceneId + "/views/" + command.viewId + "/images/" + command.imageId;
				}
			}
			request = request || ("images/" + command.imageId);
			this._connectionHTTP.send(request, command, function(result) {
				processCommands([ {
					name: "setImage",
					jsonContent: {
						sceneId: command.sceneId,
						id: command.imageId,
						isInitial: command.isInitial
					},
					binaryContent: new Uint8Array(result)
				} ]);
			});
		};

		this._sendGetGeometries = function(command) {
			var geometryIds = command.geometryIds;
			var request = "geometry?";
			for (var i = 0; i < geometryIds.length; i++) {
				request += (i > 0 ? "&id=" : "id=") + geometryIds[i];
			}
			this._connectionHTTP.send(request, command, function(result) {
				var dataView = new DataView(result);
				// var version = dataView.getUint16(0, true);
				var bufferCount = dataView.getUint16(2, true), offset = 0;
				var commands = [];
				while (bufferCount-- > 0) {
					var geomInfo = {
						sceneId: command.sceneId,
						id: dataView.getUint32(offset + 4, true).toString(),
						box: [
							dataView.getFloat32(offset + 14, true),
							dataView.getFloat32(offset + 18, true),
							dataView.getFloat32(offset + 22, true),
							dataView.getFloat32(offset + 26, true),
							dataView.getFloat32(offset + 30, true),
							dataView.getFloat32(offset + 34, true)
						]
					};

					var geometryType = dataView.getUint16(offset + 12, true);
					offset += 38;

					if (geometryType !== 3) { // for geometry which is not of type 3 (box)
						geomInfo.flags = dataView.getUint16(offset, true);
						// geomInfo.uvChannelCount = dataView.getUint16(offset + 2, true);
						geomInfo.quality = dataView.getFloat32(offset + 4, true);
						geomInfo.pointCount = dataView.getUint16(offset + 8, true);
						geomInfo.elementCount = dataView.getUint16(offset + 10, true);
						// geomInfo.type = dataView.getUint16(offset + 12, true);
						offset += 14;
					}

					var bufferLength = dataView.getUint32(offset, true);
					var buffer = new Uint8Array(result, offset + 4, bufferLength);
					offset += bufferLength;

					commands.push({
						name: "setGeometry",
						jsonContent: geomInfo,
						binaryContent: buffer.slice()
					});
				}
				processCommands(commands);
			});
		};

		this._sendGetGeomMeshes = function(command) {
			var request = "scenes/" + command.sceneId + "/meshes?ids=";
			var meshIds = command.meshIds;
			for (var i = 0; i < meshIds.length; i++) {
				request += (i > 0 ? "," : "") + meshIds[i];
			}
			// request += "&$expand=geometry";
			this._connectionHTTP.send(request, command, function(result) {
				var commandList = createCommandList(result);
				commandList.forEach(function(subCommand) {
					subCommand.jsonContent = {
						sceneId: command.sceneId
					};
				});
				processCommands(commandList);
			});
		};

		this.send = function(command) {
			if (this._connectionHTTP) {
				switch (command.method) {
					case "getImage":
						this._sendGetImage(command);
						return;

					case "getGeometry":
						this._sendGetGeometries(command);
						return;

					case "getGeomMesh":
						if (command.meshIds) {
							this._sendGetGeomMeshes(command);
							return;
						}
						break;

					default: break;
				}
			}

			if (this._connection) {
				this._connection.send(command.command, { method: command.method, isInitial: command.isInitialView });
			}
		};

		this.setSceneBuilderId = function(id) {
			this._sceneBuilderId = id;
		};

		this.getSceneBuilderId = function() {
			return this._sceneBuilderId;
		};

		this.authorizationHandler = function(url) {
			var that = this;
			return new Promise(function(resolve, reject) {
				var data = {
					name: "getAuthorization",
					jsonContent: { url: url },
					sceneId: that.sceneId
				};
				that.resolveFunctions.push(resolve);
				that.rejectFunctions.push(reject);
				self.postMessage(data);
			});
		}.bind(this);
	}

	var loader = new LoaderProxy();

	var reportError = function(error) {
		self.postMessage({ name: "notifyError", jsonContent: error });
	};

	var getMaxBatchStringLength = function(command, urlBase, cachingUrlBase, sceneId, token, maxUrlLength) {
		var baseQueryString;
		var maxBatchStringLength;
		switch (command) {
			case "getGeometry":
				baseQueryString = "?id=";
				if (!cachingUrlBase) {
					maxBatchStringLength = Number.MAX_SAFE_INTEGER;
				} else {
					maxBatchStringLength = maxUrlLength - (cachingUrlBase + "geometry" + baseQueryString).length;
				}
				break;

			case "getGeomMesh":
				baseQueryString = "?ids=";
				if (!cachingUrlBase) {
					maxBatchStringLength = Number.MAX_SAFE_INTEGER;
				} else {
					maxBatchStringLength = maxUrlLength - (cachingUrlBase + "scenes/" + sceneId + "/meshes" + baseQueryString).length;
				}
				break;

			default:
				baseQueryString = "?request=" + encodeURI(command + "[" + maxUrlLength + "]" + JSON.stringify({
					sceneId: sceneId,
					ids: [],
					token: token
				}));
				if (urlBase.indexOf("ws") === 0) {
					maxBatchStringLength = Number.MAX_SAFE_INTEGER;
				} else {
					maxBatchStringLength = maxUrlLength - (urlBase + baseQueryString).length;
				}
				break;
		}
		return maxBatchStringLength;
	};

	var getBatchSeparatorLength = function(command) {
		switch (command) {
			case "getGeometry":
				return "&id=".length;
			default:
				return ",".length;
		}
	};

	var getBatchSizeInfo = function(url, cachingUrl, sceneId, correlationId, maxUrlLength) {
		url = url.indexOf("?") === -1 ? url : url.substring(0, url.indexOf("?"));

		var batchedCommands = [
			"getMesh",
			"getAnnotation",
			"getMaterial",
			"getGeometry",
			"getGeomMesh",
			"getSequence",
			"getTrack"
		];
		var batchSizeInfo = {};
		batchedCommands.forEach(function(batchedCommand) {
			batchSizeInfo[batchedCommand] = {
				maxBatchStringLength: getMaxBatchStringLength(batchedCommand, url, cachingUrl, sceneId, correlationId, maxUrlLength),
				separatorLength: getBatchSeparatorLength(batchedCommand)
			};
		});
		return batchSizeInfo;
	};

	self.onmessage = function(event) {
		var data = event.data;
		switch (data.method) {
			case "initializeConnection": {
				if (!data.url) {
					break;
				}

				if (data.sceneId) {
					loader.sceneId = data.sceneId;
				}

				var endPoint = "";
				// Must end with forward slash
				if (data.url[data.url.length - 1] !== "/") {
					data.url += "/";
				}
				if (data.url.toLowerCase().startsWith("ws")) {
					endPoint = data.url + "streaming?";
				} else if (data.url.toLowerCase().startsWith("http")) {
					endPoint = data.url + "streaming-http?request=";
				} else {
					endPoint = (data.useSecureConnection ? "wss://" : "ws://") + data.url + "streaming?";
				}
				var cid = data.cid;
				var existingConnection = loader.getConnection();
				var url, cachingUrl;
				if (!existingConnection || existingConnection._url !== endPoint) {
					if (existingConnection) {
						existingConnection.close();
					}

					var connection;
					var cachingEndPoint = null;

					if (data.url.toLowerCase().startsWith("ws")) {
						// As client explicitely requested WebSocket connection we will not initialize HTTP(S) caching connection
						connection = new WebSocketConnection();
					} else if (data.url.toLowerCase().startsWith("http")) {
						// Load geometry and images over HTTP(S) so that browser caching is used.
						connection = new HttpConnection();
						connection.setCachingURL(data.url);
						connection.setMaxActiveRequests(data.maxActiveRequests);
					} else {
						// If protocol is not specified then we will use WebSocket connection as the default
						// In this case we will load geometry and images over HTTP(S) connection so that browser caching is used.
						connection = new WebSocketConnection();
						cachingEndPoint = (data.useSecureConnection ? "https://" : "http://") + data.url;
					}

					connection._onError = reportError;
					connection.init(endPoint, loader.authorizationHandler, cid).then(function() {
						var initLoader = function(connection, connectionHttp) {
							loader.init(connection, connectionHttp, data.sceneBuilderId);

							url = connection.getURL();
							cachingUrl = connectionHttp
								? connectionHttp.getCachingURL()
								: connection.getCachingURL();

							self.postMessage({
								name: "batchSizeInfo",
								jsonContent: {
									sceneId: data.sceneId,
									batchSizeInfo: getBatchSizeInfo(url, cachingUrl, data.sceneId, data.cid, data.maxUrlLength)
								}
							});

							if (data.command) {
								loader.send(data);
							}
						};
						if (cachingEndPoint) {
							// Initialize caching HTTP(S) connection
							var connectionHttp = new HttpConnection();
							connectionHttp.setCachingURL(cachingEndPoint);
							connectionHttp.init(cachingEndPoint, loader.authorizationHandler, cid).then(function() {
								initLoader(connection, connectionHttp);
							}).catch(function(error) {
								reportError(error);
							});
						} else {
							initLoader(connection, connection instanceof HttpConnection ? connection : null);
						}
					}).catch(function(error) {
						reportError(error);
					});
				} else {
					url = loader.getConnection().getURL();
					cachingUrl = loader.getConnectionHTTP()
						? loader.getConnectionHTTP().getCachingURL()
						: loader.getConnection().getCachingURL();

					self.postMessage({
						name: "batchSizeInfo",
						jsonContent: {
							sceneId: data.sceneId,
							batchSizeInfo: getBatchSizeInfo(url, cachingUrl, data.sceneId, data.cid, data.maxUrlLength)
						}
					});

					if (data.command) {
						loader.send(data);
					}
				}
				break;
			}
			case "setMaxActiveRequests": {
				if (loader.getConnection() instanceof HttpConnection) {
					loader.getConnection().setMaxActiveRequests(data.maxActiveRequests);
				}
				break;
			}
			case "setAuthorization": {
				var resolve = loader.resolveFunctions.shift();
				var reject = loader.rejectFunctions.shift();
				if (data.error == null) {
					resolve(data.authorizationToken);
				} else {
					reject(data.error);
				}
				break;
			}
			case "close": {
				self.close();
				break;
			}
			default: {
				if (data.command) {
					loader.send(data);
				}
				break;
			}
		}
	};

	self.postMessage({ ready: true });
})();
