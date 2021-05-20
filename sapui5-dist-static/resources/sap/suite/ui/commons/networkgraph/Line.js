/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/suite/ui/commons/library","./ElementBase","./layout/Geometry","./Coordinate","./Utils"],function(l,E,G,C,U){"use strict";var A=l.networkgraph.LineArrowPosition,L=l.networkgraph.LineType,a=l.networkgraph.LineArrowOrientation,S=l.networkgraph.NodeShape,O=l.networkgraph.Orientation;var B=6,F=5,R=0.45,c=15,Z={Apex:{x:5.5,y:0},Second:{x:-5.5,y:-7.5},Third:{x:-5.5,y:7.5}},d={Apex:{x:16,y:0},Second:{x:5,y:-7.5},Third:{x:5,y:7.5}},e={Apex:{x:-12,y:0},Second:{x:-1,y:-7.5},Third:{x:-1,y:7.5}},N=5;var r=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");var f=E.extend("sap.suite.ui.commons.networkgraph.Line",{metadata:{library:"sap.suite.ui.commons",properties:{selected:{type:"boolean",group:"Misc",defaultValue:false},from:{type:"string",group:"Misc",defaultValue:null},to:{type:"string",group:"Misc",defaultValue:null},lineType:{type:"sap.suite.ui.commons.networkgraph.LineType",group:"Appearance",defaultValue:L.Solid},arrowPosition:{type:"sap.suite.ui.commons.networkgraph.LineArrowPosition",group:"Appearance",defaultValue:A.End},arrowOrientation:{type:"sap.suite.ui.commons.networkgraph.LineArrowOrientation",group:"Appearance",defaultValue:a.ParentOf},stretchToCenter:{type:"boolean",group:"Misc",defaultValue:false}},aggregations:{coordinates:{type:"sap.suite.ui.commons.networkgraph.Coordinate",multiple:true,singularName:"coordinate"},actionButtons:{type:"sap.suite.ui.commons.networkgraph.ActionButton",multiple:true,singularName:"actionButton"}},events:{hover:{},press:{parameters:{point:"Object",opener:"Object"}}}},renderer:function(o,b){o.write(b._render());},onAfterRendering:function(){this._afterRenderingBase();},init:function(){this._oFrom=null;this._oTo=null;this._bFocusRendered=false;this._sKey="";this._bIsHidden=false;}});f.prototype.aProcessRequiredProperties=["from","to"];f.prototype._afterRendering=function(){this._setupEvents();if(this.getFromNode()._bIsHidden||this.getToNode()._bIsHidden){this.$().hide();}this._removeFromInvalidatedControls();};f.prototype._render=function(o){var s="",b=this.getSelected()?" "+this.SELECT_CLASS+" ":"",i=this._getElementId(o&&o.idSufix),g;var h=this._getStatusStyle({"stroke":E.ColorType.Border,"stroke-width":E.ColorType.BorderWidth,"stroke-dasharray":E.ColorType.BorderStyle});var j=this._getStatusStyle({fill:E.ColorType.Background,stroke:E.ColorType.Border});var k=function(t,P,I){return this._renderControl("path",{d:g,"class":t||this._getLineClass(),style:I?"":h,from:this.getFromNode().getKey(),to:this.getToNode().getKey(),id:i?i+"-"+P:""});}.bind(this);var m=function(I,P,t){return{id:i+"-"+t,"class":"sapSuiteUiCommonsNetworkLineArrow",style:j,d:"M "+P[I+0].x+","+P[I+0].y+" L "+P[I+1].x+","+P[I+1].y+" L "+P[I+2].x+","+P[I+2].y+" Z"};};var n=function(t,P,u){var v=this._getArrowPoints(t,P),H=this._renderControl("path",m(0,v,u||"arrow"));if(this._isBothMiddleArrow()){H+=this._renderControl("path",m(3,v,"arrow1"));}return H;}.bind(this);var p=function(x,y,t){var u=x,v=y,w=" 0 0 0 ";if(t===O.LeftRight||t===O.RightLeft){y-=N;v+=N;}if(t===O.TopBottom||t===O.BottomTop){x-=N;u+=N;}if(t===O.BottomTop||t===O.LeftRight){w=" 0 0 1 ";}return"M"+x+" "+y+"A"+N+" "+N+w+" "+u+" "+v;};this._bFocusRendered=false;if(this._isIgnored()){return"";}if(!this.getVisible()){return"<g style=\"display:none\" id=\""+i+"\" data-sap-ui=\""+i+"\"></g>";}g=this._createPath();s+=this._renderControl("g",{"class":"sapSuiteUiCommonsNetworkLine "+this._getStatusClass()+b,id:i,"data-sap-ui":i},false);s+=k("sapSuiteUiCommonsNetworkLineInvisibleWrapper","invisibleWrapper",true);s+=k("","path");if(this.getArrowOrientation()!==a.None&&this.getCoordinates().length>=2){if(this.getArrowOrientation()===a.Both){if(this.getArrowPosition()===A.Middle){s+=n(a.ParentOf,A.Middle);}else{s+=n(a.ChildOf,A.Start,"arrow");s+=n(a.ParentOf,A.End,"arrow1");}}else{s+=n();}}if(this._aNipples){var q=j?"style=\""+j+"\"":"";this._aNipples.forEach(function(t){s+="<path "+q+" class=\"sapSuiteUiCommonsNetworkLineNipple\" d=\""+p(t.x,t.y,t.orientation)+"\" />";});}s+="</g>";return s;};f.prototype._renderFocusWrapper=function(){var b=function(s){var p=this._createElement("path",{d:this._createPath(s),"class":"sapSuiteUiCommonsNetworkLineFocus"});this.$()[0].appendChild(p);}.bind(this);if(!this._bFocusRendered){b(F);b(-F);this._bFocusRendered=true;}};f.prototype._resetLayoutData=function(){this._aNipples=null;};f.prototype._createPath=function(s){if(!this.getSource()||!this.getTarget()){return;}var p=[{x:this.getSource().getX(),y:this.getSource().getY()}],P="M"+this.getSource().getX()+","+this.getSource().getY(),b,n,I=this._isTopBottom(),g=I?"x":"y",h=I?"getX":"getY",k=this.getBends().concat([this.getTarget()]);for(var i=0;i<k.length;i++){b=p[i-1]?p[i-1][g]:NaN;n=k[i][h]();if(Math.abs(b-k[i][h]())<2){p.pop();n=b;}p.push({x:I?n:k[i].getX(),y:!I?n:k[i].getY()});}for(var j=1;j<p.length;j++){P+=" L"+p[j].x+","+p[j].y;}return G.getBezierPathCorners(P,B,s);};f.prototype._getLineClass=function(){var g=function(){switch(this.getLineType()){case L.Dashed:return"sapSuiteUiCommonsNetworkDashedLine";case L.Dotted:return"sapSuiteUiCommonsNetworkDottedLine";default:return"";}}.bind(this);return"sapSuiteUiCommonsNetworkLinePath "+g();};f.prototype._getArrowFragmentVector=function(p){var o=this.getCoordinates(),b=o.length-1,h=0,g=function(i){return Math.abs(o[i].getX()-o[i+1].getX())+Math.abs(o[i].getY()-o[i+1].getY());};p=p||this.getArrowPosition();if(this.getBends().length===0){h=0;}else if(p===A.Start){while(h<(b-1)&&this._doesLineFragmentCrossCollapsedGroup(h)){h++;}if(g(h)<c){h++;}if(this._doesLineFragmentCrossCollapsedGroup(h)){h=0;}}else if(p===A.End){h=b-1;while(h>0&&this._doesLineFragmentCrossCollapsedGroup(h)){h--;}if(g(h)<c){h--;}}else{var j=[],D=0;for(var i=0;i<b;i++){if(o[i].getX()===o[i+1].getX()){D+=Math.abs(o[i+1].getY()-o[i].getY());}else if(o[i].getY()===o[i+1].getY()){D+=Math.abs(o[i+1].getX()-o[i].getX());}else{D+=G.getPointsDistance({x:o[i].getX(),y:o[i].getY()},{x:o[i+1].getX(),y:o[i+1].getY()});}j.push(D);}D=D/2;for(i=0;i<b&&h===0;i++){if(j[i]>=D&&!this._doesLineFragmentCrossCollapsedGroup(i)){h=i;}}}if(h<0||h>(b-1)){h=0;}return{center:{x:o[h].getX(),y:o[h].getY()},apex:{x:o[h+1].getX(),y:o[h+1].getY()}};};f.prototype._doesLineFragmentCrossCollapsedGroup=function(s){var g=this.getParent(),b=this.getCoordinates()[s],o=this.getCoordinates()[s+1];return g.getGroups().some(function(h){return h.getCollapsed()&&G.doLineRectangleIntersect({p1:{x:Math.min(b.getX(),o.getX())+1,y:Math.min(b.getY(),o.getY())+1},p2:{x:Math.max(b.getX(),o.getX())-1,y:Math.max(b.getY(),o.getY())-1}},{p1:{x:h.getX(),y:h.getY()},p2:{x:h.getX()+h._iWidth,y:h.getY()+h._iHeight}});});};f.prototype._getArrowPoints=function(o,p){var P,b,g,h,i=[];o=o||this.getArrowOrientation();p=p||this.getArrowPosition();var j=function(k){var m=c;if(p===A.Middle){g={x:(b.apex.x-b.center.x)*R+b.center.x,y:(b.apex.y-b.center.y)*R+b.center.y};}else{if(!(this.getToNode()._oGroup&&this.getToNode()._oGroup.getCollapsed())&&this.getToNode().getShape()===S.Circle&&p===A.End){m+=this.getToNode()._getCircleSize()/2;}else if(!(this.getFromNode()._oGroup&&this.getFromNode()._oGroup.getCollapsed())&&this.getFromNode().getShape()===S.Circle&&p===A.Start){m+=this.getFromNode()._getCircleSize()/2;}P=G.getNormalizedVector(b,m);if(p===A.Start){g=b.center;}else if(p===A.End){P=G.getRotatedVector(P,Math.PI);g=b.apex;}g=G.getPointSum(g,P.apex);}h=G.getAngleOfVector(b);if(o===a.ChildOf){h+=Math.PI;}i.push(G.getPointSum(g,G.getRotatedPoint(k,h)));}.bind(this);b=this._getArrowFragmentVector(p);if(this._isBothMiddleArrow()){j(d.Apex);j(d.Second);j(d.Third);j(e.Apex);j(e.Second);j(e.Third);}else{j(Z.Apex);j(Z.Second);j(Z.Third);}return i;};f.prototype._getAccessibilityLabel=function(){return r.getText("NETWORK_GRAPH_ACCESSIBILITY_LINE_LABEL",[this.getFromNode().getTitle(),this.getToNode().getTitle()])+" "+this.getTitle();};f.prototype.getFromNode=function(){this._checkForProcessData();if(!this._oFrom&&this.getParent()){this._oFrom=this.getParent().getNodeByKey(this.getFrom());}return this._oFrom;};f.prototype.getToNode=function(){this._checkForProcessData();if(!this._oTo&&this.getParent()){this._oTo=this.getParent().getNodeByKey(this.getTo());}return this._oTo;};f.prototype.setSource=function(m){var o;if(this.getCoordinates().length===0){o=new C();this.addAggregation("coordinates",o,true);}o=this.getCoordinates()[0];if(m.x||m.x===0){o.setX(m.x);}if(m.y||m.y===0){o.setY(m.y);}};f.prototype.getSource=function(){return this.getCoordinates()[0];};f.prototype.getTarget=function(){return this.getCoordinates().length>0?this.getCoordinates()[this.getCoordinates().length-1]:null;};f.prototype.setTarget=function(m){var o;if(this.getCoordinates().length<2){o=new C();this.addAggregation("coordinates",o,true);}o=this.getCoordinates()[this.getCoordinates().length-1];if(m.x||m.x===0){o.setX(m.x);}if(m.y||m.y===0){o.setY(m.y);}};f.prototype.getBends=function(){return this.getCoordinates().filter(function(o,i){return(i>0)&&(i<(this.getCoordinates().length-1));},this);};f.prototype.clearBends=function(){this.getBends().forEach(function(b){this.removeAggregation("coordinates",b,true);},this);};f.prototype.addBend=function(p){var n=new C();n.setX(p.x);n.setY(p.y);this.insertAggregation("coordinates",n,this.getCoordinates().length-1,true);return n;};f.prototype.isHidden=function(){return this._bIsHidden;};f.prototype.getKey=function(){return this._getLineId();};f.prototype.setHidden=function(v){this.$()[v?"hide":"show"]();};f.prototype._isIgnored=function(){var o=this.getFromNode(),t=this.getToNode(),i=o._oGroup&&o._oGroup.getCollapsed()&&t._oGroup&&t._oGroup.getCollapsed()&&o._oGroup===t._oGroup,n=!o._useInLayout()||!t._useInLayout();return!this._useInLayout||i||this._isLoop()||n;};f.prototype._isLoop=function(){return this.getFromNode().getId()===this.getToNode().getId();};f.prototype._getLineId=function(){return this._sKey?this._sKey:"line_"+this.getFrom()+"-"+this.getTo();};f.prototype._setupEvents=function(){var $=this.$().find(".sapSuiteUiCommonsNetworkLineInvisibleWrapper");$.click(function(o){this._click({ctrlKey:o.ctrlKey,clientX:o.clientX,clientY:o.clientY});}.bind(this));$.mouseover(function(o){this._mouseOver();}.bind(this));$.mouseout(function(o){this._mouseOut();}.bind(this));};f.prototype._mouseOut=function(){this.$().removeClass(this.HIGHLIGHT_CLASS);if(!this.getSelected()){this._setStatusColors("");}};f.prototype._mouseOver=function(){var b=this.fireEvent("hover",{},true);if(!this.getSelected()&&b){this._setStatusColors("Hover");this.$().addClass(this.HIGHLIGHT_CLASS);}};f.prototype._setStatusColors=function(t){var $=this.$().find(".sapSuiteUiCommonsNetworkLineArrow"),b=this._getColor(E.ColorType[t+"Border"]),s=this._getColor(E.ColorType[t+"Background"]);$.css("fill",s);$.css("stroke",b);this.$("path").css("stroke",b);if(this.getParent()&&this.getParent()._isSwimLane()){var g=this.$().find(".sapSuiteUiCommonsNetworkLineNipple");g.css("fill",s);g.css("stroke",b);}};f.prototype._showActionButtons=function(p){var b=function(Y,v,w){var _=g(Y,v,w);if(_){Y._setNodeOpacity(true);P._aShadedNodes.push(Y);}return _;};var g=function(Y,v,w){return G.hasRectangleRectangleIntersection({p1:{x:u,y:s},p2:{x:w,y:v}},Y._getContentRect());};var h=function(o,t){return{p1:{x:o.x,y:o.y},p2:{x:t.x,y:t.y}};};var j=0;var k=function(Y,_){if(j<2){var a1=jQuery('<div></div>',{"class":Y,css:{top:_.top,left:_.left,right:_.right,bottom:_.bottom}});m.append(a1);j++;}};var P=this.getParent(),$=P.$("divlinebuttons"),m=P.$("linetooltip"),n=P.$("linetooltipbuttons");var o=this.getFromNode(),t=this.getToNode();var q=10;P._aShadedNodes=[];var T="<span class=\"sapSuiteUiCommonsNetworkGraphLineTooltipText\">"+o.getTitle()+"</span>";if(this._isBothArrow()){T+="<span class=\"sapSuiteUiCommonsNetworkGraphLineTooltipArrow sapSuiteUiCommonsNetworkGraphLineTooltipDualArrow\"></span>";}T+="<span class=\"sapSuiteUiCommonsNetworkGraphLineTooltipArrow\"></span>"+"</br>"+"<span class=\"sapSuiteUiCommonsNetworkGraphLineTooltipText\">"+t.getTitle()+"</span>";m.html(T);n.html("");this.getActionButtons().forEach(function(Y){this._appendActionButton({icon:Y.getIcon(),enable:Y.getEnabled(),title:Y.getTitle(),id:Y.getId(),click:function(_){Y.firePress({buttonElement:_.target});}},n);}.bind(this));$.show();var s=p.y-m.outerHeight()/2,u=p.x-m.outerWidth()/2,v=s+m.outerHeight(),w=u+m.outerWidth();b(t,v,u+$.width());var x=b(o,s+m.height(),u),y=b(t,v,u+m.outerWidth()+q);if(P._isLayered()){var z={x:u,y:s};var D={x:w,y:s};var H={x:w,y:v};var I={x:u,y:v};var J=this.getCoordinates();for(var i=0;i<J.length-1&&j<2;i++){var K=J[i],M=J[i+1];var Q={x:K.getX(),y:K.getY()};var V={x:M.getX(),y:M.getY()};var W=h(Q,V);var X=G.getSegmentsIntersection(W,h(z,I));if(X&&!x){k("sapSuiteUiCommonsNetworkGraphTooltipLeftArrow",{top:(X.y-s)-q});}X=G.getSegmentsIntersection(W,h(D,H));if(X&&!y){k("sapSuiteUiCommonsNetworkGraphTooltipRightArrow",{top:(X.y-s)-q});}X=G.getSegmentsIntersection(W,h(I,H));if(X){k("sapSuiteUiCommonsNetworkGraphTooltipBottomArrow",{left:X.x-u-q});}X=G.getSegmentsIntersection(W,h(z,D));if(X){k("sapSuiteUiCommonsNetworkGraphTooltipTopArrow",{left:X.x-u-q});}}$.css("top",s);$.css("left",u);}};f.prototype._setActionButtonFocus=function(i,b){var $=this.getParent().$("divlinebuttons");$.removeClass(this.FOCUS_CLASS);$.find("."+this.FOCUS_CLASS).removeClass(this.FOCUS_CLASS);jQuery(i).toggleClass(this.FOCUS_CLASS,b);};f.prototype._click=function(m){var p=this.getParent(),P=p.getCorrectMousePosition({x:m.clientX,y:m.clientY}),o=p._tooltip._getOpener(this,P),b;p._selectLine({element:this,forceFocus:true,preventDeselect:m.ctrlKey});b=this.fireEvent("press",{opener:o,point:P},true);if(this.getSelected()&&b){(this.getActionButtons().length===0)?p._tooltip.openDetail({item:this,opener:o,point:P}):this._showActionButtons(P);}};f.prototype._setFocus=function(b){E.prototype._setFocus.call(this,b);if(b){this._renderFocusWrapper();}};f.prototype._isEndPosition=function(){return((this.getArrowPosition()===A.End&&this.getArrowOrientation()===a.ParentOf)||(this.getArrowPosition()===A.Start&&this.getArrowOrientation()===a.ChildOf));};f.prototype._moveToEnd=function(){return this._isEndPosition()||(this.getArrowPosition()===A.Middle&&this.getArrowOrientation()===a.ParentOf);};f.prototype._hideShow=function(b){if(b){this.$().hide();this._bIsHidden=true;}else if(!this.getToNode()._bIsHidden&&!this.getFromNode()._bIsHidden){this.$().show();this._bIsHidden=false;}};f.prototype._shift=function(p){this.getBends().forEach(function(b){b.setX(b.getX()+p.x);b.setY(b.getY()+p.y);});if(this.getSource()){this.setSource({x:this.getSource().getX()+p.x,y:this.getSource().getY()+p.y});}if(this.getTarget()){this.setTarget({x:this.getTarget().getX()+p.x,y:this.getTarget().getY()+p.y});}if(this._aNipples){this._aNipples.forEach(function(n){n.x+=p.x;n.y+=p.y;});}};f.prototype._normalizePath=function(){var o,t;o=this.getFromNode().getCenterPosition();this.setSource({x:o.x,y:o.y});t=this.getToNode().getCenterPosition();this.setTarget({x:t.x,y:t.y});this.clearBends();};f.prototype._validateLayout=function(){return(!this.getSource()||(isFinite(this.getSource().getX())&&isFinite(this.getSource().getY())))&&(!this.getTarget()||(isFinite(this.getTarget().getX())&&isFinite(this.getTarget().getY())))&&!this.getBends().some(function(b){return!isFinite(b.getX())||!isFinite(b.getY());});};f.prototype.setSelected=function(s){var p=this.getParent(),b=s?"addClass":"removeClass";this._setStatusColors(s?"Selected":"");this.setProperty("selected",s,true);this.$()[b](this.SELECT_CLASS);if(p){if(s){p._mSelectedLines[this._getLineId()]=this;}else{this._setStatusColors("");delete p._mSelectedLines[this._getLineId()];}}return this;};f.prototype.setFrom=function(s){var p=this.getParent();this.setProperty("from",s,true);if(p){p.invalidate();}return this;};f.prototype.setTo=function(t){var p=this.getParent();this.setProperty("to",t,true);if(p){p.invalidate();}return this;};f.prototype._isTopBottom=function(){var p=this.getParent();return p&&p._isTopBottom();};f.prototype.getFocusDomRef=function(){return this.getDomRef("invisibleWrapper");};f.prototype._createSuggestionHelpText=function(){var b=25;var t=this.getTitle()?(this.getTitle()+" "):"";return t+"("+U.trimText(this.getFromNode().getTitle(),b)+" -> "+U.trimText(this.getToNode().getTitle(),b)+")";};f.prototype._isInCollapsedGroup=function(){var o=this.getFromNode(),t=this.getToNode();return(o._oGroup===t._oGroup)&&o._isInCollapsedGroup();};f.prototype._isBothMiddleArrow=function(){return this.getArrowOrientation()===a.Both&&this.getArrowPosition()===A.Middle;};f.prototype._isBothArrow=function(){return this.getArrowOrientation()===a.Both;};f.prototype._isOnScreen=function(b,g,t,h){var j=this.getCoordinates(),i,o;for(i=1;i<j.length;i++){o=E._isRectOnScreen(j[i-1].getX(),j[i].getX(),j[i-1].getY(),j[i].getY(),b,g,t,h);if(o){return true;}}return false;};return f;});