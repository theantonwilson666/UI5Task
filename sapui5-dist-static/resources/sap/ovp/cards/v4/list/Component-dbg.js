sap.ui.define(["sap/ovp/cards/v4/generic/Component"],
    function (CardComponent) {
        "use strict";

        return CardComponent.extend("sap.ovp.cards.v4.list.Component", {
            // use inline declaration instead of component.json to save 1 round trip
            metadata: {
                properties: {
                    "contentFragment": {
                        "type": "string",
                        "defaultValue": "sap.ovp.cards.v4.list.List"
                    },
                    "controllerName": {
                        "type": "string",
                        "defaultValue": "sap.ovp.cards.v4.list.List"
                    },
                    "annotationPath": {
                        "type": "string",
                        "defaultValue": "com.sap.vocabularies.UI.v1.LineItem"
                    },
                    "countHeaderFragment": {
                        "type": "string",
                        "defaultValue": "sap.ovp.cards.v4.generic.CountHeader"
                    },
                    "headerExtensionFragment": {
                        "type": "string",
                        "defaultValue": "sap.ovp.cards.v4.generic.KPIHeader"
                    }
                },

                version: "1.88.0",

                library: "sap.ovp",

                includes: [],

                dependencies: {
                    libs: ["sap.suite.ui.microchart"],
                    components: []
                },
                config: {}
            }
        });
    }
);
