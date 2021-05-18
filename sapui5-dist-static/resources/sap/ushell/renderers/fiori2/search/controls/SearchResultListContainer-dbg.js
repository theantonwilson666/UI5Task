// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/library" // css style dependency
], function () {
    "use strict";

    return sap.ui.core.Control.extend("sap.ushell.renderers.fiori2.search.controls.SearchResultListContainer", {

        init: function () {
            // define group for F6 handling
            this.data("sap-ui-fastnavgroup", "true", true /* write into DOM */);
        },

        metadata: {
            aggregations: {
                filterBar: {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                centerArea: {
                    singularName: "content"
                },
                totalCountBar: {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                didYouMeanBar: {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                noResultScreen: {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                totalCountHiddenElement: { // to be used for aria-describedby of search result list items
                    type: "sap.ui.core.InvisibleText",
                    multiple: false
                }
            }
        },

        renderer: function (oRm, oControl) {

            // inner div for results
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addClass("sapUshellSearchResultListsContainer");
            oRm.addClass("sapUiResponsiveMargin");
            if (oControl.getModel() && oControl.getModel().getFacetVisibility() === true) {
                oRm.addClass("sapUshellSearchFacetPanelOpen");
            }
            oRm.writeClasses();
            oRm.write(">");

            // render filter bar
            //oRm.renderControl(oControl.getFilterBar());

            // render main header
            oRm.renderControl(oControl.getNoResultScreen());

            // render did you mean bar
            oRm.renderControl(oControl.getDidYouMeanBar());

            // render total count bar
            oRm.write('<div class="sapUshellSearchTotalCountBar">');
            oRm.renderControl(oControl.getTotalCountBar());
            oRm.write("</div>");

            //render center area
            for (var i = 0; i < oControl.getCenterArea().length; i++) {
                oRm.renderControl(oControl.getCenterArea()[i]);
            }

            oRm.renderControl(oControl.getTotalCountHiddenElement());

            // close inner div for results
            oRm.write("</div>");

        }
    });
});
