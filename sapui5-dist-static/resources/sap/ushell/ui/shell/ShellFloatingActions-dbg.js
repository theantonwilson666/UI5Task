// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources",
    "./ShellFloatingAction"
], function (
    Control,
    jQuery,
    ushellLibrary,
    resources,
    ShellFloatingAction
) {
    "use strict";

    var ShellFloatingActions = Control.extend("sap.ushell.ui.shell.ShellFloatingActions", {
        metadata: {
            properties: {
                isFooterVisible: { type: "boolean", defaultValue: false }
            },
            aggregations: {
                floatingActions: { type: "sap.ushell.ui.shell.ShellFloatingAction", multiple: true, singularName: "floatingAction" }
            }
        },

        renderer: {
            render: function (oRm, oActionButtonManager) {
                var aFloatingActions = oActionButtonManager.getFloatingActions();
                oRm.write("<div");
                oRm.writeControlData(oActionButtonManager);
                oRm.addClass("sapUshellShellFloatingActions");
                oRm.writeClasses();
                oRm.write(">");
                if (aFloatingActions.length) {
                    var oFloatingAction;

                    if (aFloatingActions.length === 1) {
                        oFloatingAction = aFloatingActions[0];
                    } else {
                        oFloatingAction = oActionButtonManager._createMultipleFloatingActionsButton(aFloatingActions);
                        jQuery.each(aFloatingActions, function () {
                            this.setVisible(false);
                            oRm.renderControl(this);
                        });
                    }
                    oRm.renderControl(oFloatingAction);
                }
                oRm.write("</div>");
            }
        }
    });

    ShellFloatingActions.prototype._createMultipleFloatingActionsButton = function (aFloatingActions) {
        var iFloatingActionHeight;
        var that = this;
        return new ShellFloatingAction({
            id: this.getId() + "-multipleFloatingActions",
            icon: "sap-icon://add",
            visible: true,
            press: function () {
                if (!this.hasStyleClass("sapUshellShellFloatingActionRotate")) {
                    this.addStyleClass("sapUshellShellFloatingActionRotate");
                    if (!iFloatingActionHeight) {
                        iFloatingActionHeight = parseInt(this.$().outerHeight(), 10) + parseInt(that.$().css("bottom"), 10);
                    }

                    aFloatingActions.forEach(function (oFloatingButton) {
                        oFloatingButton.setVisible(true);
                    });

                    setTimeout(function () {
                        aFloatingActions.forEach(function (oFloatingButton, iIndex) {
                            var itemY = iFloatingActionHeight * (iIndex + 1);
                            oFloatingButton.$().css("transform", "translateY(-" + itemY + "px)");
                            oFloatingButton.data("transformY", "-" + itemY + "px");
                        });
                    }, 0);
                } else {
                    this.removeStyleClass("sapUshellShellFloatingActionRotate");

                    aFloatingActions.forEach(function (oFloatingButton) {
                        oFloatingButton.$().css("transform", "translateY(0)");
                    });

                    setTimeout(function () {
                        aFloatingActions.forEach(function (oFloatingButton) {
                            oFloatingButton.setVisible(false);
                            oFloatingButton.data("transformY", undefined);
                        });
                    }, 150);
                }
            },
            tooltip: resources.i18n.getText("XXX")
        });
    };

    ShellFloatingActions.prototype.addFloatingAction = function (oActionButton) {
        this.addAggregation("floatingActions", oActionButton, true);
        if (this.getDomRef()) {
            var rm = sap.ui.getCore().createRenderManager();
            rm.renderControl(oActionButton);
            rm.flush(this.getDomRef());
            rm.destroy();
        }
        return this;
    };

    ShellFloatingActions.prototype.removeFloatingAction = function (oActionButton) {
        if (typeof oActionButton === "number") {
            oActionButton = this.getAggregation("floatingActions")[oActionButton];
        }
        this.removeAggregation("floatingActions", oActionButton, true);
        var sId = oActionButton.getId();
        jQuery("#" + sId).remove();
        return this;
    };

    return ShellFloatingActions;
});
