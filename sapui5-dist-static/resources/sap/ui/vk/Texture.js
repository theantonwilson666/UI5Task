/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/base/ManagedObject"],function(M){"use strict";var T=M.extend("sap.ui.vk.Texture",{metadata:{properties:{"id":{type:"string"},"filterMode":{type:"int",defaultValue:0},"uvRotationAngle":{type:"float",defaultValue:0.0},"uvHorizontalOffset":{type:"float",defaultValue:0.0},"uvVerticalOffset":{type:"float",defaultValue:0.0},"uvHorizontalScale":{type:"float",defaultValue:0.0},"uvVerticalScale":{type:"float",defaultValue:0.0},"uvHorizontalTilingEnabled":{type:"boolean",defaultValue:true},"uvVerticalTilingEnabled":{type:"boolean",defaultValue:true}}}});T.prototype.load=function(i){return this;};T.prototype.getTextRef=function(){return null;};return T;});
