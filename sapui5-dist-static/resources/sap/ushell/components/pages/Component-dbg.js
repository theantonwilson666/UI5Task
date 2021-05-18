//Copyright (c) 2009-2020 SAP SE, All Rights Reserved
/**
 * @fileOverview Pages Runtime Component
 * This UIComponent gets initialized by the FLP renderer upon visiting
 * #Shell-home or #Launchpad-openFLPPage if spaces are enabled (/core/spaces/enabled).
 * In the future it should completely replace the classical homepage.
 *
 * @version 1.88.1
 */

sap.ui.define([
    "sap/ui/core/InvisibleMessage",
    "sap/ui/core/UIComponent",
    "sap/ushell/components/SharedComponentUtils",
    "sap/ushell/resources"
], function (InvisibleMessage, UIComponent, SharedComponentUtils, resources) {
    "use strict";

    /**
     * Component of the PagesRuntime view.
     *
     * @param {string} sId Component id
     * @param {object} oSParams Component parameter
     *
     * @class
     * @extends sap.ui.core.UIComponent
     *
     * @private
     * @since 1.72.0
     * @alias sap.ushell.components.pages.Component
     */
    return UIComponent.extend("sap.ushell.components.pages.Component", /** @lends sap.ushell.components.pages.Component */{
        metadata: {
            manifest: "json",
            library: "sap.ushell"
        },
        /**
         * UI5 lifecycle method which gets called upon component instantiation.
         * It emits the "PagesRuntimeRendered" event to notify the Scheduling Agent
         * that the pages runtime is successfully rendered.
         *
         * @private
         * @since 1.72.0
         */
        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            SharedComponentUtils.toggleUserActivityLog();
            SharedComponentUtils.getEffectiveHomepageSetting("/core/home/sizeBehavior", "/core/home/sizeBehaviorConfigurable");
            this.setModel(resources.i18nModel, "i18n");

            // Instantiate pages service early here in order to do the metadata call early.
            this._oPagesService = sap.ushell.Container.getServiceAsync("Pages");

            this._oInvisibleMessageInstance = InvisibleMessage.getInstance();
        },

        /**
         * Returns a promise resolving to the pages service.
         *
         * @returns {Promise<sap.ushell.services.Pages>} A promise resolving to the Pages service.
         */
        getPagesService: function () {
            return this._oPagesService;
        },

        /**
         * Returns the invisible message instance of this component.
         *
         * @returns {sap.ui.core.InvisibleMessage} A invisible message instance.
         * @protected
         * @since 1.82
         */
        getInvisibleMessageInstance: function () {
            return this._oInvisibleMessageInstance;
        },

        /**
         * Returns an empty object as this component doesn't
         * hold any component data.
         *
         * @returns {object} An empty object
         *
         * @private
         * @since 1.72.0
         */
        getComponentData: function () {
            return {};
        }
    });
});
