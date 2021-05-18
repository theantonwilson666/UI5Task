/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/m/MessagePopover","sap/m/MessageItem"],function(M,a){"use strict";var F=M.extend("sap.fe.templates.controls.messages.MessagePopOver",{metadata:{properties:{},events:{}},init:function(){M.prototype.init.call(this,arguments);this.setModel(sap.ui.getCore().getMessageManager().getMessageModel(),"message");this.bindAggregation("items",{path:"message>/",template:new a({type:"{message>type}",title:"{message>message}",description:"{message>description}",longtextUrl:"{message>descriptionUrl}",subtitle:"{message>subtitle}",counter:"{message>counter}",activeTitle:"{= ${message>controlIds}.length > 0 ? true : false}"})});this.setGroupItems(true);}});return F;},true);
