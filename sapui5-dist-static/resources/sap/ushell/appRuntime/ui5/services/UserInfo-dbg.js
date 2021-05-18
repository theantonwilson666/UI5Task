// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/services/UserInfo",
    "sap/ushell/appRuntime/ui5/AppRuntimeService",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/base/util/ObjectPath"
], function (UserInfo, AppRuntimeService, jQuery, Log, ObjectPath) {
    "use strict";

    function UserInfoProxy (oAdapter, oContainerInterface) {
        UserInfo.call(this, oAdapter, oContainerInterface);

        this.getThemeList = function () {
            Log.warning("'UserInfo.getThemeList' is private API and should not be called");
            return jQuery.Deferred().resolve().promise();
        };

        this.updateUserPreferences = function () {
            Log.warning("'UserInfo.updateUserPreferences' is private API and should not be called");
            return jQuery.Deferred().resolve().promise();
        };

        this.getLanguageList = function () {
            Log.warning("'UserInfo.getLanguageList' is private API and should not be called");
            return jQuery.Deferred().resolve().promise();
        };
    }

    ObjectPath.set("sap.ushell.services.UserInfo", UserInfoProxy);

    UserInfoProxy.prototype = UserInfo.prototype;
    UserInfoProxy.hasNoAdapter = UserInfo.hasNoAdapter;

    return UserInfoProxy;
}, true);
