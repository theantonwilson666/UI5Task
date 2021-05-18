// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Icon",
    "sap/m/Label",
    "sap/m/CustomListItem",
    "sap/m/library",
    "sap/m/Link",
    "sap/base/Log",
    "sap/ui/thirdparty/jquery"
], function (
    JSONModel,
    Icon,
    Label,
    CustomListItem,
    mobileLibrary,
    Link,
    Log,
    jQuery
) {
    "use strict";

    // shortcut for sap.m.ListType
    var ListType = mobileLibrary.ListType;

    sap.ui.controller("sap.ushell.components.treeview.NavTree", {
        onInit: function () {
            var oViewData = this.getView().getViewData(),
                root = oViewData.data.items,
                serviceURL = oViewData.data.serviceURL || "",
                treeModel = { items: [], entryObject: {} };

            var oModel = new JSONModel(treeModel);
            this.getView().setModel(oModel);

            //make the request.
            jQuery.getJSON(serviceURL)
                .done(function (root) {
                    this.buidModelData(root);
                }.bind(this))
                .fail(function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    Log.error("Request Failed: " + err);
                    this.buidModelData(root);
                }.bind(this));
        },
        buidModelData: function (root) {
            //Implement the flattening algorithm.
            var itemKey, elemKey, groupIndex = 0, treeModel = { items: [], entryObject: {} };
            for (itemKey in root.nodes) {
                var item = root.nodes[itemKey];

                if (item.type === "SUBMENU") {
                    var groupName = item.title;
                    for (elemKey in item.nodes) {
                        var elem = item.nodes[elemKey];
                        elem.groupIndex = groupIndex.toString();
                        elem.groupName = groupName;
                        treeModel.items.push(elem);
                        treeModel.entryObject[groupIndex.toString()] = { title: item.title, type: item.type };
                    }
                } else if (item.type === "URL" || item.type === "APP") {
                    item.groupIndex = groupIndex.toString();
                    item.groupName = "";
                    treeModel.items.push(item);
                    treeModel.entryObject[groupIndex.toString()] = { title: item.title, type: item.type, href: item.target };
                }

                groupIndex++;
            }

            var oModel = new JSONModel(treeModel);
            this.getView().setModel(oModel);
        },
        getGroupHeader: function (oGroup) {
            var entryItem = this.getView().getModel().getData().entryObject[oGroup.key];

            if (entryItem.type === "SUBMENU") {
                var icon = new Icon({
                    src: "slim-arrow-right",
                    tooltip: entryItem.title
                }).addStyleClass("sapUshellGroupListItemIcon");

                var lnk = new Label({
                    text: entryItem.title
                }).addStyleClass("sapUshellNavTreeLink");

                return new CustomListItem({
                    press: [this.handleClickOnSubMenu, this],
                    type: ListType.Active,
                    content: [icon, lnk]
                }).addStyleClass("sapUshellNavTreeListItem sapUshellNavTreeParent");
            }
            return new CustomListItem({
                content: new Link({
                    text: entryItem.title,
                    href: entryItem.href
                }).addStyleClass("sapUshellNavTreeLink")
            }).addEventDelegate({
                onclick: this.onNavTreeTitleChange.bind(this)
            }).addStyleClass("sapUshellNavTreeListItem sapUshellNavTreeSingle");
        },
        onNavTreeTitleChange: function (oEvent) {
            if (this._prevSelect) {
                this._prevSelect.removeStyleClass("sapUshellNavTreeItemSelected");
            }
            var item = oEvent.srcControl;

            if (oEvent.srcControl.getContent) {
                window.location.href = oEvent.srcControl.getContent()[0].getHref();
                item.addStyleClass("sapUshellNavTreeItemSelected");
                this._prevSelect = item;
            } else {
                item.getParent().addStyleClass("sapUshellNavTreeItemSelected");
                this._prevSelect = item.getParent();
            }
        },

        handleClickOnSubMenu: function (oEvent) {
            var icon = oEvent.getSource().getContent()[0];

            if (icon.getSrc() === "slim-arrow-down") {
                icon.setSrc("slim-arrow-right");
                this.toggleSubItemsState(oEvent, true);
            } else {
                icon.setSrc("slim-arrow-down");
                this.toggleSubItemsState(oEvent, false);
            }
        },
        toggleSubItemsState: function (oEvent, isExpanded) {
            if (oEvent) {
                var jqThis = jQuery(oEvent.getSource().getDomRef());

                if (isExpanded) {
                    jqThis.nextUntil(".sapUshellNavTreeSingle, .sapUshellNavTreeParent").addClass("sapUshellNavTreeChildHide");
                } else {
                    jqThis.nextUntil(".sapUshellNavTreeSingle, .sapUshellNavTreeParent").removeClass("sapUshellNavTreeChildHide");
                }
            }
        }
    });
}, /* bExport= */ true);
