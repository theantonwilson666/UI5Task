/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["./BaseRectangle","./BasePath","sap/gantt/misc/Utility"],function(B,a,U){"use strict";var b=B.extend("sap.gantt.simple.BaseDiamond",{metadata:{library:"sap.gantt",properties:{width:{type:"sap.gantt.SVGLength",defaultValue:"auto"},height:{type:"sap.gantt.SVGLength",defaultValue:"auto"}}},renderer:{apiVersion:2}});b.prototype.getD=function(){var x=this.getX(),w=this.getWidth(),h=this.getHeight(),y=this.getRowYCenter();var c=function(){var r="";for(var i=0;i<arguments.length;i++){r+=arguments[i]+" ";}return r;};return c("M",x,y-h/2,"l",w/2,h/2,"l",-w/2,h/2,"l",-w/2,-h/2)+"Z";};b.prototype.getWidth=function(){var w=this.getProperty("width");if(w==="auto"){return parseFloat(this._iBaseRowHeight*0.625,10);}if(w==="inherit"){return this._iBaseRowHeight;}return w;};b.prototype.renderElement=a.prototype.renderElement;b.prototype.getShapeAnchors=function(){var m=U.getShapeBias(this);return{head:{x:this.getX()-this.getWidth()/2+m.x,y:this.getRowYCenter()+m.y,dx:this.getWidth()/2,dy:this.getHeight()/2},tail:{x:this.getX()+this.getWidth()/2+m.x,y:this.getRowYCenter()+m.y,dx:this.getWidth()/2,dy:this.getHeight()/2}};};b.prototype.renderElement=function(){if(this._isValid()){a.prototype.renderElement.apply(this,arguments);}};return b;},true);
