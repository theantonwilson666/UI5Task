sap.ui.define(["sap/ui/base/Object","sap/f/FlexibleColumnLayoutSemanticHelper","sap/f/library","sap/base/util/extend"],function(B,F,f,e){"use strict";var L=f.LayoutType;var d=2;var c=["begin","mid","end"];var m=["messagePageBeginColumn","messagePageMidColumn","messagePageEndColumn"];function t(i){return c[i]?i:d;}function g(i){return c[t(i)]+"ColumnPages";}function a(C){for(var i=0;i<c.length;i++){C(m[i],g(i));}}function b(v){return m[t(v)];}function h(i){return c[t(i)];}function j(T){var i;if(T instanceof sap.ui.table.Table){i=T.getRows();}else if(T instanceof sap.m.Table){i=T.getItems();}return i;}function k(T){var i=j(T);var r=i?i[0]:false;return r;}function l(s){return(s&&(Array.isArray(s.FCLLayout)?s.FCLLayout.sort()[0]:s.FCLLayout))||"";}function n(o,N){var T=N.oTemplateContract;var p=T.oAppComponent.getFlexibleColumnLayout();var q=F.getInstanceFor(o,p);var u;var C;var s;var r=Object.create(null);var M=sap.ui.Device.system.phone?1:(p.maxColumnsCount||3);var v=M>1&&p.initialColumnsCount===2;var D=(function(){var i=q.getDefaultLayouts();return[v?i.defaultTwoColumnLayoutType:i.defaultLayoutType,i.defaultTwoColumnLayoutType,i.defaultThreeColumnLayoutType];})();var w=p.displayNextObjectAfterDelete===true;function x(i){return i.fCLLevel===1||i.fCLLevel===2||(i.level===0&&v);}function y(i){if(i.fCLLevel===3||(i.fCLLevel===0&&i.level>0)){return 1;}var t1=p.initialColumnsCount||1;var u1=Math.max(i.fCLLevel+1,t1);return sap.ui.Device.system.tablet&&u1>2?2:u1;}function A(i,t1,u1,v1){var w1=y(v1);i.showBeginColumn=v1.fCLLevel===0||w1>1;i.showMidColumn=v1.fCLLevel===1||w1>1;i.showEndColumn=v1.fCLLevel>1;if(w1===1){i.target=t1;}else if(v1.level===0){i.target=[t1,v1.page.pages[0].entitySet];}else{i.target=u1.concat([t1]);}return g(v1.fCLLevel);}function z(i,t1){if(i===L.OneColumn&&v){return false;}var u1=t1&&T.mRoutingTree[t1];var v1=u1&&u1.defaultLayoutType;if(v1){return i===v1;}return i===D[0]||i===D[1]||i===D[2];}function E(i,t1,u1){var v1=T.mRoutingTree[u1];return v1.componentCreated.then(function(w1){return N.activateOneComponent(t1,i,w1);});}function G(i){var t1=N.getCurrentIdentity();if(!t1){return null;}var u1={};var v1=true;for(var w1=t1.treeNode;v1;w1=T.mRoutingTree[w1.parentRoute]){var x1=w1.fCLLevel;var y1=h(x1);u1[y1]={route:w1.sRouteName,path:i?"-":w1.getPath(2,t1.keys),isVisible:x1>2||u.columnsVisibility[y1+"Column"]};v1=x1===1||x1===2;i=false;}return u1;}function H(i,t1){var u1=G(i.isNonDraftCreate);if(!u1){return Promise.resolve();}var v1=[];t1=t1||u1;for(var w1 in t1){var x1=u1[w1];if(x1.isVisible){v1.push(E(i,x1.path,x1.route));}else{var y1=T.oTemplatePrivateGlobalModel.getProperty("/generic/routeLevel");var z1=T.mRoutingTree[x1.route];var A1=(y1===z1.level)?2:(3+U(C));N.setVisibilityOfRoute(x1.route,A1);}}return Promise.all(v1).then(N.afterActivation);}function I(i){var t1=N.getActivationInfo();H(t1,i);}function J(){return!(u.columnsVisibility.beginColumn?u.columnsVisibility.midColumn:u.columnsVisibility.midColumn&&u.columnsVisibility.endColumn);}function K(i){if(!u&&!i){return;}var t1=q.getCurrentUIState();var u1={};u1.end=u&&(u.columnsVisibility.endColumn!==t1.columnsVisibility.endColumn);u1.mid=u&&(u.columnsVisibility.midColumn!==t1.columnsVisibility.midColumn);u1.begin=u&&(u.columnsVisibility.beginColumn!==t1.columnsVisibility.beginColumn);u=t1;T.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/midActionButtons",{fullScreen:u.actionButtonsInfo.midColumn.fullScreen!==null,exitFullScreen:u.actionButtonsInfo.midColumn.exitFullScreen!==null,closeColumn:u.actionButtonsInfo.midColumn.closeColumn!==null});T.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/endActionButtons",{fullScreen:u.actionButtonsInfo.endColumn.fullScreen!==null,exitFullScreen:u.actionButtonsInfo.endColumn.exitFullScreen!==null,closeColumn:u.actionButtonsInfo.endColumn.closeColumn!==null});var v1=N.getCurrentIdentity();var w1=v1&&v1.treeNode;if(v1){var x1=J();var y1=w1.level-(w1.fCLLevel===2&&!u.columnsVisibility.endColumn);var z1=y1-(y1>1&&!x1)-(u.columnsVisibility.endColumn&&u.columnsVisibility.beginColumn&&y1>2);T.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/isVisuallyFullScreen",x1);T.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/highestViewLevel",y1);T.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/lowestDetailViewLevel",z1);}if(v1&&C!==u.layout){var A1=z(u.layout,w1.sRouteName)?null:u.layout;N.navigateByExchangingQueryParam("FCLLayout",A1);}else{if((u1.begin||u1.mid||u1.end)&&!i){I(u1);}var B1=N.getActiveComponents();B1.forEach(function(C1){var D1=r[C1];var E1=C;var F1=T.componentRegistry[C1];if(E1===L.ThreeColumnsMidExpanded){var G1=T.mRoutingTree[F1.route];if(G1.fCLLevel===0){E1=L.ThreeColumnsEndExpanded;}}if(D1!==E1){r[C1]=E1;if(D1){F1.utils.layoutChanged(D1,E1);}}});}}var S=false;function O(i){for(var t1=i.treeNode;t1.fCLLevel===1||t1.fCLLevel===2;){t1=T.mRoutingTree[t1.parentRoute];N.prepareHostView(t1);}var u1=function(){if(x(i.treeNode)){C=Q(i);if(!C){switch(i.treeNode.fCLLevel){case 0:var v1=q.getNextUIState(0).columnsVisibility;if(v1.midColumn){C=D[1];}else{C=D[0];N.navigateByExchangingQueryParam("FCLLayout",C);}break;case 1:C=D[1];break;case 2:C=D[2];break;default:}}}else{C=i.treeNode.fCLLevel===0?D[0]:L.EndColumnFullScreen;}o.setLayout(C);o.setAutoFocus(false);if(i.treeNode.fCLLevel===1||i.treeNode.fCLLevel===2){var w1=q.getCurrentUIState();if(w1.columnsVisibility.midColumn){var x1=1-w1.columnsVisibility.beginColumn;for(var t1=i.treeNode;t1.fCLLevel>x1;){t1=T.mRoutingTree[t1.parentRoute];i.componentsDisplayed[t1.sRouteName]=1;t1.display();}}}};if(S){u1();return Promise.resolve();}return q.whenReady().then(function(){S=true;u1();});}function P(i){K(true);return H(i);}function Q(i){return l(i.appStates)||i.treeNode.defaultLayoutType||D[t(i.treeNode.fCLLevel)];}function R(i,t1,u1){if(!z(t1,u1)){i.FCLLayout=t1;}}function U(i){return i===L.EndColumnFullScreen||i===L.MidColumnFullScreen;}function V(i){return i===L.ThreeColumnsBeginExpandedEndHidden||i===L.ThreeColumnsMidExpandedEndHidden;}function W(i,t1,u1,v1){var w1={treeNode:i,keys:t1,appStates:v1};var x1=N.getApplicableStateForIdentityAddedPromise(w1);u1.push(x1);}function X(i,t1,u1,v1){R(i,u1,t1.sRouteName);var w1=[];if(!V(u1)){W(t1,v1,w1,i);}if(!U(u1)){for(var x1=t1;x1.fCLLevel>0;){x1=T.mRoutingTree[x1.parentRoute];W(x1,v1,w1,i);}}return Promise.all(w1);}function Y(i){return U(C)?_(i.fCLLevel):(i.defaultLayoutType||q.getNextUIState(i.fCLLevel).layout);}function Z(i,t1){var u1=(t1.treeNode.fCLLevel===1&&i&&i.treeNode.parentRoute===t1.treeNode.sRouteName&&i.treeNode.fCLLevel===2)?u.actionButtonsInfo.endColumn.closeColumn:Y(t1.treeNode);return X(t1.appStates,t1.treeNode,u1,t1.keys);}function $(i,t1,u1){var v1;if(i.treeNode.fCLLevel===t1.treeNode.fCLLevel){v1=C;}else if(i.treeNode.fCLLevel===2){v1=u.actionButtonsInfo.endColumn.closeColumn;}else{v1=Y(t1.treeNode);}return X(u1,t1.treeNode,v1,t1.keys);}function _(i){if(i===0){return L.OneColumn;}else if(i===1){return L.MidColumnFullScreen;}else if(i===2){return L.EndColumnFullScreen;}else{return"";}}function a1(t1,u1){var v1=T.mRoutingTree[t1];if(!x(v1)){return null;}var w1=s||v1.defaultLayoutType||q.getNextUIState(v1.fCLLevel).layout;R(u1,w1,t1);s=null;if(U(w1)){return null;}var x1=[];for(var i=v1.fCLLevel;i>0;i--){var y1=v1.parentRoute;x1.push(N.addUrlParameterInfoForRoute(y1,u1));v1=T.mRoutingTree[y1];}return Promise.all(x1);}function b1(i,t1){if(i.treeNode.fCLLevel===0||i.treeNode.fCLLevel===3){return true;}var u1=Q(i);var v1=Q(t1);return U(u1)===U(v1);}function c1(i,t1,u1){var v1=function(){T.oApplicationProxy.performAfterSideEffectExecution(function(){var w1=h(i.fCLLevel);var x1=u.actionButtonsInfo[w1+"Column"][t1];var y1=u1?T.mRoutingTree[i.parentRoute]:i;var z1=N.getCurrentIdentity();var A1=Object.create(null);T.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/FCLActionButton",0);if(t1==="fullScreen"||t1==="exitFullScreen"){T.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/FCLActionButton",1);}else{T.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/FCLActionButton",0);}var B1=X(A1,y1,x1,z1.keys);var C1=B1.then(function(){N.navigateToIdentity({treeNode:y1,keys:(y1===z1.treeNode)?z1.keys:z1.keys.slice(0,y1.level+1),appStates:A1});});T.oBusyHelper.setBusy(C1);},true);};if(u1){T.oDataLossHandler.performIfNoDataLoss(v1,Function.prototype);}else{v1();}}function d1(i){return{onCloseColumnPressed:c1.bind(null,i,"closeColumn",true),onFullscreenColumnPressed:c1.bind(null,i,"fullScreen",false),onExitFullscreenColumnPressed:c1.bind(null,i,"exitFullScreen",false)};}T.oTemplatePrivateGlobalModel.setProperty("/generic/FCL",{});function e1(i){C=q.getNextUIState(i).layout;o.setLayout(C);}function f1(){return!J();}function g1(i,t1){var u1=0;for(var v1 in t1){var w1=T.mRoutingTree[v1];if(w1.level>=i.viewLevel&&t1[v1]===1){if(w1.level===i.viewLevel){u1=w1.fCLLevel;}t1[v1]=5+(w1.level>i.viewLevel);}}e1(u1);var x1=N.oRouter.getTargets();var y1=b(u1);x1.display(y1);}function h1(i,t1){if(!x(t1)){return;}var u1=_(t1.fCLLevel);if(z(u1,t1.sRouteName)){return;}i.FCLLayout=u1;}function i1(i,t1,u1){if(u1&&u1.appStates&&u1.appStates.FCLLayout){i.FCLLayout=u1.appStates.FCLLayout;}else{delete i.FCLLayout;}}function j1(i,t1){if(i.page.defaultLayoutTypeIfExternalNavigation&&!z(i.page.defaultLayoutTypeIfExternalNavigation,i.sRouteName)){t1.FCLLayout=i.page.defaultLayoutTypeIfExternalNavigation;}else{delete t1.FCLLayout;}}function k1(i){return i.treeNode.fCLLevel==0||i.treeNode.fCLLevel==3||U(Q(i));}function l1(i){return!k1(i);}function m1(){return M;}function n1(i,t1){if(!v){return;}var u1=false;var v1=q.getNextUIState(0).columnsVisibility;if(v1.midColumn){var w1=N.getCurrentIdentity();var x1=w1&&w1.treeNode;u1=x1&&x1.level===0&&l(w1.appStates)!==L.OneColumn;}if(u1){if(i){t1(i);}else{N.navigateByExchangingQueryParam("FCLLayout",L.OneColumn);}}}function o1(){return w;}function p1(){return v;}function q1(i,t1){var u1=k(i);n1(u1,t1);}function r1(i){if(i>2){s="";}else{s=_(i);}}function s1(i){var t1={};if(i.fCLLevel===1||i.fCLLevel===2){t1.oActionButtonHandlers=d1(i);}if(i.level===0){t1.handleDataReceived=(p1&&p1())?q1:Function.prototype;t1.isListAndFirstEntryLoadedOnStartup=p1;}t1.isNextObjectLoadedAfterDelete=o1;return t1;}o.attachStateChange(K.bind(null,false));return{adaptRoutingInfo:A,createMessagePageTargets:a,displayMessagePage:g1,handleBeforeRouteMatched:O,handleRouteMatched:P,areIdentitiesLayoutEquivalent:b1,getAppStatesPromiseForNavigation:Z,getSpecialDraftCancelPromise:$,getFCLAppStatesPromise:a1,adaptBreadCrumbUrlParameters:h1,adaptPreferredLayout:i1,isAppTitlePrefered:f1,hasIdentityFullscreenLayout:k1,hasNavigationMenuSelfLink:l1,getMaxColumnCountInFCL:m1,isNextObjectLoadedAfterDelete:o1,getFclProxy:s1,isListAndFirstEntryLoadedOnStartup:p1,setStoredTargetLayoutToFullscreen:r1,adaptAppStatesForExternalNavigation:j1};}return B.extend("sap.suite.ui.generic.template.lib.FlexibleColumnLayoutHandler",{constructor:function(o,N){e(this,n(o,N));}});});