// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/GenericTile",
    "sap/m/TileContent",
    "sap/m/library",
    "sap/m/NumericContent"
], function (
    GenericTile,
    TileContent,
    mobileLibrary,
    NumericContent
) {
    "use strict";

    // shortcut for sap.m.ValueColor
    var ValueColor = mobileLibrary.ValueColor;

    sap.ui.jsview("sap.ushell.components.tiles.applauncherdynamic.DynamicTile", {
        getControllerName: function () {
            return "sap.ushell.components.tiles.applauncherdynamic.DynamicTile";
        },

        createContent: function () {
            this.setHeight("100%");
            this.setWidth("100%");

            return this.getTileControl();
        },

        getTileControl: function () {
            var oController = this.getController();

            //Return the GenericTile if it already exists instead of creating a new one
            if (this.getContent().length === 1) {
                return this.getContent()[0];
            }

            return new GenericTile({
                mode: "{/mode}",
                header: "{/data/display_title_text}",
                subheader: "{/data/display_subtitle_text}",
                size: "Auto",
                sizeBehavior: "{/sizeBehavior}",
                wrappingType: "{/wrappingType}",
                url: {
                    parts: ["/targetURL", "/nav/navigation_target_url"],
                    formatter: oController.formatters.leanURL
                },
                tileContent: [new TileContent({
                    size: "Auto",
                    footer: "{/data/display_info_text}",
                    footerColor: {
                        path: "/data/display_info_state",
                        formatter: function (sFootterColor) {
                            if (!ValueColor[sFootterColor]) {
                                sFootterColor = ValueColor.Neutral;
                            }
                            return sFootterColor;
                        }
                    },
                    unit: "{/data/display_number_unit}",
                    //We'll utilize NumericContent for the "Dynamic" content.
                    content: [new NumericContent({
                        scale: "{/data/display_number_factor}",
                        value: "{/data/display_number_value}",
                        truncateValueTo: 5, //Otherwise, The default value is 4.
                        indicator: "{/data/display_state_arrow}",
                        valueColor: {
                            path: "/data/display_number_state",
                            formatter: function (sState) {
                                if (!sState || sState === "Neutral" || !ValueColor[sState]) {
                                    return ValueColor.None;
                                }
                                return sState;
                            }
                        },
                        icon: "{/data/display_icon_url}",
                        width: "100%",
                        withMargin: false
                    })]
                })],
                press: [oController.onPress, oController]
            });
        },

        /*
        We should change the color of the text in the footer ("info") to be as received in the tile data in the property (infostate).
        We used to have this functionality when we used the BaseTile. (we added a class which change the text color).
        Today The GenericTile doesn't support this feature, and it is impossible to change the text color.
        Since this feature is documented, we should support it - See BCP:1780008386.
        */
        onAfterRendering: function () {
            var oModel = this.getModel(),
                sDisplayInfoState = oModel.getProperty("/data/display_info_state"),
                elDomRef = this.getDomRef(),
                elFooterInfo = elDomRef ? elDomRef.getElementsByClassName("sapMTileCntFtrTxt")[0] : null;

            if (elFooterInfo) {
                switch (sDisplayInfoState) {
                    case "Negative":
                        //add class for Negative.
                        elFooterInfo.classList.add("sapUshellTileFooterInfoNegative");
                        break;
                    case "Neutral":
                        //add class for Neutral.
                        elFooterInfo.classList.add("sapUshellTileFooterInfoNeutral");
                        break;
                    case "Positive":
                        //add class for Positive.
                        elFooterInfo.classList.add("sapUshellTileFooterInfoPositive");
                        break;
                    case "Critical":
                        //add class for Critical.
                        elFooterInfo.classList.add("sapUshellTileFooterInfoCritical");
                        break;
                    default:
                        return;
                }
            }
        },

        getMode: function () {
            return this.getModel().getProperty("/mode");
        }
    });
});
