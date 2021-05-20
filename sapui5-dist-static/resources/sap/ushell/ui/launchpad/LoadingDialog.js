// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
sap.ui.define(["sap/m/Label","sap/ui/core/Control","sap/ui/core/Icon","sap/ui/core/Popup","sap/ushell/library","sap/ushell/resources","sap/ushell/ui/launchpad/AccessibilityCustomData","./LoadingDialogRenderer"],function(L,C,I,P,u,r,A){"use strict";var a=C.extend("sap.ushell.ui.launchpad.LoadingDialog",{metadata:{library:"sap.ushell",properties:{iconUri:{type:"sap.ui.core.URI",group:"Appearance",defaultValue:null},text:{type:"sap.ui.core.URI",group:"Appearance",defaultValue:null},loadAnimationWithInterval:{type:"boolean",group:"Appearance",defaultValue:true}}}});a.prototype.init=function(){this._oPopup=new P();this._oPopup.restoreFocus=false;this._oPopup.setShadow(false);this._oPopup.setModal(true,"sapUshellLoadingDialog");this.oIcon=new I();this._oLabel=new L(this.getId()+"loadingLabel").addStyleClass("sapUshellLoadingDialogLabel");this.sState="idle";this.sLoadingString=r.i18n.getText("genericLoading").replace("..."," ");};a.prototype.exit=function(){this._oPopup.close();this._oPopup.destroy();this.oIcon.destroy();this._oLabel.destroy();};a.prototype.isOpen=function(){return this._oPopup.isOpen();};a.prototype.openLoadingScreen=function(){if(this.sState==="idle"){this.sState="busy";}if(this.getLoadAnimationWithInterval()){this.addStyleClass("sapUshellVisibilityHidden");this._iTimeoutId=setTimeout(function(){this.removeStyleClass("sapUshellVisibilityHidden");this.focus();}.bind(this),3000);}else{this.removeStyleClass("sapUshellVisibilityHidden");this.focus();}if(!this.getVisible()){this.setVisible(true);this.$().show();}if(!this.isOpen()){this._oPopup.setContent(this);this._oPopup.setPosition("center center","center center",document,"0 0","fit");this._oPopup.open();}};a.prototype.showAppInfo=function(s,i,b){this.setText(s);this.setIconUri(i);this.oIcon.setSrc(i);this._oLabel.setText(s);this._oLabel.addCustomData(new A({key:"aria-hidden",value:"true",writeToDom:true}));var o=this.getDomRef("accessibility-helper");if(o&&b){o.innerText=this.sLoadingString;}};a.prototype.closeLoadingScreen=function(){if(this._iTimeoutId){clearTimeout(this._iTimeoutId);}if(this.getVisible()){this.sState="idle";this.setVisible(false);this.$().hide();this._oPopup.close();}};return a;});