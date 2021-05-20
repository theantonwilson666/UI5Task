// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/mvc/Controller","sap/ushell/components/tiles/utils","sap/ui/core/format/NumberFormat","sap/ushell/Config","sap/ushell/services/AppType","sap/ushell/utils/WindowUtils","sap/ui/model/json/JSONModel","sap/m/library","sap/ushell/library","sap/base/Log","sap/base/util/merge","sap/ushell/utils/DynamicTileRequest"],function(C,u,N,a,A,W,J,m,b,L,c,D){"use strict";var G=m.GenericTileScope;var d=b.DisplayFormat;var e="sap.ushell.components.tiles.cdm.applauncherdynamic.DynamicTile";return C.extend(e,{timer:null,_aDoableObject:{},oDataRequest:null,_getConfiguration:function(v){var o={};var U;var h;o.configuration=v.configuration;o.properties=v.properties;o.properties.info=o.properties.info||"";o.properties.number_value="...";o.properties.number_value_state="Neutral";o.properties.number_state_arrow="None";o.properties.number_factor="";o.properties.number_unit=o.properties.numberUnit||"";var s=o.configuration["sap-system"];var t=o.properties.targetURL;if(t&&s){U=sap.ushell.Container.getService("URLParsing");if(U.isIntentUrl(t)){h=U.parseShellHash(t);if(!h.params){h.params={};}h.params["sap-system"]=s;t="#"+U.constructShellHash(h);}else{t+=((t.indexOf("?")<0)?"?":"&")+"sap-system="+s;}o.properties.targetURL=t;}o.properties.sizeBehavior=a.last("/core/home/sizeBehavior");o.properties.wrappingType=a.last("/core/home/wrappingType");return o;},onInit:function(){var v=this.getView();var M=new J();var V=v.getViewData();var o=V.properties;M.setData(this._getConfiguration(V));var s=o.contentProviderId;if(a.last("/core/contentProviders/providerInfo/show")){this.oSystemContextPromise=sap.ushell.Container.getServiceAsync("ClientSideTargetResolution").then(function(f){return f.getSystemContext(s);}).then(function(S){M.setProperty("/properties/contentProviderLabel",S.label);}).catch(function(E){L.error("DynamicTile.controller threw an error:",E);});}switch(o.displayFormat){case d.Flat:M.setProperty("/properties/frameType","OneByHalf");break;case d.FlatWide:M.setProperty("/properties/frameType","TwoByHalf");break;case d.StandardWide:M.setProperty("/properties/frameType","TwoByOne");break;default:{M.setProperty("/properties/frameType","OneByOne");}}v.setModel(M);this._aDoableObject=a.on("/core/home/sizeBehavior").do(function(S){M.setProperty("/properties/sizeBehavior",S);});},refreshHandler:function(){this.loadData(0);},visibleHandler:function(i){if(i){if(!this.oDataRequest||this.timer===null){this.initUpdateDynamicData();}}else{this.stopRequests();}},updateVisualPropertiesHandler:function(n){var p=this.getView().getModel().getProperty("/properties");var f=false;if(typeof n.title!=="undefined"){p.title=n.title;f=true;}if(typeof n.subtitle!=="undefined"){p.subtitle=n.subtitle;f=true;}if(typeof n.icon!=="undefined"){p.icon=n.icon;f=true;}if(typeof n.targetURL!=="undefined"){p.targetURL=n.targetURL;f=true;}if(typeof n.info!=="undefined"){p.info=n.info;f=true;}if(f){this.getView().getModel().setProperty("/properties",p);}},stopRequests:function(){if(this.timer){clearTimeout(this.timer);this.timer=null;}if(this.oDataRequest){this.oDataRequest.abort();}},onPress:function(E){if(E.getSource().getScope&&E.getSource().getScope()===G.Display){var t=this.getView().getModel().getProperty("/properties/targetURL"),T=this.getView().getModel().getProperty("/properties/title");if(!t){return;}else if(t[0]==="#"){hasher.setHash(t);}else{var l=a.last("/core/shell/enableRecentActivity")&&a.last("/core/shell/enableRecentActivityLogging");if(l){var r={title:T,appType:A.URL,url:t,appId:t};sap.ushell.Container.getRenderer("fiori2").logRecentActivity(r);}W.openURL(t,"_blank");}}},initUpdateDynamicData:function(){var M=this.getView().getModel();var s=M.getProperty("/configuration/serviceUrl");var S=M.getProperty("/configuration/serviceRefreshInterval");if(!S){S=0;}else if(S<10){L.warning("Refresh Interval "+S+" seconds for service URL "+s+" is less than 10 seconds, which is not supported. Increased to 10 seconds automatically.",null,e);S=10;}if(s){this.loadData(S);}},successHandlerFn:function(r){this.updatePropertiesHandler(r);},errorHandlerFn:function(M){var s=M&&M.message?M.message:M;var U=this.getView().getModel().getProperty("/configuration/serviceUrl");if(M.statusText==="Abort"){L.info("Data request from service "+U+" was aborted",null,e);}else{if(M.response){s+=" - "+M.response.statusCode+" "+M.response.statusText;}L.error("Failed to update data via service "+U+": "+s,null,e);this._setTileIntoErrorState();}},_setTileIntoErrorState:function(){var r=u.getResourceBundleModel().getResourceBundle();this.updatePropertiesHandler({number:"???",info:r.getText("dynamic_data.error")});},loadData:function(s){var M=this.getView().getModel();var U=M.getProperty("/configuration/serviceUrl");var f=M.getProperty("/properties/contentProviderId");if(!U){L.error("No service URL given!",e);this._setTileIntoErrorState();return;}if(!this.oDataRequest||this.oDataRequest.sUrl!==U){if(this.oDataRequest){this.oDataRequest.destroy();}this.sRequestUrl=U;this.oDataRequest=new D(U,this.successHandlerFn.bind(this),this.errorHandlerFn.bind(this),f);}else if(this.oDataRequest){this.oDataRequest.refresh();}if(s>0){L.info("Wait "+s+" seconds before calling "+U+" again",null,e);this.timer=setTimeout(this.loadData.bind(this,s),(s*1000));}},onExit:function(){if(this.oDataRequest){this.stopRequests();this.oDataRequest.destroy();}this._aDoableObject.off();},addParamsToUrl:function(U,t){var p="",f=U.indexOf("?")!==-1,i;if(t&&t.length>0){for(i=0;i<t.length;i=i+1){p+=t[i];if(i<t.length-1){p+="&";}}}if(p.length>0){if(!f){U+="?";}else{U+="&";}U+=p;}return U;},_normalizeNumber:function(n,f,g,i){var h;if(isNaN(n)){h=n;}else{var o=N.getFloatInstance({maxFractionDigits:i});if(!g){var j=Math.abs(n);if(j>=1000000000){g="B";n/=1000000000;}else if(j>=1000000){g="M";n/=1000000;}else if(j>=1000){g="K";n/=1000;}}h=o.format(n);}var k=h;var l=k[f-1];f-=(l==="."||l===",")?1:0;k=k.substring(0,f);return{displayNumber:k,numberFactor:g};},updatePropertiesHandler:function(o){var f=u.getResourceBundleModel().getResourceBundle().getText("dynamic_data.error");var p=this.getView().getModel().getProperty("/properties");var U={title:o.title||p.title||"",subtitle:o.subtitle||p.subtitle||"",icon:o.icon||p.icon||"",targetURL:o.targetURL||p.targetURL||"",number_value:!isNaN(o.number)?o.number:"...",number_digits:o.numberDigits>=0?o.numberDigits:4,info:p.info===f?o.info||"":o.info||p.info||"",number_unit:o.numberUnit||p.number_unit||"",number_state_arrow:o.stateArrow||p.number_state_arrow||"None",number_value_state:o.numberState||p.number_value_state||"Neutral",number_factor:o.numberFactor||p.number_factor||""};var t=[];if(o.targetParams){t.push(o.targetParams);}if(o.results){var s,g,i,n;var h=0;for(i=0,n=o.results.length;i<n;i=i+1){g=o.results[i].number||0;if(typeof g==="string"){g=parseInt(g,10);}h=h+g;s=o.results[i].targetParams;if(s){t.push(s);}}U.number_value=h;}if(t.length>0){U.targetURL=this.addParamsToUrl(U.targetURL,t);}if(!isNaN(o.number)){if(typeof o.number==="string"){o.number=o.number.trim();}var S=this._shouldProcessDigits(o.number,o.numberDigits),j=U.icon?4:5;if(o.number&&o.number.length>=j||S){var k=this._normalizeNumber(o.number,j,o.numberFactor,o.numberDigits);U.number_factor=k.numberFactor;U.number_value=k.displayNumber;}else{var l=N.getFloatInstance({maxFractionDigits:j});U.number_value=l.format(o.number);}}if(U.number_value_state){switch(U.number_value_state){case"Positive":U.number_value_state="Good";break;case"Negative":U.number_value_state="Error";break;default:}}U.sizeBehavior=a.last("/core/home/sizeBehavior");c(p,U);this.getView().getModel().refresh();},_shouldProcessDigits:function(s,i){var n;s=typeof(s)!=="string"?s.toString():s;if(s.indexOf(".")!==-1){n=s.split(".")[1].length;if(n>i){return true;}}return false;},formatters:{leanURL:W.getLeanURL}});},true);