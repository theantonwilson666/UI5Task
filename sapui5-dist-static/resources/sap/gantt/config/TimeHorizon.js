/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/Element","sap/gantt/misc/Format"],function(E,F){"use strict";var T=E.extend("sap.gantt.config.TimeHorizon",{metadata:{library:"sap.gantt",properties:{startTime:{type:"string",group:"Misc",defaultValue:undefined},endTime:{type:"string",group:"Misc",defaultValue:undefined}}}});T.prototype.setStartTime=function(s,S){this._allowGanttInitialRender();return this.setProperty("startTime",this._convertTimestamp(s),S);};T.prototype.setEndTime=function(e,s){this._allowGanttInitialRender();return this.setProperty("endTime",this._convertTimestamp(e),s);};T.prototype.equals=function(t){return this.getStartTime()===t.getStartTime()&&this.getEndTime()===t.getEndTime();};T.prototype._allowGanttInitialRender=function(){var p=this.getParent();if(p&&typeof p.getParent==="function"){var s=p.getParent();if(s&&s.isA("sap.gantt.simple.GanttChartWithTable")){delete s._bPreventInitialRender;}}};T.prototype._convertTimestamp=function(t){var r=t;if(r&&typeof r==="object"){r=F.dateToAbapTimestamp(r);}return r;};return T;},true);
