/*
 * ! SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.define(['sap/m/ColumnListItem','sap/m/ColumnListItemRenderer','sap/ui/comp/library'],function(C,a,l){"use strict";var E=C.extend("sap.ui.comp.variants.EditableVariantItem",{metadata:{library:"sap.ui.comp",properties:{key:{type:"string",group:"Misc",defaultValue:null},global:{type:"boolean",group:"Misc",defaultValue:null},lifecyclePackage:{type:"string",group:"Misc",defaultValue:null},lifecycleTransportId:{type:"string",group:"Misc",defaultValue:null},namespace:{type:"string",group:"Misc",defaultValue:null},readOnly:{type:"boolean",group:"Misc",defaultValue:false},accessOptions:{type:"string",group:"Misc",defaultValue:null,deprecated:true},labelReadOnly:{type:"boolean",group:"Misc",defaultValue:false},author:{type:"string",group:"Misc",defaultValue:null},favorite:{type:"boolean",group:"Misc",defaultValue:false},_contexts:{type:"object",group:"Misc",visibility:"hidden",defaultValue:{}}}},renderer:a.render});E.prototype.setContexts=function(c){this.setProperty("_contexts",c);};E.prototype.getContexts=function(){return this.getProperty("_contexts");};return E;});
