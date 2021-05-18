sap.ui.define(
	[
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/Utils",
		"sap/ui/test/Opa5",
		"sap/ui/test/matchers/Matcher",
		"sap/ui/core/util/ShortcutHelper",
		"sap/base/util/deepEqual"
	],
	function(OpaBuilder, Utils, Opa5, Matcher, ShortcutHelper, deepEqual) {
		"use strict";

		var ElementStates = {
			focused: function(bFocused) {
				var fnFocusedMatcher = OpaBuilder.Matchers.focused(true);
				return bFocused ? fnFocusedMatcher : OpaBuilder.Matchers.not(fnFocusedMatcher);
			},
			controlType: function(vType) {
				return function(oControl) {
					return oControl && oControl.isA(vType);
				};
			},
			content: function(mState) {
				return function(oControl) {
					if (!oControl) {
						return false;
					}
					var sAggregationName = oControl.getMetadata().getDefaultAggregationName() || "content",
						vAggControls = Utils.getAggregation(oControl, sAggregationName);
					if (!vAggControls) {
						return false;
					}
					if (!Array.isArray(vAggControls)) {
						vAggControls = [vAggControls];
					}
					return vAggControls.some(function(oAggControl) {
						return FEBuilder.Matchers.states(mState)(oAggControl);
					});
				};
			},
			p13nMode: function(aMode) {
				if (!Array.isArray(aMode)) {
					aMode = [];
				}
				aMode.sort();
				return function(oControl) {
					var p13nMode = oControl.getP13nMode();
					if (!Array.isArray(p13nMode)) {
						p13nMode = [];
					}
					p13nMode.sort();
					return deepEqual(aMode, p13nMode);
				};
			},
			label: function(sLabel) {
				return function(oControl) {
					if (oControl.getMetadata().getProperty("label")) {
						return OpaBuilder.Matchers.match(OpaBuilder.Matchers.properties({ label: sLabel }))(oControl);
					}
					return FEBuilder.Matchers.label(sLabel)(oControl);
				};
			}
		};

		var FEBuilder = function() {
			return OpaBuilder.apply(this, arguments);
		};

		FEBuilder.create = function(oOpaInstance) {
			return new FEBuilder(oOpaInstance);
		};

		FEBuilder.prototype = Object.create(OpaBuilder.prototype);
		FEBuilder.prototype.constructor = FEBuilder;

		/**
		 * Returns the matcher for states, which might be control specific. This function is meant to be overridden
		 * by concrete control builder if necessary.
		 * @param mState
		 * @returns {Function} state matcher function
		 *
		 * @protected
		 */
		FEBuilder.prototype.getStatesMatcher = function(mState) {
			return FEBuilder.Matchers.states(mState);
		};

		FEBuilder.prototype.hasState = function(mState) {
			if (!mState) {
				return this;
			}
			// check explicitly for boolean 'false', falsy value does not suffice
			if (mState.visible === false) {
				this.mustBeVisible(false);
				this.mustBeEnabled(false);
			}
			if (mState.enabled === false) {
				this.mustBeEnabled(false);
			}
			return this.has(this.getStatesMatcher(mState));
		};

		FEBuilder.prototype.doPressKeyboardShortcut = function(sShortcut) {
			return this.do(FEBuilder.Actions.keyboardShortcut(sShortcut));
		};

		FEBuilder.getControls = function(vBuilder, bSingle) {
			var oOptions = vBuilder.build(),
				vControls = Opa5.getPlugin().getMatchingControls(oOptions),
				aControls = OpaBuilder.Matchers.filter(oOptions.matchers)(vControls);
			if (bSingle) {
				if (aControls.length > 1) {
					throw new Error("found ambiguous results");
				}
				return aControls.length ? aControls[0] : null;
			}
			return aControls;
		};

		FEBuilder.controlsExist = function(vBuilder) {
			return !!FEBuilder.getControls(vBuilder).length;
		};

		FEBuilder.createClosePopoverBuilder = function(oOpaInstance, vPopoverMatchers, bStrict) {
			return OpaBuilder.create(oOpaInstance).success(function() {
				var bPopoverClosed = false,
					fnCloseCallback = function() {
						bPopoverClosed = true;
					},
					oBuilder = FEBuilder.createPopoverBuilder(oOpaInstance, vPopoverMatchers);

				if (bStrict || FEBuilder.controlsExist(oBuilder)) {
					return oBuilder
						.do(function(oPopover) {
							oPopover.attachEventOnce("afterClose", fnCloseCallback);
							oPopover.close();
						})
						.success(
							OpaBuilder.create(oOpaInstance).check(function() {
								return bPopoverClosed;
							})
						)
						.execute();
				}
			});
		};

		FEBuilder.createPopoverBuilder = function(oOpaInstance, vPopoverMatchers) {
			var oBuilder = OpaBuilder.create(oOpaInstance)
				.hasType("sap.m.Popover")
				.isDialogElement(true)
				.has(function(oPopover) {
					return oPopover.isOpen();
				})
				.checkNumberOfMatches(1);

			if (vPopoverMatchers) {
				oBuilder.has(vPopoverMatchers || []);
			}

			return oBuilder;
		};

		FEBuilder.createMessageToastBuilder = function(sText) {
			return OpaBuilder.create()
				.check(function() {
					var oWindow = Opa5.getWindow();
					return (
						oWindow.sapFEStubs && oWindow.sapFEStubs.getLastToastMessage && oWindow.sapFEStubs.getLastToastMessage() === sText
					);
				})
				.description("Toast message '" + sText + "' was displayed");
		};

		FEBuilder.Matchers = {
			FOCUSED_ELEMENT: function() {
				var oTestCore = Opa5.getWindow().sap.ui.getCore(),
					sFocusedId = oTestCore.getCurrentFocusedControlId();
				if (sFocusedId) {
					return oTestCore.byId(sFocusedId);
				}
				return null;
			},
			state: function(sName, vValue) {
				if (sName in ElementStates) {
					return ElementStates[sName](vValue);
				}
				return function(oControl) {
					// check whether an aggregation exists with given name...
					var oMetadata = oControl.getMetadata(),
						vAggControls =
							oMetadata.hasAggregation(sName) && oMetadata.getAggregation(sName).multiple
								? Utils.getAggregation(oControl, sName)
								: null;
					// ...if not, use normal properties matcher
					if (!vAggControls) {
						var mProperties = {};
						mProperties[sName] = vValue;
						return FEBuilder.Matchers.match(OpaBuilder.Matchers.properties(mProperties))(oControl);
					}
					if (!Array.isArray(vAggControls)) {
						vAggControls = [vAggControls];
					}
					if (!Array.isArray(vValue)) {
						// implicit check for aggregation length if number is given after an aggregation name
						if (Utils.isOfType(vValue, Number)) {
							return vAggControls.length === vValue;
						}
						return vAggControls.some(function(oAggControl) {
							return FEBuilder.Matchers.states(vValue)(oAggControl);
						});
					}
					// at this point we have both vAggControls and vValue as arrays => we check each single element against its corresponding state
					return (
						vValue.length === vAggControls.length &&
						vAggControls.every(function(oAggControl, iIndex) {
							return FEBuilder.Matchers.states(vValue[iIndex])(oAggControl);
						})
					);
				};
			},
			states: function(mStateMap, fnSingleStateMatcher) {
				if (!Utils.isOfType(mStateMap, Object)) {
					return OpaBuilder.Matchers.TRUE;
				}
				if (!Utils.isOfType(fnSingleStateMatcher, Function)) {
					fnSingleStateMatcher = FEBuilder.Matchers.state;
				}
				return FEBuilder.Matchers.match(
					Object.keys(mStateMap).map(function(sProperty) {
						return fnSingleStateMatcher(sProperty, mStateMap[sProperty]);
					})
				);
			},
			match: function(vMatchers) {
				var fnMatch = OpaBuilder.Matchers.match(vMatchers);
				return function(oControl) {
					// ensure that the result is a boolean
					return !!fnMatch(oControl);
				};
			},
			bound: function() {
				return function(oControl) {
					return oControl && !!oControl.getBindingContext();
				};
			},
			allMatch: function(vMatchers) {
				var fnFilterMatcher = OpaBuilder.Matchers.filter(vMatchers);
				return function(aItems) {
					var iExpectedLength = (aItems && aItems.length) || 0;
					return iExpectedLength === fnFilterMatcher(aItems).length;
				};
			},
			someMatch: function(vMatchers) {
				var fnFilterMatcher = OpaBuilder.Matchers.filter(vMatchers);
				return function(aItems) {
					return fnFilterMatcher(aItems).length > 0;
				};
			},
			/**
			 * Creates a matcher function that is identifying a control by id.
			 * The result will be true in case of the string was found, otherwise false.
			 *
			 * @param {string|RegExp} vId string/RegExp to be used for identifying the control
			 * @returns {Function} matcher function returning true/false
			 * @public
			 * @static
			 */
			id: function(vId) {
				return function(oControl) {
					if (Utils.isOfType(vId, String)) {
						return oControl.getId() === vId;
					} else {
						return vId.test(oControl.getId());
					}
				};
			},
			/**
			 * Creates a matcher function that is identifying a control by type.
			 * The result will be true in case of the string was found, otherwise false.
			 *
			 * @param {string|RegExp} vType string/RegExp to be used for identifying the control
			 * @returns {Function} matcher function returning true/false
			 * @public
			 * @static
			 */
			type: function(vType) {
				return function(oControl) {
					if (Utils.isOfType(vType, String)) {
						return oControl.getMetadata().getName() === vType;
					} else {
						return vType.test(oControl.getMetadata().getName());
					}
				};
			},
			/**
			 * Creates a matcher that returns the element at <code>iIndex</code> from input array.
			 *
			 * @param {number} iIndex the index of the element to be returned
			 * @returns {Function} matcher function returning element at given index
			 */
			atIndex: function(iIndex) {
				return function(vInput) {
					if (Utils.isOfType(vInput, [null, undefined])) {
						return null;
					}
					vInput = [].concat(vInput);
					return vInput.length > iIndex ? vInput[iIndex] : null;
				};
			},

			singleElement: function() {
				return function(vControls) {
					if (!Array.isArray(vControls)) {
						vControls = [vControls];
					}
					if (vControls.length !== 1) {
						return false;
					}
					return vControls[0];
				};
			},

			label: function(sText) {
				// either Label control exists having labelFor target the control, or ariaLabelledBy is available on control
				return OpaBuilder.Matchers.some(
					// alternative implementation to sap.ui.test.matchers.LabelFor, which does not support labels for links
					function(vControl) {
						var sControlId = vControl.getId && vControl.getId();
						return (
							sControlId &&
							FEBuilder.controlsExist(
								FEBuilder.create()
									.hasType("sap.m.Label")
									.hasProperties({ text: sText, labelFor: sControlId })
							)
						);
					},
					function(vControl) {
						var aAriaLabelledBy = vControl.getAriaLabelledBy && vControl.getAriaLabelledBy();
						if (Array.isArray(aAriaLabelledBy) && aAriaLabelledBy.length > 0) {
							return aAriaLabelledBy.some(function(sAriaLabelledById) {
								var oAriaLabelledBy = Opa5.getWindow()
									.sap.ui.getCore()
									.byId(sAriaLabelledById);
								return oAriaLabelledBy && oAriaLabelledBy.getText && oAriaLabelledBy.getText() === sText;
							});
						}
					}
				);
			}
		};

		FEBuilder.Actions = {
			keyboardShortcut: function(sShortcut, sChildElement, bIgnoreFocus) {
				var aArguments = Utils.parseArguments([String, String, Boolean], arguments);
				sShortcut = aArguments[0];
				sChildElement = aArguments[1];
				bIgnoreFocus = aArguments[2];
				return function(oElement) {
					var oNormalizedShortCut = ShortcutHelper.parseShortcut(sShortcut);
					oNormalizedShortCut.type = "keydown";
					// do not lower-case single key definitions (e.g. Enter, Space, ...), else the event might not be triggered properly
					if (sShortcut.toLowerCase() === oNormalizedShortCut.key) {
						oNormalizedShortCut.key = sShortcut;
					}
					var oJqueryElement = sChildElement ? oElement.$().find(sChildElement) : oElement.$();
					if (!bIgnoreFocus) {
						oElement.focus();
					}
					oJqueryElement.trigger(oNormalizedShortCut);
				};
			}
		};

		return FEBuilder;
	}
);
