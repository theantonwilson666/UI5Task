// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

/**
 * @fileOverview The Personalization adapter for the CDM platform.
 *
 *
 * The CDM personalization adapter can be used to store data in the RA@ABAP platform.
 * @version 1.88.1
 */
sap.ui.define([
    "sap/ushell/adapters/cdm/_Personalization/internals",
    "sap/ushell/utils/HttpClient"
], function (oAdapterInternals, HttpClient) {
    "use strict";

    return oAdapterInternals.PersonalizationAdapter.bind(null, HttpClient, null);
}, /* bExport = */ true);
