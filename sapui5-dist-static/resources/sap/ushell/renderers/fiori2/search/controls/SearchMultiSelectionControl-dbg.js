// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
// iteration 0 : Holger

sap.ui.define([
    "sap/ushell/library" // css style dependency
], function () {
    "use strict";

    return sap.ui.core.Control.extend("sap.ushell.renderers.fiori2.search.controls.SearchMultiSelectionControl", {
        metadata: {
            properties: {
                resultList: "object"
            },
            aggregations: {
                actions: "object"
            }
        },

        renderer: function (oRm, oControl) {
            oRm.write("<div");
            oRm.writeControlData(oControl); // writes the Control ID
            oRm.addClass("sapUshellSearchResultList-MultiSelectionControl");
            oRm.writeClasses();
            oRm.write(">");

            oControl._renderer(oRm);

            oRm.write("</div>");
        },

        _renderer: function (oRm) {
            var that = this;

            var editButton = new sap.m.ToggleButton({
                icon: "sap-icon://multi-select",
                tooltip: sap.ushell.resources.i18n.getText("toggleSelectionModeBtn"),
                press: function () {
                    if (this.getPressed()) {
                        that.getResultList.enableSelectionMode();
                        that.getModel().setProperty("/multiSelectionEnabled", true);
                    } else {
                        that.getResultList.disableSelectionMode();
                        that.getModel().setProperty("/multiSelectionEnabled", false);
                    }
                },
                visible: false, //                 visible: {
                //                     parts: [{
                //                         path: '/multiSelectionAvailable'
                //                     }],
                //                     formatter: function(length) {
                //                         return length > 0;
                //                     },
                //                     mode: sap.ui.model.BindingMode.OneWay
                //                 }

                pressed: {
                    parts: [{
                        path: "/multiSelectionEnabled"
                    }],
                    formatter: function (length) {
                        return length > 0;
                    },
                    mode: sap.ui.model.BindingMode.OneWay
                }
            });
            editButton.setModel(that.getModel());
            editButton.addStyleClass("sapUshellSearchResultList-toggleMultiSelectionButton");

            oRm.renderControl(editButton);
        }
    });

});
