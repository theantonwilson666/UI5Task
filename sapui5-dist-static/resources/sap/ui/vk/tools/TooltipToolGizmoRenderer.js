/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var T={};T.render=function(r,c){r.write("<div");r.writeControlData(c);r.addClass("sapUiVizKitTooltip");if(c.getParent().getAnimate()){r.addClass("sapUiVizKitTooltipAnimation");}r.writeClasses();r.write(">");r.write("</div>");};return T;},true);
