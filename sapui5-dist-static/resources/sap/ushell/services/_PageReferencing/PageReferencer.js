// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ushell/utils/clone"],function(q,c){"use strict";var P={};function g(p,N){var r={};p.forEach(function(s){s.viz.forEach(function(t){var T=t.target;if(T&&!r[T]){r[T]=N.resolveHashFragment(T);}});});return new Promise(function(R,f){var b=[];Object.keys(r).forEach(function(h){b.push(r[h]);});q.when.apply(null,b).then(function(){var d=arguments;Object.keys(r).forEach(function(h,i){r[h]=d[i].inboundPermanentKey;});R(r);},f);});}function _(p,t){return{inboundPermanentKey:p[t.target],vizId:t.tileCatalogId};}function a(p,s){return{id:s.id,title:s.title,visualizations:s.viz.map(_.bind(null,p))};}P.createReferencePage=function(p,b){b=b||[];return sap.ushell.Container.getServiceAsync("NavTargetResolution").then(g.bind(null,b)).then(function(o){var r=c(p);r.sections=b.map(a.bind(null,o));return Promise.resolve(r);});};return P;});