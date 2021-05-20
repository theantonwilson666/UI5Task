/*!
 * OpenUI5
 * (c) Copyright 2009-2021 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Core","sap/m/ResponsivePopover","sap/m/List","sap/m/Bar","sap/m/SearchField","sap/m/StandardListItem","sap/ui/core/InvisibleText","sap/m/library","sap/ui/Device","sap/ui/mdc/chart/DimensionItem","sap/ui/mdc/chart/ChartSettings"],function(C,R,L,B,S,a,I,M,D,b,c){"use strict";var P=M.PlacementType;var d=M.ListType;var e=M.ListMode;function _(m){var g=m.getControlDelegate().getDrillStack();var s=[];g.forEach(function(o){o.dimension.forEach(function(h){if(h!=null&&h!=""&&s.indexOf(h)==-1){s.push(h);}});});return s;}var f=function(){};f.createDrillDownPopover=function(m){var l=new L({mode:e.SingleSelectMaster,selectionChange:function(o){var g=o.getParameter("listItem");if(g){m.getEngine().createChanges({control:m,key:"Item",state:[{name:g.data("dim").name,position:m.getItems().length}]});}p.close();}});var s=new B();var p=new R({contentWidth:"25rem",contentHeight:"20rem",placement:P.Bottom,subHeader:s});var r=C.getLibraryResourceBundle("sap.ui.mdc");if(D.system.desktop){var i=new I({text:r.getText("chart.CHART_DRILLDOWN_TITLE")});p.setShowHeader(false);p.addContent(i);p.addAriaLabelledBy(i);}else{p.setTitle(r.getText("chart.CHART_DRILLDOWN_TITLE"));}p.addContent(l);m._oDrillDownPopover=p;return p;};f.showDrillDownPopover=function(m,o){var p=m.getControlDelegate().getSortedDimensions(m);return p.then(function(s){var g=m._oDrillDownPopover;var h=g.getContent()[1];var j,k,l;h.destroyItems();j=_(m);for(var i=0;i<s.length;i++){k=s[i];if(j.indexOf(k.name)>-1){continue;}l=new a({title:k.label,type:d.Active});l.data("dim",k);h.addItem(l);}return new Promise(function(r,n){g.attachEventOnce("afterOpen",function t(q){r(g);});g.openBy(o);});});};return f;});