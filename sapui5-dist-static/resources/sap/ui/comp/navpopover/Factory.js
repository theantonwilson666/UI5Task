/*
 * ! SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.define(['sap/ui/comp/library'],function(C){"use strict";var F={getService:function(s){switch(s){case"CrossApplicationNavigation":return sap.ushell&&sap.ushell.Container&&sap.ushell.Container.getService("CrossApplicationNavigation");case"URLParsing":return sap.ushell&&sap.ushell.Container&&sap.ushell.Container.getService("URLParsing");default:return null;}}};return F;},true);
