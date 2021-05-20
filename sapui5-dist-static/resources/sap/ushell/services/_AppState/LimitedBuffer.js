// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
sap.ui.define([],function(){"use strict";function L(c){this.index=-1;this.capacity=c;this.array=[];}L.prototype._clear=function(){this.array=[];this.index=-1;};L.prototype.addAsHead=function(k,v,p,P){this.index=(this.index+1)%this.capacity;this.array[this.index]={key:k,value:v,persistencyMethod:p,persistencySettings:P};};L.prototype.getByKey=function(k){var i,e;for(i=0;i<=this.capacity-1;i=i+1){e=(this.capacity+this.index-i)%this.capacity;if(this.array[e]&&this.array[e].key===k){return this.array[e];}}return undefined;};L.prototype.deleteByKey=function(k){var i,e,r=false;for(i=0;i<=this.capacity-1;i=i+1){e=(this.capacity+this.index-i)%this.capacity;if(this.array[e]&&this.array[e].key===k){delete this.array[e];r=true;}}return r;};return L;});