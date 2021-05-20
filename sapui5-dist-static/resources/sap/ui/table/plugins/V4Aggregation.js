/*
 * OpenUI5
 * (c) Copyright 2009-2021 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./PluginBase","../utils/TableUtils","sap/ui/unified/MenuItem","sap/base/util/deepClone"],function(P,T,M,d){"use strict";function a(C,p){var v=C.getProperty(p),m=C.getModel().getMetaModel(),s=m.getMetaPath(C.getPath()+"/"+p),o=m.getUI5Type(s);return o.formatValue(v,"string");}var V=P.extend("sap.ui.table.plugins.V4Aggregation",{metadata:{library:"sap.ui.table",properties:{totalSummaryOnTop:{type:"string",defaultValue:"Off"},totalSummaryOnBottom:{type:"string",defaultValue:"Fixed"},groupSummary:{type:"string",defaultValue:"Bottom"}}}});V.prototype.isApplicable=function(C){return P.prototype.isApplicable.apply(this,arguments)&&C.getMetadata().getName()==="sap.ui.table.Table";};V.prototype.activate=function(){var B=this.getTableBinding();if(B&&!B.getModel().isA("sap.ui.model.odata.v4.ODataModel")){return;}P.prototype.activate.apply(this,arguments);};V.prototype.onActivate=function(t){this.setRowCountConstraints({fixedTop:false,fixedBottom:false});T.Grouping.setGroupMode(t);T.Hook.register(t,T.Hook.Keys.Row.UpdateState,this.updateRowState,this);T.Hook.register(t,T.Hook.Keys.Row.Expand,e,this);T.Hook.register(t,T.Hook.Keys.Row.Collapse,c,this);};V.prototype.onDeactivate=function(t){this.setRowCountConstraints();T.Grouping.clearMode(t);T.Hook.deregister(t,T.Hook.Keys.Row.UpdateState,this.updateRowState,this);T.Hook.deregister(this,T.Hook.Keys.Row.Expand,e,this);T.Hook.deregister(this,T.Hook.Keys.Row.Collapse,c,this);var B=t.getBinding();if(B){B.setAggregation();}};V.prototype.onTableRowsBound=function(B){if(B.getModel().isA("sap.ui.model.odata.v4.ODataModel")){this.updateAggregation();}else{this.deactivate();}};V.prototype.updateRowState=function(s){var l=s.context.getValue("@$ui5.node.level");var C=s.context.getValue("@$ui5.node.isTotal");var i=s.context.getValue("@$ui5.node.isExpanded")===undefined;var I=l===0&&C;var f=l>0&&!i;var g=!f&&C;if(I||g){s.type=s.Type.Summary;}else if(f){s.type=s.Type.GroupHeader;}s.expandable=f;s.expanded=s.context.getValue("@$ui5.node.isExpanded")===true;s.level=l;if(f){s.title=this._aGroupLevelFormatters[l-1](s.context,this._aGroupLevels[l-1]);}};V.prototype.setPropertyInfos=function(p){this._aPropertyInfos=p;};V.prototype.getPropertyInfos=function(){return this._aPropertyInfos||[];};V.prototype.findPropertyInfo=function(p){return this.getPropertyInfos().find(function(o){return o.name===p;});};V.prototype.isPropertyAggregatable=function(p){return(p.extension&&p.extension.defaultAggregate)?true:false;};V.prototype.setAggregationInfo=function(A){if(!A||!A.visible){this._mGroup=undefined;this._mAggregate=undefined;this._aGroupLevels=undefined;}else{this._mGroup=this.getPropertyInfos().reduce(function(g,p){if(p.key){g[p.path]={};}return g;},{});this._mAggregate={};A.visible.forEach(function(v){var p=this.findPropertyInfo(v);if(p&&p.groupable){this._mGroup[p.path]={};}if(p&&this.isPropertyAggregatable(p)){this._mAggregate[p.path]={grandTotal:A.grandTotal&&(A.grandTotal.indexOf(v)>=0),subtotals:A.subtotals&&(A.subtotals.indexOf(v)>=0)};if(p.unit){var u=this.findPropertyInfo(p.unit);if(u){this._mAggregate[p.path].unit=u.path;}}if(p.extension.defaultAggregate.contextDefiningProperties){p.extension.defaultAggregate.contextDefiningProperties.forEach(function(C){var D=this.findPropertyInfo(C);if(D&&(D.groupable||D.key)){this._mGroup[D.path]={};}}.bind(this));}}}.bind(this));this._aGroupLevels=[];this._aGroupLevelFormatters=[];if(A.groupLevels){A.groupLevels.forEach(function(g){var p=this.findPropertyInfo(g);if(p&&p.groupable){this._aGroupLevels.push(p.path);var f=(p.groupingDetails&&p.groupingDetails.formatter)||a;this._aGroupLevelFormatters.push(f);}}.bind(this));}Object.keys(this._mGroup).forEach(function(k){if(this._mAggregate.hasOwnProperty(k)){if(this._mAggregate[k].grandTotal||this._mAggregate[k].subtotals){delete this._mGroup[k];}else{delete this._mAggregate[k];}}}.bind(this));}this.updateAggregation();};function e(r){var B=r.getRowBindingContext();if(B){B.expand();}}function c(r){var B=r.getRowBindingContext();if(B){B.collapse();}}V.prototype.setTotalSummaryOnTop=function(v){this.setProperty("totalSummaryOnTop",v,true);this.updateAggregation();};V.prototype.setTotalSummaryOnBottom=function(v){this.setProperty("totalSummaryOnBottom",v,true);this.updateAggregation();};V.prototype.setGroupSummary=function(v){this.setProperty("groupSummary",v,true);this.updateAggregation();};V.prototype.updateAggregation=function(){var B=this.getTableBinding();if(!B){return;}var A={aggregate:d(this._mAggregate),group:d(this._mGroup),groupLevels:this._aGroupLevels?this._aGroupLevels.slice():undefined};h(this,A);b(this,A);B.setAggregation(A);};function h(p,A){var t=p.getTotalSummaryOnTop();var s=p.getTotalSummaryOnBottom();var S=t==="On"||t==="Fixed";var f=s==="On"||s==="Fixed";var H=Object.keys(A.aggregate).some(function(k){return A.aggregate[k].grandTotal;});if(S&&f){A.grandTotalAtBottomOnly=false;}else if(f){A.grandTotalAtBottomOnly=true;}else if(S){A.grandTotalAtBottomOnly=undefined;}else{Object.keys(A.aggregate).forEach(function(k){delete A.aggregate[k].grandTotal;});}p.setRowCountConstraints({fixedTop:t==="Fixed"&&H,fixedBottom:s==="Fixed"&&H});}function b(p,A){var g=p.getGroupSummary();if(g==="Top"){A.subtotalsAtBottomOnly=undefined;}else if(g==="Bottom"){A.subtotalsAtBottomOnly=true;}else if(g==="TopAndBottom"){A.subtotalsAtBottomOnly=false;}else{Object.keys(A.aggregate).forEach(function(k){delete A.aggregate[k].subtotals;});}}return V;});