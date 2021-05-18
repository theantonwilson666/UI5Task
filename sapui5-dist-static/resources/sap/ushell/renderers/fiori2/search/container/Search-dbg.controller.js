// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
// iteration 0: ok
/* global sap */

sap.ui.define([
    "sap/ushell/renderers/fiori2/search/SearchModel"
], function (SearchModel) {
    "use strict";

    return sap.ui.controller("sap.ushell.renderers.fiori2.search.container.Search", {

        onInit: function () {
            var that = this;
            sap.ui.getCore().getEventBus().subscribe("allSearchStarted", that.getView().onAllSearchStarted, that.getView());
            sap.ui.getCore().getEventBus().subscribe("allSearchFinished", that.getView().onAllSearchFinished, that.getView());
        },

        onExit: function () {
            var that = this;
            sap.ui.getCore().getEventBus().unsubscribe("allSearchStarted", that.getView().onAllSearchStarted, that.getView());
            sap.ui.getCore().getEventBus().unsubscribe("allSearchFinished", that.getView().onAllSearchFinished, that.getView());
        }

    });
});
