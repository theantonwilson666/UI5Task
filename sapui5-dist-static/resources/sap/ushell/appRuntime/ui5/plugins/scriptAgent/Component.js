// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/Component","sap/ui/thirdparty/jquery","sap/base/Log"],function(C,q,L){"use strict";return C.extend("sap.ushell.appRuntime.ui5.plugins.scriptAgent.Component",{init:function(){var c=this.getComponentData();q.ajaxSetup({cache:true});try{q.getScript(c.config.url);}catch(e){L.error(e);}q.ajaxSetup({cache:false});}});});
