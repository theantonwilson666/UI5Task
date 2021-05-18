sap.ui.define(["sap/ovp/cards/v4/generic/Component", "sap/ovp/cards/v4/linklist/AnnotationHelper"],
    function (CardComponent, AnnotationHelper) {
        "use strict";

        return CardComponent.extend("sap.ovp.cards.v4.linklist.Component", {
            // use inline declaration instead of component.json to save 1 round trip
            metadata: {
                properties: {
                    /**
                     *  The default values for the properties, if they are not mentioned.
                     *  Example : If headerAnnotationPath is not mentioned in the manifest.json,
                     *  the path mentioned in the "defaultValue" property is used as default.
                     */

                    "contentFragment": {
                        "type": "string",
                        "defaultValue": "sap.ovp.cards.v4.linklist.LinkList"
                    },
                    "controllerName": {
                        "type": "string",
                        "defaultValue": "sap.ovp.cards.v4.linklist.LinkList"
                    },
                    "communicationPath": {
                        "type": "string",
                        "defaultValue": "com.sap.vocabularies.Communication.v1.Contact"
                    },
                    "headerAnnotationPath": {
                        "type": "string",
                        "defaultValue": "com.sap.vocabularies.UI.v1.HeaderInfo"
                    },
                    "identificationAnnotationPath": {
                        "type": "string",
                        "defaultValue": "com.sap.vocabularies.UI.v1.Identification"
                    }
                },

                version: "1.88.0",

                library: "sap.ovp",

                includes: [],

                dependencies: {
                    libs: [],
                    components: []
                },
                config: {}
            },

            getCustomPreprocessor: function () {
            }
        });
    }
);