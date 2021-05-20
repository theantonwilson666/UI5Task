/*!
 * OpenUI5
 * (c) Copyright 2009-2021 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Control","./library","sap/m/Button","./ObjectImageHelper","./ObjectPageHeaderContentRenderer"],function(C,l,B,O,a){"use strict";var b=l.ObjectPageHeaderDesign;var c=C.extend("sap.uxap.ObjectPageHeaderContent",{metadata:{library:"sap.uxap",interfaces:["sap.uxap.IHeaderContent"],properties:{contentDesign:{type:"sap.uxap.ObjectPageHeaderDesign",group:"Misc",defaultValue:b.Light}},aggregations:{content:{type:"sap.ui.core.Control",multiple:true,singularName:"content"},_editHeaderButton:{type:"sap.m.Button",multiple:false,visibility:"hidden"},_objectImage:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"},_placeholder:{type:"sap.m.Avatar",multiple:false,visibility:"hidden"}}}});c.prototype.onBeforeRendering=function(){var p=this.getParent(),e=this.getAggregation("_editHeaderButton");if(e){return;}if(p&&(p instanceof l.ObjectPageLayout)&&p.getShowEditHeaderButton()){e=this._getInternalBtnAggregation("_editHeaderButton","EDIT_HEADER","-editHeaderBtn","Transparent");e.attachPress(this._handleEditHeaderButtonPress,this);}};c.prototype.exit=function(){var e=this.getAggregation("_editHeaderButton");if(e){e.detachPress(this._handleEditHeaderButtonPress,this);}};c.prototype._handleEditHeaderButtonPress=function(e){this.getParent().fireEditHeaderButtonPress();};c.prototype._getInternalBtnAggregation=function(A,s,d,e){if(!this.getAggregation(A)){var o=new B({text:sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText(s),type:e,id:this.getId()+d});this.setAggregation(A,o);}return this.getAggregation(A);};c.prototype._getObjectImage=function(){if(!this.getAggregation("_objectImage")){var p=this.getParent(),h=p&&p.getHeaderTitle&&p.getHeaderTitle(),o=h&&O.createObjectImage(h);if(o){this.setAggregation("_objectImage",o,true);}}return this.getAggregation("_objectImage");};c.prototype._destroyObjectImage=function(s){var o=this.getAggregation("_objectImage");if(o){o.destroy();this.getAggregation("_objectImage",null,s);}};c.prototype._getPlaceholder=function(){if(!this.getAggregation("_placeholder")){var p=this.getParent(),h=p&&p.getHeaderTitle&&p.getHeaderTitle(),s=h.getShowPlaceholder();var P=s&&O.createPlaceholder();if(P){this.setAggregation("_placeholder",P,true);}}return this.getAggregation("_placeholder");};c.prototype._getLayoutDataForControl=function(o){var L=o.getLayoutData();if(!L){return;}else if(L instanceof l.ObjectPageHeaderLayoutData){return L;}else if(L.getMetadata().getName()=="sap.ui.core.VariantLayoutData"){var d=L.getMultipleLayoutData();for(var i=0;i<d.length;i++){var e=d[i];if(e instanceof l.ObjectPageHeaderLayoutData){return e;}}}};c.prototype.setVisible=function(v){this.getParent()&&this.getParent().toggleStyleClass("sapUxAPObjectPageLayoutNoHeaderContent",!v);return this.setProperty("visible",v);};c.createInstance=function(d,v,s,p,S){return new c({content:d,visible:v,contentDesign:s,id:S});};c.prototype.supportsPinUnpin=function(){return false;};c.prototype.supportsChildPageDesign=function(){return true;};c.prototype.supportsAlwaysExpanded=function(){return true;};c.prototype._toggleCollapseButton=function(t){};c.prototype._setShowCollapseButton=function(v){};c.prototype._focusCollapseButton=function(){};c.prototype._focusPinButton=function(){};return c;});