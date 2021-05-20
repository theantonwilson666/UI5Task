// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ui/base/Object","sap/ui/Device","sap/ui/model/Filter","sap/ushell/ui/launchpad/TileState","sap/ushell/components/_HomepageManager/PagingManager","sap/ushell/components/_HomepageManager/DashboardLoadingManager","sap/ushell/EventHub","sap/ushell/Config","sap/ushell/utils","sap/ushell/resources","sap/ushell/components/DestroyHelper","sap/ushell/components/GroupsHelper","sap/ushell/components/MessagingHelper","sap/m/GenericTile","sap/m/SelectDialog","sap/m/StandardListItem","sap/ushell/components/_HomepageManager/PersistentPageOperationAdapter","sap/ushell/components/_HomepageManager/TransientPageOperationAdapter","sap/ui/model/FilterOperator","sap/m/library","sap/ui/model/Context","sap/m/MessageToast","sap/base/Log","sap/ui/performance/Measurement"],function(Q,B,D,F,T,P,a,e,s,u,r,d,g,m,G,S,b,c,f,h,l,C,M,L,n){"use strict";var o=l.GenericTileScope;var p={PERSONALIZATION:"FLP: Personalization",RENAME_GROUP:"FLP: Rename Group",MOVE_GROUP:"FLP: Move Group",DELETE_GROUP:"FLP: Delete Group",RESET_GROUP:"FLP: Reset Group",DELETE_TILE:"FLP: Delete Tile",ADD_TILE:"FLP: Add Tile",MOVE_TILE:"FLP: Move Tile"};var t=[];return B.extend("sap.ushell.components.HomepageManager",{metadata:{publicMethods:["getModel","getDashboardView","loadPersonalizedGroups","resetGroupsOnFailure","addGroupToModel","addTileToGroup","deleteTilesFromGroup"]},analyticsConstants:p,constructor:function(i,j){if(sap.ushell.components.getHomepageManager){var H=sap.ushell.components.getHomepageManager();if(!H.view){H.setDashboardView(j.view);}return H;}sap.ui.getCore().attachThemeChanged(u.handleTilesVisibility);sap.ushell.components.getHomepageManager=(function(v){return function(){return v;};}(this));this.oPageOperationAdapter=c.getInstance();this.oPageBuilderService=sap.ushell.Container.getService("LaunchPage");this.oModel=j.model;this.oRouter=j.router;this.oDashboardView=j.view;this.oSortableDeferred=new Q.Deferred();this.oSortableDeferred.resolve();this.registerEvents();this.tileViewUpdateQueue=[];this.tileViewUpdateTimeoutID=0;this.tileUuid=null;this.bIsGroupsModelLoading=false;this.segmentsStore=[];this.bIsFirstSegment=true;this.bIsFirstSegmentViewLoaded=false;this.aGroupsFrame=null;this.iMinNumOfTilesForBlindLoading=this.oModel.getProperty("/optimizeTileLoadingThreshold")||100;this.bIsScrollModeAccordingKPI=false;this.oGroupNotLockedFilter=new F("isGroupLocked",h.EQ,false);this.bLinkPersonalizationSupported=this.oPageOperationAdapter.isLinkPersonalizationSupported();this.oDashboardLoadingManager=new a("loadingManager",{oDashboardManager:this});if(this.oRouter){var k=this.oRouter.getTarget("home");k.attachDisplay(function(q){this.oDashboardView=q.getParameter("view");}.bind(this));}var E=s.last("/core/home/enableTransientMode");t.push(s.on("/core/home/enableTransientMode").do(function(N){if(E===N){return;}E=N;this._changeMode(N);}.bind(this)));this.oModel.bindProperty("/tileActionModeActive").attachChange(this._changeLinksScope.bind(this));this._aRequestQueue=[];this._bRequestRunning=false;return undefined;},_addRequest:function(R){this._aRequestQueue.push(R);if(!this._bRequestRunning){this._bRequestRunning=true;this._aRequestQueue.shift()();}},_checkRequestQueue:function(){if(this._aRequestQueue.length===0){this._bRequestRunning=false;}else{this._aRequestQueue.shift()();}},_requestFailed:function(){this._aRequestQueue=[];this._bRequestRunning=false;},isBlindLoading:function(){var i=s.last("/core/home/homePageGroupDisplay");if((i===undefined||i==="scroll")&&this.bIsScrollModeAccordingKPI){L.info("isBlindLoading reason IsScrollModeAccordingKPI and IsScrollMode: true");return true;}if(this.oModel.getProperty("/tileActionModeActive")){L.info("isBlindLoading reason TileActionModeActive : true");return true;}return false;},createMoveActionDialog:function(i){var j=this.oGroupNotLockedFilter,k=new S(i,{title:r.i18n.getText("moveTileDialog_title"),rememberSelections:false,search:function(E){var v=E.getParameter("value"),q=new F("title",h.Contains,v),w=E.getSource().getBinding("items");w.filter([q,j]);},contentWidth:"400px",contentHeight:"auto",confirm:function(E){var q=E.getParameter("selectedContexts");this.publishMoveActionEvents(q,i);}.bind(this),cancel:function(){var q=Q(".sapUshellTile[tabindex=\"0\"]")[0];if(q){q.focus();}},items:{path:"/groups",filters:[j],template:new b({title:"{title}"})}});return k;},publishMoveActionEvents:function(i,j){var E=sap.ui.getCore().getEventBus();if(i.length){var k=this.tileType==="link"?"links":"tiles",q=i[0].getObject().groupId,v={sTileId:this.tileUuid,sToItems:k,sFromItems:k,sTileType:k,toGroupId:i[0].getObject().groupId,toIndex:i[0].getObject()[this.tileType==="link"?"links":"tiles"].length,source:j};if(D.system.desktop){v.callBack=sap.ushell.components.ComponentKeysHandler.callbackSetFocus.bind(sap.ushell.components.ComponentKeysHandler);}E.publish("launchpad","scrollToGroup",{groupId:q});E.publish("launchpad","movetile",v);}},_changeLinksScope:function(E){var i=this;if(this.bLinkPersonalizationSupported){var I=E.getSource().getValue();this.oModel.getProperty("/groups").forEach(function(j,k){if(!j.isGroupLocked){i._changeGroupLinksScope(j,I?"Actions":"Display");}});}},_changeGroupLinksScope:function(i,j){var k=this;i.links.forEach(function(q,v){k._changeLinkScope(q.content[0],j);});},_changeLinkScope:function(i,j){var k;if(i.getScope){k=i;}else if(i.getContent){k=i.getContent()[0];}if(this.bLinkPersonalizationSupported&&k&&k.setScope){k.setScope(j);}},registerEvents:function(){var E=sap.ui.getCore().getEventBus();E.subscribe("launchpad","addBookmarkTile",this._createBookmark,this);E.subscribe("launchpad","tabSelected",this.getSegmentTabContentViews,this);E.subscribe("sap.ushell.services.Bookmark","bookmarkTileAdded",this._addBookmarkToModel,this);E.subscribe("sap.ushell.services.Bookmark","catalogTileAdded",this._refreshGroupInModel,this);E.subscribe("sap.ushell.services.Bookmark","bookmarkTileDeleted",this.loadPersonalizedGroups,this);E.subscribe("launchpad","loadDashboardGroups",this.loadPersonalizedGroups,this);E.subscribe("launchpad","createGroupAt",this._createGroupAt,this);E.subscribe("launchpad","deleteGroup",this._deleteGroup,this);E.subscribe("launchpad","resetGroup",this._resetGroup,this);E.subscribe("launchpad","changeGroupTitle",this._changeGroupTitle,this);E.subscribe("launchpad","moveGroup",this._moveGroup,this);E.subscribe("launchpad","deleteTile",this._deleteTile,this);E.subscribe("launchpad","movetile",this._moveTile,this);E.subscribe("launchpad","sortableStart",this._sortableStart,this);E.subscribe("launchpad","sortableStop",this._sortableStop,this);E.subscribe("launchpad","dashboardModelContentLoaded",this._modelLoaded,this);E.subscribe("launchpad","convertTile",this._convertTile,this);this.oPageBuilderService.registerTileActionsProvider(this._addFLPActionsToTile.bind(this));},_changeMode:function(i){var j=this.getModel().getProperty("/groups");if(i){this.oPageOperationAdapter=f.getInstance();var k=this.oPageOperationAdapter.transformGroupModel(j);this.getModel().setProperty("/groups",k);}else{this.oPageOperationAdapter=c.getInstance();d.destroyFLPAggregationModels(j);this.getModel().setProperty("/groups",[]);this.loadPersonalizedGroups();}},_addFLPActionsToTile:function(i){var A=[];if(s.last("/core/shell/enablePersonalization")){var j=this.bLinkPersonalizationSupported&&this.oPageOperationAdapter.isLinkPersonalizationSupported(i);A.push(this._getMoveTileAction(i));if(j){A.push(this._getConvertTileAction(i));}}return A;},_getConvertTileAction:function(i){var E=sap.ui.getCore().getEventBus(),j=this,k=j.oPageOperationAdapter.getTileType(i);return{text:k==="link"?r.i18n.getText("ConvertToTile"):r.i18n.getText("ConvertToLink"),press:function(q){var v={tile:q};if(D.system.desktop){v.callBack=sap.ushell.components.ComponentKeysHandler.callbackSetFocus.bind(sap.ushell.components.ComponentKeysHandler);}E.publish("launchpad","convertTile",v);}};},_getMoveTileAction:function(i){var j=this;return{text:r.i18n.getText("moveTileDialog_action"),press:function(){j.tileType=j.oPageOperationAdapter.getTileType(i);j.tileUuid=j.getModelTileById(j.oPageOperationAdapter.getTileId(i),j.tileType==="link"?"links":"tiles").uuid;var k=j.tileType==="tile"?j.moveTileDialog:j.moveLinkDialog;if(j.tileType==="tile"||j.tileType==="link"){if(!k){k=j.createMoveActionDialog("move"+j.tileType+"Dialog");k.setModel(j.oModel);if(j.tileType==="tile"){j.moveTileDialog=k;}else{j.moveLinkDialog=k;}}else{k.getBinding("items").filter([j.oGroupNotLockedFilter]);}k.open();}}};},_handleTileAppearanceAnimation:function(j){if(!j){return;}var k=["webkit",""];function q(v,w){for(var i=0;i<k.length;i++){w=w.toLowerCase();j.attachBrowserEvent(k[i]+w,function(E){if(E.originalEvent&&E.originalEvent.animationName==="sapUshellTileEntranceAnimation"){j.removeStyleClass("sapUshellTileEntrance");}},false);}}q(j,"AnimationEnd");j.addStyleClass("sapUshellTileEntrance");},destroy:function(){var E=sap.ui.getCore().getEventBus();E.unsubscribe("launchpad","addBookmarkTile",this._createBookmark,this);E.unsubscribe("launchpad","loadDashboardGroups",this.loadPersonalizedGroups,this);E.unsubscribe("launchpad","createGroupAt",this._createGroupAt,this);E.unsubscribe("launchpad","deleteGroup",this._deleteGroup,this);E.unsubscribe("launchpad","resetGroup",this._resetGroup,this);E.unsubscribe("launchpad","changeGroupTitle",this._changeGroupTitle,this);E.unsubscribe("launchpad","moveGroup",this._moveGroup,this);E.unsubscribe("launchpad","deleteTile",this._deleteTile,this);E.unsubscribe("launchpad","movetile",this._moveTile,this);E.unsubscribe("launchpad","sortableStart",this._sortableStart,this);E.unsubscribe("launchpad","sortableStop",this._sortableStop,this);E.unsubscribe("launchpad","dashboardModelContentLoaded",this._modelLoaded,this);sap.ui.getCore().detachThemeChanged(u.handleTilesVisibility);t.forEach(function(i){i.off();});c.destroy();f.destroy();sap.ushell.components.getHomepageManager=undefined;B.prototype.destroy.apply(this,arguments);},_sortableStart:function(){this.oSortableDeferred=new Q.Deferred();},_createBookmark:function(i,E,j){var k=j.group?j.group.object:"";delete j.group;function q(){sap.ushell.Container.getServiceAsync("Bookmark").then(function(v){v.addBookmark(j,k).always(this._checkRequestQueue.bind(this)).done(function(){m.showLocalizedMessage("tile_created_msg");}).fail(function(w){L.error("Failed to add bookmark",w,"sap.ushell.ui.footerbar.AddBookmarkButton");m.showLocalizedError("fail_to_add_tile_msg");});}.bind(this));}this._addRequest(q.bind(this));},_addBookmarkToModel:function(i,E,j){var k=j.tile,q,v=j.group,w,x,y,N,I;if(!j||!k){this.bIsGroupsModelDirty=true;if(!this.bGroupsModelLoadingInProcess){this._handleBookmarkModelUpdate();}return;}if(!v){q=this.getModel().getProperty("/groups");for(I=0;I<q.length;I++){if(q[I].isDefaultGroup===true){v=q[I].object;break;}}}x=this._getIndexOfGroupByObject(v);y=this.oModel.getProperty("/groups/"+x);w=this.oPageOperationAdapter.getPreparedTileModel(k,y.isGroupLocked);this.getTileView(w);y.tiles.push(w);y.visibilityModes=u.calcVisibilityModes(y,true);N=y.tiles.length;this._updateModelWithTileView(x,N);this.oModel.setProperty("/groups/"+x,y);},_refreshGroupInModel:function(i,E,j){var k=this;this.oPageOperationAdapter.refreshGroup(j).then(function(q){if(!q){return;}var v=k._getIndexOfGroupByObject(q.object);q.visibilityModes=u.calcVisibilityModes(q.object,true);k.oModel.setProperty("/groups/"+v,q);if(q.tiles){q.tiles.forEach(function(w){k.getTileView(w);});}});},_sortableStop:function(){this.oSortableDeferred.resolve();},_handleAfterSortable:function(i){return function(){var j=Array.prototype.slice.call(arguments);this.oSortableDeferred.done(function(){i.apply(null,j);});}.bind(this);},_createGroupAt:function(j,E,k){var q=parseInt(k.location,10),v=this.oModel.getProperty("/groups"),w=this.oPageOperationAdapter.getPreparedGroupModel(null,false,q===v.length,k),x=this.oModel,i;w.index=q;v.splice(q,0,w);for(i=0;i<v.length-1;i++){v[i].isLastGroup=false;}for(i=q+1;i<v.length;i++){v[i].index++;}x.setProperty("/groups",v);},_getIndexOfGroupByObject:function(i){var j=this.oModel.getProperty("/groups");return this.oPageOperationAdapter.getIndexOfGroup(j,i);},getTileActions:function(i){return this.oPageOperationAdapter.getTileActions(i);},addTileToGroup:function(i,j){var k=i+"/tiles",q=this.oModel.getProperty(i),N=this.oModel.getProperty(k).length;var v=this.oModel.getProperty(i+"/isGroupLocked"),w=this.oModel.getProperty("/personalization");q.tiles[N]=this.oPageOperationAdapter.getPreparedTileModel(j,v);this.getTileView(q.tiles[N]);q.visibilityModes=u.calcVisibilityModes(q,w);this._updateModelWithTileView(q.index,N);this.oModel.setProperty(i,q);},addTilesToGroupByCatalogTileId:function(j,k){var q=j.getBindingContext();for(var i=0;i<k.length;i++){this.addTileToGroupByCatalogTileId(q.sPath,k[i]);}},addTileToGroupByCatalogTileId:function(i,j){var N,k,q;if(!s.last("/core/home/enableTransientMode")){return;}q=this.oPageOperationAdapter.getTileModelByCatalogTileId(j);if(!q){return;}this.oDashboardLoadingManager.setTileResolved(q);N=this.oModel.getProperty(i+"/tiles").length;k=this.oModel.getProperty(i);k.tiles[N]=q;this.oModel.setProperty(i,k);},_getPathOfTile:function(i){var j=this.oModel.getProperty("/groups"),k=null,q=null,v,E=function(w,x){if(x.uuid===i){q=w;return false;}return undefined;};Q.each(j,function(w,x){Q.each(x.tiles,E);if(q!==null){k=w;v="tiles";return false;}Q.each(x.links,E);if(q!==null){k=w;v="links";return false;}return undefined;});return k!==null?"/groups/"+k+"/"+v+"/"+q:null;},_moveInArray:function(A,i,j){if(j>=A.length){var k=j-A.length;while((k--)+1){A.push(undefined);}}A.splice(j,0,A.splice(i,1)[0]);},_updateGroupIndices:function(A){var k;for(k=0;k<A.length;k++){A[k].index=k;}},_deleteGroup:function(i,E,j){var k=this,q=this.oModel,v=j.groupId,w=q.getProperty("/groups"),x=g.getIndexOfGroup(w,v),I=w.length-1===x,y=null,z,A;z=I?x-1:x;d.destroyFLPAggregationModel(q.getProperty("/groups/"+x));y=w.splice(x,1)[0];if(I){q.setProperty("/groups/"+z+"/isLastGroup",I);}q.setProperty("/groups",w);this._updateGroupIndices(w);if(z>=0){A=sap.ui.getCore().getEventBus();window.setTimeout(Q.proxy(A.publish,A,"launchpad","scrollToGroup",{groupId:q.getProperty("/groups")[z].groupId}),200);}function H(){k.oPageOperationAdapter.deleteGroup(y).then(function(){m.showLocalizedMessage("group_deleted_msg",[y.title]);k._checkRequestQueue.call(k);},function(){k._resetGroupsOnFailure("fail_to_delete_group_msg");});}this._addRequest(H);},_resetGroup:function(i,E,j){var k=this,q=j.groupId,v=this.oModel,w=v.getProperty("/groups"),x=g.getIndexOfGroup(w,q),y=k.oModel.getProperty("/groups/indexOfDefaultGroup")===x,z=v.getProperty("/groups/"+x),A,H;v.setProperty("/groups/"+x+"/sortable",false);function I(){k.oPageOperationAdapter.resetGroup(z,y).then(function(R){k._handleAfterSortable(function(q,O,J){var w=k.oModel.getProperty("/groups"),x=g.getIndexOfGroup(w,q);k._loadGroup(x,J||O);m.showLocalizedMessage("group_reset_msg",[O.title]);k.oModel.setProperty("/groups/"+x+"/sortable",true);A=sap.ui.getCore().byId("dashboardGroups").getGroupControlByGroupId(q);H=A.getBindingContext().getObject().links;if(H&&H.length&&!A.getIsGroupLocked()){k._changeGroupLinksScope(A.getBindingContext().getObject(),k.oModel.getProperty("/tileActionModeActive")?o.Actions:o.Display);}if(A){A.rerender();e.emit("updateGroups",Date.now());u.handleTilesVisibility();}})(q,z,R);k._checkRequestQueue.call(k);},function(){k._resetGroupsOnFailure("fail_to_reset_group_msg");});}this._addRequest(I);},_moveGroup:function(j,E,k){if(isNaN(k.fromIndex)){return;}var q=k.fromIndex,v=k.toIndex,w=this.oModel,x=w.getProperty("/groups"),A=w.getProperty("/tileActionModeActive"),y,z,H=this,i,I;if(!A){q=this._adjustFromGroupIndex(q,x);}y=x[q];z=y.groupId;if(!A){v=this._adjustToGroupIndex(v,x,z);}I=x[v];this._moveInArray(x,q,v);this._updateGroupIndices(x);for(i=0;i<x.length-1;i++){x[i].isLastGroup=false;}x[x.length-1].isLastGroup=true;w.setProperty("/groups",x);function J(){x=w.getProperty("/groups");var y=w.getProperty(g.getModelPathOfGroup(x,z));if(!y.object){return;}H.oPageOperationAdapter.getOriginalGroupIndex(I,x).then(function(K){var N={iFromIndex:q,iToIndex:v};return H.oPageOperationAdapter.moveGroup(y,K,N);}).then(H._checkRequestQueue.bind(H),function(){H._resetGroupsOnFailure("fail_to_move_group_msg");});}this._addRequest(J);},_adjustToGroupIndex:function(j,k,q){var v=0,I=false,i=0;for(i=0;i<k.length&&v<j;i++){if(k[i].isGroupVisible){if(k[i].groupId===q){I=true;}else{v++;}}}if(I){return i-1;}return i;},_adjustFromGroupIndex:function(j,k){var v=0,i;for(i=0;i<k.length;i++){if(k[i].isGroupVisible){v++;}if(v===j+1){return i;}}return j;},_changeGroupTitle:function(i,E,j){var k=this,N=j.newTitle,q=this.oModel.getProperty("/groups"),v=j.groupId,w=g.getIndexOfGroup(q,v),x=k.oModel.getProperty("/groups/indexOfDefaultGroup")===w,y=this.oModel.getProperty("/groups/"+w),O=y.title;this.oModel.setProperty("/groups/"+w+"/title",N);function z(){var H;if(y.isLastGroup){H=k.oPageOperationAdapter.addGroupAt(y,undefined,x);}else{var I=k.oModel.getProperty("/groups")[w+1];H=k.oPageOperationAdapter.getOriginalGroupIndex(I,q).then(function(J){return k.oPageOperationAdapter.addGroupAt(y,J,x);});}H.then(function(J){k._handleAfterSortable(function(K,R){var U=k.oModel.getProperty("/groups");var V=g.getIndexOfGroup(U,K);var W=U[V];Object.keys(R).forEach(function(X){if(X==="tiles"||X==="links"){return;}W[X]=R[X];});k.oModel.refresh();k._checkRequestQueue.call(k);})(v,J);},function(){k._resetGroupsOnFailure("fail_to_create_group_msg");});}function A(){this.oPageOperationAdapter.renameGroup(y,N,O).then(function(){k._checkRequestQueue.call(k);},function(){k._resetGroupsOnFailure("fail_to_rename_group_msg");});}if(!y.object){this._checkRequestQueue.call(this);this._addRequest(z.bind(this));}else{this._addRequest(A.bind(this));}},addGroupToModel:function(i){var j=this.oPageOperationAdapter.getPreparedGroupModel(i,false,true,{isRendered:true}),k=this.oModel.getProperty("/groups"),q=k.length,v;if(q>0){k[q-1].isLastGroup=false;}j.index=q;k.push(j);this.oModel.setProperty("/groups/",k);v=new C(this.oModel,"/groups/"+q);return v;},_deleteTile:function(i,E,j){var k=this,q=j.tileId,v=this.oModel.getProperty("/groups"),I=j.items||"tiles";Q.each(v,function(w,x){var y=false;Q.each(x[I],function(z,A){if(A.uuid!==q){return true;}d.destroyTileModel(k.oModel.getProperty("/groups/"+w+"/"+I+"/"+z));var H=x[I].splice(z,1)[0],J=k.oModel.getProperty("/personalization");x.visibilityModes=u.calcVisibilityModes(x,J);k.oModel.setProperty("/groups/"+w,x);function K(){k.oPageOperationAdapter.removeTile(x,H).then(function(){k._checkRequestQueue.call(k);},function(){k._resetGroupsOnFailure("fail_to_remove_tile_msg");});}k._addRequest.call(k,K);u.handleTilesVisibility();y=true;return false;});return!y;});},deleteTilesFromGroup:function(i,R){var j=this.oModel.getProperty("/groups"),k=g.getIndexOfGroup(j,i),q=this.oModel.getProperty("/groups/"+k),v=[];["tiles","links"].forEach(function(A){v=q[A].filter(function(w){if(R.indexOf(w.uuid)<0){return true;}return false;});q[A]=v;});q.visibilityModes=u.calcVisibilityModes(q,true);this.oModel.setProperty("/groups/"+k,q);},_getGroupIndex:function(i){var j=this.oModel.getProperty("/groups"),k=this._getNewGroupInfo(j,i);if(k){return k.newGroupIndex;}return undefined;},_convertTile:function(i,E,j){var k=j.tile?j.tile:j,q=j.srcGroupId?this._getGroupIndex(j.srcGroupId):undefined,v=j.srcGroupId?this.oModel.getProperty("/groups/"+q):k.getParent().getBindingContext().getObject(),w=k.getBindingContext().sPath.split("/"),x=k.getBindingContext().getObject(),O=w[w.length-2],y=x.uuid,z=parseInt(w[w.length-1],10),A=j.toIndex!==undefined?j.toIndex:undefined,H=this.oModel.getProperty("/tileActionModeActive"),I=j.toGroupId?this._getGroupIndex(j.toGroupId):v.index,J=j.toGroupId?this.oModel.getProperty("/groups/"+I):v,K=this;var N=this._getIndexForConvert(O,z,A,v,J),R={"tileIndex":z,"groupIndex":q,"group":v};function U(){x.tileIsBeingMoved=true;var V=this.oPageOperationAdapter.moveTile(x,N,v,J,O==="links"?"tile":"link");V.then(function(W){K._showMoveTileMessage(x,v,J);K._handleAfterSortable(function(y,W){var X=K._getPathOfTile(y),Y=W.content;if(X){if(O==="tiles"){K._attachLinkPressHandlers(Y);K._addDraggableAttribute(Y);K._changeLinkScope(Y,H?"Actions":"Display");}var Z={"tileIndex":A,"groupIndex":I,"group":J},$={"tile":x,"view":Y,"type":O,"tileObj":W.object};x.tileIsBeingMoved=true;K.replaceTileViewAfterConvert(R,Z,$);e.emit("updateGroups",Date.now());u.handleTilesVisibility();if(j.callBack){j.callBack(Y);}}})(y,W);K._checkRequestQueue.call(K);},function(){K._handleAfterSortable(K._resetGroupsOnFailure.bind(K))("fail_to_move_tile_msg");});}this._addRequest(U.bind(this));},replaceTileViewAfterConvert:function(i,j,k){var q=k.tile,v=q.content;q.tileIsBeingMoved=false;q.content=[k.view];q.object=k.tileObj;q.originalTileId=this.oPageOperationAdapter.getTileId(k.tileObj);i.group[k.type].splice(i.tileIndex,1);if(j.tileIndex!==undefined){j.group[k.type==="tiles"?"links":"tiles"].splice(j.tileIndex,0,q);}else{j.group[k.type==="tiles"?"links":"tiles"].push(q);}this.oModel.setProperty("/groups/"+j.groupIndex,j.group);this.oModel.setProperty("/groups/"+i.groupIndex,i.group);if(k.type==="links"){this._handleTileAppearanceAnimation(q.content[0].getParent());}else{this._handleTileAppearanceAnimation(q.content[0]);}if(v&&v[0]){v[0].destroy();}},_getIndexForConvert:function(i,j,k,q,v){var w;if(i==="tiles"){if(k!==undefined){w=v[i].length+k;}else{w=v[i].length+v.links.length;}if(q.groupId===v.groupId){w--;}}else{w=k||q.tiles.length;j+=q.tiles.length;}return{"tileIndex":j,"newTileIndex":w};},_getIndexForMove:function(i,j,k,q,v){var w;if(i==="tiles"){w=k!==undefined?k:q[i].length;}else{if(k!==undefined){w=q.tiles.length+k;}else{w=q.tiles.length+q.links.length;}j+=v.tiles.length;}return{"tileIndex":j,"newTileIndex":w};},_getTileInfo:function(i,j,I){var k;Q.each(i,function(q,v){var w=false;Q.each(v[I],function(x,y){if(y.uuid===j){k={"oTile":y,"tileIndex":x,"oGroup":v,"groupIndex":q};w=true;return false;}return undefined;});return!w;});return k;},_getNewGroupInfo:function(i,N){var j;Q.each(i,function(k,q){if(q.groupId===N){j={"oNewGroup":q,"newGroupIndex":k};}});return j;},_moveTile:function(i,E,j){var k=j.toIndex,N=j.toGroupId,q=j.sTileId,v=j.source,w=j.sTileType==="tiles"||j.sTileType==="tile"?"tile":"link",x=j.sToItems,y=j.sFromItems,A=this.oModel.getProperty("/tileActionModeActive"),z=this.oModel.getProperty("/groups"),H,I,J,K,O,R={},U=this;K=this._getTileInfo(z,q,y);O=this._getNewGroupInfo(z,N);if(K.oGroup.groupId===O.oNewGroup.groupId&&(v==="movetileDialog"||k===null||v==="movelinkDialog")){if(j.callBack&&K.oTile&&K.oTile.content&&K.oTile.content.length){j.callBack(K.oTile.content[0]);}return;}if(w==="link"){K.oTile.content[0].addStyleClass("sapUshellZeroOpacity");}if(w==="tile"&&x==="tiles"){if(k&&k>O.oNewGroup[x].length){k=O.oNewGroup[x].length;}}if(K.oGroup.groupId===N&&x===y){if(k===null||k===undefined){K.oGroup[x].splice(K.tileIndex,1);k=K.oGroup[x].length;K.oGroup[x].push(K.oTile);}else{k=this._adjustTileIndex(k,K.oTile,K.oGroup,x);this._moveInArray(K.oGroup[x],K.tileIndex,k);}this.oModel.setProperty("/groups/"+K.groupIndex+"/"+x,K.oGroup[x]);}else{J=this.oModel.getProperty("/personalization");K.oGroup[y].splice(K.tileIndex,1);K.oGroup.visibilityModes=u.calcVisibilityModes(K.oGroup,J);this.oModel.setProperty("/groups/"+K.groupIndex+"/"+y,K.oGroup[y]);if(k===null||k===undefined){k=O.oNewGroup[x].length;O.oNewGroup[x].push(K.oTile);}else{k=this._adjustTileIndex(k,K.oTile,O.oNewGroup,x);O.oNewGroup[x].splice(k,0,K.oTile);}O.oNewGroup.visibilityModes=u.calcVisibilityModes(O.oNewGroup,J);this.oModel.setProperty("/groups/"+O.newGroupIndex+"/"+x,O.oNewGroup[x]);}e.emit("updateGroups",Date.now());u.handleTilesVisibility();function V(){H=this.oModel.getProperty("/groups/"+K.groupIndex);I=this.oModel.getProperty("/groups/"+O.newGroupIndex);R=this._getIndexForMove(y,K.tileIndex,k,O.oNewGroup,H);K.oTile.tileIsBeingMoved=true;this.oPageOperationAdapter.moveTile(K.oTile,R,H,I,w).then(function(W){var X=U._getPathOfTile(q);U._showMoveTileMessage(K.oTile,H,I);if(X){U.oModel.setProperty(X+"/object",W.object);U.oModel.setProperty(X+"/originalTileId",W.originalTileId);var Y=U.oModel.getProperty(X+"/content"),Z=W.content;if(x==="links"){U._changeLinkScope(Z,A?"Actions":"Display");U._attachLinkPressHandlers(Z);U._addDraggableAttribute(Z);U._handleTileAppearanceAnimation(Z);K.oTile.content=[Z];U.oModel.setProperty(X,Q.extend({},K.oTile));U.oModel.setProperty("/groups/"+O.newGroupIndex+"/"+x,U.oModel.getProperty("/groups/"+O.newGroupIndex+"/"+x));}else{U.oModel.setProperty(X+"/content",[Z]);}if(Y&&Y[0]){var $=Z.onAfterRendering;Z.onAfterRendering=function(){$.apply(this);Y[0].destroy();Z.onAfterRendering=$;};}U.oModel.setProperty(X+"/tileIsBeingMoved",false);if(j.callBack){j.callBack(Z);}}U._checkRequestQueue.call(U);},function(){U._resetGroupsOnFailure("fail_to_move_tile_msg");});}this._addRequest(V.bind(this));},_showMoveTileMessage:function(i,j,k){var q=this.oPageOperationAdapter.getTileTitle(i),v=k.title,w=r.i18n.getText("added_tile_to_group"),x=q+" "+w+" "+v;if(j.groupId!==k.groupId){M.show(x);}},_adjustTileIndex:function(j,k,q,I){var v=0,w=false,i=0;for(i=0;i<q[I].length&&v<j;i++){if(q[I][i].isTileIntentSupported){if(q[I][i]===k){w=true;}else{v++;}}}if(w){return i-1;}return i;},getModel:function(){return this.oModel;},getDashboardView:function(){return this.oDashboardView;},setDashboardView:function(i){this.oDashboardView=i;return this;},setTileVisible:function(i,v){this.oPageOperationAdapter.setTileVisible(i.object,v);},refreshTile:function(i){this.oPageOperationAdapter.refreshTile(i.object);},updateSettings:function(i){this.oModel=i.model||this.oModel;this.oConfig=i.config||this.oConfig;this.oRouter=i.router||this.oRouter;this.oDashboardView=i.view||this.oDashboardView;},_resetGroupsOnFailure:function(i,j){this._requestFailed();m.showLocalizedError(i,j);this.bStartLoadRemainSegment=false;this.loadPersonalizedGroups();this.oModel.updateBindings(true);},resetGroupsOnFailure:function(){this._resetGroupsOnFailure.apply(this,arguments);},_bindSegment:function(i,j){var k,q,v,w;for(k=0;k<j.length;k++){v=j[k];w=v.index;q=i[w];if(q){q.isRendered=true;q.tiles=q.tiles.concat(v.tiles);q.links=q.links.concat(v.links);}}return i;},createGroupsModelFrame:function(i,j){var k,q=[],O,v;v=function(w){var x=Q.extend({},w);x.tiles=[];x.pendingLinks=[];x.links=[];return x;};for(k=0;k<i.length;k++){O=i[k];q[k]=v(O);q[k].isRendered=false;q[k].visibilityModes=u.calcVisibilityModes(O,j);}return q;},_splitGroups:function(i,j){var k,q=[],v=0,I=this.oModel.getProperty("/homePageGroupDisplay")==="tabs",w=0,x;var y=500;for(k=0;k<i.length;k++){x=i[k];q.push(x);if(!this.segmentsStore.length){v+=this.PagingManager.getGroupHeight(x,j===k);}else{w+=x.tiles.length+x.links.length;}if(I&&!this.segmentsStore.length&&v>0){q.loadTilesView=true;this.segmentsStore.push(q);q=[];v=0;}if(v>=1||w>=y){this.segmentsStore.push(q);q=[];v=0;w=0;}}if(q.length){this.segmentsStore.push(q);}},_processSegment:function(i){var j=this.segmentsStore.shift();if(!j){return i;}if(this.isBlindLoading()===false){if(this.oModel.getProperty("/homePageGroupDisplay")!=="tabs"||j.loadTilesView){this.getSegmentContentViews(j);}}i=this._bindSegment(i,j);return i;},getSegmentContentViews:function(i){var j,k,q,v;for(j=0;j<i.length;j++){q=i[j];for(k=0;k<q.tiles.length;k++){v=q.tiles[k];if(v.isTileIntentSupported){this.getTileView(v);}}for(k=0;k<q.links.length;k++){v=q.links[k];if(v.isTileIntentSupported){this.getTileView(v,q.index);}}}this.bIsFirstSegmentViewLoaded=true;},getSegmentTabContentViews:function(i,E,j){var k,q,v=j.iSelectedGroup,w;w=this.oModel.getProperty("/groups/"+v);for(k=0;k<w.tiles.length;k++){q=w.tiles[k];if(q.isTileIntentSupported){this.getTileView(q);}}for(k=0;k<w.links.length;k++){q=w.links[k];if(q.isTileIntentSupported){this.getTileView(q,v);}}},_handleBookmarkModelUpdate:function(){this.bIsGroupsModelDirty=false;this.bGroupsModelLoadingInProcess=true;this.loadPersonalizedGroups();},_modelLoaded:function(){this.bGroupsModelLoadingInProcess=false;if(this.bIsGroupsModelDirty){this._handleBookmarkModelUpdate();}},handleFirstSegmentLoaded:function(){var i=this.oModel.getProperty("/groups");if(this.aGroupsFrame){Array.prototype.push.apply(i,this.aGroupsFrame);this.aGroupsFrame=null;}this._initializeAnchorNavigationBar();if(!this.bStartLoadRemainSegment){this._processRemainingSegments();}},_initializeAnchorNavigationBar:function(){var A,i=sap.ushell.components.getHomepageManager().getDashboardView();A=i.getAnchorItemTemplate();this.oDashboardView.oAnchorNavigationBar.bindAggregation("groups",{path:"/groups",template:A});},_processRemainingSegments:function(){var U;if(this.segmentsStore.length>0){window.setTimeout(function(){U=this._processSegment(this.oModel.getProperty("/groups"));this.oModel.setProperty("/groups",U);this.bIsFirstSegment=false;this._processRemainingSegments();}.bind(this),0);}else{this.bIsGroupsModelLoading=false;this._updateModelWithTileView(0,0);u.handleTilesVisibility();sap.ui.getCore().getEventBus().publish("launchpad","dashboardModelContentLoaded");e.emit("updateGroups",Date.now());}},_setGroupModel:function(j){if(this.bIsGroupsModelLoading){L.info("Skip set the group model, because the group model is still loading");return;}var i=0,k,q=0,v=0,w=0,x,y,z=null,A,E,H=[];this.bIsGroupsModelLoading=true;try{q=this.oModel.getProperty("/groups").length;}catch(I){}for(i=j.length;i<q;++i){d.destroyFLPAggregationModel(this.oModel.getProperty("/groups/"+i));}if(!this.PagingManager){var J=Q("#dashboardGroups").width();if(!J){J=window.innerWidth;}var K=Q("#sapUshellDashboardPage-cont").height();if(K<100){K=window.innerHeight;}this.PagingManager=new P("dashboardPaging",{supportedElements:{tile:{className:"sapUshellTile"},link:{className:"sapUshellLinkTile"}},containerHeight:K,containerWidth:J});}j.forEach(function(N){if(N.isGroupVisible){v+=N.tiles.length;}});this.bIsScrollModeAccordingKPI=v>this.iMinNumOfTilesForBlindLoading;this.aGroupsFrame=this.createGroupsModelFrame(j,this.oModel.getProperty("/personalization"));for(i=0;i<this.aGroupsFrame.length;i++){if(this.aGroupsFrame[i].isGroupVisible&&this.aGroupsFrame[i].visibilityModes[0]){if(z===null){z=i;this.aGroupsFrame[i].isGroupSelected=true;this.oModel.setProperty("/iSelectedGroup",i);}w++;if(w>1){this.aGroupsFrame[z].showGroupHeader=false;break;}}}this._splitGroups(j,z);y=this.segmentsStore[0]?this.segmentsStore[0].length:0;x=this.aGroupsFrame.splice(0,y);n.start("FLP:DashboardManager._processSegment","_processSegment","FLP");H=this._processSegment(x);j.every(function(N,O){if(N.isDefaultGroup){k=O;return false;}return true;});H.indexOfDefaultGroup=k;if(this.oModel.getProperty("/homePageGroupDisplay")==="tabs"){A=this.getDashboardView();if(A){E=A.oDashboardGroupsBox;E.getBinding("groups").filter([A.oFilterSelectedGroup]);}}n.end("FLP:DashboardManager._processSegment");this.oModel.setProperty("/groups",H);this.aGroupModel=H;if(this.oDashboardView){e.once("firstSegmentCompleteLoaded").do(function(){u.setPerformanceMark("FLP-TTI-Homepage",{bUseUniqueMark:true});}).do(this.handleFirstSegmentLoaded.bind(this));}else{setTimeout(function(){Array.prototype.push.apply(this.aGroupModel,this.aGroupsFrame);this.aGroupsFrame=null;this.bStartLoadRemainSegment=true;this._processRemainingSegments();}.bind(this),0);}if(this.bIsFirstSegmentViewLoaded){e.emit("firstSegmentCompleteLoaded",true);}n.end("FLP:DashboardManager.loadGroupsFromArray");},getPreparedGroupModel:function(){return this.aGroupModel;},_loadGroup:function(i,N){var j=this,k="/groups/"+i,O=j.oModel.getProperty(k),I=O.isLastGroup,q=O.groupId;d.destroyFLPAggregationModel(O);if(q){N.groupId=q;}N.isLastGroup=I;N.index=i;N.isRendered=true;this.oModel.setProperty(k,N);},_hasPendingLinks:function(j){for(var i=0;i<j.length;i++){if(j[i].content[0]===undefined){return true;}}return false;},_addModelToTileViewUpdateQueue:function(i,j){this.tileViewUpdateQueue.push({uuid:i,view:j});},_updateModelWithTileView:function(i,j){var k=this;if(this.tileViewUpdateTimeoutID){clearTimeout(this.tileViewUpdateTimeoutID);}this.tileViewUpdateTimeoutID=window.setTimeout(function(){k.tileViewUpdateTimeoutID=undefined;k.oSortableDeferred.done(function(){k._updateModelWithTilesViews(i,j);});},50);},_updateGroupModelWithTilesViews:function(i,k,v,w){var x,U,y,z,A=k||0;for(var j=A;j<i.length;j=j+1){x=i[j];for(var q=0;q<this.tileViewUpdateQueue.length;q++){U=this.tileViewUpdateQueue[q];if(x.uuid===U.uuid){v.push(q);if(U.view){if(w){x.content=[U.view];}else{x.content[0].destroy();x.content=[U.view];}this.oDashboardLoadingManager.setTileResolved(x);y=this.oPageOperationAdapter.getTileSize(x.object);z=((y!==null)&&(y==="1x2"))||false;if(x.long!==z){x.long=z;}}else{x.content[0].setState("Failed");}break;}}}},_updateModelWithTilesViews:function(j,k){var q=this.oModel.getProperty("/groups"),v=j||0,w=[];if(!q||this.tileViewUpdateQueue.length===0){return;}for(var i=v;i<q.length;i=i+1){this._updateGroupModelWithTilesViews(q[i].tiles,k,w);if(q[i].links){this._updateGroupModelWithTilesViews(q[i].links,k,w,true);if(q[i].pendingLinks.length>0){if(!q[i].links){q[i].links=[];}q[i].links=q[i].links.concat(q[i].pendingLinks);q[i].pendingLinks=[];}}}var x=[],y;for(y=0;y<this.tileViewUpdateQueue.length;y++){if(w.indexOf(y)===-1){x.push(this.tileViewUpdateQueue[y]);}}this.tileViewUpdateQueue=x;this.oModel.setProperty("/groups",q);},getModelTileById:function(i,I){var j=this.oModel.getProperty("/groups"),k,q=false;j.every(function(v){v[I].every(function(w){if(w.uuid===i||w.originalTileId===i){k=w;q=true;}return!q;});return!q;});return k;},_addDraggableAttribute:function(v){if(this.isIeHtml5DnD()){v.addEventDelegate({onAfterRendering:function(){this.$().attr("draggable","true");}.bind(v)});}},_attachLinkPressHandlers:function(v){var E=sap.ui.getCore().getEventBus(),i=v.attachPress?v:v.getContent()[0];i.attachPress(function(j){var k=v.getBindingContext().getObject().tileIsBeingMoved;if(!k&&this.getScope&&this.getScope()==="Actions"){switch(j.getParameters().action){case"Press":var q=v.getState?v.getState():"";if(q!=="Failed"){sap.ushell.components.homepage.ActionMode._openActionsMenu(j,v);}break;case"Remove":var w=v.getBindingContext().getObject().uuid;E.publish("launchpad","deleteTile",{tileId:w,items:"links"});break;default:break;}}else{E.publish("launchpad","dashboardTileLinkClick");}});},handleDisplayModeChange:function(N){this.oModel.setProperty("/homePageGroupDisplay",N);switch(N){case"scroll":this._handleDisplayModeChangeToScroll();break;case"tabs":this._handleDisplayModeChangeToTabs();break;}},_handleDisplayModeChangeToTabs:function(){var j=this.oModel.getProperty("/iSelectedGroup"),k=this.oModel.getProperty("/groups");if(k.length>0){for(var i=0;i<k.length;i++){this.oModel.setProperty("/groups/"+i+"/isGroupSelected",false);}this.oModel.setProperty("/groups/"+j+"/isGroupSelected",true);}},_handleDisplayModeChangeToScroll:function(){if(this.isBlindLoading()){return;}var k=this.oModel.getProperty("/groups"),q,v,w,x=[],i,j;for(i=0;i<k.length;i++){q=k[i];v=q.tiles||[];for(j=0;j<v.length;j++){w=v[j];if(w.content.length===0){this.getTileView(w,i);}}x=q.links||[];for(j=0;j<x.length;j++){this.getTileView(x[j],i);}}this.oModel.refresh(false);var y=this.oModel.getProperty("/iSelectedGroup");if(y){setTimeout(function(){sap.ui.getCore().getEventBus().publish("launchpad","scrollToGroup",{groupId:k[y].groupId});},100);}},getTileViewsFromArray:function(R){var i=this;if(R.length===0){return;}R.forEach(function(j){i.getTileView(j.oTile,j.iGroup);});this.oModel.refresh(false);if(this.bIsFirstSegmentViewLoaded===false){this.bIsFirstSegmentViewLoaded=true;e.emit("firstSegmentCompleteLoaded",true);}},getTileView:function(i,j){var k=this.oPageOperationAdapter.getTileType(i.object);if(this.oDashboardLoadingManager.isTileViewRequestIssued(i)){return;}this.oDashboardLoadingManager.setTileInProgress(i);this.oPageOperationAdapter.setTileVisible(i.object,false);if(k==="card"){this._loadCardData(i);}else{this._loadTileData(i,j,k);}},_loadCardData:function(i){var j=sap.ui.getCore().byId(i.controlId);if(j&&j.setManifest&&this.isBlindLoading()){j.setManifest(i.manifest);}i.content=[i.manifest];this.oDashboardLoadingManager.setTileResolved(i);},getCurrentHiddenGroupIds:function(i){return this.oPageOperationAdapter.getCurrentHiddenGroupIds(i);},_loadTileData:function(i,j,k){var q=this,v=this.oPageOperationAdapter.getTileView(i),w,x,y,U=this._addModelToTileViewUpdateQueue,z,N=false,A=i.uuid,E=false;if(v.state()==="resolved"){E=true;}v.done(function(V){if(V.oController&&V.oController.navigationTargetUrl&&!i.isCustomTile){i.target=V.oController.navigationTargetUrl;}z=V;if(z.getComponentInstance){n.average("FLP:getComponentInstance","get info for navMode","FLP1");var H=z.getComponentInstance().getComponentData();if(H&&H.properties){i.navigationMode=H.properties.navigationMode;}n.end("FLP:getComponentInstance");}q.oDashboardLoadingManager.setTileResolved(i);w=V.getMode?V.getMode():"ContentMode";if(q.bLinkPersonalizationSupported&&w==="LineMode"){q._attachLinkPressHandlers(z);q._addDraggableAttribute(z);if(j>=0){x=q.oModel.getProperty("/groups");if(x[j]){i.content=[z];y=q.oModel.getProperty("/groups/"+j+"/links");q.oModel.setProperty("/groups/"+j+"/links",[]);q.oModel.setProperty("/groups/"+j+"/links",y);}}}else if(q.isBlindLoading()){if(i.content&&i.content.length>0){i.content[0].destroy();}i.content=[z];if(j>=0&&!E){q.oModel.refresh(false);}}if(q.isBlindLoading()){var I=q.oPageOperationAdapter.getTileSize(i.object);var J=I==="1x2";if(i.long!==J){i.long=J;}}else if(w==="LineMode"){i.content=[z];if(N){y=q.oModel.getProperty("/groups/"+j+"/links");q.oModel.setProperty("/groups/"+j+"/links",[]);q.oModel.setProperty("/groups/"+j+"/links",y);}}else if(i.content.length===0){i.content=[z];}else{U.apply(q,[A,z]);q._updateModelWithTileView(0,0);}});v.fail(function(){if(q.oPageOperationAdapter.getTileType(i.object)==="link"&&q.bLinkPersonalizationSupported){z=q.oPageOperationAdapter.getFailedLinkView(i);q._attachLinkPressHandlers(z);}else{z=new T({state:"Failed"});}i.content=[z];});if(!z){if(q.oPageOperationAdapter.getTileType(i.object)==="link"){N=true;z=new G({mode:"LineMode"});}else{z=new T();}i.content=[z];}},isIeHtml5DnD:function(){return(D.browser.msie||D.browser.edge)&&(D.system.combi||D.system.tablet);},loadPersonalizedGroups:function(){var i=this;var j=new Q.Deferred();this.oPageOperationAdapter.getPage().then(function(k){i._setGroupModel(k);j.resolve();},function(k){m.showLocalizedError("fail_to_load_groups_msg");});n.start("FLP:DashboardManager.loadPersonalizedGroups","loadPersonalizedGroups","FLP");return j.promise();}});});