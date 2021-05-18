// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.footerbar.EndUserFeedback.
sap.ui.define([
    "sap/base/Log",
    "sap/m/ButtonRenderer", // will load the renderer async
    "sap/m/library",
    "sap/ui/core/Icon",
    "sap/ui/core/IconPool",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/ui/launchpad/AccessibilityCustomData",
    "sap/ushell/ui/launchpad/ActionItem",
    "sap/ushell/utils"
], function (
    Log,
    ButtonRenderer,
    mobileLibrary,
    Icon,
    IconPool,
    Device,
    JSONModel,
    jQuery,
    ushellLibrary,
    resources,
    AppConfiguration,
    AccessibilityCustomData,
    ActionItem,
    utils
) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    /**
     * Constructor for a new ui/footerbar/EndUserFeedback.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     * @class Add your documentation for the new ui/footerbar/EndUserFeedback
     * @extends sap.ushell.ui.launchpad.ActionItem
     * @constructor
     * @public
     * @name sap.ushell.ui.footerbar.EndUserFeedback
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var EndUserFeedback = ActionItem.extend("sap.ushell.ui.footerbar.EndUserFeedback", /** @lends sap.ushell.ui.footerbar.EndUserFeedback.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                showAnonymous: { type: "boolean", group: "Misc", defaultValue: true },
                anonymousByDefault: { type: "boolean", group: "Misc", defaultValue: true },
                showLegalAgreement: { type: "boolean", group: "Misc", defaultValue: true },
                showCustomUIContent: { type: "boolean", group: "Misc", defaultValue: true },
                feedbackDialogTitle: { type: "string", group: "Misc", defaultValue: null },
                textAreaPlaceholder: { type: "string", group: "Misc", defaultValue: null }
            },
            aggregations: {
                customUIContent: { type: "sap.ui.core.Control", multiple: true, singularName: "customUIContent" }
            }
        },
        renderer: "sap.m.ButtonRenderer"
    });

    /**
     * EndUserFeedbackButton
     *
     * @name sap.ushell.ui.footerbar.EndUserFeedback
     * @private
     * @since 1.26.0
     */
    EndUserFeedback.prototype.init = function () {
        //call the parent sap.m.Button init method
        if (ActionItem.prototype.init) {
            ActionItem.prototype.init.apply(this, arguments);
        }

        var userInfo = sap.ushell.Container.getUser(),
            sFormFactor = utils.getFormFactor();

        this.oUserDetails = {
            userId: userInfo.getId(),
            eMail: userInfo.getEmail()
        };
        this.translationBundle = resources.i18n;
        this.appConfiguration = AppConfiguration;
        // Set RndUserFeedback model.
        this.oEndUserFeedbackModel = new JSONModel();
        this.oEndUserFeedbackModel.setData({
            feedbackViewTitle: this.translationBundle.getText("userFeedback_title"),
            legalAgreementViewTitle: this.translationBundle.getText("userFeedbackLegal_title"),
            textAreaPlaceholderText: this.translationBundle.getText("feedbackPlaceHolderHeader"),
            presentationStates: {
                // When in 'init', the getters retrieve only their default values.
                showAnonymous: this.getShowAnonymous(),
                showLegalAgreement: this.getShowLegalAgreement(),
                showCustomUIContent: this.getShowCustomUIContent()
            },
            clientContext: {
                userDetails: jQuery.extend(true, {}, this.oUserDetails),
                navigationData: {
                    formFactor: sFormFactor,
                    applicationInformation: {},
                    navigationHash: null
                }
            },
            isAnonymous: this.getAnonymousByDefault(),
            applicationIconPath: "",
            leftButton: {
                feedbackView: this.translationBundle.getText("sendBtn"),
                legalAgreementView: this.translationBundle.getText("approveBtn")
            },
            rightButton: {
                feedbackView: this.translationBundle.getText("cancelBtn"),
                legalAgreementView: this.translationBundle.getText("declineBtn")
            },
            states: {
                isLegalAgreementChecked: false,
                isRatingSelected: false,
                isInFeedbackView: true
            },
            technicalLink: {
                state: 0, // 0 - hidden, 1- visible
                title: [
                    this.translationBundle.getText("technicalDataLink"),
                    this.translationBundle.getText("technicalDataLinkHide")
                ]
            },
            textArea: { inputText: "" },
            contextText: "",
            ratingButtons: [
                {
                    text: resources.i18n.getText("ratingExcellentText"),
                    color: "sapUshellRatingLabelFeedbackPositiveText",
                    iconSymbol: "sap-icon://BusinessSuiteInAppSymbols/icon-face-very-happy",
                    id: "rateBtn1",
                    index: 1
                }, {
                    text: resources.i18n.getText("ratingGoodText"),
                    color: "sapUshellRatingLabelFeedbackPositiveText",
                    iconSymbol: "sap-icon://BusinessSuiteInAppSymbols/icon-face-happy",
                    id: "rateBtn2",
                    index: 2
                }, {
                    text: resources.i18n.getText("ratingAverageText"),
                    color: "sapUshellRatingLabelFeedbackNeutralText",
                    iconSymbol: "sap-icon://BusinessSuiteInAppSymbols/icon-face-neutral",
                    id: "rateBtn3",
                    index: 3
                }, {
                    text: resources.i18n.getText("ratingPoorText"),
                    color: "sapUshellRatingLabelFeedbackCriticalText",
                    iconSymbol: "sap-icon://BusinessSuiteInAppSymbols/icon-face-bad",
                    id: "rateBtn4",
                    index: 4
                }, {
                    text: resources.i18n.getText("ratingVeyPoorText"),
                    color: "sapUshellRatingLabelFeedbackNegativeText",
                    iconSymbol: "sap-icon://BusinessSuiteInAppSymbols/icon-face-very-bad",
                    id: "rateBtn5",
                    index: 5
                }
            ],
            selectedRating: {
                text: "",
                color: "",
                index: 0
            }
        });

        this.setIcon("sap-icon://marketing-campaign");
        this.setText(resources.i18n.getText("endUserFeedbackBtn"));
        this.attachPress(this.ShowEndUserFeedbackDialog);
        this.setEnabled(); // disables button if shell not initialized
    };

    EndUserFeedback.prototype.ShowEndUserFeedbackDialog = function () {
        sap.ui.require([
            "sap/ui/layout/form/SimpleForm",
            "sap/ui/layout/form/SimpleFormLayout",
            "sap/ui/layout/HorizontalLayout",
            "sap/ui/layout/VerticalLayout",
            "sap/m/TextArea",
            "sap/m/Link",
            "sap/m/Label",
            "sap/m/Text",
            "sap/m/Dialog",
            "sap/m/Button",
            "sap/m/Image",
            "sap/m/Bar",
            "sap/m/SegmentedButton",
            "sap/m/SegmentedButtonItem",
            "sap/m/CheckBox"
        ], function (
            SimpleForm,
            SimpleFormLayout,
            HorizontalLayout,
            VerticalLayout,
            TextArea,
            Link,
            Label,
            Text,
            Dialog,
            Button,
            Image,
            Bar,
            SegmentedButton,
            SegmentedButtonItem,
            CheckBox
        ) {
            var getTechnicalInfoContent,
                createTechnicalDataContent,
                showLegalAgreementInfo,
                createLegalAgreementLayout,
                updateTechnicalInfo,
                sModulePath,
                sDefaultLogo,
                bIsDesktop;

            this.oEndUserFeedbackService = sap.ushell.Container.getService("EndUserFeedback");

            // eslint-disable-next-line complexity
            getTechnicalInfoContent = function () {
                var aFormContent = [],
                    sFormFactor = this.oEndUserFeedbackModel.getProperty("/clientContext/navigationData/formFactor"),
                    sUserId = this.oEndUserFeedbackModel.getProperty("/clientContext/userDetails/userId"),
                    sEmail = this.oEndUserFeedbackModel.getProperty("/clientContext/userDetails/eMail"),
                    sAppUrl = this.oEndUserFeedbackModel.getProperty("/clientContext/navigationData/applicationInformation/url"),
                    sAppType = this.oEndUserFeedbackModel.getProperty("/clientContext/navigationData/applicationInformation/applicationType"),
                    sAppAdditionalInfo = this.oEndUserFeedbackModel.getProperty("/clientContext/navigationData/applicationInformation/additionalInformation"),
                    sNavHash = this.oEndUserFeedbackModel.getProperty("/clientContext/navigationData/navigationHash"),
                    currentPage = this.getModel().getProperty("/currentState/stateName"),
                    bDisplayData = !(currentPage === "home" || currentPage === "catalog");

                aFormContent.push(new Text({ text: this.translationBundle.getText("loginDetails") }).addStyleClass("sapUshellContactSupportHeaderInfoText"));
                aFormContent.push(sUserId ? new Label({ text: this.translationBundle.getText("userFld") }) : null);
                aFormContent.push(sUserId ? new Text("technicalInfoUserIdTxt", { text: "{/clientContext/userDetails/userId}" }) : null);
                aFormContent.push(sEmail ? new Label({ text: this.translationBundle.getText("eMailFld") }) : null);
                aFormContent.push(sEmail ? new Text({ text: "{/clientContext/userDetails/eMail}" }) : null);
                aFormContent.push(sFormFactor ? new Label({ text: this.translationBundle.getText("formFactorFld") }) : null);
                aFormContent.push(sFormFactor ? new Text({ text: "{/clientContext/navigationData/formFactor}" }) : null);
                // Required to align the following Text under the same column.
                aFormContent.push(new Text({ text: "" }));
                aFormContent.push(new Text({
                    text: this.translationBundle.getText(this.currentApp ? "applicationInformationFld" : "feedbackHeaderText")
                }).addStyleClass("sapUshellEndUserFeedbackHeaderInfoText").addStyleClass("sapUshellEndUserFeedbackInfoTextSpacing"));
                aFormContent.push(sAppUrl && bDisplayData ? new Label({ text: this.translationBundle.getText("urlFld") }) : null);
                aFormContent.push(sAppUrl && bDisplayData ? new Text({ text: "{/clientContext/navigationData/applicationInformation/url}" }) : null);
                aFormContent.push(sAppType ? new Label({ text: this.translationBundle.getText("applicationTypeFld") }) : null);
                aFormContent.push(sAppType ? new Text({ text: "{/clientContext/navigationData/applicationInformation/applicationType}" }) : null);
                aFormContent.push(sAppAdditionalInfo ? new Label({ text: this.translationBundle.getText("additionalInfoFld") }) : null);
                aFormContent.push(sAppAdditionalInfo ? new Text({ text: "{/clientContext/navigationData/applicationInformation/additionalInformation}" }) : null);
                aFormContent.push(sNavHash && bDisplayData ? new Label({ text: this.translationBundle.getText("hashFld") }) : null);
                aFormContent.push(sNavHash && bDisplayData ? new Text({ text: "{/clientContext/navigationData/navigationHash}" }) : null);

                return aFormContent.filter(Boolean);
            }.bind(this);

            createTechnicalDataContent = function () {
                this.oTechnicalInfoBox = new SimpleForm("feedbackTechnicalInfoBox", {
                    layout: SimpleFormLayout.ResponsiveLayout,
                    content: getTechnicalInfoContent()
                });
                if (Device.os.ios && Device.system.phone) {
                    this.oTechnicalInfoBox.addStyleClass("sapUshellContactSupportFixWidth");
                }

                var originalAfterRenderSimpleForm = this.oTechnicalInfoBox.onAfterRendering;
                this.oTechnicalInfoBox.onAfterRendering = function () {
                    originalAfterRenderSimpleForm.apply(this, arguments);
                    var node = jQuery(this.getDomRef());
                    node.attr("tabIndex", 0);
                    setTimeout(function () {
                        this.focus();
                    }.bind(node), 700);
                };
                return new HorizontalLayout("technicalInfoBoxLayout", {
                    visible: {
                        path: "/technicalLink/state",
                        formatter: function (state) {
                            return state === 1;
                        }
                    },
                    content: [this.oTechnicalInfoBox]
                });
            }.bind(this);

            updateTechnicalInfo = function () {
                this.oTechnicalInfoBox.destroyContent();
                this.oTechnicalInfoBox.removeAllContent();
                var aTechnicalInfoContent = getTechnicalInfoContent(),
                    contentIndex;

                for (contentIndex in aTechnicalInfoContent) {
                    this.oTechnicalInfoBox.addContent(aTechnicalInfoContent[contentIndex]);
                }
                this.oRatingButtons.setSelectedButton("none");
            }.bind(this);

            sModulePath = sap.ui.require.toUrl("sap/ushell");
            sDefaultLogo = sModulePath + "/themes/base/img/launchpadDefaultIcon.jpg";
            bIsDesktop = this.oEndUserFeedbackModel.getProperty("/clientContext/navigationData/formFactor") === "desktop";

            this.updateModelContext();
            if (this.oDialog) {
                updateTechnicalInfo();
                this.oDialog.open();
                return;
            }

            this.oLegalAgreementInfoLayout = null;
            this.oPopoverTitle = new Text("PopoverTitle", {
                text: {
                    parts: [
                        { path: "/states/isInFeedbackView" },
                        { path: "/feedbackViewTitle" }
                    ],
                    formatter: function (bIsInFeedbackView) {
                        return this.oEndUserFeedbackModel.getProperty(bIsInFeedbackView ? "/feedbackViewTitle" : "/legalAgreementViewTitle");
                    }.bind(this)
                }
            });
            this.oBackButton = new Button("endUserFeedbackBackBtn", {
                visible: {
                    path: "/states/isInFeedbackView",
                    formatter: function (oIsInFeedbackView) {
                        return !oIsInFeedbackView;
                    }
                },
                icon: IconPool.getIconURI("nav-back"),
                press: function () {
                    this.oEndUserFeedbackModel.setProperty("/states/isInFeedbackView", true);
                    this.bBackNavigationHappened = true;
                }.bind(this),
                tooltip: resources.i18n.getText("feedbackGoBackBtn_tooltip"),
                ariaDescribedBy: this.oPopoverTitle
            });
            this.oHeadBar = new Bar({
                contentLeft: [this.oBackButton],
                contentMiddle: [this.oPopoverTitle]
            });
            this.oLogoImg = new Image("sapFeedbackLogo", {
                src: sDefaultLogo,
                width: "4.5rem",
                height: "4.5rem",
                visible: {
                    path: "/applicationIconPath",
                    formatter: function (applicationIconPath) {
                        return !applicationIconPath;
                    }
                }
            });
            this.oAppIcon = new Icon("sapFeedbackAppIcon", {
                src: "{/applicationIconPath}",
                width: "4.5rem",
                height: "4.5rem",
                visible: {
                    path: "/applicationIconPath",
                    formatter: function (applicationIconPath) {
                        return !!applicationIconPath;
                    }
                }
            }).addStyleClass("sapUshellFeedbackAppIcon");
            this.oContextName = new Text("contextName", { text: "{/contextText}" });
            this.oContextLayout = new HorizontalLayout("contextLayout", { allowWrapping: true, content: [this.oLogoImg, this.oAppIcon, this.oContextName] });
            this.oRatingLabel = new Label("ratingLabel", { required: true, text: resources.i18n.getText("ratingLabelText") });
            this.oRatingSelectionText = new Text("ratingSelectionText", {
                text: {
                    path: "/selectedRating",
                    formatter: function (oSelectedRating) {
                        if (this.lastSelectedColor) {
                            this.removeStyleClass(this.lastSelectedColor);
                        }
                        if (oSelectedRating.color) {
                            this.addStyleClass(oSelectedRating.color);
                        }
                        this.lastSelectedColor = oSelectedRating.color;

                        return oSelectedRating.text;
                    }
                }
            });

            this.oRatingButtonTemplate = new SegmentedButtonItem({ icon: "{iconSymbol}", height: "100%", width: "20%", tooltip: "{text}" });
            // Add support for screen readers.
            this.oRatingButtonTemplate.addCustomData(new AccessibilityCustomData({
                key: "aria-label",
                value: "{text}",

                writeToDom: true
            }));
            this.oRatingButtons = new SegmentedButton("ratingButton", {
                items: {
                    path: "/ratingButtons",
                    template: this.oRatingButtonTemplate
                },
                selectionChange: function (oEvt) {
                    var sPath = oEvt.getParameters().item.getBindingContext().getPath(),
                        oButtonContext = this.oEndUserFeedbackModel.getProperty(sPath);

                    this.oEndUserFeedbackModel.setProperty("/selectedRating", { text: oButtonContext.text, color: oButtonContext.color, index: oButtonContext.index });
                    this.oEndUserFeedbackModel.setProperty("/states/isRatingSelected", true);
                }.bind(this),
                width: "100%"
            });
            this.oRatingButtons.setSelectedButton("none");
            this.oRatingButtons.addAriaLabelledBy("ratingLabel");
            this.oRatingButtons.addCustomData(new AccessibilityCustomData({
                key: "aria-required",
                value: "true",
                writeToDom: true
            }));

            if (bIsDesktop) {
                this.oRatingIndicationLayout = new HorizontalLayout("ratingIndicationLayout", { content: [this.oRatingLabel, this.oRatingSelectionText] });
            } else {
                this.oRatingIndicationLayout = new VerticalLayout("ratingIndicationLayoutMob", { content: [this.oRatingLabel, this.oRatingSelectionText] });
            }
            this.oRatingLayout = new VerticalLayout("ratingLayout", {
                width: "100%",
                content: [this.oRatingIndicationLayout, this.oRatingButtons]
            });

            this.oAnonymousCheckbox = new CheckBox("anonymousCheckbox", {
                name: "anonymousCheckbox",
                visible: "{/presentationStates/showAnonymous}",
                text: resources.i18n.getText("feedbackSendAnonymousText"),
                selected: !this.oEndUserFeedbackModel.getProperty("/isAnonymous"),
                select: function (oEvent) {
                    var bChecked = oEvent.getParameter("selected");
                    this._handleAnonymousSelection(!bChecked);
                }.bind(this)
            });
            var isAnonymous = (!this.oEndUserFeedbackModel.getProperty("/presentationStates/showAnonymous") || this.oEndUserFeedbackModel.getProperty("/isAnonymous"));
            this._handleAnonymousSelection(isAnonymous);

            this.oLegalAgreementCheckbox = new CheckBox("legalAgreement", {
                name: "legalAgreement",
                visible: "{/presentationStates/showLegalAgreement}",
                selected: "{/states/isLegalAgreementChecked}",
                text: this.translationBundle.getText("agreementAcceptanceText")
            });
            this.oLegalAgreementLink = new Link("legalAgreementLink", {
                text: this.translationBundle.getText("legalAgreementLinkText"),
                visible: "{/presentationStates/showLegalAgreement}",
                press: function () {
                    var oPromise = this.oEndUserFeedbackService.getLegalText();

                    oPromise.done(showLegalAgreementInfo.bind(this));
                }.bind(this)
            });

            // When backnavigating, the focus should still be on the link
            // to be able to set the focus correctly, we add an event handler.
            this.oLegalAgreementLink.addEventDelegate({
                onAfterRendering: function () {
                    if (this.bBackNavigationHappened) {
                        this.oLegalAgreementLink.focus();
                    }
                }.bind(this)
            });
            this.aCustomUIContent = jQuery.extend([], this.getCustomUIContent());
            this.oCustomUILayout = new VerticalLayout("customUILayout", {
                visible: {
                    path: "/presentationStates/showCustomUIContent",
                    formatter: function (bShowCustomUIContent) {
                        return !(bShowCustomUIContent && this.aCustomUIContent.length);
                    }.bind(this)
                },
                content: this.getCustomUIContent(),
                width: "100%"
            });
            this.oLegalLayout = new VerticalLayout("legalLayout", { content: [this.oAnonymousCheckbox, this.oLegalAgreementCheckbox, this.oLegalAgreementLink] });
            this.oTechnicalDataLink = new Link("technicalDataLink", {
                text: {
                    path: "/technicalLink/state",
                    formatter: function (oState) {
                        return this.getModel().getProperty("/technicalLink/title/" + oState);
                    }
                },
                press: function () {
                    var _state = this.oEndUserFeedbackModel.getProperty("/technicalLink/state");
                    this.oEndUserFeedbackModel.setProperty("/technicalLink/state", Math.abs(_state - 1));
                    this.oDialog.rerender();
                }.bind(this)
            });
            this.oTechnicalDataLayout = new HorizontalLayout("technicalDataLayout", { content: [this.oTechnicalDataLink] });
            this.leftButton = new Button("EndUserFeedbackLeftBtn", {
                text: {
                    path: "/states/isInFeedbackView",
                    formatter: function (bIsInFeedbackView) {
                        return this.getModel().getProperty("/leftButton/" + (bIsInFeedbackView ? "feedbackView" : "legalAgreementView"));
                    }
                },
                enabled: {
                    parts: [
                        { path: "/states/isInFeedbackView" },
                        { path: "/states/isLegalAgreementChecked" },
                        { path: "/states/isRatingSelected" },
                        { path: "/presentationStates/showLegalAgreement" }
                    ],
                    formatter: function (bIsInFeedbackView, bIsLegalAgreementChecked, bIsRatingSelected, bShowLegalAgreement) {
                        return !bIsInFeedbackView || (bIsRatingSelected && (bIsLegalAgreementChecked || !bShowLegalAgreement));
                    }
                },
                type: ButtonType.Emphasized,
                press: function () {
                    var bIsInFeedbackView = this.oEndUserFeedbackModel.getProperty("/states/isInFeedbackView");

                    if (bIsInFeedbackView) {
                        var oFeedbackObject = {
                            feedbackText: this.oEndUserFeedbackModel.getProperty("/textArea/inputText"),
                            ratings: [
                                {
                                    questionId: "Q10",
                                    value: this.oEndUserFeedbackModel.getProperty("/selectedRating/index")
                                }
                            ],
                            clientContext: this.oEndUserFeedbackModel.getProperty("/clientContext"),
                            isAnonymous: this.oEndUserFeedbackModel.getProperty("/isAnonymous")
                        },
                            promise = this.oEndUserFeedbackService.sendFeedback(oFeedbackObject);

                        promise.done(function () {
                            sap.ushell.Container.getServiceAsync("Message").then(function (oMessageService) {
                                oMessageService.info(this.translationBundle.getText("feedbackSendToastTxt"));
                            }.bind(this));
                        }.bind(this));
                        promise.fail(function () {
                            sap.ushell.Container.getServiceAsync("Message").then(function (oMessageService) {
                                oMessageService.error(this.translationBundle.getText("feedbackFailedToastTxt"));
                            }.bind(this));
                        }.bind(this));
                        this.oDialog.close();
                    } else {
                        this.oEndUserFeedbackModel.setProperty("/states/isInFeedbackView", true);
                        this.oEndUserFeedbackModel.setProperty("/states/isLegalAgreementChecked", true);
                    }
                }.bind(this)
            });
            this.rightButton = new Button("EndUserFeedbackRightBtn", {
                text: {
                    path: "/states/isInFeedbackView",
                    formatter: function (bIsInFeedbackView) {
                        return this.getModel().getProperty("/rightButton/" + (bIsInFeedbackView ? "feedbackView" : "legalAgreementView"));
                    }
                },
                press: function () {
                    var bIsInFeedbackView = this.oEndUserFeedbackModel.getProperty("/states/isInFeedbackView");
                    if (bIsInFeedbackView) {
                        this.oDialog.close();
                    } else {
                        this.oEndUserFeedbackModel.setProperty("/states/isInFeedbackView", true);
                        this.oEndUserFeedbackModel.setProperty("/states/isLegalAgreementChecked", false);
                    }
                }.bind(this)
            });
            this.oTextArea = new TextArea("feedbackTextArea", {
                rows: 6,
                value: "{/textArea/inputText}",
                placeholder: "{/textAreaPlaceholderText}"
            });
            this.oDialog = new Dialog({
                id: "UserFeedbackDialog",
                contentWidth: "25rem",
                leftButton: this.leftButton,
                rightButton: this.rightButton,
                stretch: Device.system.phone,
                initialFocus: "ratingButton",
                afterOpen: function () {
                    // Fix ios 7.1 bug in ipad4 where there is a gray box on the screen when you close the keyboards
                    jQuery("#textArea").on("focusout", function () {
                        window.scrollTo(0, 0);
                    });
                },
                afterClose: function () {
                    if (window.document.activeElement && window.document.activeElement.tagName === "BODY") {
                        window.document.getElementById("meAreaHeaderButton").focus();
                    }
                    // This ensures that the dialog will re-open on the Feedback view if closed on the legal one.
                    this.oEndUserFeedbackModel.setProperty("/states/isInFeedbackView", true);
                }.bind(this)
            }).addStyleClass("sapUshellEndUserFeedbackDialog").addStyleClass("sapContrastPlus");
            this.oDialog.setModel(this.oEndUserFeedbackModel);
            this.oDialog.setCustomHeader(this.oHeadBar);
            this.oDialog.addCustomData(new AccessibilityCustomData({
                key: "aria-label",
                value: this.translationBundle.getText("endUserFeedbackAreaLabel"),
                writeToDom: true
            }));
            this.oTechnicalInfoBoxLayout = createTechnicalDataContent();
            this.oFeedbackLayout = new VerticalLayout("feedbackLayout", {
                visible: "{/states/isInFeedbackView}",
                content: [this.oContextLayout, this.oRatingLayout, this.oTextArea, this.oTechnicalDataLayout, this.oTechnicalInfoBoxLayout, this.oLegalLayout, this.oCustomUILayout]
            }).addStyleClass("sapUshellFeedbackLayout");
            this.oMainLayout = new VerticalLayout("mainLayout", { editable: false, content: [this.oFeedbackLayout] });
            this.oDialog.addContent(this.oMainLayout);
            this.oDialog.open();

            showLegalAgreementInfo = function (sLegalAgreementText) {
                this.oEndUserFeedbackModel.setProperty("/states/isInFeedbackView", false);

                if (!this.oLegalAgreementInfoLayout) { // if not initialized yet
                    createLegalAgreementLayout(sLegalAgreementText);
                } else {
                    this.oBackButton.focus();
                }
            };

            createLegalAgreementLayout = function (sLegalAgreementText) {
                this.oLegalText = new TextArea("legalText", { cols: 50, rows: 22 });
                this.oLegalText.setValue([sLegalAgreementText]);
                this.oLegalText.setEditable(false);
                var origLegalTextOnAfterRendering = this.oLegalText.onAfterRendering;
                var oBackButton = this.oBackButton;
                this.oLegalText.onAfterRendering = function () {
                    if (origLegalTextOnAfterRendering) {
                        origLegalTextOnAfterRendering.apply(this, arguments);
                    }
                    var jqLegalText = jQuery(this.getDomRef());
                    jqLegalText.find("textarea").attr("tabindex", "0");
                    oBackButton.focus();
                };
                this.oLegalAgreementInfoLayout = new VerticalLayout("legalAgreementInfoLayout", {
                    visible: {
                        path: "/states/isInFeedbackView",
                        formatter: function (bIsInFeedbackView) {
                            return !bIsInFeedbackView;
                        }
                    },
                    content: [this.oLegalText]
                });
                this.oMainLayout.addContent(this.oLegalAgreementInfoLayout);
            }.bind(this);
        }.bind(this));
    };

    EndUserFeedback.prototype._handleAnonymousSelection = function (bIsAnonymous) {
        var anonymousTxt = this.translationBundle.getText("feedbackAnonymousTechFld");

        this.oEndUserFeedbackModel.setProperty("/isAnonymous", bIsAnonymous);
        this.oEndUserFeedbackModel.setProperty("/clientContext/userDetails/eMail", bIsAnonymous ? anonymousTxt : this.oUserDetails.eMail);
        this.oEndUserFeedbackModel.setProperty("/clientContext/userDetails/userId", bIsAnonymous ? anonymousTxt : this.oUserDetails.userId);
    };

    EndUserFeedback.prototype.addCustomUIContent = function (oControl) {
        var isLegalControl = oControl && oControl.getMetadata && oControl.getMetadata().getStereotype && oControl.getMetadata().getStereotype() === "control";

        if (isLegalControl) {
            if (this.getShowCustomUIContent()) {
                this.oEndUserFeedbackModel.setProperty("/presentationStates/showCustomUIContent", true);
            }
            this.addAggregation("customUIContent", oControl);
        }
    };

    EndUserFeedback.prototype.setShowAnonymous = function (bValue) {
        if (typeof bValue === "boolean") {
            this.oEndUserFeedbackModel.setProperty("/presentationStates/showAnonymous", bValue);
            this.setProperty("showAnonymous", bValue, true);
        }
    };

    EndUserFeedback.prototype.setAnonymousByDefault = function (bValue) {
        if (typeof bValue === "boolean") {
            this.oEndUserFeedbackModel.setProperty("/isAnonymous", bValue);
            this.setProperty("anonymousByDefault", bValue, true);
        }
    };

    EndUserFeedback.prototype.setShowLegalAgreement = function (bValue) {
        if (typeof bValue === "boolean") {
            this.oEndUserFeedbackModel.setProperty("/presentationStates/showLegalAgreement", bValue);
            this.setProperty("showLegalAgreement", bValue, true);
        }
    };

    EndUserFeedback.prototype.setShowCustomUIContent = function (bValue) {
        if (typeof bValue === "boolean") {
            this.oEndUserFeedbackModel.setProperty("/presentationStates/showCustomUIContent", bValue);
            this.setProperty("showCustomUIContent", bValue, true);
        }
    };

    EndUserFeedback.prototype.setFeedbackDialogTitle = function (sValue) {
        if (typeof sValue === "string") {
            this.oEndUserFeedbackModel.setProperty("/feedbackViewTitle", sValue);
            this.setProperty("feedbackDialogTitle", sValue, true);
        }
    };

    EndUserFeedback.prototype.setTextAreaPlaceholder = function (sValue) {
        if (typeof sValue === "string") {
            this.oEndUserFeedbackModel.setProperty("/textAreaPlaceholderText", sValue);
            this.setProperty("textAreaPlaceholder", sValue, true);
        }
    };

    EndUserFeedback.prototype.updateModelContext = function () {
        var oURLParsing = sap.ushell.Container.getService("URLParsing"),
            sHash,
            oParsedHash,
            sIntent,
            currentPage,
            sourcePage,
            sUrlText;

        // Extract the intent from the current URL.
        // If no hash exists then the intent is set to an empty string
        sHash = oURLParsing.getShellHash(window.location);
        oParsedHash = oURLParsing.parseShellHash(sHash);
        sIntent = (oParsedHash !== undefined) ? oParsedHash.semanticObject + "-" + oParsedHash.action : "";
        currentPage = this.getModel().getProperty("/currentState/stateName");
        if (currentPage === "home" || currentPage === "catalog") {
            sourcePage = this.translationBundle.getText(currentPage + "_title");
        }

        this.currentApp = this.appConfiguration.getCurrentApplication();
        this.bHasAppName = (this.currentApp && this.appConfiguration.getMetadata(this.currentApp) && this.appConfiguration.getMetadata(this.currentApp).title);
        this.sAppIconPath = (this.currentApp && this.appConfiguration.getMetadata(this.currentApp) && this.appConfiguration.getMetadata(this.currentApp).icon);
        this.oEndUserFeedbackModel.setProperty("/contextText", this.bHasAppName ? this.appConfiguration.getMetadata(this.currentApp).title : this.translationBundle.getText("feedbackHeaderText"));

        sUrlText = null;
        if (this.currentApp && this.currentApp.url) {
            sUrlText = this.currentApp.url.split("?")[0];
        } else if (currentPage) {
            sUrlText = this.translationBundle.getText("flp_page_name");
        }
        this.oEndUserFeedbackModel.setProperty("/clientContext/navigationData/applicationInformation", {
            url: sUrlText,
            additionalInformation: (this.currentApp && this.currentApp.additionalInformation) ? this.currentApp.additionalInformation : null,
            applicationType: (this.currentApp && this.currentApp.applicationType) ? this.currentApp.applicationType : null
        });

        this.oEndUserFeedbackModel.setProperty("/clientContext/navigationData/navigationHash", sourcePage || sIntent);
        this.oEndUserFeedbackModel.setProperty("/selectedRating", { text: "", color: "", index: 0 });
        this.oEndUserFeedbackModel.setProperty("/states/isRatingSelected", false);
        this.oEndUserFeedbackModel.setProperty("/states/isLegalAgreementChecked", false);
        this.oEndUserFeedbackModel.setProperty("/technicalLink/state", 0);
        this.oEndUserFeedbackModel.setProperty("/textArea/inputText", "");
        this.oEndUserFeedbackModel.setProperty("/applicationIconPath", this.sAppIconPath);
        this._handleAnonymousSelection(this.oEndUserFeedbackModel.getProperty("/isAnonymous"));
    };

    EndUserFeedback.prototype.setEnabled = function (bEnabled) {
        if (!sap.ushell.Container) {
            if (this.getEnabled()) {
                Log.warning(
                    "Disabling 'End User Feedback' button: unified shell container not initialized",
                    null,
                    "sap.ushell.ui.footerbar.EndUserFeedback"
                );
            }
            bEnabled = false;
        }
        ActionItem.prototype.setEnabled.call(this, bEnabled);
    };

    return EndUserFeedback;
});
