// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
// iteration 0 ok
/* global */

sap.ui.define([
    'sap/ushell/renderers/fiori2/search/SearchHelper'
], function (SearchHelper) {
    "use strict";

    var module = {};

    jQuery.extend(module, {

        logLines: [],

        log: function () {
            this._log.apply(this, arguments);
        },

        _log: function (text) {
            this.logLines.push(text);
            this._save();
        },

        _save: function () {
            jQuery.ajax({
                type: 'PUT',
                url: '/uxlog.txt',
                data: this.logLines.join('\n') + '\n',
                contentType: 'text/plain'
            });
            this.logLines = [];
        }

    });

    module._save = SearchHelper.delayedExecution(module._save, 2000);

    return module;
});
