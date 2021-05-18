// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
sap.ui.define([
    'sap/ushell/renderers/fiori2/search/appsearch/JsSearch'
], function (JsSearch) {
    "use strict";

    return {

        createJsSearch: function (options) {
            options.algorithm = options.algorithm || {
                id: 'contains-ranked',
                options: [50, 49, 40, 39, 5, 4, 51]
            };
            return new JsSearch(options);
        }

    };
});
