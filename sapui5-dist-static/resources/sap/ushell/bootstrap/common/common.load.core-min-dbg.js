// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
/*
 * This module provides a function for loading the core-min-x resources.
 */
sap.ui.define([
    "./common.debug.mode",
    "./common.load.script"
], function (bDebugSources, fnLoadScript) {
    "use strict";

    function loadCoreMin (sPath) {
        var sUrlPath = sap.ui.require.toUrl((sPath).replace(/\./g, "/")),
        i;
        if (bDebugSources) {
            // If pure debug mode is turned on (sap-ui-debug=(true|x|X)), it's only
            // needed to require the Core and boot the core because the minified preload
            // modules should be loaded with the single -dbg versions.
            sap.ui.require(["sap/ui/core/Core"], function (core) {
                core.boot();
            });
        } else {
            // TODO: check if we can simplify this by using ui5 module loading
            for (i = 0; i < 4; i++) {
                fnLoadScript(sUrlPath + "/core-min-" + i + ".js");
            }
        }
    }
    return loadCoreMin;
});
