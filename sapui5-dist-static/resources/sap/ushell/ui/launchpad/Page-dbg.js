// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.launchpad.Page.
sap.ui.define([
    "sap/m/Button",
    "sap/m/library",
    "sap/m/Text",
    "sap/ui/core/Control",
    "sap/ui/core/dnd/DragDropInfo",
    "sap/ui/core/InvisibleMessage",
    "sap/ui/core/library",
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources",
    "sap/ushell/ui/launchpad/ExtendedChangeDetection",
    "./PageRenderer"
], function (
    Button,
    mLibrary,
    Text,
    Control,
    DragDropInfo,
    InvisibleMessage,
    coreLibrary,
    ushellLibrary,
    resources,
    ExtendedChangeDetection,
    PageRenderer
) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mLibrary.ButtonType;

    // shortcut for sap.ui.core.TextAlign
    var TextAlign = coreLibrary.TextAlign;

    // shortcut for InvisiblesMessageMode
    var InvisibleMessageMode = coreLibrary.InvisibleMessageMode;

    /**
     * Constructor for a new Page.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @class
     * The Page represents a collection of sections.
     * @extends sap.ui.core.Control
     *
     * @author SAP SE
     * @version 1.88.1
     *
     * @private
     * @alias sap.ushell.ui.launchpad.Page
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var Page = Control.extend("sap.ushell.ui.launchpad.Page", /** @lends sap.ushell.ui.launchpad.Page.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {

                /**
                 * Specifies whether the addSection button is visible.
                 */
                edit: { type: "boolean", group: "Misc", defaultValue: false },

                /**
                 * Specifies whether section reordering is enabled. Relevant only for desktop devices.
                 */
                enableSectionReordering: { type: "boolean", group: "Misc", defaultValue: false },

                /**
                 * Specifies the data-help-id attribute of the Page.
                 * If left empty, the attribute is not rendered.
                 */
                dataHelpId: { type: "string", group: "Misc", defaultValue: "" },

                /**
                 * This text is displayed when the control contains no sections.
                 */
                noSectionsText: { type: "string", group: "Misc", defaultValue: "" },

                /**
                 * Defines whether or not the text specified in the <code>noSectionsText</code> property is displayed.
                 */
                showNoSectionsText: { type: "boolean", group: "Misc", defaultValue: true },

                /**
                 * Defines whether or not the title specified in the <code>title</code> property is displayed.
                 */
                showTitle: { type: "boolean", group: "Misc", defaultValue: false },

                /**
                 * This title is displayed on top of the Page.
                 */
                title: { type: "string", group: "Misc", defaultValue: "" }
            },
            defaultAggregation: "sections",
            aggregations: {

                /**
                 * The sections displayed in the Page.
                 */
                sections: { type: "sap.ushell.ui.launchpad.Section", multiple: true, dnd: true },

                /**
                 * Internal aggregation to show the addSection buttons if the edit property is enabled.
                 */
                _addSectionButtons: { type: "sap.m.Button", multiple: true, visibility: "hidden" },

                /**
                 * Internal aggregation to show the noSectionText.
                 */
                _noSectionText: { type: "sap.m.Text", multiple: false, visibility: "hidden" }
            },
            events: {

                /**
                 * Fires when the addSection Button is pressed.
                 */
                addSectionButtonPressed: {
                    parameters: {

                        /**
                         * The index the new section should be added.
                         */
                        index: { type: "int" }
                    }
                },

                /**
                 *  Fires when the sections are dropped on the page.
                 */
                sectionDrop: {
                    parameters: {

                        /**
                         * The section that was dragged.
                         */
                        draggedControl: { type: "sap.ushell.ui.launchpad.Section" },

                        /**
                         * The section where the dragged section was dropped.
                         */
                        droppedControl: { type: "sap.ushell.ui.launchpad.Section" },

                        /**
                         * A string defining from what direction the dragging happend.
                         */
                        dropPosition: { type: "string" }
                    }
                }
            }
        },
        renderer: PageRenderer
    });

    Page.prototype.init = function () {
        this.setAggregation("_noSectionText", new Text({
            text: resources.i18n.getText("Page.NoSectionText"),
            width: "100%",
            textAlign: TextAlign.Center
        }));

        this._oDragDropInfo = new DragDropInfo({
            sourceAggregation: "sections",
            targetAggregation: "sections",
            dropPosition: "Between",
            dragStart: function (oEvent) {
                // Do not allow to drag the default section
                if (oEvent.getParameter("target").getDefault()) {
                    oEvent.preventDefault();
                }
            },
            dragEnter: function (oEvent) {
                // Do not allow to drag on top of the default section
                if (oEvent.getParameter("target").getDefault()) {
                    oEvent.preventDefault();
                }
            },
            drop: function (oInfo) {
                this.fireSectionDrop(oInfo.getParameters());
            }.bind(this)
        });

        this.addDelegate({
            onsappageup: this._handleKeyboardPageNavigation.bind(this),
            onsappagedown: this._handleKeyboardPageNavigation.bind(this),
            onsapdown: this._handleKeyboardArrowNavigation.bind(this, false),
            onsapdownmodifiers: this._handleKeyboardArrowNavigation.bind(this, true),
            onsapup: this._handleKeyboardArrowNavigation.bind(this, false),
            onsapupmodifiers: this._handleKeyboardArrowNavigation.bind(this, true),
            onsaphome: this._handleKeyboardHomeEndNavigation.bind(this, false),
            onsaphomemodifiers: this._handleKeyboardHomeEndNavigation.bind(this, false),
            onsapend: this._handleKeyboardHomeEndNavigation.bind(this, true),
            onsapendmodifiers: this._handleKeyboardHomeEndNavigation.bind(this, true),

            onfocusin: this._saveFocus.bind(this),
            onsapskipback: this._handleSkipBack.bind(this),
            onsapskipforward: this._handleSkipForward.bind(this),
            onBeforeFastNavigationFocus: this._handleBeforeFastNavigationFocus.bind(this)
        });

        this._oSectionsChangeDetection = new ExtendedChangeDetection("sections", this);
        this._oSectionsChangeDetection.attachItemDeleted(this.invalidate, this);
        this._oSectionsChangeDetection.attachItemsReordered(this.invalidate, this);

        this._oInvisibleMessageInstance = InvisibleMessage.getInstance();
    };

    /**
     * Gets called on every focusin event within this control/ custom fastnavgroup.
     * Saves the last focused visualization and section to a private variable.
     * @param {sap.ui.base.Event} oEvent The event object
     *
     * @private
     * @since 1.80.0
     */
    Page.prototype._saveFocus = function (oEvent) {
        var oParentControl = oEvent.srcControl;

        // Section
        if (oParentControl.isA("sap.m.VBox")) {
            var oSection = oParentControl.getParent();
            if (oSection) {
                // check whether the last saved visualization is valid or not
                if (oSection.indexOfVisualization(this._oLastFocusedViz) === -1) {
                    this._oLastFocusedViz = oSection.getVisualizations()[0];
                    // this is only set if the focused section is empty
                    this._oLastFocusedSection = this._oLastFocusedViz ? undefined : oSection;
                }
            } else {
                this._oLastFocusedViz = undefined;
                this._oLastFocusedSection = undefined;
            }
        }
        // Visualization
        if (oParentControl.isA("sap.f.GridContainer")) {
            var aGridItems = oParentControl.getItems();
            var oVizControl = aGridItems.find(function (oControl) {
                var oDomRef = oControl.getDomRef();
                return oDomRef && oDomRef.parentNode === oEvent.target;
            });
            this._oLastFocusedViz = oVizControl;
            this._oLastFocusedSection = undefined;
        }
    };

    /**
     * Gets called on backward fast navigation within this control/ custom fastnavgroup
     * @param {sap.ui.base.Event} oEvent The event object
     *
     * @private
     * @since 1.80.0
     */
    Page.prototype._handleSkipBack = function (oEvent) {
        var oTarget;
        var oParentControl = oEvent.srcControl;
        // focus is on visualization and needs to move to the section
        if (oParentControl.isA("sap.f.GridContainer") && this.getEdit()) {
            oTarget = this._getAncestorSection(oParentControl);
        }

        if (oTarget) {
            oEvent.preventDefault();
            oTarget.focus();
        }
        // focus needs to move to the previous fastnavgroup
    };

    /**
     * Gets called on forward fast navigation within this control/ custom fastnavgroup
     * @param {sap.ui.base.Event} oEvent The event object
     *
     * @private
     * @since 1.80.0
     */
    Page.prototype._handleSkipForward = function (oEvent) {
        var oTarget;
        var oParentControl = oEvent.srcControl;
        // focus is on section and needs to move to the visualization
        if (oParentControl.isA("sap.m.VBox")) {
            var oSection = oParentControl.getParent();
            if (oSection) {
                // check whether the last focused viz is contained by the section
                if (oSection.indexOfVisualization(this._oLastFocusedViz) !== -1) {
                    oTarget = this._oLastFocusedViz;
                // default to the first visualization in the section
                } else {
                    oTarget = oSection.getVisualizations()[0];
                }
            }

            if (oTarget) {
                oEvent.preventDefault();
                oTarget.getDomRef().parentElement.focus();
            }
        }
        // focus needs to move to the next fastnavgroup
    };

    /**
     * Gets called when f6 handling is about to focus this control/ custom fastnavgroup
     * @param {sap.ui.base.Event} oEvent The event object
     *
     * @private
     * @since 1.80.0
     */
    Page.prototype._handleBeforeFastNavigationFocus = function (oEvent) {
        var aSections = this.getSections();
        var bEdit = this.getEdit();
        // There is a last focused viz / section

        // There is a last focused section
        if (bEdit && this._oLastFocusedSection) {
            this._oLastFocusedSection.focus();
            oEvent.preventDefault();
        // Focus moves from menuBar to page
        } else if (bEdit && oEvent.forward && this._oLastFocusedViz) {
            this._getAncestorSection(this._oLastFocusedViz).focus();
            oEvent.preventDefault();
        // There is a last focused viz
        } else if (this._oLastFocusedViz && this._oLastFocusedViz.getDomRef()) {
            this._oLastFocusedViz.getDomRef().parentElement.focus();
            oEvent.preventDefault();

        // There is no last focused viz / section

        // Focus moves from menuBar to page
        // Default to the first section
        } else if (bEdit && oEvent.forward && aSections.length) {
            aSections[0].focus();
            oEvent.preventDefault();
        // Focus moves from closeBar to page
        // Default to the first viz within the first section
        } else if (bEdit && !oEvent.forward && aSections.length) {
            if (aSections[0].getVisualizations().length === 0) {
                aSections[0].focus();
                oEvent.preventDefault();
            } else {
                aSections[0].getVisualizations()[0].getDomRef().parentElement.focus();
                oEvent.preventDefault();
            }

        // There are only visualizations in non edit mode
        // Therefore there is no differentiation based on direction needed
        } else {
            var oSection = aSections.find(function (section) {
                    return section.getDomRef() && section.getVisualizations().length;
                });
            oSection.getVisualizations()[0].getDomRef().parentElement.focus();
            oEvent.preventDefault();
        }
    };

    /**
     * Finds the ancestor section control of a control
     * @param {sap.ui.core.Control} oControl A control
     *
     * @returns {sap.ushell.ui.launchpad.Section} The parent section or null
     *
     * @private
     * @since 1.80.0
     */
    Page.prototype._getAncestorSection = function (oControl) {
        if (oControl.isA("sap.ushell.ui.launchpad.Section")) {
            return oControl;
        } else if (oControl.getParent) {
            return this._getAncestorSection(oControl.getParent());
        }
        return null;
    };

    Page.prototype.exit = function () {
        this._oDragDropInfo.destroy();
        this._oSectionsChangeDetection.destroy();
    };

    Page.prototype.onBeforeRendering = function () {
        var iNrOfSections = this.getSections().length,
            aAddSectionButtons = this.getAggregation("_addSectionButtons") || [],
            oAddSectionButton;

        // must always have at least one button (e.g. on an empty page/no sections)
        // on non-empty pages, index 0 button is hidden, so first visible button is index 1 then
        for (var i = aAddSectionButtons.length; i < iNrOfSections + 1; i++) {
            oAddSectionButton = new Button({
                type: ButtonType.Transparent,
                icon: "sap-icon://add",
                text: resources.i18n.getText("Page.Button.AddSection"),
                press: this.fireAddSectionButtonPressed.bind(this, { index: i })
            });
            oAddSectionButton.addStyleClass("sapUshellPageAddSectionButton");
            this.addAggregation("_addSectionButtons", oAddSectionButton);
        }
    };

    Page.prototype.getFocusDomRef = function () {
        var aAddSectionButtons = this.getAggregation("_addSectionButtons") || [];

        if (!this.getSections().length && aAddSectionButtons.length && this.getEdit()) {
            return aAddSectionButtons[0].getFocusDomRef();
        }
        return this.getDomRef();
    };

    Page.prototype.setEnableSectionReordering = function (value) {
        if (value === undefined || this.getEnableSectionReordering() === value) {
            return this;
        } else {
            this.setProperty("enableSectionReordering", !!value, true);

            if (value) {
                this.addDragDropConfig(this._oDragDropInfo);
            } else {
                this.removeDragDropConfig(this._oDragDropInfo);
            }

            return this;
        }
    };

    Page.prototype.setNoSectionsText = function (text) {
        if (text === undefined || this.getNoSectionsText() === text) {
            return this;
        } else {
            this.setProperty("noSectionsText", text, true);

            var oNoSectionText = this.getAggregation("_noSectionText");
            oNoSectionText.setText(text || resources.i18n.getText("Page.NoSectionText"));

            return this;
        }

    };

    /**
     * Handles the keyboard navigation of visualizations across sections.
     *
     * @param {object} oInfo An object that contains instructions on what to visualization to focus next.
     *
     * @private
     */
    Page.prototype._focusNextVisualization = function (oInfo) {
        var aSections = this.getSections(),
            iSectionIndex = this.indexOfSection(oInfo.section),
            oOrigEvent = oInfo.event.getParameter ? oInfo.event.getParameter("event") : oInfo.event,
            oDomRef = oOrigEvent.target.firstElementChild,
            oSection,
            bFocused;

        while (true) {
            if (oInfo.direction === "up") {
                iSectionIndex--;
            } else {
                iSectionIndex++;
            }

            oSection = aSections[iSectionIndex];
            if (!oSection) {
                return;
            }
            bFocused = oSection.focusVisualization({
                keycode: oOrigEvent.keyCode,
                ref: oDomRef
            });
            if (bFocused) {
                oOrigEvent.preventDefault();
                return;
            }
        }
    };

    /**
     * Handles the focus change of the page up & down keys.
     *
     * @param {jQuery.Event} oEvent The keyboard event.
     *
     * @private
     */
    Page.prototype._handleKeyboardPageNavigation = function (oEvent) {
        var aSections = this.getSections();

        for (var i = 0; i < aSections.length; i++) {
            var oSectionDomRef = aSections[i].getDomRef();

            if (oSectionDomRef.contains(window.document.activeElement)) {
                this._focusNextVisualization({
                    event: oEvent,
                    section: aSections[i],
                    direction: oEvent.type === "sappagedown" ? "down" : "up",
                    prefIndex: 0
                });
                return;
            }
        }
    };

    /**
     * Handles the reordering and focus change of the arrow keys.
     *
     * @param {boolean} bMove If a section should be moved.
     * @param {jQuery.Event} oEvent The keyboard event.
     *
     * @private
     */
    Page.prototype._handleKeyboardArrowNavigation = function (bMove, oEvent) {
        if ((bMove && !this.getEnableSectionReordering()) || (bMove && !oEvent.ctrlKey)) {
            return;
        }

        var aSections = this.getSections();

        for (var i = 0; i < aSections.length; i++) {
            if (window.document.activeElement === aSections[i].getFocusDomRef()) {
                if (oEvent.type === "sapup" && i > 0) {
                    aSections[i - 1].focus();
                } else if (oEvent.type === "sapdown" && (i + 1) < aSections.length) {
                    aSections[i + 1].focus();
                } else if (oEvent.type === "sapupmodifiers" && i > 0) {
                    if (aSections[i - 1].getDefault()) { // Do not drag over the default section
                        return;
                    }
                    this.fireSectionDrop({
                        draggedControl: aSections[i],
                        droppedControl: aSections[i - 1],
                        dropPosition: "Before"
                    });
                    oEvent.preventDefault();
                    oEvent.stopPropagation();
                    aSections[i - 1].focus();
                } else if (oEvent.type === "sapdownmodifiers" && (i + 1) < aSections.length) {
                    if (aSections[i].getDefault()) { // Do not drag the default section
                        return;
                    }
                    this.fireSectionDrop({
                        draggedControl: aSections[i],
                        droppedControl: aSections[i + 1],
                        dropPosition: "After"
                    });
                    oEvent.preventDefault();
                    oEvent.stopPropagation();
                    aSections[i + 1].focus();
                }
                return;
            }
        }
    };


    /**
     * checks if focus is in input field
     * @returns {boolean} true if focus is in Input field
     */
    Page.prototype._isFocusInInput = function () {
        var sTagName = (document.activeElement || {}).tagName;
        return sTagName === "INPUT" || sTagName === "TEXTAREA";
    };

    /**
     * Handles the home and end key focus change.
     *
     * @param {boolean} bLast If the last visualization should be focused.
     * @param {jQuery.Event} oEvent The keyboard event.
     *
     * @private
     */
    Page.prototype._handleKeyboardHomeEndNavigation = function (bLast, oEvent) {
        var aSections = this.getSections(),
            aVisualizations = [],
            bEdit = this.getEdit(),
            oSection;

        if (this._isFocusInInput()) {
            return;
        }

        for (var i = 0; i < aSections.length; i++) {
            if (oEvent.type === "saphomemodifiers" || oEvent.type === "sapendmodifiers") {
                oSection = aSections[i];
                if (oSection.getShowSection() || oSection.getEditable()) {
                    aVisualizations = aVisualizations.concat(oSection.getVisualizations());
                }
            } else if (bEdit && aSections[i].getDomRef().contains(window.document.activeElement)) {
                aVisualizations = aSections[i].getVisualizations();
                break;
            }
        }

        if (aVisualizations.length) {
            var oViz = bLast ? aVisualizations[aVisualizations.length - 1] : aVisualizations[0],
                oGridItem = oViz.getDomRef().parentNode;

            oGridItem.focus();
            oEvent.preventDefault();
            oEvent.stopPropagation();
        }
    };

    /**
     * Handles the borderReached event of a Section.
     *
     * @param {object} oInfo The borderReached event.
     *
     * @private
     */
    Page.prototype._handleSectionBorderReached = function (oInfo) {
        this._focusNextVisualization(oInfo.getParameters());
    };

    Page.prototype.addAggregation = function (sAggregationName, oObject) {
        Control.prototype.addAggregation.apply(this, arguments);

        if (sAggregationName === "sections") {
            oObject.attachEvent("borderReached", this._handleSectionBorderReached.bind(this));
        }

        return this;
    };

    Page.prototype.insertAggregation = function (sAggregationName, oObject/*, iIndex*/) {
        Control.prototype.insertAggregation.apply(this, arguments);

        if (sAggregationName === "sections") {
            oObject.attachEvent("borderReached", this._handleSectionBorderReached.bind(this));
        }

        return this;
    };

    Page.prototype.announceMove = function () {
        var sSectionMovedMessage = resources.i18n.getText("PageRuntime.Message.SectionMoved");
        this._oInvisibleMessageInstance.announce(sSectionMovedMessage, InvisibleMessageMode.Polite);
    };

    return Page;
});
