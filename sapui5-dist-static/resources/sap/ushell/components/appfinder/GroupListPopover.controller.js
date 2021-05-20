// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/thirdparty/jquery","sap/m/MessageToast","sap/ushell/resources","sap/ui/Device","sap/ui/model/Context","sap/ui/model/json/JSONModel"],function(q,M,r,D,C,J){"use strict";sap.ui.controller("sap.ushell.components.appfinder.GroupListPopover",{onInit:function(){var v=this.getView();this.oPopoverModel=new J({userGroupList:v.getViewData().groupData});this.oPopoverModel.setSizeLimit(9999);v.oPopover.setModel(this.oPopoverModel);},onExit:function(){var v=this.getView();if(v._oListContainer){v._oListContainer.destroy();}if(v._oNewGroupItem){v._oNewGroupItem.destroy();}if(v._oNewGroupNameInput){v._oNewGroupNameInput.destroy();}if(v._oNewGroupHeader){v._oNewGroupHeader.destroy();}},onGroupListSelectionChange:function(e){var l=e.getSource();if(l.getMode()==="SingleSelectMaster"){var L=e.getParameter("listItem");if(L.data("newGroupItem")){this._navigateToCreateNewGroupPane();}else{this.okButtonHandler(e);}}else{this.checkboxClickHandler(e);}},okButtonHandler:function(e){e.preventDefault();e._bIsStopHandlers=true;var v=this.getView();var u=this.oPopoverModel.getProperty("/userGroupList");var c={addToGroups:[],removeFromGroups:[],newGroups:[],allGroups:u};u.forEach(function(g){if(g.selected===g.initiallySelected){return;}if(g.selected){c.addToGroups.push(g.oGroup);}else{c.removeFromGroups.push(g.oGroup);}});if(v.newGroupInput&&v.newGroupInput.getValue().length){c.newGroups.push(v.newGroupInput.getValue());}v.oPopover.close();v.deferred.resolve(c);},_closeButtonHandler:function(e){e._bIsStopHandlers=true;var v=this.getView();v.oPopover.close();v.deferred.reject();},_createGroupAndSaveTile:function(t,n){var c=sap.ushell.components.getCatalogsManager();var d=q.Deferred();var p=c.createGroupAndSaveTile({catalogTileContext:t,newGroupName:n});p.done(function(a){d.resolve(a);});return d;},groupListItemClickHandler:function(e){var l=e.getParameter("listItem");if(l.data("newGroupItem")){this._navigateToCreateNewGroupPane();return;}l.setSelected(!l.getSelected());var i=l.getBindingContextPath();var p=l.getModel();var s=!!l.getSelected();this.addRemoveTileFromGroup(i,p,s);},getGroupsBeforeChanges:function(p){var m=this.getView().getViewData().sourceContext.oModel;return m.getProperty(p+"/associatedGroups");},getGroupsAfterChanges:function(){var g=sap.ui.getCore().byId("groupsPopover");return g.getModel().getProperty("/userGroupList");},checkboxClickHandler:function(e){var v=this.getView();var p=v.getViewData().sourceContext.sPath;var g=this.getGroupsBeforeChanges(p);var G=this.getGroupsAfterChanges();var l=sap.ushell.Container.getService("LaunchPage");var P=e.getSource().getModel();var s=e.getParameter("selected");var a=0;var i=0;var d=false;var b;while(l.isGroupLocked(G[i].oGroup.object)===true){i++;}for(i;i<G.length;i++){var c=false;if(d===true){break;}for(a=0;a<g.length;a++){if(l.getGroupId(G[i].oGroup.object)===g[a]){c=true;if(G[i].selected===false){d=true;b=("/userGroupList/"+i);this.addRemoveTileFromGroup(b,P,s);break;}}}if(G[i].selected===true&&c===false){b=("/userGroupList/"+i);this.addRemoveTileFromGroup(b,P,s);break;}}},addRemoveTileFromGroup:function(i,p,t){var v=this.getView();var c=this.getView().getViewData().catalogController;var a=this.getView().getViewData().catalogModel;var T=this.getView().getViewData().sourceContext;var g=a.getProperty("/groups");var b=g.indexOf(p.getProperty(i).oGroup);var G=new C(a,"/groups/"+b);var l=sap.ushell.Container.getService("LaunchPage");var s=l.getGroupId(a.getProperty("/groups/"+b).object);if(t){var A=c._addTile(T,G);A.done(function(e){var f=v.getViewData().sourceContext;var h=a.getProperty(f+"/associatedGroups");h.push(s);a.setProperty(f+"/associatedGroups",h);});}else{var d=T.getModel().getProperty(T.getPath()).id;var R=c._removeTile(d,b);R.done(function(e){var f=v.getViewData().sourceContext;var h=a.getProperty(f+"/associatedGroups");var j=h?Array.prototype.indexOf.call(h,s):-1;if(j>=0){h.splice(j,1);}a.setProperty(f+"/associatedGroups",h);});}},_switchGroupsPopoverButtonPress:function(){var g="groupsPopover-popover";if(D.system.phone){g="groupsPopover-dialog";}var v=this.getView();if(sap.ui.getCore().byId(g).getContent()[0]===v._getNewGroupInput()){var u=this.oPopoverModel.getProperty("/userGroupList");var c={addToGroups:[],removeFromGroups:[],newGroups:[],allGroups:u};var n=v._getNewGroupInput();var N=n.getValue();if(N.length>0){c.newGroups.push(N);}v.oPopover.close();v.deferred.resolve(c);}else{this._closeButtonHandler(this);}},_navigateToCreateNewGroupPane:function(){var v=this.getView();var n=v._getNewGroupHeader();var N=v._getNewGroupInput();v.oPopover.removeAllContent();v.oPopover.addContent(N);v.oPopover.setCustomHeader(n);v.oPopover.setContentHeight("");setTimeout(function(){v.oPopover.getBeginButton().setText(r.i18n.getText("okDialogBtn"));},0);if(v.oPopover.getEndButton()){v.oPopover.getEndButton().setVisible(true);}if(sap.ui.getCore().byId("groupsPopover-popover")&&(sap.ui.getCore().byId("groupsPopover-popover").getContent()[0]===v._getNewGroupInput())&&!v.oPopover.getEndButton()){v.oPopover.setEndButton(v._getCancelButton());}setTimeout(function(){v.oPopover.getEndButton().setText(r.i18n.getText("cancelBtn"));},0);if(v.getViewData().singleGroupSelection){this._setFooterVisibility(true);}setTimeout(function(){N.focus();},0);},setSelectedStart:function(s){this.start=s;},_afterCloseHandler:function(){var v=this.getView();var c=this.getView().getViewData().catalogModel;if(c){var g=c.getProperty(this.getView().getViewData().sourceContext+"/associatedGroups");this.showToastMessage(g,this.start);}v.destroy();},showToastMessage:function(e,s){var a=0;var b=0;var f,c;var d={};e.forEach(function(g){d[g]=g;});s.forEach(function(g){if(d[g.id]){if(g.selected===false){a++;f=g.title;}}else if(g.selected===true){b++;c=g.title;}});var m=this.getView().getViewData().catalogController.prepareDetailedMessage(this.getView().getViewData().title,a,b,f,c);if(m){M.show(m,{duration:6000,width:"15em",my:"center bottom",at:"center bottom",of:window,offset:"0 -50",collision:"fit fit"});}},_backButtonHandler:function(){var v=this.getView();v.oPopover.removeAllContent();if(v.getViewData().singleGroupSelection){this._setFooterVisibility(false);}if(!D.system.phone){v.oPopover.setContentHeight("192px");}else{v.oPopover.setContentHeight("100%");}v.oPopover.setVerticalScrolling(true);v.oPopover.setHorizontalScrolling(false);v.oPopover.addContent(v._getListContainer());v.oPopover.setTitle(r.i18n.getText("addTileToGroups_popoverTitle"));v.oPopover.setCustomHeader();v._getNewGroupInput().setValue("");if(v.oPopover.getContent()[0]!==v._getNewGroupInput()){v.oPopover.getEndButton().setVisible(false);}setTimeout(function(){v.oPopover.getBeginButton().setText(r.i18n.getText("close"));},0);},_setFooterVisibility:function(v){var f=sap.ui.getCore().byId("groupsPopover-footer");if(f){f.setVisible(v);}}});});