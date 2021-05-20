sap.ui.define(["sap/base/util/isEmptyObject","sap/suite/ui/generic/template/genericUtilities/FeError"],function(a,F){"use strict";var c="listTemplates.semanticDateRangeTypeHelper";function g(){var M={type:"object",useDateRange:{type:"boolean",defaultValue:false},selectedValues:{type:"string",defaultValue:""},exclude:{type:"boolean",defaultValue:true},customDateRangeImplementation:{type:"string",defaultValue:""},fields:{type:"object"}};return M;}function b(p,L){var D={};if(p.filterSettings&&p.filterSettings.dateSettings){var i=e(L);D=h(i,p.filterSettings.dateSettings);if(p.filterSettings.dateSettings.hasOwnProperty("useDateRange")){if(p.filterSettings.dateSettings.useDateRange&&!a(D)){throw new F(c,"Setting 'useDateRange' property as True and maintaining property level configuration for date ranges in Date Settings are mutually exclusive, resulting in error. Change one of these settings in manifest.json as per your requirement.");}D.useDateRange=p.filterSettings.dateSettings.useDateRange;}if(!p.allControlConfiguration){p.allControlConfiguration=L["com.sap.vocabularies.UI.v1.SelectionFields"]?L["com.sap.vocabularies.UI.v1.SelectionFields"].slice():[];}p.allControlConfiguration=f(i,p.allControlConfiguration,D);}return D;}function d(p){return(((p.type==="Edm.DateTime"&&p["sap:display-format"]==="Date")||(p.type==="Edm.String"&&p["com.sap.vocabularies.Common.v1.IsCalendarDate"]&&p["com.sap.vocabularies.Common.v1.IsCalendarDate"].Bool==="true"))&&p["sap:filter-restriction"]==="interval");}function e(o){var p=o.property,D=[];for(var i=0;i<p.length;i++){var j={};if(d(p[i])){j.PropertyPath=p[i].name;}if(!a(j)){D.push(j);}}return D;}function f(D,s,o){for(var i=0;i<D.length;i++){if(o[D[i].PropertyPath]){var I=false;for(var j=0;j<s.length;j++){if(s[j].PropertyPath===D[i].PropertyPath){I=true;break;}}if(!I){D[i].bNotPartOfSelectionField=true;s.push(D[i]);}}}return s;}function h(D,o){var j={};for(var i=0;i<D.length;i++){if(o.fields&&o.fields[D[i].PropertyPath]){j[D[i].PropertyPath]=k(o.fields[D[i].PropertyPath]);}else if(o.customDateRangeImplementation||o.filter){j[D[i].PropertyPath]=k(o);}else if(o.customDateRangeImplementation||o.selectedValues){j[D[i].PropertyPath]=k(o);}}return j;}function k(D){var C;if(D.customDateRangeImplementation){C=D.customDateRangeImplementation;}else if(D.filter){C=JSON.stringify({module:"sap.ui.comp.config.condition.DateRangeType",operations:{filter:D.filter}});}else if(D.selectedValues){var o={path:"key",contains:D.selectedValues,exclude:(D.exclude!==undefined)?D.exclude:true};C=JSON.stringify({module:"sap.ui.comp.config.condition.DateRangeType",operations:{filter:[o]}});}else{throw new F(c,"Wrong Date Range configuration set in manifest");}return C;}function l(s,D){return D.hasOwnProperty(s);}function m(s,D){return D[s];}function n(p,o){var i=o&&o.getFiltersWithValues();if(i&&i.length===0){return true;}var s=o.mProperties.entityType;var L=o.getModel().getMetaModel().getODataEntityType(s);var D=Object.keys(b(p,L));return!D.find(function(j){return i.find(function(q){return j===q.mProperties.name;});});}return{getDateSettingsMetadata:g,getSemanticDateRangeSettingsForDateProperties:b,isDateRangeType:l,getConditionTypeForDateProperties:m,isServiceUrlAllowedBySemanticDateRangeFilter:n};},true);