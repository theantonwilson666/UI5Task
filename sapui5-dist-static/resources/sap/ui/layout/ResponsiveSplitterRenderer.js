/*!
 * OpenUI5
 * (c) Copyright 2009-2021 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Core","sap/ui/core/IconPool"],function(C,I){"use strict";var r=C.getLibraryResourceBundle("sap.ui.layout");var R={apiVersion:2};I.insertFontFaceStyle();R.render=function(o,a){o.openStart("div",a).class("sapUiResponsiveSplitter").style("width",a.getWidth()).style("height",a.getHeight()).openEnd();var p=a.getAggregation("_pages");if(p){p.forEach(o.renderControl,o);this.renderPaginator(o,a);}o.close("div");};R.renderPaginator=function(o,a){var m=a._getMaxPageCount(),p=a.getAggregation("_pages")||[];o.openStart("div").attr("role","navigation").class("sapUiResponsiveSplitterPaginator").openEnd();o.openStart("div").class("sapUiResponsiveSplitterPaginatorNavButton").class("sapUiResponsiveSplitterHiddenPaginatorButton").class("sapUiResponsiveSplitterPaginatorButtonBack").openEnd().close("div");o.openStart("div").class("sapUiResponsiveSplitterPaginatorButtons").attr("role","radiogroup").attr("aria-label",r.getText("RESPONSIVE_SPLITTER_ARIA_PAGINATOR_LABEL"));if(p.length>0){o.attr("aria-controls",p[0].getParent().getId());}o.openEnd();for(var i=0;i<m;i++){o.openStart("div").attr("tabindex",0).attr("page-index",i);if(i===0){o.class("sapUiResponsiveSplitterPaginatorSelectedButton");}o.class("sapUiResponsiveSplitterHiddenElement").class("sapUiResponsiveSplitterPaginatorButton").attr("role","radio").attr("aria-checked",false).openEnd().close("div");}o.close("div");o.openStart("div").class("sapUiResponsiveSplitterPaginatorNavButton").class("sapUiResponsiveSplitterHiddenPaginatorButton").class("sapUiResponsiveSplitterPaginatorButtonForward").openEnd().close("div");o.close("div");};return R;},true);