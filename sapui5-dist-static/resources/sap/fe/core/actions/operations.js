/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/m/MessageBox","sap/m/Dialog","sap/ui/model/json/JSONModel","sap/ui/core/XMLTemplateProcessor","sap/ui/core/util/XMLPreprocessor","sap/ui/core/Fragment","sap/fe/core/actions/messageHandling","sap/fe/core/BusyLocker","sap/fe/core/helpers/SideEffectsUtil","sap/fe/core/helpers/StableIdHelper","sap/fe/core/CommonUtils","sap/base/Log","sap/fe/core/library","sap/ui/core/ValueState"],function(M,D,J,X,a,F,m,B,S,b,C,L,c,V){"use strict";var d=c.Constants;function e(A,i,j,P){if(!i||i.length===0){return Promise.reject("Bound actions always requires at least one context");}P=P||{};if(Array.isArray(i)){P.bReturnAsArray=true;}else{i=[i];}var u=j.getMetaModel(),v=u.getMetaPath(i[0].getPath())+"/"+A,w=u.createBindingContext(v+"/@$ui5.overload/0");P.aContexts=i;P.isCriticalAction=o(u,v,i,w);return k(A,j,w,P);}function f(A,i,P){if(!i){return Promise.reject("Action expects a model/context for execution");}var j=i.getMetaModel(),u=i.bindContext("/"+A).getPath(),v=j.createBindingContext("/"+j.createBindingContext(u).getObject("$Action")+"/0");P.isCriticalAction=o(j,u+"/@$ui5.overload");return k(A,i,v,P);}function g(i,j,u){if(!j){return Promise.reject("Bound functions always requires a context");}var v=u.getMetaModel(),w=v.getMetaPath(j.getPath())+"/"+i,x=v.createBindingContext(w);return _(i,u,x,j);}function h(i,j){var u=j.getMetaModel(),v=j.bindContext("/"+i).getPath(),w=u.createBindingContext("/"+u.createBindingContext(v).getObject("$Function")+"/0");return _(i,j,w);}function _(i,j,u,v){var w,G;if(!u||!u.getObject()){return Promise.reject(new Error("Function"+i+" not found"));}if(v){u=j.bindContext(i+"(...)",v);G="functionGroup";}else{u=j.bindContext("/"+i+"(...)");G="functionImport";}w=u.execute(G);j.submitBatch(G);return w.then(function(){return u.getBoundContext();});}function k(A,i,j,P){return new Promise(function(u,v){P=P||{};var w=P.actionParameters||[],x={},y,z,E=P.label,G=P.showActionParameterDialog,H=P.aContexts,I=P.bIsCreateAction,K=P.isCriticalAction,N,O,Q,R;if(!j||!j.getObject()){return v(new Error("Action"+A+" not found"));}if(G||w.length>0){w=p(j,w);if(!w||w.length===0){G=false;}}if(G){y=s;}else if(K){y=l;}x={fnOnSubmitted:P.onSubmitted,fnOnResponse:P.onResponse,actionName:A,model:i,aActionParameters:w,ownerComponent:P.ownerComponent,bGetBoundContext:P.bGetBoundContext};if(j.getObject("$IsBound")){if(P.additionalSideEffect&&P.additionalSideEffect.pathExpressions){N=i.getMetaModel();O=N.getMetaPath(H[0].getPath());Q=N.getObject(O+"/@com.sap.vocabularies.Common.v1.Messages/$Path");if(Q){R=P.additionalSideEffect.pathExpressions.findIndex(function(T){return T.$PropertyPath===Q;});if(R>-1){P.mBindingParameters=P.mBindingParameters||{};if(j.getObject("$ReturnType/$Type/"+Q)&&(!P.mBindingParameters.$select||P.mBindingParameters.$select.split(",").indexOf(Q)===-1)){P.mBindingParameters.$select=P.mBindingParameters.$select?P.mBindingParameters.$select+","+Q:Q;if(P.additionalSideEffect.triggerActions.length===0){P.additionalSideEffect.pathExpressions.splice(R,1);}}}}}x.aContexts=H;x.mBindingParameters=P.mBindingParameters;x.additionalSideEffect=P.additionalSideEffect;x.bGrouped=P.invocationGrouping==="ChangeSet";x.bReturnAsArray=P.bReturnAsArray;x.internalModelContext=P.internalModelContext;x.operationAvailableMap=P.operationAvailableMap;}if(I){x.bIsCreateAction=I;}if(y){z=y(A,E,x,w,j,P.parentControl,P.entitySetName);}else{z=q(x);}return z.then(function(T){u(T);}).catch(function(T){v(T);});});}function l(A,i,P,j,u,v,w){return new Promise(function(x,y){var z=A?A:null;z=z.indexOf(".")>=0?z.split(".")[z.split(".").length-1]:z;var E=z&&w?w+"|"+z:"";var R=v.getController().oResourceBundle;var G=C.getTranslatedText("C_OPERATIONS_ACTION_CONFIRM_MESSAGE",R,null,E);M.confirm(G,{onClose:function(H){if(H===M.Action.OK){return q(P).then(function(O){x(O);}).catch(function(I){m.showUnboundMessages().then(function(){y(I);}).catch(function(){y(I);});});}else{x();}}});});}function s(A,u,P,v,w,x,y){var z=r(w,A),E=w.getModel().oModel.getMetaModel(),G=E.createBindingContext(z),H=w.getObject("$IsBound")?w.getPath().split("/@$ui5.overload/0")[0]:w.getPath().split("/0")[0],I=E.createBindingContext(H),K="sap/fe/core/controls/ActionParameterDialog";return new Promise(function(N,O){var Q=X.loadTemplate(K,"fragment"),R=new J({$displayMode:{}}),T=[],U=[],W={},Y=function(){return Promise.all(U.filter(function(i){return i.getFields()[0].getRequired();}).map(function(i){var j=i.getFields()[0].getValue();if(j===undefined||j===null||j===""){return i.getLabel().getText();}})).then(function(i){i=i.filter(function(j){return j!==undefined;});return i;});},Z={handleChange:function(i){m.removeBoundTransitionMessages();var j=i.getSource();var $=i.getParameter("id");var a1=i.getParameter("promise");if(a1){W[$]=a1.then(function(){return j.getValue();});}}};return Promise.resolve(a.process(Q,{name:K},{bindingContexts:{action:w,actionName:I,entitySet:G},models:{action:w.getModel(),actionName:I.getModel(),entitySet:G.getModel(),metaModel:G.getModel()}})).then(function(Q){return C.setUserDefaults(P.ownerComponent,v,R,true).then(function(){return F.load({definition:Q,controller:Z}).then(function($){var a1;var b1=x.getController().oResourceBundle;var c1=new D({title:u||C.getTranslatedText("C_OPERATIONS_ACTION_PARAMETER_DIALOG_TITLE",b1),content:[$],escapeHandler:function(i){c1.close();m.removeUnboundTransitionMessages();O();},beginButton:{text:u||C.getTranslatedText("C_COMMON_DIALOG_OK",b1),type:"Emphasized",press:function(j){Y().then(function(f1){if(f1.length){var g1=sap.ui.getCore().getMessageManager();g1.removeAllMessages();var h1=[];for(var i=0;i<f1.length;i++){h1.push({text:C.getTranslatedText("C_OPERATIONS_ACTION_PARAMETER_DIALOG_MISSING_MANDATORY_MSG",b1,f1[i]),type:"Error"});}m.showUnboundMessages(h1);return;}var i1=sap.ui.getCore().getMessageManager().getMessageModel().getData();T=[];v.forEach(function(j1){var k1=j1.$Name;i1.forEach(function(l1){var m1=k1.replace("-inner","");if(l1.controlIds.length>0&&(l1.getControlId().includes("APD_::"+k1)||(l1.getControlId().includes("APD_::"+k1+"inner")&&T.indexOf("APD_::"+m1)<0))){T.push("APD_::"+m1);}});});if(T.length>0){return;}B.lock(c1);return Promise.all(Object.keys(W).map(function(j1){return W[j1];})).then(function(){m.removeUnboundTransitionMessages();var j1,k1=a1&&a1.getParameterContext();for(var i in v){j1=k1.getProperty(v[i].$Name);v[i].value=j1;j1=undefined;}return q(P).then(function(l1){c1.close();N(l1);}).catch(function(l1){throw l1;});}).catch(function(){return m.showUnboundMessages();}).finally(function(){B.unlock(c1);});}).catch(function(){return m.showUnboundMessages();});}},endButton:{text:C.getTranslatedText("C_COMMON_ACTION_PARAMETER_DIALOG_CANCEL",b1),press:function(){c1.close();m.removeUnboundTransitionMessages();O(d.CancelActionDialog);}},beforeOpen:function(){m.removeUnboundTransitionMessages();m.removeBoundTransitionMessages();var f1=function(h1){var i1=function(m1,j){return new Promise(function(N,O){if(j){if(e1.length>0&&j.$Path){a1.getParameterContext().requestProperty(j.$Path).then(function(s1){if(e1.length>1){var t1=j.$Path;if(t1.indexOf(h1+"/")===0){t1=t1.replace(h1+"/","");}for(var i=1;i<e1.length;i++){if(e1[i].getProperty(t1)!==s1){N({paramName:m1,value:undefined,bNoPossibleValue:true});}}}N({paramName:m1,value:s1});}).catch(function(){L.error("Error while reading default action parameter",m1,P.actionName);N({paramName:m1,value:undefined,bLatePropertyError:true});});}else{N({paramName:m1,value:j});}}else{if(R&&R.oData[m1]){N({paramName:m1,value:R.oData[m1]});}else{N({paramName:m1,value:undefined});}}});};var j1=function(m1){var j=c1.getModel().getMetaModel(),d1=w.sPath&&w.sPath.split("/@")[0],s1=d1+"/"+m1+"@",t1=j.getObject(s1),u1=t1&&t1["@com.sap.vocabularies.UI.v1.ParameterDefaultValue"];return u1;};var k1=function(){var j=c1.getModel().getMetaModel(),d1=w.sPath&&w.sPath.split("/@")[0],s1=j.getObject(d1+"@com.sap.vocabularies.Common.v1.DefaultValuesFunction");return s1;};var l1=[];var m1,n1;for(var i in v){m1=v[i].$Name;n1=j1(m1);l1.push(i1(m1,n1));}if(w.getObject("$IsBound")&&e1.length>0){var o1=k1();if(o1&&o1.length>0&&typeof o1==="string"){var p1=[];for(var i in e1){p1.push(g(o1,e1[i],P.model,P));}}}var q1=Promise.all(l1),r1=[];if(p1){r1=Promise.all(p1);}Promise.all([q1,r1]).then(function(s1){var l1=s1[0],p1=s1[1],t1;for(var i in v){t1=v[i].$Name;if(l1[i]&&l1[i].value){a1.setParameter(v[i].$Name,l1[i].value);}else if(o1&&!l1[i].bNoPossibleValue){if(e1.length>1){var j=0;while(j<e1.length-1){if(p1[j]&&p1[j+1]&&p1[j].getObject(t1)===p1[j+1].getObject(t1)){j++;}else{break;}}if(j===e1.length-1){a1.setParameter(v[i].$Name,p1[j].getObject(t1));}}else{if(p1[0]&&p1[0].getObject(t1)){a1.setParameter(v[i].$Name,p1[0].getObject(t1));}}}}var u1=l1.some(function(w1){if(w1.bLatePropertyError){return w1.bLatePropertyError;}});if(u1){var v1=b1.getText("C_APP_COMPONENT_SAPFE_ETAG_LATE_PROPERTY");M.warning(v1,{contentWidth:"25em"});}}).catch();};if(w.getObject("$IsBound")&&e1.length>0){var g1=w.getObject("$Parameter"),h1=g1[0]&&g1[0].$Name;e1[0].requestObject().then(function(i){if(i){a1.setParameter(h1,i);}f1(h1);}).catch(function(i){L.error("Error while retrieving the parameter",i);});}else{f1();}},afterClose:function(){c1.destroy();}});U=$.getAggregation("form").getAggregation("formContainers")[0].getAggregation("formElements");c1.setModel(w.getModel().oModel);c1.setModel(R,"paramsModel");c1.bindElement({path:"/",model:"paramsModel"});var d1=A+"(...)";var e1=P.aContexts||[];if(!e1.length){d1="/"+d1;}c1.bindElement({path:d1});if(x){x.addDependent(c1);}if(e1.length>0){c1.setBindingContext(e1[0]);}a1=c1.getObjectBinding();c1.open();});});}).catch(O);});}function p(A,P){var i=n(A);P=P||[];if(P.length>0){}return i;}function n(A){var P=A.getObject("$Parameter")||[];if(P&&P.length){if(A.getObject("$IsBound")){return P.slice(1,P.length)||[];}}return P;}function o(i,P,j,u){var A=i.getObject(P+"@com.sap.vocabularies.Common.v1.IsActionCritical"),v=A&&A.$Path;if(!v){return!!A;}var w=u&&u.getObject("$Parameter"),x=v&&v.split("/"),y=w&&w.length&&typeof w==="object"&&v&&j&&j.length;if(y){w.filter(function(z){var E=x&&x.indexOf(z.$Name);if(E>-1){x.splice(E,1);}});v=x.join("/");return j[0].getObject(v);}else if(v){return j[0].getObject(v);}}function q(P){var u=P.aContexts||[],v=P.model,E=m.getMessages().length||0,A=P.aActionParameters||[],w=P.actionName,O=P.fnOnSubmitted,x=P.fnOnResponse,I=P.bIsCreateAction,y=false,z;function G(i){return i.then(function(j){var N=m.getMessages();if(N.length>E&&N[N.length-1].type==="Error"){return{response:j,status:"rejected"};}return{response:j,status:"resolved"};},function(j){return{response:j,status:"rejected"};});}function H(){if(A&&A.length){y=true;for(var j=0;j<A.length;j++){if(!A[j].value){switch(A[j].$Type){case"Edm.String":A[j].value="";break;case"Edm.Boolean":A[j].value=false;break;case"Edm.Byte":case"Edm.Int16":case"Edm.Int32":case"Edm.Int64":A[j].value=0;break;default:break;}}z.setParameter(A[j].$Name,A[j].value);}}}if(u.length){return new Promise(function(j,N){var Q=P.mBindingParameters,R=P.bGrouped,T=P.bReturnAsArray,U=P.bGetBoundContext,W=[],K,i,Y,Z=function(z,$,a1){H();Y=!R?"actionGroup":z.getUpdateGroupId();K=U?z.execute(Y).then(function(){return z.getBoundContext();}):z.execute(Y);W.push(K);if(!R){v.submitBatch(Y);}if(a1&&a1.triggerActions&&a1.triggerActions.length){a1.triggerActions.forEach(function(b1){if(b1){var c1=a1.context.getModel().bindContext(b1+"(...)",a1.context);c1.execute(Y);}});}if(a1&&a1.pathExpressions&&a1.pathExpressions.length>0){S.logRequest(a1);a1.context.requestSideEffects(a1.pathExpressions,Y).then(function(){if(P.operationAvailableMap&&P.internalModelContext){C.setActionEnablement(P.internalModelContext,JSON.parse(P.operationAvailableMap),P.aContexts);}}).catch(function(b1){L.error("Error while requesting side effects",b1);});}};for(i=0;i<u.length;i++){z=v.bindContext(w+"(...)",u[i],Q);Z(z,u.length<=1?null:i,{context:u[i],pathExpressions:P.additionalSideEffect&&P.additionalSideEffect.pathExpressions,triggerActions:P.additionalSideEffect&&P.additionalSideEffect.triggerActions});}(O||jQuery.noop)(W);Promise.all(W.map(G)).then(function($){var a1=[],b1=[],c1;for(c1=0;c1<$.length;c1++){if($[c1].status==="rejected"){a1.push($[c1].response);}if($[c1].status==="resolved"){if(I&&y){$[c1].bConsiderDocumentModified=true;b1.push($[c1]);}else{b1.push($[c1].response);}}}if(!$||($&&$.length===0)){N(true);}if(a1.length===0){if(T){j(b1);}else{j(b1[0]);}}else{N({resolvedItems:b1,rejectedItems:a1});}}).catch(N);}).finally(function(){(x||jQuery.noop)();});}else{var K;z=v.bindContext("/"+w+"(...)");H();K=z.execute("actionImport");v.submitBatch("actionImport");(O||jQuery.noop)(K);return K.finally(function(){(x||jQuery.noop)();});}}function r(A,i){var P=A.getPath();P=A.getObject("$IsBound")?P.split("@$ui5.overload")[0]:P.split("/0")[0];return P.split("/"+i)[0];}var t={callBoundAction:e,callActionImport:f,callBoundFunction:g,callFunctionImport:h};return t;});