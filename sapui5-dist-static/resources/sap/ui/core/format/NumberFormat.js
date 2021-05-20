/*!
 * OpenUI5
 * (c) Copyright 2009-2021 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/base/Object','sap/ui/core/Locale','sap/ui/core/LocaleData','sap/base/Log','sap/base/assert','sap/base/util/extend'],function(B,L,a,b,c,e){"use strict";var N=B.extend("sap.ui.core.format.NumberFormat",{constructor:function(F){throw new Error();}});var r=/0+(\.0+)?/;var d=/^0+$/;var n={INTEGER:"integer",FLOAT:"float",CURRENCY:"currency",UNIT:"unit",PERCENT:"percent"};var R={FLOOR:"FLOOR",CEILING:"CEILING",TOWARDS_ZERO:"TOWARDS_ZERO",AWAY_FROM_ZERO:"AWAY_FROM_ZERO",HALF_FLOOR:"HALF_FLOOR",HALF_CEILING:"HALF_CEILING",HALF_TOWARDS_ZERO:"HALF_TOWARDS_ZERO",HALF_AWAY_FROM_ZERO:"HALF_AWAY_FROM_ZERO"};var m={};m[R.FLOOR]=Math.floor;m[R.CEILING]=Math.ceil;m[R.TOWARDS_ZERO]=function(i){return i>0?Math.floor(i):Math.ceil(i);};m[R.AWAY_FROM_ZERO]=function(i){return i>0?Math.ceil(i):Math.floor(i);};m[R.HALF_TOWARDS_ZERO]=function(i){return i>0?Math.ceil(i-0.5):Math.floor(i+0.5);};m[R.HALF_AWAY_FROM_ZERO]=function(i){return i>0?Math.floor(i+0.5):Math.ceil(i-0.5);};m[R.HALF_FLOOR]=function(i){return Math.ceil(i-0.5);};m[R.HALF_CEILING]=Math.round;N.RoundingMode=R;N.oDefaultIntegerFormat={minIntegerDigits:1,maxIntegerDigits:99,minFractionDigits:0,maxFractionDigits:0,groupingEnabled:false,groupingSize:3,groupingSeparator:",",decimalSeparator:".",plusSign:"+",minusSign:"-",isInteger:true,type:n.INTEGER,showMeasure:false,style:"standard",showNumber:true,parseAsString:false,preserveDecimals:false,roundingMode:N.RoundingMode.TOWARDS_ZERO,emptyString:NaN,showScale:true};N.oDefaultFloatFormat={minIntegerDigits:1,maxIntegerDigits:99,minFractionDigits:0,maxFractionDigits:99,groupingEnabled:true,groupingSize:3,groupingSeparator:",",decimalSeparator:".",plusSign:"+",minusSign:"-",isInteger:false,type:n.FLOAT,showMeasure:false,style:"standard",showNumber:true,parseAsString:false,preserveDecimals:false,roundingMode:N.RoundingMode.HALF_AWAY_FROM_ZERO,emptyString:NaN,showScale:true};N.oDefaultPercentFormat={minIntegerDigits:1,maxIntegerDigits:99,minFractionDigits:0,maxFractionDigits:99,groupingEnabled:true,groupingSize:3,groupingSeparator:",",decimalSeparator:".",plusSign:"+",minusSign:"-",percentSign:"%",isInteger:false,type:n.PERCENT,showMeasure:false,style:"standard",showNumber:true,parseAsString:false,preserveDecimals:false,roundingMode:N.RoundingMode.HALF_AWAY_FROM_ZERO,emptyString:NaN,showScale:true};N.oDefaultCurrencyFormat={minIntegerDigits:1,maxIntegerDigits:99,groupingEnabled:true,groupingSize:3,groupingSeparator:",",decimalSeparator:".",plusSign:"+",minusSign:"-",isInteger:false,type:n.CURRENCY,showMeasure:true,currencyCode:true,currencyContext:'standard',style:"standard",showNumber:true,customCurrencies:undefined,parseAsString:false,preserveDecimals:false,roundingMode:N.RoundingMode.HALF_AWAY_FROM_ZERO,emptyString:NaN,showScale:true,ignorePrecision:true};N.oDefaultUnitFormat={minIntegerDigits:1,maxIntegerDigits:99,groupingEnabled:true,groupingSize:3,groupingSeparator:",",decimalSeparator:".",plusSign:"+",minusSign:"-",isInteger:false,type:n.UNIT,showMeasure:true,style:"standard",showNumber:true,customUnits:undefined,allowedUnits:undefined,parseAsString:false,preserveDecimals:false,roundingMode:N.RoundingMode.HALF_AWAY_FROM_ZERO,emptyString:NaN,showScale:true};N.getInstance=function(F,i){return this.getFloatInstance(F,i);};N.getFloatInstance=function(F,i){var v=this.createInstance(F,i),w=this.getLocaleFormatOptions(v.oLocaleData,n.FLOAT);v.oFormatOptions=e({},this.oDefaultFloatFormat,w,F);return v;};N.getIntegerInstance=function(F,i){var v=this.createInstance(F,i),w=this.getLocaleFormatOptions(v.oLocaleData,n.INTEGER);v.oFormatOptions=e({},this.oDefaultIntegerFormat,w,F);return v;};N.getCurrencyInstance=function(F,i){var v=this.createInstance(F,i);var C=F&&F.currencyContext;var S=s(F);if(S){C=C||this.oDefaultCurrencyFormat.style;C="sap-"+C;}var w=this.getLocaleFormatOptions(v.oLocaleData,n.CURRENCY,C);v.oFormatOptions=e({},this.oDefaultCurrencyFormat,w,F);v.oFormatOptions.trailingCurrencyCode=S;v._defineCustomCurrencySymbols();return v;};N.getUnitInstance=function(F,i){var v=this.createInstance(F,i),w=this.getLocaleFormatOptions(v.oLocaleData,n.UNIT);v.oFormatOptions=e({},this.oDefaultUnitFormat,w,F);return v;};N.getPercentInstance=function(F,i){var v=this.createInstance(F,i),w=this.getLocaleFormatOptions(v.oLocaleData,n.PERCENT);v.oFormatOptions=e({},this.oDefaultPercentFormat,w,F);return v;};N.createInstance=function(F,i){var v=Object.create(this.prototype),P;if(F instanceof L){i=F;F=undefined;}if(!i){i=sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();}v.oLocale=i;v.oLocaleData=a.getInstance(i);v.oOriginalFormatOptions=F;if(F){if(F.pattern){P=this.parseNumberPattern(F.pattern);Object.keys(P).forEach(function(w){F[w]=P[w];});}if(F.emptyString!==undefined){c(F.emptyString===""||F.emptyString===0||F.emptyString===null||F.emptyString!==F.emptyString,"The format option 'emptyString' must be either 0, null or NaN");}}return v;};N.getDefaultUnitPattern=function(S){return"{0} "+S;};N.getLocaleFormatOptions=function(i,T,C){var v,w;switch(T){case n.PERCENT:w=i.getPercentPattern();break;case n.CURRENCY:w=i.getCurrencyPattern(C);break;case n.UNIT:w=i.getDecimalPattern();break;default:w=i.getDecimalPattern();}v=this.parseNumberPattern(w);v.plusSign=i.getNumberSymbol("plusSign");v.minusSign=i.getNumberSymbol("minusSign");v.decimalSeparator=i.getNumberSymbol("decimal");v.groupingSeparator=i.getNumberSymbol("group");v.percentSign=i.getNumberSymbol("percentSign");v.pattern=w;switch(T){case n.UNIT:case n.FLOAT:case n.PERCENT:v.minFractionDigits=0;v.maxFractionDigits=99;break;case n.INTEGER:v.minFractionDigits=0;v.maxFractionDigits=0;v.groupingEnabled=false;break;case n.CURRENCY:v.minFractionDigits=undefined;v.maxFractionDigits=undefined;break;}return v;};N.parseNumberPattern=function(F){var M=0,v=0,w=0,G=false,x=0,y=0,S=F.indexOf(";"),z={Integer:0,Fraction:1},A=z.Integer;if(S!==-1){F=F.substring(0,S);}for(var i=0;i<F.length;i++){var C=F[i];switch(C){case",":if(G){x=y;y=0;}G=true;break;case".":A=z.Fraction;break;case"0":if(A===z.Integer){M++;if(G){y++;}}else{v++;w++;}break;case"#":if(A===z.Integer){if(G){y++;}}else{w++;}break;}}if(!x){x=y;y=0;}return{minIntegerDigits:M,minFractionDigits:v,maxFractionDigits:w,groupingEnabled:G,groupingSize:x,groupingBaseSize:y};};N.prototype._defineCustomCurrencySymbols=function(){var O=this.oFormatOptions;var C=this.oLocaleData.getCurrencySymbols();var F=function(S,i){var U=[];var v;for(var K in S){v=S[K];if(U.indexOf(v)===-1){U.push(v);}else if(v!==undefined){i[v]=true;b.error("Symbol '"+v+"' is defined multiple times in custom currencies.",undefined,"NumberFormat");}}};if(O.customCurrencies&&typeof O.customCurrencies==="object"){this.mKnownCurrencySymbols={};this.mKnownCurrencyCodes={};Object.keys(O.customCurrencies).forEach(function(K){if(O.customCurrencies[K].symbol){this.mKnownCurrencySymbols[K]=O.customCurrencies[K].symbol;}else{var i=O.customCurrencies[K].isoCode;if(i){this.mKnownCurrencySymbols[K]=C[i];}}this.mKnownCurrencyCodes[K]=K;}.bind(this));}else{this.mKnownCurrencySymbols=C;this.mKnownCurrencyCodes=this.oLocaleData.getCustomCurrencyCodes();}this.mDuplicatedSymbols={};F(this.mKnownCurrencySymbols,this.mDuplicatedSymbols);};N.prototype.format=function(v,M){if(Array.isArray(v)){M=v[1];v=v[0];}var i="",F="",G="",w="",x="",P="",y=0,z=0,A=0,C=0,D=v<0,E=-1,O=Object.assign({},this.oFormatOptions),H=this.oOriginalFormatOptions,I=O.type===n.CURRENCY&&M==="INR"&&this.oLocale.getLanguage()==="en"&&this.oLocale.getRegion()==="IN",J,S,K,Q,U,T;if(v===O.emptyString||(isNaN(v)&&isNaN(O.emptyString))){return"";}if(M&&O.customCurrencies&&!O.customCurrencies[M]){b.error("Currency '"+M+"' is unknown.");return"";}if(!O.showNumber&&!O.showMeasure){return"";}if(O.type===n.UNIT){if(O.customUnits&&typeof O.customUnits==="object"){U=O.customUnits[M];}else{T=this.oLocaleData.getUnitFromMapping(M)||M;U=this.oLocaleData.getUnitFormat(T);}if(O.showMeasure){var V=!O.allowedUnits||O.allowedUnits.indexOf(M)>=0;if(!V){return"";}if(!U&&!O.unitOptional){return"";}}O.decimals=(U&&(typeof U.decimals==="number"&&U.decimals>=0))?U.decimals:O.decimals;O.precision=(U&&(typeof U.precision==="number"&&U.precision>=0))?U.precision:O.precision;}if(O.type==n.CURRENCY){if(!O.showNumber){if(!O.currencyCode){var W;if(O.customCurrencies&&typeof O.customCurrencies==="object"){W=this.mKnownCurrencySymbols[M];}else{W=this.oLocaleData.getCurrencySymbol(M);}if(W&&W!==M){M=W;}}return M;}if(O.customCurrencies&&O.customCurrencies[M]){O.decimals=O.customCurrencies[M].decimals!==undefined?O.customCurrencies[M].decimals:O.decimals;}}if(O.decimals!==undefined){O.minFractionDigits=O.decimals;O.maxFractionDigits=O.decimals;}if(O.shortLimit===undefined||Math.abs(v)>=O.shortLimit){K=O.shortRefNumber===undefined?v:O.shortRefNumber;S=g(K,O,this.oLocaleData,I);if(S&&S.formatString!="0"){v=v/S.magnitude;if(O.shortDecimals!==undefined){O.minFractionDigits=O.shortDecimals;O.maxFractionDigits=O.shortDecimals;}else{if(H.minFractionDigits===undefined&&H.maxFractionDigits===undefined&&H.decimals===undefined&&H.precision===undefined&&H.pattern===undefined){O.precision=2;O.minFractionDigits=0;O.maxFractionDigits=99;}if(H.maxFractionDigits===undefined&&H.decimals===undefined){O.maxFractionDigits=99;}}O.roundingMode=N.RoundingMode.HALF_AWAY_FROM_ZERO;}}if((S||!O.ignorePrecision)&&O.precision!==undefined){O.maxFractionDigits=Math.min(O.maxFractionDigits,o(v,O.precision));O.minFractionDigits=Math.min(O.minFractionDigits,O.maxFractionDigits);}if(O.type==n.PERCENT){v=N._shiftDecimalPoint(v,2);}if(O.type==n.CURRENCY){var X=this.oLocaleData.getCurrencyDigits(M);if(O.customCurrencies&&O.customCurrencies[M]&&O.customCurrencies[M].decimals!==undefined){X=O.customCurrencies[M].decimals;}if(O.maxFractionDigits===undefined){O.maxFractionDigits=X;}if(O.minFractionDigits===undefined){O.minFractionDigits=X;}}if(typeof v==="number"&&!O.preserveDecimals){v=l(v,O.maxFractionDigits,O.roundingMode);}if(v==0){D=false;}x=this.convertToDecimal(v);if(x=="NaN"){return x;}if(D){x=x.substr(1);}E=x.indexOf(".");if(E>-1){i=x.substr(0,E);F=x.substr(E+1);}else{i=x;}if(i.length<O.minIntegerDigits){i=i.padStart(O.minIntegerDigits,"0");}else if(i.length>O.maxIntegerDigits){i="".padStart(O.maxIntegerDigits,"?");}if(F.length<O.minFractionDigits){F=F.padEnd(O.minFractionDigits,"0");}else if(F.length>O.maxFractionDigits&&!O.preserveDecimals){F=F.substr(0,O.maxFractionDigits);}if(O.type===n.UNIT&&!O.showNumber){if(U){Q=this.oLocaleData.getPluralCategory(i+"."+F);P=U["unitPattern-count-"+Q];if(!P){P=U["unitPattern-count-other"];}if(!P){return"";}if(Q!=="other"&&P.indexOf("{0}")===-1){P=U["unitPattern-count-other"];if(!P){return"";}}if(P.indexOf("{0}")===-1){b.warning("Cannot separate the number from the unit because unitPattern-count-other '"+P+"' does not include the number placeholder '{0}' for unit '"+M+"'");}else{return P.replace("{0}","").trim();}}return"";}z=i.length;if(O.groupingEnabled){if(I){var Y=[3,2,2],Z,$=0;y=i.length;while(y>0){Z=Y[$%3];y-=Z;if($>0){G=O.groupingSeparator+G;}if(y<0){Z+=y;y=0;}G=i.substr(y,Z)+G;$++;}}else{A=O.groupingSize;C=O.groupingBaseSize||A;y=Math.max(z-C,0)%A||A;G=i.substr(0,y);while(z-y>=C){G+=O.groupingSeparator;G+=i.substr(y,A);y+=A;}G+=i.substr(y);}}else{G=i;}if(D){w=O.minusSign;}w+=G;if(F){w+=O.decimalSeparator+F;}if(S&&S.formatString&&O.showScale&&O.type!==n.CURRENCY){Q=this.oLocaleData.getPluralCategory(i+"."+F);S.formatString=this.oLocaleData.getDecimalFormat(O.style,S.key,Q);w=S.formatString.replace(S.valueSubString,w);w=w.replace(/'.'/g,".");}if(O.type===n.CURRENCY){P=O.pattern;if(S&&S.formatString&&O.showScale){var _;if(O.trailingCurrencyCode){_="sap-short";}else{_="short";}Q=this.oLocaleData.getPluralCategory(i+"."+F);if(I){P=h(_,S.key,Q);}else{P=this.oLocaleData.getCurrencyFormat(_,S.key,Q);}P=P.replace(/'.'/g,".");}J=P.split(";");if(J.length===2){P=D?J[1]:J[0];if(D){w=w.substring(O.minusSign.length);}}if(!O.currencyCode){var W;if(O.customCurrencies&&typeof O.customCurrencies==="object"){W=this.mKnownCurrencySymbols[M];}else{W=this.oLocaleData.getCurrencySymbol(M);}if(W&&W!==M){M=W;}}w=this._composeCurrencyResult(P,w,M,{showMeasure:O.showMeasure,negative:D,minusSign:O.minusSign});}if(O.type===n.PERCENT){P=O.pattern;w=P.replace(/[0#.,]+/,w);w=w.replace(/%/,O.percentSign);}if(O.showMeasure&&O.type===n.UNIT){Q=this.oLocaleData.getPluralCategory(i+"."+F);if(U){P=U["unitPattern-count-"+Q];if(!P){P=U["unitPattern-count-other"];}if(!P){return"";}w=P.replace("{0}",w);}}if(sap.ui.getCore().getConfiguration().getOriginInfo()){w=new String(w);w.originInfo={source:"Common Locale Data Repository",locale:this.oLocale.toString()};}return w;};N.prototype._composeCurrencyResult=function(P,F,M,O){var i=O.minusSign;P=P.replace(/[0#.,]+/,F);if(O.showMeasure&&M){var v="\u00a4",w={"[:digit:]":/\d/,"[:^S:]":/[^\$\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BD\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6]/},x=P.indexOf(v),y=x<P.length/2?"after":"before",S=this.oLocaleData.getCurrencySpacing(y),C=(y==="after"?M.charAt(M.length-1):M.charAt(0)),z,A=w[S.currencyMatch],D=w[S.surroundingMatch],I;P=P.replace(v,M);z=(y==="after"?P.charAt(x+M.length):P.charAt(x-1));if(A&&A.test(C)&&D&&D.test(z)){if(y==="after"){I=x+M.length;}else{I=x;}P=P.slice(0,I)+S.insertBetween+P.slice(I);}else if(O.negative&&y==="after"){i="\ufeff"+O.minusSign;}}else{P=P.replace(/\s*\u00a4\s*/,"");}if(O.negative){P=P.replace(/-/,i);}return P;};N.prototype.parse=function(v){var O=this.oFormatOptions,P=O.plusSign+this.oLocaleData.getLenientNumberSymbols("plusSign"),M=O.minusSign+this.oLocaleData.getLenientNumberSymbols("minusSign"),w=q(P+M),G=q(O.groupingSeparator),D=q(O.decimalSeparator),x="^\\s*(["+w+"]?(?:[0-9"+G+"]+|[0-9"+G+"]*"+D+"[0-9]*)(?:[eE][+-][0-9]+)?)\\s*$",y="^\\s*(["+w+"]?[0-9"+G+"]+)\\s*$",z=new RegExp(G,"g"),A=new RegExp(D,"g"),C=this.oLocaleData.getNumberSymbol("percentSign"),I=O.type===n.CURRENCY&&this.oLocale.getLanguage()==="en"&&this.oLocale.getRegion()==="IN",E,F,H,J,K=0,S,Q;if(v===""){Q=O.emptyString;if(O.parseAsString&&(O.emptyString===0||isNaN(O.emptyString))){Q=O.emptyString+"";}if(O.type===n.CURRENCY||O.type===n.UNIT){return[Q,undefined];}else{return Q;}}if(O.groupingSeparator===O.decimalSeparator){b.error("The grouping and decimal separator both have the same value '"+O.groupingSeparator+"'. "+"They must be different from each other such that values can be parsed correctly.");}J=O.type===n.PERCENT?O.pattern:this.oLocaleData.getPercentPattern();if(J.charAt(0)==="%"){x=x.slice(0,1)+"%?"+x.slice(1);}else if(J.charAt(J.length-1)==="%"){x=x.slice(0,x.length-1)+"%?"+x.slice(x.length-1);}var U;if(O.type===n.UNIT){var T;if(O.customUnits&&typeof O.customUnits==="object"){T=O.customUnits;}else{T=this.oLocaleData.getUnitFormats();}c(T,"Unit patterns cannot be loaded");if(O.allowedUnits){var V={};for(var i=0;i<O.allowedUnits.length;i++){var W=O.allowedUnits[i];V[W]=T[W];}T=V;}var X=p(T,v,O.showNumber);var Y=false;U=X.cldrCode;if(U.length===1){H=U[0];if(!O.showNumber){return[undefined,H];}}else if(U.length===0){if((O.unitOptional||!O.showMeasure)&&typeof v==="string"){X.numberValue=v;}else{return null;}}else{c(U.length===1,"Ambiguous unit ["+U.join(", ")+"] for input: '"+(v)+"'");H=undefined;Y=true;}if(O.strictParsing){if((H&&!O.showMeasure)||Y){return null;}}v=X.numberValue||v;}var Z;if(O.type===n.CURRENCY){Z=u({value:v,currencySymbols:this.mKnownCurrencySymbols,customCurrencyCodes:this.mKnownCurrencyCodes,duplicatedSymbols:this.mDuplicatedSymbols,customCurrenciesAvailable:!!O.customCurrencies});if(!Z){return null;}if(O.strictParsing){if((O.showMeasure&&!Z.currencyCode)||Z.duplicatedSymbolFound){return null;}}v=Z.numberValue;H=Z.currencyCode;if((O.customCurrencies&&H===null)||(!O.showMeasure&&H)){return null;}if(!O.showNumber){return[undefined,H];}}if(typeof v==="string"||v instanceof String){v=v.replace(/[\u202a\u200e\u202c\u202b\u200f]/g,"");v=v.replace(/\s/g,"");}S=f(v,this.oLocaleData,I);if(S){v=S.number;}var $=j(v);if(O.isInteger&&!S&&!$){E=new RegExp(y);}else{E=new RegExp(x);}if(!E.test(v)){return O.type===n.CURRENCY||O.type===n.UNIT?null:NaN;}v=v.replace(z,"");var _=v.length;for(var a1=0;a1<_;a1++){var b1=v[a1];if(P.includes(b1)){v=v.replace(b1,"+");break;}else if(M.includes(b1)){v=v.replace(b1,"-");break;}}v=v.replace(/^\+/,"");if(S){v=v.replace(A,".");v=N._shiftDecimalPoint(v,Math.round(Math.log(S.factor)/Math.LN10));}if(O.isInteger){var c1;if($){v=v.replace(A,".");c1=k(v);if(c1===undefined){return NaN;}}else{c1=parseInt(v);}K=O.parseAsString?v:c1;}else{v=v.replace(A,".");if(v.indexOf(C)!==-1){F=true;v=v.replace(C,"");}K=O.parseAsString?v:parseFloat(v);if(F){K=N._shiftDecimalPoint(K,-2);}}if(O.parseAsString){K=N._shiftDecimalPoint(v,0);}if(O.type===n.CURRENCY||O.type===n.UNIT){return[K,H];}return K;};N.prototype.convertToDecimal=function(v){var V=""+v,w,x,D,F,E,P;if(V.indexOf("e")==-1&&V.indexOf("E")==-1){return V;}var y=V.match(/^([+-]?)((\d+)(?:\.(\d+))?)[eE]([+-]?\d+)$/);w=y[1]=="-";x=y[2].replace(/\./g,"");D=y[3]?y[3].length:0;F=y[4]?y[4].length:0;E=parseInt(y[5]);if(E>0){if(E<F){P=D+E;V=x.substr(0,P)+"."+x.substr(P);}else{V=x;E-=F;for(var i=0;i<E;i++){V+="0";}}}else{if(-E<D){P=D+E;V=x.substr(0,P)+"."+x.substr(P);}else{V=x;E+=D;for(var i=0;i>E;i--){V="0"+V;}V="0."+V;}}if(w){V="-"+V;}return V;};N.prototype.getScale=function(){if((this.oFormatOptions.style!=="short"&&this.oFormatOptions.style!=="long")||this.oFormatOptions.shortRefNumber===undefined){return;}var S=g(this.oFormatOptions.shortRefNumber,this.oFormatOptions,this.oLocaleData),i;if(S&&S.formatString){i=S.formatString.replace(r,"").replace(/'.'/g,".").trim();if(i){return i;}}};N._shiftDecimalPoint=function(v,S){if(typeof S!=="number"){return NaN;}var M="";var E=v.toString().toLowerCase().split("e");if(typeof v==="number"){S=E[1]?(+E[1]+S):S;return+(E[0]+"e"+S);}else if(typeof v==="string"){if(parseFloat(v)===0&&S>=0){return d.test(v)?"0":v;}var F=E[0].charAt(0);M=F==="-"?F:"";if(M){E[0]=E[0].slice(1);}v=E[0];var D=v.indexOf("."),A,i,w;if(D===-1){v=v+".";D=v.length-1;}if(E[1]){D+=(+E[1]);}A=D+S;if(A<=0){v=v.padStart(v.length-A+1,'0');A=1;}else if(A>=v.length-1){v=v.padEnd(A+1,'0');A=v.length-1;}v=v.replace(".","");i=v.substring(0,A);w=v.substring(A);i=i.replace(/^(-?)0+(\d)/,"$1$2");return M+i+(w?("."+w):"");}else{return null;}};function g(v,O,w,I){var S,K,x,C,y=O.style,P=O.precision!==undefined?O.precision:2;if(y!="short"&&y!="long"){return undefined;}for(var i=0;i<15;i++){K=Math.pow(10,i);if(l(Math.abs(v)/K,P-1)<10){break;}}x=K.toString();if(O.type===n.CURRENCY){if(O.trailingCurrencyCode){y="sap-short";}if(I){C=h(y,x,"other",true);}else{C=w.getCurrencyFormat(y,x,"other");}}else{C=w.getDecimalFormat(y,x,"other");}if(!C||C=="0"){return undefined;}else{S={};S.key=x;S.formatString=C;var z=C.match(r);if(z){S.valueSubString=z[0];var A=S.valueSubString.indexOf(".");if(A==-1){S.decimals=0;S.magnitude=K*Math.pow(10,1-S.valueSubString.length);}else{S.decimals=S.valueSubString.length-A-1;S.magnitude=K*Math.pow(10,1-A);}}else{return undefined;}}return S;}function f(v,w,I){var x,F=1,K=10,P=w.getPluralCategories(),C,y={number:undefined,factor:F},G=function(A,K,S,D){if(D){C=h(S,K.toString(),A,true);}else{C=w.getDecimalFormat(S,K.toString(),A);}if(C){C=C.replace(/[\s\u00a0\u200F]/g,"");C=C.replace(/'.'/g,".");var E=C.match(r);if(E){var V=E[0];var U=C.replace(V,"");if(!U){return;}var H=v.indexOf(U);if(H>=0){x=v.replace(U,"");x=x.replace(/\u200F/g,"");F=K;F*=Math.pow(10,1-V.length);if(y.number===undefined||x.length<y.number.length){y.number=x;y.factor=F;}}}}};["long","short"].forEach(function(S){K=10;while(K<1e15){for(var i=0;i<P.length;i++){var z=P[i];G(z,K,S);}K=K*10;}});if(I&&!x){K=10;while(K<1e15){for(var i=0;i<P.length;i++){var z=P[i];G(z,K,"short",true);}K=K*10;}}if(!x){return;}return y;}function s(F){var S=sap.ui.getCore().getConfiguration().getFormatSettings().getTrailingCurrencyCode();if(F){if(F.trailingCurrencyCode!==undefined){S=F.trailingCurrencyCode;}if(F.pattern){S=false;}if(F.currencyCode===false){S=false;}}return S;}function h(S,K,P,D){var F,C={"short":{"1000-one":"\xa40000","1000-other":"\xa40000","10000-one":"\xa400000","10000-other":"\xa400000","100000-one":"\xa40 Lk","100000-other":"\xa40 Lk","1000000-one":"\xa400 Lk","1000000-other":"\xa400 Lk","10000000-one":"\xa40 Cr","10000000-other":"\xa40 Cr","100000000-one":"\xa400 Cr","100000000-other":"\xa400 Cr","1000000000-one":"\xa4000 Cr","1000000000-other":"\xa4000 Cr","10000000000-one":"\xa40000 Cr","10000000000-other":"\xa40000 Cr","100000000000-one":"\xa400000 Cr","100000000000-other":"\xa400000 Cr","1000000000000-one":"\xa40 Lk Cr","1000000000000-other":"\xa40 Lk Cr","10000000000000-one":"\xa400 Lk Cr","10000000000000-other":"\xa400 Lk Cr","100000000000000-one":"\xa40 Cr Cr","100000000000000-other":"\xa40 Cr Cr"},"sap-short":{"1000-one":"0000\xa0\xa4","1000-other":"0000\xa0\xa4","10000-one":"00000\xa0\xa4","10000-other":"00000\xa0\xa4","100000-one":"0 Lk\xa0\xa4","100000-other":"0 Lk\xa0\xa4","1000000-one":"00 Lk\xa0\xa4","1000000-other":"00 Lk\xa0\xa4","10000000-one":"0 Cr\xa0\xa4","10000000-other":"0 Cr\xa0\xa4","100000000-one":"00 Cr\xa0\xa4","100000000-other":"00 Cr\xa0\xa4","1000000000-one":"000 Cr\xa0\xa4","1000000000-other":"000 Cr\xa0\xa4","10000000000-one":"0000 Cr\xa0\xa4","10000000000-other":"0000 Cr\xa0\xa4","100000000000-one":"00000 Cr\xa0\xa4","100000000000-other":"00000 Cr\xa0\xa4","1000000000000-one":"0 Lk Cr\xa0\xa4","1000000000000-other":"0 Lk Cr\xa0\xa4","10000000000000-one":"00 Lk Cr\xa0\xa4","10000000000000-other":"00 Lk Cr\xa0\xa4","100000000000000-one":"0 Cr Cr\xa0\xa4","100000000000000-other":"0 Cr Cr\xa0\xa4"}},i={"short":{"1000-one":"0000","1000-other":"0000","10000-one":"00000","10000-other":"00000","100000-one":"0 Lk","100000-other":"0 Lk","1000000-one":"00 Lk","1000000-other":"00 Lk","10000000-one":"0 Cr","10000000-other":"0 Cr","100000000-one":"00 Cr","100000000-other":"00 Cr","1000000000-one":"000 Cr","1000000000-other":"000 Cr","10000000000-one":"0000 Cr","10000000000-other":"0000 Cr","100000000000-one":"00000 Cr","100000000000-other":"00000 Cr","1000000000000-one":"0 Lk Cr","1000000000000-other":"0 Lk Cr","10000000000000-one":"00 Lk Cr","10000000000000-other":"00 Lk Cr","100000000000000-one":"0 Cr Cr","100000000000000-other":"0 Cr Cr"}};i["sap-short"]=i["short"];var T=D?i:C;var v=T[S];if(!v){v=T["short"];}if(P!=="one"){P="other";}F=v[K+"-"+P];return F;}function j(v){return v.indexOf("e")>0||v.indexOf("E")>0;}function k(v){var i=N._shiftDecimalPoint(v,0);if(i.indexOf(".")>0&&!d.test(i.split(".")[1])){return undefined;}var F=parseFloat(i);var w=""+F;if(j(w)){w=N._shiftDecimalPoint(w,0);}var I=parseInt(w);if(I!==F){return undefined;}return I;}function l(v,M,i){if(typeof v!=="number"){return NaN;}i=i||N.RoundingMode.HALF_AWAY_FROM_ZERO;M=parseInt(M);if(typeof i==="function"){v=i(v,M);}else{if(i.match(/^[a-z_]+$/)){i=i.toUpperCase();}if(!M){return m[i](v);}v=N._shiftDecimalPoint(m[i](N._shiftDecimalPoint(v,M)),-M);}return v;}function q(i){return i.replace(/([.?*+^$[\]\\(){}|-])/g,"\\$1");}function o(v,P){var i=Math.floor(Math.log(Math.abs(v))/Math.LN10);return Math.max(0,P-i-1);}function p(U,v,S){var i={numberValue:undefined,cldrCode:[]};if(typeof v!=="string"){return i;}var w=Number.POSITIVE_INFINITY;var x,K;for(x in U){for(K in U[x]){if(K.indexOf("unitPattern")===0){var y=U[x][K];var z=y.indexOf("{0}");var C=z>-1;if(C&&!S){y=y.replace("{0}","").trim();C=false;}if(C){var P=y.substring(0,z);var A=y.substring(z+"{0}".length);var M=v.startsWith(P)&&v.endsWith(A);var D=M&&v.substring(P.length,v.length-A.length);if(D){if(D.length<w){w=D.length;i.numberValue=D;i.cldrCode=[x];}else if(D.length===w&&i.cldrCode.indexOf(x)===-1){i.cldrCode.push(x);}}}else if(y===v){if(S){i.cldrCode=[x];var E;if(K.endsWith("-zero")){E="0";}else if(K.endsWith("-one")){E="1";}else if(K.endsWith("-two")){E="2";}i.numberValue=E;return i;}else if(i.cldrCode.indexOf(x)===-1){i.cldrCode.push(x);}}}}}return i;}function t(v,C){var S="",i,w;for(var x in C){w=C[x];if(v.indexOf(w)>=0&&S.length<w.length){S=w;i=x;}}return{symbol:S,code:i};}function u(C){var v=C.value;var M=t(v,C.currencySymbols);if(!M.code){M=t(v,C.customCurrencyCodes);if(!M.code&&!C.customCurrenciesAvailable){var i=v.match(/(^[A-Z]{3}|[A-Z]{3}$)/);M.code=i&&i[0];}}if(M.code){var w=M.code.length-1;var x=M.code.charAt(w);var D;var y=/[\-\s]+/;if(/\d$/.test(x)){if(v.startsWith(M.code)){D=w+1;if(!y.test(v.charAt(D))){return undefined;}}}else if(/^\d/.test(M.code)){if(v.endsWith(M.code)){D=v.indexOf(M.code)-1;if(!y.test(v.charAt(D))){return undefined;}}}v=v.replace(M.symbol||M.code,"");}var z=false;if(C.duplicatedSymbols&&C.duplicatedSymbols[M.symbol]){M.code=undefined;z=true;b.error("The parsed currency symbol '"+M.symbol+"' is defined multiple "+"times in custom currencies.Therefore the result is not distinct.");}return{numberValue:v,currencyCode:M.code||undefined,duplicatedSymbolFound:z};}return N;});