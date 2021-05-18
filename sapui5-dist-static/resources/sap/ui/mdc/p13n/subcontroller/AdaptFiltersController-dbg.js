/*
 * ! OpenUI5
 * (c) Copyright 2009-2021 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"./BaseController", "sap/ui/mdc/p13n/P13nBuilder", "sap/base/util/merge"
], function (BaseController, P13nBuilder, merge) {
    "use strict";

    var AdaptFiltersController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.AdaptFiltersController");

    AdaptFiltersController.prototype.getContainerSettings = function() {
        return {
            verticalScrolling: false,
            title: sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("filterbar.ADAPT_TITLE"),
            afterClose: function(oEvt) {
                var oDialog = oEvt.getSource();
                if (oDialog) {
                    oDialog.removeAllContent();
                    oDialog.destroy();
                }
            }
        };
    };

    AdaptFiltersController.prototype.getBeforeApply = function(oAdaptationUI) {
        var pConditionPromise = oAdaptationUI ? oAdaptationUI.createConditionChanges() : Promise.resolve([]);
        return pConditionPromise;
    };

    AdaptFiltersController.prototype.getFilterControl = function() {
        return this.getAdaptationControl();
    };

    AdaptFiltersController.prototype.initializeUI = function() {
        return this.getAdaptationUI().then(function(oAdaptationFilterBar){
            return oAdaptationFilterBar.createFilterFields();
        });
    };

    AdaptFiltersController.prototype.getChangeOperations = function() {
        return {
            add: "addFilter",
            remove: "removeFilter",
            move: "moveFilter"
        };
    };

    AdaptFiltersController.prototype.getAdaptationUI = function (fnRegister) {
        return this.getAdaptationControl().retrieveInbuiltFilter();
    };

    AdaptFiltersController.prototype.getResetEnabled = function () {
        return true;
    };

    AdaptFiltersController.prototype.update = function(){
        BaseController.prototype.update.apply(this, arguments);
        this.getAdaptationControl().getInbuiltFilter().createFilterFields();
    };

    AdaptFiltersController.prototype.setP13nData = function(oPropertyHelper) {

        var mExistingFilters = this.getAdaptationControl().getCurrentState().filter || {};

        var aItemState = this.getCurrentState();
        var mExistingProperties = P13nBuilder.arrayToMap(aItemState);

        var oP13nData = P13nBuilder.prepareAdaptationData(oPropertyHelper, function(oItem, oProperty){

            var oExistingProperty = mExistingProperties[oProperty.name];
            var aExistingFilters = mExistingFilters[oProperty.name];
            oItem.visible = oExistingProperty ? true : false;
            oItem.selected = oItem.visible;
            oItem.position = oExistingProperty ? oExistingProperty.position : -1;
            oItem.isFiltered = aExistingFilters && aExistingFilters.length > 0 ? true : false;

            return !(oProperty.hiddenFilter === true ||  oProperty.name == "$search");
        }, true);

        P13nBuilder.sortP13nData({
            visible: "visible",
            position: "position"
        }, oP13nData.items);

        this.oP13nData = oP13nData;
    };

	return AdaptFiltersController;

});