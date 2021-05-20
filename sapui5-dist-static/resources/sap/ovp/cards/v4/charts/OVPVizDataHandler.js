sap.ui.define(["sap/ui/core/Control","sap/ui/model/json/JSONModel","sap/ovp/cards/v4/charts/Utils","sap/ovp/app/resources","sap/base/util/each","sap/base/util/merge"],function(C,J,U,O,e,m){"use strict";return C.extend("sap.ovp.cards.v4.charts.OVPVizDataHandler",{metadata:{aggregations:{data:{type:"sap.ui.core.Element"},aggregateData:{type:"sap.ui.core.Element"},content:{multiple:false}},properties:{chartType:{defaultValue:false},dependentDataReceived:{defaultValue:false},scale:{defaultValue:""},entitySet:{}}},renderer:function(r,c){r.write("<div");r.writeElementData(c);r.write(">");if(c.getContent()){r.renderControl(c.getContent());}r.write("</div>");},mergeDatasets:function(b,d,c){var t=this;var a=this.getModel();var p=b.mParameters;var D=m([],this.dataSet);if(p){var s=p["$apply"];}var f=b.getPath().substring(1);var g=-1;if(f){g=f.indexOf('Parameters');}if(g>=0){f=f.substr(0,f.indexOf('Parameters'));}var h=a.getMetaModel();var n=this.getEntitySet();var o=h.getData("/")["$Annotations"];var q=[];var r=[];for(var u in o){if(u.includes(n+"/")){if(o[u]["@com.sap.vocabularies.Analytics.v1.Measure"]){if(s&&s.includes(u.split("/")[1])){q.push(u.split("/")[1]);}}else{if(s&&s.includes(u.split("/")[1])){r.push(u.split("/")[1]);}}}}if(D){for(var i=0;i<D.length-2;i++){for(var j=0;j<q.length;j++){D[0]["measure"]=Number(D[0]["measure"])+Number(D[i+1]["measure"]);}}D.__count=D.length;var v=D.__count-D.length;var w={};w.results=[];w.results[0]=D[0];var x;if(D.__count>D.length){var y=m({},this.aggregateSet);if(y&&y.results&&D.results.length<D.__count){e(q,function(i){y.results[0][q[i]]=String(Number(t.aggregateSet.results[0][q[i]])-Number(w.results[0][q[i]]));});e(r,function(i){y.results[0][r[i]]=O.getText("OTHERS_DONUT",[v+1]);});y.results[0].$isOthers=true;x=y.results[0];if(x){d.results.splice(-1,1);}}}if(x){d.results.push(x);}var z=c.getModel('ovpCardProperties');var E=z&&z.getProperty("/bEnableStableColors");var A=z&&z.getProperty("/colorPalette");var B=o[n]["@"+(z&&z.getProperty("/chartAnnotationPath"))];if(B.DimensionAttributes.length===1&&E&&c.getVizType()==="donut"&&A&&(A instanceof Object)&&Object.keys(A).length<=10){var F=B.DimensionAttributes[0].Dimension.PropertyPath;if(A instanceof Array){var G=A.map(function(X){return X.color;});var H=G.slice();}else{var I=JSON.parse(JSON.stringify(A));}var V=c.getVizProperties();if(!V){var K={plotArea:{dataPointStyle:{rules:[]}}};V=K;}if(c&&V&&V.plotArea){if(!V.plotArea.dataPointStyle){V.plotArea.dataPointStyle={rules:[]};}else{V.plotArea.dataPointStyle.rules=[];}var L=h.getODataProperty(o,F);if(L){var M=L["com.sap.vocabularies.Common.v1.Label"]?L["com.sap.vocabularies.Common.v1.Label"].String:F;var N;if(L["com.sap.vocabularies.Common.v1.Text"]){N=L["com.sap.vocabularies.Common.v1.Text"]["Path"];}else if(L["sap:text"]){N=L["sap:text"];}else{N=L;}var P=function(i,k,Q,u){return{callback:function(X){if(X&&(X[M]===Q.dimensionValue)||(Q.hasOwnProperty(X[M]))){return true;}},properties:{color:(G&&G[i])||(Q&&Q[u])},"displayName":d.results[k][N]};};if(A instanceof Array){e(A,function(i,Q){for(var k=0;k<d.results.length;k++){if(d.results[k][F]===Q.dimensionValue){var R=P(i,k,Q);V.plotArea.dataPointStyle['rules'].push(R);H.splice(i,1);}}});}else{for(var k=0;k<d.results.length;k++){if(A.hasOwnProperty(d.results[k][F])){var u=d.results[k][F];var Q={};Q[u]=A[u];var R=P(i,k,Q,u);V.plotArea.dataPointStyle['rules'].push(R);delete I[u];}}}if(y){V.plotArea.dataPointStyle['rules'].push({callback:function(X){if(X&&(X[M].lastIndexOf('Others')!=-1)){return true;}},properties:{color:H&&H.length?G[G.length-1]:Object.keys(I).length&&I[Object.keys(I)[0]]},"displayName":y.results[0][F]});}}}c.setVizProperties(V);}}var S=new J();var T=[];for(var i=0;i<d.results.length;i++){var W={};for(var k=0;k<r.length;k++){W[r[k]]=d.results[i][r[k]];}for(var l=0;l<q.length;l++){W[q[l]]=d.results[i][q[l]+"Aggregate"];}T.push(W);}S.setData(T);c.setModel(S,"analyticalmodel");},updateBindingContext:function(){var b=this.getBinding("data");var a=this.getBinding("aggregateData");var t=this;if(this.chartBinding==b){return;}else{this.chartBinding=b;if(b){var t=this;b.attachEvent("dataReceived",function(E){t.dataSet=E&&E.getSource().getCurrentContexts().map(function(i){return i.getObject();});t.oDataClone={results:m([],t.dataSet)};if(t.getChartType()=="donut"&&t.getBinding("aggregateData")!==undefined){if(t.getDependentDataReceived()===true||t.getDependentDataReceived()==="true"){t.mergeDatasets(b,t.oDataClone,t.getContent());t.setDependentDataReceived(false);}else{t.setDependentDataReceived(true);}}else{var M=new J();if(t.dataSet){var c=t.getEntitySet().split(".")[t.getEntitySet().split(".").length-1];var o=b.getModel();var d=U.cacheODataMetadata(o);var T=[];var f={};var g=d[c];if(g){var h=Object.keys(g);}if(h&&h.length){e(h,function(i,p){if(g[p].$Type==="Edm.String"){var s=t.getModel().getMetaModel().getObject("/"+t.getEntitySet()+"/"+p+"@");if(s["@com.sap.vocabularies.Common.v1.IsCalendarYearMonth"]){T.push(p);f[p]={"sap:semantics":"yearmonth"};}else if(s["@com.sap.vocabularies.Common.v1.IsCalendarYearQuarter"]){T.push(p);f[p]={"sap:semantics":"yearquarter"};}else if(s["@com.sap.vocabularies.Common.v1.IsCalendarYearWeek"]){T.push(p);f[p]={"sap:semantics":"yearweek"};}}});}if(T&&T.length){if(t.dataSet&&t.dataSet.length){e(t.dataSet,function(i,r){e(T,function(i,p){if(r.hasOwnProperty(p)){var j=r[p];var y,k,q,l,n,w,s;switch(f[p]["sap:semantics"]){case'yearmonth':y=parseInt(j.substr(0,4),10);k=j.substr(4);n=parseInt(k,10)-1;r[p]=new Date(Date.UTC(y,n));break;case'yearquarter':y=parseInt(j.substr(0,4),10);q=j.substr(4);l=(parseInt(q,10)*3)-2;n=l-1;r[p]=new Date(Date.UTC(y,n));break;case'yearweek':y=parseInt(j.substr(0,4),10);w=j.substr(4);var s=(1+(parseInt(w,10)-1)*7);r[p]=new Date(Date.UTC(y,0,s));break;default:break;}}});});}}M.setData(t.dataSet);t.oDataClone={results:m([],t.dataSet)};}t.getContent().setModel(M,"analyticalmodel");t.mergeDatasets(b,t.oDataClone,t.getContent());}});}C.prototype.updateBindingContext.apply(this,arguments);}if(this.chartAggrBinding==a){return;}else{this.chartAggrBinding=a;if(a){var t=this;a.attachEvent("dataReceived",function(E){t.aggregateSet=E&&E.getParameter("data");if(t.getChartType()=="donut"){if(t.getDependentDataReceived()===true||t.getDependentDataReceived()==="true"){t.oDataClone=m({},t.dataSet);t.mergeDatasets(b,t.oDataClone,t.getContent());t.setDependentDataReceived(false);}else{t.setDependentDataReceived(true);}}else{var M=new J();M.setData(t.aggregateSet.results);t.getContent().setModel(M,"analyticalmodel");}});}C.prototype.updateBindingContext.apply(this,arguments);}}});});