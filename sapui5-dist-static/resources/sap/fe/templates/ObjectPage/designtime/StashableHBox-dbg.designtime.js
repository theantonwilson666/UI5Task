/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */

// Provides the Design Time Metadata for the sap.fe.templates.ObjectPage.controls.StashableHBox control
sap.ui.define([], function() {
	"use strict";
	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.fe.templates");
	return {
		actions: {
			remove: {
				changeType: "stashControl"
			},
			reveal: {
				changeType: "unstashControl"
			},
			rename: function(oHeaderFacet) {
				return {
					changeType: "renameHeaderFacet",
					domRef: function(oControl) {
						var oTitleControl = oControl.getTitleControl();
						if (oTitleControl) {
							return oTitleControl.getDomRef();
						} else {
							return null;
						}
					}
				};
			}
		},
		name: {
			singular: function() {
				return oResourceBundle.getText("T_STASHABLE_HBOX_RTA_HEADERFACET_MENU_ADD");
			},
			plural: function() {
				return oResourceBundle.getText("T_STASHABLE_HBOX_RTA_HEADERFACET_MENU_ADD_PLURAL");
			}
		},
		palette: {
			group: "LAYOUT",
			icons: {
				svg: "sap/m/designtime/HBox.icon.svg"
			}
		},
		templates: {
			create: "sap/m/designtime/HBox.create.fragment.xml"
		}
	};
});
