/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(['sap/apf/utils/utils','sap/apf/utils/filter','sap/apf/utils/hashtable','sap/apf/core/utils/checkForTimeout','sap/apf/core/utils/uriGenerator','sap/apf/core/utils/fileExists','sap/apf/core/utils/annotationHandler','sap/apf/core/utils/filter','sap/apf/core/messageHandler','sap/apf/core/path','sap/apf/core/persistence','sap/apf/core/metadataFactory','sap/apf/core/textResourceHandler','sap/apf/core/configurationFactory','sap/apf/core/sessionHandler','sap/apf/core/resourcePathHandler','sap/apf/core/constants','sap/apf/cloudFoundry/analysisPathProxy','sap/apf/cloudFoundry/ajaxHandler','sap/ui/comp/smartfilterbar/ControlConfiguration','sap/apf/core/metadataProperty','sap/apf/core/metadataFacade','sap/apf/core/metadata','sap/apf/core/readRequestByRequiredFilter'],function(u,a,H,c,b,F,A,d,M,P,e,f,T,C,S,R,g,h,j,k,l,m,n,o){'use strict';jQuery.sap.require("sap.apf.core.ajax");jQuery.sap.require("sap.apf.core.odataRequest");jQuery.sap.require("sap.apf.core.entityTypeMetadata");jQuery.sap.require("sap.apf.core.readRequest");f=f||sap.apf.core.MetadataFactory;T=T||sap.apf.core.TextResourceHandler;C=C||sap.apf.core.ConfigurationFactory;S=S||sap.apf.core.SessionHandler;R=R||sap.apf.core.ResourcePathHandler;function I(p){var t=this;var q;var r,s,v;var w=p.instances.messageHandler;var x=p.instances.startParameter;p.constructors=p.constructors||{};var y=(p.functions&&p.functions.checkForTimeout)||c;var z={instances:{messageHandler:w,coreApi:this},constructors:{Request:p.constructors.Request},exits:{binding:{afterGetFilter:p.exits&&p.exits.binding&&p.exits.binding.afterGetFilter},path:{beforeAddingToCumulatedFilter:p.exits&&p.exits.path&&p.exits.path.beforeAddingToCumulatedFilter}},functions:p.functions};var B;var D;var E;var G;var J;var K;var L;var N;var O;var Q;var U=p&&p.instances&&p.instances.datajs||OData;this.destroy=function(){J.destroy();};this.ajax=function(i){var Z=jQuery.extend(true,{},i);Z.functions=Z.functions||{};Z.functions.getSapSystem=x.getSapSystem;if(p.functions&&p.functions.ajax){Z.functions.ajax=p.functions.ajax;}Z.instances=Z.instances||{};Z.instances.messageHandler=w;return sap.apf.core.ajax(Z);};this.odataRequest=function(i,Z,$,_){var z={instances:{datajs:U},functions:{getSapSystem:x.getSapSystem}};var a1=(p&&p.functions&&p.functions.odataRequest)||sap.apf.core.odataRequestWrapper;a1(z,i,Z,$,_);};this.getStartParameterFacade=function(){return x;};this.getMessageHandler=function(){return w;};this.putMessage=function(i){return w.putMessage(i);};this.check=function(i,Z,$){return w.check(i,Z,$);};this.createMessageObject=function(i){return w.createMessageObject(i);};this.activateOnErrorHandling=function(i){w.activateOnErrorHandling(i);};this.setCallbackForMessageHandling=function(i){w.setMessageCallback(i);};this.getLogMessages=function(){return w.getLogMessages();};this.checkForTimeout=function(i){var Z=y(i);if(Z){w.putMessage(Z);}return Z;};this.getUriGenerator=function(){return b;};this.getMetadata=function(i){return D.getMetadata(i);};this.getMetadataFacade=function(){return D.getMetadataFacade();};this.getEntityTypeMetadata=function(i,Z){return D.getEntityTypeMetadata(i,Z);};this.loadApplicationConfig=function(i){B.loadConfigFromFilePath(i);};this.loadTextElements=function(i){E.loadTextElements(i);};this.registerTextWithKey=function(i,Z){E.registerTextWithKey(i,Z);};this.getApplicationConfigProperties=function(){return B.getConfigurationProperties();};this.getResourceLocation=function(i){return B.getResourceLocation(i);};this.getPersistenceConfiguration=function(){return B.getPersistenceConfiguration();};this.getCategories=function(){return G.getCategories();};this.existsConfiguration=function(i){return G.existsConfiguration(i);};this.getStepTemplates=function(){return G.getStepTemplates();};this.getConfigurationObjectById=function(i){return G.getConfigurationById(i);};this.registerSmartFilterBarInstance=function(i){if(!Q){Q=jQuery.Deferred();}Q.resolve(i);};this.getSmartFilterBarAsPromise=function(){if(!Q){Q=jQuery.Deferred();}this.getSmartFilterBarConfigurationAsPromise().done(function(i){if(!i){Q.resolve(null);}});return Q;};this.getSmartFilterBarConfigurationAsPromise=function(){return G.getSmartFilterBarConfiguration();};this.getSmartFilterBarPersistenceKey=function(i){return"APF"+G.getConfigHeader().AnalyticalConfiguration+i;};this.getSmartFilterbarDefaultFilterValues=function(){var i=jQuery.Deferred();var Z=[];p.functions.getCombinedContext().done(function(_){_.getProperties().forEach(function(a1){var b1={key:a1,visibleInAdvancedArea:true,defaultFilterValues:$(_,a1)};Z.push(new sap.ui.comp.smartfilterbar.ControlConfiguration(b1));});i.resolve(Z);});return i;function $(_,a1){var b1=_.getFilterTermsForProperty(a1);var i=[];b1.forEach(function(c1){var d1=new sap.ui.comp.smartfilterbar.SelectOption({low:c1.getValue(),operator:c1.getOp(),high:c1.getHighValue(),sign:'I'});i.push(d1);});return i;}};this.getReducedCombinedContext=function(){var i=jQuery.Deferred();p.functions.getCombinedContext().done(function(Z){var $=t.getSmartFilterBarAsPromise();$.done(function(_){if(!_){i.resolve(Z);return;}var a1=new d(p.instances.messageHandler);var b1=_.getFilters();b1.forEach(function(c1){a1.addAnd(d.transformUI5FilterToInternal(p.instances.messageHandler,c1));});i.resolve(Z.removeTermsByProperty(a1.getProperties()));});});return i;};this.getFacetFilterConfigurations=function(){return G.getFacetFilterConfigurations();};this.getNavigationTargets=function(){return G.getNavigationTargets();};this.createStep=function(i,Z,$){var _;w.check(i!==undefined&&typeof i==="string"&&i.length!==0,"sStepID is  unknown or undefined");_=G.createStep(i,$);J.addStep(_,Z);return _;};this.getSteps=function(){return J.getSteps();};this.moveStepToPosition=function(i,Z,$){J.moveStepToPosition(i,Z,$);};this.updatePath=function(i,Z){J.update(i,Z);};this.removeStep=function(i,Z){J.removeStep(i,Z);};this.resetPath=function(){if(J){J.destroy();}J=new P.constructor(z);};this.stepIsActive=function(i){return J.stepIsActive(i);};this.isApfStateAvailable=function(){return K.isApfStateAvailable();};this.storeApfState=function(){K.storeApfState();};this.restoreApfState=function(){return K.restoreApfState();};this.serialize=function(){var i=J.serialize();t.getSmartFilterBarAsPromise().done(function(Z){if(Z){i.smartFilterBar=Z.fetchVariant();}});return i;};this.deserialize=function(i){if(i.smartFilterBar){if(!Q){Q=jQuery.Deferred();}Q.done(function(Z){Z._apfOpenPath=true;Z.applyVariant(i.smartFilterBar);Z.clearVariantSelection();Z.fireFilterChange();});}J.deserialize(i);};this.getTextNotHtmlEncoded=function(i,Z){return E.getTextNotHtmlEncoded(i,Z);};this.getTextHtmlEncoded=function(i,Z){return E.getTextHtmlEncoded(i,Z);};this.isInitialTextKey=function(i){return(i===g.textKeyForInitialText);};this.getMessageText=function(i,Z){return E.getMessageText(i,Z);};this.getXsrfToken=function(i){return K.getXsrfToken(i);};this.setDirtyState=function(i){K.setDirtyState(i);};this.isDirty=function(){return K.isDirty();};this.setPathName=function(i){K.setPathName(i);};this.getPathName=function(){return K.getPathName();};this.getCumulativeFilter=function(){return p.functions.getCumulativeFilter();};this.createReadRequest=function(i){var Z=G.createRequest(i);var $;if(typeof i==='string'){$=G.getConfigurationById(i);}else{$=i;}return new sap.apf.core.ReadRequest(z,Z,$.service,$.entityType);};this.createReadRequestByRequiredFilter=function(i){var Z=G.createRequest(i);var $;if(typeof i==='string'){$=G.getConfigurationById(i);}else{$=i;}return new o(z,Z,$.service,$.entityType);};this.loadMessageConfiguration=function(i,Z){w.loadConfig(i,Z);};this.loadAnalyticalConfiguration=function(i){G.loadConfig(i);};this.savePath=function(i,Z,$,_){var a1;var b1;var c1;var d1;if(typeof i==='string'&&typeof Z==='string'&&typeof $==='function'){a1=i;b1=Z;c1=$;d1=_;this.setPathName(b1);L.modifyPath(a1,b1,c1,d1);}else if(typeof i==='string'&&typeof Z==='function'){b1=i;c1=Z;d1=$;this.setPathName(b1);L.createPath(b1,c1,d1);}else{w.putMessage(w.createMessageObject({code:"5027",aParameters:[i,Z,$]}));}};this.readPaths=function(i){L.readPaths(i);};this.openPath=function(i,Z){function $(_,a1,b1){if(!b1){t.setPathName(_.path.AnalysisPathName);}Z(_,a1,b1);}return L.openPath(i,$);};this.deletePath=function(i,Z){L.deletePath(i,Z);};this.createFilter=function(i){return new a(w,i);};this.getActiveStep=function(){return J.getActiveSteps()[0];};this.getCumulativeFilterUpToActiveStep=function(){return J.getCumulativeFilterUpToActiveStep();};this.setActiveStep=function(Z){J.makeStepActive(Z);var $=J.getActiveSteps();var i;for(i=0;i<$.length;++i){J.makeStepInactive($[i]);}return J.makeStepActive(Z);};this.createFirstStep=function(i,Z,$){var _=false;var a1;a1=t.getStepTemplates();a1.forEach(function(b1){_=b1.id===i?true:_;});if(!_){w.putMessage(w.createMessageObject({code:'5036',aParameters:[i]}));}else{t.createStep(i,$,Z);}};this.getFunctionCreateRequest=function(){return G.createRequest;};this.getAnnotationsForService=function(i){return N.getAnnotationsForService(i);};this.checkAddStep=function(i){return J.checkAddStep(i);};this.getPathFilterInformation=function(){return J.getFilterInformation();};this.getGenericExit=function(i){if(p&&p.exits&&p.exits[i]&&typeof p.exits[i]==='function'){return p.exits[i];}return undefined;};this.getComponent=function(){return p&&p.instances&&p.instances.component;};E=new((p.constructors.TextResourceHandler)||sap.apf.core.TextResourceHandler)(z);w.setTextResourceHandler(E);if(p.manifests){z.manifests=p.manifests;}O=new((p.constructors.FileExists)||F)({functions:{ajax:t.ajax,getSapSystem:x.getSapSystem}});var V={manifests:p.manifests,functions:{getSapSystem:x.getSapSystem,getComponentNameFromManifest:u.getComponentNameFromManifest,getODataPath:b.getODataPath,getBaseURLOfComponent:b.getBaseURLOfComponent,addRelativeToAbsoluteURL:b.addRelativeToAbsoluteURL},instances:{fileExists:O}};N=new((p.constructors.AnnotationHandler)||A.constructor)(V);G=new((p.constructors.ConfigurationFactory)||sap.apf.core.ConfigurationFactory)(z);var W={constructors:{EntityTypeMetadata:sap.apf.core.EntityTypeMetadata,Hashtable:(p.constructors.Hashtable)||H,Metadata:(p.constructors.Metadata)||n,MetadataFacade:(p.constructors.MetadataFacade)||m,MetadataProperty:(p.constructors.MetadataProperty)||l,ODataModel:(p.constructors.ODataModel)||sap.ui.model.odata.v2.ODataModel},instances:{messageHandler:z.instances.messageHandler,coreApi:t,annotationHandler:N},functions:{getServiceDocuments:G.getServiceDocuments,getSapSystem:x.getSapSystem}};D=new(p.constructors.MetadataFactory||sap.apf.core.MetadataFactory)(W);J=new(p.constructors.Path||P.constructor)(z);K=new(p.constructors.SessionHandler||sap.apf.core.SessionHandler)(z);if(p.functions&&p.functions.isUsingCloudFoundryProxy){q=p.functions.isUsingCloudFoundryProxy;}else{q=function(){return false;};}if(q()){r={instances:{messageHandler:w},functions:{coreAjax:this.ajax}};s=(p.constructors.AjaxHandler||sap.apf.cloudFoundry.AjaxHandler);v=new s(r);}var X={instances:{messageHandler:w,coreApi:this},functions:{getComponentName:p.functions&&p.functions.getComponentName},manifests:p.manifests};if(p.constructors.Persistence){X.instances.ajaxHandler=v;L=new p.constructors.Persistence(X);}else if(q()){X.instances.ajaxHandler=v;L=new sap.apf.cloudFoundry.AnalysisPathProxy(X);}else{L=new e.constructor(X);}var Y={instances:{coreApi:t,messageHandler:z.instances.messageHandler,fileExists:O},functions:{checkForTimeout:y,initTextResourceHandlerAsPromise:E.loadResourceModelAsPromise,isUsingCloudFoundryProxy:q},corePromise:p.corePromise,manifests:p.manifests};if(p.constructors&&p.constructors.ProxyForAnalyticalConfiguration){Y.constructors={ProxyForAnalyticalConfiguration:p.constructors.ProxyForAnalyticalConfiguration};}B=new(p.constructors.ResourcePathHandler||sap.apf.core.ResourcePathHandler)(Y);if(p&&p.coreProbe){p.coreProbe({coreApi:this,startParameter:x,resourcePathHandler:B,textResourceHandler:E,configurationFactory:G,path:J,sessionHandler:K,persistence:L,fileExists:O,corePromise:p.corePromise});}}sap.apf=sap.apf||{};sap.apf.core=sap.apf.core||{};sap.apf.core.Instance=I;return{constructor:I};});