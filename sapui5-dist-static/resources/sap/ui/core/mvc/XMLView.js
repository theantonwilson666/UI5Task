/*!
 * OpenUI5
 * (c) Copyright 2009-2021 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/thirdparty/jquery","./View","./XMLViewRenderer","./ViewType","sap/base/util/deepExtend","sap/ui/base/ManagedObject","sap/ui/core/XMLTemplateProcessor","sap/ui/core/Control","sap/ui/core/RenderManager","sap/ui/core/cache/CacheManager","sap/ui/model/resource/ResourceModel","sap/ui/util/XMLHelper","sap/base/strings/hash","sap/base/Log","sap/base/util/LoaderExtensions","sap/ui/performance/trace/Interaction","sap/ui/core/Core"],function(q,V,X,a,d,M,b,C,R,c,f,g,h,L,j,I){"use strict";var k=R.RenderPrefixes,x="XMLViewCacheError",n={};var l=C.extend("sap.ui.core.mvc.XMLAfterRenderingNotifier",{metadata:{library:"sap.ui.core"},renderer:{apiVersion:2,render:function(o,e){o.text("");}}});var m=V.extend("sap.ui.core.mvc.XMLView",{metadata:{library:"sap.ui.core",specialSettings:{containingView:{type:'sap.ui.core.mvc.XMLView',visibility:'hidden'},xmlNode:{type:'Element',visibility:'hidden'},cache:'Object',processingMode:{type:"string",visibility:"hidden"}},designtime:"sap/ui/core/designtime/mvc/XMLView.designtime"},renderer:X});sap.ui.xmlview=function(i,e){return sap.ui.view(i,e,a.XML);};m.create=function(o){var P=d({},o);P.viewContent=P.definition;P.async=true;P.type=a.XML;P.processingMode=P.processingMode||"sequential";return V.create(P);};m._sType=a.XML;m.asyncSupport=true;m._bUseCache=sap.ui.getCore().getConfiguration().getViewCache()&&c._isSupportedEnvironment();function v(e){if(e.parseError.errorCode!==0){var P=e.parseError;throw new Error("The following problem occurred: XML parse Error for "+P.url+" code: "+P.errorCode+" reason: "+P.reason+" src: "+P.srcText+" line: "+P.line+" linepos: "+P.linepos+" filepos: "+P.filepos);}}function p(o,S){if(!S){throw new Error("mSettings must be given");}else if(S.viewName&&S.viewContent){throw new Error("View name and view content are given. There is no point in doing this, so please decide.");}else if((S.viewName||S.viewContent)&&S.xmlNode){throw new Error("View name/content AND an XML node are given. There is no point in doing this, so please decide.");}else if(!(S.viewName||S.viewContent)&&!S.xmlNode){throw new Error("Neither view name/content nor an XML node is given. One of them is required.");}else if(S.cache&&!(S.cache.keys&&S.cache.keys.length)){throw new Error("No cache keys provided. At least one is required.");}}function r(o,S){o.mProperties["viewContent"]=S.viewContent;var e=g.parse(S.viewContent);v(e);return e.documentElement;}function s(o,S){if((o._resourceBundleName||o._resourceBundleUrl)&&(!S.models||!S.models[o._resourceBundleAlias])){var e=new f({bundleName:o._resourceBundleName,bundleUrl:o._resourceBundleUrl,bundleLocale:o._resourceBundleLocale,async:S.async});var i=e.getResourceBundle();if(i instanceof Promise){return i.then(function(){o.setModel(e,o._resourceBundleAlias);});}o.setModel(e,o._resourceBundleAlias);}}function t(o){o.oAfterRenderingNotifier=new l();o.oAfterRenderingNotifier.addDelegate({onAfterRendering:function(){o.onAfterRenderingBeforeChildren();}});}function u(S){var e=sap.ui.require("sap/ui/core/Component"),o;while(S&&e){var i=e.getOwnerComponentFor(S);if(i){S=o=i;}else{if(S instanceof e){o=S;}S=S.getParent&&S.getParent();}}return o;}function w(o,e){var i=u(o),G=i?JSON.stringify(i.getManifest()):null,H=[];H=H.concat(A(o,i),D(),B(o),e.keys);return z(o,H).then(function(K){return{key:K+"("+h(G||"")+")",componentManifest:G,additionalData:e.additionalData};});}function y(K){return K;}function z(o,i){return Promise.all(i).then(function(K){K=K.filter(function(G){return G!==n;});if(K.every(y)){return K.join('_');}else{var e=new Error("Provided cache keys may not be empty or undefined.");e.name=x;return Promise.reject(e);}});}function A(o,e){var i=e&&e.getMetadata().getName();return[i||window.location.host+window.location.pathname,o.getId(),sap.ui.getCore().getConfiguration().getLanguageTag()].concat(e&&e.getActiveTerminologies()||[]);}function B(e){var P=e.getPreprocessors(),i=e.getPreprocessorInfo(false),G=[];function H(o){G.push(o.preprocessor.then(function(J){if(J.getCacheKey){return J.getCacheKey(i);}else{return n;}}));}for(var T in P){P[T].forEach(H);}return G;}function D(){return sap.ui.getVersionInfo({async:true}).then(function(i){var T="";if(!i.libraries){T=sap.ui.buildinfo.buildtime;}else{i.libraries.forEach(function(o){T+=o.buildTimestamp;});}return T;}).catch(function(e){L.warning("sap.ui.getVersionInfo could not be retrieved","sap.ui.core.mvc.XMLView");L.debug(e);return"";});}function E(e,i){var K=e.key;delete e.key;e.xml=g.serialize(i);return c.set(K,e);}function F(e){return c.get(e.key).then(function(i){if(i&&i.componentManifest==e.componentManifest){i.xml=g.parse(i.xml,"application/xml").documentElement;if(i.additionalData){d(e.additionalData,i.additionalData);}return i;}});}m.prototype.initViewSettings=function(S){var e=this,_;function i(O){e._xContent=O;if(V._supportInfo){V._supportInfo({context:e._xContent,env:{caller:"view",viewinfo:d({},e),settings:d({},S||{}),type:"xmlview"}});}if(!e.isSubView()){var P={};b.parseViewAttributes(O,e,P);if(!S.async){Object.assign(S,P);}else{e.applySettings(P);}}else{delete S.controller;}var Q=s(e,S);if(Q instanceof Promise){return Q.then(function(){t(e);});}t(e);}function o(O,P){if(e.hasPreprocessor("viewxml")){return b.enrichTemplateIdsPromise(O,e,P).then(function(){return e.runPreprocessor("viewxml",O,!P);});}return O;}function G(O){var P=I.notifyAsyncStep("VIEW PREPROCESSING");return e.runPreprocessor("xml",O).then(function(O){return o(O,true);}).finally(P);}function H(N){return j.loadResource(N,{async:true}).then(function(O){return O.documentElement;});}function J(N,O){return H(N).then(G).then(function(P){if(O){E(O,P);}return P;});}function K(N,O){return w(e,O).then(function(P){return F(P).then(function(Q){if(!Q){return J(N,P);}else{return Q.xml;}});}).catch(function(P){if(P.name===x){L.debug(P.message,P.name,"sap.ui.core.mvc.XMLView");L.debug("Processing the View without caching.","sap.ui.core.mvc.XMLView");return J(N);}else{return Promise.reject(P);}});}this._oContainingView=S.containingView||this;this._sProcessingMode=S.processingMode;if(this.oAsyncState){this.oAsyncState.suppressPreserve=true;}p(this,S);if(S.viewName){var N=S.viewName.replace(/\./g,"/")+".view.xml";if(S.async){if(S.cache&&m._bUseCache){return K(N,S.cache).then(i);}else{return H(N).then(G).then(i);}}else{_=j.loadResource(N).documentElement;}}else if(S.viewContent){if(S.viewContent.nodeType===window.Node.DOCUMENT_NODE){_=S.viewContent.documentElement;}else{_=r(this,S);}}else if(S.xmlNode){_=S.xmlNode;}if(S.async){return G(_).then(i);}else{_=this.runPreprocessor("xml",_,true);_=o(_,false);if(_&&typeof _.getResult==='function'){if(_.isRejected()){throw _.getResult();}_=_.getResult();}i(_);}};m.prototype.onBeforeRendering=function(){var o=this.getDomRef();if(o&&!R.isPreservedContent(o)){R.preserveContent(o,true);}V.prototype.onBeforeRendering.apply(this,arguments);};m.prototype.exit=function(){if(this.oAfterRenderingNotifier){this.oAfterRenderingNotifier.destroy();}V.prototype.exit.apply(this,arguments);};m.prototype.onControllerConnected=function(o){var e=this;function i(H){return M.runWithPreprocessors(H,{settings:e._fnSettingsPreprocessor});}if(!this.oAsyncState){this._aParsedContent=i(b.parseTemplate.bind(null,this._xContent,this));}else{var G=I.notifyAsyncStep("VIEW PROCESSING");return b.parseTemplatePromise(this._xContent,this,true,{fnRunWithPreprocessor:i}).then(function(P){e._aParsedContent=P;delete e.oAsyncState.suppressPreserve;}).finally(G);}};m.prototype.getControllerName=function(){return this._controllerName;};m.prototype.isSubView=function(){return this._oContainingView!=this;};m.prototype.onAfterRenderingBeforeChildren=function(){if(this._$oldContent.length!==0){var e=this.getAggregation("content");if(e){for(var i=0;i<e.length;i++){var N=document.getElementById(k.Temporary+e[i].getId())||e[i].getDomRef()||document.getElementById(k.Invisible+e[i].getId());if(N){q(document.getElementById(k.Dummy+e[i].getId())).replaceWith(N);}}}q(document.getElementById(k.Temporary+this.getId())).replaceWith(this._$oldContent);}this._$oldContent=undefined;};m.prototype._onChildRerenderedEmpty=function(o,e){q(e).replaceWith('<div id="'+k.Dummy+o.getId()+'" class="sapUiHidden"></div>');return true;};m.registerPreprocessor=function(T,P,S,o,e){T=T.toUpperCase();if(m.PreprocessorType[T]){V.registerPreprocessor(m.PreprocessorType[T],P,this.getMetadata().getClass()._sType,S,o,e);}else{L.error("Preprocessor could not be registered due to unknown sType \""+T+"\"",this.getMetadata().getName());}};m.PreprocessorType={XML:"xml",VIEWXML:"viewxml",CONTROLS:"controls"};m.registerPreprocessor("xml","sap.ui.core.util.XMLPreprocessor",true,true);return m;});