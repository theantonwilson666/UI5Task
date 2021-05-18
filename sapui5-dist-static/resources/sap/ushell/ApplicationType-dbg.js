// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/thirdparty/URI",
    "sap/base/Log",
    "sap/ushell/utils",
    "sap/ushell/URLTemplateProcessor",
    "sap/ushell/_ApplicationType/utils",
    "sap/ushell/_ApplicationType/systemAlias",
    "sap/ushell/_ApplicationType/wdaResolution",
    "sap/ushell/_ApplicationType/guiResolution",
    "sap/ushell/services/_ClientSideTargetResolution/ParameterMapping",
    "sap/ushell/Config"
], function (
    URI,
    Log,
    oUtils,
    URLTemplateProcessor,
    oApplicationTypeUtils,
    oSystemAlias,
    oWdaResolution,
    oGuiResolution,
    oParameterMapping,
    Config
) {
    "use strict";

    function generateWDAResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        var oInbound = oMatchingTarget.inbound;
        var oResolutionResult = oInbound && oInbound.resolutionResult;
        if (!(
            !oInbound || !oResolutionResult || !(oResolutionResult["sap.wda"])
        )) {
            return oWdaResolution.constructFullWDAResolutionResult(oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver);
        }

        if (!(
            !oInbound || !oResolutionResult
        )) {
            return oWdaResolution.constructWDAResolutionResult(oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver);
        }
        return undefined;
    }

    function generateWCFResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        var oUri = new URI(sBaseUrl),
            oInbound = oMatchingTarget.inbound,
            oInboundResolutionResult = oInbound && oInbound.resolutionResult,
            oEffectiveParameters = jQuery.extend(true, {}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults),
            sSapSystem,
            sSapSystemDataSrc;

        if (oEffectiveParameters["sap-system"]) {
            sSapSystem = oEffectiveParameters["sap-system"][0];
            delete oEffectiveParameters["sap-system"];
        }

        if (oEffectiveParameters["sap-system-src"]) {
            sSapSystemDataSrc = oEffectiveParameters["sap-system-src"][0];
            delete oEffectiveParameters["sap-system-src"];
        }

        return new Promise(function (fnResolve, fnReject) {
            oSystemAlias.spliceSapSystemIntoURI(
                oUri,
                oInboundResolutionResult.systemAlias,
                sSapSystem,
                sSapSystemDataSrc,
                "WCF",
                oInboundResolutionResult.systemAliasSemantics || oSystemAlias.SYSTEM_ALIAS_SEMANTICS.applied,
                fnExternalSystemAliasResolver
            )
                .done(function (oURI) {
                    var sParameters = oApplicationTypeUtils.getURLParsing().paramsToString(oEffectiveParameters),
                        sFinalUrl = oApplicationTypeUtils.appendParametersToUrl(sParameters, oURI.toString());

                    var oResolutionResult = {
                        url: sFinalUrl,
                        text: oInboundResolutionResult.text || "",
                        additionalInformation: oInboundResolutionResult.additionalInformation || "",
                        applicationType: "WCF",
                        fullWidth: true
                    };

                    fnResolve(oResolutionResult);
                })
                .fail(function (sError) {
                    fnReject(sError);
                });
        });
    }

    function generateUI5ResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        var oInbound = oMatchingTarget.inbound,
            sUrlParams,
            sSapSystem,
            sSapSystemSrc,
            oEffectiveParameters,
            oResolutionResult = {};

        // propagate properties from the inbound in the resolution result
        // NOTE: we **propagate** applicationType here, as we want to handle URLs as well
        ["applicationType", "additionalInformation", "applicationDependencies"].forEach(function (sPropName) {
            if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                oResolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
            }
        });

        oResolutionResult.url = sBaseUrl;

        // urls are not required if:
        // - the UI5 specifies the manifestUrl among the application dependencies or
        // - the component is part of the dist layer
        if (oResolutionResult.applicationDependencies
            && typeof oResolutionResult.url === "undefined") {

            oResolutionResult.url = ""; // relative url
        }

        // empty urls are valid (they indicate relative url path). This happens in case of
        // app variants where the Component is located in the dist layer.
        if (typeof oResolutionResult.url === "undefined") {
            return Promise.reject("Cannot resolve intent: url was not specified in matched inbound");
        }

        // construct effective parameters including defaults
        oEffectiveParameters = jQuery.extend(true, {}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);

        /*
         * Deal with reserved parameters
         *
         * Reserved parameters are removed from the result url and moved
         * to a separate section of the resolution result.
         */
        oResolutionResult.reservedParameters = {};
        var oReservedParameters = {
            //
            // Used by the RT plugin to determine whether the RT change was made
            // by a key user or by a end-user.
            //
            "sap-ui-fl-max-layer": true,
            //
            // Used by RTA to determine which control variant id(s) should be
            // selected when the application is loaded.
            //
            "sap-ui-fl-control-variant-id": true,
            //
            // Used by RTA to determine draft app which user starts to
            // adapt but don't want to activate immediately.
            //
            "sap-ui-fl-version": true
        };
        Object.keys(oReservedParameters).forEach(function (sName) {
            var sValue = oEffectiveParameters[sName];
            if (sValue) {
                delete oEffectiveParameters[sName];
                oResolutionResult.reservedParameters[sName] = sValue;
            }

        });
        // don't list reserved parameters as defaulted
        oMatchingTarget.mappedDefaultedParamNames = oMatchingTarget.mappedDefaultedParamNames
            .filter(function (sDefaultedParameterName) {
                return !oReservedParameters[sDefaultedParameterName];
            });

        if (oMatchingTarget.mappedDefaultedParamNames.length > 0) {
            oEffectiveParameters["sap-ushell-defaultedParameterNames"] = [JSON.stringify(oMatchingTarget.mappedDefaultedParamNames)];
        }

        sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];
        sSapSystemSrc = oEffectiveParameters["sap-system-src"] && oEffectiveParameters["sap-system-src"][0];

        // contrarily to the WDA case, in the SAPUI5 case sap-system and
        // sap-system-src are part of the final URL
        oResolutionResult["sap-system"] = sSapSystem;
        if (typeof sSapSystemSrc === "string") {
            oResolutionResult["sap-system-src"] = sSapSystemSrc;
        }

        oMatchingTarget.effectiveParameters = oEffectiveParameters;

        // prepare a proper URL!
        sUrlParams = oApplicationTypeUtils.getURLParsing().paramsToString(oEffectiveParameters);
        if (sUrlParams) {
            // append parameters to URL
            oResolutionResult.url = oResolutionResult.url + ((oResolutionResult.url.indexOf("?") < 0) ? "?" : "&") + sUrlParams;
        }

        // IMPORTANT: check for no ui5ComponentName to avoid adding it to URL types
        if (typeof oInbound.resolutionResult.ui5ComponentName !== "undefined") {
            oResolutionResult.ui5ComponentName = oInbound.resolutionResult.ui5ComponentName;
        }

        oResolutionResult.text = oInbound.title;

        return Promise.resolve(oResolutionResult);
    }

    // extracts the inner app route from the browser hash
    function getInnerAppRoute () {
        var sHashFragment = new URI().fragment();
        var indexOfInnerRoute = sHashFragment.lastIndexOf("&/");
        if (indexOfInnerRoute > 0) {
            return sHashFragment.substr(indexOfInnerRoute + 1); // + 1 to avoid the starting "&"
        }
        return undefined;
    }

    function getTargetNavigationMode (oMatchingTarget) {
        var sMode = oMatchingTarget.targetNavigationMode;
        if (sMode === undefined || sMode === "") {
            sMode = "inplace";
        }

        return sMode;
    }

    function getInnerAppState () {
        var sHash = window.hasher && window.hasher.getHash(),
            sKey = "",
            aParams;

        if (sHash && sHash.length > 0 && sHash.indexOf("sap-iapp-state=") > 0) {
            aParams = /(?:sap-iapp-state=)([^&/\\]+)/.exec(sHash);
            if (aParams && aParams.length === 2) {
                sKey = aParams[1];
            }
        }

        return sKey;
    }

    function getPluginsAgents () {
        var oService = sap.ushell.Container.getService("PluginManager");
        if (oService) {
            return oService._getNamesOfPluginsWithAgents();
        }
            return "";

    }

    function createEnv () {
        var oUserInfoService = sap.ushell.Container.getService("UserInfo");
        var oUser = oUserInfoService.getUser();
        var oConfiguration = sap.ui.getCore().getConfiguration();
        var sUi5Version = oUtils.getUi5Version();
        var sContentDensity = oUser.getContentDensity();
        var sTheme = oUser.getTheme();
        if (sTheme.indexOf("sap_") !== 0) {
            var sThemeFormat = sap.ushell.User.prototype.constants.themeFormat.THEME_NAME_PLUS_URL;
            sTheme = oUser.getTheme(sThemeFormat);
        }

        var sLogonLanguage;
        var sLanguage;
        if (oConfiguration) {
            sLanguage = oConfiguration.getLanguage && oConfiguration.getLanguage();
            sLogonLanguage = oConfiguration.getSAPLogonLanguage && oConfiguration.getSAPLogonLanguage();
        }

        var themeServiceRoot = window.location.protocol + "//" + window.location.host // host
            + "/comsapuitheming.runtime/themeroot/v1"; // route to theme service
        var sessionTimeout = 0;
        if (Config.last("/core/shell/sessionTimeoutIntervalInMinutes") > 0) {
            sessionTimeout = Config.last("/core/shell/sessionTimeoutIntervalInMinutes");
        }

        return {
            language: sLanguage,
            logonLanguage: sLogonLanguage,
            theme: sTheme,
            themeServiceRoot: themeServiceRoot,
            isDebugMode: !!window["sap-ui-debug"],
            ui5Version: sUi5Version,
            contentDensity: sContentDensity,
            sapPlugins: getPluginsAgents(),
            innerAppState: getInnerAppState(),
            sessionTimeout: sessionTimeout
        };
    }

    /**
     * URLTemplates used to expose external navigation modes but it should
     * expose internal navigation modes instead. For backward compatibility, we
     * convert any external navigation mode to the respective internal
     * navigation mode.
     *
     * @param {string} sMaybeExternalNavigationMode
     *  The navigation mode from the template capabilities. Which may erroneously
     *  be an external navigation mode.
     *
     * @return {string}
     *  The internal navigation mode.
     */
    function getURLTemplateInternalNavigationMode (sMaybeExternalNavigationMode) {
        var sInternalNavigationMode;

        switch (sMaybeExternalNavigationMode) {
            case "inplace":
                sInternalNavigationMode = "embedded";
                break;
            case "explace":
                sInternalNavigationMode = "newWindow";
                break;
            default:
                sInternalNavigationMode = sMaybeExternalNavigationMode || "newWindow";
        }

        return sInternalNavigationMode;
    }

    /**
     * Define the navigation mode app capability based on the template internal
     * navigation mode and the external navigation mode configured on the app.
     *
     * @param {string} sTemplateNavigationMode
     *   The template navigation mode
     *
     * @param {object} oSiteAppSection
     *   The site app section
     *
     * @return {string}
     *   The internal navigation mode capability that can be used by the shell
     *   to launch the application.
     */
    function getNavigationModeAppCapability (sTemplateNavigationMode, oSiteAppSection) {
        var sTemplateInternalNavigationMode = getURLTemplateInternalNavigationMode(sTemplateNavigationMode);
        var sAppExternalNavMode = oUtils.getMember(oSiteAppSection, "sap|integration.navMode");

        switch (sAppExternalNavMode) {
            case "inplace":
                // Force the application to be opened in place (ignore template capability)
                return "embedded";

            case "explace":
                if (sTemplateInternalNavigationMode === "embedded") {
                    return "newWindowThenEmbedded"; // app can be opened in embedded mode
                }

                if (["newWindowThenEmbedded", "newWindow"].indexOf(sTemplateInternalNavigationMode) >= 0) {
                    // Use the template defined external navigation mode
                    return sTemplateInternalNavigationMode;
                }

                Log.error(
                    "App-defined navigation mode was ignored",
                    "Application requests to be opened in a new window but no expected navigation mode was defined on the template",
                    "sap.ushell.ApplicationType"
                );

            default:
                // Fallback to template-defined navigation mode.
                return sTemplateInternalNavigationMode;
        }
    }

    /**
     * Creates app capabilities from the template capabilities.
     *
     * The app capabilities are the capabilities of the application instance
     * and may be influenced by the specific configuration of the application.
     *
     *
     * @param {object} oTemplateCapabilities
     *   Template capabilities are default capabilities that indicate how an
     *   application can be configured.
     * @param {object} oSiteAppSection
     *   site application section
     *
     * @param {function} fnInstantiateTemplate
     * A function that instantiates an attribute, like appId of a template.
     *
     * @returns {object} oAppCapabilities
     *   application capabilities
     * @private
     *
     */
    function createAppCapabilities (oTemplateCapabilities, oSiteAppSection, fnInstantiateTemplate) {
        var oAppCapabilities = oUtils.clone(oTemplateCapabilities);
        oAppCapabilities.navigationMode = getNavigationModeAppCapability(oTemplateCapabilities.navigationMode, oSiteAppSection);
        oAppCapabilities.appId = fnInstantiateTemplate(oTemplateCapabilities.appId || "");
        oAppCapabilities.technicalAppComponentId = fnInstantiateTemplate(oTemplateCapabilities.technicalAppComponentId || "");
        oAppCapabilities.appSupportInfo = oSiteAppSection["sap.app"] && oSiteAppSection["sap.app"].ach;
        oAppCapabilities.appFrameworkId = oTemplateCapabilities.appFrameworkId;
        return oAppCapabilities;
    }

    function getExtendedInfo (oSite, oSiteAppSection, oMatchingTarget) {
        var oInfo = {
                appParams: {},
                system: undefined
            },
            sSystem;

        //set all parameters list
        if (oMatchingTarget.mappedIntentParamsPlusSimpleDefaults) {
            oInfo.appParams = JSON.parse(JSON.stringify(oMatchingTarget.mappedIntentParamsPlusSimpleDefaults));
        }

        //get the system attributes
        sSystem = oUtils.getMember(oSiteAppSection, "sap|app.destination");
        if (typeof sSystem === "string" && sSystem.length > 0) {
            oInfo.system = oSite.systemAliases[sSystem] && JSON.parse(JSON.stringify(oSite.systemAliases[sSystem]));
            if (typeof oInfo.system === "object") {
                oInfo.system.alias = sSystem;
            }
        }

        return oInfo;
    }

    function compactURLParameters (sUrlExpanded) {
        return new Promise(function (fnResolve, fnReject) {
            var oUrl = new URI(sUrlExpanded);
            var oParams = oUrl.query(true /* bAsObject */);
            sap.ushell.Container.getService("ShellNavigation")
                .compactParams(
                    oParams,
                    ["sap-language", "sap-theme", "sap-shell", "sap-ui-app-id", "transaction", "sap-iframe-hint"] /* retain list */,
                    undefined /* no Component*/,
                    true /*transient*/
                )
                .done(function (oCompactedParams) {
                    if (!oCompactedParams.hasOwnProperty("sap-intent-param")) {
                        // Return original URL if no compaction happened,
                        // because compacted parameters are sorted when compacting
                        // the shell hash (URLParsing#constructShellHash sorts).
                        // Here we try to keep the specified order from the URL
                        // template if possible.
                        fnResolve(sUrlExpanded);
                        return;
                    }

                    oUrl.query(oCompactedParams);
                    var sUrlCompacted = oUrl.toString();
                    fnResolve(sUrlCompacted);
                })
                .fail(function (sError) {
                    fnReject(sError);
                });
        });
    }

    /*
    add "sap-iframe-hint" parameter that will help to identify the
     correct cached iframe in case the URL is opened in statefull
     container
     */
    function addIframeCacheHintToURL(oResult) {
        if (oResult.appCapabilities.appFrameworkId) {
            var iHash = oResult.url.indexOf("#"),
                sLeft = oResult.url,
                sRight = "";
            if (iHash > 0) {
                sLeft = oResult.url.slice(0, iHash);
                sRight = oResult.url.slice(iHash);
            }
            oResult.url = sLeft +
                (sLeft.indexOf("?") >= 0 ? "&" : "?") +
                "sap-iframe-hint=" + oResult.appCapabilities.appFrameworkId +
                sRight;
        }
    }

    function generateURLTemplateResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        var oInbound = oMatchingTarget.inbound;
        var oTemplateContext = oInbound.templateContext;

        /*
         * Attention: the names in this object must be kept stable. They might
         * appear at any time in any template at runtime. Also, choose a name
         * that can be read by a user. E.g., defaultParameterNames is good,
         * mappedDefaultedParamNames is bad.
         */
        var oRuntime = {
            // the inner app route
            innerAppRoute: getInnerAppRoute() || oMatchingTarget.parsedIntent.appSpecificRoute,
            // the target navigation mode
            targetNavMode: getTargetNavigationMode(oMatchingTarget),
            // the names of default parameters among the startupParameters
            defaultParameterNames: oMatchingTarget.mappedDefaultedParamNames,
            /*
             * the parameters (defaults + inent parameters) that must be passed
             * to the application in order to start it
             */
            startupParameter: oMatchingTarget.mappedIntentParamsPlusSimpleDefaults,
            // the runtime environment, containing data from the current state of the FLP
            env: createEnv()
        };

        var sURL = URLTemplateProcessor.expand(
            oTemplateContext.payload,
            oTemplateContext.site,
            oRuntime,
            oTemplateContext.siteAppSection,
            "startupParameter"
        );
        /*
            returns a function that instantiates an attribute, like appId of a template
        */
        var fnInstantiateTemplate = function (sTemplate) {

            var oPayloadClone = oUtils.clone(oTemplateContext.payload);
            oPayloadClone.urlTemplate = sTemplate;
            return URLTemplateProcessor.expand(
                oPayloadClone,
                oTemplateContext.site,
                oRuntime,
                oTemplateContext.siteAppSection,
                "startupParameter"
            );
        };

        var oResult = {
            applicationType: "URL",
            text: oInbound.title,
            appCapabilities: createAppCapabilities(
                oTemplateContext.payload.capabilities || {},
                oTemplateContext.siteAppSection,
                fnInstantiateTemplate
            ),
            url: sURL,
            extendedInfo: getExtendedInfo(oTemplateContext.site, oTemplateContext.siteAppSection, oMatchingTarget),
            contentProviderId: oInbound.contentProviderId || "",
            systemAlias: (oTemplateContext.siteAppSection["sap.app"] &&
                oTemplateContext.siteAppSection["sap.app"].destination) ||
                oTemplateContext.siteAppSection.destination || ""
        };
        addIframeCacheHintToURL(oResult);

        return compactURLParameters(oResult.url)
            .then(function (sCompactURL) {
                oResult.url = sCompactURL;
                return oResult;
            }, function () {
                return oResult;
            });
    }

    function generateURLResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        var oInbound = oMatchingTarget.inbound,
            oInboundResolutionResult = oInbound && oInbound.resolutionResult,
            oResolutionResult = {};

        // splice parameters into url
        var oURI = new URI(sBaseUrl);

        // construct effective parameters including defaults
        var oEffectiveParameters = jQuery.extend(true, {}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);

        // a special hack to work around the AA modelling of Tile Intents in the export
        // the special intent Shell-launchURL with a dedicated parameter sap-external-url
        // which shall *not* be propagated into the final url
        if (oMatchingTarget.inbound
            && oMatchingTarget.inbound.action === "launchURL"
            && oMatchingTarget.inbound.semanticObject === "Shell"
        ) {
            delete oEffectiveParameters["sap-external-url"];
        }

        var sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];
        var sSapSystemDataSrc = oEffectiveParameters["sap-system-src"] && oEffectiveParameters["sap-system-src"][0];

        // do not include the sap-system parameter in the URL
        oResolutionResult["sap-system"] = sSapSystem;
        delete oEffectiveParameters["sap-system"];

        // do not include the sap-system-src parameter in the URL
        if (typeof sSapSystemDataSrc === "string") {
            oResolutionResult["sap-system-src"] = sSapSystemDataSrc;
            delete oEffectiveParameters["sap-system-src"];
        }

        return (new Promise(function (fnResolve, fnReject) {
            if (
                oApplicationTypeUtils.absoluteUrlDefinedByUser(
                    oURI, oInboundResolutionResult.systemAlias,
                    oInboundResolutionResult.systemAliasSemantics
                )
            ) {
                fnResolve(sBaseUrl);
            } else {
                oSystemAlias.spliceSapSystemIntoURI(
                    oURI, oInboundResolutionResult.systemAlias,
                    sSapSystem,
                    sSapSystemDataSrc,
                    "URL",
                    oInboundResolutionResult.systemAliasSemantics || oSystemAlias.SYSTEM_ALIAS_SEMANTICS.applied,
                    fnExternalSystemAliasResolver
                )
                .fail(fnReject)
                .done(function (oSapSystemURI) {
                    var sSapSystemUrl = oSapSystemURI.toString();
                    fnResolve(sSapSystemUrl);
                });
            }
        }))
        .then(function (sUrlWithoutParameters) {
            var sParameters = oApplicationTypeUtils.getURLParsing().paramsToString(oEffectiveParameters);
            var sFLPURLDetectionPattern = Config.last("/core/navigation/flpURLDetectionPattern");
            var rFLPURLDetectionRegex = new RegExp(sFLPURLDetectionPattern);

            return rFLPURLDetectionRegex.test(sUrlWithoutParameters)
                ? oApplicationTypeUtils.appendParametersToIntentURL(oEffectiveParameters, sUrlWithoutParameters)
                : oApplicationTypeUtils.appendParametersToUrl(sParameters, sUrlWithoutParameters);

        }, Promise.reject.bind(Promise))
        .then(function (sUrlWithParameters) {
            // propagate properties from the inbound in the resolution result
            ["additionalInformation", "applicationDependencies", "systemAlias"].forEach(function (sPropName) {
                if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                    oResolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
                }
            });

            oResolutionResult.url = sUrlWithParameters;
            oResolutionResult.text = oInbound.title;
            oResolutionResult.applicationType = "URL";

            return Promise.resolve(oResolutionResult);
        }, Promise.reject.bind(Promise));
    }

    var oApplicationType = {
        /**
         * This type represents web applications identified by any uniform resource locator. They
         * will be embedded into an <code>IFRAME</code>.
         *
         * @constant
         * @default "URL"
         * @name ApplicationType.URL
         * @since 1.15.0
         * @type string
         */
        URL: {
            type: "URL",
            defaultFullWidthSetting: true,
            generateResolutionResult: function (oMatchingTarget) {
                var bUseTemplate = oMatchingTarget.inbound.hasOwnProperty("templateContext");
                return bUseTemplate
                    ? generateURLTemplateResolutionResult.apply(null, arguments)
                    : generateURLResolutionResult.apply(null, arguments);
            },
            easyAccessMenu: {
                intent: "Shell-startURL",
                resolver: null,
                showSystemSelectionInUserMenu: true,
                showSystemSelectionInSapMenu: false,
                systemSelectionPriority: 1
            }
        },
        /**
         * This type represents applications built with Web Dynpro for ABAP. The embedding
         * container knows how to embed such applications in a smart way.
         *
         * @constant
         * @default "WDA"
         * @name ApplicationType.WDA
         * @since 1.15.0
         * @type string
         */
        WDA: {
            type: "WDA",
            defaultFullWidthSetting: true,
            generateResolutionResult: generateWDAResolutionResult,
            easyAccessMenu: {
                intent: "Shell-startWDA",
                resolver: oWdaResolution.resolveEasyAccessMenuIntentWDA,
                showSystemSelectionInUserMenu: true,
                showSystemSelectionInSapMenu: true,
                systemSelectionPriority: 2 // preferred over URL
            }
        },
        /**
         * This type represents transaction applications.
         * The embedding container knows how to embed such applications in a smart way.
         *
         * @constant
         * @default "TR"
         * @name ApplicationType.TR
         * @since 1.36.0
         * @type string
         */
        TR: {
            type: "TR",
            defaultFullWidthSetting: true,
            generateResolutionResult: oGuiResolution.generateTRResolutionResult,
            easyAccessMenu: {
                intent: "Shell-startGUI",
                resolver: oGuiResolution.resolveEasyAccessMenuIntentWebgui,
                showSystemSelectionInUserMenu: true,
                showSystemSelectionInSapMenu: true,
                systemSelectionPriority: 3 // startGUI titles are preferred over WDA and URL
            }
        },
        /**
         * This type represents applications embedded via NetWeaver Business Client.
         * The embedding container knows how to embed such applications in a smart way.
         *
         * @constant
         * @default "NWBC"
         * @name ApplicationType.NWBC
         * @since 1.19.0
         * @type string
         */
        NWBC: {
            type: "NWBC",
            defaultFullWidthSetting: true
            // there is no input application type like this
        },
        /**
         * This type represents applications embedded via Windows Communication Foundation.
         * The embedding container knows how to embed such applications in a smart way.
         *
         * @constant
         * @default "WCF"
         * @name ApplicationType.WCF
         * @since 1.56.0
         * @type string
         */
        WCF: {
            type: "WCF",
            generateResolutionResult: generateWCFResolutionResult,
            defaultFullWidthSetting: true
        },
        SAPUI5: {
            type: "SAPUI5",
            generateResolutionResult: generateUI5ResolutionResult,
            defaultFullWidthSetting: false
        }
    };

    function getEasyAccessMenuDefinitions () {
        return Object.keys(oApplicationType)
            .map(function (sApplicationType) {
                return oApplicationType[sApplicationType];
            })
            .filter(function (oApplicationTypeDefinition) {
                return typeof oApplicationTypeDefinition.easyAccessMenu === "object";
            });
    }

    function createEasyAccessMenuResolverGetter () {
        var oEasyAccessMenuIntentResolver = {};
        getEasyAccessMenuDefinitions()
            .forEach(function (oApplicationTypeDefinitionWithEasyAccessMenu) {
                oEasyAccessMenuIntentResolver[
                    oApplicationTypeDefinitionWithEasyAccessMenu.easyAccessMenu.intent
                ] = oApplicationTypeDefinitionWithEasyAccessMenu.easyAccessMenu.resolver;
            });

        return function (sMaybeEasyAccessMenuIntent, sResolvedApplicationType) {
            if (
                oEasyAccessMenuIntentResolver[sMaybeEasyAccessMenuIntent]
                && (!sResolvedApplicationType || sResolvedApplicationType !== "SAPUI5")
            ) {
                return oEasyAccessMenuIntentResolver[sMaybeEasyAccessMenuIntent];
            }
            return null;
        };
    }

    function getDefaultFullWidthSetting (sApplicationType) {
        if (!oApplicationType[sApplicationType]) {
            return false;
        }
        return oApplicationType[sApplicationType].defaultFullWidthSetting;
    }

    /**
     * The application types supported by the embedding container.
     *
     * @since 1.15.0
     * @enum {String}
     * @private
     */
    Object.defineProperty(oApplicationType, "enum", {
        value: Object.keys(oApplicationType).reduce(function (oAccumulator, sCurrentKey) {
            if (oApplicationType[sCurrentKey].type) {
                oAccumulator[sCurrentKey] = oApplicationType[sCurrentKey].type;
            }
            return oAccumulator;
        }, {})
    });

    var oMethods = {
        getEasyAccessMenuResolver: createEasyAccessMenuResolverGetter(),
        getEasyAccessMenuDefinitions: getEasyAccessMenuDefinitions,
        getDefaultFullWidthSetting: getDefaultFullWidthSetting
    };

    Object.keys(oMethods).forEach(function (sMethodName) {
        Object.defineProperty(oApplicationType, sMethodName, {
            value: oMethods[sMethodName]
        });
    });

    return oApplicationType;
}, true);
