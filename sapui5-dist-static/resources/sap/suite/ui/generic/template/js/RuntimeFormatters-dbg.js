sap.ui.define(["sap/base/security/encodeXML",
	"sap/ui/model/odata/AnnotationHelper"
	], function (encodeXML, AnnotationHelperModel) {
	"use strict";

	var oRuntimeFormatters = {

		/**  
		* Return the value for the navigated property of the row. The value is always false for all non-FCL apps.
		* @param {string} sBindingPath of the row that is used to navigate to OP or Sub-OP
		* @return {boolean} true/false to set/unset the property
		*/
		setRowNavigated: function(sBindingPath) {
            // In case of UI tables, get the parent 'row' aggregation before fetching the binding context
			var oContext = this.getBindingContext() || this.getParent().getBindingContext();
			var sPath = oContext && oContext.getPath();
			return !!sPath && (sPath === sBindingPath);
		},
		
		encodeHTML: function (HTMLString) {
			return encodeXML(HTMLString);
		}		
	};

	return oRuntimeFormatters;
}, /* bExport= */ true);
